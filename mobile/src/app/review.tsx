import { unknownFields } from '@ticket-radar/shared';
import { StepTabs } from '../components/StepTabs';
import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorBox, NoticeList, Screen, styles } from '../components/common';
import { ReviewForm } from '../components/ReviewForm';
import { BottomSheet, EvidenceChip, FooterNote, Icon, RetryNotice } from '../components/ui';
import type { FieldKey } from '../contract/types';
import { useFlow } from '../state/FlowContext';
import { extractionText } from '../ui/display';
import { colors, MIN_TOUCH, radius, space, type } from '../ui/theme';

// ② 읽은 값 확인(조원 목업 V6oTb 구조 + 웹 테마, APP-015).
// 상단 '판매글 ▾' → 판매글 원문·근거 구절 시트. 값 카드에서 고치고, 하단 '공식 안내와 비교하기'로 재대조한다.
// 직접 입력에서는 서버 추출 응답이 없으므로 모든 후보를 '찾지 못함'으로 둔 빈 폼(값을 지어내지 않음).
export default function ReviewScreen() {
  const { event, context, extraction, entryMode, fields, setFields, result, compare, listingText } = useFlow();
  const [invalidKeys, setInvalidKeys] = useState<FieldKey[]>([]);
  const [sourceSheet, setSourceSheet] = useState(false);

  const manual = entryMode === 'manual';
  if (!event || (!manual && extraction.status !== 'success')) return <Redirect href="/listing" />;
  const loading = result.status === 'loading';
  const response = extraction.status === 'success' ? extraction.data : null;
  const extracted = manual || !response ? unknownFields() : response.extracted;
  // 서버 재시작·만료·원문 변경으로 이전 추출을 쓸 수 없으면 다시 분석해야 한다.
  const expired = result.status === 'error' && result.error.code === 'CHECK_EXPIRED_OR_MISMATCH';
  const quotes = Array.from(new Set(Object.values(extracted).map((f) => f.evidenceQuote).filter((q): q is string => !!q)));
  const compareError = result.status === 'error' ? result.error : null;
  const unknownCount = Object.values(fields).filter((v) => v === null).length;

  async function onCompare() {
    if (await compare()) router.push('/result');
  }


  return (
    <Screen
      footer={
        <>
          {invalidKeys.length > 0 ? <Text style={styles.fieldError}>숫자 입력 형식을 확인하세요.</Text> : null}
          {compareError ? (
            compareError.retryable ? (
              <RetryNotice lead="비교하지 못했어요. 입력값은 그대로 있어요." message={compareError.message} code={compareError.code} />
            ) : (
              <ErrorBox error={compareError} />
            )
          ) : null}
          {expired ? <Button label="판매글 다시 분석하기" variant="secondary" onPress={() => router.navigate('/listing')} /> : null}
          {unknownCount > 0 ? (
            <View style={r.notice}>
              <Text style={[type.sub, { color: colors.conflictText }]}>
                확인 불가 항목 {unknownCount}개가 있어요. 그대로 대조하면 관련 결과는 ‘확인 불가’ 또는 ‘가격 비교 보류’로 표시돼요.
              </Text>
            </View>
          ) : null}
          <Button label="판매글 다시 입력" variant="secondary" onPress={() => router.navigate('/listing')} disabled={loading} />
          <Button
            label={loading ? '비교하는 중…' : compareError?.retryable ? '다시 시도' : '이 값으로 공식 자료와 대조'}
            onPress={onCompare}
            disabled={loading || invalidKeys.length > 0}
          />
        </>
      }
    >
      <Stack.Screen
        options={{
          title: '읽은 값을 확인해 주세요',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="판매글 원문 다시 보기"
              onPress={() => setSourceSheet(true)}
              style={r.sourceBtn}
            >
              <Text style={[type.caption, { color: colors.text, fontWeight: '600' }]}>판매글</Text>
              <Icon name="chevronDown" size={12} color={colors.muted} />
            </Pressable>
          ),
        }}
      />
      <StepTabs current={3} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="info" size={14} color={colors.muted} />
        <Text style={[type.sub, { flexShrink: 1 }]}>
          {manual ? '판매글과 확인한 내용을 직접 입력해 주세요. 모르는 값은 ‘모름’으로 두면 해당 비교를 보류해요.' : '읽은 값이에요. 틀린 곳을 고쳐 주세요.'}
        </Text>
      </View>
      <Text style={styles.small} testID="extraction-mode">
        추출 방식:{' '}
        <Text style={{ fontWeight: '700' }}>{manual ? 'AI 추출 없음 · 사용자가 직접 입력' : extractionText(response?.extraction)}</Text>
      </Text>
      <NoticeList notices={response && !manual ? response.notices : []} />
      <ReviewForm
        // 새로 추출하거나 휴지통으로 되돌리면 입력 칸을 다시 채운다.
        key={`${manual ? 'manual' : response?.checkId}`}
        event={event}
        manual={manual}
        context={context.status === 'success' ? context.data : null}
        extracted={extracted}
        fields={fields}
        onChange={(next, invalid) => {
          setFields(next);
          setInvalidKeys(invalid);
        }}
      />
      <FooterNote />

      <BottomSheet visible={sourceSheet} title="판매글 원문" onClose={() => setSourceSheet(false)}>
        {/* 원문은 일반 텍스트로만 표시한다. 글 안의 스크립트·지시문은 실행되지 않는다. */}
        <Text style={type.body}>{listingText}</Text>
        {quotes.length > 0 ? (
          <View style={{ gap: space.sm }}>
            <Text style={type.caption}>{response?.extraction.method === 'model' ? 'AI가 근거로 본 구절' : '근거로 본 구절'}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {quotes.map((q) => (
                <EvidenceChip key={q} quote={q} prefix="원문" />
              ))}
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const r = StyleSheet.create({
  notice: { backgroundColor: colors.conflictBg, borderRadius: 12, padding: 12 },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    minHeight: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    marginRight: 4,
    minWidth: MIN_TOUCH,
    justifyContent: 'center',
  },
});
