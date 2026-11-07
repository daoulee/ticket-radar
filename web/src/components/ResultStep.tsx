import type { CheckResponse, EventSummary, Finding, ListingFields } from '../contract/types'
import {
  BOOKING_LABELS,
  DELIVERY_LABELS,
  DISCOUNT_LABELS,
  FEE_BASIS_LABELS,
  FINDING_STATUS_LABELS,
  PRICE_BASIS_LABELS,
  formatKst,
  showtimeById,
  formatSignedPercent,
  formatSignedWon,
  formatWon,
} from '../ui/format'
import { DemoBadge, FULLY_SYNTHETIC_TITLE, ListingQuote, SourceLine } from './common'
import { ExtractionLine } from './ReviewStep'
import { sameListingFields } from '../ui/fields'

interface Props {
  event: EventSummary
  result: CheckResponse
  currentFields: ListingFields
  submitting: boolean
  onRecheck: () => void
  onEdit: () => void
  onRestart: () => void
}

export function ResultStep({ event, result, currentFields, submitting, onRecheck, onEdit, onRestart }: Props) {
  // 수정 후 다시 대조하지 않은 결과는 이전 값 기준임을 분명히 표시한다 (SPEC T05).
  const stale = !result.appliedFields || !sameListingFields(result.appliedFields, currentFields)
  const comparison = result.priceComparison
  const showtimeLabel = (id: string | null) => showtimeById(event, id)
  // 링크 문구는 결과 전체의 시연 여부가 아니라 공식 자료가 합성인지로 정한다 (합성 판매글 + 실제 공지 가능).
  const syntheticSource = result.provenance.officialSourceType === 'synthetic'
  const label = <T extends string>(labels: Record<T, string>, v: T | null) => (v ? labels[v] : '확인 불가')
  const yn = (v: boolean | null, yes: string, no: string) => (v === null ? '확인 불가' : v ? yes : no)

  return (
    <section className="card" aria-labelledby="result-step-title">
      <div className="card-head">
        <h2 id="result-step-title">4. 공식 자료 대조 결과</h2>
        <DemoBadge isDemo={result.isDemo} title={demoTitle(result)} />
      </div>
      <p className="small muted">
        대조 시각 {formatKst(result.checkedAt)} · 확인 번호 {result.checkId.slice(0, 8)}
      </p>

      {stale && (
        <div className="state state-warn" role="status">
          <strong>추출값이 바뀌었습니다.</strong> 아래 결과는 수정 전 값 기준입니다.
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={onRecheck} disabled={submitting}>
              {submitting ? '다시 대조하는 중…' : '수정한 값으로 다시 대조'}
            </button>
          </div>
        </div>
      )}

      <div className={stale ? 'result-body is-stale' : 'result-body'}>
        <div className={`price-card ${comparison.held ? 'held' : 'compared'}`} aria-label="가격 비교">
          <h3>가격 비교</h3>
          {!comparison.held ? (
            <>
              <p className="price-diff">
                공식 가격 대비 <strong>{formatSignedWon(comparison.diff)}</strong> ({formatSignedPercent(comparison.ratePercent)})
              </p>
              <p className="small">
                {comparison.seatGrade} · {showtimeLabel(comparison.showtimeId)} · 공식 가격 {formatWon(comparison.facePrice)} / 판매가 {formatWon(comparison.listingPrice)}
              </p>
              <SourceLine url={comparison.sourceUrl} checkedAt={comparison.verifiedAt} isDemo={syntheticSource} />
            </>
          ) : (
            <>
              <p className="price-diff"><strong>가격 비교 보류</strong></p>
              <p className="small">{comparison.reason}</p>
            </>
          )}
        </div>

        <h3>확인할 점 {result.findings.length > 0 && <span className="muted">({result.findings.length}건)</span>}</h3>
        {result.findings.length === 0 ? (
          <p className="state">대조 결과 항목이 없습니다.</p>
        ) : (
          <ol className="findings" aria-label="확인할 점 목록">
            {result.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} isDemo={syntheticSource} />
            ))}
          </ol>
        )}

        {result.appliedFields && (
          <>
          <h3>대조에 쓴 확인값</h3>
          <dl className="applied" aria-label="서버가 대조에 적용한 확인값">
            <div><dt>회차</dt><dd>{showtimeLabel(result.appliedFields.showtimeId)}</dd></div>
            <div><dt>좌석</dt><dd>{result.appliedFields.seatGrade ?? '확인 불가'}</dd></div>
            <div><dt>1매 가격</dt><dd>{result.appliedFields.price !== null ? formatWon(result.appliedFields.price) : '확인 불가'}</dd></div>
            <div><dt>매수</dt><dd>{result.appliedFields.quantity !== null ? `${result.appliedFields.quantity}장` : '확인 불가'}</dd></div>
            <div><dt>전달</dt><dd>{label(DELIVERY_LABELS, result.appliedFields.deliveryMethod)}</dd></div>
            <div><dt>선입금</dt><dd>{yn(result.appliedFields.prepaymentRequested, '요구 문구 있음', '요구 문구 없음')}</dd></div>
            <div><dt>공연 일치</dt><dd>{result.appliedFields.listingEventId === null ? '확인 불가' : result.appliedFields.listingEventId === event.id ? '선택한 공연' : '다른 공연'}</dd></div>
            <div><dt>가격 기준</dt><dd>{label(PRICE_BASIS_LABELS, result.appliedFields.priceBasis)}</dd></div>
            <div><dt>수수료</dt><dd>{label(FEE_BASIS_LABELS, result.appliedFields.feeBasis)}</dd></div>
            <div><dt>할인</dt><dd>{label(DISCOUNT_LABELS, result.appliedFields.discountStatus)}</dd></div>
            <div><dt>예매 유형</dt><dd>{label(BOOKING_LABELS, result.appliedFields.bookingType)}</dd></div>
            <div><dt>관람자=예매자</dt><dd>{yn(result.appliedFields.buyerIsBooker, '예', '아니요')}</dd></div>
          </dl>
          </>
        )}

        {result.notices.length > 0 && (
          <ul className="notices">
            {result.notices.map((n) => (
              <li key={n} className="state state-info small">{n}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="result-meta">
  <ExtractionLine info={result.extraction} />
        <p className="small muted provenance" data-testid="provenance">
          판매글: {result.provenance.syntheticListing ? '시연용 합성 판매글' : '사용자가 입력한 실제 판매글'} · 공식 자료:{' '}
          {result.provenance.officialSourceType === 'official' ? '공식 공지 스냅샷' : '합성 자료'} · 데이터 모드 {result.dataMode}
        </p>
      </div>

      <p className="disclaimer small">
        이 결과는 판매글 문구와 등록된 공식 안내를 비교해 확인할 점을 보여줄 뿐입니다. 티켓의 진위나 입장 가능 여부를 판단하지
        않으며, 판매자나 거래의 위법성을 판정하지 않습니다. 구매 전 공식 예매처에 직접 확인하세요.
      </p>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onEdit}>추출값 수정</button>
        <button type="button" className="btn btn-secondary" onClick={onRestart}>새 판매글 확인</button>
      </div>
    </section>
  )
}

// 결과의 시연 표시가 무엇 때문인지 출처 정보로 설명한다.
function demoTitle(result: CheckResponse) {
  if (result.provenance.officialSourceType === 'synthetic') return FULLY_SYNTHETIC_TITLE
  if (result.provenance.syntheticListing) return '시연용 합성 판매글로 대조한 결과입니다. 공식 가격·규정은 공지 스냅샷입니다.'
  return '시연용 fixture 추출값이 포함된 결과입니다. 공식 가격·규정은 공지 스냅샷입니다.'
}

function FindingCard({ finding, isDemo }: { finding: Finding; isDemo: boolean }) {
  return (
    <li className={`finding status-${finding.status}`}>
      <div className="row-between">
        <strong>{finding.title}</strong>
        <span className={`chip chip-${finding.status}`}>{FINDING_STATUS_LABELS[finding.status]}</span>
      </div>
      <div className="compare">
        <div>
          <p className="compare-label">판매글 문구</p>
          {finding.listingQuote ? <ListingQuote>{finding.listingQuote}</ListingQuote> : <p className="muted small">판매글에서 관련 문구를 찾지 못함</p>}
        </div>
        <div>
          <p className="compare-label">공식 안내</p>
          {finding.officialExcerpt ? (
            <blockquote className="official-excerpt">{finding.officialExcerpt}</blockquote>
          ) : (
            <p className="muted small">대조할 공식 문구 없음</p>
          )}
        </div>
      </div>
      <p className="reason">{finding.reason}</p>
      {(finding.sourceUrl || finding.checkedAt) && <SourceLine url={finding.sourceUrl} checkedAt={finding.checkedAt} isDemo={isDemo} />}
    </li>
  )
}
