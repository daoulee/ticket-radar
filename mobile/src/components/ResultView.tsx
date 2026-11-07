import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CheckResponse, EventSummary, Finding, FindingStatus } from '../contract/types';
import { displayValue, extractionText, FIELD_LABELS, FIELD_ORDER, provenanceLines, valuesOf } from '../ui/display';
import { sameListingFields } from '../ui/fields';
import { FINDING_STATUS_LABELS, formatKst, formatSignedPercent, formatSignedWon, formatWon } from '../ui/format';
import { colors, MIN_TOUCH, radius, shadow, type } from '../ui/theme';
import { Card, DemoBadge, Disclaimer, NoticeList, SectionTitle, styles } from './common';
import { Emphasis, Reveal } from './motion';
import { Icon } from './ui';
import { SourceLine } from './OfficialSummary';

const STATUS_COLORS: Record<FindingStatus, { bg: string; fg: string }> = {
  conflict: { bg: colors.conflictBg, fg: colors.conflictText },
  needs_check: { bg: colors.checkBg, fg: colors.checkText },
  matched: { bg: colors.okBg, fg: colors.okText },
  unverifiable: { bg: colors.unknownBg, fg: colors.unknownText },
  comparison_held: { bg: colors.unknownBg, fg: colors.unknownText },
};

// 대조 결과 표시 전용. 차액·비율·상태는 모두 응답에 담긴 값을 그대로 보여준다(앱에서 계산하지 않음).
export function ResultView({
  result,
  event,
  listingText,
}: {
  result: CheckResponse;
  event: EventSummary;
  listingText: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  // 대조에 사용한 값은 접을 수 있지만 기본은 펼침('수정' 표시를 바로 확인).
  const [showApplied, setShowApplied] = useState(true);
  const manual = result.extraction.method === 'manual';
  const extractedValues = valuesOf(result.extracted);
  // '사용자 수정' 판정(TODO 이월, APP-017): AI가 읽은 값을 바꾼 것(수정)과 AI가 못 찾은 빈칸을 채운 것(직접 채움)을 구분한다.
  const applied = result.appliedFields;
  const keys = applied ? (Object.keys(applied) as (keyof typeof applied)[]) : [];
  const editedCount = !manual && applied ? keys.filter((k) => extractedValues[k] !== null && applied[k] !== extractedValues[k]).length : 0;
  const filledCount = !manual && applied ? keys.filter((k) => extractedValues[k] === null && applied[k] !== null).length : 0;
  const usedEditedValues = editedCount > 0 && applied !== null && !sameListingFields(applied, extractedValues);
  const pc = result.priceComparison;

  // 목업 ③ 머리말: '같은 조건으로 대조함(matched)'이 아닌 서버 항목 수. 기준을 함께 적는다(D: 집계 기준 명시).
  const attention = result.findings.filter((f) => f.status !== 'matched').length;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text accessibilityRole="header" style={[type.h2, { fontSize: 22 }]}>
          공식 자료 대조 결과
        </Text>
        <Text style={type.caption}>
          {attention > 0
            ? `확인이 필요한 부분 ${attention}가지 · 공식 안내와 다르거나, 확인할 수 없거나, 추가 확인이 필요한 항목 기준`
            : '확인이 필요한 부분을 찾지 못했어요. 거래 전 예매처 규정은 꼭 확인하세요.'}
        </Text>
      </View>
      {/* 핵심 수치 또는 보류 이유를 먼저(REF-F). 숫자는 응답 값을 그대로 쓴다. */}
      <SectionTitle>가격 비교</SectionTitle>
      {!pc.held ? (
        <Card style={{ backgroundColor: colors.surface, borderRadius: radius.home, padding: 20, ...shadow.float }}>
          <Text style={styles.small}>
            {displayValue('showtimeId', pc.showtimeId, event)} · {pc.seatGrade}석 · 1매 기본가(수수료·할인 제외) 기준
          </Text>
          {/* 값은 응답 그대로. 숫자를 세어 올리지 않고(D11) 살짝 커지며 나타나는 강조만 준다. */}
          <Emphasis delay={180}>
            <Text style={[type.price, { color: colors.text }]}>{`${formatSignedWon(pc.diff)} (${formatSignedPercent(pc.ratePercent)})`}</Text>
          </Emphasis>
          <Text style={styles.small}>공식 기본가 대비 판매가 차이</Text>
          <Row label="공식 기본가" value={formatWon(pc.facePrice)} />
          <Row label="판매가" value={formatWon(pc.listingPrice)} />
          <SourceLine synthetic={result.provenance.officialSourceType === 'synthetic'} url={pc.sourceUrl} at={pc.verifiedAt} />
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.unknownBg, borderLeftWidth: 4, borderLeftColor: colors.muted }}>
          <Text style={[styles.body, { fontWeight: '700' }]}>가격 비교 보류</Text>
          <Text style={styles.body}>{pc.reason}</Text>
        </Card>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <DemoBadge isDemo={result.isDemo} />
        <Text style={styles.small}>대조 시각 {formatKst(result.checkedAt)}</Text>
      </View>
      {usedEditedValues ? (
        <Text style={[styles.small, { color: colors.okText, fontWeight: '700' }]}>
          사용자가 수정한 값으로 다시 대조한 결과입니다.
        </Text>
      ) : null}
      {filledCount > 0 ? (
        <Text style={[styles.small, { color: colors.okText, fontWeight: '700' }]}>AI가 찾지 못한 {filledCount}개 항목은 사용자가 직접 채운 값이에요.</Text>
      ) : null}
      {manual ? (
        <Text style={[styles.small, { color: colors.okText, fontWeight: '700' }]}>
          AI 추출 없이 사용자가 직접 입력한 값으로 대조한 결과입니다.
        </Text>
      ) : null}
      <View style={{ gap: 2 }}>
        <Text style={styles.small} testID="result-extraction">
          추출 방식: {extractionText(result.extraction)}
        </Text>
        {provenanceLines(result.provenance).map((line) => (
          <Text key={line} style={styles.small}>
            {line}
          </Text>
        ))}
      </View>
      {/* 서버 안내 문구는 모두 그대로, 작은 목록 하나로 보여준다. */}
      <NoticeList notices={result.notices} />

      <SectionTitle>확인할 점 {result.findings.length > 0 ? `(${result.findings.length})` : ''}</SectionTitle>
      {result.findings.length === 0 ? (
        <Text style={styles.muted}>표시할 대조 항목이 없습니다. 위 안내를 확인하세요.</Text>
      ) : (
        result.findings.map((f, i) => (
          <Reveal key={f.id} index={i} delay={200}>
            <FindingCard finding={f} synthetic={result.provenance.officialSourceType === 'synthetic'} />
          </Reveal>
        ))
      )}

      <SectionTitle>대조에 사용한 값</SectionTitle>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showApplied }}
        onPress={() => setShowApplied((v) => !v)}
        style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
      >
        <Text style={{ color: colors.link, fontSize: 15, fontWeight: '700' }}>
          {showApplied ? '사용한 값 접기' : '사용한 값 펼치기'}
        </Text>
      </Pressable>
      {showApplied ? (
        <Card>
        {result.appliedFields ? (
          // 원래 추출 후보와 다른 값에는 '수정' 표시를 붙여 구분한다.
          FIELD_ORDER.map((key) => {
            const changed = !manual && result.appliedFields![key] !== extractedValues[key];
            return (
              <Row
                key={key}
                label={FIELD_LABELS[key]}
                value={`${displayValue(key, result.appliedFields![key], event)}${changed ? ' (수정)' : ''}`}
              />
            );
          })
        ) : (
          <Text style={styles.muted}>대조에 사용한 값이 응답에 없습니다.</Text>
        )}
        </Card>
      ) : null}

      <SectionTitle>판매글 원문</SectionTitle>
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showOriginal }}
          onPress={() => setShowOriginal((v) => !v)}
          style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.link, fontSize: 15, fontWeight: '700' }}>
            {showOriginal ? '원문 접기' : '원문 전체 보기'}
          </Text>
        </Pressable>
        {/* 원문은 일반 텍스트로만 표시한다. 글 안의 스크립트·지시문은 실행되지 않는다. */}
        {showOriginal ? <Text style={styles.body}>{listingText}</Text> : null}
      </Card>

      <Disclaimer />
    </View>
  );
}

// 목업 ③ 결과 항목: 제목 + 상태 배지 → 판매글 인용(큰 글씨) → 공식 안내 블록(문구·출처·확인일) → 이유.
function FindingCard({ finding, synthetic }: { finding: Finding; synthetic: boolean }) {
  const c = STATUS_COLORS[finding.status];
  const icon = finding.status === 'conflict' ? 'alert' : finding.status === 'matched' ? 'check' : 'search';
  return (
    <View style={[fc.card, { borderLeftWidth: 4, borderLeftColor: finding.status === 'conflict' ? colors.hot : finding.status === 'needs_check' ? colors.checkText : colors.chipSelected }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Text style={[type.title, { fontWeight: '700', flex: 1 }]}>{finding.title}</Text>
        <View style={[fc.badge, { backgroundColor: c.bg }]}>
          <Icon name={icon} size={12} color={c.fg} />
          <Text style={{ color: c.fg, fontWeight: '700', fontSize: 12 }}>{FINDING_STATUS_LABELS[finding.status]}</Text>
        </View>
      </View>
      {finding.listingQuote ? (
        <Text style={fc.quote} accessibilityLabel={`판매글 원문: ${finding.listingQuote}`}>
          “{finding.listingQuote}”
        </Text>
      ) : (
        <Text style={styles.small}>판매글 원문: 해당 문구 없음</Text>
      )}
      <View style={fc.official}>
        <Text style={[type.caption, { fontWeight: '700' }]}>공식 안내</Text>
        <Text style={type.body}>{finding.officialExcerpt ?? '공식 자료 없음'}</Text>
        <SourceLine synthetic={synthetic} url={finding.sourceUrl} at={finding.checkedAt} />
      </View>
      <Text style={[type.body, { color: colors.muted }]}>{finding.reason}</Text>
    </View>
  );
}

const fc = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.home,
    padding: 18,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  quote: { fontSize: 20, lineHeight: 28, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  official: { backgroundColor: 'rgba(30,58,138,0.06)', borderRadius: 14, padding: 14, gap: 6 },
});

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={[styles.body, strong && { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}
