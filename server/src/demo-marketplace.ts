import { randomUUID } from 'node:crypto';
import { DemoMarketEventSchema, DemoResaleListingSchema, DemoResaleRegistrationSchema, DemoPurchaseRequestSchema, DemoPurchaseReviewSchema, type DemoMarketEvent, type DemoResaleListing, type DemoPurchaseReview } from '../../shared/marketplace.ts';
import { ApiError } from './errors.ts';

// 이 숫자는 합성 시연 데이터다. 실제 공연·재고·매물·발권 권한이 아니다.
const events: DemoMarketEvent[] = [DemoMarketEventSchema.parse({
  id: 'demo-market-live', title: '레이더 라이브 2026', venue: '가상 아레나', isSynthetic: true,
  showtimes: [{ id: 'demo-market-live-s1', startsAt: '2026-11-21T19:00:00+09:00', label: '11월 21일 19:00' }],
  inventory: [{ showtimeId: 'demo-market-live-s1', seatGrade: 'VIP', unitPrice: 154000, simulatedQuantityAvailable: 12 }, { showtimeId: 'demo-market-live-s1', seatGrade: 'R', unitPrice: 132000, simulatedQuantityAvailable: 3 }],
}), DemoMarketEventSchema.parse({
  id: 'demo-market-compass', title: '뮤지컬 나침반', venue: '가상 극장', isSynthetic: true,
  showtimes: [{ id: 'demo-market-compass-s1', startsAt: '2026-12-05T14:00:00+09:00', label: '12월 5일 14:00' }],
  inventory: [{ showtimeId: 'demo-market-compass-s1', seatGrade: 'R', unitPrice: 110000, simulatedQuantityAvailable: 8 }, { showtimeId: 'demo-market-compass-s1', seatGrade: 'S', unitPrice: 88000, simulatedQuantityAvailable: 3 }],
})];
const listings: DemoResaleListing[] = [DemoResaleListingSchema.parse({
  id: 'resale-1', eventId: 'demo-market-live', showtimeId: 'demo-market-live-s1', seatGrade: 'R',
  originalUnitPrice: 132000, listingUnitPrice: 132000, simulatedQuantityAvailable: 1, status: 'available', isSynthetic: true,
  deliveryMethod: 'not_specified', ownershipVerified: false, originalPriceVerified: false, transferEligibilityVerified: false,
}), DemoResaleListingSchema.parse({
  id: 'resale-2', eventId: 'demo-market-compass', showtimeId: 'demo-market-compass-s1', seatGrade: 'S',
  originalUnitPrice: 88000, listingUnitPrice: 88000, simulatedQuantityAvailable: 2, status: 'available', isSynthetic: true,
  deliveryMethod: 'not_specified', ownershipVerified: false, originalPriceVerified: false, transferEligibilityVerified: false,
})];

export class DemoMarketplace {
  private readonly catalog: DemoMarketEvent[];
  private readonly resale: DemoResaleListing[];
  constructor(catalog: DemoMarketEvent[] = events, resale: DemoResaleListing[] = listings) {
    this.catalog = catalog.map(event => DemoMarketEventSchema.parse(event));
    this.resale = resale.map(listing => DemoResaleListingSchema.parse(listing));
    if (new Set(this.catalog.map(event => event.id)).size !== this.catalog.length || new Set(this.resale.map(listing => listing.id)).size !== this.resale.length) throw new Error('시연 데이터 ID가 중복됩니다.');
    for (const listing of this.resale) {
      const event = this.catalog.find(item => item.id === listing.eventId);
      if (!event || !event.inventory.some(item => item.showtimeId === listing.showtimeId && item.seatGrade === listing.seatGrade)) throw new Error('시연 매물의 공연·회차·좌석을 찾을 수 없습니다.');
    }
  }
  listEvents(): DemoMarketEvent[] { return structuredClone(this.catalog); }
  listResale(): DemoResaleListing[] { return structuredClone(this.resale); }
  /** 판매자의 보유·구매가·공식 양도 가능 여부는 검증하지 않는 가상 등록. 메모리에서만 유지한다. */
  registerResale(raw: unknown): DemoResaleListing {
    const parsed = DemoResaleRegistrationSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError('DEMO_INVALID_LISTING', '시연 양도 정보와 동일한 구매가·양도가를 확인해 주세요.');
    const req = parsed.data;
    const event = this.catalog.find(item => item.id === req.eventId);
    if (!event || !event.showtimes.some(showtime => showtime.id === req.showtimeId)) throw new ApiError('DEMO_EVENT_MISMATCH', '시연 공연과 회차가 일치하지 않습니다.', 404);
    if (!event.inventory.some(item => item.showtimeId === req.showtimeId && item.seatGrade === req.seatGrade)) throw new ApiError('DEMO_GRADE_MISMATCH', '시연 회차의 좌석 등급이 아닙니다.', 404);
    const listing = DemoResaleListingSchema.parse({ ...req, id: `demo-resale-${randomUUID()}`, status: 'available', ownershipVerified: false, originalPriceVerified: false, transferEligibilityVerified: false });
    this.resale.push(listing);
    return structuredClone(listing);
  }
  /** 가격은 입력으로 받지 않고 시연 목록에서 결정한다. 예약·결제·재고 변경은 하지 않는다. */
  prepareReview(raw: unknown): DemoPurchaseReview {
    const parsed = DemoPurchaseRequestSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError('DEMO_INVALID_REQUEST', '시연 공연과 수량을 다시 확인해 주세요.');
    const req = parsed.data;
    const event = this.catalog.find(item => item.id === req.eventId);
    if (!event || !event.showtimes.some(showtime => showtime.id === req.showtimeId)) throw new ApiError('DEMO_EVENT_MISMATCH', '시연 공연과 회차가 일치하지 않습니다.', 404);
    const inventory = event.inventory.find(item => item.showtimeId === req.showtimeId && item.seatGrade === req.seatGrade);
    if (!inventory) throw new ApiError('DEMO_GRADE_MISMATCH', '시연 회차의 좌석 등급이 아닙니다.', 404);
    let unitPrice: number, listingId: string | null = null;
    if (req.source === 'primary_demo') {
      if (req.quantity > inventory.simulatedQuantityAvailable) throw new ApiError('DEMO_QUANTITY_UNAVAILABLE', '시연 잔여 수량을 초과했습니다.', 409);
      unitPrice = inventory.unitPrice;
    } else {
      const listing = this.resale.find(item => item.id === req.listingId);
      if (!listing || listing.status !== 'available') throw new ApiError('DEMO_LISTING_UNAVAILABLE', '선택한 시연 매물을 이용할 수 없습니다.', 404);
      if (listing.eventId !== req.eventId || listing.showtimeId !== req.showtimeId || listing.seatGrade !== req.seatGrade) throw new ApiError('DEMO_LISTING_MISMATCH', '시연 매물의 공연·회차·좌석이 일치하지 않습니다.', 409);
      if (listing.originalUnitPrice !== listing.listingUnitPrice) throw new ApiError('DEMO_PRICE_MISMATCH', '시연 양도가격은 시연 구매가와 같아야 합니다.', 409);
      if (req.quantity > listing.simulatedQuantityAvailable) throw new ApiError('DEMO_QUANTITY_UNAVAILABLE', '시연 잔여 수량을 초과했습니다.', 409);
      unitPrice = listing.listingUnitPrice; listingId = listing.id;
    }
    return DemoPurchaseReviewSchema.parse({ source: req.source, eventId: req.eventId, showtimeId: req.showtimeId, seatGrade: req.seatGrade, quantity: req.quantity, unitPrice, priceSum: unitPrice * req.quantity, listingId, status: 'review_only', isSynthetic: true, paymentAvailable: false, reservationMade: false, ownershipVerified: false, originalPriceVerified: false, transferEligibilityVerified: false });
  }
}
