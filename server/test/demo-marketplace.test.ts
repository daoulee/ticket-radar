import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoMarketEventSchema, DemoPurchaseRequestSchema, DemoPurchaseReviewSchema, DemoResaleListingSchema, DemoResaleRegistrationSchema } from '../../shared/marketplace.ts';
import { DemoMarketplace } from '../src/demo-marketplace.ts';

const market = () => new DemoMarketplace();
const primary = { source: 'primary_demo', eventId: 'demo-market-live', showtimeId: 'demo-market-live-s1', seatGrade: 'VIP', quantity: 2 } as const;
const resale = { ...primary, source: 'resale_demo', listingId: 'resale-1', seatGrade: 'R', quantity: 1 } as const;

test('시연 최초예매·양도는 목록의 금액을 사용하며 예약·결제 없이 검토만 한다', () => {
  for (const request of [primary, resale]) {
    const review = market().prepareReview(request);
    assert.equal(review.unitPrice, request.source === 'primary_demo' ? 154000 : 132000);
    assert.equal(review.priceSum, request.source === 'primary_demo' ? 308000 : 132000);
    assert.equal(review.status, 'review_only'); assert.equal(review.isSynthetic, true);
    assert.equal(review.paymentAvailable, false); assert.equal(review.reservationMade, false);
    assert.equal(review.ownershipVerified, false); assert.equal(review.originalPriceVerified, false); assert.equal(review.transferEligibilityVerified, false);
    assert.equal(review.listingId, request.source === 'resale_demo' ? 'resale-1' : null);
  }
});

test('클라이언트 임의 가격과 실제 공연 데이터는 시연 구매 요청으로 받아들이지 않는다', () => {
  assert.equal(DemoPurchaseRequestSchema.safeParse({ ...primary, unitPrice: 1 }).success, false);
  assert.throws(() => market().prepareReview({ ...primary, eventId: 'PF123456' }), { code: 'DEMO_EVENT_MISMATCH' });
  assert.equal(DemoMarketEventSchema.safeParse({ ...market().listEvents()[0], isSynthetic: false }).success, false);
});

test('양도 매물은 시연 구매가 이하를 허용하고 초과를 거부한다', () => {
  const listing = market().listResale()[0];
  assert.equal(DemoResaleListingSchema.safeParse({ ...listing, listingUnitPrice: listing.originalUnitPrice + 1 }).success, false);
  assert.equal(DemoResaleListingSchema.safeParse({ ...listing, listingUnitPrice: listing.originalUnitPrice - 1 }).success, true);
  assert.equal(DemoResaleListingSchema.safeParse({ ...listing, listingUnitPrice: listing.originalUnitPrice }).success, true);
});

test('가상 판매자는 시연 매물을 등록하고 확인할 수 있지만 보유·원가·양도 권한은 검증하지 않는다', () => {
  const m = market();
  const request = { eventId: 'demo-market-live', showtimeId: 'demo-market-live-s1', seatGrade: 'VIP', originalUnitPrice: 130000, listingUnitPrice: 130000, simulatedQuantityAvailable: 2, deliveryMethod: 'not_specified', isSynthetic: true };
  const listing = m.registerResale(request);
  assert.match(listing.id, /^demo-resale-/); assert.equal(listing.status, 'available');
  assert.equal(listing.ownershipVerified, false); assert.equal(listing.originalPriceVerified, false); assert.equal(listing.transferEligibilityVerified, false);
  assert.equal(m.listResale().length, 3);
  const review = m.prepareReview({ ...resale, seatGrade: 'VIP', quantity: 2, listingId: listing.id });
  assert.equal(review.unitPrice, 130000); assert.equal(review.priceSum, 260000);
  assert.equal(review.reservationMade, false); assert.equal(m.listResale().length, 3);
});

test('시연 매물 등록은 구매가 초과, 잘못된 공연·회차·등급, 수량, 검증 주장과 비시연 데이터를 거부한다', () => {
  const base = { eventId: 'demo-market-live', showtimeId: 'demo-market-live-s1', seatGrade: 'VIP', originalUnitPrice: 130000, listingUnitPrice: 130000, simulatedQuantityAvailable: 2, deliveryMethod: 'not_specified', isSynthetic: true };
  for (const update of [{ listingUnitPrice: 130001 }, { simulatedQuantityAvailable: 0 }, { isSynthetic: false }, { ownershipVerified: true }, { deliveryMethod: 'official_transfer' }]) {
    assert.equal(DemoResaleRegistrationSchema.safeParse({ ...base, ...update }).success, false);
    assert.throws(() => market().registerResale({ ...base, ...update }), { code: 'DEMO_INVALID_LISTING' });
  }
  assert.throws(() => market().registerResale({ ...base, eventId: 'PF123456' }), { code: 'DEMO_EVENT_MISMATCH' });
  assert.throws(() => market().registerResale({ ...base, showtimeId: 'other' }), { code: 'DEMO_EVENT_MISMATCH' });
  assert.throws(() => market().registerResale({ ...base, seatGrade: 'other' }), { code: 'DEMO_GRADE_MISMATCH' });
  const discountedMarket = market();
  const discounted = discountedMarket.registerResale({ ...base, listingUnitPrice: 129999 });
  assert.equal(discounted.listingUnitPrice, 129999);
  assert.equal(discountedMarket.prepareReview({ ...resale, seatGrade: 'VIP', listingId: discounted.id }).unitPrice, 129999);
  assert.throws(() => market().registerResale({ ...base, originalUnitPrice: 200000, listingUnitPrice: 154001 }), { code: 'DEMO_PRICE_ABOVE_FACE' });
  assert.equal(market().registerResale({ ...base, originalUnitPrice: 200000, listingUnitPrice: 154000 }).listingUnitPrice, 154000);
});

test('공연·회차·좌석 불일치와 판매 불가 매물을 거부한다', () => {
  assert.throws(() => market().prepareReview({ ...resale, eventId: 'other' }), { code: 'DEMO_EVENT_MISMATCH' });
  assert.throws(() => market().prepareReview({ ...resale, showtimeId: 'other' }), { code: 'DEMO_EVENT_MISMATCH' });
  assert.throws(() => market().prepareReview({ ...resale, seatGrade: 'VIP' }), { code: 'DEMO_LISTING_MISMATCH' });
  const fixture = market();
  const unavailable = new DemoMarketplace(fixture.listEvents(), [{ ...fixture.listResale()[0], status: 'unavailable' }]);
  assert.throws(() => unavailable.prepareReview(resale), { code: 'DEMO_LISTING_UNAVAILABLE' });
  assert.throws(() => new DemoMarketplace(fixture.listEvents(), [{ ...fixture.listResale()[0], eventId: 'other' }]));
  assert.throws(() => new DemoMarketplace(fixture.listEvents(), [{ ...fixture.listResale()[0], seatGrade: 'other' }]));
});

test('수량이 0, 소수 또는 시연 수량 초과면 검토할 수 없다', () => {
  for (const quantity of [0, -1, 1.5, 101]) assert.throws(() => market().prepareReview({ ...primary, quantity }), { code: 'DEMO_INVALID_REQUEST' });
  assert.throws(() => market().prepareReview({ ...primary, quantity: 13 }), { code: 'DEMO_QUANTITY_UNAVAILABLE' });
  assert.throws(() => market().prepareReview({ ...resale, quantity: 2 }), { code: 'DEMO_QUANTITY_UNAVAILABLE' });
});

test('가격 합계 조작·시연 해제·결제 또는 예약 성공 표시를 계약이 거부한다', () => {
  const result = market().prepareReview(primary);
  for (const update of [{ priceSum: 1 }, { isSynthetic: false }, { paymentAvailable: true }, { reservationMade: true }, { ownershipVerified: true }, { originalPriceVerified: true }, { transferEligibilityVerified: true }, { status: 'paid' }]) {
    assert.equal(DemoPurchaseReviewSchema.safeParse({ ...result, ...update }).success, false);
  }
});

test('반복 검토는 잔여 수량을 바꾸지 않고 외부 복사본 변경도 fixture를 바꾸지 않는다', () => {
  const m = market(), copy = m.listEvents();
  copy[0].inventory[0].unitPrice = 1;
  assert.equal(m.prepareReview(primary).unitPrice, 154000);
  assert.deepEqual(m.prepareReview(primary), m.prepareReview(primary));
  assert.equal(m.listEvents()[0].inventory[0].simulatedQuantityAvailable, 12);
});

test('나침반 시연 공연과 매물은 회차·등급·가격·수량이 일치한다', () => {
  const m = market();
  const event = m.listEvents().find(item => item.id === 'demo-market-compass')!;
  assert.equal(event.title, '뮤지컬 나침반'); assert.equal(event.venue, '가상 극장');
  assert.equal(event.showtimes[0].startsAt, '2026-12-05T14:00:00+09:00');
  assert.deepEqual(event.inventory.map(item => [item.seatGrade, item.unitPrice, item.simulatedQuantityAvailable]), [['R', 110000, 8], ['S', 88000, 3]]);
  const review = m.prepareReview({ source: 'resale_demo', eventId: event.id, showtimeId: 'demo-market-compass-s1', seatGrade: 'S', quantity: 2, listingId: 'resale-2' });
  assert.equal(review.priceSum, 176000); assert.equal(review.reservationMade, false);
});
