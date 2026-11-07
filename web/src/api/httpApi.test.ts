import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import { DEMO_SCENARIOS } from '../demo/fixtures'
import { createDemoApi } from './demoApi'
import { createHttpApi } from './httpApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('HTTP API 어댑터', () => {
  it('요청 경로와 본문을 계약 초안 형식으로 보낸다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    const api = createHttpApi('http://localhost:4000/', fetchMock)
    await api.listEvents('레이더 라이브')
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:4000/events?q=%EB%A0%88%EC%9D%B4%EB%8D%94%20%EB%9D%BC%EC%9D%B4%EB%B8%8C')

    // 계약 형식을 만족하는 응답 (시연 API 의 추출 단계 응답을 그대로 사용)
    const valid = await createDemoApi({ latencyMs: 0 }).createCheck({ eventId: 'e1', listingText: '글' })
    fetchMock.mockResolvedValue(jsonResponse(valid))
    await api.createCheck({ eventId: 'e1', listingText: '글' })
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('http://localhost:4000/checks')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ eventId: 'e1', listingText: '글' })
  })

  it('서버 오류 본문 {code, message, retryable} 을 그대로 전달한다', async () => {
    const api = createHttpApi('http://api', vi.fn().mockResolvedValue(jsonResponse({ code: 'RATE_LIMITED', message: '잠시 후 다시 시도하세요.', retryable: true }, 429)))
    await expect(api.getOfficialContext('e1')).rejects.toMatchObject({ code: 'RATE_LIMITED', retryable: true })
  })

  it('네트워크 실패는 재시도 가능한 NETWORK_ERROR 로 바꾼다', async () => {
    const api = createHttpApi('http://api', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await api.listEvents('').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', retryable: true })
  })

  it('형식이 다른 성공 응답은 결과로 보여주지 않고 INVALID_RESPONSE 로 처리한다', async () => {
    const api = createHttpApi('http://api', vi.fn().mockResolvedValue(jsonResponse({ ok: true })))
    await expect(api.createCheck({ eventId: 'e1', listingText: '글' })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('JSON 이 아닌 응답은 INVALID_RESPONSE 로 처리한다', async () => {
    const api = createHttpApi('http://api', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })))
    await expect(api.listEvents('')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('스키마는 맞아도 판매글에 없는 인용이면 INVALID_RESPONSE 와 문제 목록을 돌려준다', async () => {
    const demo = createDemoApi({ latencyMs: 0 })
    const scenario = DEMO_SCENARIOS[0]
    const body = await demo.createCheck({ eventId: scenario.eventId, listingText: scenario.listingText })
    const api = createHttpApi('http://api', vi.fn().mockResolvedValue(jsonResponse(body)))
    const error = await api.createCheck({ eventId: scenario.eventId, listingText: 'VIP 한 장 25만원' }).catch((e) => e)
    expect(error).toMatchObject({ code: 'INVALID_RESPONSE', retryable: false })
    expect(error.details).toContain('extracted.price.evidenceQuote: 판매글 원문에 없는 인용')
  })

  it('Sol 스키마에 맞지 않는 응답(구 임시 계약 형식)은 거부한다', async () => {
    const old = { checkId: 'c1', eventId: 'e1', extracted: {}, findings: [], priceComparison: { held: true, reason: 'x' }, notices: [] }
    const api = createHttpApi('http://api', vi.fn().mockResolvedValue(jsonResponse(old)))
    const error = await api.createCheck({ eventId: 'e1', listingText: '글' }).catch((e) => e)
    expect(error).toMatchObject({ code: 'INVALID_RESPONSE' })
    expect(error.details.join('\n')).toMatch(/contractVersion/)
  })
})
