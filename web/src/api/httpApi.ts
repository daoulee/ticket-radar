import type { CheckRequestInput, CheckResponse, EventSummary, OfficialContext } from '../contract/types'
import { checkResponseIssues, eventListIssues, isApiErrorBody, officialContextIssues } from '../contract/validate'
import { ApiError, type TicketRadarApi } from './client'

const TIMEOUT_MS = 15_000

// Sol 서버(VITE_API_BASE_URL)에 연결한다. 판단은 서버가 하고 웹은 Sol 스키마로 검증한 응답을 표시만 한다.
export function createHttpApi(baseUrl: string, fetchImpl: typeof fetch = fetch): TicketRadarApi {
  const root = baseUrl.replace(/\/+$/, '')

  async function request<T>(path: string, init: RequestInit, issuesOf: (body: unknown) => string[]): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let response: Response
    try {
      response = await fetchImpl(`${root}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError'
      throw new ApiError(
        timedOut
          ? { code: 'TIMEOUT', message: '서버 응답 시간이 초과되었습니다.', retryable: true }
          : { code: 'NETWORK_ERROR', message: '서버에 연결하지 못했습니다.', retryable: true },
      )
    } finally {
      clearTimeout(timer)
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new ApiError({ code: 'INVALID_RESPONSE', message: '서버 응답을 읽지 못했습니다.', retryable: true })
    }

    if (!response.ok) {
      if (isApiErrorBody(body)) throw new ApiError(body as { code: string; message: string; retryable: boolean })
      throw new ApiError({
        code: `HTTP_${response.status}`,
        message: '서버가 요청을 처리하지 못했습니다.',
        retryable: response.status >= 500,
      })
    }
    // 계약과 다르거나 근거가 맞지 않는 응답은 성공으로 보여주지 않는다.
    const issues = issuesOf(body)
    if (issues.length > 0) {
      throw new ApiError({ code: 'INVALID_RESPONSE', message: '서버 응답이 계약 형식과 달라 결과를 표시하지 않았습니다.', retryable: false }, issues)
    }
    return body as T
  }

  return {
    mode: 'http',
    label: root,
    listEvents: (query) =>
      request<EventSummary[]>(`/events?q=${encodeURIComponent(query)}`, { method: 'GET' }, eventListIssues),
    getOfficialContext: (eventId) =>
      request<OfficialContext>(
        `/events/${encodeURIComponent(eventId)}/official-context`,
        { method: 'GET' },
        (b) => officialContextIssues(b, eventId),
      ),
    createCheck: (body: CheckRequestInput) =>
      request<CheckResponse>('/checks', { method: 'POST', body: JSON.stringify(body) }, (b) => checkResponseIssues(b, body)),
  }
}
