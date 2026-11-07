import { createDemoApi } from '../src/api/demoApi';
import { DEMO_EVENTS, DEMO_SCENARIOS } from '../src/demo/fixtures';
import { readCaptureText, validateCapture, MAX_CAPTURE_BYTES } from '../src/ocr/readCapture';
import { attentionFindings, buildReportHtml, maskContacts } from '../src/report/reportDoc';
import { valuesOf } from '../src/ui/display';

// ④ 제보 근거 정리·캡처 OCR 보조 로직(APP-015). PDF 생성·실제 Vision 인식은 D2 시뮬레이터에서 따로 확인한다.
describe('제보 근거 정리', () => {
  it('판매글 원문의 연락처(전화·링크·이메일·카톡 ID)를 가린다', () => {
    const t = maskContacts('010-1234-5678 로 연락, 카톡 ID: ticket_kim, https://open.kakao.com/o/abc, a@b.com');
    expect(t).not.toMatch(/1234|ticket_kim|kakao|a@b\.com/);
    expect(t.match(/●●●●/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('확인 항목은 matched 를 뺀 서버 항목이고, 문서는 응답 값만 쓰고 HTML 을 이스케이프한다', async () => {
    const api = createDemoApi({ latencyMs: 0 });
    const a = DEMO_SCENARIOS.find((s) => s.id === 'A')!;
    const first = await api.createCheck({ eventId: a.eventId, listingText: a.listingText });
    const res = await api.createCheck({
      eventId: a.eventId,
      listingText: a.listingText,
      previousCheckId: first.checkId,
      confirmedFields: { ...valuesOf(first.extracted), listingEventId: a.eventId, feeBasis: 'ticket_only', discountStatus: 'standard' },
    });
    const items = attentionFindings(res);
    expect(items.every((f) => f.status !== 'matched')).toBe(true);
    expect(items.length).toBe(res.findings.filter((f) => f.status !== 'matched').length);
    const html = buildReportHtml(res, DEMO_EVENTS[0], a.listingText + " <script>alert('x')</script>");
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('+76,000원');
    expect(html).toContain('시연 데이터 포함');
  });
});

describe('캡처 이미지 OCR 보조', () => {
  it('PNG/JPG·5MB 이하만 받는다', () => {
    expect(validateCapture({ uri: 'file:///a.png', name: 'a.png', bytes: 1000, mime: 'image/png' })).toBeNull();
    expect(validateCapture({ uri: 'file:///a.jpg', name: 'a.jpg', bytes: MAX_CAPTURE_BYTES + 1, mime: 'image/jpeg' })).toBe('TOO_LARGE_OR_TYPE');
    expect(validateCapture({ uri: 'file:///a.gif', name: 'a.gif', bytes: 10, mime: 'image/gif' })).toBe('TOO_LARGE_OR_TYPE');
  });

  it('네이티브 OCR 모듈이 없는 환경(Jest·Expo Go)에서는 성공을 꾸미지 않고 OCR_UNAVAILABLE', async () => {
    await expect(readCaptureText({ uri: 'file:///a.png', name: 'a.png', bytes: 10, mime: 'image/png' })).resolves.toEqual({ error: 'OCR_UNAVAILABLE' });
  });
});
