import { describe, expect, it, vi } from 'vitest'
import { createDemoApi } from './demoApi'
import { withKopisPerformances } from './kopisDemoApi'

const performance = { id: 'PF123', title: '실제 공연', venue: '테스트 공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS', fetchedAt: '2026-11-03T00:00:00.000Z' }
describe('KOPIS와 시연 API 분리', () => {
  it('실제 공연의 기간과 출처를 표시하고 미검증 자료와 AI를 만들지 않는다', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([performance]), { status: 200 }))
    const api = withKopisPerformances(createDemoApi({ latencyMs: 0 }), fetcher as unknown as typeof fetch)
    const [event] = await api.listPerformances!('공연')
    expect(event).toMatchObject({ id: 'kopis:PF123', isDemo: false, source: 'KOPIS', showtimes: [], officialUrl: null, period: { startsOn: '2026-11-01', endsOn: '2026-11-30' } })
    await expect(api.getOfficialContext(event.id)).rejects.toMatchObject({ code: 'OFFICIAL_DATA_UNAVAILABLE' })
    await expect(api.createCheck({ eventId: event.id, listingText: '판매글' })).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' })
    expect((await api.listEvents('레이더')).length).toBe(1)
  })
  it('실제 검색 실패를 시연 목록으로 숨기지 않고 빈 목록과 구분한다', async () => {
    const api = withKopisPerformances(createDemoApi({ latencyMs: 0 }), vi.fn(async () => new Response('', { status: 503 })) as unknown as typeof fetch)
    await expect(api.listPerformances!('')).rejects.toMatchObject({ code: 'KOPIS_UNAVAILABLE' })
    const empty = withKopisPerformances(createDemoApi({ latencyMs: 0 }), vi.fn(async () => new Response('[]')) as unknown as typeof fetch)
    expect(await empty.listPerformances!('없는 공연')).toEqual([])
  })
  it('검증되지 않은 응답은 표시하지 않는다', async () => {
    const api = withKopisPerformances(createDemoApi({ latencyMs: 0 }), vi.fn(async () => new Response(JSON.stringify([{ ...performance, id: 'bad' }]))) as unknown as typeof fetch)
    await expect(api.listPerformances!('')).rejects.toMatchObject({ code: 'KOPIS_INVALID_RESPONSE' })
  })
})
