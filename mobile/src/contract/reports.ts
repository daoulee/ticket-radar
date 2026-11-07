// 제보·주최 측 제보함 계약(APP-021). 서버 구현: server/src/reports.ts (이 파일은 앱 쪽 타입과 응답 검사).
// 공통 계약(shared/)에는 아직 없다. 웹이 같은 기능을 붙일 때 shared 로 옮기는 것을 Communicate 에 제안했다.

export type ReportStatus = 'received' | 'reviewing' | 'resolved' | 'dismissed';
export const REPORT_STATUS_TEXT: Record<ReportStatus, string> = {
  received: '접수',
  reviewing: '검토 중',
  resolved: '처리 완료',
  dismissed: '해당 없음',
};
export const REPORT_STATUSES = Object.keys(REPORT_STATUS_TEXT) as ReportStatus[];

export interface ReportFinding {
  title: string;
  status: string;
  listingQuote: string | null;
  officialExcerpt: string | null;
  sourceUrl: string | null;
}

export interface ReportRequest {
  clientRequestId: string;
  eventId: string;
  listingText: string;
  listingUrl?: string | null;
  listingPrice?: number | null;
  description?: string;
  checkId?: string | null;
  findings: ReportFinding[];
  isDemo: boolean;
  consent: true;
}
export interface ReportReceipt {
  reportId: string;
  status: ReportStatus;
  createdAt: string;
  duplicate: boolean;
}
export interface OrganizerSession {
  token: string;
  accountId: string;
  eventIds: string[];
  expiresAt: string;
  demoAccount: boolean;
}
export interface ReportSummary {
  id: string;
  eventId: string;
  createdAt: string;
  status: ReportStatus;
  listingPrice: number | null;
  findingCount: number;
  preview: string;
  isDemo: boolean;
}
export interface ReportHistory {
  at: string;
  actor: string;
  action: 'created' | 'status' | 'memo';
  from?: string;
  to?: string;
}
export interface ReportDetail {
  id: string;
  eventId: string;
  createdAt: string;
  status: ReportStatus;
  listingUrl: string | null;
  listingExcerpt: string;
  listingPrice: number | null;
  description: string;
  checkId: string | null;
  findings: ReportFinding[];
  isDemo: boolean;
  memo: string;
  history: ReportHistory[];
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStatus = (v: unknown): v is ReportStatus => typeof v === 'string' && (REPORT_STATUSES as string[]).includes(v);
const isStr = (v: unknown) => typeof v === 'string';
const isNullStr = (v: unknown) => v === null || typeof v === 'string';

export function validateReceipt(b: unknown): string[] {
  if (!isObj(b)) return ['receipt'];
  return [
    !isStr(b.reportId) && 'reportId',
    !isStatus(b.status) && 'status',
    !isStr(b.createdAt) && 'createdAt',
    typeof b.duplicate !== 'boolean' && 'duplicate',
  ].filter(Boolean) as string[];
}
export function validateSession(b: unknown): string[] {
  if (!isObj(b)) return ['session'];
  return [
    !isStr(b.token) && 'token',
    !isStr(b.accountId) && 'accountId',
    !(Array.isArray(b.eventIds) && b.eventIds.every(isStr)) && 'eventIds',
    !isStr(b.expiresAt) && 'expiresAt',
  ].filter(Boolean) as string[];
}
export function validateSummaries(b: unknown): string[] {
  if (!Array.isArray(b)) return ['reports'];
  return b.flatMap((r, i) =>
    !isObj(r) || !isStr(r.id) || !isStatus(r.status) || !isStr(r.createdAt) || !isStr(r.preview) || typeof r.findingCount !== 'number'
      ? [`reports[${i}]`]
      : [],
  );
}
export function validateDetail(b: unknown): string[] {
  if (!isObj(b)) return ['report'];
  return [
    !isStr(b.id) && 'id',
    !isStatus(b.status) && 'status',
    !isStr(b.listingExcerpt) && 'listingExcerpt',
    !isNullStr(b.listingUrl) && 'listingUrl',
    !isStr(b.memo) && 'memo',
    !(Array.isArray(b.findings) && b.findings.every((f) => isObj(f) && isStr(f.title))) && 'findings',
    !(Array.isArray(b.history) && b.history.every((h) => isObj(h) && isStr(h.at) && isStr(h.action))) && 'history',
  ].filter(Boolean) as string[];
}
export function validateExport(b: unknown): string[] {
  return isObj(b) && b.format === 'text' && isStr(b.content) ? [] : ['export'];
}

// 계약의 clientRequestId 는 UUID v4 형식. 중복 전송 방지용이라 암호학적 품질은 필요 없다.
export function newClientRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
