import { createDemoApi } from '../src/api/demoApi';
import { validateCheckResponse, validateEvents, validateOfficialContext } from '../src/api/validate';
import type { CheckRequestInput, CheckResponse, ListingFields } from '../src/contract/types';
import { DEMO_CONTEXTS, DEMO_SCENARIOS } from '../src/demo/fixtures';
import { valuesOf } from '../src/ui/display';

// 응답 형식 검사 = 공통 계약 Zod 스키마 + '보낸 요청과 맞는 응답인가' 검사.
const shared = (name: string) => require(`../../shared/examples/${name}.json`);
const A = DEMO_SCENARIOS.find((s) => s.id === 'A')!;
const confirm = (f: ListingFields): ListingFields => ({ ...f, listingEventId: A.eventId, feeBasis: 'ticket_only', discountStatus: 'standard' });

async function confirmedA() {
  const api = createDemoApi({ latencyMs: 0 });
  const first = await api.createCheck({ eventId: A.eventId, listingText: A.listingText });
  const request: CheckRequestInput = {
    eventId: A.eventId, listingText: A.listingText, previousCheckId: first.checkId, confirmedFields: confirm(valuesOf(first.extracted)),
  };
  return { request, response: await api.createCheck(request) };
}

function mutate(res: CheckResponse, edit: (r: any) => void): unknown {
  const copy = JSON.parse(JSON.stringify(res));
  edit(copy);
  return copy;
}

describe('응답 형식 검사 — 계약에 맞는 응답은 통과', () => {
  it('Sol이 실제 서버에서 저장한 예시 응답(수동 대조)', () => {
    expect(validateEvents(shared('events'))).toEqual([]);
    expect(validateOfficialContext(shared('official-context'), 'akmu-daegu-20261121')).toEqual([]);
    expect(validateCheckResponse(shared('manual-response'), shared('manual-request'))).toEqual([]);
  });

  it('모든 시연 사례의 추출 단계·대조 단계·보류 응답', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    expect(validateEvents(await api.listEvents(''))).toEqual([]);
    for (const id of Object.keys(DEMO_CONTEXTS)) expect(validateOfficialContext(await api.getOfficialContext(id), id)).toEqual([]);
    for (const s of DEMO_SCENARIOS) {
      const first = await api.createCheck({ eventId: s.eventId, listingText: s.listingText });
      expect(validateCheckResponse(first, { eventId: s.eventId, listingText: s.listingText })).toEqual([]);
      for (const fields of [...s.results.map((r) => r.fields), { ...valuesOf(s.extracted), quantity: 99 }]) {
        const request = { eventId: s.eventId, listingText: s.listingText, previousCheckId: first.checkId, confirmedFields: fields };
        expect({ id: s.id, problems: validateCheckResponse(await api.createCheck(request), request) }).toEqual({ id: s.id, problems: [] });
      }
    }
  });
});

describe('응답 형식 검사 — 성공 화면에 보여주면 안 되는 응답은 거부', () => {
  it('공통 스키마 위반: 중첩 필드 누락·잘못된 열거값·가격 산술 오류', async () => {
    const { request, response } = await confirmedA();
    expect(validateCheckResponse(mutate(response, (r) => delete r.extracted.price.status), request)[0]).toMatch(/^check\.extracted\.price/);
    expect(validateCheckResponse(mutate(response, (r) => (r.findings[0].status = 'fraud')), request)[0]).toMatch(/^check\.findings\.0\.status/);
    expect(validateCheckResponse(mutate(response, (r) => (r.priceComparison.diff = 1)), request).join()).toContain('incorrect price arithmetic');
  });

  it('fixture를 실제 데이터로 표시(isDemo=false)하거나 fixture를 AI 호출로 표시하면 실패', async () => {
    const { request, response } = await confirmedA();
    expect(validateCheckResponse(mutate(response, (r) => { r.isDemo = false; r.dataMode = 'live'; }), request).join()).toContain(
      'data mode must reflect actual data provenance',
    );
    expect(validateCheckResponse(mutate(response, (r) => (r.extraction.actualModelCall = true)), request).join()).toContain(
      'non-model cannot claim a model call',
    );
  });

  it('원문에 없는 근거 문구(생성된 가격 등)는 실패', async () => {
    const { request, response } = await confirmedA();
    const bad = mutate(response, (r) => { r.extracted.price.value = 180000; r.extracted.price.evidenceQuote = '180,000원'; });
    expect(validateCheckResponse(bad, request)).toEqual(['check.extracted.price.evidenceQuote: substring of the submitted listing text']);
    expect(validateCheckResponse(mutate(response, (r) => (r.findings[0].listingQuote = '원문에 없는 말')), request)).toEqual([
      'check.findings.0.listingQuote: substring of the submitted listing text',
    ]);
  });

  it('T05: 수정값을 보냈는데 이전 값으로 대조한 응답은 실패', async () => {
    const { request, response } = await confirmedA();
    const reverted = mutate(response, (r) => { r.appliedFields.quantity = 2; });
    expect(validateCheckResponse(reverted, request)).toEqual(['check.appliedFields: equal to submitted confirmedFields']);
  });

  it('확인 전 단계에서 적용값을 돌려주면 실패', async () => {
    const { response } = await confirmedA();
    const request: CheckRequestInput = { eventId: A.eventId, listingText: A.listingText };
    expect(validateCheckResponse(response, request)).toContain('check.appliedFields: null before user confirmation');
  });

  it('명시적 manual 요청에 AI/fixture 추출로 표시된 응답은 실패', () => {
    const res = shared('manual-response');
    const bad = { ...res, extraction: { ...res.extraction, method: 'fixture' } };
    expect(validateCheckResponse(bad, shared('manual-request'))).toEqual(['check.extraction.method: manual for an explicit manual request']);
  });

  it('다른 공연의 응답은 실패', async () => {
    const { request, response } = await confirmedA();
    expect(validateCheckResponse(response, { ...request, eventId: 'other' })).toContain('check.eventId: requested event other');
    expect(validateOfficialContext(shared('official-context'), 'other')).toEqual(['context.eventId: requested event other']);
  });
});
