import { useEffect, type ReactNode } from 'react';
import { InputAccessoryView, Keyboard, Linking, Modal, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { colors, MIN_TOUCH, radius, shadow, space, type } from '../ui/theme';

// 조원 목업(⓪~④·부속) 화면 부품을 웹 테마 토큰으로 구현(APP-015). 새 아이콘 패키지 없이 단순 선 아이콘을 직접 그린다.

export type IconName =
  | 'search'
  | 'trash'
  | 'plus'
  | 'image'
  | 'x'
  | 'chevronDown'
  | 'chevronRight'
  | 'undo'
  | 'pencil'
  | 'info'
  | 'alert'
  | 'external'
  | 'refresh'
  | 'arrowLeft'
  | 'file'
  | 'lock'
  | 'help'
  | 'check'
  | 'sparkle'
  | 'heart'
  | 'heartFill'
  | 'bell'
  | 'home'
  | 'receipt'
  | 'menu'
  | 'shield'
  | 'flag'
  | 'user';

export function Icon({ name, size = 16, color = colors.text, stroke = 2 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  const p = { stroke: color, strokeWidth: stroke, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<IconName, ReactNode> = {
    search: (<><Circle cx={11} cy={11} r={6.5} {...p} /><Path d="M20 20l-4.2-4.2" {...p} /></>),
    trash: (<><Path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" {...p} /><Path d="M10 11v6M14 11v6" {...p} /></>),
    plus: <Path d="M12 5v14M5 12h14" {...p} />,
    image: (<><Rect x={4} y={5} width={16} height={14} rx={2.5} {...p} /><Circle cx={9} cy={10} r={1.5} {...p} /><Path d="M5 17l4.5-4.5 3.5 3.5 2.5-2.5L19 17" {...p} /></>),
    x: <Path d="M6 6l12 12M18 6L6 18" {...p} />,
    chevronDown: <Polyline points="6 9 12 15 18 9" {...p} />,
    chevronRight: <Polyline points="9 6 15 12 9 18" {...p} />,
    undo: (<><Path d="M9 14L4 9l5-5" {...p} /><Path d="M4 9h10a6 6 0 010 12h-3" {...p} /></>),
    pencil: (<><Path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z" {...p} /></>),
    info: (<><Circle cx={12} cy={12} r={9} {...p} /><Path d="M12 11v6M12 7.5v.5" {...p} /></>),
    alert: (<><Path d="M12 3l9.5 17h-19L12 3z" {...p} /><Path d="M12 10v4M12 17v.5" {...p} /></>),
    external: (<><Path d="M14 4h6v6M20 4l-9 9" {...p} /><Path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" {...p} /></>),
    refresh: (<><Path d="M20 12a8 8 0 11-2.3-5.6" {...p} /><Path d="M20 4v5h-5" {...p} /></>),
    arrowLeft: <Path d="M19 12H5M11 6l-6 6 6 6" {...p} />,
    file: (<><Path d="M6 3h8l4 4v14H6z" {...p} /><Path d="M14 3v4h4M9 13h6M9 17h6" {...p} /></>),
    lock: (<><Rect x={5} y={11} width={14} height={9} rx={2} {...p} /><Path d="M8 11V8a4 4 0 018 0v3" {...p} /></>),
    help: (<><Circle cx={12} cy={12} r={9} {...p} /><Path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17v.5" {...p} /></>),
    check: <Polyline points="5 12.5 10 17 19 7" {...p} />,
    sparkle: (<><Path d="M12 4l1.8 4.6L18.5 10l-4.7 1.6L12 16l-1.8-4.4L5.5 10l4.7-1.4z" {...p} /></>),
    heart: <Path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" {...p} />,
    heartFill: <Path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" {...p} fill={color} />,
    bell: (<><Path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z" {...p} /><Path d="M10 20.5a2 2 0 004 0" {...p} /></>),
    home: (<><Path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" {...p} /></>),
    receipt: (<><Path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" {...p} /><Path d="M9 8.5h6M9 12h6M9 15.5h4" {...p} /></>),
    menu: <Path d="M4 7h16M4 12h16M4 17h16" {...p} />,
    shield: (<><Path d="M12 3.5l7 2.5v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-2.5z" {...p} /><Polyline points="8.5 12 11 14.5 15.5 10" {...p} /></>),
    flag: (<><Path d="M6 21V4M6 4.5h11l-2 4 2 4H6" {...p} /></>),
    user: (<><Circle cx={12} cy={8.5} r={4} {...p} /><Path d="M4.5 20a7.5 7.5 0 0115 0" {...p} /></>),
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {shapes[name]}
    </Svg>
  );
}

// 원형 아이콘 버튼(목업: 되돌리기 연한 원, 편집 검은 원, 휴지통 회색 원). 터치 영역은 최소 48 확보.
export function CircleButton({
  icon,
  label,
  onPress,
  tone = 'light',
  size = 36,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'light' | 'dark' | 'grey';
  size?: number;
  disabled?: boolean;
}) {
  const bg = tone === 'dark' ? colors.text : tone === 'grey' ? colors.chip : 'rgba(255,255,255,0.75)';
  const fg = tone === 'dark' ? '#FFFFFF' : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={(MIN_TOUCH - size) / 2}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      <Icon name={icon} size={size * 0.46} color={fg} />
    </Pressable>
  );
}

// 작은 알약 버튼(목업: 공식 안내 원문 보기·다시 시도·다른 이미지 올리기·닫기)
export function Pill({
  label,
  icon,
  onPress,
  tone = 'grey',
  accessibilityLabel,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: 'grey' | 'link' | 'dark' | 'white';
  accessibilityLabel?: string;
}) {
  const t = {
    grey: { bg: colors.chip, fg: colors.text },
    link: { bg: colors.liveBg, fg: colors.link },
    dark: { bg: colors.text, fg: '#FFFFFF' },
    white: { bg: colors.surface, fg: colors.text },
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [s.pill, { backgroundColor: t.bg }, pressed && { opacity: 0.8 }]}
    >
      {icon ? <Icon name={icon} size={14} color={t.fg} /> : null}
      <Text style={[s.pillText, { color: t.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function openUrl(url: string | null) {
  if (url) Linking.openURL(url).catch(() => {});
}

// 회색 자리 표시(로딩). 은은하게 깜빡인다(실제 요청 중에만 표시, 동작 줄이기 시 정지).
export function Skeleton({ lines = 3, style }: { lines?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.55);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }), -1, true);
  }, [o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[s.skelCard, a, style]} accessibilityLabel="불러오는 중" accessible>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={[s.skelLine, { width: i === 0 ? '38%' : i === lines - 1 ? '62%' : '92%' }]} />
      ))}
    </Animated.View>
  );
}

// 아래에서 올라오는 시트(목업: 공연 선택·판매글 원문·올린 이미지). 배경을 누르거나 '닫기'로 닫는다.
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  closeLabel = '닫기',
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="시트 닫기" style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, space.lg) }]} accessibilityViewIsModal>
        <View style={s.grabber} />
        <Text accessibilityRole="header" style={[type.h2, { fontSize: 18 }]}>
          {title}
        </Text>
        {children}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pill label={closeLabel} icon="x" tone="dark" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

// 하단 고정 문구(목업 공통)
export function FooterNote() {
  return <Text style={[type.caption, { textAlign: 'center' }]}>이 결과는 참고용이며 최종 판단은 사용자가 합니다.</Text>;
}

// 줄 단위 오류 안내(목업: 빨간 i + 문구)
export function InlineError({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityRole="alert">
      <Icon name="info" size={14} color={colors.errorText} />
      <Text style={[type.sub, { color: colors.errorText, flexShrink: 1 }]}>{text}</Text>
    </View>
  );
}

// 재시도할 수 있는 요청 실패(목업: '연결하지 못했어요. 입력한 내용은 그대로 있어요.'). 서버 문구와 코드는 그대로 함께 보여준다.
export function RetryNotice({ lead, message, code }: { lead: string; message: string; code: string }) {
  return (
    <View style={{ gap: 2, alignItems: 'center' }} accessibilityRole="alert">
      <InlineError text={lead} />
      <Text style={[type.caption, { textAlign: 'center' }]}>{message}</Text>
      <Text style={[type.caption, { textAlign: 'center' }]}>오류 코드: {code}</Text>
    </View>
  );
}

// 근거 칩: 근거: “원문 구절”
export function EvidenceChip({ quote, prefix = '근거' }: { quote: string; prefix?: string }) {
  return (
    <View style={s.evidence}>
      <Text style={[type.caption, { color: colors.text }]} numberOfLines={2}>
        {prefix}: “{quote}”
      </Text>
    </View>
  );
}

// 반투명 흰 카드(목업의 서리 낀 카드). 웹 테마의 흰 카드 + 은은한 그림자.
export function Frost({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.frost, style]}>{children}</View>;
}

const s = StyleSheet.create({
  pill: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.28 },
  skelCard: { borderRadius: radius.home, padding: 20, gap: 12, backgroundColor: 'rgba(30,58,138,0.06)' },
  skelLine: { height: 12, borderRadius: 6, backgroundColor: 'rgba(30,58,138,0.10)' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11,18,32,0.32)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
    ...shadow.float,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 4 },
  evidence: { alignSelf: 'flex-start', backgroundColor: colors.chip, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, maxWidth: '100%' },
  frost: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: radius.home, padding: 18, gap: 12, ...shadow.card },
});

// 숫자 키패드 위 '완료' 막대(iOS 숫자 키패드에는 닫기 키가 없음, TODO 이월 APP-017).
// 숫자 입력칸에 inputAccessoryViewID={NUMPAD_DONE_ID} 를 주고, 화면에 <NumpadDone /> 를 한 번 둔다. Android 에서는 아무것도 그리지 않는다.
export const NUMPAD_DONE_ID = 'ticketradar-numpad-done';
export function NumpadDone() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={NUMPAD_DONE_ID}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#F2F4F6', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D1D6DB', paddingHorizontal: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="키보드 닫기" onPress={() => Keyboard.dismiss()} style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>완료</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
