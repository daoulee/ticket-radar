import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EventSummarySchema, OfficialContextSchema, type EventSummary, type OfficialContext } from '../../shared/index.ts';

// Import only the reviewed snapshot. No arbitrary user URL fetches or crawling.
const raw = readFileSync(new URL('../../docs/official/demo-event-akmu.json', import.meta.url), 'utf8');
const snapshot = JSON.parse(raw);
// Sol-owned supplement: an observed quotation, not a generated price explanation.
// Canonical docs/official edits remain Astra's responsibility.
const priceEvidenceRaw = readFileSync(new URL('../data/akmu-price-evidence.json', import.meta.url), 'utf8');
const priceEvidence = JSON.parse(priceEvidenceRaw);
if (priceEvidence.eventId !== snapshot.eventId || priceEvidence.sourceUrl !== snapshot.sourceUrl ||
    typeof priceEvidence.sourceText !== 'string' || !priceEvidence.sourceText.trim() ||
    !Object.values(snapshot.pricesKrw).every(price => priceEvidence.sourceText.includes(Number(price).toLocaleString('en-US')))) {
  throw new Error('Official price quotation is missing or does not match the reviewed snapshot');
}
const version = `sha256:${createHash('sha256').update(raw).update('\n').update(priceEvidenceRaw).digest('hex')}`;
export interface CatalogEntry { event: EventSummary; context: OfficialContext; aliases: string[] }
export const catalog: CatalogEntry[] = [{
  aliases: ['AKMU', '악뮤', '대구'],
  event: EventSummarySchema.parse({
    id: snapshot.eventId, title: snapshot.title, venue: null,
    showtimes: snapshot.showtimes.map((startsAt: string, i: number) => ({ id: `${snapshot.eventId}-s${i + 1}`, startsAt, label: startsAt })),
    officialUrl: snapshot.sourceUrl, sourceCheckedAt: snapshot.verifiedDate, isDemo: false,
  }),
  context: OfficialContextSchema.parse({
    eventId: snapshot.eventId, isDemo: false, sourceType: 'official', sourceVersion: version, sourceDatePrecision: 'date',
    priceTiers: Object.entries(snapshot.pricesKrw).map(([key, price]) => ({
      seatGrade: ({ standing: '스탠딩', restrictedView: '시야제한' } as Record<string, string>)[key] ?? key,
      showtimeId: null, facePrice: price,
      sourceText: priceEvidence.sourceText,
      sourceUrl: priceEvidence.sourceUrl, verifiedAt: priceEvidence.verifiedDate,
      priceBasis: 'per_ticket', feeBasis: 'ticket_only', discountStatus: 'standard',
    })),
    policies: snapshot.policies.map((p: { scope: string; shortQuote: string }, i: number) => ({
      id: `identity-${i + 1}`, type: 'identity_check', title: '팬클럽 선예매 관람자 본인 확인',
      excerpt: p.shortQuote, sourceUrl: snapshot.sourceUrl, verifiedAt: snapshot.verifiedDate, scope: p.scope,
    })),
  }),
}];
