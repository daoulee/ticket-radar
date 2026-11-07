import { useState, type FormEvent } from 'react'
import { MAX_LISTING_LENGTH } from '../api/demoApi'
import type { DemoScenario } from '../demo/fixtures'
import type { EventSummary } from '../contract/types'

interface Props {
  value: string
  event: EventSummary
  demoMode: boolean
  onChangeEvent: () => void
  samples: DemoScenario[]
  submitting: boolean
  synthetic: boolean
  onSyntheticChange: (value: boolean) => void
  onChange: (value: string) => void
  onSubmit: () => void
}

export function ListingStep({ value, event, demoMode, onChangeEvent, samples, submitting, synthetic, onSyntheticChange, onChange, onSubmit }: Props) {
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return setError('판매글을 붙여넣거나 입력하세요.')
    if (trimmed.length > MAX_LISTING_LENGTH) return setError(`판매글은 ${MAX_LISTING_LENGTH.toLocaleString()}자 이하로 입력하세요.`)
    setError(null)
    onSubmit()
  }

  return (
    <section className="card listing-composer" aria-labelledby="listing-step-title">
      <p className="listing-kicker">결제하기 전, 한 번 더</p>
      <h2 id="listing-step-title">판매글을 붙여넣어 주세요</h2>
      <p className="listing-intro">판매글의 조건을 확인하고 공연의 공식 안내와 나란히 살펴봐요.</p>
      {event.source === 'KOPIS' ? <p className="listing-demo-note" role="status">KOPIS의 실제 공연 목록에서 선택했어요. 공연 기간은 개별 회차가 아니며, 이 공연의 공식 가격·입장 규정과 AI 분석 연결은 준비 중이에요. 지금은 대조할 수 없어요.</p> : demoMode && <p className="listing-demo-note">시연 모드에서는 예시 판매글에 준비된 추출 결과를 보여줘요. 직접 입력한 글은 자동 분석되지 않아요.</p>}
      <div className="listing-selected">
        <div><span className="listing-selected-label">선택한 공연 {event.isDemo ? '· 시연 데이터' : event.source === 'KOPIS' ? '· KOPIS 실제 공연 정보' : ''}</span><strong>{event.title}</strong>{event.period && <span className="small muted">공연 기간 {event.period.startsOn} ~ {event.period.endsOn} · 개별 회차 확인 필요</span>}</div>
        <button type="button" className="listing-change" onClick={onChangeEvent}>공연 변경</button>
      </div>

      {samples.length > 0 && (
        /* 시연 도구는 기본으로 접어 둔다 */
        <details className="samples">
          <summary>시연용 예시 판매글 넣기 (합성 데이터)</summary>
          <div className="sample-buttons">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="btn btn-chip"
                title={sample.description}
                onClick={() => {
                  onChange(sample.listingText)
                  setError(null)
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </details>
      )}

      <form onSubmit={submit} noValidate>
        <label htmlFor="listing-text" className="field-label">
          판매글 내용
        </label>
        <textarea
          id="listing-text"
          rows={6}
          placeholder="공연명과 날짜, 좌석, 가격, 전달 방식이 담긴 판매글을 붙여넣어 주세요."
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby="listing-help"
          onChange={(e) => {
            onChange(e.target.value)
            if (error) setError(null)
          }}
        />
        <div id="listing-help" className="row-between small">
          <span className={error ? 'error-text' : 'muted'} role={error ? 'alert' : undefined}>
            {error ?? '전화번호·계좌번호 등은 지우고 입력해 주세요.'}
          </span>
          <span className={value.length > MAX_LISTING_LENGTH ? 'error-text' : 'muted'}>
            {value.length.toLocaleString()} / {MAX_LISTING_LENGTH.toLocaleString()}자
          </span>
        </div>
        <label className="check-row small">
          <input type="checkbox" checked={synthetic} onChange={(e) => onSyntheticChange(e.target.checked)} />
          시연용으로 작성한 합성 판매글입니다 (결과에 ‘시연 데이터’로 표시)
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting || event.source === 'KOPIS'}>
          {event.source === 'KOPIS' ? '공식 자료와 AI 연결 준비 중' : submitting ? '판매글을 읽는 중…' : '판매글에서 정보 추출'}
        </button>
      </form>
    </section>
  )
}
