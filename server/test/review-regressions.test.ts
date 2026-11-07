import test from 'node:test';
import assert from 'node:assert/strict';
import { CheckResponseSchema, FindingSchema, unknownFields } from '../../shared/index.ts';
import { validateGroundedExtraction } from '../src/extraction.ts';
import { comparePrice, createFindings } from '../src/rules.ts';
import { CheckService } from '../src/service.ts';
import { entry, confirmed, listing } from './helpers.ts';

function acceptsPrice(quote: string, value: number, text = `VIP 한 장 ${quote}입니다.`) {
  const fields = unknownFields();
  fields.price = { status: 'extracted', value, evidenceQuote: quote };
  try { validateGroundedExtraction(fields, text, entry); return true; }
  catch { return false; }
}

test('R1: 17만6천원 and spaced compound approve 176000, never either component', () => {
  for (const quote of ['17만6천원', '17만 6천 원', '17만6000원']) {
    assert.equal(acceptsPrice(quote, 176000), true, quote);
    assert.equal(acceptsPrice(quote, 170000), false, quote);
    assert.equal(acceptsPrice(quote, 6000), false, quote);
  }
});
test('R1: single amounts and separate prices are not merged', () => {
  assert.equal(acceptsPrice('17만원', 170000), true);
  assert.equal(acceptsPrice('6천원', 6000), true);
  for (const quote of ['17만원 또는 6천원', '17만원 / 6천원']) {
    assert.equal(acceptsPrice(quote, 170000), true);
    assert.equal(acceptsPrice(quote, 6000), true);
    assert.equal(acceptsPrice(quote, 176000), false);
  }
});
test('R1: malformed and unsupported composites never authorize a suffix value', () => {
  for (const quote of ['17만6만원', '6천17만원', '일십칠만6천원', '1조17만6천원', '-17만6천원']) {
    assert.equal(acceptsPrice(quote, 6000), false, quote);
    assert.equal(acceptsPrice(quote, 170000), false, quote);
  }
});

const officialPriceQuote = '·티켓 가격: 스탠딩&VIP석 176,000원 / R석 165,000원 / 시야제한 154,000원';
test('R2: officialExcerpt is the observed official price quotation, not service prose', async () => {
  const response = await new CheckService(null).check({ eventId: entry.event.id, listingText: listing,
    extractionMode: 'manual', confirmedFields: confirmed(), syntheticListing: true });
  for (const tier of entry.context.priceTiers) {
    assert.equal(tier.sourceText, officialPriceQuote);
    assert.ok(!tier.sourceText.includes('수수료·할인 제외 기본가 비교'));
  }
  assert.equal(response.findings[0].officialExcerpt, officialPriceQuote);
  assert.ok(response.findings[0].reason.includes('사용자 확인값'));
  assert.ok(response.notices.some(n => n.includes('기본가')));
});

test('R3: same seat, different sessions keep amount, quotation, URL and date together', () => {
  const multiple = structuredClone(entry);
  const vip = multiple.context.priceTiers.find(t => t.seatGrade === 'VIP')!;
  const tiers = [
    { ...vip, showtimeId: entry.event.showtimes[0].id, facePrice: 100000,
      sourceText: '합성 1회차 VIP 100000원', sourceUrl: 'https://example.invalid/first', verifiedAt: '2026-10-29' },
    { ...vip, showtimeId: entry.event.showtimes[1].id, facePrice: 200000,
      sourceText: '합성 2회차 VIP 200000원', sourceUrl: 'https://example.invalid/second', verifiedAt: '2026-11-01' },
  ];
  multiple.context.priceTiers = tiers;
  for (const tier of tiers) {
    const fields = confirmed({ showtimeId: tier.showtimeId });
    const price = comparePrice(multiple, fields);
    assert.equal(price.held, false);
    if (price.held) throw new Error('expected comparison');
    assert.equal(price.facePrice, tier.facePrice);
    const finding = createFindings(multiple, fields, unknownFields(), listing, price)[0];
    assert.equal(finding.officialExcerpt, tier.sourceText);
    assert.equal(finding.sourceUrl, tier.sourceUrl);
    assert.equal(finding.checkedAt, tier.verifiedAt);
  }
});

test('R4: conflict/matched/needs_check all require nonempty listingQuote', () => {
  for (const status of ['conflict', 'matched', 'needs_check'] as const) {
    for (const type of ['price', 'policy', 'prepayment'] as const) {
      const finding = { id: 'review', type, status, title: '합성 검토 사례',
        listingQuote: '판매글 원문', officialExcerpt: '합성 공식 근거',
        sourceUrl: 'https://example.invalid/rule', checkedAt: '2026-11-01', reason: '합성 검토 사유' };
      assert.equal(FindingSchema.safeParse(finding).success, true);
      for (const listingQuote of [null, '', '   ']) {
        assert.equal(FindingSchema.safeParse({ ...finding, listingQuote }).success, false, `${type}/${status}/${listingQuote}`);
      }
    }
  }
});
test('R4: clearing all manual response quotations is rejected; real full-text quote remains valid', async () => {
  const response = await new CheckService(null).check({ eventId: entry.event.id, listingText: listing,
    extractionMode: 'manual', confirmedFields: confirmed(), syntheticListing: true });
  assert.equal(CheckResponseSchema.safeParse(response).success, true);
  assert.ok(response.findings.every(f => f.listingQuote === listing));
  const noQuotes = structuredClone(response);
  noQuotes.findings.forEach(f => { f.listingQuote = null; });
  assert.equal(CheckResponseSchema.safeParse(noQuotes).success, false);
});

test('R1: clipped quotations cannot authorize compound price components', () => {
  for (const [amount, suffix] of [
    ['17만6천원', '6천원'],
    ['17만 6천 원', '6천 원'],
    ['17만6000원', '6000원'],
  ]) {
    const text = `VIP 한 장 ${amount}입니다.`;
    assert.equal(acceptsPrice(suffix, 6000, text), false);
    assert.equal(acceptsPrice('17만', 170000, text), false);
    assert.equal(acceptsPrice(amount, 176000, text), true);
    assert.equal(acceptsPrice(text, 176000, text), true);
  }
  assert.equal(acceptsPrice('6,000원', 6000, 'VIP 176,000원'), false);
  assert.equal(acceptsPrice('6천원', 6000, 'VIP -6천원'), false);
  assert.equal(acceptsPrice('6천원', 6000, 'VIP 1조17만6천원'), false);
  assert.equal(acceptsPrice('６천원', 6000, 'VIP １７만６천원'), false);
  assert.equal(acceptsPrice('１７만６천원', 176000, 'VIP １７만６천원'), true);
});

test('R1: any complete occurrence of a repeated quotation may support price', () => {
  for (const text of ['17만6천원 / 별도 6천원', '별도 6천원 / 17만6천원']) {
    assert.equal(acceptsPrice('6천원', 6000, text), true);
  }
  for (const text of ['17만원 / 17만6천원', '17만6천원 / 17만원']) {
    assert.equal(acceptsPrice('17만원', 170000, text), true);
  }
  assert.equal(acceptsPrice('6천원', 6000, '17만6천원 / 27만6천원'), false);
});

