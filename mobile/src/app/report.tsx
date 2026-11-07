import * as Print from 'expo-print';
import { Redirect, router, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, DemoBadge, Screen } from '../components/common';
import { FooterNote, Icon, InlineError, openUrl, Pill } from '../components/ui';
import { newClientRequestId, type ReportReceipt } from '../contract/reports';
import {
  attentionFindings,
  buildReportHtml,
  buildReportSummaryText,
  maskContacts,
  OFFICIAL_REPORT_LINKS,
} from '../report/reportDoc';
import { toApiError } from '../api/client';
import { useFlow } from '../state/FlowContext';
import { formatKst } from '../ui/format';
import { colors, MIN_TOUCH, radius, space, type } from '../ui/theme';

// ④ 제보 근거 정리 + 주최 측 제보(기획 명세 P0 '제보', APP-021).
// 대조 결과 응답 값만으로 근거를 보여주고, 사용자가 확인·동의한 내용만 주최 측 제보함으로 보낸다.
// 같은 화면에서 다시 눌러도 clientRequestId 가 같아 중복 제보가 생기지 않는다.
// 공식 신고는 링크와 붙여 넣을 요약만 제공한다(자동 제출 없음). PDF 저장은 부차 행동.
type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'error' };
type SendState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'done'; receipt: ReportReceipt }
  | { status: 'error'; message: string; retryable: boolean };

export default function ReportScreen() {
  const { api, event, listingText, result } = useFlow();
  const [save, setSave] = useState<SaveState>({ status: 'idle' });
  const [send, setSend] = useState<SendState>({ status: 'idle' });
  const [listingUrl, setListingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const requestId = useMemo(() => newClientRequestId(), []);
  if (!event || result.status !== 'success') return <Redirect href="/result" />;
  const data = result.data;
  const items = attentionFindings(data);

  async function onSave() {
    if (!event) return;
    setSave({ status: 'saving' });
    try {
      const { uri } = await Print.printToFileAsync({ html: buildReportHtml(data, event, listingText) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
      }
      setSave({ status: 'idle' });
    } catch {
      setSave({ status: 'error' });
    }
  }

  async function onShareSummary() {
    if (!event) return;
    try {
      await Share.share({ message: buildReportSummaryText(data, event, listingText) });
    } catch {
      // 공유 시트를 닫거나 실패해도 화면 상태는 바꾸지 않는다.
    }
  }

  async function onSend() {
    if (!event || !consent) return;
    setSend({ status: 'sending' });
    try {
      const receipt = await api.submitReport({
        clientRequestId: requestId,
        eventId: event.id,
        listingText,
        listingUrl: listingUrl.trim() || null,
        listingPrice: data.appliedFields?.price ?? null,
        description: description.trim(),
        checkId: data.checkId,
        findings: items.map((f) => ({
          title: f.title,
          status: f.status,
          listingQuote: f.listingQuote,
          officialExcerpt: f.officialExcerpt,
          sourceUrl: f.sourceUrl,
        })),
        isDemo: data.isDemo,
        consent: true,
      });
      setSend({ status: 'done', receipt });
    } catch (e) {
      const err = toApiError(e);
      setSend({ status: 'error', message: err.message, retryable: err.retryable });
    }
  }

  const sent = send.status === 'done';
  return (
    <Screen
      footer={
        <>
          {send.status === 'error' ? <InlineError text={`제보를 보내지 못했어요. ${send.message}`} /> : null}
          {sent ? (
            <Button label="주최 측 제보함에서 보기" icon="chevronRight" onPress={() => router.push('/admin')} />
          ) : (
            <Button
              label={send.status === 'sending' ? '제보를 보내는 중…' : send.status === 'error' ? '다시 보내기' : '주최 측에 제보 보내기'}
              icon="check"
              onPress={onSend}
              disabled={!consent || send.status === 'sending'}
            />
          )}
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Pill label={save.status === 'saving' ? '만드는 중…' : 'PDF로 저장'} icon="file" onPress={onSave} />
            </View>
            <View style={{ flex: 1 }}>
              <Pill label="신고용 요약 공유" icon="external" onPress={onShareSummary} />
            </View>
          </View>
          {save.status === 'error' ? <InlineError text="PDF를 만들지 못했어요. 다시 시도해 주세요." /> : null}
        </>
      }
    >
      <Stack.Screen options={{ title: '제보 근거 정리' }} />
      {save.status === 'saving' ? (
        <View style={rp.saving} accessibilityLiveRegion="polite">
          <Text style={type.body}>제보 근거를 정리하는 중…</Text>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {sent ? (
        <View style={rp.done} accessibilityLiveRegion="polite">
          <Icon name="check" size={18} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[type.body, { fontWeight: '700' }]}>
              {send.receipt.duplicate ? '이미 보낸 제보예요' : '주최 측 제보함에 접수됐어요'}
            </Text>
            <Text style={type.caption}>
              접수 번호 {send.receipt.reportId.slice(0, 8)} · {formatKst(send.receipt.createdAt)}
              {api.mode === 'demo' ? ' · 시연 제보함(앱을 끄면 사라져요)' : ''}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={rp.card}>
        <Text accessibilityRole="header" style={[type.h2, { fontSize: 19 }]}>
          확인이 필요한 부분 — 제보 근거
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          <Text style={type.caption}>
            {event.title} · {formatKst(data.checkedAt)} 확인 · 티켓레이더
          </Text>
          {data.isDemo ? <DemoBadge isDemo /> : null}
        </View>
        <View style={rp.inner}>
          <Text style={[type.caption, { fontWeight: '700' }]}>판매글 원문 (연락처는 가려짐)</Text>
          <Text style={type.body}>{maskContacts(listingText)}</Text>
        </View>
        {items.length === 0 ? (
          <Text style={[type.sub]}>확인이 필요한 부분이 없어 담을 내용이 적어요. 그래도 보낼 수 있어요.</Text>
        ) : (
          items.map((f) => (
            <View key={f.id} style={rp.item}>
              <Row label="판매글" value={`“${f.listingQuote ?? '해당 문구 없음'}”`} strong />
              <Row label="공식 안내" value={f.officialExcerpt ?? '공식 자료 없음'} />
              <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={[type.caption, { width: 56 }]}>출처</Text>
                {f.sourceUrl ? (
                  <Text accessibilityRole="link" onPress={() => openUrl(f.sourceUrl)} style={[type.caption, { color: colors.link, flexShrink: 1 }]}>
                    공식 안내 · {formatKst(f.checkedAt)}
                  </Text>
                ) : (
                  <Text style={type.caption}>공식 출처 없음 · 확인 불가</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {!sent ? (
        <View style={rp.card}>
          <Text accessibilityRole="header" style={[type.h2, { fontSize: 17 }]}>
            주최 측에 함께 보낼 내용
          </Text>
          <TextInput
            accessibilityLabel="판매글 주소 (선택)"
            placeholder="판매글 주소 (선택) · https://…"
            placeholderTextColor={colors.faint}
            value={listingUrl}
            onChangeText={setListingUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={rp.input}
          />
          <TextInput
            accessibilityLabel="제보 설명 (선택)"
            placeholder="제보 설명 (선택) · 연락처는 자동으로 가려져요"
            placeholderTextColor={colors.faint}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
            style={[rp.input, { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' }]}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            accessibilityLabel="보낼 내용을 확인했고 주최 측 제보함으로 보내는 데 동의해요"
            onPress={() => setConsent((c) => !c)}
            style={rp.consent}
          >
            <View style={[rp.box, consent && rp.boxOn]}>{consent ? <Icon name="check" size={14} color="#fff" /> : null}</View>
            <Text style={[type.sub, { flex: 1, color: colors.text }]}>
              보낼 내용(위 근거·주소·설명, 연락처 가림)을 확인했고 주최 측 제보함으로 보내는 데 동의해요.
            </Text>
          </Pressable>
          <Text style={type.caption}>
            판매글 주소는 글자로만 저장하고 서버가 열어 보지 않아요. 공개되지 않고, 담당 공연의 주최 측 계정만 볼 수 있어요.
          </Text>
        </View>
      ) : null}

      <View style={rp.card}>
        <Text accessibilityRole="header" style={[type.h2, { fontSize: 17 }]}>
          공식 신고·문의 경로
        </Text>
        <Text style={type.sub}>
          티켓레이더는 어디에도 자동으로 신고하지 않아요. 아래 사이트에서 접수 범위를 확인하고, ‘신고용 요약 공유’로 만든 글을 붙여 넣으세요.
        </Text>
        {event.officialUrl ? <Pill label="예매처 공지 열기" icon="external" tone="link" onPress={() => openUrl(event.officialUrl)} /> : null}
        {OFFICIAL_REPORT_LINKS.map((l) => (
          <Pill key={l.url} label={`${l.label} · ${l.note}`} icon="external" tone="link" onPress={() => openUrl(l.url)} />
        ))}
      </View>
      <FooterNote />
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <Text style={[type.caption, { width: 56 }]}>{label}</Text>
      <Text style={[type.sub, { color: colors.text, flex: 1 }, strong && { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const rp = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.home,
    padding: 18,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  inner: { backgroundColor: colors.wash, borderRadius: 14, padding: 14, gap: 6 },
  item: { gap: 6, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  saving: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    minHeight: 52,
  },
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.chip,
    borderRadius: 16,
    padding: 16,
  },
  input: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
  consent: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: MIN_TOUCH, paddingVertical: 6 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
