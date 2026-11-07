import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appear, HeartButton, SkeletonRows } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';
import { toApiError } from '../../api/client';
import { Icon } from '../../components/ui';
import type { ShowDetail } from '../../market/api';
import { CATEGORY_TEXT, deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import { Band, Chips, Empty, ErrorLine, Row, Section, t, toneColor, tt, won } from '../../ui/toss';

// 공연 상세(V2-2): 큰 제목 → 회차 → 매물(색 글씨 한 줄 판단) → 공식 정가. 하트는 로그인 계정에 저장.
type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: ShowDetail };

export default function ShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api, token, bump } = useMarket();
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [session, setSession] = useState<string | null>(null);
  const [favBusy, setFavBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      api.show(String(id), token).then(
        (data) => alive && setLoad({ status: 'ok', data }),
        (e) => alive && setLoad({ status: 'error', message: toApiError(e).message }),
      );
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, id, token, reload]),
  );

  async function toggleFav() {
    if (load.status !== 'ok') return;
    if (!token) return router.push('/login');
    setFavBusy(true);
    try {
      const on = !load.data.summary.favorite;
      await api.setFavorite(token, load.data.show.id, on);
      setLoad({ status: 'ok', data: { ...load.data, summary: { ...load.data.summary, favorite: on } } });
      bump();
    } catch {
      // 실패하면 표시를 바꾸지 않는다.
    } finally {
      setFavBusy(false);
    }
  }

  const fav = load.status === 'ok' && load.data.summary.favorite;
  return <ShowBody load={load} fav={!!fav} favBusy={favBusy} toggleFav={toggleFav} session={session} setSession={setSession} retry={() => { setLoad({ status: 'loading' }); setReload((n) => n + 1); }} />;
}

// 큰 썸네일 + 시차 스크롤(APP-028): 스크롤하면 이미지가 느리게 올라가며 옅어지고, 상단 바가 흰색으로 채워지며 제목이 나타난다.
function ShowBody({ load, fav, favBusy, toggleFav, session, setSession, retry }: { load: Load; fav: boolean; favBusy: boolean; toggleFav: () => void; session: string | null; setSession: (s: string | null) => void; retry: () => void }) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const HERO = 260;
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(y.value, [-100, 0, HERO], [-50, 0, HERO * 0.45], Extrapolation.CLAMP) }, { scale: interpolate(y.value, [-100, 0], [1.25, 1], Extrapolation.CLAMP) }],
    opacity: interpolate(y.value, [0, HERO * 0.8], [1, 0.3], Extrapolation.CLAMP),
  }));
  const barStyle = useAnimatedStyle(() => ({ backgroundColor: `rgba(255,255,255,${interpolate(y.value, [HERO - 120, HERO - 60], [0, 1], Extrapolation.CLAMP)})` }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 70, HERO - 30], [0, 1], Extrapolation.CLAMP) }));
  const bar = (
    <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, paddingTop: insets.top, height: insets.top + 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }, barStyle]}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <Icon name="arrowLeft" size={22} color={t.ink} />
      </Pressable>
      <Animated.Text numberOfLines={1} style={[{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: t.ink, marginHorizontal: 8 }, titleStyle]}>
        {load.status === 'ok' ? load.data.show.title : ''}
      </Animated.Text>
      <View style={{ borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <HeartButton on={fav} busy={favBusy} onPress={toggleFav} />
      </View>
    </Animated.View>
  );
  if (load.status !== 'ok')
    return (
      <View style={{ flex: 1, backgroundColor: t.white }}>
        {bar}
        <View style={{ paddingTop: insets.top + 64, paddingHorizontal: 24 }}>{load.status === 'loading' ? <SkeletonRows count={4} /> : <ErrorLine text={load.message} onRetry={retry} />}</View>
      </View>
    );
  const { show, listings } = load.data;
  const shown = session ? listings.filter((l) => l.sessionId === session) : listings;
  const { width } = Dimensions.get('window');
  return (
    <View style={{ flex: 1, backgroundColor: t.white }}>
      {bar}
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Animated.View style={heroStyle}>
          <ShowArt id={show.id} category={show.category} width={width} height={HERO} radius={0} />
        </Animated.View>
        <View style={{ backgroundColor: t.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 20, gap: 6 }}>
            <Text style={[tt.body, { color: t.g5, fontSize: 14 }]}>
              {CATEGORY_TEXT[show.category]} · {show.venue}
              {show.isDemo ? ' · 가상 공연' : ''} · 임시 이미지
            </Text>
            <Text accessibilityRole="header" style={[tt.hero, { fontSize: 24, lineHeight: 32 }]}>
              {show.title}
            </Text>
            <View style={{ paddingTop: 12 }}>
              <Chips items={[{ key: 'all', label: '전체 회차' }, ...show.sessions.map((s) => ({ key: s.id, label: s.label }))]} value={session ?? 'all'} onChange={(k) => setSession(k === 'all' ? null : k)} />
            </View>
          </View>
          <Band />
          <Section title={`매물 ${shown.length}개`} right="저렴한 순">
            {shown.length === 0 ? (
              <Empty icon="receipt" text="아직 올라온 매물이 없어요." action="첫 매물 올리기" onAction={() => router.push('/sell')} />
            ) : (
              shown.map((l, i) => (
                <Appear key={`${session ?? 'all'}-${l.id}`} index={i}>
                  <Row
                    title={`${l.seatGrade} · ${l.quantity}매`}
                    desc={`${deliveryText(l.delivery)} · ${l.sellerName}${l.safety.attention ? ` · 확인 필요 ${l.safety.attention}` : ''}`}
                    descColor={l.safety.attention ? t.red : undefined}
                    value={won(l.pricePerTicket)}
                    value2={l.safety.priceText}
                    value2Color={toneColor(l.safety.priceTone)}
                    onPress={() => router.push(`/item/${encodeURIComponent(l.id)}`)}
                    accessibilityLabel={`${l.seatGrade} ${l.quantity}매, ${won(l.pricePerTicket)}, ${l.safety.priceText}${l.safety.attention ? `, 확인 필요 ${l.safety.attention}개` : ''}`}
                  />
                </Appear>
              ))
            )}
          </Section>
          <Band />
          <Section title="공식 정가" right={show.faceSource ? `${show.faceSource.checkedAt} 확인` : undefined}>
            {show.facePrices.length === 0 ? (
              <Text style={tt.desc}>등록된 공식 가격이 없어요.</Text>
            ) : (
              show.facePrices.map((f) => (
                <View key={f.seatGrade} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={[tt.body, { color: t.g7 }]}>{f.seatGrade}</Text>
                  <Text style={[tt.body, { fontWeight: '600' }]}>{won(f.price)}</Text>
                </View>
              ))
            )}
            <Text style={[tt.desc, { paddingTop: 8 }]}>
              {show.faceSource?.label ?? '출처 없음'} · 1매 기본가. 공식 자료와 비교한 결과이며 티켓 진위나 입장을 보증하지 않아요.
            </Text>
          </Section>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
