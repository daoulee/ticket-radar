import { ApiErrorBodySchema, CheckRequestSchema } from '@ticket-radar/shared';
import type { CheckRequestInput, CheckResponse, EventSummary, OfficialContext } from '../contract/types';
import { ApiError, type TicketRadarApi } from './client';
import { validateCheckResponse, validateEvents, validateOfficialContext } from './validate';
import {
  validateDetail,
  validateExport,
  validateReceipt,
  validateSession,
  validateSummaries,
  type OrganizerSession,
  type ReportDetail,
  type ReportReceipt,
  type ReportSummary,
} from '../contract/reports';

const TIMEOUT_MS = 15_000;
const CHECK_TIMEOUT_MS = 35_000;

// Sol 서버가 준비되면 EXPO_PUBLIC_API_BASE_URL 로 연결한다. 판단은 서버가 하고 앱은 응답을 표시만 한다.
// 아직 실제 서버와 왕복 검증하지 않았다(단위 테스트의 가짜 fetch로만 확인).
export function createHttpApi(baseUrl: string, fetchImpl: typeof fetch = fetch): TicketRadarApi {
  const root = baseUrl.replace(/\/+$/, '');

  async function request<T>(path: string, init: RequestInit, validate: (body: unknown) => string[], token?: string, timeoutMs = TIMEOUT_MS): Promise<T> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: controller.signal,
      });
    } catch {
      // React Native에는 DOMException이 없을 수 있어 직접 둔 플래그로 시간 초과를 구분한다.
      throw new ApiError(
        timedOut
          ? { code: 'TIMEOUT', message: '서버 응답 시간이 초과되었습니다.', retryable: true }
          : { code: 'NETWORK_ERROR', message: '서버에 연결하지 못했습니다. 네트워크를 확인하세요.', retryable: true },
      );
    } finally {
      clearTimeout(timer);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiError({ code: 'INVALID_RESPONSE', message: '서버 응답을 읽지 못했습니다.', retryable: true });
    }

    if (!response.ok) {
      const error = ApiErrorBodySchema.safeParse(body);
      if (error.success) throw new ApiError(error.data);
      throw new ApiError({
        code: `HTTP_${response.status}`,
        message: '서버가 요청을 처리하지 못했습니다.',
        retryable: response.status >= 500,
      });
    }
    // 형식이 다르거나 요청과 맞지 않는 응답은 성공으로 보여주지 않는다 (SPEC T06, 중첩 필드까지 검사).
    const problems = validate(body);
    if (problems.length > 0) {
      throw new ApiError(
        { code: 'INVALID_RESPONSE', message: '서버 응답 형식이 예상과 다릅니다.', retryable: false },
        problems,
      );
    }
    return body as T;
  }

  return {
    mode: 'live',
    label: root,
    listEvents: (query) =>
      request<EventSummary[]>(`/events?q=${encodeURIComponent(query)}`, { method: 'GET' }, validateEvents),
    getOfficialContext: (eventId) =>
      request<OfficialContext>(
        `/events/${encodeURIComponent(eventId)}/official-context`,
        { method: 'GET' },
        (b) => validateOfficialContext(b, eventId),
      ),
    createCheck: (body: CheckRequestInput) => {
      // 앱이 계약에 맞지 않는 요청을 만들었다면 보내지 않는다(앱 결함을 서버 오류로 오인하지 않게).
      if (!CheckRequestSchema.safeParse(body).success) {
        return Promise.reject(
          new ApiError({ code: 'INVALID_REQUEST', message: '요청 형식이 계약과 맞지 않습니다.', retryable: false }),
        );
      }
      return request<CheckResponse>(
        '/checks',
        { method: 'POST', body: JSON.stringify(body) },
        (b) => validateCheckResponse(b, body),
        undefined,
        // AI 추출은 서버가 최대 30초(AI_TIMEOUT_MS)·대체 모델까지 시도하므로 앱은 그보다 조금 더 기다린다.
        CHECK_TIMEOUT_MS,
      );
    },
    submitReport: (body) =>
      request<ReportReceipt>('/reports', { method: 'POST', body: JSON.stringify(body) }, validateReceipt),
    organizer: {
      login: (accountId, code) =>
        request<OrganizerSession>('/organizer/login', { method: 'POST', body: JSON.stringify({ accountId, code }) }, validateSession),
      logout: async (token) => {
        await request<unknown>('/organizer/logout', { method: 'POST', body: '{}' }, () => [], token);
      },
      list: (token, eventId) =>
        request<ReportSummary[]>(`/organizer/reports?event_id=${encodeURIComponent(eventId)}`, { method: 'GET' }, validateSummaries, token),
      get: (token, id) =>
        request<ReportDetail>(`/organizer/reports/${encodeURIComponent(id)}`, { method: 'GET' }, validateDetail, token),
      update: (token, id, patch) =>
        request<ReportDetail>(`/organizer/reports/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }, validateDetail, token),
      exportText: async (token, id) =>
        (await request<{ content: string }>(`/organizer/reports/${encodeURIComponent(id)}/export`, { method: 'GET' }, validateExport, token)).content,
    },
  };
}
