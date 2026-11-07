import { FIELD_KEYS } from '@ticket-radar/shared';
import type { ListingFields } from '../contract/types';

// 확인값 12개 필드의 빈 상태. 모르는 값은 null(미확인)이며 서버는 비교를 보류한다. 앱이 값을 추측해 채우지 않는다.
export const EMPTY_FIELDS: ListingFields = {
  showtimeId: null,
  seatGrade: null,
  price: null,
  quantity: null,
  deliveryMethod: null,
  prepaymentRequested: null,
  listingEventId: null,
  bookingType: null,
  priceBasis: null,
  feeBasis: null,
  discountStatus: null,
  buyerIsBooker: null,
};

export function sameListingFields(a: ListingFields, b: ListingFields) {
  return FIELD_KEYS.every((key) => a[key] === b[key]);
}
