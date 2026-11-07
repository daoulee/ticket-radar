import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { toApiError } from '../../api/client';
import { useMarket } from '../../market/MarketContext';
import { PerformanceCast } from '../../components/PerformanceCast';
import { PerformancePoster } from '../../components/PerformancePoster';
import type { PerformanceDetail } from '../../market/api';
import { CTA, ErrorLine, TNav, TScreen, t, tt } from '../../ui/toss';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; detail: PerformanceDetail };

export default function PerformanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api } = useMarket();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    api.performanceDetail(String(id)).then((detail) => { if (active) setState({ status: 'ok', detail }); }, (error) => { if (active) setState({ status: 'error', message: toApiError(error).message }); });
    return () => { active = false; };
  }, [api, id, retry]);

  const detail = state.status === 'ok' ? state.detail : null;
  return <TScreen top={<TNav />} footer={detail ? <CTA label="예매하러 가기" onPress={() => router.push(`/performance-listings/${encodeURIComponent(detail.id)}?title=${encodeURIComponent(detail.title)}`)} /> : undefined}>
    {state.status === 'loading' ? <Text style={[tt.body, { padding: 24 }]}>공연 정보를 불러오고 있어요.</Text> : state.status === 'error' ? <ErrorLine text={state.message} onRetry={() => { setState({ status: 'loading' }); setRetry((value) => value + 1); }} /> : detail ? <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 20 }}>
      <Text accessibilityRole="header" style={tt.hero}>{detail.title}</Text>
      <Text style={tt.desc}>KOPIS 공연 정보 · 실제 판매 재고 미연결</Text>
      <PerformancePoster key={detail.posterUrl ?? 'no-poster'} uri={detail.posterUrl} />
      <View style={{ gap: 8 }}>
        <Text style={tt.h2}>공연 정보</Text>
        <Text style={tt.body}>장소 · {detail.venue ?? '정보 없음'}</Text>
        <Text style={tt.body}>기간 · {detail.startsOn} ~ {detail.endsOn}</Text>
        <Text style={tt.body}>장르 · {detail.genre ?? '정보 없음'}</Text>
        <Text style={tt.body}>공연 시간 · {detail.schedule ?? '정보 없음'}</Text>
        <Text style={tt.body}>KOPIS 가격 안내 · {detail.priceGuide ?? '정보 없음'}</Text>
        <Text style={tt.body}>공연장 객석 규모 · {detail.stageCapacity != null ? `${detail.stageCapacity.toLocaleString('ko-KR')}석` : '정보 없음'}</Text>
        <Text style={tt.desc}>공연장 시설 기준이며 공연별 좌석 배치나 예매 가능 수량과 다를 수 있어요.</Text>
        <Text style={tt.body}>관람 시간 · {detail.runtime ?? '정보 없음'}</Text>
        <Text style={tt.body}>관람 연령 · {detail.age ?? '정보 없음'}</Text>
      </View>
      <View style={{ gap: 8 }}><Text style={tt.h2}>공연 소개</Text><Text style={[tt.body, { color: t.g7 }]}>{detail.story ?? 'KOPIS에서 제공한 공연 소개가 없어요.'}</Text></View>
      {detail.introImages?.map((uri) => <PerformancePoster key={uri} uri={uri} intro />)}
      <PerformanceCast cast={detail.cast} />
    </View> : null}
  </TScreen>;
}
