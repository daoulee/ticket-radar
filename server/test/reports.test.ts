import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { ApiError } from '../src/errors.ts';
import { accountsFromEnv, maskContacts, parseReportRequest, ReportService } from '../src/reports.ts';
import { entry, listing } from './helpers.ts';

const hasCode = (code: string) => (e: unknown) => e instanceof ApiError && e.code === code;
const EV = entry.event.id;
const known = new Set([EV]);
const ACCOUNTS = `akmu-demo:test-code-aaaa:${EV};other-demo:test-code-bbbb:other-event`;
const body = (over: Record<string, unknown> = {}) => ({
  clientRequestId: '11111111-2222-4333-8444-555555555555', eventId: EV, consent: true,
  listingText: `${listing} 연락 010-1234-5678, 계좌 110-123-456789`, listingUrl: 'https://example.com/post/1', listingPrice: 250000,
  description: '카톡 아이디: seller99 로 연락하래요', findings: [{ title: '수령 조건 확인 필요', status: 'needs_check', listingQuote: 'QR 캡처 전달', officialExcerpt: '본인 확인', sourceUrl: 'https://example.com/notice' }],
  ...over,
});

test('report request: consent, uuid, known event, url scheme and masking are enforced', () => {
  assert.throws(() => parseReportRequest(body({ consent: false }), known), hasCode('CONSENT_REQUIRED'));
  assert.throws(() => parseReportRequest(body({ clientRequestId: 'x' }), known), hasCode('BAD_REQUEST'));
  assert.throws(() => parseReportRequest(body({ eventId: 'nope' }), known), hasCode('EVENT_NOT_FOUND'));
  assert.throws(() => parseReportRequest(body({ listingUrl: 'file:///etc/passwd' }), known), hasCode('BAD_REQUEST'));
  assert.throws(() => parseReportRequest(body({ listingPrice: -1 }), known), hasCode('BAD_REQUEST'));
  assert.throws(() => parseReportRequest(body({ extra: 1 }), known), hasCode('BAD_REQUEST'));
  const r = parseReportRequest(body(), known);
  assert.ok(!r.listingExcerpt.includes('010-1234-5678') && !r.listingExcerpt.includes('110-123-456789'));
  assert.ok(!r.description.includes('seller99'));
  assert.equal(maskContacts('메일 a@b.co 링크 https://x.y/z'), '메일 ●●●● 링크 ●●●●');
});

test('reports: duplicate clientRequestId returns the first report; file store is private and reloads', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aid-reports-'));
  const file = join(dir, 'var', 'reports.json');
  const svc = new ReportService(accountsFromEnv(ACCOUNTS), file);
  const a = svc.create(parseReportRequest(body(), known));
  const b = svc.create(parseReportRequest(body(), known));
  assert.equal(a.duplicate, false); assert.equal(b.duplicate, true); assert.equal(a.report.id, b.report.id);
  assert.equal(statSync(file).mode & 0o777, 0o600);
  assert.ok(!readFileSync(file, 'utf8').includes('010-1234-5678'));
  const reloaded = new ReportService(accountsFromEnv(ACCOUNTS), file);
  const { token } = reloaded.login({ accountId: 'akmu-demo', code: 'test-code-aaaa' });
  assert.ok(token);
});

test('organizer: login, event scoping, hidden other-event reports, audit history, export without memo', () => {
  const svc = new ReportService(accountsFromEnv(ACCOUNTS));
  const { report } = svc.create(parseReportRequest(body(), known));
  assert.throws(() => svc.login({ accountId: 'akmu-demo', code: 'wrong-code-xx' }), hasCode('INVALID_CREDENTIALS'));
  assert.throws(() => svc.login({ accountId: 'other-demo', code: 'test-code-aaaa' }), hasCode('INVALID_CREDENTIALS'));
  const [akmu, other] = accountsFromEnv(ACCOUNTS);
  assert.equal(svc.list(akmu, EV).length, 1);
  assert.throws(() => svc.list(other, EV), hasCode('FORBIDDEN_EVENT'));
  assert.throws(() => svc.get(other, report.id), hasCode('REPORT_NOT_FOUND'));
  svc.update(akmu, report.id, { status: 'reviewing', memo: '예매처 확인 요청 010-9999-8888' });
  const r = svc.get(akmu, report.id);
  assert.deepEqual(r.history.map(h => h.action), ['created', 'status', 'memo']);
  assert.equal(r.history[1].from, 'received'); assert.equal(r.history[1].to, 'reviewing'); assert.equal(r.history[1].actor, 'akmu-demo');
  assert.ok(!r.memo.includes('010-9999-8888'));
  assert.throws(() => svc.update(akmu, report.id, { status: 'deleted' }), hasCode('BAD_REQUEST'));
  assert.throws(() => svc.update(akmu, report.id, { eventId: 'x' }), hasCode('BAD_REQUEST'));
  const text = svc.exportText(akmu, report.id);
  assert.match(text, /자동 제출하지 않았습니다/); assert.ok(!text.includes('예매처 확인 요청'));
  assert.throws(() => new ReportService().login({ accountId: 'a', code: 'b' }), hasCode('ORGANIZER_NOT_CONFIGURED'));
  assert.throws(() => accountsFromEnv('bad'), hasCode('INVALID_ORGANIZER_CONFIG'));
});

test('organizer sessions expire after two hours', () => {
  let now = 1_000_000;
  const svc = new ReportService(accountsFromEnv(ACCOUNTS), null, () => now);
  const { token } = svc.login({ accountId: 'akmu-demo', code: 'test-code-aaaa' });
  const req = { headers: { authorization: `Bearer ${token}` } } as any;
  assert.equal(svc.authorize(req).id, 'akmu-demo');
  now += 2 * 3600_000 + 1;
  assert.throws(() => svc.authorize(req), hasCode('UNAUTHORIZED'));
});

test('HTTP: fan report → organizer inbox round trip with permissions and logout', async () => {
  const server = createApi(new CheckService(), undefined, undefined, new ReportService(accountsFromEnv(ACCOUNTS)));
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const json = (method: string, path: string, data?: unknown, token?: string) => fetch(base + path, { method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  try {
    const created = await json('POST', '/reports', body());
    assert.equal(created.status, 201);
    const { reportId } = await created.json() as any;
    assert.equal((await json('POST', '/reports', body())).status, 200);
    assert.equal((await json('GET', `/organizer/reports?event_id=${EV}`)).status, 401);
    const login = await (await json('POST', '/organizer/login', { accountId: 'akmu-demo', code: 'test-code-aaaa' })).json() as any;
    const list = await (await json('GET', `/organizer/reports?event_id=${encodeURIComponent(EV)}`, undefined, login.token)).json() as any[];
    assert.equal(list.length, 1); assert.equal(list[0].id, reportId);
    const patched = await (await json('PATCH', `/organizer/reports/${reportId}`, { status: 'resolved' }, login.token)).json() as any;
    assert.equal(patched.status, 'resolved');
    const exp = await (await json('GET', `/organizer/reports/${reportId}/export`, undefined, login.token)).json() as any;
    assert.equal(exp.format, 'text');
    const other = await (await json('POST', '/organizer/login', { accountId: 'other-demo', code: 'test-code-bbbb' })).json() as any;
    assert.equal((await json('GET', `/organizer/reports?event_id=${encodeURIComponent(EV)}`, undefined, other.token)).status, 403);
    assert.equal((await json('GET', `/organizer/reports/${reportId}`, undefined, other.token)).status, 404);
    assert.equal((await json('POST', '/organizer/logout', {}, login.token)).status, 200);
    assert.equal((await json('GET', `/organizer/reports/${reportId}`, undefined, login.token)).status, 401);
  } finally { await new Promise<void>((r, j) => server.close(e => e ? j(e) : r())); }
});
