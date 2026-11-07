import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import type { PerformanceDetail, ShowDetail } from '../../market/api';
import { useMarket } from '../../market/MarketContext';
import { Icon } from '../../components/ui';
import { Appear } from '../../ui/motion';
import { Band, CTA, ErrorLine, Row, TNav, TScreen, t, tt, won } from '../../ui/toss';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'empty' } | { status: 'ok'; data: ShowDetail };

export default function PerformanceListingsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const { api, token } = useMarket();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [performance, setPerformance] = useState<PerformanceDetail | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    api.show(String(id), token).then((data) => { if (active) setState({ status: 'ok', data }); }, (error) => {
      if (!active) return;
      const issue = toApiError(error);
      setState(issue.code === 'SHOW_NOT_FOUND' ? { status: 'empty' } : { status: 'error', message: issue.message });
    });
    return () => { active = false; };
  }, [api, id, token, retry]);
  useEffect(() => {
    let active = true;
    api.performanceDetail(String(id)).then((data) => { if (active) setPerformance(data); }, () => { if (active) setPerformance(null); });
    return () => { active = false; };
  }, [api, id]);
  async function prepareDemo() {
    if (!token) { router.push('/login'); return; }
    setPreparing(true); setPrepareError(null);
    try { setState({ status: 'ok', data: await api.preparePerformanceDemo(String(id), token) }); }
    catch (error) { setPrepareError(toApiError(error).message); }
    finally { setPreparing(false); }
  }
  const empty = state.status === 'empty' || (state.status === 'ok' && state.data.listings.length === 0);
  const canPrepare = empty && id === 'PF305681';
  return <TScreen top={<TNav />} footer={canPrepare ? <CTA label={token ? '시연 매물 준비하기' : '로그인하고 시연하기'} busy={preparing} onPress={() => void prepareDemo()} /> : undefined}>
    <Appear style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 20 }}>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <SmallPoster key={performance?.posterUrl ?? 'empty'} url={performance?.posterUrl ?? null} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[tt.desc, { color: t.primary, fontWeight: '700' }]}>KOPIS 공연 정보</Text>
          <Text accessibilityRole="header" style={[tt.hero, { fontSize: 22, lineHeight: 30 }]}>{performance?.title ?? title ?? '공연 정보'}</Text>
          <Text style={tt.desc}>{performance?.venue ?? '공연장을 확인하고 있어요'}</Text>
        </View>
      </View>
      {performance && <View style={{ borderRadius: 16, backgroundColor: t.g1, padding: 18, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}><Text style={tt.desc}>가격 안내</Text><Text style={[tt.rowTitle, { color: t.ink }]}>{performance.priceGuide ?? '정보 없음'}</Text></View>
          <View style={{ flex: 1, gap: 4 }}><Text style={tt.desc}>안내된 좌석</Text><Text style={tt.rowTitle}>{performance.priceCandidate?.seatGrade ?? '정보 없음'}</Text></View>
        </View>
        <View style={{ height: 1, backgroundColor: t.g2 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={tt.desc}>공연장 객석 규모</Text><Text style={tt.rowTitle}>{performance.stageCapacity != null ? `${performance.stageCapacity.toLocaleString('ko-KR')}석` : '정보 없음'}</Text></View>
        <Text style={tt.desc}>KOPIS 시설 기준이며 등급별 좌석 수와 남은 좌석은 확인되지 않았어요. 실제 예매 조건은 예매처에서 확인해 주세요.</Text>
      </View>}
    </Appear>
    <Band />
    <View style={{ paddingHorizontal: 24, paddingTop: 24, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text accessibilityRole="header" style={tt.h2}>티켓 매물</Text>{state.status === 'ok' && state.data.listings.length > 0 && <Text style={tt.desc}>{state.data.listings.length}건</Text>}</View>
      {state.status === 'loading' ? <Text style={tt.body}>매물을 불러오고 있어요.</Text> : state.status === 'error' ? <ErrorLine text={state.message} onRetry={() => { setState({ status: 'loading' }); setRetry((value) => value + 1); }} /> : empty ? <View style={{ alignItems: 'center', paddingVertical: 20, gap: 10 }}><View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' }}><Icon name="search" size={24} color={t.g4} /></View><Text style={[tt.rowTitle, { textAlign: 'center' }]}>아직 연결된 매물이 없어요.</Text>{canPrepare && <Text style={[tt.desc, { textAlign: 'center' }]}>시연 매물 1매로 구매 흐름을 살펴볼 수 있어요.</Text>}</View> : state.status === 'ok' ? state.data.listings.map((listing) => <Row key={listing.id} title={`${listing.seatGrade} · ${listing.quantity}매${listing.isDemo ? ' · 시연' : ''}`} desc={listing.safety.priceText} value={won(listing.pricePerTicket)} onPress={() => router.push(`/item/${encodeURIComponent(listing.id)}`)} />) : null}
      {canPrepare && <Text style={[tt.desc, { color: t.g7 }]}>시연 회차와 매물이에요. 실제 회차·좌석 번호는 확인되지 않았으며 실제 예매·결제는 진행되지 않아요.</Text>}
      {prepareError && <ErrorLine text={prepareError} onRetry={() => void prepareDemo()} />}
    </View>
  </TScreen>;
}

function SmallPoster({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  return <View accessible={false} style={{ width: 80, height: 108, borderRadius: 12, overflow: 'hidden', backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' }}>{url && !failed ? <Image source={{ uri: url }} onError={() => setFailed(true)} style={{ width: 80, height: 108 }} resizeMode="cover" /> : <Icon name="image" size={24} color={t.g4} />}</View>;
}
