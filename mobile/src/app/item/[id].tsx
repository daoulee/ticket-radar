import { router, useLocalSearchParams } from 'expo-router';
import { Appear, CheckDraw, Chevron, Marker, Reveal } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import { BottomSheet, Icon, openUrl } from '../../components/ui';
import { newClientRequestId } from '../../contract/reports';
import { useFlow } from '../../state/FlowContext';
import type { ListingDetail } from '../../market/api';
import { deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import { Band, CTA, ErrorLine, Loading, Note, Row, Section, t, TNav, toneColor, TScreen, tt, won } from '../../ui/toss';

// 매물 상세(V2-3): 큰 가격 + 정가 대비 한 줄 → 확인이 필요해요(안심 확인 근거) → 판매자·안전거래 → 구매하기.
type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: ListingDetail };

export default function ItemScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const { api, token, me } = useMarket();
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [open, setOpen] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  // 신고: 기존 제보 API(server reports.ts)로 보낸다. 같은 화면에서 다시 보내도 한 건(clientRequestId).
  const { api: checkApi } = useFlow();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportState, setReportState] = useState<{ s: 'idle' | 'busy' | 'done' } | { s: 'error'; m: string }>({ s: 'idle' });
  const reportId = useMemo(() => newClientRequestId(), []);
  useEffect(() => {
    let alive = true;
    api.listing(String(id)).then(
      (data) => alive && setLoad({ status: 'ok', data }),
      (e) => alive && setLoad({ status: 'error', message: toApiError(e).message }),
    );
    return () => {
      alive = false;
    };
  }, [api, id, reload]);
  const flag = (
    <Pressable accessibilityRole="button" accessibilityLabel="이 매물 신고" hitSlop={10} onPress={() => setReportOpen(true)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="flag" size={22} color={t.ink} />
    </Pressable>
  );
  if (load.status !== 'ok')
    return (
      <TScreen top={<TNav right={flag} />}>
        {load.status === 'loading' ? <Loading /> : <ErrorLine text={load.message} onRetry={() => { setLoad({ status: 'loading' }); setReload((n) => n + 1); }} />}
      </TScreen>
    );
  const { listing: l, show, safety, session } = load.data;
  const mine = me?.id === l.sellerId;
  const unavailable = l.status !== 'active';
  // 가격 판단은 큰 가격 아래 한 줄로만 보여 주고(중복 방지), 목록에는 규정·전달 방식만 둔다.
  const rest = safety.checks.slice(1);
  const warn = rest.filter((c) => !c.ok);
  const good = rest.filter((c) => c.ok);
  async function sendReport() {
    setReportState({ s: 'busy' });
    try {
      await checkApi.submitReport({
        clientRequestId: reportId,
        eventId: show.id,
        listingText: `[티켓레이더 매물 ${l.id}] ${show.title} ${session?.label ?? ''} ${l.seatGrade} ${l.quantity}매 장당 ${won(l.pricePerTicket)} · ${deliveryText(l.delivery)} · 판매자 ${l.sellerName}`,
        listingPrice: l.pricePerTicket,
        description: '플랫폼 매물 신고',
        findings: warn.map((c) => ({ title: c.title, status: 'needs_check', listingQuote: null, officialExcerpt: c.officialExcerpt, sourceUrl: c.sourceUrl })),
        isDemo: l.isDemo || show.isDemo,
        consent: true,
      });
      setReportState({ s: 'done' });
    } catch (e) {
      setReportState({ s: 'error', m: toApiError(e).message });
    }
  }
  return (
    <TScreen
      top={<TNav right={flag} />}
      footer={
        <>
          <Note>시연 결제예요 · 실제 돈이 오가지 않아요</Note>
          <CTA
            label={unavailable ? '거래 중인 매물이에요' : mine ? '내가 올린 매물이에요' : '구매하기'}
            disabled={unavailable || mine}
            onPress={() => router.push(token ? `/checkout/${encodeURIComponent(l.id)}` : '/login')}
          />
        </>
      }
    >
      {created === '1' ? (
        <Appear style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 24, marginTop: 4, padding: 14, borderRadius: 16, backgroundColor: '#ECEDF6' }}>
          <CheckDraw size={36} />
          <Text style={[tt.body, { fontWeight: '700' }]}>매물을 올렸어요. 공식 자료와 대조해 배지를 붙였어요</Text>
        </Appear>
      ) : null}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 6 }}>
        <Appear index={0} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <ShowArt id={show.id} category={show.category} width={96} height={128} radius={12} imageUrl={show.posterUrl} />
          <View style={{ flex: 1, gap: 6 }}>
            {l.isDemo && <Text style={[tt.desc, { color: t.primary, fontWeight: '700' }]}>시연 매물</Text>}
            <Text style={[tt.h2, { color: t.ink }]}>{show.title}</Text>
            <Text style={[tt.desc, { color: t.g7 }]}>{show.venue}</Text>
            <Text style={tt.desc}>{session?.label ?? '회차 정보 없음'}</Text>
            <Text style={[tt.body, { color: t.g7 }]}>{l.seatGrade} · {l.quantity}매</Text>
          </View>
        </Appear>
        <Appear index={1}>
          <Text accessibilityRole="header" style={tt.bigPrice}>
            {won(l.pricePerTicket)}
          </Text>
        </Appear>
        <Appear index={2}>
          <Marker color={safety.priceTone === 'high' ? 'rgba(232,72,59,0.18)' : safety.priceTone === 'good' ? 'rgba(64,72,144,0.16)' : 'transparent'} delay={520}>
            <Text style={[tt.rowTitle, { color: toneColor(safety.priceTone) }]}>
              {safety.priceTone === 'high' && safety.diff ? `정가보다 ${won(safety.diff)} 비싸요` : safety.priceText}
            </Text>
          </Marker>
        </Appear>
        <Text style={tt.desc}>
          {safety.facePrice ? `${l.seatGrade} ${show.faceSource?.label === 'KOPIS 안내 기반 시연 기준가' ? '시연 기준가' : '공식 정가'} ${won(safety.facePrice)}` : '공식 정가 미등록'} · {show.faceSource?.label ?? '출처 없음'}
          {l.quantity > 1 ? ` · 장당 가격, 총 ${won(l.pricePerTicket * l.quantity)}` : ''}
        </Text>
      </View>
      <Band />
      <Section title={warn.length ? '확인이 필요해요' : '확인했어요'}>
        {warn.length + good.length === 0 ? <Text style={[tt.desc, { paddingVertical: 8 }]}>이 공연에 등록된 공식 규정 중 해당하는 항목이 없어요.</Text> : null}
        {[...warn, ...good].map((c, i) => (
          <View key={i}>
            <Row
              title={c.title}
              desc={c.detail}
              icon={c.ok ? 'check' : 'alert'}
              iconBg={c.ok ? t.okBg : t.redBg}
              iconColor={c.ok ? t.ok : t.red}
              endNode={c.officialExcerpt || c.sourceUrl ? <Chevron open={open === i} /> : undefined}
              onPress={c.officialExcerpt || c.sourceUrl ? () => setOpen(open === i ? null : i) : undefined}
              accessibilityLabel={`${c.ok ? '확인됨' : '확인 필요'}: ${c.title}`}
            />
            <Reveal open={open === i}>
              <View style={{ marginLeft: 54, marginBottom: 8, padding: 14, borderRadius: 12, backgroundColor: t.g1, gap: 6 }}>
                {c.officialExcerpt ? <Text style={[tt.body, { fontSize: 14 }]}>공식 안내 “{c.officialExcerpt}”</Text> : null}
                {c.sourceUrl ? (
                  <Text accessibilityRole="link" onPress={() => openUrl(c.sourceUrl)} style={[tt.desc, { color: t.primary }]}>
                    출처 열기
                  </Text>
                ) : (
                  <Text style={tt.desc}>{show.faceSource?.label ?? '출처 없음'}</Text>
                )}
              </View>
            </Reveal>
          </View>
        ))}
        <Text style={[tt.desc, { paddingVertical: 8 }]}>공식 자료와 비교한 결과예요. 티켓 진위나 입장을 보증하지 않아요.</Text>
      </Section>
      <BottomSheet visible={reportOpen} title="이 매물을 신고할까요?" onClose={() => setReportOpen(false)}>
        {reportState.s === 'done' ? (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
            <CheckDraw size={56} />
            <Text style={[tt.body, { textAlign: 'center' }]}>주최 측 제보함에 접수됐어요. 다시 눌러도 한 번만 접수돼요.</Text>
          </View>
        ) : (
          <>
            <Text style={[tt.body, { color: t.g7 }]}>매물 정보와 ‘확인이 필요해요’ 항목을 담당 주최 측 제보함으로 보내요. 판매자 연락처는 보내지 않아요.</Text>
            {reportState.s === 'error' ? <Text style={[tt.desc, { color: t.red }]}>{reportState.m}</Text> : null}
            <CTA label="동의하고 신고하기" busy={reportState.s === 'busy'} onPress={() => void sendReport()} />
          </>
        )}
      </BottomSheet>
      <Band />
      <Section>
        <Row title={l.sellerName} desc={`${l.sellerId.startsWith('demo-') ? '시연 판매자' : '회원'} · ${deliveryText(l.delivery)}로 전달`} icon="user" />
        <Row title="안전거래로 결제돼요" desc="티켓을 받고 확인해야 판매자에게 정산돼요 (시연)" icon="shield" iconBg="#ECEDF6" iconColor={t.primary} />
      </Section>
    </TScreen>
  );
}
