import { z } from 'zod';

export const CONTRACT_VERSION = '0.1.0' as const;
const text = z.string().trim().min(1).max(3000);
const id = z.string().min(1).max(200);
const money = z.number().int().min(0).max(100_000_000);
const date = z.union([z.iso.datetime({ offset: true }), z.iso.date()]);
const url = z.httpUrl().refine((s) => { const u = new URL(s); return !u.username && !u.password; });
export const DeliveryMethodSchema = z.enum(['official_transfer', 'qr_capture', 'onsite_with_seller', 'paper_courier', 'other']);
export const BookingTypeSchema = z.enum(['fanclub_presale', 'general']);
export const PriceBasisSchema = z.enum(['per_ticket', 'total']);
export const FeeBasisSchema = z.enum(['ticket_only', 'includes_fees']);
export const DiscountStatusSchema = z.enum(['standard', 'discounted']);

// The first six keys retain the UI prototype contract. New safety prerequisites
// default to null on legacy requests, which causes a hold, never an assumption.
export const ListingFieldsSchema = z.strictObject({
  showtimeId: id.nullable(), seatGrade: id.nullable(), price: money.nullable(),
  quantity: z.number().int().min(1).max(100).nullable(),
  deliveryMethod: DeliveryMethodSchema.nullable(), prepaymentRequested: z.boolean().nullable(),
  listingEventId: id.nullable().default(null), bookingType: BookingTypeSchema.nullable().default(null),
  priceBasis: PriceBasisSchema.nullable().default(null), feeBasis: FeeBasisSchema.nullable().default(null),
  discountStatus: DiscountStatusSchema.nullable().default(null), buyerIsBooker: z.boolean().nullable().default(null),
});
export type ListingFields = z.infer<typeof ListingFieldsSchema>;
export type FieldKey = keyof ListingFields;
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>;

function candidate<T extends z.ZodType>(schema: T) {
  return z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('unknown'), value: z.null(), evidenceQuote: z.null() }),
    z.strictObject({ status: z.literal('extracted'), value: schema, evidenceQuote: text }),
    z.strictObject({ status: z.literal('ambiguous'), value: z.null(), evidenceQuote: text, candidates: z.array(schema).min(2).max(10) }),
  ]);
}
export const ExtractedFieldsSchema = z.strictObject({
  showtimeId: candidate(id), seatGrade: candidate(id), price: candidate(money),
  quantity: candidate(z.number().int().min(1).max(100)),
  deliveryMethod: candidate(DeliveryMethodSchema), prepaymentRequested: candidate(z.boolean()),
  listingEventId: candidate(id), bookingType: candidate(BookingTypeSchema),
  priceBasis: candidate(PriceBasisSchema), feeBasis: candidate(FeeBasisSchema),
  discountStatus: candidate(DiscountStatusSchema), buyerIsBooker: candidate(z.boolean()),
});
export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>;
export const ExtractionJSONSchema = z.toJSONSchema(ExtractedFieldsSchema);
export const FIELD_KEYS = Object.keys(ExtractedFieldsSchema.shape) as FieldKey[];
export function unknownFields(): ExtractedFields {
  return ExtractedFieldsSchema.parse(Object.fromEntries(FIELD_KEYS.map(k => [k, { status: 'unknown', value: null, evidenceQuote: null }])));
}
export const ShowtimeSchema = z.strictObject({ id, startsAt: z.iso.datetime({ offset: true }), label: text });
export const KopisPerformanceSchema = z.strictObject({
  id: z.string().regex(/^PF\d+$/), title: z.string().trim().min(1).max(500), venue: z.string().nullable(),
  startsOn: z.iso.date(), endsOn: z.iso.date(), status: z.string().nullable(), source: z.literal('KOPIS'), fetchedAt: z.iso.datetime({ offset: true }),
}).refine(v => v.startsOn <= v.endsOn);
export const KopisPerformanceListSchema = z.array(KopisPerformanceSchema).max(30);
export type KopisPerformance = z.infer<typeof KopisPerformanceSchema>;
export const EventSummarySchema = z.strictObject({
  id, title: text, venue: text.nullable(), showtimes: z.array(ShowtimeSchema),
  officialUrl: url.nullable(), sourceCheckedAt: date.nullable(), isDemo: z.boolean(),
  source: z.literal('KOPIS').optional(),
  period: z.strictObject({ startsOn: z.iso.date(), endsOn: z.iso.date() }).optional(),
});
export const EventListSchema = z.array(EventSummarySchema);
export type EventSummary = z.infer<typeof EventSummarySchema>;
export const PriceTierSchema = z.strictObject({
  seatGrade: id, showtimeId: id.nullable(), facePrice: money.refine(v => v > 0),
  sourceText: text, sourceUrl: url, verifiedAt: date,
  priceBasis: z.literal('per_ticket'), feeBasis: z.literal('ticket_only'), discountStatus: z.literal('standard'),
});
export const TicketPolicySchema = z.strictObject({
  id, type: z.enum(['identity_check', 'transfer', 'pickup', 'other']), title: text,
  excerpt: text, sourceUrl: url, verifiedAt: date,
  scope: z.enum(['fanclub_presale', 'general', 'all']),
});
export const OfficialContextSchema = z.strictObject({
  eventId: id, priceTiers: z.array(PriceTierSchema), policies: z.array(TicketPolicySchema),
  isDemo: z.boolean(), sourceType: z.enum(['official', 'synthetic']),
  sourceVersion: text, sourceDatePrecision: z.enum(['date', 'datetime']),
});
export type OfficialContext = z.infer<typeof OfficialContextSchema>;
export const CheckRequestSchema = z.strictObject({
  eventId: id, listingText: z.string().min(1).max(3000).refine(v => v.trim().length > 0),
  confirmedFields: ListingFieldsSchema.optional(),
  previousCheckId: z.uuid().optional(), extractionMode: z.enum(['model', 'manual']).default('model'),
  syntheticListing: z.boolean().default(true),
}).superRefine((v, ctx) => {
  if (v.extractionMode === 'manual' && !v.confirmedFields) ctx.addIssue({ code: 'custom', message: 'manual requires confirmedFields' });
  if (v.extractionMode === 'manual' && v.previousCheckId) ctx.addIssue({ code: 'custom', message: 'manual cannot reuse model extraction' });
});
export type CheckRequest = z.infer<typeof CheckRequestSchema>;
export type CheckRequestInput = z.input<typeof CheckRequestSchema>;

export const FindingSchema = z.strictObject({
  id, type: z.enum(['price', 'policy', 'prepayment']),
  status: z.enum(['conflict', 'needs_check', 'matched', 'unverifiable', 'comparison_held']),
  title: text, listingQuote: text.nullable(), officialExcerpt: text.nullable(),
  sourceUrl: url.nullable(), checkedAt: date.nullable(), reason: text,
}).superRefine((f, ctx) => {
  if (['conflict', 'matched', 'needs_check'].includes(f.status) && !f.listingQuote) {
    ctx.addIssue({ code: 'custom', path: ['listingQuote'], message: 'a nonempty listing quotation is required for this finding status' });
  }
  if ((f.status === 'conflict' || f.status === 'matched') && f.type !== 'prepayment' &&
      (!f.officialExcerpt || !f.sourceUrl || !f.checkedAt)) ctx.addIssue({ code: 'custom', message: 'official evidence required' });
  if (f.officialExcerpt && (!f.sourceUrl || !f.checkedAt)) ctx.addIssue({ code: 'custom', message: 'official quotation must link to its source' });
});
export type Finding = z.infer<typeof FindingSchema>;
export const PriceComparisonSchema = z.discriminatedUnion('held', [
  z.strictObject({ held: z.literal(true), reason: text }),
  z.strictObject({ held: z.literal(false), seatGrade: id, showtimeId: id,
    facePrice: money.refine(v => v > 0), listingPrice: money, diff: z.number().finite(),
    ratePercent: z.number().finite(), sourceUrl: url, verifiedAt: date }),
]);
export type PriceComparison = z.infer<typeof PriceComparisonSchema>;
export const ExtractionMetadataSchema = z.strictObject({
  method: z.enum(['model', 'fixture', 'manual']), provider: text.nullable(), model: text.nullable(),
  actualModelCall: z.boolean(), reused: z.boolean(),
}).superRefine((m, ctx) => {
  if (m.method === 'model' && (!m.provider || !m.model || (!m.actualModelCall && !m.reused))) ctx.addIssue({ code: 'custom', message: 'model provenance required' });
  if (m.reused && m.actualModelCall) ctx.addIssue({ code: 'custom', message: 'reuse cannot claim a fresh model call' });
  if (m.method !== 'model' && m.actualModelCall) ctx.addIssue({ code: 'custom', message: 'non-model cannot claim a model call' });
});
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export const CheckResponseSchema = z.strictObject({
  contractVersion: z.literal(CONTRACT_VERSION), checkId: z.uuid(), eventId: id,
  extracted: ExtractedFieldsSchema, appliedFields: ListingFieldsSchema.nullable(),
  findings: z.array(FindingSchema), priceComparison: PriceComparisonSchema, notices: z.array(text),
  checkedAt: z.iso.datetime({ offset: true }), isDemo: z.boolean(), dataMode: z.enum(['demo', 'live']),
  extraction: ExtractionMetadataSchema,
  provenance: z.strictObject({ syntheticListing: z.boolean(), officialSourceType: z.enum(['official', 'synthetic']), sourceVersion: text }),
}).superRefine((r, ctx) => {
  const synthetic = r.provenance.syntheticListing || r.provenance.officialSourceType === 'synthetic' || r.extraction.method === 'fixture';
  if (r.isDemo !== synthetic || r.dataMode !== (synthetic ? 'demo' : 'live')) ctx.addIssue({ code: 'custom', message: 'data mode must reflect actual data provenance' });
  if (!r.priceComparison.held) {
    const p = r.priceComparison;
    if (!r.appliedFields || r.appliedFields.price !== p.listingPrice || r.appliedFields.seatGrade !== p.seatGrade ||
        r.appliedFields.showtimeId !== p.showtimeId || r.appliedFields.listingEventId !== r.eventId ||
        r.appliedFields.priceBasis !== 'per_ticket' || r.appliedFields.feeBasis !== 'ticket_only' || r.appliedFields.discountStatus !== 'standard') {
      ctx.addIssue({ code: 'custom', message: 'comparison must use confirmed matching base-price fields' });
    }
    if (p.diff !== p.listingPrice - p.facePrice || Math.abs(p.ratePercent - (p.listingPrice / p.facePrice - 1) * 100) > 0.011) ctx.addIssue({ code: 'custom', message: 'incorrect price arithmetic' });
  }
});
export type CheckResponse = z.infer<typeof CheckResponseSchema>;
export const ApiErrorBodySchema = z.strictObject({ code: id, message: text, retryable: z.boolean() });
export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;
