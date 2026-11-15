import { ApiError } from './errors.ts';
import { normalizeEmail } from './email-identity.ts';
import { createHash } from 'node:crypto';

// 계정(식별자)별 로그인 실패 잠금(WEB-020). IP를 바꿔 가며 같은 계정에 비밀번호를 대입하는 것을 막는다.
// 계정이 실제로 있는지와 관계없이 같은 규칙을 적용해, 잠금 여부로 가입 여부가 드러나지 않게 한다.
type Entry = { failures: number; windowEnd: number; lockedUntil: number };
export interface LoginGuardPersistence { load(): string | null; save(serialized: string): void }

export class LoginGuard {
  private readonly entries = new Map<string, Entry>();
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly lockMs: number;
  private readonly now: () => number;
  private readonly maxEntries: number;
  private readonly persistence: LoginGuardPersistence | null;
  constructor(maxFailures = 5, windowMs = 15 * 60_000, lockMs = 15 * 60_000, now: () => number = Date.now, maxEntries = 10_000, persistence: LoginGuardPersistence | null = null) {
    this.maxFailures = maxFailures; this.windowMs = windowMs; this.lockMs = lockMs; this.now = now; this.maxEntries = maxEntries;
    this.persistence = persistence;
    if (persistence) try { const raw = persistence.load(); if (raw !== null) this.restore(raw); }
    catch { throw new ApiError('LOGIN_STORE_ERROR', '로그인 보호 정보를 읽지 못했어요.', 503, true); }
  }

  private storedKey(key: string) { return this.persistence ? createHash('sha256').update(key).digest('hex') : key; }
  private snapshot() { return JSON.stringify({ version: 1, entries: [...this.entries] }); }
  private restore(raw: string) {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid login store');
    const v = data as { version?: unknown; entries?: unknown };
    if (v.version !== 1 || !Array.isArray(v.entries) || v.entries.length > this.maxEntries) throw new Error('Invalid login store');
    const parsed: [string, Entry][] = [];
    for (const item of v.entries) {
      if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== 'string' || !/^[a-f0-9]{64}$/.test(item[0]) || !item[1] || typeof item[1] !== 'object') throw new Error('Invalid login store');
      const entry = item[1] as Record<string, unknown>;
      if (!['failures', 'windowEnd', 'lockedUntil'].every(key => Number.isSafeInteger(entry[key]) && (entry[key] as number) >= 0)) throw new Error('Invalid login store');
      parsed.push([item[0], entry as Entry]);
    }
    if (new Set(parsed.map(([key]) => key)).size !== parsed.length) throw new Error('Invalid login store');
    this.entries.clear(); for (const [key, entry] of parsed) this.entries.set(key, entry);
  }
  private persist(previous: string) {
    if (!this.persistence) return;
    try { this.persistence.save(this.snapshot()); }
    catch { this.restore(previous); throw new ApiError('LOGIN_STORE_ERROR', '로그인 보호 정보를 저장하지 못했어요.', 503, true); }
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
    const e = this.entries.get(this.storedKey(key));
    if (e && e.lockedUntil > this.now()) {
      throw new ApiError('LOGIN_LOCKED', '로그인 시도가 너무 많아요. 15분 뒤 다시 시도해 주세요.', 429, true);
    }
  }

  fail(key: string | null) {
    if (!key) return;
    const previous = this.persistence ? this.snapshot() : '';
    key = this.storedKey(key);
    const now = this.now();
    if (this.entries.size >= this.maxEntries) this.prune(now);
    let e = this.entries.get(key);
    if (!e || e.windowEnd <= now) e = { failures: 0, windowEnd: now + this.windowMs, lockedUntil: 0 };
    e.failures++;
    if (e.failures >= this.maxFailures) { e.lockedUntil = now + this.lockMs; e.failures = 0; e.windowEnd = now + this.lockMs; }
    if (this.entries.size < this.maxEntries || this.entries.has(key)) this.entries.set(key, e);
    this.persist(previous);
  }

  success(key: string | null) {
    if (!key) return;
    const previous = this.persistence ? this.snapshot() : '';
    if (this.entries.delete(this.storedKey(key))) this.persist(previous);
  }
}
