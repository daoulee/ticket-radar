// 앱이 쓰는 계약 타입. 단일 출처는 Sol 소유 공통 계약 `@ticket-radar/shared`(shared/index.ts, v0.1.0)이며
// 이 파일은 그것을 다시 내보내고 화면에서 자주 쓰는 하위 타입 이름만 붙인다. 필드를 추가·변경하지 않는다.
// (2026-11-01 이전에는 웹 임시 계약 사본이었다.)
import type {
  CheckResponse,
  EventSummary,
  ExtractedFields,
  FieldKey,
  Finding,
  OfficialContext,
} from '@ticket-radar/shared';

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
} from '@ticket-radar/shared';

export type DataMode = CheckResponse['dataMode'];
export type Showtime = EventSummary['showtimes'][number];
export type PriceTier = OfficialContext['priceTiers'][number];
export type TicketPolicy = OfficialContext['policies'][number];
export type PolicyType = TicketPolicy['type'];
export type PolicyScope = TicketPolicy['scope'];
export type FindingStatus = Finding['status'];
export type ExtractedField<K extends FieldKey = FieldKey> = ExtractedFields[K];
export type ExtractionStatus = ExtractedField['status'];
export type Provenance = CheckResponse['provenance'];
