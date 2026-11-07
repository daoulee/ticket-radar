import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Image as SvgImage, Line, Mask, Path, Rect } from 'react-native-svg';
import { brand, colors } from '../ui/theme';
import { SCRIPT_STROKES, SCRIPT_VIEWBOX } from './scriptPaths';

// 앱 시작 브랜드 연출(APP-012, 사용자 지시). 사용자 제작 필기체 로고가 펜으로 써지듯 나타난다.
//  ① 본획(t→i→c→k→e→t) ② 사람이 쓰듯 마지막에 t 가로획 두 개 ③ 빨간 밑줄이 빛을 끌며 그어짐
//  ④ 조준 표시가 원을 그리며 잠김(가운데 점·퍼지는 링·가벼운 진동) ⑤ 이름·한 줄 소개 등장 ⑥ 위로 빠지며 첫 화면 공개
// 원칙: 화면을 누르면 즉시 건너뜀. iOS '동작 줄이기'·설정 조회 실패면 움직임 없이 완성 로고만 잠깐 보여준다.
// 첫 화면(공연 목록 조회 포함)은 이 오버레이 아래에서 이미 실행 중이다. 종료는 애니메이션 콜백이 아니라 타이머로 한다(D11).
const LOGO = require('../../assets/brand/ticket-script.png');

// 연출 시각표(ms)
const T = {
  word: [0, 1150],
  crossL: [1170, 180],
  crossR: [1370, 170],
  settle: [1450, 260], // 완성 로고를 겹쳐 띄워 마스크 경계의 미세한 틈을 메운다
  line: [1560, 300],
  lock: [1860, 260],
  text: [2050, 0],
  exit: [3650, 360], // 모두 나타난 뒤 약 1.6초 머문다(사용자 요청으로 1초 연장)
};
export const SPLASH_TOTAL_MS = T.exit[0] + T.exit[1];
const STATIC_HOLD_MS = 700;

// 로고 이미지는 (0,0)~(1460,500). 밑줄·조준 표시는 사용자 원본 로고와 같은 자리(크롭 좌표)에 벡터로 다시 그린다.
const VB = { x: -40, y: -30, w: 1540, h: 640 };
const LINE_START = { x: -10, y: 548 };
const LINE_END = { x: 1415, y: 437 };
const SIGHT = { x: 1400, y: 70, r: 58 };
const SIGHT_CIRC = Math.ceil(2 * Math.PI * SIGHT.r);
const LINE_LEN = Math.ceil(Math.hypot(LINE_END.x - LINE_START.x, LINE_END.y - LINE_START.y));

const PEN = Easing.bezier(0.45, 0.05, 0.25, 1); // 시작은 머뭇, 중간 빠르게, 끝은 천천히(손글씨 리듬)
const OUT = Easing.bezier(0.22, 1, 0.36, 1);
const RM = ReduceMotion.Never; // 동작 줄이기는 아래에서 직접 판단해 정적 화면으로 대체한다.

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const ARect = Animated.createAnimatedComponent(Rect);
const ALine = Animated.createAnimatedComponent(Line);
const AImage = Animated.createAnimatedComponent(SvgImage);

function timing(to: number, [start, duration]: number[], easing = OUT) {
  return withDelay(start, withTiming(to, { duration, easing, reduceMotion: RM }));
}

export function BrandSplash({ onDone, onFirstFrame }: { onDone: () => void; onFirstFrame?: () => void }) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<'pending' | 'motion' | 'static'>('pending');
  const finished = useRef(false);

  const word = useSharedValue(0);
  const crossL = useSharedValue(0);
  const crossR = useSharedValue(0);
  const settle = useSharedValue(0);
  const line = useSharedValue(0);
  const ring = useSharedValue(0);
  const cross = useSharedValue(0);
  const dot = useSharedValue(0);
  const pulse = useSharedValue(0);
  const caption = useSharedValue(0);
  const exit = useSharedValue(0);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  // 동작 줄이기 확인 → 연출 또는 정적. 조회 전에는 아무것도 그리지 않은 흰 화면(네이티브 시작 화면과 같은 색).
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => alive && setMode(reduced ? 'static' : 'motion'))
      .catch(() => alive && setMode('static'));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (mode === 'pending') return;
    if (mode === 'static') {
      for (const v of [word, crossL, crossR, settle, line, ring, cross, dot, caption]) v.value = 1;
      const t = setTimeout(finish, STATIC_HOLD_MS);
      return () => clearTimeout(t);
    }
    word.value = timing(1, T.word, PEN);
    crossL.value = timing(1, T.crossL, PEN);
    crossR.value = timing(1, T.crossR, PEN);
    settle.value = timing(1, T.settle);
    line.value = timing(1, T.line, Easing.bezier(0.7, 0, 0.2, 1));
    ring.value = timing(1, T.lock);
    cross.value = timing(1, [T.lock[0] + 120, 180]);
    dot.value = withDelay(
      T.lock[0] + 230,
      withSequence(withTiming(1.5, { duration: 110, reduceMotion: RM }), withTiming(1, { duration: 160, easing: OUT, reduceMotion: RM })),
    );
    pulse.value = timing(1, [T.lock[0] + 230, 520]);
    caption.value = timing(1, [T.text[0], 420]);
    exit.value = timing(1, T.exit, Easing.bezier(0.65, 0, 0.35, 1));
    const haptic = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }, T.lock[0] + 230);
    const done = setTimeout(finish, SPLASH_TOTAL_MS);
    return () => {
      clearTimeout(haptic);
      clearTimeout(done);
    };
    // 공유 값은 고정 참조이므로 mode 변화에만 반응한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const wordProps = useAnimatedProps(() => ({ strokeDashoffset: SCRIPT_STROKES.word.length * (1 - word.value) }));
  const crossLProps = useAnimatedProps(() => ({ strokeDashoffset: SCRIPT_STROKES.crossLeft.length * (1 - crossL.value) }));
  const crossRProps = useAnimatedProps(() => ({ strokeDashoffset: SCRIPT_STROKES.crossRight.length * (1 - crossR.value) }));
  const settleProps = useAnimatedProps(() => ({ opacity: settle.value }));
  const lineMaskProps = useAnimatedProps(() => ({ width: (LINE_END.x - LINE_START.x + 80) * line.value }));
  const sparkProps = useAnimatedProps(() => ({
    cx: LINE_START.x + (LINE_END.x - LINE_START.x) * line.value,
    cy: LINE_START.y + (LINE_END.y - LINE_START.y) * line.value,
    opacity: line.value > 0 && line.value < 1 ? 1 : 0,
  }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: SIGHT_CIRC * (1 - ring.value) }));
  const vLineProps = useAnimatedProps(() => ({
    y1: SIGHT.y - SIGHT.r * cross.value,
    y2: SIGHT.y + SIGHT.r * cross.value,
  }));
  const hLineProps = useAnimatedProps(() => ({
    x1: SIGHT.x - SIGHT.r * cross.value,
    x2: SIGHT.x + SIGHT.r * cross.value,
  }));
  const dotProps = useAnimatedProps(() => ({ r: 9 * dot.value }));
  const glowProps = useAnimatedProps(() => ({ strokeOpacity: 0.12 * ring.value }));
  const pulseProps = useAnimatedProps(() => ({
    r: SIGHT.r + 70 * pulse.value,
    opacity: pulse.value > 0 ? 0.45 * (1 - pulse.value) : 0,
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: caption.value,
    transform: [{ translateY: 10 * (1 - caption.value) }],
  }));
  // 퇴장: 로고가 먼저 위로 빠지며 사라지고(앞 55%), 흰 배경은 뒤이어 걷힌다(뒤 65%) — 로고가 첫 화면 위에 겹치지 않게.
  const contentStyle = useAnimatedStyle(() => {
    const e = Math.min(1, exit.value / 0.55);
    return { transform: [{ translateY: -40 * e }, { scale: 1 - 0.06 * e }], opacity: 1 - e };
  });
  const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.max(0, (exit.value - 0.35) / 0.65) }));

  const logoWidth = Math.min(width * 0.78, 420);
  const logoHeight = (logoWidth * VB.h) / VB.w;
  const glowRed = brand.red;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="티켓레이더 시작 화면. 누르면 건너뜁니다."
      onPress={finish}
      style={StyleSheet.absoluteFill}
      testID="brand-splash"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: brand.paper }, backdropStyle]}
        onLayout={onFirstFrame}
      />
      {mode === 'pending' ? null : (
        <Animated.View style={[s.center, contentStyle]} pointerEvents="none">
          <Svg width={logoWidth} height={logoHeight} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
            <Defs>
              {/* 펜이 지나간 곳만 로고 이미지를 보이게 하는 마스크 */}
              <Mask id="ink" maskUnits="userSpaceOnUse" x={VB.x} y={VB.y} width={VB.w} height={VB.h}>
                <Rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="black" />
                {(
                  [
                    [SCRIPT_STROKES.word, wordProps],
                    [SCRIPT_STROKES.crossLeft, crossLProps],
                    [SCRIPT_STROKES.crossRight, crossRProps],
                  ] as const
                ).map(([st, props], i) => (
                  <APath
                    key={i}
                    d={st.d}
                    stroke="white"
                    strokeWidth={st.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    strokeDasharray={[st.length, st.length]}
                    animatedProps={props}
                  />
                ))}
              </Mask>
              <Mask id="sweep" maskUnits="userSpaceOnUse" x={VB.x} y={VB.y} width={VB.w} height={VB.h}>
                <ARect x={LINE_START.x - 40} y={380} height={220} fill="white" animatedProps={lineMaskProps} />
              </Mask>
            </Defs>

            <SvgImage href={LOGO} x={0} y={0} width={SCRIPT_VIEWBOX.width} height={SCRIPT_VIEWBOX.height} mask="url(#ink)" />
            <AImage href={LOGO} x={0} y={0} width={SCRIPT_VIEWBOX.width} height={SCRIPT_VIEWBOX.height} animatedProps={settleProps} />

            {/* 빨간 밑줄: 번짐(빛) → 칼날 모양 → 흰 심선. 왼쪽부터 드러난다. */}
            <G mask="url(#sweep)">
              <Line {...seg()} stroke={glowRed} strokeOpacity={0.1} strokeWidth={34} strokeLinecap="round" />
              <Line {...seg()} stroke={glowRed} strokeOpacity={0.18} strokeWidth={18} strokeLinecap="round" />
              <Path d={blade(9)} fill={glowRed} />
              <Path d={blade(2.2)} fill="#FFFFFF" opacity={0.9} />
            </G>
            <ACircle r={10} fill="#FFFFFF" animatedProps={sparkProps} />

            {/* 조준 표시 잠금 */}
            <ACircle cx={SIGHT.x} cy={SIGHT.y} fill="none" stroke={glowRed} strokeWidth={6} animatedProps={pulseProps} />
            <ACircle cx={SIGHT.x} cy={SIGHT.y} r={SIGHT.r} fill="none" stroke={glowRed} strokeWidth={22} animatedProps={glowProps} />
            <ACircle
              cx={SIGHT.x}
              cy={SIGHT.y}
              r={SIGHT.r}
              fill="none"
              stroke={glowRed}
              strokeWidth={6}
              strokeDasharray={[SIGHT_CIRC, SIGHT_CIRC]}
              rotation={-90}
              origin={`${SIGHT.x}, ${SIGHT.y}`}
              animatedProps={ringProps}
            />
            <ALine x1={SIGHT.x} x2={SIGHT.x} stroke={glowRed} strokeWidth={4} animatedProps={vLineProps} />
            <ALine y1={SIGHT.y} y2={SIGHT.y} stroke={glowRed} strokeWidth={4} animatedProps={hLineProps} />
            <ACircle cx={SIGHT.x} cy={SIGHT.y} fill={glowRed} animatedProps={dotProps} />
          </Svg>

          <Animated.View style={[s.caption, captionStyle]}>
            <Text style={s.name}>티켓레이더</Text>
            <Text style={s.tagline}>결제 전에, 공식 안내와 맞춰 보세요</Text>
          </Animated.View>
        </Animated.View>
      )}
    </Pressable>
  );
}

function seg() {
  return { x1: LINE_START.x, y1: LINE_START.y, x2: LINE_END.x, y2: LINE_END.y };
}

// 양 끝이 뾰족하고 가운데가 두꺼운 칼날 모양 밑줄(사용자 로고의 밑줄 형태).
function blade(half: number) {
  const { x: x1, y: y1 } = LINE_START;
  const { x: x2, y: y2 } = LINE_END;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * half;
  const ny = (dx / len) * half;
  const mx = x1 + dx * 0.55;
  const my = y1 + dy * 0.55;
  return `M${x1},${y1} Q${mx + nx},${my + ny} ${x2},${y2} Q${mx - nx},${my - ny} ${x1},${y1} Z`;
}

export const SPLASH_LINE_LENGTH = LINE_LEN;

const s = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 18 },
  caption: { alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: colors.text },
  tagline: { fontSize: 14, fontWeight: '500', letterSpacing: -0.28, color: colors.muted },
});
