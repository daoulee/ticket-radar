// Independent review probes; no real AI calls or modifications to Sol-owned code.
import { unknownFields, CheckResponseSchema } from '../../shared/index.ts';
import { catalog } from '../../server/src/catalog.ts';
import { validateGroundedExtraction } from '../../server/src/extraction.ts';
import { CheckService } from '../../server/src/service.ts';
import { comparePrice, createFindings } from '../../server/src/rules.ts';
import { readFileSync } from 'node:fs';

const entry = catalog[0];
const findings: unknown[] = [];
for (const value of [170000, 6000, 176000]) {
  const text = 'VIP 한 장 17만6천원입니다.';
  const raw = unknownFields();
  raw.price = { status: 'extracted', value, evidenceQuote: '17만6천원' };
  let accepted = false;
  try { validateGroundedExtraction(raw, text, entry); accepted = true; } catch {}
  findings.push({ probe: 'compound-korean-price', text, value, accepted });
}
const request = JSON.parse(readFileSync(new URL('../../shared/examples/manual-request.json', import.meta.url), 'utf8'));
const response = await new CheckService(null).check(request);
const noQuote = structuredClone(response);
noQuote.findings.forEach(f => { f.listingQuote = null; });
findings.push({ probe: 'missing-listing-quotes', acceptedBySharedSchema: CheckResponseSchema.safeParse(noQuote).success });

const multiple = structuredClone(entry);
const vip = multiple.context.priceTiers.find(t => t.seatGrade === 'VIP')!;
multiple.context.priceTiers = [
  { ...vip, showtimeId: entry.event.showtimes[0].id, facePrice: 100000, sourceText: 'FIRST SHOW VIP 100000' },
  { ...vip, showtimeId: entry.event.showtimes[1].id, facePrice: 200000, sourceText: 'SECOND SHOW VIP 200000' },
];
const fields = { ...response.appliedFields!, showtimeId: entry.event.showtimes[1].id, seatGrade: 'VIP' };
const price = comparePrice(multiple, fields);
const results = createFindings(multiple, fields, unknownFields(), request.listingText, price);
findings.push({ probe: 'showtime-specific-evidence', price, officialExcerpt: results[0].officialExcerpt });
findings.push({ probe: 'current-price-evidence', officialExcerpt: response.findings[0].officialExcerpt });
console.log(JSON.stringify({ scope: 'Synthetic independent probes, no AI calls', findings }, null, 2));
