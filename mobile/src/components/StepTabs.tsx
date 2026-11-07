import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../ui/theme';

// 웹 서비스 화면 상단의 1~4 단계 탭(공연 선택 · 판매글 입력 · 추출값 확인 · 대조 결과)과 같은 표시(APP-018).
// 현재 단계는 흰 알약 + 남색 번호, 지난 단계는 연한 번호, 남은 단계는 흐린 글자. 표시 전용(누르는 버튼 아님).
const STEPS = ['공연 선택', '판매글 입력', '추출값 확인', '대조 결과'];

export function StepTabs({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <View
      style={s.wrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${STEPS.length}단계 중 ${current}단계, ${STEPS[current - 1]}`}
    >
      {STEPS.map((label, i) => {
        const n = i + 1;
        const on = n === current;
        const done = n < current;
        return (
          <View key={label} style={[s.tab, on && s.tabOn]}>
            <View style={[s.num, on ? s.numOn : done ? s.numDone : null]}>
              <Text style={[s.numText, (on || done) && { color: '#fff' }]}>{n}</Text>
            </View>
            <Text numberOfLines={1} style={[s.label, on ? { color: colors.text, fontWeight: '700' } : !done && { color: colors.faint }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: 'rgba(64,72,144,0.07)', borderRadius: radius.pill, padding: 4, gap: 2 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: radius.pill },
  tabOn: { backgroundColor: colors.surface, ...shadow.card },
  num: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.chipSelected },
  numOn: { backgroundColor: colors.primary },
  numDone: { backgroundColor: colors.accent },
  numText: { fontSize: 11, fontWeight: '800', color: colors.muted },
  label: { fontSize: 11, color: colors.muted, letterSpacing: -0.3 },
});
