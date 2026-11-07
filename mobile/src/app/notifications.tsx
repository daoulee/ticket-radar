import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { toApiError } from '../api/client';
import type { Notification } from '../market/api';
import { useMarket } from '../market/MarketContext';
import { Empty, ErrorLine, Hero, Row, Section, t, TNav, TScreen, tt } from '../ui/toss';
import { Appear, SkeletonRows } from '../ui/motion';

// 알림: 즐겨찾기 공연의 정가 이하 새 매물(사용자 결정 2026-11-03). 화면을 열면 읽음 처리.
export default function NotificationsScreen() {
  const { api, token, refreshMe, bump } = useMarket();
  const [list, setList] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let alive = true;
      api.notifications(token).then(
        (n) => {
          if (!alive) return;
          setList(n);
          void api.markRead(token).then(() => refreshMe());
        },
        (e) => alive && setError(toApiError(e).message),
      );
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, token, reload, refreshMe]),
  );
  if (!token) return <Redirect href="/login" />;
  return (
    <TScreen top={<TNav />}>
      <Hero title="알림" sub="즐겨찾기한 공연에 정가 이하 매물이 올라오면 알려드려요" />
      <Section>
        {error ? <ErrorLine text={error} /> : !list ? <SkeletonRows count={3} thumb={40} /> : list.length === 0 ? <Empty icon="bell" text="아직 알림이 없어요." /> : list.map((n, i) => (
          // 읽지 않은 알림은 옅은 남색 바탕으로 강조하고 위에서부터 차례로 들어온다.
          <Appear key={n.id} index={i} style={{ marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 14, backgroundColor: n.read ? 'transparent' : '#F4F5FB' }}>
          <Row title={n.text} desc={new Date(n.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} icon="bell" iconBg={n.read ? t.g1 : '#ECEDF6'} iconColor={n.read ? t.g5 : t.primary} end="chevronRight" onPress={() => router.push(`/item/${encodeURIComponent(n.listingId)}`)} />
          </Appear>
        ))}
      </Section>
      {api.simulateBelowFace ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 8, gap: 6 }}>
          <Text accessibilityRole="button" onPress={async () => { const r = await api.simulateBelowFace!(token); setNote(r ? `${r}에 시연 매물이 올라왔어요` : '먼저 공연을 즐겨찾기해 주세요'); bump(); setReload((x) => x + 1); }} style={[tt.body, { color: t.primary, fontWeight: '600' }]}>
            시연: 즐겨찾기 공연에 정가 이하 매물 올리기
          </Text>
          {note ? <Text style={tt.desc}>{note}</Text> : null}
        </View>
      ) : null}
    </TScreen>
  );
}
