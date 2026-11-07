import {
  CheckResponseSchema,
  EventListSchema,
  FIELD_KEYS,
  ListingFieldsSchema,
  OfficialContextSchema,
} from '@ticket-radar/shared';
import type { CheckRequestInput } from '../contract/types';

// HTTP 응답 형식 검사. 1단계는 Sol 소유 공통 계약의 Zod 스키마(중첩 필드·상태·근거·모드 일관성·가격 산술),
// 2단계는 '내가 보낸 요청과 맞는 응답인지'만 확인하는 앱 쪽 검사다. 어느 쪽도 가격·규정 판정이 아니다.
// 반환값: 문제 목록(비어 있으면 통과). 경로는 디버깅용이며 사용자에게는 일반 오류 문구만 보인다.

type Issue = { path: PropertyKey[]; message: string };

function issues(prefix: string, list: readonly Issue[]): string[] {
  return list.map((i) => `${[prefix, ...i.path.map(String)].join('.')}: ${i.message}`);
}

export function validateEvents(body: unknown): string[] {
  const r = EventListSchema.safeParse(body);
  return r.success ? [] : issues('events', r.error.issues);
}

export function validateOfficialContext(body: unknown, eventId: string): string[] {
  const r = OfficialContextSchema.safeParse(body);
  if (!r.success) return issues('context', r.error.issues);
  return r.data.eventId === eventId ? [] : [`context.eventId: requested event ${eventId}`];
}

export function validateCheckResponse(body: unknown, request: CheckRequestInput): string[] {
  const r = CheckResponseSchema.safeParse(body);
  if (!r.success) return issues('check', r.error.issues);
  const res = r.data;
  const problems: string[] = [];

  if (res.eventId !== request.eventId) problems.push(`check.eventId: requested event ${request.eventId}`);

  // 근거 인용은 보낸 판매글의 실제 구간이어야 한다(서버도 검사하지만 화면에 띄우기 전에 한 번 더 확인).
  for (const key of FIELD_KEYS) {
    const f = res.extracted[key];
    if (f.evidenceQuote !== null && !request.listingText.includes(f.evidenceQuote)) {
      problems.push(`check.extracted.${key}.evidenceQuote: substring of the submitted listing text`);
    }
  }
  res.findings.forEach((f, i) => {
    if (f.listingQuote !== null && !request.listingText.includes(f.listingQuote)) {
      problems.push(`check.findings.${i}.listingQuote: substring of the submitted listing text`);
    }
  });

  // 확인값을 보냈다면 서버가 그 전체 스냅샷을 그대로 적용했음을 appliedFields로 돌려줘야 한다(이전 값으로 되돌아감 방지).
  if (request.confirmedFields) {
    const sent = ListingFieldsSchema.parse(request.confirmedFields);
    if (!res.appliedFields || FIELD_KEYS.some((k) => res.appliedFields![k] !== sent[k])) {
      problems.push('check.appliedFields: equal to submitted confirmedFields');
    }
  } else {
    if (res.appliedFields !== null) problems.push('check.appliedFields: null before user confirmation');
    if (!res.priceComparison.held) problems.push('check.priceComparison.held: true before user confirmation');
  }

  // 명시적 수동 입력을 요청했는데 AI 추출로 표시된 응답은 받지 않는다.
  if (request.extractionMode === 'manual' && res.extraction.method !== 'manual') {
    problems.push('check.extraction.method: manual for an explicit manual request');
  }
  return problems;
}
