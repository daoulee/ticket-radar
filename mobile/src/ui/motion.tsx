import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon } from '../components/ui';

// 플랫폼 화면 모션 부품(APP-028, TODO '앱 · 모션과 세부 디테일').
// 원칙(D11): 모션은 장식 — 화면 진입·네트워크·이동을 애니메이션 완료에 묶지 않는다. 가짜 진행률·성공 카운트업 없음.
// 모두 iOS '동작 줄이기'를 따른다(ReduceMotion.System / useReducedMotion → 즉시 최종 상태).
const T = { ink: '#191F28', g1: '#F2F4F6', g2: '#E5E8EB', g4: '#B0B8C1', primary: '#404890', red: '#E8483B' };
const RM = ReduceMotion.System;
const ease = Easing.out(Easing.cubic);

/** 목록 항목이 위에서부터 차례로 떠오른다(이동 8px, 260ms, 최대 8개까지만 지연). */
export function Appear({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 40).withInitialValues({ transform: [{ translateY: 8 }] }).reduceMotion(RM)} style={style}>
      {children}
    </Animated.View>
  );
}

/** 누르면 살짝 작아지고(0.98) 옅은 배경이 깔리는 눌림 반응. */
export function PressScale({ children, style, pressedBg = T.g1, scaleTo = 0.98, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; pressedBg?: string; scaleTo?: number }) {
  const p = useSharedValue(0);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 - (1 - scaleTo) * p.value }], backgroundColor: p.value > 0.01 ? pressedBg : 'transparent' }));
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        p.set(withTiming(1, { duration: 90, reduceMotion: RM }));
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.set(withTiming(0, { duration: 160, reduceMotion: RM }));
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[{ borderRadius: 12 }, style, a]}>{children}</Animated.View>
    </Pressable>
  );
}

/** 목록 모양 스켈레톤(은은한 깜빡임). */
export function SkeletonRows({ count = 3, thumb = 48 }: { count?: number; thumb?: number }) {
  const o = useSharedValue(0.55);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) o.set(withRepeat(withSequence(withTiming(1, { duration: 650 }), withTiming(0.55, { duration: 650 })), -1));
  }, [o, reduced]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[{ gap: 18, paddingVertical: 12 }, a]} accessibilityLabel="불러오는 중" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: thumb, height: thumb, borderRadius: 12, backgroundColor: T.g1 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ height: 14, width: '70%', borderRadius: 7, backgroundColor: T.g1 }} />
            <View style={{ height: 11, width: '45%', borderRadius: 6, backgroundColor: T.g1 }} />
          </View>
          <View style={{ height: 14, width: 64, borderRadius: 7, backgroundColor: T.g1 }} />
        </View>
      ))}
    </Animated.View>
  );
}

/** 하트 토글: 켤 때 튀어 오르는 스프링 + 진동, 끌 때 살짝 줄었다 돌아옴. */
export function HeartButton({ on, onPress, busy, size = 24, label }: { on: boolean; onPress: () => void; busy?: boolean; size?: number; label?: string }) {
  const s = useSharedValue(1);
  const prev = useRef(on);
  useEffect(() => {
    if (prev.current === on) return;
    prev.current = on;
    s.set(on ? withSequence(withTiming(1.28, { duration: 120, reduceMotion: RM }), withSpring(1, { damping: 8, stiffness: 220, reduceMotion: RM })) : withSequence(withTiming(0.82, { duration: 90, reduceMotion: RM }), withTiming(1, { duration: 140, reduceMotion: RM })));
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? (on ? '즐겨찾기 해제' : '즐겨찾기')} accessibilityState={{ selected: on, busy: !!busy }} hitSlop={10} onPress={onPress} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={a}>
        <Icon name={on ? 'heartFill' : 'heart'} size={size} color={on ? T.red : T.ink} />
      </Animated.View>
    </Pressable>
  );
}

/** 글자 탭 + 선택 밑줄이 옆으로 미끄러진다. */
export function SlidingTabs<K extends string>({ items, value, onChange }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const [boxes, setBoxes] = useState<Record<string, { x: number; w: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const box = boxes[value];
  useEffect(() => {
    if (!box) return;
    x.set(withTiming(box.x, { duration: 220, easing: ease, reduceMotion: RM }));
    w.set(withTiming(box.w, { duration: 220, easing: ease, reduceMotion: RM }));
  }, [box, x, w]);
  const bar = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: w.value }));
  return (
    <View accessibilityRole="tablist" style={{ paddingTop: 6, paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {items.map((i) => {
          const on = i.key === value;
          return (
            <Pressable
              key={i.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              hitSlop={8}
              onLayout={(e: LayoutChangeEvent) => {
                const { x: bx, width } = e.nativeEvent.layout;
                setBoxes((b) => (b[i.key]?.x === bx && b[i.key]?.w === width ? b : { ...b, [i.key]: { x: bx, w: width } }));
              }}
              onPress={() => {
                if (!on) Haptics.selectionAsync().catch(() => undefined);
                onChange(i.key);
              }}
            >
              <Text style={{ fontSize: 15, lineHeight: 22, letterSpacing: -0.3, fontWeight: on ? '700' : '500', color: on ? T.ink : '#8B95A1' }}>{i.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Animated.View style={[{ position: 'absolute', bottom: 4, left: 0, height: 2, borderRadius: 1, backgroundColor: T.ink }, bar]} />
    </View>
  );
}

/** 숫자 배지: 값이 바뀔 때마다 톡 튀어 나온다. */
export function PopBadge({ count, color = T.red }: { count: number; color?: string }) {
  if (!count) return null;
  return (
    <Animated.View key={count} entering={ZoomIn.springify().damping(12).reduceMotion(RM)} style={{ position: 'absolute', top: -3, right: -4, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{count > 9 ? '9+' : count}</Text>
    </Animated.View>
  );
}

const APath = Animated.createAnimatedComponent(Path);
/** 완료 체크가 그려지는 짧은 모션(원 → 체크, 약 0.6초). 이동은 이 모션을 기다리지 않는다. */
export function CheckDraw({ size = 72, color = T.primary, gentle = false }: { size?: number; color?: string; gentle?: boolean }) {
  const p = useSharedValue(0);
  const scale = useSharedValue(gentle ? 0.96 : 0.6);
  useEffect(() => {
    p.set(gentle ? withDelay(300, withTiming(1, { duration: 420, easing: ease, reduceMotion: RM }), RM) : withTiming(1, { duration: 520, easing: ease, reduceMotion: RM }));
    scale.set(gentle ? withTiming(1, { duration: 200, easing: ease, reduceMotion: RM }) : withSpring(1, { damping: 10, stiffness: 180, reduceMotion: RM }));
  }, [gentle, p, scale]);
  const L = 30;
  const props = useAnimatedProps(() => ({ strokeDashoffset: L * (1 - p.value) }));
  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={a} accessibilityLabel="완료">
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={22} fill={color} />
        <APath d="M14 24.5l7 7 13-14" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={L} animatedProps={props} />
      </Svg>
    </Animated.View>
  );
}

/** 단계 진행 막대: 완료 칸이 차오르고, 현재 칸은 은은하게 숨 쉰다. */
export function StepBar({ steps, done, animateCompletion = false }: { steps: string[]; done: number; animateCompletion?: boolean }) {
  return (
    <View accessible accessibilityLabel={`진행 단계 ${done}/${steps.length}: ${steps[Math.max(0, done - 1)]}`}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flex: 1, minWidth: 0, gap: 8 }}>
            <Seg filled={i < done} current={i === done - 1 && done < steps.length} completionIndex={animateCompletion && done === steps.length ? i : null} />
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: i < done ? '700' : '500', color: i < done ? T.ink : '#8B95A1' }}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function Seg({ filled, current, completionIndex }: { filled: boolean; current: boolean; completionIndex: number | null }) {
  const reduced = useReducedMotion();
  const f = useSharedValue(completionIndex !== null && !reduced ? 0 : filled ? 1 : 0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (completionIndex !== null && filled && !reduced) {
      f.set(0);
      f.set(withDelay(340 + completionIndex * 200, withTiming(1, { duration: 260, easing: ease, reduceMotion: RM }), RM));
    } else {
      f.set(withTiming(filled ? 1 : 0, { duration: 420, easing: ease, reduceMotion: RM }));
    }
  }, [completionIndex, filled, f, reduced]);
  useEffect(() => {
    if (current && !reduced) pulse.set(withRepeat(withSequence(withTiming(0.55, { duration: 700 }), withTiming(1, { duration: 700 })), -1));
    else pulse.set(1);
  }, [current, reduced, pulse]);
  const a = useAnimatedStyle(() => ({ width: `${f.value * 100}%`, opacity: pulse.value }));
  return (
    <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: T.g2, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: T.primary }, a]} />
    </View>
  );
}

/** 펼침 영역: 높이를 부드럽게 바꾸며 내용이 나타난다(레이아웃 전환). */
export function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <Animated.View entering={FadeInDown.duration(200).withInitialValues({ transform: [{ translateY: -4 }] }).reduceMotion(RM)}>{children}</Animated.View>;
}

/** 오른쪽 화살표가 펼침 상태에 따라 90° 회전. */
export function Chevron({ open, color = T.g4 }: { open: boolean; color?: string }) {
  const r = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    r.set(withTiming(open ? 1 : 0, { duration: 200, easing: ease, reduceMotion: RM }));
  }, [open, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 90}deg` }] }));
  return (
    <Animated.View style={a}>
      <Icon name="chevronRight" size={20} color={color} />
    </Animated.View>
  );
}

/**
 * 형광펜(쓸어 칠하기): 글자 뒤에 형광펜 띠가 왼쪽→오른쪽으로 칠해진다(한 줄 문구용).
 * 티켓레이더 소개 화면의 형광펜 강조를 플랫폼 화면의 핵심 판단 문구에 이어 쓴다.
 */
export function Marker({
  children,
  color = 'rgba(234,88,12,0.22)',
  delay = 180,
  duration = 520,
  style,
}: {
  children: ReactNode;
  color?: string;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const w = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => w.set(withTiming(1, { duration, easing: Easing.inOut(Easing.cubic), reduceMotion: RM })), delay);
    return () => clearTimeout(t);
  }, [w, delay, duration]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[{ alignSelf: 'flex-start' }, style]}>
      <Animated.View style={[{ position: 'absolute', left: -3, bottom: 2, height: '46%', borderRadius: 4, backgroundColor: color }, a]} />
      {children}
    </View>
  );
}
