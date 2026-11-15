import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { router, Slot } from 'expo-router';
import { Alert, Linking } from 'react-native';
import { createDemoApi } from '../src/api/demoApi';
import { ApiError } from '../src/api/client';
import { createDemoMarket, type MarketApi } from '../src/market/api';
import { MarketProvider } from '../src/market/MarketContext';
import { memoryTokenStore, silentNotifier, type Notifier, type TokenStore } from '../src/market/device';
import { FlowProvider } from '../src/state/FlowContext';
import TabsLayout from '../src/app/(tabs)/_layout';
import HomeScreen from '../src/app/(tabs)/index';
import FavoritesScreen from '../src/app/(tabs)/favorites';
import SellScreen from '../src/app/(tabs)/sell';
import OrdersScreen from '../src/app/(tabs)/orders';
import MoreScreen from '../src/app/(tabs)/more';
import ShowScreen from '../src/app/show/[id]';
import ItemScreen from '../src/app/item/[id]';
import CheckoutScreen from '../src/app/checkout/[id]';
import DemoBooking from '../src/app/demo-booking';
import OrderScreen from '../src/app/order/[id]';
import LoginScreen from '../src/app/login';
import NotificationsScreen from '../src/app/notifications';
import PerformanceScreen from '../src/app/performance/[id]';
import PerformanceListingsScreen from '../src/app/performance-listings/[id]';

// 중개 구매 플랫폼(시연 모드, 지연 0): 화면 파일을 라우터로 묶어 실제 탭·이동으로 확인한다(APP-024).
async function renderMarket(market: MarketApi, initialUrl = '/', store: TokenStore = memoryTokenStore(), notifier: Notifier = silentNotifier) {
  await renderRouter(
    {
      _layout: () => (
        <MarketProvider api={market} store={store} notifier={notifier} pollMs={50}>
          <FlowProvider api={createDemoApi({ latencyMs: 0 })}>
            <Slot />
          </FlowProvider>
        </MarketProvider>
      ),
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': HomeScreen,
      '(tabs)/favorites': FavoritesScreen,
      '(tabs)/sell': SellScreen,
      '(tabs)/orders': OrdersScreen,
      '(tabs)/more': MoreScreen,
      'show/[id]': ShowScreen,
      'performance/[id]': PerformanceScreen,
      'performance-listings/[id]': PerformanceListingsScreen,
      'item/[id]': ItemScreen,
      'checkout/[id]': CheckoutScreen,
      'demo-booking': DemoBooking,
      'order/[id]': OrderScreen,
      login: LoginScreen,
      notifications: NotificationsScreen,
    },
    { initialUrl },
  );
}

async function signup(name = '티켓팬') {
  // 로그인 복원 확인이 끝나며 화면이 한 번 더 그려질 수 있어, '가입' 탭 전환이 반영될 때까지 기다린다.
  await waitFor(async () => {
    if (!screen.queryByRole('button', { name: '가입하고 시작하기' })) await fireEvent.press(await screen.findByText('가입'));
    expect(screen.getByRole('button', { name: '가입하고 시작하기' })).toBeOnTheScreen();
  });
  await fireEvent.changeText(screen.getByLabelText('닉네임'), name);
  await fireEvent.changeText(screen.getByLabelText('이메일'), 'test@example.com');
  await fireEvent.press(screen.getByRole('button', { name: '이메일 중복 확인' }));
  await screen.findByText('사용할 수 있는 이메일이에요.');
  await fireEvent.press(screen.getByRole('button', { name: '닉네임 중복 확인' }));
  await screen.findByText('사용할 수 있는 닉네임이에요.');
  await fireEvent.changeText(screen.getByLabelText('비밀번호'), 'Demo-pass-1!');
  await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
}

describe('플랫폼(시연 모드)', () => {
  it('가상 공연에서 대기, 좌석 선택과 시연 결제 완료까지 진행한다', async () => {
    await renderMarket(createDemoMarket({ latencyMs: 0 }), '/demo-booking');
    await fireEvent.press(screen.getByRole('button', { name: '레이더 라이브 2026 예매 체험' }));
    await fireEvent.press(screen.getByRole('button', { name: '대기 건너뛰기' }));
    expect(screen.getByRole('button', { name: 'A3 좌석 · 선택 불가' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택한 좌석 확인하기' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'A1 좌석' }));
    await fireEvent.press(screen.getByRole('button', { name: '선택한 좌석 확인하기' }));
    expect(screen.getByText('좌석 · VIP석 A1 1매')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '시연 결제 계속하기' }));
    await fireEvent.press(screen.getByRole('radio', { name: '계좌이체' }));
    await fireEvent.press(screen.getByRole('button', { name: '154,000원 시연 결제하기' }));
    expect(await screen.findByText('시연 결제가 완료됐어요', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText('계좌이체 · 154,000원')).toBeOnTheScreen();
  });

  it('공통 테스트 결제는 일회성 코드만 브라우저로 전달한다', async () => {
    const previous = process.env.EXPO_PUBLIC_SHARED_TOSS_TEST;
    process.env.EXPO_PUBLIC_SHARED_TOSS_TEST = '1';
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('payment-buyer', 'Password1!');
    const store = memoryTokenStore(); await store.save(account.token);
    const prepareTestPayment = jest.fn().mockResolvedValue({ orderId: 'ord-test-1', providerOrderId: `trtest_${'a'.repeat(32)}`, amount: 99000, mode: 'test' });
    const issueTestPaymentHandoff = jest.fn().mockResolvedValue({ code: 'x'.repeat(43), expiresInSeconds: 120 });
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    try {
      await renderMarket({ ...base, mode: 'live', prepareTestPayment, issueTestPaymentHandoff, cancelTestPayment: jest.fn() }, '/', store);
      await fireEvent.press(await screen.findByLabelText(/\[가상\] 뮤지컬 〈나침반〉, 매물 1개/));
      await fireEvent.press(await screen.findByLabelText(/^VIP 1매, 99,000원, 정가와 같아요/));
      await fireEvent.press(await screen.findByRole('button', { name: '구매하기' }));
      await fireEvent.press(await screen.findByRole('button', { name: '토스 테스트 결제창 열기' }));
      await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
      const url = String(open.mock.calls[0][0]);
      expect(url).toBe(`https://ticketradar.month32.workers.dev/mobile-test-payment#code=${'x'.repeat(43)}`);
      expect(url).not.toContain(account.token);
    } finally {
      open.mockRestore();
      if (previous === undefined) delete process.env.EXPO_PUBLIC_SHARED_TOSS_TEST; else process.env.EXPO_PUBLIC_SHARED_TOSS_TEST = previous;
    }
  });

  it('거래 목록 요청이 실패한 뒤 다시 성공하면 이전 오류를 지운다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('retry-orders', 'Password1!');
    const store = memoryTokenStore(); await store.save(account.token);
    const orders = jest.fn(base.orders).mockRejectedValueOnce(new ApiError({ code: 'UNAUTHORIZED', message: '로그인이 필요해요.', retryable: false }));
    await renderMarket({ ...base, orders }, '/', store);
    await fireEvent.press(await screen.findByLabelText('내 거래 탭'));
    expect(await screen.findByText('로그인이 필요해요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('홈 탭'));
    await fireEvent.press(screen.getByLabelText('내 거래 탭'));
    expect(await screen.findByText('아직 구매한 티켓이 없어요.')).toBeOnTheScreen();
    expect(screen.queryByText('로그인이 필요해요.')).not.toBeOnTheScreen();
  });
  it('현장 전달 거래의 판매자에게 공식 양도라고 표시하지 않는다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    const seller = await market.signup('onsite-seller', 'Password1!');
    const buyer = await market.signup('onsite-buyer', 'Password1!');
    const { listing } = await market.createListing(seller.token, { showId: 'demo-musical', sessionId: 'demo-mu-1', seatGrade: 'VIP', quantity: 1, pricePerTicket: 99000, originalPricePerTicket: 99000, delivery: 'onsite', bookingType: 'general' });
    const order = await market.createOrder(buyer.token, listing.id);
    const store = memoryTokenStore(); await store.save(seller.token);
    await renderMarket(market, '/', store);
    await waitFor(() => expect(screen.getByLabelText('내 거래 탭')).toBeOnTheScreen());
    await act(async () => router.push(`/order/${order.id}`));
    expect(await screen.findByText('현장 전달로 받아요')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '티켓을 전달했어요' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '공식 양도로 보냈어요' })).not.toBeOnTheScreen();
  });
  it('실제 공연의 시연 매물을 명시적으로 준비하고 결과를 표시한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const buyer = await base.signup('demo-kopis-buyer', 'Password1!');
    const store = memoryTokenStore(); await store.save(buyer.token);
    const prepared = await base.show('demo-musical');
    const preparePerformanceDemo = jest.fn().mockResolvedValue(prepared);
    const show = jest.fn().mockRejectedValue(new ApiError({ code: 'SHOW_NOT_FOUND', message: '없어요', retryable: false }));
    const performanceDetail = jest.fn().mockResolvedValue({ id: 'PF305681', title: '마흔에 서 [대학로]', venue: '공연장', startsOn: '2026-11-25', endsOn: '2026-11-29', status: '공연예정', source: 'KOPIS', fetchedAt: '2026-11-07T00:00:00Z', genre: '연극', posterUrl: null, story: null, cast: null, runtime: null, age: null, schedule: null });
    await renderMarket({ ...base, mode: 'live', show, performanceDetail, preparePerformanceDemo }, '/performance-listings/PF305681', store);
    await fireEvent.press(await screen.findByRole('button', { name: '시연 매물 준비하기' }));
    await waitFor(() => expect(preparePerformanceDemo).toHaveBeenCalledWith('PF305681', buyer.token));
    await fireEvent.press(await screen.findByText(/VIP · 1매 · 시연/));
    await fireEvent.press(await screen.findByRole('button', { name: '구매하기' }));
    expect(await screen.findByText('시연 결제 · 실제 돈이 오가지 않아요')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '시연 결제하기' }));
    await fireEvent.press(await screen.findByRole('button', { name: '티켓 받았어요' }));
    expect(await screen.findByRole('header', { name: '거래가 끝났어요' })).toBeOnTheScreen();
  });
  it('판매 화면에서 KOPIS 공연 정보를 표시하고 기존 판매 등록을 유지한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('seller-kopis', 'Password1!');
    const store = memoryTokenStore();
    await store.save(account.token);
    const performance = { id: 'PF123', title: '실제 공연', venue: '공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS' as const, fetchedAt: '2026-11-06T00:00:00Z', genre: '연극', posterUrl: null };
    const show = jest.fn(base.show);
    await renderMarket({ ...base, mode: 'live', performances: jest.fn().mockResolvedValue([performance]), show }, '/sell', store);
    expect(await screen.findByText('실제 공연')).toBeOnTheScreen();
    expect(screen.getByText('KOPIS 공연 정보')).toBeOnTheScreen();
    expect(show).not.toHaveBeenCalledWith('PF123');
    expect(screen.getByText('시연 거래 · 실제 결제는 진행되지 않아요')).toBeOnTheScreen();
  });
  it('실서버 모드에서 KOPIS 공연 정보를 시연 매물과 구분해 표시한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('kopisfan', 'Password1!');
    const store = memoryTokenStore();
    await store.save(account.token);
    const performances = jest.fn().mockResolvedValue(Array.from({ length: 6 }, (_, index) => ({ id: `PF${index}`, title: `공연 정보 ${index}`, venue: '공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS', fetchedAt: '2026-11-06T00:00:00Z', genre: '뮤지컬', posterUrl: null })));
    await renderMarket({ ...base, mode: 'live', performances }, '/', store);
    expect(await screen.findByText('공연 둘러보기')).toBeOnTheScreen();
    expect(await screen.findByText('공연 정보 0')).toBeOnTheScreen();
    expect(screen.getByText(/실제 판매 재고 미연결/)).toBeOnTheScreen();
    expect(screen.queryByText('공연 정보 5')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'KOPIS 공연 6개 모두 보기' }));
    expect(screen.getByText('공연 정보 5')).toBeOnTheScreen();
    expect(screen.getByText('아래는 시연용 매물이에요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: '콘서트' }));
    await waitFor(() => expect(screen.queryByText('공연 정보 0')).toBeNull());
    await fireEvent.press(screen.getByRole('tab', { name: '뮤지컬' }));
    expect(await screen.findByText('공연 정보 0')).toBeOnTheScreen();
  });
  it('실제 공연 카드에서 상세 정보와 매물 미연결 화면으로 이동한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('detailfan', 'Password1!');
    const store = memoryTokenStore();
    await store.save(account.token);
    const card = { id: 'PF123', title: '실제 공연', venue: '공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS' as const, fetchedAt: '2026-11-06T00:00:00Z', genre: '뮤지컬', posterUrl: null };
    const market: MarketApi = { ...base, mode: 'live', performances: jest.fn().mockResolvedValue([card]), performanceDetail: jest.fn().mockResolvedValue({ ...card, story: '공연 이야기', cast: '출연진', runtime: '90분', age: null, schedule: null, priceGuide: '전석 40,000원', priceCandidate: { seatGrade: '전석', price: 40000, sourceQuote: '전석 40,000원' }, stageCapacity: 120 }) };
    await renderMarket(market, '/', store);
    await fireEvent.press(await screen.findByText('실제 공연'));
    expect(await screen.findByText('공연 이야기')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '예매하러 가기' }));
    expect(await screen.findByText('아직 연결된 매물이 없어요.')).toBeOnTheScreen();
    expect(await screen.findByText('전석 40,000원')).toBeOnTheScreen();
    expect(screen.getByText('안내된 좌석')).toBeOnTheScreen();
    expect(screen.getByText('공연장 객석 규모')).toBeOnTheScreen();
    expect(screen.getByText('120석')).toBeOnTheScreen();
    expect(screen.getByText(/등급별 좌석 수와 남은 좌석은 확인되지 않았어요/)).toBeOnTheScreen();
  });
  it('공연을 페이지별로 더 불러오고 중복 공연은 한 번만 표시한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const account = await base.signup('pagefan', 'Password1!');
    const store = memoryTokenStore();
    await store.save(account.token);
    const makeCard = (index: number) => ({ id: `PF${index}`, title: `페이징 공연 ${index}`, venue: '공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS' as const, fetchedAt: '2026-11-06T00:00:00Z', genre: '뮤지컬', posterUrl: null });
    const performances = jest.fn().mockImplementation(async (_category, page) => page === 1 ? Array.from({ length: 30 }, (_, index) => makeCard(index)) : [makeCard(29), makeCard(30)]);
    await renderMarket({ ...base, mode: 'live', performances }, '/', store);
    await fireEvent.press(await screen.findByRole('button', { name: 'KOPIS 공연 30개 모두 보기' }));
    await fireEvent.press(await screen.findByRole('button', { name: '다음 공연 더 보기' }));
    expect(await screen.findByText('페이징 공연 30')).toBeOnTheScreen();
    expect(screen.getAllByText('페이징 공연 29')).toHaveLength(1);
    expect(performances).toHaveBeenCalledWith(null, 2);
    expect(screen.queryByRole('button', { name: '다음 공연 더 보기' })).toBeNull();
  });
  it('이메일 도메인 선택과 직접 입력을 지원하고 변경 시 중복 확인을 초기화한다', async () => {
    await renderMarket(createDemoMarket({ latencyMs: 0 }), '/login');
    await fireEvent.press(await screen.findByText('가입'));
    await fireEvent.changeText(screen.getByLabelText('이메일'), 'fan');
    await fireEvent.press(screen.getByRole('button', { name: '이메일 도메인 선택' }));
    await fireEvent.press(screen.getByRole('button', { name: 'naver.com' }));
    expect(screen.getByLabelText('이메일')).toHaveProp('value', 'fan@naver.com');
    await fireEvent.press(screen.getByRole('button', { name: '이메일 중복 확인' }));
    expect(await screen.findByText('사용할 수 있는 이메일이에요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '이메일 도메인 선택' }));
    await fireEvent.press(screen.getByRole('button', { name: 'gmail.com' }));
    expect(screen.getByLabelText('이메일')).toHaveProp('value', 'fan@gmail.com');
    expect(screen.queryByText('사용할 수 있는 이메일이에요.')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('이메일'), 'fan@custom.example');
    expect(screen.getByLabelText('이메일')).toHaveProp('value', 'fan@custom.example');
  });
  it('두 중복 확인을 모두 마친 후에만 가입한다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    const create = jest.spyOn(market, 'signup');
    await renderMarket(market, '/login');
    await fireEvent.press(await screen.findByText('가입'));
    await fireEvent.changeText(screen.getByLabelText('이메일'), 'new@example.com');
    await fireEvent.changeText(screen.getByLabelText('닉네임'), 'newfan');
    await fireEvent.changeText(screen.getByLabelText('비밀번호'), 'Password1!');
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    expect(await screen.findByText('이메일 중복 확인을 완료해 주세요.')).toBeOnTheScreen();
    expect(create).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: '이메일 중복 확인' }));
    await screen.findByText('사용할 수 있는 이메일이에요.');
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    expect(await screen.findByText('닉네임 중복 확인을 완료해 주세요.')).toBeOnTheScreen();
    expect(create).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: '닉네임 중복 확인' }));
    await screen.findByText('사용할 수 있는 닉네임이에요.');
    await fireEvent.changeText(screen.getByLabelText('이메일'), 'changed@example.com');
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    expect(await screen.findByText('이메일 중복 확인을 완료해 주세요.')).toBeOnTheScreen();
    expect(create).not.toHaveBeenCalled();
  });
  it('인증번호 입력 후 누락된 가입 항목을 안내하고 공백이 섞인 번호를 전달한다', async () => {
    const base = createDemoMarket({ latencyMs: 0 });
    const sendVerification = jest.fn().mockResolvedValue(undefined);
    const checkAvailability = jest.fn().mockResolvedValue({ available: true });
    const welcome = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const signupRequest = jest.fn().mockResolvedValue({ token: 'test', expiresAt: '', user: { id: 'u', name: 'fan', alertsOn: false } });
    const market: MarketApi = { ...base, mode: 'live', sendVerification, checkAvailability, signup: signupRequest };
    await renderMarket(market, '/login');
    await fireEvent.press(await screen.findByText('가입'));
    await fireEvent.changeText(screen.getByLabelText('이메일'), 'fan@example.com');
    await fireEvent.press(screen.getByRole('button', { name: '이메일 중복 확인' }));
    expect(await screen.findByText('사용할 수 있는 이메일이에요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '인증번호 받기' }));
    await fireEvent.changeText(await screen.findByLabelText('인증번호'), '123 456');
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    expect(await screen.findByText('닉네임을 2자 이상 입력해 주세요.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('닉네임'), 'fan');
    await fireEvent.press(screen.getByRole('button', { name: '닉네임 중복 확인' }));
    expect(await screen.findByText('사용할 수 있는 닉네임이에요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    expect(await screen.findByText(/비밀번호는 8자 이상/)).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('비밀번호'), 'Password1!');
    await fireEvent.press(screen.getByRole('button', { name: '가입하고 시작하기' }));
    await waitFor(() => expect(signupRequest).toHaveBeenCalledWith('fan', 'Password1!', 'fan@example.com', '123456'));
    await waitFor(() => expect(welcome).toHaveBeenCalledWith('가입을 환영합니다!', expect.any(String)));
    welcome.mockRestore();
  });
  it('로그인은 아이디 또는 이메일을 요청하고 가입은 닉네임을 요청한다', async () => {
    await renderMarket(createDemoMarket({ latencyMs: 0 }), '/login');
    expect(await screen.findByLabelText('티켓레이더')).toBeOnTheScreen();
    expect(await screen.findByLabelText('아이디 또는 이메일')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('가입'));
    expect(await screen.findByLabelText('닉네임')).toBeOnTheScreen();
  });
  it('미로그인 시작 시 로그인 화면을 먼저 보여주고 가입 후 홈으로 이동한다', async () => {
    await renderMarket(createDemoMarket({ latencyMs: 0 }));
    expect(await screen.findByLabelText('아이디 또는 이메일')).toBeOnTheScreen();
    await signup();
    expect(await screen.findByRole('header', { name: /어떤 공연을\s*찾고 계세요\?/ })).toBeOnTheScreen();
    expect(await screen.findByText('[가상] 레이더스 vs 시티 이글스')).toBeOnTheScreen();
    expect(screen.getByText('시연 모드 · 가상 공연과 합성 매물이에요')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: '스포츠' }));
    await waitFor(() => expect(screen.queryByText('[가상] 뮤지컬 〈나침반〉')).toBeNull());
  });

  it('가입 → 하트(계정 저장) → 홈 즐겨찾기 줄 → 정가 이하 시연 매물 → 알림 배지·목록', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await renderMarket(market, '/show/demo-radar-live');
    expect(await screen.findByRole('header', { name: '[가상] 레이더 라이브 2026' })).toBeOnTheScreen();
    // 정가 대비 판단은 색 글씨 한 줄(엔진 계산): R 120,000 vs 정가 132,000
    expect(screen.getByText('12,000원 저렴해요')).toBeOnTheScreen();
    expect(screen.getByText('49% 비싸요')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('즐겨찾기'));
    await waitFor(() => expect(screen).toHavePathname('/login'));
    await signup();
    await waitFor(() => expect(screen).toHavePathname('/show/demo-radar-live'));
    await fireEvent.press(await screen.findByLabelText('즐겨찾기'));
    expect(await screen.findByLabelText('즐겨찾기 해제')).toBeOnTheScreen();
  });

  it('구매(시연 결제): 매물 → 확인이 필요해요 → 결제 → 티켓 받았어요 → 거래 완료', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await renderMarket(market, '/login');
    await signup('buyer');
    await waitFor(() => expect(screen).toHavePathname('/'));
    await act(async () => router.push('/item/lst-radar-1'));
    expect(await screen.findByText('230,000원')).toBeOnTheScreen();
    expect(screen.getByText('정가보다 76,000원 비싸요')).toBeOnTheScreen();
    expect(screen.getByText('캡처로는 입장할 수 없어요')).toBeOnTheScreen();
    expect(screen.getByText('시연 결제예요 · 실제 돈이 오가지 않아요')).toBeOnTheScreen();
  });

  it('구매 흐름 끝까지(로그인 상태 유지)', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await renderMarket(market, '/login');
    await signup('buyer2');
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(await screen.findByLabelText(/\[가상\] 뮤지컬 〈나침반〉, 매물 1개/));
    await fireEvent.press(await screen.findByLabelText(/^VIP 1매, 99,000원, 정가와 같아요/));
    await fireEvent.press(await screen.findByRole('button', { name: '구매하기' }));
    expect(await screen.findByRole('header', { name: /99,000원을\s*결제할게요/ })).toBeOnTheScreen();
    expect(screen.getByText('시연 결제 · 실제 돈이 오가지 않아요')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('radio', { name: '계좌이체' }));
    expect(screen.getByRole('radio', { name: '계좌이체', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('선택은 화면 시연용이며 실제 결제 정보는 입력하지 않아요.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '시연 결제하기' }));
    expect(await screen.findByRole('header', { name: /티켓이 도착했는지\s*확인해 주세요/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '티켓 받았어요' }));
    expect(await screen.findByRole('header', { name: '거래가 끝났어요' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('뒤로'));
    await waitFor(() => expect(screen).toHavePathname('/orders'));
    await fireEvent.press(await screen.findByText('뮤지컬 〈나침반〉 · VIP'));
    expect(await screen.findByRole('header', { name: '거래가 끝났어요' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('뒤로'));
    await waitFor(() => expect(screen).toHavePathname('/orders'));
  });

  it('판매 등록 3단계: 가격 입력 즉시 정가 비교 → 등록 → 매물 화면', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await renderMarket(market, '/login');
    await signup('seller');
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(screen.getByLabelText('판매 탭'));
    await fireEvent.press(await screen.findByText('[가상] 레이더 라이브 2026'));
    expect(await screen.findByRole('header', { name: /좌석과 받는 방법을/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));
    await fireEvent.changeText(screen.getByLabelText('장당 가격'), '155000');
    expect(await screen.findByText('확인된 기준 가격 이하로 입력해 주세요.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '매물 올리기' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('원구매가'), '140000');
    await fireEvent.changeText(screen.getByLabelText('장당 가격'), '150000');
    expect(screen.getByRole('button', { name: '매물 올리기' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('원구매가'), '154000');
    expect(await screen.findByText('정가 154,000원 · 4,000원 저렴해요')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '매물 올리기' }));
    expect(await screen.findByText('150,000원')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '내가 올린 매물이에요' })).toBeDisabled();
  });


  it('정가 이하 알림: 앱을 연 뒤 새로 생긴 알림만 기기 알림으로 띄우고, 누르면 매물로 간다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    const sent: { body: string; data: Record<string, string> }[] = [];
    let open: ((d: Record<string, unknown>) => void) | null = null;
    const notifier: Notifier = { ensurePermission: async () => true, notify: async (_t, body, data) => void sent.push({ body, data }), onOpen: (h) => { open = h; return () => undefined; } };
    const store = memoryTokenStore();
    await renderMarket(market, '/login', store, notifier);
    await signup('alerted');
    await waitFor(() => expect(screen).toHavePathname('/'));
    const token = (await store.load())!;
    await market.setFavorite(token, 'demo-musical', true);
    expect(sent).toHaveLength(0); // 가입 전·직후의 옛 알림은 띄우지 않는다
    await market.simulateBelowFace!(token); // 시연 판매자가 정가 이하 매물을 올림
    await waitFor(() => expect(sent).toHaveLength(1), { timeout: 2000 });
    expect(sent[0].body).toMatch(/정가 이하 매물이 올라왔어요/);
    await waitFor(() => expect(screen.getByLabelText(/알림, 새 알림 1개/)).toBeOnTheScreen());
    await act(async () => open!({ listingId: sent[0].data.listingId }));
    await waitFor(() => expect(screen).toHavePathname(`/item/${sent[0].data.listingId}`));
  });

  it('로그아웃 후 기기 로그아웃 안내를 표시한다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await renderMarket(market, '/login');
    await signup('logout-user');
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(screen.getByLabelText('전체 탭'));
    await fireEvent.press(await screen.findByText('로그아웃'));
    expect(await screen.findByText('이 기기에서 로그아웃했어요')).toBeOnTheScreen();
  });

  it('로그인 성공 후 안내를 표시한다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    await market.signup('member', 'Password1!');
    await renderMarket(market, '/login');
    await fireEvent.changeText(await screen.findByLabelText('아이디 또는 이메일'), 'member');
    await fireEvent.changeText(screen.getByLabelText('비밀번호'), 'Password1!');
    await fireEvent.press(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('로그인했어요')).toBeOnTheScreen();
  });

  it('로그인 유지: 저장된 토큰으로 앱을 다시 켜면 로그인 상태가 복원되고, 로그아웃하면 지워진다', async () => {
    const market = createDemoMarket({ latencyMs: 0 });
    const store = memoryTokenStore();
    await renderMarket(market, '/login', store);
    await signup('keeper');
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(await store.load()).toMatch(/^demo-token-/);
    screen.unmount();
    await renderMarket(market, '/more', store);
    expect(await screen.findByText('keeper')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('로그아웃'));
    await waitFor(async () => expect(await store.load()).toBeNull());
  });
});
