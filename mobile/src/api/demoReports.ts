import {
  REPORT_STATUSES,
  type OrganizerSession,
  type ReportDetail,
  type ReportReceipt,
  type ReportRequest,
} from '../contract/reports';
import { maskContacts } from '../report/reportDoc';
import { ApiError, type OrganizerApi } from './client';

// 시연 모드 제보함: 서버 reports.ts 와 같은 규칙(동의·중복 전송·담당 공연 제한·감사 기록)을 앱 메모리에서 흉내 낸다.
// 앱을 끄면 사라진다. 시연 계정 코드는 화면에 그대로 안내하는 가상 값이며 실제 인증이 아니다.
export const DEMO_ORGANIZER_HINT = { accountId: 'demo-organizer', code: 'demo-code-1234' };
const DEMO_OTHER = { accountId: 'demo-other', code: 'demo-code-5678' };

export function createDemoReports(eventIds: () => string[]) {
  const reports = new Map<string, ReportDetail & { clientRequestId: string }>();
  const byRequest = new Map<string, string>();
  const sessions = new Map<string, { accountId: string; eventIds: string[] }>();
  let n = 0;
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

  function auth(token: string) {
    const s = sessions.get(token);
    if (!s) throw new ApiError({ code: 'UNAUTHORIZED', message: '로그인이 필요하거나 만료됐습니다.', retryable: false });
    return s;
  }
  function find(token: string, id: string) {
    const s = auth(token);
    const r = reports.get(id);
    if (!r || !s.eventIds.includes(r.eventId)) throw new ApiError({ code: 'REPORT_NOT_FOUND', message: '제보를 찾을 수 없습니다.', retryable: false });
    return { s, r };
  }

  async function submitReport(req: ReportRequest): Promise<ReportReceipt> {
    if (req.consent !== true) throw new ApiError({ code: 'CONSENT_REQUIRED', message: '제출 내용 확인·동의가 필요합니다.', retryable: false });
    const existing = byRequest.get(req.clientRequestId);
    if (existing) {
      const r = reports.get(existing)!;
      return { reportId: r.id, status: r.status, createdAt: r.createdAt, duplicate: true };
    }
    n += 1;
    const id = `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`;
    const at = new Date().toISOString();
    reports.set(id, {
      id, eventId: req.eventId, createdAt: at, status: 'received', listingUrl: req.listingUrl ?? null,
      listingExcerpt: maskContacts(req.listingText).slice(0, 1000), listingPrice: req.listingPrice ?? null,
      description: maskContacts(req.description ?? ''), checkId: req.checkId ?? null, findings: clone(req.findings),
      isDemo: true, memo: '', history: [{ at, actor: 'reporter', action: 'created' }], clientRequestId: req.clientRequestId,
    });
    byRequest.set(req.clientRequestId, id);
    return { reportId: id, status: 'received', createdAt: at, duplicate: false };
  }

  const organizer: OrganizerApi = {
    async login(accountId, code) {
      const ok =
        accountId === DEMO_ORGANIZER_HINT.accountId && code === DEMO_ORGANIZER_HINT.code
          ? eventIds()
          : accountId === DEMO_OTHER.accountId && code === DEMO_OTHER.code
            ? ['demo-other-event']
            : null;
      if (!ok) throw new ApiError({ code: 'INVALID_CREDENTIALS', message: '계정 또는 코드가 올바르지 않습니다.', retryable: false });
      const token = `demo-${accountId}-${Date.now()}`;
      sessions.set(token, { accountId, eventIds: ok });
      const session: OrganizerSession = { token, accountId, eventIds: ok, expiresAt: new Date(Date.now() + 7200_000).toISOString(), demoAccount: true };
      return session;
    },
    async logout(token) {
      sessions.delete(token);
    },
    async list(token, eventId) {
      const s = auth(token);
      if (!s.eventIds.includes(eventId)) throw new ApiError({ code: 'FORBIDDEN_EVENT', message: '담당하지 않는 공연의 제보는 볼 수 없습니다.', retryable: false });
      return [...reports.values()]
        .filter((r) => r.eventId === eventId)
        .reverse()
        .map((r) => ({ id: r.id, eventId: r.eventId, createdAt: r.createdAt, status: r.status, listingPrice: r.listingPrice, findingCount: r.findings.length, preview: r.listingExcerpt.slice(0, 80), isDemo: true }));
    },
    async get(token, id) {
      const { r } = find(token, id);
      const { clientRequestId: _omit, ...detail } = clone(r);
      return detail;
    },
    async update(token, id, patch) {
      const { s, r } = find(token, id);
      const at = new Date().toISOString();
      if (patch.status !== undefined) {
        if (!REPORT_STATUSES.includes(patch.status)) throw new ApiError({ code: 'BAD_REQUEST', message: '처리 상태 값이 올바르지 않습니다.', retryable: false });
        if (patch.status !== r.status) {
          r.history.push({ at, actor: s.accountId, action: 'status', from: r.status, to: patch.status });
          r.status = patch.status;
        }
      }
      if (patch.memo !== undefined) {
        const memo = maskContacts(patch.memo.trim()).slice(0, 1000);
        if (memo !== r.memo) {
          r.history.push({ at, actor: s.accountId, action: 'memo' });
          r.memo = memo;
        }
      }
      const { clientRequestId: _omit, ...detail } = clone(r);
      return detail;
    },
    async exportText(token, id) {
      const { r } = find(token, id);
      return [
        `티켓레이더 제보 요약 · ${r.id}`,
        `공연: ${r.eventId}`,
        `접수: ${r.createdAt}`,
        '※ 시연 데이터가 포함된 제보입니다.',
        `판매글(연락처 가림): ${r.listingExcerpt}`,
        ...r.findings.map((f, i) => `확인 ${i + 1}. ${f.title} — 판매글 “${f.listingQuote ?? '없음'}” / 공식 “${f.officialExcerpt ?? '없음'}”`),
        '티켓 진위·사기·불법 여부를 확정하지 않습니다. 정부 신고센터에 자동 제출하지 않았습니다.',
      ].join('\n');
    },
  };
  return { submitReport, organizer };
}
