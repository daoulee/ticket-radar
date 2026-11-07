/// <reference types="node" />
// 시연 응답을 JSON 으로 저장해 Astra 통합 검증기(tests/integration/check_api.py)로 대조할 수 있게 한다.
import { mkdirSync, writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { createDemoApi } from '../api/demoApi'
import { DEMO_SCENARIOS } from './fixtures'

it('시연 대조 응답 JSON 저장', async () => {
  const api = createDemoApi({ latencyMs: 0 })
  mkdirSync('evidence/contract', { recursive: true })
  for (const scenario of DEMO_SCENARIOS) {
    for (const [i, result] of scenario.results.entries()) {
      const res = await api.createCheck({ eventId: scenario.eventId, listingText: scenario.listingText, confirmedFields: result.fields })
      writeFileSync(`evidence/contract/demo-check-${scenario.id}${i}.json`, JSON.stringify(res, null, 2))
    }
  }
})
