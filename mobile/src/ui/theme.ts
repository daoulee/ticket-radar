// 다크 토큰은 참고 자료로만 보존(테마 전환 미구현). 셰이더 효과(glsl 원본 없음)는 재현하지 않는다.
// 웹 최신 토큰(web/src/index.css :root, 2026-11-03)과 같은 값(APP-018). 기존 키 이름은 유지하고 값만 바꾼다.
export const colors = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  card: 'rgba(64,72,144,0.05)', // --card
  inner: 'rgba(64,72,144,0.08)', // --inner
  chip: '#EAECF5', // --chip
  chipSelected: '#D4D8ED', // --chip-selected
  text: '#13233A', // --ink
  muted: '#526173', // --sub
  faint: '#8390A0', // --weak: 장식·비활성 전용
  border: '#E3E6F0', // --line(rgba(19,35,58,.08))을 흰 바탕 위 불투명 값으로
  primary: '#404890', // --primary
  primaryPressed: '#333A78',
  primaryText: '#FFFFFF',
  accent: '#8D95CE', // 웹 보조 라벤더(장식)
  link: '#333A78',
  wash: '#F1F2FA', // 웹 바탕 연보라
  hot: '#EA580C', // 웹 가격 차이 강조(+76,000원)
  peachBg: '#FFEDD5', // 질문 칩·확인 필요 배경
  demoBg: '#EAECF5', // --neutral-bg
  demoText: '#4A5568', // --neutral
  liveBg: '#EAECF8', // --info-bg
  liveText: '#333A78', // --info
  conflictBg: '#FEF3C7', // --caution-bg
  conflictText: '#92400E', // --caution
  checkBg: '#FFEDD5', // --check-bg
  checkText: '#9A3412', // --check
  okBg: '#EAECF8', // 선택·비교 성립(안전 아님)
  okText: '#333A78',
  unknownBg: '#EAECF5',
  unknownText: '#4A5568',
  errorBg: '#FEE2E2', // 입력·통신·실행 오류만
  errorText: '#B91C1C',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

// 버튼은 pill. 카드 16, 홈 카드 20, 안쪽 12.
export const radius = { button: 999, input: 12, panel: 16, home: 20, pill: 999 };

// 모션은 장식(D11). brandMax 를 넘는 브랜드 모션을 만들지 않는다.
export const motionMs = { press: 120, disclosure: 180, content: 200, brandMax: 700 };

// 손가락으로 누르기 쉬운 최소 크기(iOS HIG 44pt, Android 48dp의 중간값 이상).
export const MIN_TOUCH = 48;

// 시안 CTA 높이. 버튼 최소 높이로 사용(MIN_TOUCH 이상).
export const CTA_HEIGHT = 54;

// ── APP-012 대개편: 웹(Pen 팔레트 + 토스 규칙)과 맞춘 글자 단계·그림자·브랜드 색 ──
// 글자: 자간은 항상 살짝 좁게(토스 규칙 -0.02em ≈ 글자 크기 × -0.02), 제목은 과감한 대비, 본문 행간 넉넉.
const tracking = (size: number) => Math.round(size * -0.02 * 100) / 100;
export const type = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '800' as const, letterSpacing: tracking(32), color: colors.text },
  h1: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: tracking(26), color: colors.text },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, letterSpacing: tracking(20), color: colors.text },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const, letterSpacing: tracking(17), color: colors.text },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' as const, letterSpacing: tracking(16), color: colors.text },
  sub: { fontSize: 14, lineHeight: 21, fontWeight: '500' as const, letterSpacing: tracking(14), color: colors.muted },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' as const, letterSpacing: tracking(13), color: colors.muted },
  // 가격 숫자: 자릿수 정렬(tabular) — iOS 지원.
  price: { fontSize: 30, lineHeight: 38, fontWeight: '800' as const, letterSpacing: tracking(30), fontVariant: ['tabular-nums' as const] },
};

// 그림자: 테두리 대신 아주 흐린 두 겹(웹 --tr-shadow-card). RN은 그림자 한 겹이라 iOS 값으로 근사하고 Android는 elevation.
export const shadow = {
  card: { shadowColor: '#0B1220', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  float: { shadowColor: '#0B1220', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  cta: { shadowColor: '#404890', shadowOpacity: 0.26, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
};

// 사용자 제작 로고의 고유색. Splash·브랜드 표시에만 쓰고 UI 상태색(오류·경고)으로 쓰지 않는다(D02).
export const brand = {
  ink: '#0B0B0D',
  red: '#FF1A1A',
  paper: '#FFFFFF',
};

// 화면 등장 모션 값(ms). 짧고 작은 이동만(D: 등장 180~220ms, 이동 최대 8px).
export const enter = { duration: 240, stagger: 55, distance: 8 };
