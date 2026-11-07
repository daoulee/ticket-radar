import type {
  BookingType,
  DeliveryMethod,
  DiscountStatus,
  EventSummary,
  FeeBasis,
  FindingStatus,
  PolicyScope,
  PolicyType,
  PriceBasis,
  Showtime,
} from '../contract/types'

// 화면 문구 모음. 진위·입장 가능·사기·불법을 확정하는 표현을 쓰지 않는다.

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  official_transfer: '예매처 공식 양도 기능',
  qr_capture: 'QR·티켓 화면 캡처 전달',
  onsite_with_seller: '현장에서 판매자와 만나 전달',
  paper_courier: '실물 티켓 배송',
  other: '기타',
}

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  conflict: '공식 안내와 다른 설명',
  needs_check: '추가 확인 필요',
  matched: '같은 조건으로 대조함',
  unverifiable: '확인 불가',
  comparison_held: '가격 비교 보류',
}

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  identity_check: '본인 확인',
  transfer: '양도',
  pickup: '수령·입장',
  other: '기타',
}

export const BOOKING_LABELS: Record<BookingType, string> = {
  fanclub_presale: '팬클럽 선예매',
  general: '일반 예매',
}

export const PRICE_BASIS_LABELS: Record<PriceBasis, string> = {
  per_ticket: '1매 가격',
  total: '여러 장 총액',
}

export const FEE_BASIS_LABELS: Record<FeeBasis, string> = {
  ticket_only: '티켓 금액만 (수수료 제외)',
  includes_fees: '수수료 포함 금액',
}

export const DISCOUNT_LABELS: Record<DiscountStatus, string> = {
  standard: '정가 (할인 없음)',
  discounted: '할인가',
}

export const SCOPE_LABELS: Record<PolicyScope, string> = {
  fanclub_presale: '팬클럽 선예매에만 적용',
  general: '일반 예매에만 적용',
  all: '모든 예매에 적용',
}

export const YES_NO_LABELS = { true: '예', false: '아니요' } as const

export function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function formatSignedWon(value: number) {
  if (value === 0) return '0원'
  return `${value > 0 ? '+' : '−'}${formatWon(Math.abs(value))}`
}

export function formatSignedPercent(value: number) {
  if (value === 0) return '0%'
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`
}

const dateTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const showtimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const ISO_LIKE = /^\d{4}-\d{2}-\d{2}T/

// 서버 회차 label 이 ISO 시각 문자열이면 사람이 읽는 형식으로 바꿔 보여준다.
export function showtimeText(showtime: Showtime) {
  if (!ISO_LIKE.test(showtime.label)) return showtime.label
  const date = new Date(showtime.startsAt)
  return Number.isNaN(date.getTime()) ? showtime.label : showtimeFormat.format(date)
}

export function showtimeById(event: EventSummary, id: string | null) {
  if (!id) return '확인 불가'
  const showtime = event.showtimes.find((s) => s.id === id)
  return showtime ? showtimeText(showtime) : id
}

// 확인일/확인 시각. 날짜만 있는 값(예: 2026-10-29)에 시각을 만들어 붙이지 않는다.
export function formatChecked(value: string | null) {
  if (!value) return '확인일 없음'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value.replace(/-/g, '. ')}. (날짜 단위)`
  return formatKst(value)
}

export function formatKst(iso: string | null) {
  if (!iso) return '확인 시각 없음'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '확인 시각 형식 오류'
  return `${dateTime.format(date)} KST`
}
