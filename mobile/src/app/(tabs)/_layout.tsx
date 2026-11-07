import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/ui';
import { useMarket } from '../../market/MarketContext';
import { t } from '../../ui/toss';

// 하단 탭(와이어프레임 v2): 홈 · 즐겨찾기 · 판매 · 내 거래 · 전체. 단색 바, 선택 탭만 진하게.
const ITEMS: Record<string, { label: string; icon: IconName; iconOn?: IconName }> = {
  index: { label: '홈', icon: 'home' },
  favorites: { label: '즐겨찾기', icon: 'heart', iconOn: 'heartFill' },
  sell: { label: '판매', icon: 'plus' },
  orders: { label: '내 거래', icon: 'receipt' },
  more: { label: '전체', icon: 'menu' },
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { me } = useMarket();
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'fade' }}
      tabBar={({ state, navigateToTab }) => (
        <View
          accessibilityRole="tablist"
          style={{ flexDirection: 'row', backgroundColor: t.white, borderTopWidth: 1, borderTopColor: t.g2, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 10) }}
        >
          {state.routes.map((r, i) => {
            const item = ITEMS[r.name];
            if (!item) return null;
            const on = state.index === i;
            const badge = r.name === 'favorites' && (me?.unread ?? 0) > 0;
            return (
              <Pressable
                key={r.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${item.label} 탭${badge ? `, 새 알림 ${me?.unread}개` : ''}`}
                onPress={() => {
                  if (!on) navigateToTab(r.key);
                }}
                style={{ flex: 1, alignItems: 'center', gap: 3, minHeight: 48, justifyContent: 'center' }}
              >
                <TabIcon on={on} name={on && item.iconOn ? item.iconOn : item.icon} badge={badge} />
                {/* 큰 글자에서도 탭 이름은 한 줄(확대 상한 1.3, iOS 탭 바 관례). 본문은 제한 없이 커진다. */}
                <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ fontSize: 11, fontWeight: '600', color: on ? t.ink : t.g4 }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="sell" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

// 선택한 탭 아이콘이 살짝 커졌다 돌아온다(동작 줄이기면 정지).
function TabIcon({ on, name, badge }: { on: boolean; name: IconName; badge: boolean }) {
  const s = useSharedValue(1);
  useEffect(() => {
    if (on) s.set(withSequence(withTiming(1.16, { duration: 110, reduceMotion: ReduceMotion.System }), withSpring(1, { damping: 9, stiffness: 240, reduceMotion: ReduceMotion.System })));
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={a}>
      <Icon name={name} size={24} color={on ? t.ink : t.g4} />
      {badge ? <View style={{ position: 'absolute', top: -1, right: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: t.red }} /> : null}
    </Animated.View>
  );
}
