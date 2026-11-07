import { mkdirSync, writeFileSync } from 'node:fs';
import { CheckService } from '../src/service.ts';
import { catalog } from '../src/catalog.ts';
import { ApiError } from '../src/errors.ts';
import { CheckRequestSchema } from '../../shared/index.ts';

const entry = catalog[0];
const request = CheckRequestSchema.parse({
  eventId: entry.event.id,
  listingText: 'AKMU 대구 11월 21일 오후 5시 VIP 1매, 티켓 금액만 25만원입니다. 팬클럽 선예매로 샀고 예매자는 저지만 구매자 혼자 가면 됩니다.',
  extractionMode: 'manual', syntheticListing: true,
  confirmedFields: {
    listingEventId: entry.event.id, showtimeId: entry.event.showtimes[0].id, seatGrade: 'VIP', price: 250000,
    quantity: 1, deliveryMethod: null, prepaymentRequested: null, bookingType: 'fanclub_presale',
    priceBasis: 'per_ticket', feeBasis: 'ticket_only', discountStatus: 'standard', buyerIsBooker: false,
  },
});
const out = new URL('../../shared/examples/', import.meta.url); mkdirSync(out, { recursive: true });
function save(name: string, value: unknown) { writeFileSync(new URL(name, out), JSON.stringify(value, null, 2) + '\n'); }
const service = new CheckService();
save('manual-request.json', request);
save('manual-response.json', await service.check(request));
const { confirmedFields: _, ...unconfirmed } = request;
const modelRequest = { ...unconfirmed, extractionMode: 'model' as const };
save('model-request.json', modelRequest);
try { await service.check(modelRequest); } catch (error) {
  if (!(error instanceof ApiError)) throw error;
  save('ai-not-configured.json', { httpStatus: error.status, body: error.body() });
}
save('events.json', catalog.map(e => e.event)); save('official-context.json', entry.context);
console.log('Generated explicit manual/synthetic examples; no model request was sent.');
