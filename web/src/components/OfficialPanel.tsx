import type { EventSummary, OfficialContext } from '../contract/types'
import { DISCOUNT_LABELS, FEE_BASIS_LABELS, POLICY_TYPE_LABELS, PRICE_BASIS_LABELS, SCOPE_LABELS, formatWon, showtimeById } from '../ui/format'
import { DemoBadge, ErrorBox, FULLY_SYNTHETIC_TITLE, Loading, SourceLine, type AsyncState } from './common'

interface Props {
  event: EventSummary
  context: AsyncState<OfficialContext>
  onRetry: () => void
}

// 선택한 공연의 공식 자료. 판매글 대조의 기준(기본가 조건·규정 적용 범위·출처 버전)을 먼저 보여준다.
export function OfficialPanel({ event, context, onRetry }: Props) {
  return (
    <aside className="card official" aria-labelledby="official-title">
      <div className="card-head">
        <h2 id="official-title">공식 자료</h2>
        {event.source === 'KOPIS' && context.status !== 'success' ? <span className="badge badge-warn">공식 가격·규정 미등록</span> : <DemoBadge
          isDemo={context.status === 'success' ? context.data.isDemo : event.isDemo}
          title={context.status === 'success' && context.data.sourceType === 'official' ? undefined : FULLY_SYNTHETIC_TITLE}
        />}
      </div>
      <p className="event-title">{event.title}</p>
      <SourceLine url={event.officialUrl} checkedAt={event.sourceCheckedAt} isDemo={event.isDemo} />

      {context.status === 'loading' && <Loading label="공식 가격·규정을 불러오는 중" />}
      {context.status === 'error' && (
        <ErrorBox title="공식 자료를 불러오지 못했습니다" error={context.error} onRetry={onRetry} />
      )}
      {context.status === 'success' && (
        <>
          <p className="small muted source-meta">
            출처 유형: {context.data.sourceType === 'official' ? '공식 공지 스냅샷' : '합성 자료'} · 확인 단위:{' '}
            {context.data.sourceDatePrecision === 'date' ? '날짜' : '시각'} · 버전 <code>{shortVersion(context.data.sourceVersion)}</code>
          </p>

          <h3>좌석 등급별 공식 기본가</h3>
          {context.data.priceTiers.length === 0 ? (
            <p className="state state-warn">등록된 공식 가격이 없습니다. 가격 비교는 보류됩니다.</p>
          ) : (
            <>
              <table className="price-table">
                <thead>
                  <tr>
                    <th scope="col">등급</th>
                    <th scope="col">공식 기본가</th>
                    <th scope="col">회차</th>
                  </tr>
                </thead>
                <tbody>
                  {context.data.priceTiers.map((tier) => (
                    <tr key={`${tier.seatGrade}-${tier.showtimeId ?? 'all'}`}>
                      <td>{tier.seatGrade}</td>
                      <td>{formatWon(tier.facePrice)}</td>
                      <td>{tier.showtimeId ? showtimeById(event, tier.showtimeId) : '전 회차'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {[...new Set(context.data.priceTiers.map((t) => t.sourceText))].map((text) => (
                <blockquote key={text} className="official-excerpt" data-testid="price-source-text">{text}</blockquote>
              ))}
              <p className="small muted">
                비교 기준: {PRICE_BASIS_LABELS[context.data.priceTiers[0].priceBasis]} · {FEE_BASIS_LABELS[context.data.priceTiers[0].feeBasis]} ·{' '}
                {DISCOUNT_LABELS[context.data.priceTiers[0].discountStatus]}
              </p>
              <SourceLine url={context.data.priceTiers[0].sourceUrl} checkedAt={context.data.priceTiers[0].verifiedAt} isDemo={context.data.sourceType === 'synthetic'} />
            </>
          )}

          <h3>입장·양도 규정</h3>
          {context.data.policies.length === 0 ? (
            <p className="state state-warn">등록된 공식 규정이 없습니다. 규정 대조는 확인 불가로 표시됩니다.</p>
          ) : (
            <ul className="policy-list">
              {context.data.policies.map((policy) => (
                <li key={policy.id}>
                  <span className="badge">{POLICY_TYPE_LABELS[policy.type]}</span> <strong>{policy.title}</strong>
                  <p className="small scope">{SCOPE_LABELS[policy.scope]}</p>
                  <blockquote className="official-excerpt">{policy.excerpt}</blockquote>
                  <SourceLine url={policy.sourceUrl} checkedAt={policy.verifiedAt} isDemo={context.data.sourceType === 'synthetic'} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  )
}

function shortVersion(version: string) {
  return version.length > 22 ? `${version.slice(0, 19)}…` : version
}
