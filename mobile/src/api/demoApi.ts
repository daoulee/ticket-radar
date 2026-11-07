import { CheckRequestSchema, CheckResponseSchema, CONTRACT_VERSION } from '@ticket-radar/shared';
import type { CheckResponse, ListingFields } from '../contract/types';
import {
  DEMO_CONTEXTS,
  DEMO_EMPTY_EXTRACTED,
  DEMO_EVENTS,
  DEMO_NOTICE,
  DEMO_SCENARIOS,
  DEMO_SOURCE_VERSION,
  NO_OFFICIAL_DATA_RESULT,
  UNMATCHED_FIELDS_REASON,
  UNSUPPORTED_TEXT_NOTICE,
} from '../demo/fixtures';
import { sameListingFields } from '../ui/fields';
import { ApiError, type TicketRadarApi } from './client';
import { createDemoReports } from './demoReports';

// 공통 계약과 같은 입력 제한(판매글 3000자).
export const MAX_LISTING_LENGTH = 3000;

export type DemoStep = 'events' | 'context' | 'checks';

export interface DemoApiOptions {
  latencyMs?: number;
  // 실패 화면 확인용: 해당 단계의 다음 요청 1회를 실패시킨다.
  failOnce?: DemoStep[];
}

export interface DemoApi extends TicketRadarApi {
  // 시연 중 '네트워크 실패' 화면을 보여주기 위한 스위치. 실제 API에는 없다.
  failNext(step: DemoStep): void;
  // 서버 재시작·만료(409) 화면 확인용: 지금까지의 추출 기록을 잊는다.
  forgetChecks(): void;
}

// fixture 원본이 화면에서 변경되지 않도록 복사본을 돌려준다.
// React Native 런타임의 structuredClone 지원을 가정하지 않고 JSON 복사를 쓴다(데이터가 모두 JSON 값).
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// 계약의 checkId 는 UUID 다. 시연 응답임을 알아볼 수 있게 0으로 시작하는 고정 형식을 쓴다.
function demoCheckId(n: number) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

// 시연 API: 미리 준비한 응답을 찾아서 돌려주기만 한다. 가격·규정 판단을 하지 않는다.
// 요청 형식(previousCheckId 재대조, 명시적 manual, 409)은 공통 계약과 같은 방식으로 흉내 낸다.
// 돌려주는 응답은 항상 extraction.method='fixture'(또는 명시적 'manual'), actualModelCall=false 이다.
export function createDemoApi({ latencyMs = 450, failOnce = [] }: DemoApiOptions = {}): DemoApi {
  const pendingFailures = new Set<DemoStep>(failOnce);
  const checks = new Map<string, { eventId: string; listingText: string; syntheticListing: boolean }>();
  let checkCounter = 0;

  async function step(name: DemoStep) {
    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));
    if (pendingFailures.delete(name)) {
      throw new ApiError({
        code: 'DEMO_FORCED_FAILURE',
        message: '시연용으로 만든 네트워크 실패입니다.',
        retryable: true,
      });
    }
  }

  const demoReports = createDemoReports(() => DEMO_EVENTS.map((e) => e.id));

  return {
    mode: 'demo',
    label: '시연 데이터 (API 미연결)',
    submitReport: demoReports.submitReport,
    organizer: demoReports.organizer,

    failNext(name) {
      pendingFailures.add(name);
    },

    forgetChecks() {
      checks.clear();
    },

    async listEvents(query) {
      await step('events');
      const q = query.trim().toLowerCase();
      return clone(DEMO_EVENTS.filter((event) => !q || event.title.toLowerCase().includes(q)));
    },

    async getOfficialContext(eventId) {
      await step('context');
      const context = DEMO_CONTEXTS[eventId];
      if (!context) {
        throw new ApiError({ code: 'EVENT_NOT_FOUND', message: '공연을 찾지 못했습니다.', retryable: false });
      }
      return clone(context);
    },

    async createCheck(input) {
      await step('checks');
      if (!input.listingText.trim()) {
        throw new ApiError({ code: 'EMPTY_LISTING', message: '판매글을 입력하세요.', retryable: false });
      }
      if (input.listingText.length > MAX_LISTING_LENGTH) {
        throw new ApiError({
          code: 'LISTING_TOO_LONG',
          message: `판매글은 ${MAX_LISTING_LENGTH}자 이하로 입력하세요.`,
          retryable: false,
        });
      }
      const parsed = CheckRequestSchema.safeParse(input);
      if (!parsed.success) {
        throw new ApiError({ code: 'INVALID_REQUEST', message: '요청 형식이 계약과 맞지 않습니다.', retryable: false });
      }
      const req = parsed.data;
      if (!DEMO_CONTEXTS[req.eventId]) {
        throw new ApiError({ code: 'EVENT_NOT_FOUND', message: '공연을 찾지 못했습니다.', retryable: false });
      }

      // 재대조는 같은 원문·공연·합성 여부의 이전 추출을 참조해야 한다(서버 계약과 같은 조건).
      if (req.previousCheckId) {
        const previous = checks.get(req.previousCheckId);
        if (
          !previous ||
          previous.eventId !== req.eventId ||
          previous.listingText !== req.listingText ||
          previous.syntheticListing !== req.syntheticListing
        ) {
          throw new ApiError({
            code: 'CHECK_EXPIRED_OR_MISMATCH',
            message: '이전 추출 기록이 만료됐거나 판매글이 바뀌었습니다. 판매글을 다시 분석하세요.',
            retryable: false,
          });
        }
      }

      const manual = req.extractionMode === 'manual';
      const scenario = DEMO_SCENARIOS.find((s) => s.eventId === req.eventId && s.listingText.trim() === req.listingText.trim());
      const checkId = demoCheckId(++checkCounter);
      checks.set(checkId, { eventId: req.eventId, listingText: req.listingText, syntheticListing: req.syntheticListing });

      const base = {
        contractVersion: CONTRACT_VERSION,
        checkId,
        eventId: req.eventId,
        extracted: manual || !scenario ? DEMO_EMPTY_EXTRACTED() : clone(scenario.extracted),
        checkedAt: new Date().toISOString(),
        isDemo: true,
        dataMode: 'demo' as const,
        extraction: { method: manual ? 'manual' : 'fixture', provider: null, model: null, actualModelCall: false, reused: false } as const,
        provenance: { syntheticListing: req.syntheticListing, officialSourceType: 'synthetic', sourceVersion: DEMO_SOURCE_VERSION } as const,
      };
      const notices = [DEMO_NOTICE, ...(scenario ? scenario.notices : manual ? [] : [UNSUPPORTED_TEXT_NOTICE])];

      return CheckResponseSchema.parse(respond()) as CheckResponse;

      function respond(): CheckResponse {
        const fields: ListingFields | undefined = req.confirmedFields;
        if (!fields) {
          // 추출 단계: 사용자가 값을 확인하기 전이므로 비교는 보류 상태로 둔다.
          return { ...base, appliedFields: null, findings: [], priceComparison: { held: true, reason: '추출값 확인 전입니다.' }, notices };
        }
        if (!DEMO_CONTEXTS[req.eventId].priceTiers.length) {
          return { ...base, appliedFields: fields, notices, ...clone(NO_OFFICIAL_DATA_RESULT) };
        }
        const result = scenario?.results.find((r) => sameListingFields(r.fields, fields));
        if (!result) {
          return {
            ...base,
            appliedFields: fields,
            findings: [],
            priceComparison: { held: true, reason: UNMATCHED_FIELDS_REASON },
            notices: [...notices, UNMATCHED_FIELDS_REASON],
          };
        }
        return {
          ...base,
          appliedFields: fields,
          findings: clone(result.findings),
          priceComparison: clone(result.priceComparison),
          notices,
        };
      }
    },
  };
}
