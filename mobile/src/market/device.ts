import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// 기기 기능 어댑터(APP-025): 로그인 토큰 보관(키체인) · 기기 알림. 테스트에서는 가짜로 바꿔 끼운다.
// 실패해도 앱 흐름을 막지 않는다(저장 실패 → 다음 실행에 다시 로그인, 알림 실패 → 앱 안 알림만).

export interface TokenStore {
  load(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}
export interface Notifier {
  /** 권한을 확인하고 없으면 요청한다. 허용되면 true. */
  ensurePermission(): Promise<boolean>;
  /** 지금 바로 기기 알림을 띄운다. */
  notify(title: string, body: string, data: Record<string, string>): Promise<void>;
  /** 알림을 눌렀을 때 호출. 해제 함수를 돌려준다. */
  onOpen(handler: (data: Record<string, unknown>) => void): () => void;
}

const KEY = 'ticketradar.session.v1';

export const secureTokenStore: TokenStore = {
  async load() {
    try {
      return await SecureStore.getItemAsync(KEY);
    } catch {
      return null;
    }
  },
  async save(token) {
    try {
      await SecureStore.setItemAsync(KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    } catch {
      // 저장 실패: 다음 실행에 다시 로그인한다.
    }
  },
  async clear() {
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {
      // 이미 없음
    }
  },
};

let handlerSet = false;
export const deviceNotifier: Notifier = {
  async ensurePermission() {
    try {
      if (!handlerSet) {
        // 앱을 보고 있을 때도 배너로 보여 준다.
        Notifications.setNotificationHandler({
          handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
        });
        handlerSet = true;
      }
      const cur = await Notifications.getPermissionsAsync();
      if (cur.granted) return true;
      if (!cur.canAskAgain) return false;
      return (await Notifications.requestPermissionsAsync()).granted;
    } catch {
      return false;
    }
  },
  async notify(title, body, data) {
    try {
      await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: null });
    } catch {
      // 기기 알림 실패 → 앱 안 알림(배지·목록)은 그대로 있다.
    }
  },
  onOpen(handler) {
    try {
      const sub = Notifications.addNotificationResponseReceivedListener((r) => handler(r.notification.request.content.data ?? {}));
      return () => sub.remove();
    } catch {
      return () => undefined;
    }
  },
};

export const memoryTokenStore = (): TokenStore => {
  let v: string | null = null;
  return { load: async () => v, save: async (t) => void (v = t), clear: async () => void (v = null) };
};
export const silentNotifier: Notifier = { ensurePermission: async () => false, notify: async () => undefined, onOpen: () => () => undefined };
