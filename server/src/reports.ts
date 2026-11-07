import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { IncomingMessage } from 'node:http';
import { ApiError } from './errors.ts';

// 제보 저장과 주최 측 제보함(기획 명세 4·7·8절 P0, 사용자 지시 2026-11-03 "나머지도 전부 구현").
// - 팬: 확인한 내용만 제출한다(동의 필수). 서버도 연락처를 다시 가리고 URL은 글자로만 보관한다(가져오지 않음).
// - 주최 측: 시연용 담당 계정(환경 변수로만 설정, 코드·기록에 비밀 코드 없음)이 배정된 공연의 제보만 본다.
// - 상태·메모 변경은 감사 기록(history)에 남는다. 정부 신고센터 자동 제출·플랫폼 삭제는 하지 않는다.

export const REPORT_STATUSES = ['received', 'reviewing', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface ReportFinding { title: string; status: string; listingQuote: string | null; officialExcerpt: string | null; sourceUrl: string | null }
export interface ReportHistory { at: string; actor: string; action: 'created' | 'status' | 'memo'; from?: string; to?: string }
export interface Report {
  id: string; eventId: string; createdAt: string; status: ReportStatus;
  listingUrl: string | null; listingExcerpt: string; listingPrice: number | null; description: string;
  checkId: string | null; findings: ReportFinding[]; isDemo: boolean; memo: string; history: ReportHistory[];
  clientRequestId: string;
}
export interface OrganizerAccount { id: string; eventIds: string[]; codeHash: Buffer }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest();

// 앱 reportDoc.maskContacts 와 같은 기준. 서버가 한 번 더 가린다(클라이언트를 믿지 않음).
export function maskContacts(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, '●●●●')
    .replace(/open\.kakao\.com\/\S+/gi, '●●●●')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '●●●●')
    .replace(/(?:\+?82[-\s]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g, '●●●●')
    .replace(/\d{2,6}-\d{2,6}-\d{2,8}/g, '●●●●') // 계좌번호 형태
    .replace(/\d(?:[\s.-]?\d){9,15}/g, '●●●●') // 구분자 없는·띄어 쓴 계좌번호(10~16자리, 검토 지적 5)
    .replace(/((?:카톡|카카오톡|오픈채팅|텔레그램|라인)\s*(?:ID|아이디|id)?\s*[:：]?\s*)[\w.-]{3,}/g, '$1●●●●');
}

function str(v: unknown, field: string, max: number, required = false): string {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ApiError('BAD_REQUEST', `${field} 값이 필요합니다.`);
    return '';
  }
  if (typeof v !== 'string' || v.length > max) throw new ApiError('BAD_REQUEST', `${field} 형식·길이를 확인하세요.`);
  return v.trim();
}
function optUrl(v: unknown): string | null {
  const s = str(v, 'listingUrl', 500);
  if (!s) return null;
  let u: URL;
  try { u = new URL(s); } catch { throw new ApiError('BAD_REQUEST', '판매글 주소 형식이 올바르지 않습니다.'); }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new ApiError('BAD_REQUEST', '판매글 주소는 http/https 주소만 받을 수 있습니다.');
  return u.toString();
}

/** 제보 요청 검증. 반환값은 서버가 저장할 형태(가림 처리 후). */
export function parseReportRequest(raw: unknown, knownEventIds: Set<string>) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ApiError('BAD_REQUEST', '제보 형식이 올바르지 않습니다.');
  const b = raw as Record<string, unknown>;
  const allowed = new Set(['clientRequestId', 'eventId', 'listingUrl', 'listingText', 'listingPrice', 'description', 'checkId', 'findings', 'isDemo', 'consent']);
  for (const k of Object.keys(b)) if (!allowed.has(k)) throw new ApiError('BAD_REQUEST', `알 수 없는 항목: ${k}`);
  if (b.consent !== true) throw new ApiError('CONSENT_REQUIRED', '제출 내용 확인·동의가 필요합니다.');
  if (typeof b.clientRequestId !== 'string' || !UUID.test(b.clientRequestId)) throw new ApiError('BAD_REQUEST', 'clientRequestId(UUID)가 필요합니다.');
  const eventId = str(b.eventId, 'eventId', 200, true);
  if (!knownEventIds.has(eventId)) throw new ApiError('EVENT_NOT_FOUND', '선택한 공연을 찾을 수 없습니다.', 404);
  const listingText = str(b.listingText, 'listingText', 3000, true);
  const description = str(b.description, 'description', 1000);
  let listingPrice: number | null = null;
  if (b.listingPrice !== undefined && b.listingPrice !== null) {
    if (typeof b.listingPrice !== 'number' || !Number.isSafeInteger(b.listingPrice) || b.listingPrice <= 0) throw new ApiError('BAD_REQUEST', '판매가는 양의 정수(원)입니다.');
    listingPrice = b.listingPrice;
  }
  let checkId: string | null = null;
  if (b.checkId !== undefined && b.checkId !== null) {
    if (typeof b.checkId !== 'string' || !UUID.test(b.checkId)) throw new ApiError('BAD_REQUEST', 'checkId 형식이 올바르지 않습니다.');
    checkId = b.checkId;
  }
  const rawFindings = b.findings === undefined ? [] : b.findings;
  if (!Array.isArray(rawFindings) || rawFindings.length > 12) throw new ApiError('BAD_REQUEST', '확인 항목은 12개까지입니다.');
  const findings: ReportFinding[] = rawFindings.map((f) => {
    if (!f || typeof f !== 'object') throw new ApiError('BAD_REQUEST', '확인 항목 형식이 올바르지 않습니다.');
    const o = f as Record<string, unknown>;
    const nullable = (v: unknown, name: string, max: number) => (v === null || v === undefined ? null : maskContacts(str(v, name, max)) || null);
    let sourceUrl: string | null = null;
    if (o.sourceUrl) { try { sourceUrl = optUrl(o.sourceUrl); } catch { sourceUrl = null; } }
    return { title: maskContacts(str(o.title, 'title', 200, true)), status: str(o.status, 'status', 40, true),
      listingQuote: nullable(o.listingQuote, 'listingQuote', 500), officialExcerpt: nullable(o.officialExcerpt, 'officialExcerpt', 1000), sourceUrl };
  });
  if (b.isDemo !== undefined && typeof b.isDemo !== 'boolean') throw new ApiError('BAD_REQUEST', 'isDemo 형식이 올바르지 않습니다.');
  return {
    clientRequestId: b.clientRequestId.toLowerCase(), eventId, listingUrl: optUrl(b.listingUrl),
    listingExcerpt: maskContacts(listingText).slice(0, 1000), listingPrice, description: maskContacts(description),
    checkId, findings, isDemo: b.isDemo === true,
  };
}

/** ORGANIZER_ACCOUNTS="계정:비밀코드:공연ID,공연ID;계정2:코드2:공연ID" — 서버 .env 에만 둔다. */
export function accountsFromEnv(value: string | undefined): OrganizerAccount[] {
  if (!value?.trim()) return [];
  return value.split(';').map(s => s.trim()).filter(Boolean).map((entry) => {
    const [id, code, events] = entry.split(':');
    if (!id || !/^[a-z0-9-]{3,40}$/.test(id) || !code || code.length < 8 || !events) throw new ApiError('INVALID_ORGANIZER_CONFIG', 'ORGANIZER_ACCOUNTS 형식(계정:8자 이상 코드:공연ID)을 확인하세요.', 500);
    return { id, codeHash: sha(code), eventIds: events.split(',').map(e => e.trim()).filter(Boolean) };
  });
}

interface Session { accountId: string; expiresAt: number }

export class ReportService {
  private readonly reports = new Map<string, Report>();
  private readonly byClientRequest = new Map<string, string>();
  private readonly sessions = new Map<string, Session>();
  private readonly accounts: OrganizerAccount[];
  private readonly file: string | null;
  private readonly now: () => number;

  constructor(accounts: OrganizerAccount[] = [], file: string | null = null, now: () => number = Date.now) {
    this.accounts = accounts; this.file = file; this.now = now;
    if (file) {
      try {
        const saved = JSON.parse(readFileSync(file, 'utf8')) as Report[];
        for (const r of saved) { this.reports.set(r.id, r); this.byClientRequest.set(r.clientRequestId, r.id); }
      } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw new ApiError('REPORT_STORE_ERROR', '제보 저장소를 읽지 못했습니다.', 500); }
    }
  }
  get organizerConfigured() { return this.accounts.length > 0; }

  private persist() {
    if (!this.file) return;
    try {
      mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 });
      const tmp = `${this.file}.${process.pid}.tmp`;
      (this.writeFile ?? writeFileSync)(tmp, JSON.stringify([...this.reports.values()]), { mode: 0o600 });
      renameSync(tmp, this.file);
    } catch {
      throw new ApiError('REPORT_STORE_ERROR', '제보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.', 503, true);
    }
  }
  /** 테스트용: 파일 쓰기 대체(디스크 가득 참 흉내). */
  writeFile: typeof writeFileSync | null = null;

  /** 같은 clientRequestId 재전송은 새로 만들지 않고 처음 제보를 돌려준다(중복 전송 방지). */
  create(input: ReturnType<typeof parseReportRequest>): { report: Report; duplicate: boolean } {
    const existing = this.byClientRequest.get(input.clientRequestId);
    if (existing) return { report: this.reports.get(existing)!, duplicate: true };
    if (this.reports.size >= 5000) throw new ApiError('REPORT_STORE_FULL', '제보 저장 한도에 도달했습니다.', 503, true);
    const at = new Date(this.now()).toISOString();
    const report: Report = { id: randomUUID(), createdAt: at, status: 'received', memo: '', history: [{ at, actor: 'reporter', action: 'created' }], ...input };
    this.reports.set(report.id, report); this.byClientRequest.set(report.clientRequestId, report.id);
    try { this.persist(); } catch (e) {
      // 저장 실패 시 메모리에서도 빼서 재시도가 새 제보로 처리되게 한다(TODO 검토 ⑨).
      this.reports.delete(report.id); this.byClientRequest.delete(report.clientRequestId);
      throw e;
    }
    return { report, duplicate: false };
  }

  login(raw: unknown) {
    if (!this.organizerConfigured) throw new ApiError('ORGANIZER_NOT_CONFIGURED', '주최 측 시연 계정이 서버에 설정되지 않았습니다.', 503);
    const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const id = typeof b.accountId === 'string' ? b.accountId.trim() : '';
    const code = typeof b.code === 'string' ? b.code : '';
    const given = sha(code);
    // 모든 계정과 같은 시간 비교를 해서 계정 존재 여부가 응답 시간으로 드러나지 않게 한다.
    let match: OrganizerAccount | undefined;
    for (const a of this.accounts) if (timingSafeEqual(a.codeHash, given) && a.id === id) match = a;
    if (!match || code.length > 200) throw new ApiError('INVALID_CREDENTIALS', '계정 또는 코드가 올바르지 않습니다.', 401);
    for (const [t, s] of this.sessions) if (s.expiresAt <= this.now()) this.sessions.delete(t);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = this.now() + 2 * 3600_000;
    this.sessions.set(token, { accountId: match.id, expiresAt });
    return { token, accountId: match.id, eventIds: match.eventIds, expiresAt: new Date(expiresAt).toISOString(), demoAccount: true };
  }

  logout(token: string) { this.sessions.delete(token); }

  authorize(req: IncomingMessage): OrganizerAccount {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const session = token ? this.sessions.get(token) : undefined;
    if (!session || session.expiresAt <= this.now()) {
      if (token) this.sessions.delete(token);
      throw new ApiError('UNAUTHORIZED', '로그인이 필요하거나 만료됐습니다.', 401);
    }
    const account = this.accounts.find(a => a.id === session.accountId);
    if (!account) throw new ApiError('UNAUTHORIZED', '로그인이 필요하거나 만료됐습니다.', 401);
    return account;
  }
  tokenOf(req: IncomingMessage) { const h = req.headers.authorization ?? ''; return h.startsWith('Bearer ') ? h.slice(7).trim() : ''; }

  list(account: OrganizerAccount, eventId: string) {
    if (!account.eventIds.includes(eventId)) throw new ApiError('FORBIDDEN_EVENT', '담당하지 않는 공연의 제보는 볼 수 없습니다.', 403);
    return [...this.reports.values()].filter(r => r.eventId === eventId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(r => ({ id: r.id, eventId: r.eventId, createdAt: r.createdAt, status: r.status, listingPrice: r.listingPrice,
        findingCount: r.findings.length, preview: r.listingExcerpt.slice(0, 80), isDemo: r.isDemo }));
  }

  /** 담당하지 않는 공연의 제보는 존재 여부도 드러내지 않도록 404로 응답한다. */
  get(account: OrganizerAccount, id: string): Report {
    const r = this.reports.get(id);
    if (!r || !account.eventIds.includes(r.eventId)) throw new ApiError('REPORT_NOT_FOUND', '제보를 찾을 수 없습니다.', 404);
    return r;
  }

  update(account: OrganizerAccount, id: string, raw: unknown): Report {
    const r = this.get(account, id);
    const b = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : null) as Record<string, unknown> | null;
    if (!b || Object.keys(b).some(k => k !== 'status' && k !== 'memo') || (b.status === undefined && b.memo === undefined)) throw new ApiError('BAD_REQUEST', 'status 또는 memo만 바꿀 수 있습니다.');
    const at = new Date(this.now()).toISOString();
    const before = { status: r.status, memo: r.memo, history: r.history.length };
    if (b.status !== undefined) {
      if (typeof b.status !== 'string' || !(REPORT_STATUSES as readonly string[]).includes(b.status)) throw new ApiError('BAD_REQUEST', '처리 상태 값이 올바르지 않습니다.');
      if (b.status !== r.status) { r.history.push({ at, actor: account.id, action: 'status', from: r.status, to: b.status }); r.status = b.status as ReportStatus; }
    }
    if (b.memo !== undefined) {
      const memo = maskContacts(str(b.memo, 'memo', 1000));
      if (memo !== r.memo) { r.history.push({ at, actor: account.id, action: 'memo' }); r.memo = memo; }
    }
    try { this.persist(); } catch (e) {
      r.status = before.status; r.memo = before.memo; r.history.length = before.history;
      throw e;
    }
    return r;
  }

  /** 최소 정보 내보내기(텍스트). 연락처는 이미 가려져 있고, 담당자 메모는 포함하지 않는다. */
  exportText(account: OrganizerAccount, id: string): string {
    const r = this.get(account, id);
    return [
      `티켓레이더 제보 요약 · ${r.id}`, `공연: ${r.eventId}`, `접수: ${r.createdAt}`, `처리 상태: ${r.status}`,
      r.isDemo ? '※ 시연 데이터가 포함된 제보입니다.' : null,
      r.listingUrl ? `판매글 주소(서버가 열어 보지 않음): ${r.listingUrl}` : null,
      r.listingPrice ? `판매가(제보자 확인): ${r.listingPrice.toLocaleString('ko-KR')}원` : null,
      `판매글(연락처 가림): ${r.listingExcerpt}`, r.description ? `제보자 설명: ${r.description}` : null,
      ...r.findings.map((f, i) => `확인 ${i + 1}. ${f.title} — 판매글 “${f.listingQuote ?? '없음'}” / 공식 “${f.officialExcerpt ?? '없음'}”${f.sourceUrl ? ` (${f.sourceUrl})` : ''}`),
      '티켓 진위·사기·불법 여부를 확정하지 않습니다. 정부 신고센터에 자동 제출하지 않았습니다.',
    ].filter(Boolean).join('\n');
  }
}
