import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toApiError } from '../../api/client';
import type { OrderDetail } from '../../market/api';
import { useMarket } from '../../market/MarketContext';
import { CTA, Empty, ErrorLine, Row, Section, t, Tabs, tt, won } from '../../ui/toss';
import { Appear, SkeletonRows } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';

// 내 거래: 구매·판매 목록과 진행 상태(시연 거래).
const STATUS = { held: '결제 완료', sent: '티켓 전달됨', settled: '거래 완료', cancelled: '취소됨' } as const;
const orderStatus = (o: OrderDetail['order']) => o.testPayment?.status === 'pending' ? '테스트 결제 대기' : o.testPayment?.status === 'confirming' ? '테스트 결제 확인 중' : o.testPayment?.status === 'expired' ? '테스트 결제 만료' : STATUS[o.status];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { api, token, version } = useMarket();
  const [list, setList] = useState<OrderDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'buyer' | 'seller'>('buyer');
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let alive = true;
      api.orders(token).then((l) => {
        if (alive) { setList(l); setError(null); }
      }, (e) => alive && setError(toApiError(e).message));
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, token, version]),
  );
  const shown = (list ?? []).filter((o) => o.role === tab);
  return (
    <View style={{ flex: 1, backgroundColor: t.white, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8, gap: 10 }}>
        <Text accessibilityRole="header" style={tt.hero}>내 거래</Text>
        {token ? <Tabs items={[{ key: 'buyer', label: '구매' }, { key: 'seller', label: '판매' }]} value={tab} onChange={setTab} /> : null}
      </View>
      {!token ? (
        <View style={{ padding: 24, gap: 16 }}>
          <Text style={[tt.body, { color: t.g7 }]}>로그인하면 구매·판매 거래를 여기서 볼 수 있어요.</Text>
          <CTA label="로그인하기" onPress={() => router.push('/login')} />
        </View>
      ) : (
        <Section>
          {error ? <ErrorLine text={error} /> : !list ? <SkeletonRows count={3} /> : shown.length === 0 ? (
            <Empty icon="receipt" text={tab === 'buyer' ? '아직 구매한 티켓이 없어요.' : '아직 판매한 티켓이 없어요.'} />
          ) : shown.map((o, i) => (
            <Appear key={`${tab}-${o.order.id}`} index={i}>
            <Row
              art={<ShowArt id={o.show.id} category={o.show.category} size={48} />}
              title={`${o.show.title.replace('[가상] ', '')} · ${o.listing.seatGrade}`}
              desc={`${orderStatus(o.order)} · 시연 거래`}
              descColor={o.order.status === 'sent' && o.role === 'buyer' ? t.primary : undefined}
              value={won(o.order.amount)}
              end="chevronRight"
              onPress={() => router.push(`/order/${encodeURIComponent(o.order.id)}`)}
            />
            </Appear>
          ))}
        </Section>
      )}
    </View>
  );
}
