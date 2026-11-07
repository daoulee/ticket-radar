import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toApiError } from '../../api/client';
import type { BookingType, Delivery, Performance, Safety, ShowDetail, ShowSummary } from '../../market/api';
import { deliveryText } from '../../market/engine';
import { useMarket } from '../../market/MarketContext';
import Animated, { FadeInRight, FadeInLeft, ReduceMotion } from 'react-native-reanimated';
import { Chips, CTA, ErrorLine, Row, t, toneColor, tt, won } from '../../ui/toss';
import { Appear, Marker, SkeletonRows, StepBar } from '../../ui/motion';
import { ShowArt } from '../../ui/ShowArt';
import { NUMPAD_DONE_ID, NumpadDone } from '../../components/ui';

// 판매 등록(V2-7): 한 화면에 질문 하나 · 3단계(공연·회차 → 좌석·조건 → 가격). 가격 입력 즉시 정가와 비교(서버/엔진 계산).
const DELIVERIES: Delivery[] = ['official_transfer', 'qr_capture', 'onsite', 'courier'];
const BOOKINGS: { key: BookingType; label: string }[] = [
  { key: 'general', label: '일반 예매' },
  { key: 'fanclub_presale', label: '팬클럽 선예매' },
  { key: 'unknown', label: '모르겠어요' },
];

export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const { api, token, bump } = useMarket();
  const [step, setStepRaw] = useState(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const setStep = (n: number) => {
    setDir(n >= step ? 1 : -1);
    setStepRaw(n);
  };
  const [shows, setShows] = useState<ShowSummary[] | null>(null);
  const [performances, setPerformances] = useState<Performance[] | null>(null);
  const [performancePage, setPerformancePage] = useState(1);
  const [performanceMore, setPerformanceMore] = useState(false);
  const [performanceBusy, setPerformanceBusy] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ShowDetail | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [qty, setQty] = useState('1');
  const [booking, setBooking] = useState<BookingType>('general');
  const [delivery, setDelivery] = useState<Delivery>('official_transfer');
  const [price, setPrice] = useState('');
  const [preview, setPreview] = useState<Safety | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      api.shows({}).then((s) => alive && setShows(s), (e) => alive && setError(toApiError(e).message));
      if (api.mode === 'live') api.performances(null, 1).then((items) => { if (alive) { setPerformances(items); setPerformancePage(1); setPerformanceMore(items.length === 30); setPerformanceError(null); } }, (e) => { if (alive) setPerformanceError(toApiError(e).message); });
      return () => {
        alive = false;
      };
    }, [api]),
  );
  async function morePerformances(retryFirst = false) {
    if (performanceBusy) return;
    setPerformanceBusy(true); setPerformanceError(null);
    try {
      const page = retryFirst ? 1 : performancePage + 1;
      const items = await api.performances(null, page);
      setPerformances((old) => retryFirst ? items : [...(old ?? []), ...items.filter((item) => !(old ?? []).some((existing) => existing.id === item.id))]);
      setPerformancePage(page); setPerformanceMore(items.length === 30);
    } catch (e) { setPerformanceError(toApiError(e).message); }
    finally { setPerformanceBusy(false); }
  }
  const amount = Number(price.replace(/[^0-9]/g, ''));
  const faceLimit = detail?.show.facePrices.find((tier) => tier.seatGrade === grade)?.price;
  const priceAllowed = !!detail?.show.faceSource && typeof faceLimit === 'number' && faceLimit > 0 && amount >= 1000 && amount <= faceLimit;
  useEffect(() => {
    if (!detail || !grade || !amount) return;
    let alive = true;
    const h = setTimeout(() => {
      api.preview({ showId: detail.show.id, seatGrade: grade, pricePerTicket: amount, delivery, bookingType: booking }).then((p) => alive && setPreview(p), () => undefined);
    }, 250);
    return () => {
      alive = false;
      clearTimeout(h);
    };
  }, [api, detail, grade, amount, delivery, booking]);

  async function pickShow(id: string) {
    setError(null);
    try {
      const d = await api.show(id);
      setDetail(d);
      setSessionId(d.show.sessions[0]?.id ?? null);
      setGrade(d.show.facePrices[0]?.seatGrade ?? null);
      setStep(2);
    } catch (e) {
      setError(toApiError(e).message);
    }
  }
  async function submit() {
    if (!token || !detail || !sessionId || !grade) return;
    setBusy(true);
    setError(null);
    try {
      const { listing } = await api.createListing(token, { showId: detail.show.id, sessionId, seatGrade: grade, quantity: Number(qty), pricePerTicket: amount, delivery, bookingType: booking });
      bump();
      setStep(1); setDetail(null); setPrice(''); setPreview(null);
      router.push(`/item/${encodeURIComponent(listing.id)}?created=1`);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  }

  const head = (title: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, height: 48 }}>
      {step > 1 ? <Text accessibilityRole="button" onPress={() => setStep(step - 1)} style={[tt.body, { padding: 12 }]}>이전</Text> : <View />}
      <Text style={[tt.body, { color: t.g5, padding: 12 }]}>{step}/3</Text>
      <Text style={{ position: 'absolute', opacity: 0 }}>{title}</Text>
    </View>
  );
  if (!token)
    return (
      <View style={{ flex: 1, backgroundColor: t.white, paddingTop: insets.top + 20, paddingHorizontal: 24, gap: 16 }}>
        <Text accessibilityRole="header" style={tt.hero}>{'티켓을\n팔아 볼까요?'}</Text>
        <Text style={[tt.body, { color: t.g5 }]}>판매하려면 로그인이 필요해요.</Text>
        <CTA label="로그인하기" onPress={() => router.push('/login')} />
      </View>
    );
  return (
    <View style={{ flex: 1, backgroundColor: t.white, paddingTop: insets.top }}>
      {head('판매 등록')}
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <StepBar steps={['공연', '좌석·조건', '가격']} done={step} />
      </View>
      {/* 단계 전환: 다음은 오른쪽에서, 이전은 왼쪽에서 들어온다(APP-028) */}
      <Animated.View key={step} entering={(dir > 0 ? FadeInRight : FadeInLeft).duration(260).reduceMotion(ReduceMotion.System)} style={{ flex: 1, paddingHorizontal: 24, gap: 20 }}>
        {step === 1 ? (
          <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 32 }}>
            <Text accessibilityRole="header" style={tt.hero}>{'어떤 티켓을\n파세요?'}</Text>
            {api.mode === 'live' && <View style={{ gap: 8 }}>
              <Text style={tt.h2}>KOPIS 공연 정보</Text>
              <Text style={tt.desc}>오늘부터 30일간의 공연 정보예요.</Text>
              {!performances && !performanceError && <SkeletonRows count={3} />}
              {performances?.map((show) => <Row key={show.id} art={<SellPoster url={show.posterUrl} />} title={show.title} desc={`${show.startsOn} ~ ${show.endsOn} · ${show.venue ?? '장소 미제공'}`} />)}
              {performances?.length === 0 && <Text style={tt.desc}>이 기간에 조회된 공연이 없어요.</Text>}
              {performanceError && <ErrorLine text={performanceError} onRetry={() => void morePerformances(!performances)} />}
              {performanceMore && !performanceError && <Pressable accessibilityRole="button" accessibilityLabel="공연 더 보기" onPress={() => void morePerformances()} disabled={performanceBusy} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[tt.body, { color: t.primary }]}>{performanceBusy ? '불러오는 중...' : '공연 더 보기'}</Text></Pressable>}
            </View>}
            <Text style={tt.h2}>판매 등록 가능 공연</Text>
            <Text style={tt.desc}>시연 거래 · 실제 결제는 진행되지 않아요</Text>
            {error ? <ErrorLine text={error} /> : !shows ? <SkeletonRows count={4} /> : shows.filter((s) => s.canRegister !== false).map((s, i) => (
              <Appear key={s.id} index={i}>
                <Row art={<ShowArt id={s.id} category={s.category} size={48} imageUrl={s.posterUrl} />} title={s.title} desc={`${s.firstSession ?? ''} · ${s.venue}`} end="chevronRight" onPress={() => void pickShow(s.id)} />
              </Appear>
            ))}
          </ScrollView>
        ) : step === 2 && detail ? (
          <>
            <Text accessibilityRole="header" style={tt.hero}>{'좌석과 받는 방법을\n알려 주세요'}</Text>
            <Label text="회차" />
            <Chips items={detail.show.sessions.map((s) => ({ key: s.id, label: s.label }))} value={sessionId ?? ''} onChange={setSessionId} />
            <Label text="좌석 등급" />
            <Chips items={detail.show.facePrices.map((f) => ({ key: f.seatGrade, label: f.seatGrade }))} value={grade ?? ''} onChange={setGrade} />
            <Label text="매수" />
            <Chips items={['1', '2', '3', '4'].map((q) => ({ key: q, label: `${q}매` }))} value={qty} onChange={setQty} />
            <Label text="예매 유형" />
            <Chips items={BOOKINGS} value={booking} onChange={setBooking} />
            <Label text="전달 방식" />
            <Chips items={DELIVERIES.map((d) => ({ key: d, label: deliveryText(d) }))} value={delivery} onChange={setDelivery} />
          </>
        ) : detail ? (
          <>
            <View style={{ gap: 6 }}>
              <Text accessibilityRole="header" style={tt.hero}>{'얼마에\n파실 건가요?'}</Text>
              <Text style={[tt.body, { color: t.g5 }]}>{detail.show.title.replace('[가상] ', '')} · {grade} {qty}매</Text>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: t.primary }}>장당 가격</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: t.primary, paddingBottom: 8 }}>
                <TextInput accessibilityLabel="장당 가격" value={price ? amount.toLocaleString('ko-KR') : ''} onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, '').slice(0, 8))} keyboardType="number-pad" inputAccessoryViewID={NUMPAD_DONE_ID} placeholder="0" placeholderTextColor={t.g4} style={{ flex: 1, fontSize: 28, fontWeight: '700', color: t.ink }} />
                <Text style={{ fontSize: 28, fontWeight: '700', color: t.ink }}>원</Text>
              </View>
              {preview && amount ? (
                <Appear key={preview.priceTone} style={{ gap: 4 }}>
                  <View accessibilityLiveRegion="polite">
                    <Marker color={preview.priceTone === 'high' ? 'rgba(232,72,59,0.18)' : preview.priceTone === 'good' ? 'rgba(64,72,144,0.16)' : 'transparent'} delay={60} duration={380}>
                      <Text style={[tt.body, { fontWeight: '600', color: toneColor(preview.priceTone) }]}>
                        {preview.facePrice ? `정가 ${won(preview.facePrice)} · ${preview.priceText}` : preview.priceText}
                      </Text>
                    </Marker>
                  </View>
                  {preview.checks.filter((c) => !c.ok && !c.title.includes('정가')).map((c) => (
                    <Text key={c.title} style={[tt.desc, { color: t.red }]}>· {c.title}</Text>
                  ))}
                  {preview.attention === 0 ? <Text style={tt.desc}>확인할 점이 없어 구매자가 안심하고 볼 수 있어요</Text> : null}
                </Appear>
              ) : null}
              {amount > 0 && !priceAllowed ? <Text style={[tt.desc, { color: t.red }]}>{!detail.show.faceSource || !faceLimit ? '좌석의 기준 가격을 확인할 수 없어 등록할 수 없어요.' : amount < 1000 ? '가격은 1,000원 이상 입력해 주세요.' : '확인된 기준 가격 이하로 입력해 주세요.'}</Text> : null}
            </View>
            {error ? <Text style={[tt.body, { color: t.red }]}>{error}</Text> : null}
          </>
        ) : null}
      </Animated.View>
      <NumpadDone />
      {step > 1 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          {step === 2 ? <CTA label="다음" disabled={!sessionId || !grade} onPress={() => setStep(3)} /> : <CTA label="매물 올리기" busy={busy} disabled={!priceAllowed} onPress={submit} />}
        </View>
      ) : null}
    </View>
  );
}

const Label = ({ text }: { text: string }) => <Text style={{ fontSize: 13, fontWeight: '600', color: t.g5, marginBottom: -10 }}>{text}</Text>;

function SellPoster({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width: 48, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' }}>
    {url && !failed ? <Image source={{ uri: url }} onError={() => setFailed(true)} style={{ width: 48, height: 64 }} resizeMode="cover" /> : <Text style={{ color: t.g5, fontSize: 9 }}>포스터 없음</Text>}
  </View>;
}
