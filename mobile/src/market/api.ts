import { ApiError } from '../api/client';
import { isValidNewPassword, PASSWORD_RULE_MESSAGE } from '../../../shared/password-policy';
import {
  MarketCore,
  MarketError,
  seedState,
  type BookingType,
  type Category,
  type CreateListingInput,
  type Delivery,
  type Listing,
  type Notification,
  type Order,
  type Safety,
  type Show,
} from './engine';

// 중개 구매 플랫폼(시연) API — 화면은 이 인터페이스만 쓴다(APP-024).
// 실서버: server/src/market.ts 라우트. 시연 모드: 같은 엔진(engine.ts = server/src/market-core.ts 복사본)을 앱 메모리에서 실행.
// 결제는 어느 쪽이든 시연이며 실제 돈이 오가지 않는다.

export type ShowSummary = {
  id: string;
  category: Category;
  title: string;
  venue: string;
  firstSession: string | null;
  sessionCount: number;
  listingCount: number;
  minPrice: number | null;
  belowFaceCount: number;
  isDemo: boolean;
  favorite: boolean;
  newCount: number;
  posterUrl?: string | null;
  canRegister?: boolean;
};
export type ListingWithSafety = Listing & { safety: Safety };
export type ShowDetail = { show: Show; summary: ShowSummary; listings: ListingWithSafety[] };
export type ListingDetail = { listing: Listing; show: Show; safety: Safety; session: Show['sessions'][number] | null };
export type OrderDetail = { order: Order; listing: Listing; show: Show; session: Show['sessions'][number] | null; role: 'buyer' | 'seller' };
export type Session = { token: string; expiresAt: string; user: { id: string; name: string; alertsOn: boolean } };
export type Me = { id: string; name: string; alertsOn: boolean; unread: number };
export type Performance = { id: string; title: string; venue: string | null; startsOn: string; endsOn: string; status: string | null; source: 'KOPIS'; fetchedAt: string; genre: string | null; posterUrl: string | null };
export type PerformanceDetail = Performance & { story: string | null; cast: string | null; runtime: string | null; age: string | null; schedule: string | null; priceGuide?: string | null; priceCandidate?: { seatGrade: '전석'; price: number; sourceQuote: string } | null; introImages?: string[]; stageCapacity?: number | null };
export type { BookingType, Category, Delivery, Notification, Order, Safety, Show };

export interface MarketApi {
  mode: 'demo' | 'live';
  signup(name: string, password: string, email?: string, verificationCode?: string): Promise<Session>;
  sendVerification(email: string): Promise<void>;
  checkAvailability(kind: 'email' | 'name', value: string): Promise<{ available: boolean }>;
  performances(category?: 'concert' | 'musical' | null, page?: number): Promise<Performance[]>;
  performanceDetail(id: string): Promise<PerformanceDetail>;
  preparePerformanceDemo(id: string, token: string): Promise<ShowDetail>;
  login(name: string, password: string): Promise<Session>;
  logout(token: string): Promise<void>;
  me(token: string): Promise<Me>;
  shows(q: { category?: Category | null; query?: string }, token?: string | null): Promise<ShowSummary[]>;
  show(id: string, token?: string | null): Promise<ShowDetail>;
  listing(id: string): Promise<ListingDetail>;
  preview(input: Pick<CreateListingInput, 'showId' | 'seatGrade' | 'pricePerTicket' | 'delivery' | 'bookingType'>): Promise<Safety>;
  createListing(token: string, input: CreateListingInput): Promise<{ listing: Listing; safety: Safety }>;
  favorites(token: string): Promise<ShowSummary[]>;
  setFavorite(token: string, showId: string, on: boolean): Promise<ShowSummary[]>;
  setAlerts(token: string, on: boolean): Promise<{ alertsOn: boolean }>;
  notifications(token: string): Promise<Notification[]>;
  markRead(token: string): Promise<void>;
  orders(token: string): Promise<OrderDetail[]>;
  order(token: string, id: string): Promise<OrderDetail>;
  createOrder(token: string, listingId: string): Promise<Order>;
  markSent(token: string, id: string): Promise<Order>;
  confirm(token: string, id: string): Promise<Order>;
  cancel(token: string, id: string): Promise<Order>;
  /** 시연 모드 전용: 시연 판매자가 즐겨찾기 공연에 정가 이하 매물을 올려 알림을 확인한다. */
  simulateBelowFace?(token: string): Promise<string | null>;
}

const TIMEOUT_MS = 15_000;

export function createHttpMarket(baseUrl: string, fetchImpl: typeof fetch = fetch): MarketApi {
  const root = baseUrl.replace(/\/+$/, '');
  async function call<T>(method: string, path: string, body?: unknown, token?: string | null): Promise<T> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetchImpl(`${root}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(
        timedOut
          ? { code: 'TIMEOUT', message: '서버 응답 시간이 초과됐어요.', retryable: true }
          : { code: 'NETWORK_ERROR', message: '서버에 연결하지 못했어요. 네트워크를 확인해 주세요.', retryable: true },
      );
    } finally {
      clearTimeout(timer);
    }
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new ApiError({ code: 'INVALID_RESPONSE', message: '서버 응답을 읽지 못했어요.', retryable: true });
    }
    if (!res.ok) {
      const e = data as { code?: unknown; message?: unknown; retryable?: unknown };
      if (typeof e?.code === 'string' && typeof e?.message === 'string') throw new ApiError({ code: e.code, message: e.message, retryable: e.retryable === true });
      throw new ApiError({ code: `HTTP_${res.status}`, message: '서버가 요청을 처리하지 못했어요.', retryable: res.status >= 500 });
    }
    if (data === null || typeof data !== 'object') throw new ApiError({ code: 'INVALID_RESPONSE', message: '서버 응답 형식이 예상과 달라요.', retryable: false });
    return data as T;
  }
  const enc = encodeURIComponent;
  return {
    mode: 'live',
    signup: (name, password, email, verificationCode) => call('POST', '/auth/signup', { name, password, ...(email !== undefined ? { email, verificationCode } : {}) }),
    sendVerification: async (email) => { await call('POST', '/auth/email/send', { email }); },
    checkAvailability: (kind, value) => call('POST', '/auth/availability', { kind, value }),
    performances: async (category, page = 1) => {
      const query = new URLSearchParams({ page: String(page) });
      if (category) query.set('category', category);
      const data = await call<unknown>('GET', `/performance-cards?${query.toString()}`);
      if (!Array.isArray(data) || !data.every((item) => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.title === 'string' && (item.venue === null || typeof item.venue === 'string') && typeof item.startsOn === 'string' && typeof item.endsOn === 'string' && (item.status === null || typeof item.status === 'string') && item.source === 'KOPIS' && typeof item.fetchedAt === 'string' && (item.genre === null || typeof item.genre === 'string') && (item.posterUrl === null || typeof item.posterUrl === 'string'))) {
        throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연정보 응답을 확인할 수 없어요.', retryable: true });
      }
      return data as Performance[];
    },
    performanceDetail: async (id) => {
      const item = await call<unknown>('GET', `/performance-cards/${encodeURIComponent(id)}`);
      if (!item || typeof item !== 'object') throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연 정보를 확인할 수 없어요.', retryable: true });
      const detail = item as Record<string, unknown>;
      if (detail.priceCandidate !== undefined && detail.priceCandidate !== null) {
        const candidate = detail.priceCandidate as Record<string, unknown>;
        if (typeof candidate !== 'object' || candidate.seatGrade !== '전석' || !Number.isSafeInteger(candidate.price) || (candidate.price as number) <= 0 || typeof candidate.sourceQuote !== 'string' || candidate.sourceQuote !== detail.priceGuide) throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연 좌석 가격 정보를 확인할 수 없어요.', retryable: true });
      }
      if (detail.stageCapacity !== undefined && detail.stageCapacity !== null && (!Number.isSafeInteger(detail.stageCapacity) || (detail.stageCapacity as number) <= 0)) throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연장 좌석 정보를 확인할 수 없어요.', retryable: true });
      if (detail.priceGuide !== undefined && detail.priceGuide !== null && typeof detail.priceGuide !== 'string') throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연 가격 정보를 확인할 수 없어요.', retryable: true });
      if (detail.introImages !== undefined && (!Array.isArray(detail.introImages) || !detail.introImages.every((url: unknown) => typeof url === 'string'))) throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연 이미지를 확인할 수 없어요.', retryable: true });
      if (detail.id !== id || typeof detail.title !== 'string' || detail.source !== 'KOPIS' || typeof detail.startsOn !== 'string' || typeof detail.endsOn !== 'string' || !['venue', 'genre', 'posterUrl', 'status', 'story', 'cast', 'runtime', 'age', 'schedule'].every((key) => detail[key] === null || typeof detail[key] === 'string') || typeof detail.fetchedAt !== 'string') {
        throw new ApiError({ code: 'INVALID_RESPONSE', message: '공연 정보를 확인할 수 없어요.', retryable: true });
      }
      return detail as PerformanceDetail;
    },
    preparePerformanceDemo: (id, token) => call('POST', `/performance-cards/${encodeURIComponent(id)}/demo-market`, {}, token),
    login: (name, password) => call('POST', '/auth/login', name.trim().includes('@') ? { email: name.trim(), password } : { name, password }),
    logout: async (token) => {
      await call('POST', '/auth/logout', {}, token);
    },
    me: (token) => call('GET', '/me', undefined, token),
    shows: (q, token) => {
      const params = new URLSearchParams();
      if (q.category) params.set('category', q.category);
      if (q.query) params.set('q', q.query);
      const qs = params.toString();
      return call('GET', `/shows${qs ? `?${qs}` : ''}`, undefined, token);
    },
    show: (id, token) => call('GET', `/shows/${enc(id)}`, undefined, token),
    listing: (id) => call('GET', `/listings/${enc(id)}`),
    preview: (input) => call('POST', '/listings/preview', input),
    createListing: (token, input) => call('POST', '/listings', input, token),
    favorites: (token) => call('GET', '/me/favorites', undefined, token),
    setFavorite: (token, showId, on) => call(on ? 'PUT' : 'DELETE', `/me/favorites/${enc(showId)}`, undefined, token),
    setAlerts: (token, on) => call('PUT', '/me/alerts', { on }, token),
    notifications: (token) => call('GET', '/me/notifications', undefined, token),
    markRead: async (token) => {
      await call('POST', '/me/notifications/read', {}, token);
    },
    orders: (token) => call('GET', '/me/orders', undefined, token),
    order: (token, id) => call('GET', `/orders/${enc(id)}`, undefined, token),
    createOrder: (token, listingId) => call('POST', '/orders', { listingId }, token),
    markSent: (token, id) => call('POST', `/orders/${enc(id)}/sent`, {}, token),
    confirm: (token, id) => call('POST', `/orders/${enc(id)}/confirm`, {}, token),
    cancel: (token, id) => call('POST', `/orders/${enc(id)}/cancel`, {}, token),
  };
}

/** 시연 모드: 가상 공연 3건 + 시연 매물. 계정은 앱 메모리에만 있고 앱을 끄면 사라진다(실제 인증 아님). */
export function createDemoMarket(opts: { latencyMs?: number } = {}): MarketApi {
  const latency = opts.latencyMs ?? 250;
  const core = new MarketCore(seedState(null, new Date().toISOString()));
  core.state.users.push({ id: 'demo-seller', name: '시연판매자', alertsOn: false, favorites: [] });
  const passwords = new Map<string, string>(); // 시연 전용(메모리). 실서버는 scrypt 해시만 저장.
  const emails = new Map<string, string>();
  const sessions = new Map<string, string>();
  let n = 0;
  const wait = () => (latency > 0 ? new Promise((r) => setTimeout(r, latency)) : Promise.resolve());
  async function run<T>(fn: () => T): Promise<T> {
    await wait();
    try {
      return JSON.parse(JSON.stringify(fn())) as T;
    } catch (e) {
      if (e instanceof MarketError) throw new ApiError({ code: e.code, message: e.message, retryable: false });
      throw e;
    }
  }
  const user = (token: string | null | undefined) => {
    const id = token ? sessions.get(token) : undefined;
    if (!id) throw new MarketError('UNAUTHORIZED', '로그인이 필요해요.', 401);
    return id;
  };
  const issue = (id: string): Session => {
    const token = `demo-token-${++n}`;
    sessions.set(token, id);
    const u = core.state.users.find((x) => x.id === id)!;
    return { token, expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(), user: { id: u.id, name: u.name, alertsOn: u.alertsOn } };
  };
  return {
    mode: 'demo',
    performances: async () => { throw new ApiError({ code: 'KOPIS_NOT_CONFIGURED', message: '시연 모드에서는 실제 공연을 불러올 수 없어요.', retryable: false }); },
    performanceDetail: async () => { throw new ApiError({ code: 'KOPIS_NOT_CONFIGURED', message: '시연 모드에서는 실제 공연을 불러올 수 없어요.', retryable: false }); },
    preparePerformanceDemo: async () => { throw new ApiError({ code: 'KOPIS_NOT_CONFIGURED', message: '서버 연결 후 시연 매물을 준비할 수 있어요.', retryable: false }); },
    sendVerification: async () => { throw new ApiError({ code: 'EMAIL_NOT_CONFIGURED', message: '시연 모드에서는 인증 메일을 보낼 수 없어요.', retryable: false }); },
    checkAvailability: (kind, value) => run(() => {
      const trimmed = value.trim();
      if (kind === 'name') {
        if (!/^[\p{L}\p{N}_.-]{2,20}$/u.test(trimmed)) throw new MarketError('BAD_REQUEST', '닉네임은 2~20자로 정해 주세요.');
        return { available: !core.state.users.some((user) => user.name.toLowerCase() === trimmed.toLowerCase()) };
      }
      const parts = trimmed.split('@');
      if (parts.length !== 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) throw new MarketError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
      return { available: !emails.has(`${parts[0]}@${parts[1].toLowerCase()}`) };
    }),
    signup: (name, password, email) =>
      run(() => {
        const nm = name.trim();
        const parts = email?.trim().split('@');
        const normalized = parts?.length === 2 ? `${parts[0]}@${parts[1].toLowerCase()}` : null;
        if (email !== undefined && (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))) throw new MarketError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
        if (normalized && emails.has(normalized)) throw new MarketError('EMAIL_TAKEN', '이미 사용 중인 이메일이에요.', 409);
        if (!/^[\p{L}\p{N}_.-]{2,20}$/u.test(nm)) throw new MarketError('BAD_REQUEST', '닉네임은 2~20자(한글·영문·숫자)로 정해 주세요.');
        if (!isValidNewPassword(password)) throw new MarketError('BAD_REQUEST', PASSWORD_RULE_MESSAGE);
        if (core.state.users.some((u) => u.name.toLowerCase() === nm.toLowerCase())) throw new MarketError('NAME_TAKEN', '이미 쓰는 닉네임이에요.', 409);
        const id = `usr-demo-${core.state.users.length + 1}`;
        core.state.users.push({ id, name: nm, alertsOn: true, favorites: [] });
        passwords.set(id, password);
        if (normalized) emails.set(normalized, id);
        return issue(id);
      }),
    login: (name, password) =>
      run(() => {
        const identifier = name.trim();
        const parts = identifier.split('@');
        const emailId = parts.length === 2 ? emails.get(`${parts[0]}@${parts[1].toLowerCase()}`) : undefined;
        const u = identifier.includes('@') ? core.state.users.find((x) => x.id === emailId) : core.state.users.find((x) => x.name.toLowerCase() === identifier.toLowerCase());
        if (!u || passwords.get(u.id) !== password) throw new MarketError('INVALID_CREDENTIALS', '아이디 또는 비밀번호가 맞지 않아요.', 401);
        return issue(u.id);
      }),
    logout: async (token) => {
      sessions.delete(token);
    },
    me: (token) =>
      run(() => {
        const id = user(token);
        const u = core.state.users.find((x) => x.id === id)!;
        return { id, name: u.name, alertsOn: u.alertsOn, unread: core.notifications(id).filter((x) => !x.read).length };
      }),
    shows: (q, token) => run(() => core.listShows({ ...q, userId: token ? sessions.get(token) : undefined })),
    show: (id, token) => run(() => core.getShow(id, token ? sessions.get(token) : undefined)),
    listing: (id) => run(() => core.getListing(id)),
    preview: (input) => run(() => core.previewSafety(input)),
    createListing: (token, input) => run(() => core.createListing(user(token), input)),
    favorites: (token) => run(() => core.favorites(user(token))),
    setFavorite: (token, showId, on) => run(() => core.setFavorite(user(token), showId, on)),
    setAlerts: (token, on) => run(() => core.setAlerts(user(token), on)),
    notifications: (token) => run(() => core.notifications(user(token))),
    markRead: async (token) => {
      await run(() => core.markRead(user(token)));
    },
    orders: (token) => run(() => core.orders(user(token))),
    order: (token, id) => run(() => core.getOrder(user(token), id)),
    createOrder: (token, listingId) => run(() => core.createOrder(user(token), listingId)),
    markSent: (token, id) => run(() => core.markSent(user(token), id)),
    confirm: (token, id) => run(() => core.confirmReceived(user(token), id)),
    cancel: (token, id) => run(() => core.cancelOrder(user(token), id)),
    simulateBelowFace: (token) =>
      run(() => {
        const id = user(token);
        const fav = core.state.users.find((u) => u.id === id)?.favorites[0];
        const show = fav ? core.state.shows.find((s) => s.id === fav.showId) : undefined;
        const face = show?.facePrices[0];
        if (!show || !face) return null;
        core.createListing('demo-seller', {
          showId: show.id, sessionId: show.sessions[0].id, seatGrade: face.seatGrade, quantity: 1,
          pricePerTicket: Math.max(1000, Math.round((face.price * 0.95) / 1000) * 1000), delivery: 'official_transfer', bookingType: 'general',
        });
        return show.title;
      }),
  };
}

export function createMarketFromEnvironment(): MarketApi {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return baseUrl ? createHttpMarket(baseUrl) : createDemoMarket();
}
