import test from 'node:test';
import assert from 'node:assert/strict';
import { mobileTestPayment } from './mobile-test-payment-worker.ts';
import { sharedMarket } from './shared-market-worker.ts';

const origin = 'https://ticketradar.month32.workers.dev', secret = 's'.repeat(43), token = 'p'.repeat(43);
const req = (path: string, method = 'POST', extra: Record<string, string> = {}) => new Request(`${origin}/api/mobile-test-payment${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.10', ...extra }, ...(method === 'POST' ? { body: '{}' } : {}) });

test('mobile exchange returns only order details and keeps scoped token in HttpOnly cookie', async () => {
  const upstream: typeof fetch = async () => Response.json({ token, orderId: 'order-1', providerOrderId: 'provider-1', amount: 99000, mode: 'test' });
  const response = await mobileTestPayment(req('/exchange'), upstream, secret);
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie') ?? '';
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Strict/);
  const data = await response.json() as Record<string, unknown>;
  assert.equal(data.token, undefined); assert.equal(data.amount, 99000);
  let forwarded: string | null = null;
  const accountUpstream: typeof fetch = async (_url, init) => { forwarded = new Headers(init?.headers).get('Authorization'); return Response.json({ message: 'unauthorized' }, { status: 401 }); };
  await sharedMarket(new Request(`${origin}/api/shared/me`, { headers: { Cookie: cookie, 'CF-Connecting-IP': '192.0.2.10' } }), accountUpstream, secret);
  assert.equal(forwarded, null, 'payment cookie never becomes a general account credential');
});

test('mobile payment blocks cross-origin requests and requires scoped cookie', async () => {
  let calls = 0; const upstream: typeof fetch = async () => { calls++; return Response.json({}); };
  assert.equal((await mobileTestPayment(req('/exchange', 'POST', { Origin: 'https://evil.example' }), upstream, secret)).status, 403);
  assert.equal((await mobileTestPayment(req('/confirm'), upstream, secret)).status, 401);
  assert.equal(calls, 0);
});
