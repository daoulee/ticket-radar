import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { acquireMarketFileLock } from './market-file-lock.ts';
import { inspectMigration, type MigrationSummary } from './market-migration.ts';

/**
 * Holds the cooperative writer lock until work finishes. The caller must ensure
 * that older server versions and other non-cooperating writers are stopped.
 * The private backup is never overwritten and remains available on failure.
 */
export function openLockedMarketSnapshot(file: string, backup: string) {
  const release = acquireMarketFileLock(file);
  const digest = (value: string) => createHash('sha256').update(value).digest('hex');
  try {
    const raw = readFileSync(file, 'utf8');
    const summary = inspectMigration(raw);
    writeFileSync(backup, raw, { flag: 'wx', mode: 0o600 });
    if (digest(readFileSync(backup, 'utf8')) !== summary.digest || digest(readFileSync(file, 'utf8')) !== summary.digest) throw new Error('Snapshot changed during backup');
    return {
      raw, summary,
      assertUnchanged: () => { if (digest(readFileSync(file, 'utf8')) !== summary.digest) throw new Error('Source changed during migration; do not switch traffic'); },
      release,
    };
  } catch (error) { release(); throw error; }
}

export async function withLockedMarketSnapshot<T>(file: string, backup: string, work: (raw: string, summary: MigrationSummary) => Promise<T>): Promise<T> {
  const snapshot = openLockedMarketSnapshot(file, backup);
  try {
    const result = await work(snapshot.raw, snapshot.summary);
    snapshot.assertUnchanged();
    return result;
  } finally { snapshot.release(); }
}
