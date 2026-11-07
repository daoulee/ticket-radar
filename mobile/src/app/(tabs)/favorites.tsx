import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toApiError } from '../../api/client';
import type { ShowSummary } from '../../market/api';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { Band, CTA, Empty, ErrorLine, Row, Section, t, tt, won } from '../../ui/toss';
import { SkeletonRows } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';
import { useMarket } from '../../market/MarketContext';

// 즐겨찾기(V2-6): 계정에 저장된 공연·경기 · 새 매물 수 · 정가 이하 알림 스위치(사용자 결정 2026-11-03).
export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { api, token, me, refreshMe, bump, version, enableDeviceAlerts } = useMarket();
  const [list, setList] = useState<ShowSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [deviceOk, setDeviceOk] = useState<boolean | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let alive = true;
      api.favorites(token).then((l) => alive && setList(l), (e) => alive && setError(toApiError(e).message));
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, token, version]),
  );
  async function remove(id: string) {
    if (!token) return;
    try {
      setList(await api.setFavorite(token, id, false));
      bump();
    } catch (e) {
      setError(toApiError(e).message);
    }
  }
  async function toggleAlerts(on: boolean) {
    if (!token) return;
    setAlertBusy(true);
    try {
      await api.setAlerts(token, on);
      if (on) setDeviceOk(await enableDeviceAlerts());
      await refreshMe();
    } finally {
      setAlertBusy(false);
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: t.white, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8, gap: 6 }}>
        <Text accessibilityRole="header" style={tt.hero}>즐겨찾기</Text>
        <Text style={[tt.body, { color: t.g5 }]}>새 매물이 올라오면 여기서 먼저 보여드려요</Text>
      </View>
      {!token ? (
        <View style={{ padding: 24, gap: 16 }}>
          <Text style={[tt.body, { color: t.g7 }]}>즐겨찾기는 계정에 저장돼요. 기기를 바꿔도 그대로예요.</Text>
          <CTA label="로그인하기" onPress={() => router.push('/login')} />
        </View>
      ) : (
        <>
          <Section>
            {error ? <ErrorLine text={error} /> : !list ? <SkeletonRows count={3} /> : list.length === 0 ? (
              <Empty icon="heart" text="아직 즐겨찾기한 공연이 없어요." action="공연 둘러보기" onAction={() => router.push('/')} />
            ) : list.map((s, i) => (
              // 해제하면 왼쪽으로 사라지고 아래 행이 부드럽게 올라온다(APP-028).
              <Animated.View key={s.id} entering={FadeInDown.duration(240).delay(Math.min(i, 8) * 40).reduceMotion(ReduceMotion.System)} exiting={FadeOutLeft.duration(220).reduceMotion(ReduceMotion.System)} layout={LinearTransition.duration(240).reduceMotion(ReduceMotion.System)}>
              <Row
                art={<ShowArt id={s.id} category={s.category} size={48} />}
                title={s.title}
                desc={s.listingCount === 0 ? '아직 매물이 없어요' : `${s.newCount ? `새 매물 ${s.newCount} · ` : ''}${s.minPrice !== null ? `${won(s.minPrice)}부터` : ''}`}
                descColor={s.newCount ? t.primary : undefined}
                onPress={() => router.push(`/show/${encodeURIComponent(s.id)}`)}
                end="heartFill"
                endColor={t.red}
                onEnd={() => void remove(s.id)}
                endLabel={`${s.title} 즐겨찾기 해제`}
              />
              </Animated.View>
            ))}
          </Section>
          <Band />
          <Section>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={tt.rowTitle}>정가 이하 매물 알림</Text>
                <Text style={tt.desc}>즐겨찾기한 공연에 정가 이하 매물이 올라오면 알려드려요</Text>
              </View>
              <Switch accessibilityLabel="정가 이하 매물 알림" value={!!me?.alertsOn} disabled={alertBusy} onValueChange={(v) => void toggleAlerts(v)} trackColor={{ true: t.primary, false: t.g2 }} />
            </View>
            {deviceOk === false && me?.alertsOn ? (
              <Text style={[tt.desc, { paddingBottom: 6 }]}>기기 알림 권한이 꺼져 있어 앱 안에서만 알려드려요. 설정 앱에서 켤 수 있어요.</Text>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => router.push('/notifications')} style={{ paddingVertical: 8 }}>
              <Text style={[tt.body, { color: t.primary, fontWeight: '600' }]}>알림 보기{me?.unread ? ` · 새 알림 ${me.unread}` : ''}</Text>
            </Pressable>
          </Section>
        </>
      )}
    </View>
  );
}
