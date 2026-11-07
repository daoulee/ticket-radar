import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { EmailVerification, gmailSender, resendSender, verificationSenderFromEnv } from '../src/email-verification.ts';

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
