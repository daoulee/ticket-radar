import { createHash } from 'node:crypto';
import { ApiError } from './errors.ts';

export interface RequestLimitPersistence { load(): string | null; save(value: string): void }
type Entry = { count: number; until: number };

/** A per-operation request limit; persisted keys are digests, never raw IP addresses. */
export class RequestLimiter {
  private entries = new Map<string, Entry>();
  private readonly now: () => number;
  private readonly persistence: RequestLimitPersistence | null;
  private readonly capacity: number;
  constructor(now: () => number = Date.now, persistence: RequestLimitPersistence | null = null, capacity = 10_000) {
    this.now = now; this.persistence = persistence; this.capacity = capacity;
    if (persistence) try { const raw = persistence.load(); if (raw !== null) this.restore(raw); }
    catch { throw new ApiError('RATE_STORE_ERROR', '요청 제한 정보를 읽지 못했어요.', 503, true); }
  }
  private snapshot() { return JSON.stringify({ version: 1, entries: [...this.entries] }); }
  private restore(raw: string) {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid rate store');
    const v = value as { version?: unknown; entries?: unknown };
    if (v.version !== 1 || !Array.isArray(v.entries) || v.entries.length > this.capacity) throw new Error('Invalid rate store');
    const next = new Map<string, Entry>();
    for (const item of v.entries) {
      if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== 'string' || !/^[a-f0-9]{64}$/.test(item[0]) || next.has(item[0]) || !item[1] || typeof item[1] !== 'object' || !Number.isSafeInteger(item[1].count) || item[1].count < 1 || !Number.isSafeInteger(item[1].until) || item[1].until < 0) throw new Error('Invalid rate store');
      next.set(item[0], { count: item[1].count, until: item[1].until });
    }
    this.entries = next;
  }
  consume(key: string, max: number, windowMs = 60_000) {
    const previous = this.persistence ? this.snapshot() : '';
    const now = this.now();
    for (const [k, entry] of this.entries) if (entry.until <= now) this.entries.delete(k);
    const digest = createHash('sha256').update(key).digest('hex');
    const current = this.entries.get(digest);
    if (current && current.count >= max) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
    if (!current && this.entries.size >= this.capacity) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
    this.entries.set(digest, current ? { ...current, count: current.count + 1 } : { count: 1, until: now + windowMs });
    if (this.persistence) try { this.persistence.save(this.snapshot()); }
    catch { this.restore(previous); throw new ApiError('RATE_STORE_ERROR', '요청 제한 정보를 저장하지 못했어요.', 503, true); }
  }
}
