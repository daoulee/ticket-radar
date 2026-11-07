import { createContext, useContext, useState, type ReactNode } from 'react';
import { useWindowDimensions, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

// 홈 이야기 화면(웹 Landing 과 같은 구성)의 스크롤 연동 부품(APP-018).
// 스크롤 위치(scrollY)를 공유하고, 각 구간은 화면에 들어올 때 떠오르거나 진행도에 따라 바뀐다.
// 모두 장식이며 iOS '동작 줄이기'면 움직임 없이 최종 상태로 보인다.
export const ScrollYContext = createContext<SharedValue<number> | null>(null);

export function useScrollY() {
  return useContext(ScrollYContext);
}

// 화면에 들어올 때 아래에서 떠오른다(진입 구간 동안 진행도에 비례).
export function RevealOnScroll({
  children,
  style,
  distance = 28,
  offset = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  distance?: number;
  offset?: number;
}) {
  const scrollY = useScrollY();
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const [y, setY] = useState<number | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setY(e.nativeEvent.layout.y);
  const a = useAnimatedStyle(() => {
    if (reduced || !scrollY || y === null) return { opacity: 1, transform: [{ translateY: 0 }] };
    const start = y - height + 40 + offset;
    const p = interpolate(scrollY.value, [start, start + height * 0.28], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: (1 - p) * distance }] };
  });
  return (
    <Animated.View onLayout={onLayout} style={[style, a]}>
      {children}
    </Animated.View>
  );
}

// 구간을 지나가는 진행도(0~1)를 자식에게 넘긴다. 휴대폰 화면 전환·단어 강조에 쓴다.
export function ProgressSection({
  children,
  style,
}: {
  children: (progress: SharedValue<number> | null, layout: { y: number; h: number } | null) => ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [layout, setLayout] = useState<{ y: number; h: number } | null>(null);
  return (
    <View
      style={style}
      onLayout={(e) => setLayout({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
    >
      {children(useScrollY(), layout)}
    </View>
  );
}
