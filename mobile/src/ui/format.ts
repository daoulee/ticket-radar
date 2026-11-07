import type { DeliveryMethod, FindingStatus, ListingFields, PolicyScope, PolicyType } from '../contract/types';

// 화면 문구 모음. 진위·입장 가능·사기·불법을 확정하는 표현을 쓰지 않는다.
// (처음에는 웹 format.ts 사본이었고, 공통 계약 v0.1.0 적용 시 앱 소유로 전환했다. 문구는 웹과 맞춘다.)

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  official_transfer: '예매처 공식 양도 기능',
  qr_capture: 'QR·티켓 화면 캡처 전달',
  onsite_with_seller: '현장에서 판매자와 만나 전달',
  paper_courier: '실물 티켓 배송',
  other: '기타',
};

export const BOOKING_TYPE_LABELS: Record<NonNullable<ListingFields['bookingType']>, string> = {
  fanclub_presale: '팬클럽 선예매',
  general: '일반 예매',
};

export const PRICE_BASIS_LABELS: Record<NonNullable<ListingFields['priceBasis']>, string> = {
  per_ticket: '1매 가격',
  total: '여러 장 합계',
};

export const FEE_BASIS_LABELS: Record<NonNullable<ListingFields['feeBasis']>, string> = {
  ticket_only: '티켓 금액만',
  includes_fees: '수수료 포함',
};

export const DISCOUNT_LABELS: Record<NonNullable<ListingFields['discountStatus']>, string> = {
  standard: '할인 없는 기본가',
  discounted: '할인 적용',
};

export const POLICY_SCOPE_LABELS: Record<PolicyScope, string> = {
  fanclub_presale: '팬클럽 선예매에만 적용',
  general: '일반 예매에 적용',
  all: '모든 예매에 적용',
};

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  conflict: '공식 안내와 다른 설명',
  needs_check: '추가 확인 필요',
  matched: '같은 조건으로 대조함',
  unverifiable: '확인 불가',
  comparison_held: '가격 비교 보류',
};

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  identity_check: '본인 확인',
  transfer: '양도',
  pickup: '수령·입장',
  other: '기타',
};

export function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatSignedWon(value: number) {
  if (value === 0) return '0원';
  return `${value > 0 ? '+' : '−'}${formatWon(Math.abs(value))}`;
}

export function formatSignedPercent(value: number) {
  if (value === 0) return '0%';
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

const dateTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// 공식 확인일은 날짜 단위(YYYY-MM-DD)로 올 수 있다. 이때 시각을 만들어 붙이지 않는다.
export function formatKst(iso: string | null) {
  if (!iso) return '확인 시각 없음';
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) return `${dateOnly[1]}. ${dateOnly[2]}. ${dateOnly[3]}. (날짜 단위)`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '확인 시각 형식 오류';
  return `${dateTime.format(date)} KST`;
}
