import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, motionMs } from '../ui/theme';

// S01 앱 내부 브랜드 진입(D1). 원·선·점으로 직접 그린 장식 심벌이며 스크린리더에서 숨기고 터치를 받지 않는다.
// 기본 렌더는 정적 최종 상태라 첫 화면·입력·공연 조회를 기다리게 하지 않는다(D11).
// Reduce Motion 이 꺼져 있음을 확인한 뒤에만 1회 재생(CODE-A/B). 조회 전·실패·켜짐은 정적,
// 재생 중 설정이 켜지거나 화면이 사라지면 즉시 최종 상태로 멈추고 구독을 정리한다.
const SIZE = 36;
const FADE_MS = 160; // 0~160ms 점 등장
const SWEEP_MS = Math.min(360, motionMs.brandMax - FADE_MS); // 160~520ms 짧은 스윕, 총 520ms

export function RadarBrand() {
  const [dot] = useState(() => new Animated.Value(1));
  const [sweep] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let active = true;
    let reduced = false;
    let anim: Animated.CompositeAnimation | null = null;
    const settle = () => {
      anim?.stop();
      anim = null;
      dot.setValue(1);
      sweep.setValue(1);
    };
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduced = enabled;
      if (enabled) settle();
    });
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!active || enabled || reduced) return;
        dot.setValue(0);
        sweep.setValue(0);
        anim = Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: FADE_MS, useNativeDriver: true }),
          Animated.timing(sweep, { toValue: 1, duration: SWEEP_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]);
        anim.start(() => {
          anim = null;
        });
      })
      .catch(() => {}); // 조회 실패: 정적 유지
    return () => {
      active = false;
      sub.remove();
      settle();
    };
  }, [dot, sweep]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '45deg'] });
  return (
    <View
      testID="radar-brand"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={s.wrap}
    >
      <View style={[s.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]} />
      <View style={[s.ring, { width: SIZE / 2, height: SIZE / 2, borderRadius: SIZE / 4 }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: dot, transform: [{ rotate }] }]}>
        <View style={s.dot} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  ring: { position: 'absolute', borderWidth: 1.5, borderColor: colors.primary },
  dot: { position: 'absolute', top: 0, left: SIZE / 2 - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
