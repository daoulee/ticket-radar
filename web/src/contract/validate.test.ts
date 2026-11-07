/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDemoApi } from '../api/demoApi'
import { DEMO_CONTEXTS, DEMO_EVENTS, DEMO_SCENARIOS } from '../demo/fixtures'
import type { CheckRequestInput, CheckResponse } from './types'
import { checkResponseIssues, eventListIssues, officialContextIssues } from './validate'

const api = createDemoApi({ latencyMs: 0 })
const A = DEMO_SCENARIOS[0]
// vitest 는 web/ 에서 실행된다. Sol 예시 파일은 읽기만 한다.
const example = (name: string) => JSON.parse(readFileSync(resolve(process.cwd(), '../shared/examples', name), 'utf8'))

// results[1] = 조건을 확인해 가격 비교된 응답, results[0] = 조건 미확인으로 보류된 응답
async function compared(index = 1): Promise<[CheckResponse, CheckRequestInput]> {
  const request: CheckRequestInput = { eventId: A.eventId, listingText: A.listingText, confirmedFields: A.results[index].fields }
  return [await api.createCheck(request), request]
}

function mutate(base: CheckResponse, change: (r: Record<string, any>) => void) {
  const copy = structuredClone(base) as unknown as Record<string, any>
  change(copy)
  return copy
}

describe('응답 검증 (Sol 공통 스키마 + 웹 요청 대조)', () => {
  it('Sol shared/examples 의 실제 계약 예시가 웹 검증을 통과한다', () => {
    expect(eventListIssues(example('events.json'))).toEqual([])
    expect(officialContextIssues(example('official-context.json'), 'akmu-daegu-20261121')).toEqual([])
    expect(checkResponseIssues(example('manual-response.json'), example('manual-request.json'))).toEqual([])
  })

  it('웹 시연 응답(추출·대조·직접 입력·예시 아닌 글·공식 자료 없음)이 모두 Sol 스키마를 통과한다', async () => {
    for (const s of DEMO_SCENARIOS) {
      const extractReq = { eventId: s.eventId, listingText: s.listingText }
      expect(checkResponseIssues(await api.createCheck(extractReq), extractReq), `${s.id} 추출`).toEqual([])
      for (const [i, r] of s.results.entries()) {
        const req = { eventId: s.eventId, listingText: s.listingText, confirmedFields: r.fields }
        expect(checkResponseIssues(await api.createCheck(req), req), `${s.id}${i}`).toEqual([])
      }
    }
    const manualReq: CheckRequestInput = { eventId: A.eventId, listingText: '직접 입력 문장', extractionMode: 'manual', confirmedFields: { ...A.results[0].fields } }
    const manual = await api.createCheck(manualReq)
    expect(manual.extraction).toMatchObject({ method: 'manual', actualModelCall: false })
    expect(checkResponseIssues(manual, manualReq)).toEqual([])
    const otherReq = { eventId: 'demo-compass', listingText: '나침반 R석 15만원' }
    expect(checkResponseIssues(await api.createCheck(otherReq), otherReq)).toEqual([])
    expect(eventListIssues(DEMO_EVENTS)).toEqual([])
    for (const [id, ctx] of Object.entries(DEMO_CONTEXTS)) expect(officialContextIssues(ctx, id)).toEqual([])
  })

  const cases: [string, (r: Record<string, any>) => void, RegExp, number?][] = [
    ['원문에 없는 추출 인용', (r) => (r.extracted.price.evidenceQuote = '180,000원'), /판매글 원문에 없는 인용/],
    ['원문에 없는 결과 인용', (r) => (r.findings[1].listingQuote = '현장 수령 가능'), /findings\.1\.listingQuote: 판매글 원문에 없는 인용/],
    ['보낸 확인값과 다른 적용값', (r) => (r.appliedFields.price = 200000), /appliedFields\.price: 보낸 확인값과 다름/, 0],
    ['unknown 인데 값 있음', (r) => (r.extracted.price.status = 'unknown'), /extracted\.price/],
    ['허용되지 않은 상태값', (r) => (r.findings[0].status = 'fraud'), /findings\.0\.status/],
    ['보류인데 계산값 포함', (r) => (r.priceComparison = { held: true, reason: '보류', diff: 1 }), /priceComparison/],
    ['가격 계산 오류', (r) => (r.priceComparison.diff = 70000), /incorrect price arithmetic/],
    ['합성 자료인데 live', (r) => ((r.dataMode = 'live'), (r.isDemo = false)), /data mode must reflect/],
    ['모델 출처 없이 model 주장', (r) => (r.extraction = { method: 'model', provider: null, model: null, actualModelCall: true, reused: false }), /model provenance required/],
    ['fixture 가 모델 호출 주장', (r) => (r.extraction.actualModelCall = true), /non-model cannot claim/],
    ['계약 버전 다름', (r) => (r.contractVersion = '0.0.9'), /contractVersion/],
    ['다른 공연 응답', (r) => (r.eventId = 'other'), /eventId: 요청한 공연/, 0],
  ]

  it.each(cases)('잘못된 응답을 거부한다: %s', async (_name, change, pattern, index) => {
    const [res, req] = await compared(index)
    expect(checkResponseIssues(mutate(res, change), req).join('\n')).toMatch(pattern)
  })

  it('추출 단계 응답에 적용값이나 가격 계산이 있으면 거부한다', async () => {
    const req = { eventId: A.eventId, listingText: A.listingText }
    const [comparedRes] = await compared()
    expect(checkResponseIssues(comparedRes, req).join('\n')).toMatch(/추출 단계 응답인데/)
  })
})
