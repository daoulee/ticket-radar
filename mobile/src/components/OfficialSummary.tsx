import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import type { OfficialContext } from '../contract/types';
import { formatKst, formatWon, POLICY_SCOPE_LABELS, POLICY_TYPE_LABELS } from '../ui/format';
import { colors, MIN_TOUCH } from '../ui/theme';
import { Card, ErrorBox, Loading, styles, type AsyncState } from './common';

// 선택한 공연의 공식 가격·입장 규정 요약. 값은 API 응답을 그대로 보여준다. 세부는 접힘이 기본(제목·출처 종류는 항상 보임).
export function OfficialSummary({
  context,
  onRetry,
}: {
  context: AsyncState<OfficialContext>;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (context.status === 'idle' || context.status === 'loading') return <Loading label="공식 자료를 불러오는 중" />;
  if (context.status === 'error') return <ErrorBox error={context.error} onRetry={onRetry} />;

  const { priceTiers, policies, sourceType } = context.data;
  if (priceTiers.length === 0 && policies.length === 0) {
    return (
      <Card style={{ backgroundColor: colors.unknownBg }}>
        <Text style={styles.body}>이 공연의 공식 가격·입장 규정이 등록되지 않았습니다.</Text>
        <Text style={styles.muted}>판매글은 입력할 수 있지만 가격 비교와 규정 대조는 ‘확인 불가’로 표시됩니다.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={{ minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <Text style={[styles.body, { fontWeight: '700', flex: 1 }]}>
          공식 기준 {sourceType === 'synthetic' ? '(시연용 합성 자료)' : '(공식 공지 스냅샷)'}
        </Text>
        <Text style={[styles.small, { color: colors.link, fontWeight: '700' }]}>{open ? '접기' : '펼치기'}</Text>
      </Pressable>
      {open ? (
        <>
          {priceTiers.map((tier) => (
            <Text key={`${tier.seatGrade}-${tier.showtimeId ?? 'all'}`} style={styles.body}>
              {tier.seatGrade}석 {formatWon(tier.facePrice)}
              {tier.showtimeId ? '' : ' (전 회차)'} · 1매 기본가, 수수료·할인 제외
            </Text>
          ))}
          {policies.map((policy) => (
            <View key={policy.id} style={{ gap: 2 }}>
              <Text style={[styles.small, { fontWeight: '700' }]}>
                {POLICY_TYPE_LABELS[policy.type]} · {policy.title}
              </Text>
              <Text style={styles.muted}>{policy.excerpt}</Text>
              <Text style={styles.small}>{POLICY_SCOPE_LABELS[policy.scope]}</Text>
            </View>
          ))}
          <SourceLine synthetic={sourceType === 'synthetic'} url={priceTiers[0]?.sourceUrl ?? policies[0]?.sourceUrl ?? null} at={priceTiers[0]?.verifiedAt ?? policies[0]?.verifiedAt ?? null} />
        </>
      ) : null}
    </Card>
  );
}

// 공식 출처 링크와 확인 시각. 출처가 없으면 없다고 표시한다.
export function SourceLine({ url, at, synthetic = false }: { url: string | null; at: string | null; synthetic?: boolean }) {
  if (!url) return <Text style={styles.small}>공식 출처 없음 · 확인 불가</Text>;
  return (
    <View style={{ gap: 2 }}>
      <Text
        accessibilityRole="link"
        style={[styles.small, { color: colors.link, textDecorationLine: 'underline' }]}
        onPress={() => void Linking.openURL(url)}
      >
        {synthetic ? '시연용 예시 출처' : '공식 출처 열기'}: {url}
      </Text>
      <Text style={styles.small}>확인 시각: {formatKst(at)}</Text>
    </View>
  );
}
