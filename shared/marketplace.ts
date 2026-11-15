import { z } from 'zod';

// 모든 데이터와 수량은 시연용이며 실제 판매 권한이나 재고가 아니다.
const id = z.string().trim().min(1).max(120);
const won = z.number().int().positive().max(100_000_000);
const quantity = z.number().int().min(1).max(100);

export const DemoMarketShowtimeSchema = z.strictObject({ id, startsAt: z.iso.datetime({ offset: true }), label: z.string().trim().min(1).max(120) });
export const DemoMarketInventorySchema = z.strictObject({ showtimeId: id, seatGrade: id, unitPrice: won, simulatedQuantityAvailable: z.number().int().min(0).max(100) });
export const DemoMarketEventSchema = z.strictObject({
  id, title: z.string().trim().min(1).max(200), venue: z.string().trim().min(1).max(200),
  isSynthetic: z.literal(true), showtimes: z.array(DemoMarketShowtimeSchema).min(1), inventory: z.array(DemoMarketInventorySchema).min(1),
}).superRefine((event, ctx) => {
  const ids = new Set(event.showtimes.map(showtime => showtime.id));
  if (ids.size !== event.showtimes.length) ctx.addIssue({ code: 'custom', message: '시연 회차 ID가 중복됩니다.' });
  const pairs = new Set<string>();
  event.inventory.forEach((item, index) => {
    if (!ids.has(item.showtimeId)) ctx.addIssue({ code: 'custom', path: ['inventory', index, 'showtimeId'], message: '시연 공연의 회차가 아닙니다.' });
    const key = JSON.stringify([item.showtimeId, item.seatGrade]);
    if (pairs.has(key)) ctx.addIssue({ code: 'custom', path: ['inventory', index], message: '회차와 좌석 등급이 중복됩니다.' });
    pairs.add(key);
  });
});

const resaleCore = {
  eventId: id, showtimeId: id, seatGrade: id, originalUnitPrice: won, listingUnitPrice: won,
  simulatedQuantityAvailable: quantity, deliveryMethod: z.enum(['not_specified', 'other']), isSynthetic: z.literal(true),
};
export const DemoResaleRegistrationSchema = z.strictObject(resaleCore).superRefine((listing, ctx) => {
  if (listing.listingUnitPrice > listing.originalUnitPrice) ctx.addIssue({ code: 'custom', path: ['listingUnitPrice'], message: '시연 양도가격은 시연 구매가 이하여야 합니다.' });
});
export const DemoResaleListingSchema = z.strictObject({
  id, eventId: id, showtimeId: id, seatGrade: id, originalUnitPrice: won, listingUnitPrice: won,
  simulatedQuantityAvailable: quantity, deliveryMethod: z.enum(['not_specified', 'other']),
  ownershipVerified: z.literal(false), originalPriceVerified: z.literal(false), transferEligibilityVerified: z.literal(false),
  status: z.enum(['available', 'unavailable']), isSynthetic: z.literal(true),
}).superRefine((listing, ctx) => {
  if (listing.listingUnitPrice > listing.originalUnitPrice) ctx.addIssue({ code: 'custom', path: ['listingUnitPrice'], message: '시연 양도가격은 시연 구매가 이하여야 합니다.' });
});

export const DemoPurchaseRequestSchema = z.discriminatedUnion('source', [
  z.strictObject({ source: z.literal('primary_demo'), eventId: id, showtimeId: id, seatGrade: id, quantity }),
  z.strictObject({ source: z.literal('resale_demo'), eventId: id, showtimeId: id, seatGrade: id, quantity, listingId: id }),
]);
export const DemoPurchaseReviewSchema = z.strictObject({
  source: z.enum(['primary_demo', 'resale_demo']), eventId: id, showtimeId: id, seatGrade: id, quantity,
  unitPrice: won, priceSum: z.number().int().positive(), listingId: id.nullable(),
  status: z.literal('review_only'), isSynthetic: z.literal(true), paymentAvailable: z.literal(false), reservationMade: z.literal(false),
  ownershipVerified: z.literal(false), originalPriceVerified: z.literal(false), transferEligibilityVerified: z.literal(false),
}).superRefine((review, ctx) => {
  if (review.priceSum !== review.quantity * review.unitPrice) ctx.addIssue({ code: 'custom', path: ['priceSum'], message: '시연 금액 합계가 일치하지 않습니다.' });
  if ((review.source === 'resale_demo') !== (review.listingId !== null)) ctx.addIssue({ code: 'custom', path: ['listingId'], message: '시연 양도 매물 ID가 일치하지 않습니다.' });
});
export type DemoMarketEvent = z.infer<typeof DemoMarketEventSchema>;
export type DemoResaleListing = z.infer<typeof DemoResaleListingSchema>;
export type DemoResaleRegistration = z.infer<typeof DemoResaleRegistrationSchema>;
export type DemoPurchaseRequest = z.infer<typeof DemoPurchaseRequestSchema>;
export type DemoPurchaseReview = z.infer<typeof DemoPurchaseReviewSchema>;
