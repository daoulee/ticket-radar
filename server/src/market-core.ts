// 티켓 중개 구매 플랫폼(시연) 핵심 규칙 — 순수 TypeScript, 외부 의존성·Node API 없음.
// 같은 파일을 앱 시연 모드가 그대로 쓴다(mobile/src/market/engine.ts 는 이 파일의 복사본, 서버 테스트가 동일성을 검사).
// 사용자 결정(2026-11-03): 중개 구매 메인 · 암표 방지는 매물마다 '안심 확인' · 시연 결제만 · 즐겨찾기=계정 · 정가 이하 알림.
// 원칙: 안심 확인은 공식 자료와의 비교일 뿐 진위·입장 보증이 아니다. 실제 공연의 공식 규정은 등록된 원문만 쓴다.

export type Category = 'concert' | 'musical' | 'sports';
export type Delivery = 'official_transfer' | 'qr_capture' | 'onsite' | 'courier';
export type BookingType = 'fanclub_presale' | 'general' | 'unknown';
export type OrderStatus = 'held' | 'sent' | 'settled' | 'cancelled';

export interface Policy {
  kind: 'presale_identity' | 'capture_blocked';
  title: string;
  excerpt: string;
  sourceUrl: string | null;
}
export interface Show {
  id: string;
  category: Category;
  title: string;
  posterUrl?: string | null;
  venue: string;
  sessions: { id: string; label: string; startsAt: string | null }[];
  facePrices: { seatGrade: string; price: number }[];
  faceSource: { label: string; url: string | null; checkedAt: string } | null;
  policies: Policy[];
  isDemo: boolean; // 가상 공연·합성 자료
}
export interface Listing {
  id: string;
  showId: string;
  sessionId: string;
  seatGrade: string;
  quantity: number;
  pricePerTicket: number;
  originalPricePerTicket?: number; // 판매자 입력, 기존 매물은 미제공
  delivery: Delivery;
  bookingType: BookingType;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  status: 'active' | 'reserved' | 'sold';
  isDemo: boolean;
}
export interface SafetyCheck {
  ok: boolean;
  title: string;
  detail: string;
  officialExcerpt: string | null;
  sourceUrl: string | null;
}
export interface Safety {
  facePrice: number | null;
  diff: number | null;
  ratePercent: number | null;
  priceText: string; // "8,000원 저렴해요" / "30% 비싸요" / "정가와 같아요" / "정가 확인 불가"
  priceTone: 'good' | 'same' | 'high' | 'unknown';
  checks: SafetyCheck[];
  attention: number; // ok=false 개수
}
export interface UserPublic {
  id: string;
  name: string;
  alertsOn: boolean;
}
export interface UserState extends UserPublic {
  favorites: { showId: string; since: string; lastViewed: string }[];
}
export interface Notification {
  id: string;
  userId: string;
  showId: string;
  listingId: string;
  text: string;
  createdAt: string;
  read: boolean;
}
export interface Order {
  id: string;
  listingId: string;
  showId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: OrderStatus;
  history: { at: string; status: OrderStatus }[];
  isDemoPayment: true;
  testPayment?: { provider: 'toss_test'; orderId: string; status: 'pending' | 'confirming' | 'approved' | 'expired' | 'cancelled'; expiresAt: number; paymentKey?: string };
}
export interface MarketState {
  shows: Show[];
  listings: Listing[];
  users: UserState[];
  notifications: Notification[];
  orders: Order[];
}

export class MarketError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const DELIVERY_TEXT: Record<Delivery, string> = {
  official_transfer: '공식 양도',
  qr_capture: 'QR 캡처 전달',
  onsite: '현장 전달',
  courier: '택배',
};
export const deliveryText = (d: Delivery) => DELIVERY_TEXT[d];
export const CATEGORY_TEXT: Record<Category, string> = { concert: '콘서트', musical: '뮤지컬·연극', sports: '스포츠' };

/** 안심 확인: 같은 좌석 등급의 공식 정가와 비교하고, 등록된 공식 규정과 판매 조건을 대조한다. */
export function computeSafety(show: Show, l: Pick<Listing, 'seatGrade' | 'pricePerTicket' | 'delivery' | 'bookingType'>): Safety {
  const face = show.facePrices.find((f) => f.seatGrade === l.seatGrade)?.price ?? null;
  let priceText = '정가 확인 불가';
  let priceTone: Safety['priceTone'] = 'unknown';
  let diff: number | null = null;
  let ratePercent: number | null = null;
  if (face && face > 0) {
    diff = l.pricePerTicket - face;
    ratePercent = Math.round((diff / face) * 1000) / 10;
    if (diff === 0) { priceText = '정가와 같아요'; priceTone = 'same'; }
    else if (diff < 0) { priceText = `${won(-diff)} 저렴해요`; priceTone = 'good'; }
    else { priceText = `${Math.round((diff / face) * 100)}% 비싸요`; priceTone = 'high'; }
  }
  const checks: SafetyCheck[] = [];
  const src = show.faceSource;
  const isKopisDemoPrice = src?.label === 'KOPIS 안내 기반 시연 기준가';
  if (isKopisDemoPrice && diff !== null) priceText = diff === 0 ? '시연 기준가와 같아요' : diff < 0 ? `시연 기준가보다 ${won(-diff)} 낮아요` : '시연 기준가 초과';
  checks.push(
    face
      ? { ok: diff! <= 0, title: isKopisDemoPrice ? (diff! <= 0 ? '시연 기준가 이하예요' : '시연 기준가 초과') : diff! <= 0 ? '공식 정가 이하예요' : `정가보다 ${won(diff!)} 비싸요`, detail: `${l.seatGrade} ${isKopisDemoPrice ? 'KOPIS 안내 기반 시연 기준가' : '공식 정가'} ${won(face)} (1매 기본가)`, officialExcerpt: null, sourceUrl: src?.url ?? null }
      : { ok: false, title: '공식 정가를 확인할 수 없어요', detail: `${l.seatGrade} 등급의 공식 가격이 등록되지 않았어요`, officialExcerpt: null, sourceUrl: null },
  );
  for (const p of show.policies) {
    if (p.kind === 'presale_identity') {
      if (l.bookingType === 'fanclub_presale') checks.push({ ok: false, title: '선예매 티켓은 관람자 본인 확인이 있어요', detail: '구매자가 입장하지 못할 수 있어요. 예매처에 확인하세요.', officialExcerpt: p.excerpt, sourceUrl: p.sourceUrl });
      else if (l.bookingType === 'unknown') checks.push({ ok: false, title: '예매 유형을 확인해야 해요', detail: '팬클럽 선예매 티켓이면 관람자 본인 확인 규정이 있어요.', officialExcerpt: p.excerpt, sourceUrl: p.sourceUrl });
    }
    if (p.kind === 'capture_blocked' && l.delivery === 'qr_capture') {
      checks.push({ ok: false, title: '캡처로는 입장할 수 없어요', detail: '공식 안내와 전달 방식이 달라요.', officialExcerpt: p.excerpt, sourceUrl: p.sourceUrl });
    }
  }
  if (l.delivery === 'official_transfer') checks.push({ ok: true, title: '공식 양도로 전달해요', detail: '예매처 앱에서 티켓을 넘겨받아요.', officialExcerpt: null, sourceUrl: null });
  return { facePrice: face, diff, ratePercent, priceText, priceTone, checks, attention: checks.filter((c) => !c.ok).length };
}

export interface CreateListingInput {
  showId: string;
  sessionId: string;
  seatGrade: string;
  quantity: number;
  pricePerTicket: number;
  originalPricePerTicket: number;
  delivery: Delivery;
  bookingType: BookingType;
}

export class MarketCore {
  readonly state: MarketState;
  private readonly now: () => number;
  private readonly id: (prefix: string) => string;
  private readonly onChange: () => void;

  constructor(state: MarketState, opts: { now?: () => number; id?: (prefix: string) => string; onChange?: () => void } = {}) {
    this.state = state;
    this.now = opts.now ?? Date.now;
    let n = 0;
    this.id = opts.id ?? ((p) => `${p}-${this.now().toString(36)}-${(++n).toString(36)}`);
    this.onChange = opts.onChange ?? (() => undefined);
  }
  private iso() { return new Date(this.now()).toISOString(); }
  private assertPriceAllowed(show: Show, seatGrade: string, price: number) {
    const face = show.facePrices.find((tier) => tier.seatGrade === seatGrade)?.price;
    if (!show.faceSource || !Number.isSafeInteger(face) || !face || face <= 0) throw new MarketError('FACE_PRICE_UNVERIFIED', '해당 좌석의 기준 가격을 확인할 수 없어요.', 409);
    if (price > face) throw new MarketError('PRICE_ABOVE_FACE', '판매가는 확인된 기준 가격 이하여야 해요.', 400);
  }
  private show(id: string) {
    const s = this.state.shows.find((x) => x.id === id);
    if (!s) throw new MarketError('SHOW_NOT_FOUND', '공연을 찾을 수 없어요.', 404);
    return s;
  }
  private user(id: string) {
    const u = this.state.users.find((x) => x.id === id);
    if (!u) throw new MarketError('UNAUTHORIZED', '로그인이 필요해요.', 401);
    return u;
  }
  private active(showId: string) {
    return this.state.listings.filter((l) => l.showId === showId && l.status === 'active');
  }
  private summary(s: Show, userId?: string) {
    const ls = this.active(s.id);
    const minPrice = ls.reduce<number | null>((m, l) => (m === null || l.pricePerTicket < m ? l.pricePerTicket : m), null);
    const below = ls.filter((l) => { const f = s.facePrices.find((x) => x.seatGrade === l.seatGrade)?.price; return f !== undefined && l.pricePerTicket <= f; }).length;
    const fav = userId ? this.state.users.find((u) => u.id === userId)?.favorites.find((f) => f.showId === s.id) : undefined;
    return {
      id: s.id, category: s.category, title: s.title, venue: s.venue, firstSession: s.sessions[0]?.label ?? null,
      posterUrl: s.posterUrl, canRegister: s.faceSource?.label !== 'KOPIS 안내 기반 시연 기준가',
      sessionCount: s.sessions.length, listingCount: ls.length, minPrice,
      belowFaceCount: below, isDemo: s.isDemo, favorite: !!fav,
      newCount: fav ? ls.filter((l) => l.createdAt > fav.lastViewed).length : 0,
    };
  }

  listShows(q: { category?: Category | null; query?: string; userId?: string } = {}) {
    const query = (q.query ?? '').trim().toLowerCase();
    return this.state.shows
      .filter((s) => (!q.category || s.category === q.category) && (!query || `${s.title} ${s.venue}`.toLowerCase().includes(query)))
      .map((s) => this.summary(s, q.userId));
  }

  getShow(id: string, userId?: string, sort: 'price' | 'recent' = 'price') {
    const s = this.show(id);
    const listings = this.active(id)
      .map((l) => ({ ...l, safety: computeSafety(s, l) }))
      .sort((a, b) => (sort === 'price' ? a.pricePerTicket - b.pricePerTicket : b.createdAt.localeCompare(a.createdAt)));
    const summary = this.summary(s, userId);
    if (userId) {
      const fav = this.state.users.find((u) => u.id === userId)?.favorites.find((f) => f.showId === id);
      // 조회마다 파일을 다시 쓰지 않도록 1분이 지난 경우에만 저장한다(검토 지적 4).
      if (fav) {
        const stale = this.now() - Date.parse(fav.lastViewed) > 60_000;
        fav.lastViewed = this.iso();
        if (stale) this.onChange();
      }
    }
    return { show: s, summary, listings };
  }

  getListing(id: string) {
    const l = this.state.listings.find((x) => x.id === id);
    if (!l) throw new MarketError('LISTING_NOT_FOUND', '매물을 찾을 수 없어요.', 404);
    const s = this.show(l.showId);
    return { listing: l, show: s, safety: computeSafety(s, l), session: s.sessions.find((x) => x.id === l.sessionId) ?? null };
  }

  /** 판매자가 등록 전에 보는 미리보기(저장하지 않음). */
  previewSafety(input: Pick<CreateListingInput, 'showId' | 'seatGrade' | 'pricePerTicket' | 'delivery' | 'bookingType'>) {
    if (typeof input.delivery !== 'string' || !Object.prototype.hasOwnProperty.call(DELIVERY_TEXT, input.delivery)) throw new MarketError('BAD_REQUEST', '전달 방식을 선택해 주세요.');
    if (!Number.isSafeInteger(input.pricePerTicket) || input.pricePerTicket < 0) throw new MarketError('BAD_REQUEST', '장당 가격을 확인해 주세요.');
    return computeSafety(this.show(input.showId), input);
  }

  createListing(userId: string, input: CreateListingInput) {
    const u = this.user(userId);
    const s = this.show(input.showId);
    if (s.faceSource?.label === 'KOPIS 안내 기반 시연 기준가') throw new MarketError('DEMO_LISTING_READ_ONLY', '이 공연은 시연 매물만 볼 수 있어요.', 409);
    if (!s.sessions.some((x) => x.id === input.sessionId)) throw new MarketError('BAD_REQUEST', '회차를 선택해 주세요.');
    if (!input.seatGrade?.trim() || input.seatGrade.length > 40) throw new MarketError('BAD_REQUEST', '좌석 등급을 입력해 주세요.');
    if (input.quantity !== 1) throw new MarketError('BAD_REQUEST', '시연 매물은 한 번에 1매만 등록할 수 있어요.');
    if (!Number.isSafeInteger(input.pricePerTicket) || input.pricePerTicket < 1000 || input.pricePerTicket > 10_000_000) throw new MarketError('BAD_REQUEST', '장당 가격을 확인해 주세요.');
    this.assertPriceAllowed(s, input.seatGrade, input.pricePerTicket);
    if (!Number.isSafeInteger(input.originalPricePerTicket) || input.originalPricePerTicket < 1000 || input.originalPricePerTicket > 10_000_000) throw new MarketError('BAD_REQUEST', '원구매가를 확인해 주세요.');
    if (input.pricePerTicket > input.originalPricePerTicket) throw new MarketError('PRICE_ABOVE_PURCHASE', '양도가는 입력한 원구매가 이하여야 해요.');
    if (typeof input.delivery !== 'string' || !Object.prototype.hasOwnProperty.call(DELIVERY_TEXT, input.delivery)) throw new MarketError('BAD_REQUEST', '전달 방식을 선택해 주세요.');
    if (!['fanclub_presale', 'general', 'unknown'].includes(input.bookingType)) throw new MarketError('BAD_REQUEST', '예매 유형을 선택해 주세요.');
    // 남용 방지(검토 지적 3): 판매자당 판매 중 20건, 전체 5,000건.
    if (this.state.listings.filter((x) => x.sellerId === u.id && x.status !== 'sold').length >= 20) throw new MarketError('LISTING_LIMIT', '판매 중인 매물이 너무 많아요(최대 20건).', 429);
    if (this.state.listings.length >= 5000) throw new MarketError('LISTING_LIMIT', '지금은 매물을 더 올릴 수 없어요.', 503);
    const listing: Listing = {
      id: this.id('lst'), showId: s.id, sessionId: input.sessionId, seatGrade: input.seatGrade.trim(), quantity: input.quantity,
      pricePerTicket: input.pricePerTicket, originalPricePerTicket: input.originalPricePerTicket, delivery: input.delivery, bookingType: input.bookingType,
      sellerId: u.id, sellerName: u.name, createdAt: this.iso(), status: 'active', isDemo: true,
    };
    this.state.listings.push(listing);
    // 정가 이하 알림: 이 공연을 즐겨찾기하고 알림을 켠 다른 사용자에게 남긴다.
    const safety = computeSafety(s, listing);
    if (safety.facePrice !== null && safety.diff !== null && safety.diff <= 0) {
      for (const other of this.state.users) {
        if (other.id === u.id || !other.alertsOn || !other.favorites.some((f) => f.showId === s.id)) continue;
        this.state.notifications.push({
          id: this.id('ntf'), userId: other.id, showId: s.id, listingId: listing.id, createdAt: listing.createdAt, read: false,
          text: `${s.title} ${listing.seatGrade} ${won(listing.pricePerTicket)} · 정가 이하 매물이 올라왔어요`,
        });
      }
    }
    this.onChange();
    return { listing, safety };
  }

  // ── 계정별 즐겨찾기·알림 ──
  setFavorite(userId: string, showId: string, on: boolean) {
    const u = this.user(userId);
    this.show(showId);
    const has = u.favorites.some((f) => f.showId === showId);
    if (on && !has) { const t = this.iso(); u.favorites.push({ showId, since: t, lastViewed: t }); }
    if (!on && has) u.favorites = u.favorites.filter((f) => f.showId !== showId);
    this.onChange();
    return this.favorites(userId);
  }
  favorites(userId: string) {
    const u = this.user(userId);
    return u.favorites.map((f) => this.summary(this.show(f.showId), userId));
  }
  setAlerts(userId: string, on: boolean) {
    const u = this.user(userId);
    u.alertsOn = on;
    this.onChange();
    return { alertsOn: u.alertsOn };
  }
  notifications(userId: string) {
    this.user(userId);
    return this.state.notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  markRead(userId: string) {
    for (const n of this.state.notifications) if (n.userId === userId) n.read = true;
    this.onChange();
  }

  // ── 시연 주문(에스크로 흉내) ──
  createOrder(userId: string, listingId: string, testPayment?: { orderId: string; expiresAt: number }) {
    this.user(userId);
    const { listing, show } = this.getListing(listingId);
    if (listing.status !== 'active') throw new MarketError('LISTING_UNAVAILABLE', '이미 거래 중이거나 판매된 매물이에요.', 409);
    if (listing.sellerId === userId) throw new MarketError('OWN_LISTING', '내 매물은 살 수 없어요.', 409);
    this.assertPriceAllowed(show, listing.seatGrade, listing.pricePerTicket);
    if (testPayment && (!/^trtest_[a-f0-9]{32}$/.test(testPayment.orderId) || !Number.isSafeInteger(testPayment.expiresAt) || testPayment.expiresAt <= this.now() || testPayment.expiresAt > this.now() + 15 * 60_000 || this.state.orders.some(order => order.testPayment?.orderId === testPayment.orderId))) throw new MarketError('BAD_PAYMENT', '시연 결제 정보를 확인해 주세요.');
    const at = this.iso();
    const order: Order = {
      id: this.id('ord'), listingId, showId: listing.showId, buyerId: userId, sellerId: listing.sellerId,
      amount: listing.pricePerTicket * listing.quantity, status: 'held', history: [{ at, status: 'held' }], isDemoPayment: true,
      ...(testPayment ? { testPayment: { provider: 'toss_test' as const, orderId: testPayment.orderId, status: 'pending' as const, expiresAt: testPayment.expiresAt } } : {}),
    };
    listing.status = 'reserved';
    // 시연 판매자(demo-*)는 바로 '전달함' 상태로 넘어간다(시연 흐름 진행용).
    if (!testPayment && listing.sellerId.startsWith('demo-')) { order.status = 'sent'; order.history.push({ at, status: 'sent' }); }
    this.state.orders.push(order);
    this.onChange();
    return order;
  }
  private order(userId: string, id: string) {
    const o = this.state.orders.find((x) => x.id === id);
    if (!o || (o.buyerId !== userId && o.sellerId !== userId)) throw new MarketError('ORDER_NOT_FOUND', '거래를 찾을 수 없어요.', 404);
    return o;
  }
  getOrder(userId: string, id: string) {
    const o = this.order(userId, id);
    const { listing, show, session } = this.getListing(o.listingId);
    return { order: o, listing, show, session, role: o.buyerId === userId ? ('buyer' as const) : ('seller' as const) };
  }
  orders(userId: string) {
    this.user(userId);
    return this.state.orders
      .filter((o) => o.buyerId === userId || o.sellerId === userId)
      .sort((a, b) => b.history[0].at.localeCompare(a.history[0].at))
      .map((o) => this.getOrder(userId, o.id));
  }
  markSent(userId: string, id: string) {
    const o = this.order(userId, id);
    if (o.sellerId !== userId) throw new MarketError('FORBIDDEN', '판매자만 전달 완료를 누를 수 있어요.', 403);
    if (o.testPayment && o.testPayment.status !== 'approved') throw new MarketError('PAYMENT_PENDING', '테스트 결제 승인 후 전달할 수 있어요.', 409);
    if (o.status !== 'held') throw new MarketError('BAD_STATE', '이미 처리된 거래예요.', 409);
    o.status = 'sent'; o.history.push({ at: this.iso(), status: 'sent' });
    this.onChange();
    return o;
  }
  confirmReceived(userId: string, id: string) {
    const o = this.order(userId, id);
    if (o.buyerId !== userId) throw new MarketError('FORBIDDEN', '구매자만 수령 확인을 할 수 있어요.', 403);
    if (o.testPayment && o.testPayment.status !== 'approved') throw new MarketError('PAYMENT_PENDING', '테스트 결제 승인 후 수령을 확인할 수 있어요.', 409);
    if (o.status !== 'sent') throw new MarketError('BAD_STATE', '판매자가 티켓을 보낸 뒤에 확인할 수 있어요.', 409);
    o.status = 'settled'; o.history.push({ at: this.iso(), status: 'settled' });
    const l = this.state.listings.find((x) => x.id === o.listingId);
    if (l) l.status = 'sold';
    this.onChange();
    return o;
  }
  cancelOrder(userId: string, id: string) {
    const o = this.order(userId, id);
    if (o.status === 'settled' || o.status === 'cancelled') throw new MarketError('BAD_STATE', '취소할 수 없는 거래예요.', 409);
    if (o.testPayment && o.testPayment.status !== 'pending') throw new MarketError('PAYMENT_RECONCILIATION_REQUIRED', '테스트 결제 상태를 먼저 확인해야 해요.', 409);
    // 티켓을 보낸 뒤에는 구매자가 혼자 취소할 수 없다(검토 지적 1: 티켓을 받고 환불·재판매되는 문제). 판매자는 보낸 뒤에도 취소 가능.
    if (o.status === 'sent' && o.buyerId === userId) throw new MarketError('BAD_STATE', '판매자가 티켓을 보낸 뒤에는 취소할 수 없어요. 문제가 있으면 신고해 주세요.', 409);
    o.status = 'cancelled'; o.history.push({ at: this.iso(), status: 'cancelled' });
    if (o.testPayment) o.testPayment.status = 'cancelled';
    const l = this.state.listings.find((x) => x.id === o.listingId);
    if (l && l.status === 'reserved') l.status = 'active';
    this.onChange();
    return o;
  }

  /** Approval attempts are persisted before the network call; retries must use the same payment key. */
  beginTestPaymentConfirmation(userId: string, id: string, orderId: string, amount: number, paymentKey: string) {
    const order = this.order(userId, id), payment = order.testPayment;
    if (order.buyerId !== userId) throw new MarketError('FORBIDDEN', '구매자만 테스트 결제를 승인할 수 있어요.', 403);
    if (!payment || payment.orderId !== orderId || order.amount !== amount || typeof paymentKey !== 'string' || !paymentKey.trim() || paymentKey.length > 200) throw new MarketError('BAD_PAYMENT', '테스트 결제 정보를 확인해 주세요.');
    if (order.status === 'cancelled' || payment.status === 'cancelled' || payment.status === 'expired') throw new MarketError('BAD_STATE', '종료된 테스트 결제예요.', 409);
    if (payment.paymentKey && payment.paymentKey !== paymentKey) throw new MarketError('BAD_PAYMENT', '기존 테스트 결제 정보와 일치하지 않아요.', 409);
    if (payment.status === 'approved') return order;
    if (payment.status === 'pending' && payment.expiresAt <= this.now()) throw new MarketError('PAYMENT_EXPIRED', '테스트 결제 시간이 만료됐어요.', 409);
    payment.paymentKey = paymentKey; payment.status = 'confirming'; this.onChange(); return order;
  }

  /** Call only after verifying the test provider's order id, key, amount and DONE status. */
  completeTestPaymentConfirmation(userId: string, id: string, orderId: string, amount: number, paymentKey: string) {
    const order = this.order(userId, id), payment = order.testPayment;
    if (order.buyerId !== userId) throw new MarketError('FORBIDDEN', '구매자만 테스트 결제를 승인할 수 있어요.', 403);
    if (!payment || payment.orderId !== orderId || order.amount !== amount || payment.paymentKey !== paymentKey) throw new MarketError('BAD_PAYMENT', '테스트 결제 정보를 확인해 주세요.');
    if (payment.status === 'approved') return order;
    if (payment.status !== 'confirming' || order.status !== 'held') throw new MarketError('BAD_STATE', '테스트 결제 상태를 확인해 주세요.', 409);
    payment.status = 'approved';
    if (order.sellerId.startsWith('demo-')) { order.status = 'sent'; order.history.push({ at: this.iso(), status: 'sent' }); }
    this.onChange(); return order;
  }

  /** Release an uncertain order only after the provider confirms a terminal non-paid state. */
  resolveTestPaymentCancellation(userId: string, id: string, orderId: string, amount: number, paymentKey: string) {
    const order = this.order(userId, id), payment = order.testPayment;
    if (order.buyerId !== userId) throw new MarketError('FORBIDDEN', '구매자만 테스트 결제 상태를 확인할 수 있어요.', 403);
    if (!payment || payment.orderId !== orderId || order.amount !== amount || payment.paymentKey !== paymentKey) throw new MarketError('BAD_PAYMENT', '테스트 결제 정보를 확인해 주세요.');
    if (payment.status === 'cancelled' && order.status === 'cancelled') return order;
    if (payment.status !== 'confirming' || order.status !== 'held') throw new MarketError('BAD_STATE', '테스트 결제 상태를 확인해 주세요.', 409);
    payment.status = 'cancelled'; order.status = 'cancelled'; order.history.push({ at: this.iso(), status: 'cancelled' });
    const listing = this.state.listings.find(item => item.id === order.listingId);
    if (listing?.status === 'reserved') listing.status = 'active';
    this.onChange(); return order;
  }

  /** Only untouched pending authorizations may expire automatically. */
  expirePendingTestPayments() {
    let count = 0;
    for (const order of this.state.orders) {
      const payment = order.testPayment;
      if (!payment || payment.status !== 'pending' || payment.expiresAt > this.now() || order.status !== 'held') continue;
      payment.status = 'expired'; order.status = 'cancelled'; order.history.push({ at: this.iso(), status: 'cancelled' });
      const listing = this.state.listings.find(item => item.id === order.listingId);
      if (listing?.status === 'reserved') listing.status = 'active';
      count++;
    }
    if (count) this.onChange();
    return count;
  }
}

/** 시연 시드: 실제 공연 1건(공식 자료는 서버 카탈로그에서 주입)과 가상 공연 3건, 시연 매물. */
export function seedState(akmu: Show | null, now = '2026-11-03T12:00:00.000Z'): MarketState {
  const shows: Show[] = [
    ...(akmu ? [akmu] : []),
    {
      id: 'demo-radar-live', category: 'concert', title: '[가상] 레이더 라이브 2026', venue: '가상 아레나',
      sessions: [{ id: 'demo-st-sat', label: '11.21 토 19:00', startsAt: '2026-11-21T19:00:00+09:00' }, { id: 'demo-st-sun', label: '11.22 일 17:00', startsAt: '2026-11-22T17:00:00+09:00' }],
      facePrices: [{ seatGrade: 'VIP', price: 154000 }, { seatGrade: 'R', price: 132000 }],
      faceSource: { label: '시연용 합성 자료', url: null, checkedAt: '2026-10-28' },
      policies: [{ kind: 'capture_blocked', title: '모바일 티켓 입장 (가상)', excerpt: '모바일 티켓은 예매자 본인 휴대폰의 예매처 앱에서만 표시되며, 캡처 화면으로는 입장할 수 없습니다. (시연용 합성 규정)', sourceUrl: null }],
      isDemo: true,
    },
    {
      id: 'demo-baseball', category: 'sports', title: '[가상] 레이더스 vs 시티 이글스', venue: '가상 레이더파크',
      sessions: [{ id: 'demo-bb-1', label: '11.08 토 14:00', startsAt: '2026-11-08T14:00:00+09:00' }],
      facePrices: [{ seatGrade: '1루 내야', price: 22000 }, { seatGrade: '테이블석', price: 45000 }],
      faceSource: { label: '시연용 합성 자료', url: null, checkedAt: '2026-10-28' }, policies: [], isDemo: true,
    },
    {
      id: 'demo-musical', category: 'musical', title: '[가상] 뮤지컬 〈나침반〉', venue: '가상 아트홀',
      sessions: [{ id: 'demo-mu-1', label: '12.05 금 19:30', startsAt: '2026-12-05T19:30:00+09:00' }],
      facePrices: [{ seatGrade: 'VIP', price: 99000 }, { seatGrade: 'R', price: 77000 }],
      faceSource: { label: '시연용 합성 자료', url: null, checkedAt: '2026-10-28' }, policies: [], isDemo: true,
    },
  ];
  const L = (id: string, showId: string, sessionId: string, seatGrade: string, quantity: number, price: number, delivery: Delivery, bookingType: BookingType, seller: string, minsAgo: number): Listing => ({
    id, showId, sessionId, seatGrade, quantity, pricePerTicket: price, delivery, bookingType, sellerId: `demo-${seller}`, sellerName: seller,
    createdAt: new Date(Date.parse(now) - minsAgo * 60_000).toISOString(), status: 'active', isDemo: true,
  });
  const listings: Listing[] = [
    ...(akmu ? [
      L('lst-akmu-1', akmu.id, akmu.sessions[0].id, 'VIP', 1, 168000, 'official_transfer', 'general', 'ticketmate', 300),
      L('lst-akmu-2', akmu.id, akmu.sessions[0].id, 'R', 2, 165000, 'official_transfer', 'general', 'concertlover', 200),
      L('lst-akmu-3', akmu.id, akmu.sessions[0].id, 'VIP', 1, 230000, 'qr_capture', 'fanclub_presale', 'ticketfan92', 60),
      L('lst-akmu-4', akmu.id, akmu.sessions[1]?.id ?? akmu.sessions[0].id, '스탠딩', 1, 190000, 'official_transfer', 'unknown', 'akmufan', 30),
    ] : []),
    L('lst-radar-1', 'demo-radar-live', 'demo-st-sat', 'VIP', 1, 230000, 'qr_capture', 'general', 'fastseller', 90),
    L('lst-radar-2', 'demo-radar-live', 'demo-st-sat', 'R', 2, 120000, 'official_transfer', 'general', 'radarfan', 40),
    L('lst-bb-1', 'demo-baseball', 'demo-bb-1', '1루 내야', 2, 20000, 'official_transfer', 'general', 'eagles', 120),
    L('lst-bb-2', 'demo-baseball', 'demo-bb-1', '테이블석', 4, 60000, 'onsite', 'general', 'tablefan', 20),
    L('lst-mu-1', 'demo-musical', 'demo-mu-1', 'VIP', 1, 99000, 'official_transfer', 'general', 'stagefan', 240),
  ];
  return { shows, listings, users: [], notifications: [], orders: [] };
}
