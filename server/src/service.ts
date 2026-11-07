import { createHash, randomUUID } from 'node:crypto';
import { CheckRequestSchema, CheckResponseSchema, unknownFields, type CheckResponse, type ExtractedFields, type ExtractionMetadata } from '../../shared/index.ts';
import { catalog, type CatalogEntry } from './catalog.ts';
import { ApiError } from './errors.ts';
import { validateGroundedExtraction, type ExtractionProvider } from './extraction.ts';
import { comparePrice, createFindings } from './rules.ts';

interface CachedExtraction { fingerprint: string; extracted: ExtractedFields; metadata: ExtractionMetadata; expiresAt: number }
export class CheckService {
  readonly entries: CatalogEntry[];
  private readonly provider: ExtractionProvider | null;
  private readonly timeoutMs: number;
  private readonly cache = new Map<string, CachedExtraction>();
  constructor(provider: ExtractionProvider | null = null, entries = catalog, timeoutMs = 10_000) {
    this.provider = provider; this.entries = entries; this.timeoutMs = timeoutMs;
  }
  get aiConfigured(): boolean { return this.provider !== null; }
  async check(raw: unknown): Promise<CheckResponse> {
    const parsed = CheckRequestSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError('BAD_REQUEST', '입력 형식·길이와 확인값을 점검하세요.');
    const request = parsed.data;
    const entry = this.entries.find(e => e.event.id === request.eventId);
    if (!entry) throw new ApiError('EVENT_NOT_FOUND', '선택한 공연을 찾을 수 없습니다.', 404);
    for (const [key, value] of this.cache) if (value.expiresAt <= Date.now()) this.cache.delete(key);
    const fingerprint = createHash('sha256').update(JSON.stringify([request.eventId, request.listingText, request.syntheticListing])).digest('hex');
    let extracted: ExtractedFields, metadata: ExtractionMetadata;
    if (request.extractionMode === 'manual') {
      extracted = unknownFields();
      metadata = { method: 'manual', provider: null, model: null, actualModelCall: false, reused: false };
    } else if (request.previousCheckId) {
      const previous = this.cache.get(request.previousCheckId);
      if (!previous || previous.fingerprint !== fingerprint) throw new ApiError('CHECK_EXPIRED_OR_MISMATCH', '이전 추출이 만료됐거나 원문이 바뀌었습니다. 다시 추출하세요.', 409, true);
      extracted = previous.extracted;
      metadata = { ...previous.metadata, reused: true, actualModelCall: false };
    } else {
      if (!this.provider) throw new ApiError('AI_NOT_CONFIGURED', 'AI 제공자가 설정되지 않았습니다. 설정 후 재시도하거나 명시적인 수동 입력을 선택하세요.', 503);
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const rawFields = await Promise.race([
          this.provider.extract(request.listingText, entry, controller.signal),
          new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new ApiError('AI_TIMEOUT', 'AI 추출 시간이 초과됐습니다. 다시 시도하세요.', 504, true)); }, this.timeoutMs); }),
        ]);
        extracted = validateGroundedExtraction(rawFields, request.listingText, entry);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('AI_PROVIDER_ERROR', 'AI 추출 중 오류가 발생했습니다. 다시 시도하세요.', 502, true);
      } finally { if (timer) clearTimeout(timer); }
      metadata = { method: this.provider.method, provider: this.provider.name, model: this.provider.modelFor?.(controller.signal) ?? this.provider.model,
        actualModelCall: this.provider.method === 'model', reused: false };
    }
    const appliedFields = request.confirmedFields ?? null;
    const priceComparison = comparePrice(entry, appliedFields);
    const synthetic = request.syntheticListing || entry.context.sourceType === 'synthetic' || metadata.method === 'fixture';
    const response = CheckResponseSchema.parse({
      contractVersion: '0.1.0', checkId: randomUUID(), eventId: entry.event.id, extracted, appliedFields,
      findings: createFindings(entry, appliedFields, extracted, request.listingText, priceComparison),
      priceComparison, notices: [
        '티켓 진위·입장·사기 여부를 보증하거나 확정하지 않습니다.',
        '가격은 사용자 확인값의 티켓 1매 기본가 기준이며 수수료·할인 조건이 다르면 비교를 보류합니다.',
        ...(synthetic ? ['시연 자료가 포함돼 있습니다. 실제 판매 사례·성능 측정이 아닙니다.'] : []),
        ...(metadata.method === 'manual' ? ['명시적인 수동 입력입니다. AI 추출을 수행하지 않았습니다.'] : []),
      ], checkedAt: new Date().toISOString(), isDemo: synthetic, dataMode: synthetic ? 'demo' : 'live',
      extraction: metadata,
      provenance: { syntheticListing: request.syntheticListing, officialSourceType: entry.context.sourceType, sourceVersion: entry.context.sourceVersion },
    });
    // Bounded, ephemeral memory only: no raw listing or response is persisted.
    if (this.cache.size >= 100) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(response.checkId, { fingerprint, extracted, metadata, expiresAt: Date.now() + 15 * 60_000 });
    return response;
  }
}
