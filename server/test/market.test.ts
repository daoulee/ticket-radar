import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { acquireMarketFileLock } from '../src/market-file-lock.ts';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { ApiError } from '../src/errors.ts';
import { catalogShow, MarketService } from '../src/market.ts';
import { computeSafety, MarketCore, MarketError, seedState } from '../src/market-core.ts';
import { EmailVerification } from '../src/email-verification.ts';

const hasCode = (code: string) => (e: unknown) => (e instanceof ApiError || e instanceof MarketError) && (e as any).code === code;
const akmu = catalogShow()!;

test('market: AKMU uses official catalog prices and the registered presale rule verbatim (no invented rules)', () => {
  assert.equal(akmu.isDemo, false);
  assert.deepEqual(akmu.facePrices.find(f => f.seatGrade === 'VIP'), { seatGrade: 'VIP', price: 176000 });
  assert.equal(akmu.policies.length, 1);
  assert.equal(akmu.policies[0].kind, 'presale_identity');
  assert.equal(akmu.policies[0].excerpt, '실관람자가 모두 동일인이어야 합니다.');
  assert.ok(!akmu.policies.some(p => p.kind === 'capture_blocked'));
});

test('safety: price vs same-grade face, unknown grade, presale/capture checks', () => {
  const below = computeSafety(akmu, { seatGrade: 'VIP', pricePerTicket: 168000, delivery: 'official_transfer', bookingType: 'general' });
  assert.equal(below.priceText, '8,000원 저렴해요'); assert.equal(below.priceTone, 'good'); assert.equal(below.attention, 0);
  const high = computeSafety(akmu, { seatGrade: 'VIP', pricePerTicket: 230000, delivery: 'qr_capture', bookingType: 'fanclub_presale' });
  assert.equal(high.priceText, '31% 비싸요'); assert.equal(high.attention, 2);
  assert.ok(high.checks.some(c => c.officialExcerpt === '실관람자가 모두 동일인이어야 합니다.'));
  assert.ok(!high.checks.some(c => c.title.includes('캡처')), 'AKMU has no official capture rule');
  const unknown = computeSafety(akmu, { seatGrade: '가상석', pricePerTicket: 100000, delivery: 'official_transfer', bookingType: 'general' });
  assert.equal(unknown.priceTone, 'unknown'); assert.equal(unknown.diff, null);
  const radar = seedState(null).shows.find(s => s.id === 'demo-radar-live')!;
  assert.ok(computeSafety(radar, { seatGrade: 'VIP', pricePerTicket: 150000, delivery: 'qr_capture', bookingType: 'general' }).checks.some(c => c.title === '캡처로는 입장할 수 없어요'));
});

function core() {
  let t = Date.parse('2026-11-03T12:00:00Z');
  const state = seedState(akmu, '2026-11-03T12:00:00.000Z');
  state.users.push({ id: 'u1', name: '구매자', alertsOn: true, favorites: [] }, { id: 'u2', name: '판매자', alertsOn: true, favorites: [] }, { id: 'u3', name: '알림끔', alertsOn: false, favorites: [] });
  return new MarketCore(state, { now: () => (t += 1000) });
}

test('favorites are per account; new listing count resets when the show is viewed', () => {
  const m = core();
  m.setFavorite('u1', akmu.id, true);
  assert.equal(m.favorites('u1').length, 1); assert.equal(m.favorites('u2').length, 0);
  m.createListing('u2', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 165000, originalPricePerTicket: 165000, delivery: 'official_transfer', bookingType: 'general' });
  assert.equal(m.favorites('u1')[0].newCount, 1);
  m.getShow(akmu.id, 'u1');
  assert.equal(m.favorites('u1')[0].newCount, 0);
  m.setFavorite('u1', akmu.id, false);
  assert.equal(m.favorites('u1').length, 0);
  assert.throws(() => m.setFavorite('u1', 'nope', true), hasCode('SHOW_NOT_FOUND'));
});

test('below-face alerts go only to other users who favorited the show with alerts on', () => {
  const m = core();
  m.setFavorite('u1', akmu.id, true); m.setFavorite('u3', akmu.id, true); m.setFavorite('u2', akmu.id, true);
  assert.throws(() => m.createListing('u2', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 230000, originalPricePerTicket: 230000, delivery: 'official_transfer', bookingType: 'general' }), hasCode('PRICE_ABOVE_FACE'));
  assert.equal(m.notifications('u1').length, 0, 'above face rejected → no alert');
  m.createListing('u2', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 170000, originalPricePerTicket: 170000, delivery: 'official_transfer', bookingType: 'general' });
  assert.equal(m.notifications('u1').length, 1); assert.match(m.notifications('u1')[0].text, /정가 이하/);
  assert.equal(m.notifications('u3').length, 0, 'alerts off'); assert.equal(m.notifications('u2').length, 0, 'own listing');
  m.markRead('u1'); assert.equal(m.notifications('u1')[0].read, true);
});

test('listing registration rejects an unknown price and an amount above face value', () => {
  const m = core();
  const input = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 176000, originalPricePerTicket: 176001, delivery: 'official_transfer' as const, bookingType: 'general' as const };
  assert.throws(() => m.createListing('u2', { ...input, pricePerTicket: 176001 }), hasCode('PRICE_ABOVE_FACE'));
  assert.throws(() => m.createListing('u2', { ...input, seatGrade: '미확인석' }), hasCode('FACE_PRICE_UNVERIFIED'));
  assert.equal(m.createListing('u2', input).listing.pricePerTicket, 176000);
  assert.throws(() => m.createOrder('u1', 'lst-akmu-3'), hasCode('PRICE_ABOVE_FACE'));
  assert.equal(m.getListing('lst-akmu-3').listing.status, 'active');
});

test('demo orders: hold → sent → settled, permissions and listing state', () => {
  const m = core();
  assert.throws(() => m.createListing('u2', { showId: akmu.id, sessionId: 'x', seatGrade: 'VIP', quantity: 1, pricePerTicket: 1, originalPricePerTicket: 1, delivery: 'official_transfer', bookingType: 'general' }), hasCode('BAD_REQUEST'));
  const { listing } = m.createListing('u2', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 150000, delivery: 'official_transfer', bookingType: 'general' });
  assert.throws(() => m.createOrder('u2', listing.id), hasCode('OWN_LISTING'));
  const o = m.createOrder('u1', listing.id);
  assert.equal(o.amount, 150000); assert.equal(o.status, 'held'); assert.equal(o.isDemoPayment, true);
  assert.throws(() => m.createOrder('u3', listing.id), hasCode('LISTING_UNAVAILABLE'));
  assert.throws(() => m.confirmReceived('u1', o.id), hasCode('BAD_STATE'));
  assert.throws(() => m.markSent('u1', o.id), hasCode('FORBIDDEN'));
  m.markSent('u2', o.id); m.confirmReceived('u1', o.id);
  assert.equal(m.getOrder('u1', o.id).order.status, 'settled');
  assert.equal(m.getListing(listing.id).listing.status, 'sold');
  assert.throws(() => m.getOrder('u3', o.id), hasCode('ORDER_NOT_FOUND'));
  const demoOrder = m.createOrder('u1', 'lst-akmu-1');
  assert.equal(demoOrder.status, 'sent', 'demo sellers auto-send');
  const { listing: l2 } = m.createListing('u2', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 150000, delivery: 'official_transfer', bookingType: 'general' });
  const held = m.createOrder('u3', l2.id);
  m.cancelOrder('u3', held.id); assert.equal(m.getListing(l2.id).listing.status, 'active', 'buyer may cancel while held');
});

test('test payment reserves a listing and gates delivery until verified approval', () => {
  let now = Date.parse('2026-11-03T12:00:00Z');
  const state = seedState(akmu, new Date(now).toISOString());
  state.users.push({ id: 'buyer', name: '구매자', alertsOn: true, favorites: [] }, { id: 'seller', name: '판매자', alertsOn: true, favorites: [] }, { id: 'other', name: '다른사람', alertsOn: true, favorites: [] });
  const market = new MarketCore(state, { now: () => now });
  const listing = market.createListing('seller', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 150000, delivery: 'official_transfer', bookingType: 'general' }).listing;
  const payment = { orderId: `trtest_${'a'.repeat(32)}`, expiresAt: now + 60_000 };
  const order = market.createOrder('buyer', listing.id, payment);
  assert.equal(order.status, 'held'); assert.equal(order.testPayment?.status, 'pending');
  assert.throws(() => market.createOrder('other', listing.id, { ...payment, orderId: `trtest_${'b'.repeat(32)}` }), hasCode('LISTING_UNAVAILABLE'));
  assert.throws(() => market.markSent('seller', order.id), hasCode('PAYMENT_PENDING'));
  assert.throws(() => market.beginTestPaymentConfirmation('other', order.id, payment.orderId, order.amount, 'key-a'), hasCode('ORDER_NOT_FOUND'));
  assert.throws(() => market.beginTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount + 1, 'key-a'), hasCode('BAD_PAYMENT'));
  market.beginTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount, 'key-a');
  assert.throws(() => market.beginTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount, 'key-b'), hasCode('BAD_PAYMENT'));
  assert.throws(() => market.cancelOrder('buyer', order.id), hasCode('PAYMENT_RECONCILIATION_REQUIRED'));
  market.beginTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount, 'key-a');
  market.completeTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount, 'key-a');
  market.completeTestPaymentConfirmation('buyer', order.id, payment.orderId, order.amount, 'key-a');
  assert.equal(order.testPayment?.status, 'approved');
  market.markSent('seller', order.id); market.confirmReceived('buyer', order.id);
  assert.equal(order.status, 'settled');
});

test('only pending test payments expire and release their listing; uncertain approvals remain reserved', () => {
  let now = Date.parse('2026-11-03T12:00:00Z');
  const state = seedState(akmu, new Date(now).toISOString());
  state.users.push({ id: 'buyer', name: '구매자', alertsOn: true, favorites: [] });
  const market = new MarketCore(state, { now: () => now });
  const one = market.createOrder('buyer', 'lst-akmu-1', { orderId: `trtest_${'c'.repeat(32)}`, expiresAt: now + 1000 });
  const two = market.createOrder('buyer', 'lst-akmu-2', { orderId: `trtest_${'d'.repeat(32)}`, expiresAt: now + 1000 });
  market.beginTestPaymentConfirmation('buyer', two.id, two.testPayment!.orderId, two.amount, 'key-b');
  now += 1000;
  assert.equal(market.expirePendingTestPayments(), 1);
  assert.equal(one.testPayment?.status, 'expired'); assert.equal(market.getListing(one.listingId).listing.status, 'active');
  assert.equal(two.testPayment?.status, 'confirming'); assert.equal(market.getListing(two.listingId).listing.status, 'reserved');
});

test('accounts: scrypt hash only, duplicate names, wrong password, file store private', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-market-'));
  const file = join(dir, 'var', 'market.json');
  const svc = new MarketService(file);
  const a = svc.signup({ name: '티켓팬', password: 'Pass-1234!' });
  assert.ok(a.token); assert.equal(a.user.alertsOn, true);
  assert.throws(() => svc.signup({ name: '티켓팬', password: 'Pass-5678!' }), hasCode('NAME_TAKEN'));
  assert.throws(() => svc.signup({ name: 'x', password: 'Pass-5678!' }), hasCode('BAD_REQUEST'));
  assert.throws(() => svc.login({ name: '티켓팬', password: 'wrong-pass' }), hasCode('INVALID_CREDENTIALS'));
  assert.throws(() => svc.login({ name: '없는사람', password: 'Pass-1234!' }), hasCode('INVALID_CREDENTIALS'));
  assert.ok(svc.login({ name: '티켓팬', password: 'Pass-1234!' }).token);
  assert.ok(existsSync(file)); assert.equal(statSync(file).mode & 0o777, 0o600);
  assert.ok(!readFileSync(file, 'utf8').includes('Pass-1234!'));
  const again = new MarketService(file);
  assert.ok(again.login({ name: '티켓팬', password: 'Pass-1234!' }).token);
});

test('migration lock prevents a cooperating server from writing and releases safely', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-migration-lock-'));
  const file = join(dir, 'market.json');
  const service = new MarketService(file);
  service.tx(() => service.signup({ name: '기존회원', password: 'Valid-pass1!' }));
  const before = readFileSync(file, 'utf8');
  const release = acquireMarketFileLock(file);
  try {
    assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
    assert.throws(() => service.tx(() => service.signup({ name: '새회원', password: 'Valid-pass1!' })), hasCode('MARKET_STORE_ERROR'));
    assert.equal(readFileSync(file, 'utf8'), before);
    assert.ok(!service.core.state.users.some(user => user.name === '새회원'));
  } finally { release(); }
  assert.ok(!existsSync(`${file}.write-lock`));
  assert.ok(service.tx(() => service.signup({ name: '새회원', password: 'Valid-pass1!' })).token);
});

test('migrated source marker prevents writes and rolls back in-memory state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-migrated-source-'));
  const file = join(dir, 'market.json');
  const service = new MarketService(file);
  service.tx(() => service.signup({ name: '기존회원', password: 'Valid-pass1!' }));
  const before = readFileSync(file, 'utf8');
  writeFileSync(`${file}.migrated`, 'migrated', { mode: 0o600, flag: 'wx' });
  assert.throws(() => service.tx(() => service.signup({ name: '새회원', password: 'Valid-pass1!' })), hasCode('MARKET_STORE_ERROR'));
  assert.equal(readFileSync(file, 'utf8'), before);
  assert.ok(!service.core.state.users.some(user => user.name === '새회원'));
});

test('email accounts persist and legacy nickname accounts remain usable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-email-'));
  const file = join(dir, 'market.json');
  const service = new MarketService(file);
  service.signup({ name: '기존회원', password: 'Legacy-pass!' });
  service.signup({ name: '새회원', email: 'person@EXAMPLE.com', password: 'Email-pass!' });
  assert.throws(() => service.signup({ name: '다른회원', email: 'person@example.com', password: 'Email-pass!' }), hasCode('EMAIL_TAKEN'));
  assert.throws(() => service.signup({ name: '잘못된회원', email: 'invalid', password: 'Email-pass!' }), hasCode('BAD_REQUEST'));
  const reopened = new MarketService(file);
  assert.equal(reopened.login({ name: '기존회원', password: 'Legacy-pass!' }).user.name, '기존회원');
  assert.equal(reopened.login({ email: 'person@example.com', password: 'Email-pass!' }).user.name, '새회원');
  assert.throws(() => reopened.login({ email: 'person@example.com', password: 'incorrect' }), hasCode('INVALID_CREDENTIALS'));
  assert.throws(() => reopened.login({ email: 'invalid', name: '기존회원', password: 'Legacy-pass!' }), hasCode('INVALID_CREDENTIALS'));
});

test('HTTP: signup → favorite → seller lists below face → alert → buy (demo) → settle', async () => {
  let emailCode = '';
  const verification = new EmailVerification(async (_email, code) => { emailCode = code; });
  const server = createApi(new CheckService(), undefined, undefined, undefined, new MarketService(), verification);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const call = async (method: string, path: string, body?: unknown, token?: string) => {
    const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: r.status, body: await r.json() as any };
  };
  try {
    const shows = await call('GET', '/shows');
    assert.ok(shows.body.length >= 4); assert.equal(shows.body[0].favorite, false);
    assert.equal((await call('GET', '/me/favorites')).status, 401);
    // 보안(APP-031): 이메일 없이 가입하면 거절된다(예전에는 인증 없이 통과).
    const noEmail = await call('POST', '/auth/signup', { name: 'bypass01', password: 'Bypass-pass-1!' });
    assert.equal(noEmail.status, 400); assert.equal(noEmail.body.code, 'EMAIL_REQUIRED');
    const verifiedSignup = async (name: string, email: string, password: string) => {
      assert.equal((await call('POST', '/auth/email/send', { email })).status, 200);
      const r = await call('POST', '/auth/signup', { name, email, password, verificationCode: emailCode });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      return r.body.token as string;
    };
    const buyer = await verifiedSignup('buyer01', 'buyer01@example.org', 'Buyer-pass-1!');
    const seller = await verifiedSignup('seller01', 'seller01@example.org', 'Seller-pass-1!');
    assert.equal((await call('POST', '/auth/signup', { name: 'email01', email: 'test@example.org', password: 'Email-pass-1!' })).status, 400);
    assert.equal((await call('POST', '/auth/email/send', { email: 'test@example.org' })).status, 200);
    assert.equal((await call('POST', '/auth/availability', { kind: 'name', value: 'buyer01' })).body.available, false);
    assert.equal((await call('POST', '/auth/availability', { kind: 'email', value: 'test@example.org' })).body.available, true);
    assert.equal((await call('POST', '/auth/signup', { name: 'buyer01', email: 'test@example.org', password: 'Email-pass-1!', verificationCode: emailCode })).status, 409);
    const wrongCode = emailCode === '000000' ? '000001' : '000000';
    assert.equal((await call('POST', '/auth/signup', { name: 'email01', email: 'test@example.org', password: 'Email-pass-1!', verificationCode: wrongCode })).status, 400);
    assert.equal((await call('POST', '/auth/signup', { name: 'email01', email: 'other@example.org', password: 'Email-pass-1!', verificationCode: emailCode })).status, 400);
    const emailSignup = await call('POST', '/auth/signup', { name: 'email01', email: 'test@EXAMPLE.org', password: 'Email-pass-1!', verificationCode: emailCode });
    assert.equal(emailSignup.status, 201);
    assert.equal((await call('POST', '/auth/availability', { kind: 'email', value: 'test@EXAMPLE.org' })).body.available, false);
    assert.equal((await call('POST', '/auth/signup', { name: 'email02', email: 'other@example.org', password: 'Email-pass-1!', verificationCode: emailCode })).status, 400);
    assert.equal((await call('POST', '/auth/signup', { name: 'email02', email: 'test@example.org', password: 'Email-pass-1!', verificationCode: emailCode })).status, 409);
    const emailLogin = await call('POST', '/auth/login', { email: 'test@example.org', password: 'Email-pass-1!' });
    assert.equal(emailLogin.status, 200);
    assert.equal((await call('GET', '/me', undefined, emailLogin.body.token)).body.name, 'email01');
    assert.equal((await call('POST', '/auth/login', { email: 'test@example.org', password: 'wrong-password' })).status, 401);
    await call('PUT', `/me/favorites/${encodeURIComponent(akmu.id)}`, undefined, buyer);
    assert.equal((await call('GET', '/shows?category=concert', undefined, buyer)).body.find((s: any) => s.id === akmu.id).favorite, true);
    const preview = await call('POST', '/listings/preview', { showId: akmu.id, seatGrade: 'VIP', pricePerTicket: 170000, originalPricePerTicket: 170000, delivery: 'official_transfer', bookingType: 'general' });
    assert.equal(preview.body.priceText, '6,000원 저렴해요');
    const denied = await call('POST', '/listings', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 176001, originalPricePerTicket: 176001, delivery: 'official_transfer', bookingType: 'general' }, seller);
    assert.equal(denied.status, 400); assert.equal(denied.body.code, 'PRICE_ABOVE_FACE');
    const unknown = await call('POST', '/listings', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: '미확인석', quantity: 1, pricePerTicket: 170000, originalPricePerTicket: 170000, delivery: 'official_transfer', bookingType: 'general' }, seller);
    assert.equal(unknown.status, 409); assert.equal(unknown.body.code, 'FACE_PRICE_UNVERIFIED');
    const baseListing = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 140000, delivery: 'official_transfer', bookingType: 'general' };
    assert.equal((await call('POST', '/listings', baseListing, seller)).body.code, 'PRICE_ABOVE_PURCHASE');
    assert.equal((await call('POST', '/listings', { ...baseListing, quantity: 2, originalPricePerTicket: 150000 }, seller)).body.code, 'BAD_REQUEST');
    const { originalPricePerTicket: _ignored, ...withoutOriginal } = baseListing;
    assert.equal((await call('POST', '/listings', withoutOriginal, seller)).body.code, 'BAD_REQUEST');
    const created = await call('POST', '/listings', { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'VIP', quantity: 1, pricePerTicket: 170000, originalPricePerTicket: 170000, delivery: 'official_transfer', bookingType: 'general' }, seller);
    assert.equal(created.status, 201);
    assert.equal((await call('GET', '/me', undefined, buyer)).body.unread, 1);
    const order = await call('POST', '/orders', { listingId: created.body.listing.id }, buyer);
    assert.equal(order.status, 201); assert.equal(order.body.status, 'held');
    assert.equal((await call('POST', `/orders/${order.body.id}/sent`, undefined, seller)).body.status, 'sent');
    assert.equal((await call('POST', `/orders/${order.body.id}/confirm`, undefined, buyer)).body.status, 'settled');
    assert.equal((await call('GET', '/me/orders', undefined, seller)).body[0].role, 'seller');
    assert.equal((await call('POST', '/auth/logout', undefined, buyer)).status, 200);
    assert.equal((await call('GET', '/me', undefined, buyer)).status, 401);
  } finally { await new Promise<void>((r, j) => server.close(e => e ? j(e) : r())); }
});

test('the app demo engine is an exact copy of market-core.ts', () => {
  const h = (p: string) => createHash('sha256').update(readFileSync(new URL(p, import.meta.url))).digest('hex');
  const app = new URL('../../mobile/src/market/engine.ts', import.meta.url);
  if (!existsSync(app)) return; // 앱 복사본이 없으면(서버 단독 배포) 건너뛴다
  assert.equal(h('../../mobile/src/market/engine.ts'), h('../src/market-core.ts'));
});

test('review fixes: buyer cannot cancel after sent, delivery key check, listing cap, bad encoding → 400, unspaced account masking', async () => {
  const m = core();
  const sent = m.createOrder('u1', 'lst-akmu-1'); // 시연 판매자 → 바로 sent
  assert.throws(() => m.cancelOrder('u1', sent.id), hasCode('BAD_STATE'));
  assert.equal(m.getListing('lst-akmu-1').listing.status, 'reserved');
  const base = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 150000, bookingType: 'general' as const };
  for (const bad of ['__proto__', 'toString', 'constructor']) assert.throws(() => m.createListing('u2', { ...base, delivery: bad as never }), hasCode('BAD_REQUEST'));
  for (let i = 0; i < 20; i++) m.createListing('u2', { ...base, delivery: 'official_transfer' });
  assert.throws(() => m.createListing('u2', { ...base, delivery: 'official_transfer' }), hasCode('LISTING_LIMIT'));
  const { maskContacts } = await import('../src/reports.ts');
  assert.ok(!maskContacts('신한 56789012345678').includes('5678901'));
  assert.ok(!maskContacts('우리 1002 345 678901').includes('678901'));
  assert.equal(maskContacts('VIP 230,000원 11.21'), 'VIP 230,000원 11.21');
  const server = createApi(new CheckService(), undefined, undefined, undefined, new MarketService());
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try {
    const r = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/shows/%E0`);
    assert.equal(r.status, 400);
  } finally { await new Promise<void>((r, j) => server.close(e => e ? j(e) : r())); }
});

test('TODO ⑥⑨: client IP honours X-Forwarded-For only with TRUST_PROXY; failed saves roll back memory', async () => {
  const { clientIp } = await import('../src/http.ts');
  const req = { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }, socket: { remoteAddress: '127.0.0.1' } } as any;
  assert.equal(clientIp(req, false), '127.0.0.1');
  assert.equal(clientIp(req, true), '203.0.113.7');
  assert.equal(clientIp({ headers: {}, socket: { remoteAddress: '::1' } } as any, true), '::1');

  const dir = mkdtempSync(join(tmpdir(), 'aid-tx-'));
  const svc = new MarketService(join(dir, 'var', 'market.json'));
  const { token, user } = svc.tx(() => svc.signup({ name: 'txuser', password: 'Tx-pass-123!' }));
  assert.ok(token);
  const before = svc.core.state.listings.length;
  svc.writeFile = (() => { throw new Error('ENOSPC'); }) as any;
  assert.throws(() => svc.tx(() => svc.core.createListing(user.id, { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 150000, originalPricePerTicket: 150000, delivery: 'official_transfer', bookingType: 'general' })), hasCode('MARKET_STORE_ERROR'));
  assert.equal(svc.core.state.listings.length, before, 'listing rolled back');
  assert.throws(() => svc.tx(() => svc.signup({ name: 'ghost', password: 'Tx-pass-123!' })), hasCode('MARKET_STORE_ERROR'));
  assert.ok(!svc.core.state.users.some(u => u.name === 'ghost'), 'user rolled back');
  svc.writeFile = null;
  assert.ok(svc.tx(() => svc.signup({ name: 'ghost', password: 'Tx-pass-123!' })).token, 'retry works after disk recovers');

  const { parseReportRequest, ReportService, accountsFromEnv } = await import('../src/reports.ts');
  const rs = new ReportService(accountsFromEnv(`akmu-demo:test-code-aaaa:${akmu.id}`), join(dir, 'var', 'reports.json'));
  rs.writeFile = (() => { throw new Error('ENOSPC'); }) as any;
  const body = { clientRequestId: '11111111-2222-4333-8444-555555555555', eventId: akmu.id, consent: true, listingText: 'AKMU 대구 VIP' };
  assert.throws(() => rs.create(parseReportRequest(body, new Set([akmu.id]))), hasCode('REPORT_STORE_ERROR'));
  rs.writeFile = null;
  assert.equal(rs.create(parseReportRequest(body, new Set([akmu.id]))).duplicate, false, 'failed create is not treated as duplicate');
});

test('APP-031: ALLOW_SIGNUP_WITHOUT_EMAIL=1 is the only way to sign up without email verification', async () => {
  const server = createApi(new CheckService(), undefined, undefined, undefined, new MarketService(), new EmailVerification(null));
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const signup = (name: string) => fetch(`${base}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, password: 'Local-pass-1!' }) });
  const prev = process.env.ALLOW_SIGNUP_WITHOUT_EMAIL;
  try {
    delete process.env.ALLOW_SIGNUP_WITHOUT_EMAIL;
    assert.equal((await signup('local01')).status, 400, 'mail sender missing → no silent bypass');
    process.env.ALLOW_SIGNUP_WITHOUT_EMAIL = '1';
    assert.equal((await signup('local02')).status, 201, 'explicit local opt-out works');
  } finally {
    if (prev === undefined) delete process.env.ALLOW_SIGNUP_WITHOUT_EMAIL; else process.env.ALLOW_SIGNUP_WITHOUT_EMAIL = prev;
    await new Promise<void>((r, j) => server.close(e => e ? j(e) : r()));
  }
});


test('new listings require one ticket and cannot exceed seller stated original price', () => {
  const m = core();
  const base = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 120000, originalPricePerTicket: 150000, delivery: 'onsite' as const, bookingType: 'general' as const };
  assert.throws(() => m.createListing('u2', { ...base, quantity: 2 }), hasCode('BAD_REQUEST'));
  assert.throws(() => m.createListing('u2', { ...base, originalPricePerTicket: 119999 }), hasCode('PRICE_ABOVE_PURCHASE'));
  assert.throws(() => m.createListing('u2', { ...base, originalPricePerTicket: NaN }), hasCode('BAD_REQUEST'));
  assert.equal(m.createListing('u2', base).listing.originalPricePerTicket, 150000);
});

test('file store survives restart with new policy and preserves legacy listing data', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-shared-persist-'));
  const file = join(dir, 'market.json');
  const first = new MarketService(file);
  const seller = first.signup({ name: '격리판매자', password: 'Seller-pass-1!' }).user;
  const buyer = first.signup({ name: '격리구매자', password: 'Buyer-pass-1!' }).user;
  const legacyId = 'lst-akmu-1';
  const legacyBefore = structuredClone(first.core.getListing(legacyId).listing);
  const input = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 120000, originalPricePerTicket: 150000, delivery: 'onsite' as const, bookingType: 'general' as const };
  const { listing } = first.tx(() => first.core.createListing(seller.id, input));
  const order = first.tx(() => first.core.createOrder(buyer.id, listing.id));
  const reopened = new MarketService(file);
  assert.ok(reopened.login({ name: '격리판매자', password: 'Seller-pass-1!' }).token);
  assert.deepEqual(reopened.core.getListing(legacyId).listing, legacyBefore);
  assert.equal(reopened.core.getOrder(buyer.id, order.id).order.status, 'held');
  assert.equal(reopened.core.getListing(listing.id).listing.originalPricePerTicket, 150000);
  assert.throws(() => reopened.core.createListing(seller.id, { ...input, pricePerTicket: 150001 }), hasCode('PRICE_ABOVE_PURCHASE'));
});

test('injected atomic storage preserves accounts and orders and rolls back failed saves', () => {
  let saved: string | null = null;
  let fail = false;
  const store = { load: () => saved, save: (value: string) => { if (fail) throw new Error('storage unavailable'); saved = value; } };
  const first = new MarketService(null, Date.now, store);
  const seller = first.tx(() => first.signup({ name: '저장판매자', password: 'Seller-pass-1!' })).user;
  const buyer = first.tx(() => first.signup({ name: '저장구매자', password: 'Buyer-pass-1!' })).user;
  const input = { showId: akmu.id, sessionId: akmu.sessions[0].id, seatGrade: 'R', quantity: 1, pricePerTicket: 120000, originalPricePerTicket: 150000, delivery: 'onsite' as const, bookingType: 'general' as const };
  const { listing } = first.tx(() => first.core.createListing(seller.id, input));
  const order = first.tx(() => first.core.createOrder(buyer.id, listing.id));
  const restored = new MarketService(null, Date.now, store);
  assert.equal(restored.login({ name: '저장구매자', password: 'Buyer-pass-1!' }).user.id, buyer.id);
  assert.equal(restored.core.getOrder(buyer.id, order.id).order.status, 'held');
  fail = true;
  assert.throws(() => restored.tx(() => restored.core.markSent(seller.id, order.id)), hasCode('MARKET_STORE_ERROR'));
  assert.equal(restored.core.getOrder(buyer.id, order.id).order.status, 'held');
  fail = false;
  assert.equal(new MarketService(null, Date.now, store).core.getOrder(buyer.id, order.id).order.status, 'held');
  assert.throws(() => new MarketService('/tmp/file', Date.now, store));
});

test('invalid external storage data fails closed without replacing existing data', () => {
  for (const raw of ['{', '{}', '{"version":2,"state":{},"credentials":{}}', '{"version":1,"state":{},"credentials":{}}']) {
    let writes = 0;
    const store = { load: () => raw, save: () => { writes++; } };
    assert.throws(() => new MarketService(null, Date.now, store), hasCode('MARKET_STORE_ERROR'));
    assert.equal(writes, 0);
  }
});

test('external storage preserves hashed sessions across restart and revokes logout', () => {
  let saved: string | null = null;
  const store = { load: () => saved, save: (value: string) => { saved = value; } };
  const first = new MarketService(null, Date.now, store);
  const session = first.tx(() => first.signup({ name: '세션회원', password: 'Test-pass1!' }));
  assert.ok(saved); assert.ok(!String(saved).includes(session.token), 'raw session token must never be stored');
  const reopened = new MarketService(null, Date.now, store);
  const req = { headers: { authorization: `Bearer ${session.token}` } } as import('node:http').IncomingMessage;
  assert.equal(reopened.userOf(req), session.user.id);
  reopened.logout(req);
  const afterLogout = new MarketService(null, Date.now, store);
  assert.throws(() => afterLogout.userOf(req), hasCode('UNAUTHORIZED'));
});

test('failed external session persistence does not issue or revoke a usable session', () => {
  let saved: string | null = null; let fail = false;
  const store = { load: () => saved, save: (value: string) => { if (fail) throw new Error('storage unavailable'); saved = value; } };
  const service = new MarketService(null, Date.now, store);
  const session = service.tx(() => service.signup({ name: '저장회원', password: 'Test-pass1!' }));
  const req = { headers: { authorization: `Bearer ${session.token}` } } as import('node:http').IncomingMessage;
  fail = true;
  assert.throws(() => service.login({ name: '저장회원', password: 'Test-pass1!' }), hasCode('MARKET_STORE_ERROR'));
  assert.throws(() => service.logout(req), hasCode('MARKET_STORE_ERROR'));
  assert.equal(service.userOf(req), session.user.id);
});
