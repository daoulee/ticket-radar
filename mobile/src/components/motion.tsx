import { useEffect, type ReactNode } from 'react';
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { enter } from '../ui/theme';

// 화면 등장 효과 모음(APP-012). 모두 장식이며 터치·스크린리더·요청 흐름을 기다리게 하지 않는다(D11).
// Reanimated 의 ReduceMotion.System 으로 iOS '동작 줄이기'가 켜져 있으면 움직임 없이 바로 최종 상태가 된다.
const EASE = Easing.bezier(0.22, 1, 0.36, 1); // 빠르게 들어와 부드럽게 멈추는 곡선(expo-out 계열)

function rise(index: number, extraDelay = 0) {
  return FadeInDown.duration(enter.duration)
    .delay(extraDelay + index * enter.stagger)
    .easing(EASE)
    .withInitialValues({ opacity: 0, transform: [{ translateY: enter.distance }] })
    .reduceMotion(ReduceMotion.System);
}

// 블록을 순서대로 살짝 떠오르게 한다. index 가 클수록 늦게.
export function Reveal({
  index = 0,
  delay = 0,
  children,
  style,
}: {
  index?: number;
  delay?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={rise(index, delay)} style={style}>
      {children}
    </Animated.View>
  );
}

// 제목을 단어 단위로 차례로 떠오르게 한다(글자 단위는 한글 줄바꿈이 어색해 단어 단위).
// 스크린리더에는 문장 전체 하나로 읽힌다. 줄바꿈은 '\n' 으로 지정.
export function WordsReveal({
  text,
  style,
  delay = 0,
  header = false,
  center = false,
}: {
  text: string;
  style: StyleProp<TextStyle>;
  delay?: number;
  header?: boolean;
  center?: boolean;
}) {
  let n = 0;
  return (
    <View
      accessible
      accessibilityRole={header ? 'header' : 'text'}
      accessibilityLabel={text.replace(/\n/g, ' ')}
    >
      {text.split('\n').map((line, li) => (
        <View
          key={li}
          style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: center ? 'center' : 'flex-start' }}
          importantForAccessibility="no-hide-descendants"
        >
          {line.split(' ').map((word, wi, arr) => {
            const i = n++;
            return (
              <Animated.View
                key={`${li}-${wi}`}
                entering={FadeInDown.duration(380)
                  .delay(delay + i * 45)
                  .easing(EASE)
                  .withInitialValues({ opacity: 0, transform: [{ translateY: 14 }] })
                  .reduceMotion(ReduceMotion.System)}
              >
                <Text style={style}>
                  {word}
                  {wi < arr.length - 1 ? ' ' : ''}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// 숫자·핵심 값 강조: 살짝 커졌다가 제자리(값 자체는 바뀌지 않는다. 카운트업 아님 — D11).
export function Emphasis({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const scale = useSharedValue(0.96);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 260, easing: EASE, reduceMotion: ReduceMotion.System }));
    scale.value = withDelay(delay, withTiming(1, { duration: 420, easing: EASE, reduceMotion: ReduceMotion.System }));
  }, [delay, opacity, scale]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// 단순 페이드(배지·보조 문구용)
export function FadeInView({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeIn.duration(260).delay(delay).reduceMotion(ReduceMotion.System)} style={style}>
      {children}
    </Animated.View>
  );
}
