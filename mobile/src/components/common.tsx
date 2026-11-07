import * as Haptics from 'expo-haptics';
import { Children, isValidElement, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { ApiError } from '../api/client';
import { colors, CTA_HEIGHT, MIN_TOUCH, radius, shadow, space, type } from '../ui/theme';
import { FadeInView, Reveal, WordsReveal } from './motion';
import { Icon, type IconName } from './ui';

// APP-018: 웹과 같은 연보라→흰 바탕 그라디언트와 단색 남색 버튼을 쓴다. 이전 셰이더 정적 PNG(assets/shaders)는
// 보존하되 더 이상 화면에 쓰지 않는다(웹 최신 디자인에 셰이더 질감이 없음).

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// 모든 화면 공통 틀: 안전 영역 + 키보드 회피 + 스크롤.
// 작은 화면·큰 글자에서 내용이 넘쳐도 잘리지 않도록 항상 스크롤 가능하게 둔다.
// 큰 글자 설정(배율 1.6 이상)에서는 고정 하단 버튼이 화면 대부분을 덮으므로 스크롤 본문 끝으로 옮긴다.
// (iOS 시뮬레이터 accessibility-XXXL 캡처에서 결과 화면 본문이 몇 줄만 보이는 문제를 확인해 추가)
export const INLINE_FOOTER_FONT_SCALE = 1.6;

// hold: 시작 연출이 덮고 있는 동안 본문을 비워 두었다가, 걷힌 뒤에 등장 효과와 함께 보여준다(데이터 조회는 화면 쪽에서 이미 시작).
export function Screen({ children, footer, hold = false }: { children: ReactNode; footer?: ReactNode; hold?: boolean }) {
  const { fontScale } = useWindowDimensions();
  const inlineFooter = fontScale >= INLINE_FOOTER_FONT_SCALE;
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      {/* 장식 배경(웹 --wash 연보라 → 흰색). 터치·스크린리더 대상 아님. */}
      <Wash />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* iOS 숫자 키패드에는 완료 키가 없으므로 본문을 끌어 스크롤하면 키보드를 닫는다(APP-011 발견 ⓐ). */}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 화면 블록이 위에서부터 차례로 살짝 떠오른다(장식, 동작 줄이기 시 정적). 나중에 생기는 블록도 같은 효과. */}
          {hold ? null : Children.map(children, (child, i) =>
            isValidElement(child) ? <Reveal index={Math.min(i, 8)}>{child}</Reveal> : child,
          )}
          {footer && inlineFooter ? <View style={{ gap: space.sm, marginTop: space.md }}>{footer}</View> : null}
        </ScrollView>
        {footer && !inlineFooter && !hold ? (
          <FadeInView delay={160} style={styles.footer}>
            {footer}
          </FadeInView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 응답의 isDemo(합성 자료 포함 여부)를 표시한다. HTTP 연결 여부나 AI 사용 여부가 아니다(공통 계약 v0.1.0).
export function DemoBadge({ isDemo }: { isDemo: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: isDemo ? colors.demoBg : colors.liveBg }]}>
      <Text style={[styles.badgeText, { color: isDemo ? colors.demoText : colors.liveText }]}>
        {isDemo ? '시연 데이터' : '실제 자료'}
      </Text>
    </View>
  );
}

// 앱이 어디에 연결됐는지를 모든 화면 상단에 작은 한 줄로 표시한다. 시연 데이터를 실제 결과로 오해하지 않게 하기 위함.
// 서버에 연결돼도 판매글·공식 자료가 합성일 수 있으므로 데이터 출처는 결과마다 따로 표시한다.
// 문구는 그대로 두고, 길면 한 줄로 줄였다가 누르면 전체를 펼친다(D04).
export function ModeBanner({ mode, label }: { mode: 'demo' | 'live'; label: string }) {
  const isDemo = mode === 'demo';
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="연결 정보 전체 보기"
      accessibilityState={{ expanded: open }}
      hitSlop={12}
      onPress={() => setOpen((v) => !v)}
      style={styles.banner}
    >
      <View style={[styles.bannerDot, { backgroundColor: isDemo ? colors.demoText : colors.link }]} />
      <Text numberOfLines={open ? undefined : 1} style={styles.bannerText}>
        {isDemo ? '실제 API 미연결 · 합성 시연 데이터 사용' : `서버 연결: ${label} · 데이터 출처는 결과마다 표시`}
      </Text>
    </Pressable>
  );
}

export function Disclaimer() {
  return (
    <Text style={styles.disclaimer}>
      티켓레이더는 판매글과 공식 안내를 나란히 보여줄 뿐, 티켓 진위·입장 가능 여부·사기나 불법 여부를 확정하지
      않습니다.
    </Text>
  );
}

// 서버 안내 문구를 하나의 작은 목록으로 보여준다. 문구는 바꾸거나 빼지 않는다.
export function NoticeList({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;
  return (
    <View style={{ gap: space.xs }}>
      {notices.map((n) => (
        <View key={n} style={{ flexDirection: 'row', gap: space.sm }}>
          <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.small}>
            •
          </Text>
          <Text style={[styles.small, { flex: 1, lineHeight: 18 }]}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <View style={styles.titleWrap}>
      {/* 글자 제목은 단어별로 떠오른다(홈 제목과 같은 리듬). 스크린리더에는 제목 하나로 읽힌다. */}
      {typeof children === 'string' ? (
        <WordsReveal header text={children} style={styles.title} />
      ) : (
        <Text accessibilityRole="header" style={styles.title}>
          {children}
        </Text>
      )}
      {sub ? <Text style={styles.muted}>{sub}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading({ label }: { label: string }) {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorBox({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Text style={styles.errorTitle}>요청을 처리하지 못했습니다</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <Text style={styles.small}>오류 코드: {error.code}</Text>
      {error.retryable && onRetry ? <Button label="다시 시도" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
}) {
  const primary = variant === 'primary';
  // 눌림: 살짝 작아졌다가 탄성 있게 복귀(120ms). 주요 버튼은 가벼운 진동. 동작 줄이기면 크기 변화 없음.
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pressTo = (v: number) => scale.set(v);
  return (
    <Animated.View style={[pressStyle, primary && !disabled && shadow.cta, { borderRadius: radius.button }]}>
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        if (primary) Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      onPressIn={() => {
        pressTo(withTiming(0.97, { duration: 120, reduceMotion: ReduceMotion.System }));
      }}
      onPressOut={() => {
        pressTo(withSpring(1, { damping: 14, stiffness: 260, reduceMotion: ReduceMotion.System }));
      }}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        // 눌림 상태는 크기 변화와 함께 경계로도 표시한다(색만으로 구분하지 않음).
        pressed && !disabled && { borderWidth: 2, borderColor: primary ? 'rgba(255,255,255,0.55)' : colors.text },
      ]}
    >
      {primary && !disabled ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.decor}>
          <Shimmer />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon ? <Icon name={icon} size={17} color={primary ? colors.primaryText : colors.text} /> : null}
        <Text style={[styles.buttonText, { color: primary ? colors.primaryText : colors.text }]}>{label}</Text>
      </View>
    </Pressable>
    </Animated.View>
  );
}

// 화면 바탕: 위쪽 연보라(웹 --wash)에서 흰색으로.
export function Wash() {
  return (
    <View style={styles.decor} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.wash} stopOpacity={1} />
            <Stop offset="0.55" stopColor="#F8F9FD" stopOpacity={1} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#wash)" />
      </Svg>
    </View>
  );
}

// 주요 버튼 위를 빛줄기가 한 번 지나간다(나타날 때 1회, 반복 없음). 글자 대비를 해치지 않도록 얇고 흐리게.
function Shimmer() {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withDelay(
      520,
      withTiming(1, { duration: 1100, easing: Easing.bezier(0.45, 0, 0.2, 1), reduceMotion: ReduceMotion.System }),
    );
  }, [x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 420 }, { skewX: '-18deg' }],
    opacity: x.value > -1 && x.value < 1 ? 1 : 0,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top: -10, bottom: -10, left: 0, width: 90 }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sh" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.32} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sh)" />
      </Svg>
    </Animated.View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  decor: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none' },
  content: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.lg, paddingBottom: space.xxl },
  footer: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: space.sm,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 24 },
  bannerDot: { width: 8, height: 8, borderRadius: 4 },
  bannerText: { fontSize: 13, lineHeight: 18, color: colors.muted, flexShrink: 1 },
  disclaimer: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  titleWrap: { gap: space.xs },
  title: type.h1,
  sectionTitle: { ...type.title, fontWeight: '700', marginTop: space.sm },
  muted: { fontSize: 15, color: colors.muted, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted },
  body: { fontSize: 16, color: colors.text, lineHeight: 23 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.panel,
    borderWidth: 0,
    padding: space.lg,
    gap: space.sm,
  },
  loading: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.input,
    padding: space.md,
    gap: space.xs,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.errorText },
  errorText: { fontSize: 15, color: colors.text },
  button: {
    minHeight: CTA_HEIGHT,
    borderRadius: radius.button,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // pill 모양 밖으로 CTA 이미지가 새지 않게
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.chip },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    // dashed-pill 시안과 같은 목적(미선택 = 점선)을 네이티브 테두리로 재현. 셰이더 실행 아님.
    borderStyle: 'dashed',
    borderColor: colors.muted,
    backgroundColor: colors.chip,
    justifyContent: 'center',
  },
  chipSelected: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.okBg },
  chipText: { fontSize: 15, color: colors.text },
  chipTextSelected: { color: colors.primary, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 16,
    color: colors.text,
  },
  fieldError: { fontSize: 14, color: colors.errorText },
});
