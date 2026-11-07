import { ListingFieldsSchema } from '@ticket-radar/shared'
import { CONTRACT_VERSION, unknownFields, type CheckResponse } from '../contract/types'
import {
  DEMO_CONTEXTS,
  DEMO_EVENTS,
  DEMO_SOURCE_VERSION,
  DEMO_SCENARIOS,
  NO_OFFICIAL_DATA_RESULT,
  UNMATCHED_FIELDS_REASON,
  UNSUPPORTED_TEXT_NOTICE,
} from '../demo/fixtures'
import { ApiError, type TicketRadarApi } from './client'
import { sameListingFields } from '../ui/fields'

export const MAX_LISTING_LENGTH = 3000

type DemoStep = 'events' | 'context' | 'checks'

export interface DemoApiOptions {
  latencyMs?: number
  // 실패 화면 확인용: 해당 단계의 첫 요청만 실패시킨다 (?demoFail=checks).
  failOnce?: DemoStep[]
}

// 시연 API: 미리 준비한 응답을 찾아서 돌려주기만 한다. 가격·규정 판단을 하지 않는다.
export function createDemoApi({ latencyMs = 450, failOnce = [] }: DemoApiOptions = {}): TicketRadarApi {
  const pendingFailures = new Set(failOnce)

  async function step(name: DemoStep) {
    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
    if (pendingFailures.delete(name)) {
      throw new ApiError({ code: 'DEMO_FORCED_FAILURE', message: '시연용으로 만든 요청 실패입니다.', retryable: true })
    }
  }

  return {
    mode: 'demo',
    label: '시연 데이터 (API 미연결)',

    async listEvents(query) {
      await step('events')
      const q = query.trim().toLowerCase()
      return structuredClone(DEMO_EVENTS.filter((event) => !q || event.title.toLowerCase().includes(q)))
    },

    async getOfficialContext(eventId) {
      await step('context')
      const context = DEMO_CONTEXTS[eventId]
      if (!context) throw new ApiError({ code: 'EVENT_NOT_FOUND', message: '공연을 찾지 못했습니다.', retryable: false })
      return structuredClone(context)
    },

    async createCheck(request) {
      await step('checks')
      const { eventId, listingText } = request
      const text = listingText.trim()
      if (!text) throw new ApiError({ code: 'EMPTY_LISTING', message: '판매글을 입력하세요.', retryable: false })
      if (text.length > MAX_LISTING_LENGTH) {
        throw new ApiError({ code: 'LISTING_TOO_LONG', message: `판매글은 ${MAX_LISTING_LENGTH}자 이하로 입력하세요.`, retryable: false })
      }
      const manual = request.extractionMode === 'manual'
      if (manual && !request.confirmedFields) {
        throw new ApiError({ code: 'INVALID_REQUEST', message: '직접 입력에는 확인값이 필요합니다.', retryable: false })
      }
      // 계약과 같이 생략된 조건은 null(확인 안 됨)로 채운다.
      const confirmedFields = request.confirmedFields ? ListingFieldsSchema.parse(request.confirmedFields) : undefined

      const scenario = DEMO_SCENARIOS.find((s) => s.eventId === eventId && s.listingText.trim() === text)
      const base = {
        contractVersion: CONTRACT_VERSION,
        checkId: crypto.randomUUID(),
        eventId,
        // 직접 입력은 추출 후보가 없다. 시연 판매글이면 미리 적어 둔 후보를 돌려준다.
        extracted: manual ? unknownFields() : structuredClone(scenario?.extracted ?? unknownFields()),
        checkedAt: new Date().toISOString(),
        isDemo: true,
        dataMode: 'demo' as const,
        extraction: { method: manual ? ('manual' as const) : ('fixture' as const), provider: null, model: null, actualModelCall: false, reused: false },
        provenance: { syntheticListing: true, officialSourceType: 'synthetic' as const, sourceVersion: DEMO_SOURCE_VERSION },
      }
      const notices = scenario || manual ? [...(scenario?.notices ?? [])] : [UNSUPPORTED_TEXT_NOTICE]

      if (!confirmedFields) {
        // 추출 단계: 결과 대조 전이므로 비교는 보류 상태로 둔다.
        return {
          ...base,
          appliedFields: null,
          findings: [],
          priceComparison: { held: true, reason: '추출값 확인 전입니다.' },
          notices,
        } satisfies CheckResponse
      }

      if (!DEMO_CONTEXTS[eventId]?.priceTiers.length) {
        return { ...base, appliedFields: confirmedFields, notices, ...structuredClone(NO_OFFICIAL_DATA_RESULT) }
      }

      const result = scenario?.results.find((r) => sameListingFields(r.fields, confirmedFields))
      if (!result) {
        return {
          ...base,
          appliedFields: confirmedFields,
          findings: [],
          priceComparison: { held: true, reason: UNMATCHED_FIELDS_REASON },
          notices: [...notices, UNMATCHED_FIELDS_REASON],
        }
      }
      return {
        ...base,
        appliedFields: confirmedFields,
        findings: structuredClone(result.findings),
        priceComparison: structuredClone(result.priceComparison),
        notices,
      }
    },
  }
}
