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
