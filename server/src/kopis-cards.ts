import { XMLParser } from 'fast-xml-parser';
import { ApiError } from './errors.ts';
import { parseKopisList, type KopisPerformance } from './kopis.ts';

export type KopisCard = KopisPerformance & { genre: string | null; posterUrl: string | null };
export type KopisDetail = KopisCard & { story: string | null; cast: string | null; runtime: string | null; age: string | null; schedule: string | null; priceGuide: string | null; priceCandidate: { seatGrade: '전석'; price: number; sourceQuote: string } | null; introImages: string[]; facilityId: string | null; stageId: string | null; stageCapacity: number | null };

// Display-only candidate. No partial matches, discounts, ranges or unit inference.
export function parseAllSeatsPrice(guide: string | null): KopisDetail['priceCandidate'] {
  if (!guide) return null;
  const match = /^전석\s+((?:[1-9]\d{0,2}(?:,\d{3})+)|(?:[1-9]\d{0,7}))\s*원$/.exec(guide.trim());
  if (!match) return null;
  const price = Number(match[1].replaceAll(',', ''));
  return Number.isSafeInteger(price) && price > 0 && price <= 10_000_000 ? { seatGrade: '전석', price, sourceQuote: guide.trim() } : null;
}

function introImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || !['kopis.or.kr', 'www.kopis.or.kr'].includes(url.hostname) || url.port || url.username || url.password || !url.pathname.startsWith('/upload/pfmIntroImage/')) return null;
    url.protocol = 'https:';
    return url.toString();
  } catch { return null; }
}

export function kopisPosterUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || !['kopis.or.kr', 'www.kopis.or.kr'].includes(url.hostname) || url.port || url.username || url.password || !url.pathname.startsWith('/upload/pfmPoster/')) return null;
    url.protocol = 'https:';
    return url.toString();
  } catch { return null; }
}

export function parseKopisCards(xml: string, fetchedAt: string): KopisCard[] {
  const performances = parseKopisList(xml, fetchedAt);
  const parsed = new XMLParser({ ignoreAttributes: true, processEntities: false, parseTagValue: false }).parse(xml) as { dbs?: { db?: unknown } };
  const rows = parsed.dbs?.db;
  const items = Array.isArray(rows) ? rows : rows ? [rows] : [];
  const byId = new Map(items.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object' && typeof (row as Record<string, unknown>).mt20id === 'string').map((row) => [String(row.mt20id).trim(), row]));
  return performances.map((performance) => {
    const row = byId.get(performance.id);
    const genre = typeof row?.genrenm === 'string' ? row.genrenm.trim().slice(0, 100) : '';
    return { ...performance, genre: genre || null, posterUrl: kopisPosterUrl(row?.poster) };
  });
}

export function parseKopisDetail(xml: string, fetchedAt: string, expectedId: string): KopisDetail {
  const cards = parseKopisCards(xml, fetchedAt);
  if (cards.length !== 1 || cards[0].id !== expectedId) throw new ApiError('KOPIS_NOT_FOUND', '공연 정보를 찾을 수 없어요.', 404);
  const parsed = new XMLParser({ ignoreAttributes: true, processEntities: false, parseTagValue: false }).parse(xml) as { dbs?: { db?: Record<string, unknown> } };
  const row = parsed.dbs?.db ?? {};
  const text = (value: unknown, limit = 5000) => typeof value === 'string' ? value.trim().slice(0, limit) || null : null;
  const intro = row.styurls && typeof row.styurls === 'object' ? (row.styurls as Record<string, unknown>).styurl : undefined;
  const introImages = (Array.isArray(intro) ? intro : [intro]).map(introImageUrl).filter((url): url is string => url !== null).slice(0, 5);
  const facilityId = typeof row.mt10id === 'string' && /^FC\d{6}$/.test(row.mt10id) ? row.mt10id : null;
  const stageId = typeof row.mt13id === 'string' && facilityId && new RegExp(`^${facilityId}-\\d{2}$`).test(row.mt13id) ? row.mt13id : null;
  const priceGuide = text(row.pcseguidance, 1000);
  return { ...cards[0], story: text(row.sty), cast: text(row.prfcast, 1000), runtime: text(row.prfruntime, 200), age: text(row.prfage, 200), schedule: text(row.dtguidance, 1000), priceGuide, priceCandidate: parseAllSeatsPrice(priceGuide), introImages, facilityId, stageId, stageCapacity: null };
}

export function parseStageCapacity(xml: string, facilityId: string, stageId: string): number | null {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) return null;
  try {
    const row = new XMLParser({ ignoreAttributes: true, processEntities: false, parseTagValue: false }).parse(xml)?.dbs?.db;
    if (!row || row.mt10id !== facilityId) return null;
    const raw = row.mt13s?.mt13;
    const stages = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const matches = stages.filter((stage: Record<string, unknown>) => stage?.mt13id === stageId);
    if (matches.length !== 1 || typeof matches[0].seatscale !== 'string' || !/^\d{1,6}$/.test(matches[0].seatscale)) return null;
    const count = Number(matches[0].seatscale);
    return count > 0 ? count : null;
  } catch { return null; }
}

export async function searchKopisCards(apiKey: string, options: { now?: Date; fetch?: typeof fetch; category?: 'concert' | 'musical'; page?: number } = {}): Promise<KopisCard[]> {
  if (!apiKey.trim()) throw new ApiError('KOPIS_NOT_CONFIGURED', '공연 검색 서비스가 설정되지 않았습니다.', 503, true);
  const page = options.page ?? 1;
  if (!Number.isInteger(page) || page < 1 || page > 999) throw new ApiError('BAD_REQUEST', '공연 목록 페이지를 확인해 주세요.');
  const now = options.now ?? new Date();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const end = new Date(`${today}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + 30);
  const url = new URL('https://kopis.or.kr/openApi/restful/pblprfr');
  for (const [key, value] of Object.entries({ service: apiKey, stdate: today.replaceAll('-', ''), eddate: end.toISOString().slice(0, 10).replaceAll('-', ''), cpage: String(page), rows: '30' })) url.searchParams.set(key, value);
  if (options.category) url.searchParams.set('shcate', options.category === 'concert' ? 'CCCD' : 'GGGA');
  let response: Response;
  try { response = await (options.fetch ?? fetch)(url, { signal: AbortSignal.timeout(10_000), redirect: 'manual' }); }
  catch { throw new ApiError('KOPIS_UNAVAILABLE', '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 502, true); }
  if (!response.ok) throw new ApiError('KOPIS_UNAVAILABLE', '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 502, true);
  return parseKopisCards(await response.text(), now.toISOString());
}

export async function fetchKopisDetail(apiKey: string, id: string, options: { fetch?: typeof fetch; now?: Date } = {}): Promise<KopisDetail> {
  if (!/^PF\d+$/.test(id)) throw new ApiError('BAD_REQUEST', '공연 번호를 확인해 주세요.');
  if (!apiKey.trim()) throw new ApiError('KOPIS_NOT_CONFIGURED', '공연 검색 서비스가 설정되지 않았습니다.', 503, true);
  const url = new URL(`https://kopis.or.kr/openApi/restful/pblprfr/${id}`);
  url.searchParams.set('service', apiKey);
  let response: Response;
  try { response = await (options.fetch ?? fetch)(url, { signal: AbortSignal.timeout(10_000), redirect: 'manual' }); }
  catch { throw new ApiError('KOPIS_UNAVAILABLE', '공연 정보를 불러오지 못했어요.', 502, true); }
  if (!response.ok) throw new ApiError('KOPIS_UNAVAILABLE', '공연 정보를 불러오지 못했어요.', 502, true);
  const detail = parseKopisDetail(await response.text(), (options.now ?? new Date()).toISOString(), id);
  if (detail.facilityId && detail.stageId) {
    const facility = new URL(`https://kopis.or.kr/openApi/restful/prfplc/${detail.facilityId}`);
    facility.searchParams.set('service', apiKey);
    try {
      const result = await (options.fetch ?? fetch)(facility, { signal: AbortSignal.timeout(3_000), redirect: 'manual' });
      if (result.ok) detail.stageCapacity = parseStageCapacity(await result.text(), detail.facilityId, detail.stageId);
    } catch { /* 공연 정보는 유지하되 객석수는 확인 불가로 표시 */ }
  }
  return detail;
}
