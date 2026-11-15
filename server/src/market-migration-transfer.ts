import type { MigrationSummary } from './market-migration.ts';
import { withLockedMarketSnapshot } from './market-file-migration.ts';

function bridgeEndpoint(bridgeUrl: string, token: string): URL {
  const url = new URL(bridgeUrl);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.pathname !== '/migrate' || url.search || url.hash || url.username || url.password) throw new Error('Invalid local migration bridge');
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(token)) throw new Error('Invalid migration token');
  return url;
}

/** Only a locally hosted, authenticated bridge may receive a private snapshot. */
export async function transferMarketSnapshot(raw: string, summary: MigrationSummary, bridgeUrl: string, token: string, fetchImpl: typeof fetch = fetch): Promise<'copied' | 'already-present'> {
  const url = bridgeEndpoint(bridgeUrl, token);
  const response = await fetchImpl(url, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: raw, redirect: 'manual', signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error('Migration bridge rejected the request');
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new Error('Invalid migration response'); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid migration response');
  const result = payload as { outcome?: unknown; summary?: Partial<MigrationSummary> };
  if ((result.outcome !== 'copied' && result.outcome !== 'already-present') || !result.summary ||
      (Object.keys(summary) as (keyof MigrationSummary)[]).some(key => summary[key] !== result.summary?.[key])) throw new Error('Migration result did not match the source');
  return result.outcome;
}

/** Compare only digest and counts; no account details leave the protected store. */
export async function verifyRemoteMarketSnapshot(bridgeUrl: string, token: string, expected: MigrationSummary | null, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const url = bridgeEndpoint(bridgeUrl, token); url.pathname = '/verify';
  const response = await fetchImpl(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` }, redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error('Migration target verification failed');
  let data: unknown;
  try { data = await response.json(); } catch { throw new Error('Invalid verification response'); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.hasOwn(data, 'summary')) throw new Error('Invalid verification response');
  const actual = (data as { summary: Partial<MigrationSummary> | null }).summary;
  if (expected === null) return actual === null;
  return !!actual && typeof actual === 'object' && (Object.keys(expected) as (keyof MigrationSummary)[]).every(key => expected[key] === actual[key]);
}

/** Does not switch traffic; the caller must stop all older and other writers first. */
export function transferLockedMarketFile(file: string, backup: string, bridgeUrl: string, token: string, fetchImpl: typeof fetch = fetch) {
  return withLockedMarketSnapshot(file, backup, async (raw, summary) => ({
    outcome: await transferMarketSnapshot(raw, summary, bridgeUrl, token, fetchImpl), summary,
  }));
}
