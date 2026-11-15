import test from 'node:test'
import assert from 'node:assert/strict'
import { tossTest } from './toss-worker.ts'
const env = { TOSS_TEST_CLIENT_KEY: 'test_gck_example', TOSS_TEST_SECRET_KEY: 'test_gsk_example' }
const origin = 'https://example.test'
const request = (path: string, data: unknown, source = origin) => new Request(`${origin}/api/toss-test/${path}`, { method: 'POST', headers: { Origin: source, 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
const item = { kind: 'primary_demo', title: '레이더 라이브 2026', seat: 'VIP석', quantity: 1, price: 154000 }

test('test keys, origin, catalogue, quantity and resale caps are mandatory', async () => {
  assert.equal((await tossTest(request('prepare', item), { ...env, TOSS_TEST_SECRET_KEY: 'live_gsk_no' })).status, 503)
  assert.equal((await tossTest(request('prepare', item, 'https://evil.test'), env)).status, 403)
  assert.equal((await tossTest(request('prepare', { ...item, title: '__proto__' }), env)).status, 400)
  assert.equal((await tossTest(request('prepare', { ...item, price: 1 }), env)).status, 400)
  assert.equal((await tossTest(request('prepare', { ...item, quantity: 20 }), env)).status, 400)
  assert.equal((await tossTest(request('prepare', { ...item, kind: 'resale_demo', price: 100000, originalPrice: 90000 }), env)).status, 400)
})

test('signed amount, order and payment key are verified before success; retry has stable idempotency key', async () => {
  let calls = 0; const keys: string[] = []
  const upstream: typeof fetch = async (_url, init) => { calls++; keys.push(new Headers(init?.headers).get('Idempotency-Key') ?? ''); const data = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ ...data, totalAmount: data.amount, status: 'DONE' })) }
  const response = await tossTest(request('prepare', item), env); assert.equal(response.status, 200)
  const prepared = await response.json() as { orderId: string; amount: number; orderToken: string }
  const confirm = { orderId: prepared.orderId, amount: prepared.amount, paymentKey: 'payment-test', orderToken: prepared.orderToken }
  assert.equal((await tossTest(request('confirm', { ...confirm, amount: 1 }), env, upstream)).status, 400)
  assert.equal((await tossTest(request('confirm', { ...confirm, orderId: 'different' }), env, upstream)).status, 400)
  assert.equal((await tossTest(request('confirm', { ...confirm, orderToken: `${prepared.orderToken}x` }), env, upstream)).status, 400)
  assert.equal(calls, 0)
  assert.equal((await tossTest(request('confirm', confirm), env, upstream)).status, 200)
  assert.equal((await tossTest(request('confirm', confirm), env, upstream)).status, 200)
  assert.deepEqual(keys, [prepared.orderId, prepared.orderId])
  const wrong: typeof fetch = async () => new Response(JSON.stringify({ orderId: confirm.orderId, paymentKey: 'wrong', totalAmount: confirm.amount, status: 'DONE' }))
  assert.equal((await tossTest(request('confirm', confirm), env, wrong)).status, 502)
})
