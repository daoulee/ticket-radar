import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import type { OrderDetail } from '../../market/api';
import { deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import { Band, CTA, ErrorLine, KV, Loading, Row, Section, t, TNav, TScreen, tt, won } from '../../ui/toss';
import { CheckDraw, StepBar } from '../../ui/motion';

// 거래 진행(V2-5): 상태 문장 → 4칸 진행 막대 → 안내 → 주문 정보 → 단계별 버튼(판매자: 전달 완료 / 구매자: 티켓 받았어요).
const STEPS = ['결제', '전달', '수령 확인', '정산'];

export default function OrderScreen() {
  const { id, paid } = useLocalSearchParams<{ id: string; paid?: string }>();
  const { api, token } = useMarket();
  const [d, setD] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') setReload(value => value + 1); });
    return () => subscription.remove();
  }, []);
  const backToOrders = () => {
    if (paid !== '1' && router.canGoBack()) router.dismissTo('/orders');
    else router.replace('/orders');
  };
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let alive = true;
      api.order(token, String(id)).then((x) => alive && setD(x), (e) => alive && setError(toApiError(e).message));
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, id, token, reload]),
  );
  if (!token) return <Redirect href="/login" />;
  async function act(kind: 'sent' | 'confirm' | 'cancel') {
    if (!token || !d) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === 'sent') await api.markSent(token, d.order.id);
      if (kind === 'confirm') await api.confirm(token, d.order.id);
      if (kind === 'cancel') await api.cancel(token, d.order.id);
      setReload((n) => n + 1);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  }
  if (!d) return <TScreen top={<TNav onBack={backToOrders} />}>{error ? <ErrorLine text={error} /> : <Loading />}</TScreen>;
  const { order: o, listing: l, show, session, role } = d;
  const paymentPending = o.testPayment?.status === 'pending' || o.testPayment?.status === 'confirming';
  const done = paymentPending ? 0 : o.status === 'settled' ? 4 : o.status === 'sent' ? 2 : o.status === 'held' ? 1 : 0;
  const title =
    o.status === 'cancelled' ? '거래가 취소됐어요'
    : o.testPayment?.status === 'pending' ? '테스트 결제를\n기다리고 있어요'
    : o.testPayment?.status === 'confirming' ? '테스트 결제 결과를\n확인하고 있어요'
    : o.status === 'settled' ? '거래가 끝났어요'
    : o.status === 'sent' ? (role === 'buyer' ? '티켓이 도착했는지\n확인해 주세요' : '구매자가 티켓을\n확인하고 있어요')
    : role === 'buyer' ? '판매자가 티켓을\n보내고 있어요' : '구매자가 결제했어요\n티켓을 보내 주세요';
  const footer =
    o.status === 'sent' && role === 'buyer' ? <CTA label="티켓 받았어요" busy={busy} onPress={() => void act('confirm')} />
    : o.status === 'held' && role === 'seller' && !paymentPending ? <CTA label="티켓을 전달했어요" busy={busy} onPress={() => void act('sent')} />
    : o.status === 'held' && role === 'buyer' && o.testPayment?.status !== 'confirming' ? <CTA label="거래 취소" tone="grey" busy={busy} onPress={() => void act('cancel')} />
    : undefined;
  return (
    <TScreen top={<TNav onBack={backToOrders} />} footer={footer ? <>{error ? <Text style={[tt.desc, { color: t.red, textAlign: 'center' }]}>{error}</Text> : null}{o.status === 'sent' && role === 'buyer' ? <Text style={[tt.desc, { textAlign: 'center' }]}>{l.delivery === 'official_transfer' ? '예매처 앱에 티켓이 보일 때 눌러 주세요' : '티켓을 직접 확인한 후 눌러 주세요'}</Text> : null}{footer}</> : undefined}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 16 }}>
        {(paid === '1' && o.status !== 'cancelled' && !paymentPending) || o.status === 'settled' ? (
          <CheckDraw key={o.status} size={56} gentle />
        ) : null}
        <Text accessibilityRole="header" style={tt.hero}>{title}</Text>
        {o.status !== 'cancelled' ? <StepBar steps={STEPS} done={done} animateCompletion={o.status === 'settled'} /> : null}
      </View>
      <Band />
      <Section>
        <Row title={`${deliveryText(l.delivery)}로 받아요`} desc={l.delivery === 'official_transfer' ? '예매처 앱 알림을 확인해 주세요' : '공식 양도가 아니라면 입장이 안 될 수 있어요'} descColor={l.delivery === 'official_transfer' ? undefined : t.red} />
        <Row title="문제가 생겼나요?" desc="거래 문제 신고 · 주최 측 제보함" end="chevronRight" onPress={() => router.push('/admin')} />
      </Section>
      <Band />
      <Section style={{ paddingBottom: 16 }}>
        <KV k="주문" v={`${show.title.replace('[가상] ', '')} · ${l.seatGrade} ${l.quantity}매`} />
        <KV k="공연일" v={session?.label ?? '-'} />
        <KV k={paymentPending ? '결제 예정 (테스트)' : role === 'buyer' ? '결제 (시연)' : '정산 예정 (시연)'} v={won(o.amount)} />
        <KV k="내 역할" v={role === 'buyer' ? '구매자' : '판매자'} />
      </Section>
    </TScreen>
  );
}
