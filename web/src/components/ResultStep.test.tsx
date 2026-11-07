/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createDemoApi } from '../api/demoApi'
import type { CheckResponse, EventSummary } from '../contract/types'
import { DEMO_EVENTS, DEMO_SCENARIOS } from '../demo/fixtures'
import { ResultStep } from './ResultStep'

const read = (name: string) => JSON.parse(readFileSync(resolve(process.cwd(), '../shared/examples', name), 'utf8'))
const noop = () => {}

function badgeTitle(event: EventSummary, result: CheckResponse) {
  const { container } = render(
    <ResultStep event={event} result={result} currentFields={result.appliedFields!} submitting={false} onRecheck={noop} onEdit={noop} onRestart={noop} />,
  )
  return container.querySelector('section[aria-labelledby="result-step-title"] .badge-demo')?.getAttribute('title')
}

describe('결과 시연 배지 도움말 (Astra W1)', () => {
  it('공식 공지 + 합성 판매글 결과는 공식 가격·규정까지 가상이라고 설명하지 않는다', () => {
    const result = read('manual-response.json') as CheckResponse
    expect(result.provenance).toMatchObject({ syntheticListing: true, officialSourceType: 'official' })
    const title = badgeTitle(read('events.json')[0], result)
    expect(title).toContain('공식 가격·규정은 공지 스냅샷')
    expect(title).not.toContain('실제 공연·가격·규정이 아닌')
  })

  it('합성 공식 자료를 쓰는 순수 시연 결과는 기존 시연 설명을 유지한다', async () => {
    const s = DEMO_SCENARIOS[0]
    const result = await createDemoApi({ latencyMs: 0 }).createCheck({ eventId: s.eventId, listingText: s.listingText, confirmedFields: s.results[1].fields })
    expect(badgeTitle(DEMO_EVENTS[0], result)).toBe('실제 공연·가격·규정이 아닌 시연용 합성 데이터')
  })
})
