import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.ts';
import { MarketService } from './market.ts';

/** Test-only provider bridge. It never accepts a live key or a client-supplied amount at preparation. */
export class SharedTestPayment {
  private readonly market: MarketService;
  private readonly secret: string;
  private readonly upstream: typeof fetch;
  private readonly now: () => number;
  private readonly clientKey: string;
  constructor(market: MarketService, secret: string, upstream: typeof fetch = fetch, now: () => number = Date.now, clientKey = '') {
    if (!secret.startsWith('test_gsk_')) throw new Error('테스트 전용 결제 키가 필요합니다.');
    this.market = market; this.secret = secret; this.upstream = upstream; this.now = now; this.clientKey = clientKey;
  }
  config() {
    if (!this.clientKey.startsWith('test_gck_')) throw new ApiError('TEST_PAYMENT_NOT_CONFIGURED', '테스트 결제 설정을 확인할 수 없어요.', 503);
    return { mode: 'test' as const, clientKey: this.clientKey };
  }
  prepare(userId: string, listingId: string) {
    if (typeof listingId !== 'string' || !listingId || listingId.length > 100) throw new ApiError('BAD_PAYMENT', '매물을 확인해 주세요.');
    const providerOrderId = `trtest_${randomUUID().replaceAll('-', '')}`;
    const order = this.market.tx(() => {
      this.market.core.expirePendingTestPayments();
      return this.market.core.createOrder(userId, listingId, { orderId: providerOrderId, expiresAt: this.now() + 10 * 60_000 });
    });
    return { orderId: order.id, providerOrderId, amount: order.amount, mode: 'test' as const };
  }
  cancelPending(userId: string, orderId: string) {
    if (typeof orderId !== 'string' || !orderId || orderId.length > 100) throw new ApiError('BAD_PAYMENT', '주문을 확인해 주세요.');
    return this.market.tx(() => {
      const detail = this.market.core.getOrder(userId, orderId);
      if (detail.role !== 'buyer' || !detail.order.testPayment) throw new ApiError('FORBIDDEN', '구매자의 테스트 결제만 취소할 수 있어요.', 403);
      if (detail.order.testPayment.status === 'cancelled') return { orderId, status: 'cancelled' as const, mode: 'test' as const };
      const cancelled = this.market.core.cancelOrder(userId, orderId);
      return { orderId: cancelled.id, status: cancelled.status, mode: 'test' as const };
    });
  }
  async confirm(userId: string, orderId: string, providerOrderId: string, amount: number, paymentKey: string) {
    if (typeof orderId !== 'string' || orderId.length > 100 || typeof providerOrderId !== 'string' || !Number.isSafeInteger(amount) || typeof paymentKey !== 'string' || paymentKey.length > 200) throw new ApiError('BAD_PAYMENT', '테스트 결제 정보를 확인해 주세요.');
    const order = this.market.tx(() => this.market.core.beginTestPaymentConfirmation(userId, orderId, providerOrderId, amount, paymentKey));
    if (order.testPayment?.status === 'approved') return { orderId: order.id, status: order.status, mode: 'test' as const };
    let response: Response;
    try {
      response = await this.upstream('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${this.secret}:`).toString('base64')}`, 'Content-Type': 'application/json', 'Idempotency-Key': providerOrderId },
        body: JSON.stringify({ orderId: providerOrderId, paymentKey, amount }), signal: AbortSignal.timeout(15_000), redirect: 'manual',
      });
    } catch { throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 결과를 확인하지 못했어요. 같은 결제를 다시 확인해 주세요.', 503, true); }
    let result: unknown;
    try { result = await response.json(); } catch { throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 결과를 확인하지 못했어요. 같은 결제를 다시 확인해 주세요.', 503, true); }
    const value = result && typeof result === 'object' && !Array.isArray(result) ? result as Record<string, unknown> : {};
    if (!response.ok || value.orderId !== providerOrderId || value.paymentKey !== paymentKey || value.totalAmount !== amount || value.status !== 'DONE') throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 결과를 확인하지 못했어요. 같은 결제를 다시 확인해 주세요.', 503, true);
    const confirmed = this.market.tx(() => this.market.core.completeTestPaymentConfirmation(userId, orderId, providerOrderId, amount, paymentKey));
    return { orderId: confirmed.id, status: confirmed.status, mode: 'test' as const };
  }
  /** Reconcile an uncertain approval by paymentKey; never infer success from a failed lookup. */
  async reconcile(userId: string, orderId: string) {
    if (typeof orderId !== 'string' || !orderId || orderId.length > 100) throw new ApiError('BAD_PAYMENT', '주문을 확인해 주세요.');
    const detail = this.market.tx(() => this.market.core.getOrder(userId, orderId));
    const order = detail.order, payment = order.testPayment;
    if (detail.role !== 'buyer' || !payment) throw new ApiError('FORBIDDEN', '구매자의 테스트 결제만 확인할 수 있어요.', 403);
    if (payment.status === 'approved') return { orderId, paymentStatus: 'approved' as const, status: order.status, mode: 'test' as const };
    if (payment.status === 'cancelled' || payment.status === 'expired') return { orderId, paymentStatus: 'cancelled' as const, status: order.status, mode: 'test' as const };
    if (payment.status === 'pending') return { orderId, paymentStatus: 'pending' as const, status: order.status, mode: 'test' as const };
    if (payment.status !== 'confirming' || !payment.paymentKey) throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 상태를 확인하지 못했어요.', 503, true);
    let response: Response;
    try {
      response = await this.upstream(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(payment.paymentKey)}`, {
        method: 'GET', headers: { Authorization: `Basic ${Buffer.from(`${this.secret}:`).toString('base64')}` }, signal: AbortSignal.timeout(15_000), redirect: 'manual',
      });
    } catch { throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 상태를 확인하지 못했어요.', 503, true); }
    let raw: unknown;
    try { raw = await response.json(); } catch { throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 상태를 확인하지 못했어요.', 503, true); }
    const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
    if (!response.ok || value.orderId !== payment.orderId || value.paymentKey !== payment.paymentKey || value.totalAmount !== order.amount) throw new ApiError('TEST_PAYMENT_UNCERTAIN', '테스트 결제 상태를 확인하지 못했어요.', 503, true);
    if (value.status === 'DONE') {
      const confirmed = this.market.tx(() => this.market.core.completeTestPaymentConfirmation(userId, orderId, payment.orderId, order.amount, payment.paymentKey!));
      return { orderId, paymentStatus: 'approved' as const, status: confirmed.status, mode: 'test' as const };
    }
    if (value.status === 'ABORTED' || value.status === 'EXPIRED' || value.status === 'CANCELED') {
      const cancelled = this.market.tx(() => this.market.core.resolveTestPaymentCancellation(userId, orderId, payment.orderId, order.amount, payment.paymentKey!));
      return { orderId, paymentStatus: 'cancelled' as const, status: cancelled.status, mode: 'test' as const };
    }
    return { orderId, paymentStatus: 'checking' as const, status: order.status, mode: 'test' as const };
  }
}
