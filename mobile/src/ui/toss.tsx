import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../components/ui';
import { PressScale } from './motion';
import { colors } from './theme';

// 플랫폼 화면(와이어프레임 v2, 토스 스타일 참고 · 2026-11-03 사용자 확정) 공통 부품.
// 원칙: 화면당 큰 대화체 제목 1개 · 카드/테두리 대신 흰 바탕 목록 + 12px 회색 구역 띠 · 색 글씨 한 줄로 판단 표시 · 하단 넓은 버튼 1개.
// 강조색은 브랜드 남색(colors.primary) 유지. 토스 로고·화면은 복제하지 않는다.
export const t = {
  ink: '#191F28',
  g7: '#4E5968',
  g5: '#8B95A1',
  g4: '#B0B8C1',
  g2: '#E5E8EB',
  g1: '#F2F4F6',
  white: '#FFFFFF',
  primary: colors.primary,
  red: '#E8483B',
  redBg: '#FDECEA',
  okBg: '#E8F3EE',
  ok: '#2E7D5B',
  demoBg: '#FFF1E6',
  demo: '#C2410C',
};
const track = (n: number) => Math.round(n * -0.02 * 100) / 100;
export const tt = StyleSheet.create({
  hero: { fontSize: 26, lineHeight: 35, fontWeight: '700', color: t.ink, letterSpacing: track(26) },
  h2: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: t.ink, letterSpacing: track(18) },
  rowTitle: { fontSize: 16, lineHeight: 23, fontWeight: '600', color: t.ink, letterSpacing: track(16) },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: t.ink, letterSpacing: track(15) },
  desc: { fontSize: 13, lineHeight: 19, fontWeight: '500', color: t.g5, letterSpacing: track(13) },
  value: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: t.ink, letterSpacing: track(16), fontVariant: ['tabular-nums'] },
  bigPrice: { fontSize: 32, lineHeight: 40, fontWeight: '700', color: t.ink, letterSpacing: track(32), fontVariant: ['tabular-nums'] },
});

export const toneColor = (tone: 'good' | 'same' | 'high' | 'unknown') =>
  tone === 'good' ? t.primary : tone === 'high' ? t.red : t.g5;
export const CATEGORY_SHORT = { concert: '콘서트', musical: '뮤지컬', sports: '스포츠' } as const;
export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/** 흰 바탕 화면. 하단 버튼(footer)은 스크롤 밖에 고정. */
export function TScreen({ children, footer, top }: { children: ReactNode; footer?: ReactNode; top?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.white }}>
      {top}
      <ScrollView contentContainerStyle={{ paddingBottom: footer ? 16 : insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 10, gap: 10, backgroundColor: t.white }}>{footer}</View> : null}
    </View>
  );
}

/** 상단 이동 줄: 뒤로 + 오른쪽 동작(선택). 스택 헤더 대신 쓴다. */
export function TNav({ right, onBack }: { right?: ReactNode; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.nav, { paddingTop: insets.top }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={10} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} style={s.navBtn}>
        <Icon name="arrowLeft" size={24} color={t.ink} />
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{right}</View>
    </View>
  );
}

export function Hero({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 6 }}>
      <Text accessibilityRole="header" style={tt.hero}>
        {title}
      </Text>
      {sub ? <Text style={[tt.body, { color: t.g5 }]}>{sub}</Text> : null}
      {children}
    </View>
  );
}

export const Band = () => <View style={{ height: 12, backgroundColor: t.g1 }} />;

export function Section({ title, right, onRight, children, style }: { title?: string; right?: string; onRight?: () => void; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ paddingHorizontal: 24, paddingVertical: 8 }, style]}>
      {title ? (
        <View style={s.secHead}>
          <Text accessibilityRole="header" style={tt.h2}>
            {title}
          </Text>
          {right ? (
            <Text accessibilityRole={onRight ? 'button' : undefined} onPress={onRight} style={[tt.body, { color: t.g5, fontSize: 14 }]}>
              {right}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Row({
  title,
  desc,
  descColor,
  art,
  value,
  value2,
  value2Color,
  thumb,
  icon,
  iconBg,
  iconColor,
  end,
  endNode,
  endColor,
  onPress,
  onEnd,
  endLabel,
  accessibilityLabel,
}: {
  title: string;
  desc?: string;
  descColor?: string;
  value?: string;
  value2?: string;
  value2Color?: string;
  thumb?: string; // 썸네일 칸의 짧은 글자(분류 첫 글자 등)
  art?: ReactNode; // 썸네일 이미지(ShowArt)
  icon?: IconName;
  iconBg?: string;
  iconColor?: string;
  end?: IconName;
  endNode?: ReactNode;
  endColor?: string;
  onPress?: () => void;
  onEnd?: () => void;
  endLabel?: string;
  accessibilityLabel?: string;
}) {
  const body = (
    <>
      {art}
      {thumb !== undefined && !art ? (
        <View style={s.thumb}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: t.g7 }}>{thumb}</Text>
        </View>
      ) : null}
      {icon ? (
        <View style={[s.icon, { backgroundColor: iconBg ?? t.g1 }]}>
          <Icon name={icon} size={20} color={iconColor ?? t.g7} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={tt.rowTitle}>{title}</Text>
        {desc ? <Text style={[tt.desc, descColor ? { color: descColor } : null]}>{desc}</Text> : null}
      </View>
      {value || value2 ? (
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          {value ? <Text style={tt.value}>{value}</Text> : null}
          {value2 ? <Text style={[tt.desc, { fontWeight: '600', color: value2Color ?? t.g5 }]}>{value2}</Text> : null}
        </View>
      ) : null}
      {endNode}
      {end && !endNode ? (
        onEnd ? (
          <Pressable accessibilityRole="button" accessibilityLabel={endLabel} hitSlop={12} onPress={onEnd} style={{ padding: 4 }}>
            <Icon name={end} size={22} color={endColor ?? t.g4} />
          </Pressable>
        ) : (
          <Icon name={end} size={20} color={endColor ?? t.g4} />
        )
      ) : null}
    </>
  );
  return onPress ? (
    <PressScale accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[s.row, { marginHorizontal: -8, paddingHorizontal: 8 }]}>
      {body}
    </PressScale>
  ) : (
    <View style={s.row} accessibilityLabel={accessibilityLabel}>
      {body}
    </View>
  );
}

export function KV({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <View style={s.kv}>
      <Text style={[tt.body, { color: t.g5 }]}>{k}</Text>
      <Text style={[tt.body, { fontWeight: '600', color: color ?? t.ink, flexShrink: 1, textAlign: 'right' }]}>{v}</Text>
    </View>
  );
}

export function CTA({ label, onPress, disabled, busy, tone = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean; tone?: 'primary' | 'grey' }) {
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [s.cta, { backgroundColor: tone === 'grey' ? t.g1 : t.primary }, off && { opacity: 0.4 }, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      {busy ? <ActivityIndicator color={tone === 'grey' ? t.ink : '#fff'} /> : <Text style={{ fontSize: 17, fontWeight: '700', color: tone === 'grey' ? t.ink : '#fff' }}>{label}</Text>}
    </Pressable>
  );
}

export function Note({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[tt.desc, { textAlign: 'center' }, style]}>{children}</Text>;
}

export function DemoChip({ text = '시연 결제 · 실제 돈이 오가지 않아요' }: { text?: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: t.demoBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: t.demo }}>{text}</Text>
    </View>
  );
}

export function Tabs<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 20, paddingVertical: 6 }} accessibilityRole="tablist">
      {items.map((i) => (
        <Pressable key={i.key} accessibilityRole="tab" accessibilityState={{ selected: i.key === value }} hitSlop={8} onPress={() => onChange(i.key)}>
          <Text style={[tt.body, { fontWeight: i.key === value ? '700' : '500', color: i.key === value ? t.ink : t.g5 }]}>{i.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Chips<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((i) => {
        const on = i.key === value;
        return (
          <Pressable key={i.key} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onChange(i.key)} style={[s.chip, on && { backgroundColor: t.ink }]}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: on ? '#fff' : t.g7 }}>{i.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Empty({ text, action, onAction, icon = 'info' }: { text: string; action?: string; onAction?: () => void; icon?: IconName }) {
  return (
    <View style={{ paddingVertical: 32, alignItems: 'center', gap: 12 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={26} color={t.g4} />
      </View>
      <Text style={[tt.body, { color: t.g5, textAlign: 'center' }]}>{text}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={[s.chip, { backgroundColor: t.g1 }]}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorLine({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <View style={{ paddingVertical: 20, alignItems: 'center', gap: 10 }} accessibilityLiveRegion="polite">
      <Text style={[tt.body, { color: t.red, textAlign: 'center' }]}>{text}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={[s.chip, { backgroundColor: t.g1 }]}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <ActivityIndicator color={t.g5} />
    </View>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, minHeight: 48, backgroundColor: t.white },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, minHeight: 56 },
  thumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 12 },
  cta: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 10, backgroundColor: t.g1 },
});
