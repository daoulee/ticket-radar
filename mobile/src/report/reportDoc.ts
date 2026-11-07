import type { CheckResponse, EventSummary, Finding } from '../contract/types';
import { formatKst, formatSignedPercent, formatSignedWon, formatWon } from '../ui/format';
import { extractionText, provenanceLines } from '../ui/display';

// ④ 제보 근거 정리: 대조 결과 응답에 담긴 값만으로 문서를 만든다. 앱이 새 판정·숫자를 만들지 않는다.
// 판매글 원문의 연락처(전화번호·링크·이메일·오픈채팅 ID 표기)는 가린다(목업: '연락처는 가려짐').

export function maskContacts(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, '●●●●')
    .replace(/open\.kakao\.com\/\S+/gi, '●●●●')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '●●●●')
    .replace(/(?:\+?82[-\s]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g, '●●●●')
    .replace(/\d{2,6}-\d{2,6}-\d{2,8}/g, '●●●●')
    .replace(/\d(?:[\s.-]?\d){9,15}/g, '●●●●') // 계좌번호(서버 reports.ts 와 같은 기준)
    .replace(/((?:카톡|카카오톡|오픈채팅|텔레그램|라인)\s*(?:ID|아이디|id)?\s*[:：]?\s*)[\w.-]{3,}/g, '$1●●●●');
}

export function attentionFindings(result: CheckResponse): Finding[] {
  return result.findings.filter((f) => f.status !== 'matched');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildReportHtml(result: CheckResponse, event: EventSummary, listingText: string): string {
  const pc = result.priceComparison;
  const items = attentionFindings(result)
    .map(
      (f) => `<div class="item">
  <div class="label">판매글</div><div class="quote">“${esc(f.listingQuote ?? '해당 문구 없음')}”</div>
  <div class="label">공식 안내</div><div>${esc(f.officialExcerpt ?? '공식 자료 없음')}</div>
  <div class="label">출처</div><div class="src">${f.sourceUrl ? `<a href="${esc(f.sourceUrl)}">${esc(f.sourceUrl)}</a>` : '공식 출처 없음'} · ${esc(formatKst(f.checkedAt))}</div>
  <div class="why">${esc(f.title)} — ${esc(f.reason)}</div>
</div>`,
    )
    .join('');
  const price = pc.held
    ? `<p>가격 비교 보류: ${esc(pc.reason)}</p>`
    : `<p>공식 기본가 ${esc(formatWon(pc.facePrice))} · 판매가 ${esc(formatWon(pc.listingPrice))} · 차이 ${esc(formatSignedWon(pc.diff))} (${esc(formatSignedPercent(pc.ratePercent))}) — 1매 기본가(수수료·할인 제외) 기준</p>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;color:#0B1220;margin:32px;font-size:13px;line-height:1.6}
h1{font-size:20px;margin:0 0 4px} .meta{color:#5A6478;font-size:12px;margin-bottom:16px}
.box{background:#F1F4FA;border-radius:10px;padding:12px 14px;margin:10px 0}
.item{border-top:1px solid #E1E6EF;padding:10px 0} .label{color:#5A6478;font-size:11px;margin-top:4px}
.quote{font-weight:700} .src{font-size:11px;color:#1D4ED8} .why{margin-top:6px;color:#3B4556}
.demo{display:inline-block;background:#E6ECF5;border-radius:6px;padding:1px 6px;font-size:11px;font-weight:700}
.foot{color:#5A6478;font-size:11px;margin-top:20px}
</style></head><body>
<h1>확인이 필요한 부분 — 제보 근거</h1>
<div class="meta">${esc(event.title)} · ${esc(formatKst(result.checkedAt))} 확인 · 티켓레이더 ${result.isDemo ? '<span class="demo">시연 데이터 포함</span>' : ''}</div>
<div class="box"><div class="label">판매글 원문 (연락처는 가려짐)</div><div>${esc(maskContacts(listingText)).replace(/\n/g, '<br>')}</div></div>
${price}
${items || '<p>확인이 필요한 부분이 없어 담을 내용이 적어요.</p>'}
<div class="box"><div class="label">신고·문의 전에</div><div>1. 예매처 공지와 관할 기관의 신고 안내를 확인합니다. 2. 공연·판매글·위 근거를 입력합니다. 3. 이 문서를 첨부합니다.${event.officialUrl ? `<br>예매처 공지: <a href="${esc(event.officialUrl)}">${esc(event.officialUrl)}</a>` : ''}</div></div>
<div class="meta">추출 방식: ${esc(extractionText(result.extraction))}<br>${provenanceLines(result.provenance).map(esc).join('<br>')}</div>
<div class="foot">이 결과는 참고용이며 최종 판단은 사용자가 합니다. 티켓레이더는 티켓 진위·입장 가능 여부·사기나 불법 여부를 확정하지 않습니다.</div>
</body></html>`;
}

// 공식 신고·문의 경로(사용자가 직접 여는 링크). 앱·서버는 어디에도 자동 제출하지 않는다.
// 각 기관의 접수 범위는 해당 사이트에서 확인해야 한다(기획 명세 8절 '신고 연계').
export const OFFICIAL_REPORT_LINKS = [
  { label: '경찰청 사이버범죄 신고시스템', url: 'https://ecrm.police.go.kr', note: '금전 피해·사기 의심 시' },
  { label: '국민신문고', url: 'https://www.epeople.go.kr', note: '부정 판매 민원' },
] as const;

/** 신고·문의 글에 붙여 넣을 요약(평문). 응답 값만 쓰고, 연락처는 가린다. */
export function buildReportSummaryText(result: CheckResponse, event: EventSummary, listingText: string): string {
  const pc = result.priceComparison;
  const lines = [
    `[티켓레이더 확인 요약] ${event.title}`,
    `확인 시각: ${formatKst(result.checkedAt)}${result.isDemo ? ' · 시연 데이터 포함' : ''}`,
    `판매글(연락처 가림): ${maskContacts(listingText)}`,
    pc.held
      ? `가격 비교 보류: ${pc.reason}`
      : `가격: 공식 기본가 ${formatWon(pc.facePrice)} / 판매가 ${formatWon(pc.listingPrice)} / 차이 ${formatSignedWon(pc.diff)} (${formatSignedPercent(pc.ratePercent)})`,
    ...attentionFindings(result).map(
      (f, i) => `${i + 1}. ${f.title} — 판매글 “${f.listingQuote ?? '해당 문구 없음'}” / 공식 “${f.officialExcerpt ?? '공식 자료 없음'}”${f.sourceUrl ? ` (${f.sourceUrl})` : ''}`,
    ),
    event.officialUrl ? `예매처 공지: ${event.officialUrl}` : null,
    '※ 티켓 진위·사기·불법 여부를 확정한 자료가 아닙니다. 참고용 요약입니다.',
  ];
  return lines.filter(Boolean).join('\n');
}
