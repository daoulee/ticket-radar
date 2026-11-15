import { openLockedMarketSnapshot } from './market-file-migration.ts';
import { transferMarketSnapshot } from './market-migration-transfer.ts';
import type { MigrationSummary } from './market-migration.ts';

type Phase = 'locked' | 'checking' | 'ready' | 'finalizing' | 'closed';

/**
 * The lock remains present after errors and after verification. The operator must
 * stop every incompatible writer before opening, and explicitly resolve traffic
 * before releasing it. This module does not change production traffic itself.
 */
export function openMarketCutoverSession(file: string, backup: string) {
  const snapshot = openLockedMarketSnapshot(file, backup);
  let phase: Phase = 'locked';
  return {
    get phase() { return phase; },
    summary: snapshot.summary,
    async prepare(bridgeUrl: string, token: string, verifyDestination: (summary: MigrationSummary) => Promise<boolean>, fetchImpl: typeof fetch = fetch) {
      if (phase !== 'locked') throw new Error('Invalid cutover phase');
      phase = 'checking';
      try {
        snapshot.assertUnchanged();
        const outcome = await transferMarketSnapshot(snapshot.raw, snapshot.summary, bridgeUrl, token, fetchImpl);
        snapshot.assertUnchanged();
        if (!await verifyDestination(snapshot.summary)) throw new Error('Destination verification failed');
        snapshot.assertUnchanged();
        phase = 'ready';
        return { outcome, summary: snapshot.summary };
      } catch (error) { phase = 'locked'; throw error; }
    },
    async releaseAfterCutover(sourceStopped: () => Promise<boolean>) {
      if (phase !== 'ready') throw new Error('Cutover is not ready');
      phase = 'finalizing';
      try {
        snapshot.assertUnchanged();
        if (!await sourceStopped()) throw new Error('Source shutdown not confirmed');
        snapshot.assertUnchanged();
        snapshot.release(); phase = 'closed';
      } catch (error) { phase = 'ready'; throw error; }
    },
    async abort(sourceSafeToResume: () => Promise<boolean>) {
      if (phase !== 'locked' && phase !== 'ready') throw new Error('Invalid cutover phase');
      const previous = phase; phase = 'finalizing';
      try {
        if (!await sourceSafeToResume()) throw new Error('Source recovery not confirmed');
        snapshot.release(); phase = 'closed';
      } catch (error) { phase = previous; throw error; }
    },
  };
}
