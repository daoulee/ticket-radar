import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.ts';
import { normalizeEmail } from './email-identity.ts';
import nodemailer from 'nodemailer';

export type VerificationSender = (email: string, code: string) => Promise<void>;
type Challenge = { digest: Buffer; expiresAt: number; nextSendAt: number; attempts: number };
export interface VerificationPersistence { load(): string | null; save(serialized: string): void }

export class EmailVerification {
  private readonly challenges = new Map<string, Challenge>();
  private readonly cooldowns = new Map<string, number>();
  // 일일 발송 상한(WEB-020): 남의 메일함 괴롭힘·발송 계정 한도 소진 방지. 주소당 하루 5통, 서버 전체 하루 dailyTotal통.
  private readonly daily = new Map<string, { count: number; until: number }>();
  private total = { count: 0, until: 0 };
  private readonly perAddressDaily: number;
  private readonly dailyTotal: number;
  private secret = randomBytes(32);
  private readonly sender: VerificationSender | null;
  private readonly now: () => number;
  private readonly persistence: VerificationPersistence | null;

  constructor(sender: VerificationSender | null, now: () => number = Date.now, limits: { perAddressDaily?: number; dailyTotal?: number } = {}, persistence: VerificationPersistence | null = null) {
    this.sender = sender;
    this.now = now;
    this.persistence = persistence;
    this.perAddressDaily = limits.perAddressDaily ?? 5;
    this.dailyTotal = limits.dailyTotal ?? 300;
    if (persistence) {
      try { const raw = persistence.load(); if (raw !== null) this.restore(raw); }
      catch { throw new ApiError('EMAIL_STORE_ERROR', '이메일 인증 저장소를 읽지 못했어요.', 503, true); }
    }
  }

  private snapshot(): string {
    return JSON.stringify({ version: 1, secret: this.secret.toString('hex'), challenges: [...this.challenges].map(([email, c]) => [email, { ...c, digest: c.digest.toString('hex') }]), cooldowns: [...this.cooldowns], daily: [...this.daily], total: this.total });
  }

  private restore(raw: string) {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid verification store');
    const v = value as Record<string, unknown>;
    if (v.version !== 1 || typeof v.secret !== 'string' || !/^[a-f0-9]{64}$/.test(v.secret) || !Array.isArray(v.challenges) || !Array.isArray(v.cooldowns) || !Array.isArray(v.daily) || !v.total || typeof v.total !== 'object') throw new Error('Invalid verification store');
    const number = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 0;
    const entries = (items: unknown[], validator: (v: any) => boolean) => items.every(item => Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && normalizeEmail(item[0]) === item[0] && validator(item[1]));
    if (!entries(v.challenges, c => c && typeof c === 'object' && typeof c.digest === 'string' && /^[a-f0-9]{64}$/.test(c.digest) && number(c.expiresAt) && number(c.nextSendAt) && number(c.attempts)) ||
        !entries(v.cooldowns, number) || !entries(v.daily, d => d && typeof d === 'object' && number(d.count) && number(d.until)) ||
        !number((v.total as { count?: unknown }).count) || !number((v.total as { until?: unknown }).until)) throw new Error('Invalid verification store');
    this.secret = Buffer.from(v.secret, 'hex');
    this.challenges.clear(); for (const [email, c] of v.challenges as [string, { digest: string; expiresAt: number; nextSendAt: number; attempts: number }][]) this.challenges.set(email, { ...c, digest: Buffer.from(c.digest, 'hex') });
    this.cooldowns.clear(); for (const [email, until] of v.cooldowns as [string, number][]) this.cooldowns.set(email, until);
    this.daily.clear(); for (const [email, day] of v.daily as [string, { count: number; until: number }][]) this.daily.set(email, day);
    this.total = v.total as { count: number; until: number };
  }

  private persist() {
    if (!this.persistence) return;
    try { this.persistence.save(this.snapshot()); }
    catch { throw new ApiError('EMAIL_STORE_ERROR', '이메일 인증을 저장하지 못했어요.', 503, true); }
  }

  private digest(email: string, code: string) {
    return createHmac('sha256', this.secret).update(email).update('\0').update(code).digest();
  }

  async send(rawEmail: unknown): Promise<void> {
    const email = normalizeEmail(rawEmail);
    if (!email) throw new ApiError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
    if (!this.sender) throw new ApiError('EMAIL_NOT_CONFIGURED', '이메일 인증이 아직 설정되지 않았어요.', 503, true);
    const previous = this.persistence ? this.snapshot() : null;
    const now = this.now();
    for (const [key, challenge] of this.challenges) if (challenge.expiresAt <= now) this.challenges.delete(key);
    for (const [key, until] of this.cooldowns) if (until <= now) this.cooldowns.delete(key);
    const old = this.challenges.get(email);
    if ((this.cooldowns.get(email) ?? 0) > now || (old && now < old.nextSendAt)) throw new ApiError('RATE_LIMITED', '잠시 후 다시 요청해 주세요.', 429, true);
    if (!old && (this.challenges.size >= 1000 || this.cooldowns.size >= 1000)) throw new ApiError('RATE_LIMITED', '잠시 후 다시 요청해 주세요.', 429, true);
    for (const [key, d] of this.daily) if (d.until <= now) this.daily.delete(key);
    if (this.total.until <= now) this.total = { count: 0, until: now + 24 * 3600_000 };
    const day = this.daily.get(email) ?? { count: 0, until: now + 24 * 3600_000 };
    if (day.count >= this.perAddressDaily) throw new ApiError('RATE_LIMITED', '오늘 이 주소로 보낼 수 있는 인증 메일을 모두 보냈어요. 내일 다시 시도해 주세요.', 429, true);
    if (this.total.count >= this.dailyTotal) throw new ApiError('RATE_LIMITED', '오늘은 인증 메일을 더 보낼 수 없어요. 잠시 후 다시 시도해 주세요.', 429, true);
    if (!this.daily.has(email) && this.daily.size >= 10_000) throw new ApiError('RATE_LIMITED', '잠시 후 다시 요청해 주세요.', 429, true);
    day.count++; this.total.count++; this.daily.set(email, day);
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const challenge: Challenge = { digest: this.digest(email, code), expiresAt: now + 10 * 60_000, nextSendAt: now + 60_000, attempts: 0 };
    this.challenges.set(email, challenge);
    this.cooldowns.set(email, challenge.nextSendAt);
    try { this.persist(); } catch (error) { if (previous) this.restore(previous); throw error; }
    try { await this.sender(email, code); }
    catch {
      if (this.challenges.get(email) === challenge) this.challenges.delete(email);
      this.cooldowns.delete(email);
      this.persist();
      throw new ApiError('EMAIL_DELIVERY_FAILED', '인증 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.', 503, true);
    }
  }

  verify(rawEmail: unknown, rawCode: unknown): boolean {
    const email = normalizeEmail(rawEmail);
    if (!email || typeof rawCode !== 'string' || !/^\d{6}$/.test(rawCode)) return false;
    const challenge = this.challenges.get(email);
    if (!challenge) return false;
    const previous = this.persistence ? this.snapshot() : null;
    if (challenge.expiresAt <= this.now()) {
      this.challenges.delete(email);
      try { this.persist(); } catch (error) { if (previous) this.restore(previous); throw error; }
      return false;
    }
    challenge.attempts++;
    const matches = timingSafeEqual(challenge.digest, this.digest(email, rawCode));
    if (matches || challenge.attempts >= 5) this.challenges.delete(email);
    try { this.persist(); } catch (error) { if (previous) this.restore(previous); throw error; }
    return matches;
  }
}

export function resendSender(apiKey: string | undefined, from: string | undefined, fetchImpl: typeof fetch = fetch): VerificationSender | null {
  if (!apiKey?.trim() || !from?.trim()) return null;
  return async (email, code) => {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject: '티켓레이더 이메일 인증번호', text: `인증번호: ${code}\n10분 안에 입력해 주세요.` }),
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('Email delivery failed');
  };
}

export function gmailSender(user: string | undefined, appPassword: string | undefined, transportFactory = nodemailer.createTransport): VerificationSender | null {
  const address = user?.trim();
  const password = appPassword?.replace(/\s/g, '');
  if (!address || !password) return null;
  const transport = transportFactory({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: address, pass: password }, connectionTimeout: 15_000, greetingTimeout: 10_000, socketTimeout: 20_000 });
  return async (email, code) => {
    await transport.sendMail({ from: address, to: email, subject: '티켓레이더 이메일 인증번호', text: `인증번호: ${code}\n10분 안에 입력해 주세요.` });
  };
}

/** Gmail API 발송 어댑터. OAuth 비밀값과 토큰은 서버 환경에서만 사용하며 로그에 남기지 않는다. */
export function gmailApiSender(clientId: string | undefined, clientSecret: string | undefined, refreshToken: string | undefined, from: string | undefined, fetchImpl: typeof fetch = fetch): VerificationSender | null {
  const sender = normalizeEmail(from);
  if (!clientId?.trim() || !clientSecret?.trim() || !refreshToken?.trim() || !sender) return null;
  return async (rawEmail, code) => {
    const recipient = normalizeEmail(rawEmail);
    if (!recipient || !/^\d{6}$/.test(code)) throw new Error('Invalid verification message');
    const params = new URLSearchParams({ client_id: clientId.trim(), client_secret: clientSecret.trim(), refresh_token: refreshToken.trim(), grant_type: 'refresh_token' });
    const tokenResponse = await fetchImpl('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString(),
      signal: AbortSignal.timeout(6_000), redirect: 'manual',
    });
    if (!tokenResponse.ok) throw new Error('Gmail authorization failed');
    let tokenData: unknown;
    try { tokenData = await tokenResponse.json(); } catch { throw new Error('Gmail authorization failed'); }
    const accessToken = tokenData && typeof tokenData === 'object' ? (tokenData as { access_token?: unknown }).access_token : undefined;
    if (typeof accessToken !== 'string' || !accessToken || /[\r\n]/.test(accessToken)) throw new Error('Gmail authorization failed');
    const subject = Buffer.from('티켓레이더 이메일 인증번호', 'utf8').toString('base64');
    const content = Buffer.from(`인증번호: ${code}\n10분 안에 입력해 주세요.`, 'utf8').toString('base64');
    const message = [`From: ${sender}`, `To: ${recipient}`, `Subject: =?UTF-8?B?${subject}?=`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', content].join('\r\n');
    const response = await fetchImpl('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: Buffer.from(message, 'utf8').toString('base64url') }),
      signal: AbortSignal.timeout(6_000), redirect: 'manual',
    });
    if (!response.ok) throw new Error('Gmail delivery failed');
  };
}

export function verificationSenderFromEnv(env: NodeJS.ProcessEnv): VerificationSender | null {
  const provider = env.EMAIL_PROVIDER?.trim() || 'resend';
  if (provider === 'gmail') return gmailSender(env.GMAIL_USER, env.GMAIL_APP_PASSWORD);
  if (provider === 'gmail-api') return gmailApiSender(env.GMAIL_OAUTH_CLIENT_ID, env.GMAIL_OAUTH_CLIENT_SECRET, env.GMAIL_OAUTH_REFRESH_TOKEN, env.GMAIL_USER);
  if (provider === 'resend') return resendSender(env.RESEND_API_KEY, env.RESEND_FROM);
  return null;
}
