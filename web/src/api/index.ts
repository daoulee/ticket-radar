import type { TicketRadarApi } from './client'
import { createDemoApi } from './demoApi'
import { createHttpApi } from './httpApi'
import { withKopisPerformances } from './kopisDemoApi'

// VITE_API_BASE_URL 이 있으면 실제 API, 없으면 시연 데이터를 사용한다. 화면 상단에 현재 모드를 표시한다.
export function createApiFromEnvironment(): TicketRadarApi {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (baseUrl) return createHttpApi(baseUrl)

  const params = new URLSearchParams(window.location.search)
  const failOnce = (params.get('demoFail') ?? '')
    .split(',')
    .filter((s): s is 'events' | 'context' | 'checks' => s === 'events' || s === 'context' || s === 'checks')
  return withKopisPerformances(createDemoApi({ failOnce }))
}
