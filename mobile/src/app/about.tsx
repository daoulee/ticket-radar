import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '../brand/BrandMark';
import { useSplashDone } from '../brand/SplashGate';
import { Button, styles, Wash } from '../components/common';
import { FooterNote, Icon, InlineError, Pill, Skeleton } from '../components/ui';
import type { EventSummary } from '../contract/types';
import { Clues, Compare, Hero, Limits, PhoneStory, ResultPreview, Steps } from '../landing/Landing';
import { RevealOnScroll, ScrollYContext } from '../landing/scroll';
import { useFlow } from '../state/FlowContext';
import { showtimeLabel } from '../ui/display';
import { formatKst } from '../ui/format';
import { colors, MIN_TOUCH, radius, shadow, space, type } from '../ui/theme';

// 서비스 소개(구 홈, APP-024에서 '전체' 탭으로 이동) = 웹 소개 화면(Landing, 2026-11-03 배포본)과 같은 이야기 구성(APP-018).
// 고정 헤더(로고 · 바로 체험하기) → 결제 전에, 잠깐 → 휴대폰 3단계 → 판매글 속 단서 → 공식 안내와 나란히 →
// 세 단계 → 결과 미리보기 → 판단하지 않는 것 → 직접 확인해 볼까요?(실제 공연 목록) → 서비스 체험하러 가기.
// 공연 목록은 시작 연출 동안 미리 불러온다. 예시 구간은 모두 가상이며 판정이 아니다.
export default function AboutScreen() {
  const { api, events, searchEvents, resetFlow } = useFlow();
  const demo = api.mode === 'demo';
  const splashDone = useSplashDone();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  useEffect(() => {
    void searchEvents('');
  }, [searchEvents]);

  const start = () => {
    resetFlow();
    router.push('/events');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.wash }}>
      <Wash />
      <View style={h.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <Icon name="arrowLeft" size={24} color={colors.text} />
          </Pressable>
          <BrandMark width={74} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Pressable accessibilityRole="button" onPress={start} style={h.headerCta}>
            <Text style={h.headerCtaText}>바로 체험하기</Text>
          </Pressable>
        </View>
      </View>
      <ScrollYContext.Provider value={scrollY}>
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={h.content}>
          <View style={h.mode}>
            <View style={[h.modeDot, { backgroundColor: demo ? colors.faint : colors.primary }]} />
            <Text style={[styles.badgeText, { color: colors.demoText, fontWeight: '600' }]} numberOfLines={1}>
              {demo ? '시연 모드 · 합성 데이터' : `서버 연결: ${api.label}`}
            </Text>
          </View>
          {splashDone ? (
            <>
              <Hero />
              <PhoneStory />
              <Clues />
              <Compare />
              <Steps />
              <ResultPreview />
              <Limits />
              <RevealOnScroll style={{ gap: space.lg }}>
                <Text accessibilityRole="header" style={h.final}>
                  직접 확인해 볼까요?
                </Text>
                {events.status === 'idle' || events.status === 'loading' ? (
                  <Skeleton lines={3} />
                ) : events.status === 'error' ? (
                  <View style={h.card}>
                    <Text style={type.caption}>지금 확인할 수 있는 공연</Text>
                    <InlineError text="공연 정보를 불러오지 못했어요." />
                    <Pill label="다시 시도" icon="refresh" onPress={() => void searchEvents('')} />
                  </View>
                ) : events.data.length === 0 ? (
                  <View style={h.card}>
                    <Text style={type.caption}>지금 확인할 수 있는 공연</Text>
                    <Text style={[type.body, { color: colors.muted }]}>아직 확인할 수 있는 공연이 없어요.</Text>
                  </View>
                ) : (
                  <ShowCard event={events.data[0]} more={events.data.length - 1} />
                )}
                <Button label="서비스 체험하러 가기 →" onPress={start} disabled={events.status !== 'success'} />
                <Text style={[type.caption, { textAlign: 'center' }]}>티켓 진위·입장 가능 여부를 보증하지 않아요.</Text>
                <Pressable accessibilityRole="link" onPress={() => router.push('/admin')} style={h.link}>
                  <Text style={[type.caption, { textAlign: 'center' }]}>주최 측 제보함</Text>
                </Pressable>
                <FooterNote />
              </RevealOnScroll>
            </>
          ) : null}
        </Animated.ScrollView>
      </ScrollYContext.Provider>
    </SafeAreaView>
  );
}

// 실제 API/시연 목록의 첫 공연(웹 '직접 확인해 볼까요?' 카드와 같은 정보).
function ShowCard({ event, more }: { event: EventSummary; more: number }) {
  const first = event.showtimes[0];
  return (
    <View style={h.card}>
      <Text style={type.caption}>지금 확인할 수 있는 공연</Text>
      {event.isDemo ? (
        <View style={h.demoTag}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.demoText }}>시연 데이터</Text>
        </View>
      ) : null}
      <Text style={[type.title, { fontWeight: '800' }]}>{event.title}</Text>
      <Text style={type.caption}>
        {[first ? `${showtimeLabel(first)}${event.showtimes.length > 1 ? ` 외 ${event.showtimes.length - 1}회` : ''}` : null, event.venue]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <Text style={type.caption}>
        {event.officialUrl ? `공식 자료 확인: ${formatKst(event.sourceCheckedAt)}` : '공식 자료 미등록 · 가격·규정 대조가 보류됩니다'}
      </Text>
      {more > 0 ? <Text style={type.caption}>외 {more}개 공연은 다음 단계에서 고를 수 있어요.</Text> : null}
    </View>
  );
}

const h = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 2,
  },
  headerCta: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    ...shadow.cta,
  },
  headerCtaText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: -0.28 },
  content: { paddingHorizontal: 20, paddingTop: space.md, paddingBottom: space.xxxl, gap: 72 },
  mode: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: -48,
  },
  modeDot: { width: 6, height: 6, borderRadius: 3 },
  final: { ...type.display, fontSize: 28, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.home, padding: 18, gap: 6, ...shadow.card },
  demoTag: { alignSelf: 'flex-start', backgroundColor: colors.chip, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  link: { minHeight: MIN_TOUCH, justifyContent: 'center' },
});
