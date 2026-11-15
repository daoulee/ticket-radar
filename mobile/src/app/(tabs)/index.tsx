import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toApiError } from '../../api/client';
import { BrandMark } from '../../brand/BrandMark';
import { Icon } from '../../components/ui';
import type { Category, Performance, ShowSummary } from '../../market/api';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Band, Empty, ErrorLine, Row, Section, t, tt, won } from '../../ui/toss';
import { Appear, Marker, PopBadge, PressScale, SkeletonRows, SlidingTabs } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';
import { useMarket } from '../../market/MarketContext';

// 홈(와이어프레임 V2-1): 큰 질문 → 즐겨찾기 줄(계정) → 곧 열리는 공연(분류 탭). 매물 수·최저가·정가 이하 개수를 한 줄로.
type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; shows: ShowSummary[] };
type PerformanceLoad = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; shows: Performance[] };
type Cat = 'all' | Category;
const CATS: { key: Cat; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'concert', label: '콘서트' },
  { key: 'musical', label: '뮤지컬' },
  { key: 'sports', label: '스포츠' },
];

function matchesPerformanceCategory(performance: Performance, category: Cat): boolean {
  if (category === 'all') return true;
  if (category === 'concert') return performance.genre === '대중음악';
  if (category === 'musical') return performance.genre === '뮤지컬' || performance.genre === '연극';
  return false;
}

function KopisPoster({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  return <View accessible={false} style={{ width: 56, height: 72, borderRadius: 8, overflow: 'hidden', backgroundColor: t.g1, justifyContent: 'center', alignItems: 'center' }}>
    {url && !failed ? <Image source={{ uri: url }} onError={() => setFailed(true)} style={{ width: 56, height: 72 }} resizeMode="cover" /> : <Text style={{ color: t.g5, fontSize: 10 }}>포스터 없음</Text>}
  </View>;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { api, token, me, version, restoring } = useMarket();
  const [cat, setCat] = useState<Cat>('all');
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  const [performanceLoad, setPerformanceLoad] = useState<PerformanceLoad>({ status: 'loading' });
  const [performanceReload, setPerformanceReload] = useState(0);
  const [showAllPerformances, setShowAllPerformances] = useState(false);
  const [performancePage, setPerformancePage] = useState(1);
  const [hasMorePerformances, setHasMorePerformances] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const performanceGeneration = useRef(0);
  useFocusEffect(useCallback(() => {
    let alive = true;
    const generation = ++performanceGeneration.current;
    if (restoring || !token || api.mode !== 'live') return () => { alive = false; };
    if (cat === 'sports') { setPerformanceLoad({ status: 'ok', shows: [] }); setHasMorePerformances(false); return () => { alive = false; }; }
    api.performances(cat === 'all' ? null : cat, 1).then(
      (items) => { if (alive && performanceGeneration.current === generation) { setPerformanceLoad({ status: 'ok', shows: items }); setPerformancePage(1); setHasMorePerformances(items.length === 30); setLoadingMore(false); setMoreError(null); } },
      (error) => alive && setPerformanceLoad({ status: 'error', message: toApiError(error).message }),
    );
    return () => { alive = false; performanceGeneration.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- performanceReload triggers a retry
  }, [api, token, restoring, performanceReload, cat]));
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (restoring || !token) return () => { alive = false; };
      api.shows({ category: cat === 'all' ? null : cat }, token).then(
        (shows) => alive && setLoad({ status: 'ok', shows }),
        (e) => alive && setLoad({ status: 'error', message: toApiError(e).message }),
      );
      return () => {
        alive = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version·reload 는 다시 불러오기 신호
    }, [api, token, cat, version, reload, restoring]),
  );
  const shows = load.status === 'ok' ? load.shows : [];
  const actualShows = performanceLoad.status === 'ok' ? performanceLoad.shows.filter((performance) => matchesPerformanceCategory(performance, cat)) : [];
  const favs = shows.filter((s) => s.favorite);
  // 스크롤 연동(APP-028): 큰 제목이 위로 접히며 옅어지고, 헤더에 구분선·작은 제목이 나타난다.
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 70], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [0, 70], [0, -10], Extrapolation.CLAMP) }],
  }));
  const headStyle = useAnimatedStyle(() => ({ borderBottomColor: `rgba(229,232,235,${interpolate(y.value, [40, 90], [0, 1], Extrapolation.CLAMP)})` }));
  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [60, 100], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [60, 100], [6, 0], Extrapolation.CLAMP) }],
  }));
  async function loadMorePerformances() {
    if (loadingMore || !hasMorePerformances || cat === 'sports') return;
    const generation = performanceGeneration.current;
    setLoadingMore(true); setMoreError(null);
    try {
      const nextPage = performancePage + 1;
      const items = await api.performances(cat === 'all' ? null : cat, nextPage);
      if (generation !== performanceGeneration.current) return;
      setPerformanceLoad((current) => current.status === 'ok' ? { status: 'ok', shows: [...current.shows, ...items.filter((item) => !current.shows.some((existing) => existing.id === item.id))] } : current);
      setPerformancePage(nextPage); setHasMorePerformances(items.length === 30);
    } catch (error) { if (generation === performanceGeneration.current) setMoreError(toApiError(error).message); }
    finally { if (generation === performanceGeneration.current) setLoadingMore(false); }
  }
  if (restoring) return <View style={{ flex: 1, backgroundColor: t.white }} />;
  if (!token) return <Redirect href="/login" />;
  return (
    <View style={{ flex: 1, backgroundColor: t.white }}>
      <Animated.View style={[{ paddingTop: insets.top, paddingHorizontal: 24, height: 52 + insets.top, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.white, borderBottomWidth: 1, zIndex: 2 }, headStyle]}>
        <BrandMark width={78} />
        <Animated.Text style={[{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontSize: 16, fontWeight: '700', color: t.ink }, miniStyle]} pointerEvents="none">
          공연 찾기
        </Animated.Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`알림${me?.unread ? `, 새 알림 ${me.unread}개` : ''}`} hitSlop={10} onPress={() => router.push(token ? '/notifications' : '/login')}>
          <Icon name="bell" size={24} color={t.ink} />
          <PopBadge count={me?.unread ?? 0} />
        </Pressable>
      </Animated.View>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View style={[{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }, heroStyle]}>
          <View accessible accessibilityRole="header" accessibilityLabel="어떤 공연을 찾고 계세요?">
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={tt.hero}>어떤 </Text>
              <Marker color="rgba(64,72,144,0.16)" delay={900}>
                <Text style={tt.hero}>공연</Text>
              </Marker>
              <Text style={tt.hero}>을</Text>
            </View>
            <Text style={tt.hero}>찾고 계세요?</Text>
          </View>
          {api.mode === 'demo' ? <Text style={[tt.desc, { marginTop: 6 }]}>시연 모드 · 가상 공연과 합성 매물이에요</Text> : null}
          <Text style={[tt.desc, { marginTop: api.mode === 'demo' ? 0 : 6 }]}>썸네일은 임시 이미지예요</Text>
        </Animated.View>

        <Section title="가상 예매 체험">
          <Row title="대기부터 좌석 선택까지" desc="가상 공연으로 예매 흐름을 체험해요" end="chevronRight" onPress={() => router.push('/demo-booking')} />
        </Section>
        <Band />
        <Section title="즐겨찾기" right={token ? '전체 보기' : undefined} onRight={() => router.push('/favorites')} style={{ paddingBottom: 20 }}>
          {!token ? (
            <Row title="로그인하고 즐겨찾기를 모아 보세요" desc="새 매물·정가 이하 알림을 받을 수 있어요" icon="heart" iconColor={t.red} iconBg={t.redBg} end="chevronRight" onPress={() => router.push('/login')} />
          ) : favs.length === 0 ? (
            <Text style={[tt.desc, { paddingVertical: 8 }]}>공연 화면에서 ♡를 누르면 여기에 모여요.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingTop: 8 }}>
              {favs.map((f, i) => (
                <Appear key={f.id} index={i}>
                  <PressScale accessibilityRole="button" accessibilityLabel={`${f.title}${f.newCount ? `, 새 매물 ${f.newCount}개` : ''}`} onPress={() => router.push(`/show/${encodeURIComponent(f.id)}`)} pressedBg="transparent" scaleTo={0.94} style={{ width: 76, alignItems: 'center', gap: 6 }}>
                    <View style={{ padding: 2, borderRadius: 32, borderWidth: 2, borderColor: f.newCount ? t.primary : 'transparent' }}>
                      <ShowArt id={f.id} category={f.category} size={56} round imageUrl={f.posterUrl} />
                    </View>
                    <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 15, fontWeight: '600', color: t.ink, textAlign: 'center' }}>{f.title.replace('[가상] ', '')}</Text>
                    {f.newCount ? <Text style={{ fontSize: 11, fontWeight: '700', color: t.primary }}>새 매물 {f.newCount}</Text> : null}
                  </PressScale>
                </Appear>
              ))}
            </ScrollView>
          )}
        </Section>
        <Band />
        <Section title="공연 둘러보기">
          <SlidingTabs items={CATS} value={cat} onChange={(c) => { if (c !== cat) { setLoad({ status: 'loading' }); if (api.mode === 'live') setPerformanceLoad({ status: 'loading' }); setLoadingMore(false); setMoreError(null); setShowAllPerformances(false); setCat(c); } }} />
          {api.mode === 'live' ? <>
            <Text style={[tt.desc, { paddingTop: 4, paddingBottom: 8 }]}>KOPIS 공연 정보 · 오늘부터 30일 범위 · 실제 판매 재고 미연결</Text>
            {performanceLoad.status === 'loading' ? <SkeletonRows count={3} /> : performanceLoad.status === 'error' ? <ErrorLine text={performanceLoad.message} onRetry={() => { setPerformanceLoad({ status: 'loading' }); setPerformanceReload((value) => value + 1); }} /> : <>
              {actualShows.length === 0 ? <Text style={[tt.desc, { paddingVertical: 12 }]}>{cat === 'sports' ? 'KOPIS는 공연예술 정보를 제공해요.' : '이 분류에서 조회된 KOPIS 공연이 없어요.'}</Text> : null}
              {(showAllPerformances ? actualShows : actualShows.slice(0, 5)).map((performance) => <Row key={performance.id} art={<KopisPoster url={performance.posterUrl} />} title={performance.title} desc={`${performance.venue ?? '공연장 미확인'} · ${performance.startsOn} ~ ${performance.endsOn}`} value2="매물 미연결" onPress={() => router.push(`/performance/${encodeURIComponent(performance.id)}`)} />)}
              {actualShows.length > 5 && !showAllPerformances ? <Pressable accessibilityRole="button" onPress={() => setShowAllPerformances(true)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[tt.body, { color: t.primary }]}>{`KOPIS 공연 ${actualShows.length}개 모두 보기`}</Text></Pressable> : null}
              {(showAllPerformances || actualShows.length <= 5) && hasMorePerformances ? <Pressable accessibilityRole="button" accessibilityState={{ disabled: loadingMore }} disabled={loadingMore} onPress={() => void loadMorePerformances()} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[tt.body, { color: t.primary }]}>{loadingMore ? '불러오는 중…' : '다음 공연 더 보기'}</Text></Pressable> : null}
              {moreError ? <ErrorLine text={moreError} onRetry={() => void loadMorePerformances()} /> : null}
            </>}
            <Text style={[tt.desc, { paddingTop: 12 }]}>아래는 시연용 매물이에요.</Text>
          </> : null}
          {load.status === 'loading' ? (
            <SkeletonRows count={4} />
          ) : load.status === 'error' ? (
            <ErrorLine text={load.message} onRetry={() => { setLoad({ status: 'loading' }); setReload((n) => n + 1); }} />
          ) : shows.length === 0 ? (
            <Empty icon="search" text="이 분류에는 아직 공연이 없어요." />
          ) : (
            shows.map((s, i) => (
              <Appear key={`${cat}-${s.id}`} index={i}>
                <Row
                  art={<ShowArt id={s.id} category={s.category} size={56} imageUrl={s.posterUrl} />}
                  title={s.title}
                  desc={`${s.firstSession ?? '일정 미정'}${s.sessionCount > 1 ? ` 외 ${s.sessionCount - 1}회` : ''} · 매물 ${s.listingCount}`}
                  value={s.minPrice !== null ? `${won(s.minPrice)}~` : '매물 없음'}
                  value2={s.belowFaceCount ? `정가 이하 ${s.belowFaceCount}개` : undefined}
                  value2Color={t.primary}
                  onPress={() => router.push(`/show/${encodeURIComponent(s.id)}`)}
                  accessibilityLabel={`${s.title}, 매물 ${s.listingCount}개${s.minPrice !== null ? `, 최저 ${won(s.minPrice)}` : ''}`}
                />
              </Appear>
            ))
          )}
        </Section>
      </Animated.ScrollView>
    </View>
  );
}
