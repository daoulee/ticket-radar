// Jest(Node) 전용 Reanimated 최소 모의. 애니메이션은 즉시 최종 상태가 된다(공식 mock 과 같은 원칙).
// 공식 react-native-reanimated/mock 은 이 환경에서 react-native-web·DOM 을 요구해 실패했다.
// expo-router 테스트 도구도 '/mock' 경로를 쓰므로 두 경로를 각각 얇은 진입 파일(reanimated-main.js, reanimated-mock-entry.js)로 연결한다(같은 파일이면 모의 순환).
module.exports = (() => {
  const RN = require('react-native');
  const chain = () => {
    const b = new Proxy(function builder() {}, { get: (_t, k) => (k === 'build' ? () => () => ({}) : () => b), apply: () => b });
    return b;
  };
  const passthrough = (C) => C;
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    Image: RN.Image,
    ScrollView: RN.ScrollView,
    createAnimatedComponent: passthrough,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: (v) => { const o = { value: v }; o.set = (n) => { o.value = n; }; o.get = () => o.value; return o; },
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    useDerivedValue: (fn) => ({ value: fn() }),
    withTiming: (v) => v,
    withSpring: (v) => v,
    withDelay: (_d, v) => v,
    withSequence: (...a) => a[a.length - 1],
    withRepeat: (v) => v,
    cancelAnimation: () => {},
    interpolate: (_v, _i, out) => out[out.length - 1],
    interpolateColor: (_v, _i, out) => out[out.length - 1],
    useReducedMotion: () => true,
    useAnimatedScrollHandler: (h) => (e) => (typeof h === 'function' ? h(e?.nativeEvent ?? e) : h?.onScroll?.(e?.nativeEvent ?? e)),
    Extrapolation: { CLAMP: 'clamp' },
    Easing: new Proxy({}, { get: () => () => (t) => t }),
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    FadeIn: chain(),
    FadeInDown: chain(),
    FadeInUp: chain(),
    FadeInRight: chain(),
    FadeInLeft: chain(),
    FadeOut: chain(),
    FadeOutUp: chain(),
    FadeOutLeft: chain(),
    SlideInRight: chain(),
    SlideInLeft: chain(),
    SlideOutLeft: chain(),
    SlideOutRight: chain(),
    ZoomIn: chain(),
    ZoomOut: chain(),
    LinearTransition: chain(),
    runOnJS: (fn) => fn,
    useAnimatedReaction: () => {},
  };
})();
