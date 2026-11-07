import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MarketApi, Me, Session } from './api';
import { deviceNotifier, secureTokenStore, type Notifier, type TokenStore } from './device';

// 로그인 상태·알림을 앱 전체에서 공유한다(APP-024/025).
// - 로그인 유지: 토큰을 기기 키체인(expo-secure-store)에 보관하고, 앱을 켜면 /me 로 확인해 복원한다.
// - 정가 이하 알림: 로그인·알림 켬 상태에서 앱이 앞에 있을 때 20초마다, 그리고 앱으로 돌아올 때 새 알림을 확인해
//   기기 알림을 띄운다(앱을 연 뒤 생긴 알림만). 알림을 누르면 해당 매물로 이동.
//   앱이 완전히 꺼진 상태의 원격 푸시는 Apple 푸시 인증서·실기기가 필요해 미구현(서버가 Expo 푸시 토큰으로 보내는 구조로 확장 가능).
interface MarketValue {
  api: MarketApi;
  session: Session | null;
  me: Me | null;
  token: string | null;
  restoring: boolean;
  signIn(s: Session, notify?: boolean): void;
  signOut(): Promise<void>;
  refreshMe(): Promise<void>;
  /** 알림을 켤 때 기기 알림 권한을 요청한다. */
  enableDeviceAlerts(): Promise<boolean>;
  version: number;
  bump(): void;
}

const Ctx = createContext<MarketValue | null>(null);
const POLL_MS = 20_000;

export function MarketProvider({
  api,
  children,
  store = secureTokenStore,
  notifier = deviceNotifier,
  pollMs = POLL_MS,
}: {
  api: MarketApi;
  children: ReactNode;
  store?: TokenStore;
  notifier?: Notifier;
  pollMs?: number;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [version, setVersion] = useState(0);
  const [restoring, setRestoring] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const token = session?.token ?? null;
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  // 앱 시작: 저장된 토큰 복원(서버가 거절하면 지운다).
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await store.load();
      if (!saved) return;
      try {
        const m = await api.me(saved);
        if (!alive) return;
        setSession({ token: saved, expiresAt: '', user: { id: m.id, name: m.name, alertsOn: m.alertsOn } });
        setMe(m);
      } catch {
        await store.clear();
      }
    })().finally(() => alive && setRestoring(false));
    return () => {
      alive = false;
    };
  }, [api, store]);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      setMe(await api.me(token));
    } catch {
      setSession(null);
      setMe(null);
      await store.clear();
    }
  }, [api, token, store]);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    api.me(token).then(
      (m) => alive && setMe(m),
      () => alive && setSession(null),
    );
    return () => {
      alive = false;
    };
  }, [api, token, version]);

  // 새 정가 이하 알림 → 기기 알림. 처음 확인한 목록은 '이미 본 것'으로 두어 옛 알림을 다시 띄우지 않는다.
  const alertsOn = !!me?.alertsOn;
  useEffect(() => {
    seen.current = null;
    if (!token || !alertsOn) return;
    let alive = true;
    const check = async () => {
      try {
        const list = await api.notifications(token);
        if (!alive) return;
        if (seen.current === null) {
          seen.current = new Set(list.map((n) => n.id));
        } else {
          for (const n of list) {
            if (seen.current.has(n.id)) continue;
            seen.current.add(n.id);
            if (!n.read) await notifier.notify('정가 이하 매물이 올라왔어요', n.text, { listingId: n.listingId });
          }
        }
        setMe((m) => (m ? { ...m, unread: list.filter((n) => !n.read).length } : m));
      } catch {
        // 다음 주기에 다시 확인
      }
    };
    void check();
    const timer = setInterval(() => void check(), pollMs);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void check());
    return () => {
      alive = false;
      clearInterval(timer);
      sub.remove();
    };
  }, [api, token, alertsOn, notifier, pollMs]);

  // 기기 알림을 누르면 해당 매물로 이동
  useEffect(
    () =>
      notifier.onOpen((data) => {
        if (typeof data.listingId === 'string') router.push(`/item/${encodeURIComponent(data.listingId)}`);
      }),
    [notifier],
  );

  const value = useMemo<MarketValue>(
    () => ({
      api,
      session,
      me: token ? me : null,
      token,
      restoring,
      signIn: (s, notify = true) => {
        setSession(s);
        setMe({ ...s.user, unread: 0 });
        setVersion((v) => v + 1);
        void store.save(s.token);
        if (s.user.alertsOn) void notifier.ensurePermission();
        if (notify) setNotice('로그인했어요');
      },
      signOut: async () => {
        if (token) await api.logout(token).catch(() => undefined);
        await store.clear();
        setSession(null);
        setMe(null);
        setVersion((v) => v + 1);
        setNotice('이 기기에서 로그아웃했어요');
      },
      refreshMe,
      enableDeviceAlerts: () => notifier.ensurePermission(),
      version,
      bump: () => setVersion((v) => v + 1),
    }),
    [api, session, me, token, restoring, refreshMe, version, store, notifier],
  );
  return <Ctx.Provider value={value}>
    {children}
    {notice ? <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 12, left: 24, right: 24, alignItems: 'center', zIndex: 1000 }}>
      <Animated.View entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)} exiting={FadeOut.duration(160).reduceMotion(ReduceMotion.System)} accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ backgroundColor: '#191F28', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{notice}</Text>
      </Animated.View>
    </View> : null}
  </Ctx.Provider>;
}

export function useMarket() {
  const v = useContext(Ctx);
  if (!v) throw new Error('MarketProvider 가 필요해요');
  return v;
}
