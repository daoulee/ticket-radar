import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { EventSummary } from '../contract/types'
import { toApiError } from '../api/client'
import { formatChecked, showtimeText } from '../ui/format'
import { DemoBadge, ErrorBox, FULLY_SYNTHETIC_TITLE, type AsyncState } from './common'

interface Props {
  events: AsyncState<EventSummary[]>
  selectedId: string | null
  onSearch: (query: string) => void
  onSelect: (event: EventSummary) => void
  listPerformances?: (query: string) => Promise<EventSummary[]>
}

export function EventStep({ events, selectedId, onSearch, onSelect, listPerformances }: Props) {
  const [query, setQuery] = useState('')
  const [actual, setActual] = useState<AsyncState<EventSummary[]>>({ status: 'idle' })
  const sequence = useRef(0)

  async function searchActual(value: string) {
    if (!listPerformances) return
    const seq = ++sequence.current
    setActual({ status: 'loading' })
    try { const data = await listPerformances(value); if (seq === sequence.current) setActual({ status: 'success', data }) }
    catch (error) { if (seq === sequence.current) setActual({ status: 'error', error: toApiError(error) }) }
  }
  useEffect(() => { void searchActual(''); return () => { sequence.current++ } }, [listPerformances]) // eslint-disable-line react-hooks/exhaustive-deps

  function submit(e: FormEvent) {
    e.preventDefault()
    onSearch(query)
    void searchActual(query)
  }

  return (
    <section className="card" aria-labelledby="event-step-title">
      <h2 id="event-step-title">1. 공연 선택</h2>
      <p className="muted">공연을 검색해 선택하세요. KOPIS 공연 기간과 개별 회차는 다르며, 가격과 입장 규정은 별도 확인이 필요해요.</p>
      <form className="search-row" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="event-query">
          공연 검색
        </label>
        <input
          id="event-query"
          type="search"
          value={query}
          placeholder="공연 이름으로 검색"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          검색
        </button>
      </form>

      {listPerformances && <div className="performance-section">
        <h3>현재 공연 중인 공연</h3>
        <p className="small muted">출처: (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr) · 조회 기간: 오늘부터 30일 · 최대 30건</p>
        {actual.status === 'loading' && <p className="state" role="status">실제 공연 정보를 불러오는 중이에요.</p>}
        {actual.status === 'error' && <ErrorBox title="실제 공연 목록을 불러오지 못했어요" error={actual.error} onRetry={() => void searchActual(query)} />}
        {actual.status === 'success' && actual.data.length === 0 && <p className="state">조건에 맞는 실제 공연이 없어요. 다른 이름으로 검색해 보세요.</p>}
        {actual.status === 'success' && actual.data.length > 0 && <ul className="event-list">
          {actual.data.map(item => <li key={item.id}><button type="button" className={`event-item${item.id === selectedId ? ' selected' : ''}`} aria-pressed={item.id === selectedId} onClick={() => onSelect(item)}>
            <span className="event-title">{item.title}</span>
            <span className="muted small">{item.venue ?? '공연장 정보 없음'} · 공연 기간 {item.period?.startsOn} ~ {item.period?.endsOn}</span>
            <span className="muted small">KOPIS 조회: {formatChecked(item.sourceCheckedAt)}</span>
            <span className="event-meta"><span className="badge badge-live">KOPIS 공연 정보</span><span className="badge badge-warn">가격·입장 규정 미등록</span></span>
          </button></li>)}
        </ul>}
      </div>}

      {listPerformances && <h3>시연 공연</h3>}

      {events.status === 'loading' && (
        <ul className="event-list" role="status" aria-label="공연 목록을 불러오는 중">
          {[0, 1].map((i) => (
            <li key={i} className="event-skeleton">
              <span className="skeleton skeleton-line w60" />
              <span className="skeleton skeleton-line w40" />
            </li>
          ))}
        </ul>
      )}
      {events.status === 'error' && (
        <ErrorBox title="공연 목록을 불러오지 못했습니다" error={events.error} onRetry={() => onSearch(query)} />
      )}
      {events.status === 'success' && events.data.length === 0 && (
        <p className="state">검색 결과가 없습니다. 다른 이름으로 검색하세요.</p>
      )}
      {events.status === 'success' && events.data.length > 0 && (
        <ul className="event-list">
          {events.data.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className={`event-item${event.id === selectedId ? ' selected' : ''}`}
                aria-pressed={event.id === selectedId}
                onClick={() => onSelect(event)}
              >
                <span className="event-title">{event.title}</span>
                <span className="muted small">
                  {event.venue ?? '공연장 정보 없음'} · {event.showtimes.map(showtimeText).join(', ')}
                </span>
                <span className="event-meta">
                  <DemoBadge isDemo={event.isDemo} title={FULLY_SYNTHETIC_TITLE} />
                  {!event.officialUrl && <span className="badge badge-warn">공식 자료 미등록</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
