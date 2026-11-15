import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seedState } from '../src/market-core.ts';
import { inspectMigration, migrateToEmptyStore } from '../src/market-migration.ts';
import { acquireMarketFileLock } from '../src/market-file-lock.ts';
import { withLockedMarketSnapshot } from '../src/market-file-migration.ts';
import { MarketService } from '../src/market.ts';
import { transferLockedMarketFile, transferMarketSnapshot, verifyRemoteMarketSnapshot } from '../src/market-migration-transfer.ts';
import { openMarketCutoverSession } from '../src/market-cutover-session.ts';

function syntheticSnapshot() {
  const state = seedState(null, '2026-01-01T00:00:00.000Z');
  state.users.push({ id: 'user-test', name: '테스트', alertsOn: false, favorites: [] });
  state.orders.push({ id: 'order-test', listingId: state.listings[0].id, showId: state.listings[0].showId, buyerId: 'user-test', sellerId: state.listings[0].sellerId, amount: 1000, status: 'sent', history: [], isDemoPayment: true });
  return JSON.stringify({ version: 1, state, credentials: { 'user-test': { salt: 'a'.repeat(32), hash: 'b'.repeat(64), email: 'test@example.test' } } });
}

test('migration preserves the exact snapshot, is idempotent, and refuses to overwrite existing data', () => {
  const raw = syntheticSnapshot(); let stored: string | null = null; let writes = 0;
  const store = { load: () => stored, save: (value: string) => { stored = value; writes++; } };
  const result = migrateToEmptyStore(raw, store);
  assert.equal(result.outcome, 'copied'); assert.equal(stored, raw);
  assert.equal(result.summary.users, 1); assert.equal(result.summary.orders, 1);
  assert.equal(migrateToEmptyStore(raw, store).outcome, 'already-present'); assert.equal(writes, 1);
  const occupied = { load: () => 'existing unrelated data', save: () => { throw new Error('must not write'); } };
  assert.throws(() => migrateToEmptyStore(raw, occupied), /not empty/);
});

test('migration rejects broken references and detects failed storage verification', () => {
  const raw = syntheticSnapshot(); const damaged = JSON.parse(raw);
  damaged.state.orders[0].buyerId = 'missing-user';
  assert.throws(() => inspectMigration(JSON.stringify(damaged)), /Invalid migration order/);
  assert.throws(() => migrateToEmptyStore(raw, { load: () => null, save: () => {} }), /verification failed/);
});

test('snapshot keeps cooperating writers locked through async transfer and keeps a private backup', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-locked-snapshot-'));
  const file = join(dir, 'market.json'), backup = join(dir, 'backup.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  let stored: string | null = null;
  const result = await withLockedMarketSnapshot(file, backup, async (snapshot) => {
    await Promise.resolve();
    assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
    return migrateToEmptyStore(snapshot, { load: () => stored, save: value => { stored = value; } });
  });
  assert.equal(result.outcome, 'copied'); assert.equal(stored, raw);
  assert.equal(readFileSync(backup, 'utf8'), raw); assert.equal(statSync(backup).mode & 0o777, 0o600);
  const release = acquireMarketFileLock(file); release();
  await assert.rejects(withLockedMarketSnapshot(file, backup, async () => {}), { code: 'EEXIST' });
  assert.equal(readFileSync(backup, 'utf8'), raw);
});

test('snapshot detects writes from an incompatible writer and retains backup', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-incompatible-writer-'));
  const file = join(dir, 'market.json'), backup = join(dir, 'backup.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  await assert.rejects(withLockedMarketSnapshot(file, backup, async () => { writeFileSync(file, `${raw} `); }), /Source changed/);
  assert.equal(readFileSync(backup, 'utf8'), raw);
  const recovered = new MarketService(backup);
  assert.equal(recovered.core.state.users.length, 1);
  assert.equal(recovered.core.state.orders.length, 1);
  const release = acquireMarketFileLock(file); release();
});

test('locked migration verifies the exact destination summary and keeps its backup', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-migration-transfer-'));
  const file = join(dir, 'market.json'), backup = join(dir, 'backup.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  const token = 'x'.repeat(43);
  const fakeFetch: typeof fetch = async (url, init) => {
    assert.equal(String(url), 'http://127.0.0.1:31923/migrate');
    assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${token}`);
    assert.equal(init?.redirect, 'manual'); assert.equal(init?.body, raw);
    assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
    return Response.json({ outcome: 'copied', summary: inspectMigration(raw) });
  };
  const result = await transferLockedMarketFile(file, backup, 'http://127.0.0.1:31923/migrate', token, fakeFetch);
  assert.equal(result.outcome, 'copied'); assert.equal(readFileSync(backup, 'utf8'), raw);
});

test('migration refuses nonlocal bridges, redirects and mismatched results', async () => {
  const raw = syntheticSnapshot(), summary = inspectMigration(raw), token = 'x'.repeat(43);
  let calls = 0; const failing: typeof fetch = async () => { calls++; return new Response(null, { status: 302 }); };
  await assert.rejects(transferMarketSnapshot(raw, summary, 'https://example.test/migrate', token, failing), /Invalid local/);
  assert.equal(calls, 0);
  await assert.rejects(transferMarketSnapshot(raw, summary, 'http://127.0.0.1:31923/migrate', token, failing), /rejected/);
  const wrong: typeof fetch = async () => Response.json({ outcome: 'copied', summary: { ...summary, orders: summary.orders + 1 } });
  await assert.rejects(transferMarketSnapshot(raw, summary, 'http://127.0.0.1:31923/migrate', token, wrong), /did not match/);
});

test('target verification compares every count and digest without fetching account contents', async () => {
  const summary = inspectMigration(syntheticSnapshot()), token = 'x'.repeat(43);
  const empty: typeof fetch = async (url, init) => {
    assert.equal(String(url), 'http://127.0.0.1:31923/verify');
    assert.equal(init?.method, 'GET'); assert.equal(init?.redirect, 'manual');
    return Response.json({ summary: null });
  };
  assert.equal(await verifyRemoteMarketSnapshot('http://127.0.0.1:31923/migrate', token, null, empty), true);
  const correct: typeof fetch = async () => Response.json({ summary });
  assert.equal(await verifyRemoteMarketSnapshot('http://127.0.0.1:31923/migrate', token, summary, correct), true);
  const wrong: typeof fetch = async () => Response.json({ summary: { ...summary, users: summary.users + 1 } });
  assert.equal(await verifyRemoteMarketSnapshot('http://127.0.0.1:31923/migrate', token, summary, wrong), false);
  const invalid: typeof fetch = async () => Response.json({});
  await assert.rejects(verifyRemoteMarketSnapshot('http://127.0.0.1:31923/migrate', token, null, invalid), /Invalid verification/);
});

test('cutover retains the writer lock until destination and source shutdown are verified', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-cutover-session-'));
  const file = join(dir, 'market.json'), backup = join(dir, 'backup.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  const session = openMarketCutoverSession(file, backup);
  const fakeFetch: typeof fetch = async () => Response.json({ outcome: 'copied', summary: inspectMigration(raw) });
  await assert.rejects(session.prepare('http://127.0.0.1:31923/migrate', 'x'.repeat(43), async () => false, fakeFetch), /Destination verification failed/);
  assert.equal(session.phase, 'locked');
  assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
  await session.prepare('http://127.0.0.1:31923/migrate', 'x'.repeat(43), async () => true, fakeFetch);
  assert.equal(session.phase, 'ready');
  await assert.rejects(session.releaseAfterCutover(async () => false), /Source shutdown not confirmed/);
  assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
  await session.releaseAfterCutover(async () => true);
  assert.equal(session.phase, 'closed');
  const release = acquireMarketFileLock(file); release();
});

test('cutover serializes preparation and requires recovery confirmation before abort', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-cutover-abort-'));
  const file = join(dir, 'market.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  const session = openMarketCutoverSession(file, join(dir, 'backup.json'));
  let resolveFetch!: (response: Response) => void;
  const waiting: typeof fetch = () => new Promise<Response>(resolve => { resolveFetch = resolve; });
  const preparing = session.prepare('http://127.0.0.1:31923/migrate', 'x'.repeat(43), async () => true, waiting);
  await assert.rejects(session.abort(async () => true), /Invalid cutover phase/);
  await assert.rejects(session.prepare('http://127.0.0.1:31923/migrate', 'x'.repeat(43), async () => true, waiting), /Invalid cutover phase/);
  resolveFetch(Response.json({ outcome: 'copied', summary: inspectMigration(raw) }));
  await preparing;
  await assert.rejects(session.abort(async () => false), /Source recovery not confirmed/);
  assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
  await session.abort(async () => true);
  const release = acquireMarketFileLock(file); release();
});

test('cutover refuses to release when the original changes after verification', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-cutover-source-change-'));
  const file = join(dir, 'market.json'), raw = syntheticSnapshot();
  writeFileSync(file, raw, { mode: 0o600 });
  const session = openMarketCutoverSession(file, join(dir, 'backup.json'));
  const fakeFetch: typeof fetch = async () => Response.json({ outcome: 'copied', summary: inspectMigration(raw) });
  await session.prepare('http://127.0.0.1:31923/migrate', 'x'.repeat(43), async () => true, fakeFetch);
  writeFileSync(file, `${raw} `);
  await assert.rejects(session.releaseAfterCutover(async () => true), /Source changed/);
  assert.throws(() => acquireMarketFileLock(file), { code: 'EEXIST' });
  await session.abort(async () => true);
});
