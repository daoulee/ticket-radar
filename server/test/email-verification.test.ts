import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { EmailVerification, gmailApiSender, gmailSender, resendSender, verificationSenderFromEnv } from '../src/email-verification.ts';

test('verification is bound to the email and can only succeed once', async () => {
  let sent = '';
  const verification = new EmailVerification(async (_email, code) => { sent = code; });
  await verification.send('fan@example.com');
  assert.match(sent, /^\d{6}$/);
  assert.equal(verification.verify('other@example.com', sent), false);
  assert.equal(verification.verify('fan@example.com', sent), true);
  assert.equal(verification.verify('fan@example.com', sent), false);
});

test('expiry, retry limits and resend cooldown reject invalid attempts', async () => {
  let now = 0;
  let code = '';
  const verification = new EmailVerification(async (_email, value) => { code = value; }, () => now);
  await verification.send('fan@example.com');
  await assert.rejects(verification.send('fan@example.com'), { code: 'RATE_LIMITED' });
  const wrong = code === '000000' ? '000001' : '000000';
  for (let attempt = 0; attempt < 5; attempt++) assert.equal(verification.verify('fan@example.com', wrong), false);
  assert.equal(verification.verify('fan@example.com', code), false);
  await assert.rejects(verification.send('fan@example.com'), { code: 'RATE_LIMITED' });
  now += 60_000;
  await verification.send('fan@example.com');
  now += 600_000;
  assert.equal(verification.verify('fan@example.com', code), false);
});

test('missing and failing delivery are explicit, with no success fallback', async () => {
  await assert.rejects(new EmailVerification(null).send('fan@example.com'), { code: 'EMAIL_NOT_CONFIGURED' });
  const verification = new EmailVerification(async () => { throw new Error('secret'); });
  await assert.rejects(verification.send('fan@example.com'), { code: 'EMAIL_DELIVERY_FAILED' });
  assert.equal(verification.verify('fan@example.com', '123456'), false);
  assert.equal(resendSender('', 'sender@example.com'), null);
});

test('Resend adapter sends expected request and handles failure', async () => {
  let payload: Record<string, unknown> = {};
  const fakeFetch: typeof fetch = async (_url, options) => { payload = JSON.parse(String(options?.body)); return new Response('{}', { status: 200 }); };
  await resendSender('test-key', 'sender@example.com', fakeFetch)!('fan@example.com', '123456');
  assert.deepEqual(payload.to, ['fan@example.com']);
  assert.match(String(payload.text), /123456/);
  const failed: typeof fetch = async () => new Response('', { status: 500 });
  await assert.rejects(resendSender('test-key', 'sender@example.com', failed)!('fan@example.com', '123456'));
});

test('Gmail adapter uses TLS and forwards the message through the selected transport', async () => {
  let options: any;
  let message: any;
  const factory = ((value: unknown) => { options = value; return { sendMail: async (data: unknown) => { message = data; } }; }) as typeof nodemailer.createTransport;
  const sender = gmailSender('sender@gmail.com', 'test password', factory)!;
  await sender('fan@example.com', '123456');
  assert.equal(options.host, 'smtp.gmail.com');
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.equal(message.from, 'sender@gmail.com');
  assert.equal(message.to, 'fan@example.com');
  assert.match(message.text, /123456/);
  assert.equal(gmailSender('', 'password'), null);
  assert.equal(verificationSenderFromEnv({ EMAIL_PROVIDER: 'gmail', RESEND_API_KEY: 'key', RESEND_FROM: 'sender@example.com' }), null);
  assert.equal(verificationSenderFromEnv({ EMAIL_PROVIDER: 'unknown', RESEND_API_KEY: 'key', RESEND_FROM: 'sender@example.com' }), null);
});

test('Gmail API sender refreshes OAuth token and sends a correctly encoded message', async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fakeFetch: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return calls.length === 1 ? Response.json({ access_token: 'synthetic-access-token' }) : Response.json({ id: 'synthetic-message' });
  };
  const sender = gmailApiSender('synthetic-id', 'synthetic-secret', 'synthetic-refresh', 'sender@example.com', fakeFetch);
  assert.ok(sender);
  await sender('fan@example.com', '123456');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://oauth2.googleapis.com/token');
  const params = new URLSearchParams(String(calls[0].init?.body));
  assert.equal(params.get('grant_type'), 'refresh_token');
  assert.equal(params.get('refresh_token'), 'synthetic-refresh');
  assert.equal(calls[1].url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
  assert.equal(new Headers(calls[1].init?.headers).get('authorization'), 'Bearer synthetic-access-token');
  const payload = JSON.parse(String(calls[1].init?.body)) as { raw: string };
  const mime = Buffer.from(payload.raw, 'base64url').toString('utf8');
  assert.match(mime, /To: fan@example.com\r\n/);
  assert.match(mime, /From: sender@example.com\r\n/);
  assert.match(mime, /Content-Transfer-Encoding: base64/);
  assert.match(Buffer.from(mime.split('\r\n\r\n')[1], 'base64').toString('utf8'), /123456/);
  assert.equal(calls[0].init?.redirect, 'manual'); assert.equal(calls[1].init?.redirect, 'manual');
});

test('Gmail API sender fails closed for missing credentials, malformed recipient and upstream errors', async () => {
  assert.equal(gmailApiSender('', 'secret', 'refresh', 'sender@example.com'), null);
  assert.equal(gmailApiSender('id', 'secret', 'refresh', 'invalid\r\nBcc: victim@example.com'), null);
  assert.equal(verificationSenderFromEnv({ EMAIL_PROVIDER: 'gmail-api', GMAIL_USER: 'sender@example.com' }), null);
  let calls = 0;
  const failing: typeof fetch = async () => { calls++; return new Response('sensitive-response', { status: 401 }); };
  const sender = gmailApiSender('id', 'secret', 'refresh', 'sender@example.com', failing)!;
  await assert.rejects(sender('fan@example.com\r\nBcc: victim@example.com', '123456'));
  assert.equal(calls, 0);
  await assert.rejects(sender('fan@example.com', 'not-code'));
  assert.equal(calls, 0);
  await assert.rejects(sender('fan@example.com', '123456'), { message: 'Gmail authorization failed' });
  assert.equal(calls, 1);
  const badToken: typeof fetch = async () => Response.json({ access_token: 'bad\r\nvalue' });
  await assert.rejects(gmailApiSender('id', 'secret', 'refresh', 'sender@example.com', badToken)!('fan@example.com', '123456'), { message: 'Gmail authorization failed' });
  let attempt = 0;
  const sendFails: typeof fetch = async () => ++attempt === 1 ? Response.json({ access_token: 'token' }) : new Response('private failure', { status: 500 });
  await assert.rejects(gmailApiSender('id', 'secret', 'refresh', 'sender@example.com', sendFails)!('fan@example.com', '123456'), { message: 'Gmail delivery failed' });
  let redirectCalls = 0;
  const redirect: typeof fetch = async () => { redirectCalls++; return new Response(null, { status: 302, headers: { Location: 'https://example.invalid/' } }); };
  await assert.rejects(gmailApiSender('id', 'secret', 'refresh', 'sender@example.com', redirect)!('fan@example.com', '123456'), { message: 'Gmail authorization failed' });
  assert.equal(redirectCalls, 1);
});

test('external verification storage preserves challenges, attempt limits and single use across restarts', async () => {
  let saved: string | null = null; let sent = ''; let now = 1000;
  const store = { load: () => saved, save: (value: string) => { saved = value; } };
  const first = new EmailVerification(async (_email, code) => { sent = code; }, () => now, {}, store);
  await first.send('fan@example.com');
  assert.ok(saved); assert.ok(!String(saved).includes(`\"${sent}\"`), 'verification code must not be stored in plaintext');
  const second = new EmailVerification(async () => {}, () => now, {}, store);
  const wrong = sent === '000000' ? '000001' : '000000';
  assert.equal(second.verify('fan@example.com', wrong), false);
  const third = new EmailVerification(async () => {}, () => now, {}, store);
  assert.equal(third.verify('fan@example.com', sent), true);
  assert.equal(new EmailVerification(async () => {}, () => now, {}, store).verify('fan@example.com', sent), false);
  await assert.rejects(new EmailVerification(async () => {}, () => now, {}, store).send('fan@example.com'), { code: 'RATE_LIMITED' });
  now += 600_001;
});

test('failed verification storage rejects authentication and never sends mail', async () => {
  let saved: string | null = null; let fail = true; let calls = 0;
  const store = { load: () => saved, save: (value: string) => { if (fail) throw new Error('unavailable'); saved = value; } };
  const service = new EmailVerification(async () => { calls++; }, Date.now, {}, store);
  await assert.rejects(service.send('fan@example.com'), { code: 'EMAIL_STORE_ERROR' });
  assert.equal(calls, 0); assert.equal(saved, null);
  fail = false; await service.send('fan@example.com'); assert.equal(calls, 1);
});

test('verification attempt limits and expiry survive repeated restarts', async () => {
  let saved: string | null = null; let code = ''; let now = 1000;
  const store = { load: () => saved, save: (value: string) => { saved = value; } };
  const first = new EmailVerification(async (_email, value) => { code = value; }, () => now, {}, store);
  await first.send('fan@example.com');
  const wrong = code === '000000' ? '000001' : '000000';
  for (let i = 0; i < 5; i++) assert.equal(new EmailVerification(async () => {}, () => now, {}, store).verify('fan@example.com', wrong), false);
  assert.equal(new EmailVerification(async () => {}, () => now, {}, store).verify('fan@example.com', code), false);
  now += 60_001;
  await new EmailVerification(async (_email, value) => { code = value; }, () => now, {}, store).send('fan@example.com');
  now += 600_001;
  assert.equal(new EmailVerification(async () => {}, () => now, {}, store).verify('fan@example.com', code), false);
});

test('verification storage failure does not accept or consume the code', async () => {
  let saved: string | null = null; let fail = false; let code = '';
  const store = { load: () => saved, save: (value: string) => { if (fail) throw new Error('failed'); saved = value; } };
  const v = new EmailVerification(async (_email, value) => { code = value; }, Date.now, {}, store);
  await v.send('fan@example.com');
  fail = true;
  assert.throws(() => v.verify('fan@example.com', code), { code: 'EMAIL_STORE_ERROR' });
  fail = false;
  assert.equal(v.verify('fan@example.com', code), true);
  assert.equal(v.verify('fan@example.com', code), false);
});

test('malformed verification storage is rejected without writing a replacement', () => {
  for (const raw of ['{', '{}', '{"version":1,"secret":"bad"}']) {
    let writes = 0;
    const store = { load: () => raw, save: () => { writes++; } };
    assert.throws(() => new EmailVerification(async () => {}, Date.now, {}, store), { code: 'EMAIL_STORE_ERROR' });
    assert.equal(writes, 0);
  }
});
