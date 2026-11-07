import type { ReactNode } from 'react'
import type { ApiError } from '../api/client'
import { formatChecked } from '../ui/format'

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'success'; data: T }

export function Loading({ label }: { label: string }) {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  )
}

const ERROR_HINTS: Record<string, string> = {
  AI_NOT_CONFIGURED: 'AI 추출이 설정되지 않은 서버입니다. 판매글 값을 직접 입력해 대조할 수 있습니다.',
  TIMEOUT: '잠시 후 다시 시도하거나, 판매글 값을 직접 입력해 대조할 수 있습니다.',
  INVALID_RESPONSE: '잘못된 결과를 보여주지 않기 위해 표시를 중단했습니다.',
  AI_TIMEOUT: 'AI 응답 시간이 초과되었습니다. 다시 시도하거나 판매글 값을 직접 입력할 수 있습니다.',
  AI_PROVIDER_ERROR: 'AI 제공자 오류입니다. 결과를 대신 만들지 않았습니다.',
  AI_INVALID_RESPONSE: 'AI 응답 형식이 올바르지 않아 사용하지 않았습니다.',
  AI_UNGROUNDED_RESPONSE: 'AI가 판매글에 없는 내용을 답해 사용하지 않았습니다.',
  CHECK_EXPIRED_OR_MISMATCH: '이전 추출 기록이 만료되었거나 판매글이 바뀌었습니다. 판매글을 다시 추출하세요.',
  RATE_LIMITED: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
}

export function ErrorBox({ title, error, onRetry, children }: { title: string; error: ApiError; onRetry?: () => void; children?: ReactNode }) {
  return (
    <div className="state state-error" role="alert">
      <strong>{title}</strong>
      <p>{error.message}</p>
      {ERROR_HINTS[error.code] && <p>{ERROR_HINTS[error.code]}</p>}
      <p className="muted small">오류 코드: {error.code}</p>
      {error.details.length > 0 && (
        <details className="small">
          <summary>응답 검증 문제 {error.details.length}건</summary>
          <ul>
            {error.details.slice(0, 8).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </details>
      )}
      {error.retryable && onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          다시 시도
        </button>
      )}
      {children}
    </div>
  )
}

export const FULLY_SYNTHETIC_TITLE = '실제 공연·가격·규정이 아닌 시연용 합성 데이터'

// 시연 배지 도움말은 무엇이 합성인지에 맞춰 넘긴다. 기본값은 공식 자료까지 가상이라고 단정하지 않는다 (Astra W1).
export function DemoBadge({ isDemo, title }: { isDemo: boolean; title?: string }) {
  return isDemo ? (
    <span className="badge badge-demo" title={title ?? '합성 판매글이나 시연용 자료가 하나 이상 포함된 결과'}>
      시연 데이터
    </span>
  ) : (
    <span className="badge badge-live" title="합성 판매글·합성 공식 자료·fixture가 섞이지 않은 결과">
      공식 자료 기반
    </span>
  )
}

// 헤더 장식 심벌. docs/design/radar-mark.svg와 같은 비례를 원·선·점으로 직접 그린다.
// 스크린리더 무시, 상태·타이머·animationend 없음. 모션은 CSS가 마운트 시 1회만 적용하고 동작 줄이기에서는 정적이다.
export function RadarBrand() {
  return (
    <svg className="radar-brand" viewBox="0 0 64 64" width="40" height="40" aria-hidden="true" focusable="false">
      <rect className="rb-bg" width="64" height="64" rx="18" />
      <g className="rb-rings">
        <circle className="rb-ring rb-ring-outer" cx="32" cy="32" r="20" />
        <circle className="rb-ring rb-ring-inner" cx="32" cy="32" r="11" />
        <circle className="rb-dot" cx="32" cy="32" r="3" />
      </g>
      <g className="rb-sweep">
        <path d="M32 32L45 19" />
        <circle className="rb-dot" cx="45" cy="19" r="3" />
      </g>
    </svg>
  )
}

// 공식 출처 링크와 확인 시각. 시연 데이터의 예시 링크는 실제 출처가 아님을 함께 적는다.
export function SourceLine({ url, checkedAt, isDemo }: { url: string | null; checkedAt: string | null; isDemo: boolean }) {
  return (
    <p className="source-line small">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {isDemo ? '공식 근거 (시연용 예시 링크)' : '공식 근거 열기'}
        </a>
      ) : (
        <span className="muted">공식 근거 링크 없음</span>
      )}
      <span className="muted"> · 확인 {formatChecked(checkedAt)}</span>
    </p>
  )
}

// 판매글 원문 인용. 텍스트로만 렌더링한다 (HTML·스크립트 실행 없음).
export function ListingQuote({ children }: { children: ReactNode }) {
  return (
    <q className="quote" data-source="listing">
      {children}
    </q>
  )
}
