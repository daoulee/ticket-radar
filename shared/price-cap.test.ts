import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPriceCap, type PriceCapEvidence, type PriceCapInput } from './price-cap.ts';

const input: PriceCapInput = { eventId: 'event', sessionId: 'session', seatGrade: 'VIP', pricePerTicket: 100000, priceBasis: 'ticket_only', isDemo: false };
const evidence: PriceCapEvidence = { ...input, priceBasis: 'ticket_only', sourceUrl: 'https://example.org/official', verifiedAt: '2026-11-06' };

test('allows verified face price or less and blocks higher values', () => {
  assert.deepEqual(checkPriceCap(input, evidence), { allowed: true, limit: 100000 });
  assert.equal(checkPriceCap({ ...input, pricePerTicket: 99999 }, evidence).allowed, true);
  assert.deepEqual(checkPriceCap({ ...input, pricePerTicket: 100001 }, evidence), { allowed: false, reason: 'PRICE_ABOVE_CAP', limit: 100000 });
});

test('holds missing, mismatched, or unverified evidence', () => {
  for (const changed of [null, { ...evidence, eventId: 'other' }, { ...evidence, sessionId: 'other' }, { ...evidence, seatGrade: 'R' }, { ...evidence, isDemo: true }, { ...evidence, sourceUrl: '' }, { ...evidence, verifiedAt: 'invalid' }]) {
    assert.deepEqual(checkPriceCap(input, changed), { allowed: false, reason: 'PRICE_UNVERIFIED', limit: null });
  }
  assert.equal(checkPriceCap({ ...input, priceBasis: 'unknown' }, evidence).allowed, false);
  assert.equal(checkPriceCap({ ...input, pricePerTicket: 0 }, evidence).allowed, false);
});
