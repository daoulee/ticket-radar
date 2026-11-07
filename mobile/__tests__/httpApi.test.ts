import { createHttpApi } from '../src/api/httpApi';

// 실제 서버 없이 가짜 fetch로 어댑터의 오류 처리만 확인한다. 실제 API 연동 검증이 아니다.
function fakeFetch(status: number, body: unknown) {
  return jest.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe('HTTP 어댑터', () => {
  it('기본 URL 끝의 / 를 정리하고 계약 경로로 요청한다', async () => {
    const f = fakeFetch(200, []);
    await createHttpApi('http://192.168.0.10:8000/', f).listEvents('레이더');
    expect((f as jest.Mock).mock.calls[0][0]).toBe(
      `http://192.168.0.10:8000/events?q=${encodeURIComponent('레이더')}`,
    );
  });

  it('서버 오류 본문 {code,message,retryable}을 그대로 전달한다', async () => {
    const f = fakeFetch(409, { code: 'CHECK_EXPIRED_OR_MISMATCH', message: '다시 분석하세요.', retryable: false });
    await expect(createHttpApi('http://x', f).createCheck({ eventId: 'e', listingText: 't' })).rejects.toMatchObject({
      code: 'CHECK_EXPIRED_OR_MISMATCH',
      retryable: false,
    });
  });

  it('T06: 형식이 다른 성공 응답은 성공으로 보여주지 않는다', async () => {
    const f = fakeFetch(200, { ok: true });
    await expect(createHttpApi('http://x', f).createCheck({ eventId: 'e', listingText: 't' })).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('네트워크 실패는 재시도 가능한 NETWORK_ERROR', async () => {
    const f = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    await expect(createHttpApi('http://x', f).listEvents('')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      retryable: true,
    });
  });

  it('형식 없는 5xx는 재시도 가능, 4xx는 불가', async () => {
    await expect(createHttpApi('http://x', fakeFetch(503, 'down')).listEvents('')).rejects.toMatchObject({
      code: 'HTTP_503',
      retryable: true,
    });
    await expect(createHttpApi('http://x', fakeFetch(404, 'nf')).listEvents('')).rejects.toMatchObject({
      code: 'HTTP_404',
      retryable: false,
    });
  });
});

describe('HTTP 어댑터 — 중첩 응답 검사', () => {
  it('공통 계약 스키마에 맞지 않는 성공 응답은 INVALID_RESPONSE와 세부 위치를 돌려준다', async () => {
    const res = require('../../shared/examples/manual-response.json');
    const f = fakeFetch(200, { ...res, contractVersion: '0.0.9' });
    const req = require('../../shared/examples/manual-request.json');
    const err = await createHttpApi('http://x', f).createCheck(req).catch((e) => e);
    expect(err).toMatchObject({ code: 'INVALID_RESPONSE', retryable: false });
    expect(err.details[0]).toMatch(/^check\.contractVersion/);
  });

  it('Sol 예시 요청을 그대로 보내고 예시 응답을 성공으로 받는다', async () => {
    const f = fakeFetch(200, require('../../shared/examples/manual-response.json'));
    const req = require('../../shared/examples/manual-request.json');
    await expect(createHttpApi('http://x', f).createCheck(req)).resolves.toMatchObject({ extraction: { method: 'manual' } });
    expect(JSON.parse((f as jest.Mock).mock.calls[0][1].body)).toEqual(req);
  });

  it('계약에 맞지 않는 요청(manual인데 확인값 없음)은 보내지 않는다', async () => {
    const f = fakeFetch(200, {});
    await expect(
      createHttpApi('http://x', f).createCheck({ eventId: 'e', listingText: 't', extractionMode: 'manual' }),
    ).rejects.toMatchObject({ code: 'INVALID_REQUEST' });
    expect(f).not.toHaveBeenCalled();
  });

  it('AI_NOT_CONFIGURED 오류 본문은 그대로 전달하고 다른 결과로 대체하지 않는다', async () => {
    const f = fakeFetch(503, { code: 'AI_NOT_CONFIGURED', message: 'AI 미설정', retryable: false });
    await expect(createHttpApi('http://x', f).createCheck({ eventId: 'e', listingText: 't' })).rejects.toMatchObject({
      code: 'AI_NOT_CONFIGURED',
      retryable: false,
    });
  });
});

describe('HTTP 어댑터 · 제보/주최 측 제보함 (APP-021)', () => {
  it('제보는 POST /reports 로 보내고 접수 응답 형식을 검사한다', async () => {
    const f = fakeFetch(201, { reportId: 'r1', status: 'received', createdAt: '2026-11-03T00:00:00Z', duplicate: false });
    const receipt = await createHttpApi('http://x', f).submitReport({
      clientRequestId: '11111111-2222-4333-8444-555555555555', eventId: 'e', listingText: 't', findings: [], isDemo: true, consent: true,
    });
    expect(receipt.reportId).toBe('r1');
    const [url, init] = (f as jest.Mock).mock.calls[0];
    expect(url).toBe('http://x/reports');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('제보함 요청은 Bearer 토큰을 붙이고, 형식이 다른 목록은 성공으로 보여주지 않는다', async () => {
    const ok = fakeFetch(200, [{ id: 'r1', eventId: 'e', createdAt: 'c', status: 'reviewing', listingPrice: null, findingCount: 1, preview: 'p', isDemo: false }]);
    await createHttpApi('http://x', ok).organizer.list('tok', 'e v');
    const [url, init] = (ok as jest.Mock).mock.calls[0];
    expect(url).toBe(`http://x/organizer/reports?event_id=${encodeURIComponent('e v')}`);
    expect(init.headers.Authorization).toBe('Bearer tok');
    const bad = fakeFetch(200, [{ id: 'r1', status: 'deleted' }]);
    await expect(createHttpApi('http://x', bad).organizer.list('tok', 'e')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('권한 오류(403)는 서버 코드를 그대로 전달한다', async () => {
    const f = fakeFetch(403, { code: 'FORBIDDEN_EVENT', message: '담당하지 않는 공연의 제보는 볼 수 없습니다.', retryable: false });
    await expect(createHttpApi('http://x', f).organizer.list('tok', 'e')).rejects.toMatchObject({ code: 'FORBIDDEN_EVENT' });
  });
});
