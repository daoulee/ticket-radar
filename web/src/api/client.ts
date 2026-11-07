import type {
  ApiErrorBody,
  CheckRequestInput,
  CheckResponse,
  EventSummary,
  OfficialContext,
} from '../contract/types'

// 화면은 이 인터페이스만 사용한다. 시연 데이터와 실제 API는 같은 형식을 돌려준다.
export interface TicketRadarApi {
  // 연결 방식. 결과 데이터가 합성인지(isDemo/dataMode)와는 별개다 (SPEC 결정 5).
  mode: 'demo' | 'http'
  label: string
  listEvents(query: string): Promise<EventSummary[]>
  listPerformances?(query: string): Promise<EventSummary[]>
  getOfficialContext(eventId: string): Promise<OfficialContext>
  createCheck(request: CheckRequestInput): Promise<CheckResponse>
}

export class ApiError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly details: string[]

  constructor(body: ApiErrorBody, details: string[] = []) {
    super(body.message)
    this.code = body.code
    this.retryable = body.retryable
    this.details = details
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError({
    code: 'UNKNOWN',
    message: '알 수 없는 오류가 발생했습니다.',
    retryable: true,
  })
}
