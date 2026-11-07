import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MarketService } from '../src/market.ts';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import type { KopisDetail } from '../src/kopis-cards.ts';

const now = Date.parse('2026-11-07T07:00:00.000Z');
const detail: KopisDetail = { id: 'PF305681', title: '마흔에 서 [대학로]', venue: '봄날아트홀 (1관)', startsOn: '2026-11-25', endsOn: '2026-11-29', status: '공연예정', source: 'KOPIS', fetchedAt: new Date(now).toISOString(), genre: '연극', posterUrl: null, story: null, cast: null, runtime: null, age: null, schedule: '수요일 ~ 금요일(19:30), 토요일 ~ 일요일(15:00)', priceGuide: '전석 40,000원', priceCandidate: { seatGrade: '전석', price: 40000, sourceQuote: '전석 40,000원' }, introImages: [], facilityId: 'FC000453', stageId: 'FC000453-03', stageCapacity: 120 };

test('demo creation rejects changed, stale, ambiguous or expired KOPIS information without writing', () => {
  for (const value of [{ ...detail, stageCapacity: null }, { ...detail, priceGuide: '전석 40,000원부터' }, { ...detail, stageId: 'FC000453-02' }, { ...detail, fetchedAt: new Date(now - 120001).toISOString() }, { ...detail, schedule: null }]) {
    const service = new MarketService(null, () => now);
    assert.throws(() => service.tx(() => service.prepareKopisDemo(value)), { code: 'DEMO_DATA_UNVERIFIED' });
    assert.equal(service.core.state.shows.some(s => s.id === detail.id), false);
  }
});

test('failed storage rolls back both demo show and listing', () => {
  const service = new MarketService(join(mkdtempSync(join(tmpdir(), 'kopis-demo-')), 'market.json'), () => now);
  service.writeFile = (() => { throw new Error('disk full'); }) as typeof service.writeFile;
  assert.throws(() => service.tx(() => service.prepareKopisDemo(detail)), { code: 'MARKET_STORE_ERROR' });
  assert.equal(service.core.state.shows.some(show => show.id === detail.id), false);
  assert.equal(service.core.state.listings.some(listing => listing.showId === detail.id), false);
});

test('authenticated demo creation is idempotent and completes a simulated purchase', async () => {
  const market = new MarketService(null, () => now);
  const buyer = market.signup({ name: 'demo-buyer', password: 'Demo-pass-1!' });
  const server = createApi(new CheckService(), undefined, undefined, undefined, market, undefined, undefined, async () => detail);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const call = async (path: string, token?: string) => { const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: '{}' }); return { status: r.status, body: await r.json() as any }; };
  try {
    assert.equal((await call('/performance-cards/PF305681/demo-market')).status, 401);
    const prepared = await call('/performance-cards/PF305681/demo-market', buyer.token);
    assert.equal(prepared.status, 200);
    assert.equal(prepared.body.show.sessions[0].startsAt, null);
    assert.match(prepared.body.show.sessions[0].label, /시연 회차.*미확인/);
    assert.equal(prepared.body.listings.length, 1);
    assert.equal(prepared.body.listings[0].quantity, 1);
    assert.equal(prepared.body.listings[0].isDemo, true);
    assert.equal(prepared.body.listings[0].safety.priceText, '시연 기준가와 같아요');
    const sharedShows = await (await fetch(base + '/shows')).json() as any[];
    assert.equal(sharedShows.find(show => show.id === detail.id)?.canRegister, false);
    const sharedShow = await (await fetch(base + `/shows/${detail.id}`)).json() as any;
    assert.equal(sharedShow.listings[0].id, prepared.body.listings[0].id);
    const listingId = prepared.body.listings[0].id;
    assert.equal((await call('/performance-cards/PF305681/demo-market', buyer.token)).body.listings.length, 1);
    const orderResponse = await fetch(base + '/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.token}` }, body: JSON.stringify({ listingId }) });
    const order = await orderResponse.json() as any;
    assert.equal(orderResponse.status, 201); assert.equal(order.isDemoPayment, true); assert.equal(order.status, 'sent');
    assert.equal((await call(`/orders/${order.id}/confirm`, buyer.token)).body.status, 'settled');
    const again = await call('/performance-cards/PF305681/demo-market', buyer.token);
    assert.equal(again.body.listings.length, 1, 'a later explicit request prepares a new demo');
    assert.notEqual(again.body.listings[0].id, listingId);
    assert.equal(market.core.state.listings.filter(item => item.showId === detail.id).length, 2);
  } finally { server.close(); await once(server, 'close'); }
});
