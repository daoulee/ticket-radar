import test from 'node:test';
import assert from 'node:assert/strict';
import { MarketService } from '../src/market.ts';
import { SharedTestPayment } from '../src/shared-test-payment.ts';
import { ApiError } from '../src/errors.ts';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { TestPaymentHandoffs } from '../src/test-payment-handoff.ts';

const isCode = (code: string) => (e: unknown) => e instanceof ApiError && e.code === code;

test('test checkout reserves the server-priced listing and never accepts a live key', async () => {
  const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now);
  const buyer = market.signup({ name: '결제구매자', password: 'Secure-pass1!' }).user;
  let calls = 0; const upstream: typeof fetch = async () => { calls++; return new Response('{}', { status: 500 }); };
  assert.throws(() => new SharedTestPayment(market, 'live_gsk_forbidden', upstream, now));
  const service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, now);
  const order = service.prepare(buyer.id, 'lst-mu-1');
  assert.equal(order.mode, 'test'); assert.equal(order.amount, 99000);
  assert.equal(market.core.getListing('lst-mu-1').listing.status, 'reserved');
  assert.throws(() => service.prepare(buyer.id, 'lst-mu-1'), isCode('LISTING_UNAVAILABLE'));
  await assert.rejects(service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount + 1, 'payment-key'), isCode('BAD_PAYMENT'));
  assert.equal(calls, 0);
  assert.throws(() => market.tx(() => market.core.confirmReceived(buyer.id, order.orderId)), isCode('PAYMENT_PENDING'));
});

test('uncertain confirmation survives restart and retries only the same provider key idempotently', async () => {
  let now = Date.parse('2026-11-03T12:00:00Z'), saved: string | null = null, calls = 0;
  const store = { load: () => saved, save: (value: string) => { saved = value; } };
  let market = new MarketService(null, () => now, store);
  const buyer = market.tx(() => market.signup({ name: '시연구매자', password: 'Secure-pass1!' })).user;
  const upstream: typeof fetch = async (_url, init) => {
    calls++;
    const input = JSON.parse(String(init?.body)) as { orderId: string; paymentKey: string; amount: number };
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), input.orderId);
    if (calls === 1) throw new Error('synthetic timeout');
    return Response.json({ orderId: input.orderId, paymentKey: input.paymentKey, totalAmount: input.amount, status: 'DONE' });
  };
  let service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, () => now);
  const order = service.prepare(buyer.id, 'lst-mu-1');
  await assert.rejects(service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount, 'same-key'), isCode('TEST_PAYMENT_UNCERTAIN'));
  market = new MarketService(null, () => now, store); service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, () => now);
  assert.equal(market.core.getOrder(buyer.id, order.orderId).order.testPayment?.status, 'confirming');
  await assert.rejects(service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount, 'different-key'), isCode('BAD_PAYMENT'));
  now += 11 * 60_000;
  const result = await service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount, 'same-key');
  assert.equal(result.status, 'sent'); assert.equal(result.mode, 'test'); assert.equal(calls, 2);
  await service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount, 'same-key');
  assert.equal(calls, 2, 'approved retry does not call the provider again');
});

test('provider mismatches do not complete the order or release a potentially charged listing', async () => {
  const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now);
  const buyer = market.signup({ name: '검증구매자', password: 'Secure-pass1!' }).user;
  const upstream: typeof fetch = async (_url, init) => {
    const input = JSON.parse(String(init?.body)) as { orderId: string; paymentKey: string; amount: number };
    return Response.json({ orderId: input.orderId, paymentKey: input.paymentKey, totalAmount: input.amount + 1, status: 'DONE' });
  };
  const service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, now);
  const order = service.prepare(buyer.id, 'lst-mu-1');
  await assert.rejects(service.confirm(buyer.id, order.orderId, order.providerOrderId, order.amount, 'payment-key'), isCode('TEST_PAYMENT_UNCERTAIN'));
  assert.equal(market.core.getOrder(buyer.id, order.orderId).order.testPayment?.status, 'confirming');
  assert.equal(market.core.getListing('lst-mu-1').listing.status, 'reserved');
  assert.throws(() => market.tx(() => market.core.cancelOrder(buyer.id, order.orderId)), isCode('PAYMENT_RECONCILIATION_REQUIRED'));
});

test('buyer can cancel an unconfirmed test checkout without losing the listing', () => {
  const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now);
  const buyer = market.signup({ name: '취소구매자', password: 'Secure-pass1!' }).user;
  const service = new SharedTestPayment(market, 'test_gsk_synthetic', fetch, now);
  const order = service.prepare(buyer.id, 'lst-mu-1');
  assert.equal(service.cancelPending(buyer.id, order.orderId).status, 'cancelled');
  assert.equal(service.cancelPending(buyer.id, order.orderId).status, 'cancelled');
  assert.equal(market.core.getListing('lst-mu-1').listing.status, 'active');
});

test('reconciliation checks provider payment identity before resolving an uncertain approval', async () => {
  const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now), buyer = market.signup({ name: '복구구매자', password: 'Secure-pass1!' }).user;
  let mode: 'lost' | 'mismatch' | 'cancelled' = 'lost';
  let providerOrderId = '';
  const upstream: typeof fetch = async (url, init) => {
    if (init?.method === 'POST') throw new Error('synthetic timeout');
    assert.equal(String(url), 'https://api.tosspayments.com/v1/payments/synthetic-key');
    if (mode === 'lost') throw new Error('synthetic unavailable');
    return Response.json({ orderId: providerOrderId, paymentKey: 'synthetic-key', totalAmount: mode === 'mismatch' ? 1 : 99000, status: 'CANCELED' });
  };
  const service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, now), order = service.prepare(buyer.id, 'lst-mu-1');
  providerOrderId = order.providerOrderId;
  await assert.rejects(service.confirm(buyer.id, order.orderId, providerOrderId, order.amount, 'synthetic-key'), isCode('TEST_PAYMENT_UNCERTAIN'));
  await assert.rejects(service.reconcile(buyer.id, order.orderId), isCode('TEST_PAYMENT_UNCERTAIN'));
  mode = 'mismatch'; await assert.rejects(service.reconcile(buyer.id, order.orderId), isCode('TEST_PAYMENT_UNCERTAIN'));
  assert.equal(market.core.getListing('lst-mu-1').listing.status, 'reserved');
  mode = 'cancelled'; const result = await service.reconcile(buyer.id, order.orderId);
  assert.equal(result.paymentStatus, 'cancelled'); assert.equal(result.status, 'cancelled');
  assert.equal(market.core.getListing('lst-mu-1').listing.status, 'active');
});

test('reconciliation can recover an approval response lost after provider success', async () => {
  const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now), buyer = market.signup({ name: '완료복구', password: 'Secure-pass1!' }).user;
  let providerOrderId = '';
  const upstream: typeof fetch = async (_url, init) => {
    if (init?.method === 'POST') throw new Error('synthetic timeout');
    return Response.json({ orderId: providerOrderId, paymentKey: 'synthetic-key', totalAmount: 99000, status: 'DONE' });
  };
  const service = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, now), order = service.prepare(buyer.id, 'lst-mu-1');
  providerOrderId = order.providerOrderId;
  await assert.rejects(service.confirm(buyer.id, order.orderId, providerOrderId, order.amount, 'synthetic-key'), isCode('TEST_PAYMENT_UNCERTAIN'));
  const result = await service.reconcile(buyer.id, order.orderId);
  assert.equal(result.paymentStatus, 'approved'); assert.equal(result.status, 'sent');
});

test('HTTP test payment requires a session and server price before provider approval', async () => {
  const market = new MarketService();
  const buyer = market.tx(() => market.signup({ name: '가상결제회원', password: 'Secure-pass1!' }));
  const upstream: typeof fetch = async (_url, init) => {
    const v = JSON.parse(String(init?.body)) as { orderId: string; paymentKey: string; amount: number };
    return Response.json({ orderId: v.orderId, paymentKey: v.paymentKey, totalAmount: v.amount, status: 'DONE' });
  };
  const payment = new SharedTestPayment(market, 'test_gsk_synthetic', upstream, Date.now, 'test_gck_synthetic');
  let handoffState: string | null = null;
  const handoffs = new TestPaymentHandoffs(market, { load: () => handoffState, save: value => { handoffState = value; } });
  const server = createApi(new CheckService(), undefined, undefined, undefined, market, undefined, undefined, undefined, undefined, undefined, undefined, payment, handoffs);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, data: unknown, token?: string) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(data) });
  try {
    assert.equal((await post('/orders', { listingId: 'lst-mu-1' }, buyer.token)).status, 409, 'legacy endpoint cannot bypass enabled test payment');
    assert.equal((await post('/test-payments/prepare', { listingId: 'lst-mu-1' })).status, 401);
    assert.equal((await post('/test-payments/prepare', { listingId: 'lst-mu-1', amount: 1 }, buyer.token)).status, 400);
    const response = await post('/test-payments/prepare', { listingId: 'lst-mu-1' }, buyer.token);
    assert.equal(response.status, 201);
    const order = await response.json() as { orderId: string; providerOrderId: string; amount: number; mode: string };
    assert.equal(order.amount, 99000); assert.equal(order.mode, 'test');
    assert.equal((await post('/test-payments/confirm', { orderId: order.orderId, providerOrderId: order.providerOrderId, amount: 1, paymentKey: 'test-key' }, buyer.token)).status, 400);
    const issued = await (await post('/test-payments/handoff', { orderId: order.orderId }, buyer.token)).json() as { code: string };
    const exchanged = await post('/test-payments/mobile-exchange', { code: issued.code }); assert.equal(exchanged.status, 200);
    const scoped = await exchanged.json() as { token: string; orderId: string };
    assert.equal((await post('/test-payments/mobile-exchange', { code: issued.code })).status, 401, 'handoff cannot be replayed');
    assert.equal((await fetch(base + '/me', { headers: { Authorization: `Bearer ${scoped.token}` } })).status, 401, 'payment scope is not an account session');
    const approved = await post('/test-payments/mobile-confirm', { providerOrderId: order.providerOrderId, amount: order.amount, paymentKey: 'test-key' }, scoped.token);
    assert.equal(approved.status, 200);
    assert.equal((await approved.json() as { status: string }).status, 'sent');
    const next = await (await post('/test-payments/prepare', { listingId: 'lst-radar-2' }, buyer.token)).json() as { orderId: string };
    const nextCode = await (await post('/test-payments/handoff', { orderId: next.orderId }, buyer.token)).json() as { code: string };
    const nextScope = await (await post('/test-payments/mobile-exchange', { code: nextCode.code })).json() as { token: string };
    assert.equal((await post('/test-payments/mobile-cancel', { unexpected: true }, nextScope.token)).status, 400);
    assert.equal((await post('/test-payments/mobile-confirm', { orderId: order.orderId, providerOrderId: order.providerOrderId, amount: order.amount, paymentKey: 'test-key' }, nextScope.token)).status, 400, 'scoped session cannot select a different order');
    assert.equal((await post('/test-payments/mobile-cancel', {}, nextScope.token)).status, 200);
    assert.equal(market.core.getListing('lst-radar-2').listing.status, 'active');
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
