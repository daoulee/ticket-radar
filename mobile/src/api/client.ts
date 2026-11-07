import type {
  ApiErrorBody,
  CheckRequestInput,
  CheckResponse,
  DataMode,
  EventSummary,
  OfficialContext,
} from '../contract/types';
import type { OrganizerSession, ReportDetail, ReportReceipt, ReportRequest, ReportStatus, ReportSummary } from '../contract/reports';

// 화면은 이 인터페이스만 사용한다. 시연 데이터와 실제 API는 같은 형식을 돌려준다.
// 요청·응답 타입은 공통 계약 @ticket-radar/shared(v0.1.0)를 따른다.
export interface TicketRadarApi {
  mode: DataMode;
  label: string;
  listEvents(query: string): Promise<EventSummary[]>;
  getOfficialContext(eventId: string): Promise<OfficialContext>;
  createCheck(request: CheckRequestInput): Promise<CheckResponse>;
  // 제보·주최 측 제보함(APP-021). 서버가 판단·저장하고 앱은 입력과 표시만 한다.
  submitReport(request: ReportRequest): Promise<ReportReceipt>;
  organizer: OrganizerApi;
}

export interface OrganizerApi {
  login(accountId: string, code: string): Promise<OrganizerSession>;
  logout(token: string): Promise<void>;
  list(token: string, eventId: string): Promise<ReportSummary[]>;
  get(token: string, id: string): Promise<ReportDetail>;
  update(token: string, id: string, patch: { status?: ReportStatus; memo?: string }): Promise<ReportDetail>;
  exportText(token: string, id: string): Promise<string>;
}

export class ApiError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  // 응답 형식 오류의 세부 위치(개발 확인용). 화면에는 message만 보여준다.
  readonly details: string[];

  constructor(body: ApiErrorBody, details: string[] = []) {
    super(body.message);
    this.code = body.code;
    this.retryable = body.retryable;
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError({
    code: 'UNKNOWN',
    message: '알 수 없는 오류가 발생했습니다.',
    retryable: true,
  });
}
