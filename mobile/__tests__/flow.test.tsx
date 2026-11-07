import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Slot } from 'expo-router';
import { createDemoApi, type DemoApi } from '../src/api/demoApi';
import { FlowProvider } from '../src/state/FlowContext';
import AboutScreen from '../src/app/about';
import EventsScreen from '../src/app/events';
import ListingScreen from '../src/app/listing';
import ReviewScreen from '../src/app/review';
import ResultScreen from '../src/app/result';
import ReportScreen from '../src/app/report';
import AdminScreen from '../src/app/admin';

// 실제 화면 파일 4개를 라우터로 묶어 핵심 흐름을 끝까지 확인한다(시연 데이터, 지연 0).
// 레이아웃만 테스트용으로 바꿔 API 인스턴스를 주입한다.
// 기존 흐름 테스트는 공연 선택(/events)에서 시작한다. 홈 CTA는 별도 테스트로 확인한다.
async function renderApp(api: DemoApi, initialUrl = '/events') {
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
      report: ReportScreen,
      admin: AdminScreen,
    },
    { initialUrl },
  );
}

async function goToReviewWithSampleA() {
  await fireEvent.press(await screen.findByLabelText(/레이더 라이브 2026.*선택/));
  expect(screen).toHavePathname('/listing');
  await fireEvent.press(await screen.findByText('예시 1 · 가격 차이와 캡처 전달'));
  await fireEvent.press(screen.getByText('이 판매글 확인하기'));
  await waitFor(() => expect(screen).toHavePathname('/review'));
}

// 비교 전제 조건을 사용자가 직접 고른다(앱은 자동으로 채우지 않는다).
// 웹식 선택 칸: 칸을 눌러 시트를 연 뒤 선택지를 고른다(APP-018).
async function choose(field: string, option: string) {
  await fireEvent.press(screen.getByLabelText(new RegExp(`^${field} 선택`)));
  const opts = screen.getAllByText(option);
  await fireEvent.press(opts[opts.length - 1]);
}

async function confirmConditions() {
  await choose('선택한 공연의 판매글인가', '예, 선택한 공연의 판매글');
  await choose('수수료 포함 여부', '티켓 금액만');
  await choose('할인 여부', '할인 없는 기본가');
}

async function compare() {
  await fireEvent.press(screen.getByText('이 값으로 공식 자료와 대조'));
  await waitFor(() => expect(screen).toHavePathname('/result'));
}

describe('앱 핵심 흐름 (시연 데이터)', () => {
  it('공연 선택 → 판매글 → 추출값 확인·조건 선택 → 결과(원문·출처·확인 시각·fixture 표시)', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    expect(await screen.findByText('실제 API 미연결 · 합성 시연 데이터 사용')).toBeOnTheScreen();

    await goToReviewWithSampleA();
    expect(screen.getByText('판매글 근거: “230,000원”')).toBeOnTheScreen();
    // 시연 응답은 AI 호출이 없었음을 표시한다(AI 추출로 보이지 않게).
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent('추출 방식: 시연 fixture 조회 · AI 호출 없음');

    await confirmConditions();
    await compare();

    // 차액은 앱이 계산하지 않고 응답 값을 그대로 보여준다.
    expect(screen.getByText('+76,000원 (+49.35%)')).toBeOnTheScreen();
    expect(screen.getByTestId('result-extraction')).toHaveTextContent('추출 방식: 시연 fixture 조회 · AI 호출 없음');
    expect(screen.getByText('판매글: 시연용 합성 문장')).toBeOnTheScreen();
    expect(screen.getByText('공식 자료: 시연용 합성 자료')).toBeOnTheScreen();
    expect(screen.getAllByText(/QR 캡처 바로 보내드려요\. 캡처로 입장 가능합니다\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/시연용 예시 출처: https:\/\/example\.com\/demo/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/확인 시각: 2026\. 10\. 28\./).length).toBeGreaterThan(0);
    expect(screen.getByText(/진위·입장 가능 여부·사기나 불법 여부를 확정하지/)).toBeOnTheScreen();
  });

  it('결과 → 제보 근거 정리: 응답 값으로 문서를 미리 보여주고 PDF 저장 버튼이 있다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await goToReviewWithSampleA();
    await confirmConditions();
    await compare();
    await fireEvent.press(screen.getByText('제보 근거 정리'));
    await waitFor(() => expect(screen).toHavePathname('/report'));
    expect(screen.getByText('확인이 필요한 부분 — 제보 근거')).toBeOnTheScreen();
    expect(screen.getByText('판매글 원문 (연락처는 가려짐)')).toBeOnTheScreen();
    expect(screen.getByText('PDF로 저장')).toBeOnTheScreen();
  });

  it('제보: 동의해야 보낼 수 있고, 다시 눌러도 중복되지 않으며, 주최 측 제보함에서 상태·메모가 기록된다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    await renderApp(api);
    await goToReviewWithSampleA();
    await confirmConditions();
    await compare();
    await fireEvent.press(screen.getByText('제보 근거 정리'));
    await waitFor(() => expect(screen).toHavePathname('/report'));
    expect(screen.getByText('경찰청 사이버범죄 신고시스템 · 금전 피해·사기 의심 시')).toBeOnTheScreen();
    expect(screen.getByText('신고용 요약 공유')).toBeOnTheScreen();
    // 동의 전에는 보내기가 막혀 있다.
    expect(screen.getByRole('button', { name: /주최 측에 제보 보내기/ })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('제보 설명 (선택)'), '연락처 010-1234-5678 로 입금 요구');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByText('주최 측에 제보 보내기'));
    expect(await screen.findByText('주최 측 제보함에 접수됐어요')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('주최 측 제보함에서 보기'));
    await waitFor(() => expect(screen).toHavePathname('/admin'));
    await fireEvent.changeText(screen.getByLabelText('담당자 계정'), 'demo-organizer');
    await fireEvent.changeText(screen.getByLabelText('접속 코드'), 'wrong');
    await fireEvent.press(screen.getByText('주최 측 로그인'));
    expect(await screen.findByText('계정 또는 코드가 올바르지 않습니다.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('접속 코드'), 'demo-code-1234');
    await fireEvent.press(screen.getByText('주최 측 로그인'));
    expect(await screen.findByText('제보 1건 · 최신순')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(/^제보 .*, 접수, 열기$/));
    expect(await screen.findByText('처리 기록')).toBeOnTheScreen();
    // 서버(시연 저장소)도 연락처를 가린다.
    expect(screen.queryByText(/010-1234-5678/)).toBeNull();
    await fireEvent.press(screen.getByLabelText('처리 상태 검토 중'));
    expect(await screen.findByText(/상태 접수 → 검토 중/)).toBeOnTheScreen();

    // 같은 제보 화면에서 다시 보내면 새 제보가 생기지 않는다(clientRequestId 동일).
    const again = await api.organizer.login('demo-organizer', 'demo-code-1234');
    expect(await api.organizer.list(again.token, 'demo-radar-live')).toHaveLength(1);
  });

  it('주최 측 제보함: 다른 공연 담당 계정은 이 공연 제보를 볼 수 없다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    const other = await api.organizer.login('demo-other', 'demo-code-5678');
    await expect(api.organizer.list(other.token, 'demo-radar-live')).rejects.toMatchObject({ code: 'FORBIDDEN_EVENT' });
    await renderApp(api, '/admin');
    expect(await screen.findByText('담당 공연의 제보만 볼 수 있어요')).toBeOnTheScreen();
    expect(screen.getByText(/계정 demo-organizer · 코드 demo-code-1234/)).toBeOnTheScreen();
  });

  it('비교 전제 조건을 확인하지 않으면 가격 비교를 보류한다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await goToReviewWithSampleA();
    await compare();
    expect(screen.getAllByText('가격 비교 보류').length).toBeGreaterThan(0);
    expect(screen.queryByText(/\+76,000원/)).toBeNull();
    expect(screen.getAllByText(/공연 일치·수수료 포함 여부·할인 여부가 확인되지 않아/).length).toBeGreaterThan(0);
  });

  it('T05: 결과에서 돌아가 가격을 고치면 수정값으로 다시 대조한다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await goToReviewWithSampleA();
    await confirmConditions();
    await compare();

    await fireEvent.press(screen.getByText('값 수정하고 다시 대조'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    await fireEvent.changeText(screen.getByLabelText('가격 입력'), '154,000');
    expect(screen.getAllByText('사용자 수정').length).toBeGreaterThan(0);

    await compare();
    expect(screen.getByText('사용자가 수정한 값으로 다시 대조한 결과입니다.')).toBeOnTheScreen();
    expect(screen.getByText('0원 (0%)')).toBeOnTheScreen();
    expect(screen.getByText('154,000원 (수정)')).toBeOnTheScreen();
  });

  it('잘못된 숫자 입력은 대조 버튼을 막는다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await goToReviewWithSampleA();
    await fireEvent.changeText(screen.getByLabelText('가격 입력'), '0');
    expect(screen.getByText('1 이상의 숫자만 입력하세요. 모르면 비워 두세요.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '이 값으로 공식 자료와 대조' })).toBeDisabled();
  });

  it('빈 판매글은 요청하지 않고 입력 안내를 보여준다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    const spy = jest.spyOn(api, 'createCheck');
    await renderApp(api);
    await fireEvent.press(await screen.findByLabelText(/레이더 라이브 2026.*선택/));
    await fireEvent.press(await screen.findByText('이 판매글 확인하기'));
    expect(screen.getByText('판매글을 붙여넣거나 입력하세요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('AI 없이 직접 입력'));
    expect(screen).toHavePathname('/listing');
    expect(spy).not.toHaveBeenCalled();
  });

  it('네트워크 실패 시 오류와 다시 시도를 보여주고, 재시도하면 진행한다(직접 입력으로 자동 전환 없음)', async () => {
    const api = createDemoApi({ latencyMs: 0, failOnce: ['checks'] });
    await renderApp(api);
    await fireEvent.press(await screen.findByLabelText(/레이더 라이브 2026.*선택/));
    await fireEvent.press(await screen.findByText('예시 1 · 가격 차이와 캡처 전달'));
    await fireEvent.press(screen.getByText('이 판매글 확인하기'));

    expect(await screen.findByText(/연결하지 못했어요\. 입력한 내용은 그대로 있어요/)).toBeOnTheScreen();
    expect(screen).toHavePathname('/listing');
    await fireEvent.press(screen.getByText('다시 시도'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent(/시연 fixture 조회 · AI 호출 없음/);
  });

  it('AI 없이 직접 입력: 빈 폼에서 시작하고 결과에 직접 입력으로 표시한다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    const spy = jest.spyOn(api, 'createCheck');
    await renderApp(api);
    await fireEvent.press(await screen.findByLabelText(/레이더 라이브 2026.*선택/));
    await fireEvent.changeText(await screen.findByLabelText('판매글 입력'), '토요일 VIP 한 장 팝니다');
    await fireEvent.press(screen.getByText('AI 없이 직접 입력'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent(/AI 추출 없음 · 사용자가 직접 입력/);
    expect(spy).not.toHaveBeenCalled();
    // 직접 입력에서는 추출 상태·'사용자 수정'·'추출값'을 붙이지 않고 입력 여부만 표시한다(APP-011 ⓑ).
    expect(screen.queryByText('판매글에서 찾지 못함 · 확인 필요')).toBeNull();
    expect(screen.queryByText(/^추출값:/)).toBeNull();
    expect(screen.getAllByText('직접 입력 · 미확인')).toHaveLength(12);
    await fireEvent.changeText(screen.getByLabelText('가격 입력'), '250000');
    expect(screen.getAllByText('직접 입력')).toHaveLength(1);
    expect(screen.queryByText('사용자 수정')).toBeNull();

    await compare();
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ extractionMode: 'manual' }));
    expect(screen.getByText('AI 추출 없이 사용자가 직접 입력한 값으로 대조한 결과입니다.')).toBeOnTheScreen();
    expect(screen.getByTestId('result-extraction')).toHaveTextContent(/AI 추출 없음 · 사용자가 직접 입력/);
    expect(screen.getAllByText('가격 비교 보류').length).toBeGreaterThan(0);
  });

  it('재대조 요청은 previousCheckId와 확인값 전체를 보낸다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    const spy = jest.spyOn(api, 'createCheck');
    await renderApp(api);
    await goToReviewWithSampleA();
    const first = await spy.mock.results[0].value;
    await compare();
    const sent = spy.mock.calls[1][0];
    expect(sent.previousCheckId).toBe(first.checkId);
    expect(Object.keys(sent.confirmedFields!)).toHaveLength(12);
    expect(sent.syntheticListing).toBe(true);
  });

  it('409(이전 추출 만료): 오류와 다시 분석하기를 보여준다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    await renderApp(api);
    await goToReviewWithSampleA();
    api.forgetChecks();
    await fireEvent.press(screen.getByText('이 값으로 공식 자료와 대조'));
    expect(await screen.findByText('오류 코드: CHECK_EXPIRED_OR_MISMATCH')).toBeOnTheScreen();
    expect(screen.queryByText('다시 시도')).toBeNull();
    await fireEvent.press(screen.getByText('판매글 다시 분석하기'));
    await waitFor(() => expect(screen).toHavePathname('/listing'));
  });

  it('공식 자료가 없는 공연은 확인 불가·가격 비교 보류로 표시한다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await fireEvent.press(await screen.findByLabelText(/뮤지컬 나침반.*선택/));
    expect(await screen.findByText('이 공연의 공식 가격·입장 규정이 등록되지 않았습니다.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('판매글 입력'), '나침반 12/5 1장 팝니다');
    await fireEvent.press(screen.getByText('이 판매글 확인하기'));
    await waitFor(() => expect(screen).toHavePathname('/review'));
    await compare();
    expect(screen.getByText('가격 비교 보류')).toBeOnTheScreen();
    expect(screen.getByText('공식 출처 없음 · 확인 불가')).toBeOnTheScreen();
  });

  it.each(['바로 체험하기', '서비스 체험하러 가기 →'])('서비스 소개(구 홈, 웹 소개 구성): "%s"는 공연 선택(1단계)으로 간다(시연 모드 표시)', async (cta) => {
    await renderApp(createDemoApi({ latencyMs: 0 }), '/about');
    expect(await screen.findByRole('header', { name: /그 티켓,\s*정말 이 조건이 맞을까요\?/ })).toBeOnTheScreen();
    expect(screen.getByText('판매글은 보통 이렇게 생겼어요')).toBeOnTheScreen();
    expect(screen.getByText('세 단계면 충분해요')).toBeOnTheScreen();
    expect(screen.getByText('시연 모드 · 합성 데이터')).toBeOnTheScreen();
    // 홈 공연 요약은 시연 목록에서 읽는다(하드코딩 없음).
    expect(await screen.findByText('[시연] 레이더 라이브 2026 (가상 공연)')).toBeOnTheScreen();
    expect(screen.getByText('외 1개 공연은 다음 단계에서 고를 수 있어요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText(cta));
    await waitFor(() => expect(screen).toHavePathname('/events'));
    expect(await screen.findByLabelText(/레이더 라이브 2026.*선택/)).toBeOnTheScreen();
    expect(screen.getByText('실제 API 미연결 · 합성 시연 데이터 사용')).toBeOnTheScreen();
  });

  it('개발용 시연 도구는 접힌 상태로 시작하고 펼치면 실패 예약 버튼이 보인다', async () => {
    await renderApp(createDemoApi({ latencyMs: 0 }));
    await screen.findByLabelText(/레이더 라이브 2026.*선택/);
    expect(screen.queryByText('다음 대조 요청을 실패시키기')).toBeNull();
    await fireEvent.press(screen.getByText(/개발용 시연 도구/));
    expect(screen.getByText('다음 대조 요청을 실패시키기')).toBeOnTheScreen();
  });
});
