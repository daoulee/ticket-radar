import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { EventSummary } from '../contract/types';
import { formatKst } from '../ui/format';
import { colors, MIN_TOUCH, radius, shadow, space } from '../ui/theme';
import { DemoBadge, ErrorBox, Loading, styles, type AsyncState } from './common';
import { Reveal } from './motion';

export function EventList({
  events,
  onSelect,
  onRetry,
}: {
  events: AsyncState<EventSummary[]>;
  onSelect: (event: EventSummary) => void;
  onRetry: () => void;
}) {
  if (events.status === 'idle' || events.status === 'loading') return <Loading label="공연 목록을 불러오는 중" />;
  if (events.status === 'error') return <ErrorBox error={events.error} onRetry={onRetry} />;
  if (events.data.length === 0) {
    return <Text style={styles.muted}>검색 결과가 없습니다. 다른 공연명으로 검색하세요.</Text>;
  }

  // 행 중심 목록(REF-L): 한 패널 안에 구분선으로 나눈 행. 기존 정보(모드·장소·회차 수·공식 자료 상태)는 유지한다.
  return (
    <View style={rows.list}>
      {events.data.map((event, i) => (
        <Reveal key={event.id} index={i} delay={80}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${event.title} 선택`}
          onPress={() => onSelect(event)}
          style={({ pressed }) => [rows.row, i > 0 && rows.divider, pressed && { backgroundColor: colors.card }]}
        >
          <View style={{ flex: 1, gap: space.xs }}>
            <Text style={[styles.body, { fontWeight: '700' }]}>{event.title}</Text>
            <Text style={styles.small}>{[event.venue, `회차 ${event.showtimes.length}개`].filter(Boolean).join(' · ')}</Text>
            {event.officialUrl ? (
              <Text style={styles.small}>공식 자료 확인: {formatKst(event.sourceCheckedAt)}</Text>
            ) : (
              <Text style={[styles.small, { color: colors.checkText }]}>
                공식 자료 미등록 · 가격·규정 대조가 보류됩니다
              </Text>
            )}
            <DemoBadge isDemo={event.isDemo} />
          </View>
          <Text accessibilityElementsHidden importantForAccessibility="no" style={rows.chevron}>
            ›
          </Text>
        </Pressable>
        </Reveal>
      ))}
    </View>
  );
}

const rows = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.home,
    ...shadow.card,
  },
  row: { minHeight: MIN_TOUCH + 16, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  chevron: { fontSize: 22, color: colors.muted },
});
