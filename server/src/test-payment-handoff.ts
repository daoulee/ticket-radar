import { createHash, randomBytes } from 'node:crypto';
import { ApiError } from './errors.ts';
import { MarketService } from './market.ts';

export interface HandoffPersistence { load(): string | null; save(value: string): void }
type Grant = { userId: string; orderId: string; expiresAt: number };
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const valid = (token: unknown): token is string => typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);

/** One-time handoff and scoped payment sessions; neither grants a general account session. */
export class TestPaymentHandoffs {
  private codes = new Map<string, Grant>();
  private sessions = new Map<string, Grant>();
  private readonly market: MarketService;
  private readonly persistence: HandoffPersistence;
  private readonly now: () => number;
  constructor(market: MarketService, persistence: HandoffPersistence, now: () => number = Date.now) {
    this.market = market; this.persistence = persistence; this.now = now;
    try { const raw = persistence.load(); if (raw !== null) this.restore(raw); }
    catch { throw new ApiError('HANDOFF_STORE_ERROR', '결제 연결 정보를 읽지 못했어요.', 503, true); }
  }
  private snapshot() { return JSON.stringify({ version: 1, codes: [...this.codes], sessions: [...this.sessions] }); }
  private restore(raw: string) {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid handoff store');
    const data = value as { version?: unknown; codes?: unknown; sessions?: unknown };
    if (data.version !== 1 || !Array.isArray(data.codes) || !Array.isArray(data.sessions) || data.codes.length + data.sessions.length > 10_000) throw new Error('Invalid handoff store');
    const parse = (list: unknown[]) => {
      const result = new Map<string, Grant>();
      for (const item of list) {
        if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== 'string' || !/^[a-f0-9]{64}$/.test(item[0]) || result.has(item[0]) || !item[1] || typeof item[1] !== 'object' || typeof item[1].userId !== 'string' || typeof item[1].orderId !== 'string' || !Number.isSafeInteger(item[1].expiresAt)) throw new Error('Invalid handoff grant');
        result.set(item[0], { userId: item[1].userId, orderId: item[1].orderId, expiresAt: item[1].expiresAt });
      }
      return result;
    };
    this.codes = parse(data.codes); this.sessions = parse(data.sessions);
  }
  private commit(previous: string) {
    try { this.persistence.save(this.snapshot()); }
    catch { this.restore(previous); throw new ApiError('HANDOFF_STORE_ERROR', '결제 연결 정보를 저장하지 못했어요.', 503, true); }
  }
  private prune() {
    for (const map of [this.codes, this.sessions]) for (const [key, grant] of map) if (grant.expiresAt <= this.now()) map.delete(key);
  }
  private detail(userId: string, orderId: string) {
    const detail = this.market.tx(() => this.market.core.getOrder(userId, orderId)), payment = detail.order.testPayment;
    if (detail.role !== 'buyer' || !payment || !['pending', 'confirming', 'approved'].includes(payment.status)) throw new ApiError('BAD_PAYMENT', '연결할 테스트 결제를 확인해 주세요.', 409);
    return detail;
  }
  issue(userId: string, orderId: string) {
    const detail = this.detail(userId, orderId);
    if (detail.order.testPayment!.status !== 'pending' || detail.order.testPayment!.expiresAt <= this.now()) throw new ApiError('BAD_STATE', '다시 시작할 수 없는 테스트 결제예요.', 409);
    const previous = this.snapshot(); this.prune();
    if (this.codes.size + this.sessions.size >= 10_000) throw new ApiError('RATE_LIMITED', '결제 연결 요청이 많아요.', 429, true);
    for (const [key, grant] of this.codes) if (grant.userId === userId && grant.orderId === orderId) this.codes.delete(key);
    const code = randomBytes(32).toString('base64url');
    const expiresAt = Math.min(this.now() + 120_000, detail.order.testPayment!.expiresAt);
    this.codes.set(digest(code), { userId, orderId, expiresAt });
    this.commit(previous); return { code, expiresInSeconds: Math.max(1, Math.ceil((expiresAt - this.now()) / 1000)) };
  }
  exchange(code: unknown) {
    if (!valid(code)) throw new ApiError('HANDOFF_INVALID', '결제 연결이 만료됐어요.', 401);
    const grant = this.codes.get(digest(code));
    if (!grant || grant.expiresAt <= this.now()) throw new ApiError('HANDOFF_INVALID', '결제 연결이 만료됐어요.', 401);
    const detail = this.detail(grant.userId, grant.orderId);
    if (detail.order.testPayment!.status !== 'pending' || detail.order.testPayment!.expiresAt <= this.now()) throw new ApiError('HANDOFF_INVALID', '결제 연결이 만료됐어요.', 401);
    const previous = this.snapshot(); this.prune(); this.codes.delete(digest(code));
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(digest(token), { ...grant, expiresAt: this.now() + 15 * 60_000 });
    this.commit(previous);
    return { token, orderId: detail.order.id, providerOrderId: detail.order.testPayment!.orderId, amount: detail.order.amount, mode: 'test' as const };
  }
  authorize(token: unknown) {
    if (!valid(token)) throw new ApiError('UNAUTHORIZED', '결제 연결이 만료됐어요.', 401);
    const grant = this.sessions.get(digest(token));
    if (!grant || grant.expiresAt <= this.now()) throw new ApiError('UNAUTHORIZED', '결제 연결이 만료됐어요.', 401);
    this.detail(grant.userId, grant.orderId);
    return { userId: grant.userId, orderId: grant.orderId };
  }
}
