import { ListingFieldsSchema, unknownFields, type ExtractedFields, type ListingFields } from '../../shared/index.ts';
import { catalog } from '../src/catalog.ts';
import type { ExtractionProvider } from '../src/extraction.ts';

export const entry = catalog[0];
export const listing = 'AKMU 대구 11월 21일 오후 5시 VIP 1매, 티켓 금액만 25만원, 할인 없이 구매했습니다. 팬클럽 선예매 티켓이고 예매자는 저지만 구매자 혼자 가면 됩니다. QR 캡처 전달, 입금 먼저 부탁드립니다.';
export function sampleExtraction(): ExtractedFields {
  return {
    ...unknownFields(),
    listingEventId: { status: 'extracted', value: entry.event.id, evidenceQuote: 'AKMU 대구' },
    showtimeId: { status: 'extracted', value: entry.event.showtimes[0].id, evidenceQuote: '11월 21일 오후 5시' },
    seatGrade: { status: 'extracted', value: 'VIP', evidenceQuote: 'VIP' },
    price: { status: 'extracted', value: 250000, evidenceQuote: '25만원' },
    quantity: { status: 'extracted', value: 1, evidenceQuote: '1매' },
    deliveryMethod: { status: 'extracted', value: 'qr_capture', evidenceQuote: 'QR 캡처' },
    prepaymentRequested: { status: 'extracted', value: true, evidenceQuote: '입금 먼저' },
    bookingType: { status: 'extracted', value: 'fanclub_presale', evidenceQuote: '팬클럽 선예매' },
    priceBasis: { status: 'extracted', value: 'per_ticket', evidenceQuote: '1매' },
    feeBasis: { status: 'extracted', value: 'ticket_only', evidenceQuote: '티켓 금액만' },
    discountStatus: { status: 'extracted', value: 'standard', evidenceQuote: '할인 없이' },
    buyerIsBooker: { status: 'extracted', value: false, evidenceQuote: '예매자는 저지만 구매자 혼자' },
  };
}
export function confirmed(overrides: Partial<ListingFields> = {}): ListingFields {
  return ListingFieldsSchema.parse({ ...Object.fromEntries(Object.entries(sampleExtraction()).map(([k, v]) => [k, v.value])), ...overrides });
}
export function fixtureProvider(raw: unknown = sampleExtraction()): ExtractionProvider & { calls: number } {
  return { name: 'test-fixture', model: null, method: 'fixture', calls: 0,
    async extract() { this.calls++; return structuredClone(raw); } };
}
