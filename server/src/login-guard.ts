import { ApiError } from './errors.ts';
import { normalizeEmail } from './email-identity.ts';

// 계정(식별자)별 로그인 실패 잠금(WEB-020). IP를 바꿔 가며 같은 계정에 비밀번호를 대입하는 것을 막는다.
// 계정이 실제로 있는지와 관계없이 같은 규칙을 적용해, 잠금 여부로 가입 여부가 드러나지 않게 한다.
type Entry = { failures: number; windowEnd: number; lockedUntil: number };

export class LoginGuard {
  private readonly entries = new Map<string, Entry>();
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly lockMs: number;
  private readonly now: () => number;
  private readonly maxEntries: number;
  constructor(maxFailures = 5, windowMs = 15 * 60_000, lockMs = 15 * 60_000, now: () => number = Date.now, maxEntries = 10_000) {
    this.maxFailures = maxFailures; this.windowMs = windowMs; this.lockMs = lockMs; this.now = now; this.maxEntries = maxEntries;
  }

  /** 로그인 요청 본문에서 잠금 기준 식별자를 만든다(이메일 우선, 없으면 닉네임). 없으면 null. */
  static keyOf(raw: unknown): string | null {
    const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    if (Object.hasOwn(b, 'email')) { const e = normalizeEmail(b.email); return e ? `email:${e}` : null; }
    const name = typeof b.name === 'string' ? b.name.trim().toLowerCase() : '';
    return name && name.length <= 100 ? `name:${name}` : null;
  }

  private prune(now: number) {
    for (const [k, e] of this.entries) if (e.lockedUntil <= now && e.windowEnd <= now) this.entries.delete(k);
  }

  /** 잠겨 있으면 429를 던진다. */
  check(key: string | null) {
    if (!key) return;
    const e = this.entries.get(key);
    if (e && e.lockedUntil > this.now()) {
      throw new ApiError('LOGIN_LOCKED', '로그인 시도가 너무 많아요. 15분 뒤 다시 시도해 주세요.', 429, true);
    }
  }

  fail(key: string | null) {
    if (!key) return;
    const now = this.now();
    if (this.entries.size >= this.maxEntries) this.prune(now);
    let e = this.entries.get(key);
    if (!e || e.windowEnd <= now) e = { failures: 0, windowEnd: now + this.windowMs, lockedUntil: 0 };
    e.failures++;
    if (e.failures >= this.maxFailures) { e.lockedUntil = now + this.lockMs; e.failures = 0; e.windowEnd = now + this.lockMs; }
    if (this.entries.size < this.maxEntries || this.entries.has(key)) this.entries.set(key, e);
  }

  success(key: string | null) { if (key) this.entries.delete(key); }
}
