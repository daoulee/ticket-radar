import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedMarket } from './shared-market-worker.ts';
import { verifyProxyClient } from '../shared/proxy-auth.ts';

const origin = 'https://ticketradar.month32.workers.dev';
const token = 'a'.repeat(43);
const secret = 's'.repeat(43);
const cookie = `__Host-ticketradar-session=${token}`;
const req = (path: string, options: RequestInit = {}) => { const headers = new Headers(options.headers); headers.set('CF-Connecting-IP', '192.0.2.10'); return new Request(`${origin}/api/shared${path}`, { ...options, headers }); };
const post = (body: unknown, extra: Record<string, string> = {}) => ({ method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });
const call = (request: Request, upstream: typeof fetch) => sharedMarket(request, upstream, secret);

test('login sets a host-only HttpOnly cookie and never exposes the bearer token to JavaScript', async () => {
  let passed = false;
  const upstream: typeof fetch = async (url, init) => {
    passed = String(url).endsWith('/auth/login') && init?.redirect === 'manual';
    const headers = new Headers(init?.headers);
    assert.equal(await verifyProxyClient(secret, headers.get('x-tr-proxy-ip') ?? '', headers.get('x-tr-proxy-time') ?? '', init?.method ?? '', new URL(String(url)).pathname, headers.get('x-tr-proxy-signature') ?? ''), true);
    return Response.json({ token, expiresAt: new Date(Date.now() + 3600_000).toISOString(), user: { id: 'fake' } });
  };
  const response = await call(req('/auth/login', post({ email: 'synthetic@example.test', password: 'synthetic' })), upstream);
  assert.equal(response.status, 200); assert.equal(passed, true);
  const header = response.headers.get('set-cookie') ?? '';
  assert.match(header, /^__Host-ticketradar-session=/); assert.match(header, /HttpOnly/); assert.match(header, /Secure/); assert.match(header, /SameSite=Strict/); assert.ok(!header.includes('Domain='));
  assert.deepEqual(await response.json(), { authenticated: true });
});

test('cookie is forwarded only to the configured backend and is cleared when rejected', async () => {
  let auth: string | null = null;
  const upstream: typeof fetch = async (_url, init) => { auth = new Headers(init?.headers).get('Authorization'); return Response.json({ message: 'expired' }, { status: 401 }); };
  const response = await call(req('/me/orders', { headers: { Cookie: cookie } }), upstream);
  assert.equal(auth, `Bearer ${token}`); assert.equal(response.status, 401);
  assert.match(response.headers.get('set-cookie') ?? '', /Max-Age=0/);
});

test('cross-site writes, unknown routes, duplicate cookies and redirects do not leak credentials', async () => {
  let calls = 0; const upstream: typeof fetch = async (_u, init) => { calls++; assert.equal(new Headers(init?.headers).get('Authorization'), null); return new Response(null, { status: 302 }); };
  assert.equal((await call(req('/auth/login', post({}, { Origin: 'https://evil.example' })), upstream)).status, 403);
  assert.equal((await call(req('/other'), upstream)).status, 404); assert.equal(calls, 0);
  assert.equal((await call(req('/me', { headers: { Cookie: `${cookie}; ${cookie}` } }), upstream)).status, 502);
  assert.equal(calls, 1);
});

test('existing tab token can be upgraded only after server validation and same-origin POST', async () => {
  const upstream: typeof fetch = async (_url, init) => { assert.equal(new Headers(init?.headers).get('Authorization'), `Bearer ${token}`); return Response.json({ id: 'synthetic-user' }); };
  const response = await call(req('/auth/session-upgrade', post({}, { Authorization: `Bearer ${token}` })), upstream);
  assert.equal(response.status, 200); assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/);
  assert.deepEqual(await response.json(), { authenticated: true });
  assert.equal((await call(req('/auth/session-upgrade', post({}, { Authorization: token })), upstream)).status, 400);
});
