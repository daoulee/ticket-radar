import { EventSummarySchema, KopisPerformanceListSchema, type KopisPerformance } from '@ticket-radar/shared'
import { ApiError, type TicketRadarApi } from './client'

/** KOPIS 목록은 실데이터, 기존 예시 API는 합성 데이터. 실제 공연의 공식 가격·규정은 별도 검증 전까지 비워 둔다. */
export function withKopisPerformances(demo: TicketRadarApi, fetchImpl: typeof fetch = fetch): TicketRadarApi {
  const selected = new Map<string, KopisPerformance>()
  return {
    ...demo,
    async listPerformances(query) {
      let response: Response
      try { response = await fetchImpl(`/api/performances?q=${encodeURIComponent(query.trim())}`, { signal: AbortSignal.timeout(15_000), headers: { Accept: 'application/json' } }) }
      catch { throw new ApiError({ code: 'KOPIS_UNAVAILABLE', message: '실제 공연 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', retryable: true }) }
      if (!response.ok) throw new ApiError({ code: 'KOPIS_UNAVAILABLE', message: '실제 공연 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', retryable: true })
      let raw: unknown
      try { raw = await response.json() } catch { throw new ApiError({ code: 'KOPIS_INVALID_RESPONSE', message: '공연 목록 응답을 읽을 수 없어요.', retryable: true }) }
      const result = KopisPerformanceListSchema.safeParse(raw)
      if (!result.success) throw new ApiError({ code: 'KOPIS_INVALID_RESPONSE', message: '공연 목록의 형식을 확인할 수 없어요.', retryable: true })
      return result.data.map(item => {
        const id = `kopis:${item.id}`
        selected.set(id, item)
        return EventSummarySchema.parse({ id, title: item.title, venue: item.venue, showtimes: [], officialUrl: null, sourceCheckedAt: item.fetchedAt, isDemo: false, source: 'KOPIS', period: { startsOn: item.startsOn, endsOn: item.endsOn } })
      })
    },
    async getOfficialContext(eventId) {
      const item = selected.get(eventId)
      if (!item) return demo.getOfficialContext(eventId)
      throw new ApiError({ code: 'OFFICIAL_DATA_UNAVAILABLE', message: 'KOPIS 공연 목록만 연결되어 있어요. 이 공연의 공식 가격·입장 규정은 아직 등록되지 않았어요.', retryable: false })
    },
    async createCheck(input) {
      if (!selected.has(input.eventId)) return demo.createCheck(input)
      if (input.extractionMode === 'manual') throw new ApiError({ code: 'OFFICIAL_DATA_UNAVAILABLE', message: '이 공연의 공식 가격·입장 규정과 비교하는 기능은 준비 중이에요.', retryable: false })
      throw new ApiError({ code: 'AI_NOT_CONFIGURED', message: '실제 공연의 AI 분석은 아직 연결되지 않았어요. 직접 입력을 선택해 주세요.', retryable: false })
    },
  }
}
