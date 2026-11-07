import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { ApiError } from '../src/errors.ts';
import { CheckResponseSchema, EventListSchema, OfficialContextSchema, ApiErrorBodySchema } from '../../shared/index.ts';
import { entry, listing, confirmed, fixtureProvider } from './helpers.ts';

async function withApi(run: (base: string) => Promise<void>, service = new CheckService()) {
  const server = createApi(service);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try { await run(base); } finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
}
const payload = () => ({ eventId: entry.event.id, listingText: listing });
const post = (base: string, body: unknown) => fetch(`${base}/checks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('HTTP: actual performance search is separate from reviewed event catalog', async () => {
  let received = '';
  const server = createApi(new CheckService(), undefined, async query => {
    received = query;
    return [{ id: 'PF123', title: '공연', venue: null, startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS', fetchedAt: '2026-11-03T00:00:00.000Z' }];
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const response = await fetch(`${base}/performances?q=${encodeURIComponent('공연')}`);
    assert.equal(response.status, 200); assert.equal(received, '공연');
    assert.equal((await response.json() as { source: string }[])[0].source, 'KOPIS');
    assert.equal((await fetch(`${base}/events/PF123/official-context`)).status, 404);
  } finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
});

test('HTTP: event search and context use common nested schemas and official snapshot', async () => {
  await withApi(async base => {
    const list = await fetch(`${base}/events?q=AKMU`);
    assert.equal(list.status, 200); assert.equal(list.headers.get('cache-control'), 'no-store');
    const events = EventListSchema.parse(await list.json()); assert.equal(events.length, 1);
    assert.equal(events[0].sourceCheckedAt, '2026-10-29');
    assert.equal((await (await fetch(`${base}/events?q=does-not-exist`)).json()).length, 0);
    const result = await fetch(`${base}/events/${events[0].id}/official-context`);
    const context = OfficialContextSchema.parse(await result.json());
    assert.equal(context.policies[0].scope, 'fanclub_presale'); assert.equal(context.sourceDatePrecision, 'date');
    assert.equal(context.priceTiers.find(t => t.seatGrade === 'VIP')!.facePrice, 176000);
  });
});
test('HTTP: AI disabled is explicit 503 and manual is explicit 200', async () => {
  await withApi(async base => {
    const health = await (await fetch(`${base}/health`)).json(); assert.equal(health.aiConfigured, false);
    const failed = await post(base, payload()); assert.equal(failed.status, 503);
    const error = ApiErrorBodySchema.parse(await failed.json()); assert.equal(error.code, 'AI_NOT_CONFIGURED');
    const response = await post(base, { ...payload(), extractionMode: 'manual', confirmedFields: confirmed() });
    assert.equal(response.status, 200);
    const result = CheckResponseSchema.parse(await response.json());
    assert.equal(result.extraction.method, 'manual'); assert.equal(result.isDemo, true);
    assert.equal(result.priceComparison.held, false);
    if (!result.priceComparison.held) assert.equal(result.priceComparison.diff, 74000);
  });
});
test('HTTP: two-step check with injected fixture retains raw extraction and corrected price', async () => {
  const provider = fixtureProvider();
  await withApi(async base => {
    assert.equal((await (await fetch(`${base}/health`)).json()).aiConfigured, true);
    const first = CheckResponseSchema.parse(await (await post(base, payload())).json());
    assert.equal(first.priceComparison.held, true);
    const second = CheckResponseSchema.parse(await (await post(base, { ...payload(), previousCheckId: first.checkId, confirmedFields: confirmed({ price: 200000 }) })).json());
    assert.equal(second.extracted.price.value, 250000); assert.equal(second.appliedFields!.price, 200000);
    assert.equal(second.extraction.reused, true); assert.equal(second.extraction.actualModelCall, false);
    assert.equal(second.extraction.method, 'fixture'); assert.equal(provider.calls, 1);
  }, new CheckService(provider));
});
test('HTTP: provider failure is sanitized, never a successful demo response', async () => {
  const p = fixtureProvider(); p.extract = async () => { throw new Error('PRIVATE PROVIDER ERROR BODY'); };
  await withApi(async base => {
    const response = await post(base, payload()); assert.equal(response.status, 502);
    const body = await response.text(); assert.ok(!body.includes('PRIVATE'));
    assert.equal(JSON.parse(body).code, 'AI_PROVIDER_ERROR');
  }, new CheckService(p));
});
test('HTTP: AI timeout returns retryable 504', async () => {
  const p = fixtureProvider(); p.extract = () => new Promise(() => {});
  await withApi(async base => {
    const response = await post(base, payload()); assert.equal(response.status, 504);
    assert.deepEqual(await response.json(), new ApiError('AI_TIMEOUT', 'AI 추출 시간이 초과됐습니다. 다시 시도하세요.', 504, true).body());
  }, new CheckService(p, undefined, 5));
});
test('HTTP: invalid content, oversized input and malformed JSON fail before processing', async () => {
  await withApi(async base => {
    const media = await fetch(`${base}/checks`, { method: 'POST', body: '{}' }); assert.equal(media.status, 415);
    const large = await post(base, { ...payload(), listingText: '가'.repeat(6000) }); assert.equal(large.status, 413);
    const malformed = await fetch(`${base}/checks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
    assert.equal(malformed.status, 400);
    const invalid = await post(base, { ...payload(), syntheticListing: 'false' }); assert.equal(invalid.status, 400);
  });
});
test('HTTP: unknown events, routes and malformed path have structured errors', async () => {
  await withApi(async base => {
    for (const path of ['/events/absent/official-context', '/absent', '/events/%E0%A4/official-context']) {
      const response = await fetch(base + path); assert.ok(response.status >= 400);
      ApiErrorBodySchema.parse(await response.json());
    }
  });
});
test('HTTP: CORS allows explicit development origins and rejects others', async () => {
  await withApi(async base => {
    const yes = await fetch(`${base}/checks`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(yes.status, 204); assert.equal(yes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    const no = await fetch(`${base}/events`, { headers: { Origin: 'https://evil.invalid' } });
    assert.equal(no.status, 403); assert.equal(no.headers.get('access-control-allow-origin'), null);
  });
});
test('HTTP: request limit caps repeated extraction requests', async () => {
  await withApi(async base => {
    for (let i = 0; i < 30; i++) assert.equal((await post(base, payload())).status, 503);
    const last = await post(base, payload()); assert.equal(last.status, 429);
    assert.equal((await last.json()).retryable, true);
  });
});
