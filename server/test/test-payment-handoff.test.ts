import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/errors.ts';
import { MarketService } from '../src/market.ts';
import { SharedTestPayment } from '../src/shared-test-payment.ts';
import { TestPaymentHandoffs } from '../src/test-payment-handoff.ts';

const hasCode = (code: string) => (error: unknown) => error instanceof ApiError && error.code === code;

test('one-time handoff persists only digests and grants access to one test payment', () => {
  let now = Date.parse('2026-11-03T12:00:00Z'), stored: string | null = null;
  const market = new MarketService(null, () => now);
  const buyer = market.signup({ name: '가상구매자', password: 'Secure-pass1!' }).user;
  const other = market.signup({ name: '다른회원', password: 'Secure-pass1!' }).user;
  const checkout = new SharedTestPayment(market, 'test_gsk_synthetic', fetch, () => now).prepare(buyer.id, 'lst-mu-1');
  const store = { load: () => stored, save: (value: string) => { stored = value; } };
  let handoff = new TestPaymentHandoffs(market, store, () => now);
  assert.throws(() => handoff.issue(other.id, checkout.orderId), hasCode('ORDER_NOT_FOUND'));
  const { code } = handoff.issue(buyer.id, checkout.orderId);
  assert.ok(!String(stored).includes(code));
  handoff = new TestPaymentHandoffs(market, store, () => now);
  const scoped = handoff.exchange(code);
  assert.equal(scoped.orderId, checkout.orderId); assert.equal(scoped.amount, 99000); assert.equal(scoped.mode, 'test');
  assert.ok(!String(stored).includes(scoped.token));
  assert.throws(() => handoff.exchange(code), hasCode('HANDOFF_INVALID'));
  assert.deepEqual(handoff.authorize(scoped.token), { userId: buyer.id, orderId: checkout.orderId });
  assert.throws(() => market.userOf({ headers: { authorization: `Bearer ${scoped.token}` } } as any), hasCode('UNAUTHORIZED'));
  now += 15 * 60_000;
  assert.throws(() => handoff.authorize(scoped.token), hasCode('UNAUTHORIZED'));
});

test('failed handoff persistence does not consume a code and corrupt storage fails closed', () => {
  let stored: string | null = null, fail = false; const now = () => Date.parse('2026-11-03T12:00:00Z');
  const market = new MarketService(null, now);
  const buyer = market.signup({ name: '연결구매자', password: 'Secure-pass1!' }).user;
  const order = new SharedTestPayment(market, 'test_gsk_synthetic', fetch, now).prepare(buyer.id, 'lst-mu-1');
  const store = { load: () => stored, save: (value: string) => { if (fail) throw new Error('unavailable'); stored = value; } };
  const handoff = new TestPaymentHandoffs(market, store, now), { code } = handoff.issue(buyer.id, order.orderId);
  fail = true; assert.throws(() => handoff.exchange(code), hasCode('HANDOFF_STORE_ERROR'));
  fail = false; assert.equal(handoff.exchange(code).orderId, order.orderId);
  assert.throws(() => new TestPaymentHandoffs(market, { load: () => '{}', save: () => {} }, now), hasCode('HANDOFF_STORE_ERROR'));
});

test('issuing a new handoff invalidates the old code and the replacement expires', () => {
  let now = Date.parse('2026-11-03T12:00:00Z'), stored: string | null = null;
  const market = new MarketService(null, () => now);
  const buyer = market.signup({ name: '만료구매자', password: 'Secure-pass1!' }).user;
  const checkout = new SharedTestPayment(market, 'test_gsk_synthetic', fetch, () => now).prepare(buyer.id, 'lst-mu-1');
  const handoffs = new TestPaymentHandoffs(market, { load: () => stored, save: value => { stored = value; } }, () => now);
  const first = handoffs.issue(buyer.id, checkout.orderId);
  const second = handoffs.issue(buyer.id, checkout.orderId);
  assert.throws(() => handoffs.exchange(first.code), hasCode('HANDOFF_INVALID'));
  now += second.expiresInSeconds * 1000;
  assert.throws(() => handoffs.exchange(second.code), hasCode('HANDOFF_INVALID'));
  assert.equal(market.core.getOrder(buyer.id, checkout.orderId).order.testPayment?.status, 'pending');
});
