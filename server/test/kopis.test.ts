import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseKopisList, searchKopis } from '../src/kopis.ts';

const xml = '<dbs><db><mt20id>PF123</mt20id><prfnm>테스트 공연</prfnm><prfpdfrom>2026.11.01</prfpdfrom><prfpdto>2026.11.30</prfpdto><fcltynm>공연장</fcltynm><prfstate>공연중</prfstate></db></dbs>';
describe('KOPIS 공연 목록 어댑터', () => {
  it('공연 기간과 출처를 보존하고 빈 목록을 처리한다', () => {
    const [event] = parseKopisList(xml, '2026-11-03T00:00:00.000Z');
    assert.equal(event.id, 'PF123'); assert.equal(event.startsOn, '2026-11-01'); assert.equal(event.source, 'KOPIS');
    assert.equal(parseKopisList(xml.replace('테스트 공연', '공연 A &amp; B'), '2026-11-03T00:00:00.000Z')[0].title, '공연 A & B');
    assert.deepEqual(parseKopisList('<dbs/>', '2026-11-03T00:00:00.000Z'), []);
  });
  it('잘못된 응답과 외부 엔티티를 거부한다', () => {
    assert.throws(() => parseKopisList('<error>bad key</error>', '2026-11-03T00:00:00.000Z'));
    assert.throws(() => parseKopisList('<!DOCTYPE dbs [<!ENTITY x SYSTEM "file:///etc/passwd">]><dbs>&x;</dbs>', '2026-11-03T00:00:00.000Z'));
    assert.throws(() => parseKopisList(xml.replace('2026.11.30', '2026.02.31'), '2026-11-03T00:00:00.000Z'));
  });
  it('공연명과 날짜 범위를 공식 API에 전달한다', async () => {
    let called: URL | undefined;
    const result = await searchKopis('dummy', '테스트', { now: new Date('2026-11-03T00:00:00Z'), fetch: async input => { called = new URL(String(input)); return new Response(xml); } });
    assert.equal(result.length, 1); assert.equal(called?.searchParams.get('shprfnm'), '테스트');
    assert.equal(called?.searchParams.get('stdate'), '20261103'); assert.equal(called?.searchParams.get('eddate'), '20261203');
  });
  it('키 미설정과 통신 오류를 명시적으로 처리한다', async () => {
    await assert.rejects(searchKopis('', '공연'), { code: 'KOPIS_NOT_CONFIGURED' });
    await assert.rejects(searchKopis('dummy', '공연', { fetch: async () => { throw Error('secret'); } }), { code: 'KOPIS_UNAVAILABLE' });
    await assert.rejects(searchKopis('dummy', '공연', { fetch: async (_input, init) => { assert.equal(init?.redirect, 'manual'); return new Response(null, { status: 302, headers: { Location: 'https://other.example/' } }); } }), { code: 'KOPIS_UNAVAILABLE' });
  });
});

it('빈 검색에서 일시적인 5xx 또는 연결 실패 후 실제 응답만 한 번 재시도한다', async () => {
  for (const failure of ['status', 'network'] as const) {
    let attempts = 0;
    const result = await searchKopis('dummy', '', { now: new Date('2026-11-12T00:00:00Z'), fetch: async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.searchParams.has('shprfnm'), false);
      assert.equal(init?.redirect, 'manual');
      if (++attempts === 1) {
        if (failure === 'network') throw new Error('transient');
        return new Response('temporary', { status: 503 });
      }
      return new Response(xml);
    } });
    assert.equal(attempts, 2); assert.equal(result[0].id, 'PF123');
  }
});

it('반복 실패는 오류로 남기고 리디렉션·요청 제한을 재시도하지 않는다', async () => {
  let tries = 0;
  await assert.rejects(searchKopis('dummy', '', { fetch: async () => { tries++; return new Response('failure', { status: 503 }); } }), { code: 'KOPIS_UNAVAILABLE' });
  assert.equal(tries, 2);
  for (const status of [302, 400, 429]) {
    tries = 0;
    await assert.rejects(searchKopis('dummy', '', { fetch: async () => { tries++; return new Response(null, { status }); } }), { code: 'KOPIS_UNAVAILABLE' });
    assert.equal(tries, 1);
  }
});
