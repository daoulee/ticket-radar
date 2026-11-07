import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchKopisDetail, kopisPosterUrl, parseAllSeatsPrice, parseKopisCards, parseKopisDetail, parseStageCapacity, searchKopisCards } from '../src/kopis-cards.ts';

const xml = '<dbs><db><mt20id>PF123</mt20id><prfnm>공연</prfnm><prfpdfrom>2026.11.01</prfpdfrom><prfpdto>2026.11.30</prfpdto><fcltynm>공연장</fcltynm><poster>http://www.kopis.or.kr/upload/pfmPoster/test.jpg</poster><genrenm>뮤지컬</genrenm><prfstate>공연중</prfstate></db></dbs>';

test('KOPIS card keeps poster and genre with the matching performance', () => {
  const [card] = parseKopisCards(xml, '2026-11-06T00:00:00.000Z');
  assert.equal(card.id, 'PF123');
  assert.equal(card.genre, '뮤지컬');
  assert.equal(card.posterUrl, 'https://www.kopis.or.kr/upload/pfmPoster/test.jpg');
  assert.equal(card.source, 'KOPIS');
});

test('poster URLs outside the KOPIS poster host and path are rejected', () => {
  for (const url of ['https://evil.example/upload/pfmPoster/test.jpg', 'https://kopis.or.kr.evil.example/upload/pfmPoster/test.jpg', 'file:///upload/pfmPoster/test.jpg', 'https://kopis.or.kr/other']) assert.equal(kopisPosterUrl(url), null);
});

test('KOPIS failures do not become synthetic results', async () => {
  await assert.rejects(searchKopisCards(''), { code: 'KOPIS_NOT_CONFIGURED' });
  await assert.rejects(searchKopisCards('fake', { fetch: async () => new Response('', { status: 503 }) }), { code: 'KOPIS_UNAVAILABLE' });
  await assert.rejects(searchKopisCards('fake', { fetch: async () => new Response('<!DOCTYPE x><dbs/>') }), { code: 'KOPIS_INVALID_RESPONSE' });
});

test('category filter is sent to KOPIS as its documented genre code', async () => {
  let requested = '';
  await searchKopisCards('fake', { category: 'concert', fetch: async (input) => { requested = String(input); return new Response(xml); } });
  assert.equal(new URL(requested).searchParams.get('shcate'), 'CCCD');
  await searchKopisCards('fake', { category: 'musical', fetch: async (input) => { requested = String(input); return new Response(xml); } });
  assert.equal(new URL(requested).searchParams.get('shcate'), 'GGGA');
});

test('page is passed through and invalid page is rejected', async () => {
  let requested = '';
  await searchKopisCards('fake', { page: 2, fetch: async (input) => { requested = String(input); return new Response(xml); } });
  assert.equal(new URL(requested).searchParams.get('cpage'), '2');
  await assert.rejects(searchKopisCards('fake', { page: 0 }), { code: 'BAD_REQUEST' });
});

test('detail preserves supplied description and clearly leaves missing fields empty', async () => {
  const detailXml = xml.replace('<prfstate>', '<sty>공연 이야기</sty><prfcast>출연진</prfcast><prfruntime>90분</prfruntime><pcseguidance>전석 30,000원</pcseguidance><prfstate>');
  const detail = parseKopisDetail(detailXml, '2026-11-06T00:00:00.000Z', 'PF123');
  assert.equal(detail.story, '공연 이야기');
  assert.equal(detail.cast, '출연진');
  assert.equal(detail.runtime, '90분');
  assert.equal(detail.priceGuide, '전석 30,000원');
  assert.deepEqual(detail.priceCandidate, { seatGrade: '전석', price: 30000, sourceQuote: '전석 30,000원' });
  assert.equal(detail.age, null);
  assert.deepEqual(detail.introImages, []);
  assert.throws(() => parseKopisDetail(detailXml, '2026-11-06T00:00:00.000Z', 'PF999'), { code: 'KOPIS_NOT_FOUND' });
  await assert.rejects(fetchKopisDetail('fake', '../bad'), { code: 'BAD_REQUEST' });
});

test('price candidate requires one unambiguous all-seats price and keeps the source', () => {
  assert.deepEqual(parseAllSeatsPrice('전석 40,000원'), { seatGrade: '전석', price: 40000, sourceQuote: '전석 40,000원' });
  for (const guide of [null, '', '전석 40,000원 ~ 60,000원', '전석 40,000원, 할인 20,000원', '전석 40,000원부터', 'VIP석 40,000원', '전석 무료', '전석 4,00원', '전석 0원', '전석 40,000원 (1인 2매)']) assert.equal(parseAllSeatsPrice(guide), null);
});

test('detail accepts only KOPIS intro images and preserves their order', () => {
  const detailXml = xml.replace('<prfstate>', '<styurls><styurl>http://www.kopis.or.kr/upload/pfmIntroImage/a.jpg</styurl><styurl>https://evil.example/upload/pfmIntroImage/b.jpg</styurl><styurl>https://kopis.or.kr/upload/pfmIntroImage/c.png</styurl></styurls><prfstate>');
  assert.deepEqual(parseKopisDetail(detailXml, '2026-11-06T00:00:00.000Z', 'PF123').introImages, ['https://www.kopis.or.kr/upload/pfmIntroImage/a.jpg', 'https://kopis.or.kr/upload/pfmIntroImage/c.png']);
});

test('capacity is matched by exact stage id, never by building total or another stage', () => {
  const venue = '<dbs><db><mt10id>FC000453</mt10id><seatscale>370</seatscale><mt13s><mt13><mt13id>FC000453-02</mt13id><seatscale>90</seatscale></mt13><mt13><mt13id>FC000453-03</mt13id><seatscale>120</seatscale></mt13></mt13s></db></dbs>';
  assert.equal(parseStageCapacity(venue, 'FC000453', 'FC000453-03'), 120);
  assert.equal(parseStageCapacity(venue, 'FC000453', 'FC000453-04'), null);
  assert.equal(parseStageCapacity(venue, 'FC999999', 'FC000453-03'), null);
  assert.equal(parseStageCapacity(venue.replace('<seatscale>120</seatscale>', '<seatscale></seatscale>'), 'FC000453', 'FC000453-03'), null);
});

test('detail falls back to unknown capacity when facility lookup fails', async () => {
  const detailXml = xml.replace('<prfstate>', '<mt10id>FC000453</mt10id><mt13id>FC000453-03</mt13id><prfstate>');
  const detail = await fetchKopisDetail('fake', 'PF123', { fetch: async (input) => String(input).includes('/pblprfr/') ? new Response(detailXml) : new Response('', { status: 503 }) });
  assert.equal(detail.stageCapacity, null);
});

test('detail uses matching facility stage capacity without treating it as inventory', async () => {
  const detailXml = xml.replace('<prfstate>', '<mt10id>FC000453</mt10id><mt13id>FC000453-03</mt13id><prfstate>');
  const facilityXml = '<dbs><db><mt10id>FC000453</mt10id><seatscale>370</seatscale><mt13s><mt13><mt13id>FC000453-03</mt13id><seatscale>120</seatscale></mt13></mt13s></db></dbs>';
  const detail = await fetchKopisDetail('fake', 'PF123', { fetch: async (input) => new Response(String(input).includes('/pblprfr/') ? detailXml : facilityXml) });
  assert.equal(detail.stageCapacity, 120);
  assert.equal(detail.facilityId, 'FC000453');
  assert.equal(detail.stageId, 'FC000453-03');
});
