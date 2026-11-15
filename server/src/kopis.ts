import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { ApiError } from './errors.ts';

/** 공연 목록의 메타데이터만 다룬다. 가격·회차·입장 규정의 확인 근거로 사용하지 않는다. */
export interface KopisPerformance {
  id: string;
  title: string;
  venue: string | null;
  startsOn: string;
  endsOn: string;
  status: string | null;
  source: 'KOPIS';
  fetchedAt: string;
}

const parser = new XMLParser({ ignoreAttributes: true, processEntities: false, parseTagValue: false });
// 외부 엔티티는 허용하지 않되 공연명에 포함된 표준 XML 문자 참조는 한 번만 해석한다.
const str = (value: unknown): string => typeof value === 'string' ? value.trim().replace(/&(?:amp|lt|gt|quot|apos|#x[\da-f]+|#\d+);/gi, entity => {
  const named: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
  if (named[entity]) return named[entity];
  const numeric = entity.slice(2, -1);
  const code = numeric[0]?.toLowerCase() === 'x' ? Number.parseInt(numeric.slice(1), 16) : Number.parseInt(numeric, 10);
  return Number.isInteger(code) && code >= 0x20 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : entity;
}) : '';
const date = (value: unknown): string | null => {
  const raw = str(value);
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return null;
  const normalized = raw.replaceAll('.', '-');
  const parsed = new Date(`${normalized}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== normalized ? null : normalized;
};

export function parseKopisList(xml: string, fetchedAt: string): KopisPerformance[] {
  if (xml.length > 1_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) {
    throw new ApiError('KOPIS_INVALID_RESPONSE', '공연정보 응답을 확인할 수 없습니다.', 502, true);
  }
  const parsed = parser.parse(xml) as { dbs?: { db?: unknown } };
  if (!parsed || !Object.hasOwn(parsed, 'dbs')) throw new ApiError('KOPIS_INVALID_RESPONSE', '공연정보 응답 형식이 올바르지 않습니다.', 502, true);
  const data = parsed.dbs && typeof parsed.dbs === 'object' ? parsed.dbs.db : undefined;
  if (data == null) return [];
  const rows = Array.isArray(data) ? data : [data];
  return rows.map((item: unknown) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const id = str(row.mt20id), title = str(row.prfnm), startsOn = date(row.prfpdfrom), endsOn = date(row.prfpdto);
    if (!/^PF\d+$/.test(id) || !title || title.length > 500 || !startsOn || !endsOn || startsOn > endsOn) {
      throw new ApiError('KOPIS_INVALID_RESPONSE', '공연정보의 필수 항목이 올바르지 않습니다.', 502, true);
    }
    return { id, title, venue: str(row.fcltynm) || null, startsOn, endsOn, status: str(row.prfstate) || null, source: 'KOPIS' as const, fetchedAt };
  });
}

/** 키는 서버 환경에만 보관한다. 오류 본문 및 요청 URL은 외부에 노출하지 않는다. */
export async function searchKopis(apiKey: string, query: string, options: { now?: Date; fetch?: typeof fetch } = {}): Promise<KopisPerformance[]> {
  if (!apiKey.trim()) throw new ApiError('KOPIS_NOT_CONFIGURED', '공연 검색 서비스가 설정되지 않았습니다.', 503, true);
  const normalizedQuery = query.trim();
  if (normalizedQuery.length > 100) throw new ApiError('BAD_REQUEST', '공연 검색어는 100자 이하로 입력해 주세요.');
  const now = options.now ?? new Date();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const end = new Date(`${today}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + 30);
  const url = new URL('https://kopis.or.kr/openApi/restful/pblprfr');
  const params: Record<string, string> = { service: apiKey, stdate: today.replaceAll('-', ''), eddate: end.toISOString().slice(0, 10).replaceAll('-', ''), cpage: '1', rows: '30', prfstate: '02' };
  if (normalizedQuery) params.shprfnm = normalizedQuery;
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  // 한 번의 일시적 연결 오류나 upstream 5xx만 재시도한다. 두 번 합쳐 최대 12초로 웹의 15초 제한보다 짧다.
  // 리디렉션과 인증·요청 오류를 우회하거나 실패 결과를 가상 데이터로 대체하지 않는다.
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try { response = await (options.fetch ?? fetch)(url, { signal: AbortSignal.timeout(6_000), redirect: 'manual' }); }
    catch (error) {
      console.warn('KOPIS upstream connection failed:', error instanceof Error ? error.name : 'unknown');
      if (attempt === 0) continue;
      throw new ApiError('KOPIS_UNAVAILABLE', '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 502, true);
    }
    if (response.ok) return parseKopisList(await response.text(), now.toISOString());
    console.warn('KOPIS upstream HTTP status:', response.status);
    if (attempt === 0 && [500, 502, 503, 504].includes(response.status)) {
      await response.body?.cancel().catch(() => undefined);
      continue;
    }
    throw new ApiError('KOPIS_UNAVAILABLE', '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 502, true);
  }
  throw new ApiError('KOPIS_UNAVAILABLE', '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 502, true);
}
