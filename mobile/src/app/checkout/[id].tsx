import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import { Icon } from '../../components/ui';
import { ShowArt } from '../../ui/ShowArt';
import type { ListingDetail } from '../../market/api';
import { deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import { Band, CTA, DemoChip, ErrorLine, KV, Loading, Section, t, TNav, toneColor, TScreen, tt, won } from '../../ui/toss';

// 시연 결제(V2-4): "○○원을 결제할게요" → 주문 정보 → 안전거래 안내 → 결제하기. 실제 결제 없음.
export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api, token } = useMarket();
  const [data, setData] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
    try {
      const order = await api.createOrder(token, data.listing.id);
      // 완료 모션은 거래 화면에서 보여 준다(이동을 애니메이션에 묶지 않음).
      router.replace(`/order/${encodeURIComponent(order.id)}?paid=1`);
    } catch (e) {
      setError(toApiError(e).message);
      setBusy(false);
    }
  }
  if (!data) return <TScreen top={<TNav />}>{error ? <ErrorLine text={error} /> : <Loading />}</TScreen>;
  const { listing: l, show, safety, session } = data;
  const total = l.pricePerTicket * l.quantity;
  return (
    <TScreen top={<TNav />} footer={<>{error ? <Text style={[tt.desc, { color: t.red, textAlign: 'center' }]}>{error}</Text> : null}<CTA label="결제하기" busy={busy} onPress={pay} /></>}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 10 }}>
        <Text accessibilityRole="header" style={tt.hero}>{`${won(total)}을\n결제할게요`}</Text>
        <DemoChip />
      </View>
      <Section>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
          <ShowArt id={show.id} category={show.category} size={48} imageUrl={show.posterUrl} />
          <Text style={[tt.body, { fontWeight: '600', flex: 1 }]} numberOfLines={2}>{show.title}</Text>
        </View>
        <KV k="상품" v={`${show.title.replace('[가상] ', '')} · ${l.seatGrade} ${l.quantity}매`} />
        <KV k="공연일" v={session?.label ?? '-'} />
        <KV k="받는 방법" v={deliveryText(l.delivery)} />
        <KV k={show.faceSource?.label === 'KOPIS 안내 기반 시연 기준가' ? '시연 기준가 대비' : '정가 대비'} v={safety.priceText} color={toneColor(safety.priceTone)} />
        <KV k="결제 수단" v="시연 카드 ●●1234" />
      </Section>
      <Band />
      <Section style={{ paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="shield" size={20} color={t.primary} />
          <Text style={[tt.body, { fontWeight: '600' }]}>티켓을 받기 전까지 돈은 보관돼요</Text>
        </View>
        <Text style={[tt.desc, { marginTop: 6 }]}>‘티켓 받았어요’를 눌러야 판매자에게 정산돼요. 시연 결제라 실제 돈은 오가지 않아요.</Text>
      </Section>
    </TScreen>
  );
}
