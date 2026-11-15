import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createTossTestServer } from '../src/toss-test-local.ts';

test('테스트 키만 허용하고 서버 기준 가격과 주문 금액을 검증한다', async () => {
  assert.throws(() => createTossTestServer('live_gck_invalid', 'test_gsk_example'));
  assert.throws(() => createTossTestServer('test_gck_example', 'live_gsk_invalid'));
  let upstream = 0;
  const server = createTossTestServer('test_gck_example', 'test_gsk_example', async (_url, init) => {
    upstream++; const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ ...body, totalAmount: body.amount, status: 'DONE' }), { status: 200 });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = async (path: string, body: unknown) => { const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() as any }; };
  try {
    const item = { title: '레이더 라이브 2026', seat: 'VIP석', kind: 'resale_demo', quantity: 1, price: 100000, originalPrice: 120000 };
    assert.equal((await post('/prepare', { ...item, price: 150000 })).status, 400);
    const prepared = await post('/prepare', item); assert.equal(prepared.status, 200); assert.equal(prepared.data.amount, 100000);
    assert.equal((await post('/confirm', { orderId: prepared.data.orderId, paymentKey: 'test-payment', amount: 1 })).status, 400); assert.equal(upstream, 0);
    assert.equal((await post('/confirm', { orderId: prepared.data.orderId, paymentKey: 'test-payment', amount: 100000 })).status, 200);
    assert.equal((await post('/confirm', { orderId: prepared.data.orderId, paymentKey: 'test-payment', amount: 100000 })).status, 200); assert.equal(upstream, 1);
    assert.equal((await post('/confirm', { orderId: prepared.data.orderId, paymentKey: 'other', amount: 100000 })).status, 409);
  } finally { server.close(); await once(server, 'close'); }
});

test('토스가 다른 결제 키를 반환하면 테스트 성공으로 처리하지 않는다', async () => {
  const server = createTossTestServer('test_gck_example', 'test_gsk_example', async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ ...body, paymentKey: 'different', totalAmount: body.amount, status: 'DONE' }), { status: 200 });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = async (path: string, body: unknown) => { const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() as any }; };
  try {
    const item = { title: '레이더 라이브 2026', seat: 'VIP석', kind: 'primary_demo', quantity: 1, price: 154000 };
    const prepared = await post('/prepare', item);
    const result = await post('/confirm', { orderId: prepared.data.orderId, paymentKey: 'test-key', amount: 154000 });
    assert.equal(result.status, 502);
    assert.notEqual(result.data.status, 'DONE');
  } finally { server.close(); await once(server, 'close'); }
});

test('승인 응답 유실 뒤 동일 결제만 동일 멱등키로 재시도한다', async () => {
  const keys: string[] = [];
  let attempts = 0;
  const server = createTossTestServer('test_gck_example', 'test_gsk_example', async (_url, init) => {
    keys.push(new Headers(init?.headers).get('Idempotency-Key') ?? '');
    if (++attempts === 1) throw new Error('simulated timeout');
    const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ ...body, totalAmount: body.amount, status: 'DONE' }), { status: 200 });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = async (path: string, body: unknown) => { const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() as any }; };
  try {
    const prepared = await post('/prepare', { title: '레이더 라이브 2026', seat: 'VIP석', kind: 'primary_demo', quantity: 1, price: 154000 });
    const confirmation = { orderId: prepared.data.orderId, paymentKey: 'same-key', amount: 154000 };
    assert.equal((await post('/confirm', confirmation)).status, 502);
    assert.equal((await post('/confirm', { ...confirmation, paymentKey: 'different-key' })).status, 409);
    assert.equal((await post('/confirm', confirmation)).status, 200);
    assert.deepEqual(keys, [prepared.data.orderId, prepared.data.orderId]);
  } finally { server.close(); await once(server, 'close'); }
});
