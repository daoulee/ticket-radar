import { CheckResponseSchema, EventListSchema, OfficialContextSchema } from '@ticket-radar/shared';
import { ApiError } from '../src/api/client';
import { createDemoApi, MAX_LISTING_LENGTH } from '../src/api/demoApi';
import type { CheckRequestInput, ListingFields } from '../src/contract/types';
import { DEMO_CONTEXTS, DEMO_SCENARIOS, UNMATCHED_FIELDS_REASON, UNSUPPORTED_TEXT_NOTICE } from '../src/demo/fixtures';
import { valuesOf } from '../src/ui/display';

const EVENT = 'demo-radar-live';
const scenario = (id: string) => DEMO_SCENARIOS.find((s) => s.id === id)!;
// 사용자가 '이 공연 맞음·티켓 금액만·할인 없는 기본가'를 고른 상태
const confirm = (f: ListingFields): ListingFields => ({ ...f, listingEventId: EVENT, feeBasis: 'ticket_only', discountStatus: 'standard' });

describe('시연 API (공통 계약 v0.1.0 형식) — 미리 계산된 응답만 돌려준다', () => {
  const api = () => createDemoApi({ latencyMs: 0 });

  async function extractThenCompare(id: string, edit: (f: ListingFields) => ListingFields) {
    const demo = api();
    const s = scenario(id);
    const first = await demo.createCheck({ eventId: s.eventId, listingText: s.listingText });
    const fields = edit(valuesOf(first.extracted));
    const second = await demo.createCheck({ eventId: s.eventId, listingText: s.listingText, previousCheckId: first.checkId, confirmedFields: fields });
    return { first, second, fields };
  }

  it('공연 목록·공식 자료는 공통 스키마를 통과하고 합성 자료로 표시된다', async () => {
    const events = await api().listEvents('');
    expect(EventListSchema.safeParse(events).success).toBe(true);
    expect(events.every((e) => e.isDemo)).toBe(true);
    for (const id of Object.keys(DEMO_CONTEXTS)) {
      const ctx = await api().getOfficialContext(id);
      expect(OfficialContextSchema.safeParse(ctx).success).toBe(true);
      expect(ctx.sourceType).toBe('synthetic');
    }
  });

  it('추출 단계: 비교 보류, fixture로 표시(AI 호출 없음), UUID checkId', async () => {
    const res = await api().createCheck({ eventId: EVENT, listingText: scenario('A').listingText });
    expect(CheckResponseSchema.safeParse(res).success).toBe(true);
    expect(res.extraction).toEqual({ method: 'fixture', provider: null, model: null, actualModelCall: false, reused: false });
    expect(res).toMatchObject({ isDemo: true, dataMode: 'demo', appliedFields: null, priceComparison: { held: true } });
    expect(res.provenance).toMatchObject({ syntheticListing: true, officialSourceType: 'synthetic' });
    expect(res.extracted.price.value).toBe(230000);
    // 비교 전제 조건 중 공연 일치·수수료·할인은 추출하지 않는다(사용자가 확인).
    expect(res.extracted.listingEventId.status).toBe('unknown');
    expect(res.extracted.feeBasis.status).toBe('unknown');
  });

  it('추출값 그대로(조건 미확인) 대조하면 숫자 비교를 보류한다', async () => {
    const { second } = await extractThenCompare('A', (f) => f);
    expect(second.priceComparison.held).toBe(true);
    expect(second.findings.find((f) => f.type === 'price')?.status).toBe('comparison_held');
  });

  it('T01: 조건을 확인하면 fixture에 적힌 차액을 돌려준다', async () => {
    const { second } = await extractThenCompare('A', confirm);
    expect(second.priceComparison).toMatchObject({ held: false, diff: 76000, ratePercent: 49.35 });
    expect(second.findings.some((f) => f.status === 'conflict')).toBe(true);
  });

  it('T05: 가격을 고치면 수정값의 결과로 바뀌고, 원래 추출 후보는 그대로다', async () => {
    const { second, fields } = await extractThenCompare('A', (f) => ({ ...confirm(f), price: 154000 }));
    expect(second.appliedFields).toEqual(fields);
    expect(second.extracted.price.value).toBe(230000);
    expect(second.priceComparison).toMatchObject({ held: false, diff: 0 });
  });

  it('T02·T03: 좌석 후보 2개·합계 가격은 보류, 1매 가격을 확인하면 비교', async () => {
    const held = await extractThenCompare('B', (f) => f);
    expect(held.first.extracted.seatGrade).toMatchObject({ status: 'ambiguous', candidates: ['R', 'S'] });
    expect(held.first.extracted.priceBasis.value).toBe('total');
    expect(held.second.priceComparison.held).toBe(true);
    const r = await extractThenCompare('B', (f) => ({ ...confirm(f), seatGrade: 'R', price: 125000, priceBasis: 'per_ticket' }));
    expect(r.second.priceComparison).toMatchObject({ held: false, diff: -7000 });
  });

  it('fixture에 없는 입력 조합은 계산하지 않고 보류한다(앱 내 판정 규칙 없음)', async () => {
    const { second } = await extractThenCompare('A', (f) => ({ ...confirm(f), price: 199999 }));
    expect(second.priceComparison).toEqual({ held: true, reason: UNMATCHED_FIELDS_REASON });
    expect(second.findings).toEqual([]);
  });

  it('예시가 아닌 글은 모든 값이 미확인이고 안내 문구를 붙인다', async () => {
    const res = await api().createCheck({ eventId: EVENT, listingText: '아무 글' });
    expect(Object.values(res.extracted).every((f) => f.status === 'unknown')).toBe(true);
    expect(res.notices).toContain(UNSUPPORTED_TEXT_NOTICE);
  });

  it('명시적 manual 요청은 method=manual, 후보는 모두 unknown', async () => {
    const a = scenario('A');
    const res = await api().createCheck({
      eventId: EVENT, listingText: a.listingText, extractionMode: 'manual', confirmedFields: confirm(valuesOf(a.extracted)),
    });
    expect(res.extraction.method).toBe('manual');
    expect(Object.values(res.extracted).every((f) => f.status === 'unknown')).toBe(true);
    expect(res.priceComparison).toMatchObject({ held: false, diff: 76000 });
  });

  it('409: 모르는 previousCheckId·원문 변경·기록 만료는 재분석 요청', async () => {
    const demo = api();
    const a = scenario('A');
    const first = await demo.createCheck({ eventId: EVENT, listingText: a.listingText });
    const req = (o: Partial<CheckRequestInput>): CheckRequestInput => ({
      eventId: EVENT, listingText: a.listingText, previousCheckId: first.checkId, confirmedFields: valuesOf(first.extracted), ...o,
    });
    await expect(demo.createCheck(req({ listingText: a.listingText + '!' }))).rejects.toMatchObject({ code: 'CHECK_EXPIRED_OR_MISMATCH' });
    demo.forgetChecks();
    await expect(demo.createCheck(req({}))).rejects.toMatchObject({ code: 'CHECK_EXPIRED_OR_MISMATCH', retryable: false });
  });

  it('공식 자료가 없는 공연은 확인 불가로 보류한다', async () => {
    const demo = api();
    const first = await demo.createCheck({ eventId: 'demo-compass', listingText: '나침반 1장' });
    const res = await demo.createCheck({
      eventId: 'demo-compass', listingText: '나침반 1장', previousCheckId: first.checkId, confirmedFields: valuesOf(first.extracted),
    });
    expect(res.priceComparison.held).toBe(true);
    expect(res.findings[0]).toMatchObject({ status: 'unverifiable', sourceUrl: null });
  });

  it('T06: 빈 입력·너무 긴 입력·계약 위반 요청은 오류', async () => {
    await expect(api().createCheck({ eventId: EVENT, listingText: '   ' })).rejects.toMatchObject({ code: 'EMPTY_LISTING' });
    await expect(
      api().createCheck({ eventId: EVENT, listingText: 'a'.repeat(MAX_LISTING_LENGTH + 1) }),
    ).rejects.toMatchObject({ code: 'LISTING_TOO_LONG' });
    await expect(api().createCheck({ eventId: EVENT, listingText: 'x', extractionMode: 'manual' })).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
    });
  });

  it('failNext는 다음 요청 1회만 실패시키고 재시도는 성공한다', async () => {
    const demo = api();
    demo.failNext('checks');
    const req = { eventId: EVENT, listingText: scenario('A').listingText };
    await expect(demo.createCheck(req)).rejects.toBeInstanceOf(ApiError);
    await expect(demo.createCheck(req)).resolves.toMatchObject({ isDemo: true });
  });

  it('응답을 고쳐도 fixture 원본은 바뀌지 않는다', async () => {
    const res = await api().createCheck({ eventId: EVENT, listingText: scenario('A').listingText });
    (res.extracted.price as { value: number }).value = 1;
    expect(scenario('A').extracted.price.value).toBe(230000);
  });
});
