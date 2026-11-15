import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import { Icon } from '../../components/ui';
import { ShowArt } from '../../ui/ShowArt';
import type { ListingDetail } from '../../market/api';
import { deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import { Band, Chips, CTA, DemoChip, ErrorLine, KV, Loading, Section, t, TNav, toneColor, TScreen, tt, won } from '../../ui/toss';

// 시연 결제(V2-4): "○○원을 결제할게요" → 주문 정보 → 안전거래 안내 → 결제하기. 실제 결제 없음.
export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api, token } = useMarket();
  const [data, setData] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const useTestPayment = process.env.EXPO_PUBLIC_SHARED_TOSS_TEST === '1' && api.mode === 'live';
  useEffect(() => {
    let alive = true;
    api.listing(String(id)).then((d) => alive && setData(d), (e) => alive && setError(toApiError(e).message));
    return () => {
      alive = false;
    };
  }, [api, id]);
  if (!token) return <Redirect href="/login" />;
  async function pay() {
    if (!token || !data) return;
    setBusy(true);
    setError(null);
    let pendingId: string | null = null;
    let browserOpened = false;
    try {
      if (useTestPayment) {
        if (!api.prepareTestPayment || !api.issueTestPaymentHandoff || !api.cancelTestPayment) throw new Error('테스트 결제 연결을 준비 중이에요.');
        const prepared = await api.prepareTestPayment(token, data.listing.id);
        pendingId = prepared.orderId;
        if (prepared.amount !== data.listing.pricePerTicket * data.listing.quantity) throw new Error('주문 금액이 변경됐어요. 다시 확인해 주세요.');
        const handoff = await api.issueTestPaymentHandoff(token, prepared.orderId);
        await Linking.openURL(`https://ticketradar.month32.workers.dev/mobile-test-payment#code=${encodeURIComponent(handoff.code)}`);
        browserOpened = true;
        router.replace(`/order/${encodeURIComponent(prepared.orderId)}`);
        return;
      }
      const order = await api.createOrder(token, data.listing.id);
      // 완료 모션은 거래 화면에서 보여 준다(이동을 애니메이션에 묶지 않음).
      router.replace(`/order/${encodeURIComponent(order.id)}?paid=1`);
    } catch (e) {
      if (pendingId && !browserOpened && api.cancelTestPayment) {
        try { await api.cancelTestPayment(token, pendingId); }
        catch { setError('주문 상태를 확인하지 못했어요. 내 거래에서 확인해 주세요.'); setBusy(false); return; }
      }
      setError(toApiError(e).message);
      setBusy(false);
    }
  }
  if (!data) return <TScreen top={<TNav />}>{error ? <ErrorLine text={error} /> : <Loading />}</TScreen>;
  const { listing: l, show, safety, session } = data;
  const total = l.pricePerTicket * l.quantity;
  return (
    <TScreen top={<TNav />} footer={<>{error ? <Text style={[tt.desc, { color: t.red, textAlign: 'center' }]}>{error}</Text> : null}<CTA label={useTestPayment ? '토스 테스트 결제창 열기' : '시연 결제하기'} busy={busy} onPress={pay} /></>}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 10 }}>
        <Text accessibilityRole="header" style={tt.hero}>{`${won(total)}을\n결제할게요`}</Text>
        <DemoChip />
      </View>
      <Section>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
          <ShowArt id={show.id} category={show.category} width={88} height={118} imageUrl={show.posterUrl} />
          <View style={{ flex: 1, gap: 6 }}><Text style={[tt.h2, { fontWeight: '700' }]}>{show.title}</Text><Text style={tt.desc}>{show.venue}</Text><Text style={tt.desc}>{session?.label ?? '회차 정보 없음'}</Text></View>
        </View>
        <KV k="상품" v={`${show.title.replace('[가상] ', '')} · ${l.seatGrade} ${l.quantity}매`} />
        <KV k="공연일" v={session?.label ?? '-'} />
        <KV k="받는 방법" v={deliveryText(l.delivery)} />
        <KV k={show.faceSource?.label === 'KOPIS 안내 기반 시연 기준가' ? '시연 기준가 대비' : '정가 대비'} v={safety.priceText} color={toneColor(safety.priceTone)} />
      </Section>
      <Band />
      {!useTestPayment ? <Section title="결제 수단 · 시연">
        <Chips items={[{ key: 'card', label: '카드' }, { key: 'bank', label: '계좌이체' }]} value={method} onChange={setMethod} />
        <Text style={[tt.desc, { marginTop: 10 }]}>선택은 화면 시연용이며 실제 결제 정보는 입력하지 않아요.</Text>
      </Section> : <Section title="토스 테스트 결제"><Text style={tt.desc}>브라우저에서 테스트 결제수단을 선택해요. 실제 금전 이동은 없어요.</Text></Section>}
      <Band />
      <Section style={{ paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="shield" size={20} color={t.primary} />
          <Text style={[tt.body, { fontWeight: '600' }]}>수령 확인 후 거래가 완료돼요</Text>
        </View>
        <Text style={[tt.desc, { marginTop: 6 }]}>‘티켓 받았어요’를 눌러 시연 거래를 완료해요. 실제 돈 보관이나 정산은 이루어지지 않아요.</Text>
      </Section>
    </TScreen>
  );
}
