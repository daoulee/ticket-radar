import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createWorker } from './worker.ts'
import { ApiError } from '../server/src/errors.ts'

const event = { id: 'PF123', title: '공연', venue: null, startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS' as const, fetchedAt: '2026-11-03T00:00:00.000Z' }
const env = { KOPIS_API_KEY: 'dummy-secret', ASSETS: { fetch: async () => new Response('asset') } }

describe('공연 검색 Worker', () => {
  it('정적 경로를 기존 자산 바인딩에 위임한다', async () => {
    const res = await createWorker().fetch(new Request('https://example.test/page'), env)
    assert.equal(await res.text(), 'asset')
  })
  it('같은 출처의 검색어와 서버 키를 어댑터에 넘기고 출처를 응답한다', async () => {
    let seen = ''
    const res = await createWorker(async (key, query) => { seen = `${key}:${query}`; return [event] }).fetch(new Request('https://example.test/api/performances?q=%EA%B3%B5%EC%97%B0', { headers: { Origin: 'https://example.test' } }), env)
    assert.equal(res.status, 200); assert.deepEqual(await res.json(), [event])
    assert.equal(seen, 'dummy-secret:공연'); assert.equal(res.headers.get('cache-control'), 'no-store')
  })
  it('다른 출처, 잘못된 메서드 및 존재하지 않는 API를 거부한다', async () => {
    const worker = createWorker()
    assert.equal((await worker.fetch(new Request('https://example.test/api/performances', { headers: { Origin: 'https://other.test' } }), env)).status, 403)
    assert.equal((await worker.fetch(new Request('https://example.test/api/performances', { method: 'POST' }), env)).status, 405)
    assert.equal((await worker.fetch(new Request('https://example.test/api/other'), env)).status, 404)
  })
  it('설정 오류는 명시하고 예기치 않은 오류는 비밀을 노출하지 않는다', async () => {
    const missing = createWorker(async () => { throw new ApiError('KOPIS_NOT_CONFIGURED', '공연 검색 서비스가 설정되지 않았습니다.', 503, true) })
    assert.equal((await missing.fetch(new Request('https://example.test/api/performances'), env)).status, 503)
    const broken = createWorker(async () => { throw new Error('dummy-secret') })
    const res = await broken.fetch(new Request('https://example.test/api/performances'), env)
    assert.equal(res.status, 502); assert.ok(!(await res.text()).includes('dummy-secret'))
  })
  it('동일 isolate 내에서 한 IP의 과도한 요청을 제한한다', async () => {
    const worker = createWorker(async () => [])
    for (let i = 0; i < 30; i++) assert.equal((await worker.fetch(new Request('https://example.test/api/performances'), env)).status, 200)
    assert.equal((await worker.fetch(new Request('https://example.test/api/performances'), env)).status, 429)
  })
})
