import { FIELD_KEYS } from '@ticket-radar/shared';
import type {
  ExtractedFields,
  ExtractionMetadata,
  EventSummary,
  FieldKey,
  ListingFields,
  Provenance,
  Showtime,
} from '../contract/types';
import {
  BOOKING_TYPE_LABELS,
  DELIVERY_LABELS,
  DISCOUNT_LABELS,
  FEE_BASIS_LABELS,
  formatWon,
  PRICE_BASIS_LABELS,
} from './format';

// 앱 화면에서만 쓰는 표시 문구. 값을 바꾸거나 판단하지 않고 사람이 읽을 글자로만 바꾼다.
export const FIELD_LABELS: Record<FieldKey, string> = {
  showtimeId: '회차',
  seatGrade: '좌석 등급',
  price: '가격',
  quantity: '매수',
  deliveryMethod: '전달 방식',
  prepaymentRequested: '선입금 요구',
  listingEventId: '선택한 공연의 판매글인가',
  bookingType: '예매 유형',
  priceBasis: '가격 기준',
  feeBasis: '수수료 포함 여부',
  discountStatus: '할인 여부',
  buyerIsBooker: '구매자가 예매자 본인인가',
};

// 공통 계약의 필드 순서를 그대로 쓴다(앞 6개는 기존 화면 필드, 뒤 6개는 v0.1.0 비교 전제 조건).
export const FIELD_ORDER: FieldKey[] = FIELD_KEYS;

// 추출값을 어떤 방식으로 얻었는지. AI 호출이 없었으면 AI 추출로 보이지 않게 한다(웹과 같은 기준).
// actualModelCall 은 '이번 요청'에서 모델을 호출했는지, reused 는 이전 추출을 재사용했는지다.
export function extractionText(info: ExtractionMetadata | undefined): string {
  if (!info) return '추출 방식 정보 없음 (서버 응답에 없음)';
  if (info.method === 'fixture') return '시연 fixture 조회 · AI 호출 없음';
  if (info.method === 'manual') return 'AI 추출 없음 · 사용자가 직접 입력';
  // 모델 이름이 제공자 이름으로 시작하면(gemini gemini-…) 한 번만 쓴다.
  const who = (info.provider && info.model?.toLowerCase().startsWith(info.provider.toLowerCase()) ? info.model : [info.provider, info.model].filter(Boolean).join(' ')) || '모델 정보 없음';
  if (info.reused) return `AI 모델 추출 결과 재사용 · ${who} · 이번 요청에서는 모델 호출 없음`;
  if (info.actualModelCall) return `AI 모델 추출 · ${who} · 추출값은 후보입니다`;
  return `AI 모델 추출로 표시됐으나 호출 기록 없음 · ${who}`;
}

// 데이터 출처 표시. dataMode 는 HTTP 연결 여부가 아니라 합성 자료 포함 여부다.
export function provenanceLines(p: Provenance): string[] {
  return [
    p.syntheticListing ? '판매글: 시연용 합성 문장' : '판매글: 사용자가 입력한 실제 문장',
    p.officialSourceType === 'official' ? '공식 자료: 공식 공지 스냅샷' : '공식 자료: 시연용 합성 자료',
    `자료 버전: ${shortVersion(p.sourceVersion)}`,
  ];
}

function shortVersion(v: string) {
  return v.startsWith('sha256:') ? `${v.slice(0, 19)}…` : v;
}

// 서버 회차 label 이 ISO 시각 문자열이면 startsAt 을 한국 시간으로 읽기 쉽게 바꿔 보여준다(값 자체는 바꾸지 않음).
const ISO_LIKE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const showtimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function showtimeLabel(showtime: Showtime): string {
  if (!ISO_LIKE.test(showtime.label)) return showtime.label;
  const date = new Date(showtime.startsAt);
  return Number.isNaN(date.getTime()) ? showtime.label : showtimeFormat.format(date);
}

export const EXTRACTION_STATUS_TEXT = {
  extracted: '판매글에서 추출',
  ambiguous: '후보 여러 개 · 확인 필요',
  unknown: '판매글에서 찾지 못함 · 확인 필요',
} as const;

export function displayValue<K extends FieldKey>(
  key: K,
  value: ListingFields[K] | null | undefined,
  event: EventSummary | null,
): string {
  if (value === null || value === undefined) return '미확인';
  switch (key) {
    case 'showtimeId': {
      const showtime = event?.showtimes.find((s) => s.id === value);
      return showtime ? showtimeLabel(showtime) : String(value);
    }
    case 'seatGrade':
      return `${value}석`;
    case 'price':
      return formatWon(value as number);
    case 'quantity':
      return `${value}매`;
    case 'deliveryMethod':
      return DELIVERY_LABELS[value as keyof typeof DELIVERY_LABELS] ?? String(value);
    case 'prepaymentRequested':
      return value ? '있음' : '없음';
    case 'listingEventId':
      return value === event?.id ? '예, 이 공연' : `다른 공연(${String(value)})`;
    case 'bookingType':
      return BOOKING_TYPE_LABELS[value as keyof typeof BOOKING_TYPE_LABELS] ?? String(value);
    case 'priceBasis':
      return PRICE_BASIS_LABELS[value as keyof typeof PRICE_BASIS_LABELS] ?? String(value);
    case 'feeBasis':
      return FEE_BASIS_LABELS[value as keyof typeof FEE_BASIS_LABELS] ?? String(value);
    case 'discountStatus':
      return DISCOUNT_LABELS[value as keyof typeof DISCOUNT_LABELS] ?? String(value);
    case 'buyerIsBooker':
      return value ? '예' : '아니요';
    default:
      return String(value);
  }
}

// 추출 후보에서 값만 꺼내 수정 폼의 초기값으로 쓴다. 후보가 여러 개(ambiguous)·모름이면 null로 둔다.
export function valuesOf(extracted: ExtractedFields): ListingFields {
  return Object.fromEntries(FIELD_KEYS.map((k) => [k, extracted[k].value])) as ListingFields;
}

// "230,000원" 같은 입력에서 숫자만 남긴다. 빈 값은 null(미확인)로 둔다.
export function parsePositiveInt(text: string): number | null | 'invalid' {
  const digits = text.replace(/[,\s원매]/g, '');
  if (digits === '') return null;
  if (!/^\d+$/.test(digits)) return 'invalid';
  const n = Number(digits);
  return n > 0 && Number.isSafeInteger(n) ? n : 'invalid';
}
