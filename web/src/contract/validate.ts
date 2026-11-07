// HTTP 응답 검증. 형식·중첩 필드·모드 일관성은 Sol 공통 스키마(Zod)로 검사하고,
// 웹은 "보낸 판매글·보낸 확인값"과 응답이 맞는지만 추가로 확인한다. 판단 규칙이 아니다.
import { ApiErrorBodySchema, CheckResponseSchema, EventListSchema, ListingFieldsSchema, OfficialContextSchema } from '@ticket-radar/shared'
import type { CheckRequestInput } from './types'

type Issues = string[]

function zodIssues(error: { issues: { path: PropertyKey[]; message: string }[] }): Issues {
  return error.issues.map((i) => `${i.path.length ? i.path.map(String).join('.') : '(응답)'}: ${i.message}`)
}

// 인용이 판매글의 실제 구간인지 (공백 차이는 무시)
const squash = (s: string) => s.replace(/\s+/g, ' ').trim()
const inListing = (quote: string, listing: string) => squash(listing).includes(squash(quote))

export function eventListIssues(body: unknown): Issues {
  const r = EventListSchema.safeParse(body)
  return r.success ? [] : zodIssues(r.error)
}

export function officialContextIssues(body: unknown, eventId?: string): Issues {
  const r = OfficialContextSchema.safeParse(body)
  if (!r.success) return zodIssues(r.error)
  return eventId && r.data.eventId !== eventId ? [`eventId: 요청한 공연(${eventId})과 다름`] : []
}

export function checkResponseIssues(body: unknown, request?: CheckRequestInput): Issues {
  const r = CheckResponseSchema.safeParse(body)
  if (!r.success) return zodIssues(r.error)
  if (!request) return []

  const res = r.data
  const issues: Issues = []
  if (res.eventId !== request.eventId) issues.push(`eventId: 요청한 공연(${request.eventId})과 다름`)
  for (const [key, field] of Object.entries(res.extracted)) {
    if (field.evidenceQuote && !inListing(field.evidenceQuote, request.listingText)) {
      issues.push(`extracted.${key}.evidenceQuote: 판매글 원문에 없는 인용`)
    }
  }
  res.findings.forEach((f, i) => {
    if (f.listingQuote && !inListing(f.listingQuote, request.listingText)) issues.push(`findings.${i}.listingQuote: 판매글 원문에 없는 인용`)
  })
  // 확인값을 보냈으면 서버가 그 값을 그대로 적용했는지 확인한다 (이전 값으로 되돌아간 응답 거부).
  if (request.confirmedFields) {
    const sent = ListingFieldsSchema.parse(request.confirmedFields)
    const applied = res.appliedFields
    if (!applied) issues.push('appliedFields: 확인값을 보냈는데 적용값이 없음')
    else for (const key of Object.keys(sent) as (keyof typeof sent)[]) {
      if (applied[key] !== sent[key]) issues.push(`appliedFields.${key}: 보낸 확인값과 다름`)
    }
  } else if (res.appliedFields !== null || !res.priceComparison.held) {
    issues.push('추출 단계 응답인데 적용값 또는 가격 계산이 있음')
  }
  return issues
}

export function isApiErrorBody(body: unknown) {
  return ApiErrorBodySchema.safeParse(body).success
}
