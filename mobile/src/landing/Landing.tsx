import { useEffect, useState } from 'react';
import { useWindowDimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { Icon } from '../components/ui';
import { colors, radius, shadow, space, type } from '../ui/theme';
import { ProgressSection, RevealOnScroll } from './scroll';

// 웹 Landing.tsx(2026-11-03 배포본)와 같은 이야기 순서·문구를 네이티브로 옮긴 홈 구간들(APP-018).
// 모든 예시는 가상 공연·가상 판매글이다(웹과 같은 '가상' 표시). 값은 화면 설명용 고정 문구이며 판정이 아니다.

// ── 공용 ──
function Eyebrow({ children }: { children: string }) {
  return <Text style={s.eyebrow}>{children}</Text>;
}
function H2({ children }: { children: string }) {
  return (
    <Text accessibilityRole="header" style={s.h2}>
      {children}
    </Text>
  );
}
function Tag({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'check' | 'info' }) {
  const t = { neutral: [colors.chip, colors.demoText], check: [colors.peachBg, colors.checkText], info: [colors.liveBg, colors.liveText] }[tone];
  return (
    <View style={[s.tag, { backgroundColor: t[0] }]}>
      <Text style={[s.tagText, { color: t[1] }]}>{children}</Text>
    </View>
  );
}

// ── 1. 히어로: 결제 전에, 잠깐 + 기울어진 가상 티켓 ──
export function Hero() {
  return (
    <View style={{ gap: space.lg }}>
      <RevealOnScroll distance={18}>
        <TicketArt />
      </RevealOnScroll>
      <View style={{ gap: space.sm }}>
        <Eyebrow>결제 전에, 잠깐</Eyebrow>
        <Text accessibilityRole="header" style={s.display}>
          그 티켓,{'\n'}정말 이 조건이 맞을까요?
        </Text>
        <Text style={[type.body, { color: colors.muted }]}>판매글 한 줄과 공식 안내 한 줄. 나란히 놓으면 보이는 것들이 있어요.</Text>
      </View>
      <View style={s.quoteCard}>
        <Tag>예시 판매글 · 가상</Tag>
        <Text style={[type.body, { fontWeight: '500' }]}>
          “임곡대동제 티켓 1장 양도해요.{'\n'}19,770원이고 입금 먼저 해주시면{'\n'}QR 캡처 바로 보내드려요.”
        </Text>
      </View>
    </View>
  );
}

// 웹 TicketArt 와 같은 구성의 가상 티켓(남색 몸통 · 점선 절취선 · ADMIT ONE · 바코드). 3D 모델 대신 도형.
export function TicketArt() {
  return (
    <View style={s.ticketWrap} accessible accessibilityLabel="가상 티켓 예시: 2026 임곡대동제, 19,770원">
      <View style={s.ticket}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.ticketBrand}>TICKET RADAR</Text>
            <View style={s.ticketPill}>
              <Text style={s.ticketPillText}>가상 티켓</Text>
            </View>
          </View>
          <Text style={s.ticketTitle}>2026 임곡대동제</Text>
          <View style={s.ticketPrice}>
            <Text style={s.ticketPriceText}>₩19,770</Text>
          </View>
        </View>
        <View style={s.perforation} />
        <View style={{ width: 62, alignItems: 'center', gap: 8 }}>
          <Text style={s.admit}>ADMIT{'\n'}ONE</Text>
          <Svg width={40} height={26} viewBox="0 0 40 26">
            {[0, 3, 5, 9, 12, 14, 18, 21, 24, 27, 29, 33, 36].map((x, i) => (
              <Rect key={x} x={x} y={0} width={i % 3 === 0 ? 2 : 1.2} height={26} fill="rgba(255,255,255,0.85)" />
            ))}
          </Svg>
        </View>
      </View>
    </View>
  );
}

// ── 2. 결제하기 전, 한 번 더: 스크롤에 따라 화면이 바뀌는 휴대폰 ──
const PHONE_SCREENS = [
  { tag: '가상 판매글 예시', title: '레이더 라이브\nVIP석 1장', big: '230,000원', body: '입금 먼저 해주시면\nQR 캡처 보내드려요', cta: '공식 안내와 비교' },
  { tag: '가상 공식 안내', title: '입장 조건\n살펴보기', big: '', body: '모바일 티켓은 예매자 본인의 예매처 앱에서 표시해요.\n\n캡처 화면으로는 입장할 수 없어요.', cta: '판매글과 대조 중' },
  { tag: '가상 대조 결과', title: '구매 전\n확인할 점', big: '+76,000원', body: '공식 가격 대비 차이\n캡처 전달 방식 확인 필요', cta: '근거 살펴보기' },
];
const PHONE_COPY = [
  ['판매글에서\n시작해요', '관심 있는 티켓의 조건을 살펴봐요.'],
  ['공식 안내를\n함께 확인해요', '공연별 입장 조건을 한눈에 봐요.'],
  ['구매 전 확인할 점을\n놓치지 않게', '차이와 확인이 필요한 이유를 보여드려요.'],
];

export function PhoneStory() {
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  return (
    <ProgressSection style={{ gap: space.lg }}>
      {(scrollY, layout) => {
        // 구간 안에서 화면을 3단계로 나눠 바꾼다. 동작 줄이기면 세 화면을 위에서 아래로 나란히 보여준다.
        const range = (i: number) => {
          const top = (layout?.y ?? 0) - height * 0.35;
          const span = Math.max(1, (layout?.h ?? 900) * 0.6) / 3;
          // 앞 화면이 완전히 사라진 뒤 다음 화면이 들어온다(겹쳐 보이는 글자 방지, APP-018 화면 점검).
          return [top + span * i, top + span * (i + 0.2), top + span * (i + 0.8), top + span * (i + 1)];
        };
        return (
          <>
            <View style={{ gap: space.sm }}>
              <Eyebrow>결제하기 전, 한 번 더</Eyebrow>
              <Text style={[type.caption]}>판매글과 공식 안내를 대조하는 세 단계 · 가상 예시</Text>
            </View>
            {reduced ? (
              PHONE_SCREENS.map((p, i) => <PhoneCopyAndFrame key={p.tag} i={i} />)
            ) : (
              <View style={{ alignItems: 'center', gap: space.lg }}>
                <View style={{ minHeight: 96, alignSelf: 'stretch' }}>
                  {PHONE_COPY.map((c, i) => (
                    <Fade key={i} scrollY={scrollY} r={range(i)} first={i === 0} last={i === 2} absolute={i > 0}>
                      <Text style={s.h2}>{c[0]}</Text>
                      <Text style={[type.sub, { marginTop: 4 }]}>{c[1]}</Text>
                    </Fade>
                  ))}
                </View>
                <Phone>
                  {PHONE_SCREENS.map((p, i) => (
                    <Fade key={p.tag} scrollY={scrollY} r={range(i)} first={i === 0} last={i === 2} absolute={i > 0} fill>
                      <PhoneScreen {...p} />
                    </Fade>
                  ))}
                </Phone>
              </View>
            )}
          </>
        );
      }}
    </ProgressSection>
  );
}

function PhoneCopyAndFrame({ i }: { i: number }) {
  return (
    <View style={{ gap: space.md, alignItems: 'center' }}>
      <View style={{ alignSelf: 'stretch' }}>
        <Text style={s.h2}>{PHONE_COPY[i][0]}</Text>
        <Text style={type.sub}>{PHONE_COPY[i][1]}</Text>
      </View>
      <Phone>
        <PhoneScreen {...PHONE_SCREENS[i]} />
      </Phone>
    </View>
  );
}

function Fade({
  scrollY,
  r,
  first,
  last,
  absolute,
  fill,
  children,
}: {
  scrollY: SharedValue<number> | null;
  r: number[];
  first: boolean;
  last: boolean;
  absolute?: boolean;
  fill?: boolean;
  children: React.ReactNode;
}) {
  const a = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: first ? 1 : 0 };
    const v = scrollY.value;
    const inP = first ? 1 : interpolate(v, [r[0], r[1]], [0, 1], Extrapolation.CLAMP);
    const outP = last ? 1 : interpolate(v, [r[2], r[3]], [1, 0], Extrapolation.CLAMP);
    const o = Math.min(inP, outP);
    return { opacity: o, transform: [{ translateY: (1 - o) * 10 }] };
  });
  return (
    <Animated.View style={[absolute && (fill ? StyleSheet.absoluteFill : { position: 'absolute', left: 0, right: 0, top: 0 }), a]}>
      {children}
    </Animated.View>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.phone} accessible={false}>
      <View style={s.phoneScreen}>
        <View style={s.notch} />
        <Text style={s.phoneTime}>9:41</Text>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}

function PhoneScreen({ tag, title, big, body, cta }: (typeof PHONE_SCREENS)[number]) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 44, paddingBottom: 18, gap: 10 }}>
      <View style={[s.tag, { backgroundColor: colors.liveBg }]}>
        <Text style={[s.tagText, { color: colors.liveText }]}>{tag}</Text>
      </View>
      <Text style={{ fontSize: 20, lineHeight: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.4 }}>{title}</Text>
      {big ? <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>{big}</Text> : null}
      <Text style={[type.caption, { lineHeight: 18 }]}>{body}</Text>
      <View style={{ flex: 1 }} />
      <View style={s.phoneCta}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{cta}</Text>
      </View>
    </View>
  );
}

// ── 3. 판매글 속 단서: 형광펜 강조 + 질문 칩 + 단어가 차례로 진해지는 문장 ──
const WORDS = ['이 말들,', '어디까지', '믿어도', '될까요?'];

export function Clues() {
  const { height } = useWindowDimensions();
  return (
    <ProgressSection style={{ gap: space.lg }}>
      {(scrollY, layout) => (
        <>
          <RevealOnScroll>
            <Eyebrow>판매글 속 단서</Eyebrow>
            <H2>판매글은 보통 이렇게 생겼어요</H2>
          </RevealOnScroll>
          <RevealOnScroll style={s.whiteCard}>
            <Tag>가상 공연 예시</Tag>
            <MarkedListing scrollY={scrollY} at={(layout ? layout.y : 0) - height * 0.55} />
          </RevealOnScroll>
          <View style={{ gap: space.sm }}>
            {['정가보다 얼마나 비쌀까?', '돈부터 보내도 괜찮을까?', '캡처 화면으로 정말 들어갈 수 있을까?'].map((q, i) => (
              <RevealOnScroll key={q} offset={i * 40} distance={16}>
                <View style={s.peachChip}>
                  <Text style={s.peachText}>{q}</Text>
                </View>
              </RevealOnScroll>
            ))}
          </View>
          <View accessible accessibilityRole="header" accessibilityLabel="이 말들, 어디까지 믿어도 될까요?" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {WORDS.map((w, i) => (
              <LitWord key={w} word={w} scrollY={scrollY} at={(layout ? layout.y + layout.h * 0.55 : 0) - height * 0.75 + i * 60} />
            ))}
          </View>
        </>
      )}
    </ProgressSection>
  );
}

// 형광펜이 판매글 속 단서 4곳을 차례로 칠한다(APP-028). 구간이 화면에 들어오면 0.22초 간격으로 하나씩.
// 동작 줄이기·스크롤 정보 없음이면 처음부터 모두 칠해진 상태.
const MARKS = ['230,000원', '입금 먼저 해주시면', 'QR 캡처 바로 보내드려요.', '캡처로 입장 가능합니다.'];
function MarkedListing({ scrollY, at }: { scrollY: SharedValue<number> | null; at: number }) {
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const [lit, setLit] = useState(0);
  useAnimatedReaction(
    () => (scrollY ? scrollY.value >= at : true),
    (now, prev) => {
      if (now && !prev) runOnJS(setSeen)(true);
    },
    [at],
  );
  useEffect(() => {
    if (!seen || reduced) return;
    const timers = MARKS.map((_, i) => setTimeout(() => setLit(i + 1), 160 + i * 220));
    return () => timers.forEach(clearTimeout);
  }, [seen, reduced]);
  const n = reduced || !scrollY ? MARKS.length : lit;
  const m = (i: number) => [s.markBase, i < n && s.mark];
  return (
    <Text style={[type.body, { lineHeight: 27 }]}>
      레이더 라이브 11/21(토) 저녁 공연 VIP석 1장 양도합니다. <Text style={m(0)}>{MARKS[0]}</Text>이고 <Text style={m(1)}>{MARKS[1]}</Text>{' '}
      <Text style={m(2)}>{MARKS[2]}</Text> <Text style={m(3)}>{MARKS[3]}</Text>
    </Text>
  );
}

function LitWord({ word, scrollY, at }: { word: string; scrollY: SharedValue<number> | null; at: number }) {
  const reduced = useReducedMotion();
  const a = useAnimatedStyle(() => ({
    color: reduced || !scrollY ? colors.text : interpolateColor(scrollY.value, [at, at + 80], ['#C9CEDB', colors.text]),
  }));
  return <Animated.Text style={[s.display, { fontSize: 30, lineHeight: 38 }, a]}>{word}</Animated.Text>;
}

// ── 4. 공식 안내와 나란히: 판매글 ↔ 공식 안내 연결선 + 가격 차이 ──
export function Compare() {
  return (
    <View style={{ gap: space.md }}>
      <RevealOnScroll>
        <Eyebrow>공식 안내와 나란히</Eyebrow>
        <H2>공식 안내를 옆에 놓아 보면</H2>
      </RevealOnScroll>
      <RevealOnScroll style={s.whiteCard}>
        <Text style={type.caption}>판매글</Text>
        <Text style={[type.body, { fontWeight: '700' }]}>“캡처로 입장 가능합니다.”</Text>
      </RevealOnScroll>
      <Connector />
      <RevealOnScroll style={[s.whiteCard, { borderColor: colors.primary, borderWidth: 1.5 }]}>
        <Text style={type.caption}>공식 안내</Text>
        <Text style={type.body}>모바일 티켓은 예매자 본인 휴대폰의 예매처 앱에서만 표시되며, 캡처 화면으로는 입장할 수 없습니다.</Text>
      </RevealOnScroll>
      <RevealOnScroll>
        <Tag tone="check">공식 안내와 다른 설명</Tag>
      </RevealOnScroll>
      <RevealOnScroll style={s.whiteCard}>
        <Text style={type.caption}>판매가</Text>
        <Text style={s.money}>230,000원</Text>
      </RevealOnScroll>
      <Connector />
      <RevealOnScroll style={[s.whiteCard, { borderColor: colors.primary, borderWidth: 1.5 }]}>
        <Text style={type.caption}>공식 VIP석 기본가</Text>
        <Text style={s.money}>154,000원</Text>
      </RevealOnScroll>
      <RevealOnScroll>
        <Text style={[type.title, { fontWeight: '700' }]}>
          같은 공연·회차·좌석일 때 <Text style={{ color: colors.hot, fontSize: 24, fontWeight: '800' }}>+76,000원</Text> 차이
        </Text>
        <Text style={[type.caption, { marginTop: 4 }]}>가상 공연 예시입니다. 가격 차이만으로 불법 여부를 판단하지 않아요.</Text>
      </RevealOnScroll>
    </View>
  );
}

function Connector() {
  return (
    <View style={{ alignItems: 'center', height: 18 }} accessible={false}>
      <Svg width={2} height={18}>
        <Line x1={1} y1={0} x2={1} y2={18} stroke={colors.hot} strokeWidth={2} />
      </Svg>
    </View>
  );
}

// ── 5. 세 단계면 충분해요 ──
const STEPS = [
  ['판매글을 붙여넣어요', '가격·좌석·회차·전달 방식 후보를 찾아 보여드려요. 직접 입력할 수도 있어요.'],
  ['읽은 값을 확인하고 고쳐요', '후보는 후보일 뿐. 판매글 근거 문구를 보고 직접 확정해요.'],
  ['공식 자료와 대조해요', '같은 공연·회차·좌석·조건일 때만 가격을 비교하고, 다르면 비교를 멈춰요.'],
];

export function Steps() {
  return (
    <View style={{ gap: space.lg }}>
      <RevealOnScroll>
        <Eyebrow>이렇게 확인해요</Eyebrow>
        <H2>세 단계면 충분해요</H2>
      </RevealOnScroll>
      {STEPS.map(([t, d], i) => (
        <RevealOnScroll key={t} offset={i * 50} style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ alignItems: 'center' }}>
            <View style={s.stepNum}>
              <Text style={s.stepNumText}>{i + 1}</Text>
            </View>
            {i < STEPS.length - 1 ? <View style={s.stepRail} /> : null}
          </View>
          <View style={{ flex: 1, gap: 4, paddingBottom: space.md }}>
            <Text style={[type.title, { fontWeight: '700' }]}>{t}</Text>
            <Text style={type.sub}>{d}</Text>
          </View>
        </RevealOnScroll>
      ))}
    </View>
  );
}

// ── 6. 결과 미리보기 ──
export function ResultPreview() {
  return (
    <View style={{ gap: space.md }}>
      <RevealOnScroll>
        <Eyebrow>결과 미리보기</Eyebrow>
        <H2>근거와 함께 보여드려요</H2>
      </RevealOnScroll>
      <RevealOnScroll style={[s.whiteCard, { gap: space.md }]}>
        <Tag>예시 결과 · 가상 공연</Tag>
        <View>
          <Text style={type.caption}>공식 가격 대비</Text>
          <Text style={[s.money, { fontSize: 30 }]}>+76,000원</Text>
        </View>
        {[
          ['공식 안내와 다른 설명', '전달 방식이 공식 입장 안내와 다름', 'check'],
          ['공식 안내와 다른 설명', '양도 제한 안내와 다른 판매 방식', 'check'],
          ['추가 확인 필요', '입금을 먼저 요구하는 문구', 'neutral'],
        ].map(([b, t, tone]) => (
          <View key={t} style={s.miniRow}>
            <Tag tone={tone as 'check' | 'neutral'}>{b}</Tag>
            <Text style={[type.sub, { color: colors.text, fontWeight: '600' }]}>{t}</Text>
          </View>
        ))}
        <Text style={type.caption}>각 항목에 판매글 문구·공식 문구·출처 링크·확인일이 함께 붙어요.</Text>
      </RevealOnScroll>
    </View>
  );
}

// ── 7. 판단하지 않는 것 ──
export function Limits() {
  const items: [Parameters<typeof Icon>[0]['name'], string, string][] = [
    ['x', '티켓 진위', '진짜 티켓인지 인증하지 않아요.'],
    ['lock', '입장 가능 여부', '현장 입장을 보장하지 않아요.'],
    ['alert', '사기·불법 판정', '판매자나 거래를 판정하지 않아요.'],
  ];
  return (
    <View style={{ gap: space.md }}>
      <RevealOnScroll>
        <Eyebrow>대신, 이건 판단하지 않아요</Eyebrow>
        <H2>결정은 당신이, 근거는 저희가</H2>
      </RevealOnScroll>
      {items.map(([icon, t, d], i) => (
        <RevealOnScroll key={t} offset={i * 40} style={[s.whiteCard, { flexDirection: 'row', alignItems: 'center', gap: space.md }]}>
          <View style={s.limitIcon}>
            <Icon name={icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.title, { fontWeight: '700' }]}>{t}</Text>
            <Text style={type.sub}>{d}</Text>
          </View>
        </RevealOnScroll>
      ))}
      <RevealOnScroll>
        <Text style={[type.body, { fontWeight: '600' }]}>공식 안내와 어긋나는 지점을 찾아, 구매 전 예매처에 확인할 수 있게 도와드려요.</Text>
      </RevealOnScroll>
    </View>
  );
}

const s = StyleSheet.create({
  eyebrow: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: -0.2, marginBottom: 6 },
  h2: { ...type.h1, fontSize: 24, lineHeight: 32, fontWeight: '800' },
  display: { ...type.display, fontSize: 30, lineHeight: 39, fontWeight: '800' },
  tag: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '700' },
  quoteCard: { backgroundColor: colors.surface, borderRadius: radius.home, padding: 18, gap: 10, ...shadow.card },
  whiteCard: { backgroundColor: colors.surface, borderRadius: radius.panel, padding: 16, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow.card },
  ticketWrap: { alignItems: 'center', paddingVertical: space.lg, transform: [{ rotate: '-8deg' }] },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
    gap: 12,
    ...shadow.float,
  },
  ticketBrand: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  ticketPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  ticketPillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  ticketTitle: { color: '#fff', fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  ticketPrice: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  ticketPriceText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  perforation: { width: 0, alignSelf: 'stretch', borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.45)' },
  admit: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', lineHeight: 17 },
  phone: { width: 236, height: 470, borderRadius: 44, padding: 9, backgroundColor: '#1B2236', ...shadow.float },
  phoneScreen: { flex: 1, borderRadius: 36, backgroundColor: '#fff', overflow: 'hidden' },
  notch: { position: 'absolute', top: 10, alignSelf: 'center', width: 78, height: 22, borderRadius: 11, backgroundColor: '#0B0F1A', zIndex: 2 },
  phoneTime: { position: 'absolute', top: 12, left: 22, fontSize: 12, fontWeight: '700', color: colors.text },
  phoneCta: { alignSelf: 'stretch', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 11 },
  markBase: { color: colors.text, fontWeight: '700' },
  mark: { backgroundColor: 'rgba(234,88,12,0.18)', textDecorationLine: 'underline', textDecorationColor: colors.hot },
  peachChip: { alignSelf: 'flex-start', backgroundColor: colors.peachBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  peachText: { color: colors.checkText, fontWeight: '700', fontSize: 14 },
  money: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800' },
  stepRail: { width: 2, flex: 1, backgroundColor: colors.chipSelected, marginTop: 4 },
  miniRow: { gap: 6, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  limitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.liveBg, alignItems: 'center', justifyContent: 'center' },
});
