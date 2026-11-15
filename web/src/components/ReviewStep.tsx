import type { ReactNode } from 'react'
import type {
  EventSummary,
  ExtractedField,
  ExtractedFields,
  ExtractionMetadata,
  FieldKey,
  ListingFields,
  OfficialContext,
} from '../contract/types'
import {
  BOOKING_LABELS,
  DELIVERY_LABELS,
  DISCOUNT_LABELS,
  FEE_BASIS_LABELS,
  PRICE_BASIS_LABELS,
  formatWon,
  showtimeById,
  showtimeText,
} from '../ui/format'
import { DemoBadge, ListingQuote } from './common'
import { MoneyInput } from './MoneyInput'
import './review-redesign.css'

// 3단계 화면의 입력 출처. 서버 추출 응답이거나, 사용자가 명시적으로 고른 직접 입력이다.
export interface ReviewSource {
  checkId: string | null // 서버 추출 응답의 checkId (재대조 previousCheckId). 직접 입력이면 null
  manual: boolean
  extracted: ExtractedFields
  extraction: ExtractionMetadata
  notices: string[]
  isDemo: boolean | null // 직접 입력은 서버 대조 전이라 아직 알 수 없음
}

interface Props {
  event: EventSummary
  context: OfficialContext | null
  source: ReviewSource
  fields: ListingFields
  submitting: boolean
  onChange: (fields: ListingFields) => void
  onSubmit: () => void
  onBack: () => void
}

type Option = { value: string | boolean; label: string }
const enumOptions = (labels: Record<string, string>): Option[] => Object.entries(labels).map(([value, label]) => ({ value, label }))
const yesNo = (yes: string, no: string): Option[] => [{ value: true, label: yes }, { value: false, label: no }]

// AI 추출값은 후보일 뿐이다. 사용자가 확인·수정한 전체 값을 서버에 보내 대조한다.
export function ReviewStep({ event, context, source, fields, submitting, onChange, onSubmit, onBack }: Props) {
  const { extracted } = source
  const set = <K extends FieldKey>(key: K, value: ListingFields[K]) => onChange({ ...fields, [key]: value })
  const row = (key: FieldKey) => ({ inputId: `f-${key}`, field: extracted[key] as ExtractedField, changed: fields[key] !== extracted[key].value })

  const gradeOptions = unique([
    ...(context?.priceTiers.map((t) => t.seatGrade) ?? []),
    ...(extracted.seatGrade.status === 'ambiguous' ? extracted.seatGrade.candidates : []),
    ...(fields.seatGrade ? [fields.seatGrade] : []),
  ])
  const unknownCount = (Object.keys(fields) as FieldKey[]).filter((k) => fields[k] === null).length

  const choice = (key: FieldKey, label: string, options: Option[]) => (
    <FieldRow label={label} {...row(key)} display={(v) => options.find((o) => o.value === v)?.label ?? String(v)}>
      <select
        id={`f-${key}`}
        value={fields[key] === null ? '' : String(fields[key])}
        onChange={(e) => set(key, (options.find((o) => String(o.value) === e.target.value)?.value ?? null) as never)}
      >
        <option value="">확인 불가</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
        ))}
      </select>
    </FieldRow>
  )

  return (
    <section className="card review-card" aria-labelledby="review-step-title">
      <div className="card-head">
        <h2 id="review-step-title">3. 추출 정보 확인·수정</h2>
        {source.isDemo !== null && <DemoBadge isDemo={source.isDemo} />}
      </div>
      <ExtractionLine info={source.extraction} />
      <div className="review-event"><span>선택한 공연</span><strong>{event.title}</strong></div>
      <p className="muted">
        {source.manual
          ? '판매글을 보고 값을 직접 입력하세요. 입력하지 않은 항목은 ‘확인 불가’로 대조합니다.'
          : '판매글에서 읽은 후보입니다. 잘못 읽었거나 비어 있으면 직접 고친 뒤 대조하세요. 비어 있는 항목은 ‘확인 불가’로 대조합니다.'}
      </p>
      {source.notices.map((notice) => (
        <p key={notice} className="state state-info">{notice}</p>
      ))}

      <div className="review-group-heading"><h3>판매글 정보</h3><p>읽은 내용을 확인하고 고쳐 주세요.</p></div>
      <div className="field-grid review-fields">
        <FieldRow label="회차" {...row('showtimeId')} display={(v) => showtimeById(event, String(v))}>
          <select id="f-showtimeId" value={fields.showtimeId ?? ''} onChange={(e) => set('showtimeId', e.target.value || null)}>
            <option value="">확인 불가</option>
            {event.showtimes.map((s) => (
              <option key={s.id} value={s.id}>{showtimeText(s)}</option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="좌석 등급" {...row('seatGrade')} display={(v) => String(v)}>
          {gradeOptions.length > 0 ? (
            <select id="f-seatGrade" value={fields.seatGrade ?? ''} onChange={(e) => set('seatGrade', e.target.value || null)}>
              <option value="">확인 불가</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          ) : (
            <input id="f-seatGrade" value={fields.seatGrade ?? ''} placeholder="예: VIP" onChange={(e) => set('seatGrade', e.target.value.trim() || null)} />
          )}
        </FieldRow>

        <FieldRow label="1매 가격(원)" {...row('price')} display={(v) => formatWon(Number(v))}>
          <MoneyInput id="f-price" minAmount={0} value={fields.price === null ? '' : String(fields.price)} placeholder="확인 불가"
            onValueChange={(value) => set('price', toIntOrNull(value, 0))} />
        </FieldRow>

        <FieldRow label="매수" {...row('quantity')} display={(v) => `${v}장`}>
          <input id="f-quantity" type="number" inputMode="numeric" min={1} step={1} value={fields.quantity ?? ''} placeholder="확인 불가"
            onChange={(e) => set('quantity', toIntOrNull(e.target.value, 1))} />
        </FieldRow>

        {choice('deliveryMethod', '전달 방식', enumOptions(DELIVERY_LABELS))}
        {choice('prepaymentRequested', '입금 먼저 요구', yesNo('요구 문구 있음', '요구 문구 없음'))}
      </div>

      <div className="review-group-heading"><h3>가격 비교 조건</h3><p>같은 조건인지 확인해야 가격을 비교할 수 있어요.</p></div>
      <div className="field-grid review-fields">
        {choice('listingEventId', '선택한 공연에 대한 판매글인가요?', [
          { value: event.id, label: '네, 선택한 공연입니다' },
          { value: 'other-event', label: '아니요, 다른 공연입니다' },
        ])}
        {choice('priceBasis', '가격 기준', enumOptions(PRICE_BASIS_LABELS))}
        {choice('feeBasis', '수수료 포함 여부', enumOptions(FEE_BASIS_LABELS))}
        {choice('discountStatus', '할인 여부', enumOptions(DISCOUNT_LABELS))}
        {choice('bookingType', '예매 유형', enumOptions(BOOKING_LABELS))}
        {choice('buyerIsBooker', '관람자가 예매자 본인인가요?', yesNo('예', '아니요'))}
      </div>

      {unknownCount > 0 && (
        <p className="state state-warn small">
          확인 불가 항목 {unknownCount}개가 있습니다. 그대로 대조하면 관련 결과는 ‘확인 불가’ 또는 ‘가격 비교 보류’로 표시됩니다.
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          판매글 다시 입력
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? '공식 자료와 대조하는 중…' : '이 값으로 공식 자료와 대조'}
        </button>
      </div>
    </section>
  )
}

// 추출값을 어떤 방식으로 얻었는지 표시한다. 이번 요청에서 실제 모델 호출이 없었으면 AI 추출로 보이지 않게 한다.
export function ExtractionLine({ info }: { info: ExtractionMetadata }) {
  let label: string
  if (info.method === 'model') {
    const who = [info.provider, info.model].filter(Boolean).join(' ')
    label = info.actualModelCall
      ? `AI 모델 추출 · ${who} · 추출값은 후보입니다`
      : `이전 AI 추출 재사용 · ${who} · 이번 요청에서 모델 호출 없음`
  } else if (info.method === 'fixture') {
    label = '시연 fixture 조회 · AI 호출 없음'
  } else {
    label = 'AI 추출 없음 · 사용자가 직접 입력'
  }
  return (
    <p className={`extraction-line extraction-${info.method}${info.actualModelCall ? '-call' : ''} small`} data-testid="extraction-mode">
      추출 방식: <strong>{label}</strong>
    </p>
  )
}

const STATUS_TEXT = { extracted: '판매글에서 추출', ambiguous: '후보 여러 개', unknown: '판매글에서 찾지 못함' } as const

function FieldRow({ label, inputId, field, changed, display, children }: {
  label: string
  inputId: string
  field: ExtractedField
  changed: boolean
  display: (value: unknown) => string
  children: ReactNode
}) {
  return (
    <div className={`field-row status-${field.status}`}>
      <div className="row-between">
        <label htmlFor={inputId} className="field-label">{label}</label>
        <span className="chips">
          <span className={`review-status review-status-${field.status}`}>{STATUS_TEXT[field.status]}</span>
          {changed && <span className="chip chip-edited">직접 수정함</span>}
        </span>
      </div>
      {children}
      <p className="small muted evidence">
        {field.evidenceQuote ? (
          <>근거 문구: <ListingQuote>{field.evidenceQuote}</ListingQuote></>
        ) : (
          '근거 문구 없음'
        )}
        {field.status === 'ambiguous' && <> · 후보: {(field.candidates as unknown[]).map(display).join(', ')}</>}
      </p>
    </div>
  )
}

function toIntOrNull(raw: string, min: number) {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isInteger(n) && n >= min ? n : null
}

function unique(values: string[]) {
  return [...new Set(values)]
}
