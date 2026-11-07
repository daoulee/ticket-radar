import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { IncomingMessage } from 'node:http';
import { catalog } from './catalog.ts';
import { ApiError } from './errors.ts';
import { normalizeEmail } from './email-identity.ts';
import { isValidNewPassword, PASSWORD_RULE_MESSAGE } from '../../shared/password-policy.ts';
import { MarketCore, MarketError, seedState, type Category, type MarketState, type Show } from './market-core.ts';
import type { KopisDetail } from './kopis-cards.ts';

// 중개 구매 플랫폼(시연) 서버 계층: 계정(비밀번호는 scrypt 해시로만 저장)·세션·파일 저장·HTTP 라우트.
// 규칙은 market-core.ts 에 있다. 결제는 시연이며 실제 돈이 오가지 않는다.

interface Credential { salt: string; hash: string; email?: string }
interface Persisted { version: 1; state: MarketState; credentials: Record<string, Credential> }

/** 서버 카탈로그(공식 공지 스냅샷)의 AKMU 공연을 플랫폼 공연으로 바꾼다. 공식 규정은 원문 그대로. */
export function catalogShow(): Show | null {
  const e = catalog[0];
  if (!e) return null;
  const kst = (iso: string) => {
    const d = new Date(new Date(iso).getTime() + 9 * 3600_000);
    const day = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()];
    return `${d.getUTCMonth() + 1}.${d.getUTCDate()} ${day} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };
  return {
    id: e.event.id, category: 'concert', title: e.event.title, venue: e.event.venue ?? '대구',
    sessions: e.event.showtimes.map((s) => ({ id: s.id, label: kst(s.startsAt), startsAt: s.startsAt })),
    facePrices: [...new Map(e.context.priceTiers.map((t) => [t.seatGrade, { seatGrade: t.seatGrade, price: t.facePrice }])).values()],
    faceSource: { label: '공식 공지 스냅샷', url: e.event.officialUrl, checkedAt: e.event.sourceCheckedAt ?? e.context.priceTiers[0]?.verifiedAt ?? '' },
    policies: e.context.policies.filter((p) => p.scope === 'fanclub_presale' && p.type === 'identity_check')
      .slice(0, 1).map((p) => ({ kind: 'presale_identity' as const, title: p.title, excerpt: p.excerpt, sourceUrl: p.sourceUrl })),
    isDemo: false,
  };
}

export class MarketService {
  readonly core: MarketCore;
  private readonly credentials: Record<string, Credential>;
  private readonly sessions = new Map<string, { userId: string; expiresAt: number }>();
  private readonly file: string | null;
  private readonly now: () => number;

  constructor(file: string | null = null, now: () => number = Date.now) {
    this.file = file; this.now = now;
    let saved: Persisted | null = null;
    if (file) {
      try { saved = JSON.parse(readFileSync(file, 'utf8')) as Persisted; }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw new ApiError('MARKET_STORE_ERROR', '거래 저장소를 읽지 못했어요.', 500); }
    }
    this.credentials = saved?.credentials ?? {};
    this.core = new MarketCore(saved?.state ?? seedState(catalogShow(), new Date(now()).toISOString()), { now, onChange: () => this.persist() });
  }

  /** User-requested, idempotent demo. No real session, seat number or inventory is asserted. */
  prepareKopisDemo(detail: KopisDetail) {
    const checkedAt = Date.parse(detail.fetchedAt), age = this.now() - checkedAt;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(this.now()));
    if (detail.id !== 'PF305681' || detail.title !== '마흔에 서 [대학로]' || detail.source !== 'KOPIS' || detail.facilityId !== 'FC000453' || detail.stageId !== 'FC000453-03' || detail.stageCapacity !== 120 || detail.startsOn !== '2026-11-25' || detail.endsOn !== '2026-11-29' || detail.endsOn < today || detail.priceGuide !== '전석 40,000원' || detail.priceCandidate?.seatGrade !== '전석' || detail.priceCandidate.price !== 40000 || detail.priceCandidate.sourceQuote !== detail.priceGuide || detail.schedule !== '수요일 ~ 금요일(19:30), 토요일 ~ 일요일(15:00)' || !Number.isFinite(checkedAt) || age < -60_000 || age > 120_000) {
      throw new ApiError('DEMO_DATA_UNVERIFIED', '공연의 시연 기준 정보를 확인하지 못했어요.', 409, true);
    }
    const current = this.core.state.shows.find(show => show.id === detail.id);
    if (current && current.faceSource?.label !== 'KOPIS 안내 기반 시연 기준가') throw new ApiError('DEMO_SHOW_CONFLICT', '기존 공연 데이터와 충돌해 시연을 준비할 수 없어요.', 409);
    if (current && this.core.state.listings.some(item => item.showId === detail.id && item.status !== 'sold')) return this.core.getShow(detail.id);
    if (this.core.state.listings.length >= 5000) throw new ApiError('LISTING_LIMIT', '지금은 시연 매물을 준비할 수 없어요.', 503, true);
    const sessionId = `demo-${detail.id}-session`;
    const show: Show = {
      id: detail.id, category: 'musical', title: detail.title, posterUrl: detail.posterUrl, venue: detail.venue ?? '공연장 확인 필요',
      sessions: [{ id: sessionId, label: '시연 회차 · 실제 일정 미확인', startsAt: null }],
      facePrices: [{ seatGrade: '전석', price: detail.priceCandidate.price }],
      faceSource: { label: 'KOPIS 안내 기반 시연 기준가', url: `https://kopis.or.kr/por/db/pblprfr/pblprfr.do?menuId=MNU_00020&mt20Id=${detail.id}`, checkedAt: detail.fetchedAt }, policies: [], isDemo: true,
    };
    if (!current) this.core.state.shows.push(show);
    const suffix = this.core.state.listings.filter(item => item.showId === detail.id).length + 1;
    this.core.state.listings.push({ id: `demo-${detail.id}-listing-${suffix}`, showId: show.id, sessionId, seatGrade: '전석', quantity: 1, pricePerTicket: detail.priceCandidate.price, delivery: 'onsite', bookingType: 'unknown', sellerId: 'demo-kopis', sellerName: '시연 판매자', createdAt: new Date(this.now()).toISOString(), status: 'active', isDemo: true });
    this.persist();
    return this.core.getShow(detail.id);
  }

  private persist() {
    if (!this.file) return;
    try {
      mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 });
      const tmp = `${this.file}.${process.pid}.tmp`;
      const data: Persisted = { version: 1, state: this.core.state, credentials: this.credentials };
      (this.writeFile ?? writeFileSync)(tmp, JSON.stringify(data), { mode: 0o600 });
      renameSync(tmp, this.file);
    } catch {
      throw new ApiError('MARKET_STORE_ERROR', '저장하지 못했어요. 잠시 후 다시 시도해 주세요.', 503, true);
    }
  }

  /** 테스트용: 파일 쓰기 대체(디스크 가득 참 흉내). */
  writeFile: typeof writeFileSync | null = null;

  /**
   * 변경 묶음 실행(TODO 검토 ⑨): 저장에 실패하면 메모리 상태를 변경 전으로 되돌린다.
   * 모든 변경은 동기 실행이라 다른 요청과 섞이지 않는다. MarketError 는 기존 오류 형식으로 바꾼다.
   */
  tx<T>(fn: () => T): T {
    const snap = JSON.stringify({ s: this.core.state, c: this.credentials });
    try {
      return wrap(fn);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'MARKET_STORE_ERROR') {
        const r = JSON.parse(snap) as { s: MarketState; c: Record<string, Credential> };
        Object.assign(this.core.state, r.s);
        for (const k of Object.keys(this.credentials)) delete this.credentials[k];
        Object.assign(this.credentials, r.c);
      }
      throw e;
    }
  }

  private issue(userId: string) {
    for (const [t, s] of this.sessions) if (s.expiresAt <= this.now()) this.sessions.delete(t);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = this.now() + 7 * 24 * 3600_000;
    this.sessions.set(token, { userId, expiresAt });
    const u = this.core.state.users.find((x) => x.id === userId)!;
    return { token, expiresAt: new Date(expiresAt).toISOString(), user: { id: u.id, name: u.name, alertsOn: u.alertsOn } };
  }

  private static parseCredentials(raw: unknown) {
    const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const name = typeof b.name === 'string' ? b.name.trim() : '';
    const password = typeof b.password === 'string' ? b.password : '';
    return { name, password };
  }

  checkAvailability(kind: unknown, value: unknown) {
    if (kind === 'email') {
      const email = normalizeEmail(value);
      if (!email) throw new ApiError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
      return { available: !Object.values(this.credentials).some((credential) => credential.email === email) };
    }
    if (kind === 'name') {
      const name = typeof value === 'string' ? value.trim() : '';
      if (!/^[\p{L}\p{N}_.-]{2,20}$/u.test(name)) throw new ApiError('BAD_REQUEST', '닉네임은 2~20자(한글·영문·숫자)로 정해 주세요.');
      return { available: !this.core.state.users.some((user) => user.name.toLowerCase() === name.toLowerCase()) };
    }
    throw new ApiError('BAD_REQUEST', '확인할 항목을 선택해 주세요.');
  }

  validateSignup(raw: unknown) {
    const { name, password } = MarketService.parseCredentials(raw);
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const hasEmail = Object.hasOwn(body, 'email');
    const email = hasEmail ? normalizeEmail(body.email) : null;
    if (hasEmail && !email) throw new ApiError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
    if (email && Object.values(this.credentials).some((credential) => credential.email === email)) throw new ApiError('EMAIL_TAKEN', '이미 사용 중인 이메일이에요.', 409);
    if (!/^[\p{L}\p{N}_.-]{2,20}$/u.test(name)) throw new ApiError('BAD_REQUEST', '닉네임은 2~20자(한글·영문·숫자)로 정해 주세요.');
    if (!isValidNewPassword(password)) throw new ApiError('BAD_REQUEST', PASSWORD_RULE_MESSAGE);
    if (this.core.state.users.some((u) => u.name.toLowerCase() === name.toLowerCase())) throw new ApiError('NAME_TAKEN', '이미 쓰는 닉네임이에요.', 409);
    return { name, password, email };
  }

  signup(raw: unknown) {
    const { name, password, email } = this.validateSignup(raw);
    const id = `usr-${randomBytes(8).toString('hex')}`;
    const salt = randomBytes(16).toString('hex');
    this.credentials[id] = { salt, hash: scryptSync(password, salt, 32).toString('hex'), ...(email ? { email } : {}) };
    this.core.state.users.push({ id, name, alertsOn: true, favorites: [] });
    this.persist();
    return this.issue(id);
  }

  login(raw: unknown) {
    const { name, password } = MarketService.parseCredentials(raw);
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const hasEmail = Object.hasOwn(body, 'email');
    const email = hasEmail ? normalizeEmail(body.email) : null;
    const emailId = email ? Object.keys(this.credentials).find((id) => this.credentials[id].email === email) : undefined;
    const u = hasEmail ? this.core.state.users.find((x) => x.id === emailId) : this.core.state.users.find((x) => x.name.toLowerCase() === name.toLowerCase());
    const cred = u ? this.credentials[u.id] : undefined;
    // 계정이 없어도 같은 계산을 해서 응답 시간으로 존재 여부가 드러나지 않게 한다.
    const salt = cred?.salt ?? '00000000000000000000000000000000';
    const given = scryptSync(password.slice(0, 200), salt, 32);
    const ok = !!cred && timingSafeEqual(given, Buffer.from(cred.hash, 'hex'));
    if (!u || !ok) throw new ApiError('INVALID_CREDENTIALS', hasEmail ? '이메일 또는 비밀번호가 맞지 않아요.' : '닉네임 또는 비밀번호가 맞지 않아요.', 401);
    return this.issue(u.id);
  }

  tokenOf(req: IncomingMessage) { const h = req.headers.authorization ?? ''; return h.startsWith('Bearer ') ? h.slice(7).trim() : ''; }
  userOf(req: IncomingMessage, required = true): string | undefined {
    const token = this.tokenOf(req);
    const s = token ? this.sessions.get(token) : undefined;
    if (s && s.expiresAt > this.now() && this.core.state.users.some((u) => u.id === s.userId)) return s.userId;
    if (token) this.sessions.delete(token);
    if (required) throw new ApiError('UNAUTHORIZED', '로그인이 필요해요.', 401);
    return undefined;
  }
  logout(req: IncomingMessage) { this.sessions.delete(this.tokenOf(req)); }
  me(userId: string) {
    const u = this.core.state.users.find((x) => x.id === userId)!;
    return { id: u.id, name: u.name, alertsOn: u.alertsOn, unread: this.core.notifications(userId).filter((n) => !n.read).length };
  }
}

/** MarketError → ApiError 로 바꿔 기존 오류 형식({code,message,retryable})을 유지한다. */
export function wrap<T>(fn: () => T): T {
  try { return fn(); } catch (e) {
    if (e instanceof MarketError) throw new ApiError(e.code, e.message, e.status);
    throw e;
  }
}

const CATEGORIES = new Set<Category>(['concert', 'musical', 'sports']);
const toInt = (v: unknown) => (typeof v === 'number' ? v : Number.NaN);
// 잘못된 % 인코딩은 500이 아니라 400(검토 지적 7).
const dec = (v: string) => { try { return decodeURIComponent(v); } catch { throw new ApiError('BAD_REQUEST', '주소 형식이 올바르지 않아요.'); } };

/** 라우트 처리. 처리했으면 응답 본문을, 경로가 아니면 undefined 를 돌려준다. */
export async function handleMarket(
  market: MarketService, req: IncomingMessage, url: URL, readJson: () => Promise<unknown>,
): Promise<{ status: number; body: unknown } | undefined> {
  const m = req.method ?? 'GET';
  const p = url.pathname;
  const ok = (body: unknown, status = 200) => ({ status, body });
  if (m === 'POST' && p === '/auth/signup') { const b = await readJson(); return ok(market.tx(() => market.signup(b)), 201); }
  if (m === 'POST' && p === '/auth/login') return ok(market.login(await readJson()));
  if (m === 'POST' && p === '/auth/logout') { market.logout(req); return ok({ ok: true }); }
  if (m === 'GET' && p === '/me') return ok(market.me(market.userOf(req)!));
  if (m === 'GET' && p === '/shows') {
    const c = url.searchParams.get('category');
    const category = c && CATEGORIES.has(c as Category) ? (c as Category) : null;
    const query = (url.searchParams.get('q') ?? '').slice(0, 100);
    return ok(market.core.listShows({ category, query, userId: market.userOf(req, false) }));
  }
  const show = p.match(/^\/shows\/([^/]{1,100})$/);
  if (m === 'GET' && show) {
    const sort = url.searchParams.get('sort') === 'recent' ? 'recent' : 'price';
    return ok(market.tx(() => market.core.getShow(dec(show[1]), market.userOf(req, false), sort)));
  }
  const listing = p.match(/^\/listings\/([^/]{1,100})$/);
  if (m === 'GET' && listing) return ok(market.tx(() => market.core.getListing(dec(listing[1]))));
  if (m === 'POST' && p === '/listings/preview') {
    const b = (await readJson()) as Record<string, unknown>;
    return ok(market.tx(() => market.core.previewSafety({ showId: String(b?.showId ?? ''), seatGrade: String(b?.seatGrade ?? ''), pricePerTicket: toInt(b?.pricePerTicket), delivery: b?.delivery as never, bookingType: b?.bookingType as never })));
  }
  if (m === 'POST' && p === '/listings') {
    const userId = market.userOf(req)!;
    const b = (await readJson()) as Record<string, unknown>;
    return ok(market.tx(() => market.core.createListing(userId, {
      showId: String(b?.showId ?? ''), sessionId: String(b?.sessionId ?? ''), seatGrade: String(b?.seatGrade ?? ''),
      quantity: toInt(b?.quantity), pricePerTicket: toInt(b?.pricePerTicket), delivery: b?.delivery as never, bookingType: b?.bookingType as never,
    })), 201);
  }
  if (m === 'GET' && p === '/me/favorites') return ok(market.tx(() => market.core.favorites(market.userOf(req)!)));
  const fav = p.match(/^\/me\/favorites\/([^/]{1,100})$/);
  if (fav && (m === 'PUT' || m === 'DELETE')) {
    const userId = market.userOf(req)!;
    return ok(market.tx(() => market.core.setFavorite(userId, dec(fav[1]), m === 'PUT')));
  }
  if (m === 'PUT' && p === '/me/alerts') {
    const userId = market.userOf(req)!;
    const b = (await readJson()) as Record<string, unknown>;
    if (typeof b?.on !== 'boolean') throw new ApiError('BAD_REQUEST', 'on(true/false)이 필요해요.');
    return ok(market.tx(() => market.core.setAlerts(userId, b.on as boolean)));
  }
  if (m === 'GET' && p === '/me/notifications') return ok(market.tx(() => market.core.notifications(market.userOf(req)!)));
  if (m === 'POST' && p === '/me/notifications/read') { const u = market.userOf(req)!; market.tx(() => market.core.markRead(u)); return ok({ ok: true }); }
  if (m === 'GET' && p === '/me/orders') return ok(market.tx(() => market.core.orders(market.userOf(req)!)));
  if (m === 'POST' && p === '/orders') {
    const userId = market.userOf(req)!;
    const b = (await readJson()) as Record<string, unknown>;
    return ok(market.tx(() => market.core.createOrder(userId, String(b?.listingId ?? ''))), 201);
  }
  const order = p.match(/^\/orders\/([^/]{1,100})(?:\/(sent|confirm|cancel))?$/);
  if (order) {
    const userId = market.userOf(req)!;
    const id = dec(order[1]);
    if (m === 'GET' && !order[2]) return ok(market.tx(() => market.core.getOrder(userId, id)));
    if (m === 'POST' && order[2] === 'sent') return ok(market.tx(() => market.core.markSent(userId, id)));
    if (m === 'POST' && order[2] === 'confirm') return ok(market.tx(() => market.core.confirmReceived(userId, id)));
    if (m === 'POST' && order[2] === 'cancel') return ok(market.tx(() => market.core.cancelOrder(userId, id)));
  }
  return undefined;
}
