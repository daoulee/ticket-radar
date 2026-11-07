import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { MarketService } from '../src/market.ts';
import { EmailVerification } from '../src/email-verification.ts';
import { LoginGuard } from '../src/login-guard.ts';

// WEB-020 보안 보완: 인증 메일 일일 상한, 계정별 로그인 실패 잠금.

test('email: per-address daily cap and global daily cap', async () => {
  let now = 0;
  const verification = new EmailVerification(async () => {}, () => now, { perAddressDaily: 3, dailyTotal: 4 });
  for (let i = 0; i < 3; i++) { await verification.send('fan@example.com'); now += 60_000; }
  await assert.rejects(verification.send('fan@example.com'), { code: 'RATE_LIMITED' });
  await verification.send('other@example.com');
  now += 60_000;
  await assert.rejects(verification.send('third@example.com'), { code: 'RATE_LIMITED' }); // 전체 4통 소진
  now += 24 * 3600_000;
  await verification.send('fan@example.com'); // 하루 지나면 다시 가능
});

test('login guard: 5 failures lock the identifier for 15 minutes, regardless of account existence', () => {
  let now = 0;
  const guard = new LoginGuard(5, 15 * 60_000, 15 * 60_000, () => now);
  const key = LoginGuard.keyOf({ email: 'Nobody@Example.com', password: 'x' });
  assert.equal(key, 'email:Nobody@example.com'); // 로그인과 같은 정규화(도메인만 소문자)
  for (let i = 0; i < 4; i++) guard.fail(key);
  guard.check(key);
  guard.fail(key);
  assert.throws(() => guard.check(key), { code: 'LOGIN_LOCKED' });
  assert.throws(() => guard.check(LoginGuard.keyOf({ email: 'Nobody@EXAMPLE.COM' })), { code: 'LOGIN_LOCKED' });
  guard.check(LoginGuard.keyOf({ name: 'someone' })); // 다른 계정은 영향 없음
  now += 15 * 60_000;
  guard.check(key);
  guard.fail(key); guard.success(key);
  for (let i = 0; i < 4; i++) guard.fail(key);
  guard.check(key); // 성공하면 실패 횟수 초기화
});

test('HTTP: account lockout after repeated wrong passwords; correct password works after lock ends', async () => {
  let emailCode = '';
  const verification = new EmailVerification(async (_e, code) => { emailCode = code; });
  let now = 0;
  const guard = new LoginGuard(5, 15 * 60_000, 15 * 60_000, () => now);
  const server = createApi(new CheckService(), undefined, undefined, undefined, new MarketService(), verification, guard);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const call = async (path: string, body: unknown) => {
    const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json() as any };
  };
  try {
    assert.equal((await call('/auth/email/send', { email: 'lock@example.org' })).status, 200);
    assert.equal((await call('/auth/signup', { name: 'lock01', email: 'lock@example.org', password: 'Lock-pass-1!', verificationCode: emailCode })).status, 201);
    const ok = await call('/auth/login', { email: 'lock@example.org', password: 'Lock-pass-1!' });
    assert.equal(ok.status, 200); assert.ok(ok.body.token);
    for (let i = 0; i < 5; i++) assert.equal((await call('/auth/login', { email: 'lock@example.org', password: 'Wrong-pass-1!' })).status, 401);
    const locked = await call('/auth/login', { email: 'lock@example.org', password: 'Lock-pass-1!' });
    assert.equal(locked.status, 429); assert.equal(locked.body.code, 'LOGIN_LOCKED');
    // 없는 계정도 같은 규칙(잠금 여부로 가입 여부가 드러나지 않음)
    for (let i = 0; i < 5; i++) assert.equal((await call('/auth/login', { email: 'ghost@example.org', password: 'Wrong-pass-1!' })).status, 401);
    assert.equal((await call('/auth/login', { email: 'ghost@example.org', password: 'Wrong-pass-1!' })).body.code, 'LOGIN_LOCKED');
    now += 15 * 60_000;
    assert.equal((await call('/auth/login', { email: 'lock@example.org', password: 'Lock-pass-1!' })).status, 200);
  } finally { server.close(); }
});
