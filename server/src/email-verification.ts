import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.ts';
import { normalizeEmail } from './email-identity.ts';
import nodemailer from 'nodemailer';

export type VerificationSender = (email: string, code: string) => Promise<void>;
type Challenge = { digest: Buffer; expiresAt: number; nextSendAt: number; attempts: number };

export class EmailVerification {
  private readonly challenges = new Map<string, Challenge>();
  private readonly cooldowns = new Map<string, number>();
  // 일일 발송 상한(WEB-020): 남의 메일함 괴롭힘·발송 계정 한도 소진 방지. 주소당 하루 5통, 서버 전체 하루 dailyTotal통.
  private readonly daily = new Map<string, { count: number; until: number }>();
  private total = { count: 0, until: 0 };
  private readonly perAddressDaily: number;
  private readonly dailyTotal: number;
  private readonly secret = randomBytes(32);
  private readonly sender: VerificationSender | null;
  private readonly now: () => number;

  constructor(sender: VerificationSender | null, now: () => number = Date.now, limits: { perAddressDaily?: number; dailyTotal?: number } = {}) {
    this.sender = sender;
    this.now = now;
    this.perAddressDaily = limits.perAddressDaily ?? 5;
    this.dailyTotal = limits.dailyTotal ?? 300;
  }

  private digest(email: string, code: string) {
    return createHmac('sha256', this.secret).update(email).update('\0').update(code).digest();
  }

  async send(rawEmail: unknown): Promise<void> {
    const email = normalizeEmail(rawEmail);
    if (!email) throw new ApiError('BAD_REQUEST', '이메일 주소를 확인해 주세요.');
    if (!this.sender) throw new ApiError('EMAIL_NOT_CONFIGURED', '이메일 인증이 아직 설정되지 않았어요.', 503, true);
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
    try { await this.sender(email, code); }
    catch {
      if (this.challenges.get(email) === challenge) this.challenges.delete(email);
      this.cooldowns.delete(email);
      throw new ApiError('EMAIL_DELIVERY_FAILED', '인증 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.', 503, true);
    }
  }

  verify(rawEmail: unknown, rawCode: unknown): boolean {
    const email = normalizeEmail(rawEmail);
    if (!email || typeof rawCode !== 'string' || !/^\d{6}$/.test(rawCode)) return false;
    const challenge = this.challenges.get(email);
    if (!challenge) return false;
    if (challenge.expiresAt <= this.now()) { this.challenges.delete(email); return false; }
    challenge.attempts++;
    const matches = timingSafeEqual(challenge.digest, this.digest(email, rawCode));
    if (matches || challenge.attempts >= 5) this.challenges.delete(email);
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

export function verificationSenderFromEnv(env: NodeJS.ProcessEnv): VerificationSender | null {
  const provider = env.EMAIL_PROVIDER?.trim() || 'resend';
  if (provider === 'gmail') return gmailSender(env.GMAIL_USER, env.GMAIL_APP_PASSWORD);
  if (provider === 'resend') return resendSender(env.RESEND_API_KEY, env.RESEND_FROM);
  return null;
}
