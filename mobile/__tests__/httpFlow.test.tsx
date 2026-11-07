import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Slot } from 'expo-router';
import type { TicketRadarApi } from '../src/api/client';
import { createHttpApi } from '../src/api/httpApi';
import { FlowProvider } from '../src/state/FlowContext';
import AboutScreen from '../src/app/about';
import EventsScreen from '../src/app/events';
import ListingScreen from '../src/app/listing';
import ReviewScreen from '../src/app/review';
import ResultScreen from '../src/app/result';

// 실제 API 모드(HTTP 어댑터 + 공통 계약 검사)에서 화면을 확인한다.
// 서버는 가짜 fetch다. 공연·공식 자료·오류·수동 대조 응답은 Sol이 실제 서버에서 저장한 shared/examples 를 그대로 쓴다.
// Sol 서버·실제 AI와의 왕복 검증이 아니다.
const shared = (name: string) => require(`../../shared/examples/${name}.json`);
const EVENTS = shared('events');
const CONTEXT = shared('official-context');
const AI_NOT_CONFIGURED = shared('ai-not-configured');
const MANUAL_REQUEST = shared('manual-request');
const MANUAL_RESPONSE = shared('manual-response');
const SENTENCE: string = MANUAL_REQUEST.listingText;

// 키 순서와 무관하게 JSON 내용을 비교한다.
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

// 웹식 선택 칸: 칸을 눌러 시트를 연 뒤 선택지를 고른다(APP-018).
async function choose(field: string, option: string) {
  await fireEvent.press(screen.getByLabelText(new RegExp(`^${field} 선택`)));
  const opts = screen.getAllByText(option);
  await fireEvent.press(opts[opts.length - 1]);
}

type CheckHandler = (body: any) => { status: number; body: unknown };

function fakeServer(onCheck: CheckHandler) {
  const calls: any[] = [];
  const f = jest.fn(async (url: string, init?: RequestInit) => {
    const path = url.replace('http://test.local', '');
    let res: { status: number; body: unknown };
    if (path.startsWith('/events?')) res = { status: 200, body: EVENTS };
    else if (path.endsWith('/official-context')) res = { status: 200, body: CONTEXT };
    else {
      const body = JSON.parse(String(init?.body));
      calls.push(body);
      res = onCheck(body);
    }
    return { ok: res.status < 300, status: res.status, json: async () => res.body };
  }) as unknown as typeof fetch;
  return { api: createHttpApi('http://test.local', f), calls };
}

async function renderApp(api: TicketRadarApi, initialUrl = '/events') {
  await renderRouter(
    {
      _layout: () => (
        <FlowProvider api={api}>
          <Slot />
        </FlowProvider>
      ),
      about: AboutScreen,
      events: EventsScreen,
      listing: ListingScreen,
      review: ReviewScreen,
      result: ResultScreen,
    },
    { initialUrl },
  );
}

async function enterSentence() {
  await fireEvent.press(await screen.findByLabelText(/AKMU CONCERT TOUR.*선택/));
  const input = await screen.findByLabelText('판매글 입력');
  // 실제 API 모드에서는 시연 예시 버튼이 없다.
  expect(screen.queryByText(/예시 1/)).toBeNull();
  await fireEvent.changeText(input, SENTENCE);
}

// 테스트 전용 합성 model 응답(추출 단계). 실제 AI 출력이 아니다.
function testModelExtraction(body: any) {
  const u = { status: 'unknown', value: null, evidenceQuote: null };
  const extracted: Record<string, unknown> = Object.fromEntries(Object.keys(MANUAL_REQUEST.confirmedFields).map((k) => [k, u]));
  extracted.price = { status: 'extracted', value: 250000, evidenceQuote: '25만원' };
  return {
    ...MANUAL_RESPONSE,
    checkId: '11111111-1111-4111-8111-111111111111',
    eventId: body.eventId,
    extracted,
    appliedFields: null,
    findings: [],
    priceComparison: { held: true, reason: '추출값 확인 전입니다.' },
    extraction: { method: 'model', provider: 'test-provider', model: 'test-model', actualModelCall: true, reused: false },
  };
}

describe('실제 API 모드 — 공통 계약 응답 표시, 오류를 fixture 성공으로 바꾸지 않음', () => {
  it('AI 미설정(503 AI_NOT_CONFIGURED): 서버 문구, 재시도 없음, 자동 전환 없음 → 사용자가 직접 입력을 고를 수 있다', async () => {
    const { api, calls } = fakeServer(() => ({ status: AI_NOT_CONFIGURED.httpStatus, body: AI_NOT_CONFIGURED.body }));
    await renderApp(api);
    await enterSentence();
    await fireEvent.press(screen.getByText('이 판매글 확인하기'));

    expect(await screen.findByText(AI_NOT_CONFIGURED.body.message)).toBeOnTheScreen();
    expect(screen.getByText('오류 코드: AI_NOT_CONFIGURED')).toBeOnTheScreen();
    expect(screen.queryByText('다시 시도')).toBeNull();
    expect(screen).toHavePathname('/listing');
    expect(calls).toEqual([{ eventId: 'akmu-daegu-20261121', listingText: SENTENCE, syntheticListing: true, extractionMode: 'model' }]);

    await fireEvent.press(screen.getByText('AI 없이 직접 입력'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent(/AI 추출 없음 · 사용자가 직접 입력/);
    expect(calls).toHaveLength(1);
  });

  it('명시적 직접 입력: 화면 선택만으로 Sol 예시 요청과 같은 요청을 만들고, 예시 응답을 그대로 표시한다', async () => {
    const { api, calls } = fakeServer((body) =>
      canonical(body) === canonical(MANUAL_REQUEST)
        ? { status: 200, body: MANUAL_RESPONSE }
        : { status: 400, body: { code: 'TEST_UNEXPECTED_REQUEST', message: JSON.stringify(body), retryable: false } },
    );
    await renderApp(api);
    await enterSentence();
    await fireEvent.press(screen.getByText('AI 없이 직접 입력'));
    await waitFor(() => expect(screen).toHavePathname('/review'));

    await choose('회차', '11월 21일 (토) 17:00');
    await choose('좌석 등급', 'VIP석');
    await fireEvent.changeText(screen.getByLabelText('가격 입력'), '250000');
    await fireEvent.changeText(screen.getByLabelText('매수 입력'), '1');
    await choose('선택한 공연의 판매글인가', '예, 선택한 공연의 판매글');
    await choose('예매 유형', '팬클럽 선예매');
    await choose('가격 기준', '1매 가격');
    await choose('수수료 포함 여부', '티켓 금액만');
    await choose('할인 여부', '할인 없는 기본가');
    await choose('구매자가 예매자 본인인가', '아니요');
    await fireEvent.press(screen.getByText('이 값으로 공식 자료와 대조'));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toEqual(MANUAL_REQUEST);
    await waitFor(() => expect(screen).toHavePathname('/result'));

    expect(screen.getByText('+74,000원 (+42.05%)')).toBeOnTheScreen();
    expect(screen.getByText('AI 추출 없이 사용자가 직접 입력한 값으로 대조한 결과입니다.')).toBeOnTheScreen();
    expect(screen.getByTestId('result-extraction')).toHaveTextContent('추출 방식: AI 추출 없음 · 사용자가 직접 입력');
    expect(screen.getByText('판매글: 시연용 합성 문장')).toBeOnTheScreen();
    expect(screen.getByText('공식 자료: 공식 공지 스냅샷')).toBeOnTheScreen();
    expect(screen.getAllByText('시연 데이터').length).toBeGreaterThan(0);
    expect(screen.getAllByText('선예매 관람자 조건 확인 필요').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/확인 시각: 2026\. 10\. 29\. \(날짜 단위\)/).length).toBeGreaterThan(0);
  });

  it('AI 시간 초과(504, 재시도 가능) → 다시 시도 → model 응답은 제공자·모델과 후보 안내를 표시', async () => {
    let n = 0;
    const { api, calls } = fakeServer((body) =>
      ++n === 1
        ? { status: 504, body: { code: 'AI_TIMEOUT', message: 'AI 응답이 늦어 중단했습니다.', retryable: true } }
        : { status: 200, body: testModelExtraction(body) },
    );
    await renderApp(api);
    await enterSentence();
    await fireEvent.press(screen.getByText('이 판매글 확인하기'));
    expect(await screen.findByText('AI 응답이 늦어 중단했습니다.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/listing');

    await fireEvent.press(screen.getByText('다시 시도'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent(
      '추출 방식: AI 모델 추출 · test-provider test-model · 추출값은 후보입니다',
    );
    expect(screen.getByText('판매글 근거: “25만원”')).toBeOnTheScreen();

    // 재대조는 처음 추출의 checkId를 previousCheckId로 보낸다.
    await fireEvent.press(screen.getByText('이 값으로 공식 자료와 대조'));
    await waitFor(() => expect(calls).toHaveLength(3));
    expect(calls[2]).toMatchObject({ previousCheckId: '11111111-1111-4111-8111-111111111111', syntheticListing: true });
  });

  it('계약에 맞지 않는 응답(원문에 없는 근거 인용)은 성공 화면에 표시하지 않는다', async () => {
    const { api } = fakeServer((body) => {
      const r = testModelExtraction(body);
      r.extracted.price = { status: 'extracted', value: 300000, evidenceQuote: '30만원' };
      return { status: 200, body: r };
    });
    await renderApp(api);
    await enterSentence();
    await fireEvent.press(screen.getByText('이 판매글 확인하기'));
    expect(await screen.findByText('서버 응답 형식이 예상과 다릅니다.')).toBeOnTheScreen();
    expect(screen.getByText('오류 코드: INVALID_RESPONSE')).toBeOnTheScreen();
    expect(screen).toHavePathname('/listing');
  });

  it('공식 기준 요약: 공식 공지 스냅샷·1매 기본가·선예매 적용 범위를 표시한다', async () => {
    const { api } = fakeServer(() => ({ status: 500, body: null }));
    await renderApp(api);
    await fireEvent.press(await screen.findByLabelText(/AKMU CONCERT TOUR.*선택/));
    expect(await screen.findByText(/공식 기준 \(공식 공지 스냅샷\)/)).toBeOnTheScreen();
    // 공식 기준 세부는 판매글 입력 아래에서 접힘이 기본이다. 펼친 뒤 원문 값을 확인한다.
    expect(screen.queryByText('팬클럽 선예매에만 적용')).toBeNull();
    await fireEvent.press(screen.getByText(/공식 기준 \(공식 공지 스냅샷\)/));
    expect(screen.getByText(/VIP석 176,000원.*1매 기본가, 수수료·할인 제외/)).toBeOnTheScreen();
    expect(screen.getByText('팬클럽 선예매에만 적용')).toBeOnTheScreen();
  });

  it('서비스 소개(실제 API): 서버 연결을 표시하고 시연 표시·예시 버튼·개발용 시연 도구가 없다', async () => {
    const { api } = fakeServer(() => ({ status: 500, body: null }));
    await renderApp(api, '/about');
    expect(await screen.findByText('서버 연결: http://test.local')).toBeOnTheScreen();
    // 홈 공연 요약은 서버 /events 응답에서 읽는다.
    expect(await screen.findByText('2026 AKMU CONCERT TOUR - 대구')).toBeOnTheScreen();
    expect(screen.queryByText('시연 모드 · 합성 데이터')).toBeNull();
    expect(screen.queryByText('예시로 먼저 살펴보기')).toBeNull();
    await fireEvent.press(screen.getByText('바로 체험하기'));
    await waitFor(() => expect(screen).toHavePathname('/events'));
    expect(screen.queryByText(/개발용 시연 도구/)).toBeNull();
  });
});
