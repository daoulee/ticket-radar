// 공통 계약은 Sol 소유 `@ticket-radar/shared`(../shared/index.ts, v0.1.0)를 그대로 쓴다.
// 이 파일은 웹이 자주 쓰는 하위 타입 별칭만 둔다. 계약 필드를 웹에서 새로 정의하지 않는다.
import type { CheckResponse, ExtractedFields, ListingFields, OfficialContext } from '@ticket-radar/shared'

export type {
  ApiErrorBody,
  CheckRequestInput,
  CheckResponse,
  DeliveryMethod,
  EventSummary,
  ExtractedFields,
  ExtractionMetadata,
  FieldKey,
  Finding,
  ListingFields,
  OfficialContext,
  PriceComparison,
} from '@ticket-radar/shared'
export { CONTRACT_VERSION, FIELD_KEYS, unknownFields } from '@ticket-radar/shared'

export type Showtime = { id: string; startsAt: string; label: string }
export type PriceTier = OfficialContext['priceTiers'][number]
export type TicketPolicy = OfficialContext['policies'][number]
export type PolicyType = TicketPolicy['type']
export type PolicyScope = TicketPolicy['scope']
export type FindingStatus = CheckResponse['findings'][number]['status']
export type ExtractionMethod = CheckResponse['extraction']['method']
export type BookingType = NonNullable<ListingFields['bookingType']>
export type PriceBasis = NonNullable<ListingFields['priceBasis']>
export type FeeBasis = NonNullable<ListingFields['feeBasis']>
export type DiscountStatus = NonNullable<ListingFields['discountStatus']>
export type ExtractedField = ExtractedFields[keyof ExtractedFields]
