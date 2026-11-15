import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { toApiError, type TicketRadarApi } from './api/client'
import { FIELD_KEYS, unknownFields, type CheckRequestInput, type CheckResponse, type EventSummary, type ExtractedFields, type ListingFields, type OfficialContext } from './contract/types'
import { DEMO_SCENARIOS } from './demo/fixtures'
import { ErrorBox, Loading, type AsyncState } from './components/common'
import { EventStep } from './components/EventStep'
import { Landing } from './components/Landing'
import { TicketIntro } from './components/TicketIntro'
import { SiteHeader } from './components/SiteHeader'
import { ListingStep } from './components/ListingStep'
import { Marketplace } from './components/Marketplace'
import { ServerMarketplace } from './components/ServerMarketplace'
import { OfficialPanel } from './components/OfficialPanel'
import { ResultStep } from './components/ResultStep'
import { ReviewStep, type ReviewSource } from './components/ReviewStep'
import { EMPTY_FIELDS } from './ui/fields'
import { scrollToSection, useScrolled } from './ui/useScrollEffects'

type Step = 'home' | 'market' | 'event' | 'listing' | 'review' | 'result'

// 진행 단계 표시(홈은 단계가 아니라 시작 화면이다)
const STEPS: { id: Exclude<Step, 'home' | 'market'>; label: string }[] = [
  { id: 'event', label: '공연 선택' },
  { id: 'listing', label: '판매글 입력' },
  { id: 'review', label: '추출값 확인' },
  { id: 'result', label: '대조 결과' },
]

// 화면 상태만 관리한다. 가격·규정 판단은 API(Sol 서버 또는 표시된 시연 데이터) 응답을 그대로 표시한다.
export default function App({ api }: { api: TicketRadarApi }) {
  const [step, setStep] = useState<Step>('home')
  const [sharedMarketOpen, setSharedMarketOpen] = useState(false)
  const sharedMarketBaseUrl = import.meta.env.VITE_MARKET_API_BASE_URL?.trim()
  const [events, setEvents] = useState<AsyncState<EventSummary[]>>({ status: 'idle' })
  const [event, setEvent] = useState<EventSummary | null>(null)
  const [context, setContext] = useState<AsyncState<OfficialContext>>({ status: 'idle' })
  const [listingText, setListingText] = useState('')
  // 시연 문장은 합성 판매글로 표시해 보낸다 (Sol 계약 기본값 true). 사용자가 실제 판매글이면 해제한다.
  const [syntheticListing, setSyntheticListing] = useState(true)
  const [extraction, setExtraction] = useState<AsyncState<ReviewSource>>({ status: 'idle' })
  const [fields, setFields] = useState<ListingFields>(EMPTY_FIELDS)
  const [result, setResult] = useState<AsyncState<CheckResponse>>({ status: 'idle' })
  const [lastResult, setLastResult] = useState<CheckResponse | null>(null)
  const requestSeq = useRef(0)
  const scrolled = useScrolled()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const pendingSection = useRef<string | null>(null)

  // 단계가 바뀌면 화면 맨 위에서 시작한다(소개 화면 끝에서 체험으로 넘어갈 때 등).
  // 헤더 메뉴로 체험 중에 소개 구간을 고른 경우에는 소개를 그린 뒤 그 구간으로 이동한다.
  useEffect(() => {
    const target = pendingSection.current
    pendingSection.current = null
    try {
      if (target) requestAnimationFrame(() => scrollToSection(target))
      else window.scrollTo({ top: 0 })
    } catch {
      // 테스트 환경(jsdom)에는 scrollTo 가 없다
    }
  }, [step])

  function goToSection(id: string) {
    if (step === 'home') {
      scrollToSection(id)
      return
    }
    pendingSection.current = id
    setStep('home')
  }
  const checkSeq = useRef(0)

  const searchEvents = useCallback(
    async (query: string) => {
      setEvents({ status: 'loading' })
      try {
        setEvents({ status: 'success', data: await api.listEvents(query) })
      } catch (error) {
        setEvents({ status: 'error', error: toApiError(error) })
      }
    },
    [api],
  )

  useEffect(() => {
    void searchEvents('')
  }, [searchEvents])

  const loadContext = useCallback(
    async (eventId: string) => {
      const seq = ++requestSeq.current
      setContext({ status: 'loading' })
      try {
        const data = await api.getOfficialContext(eventId)
        if (seq === requestSeq.current) setContext({ status: 'success', data })
      } catch (error) {
        if (seq === requestSeq.current) setContext({ status: 'error', error: toApiError(error) })
      }
    },
    [api],
  )

  function selectEvent(next: EventSummary) {
    setEvent(next)
    setSyntheticListing(next.source !== 'KOPIS')
    resetCheck()
    void loadContext(next.id)
    setStep('listing')
  }

  function resetCheck() {
    checkSeq.current++
    setExtraction({ status: 'idle' })
    setResult({ status: 'idle' })
    setLastResult(null)
    setFields(EMPTY_FIELDS)
  }

  async function extract() {
    if (!event) return
    const seq = ++checkSeq.current
    setExtraction({ status: 'loading' })
    setResult({ status: 'idle' })
    setLastResult(null)
    try {
      const data = await api.createCheck({ eventId: event.id, listingText, syntheticListing })
      if (seq !== checkSeq.current) return
      setExtraction({ status: 'success', data: sourceOf(data) })
      setFields(valuesOf(data.extracted))
      setStep('review')
    } catch (error) {
      if (seq !== checkSeq.current) return
      setExtraction({ status: 'error', error: toApiError(error) })
    }
  }

  // AI 추출이 실패해도 시연 결과로 대체하지 않는다. 사용자가 고른 경우에만 빈 값에서 직접 입력한다.
  function startManualEntry() {
    if (!event) return
    setExtraction({ status: 'success', data: MANUAL_SOURCE })
    setFields(EMPTY_FIELDS)
    setStep('review')
  }

  async function compare() {
    if (!event || extraction.status !== 'success') return
    const seq = ++checkSeq.current
    const source = extraction.data
    // 확인값은 전체 스냅샷으로 보낸다. 직접 입력은 명시적 manual, 서버 추출 후 수정은 previousCheckId 로 재대조한다.
    const request: CheckRequestInput = source.manual
      ? { eventId: event.id, listingText, syntheticListing, extractionMode: 'manual', confirmedFields: fields }
      : { eventId: event.id, listingText, syntheticListing, previousCheckId: source.checkId ?? undefined, confirmedFields: fields }
    setResult({ status: 'loading' })
    try {
      const data = await api.createCheck(request)
      if (seq !== checkSeq.current) return
      setResult({ status: 'success', data })
      setLastResult(data)
      setStep('result')
    } catch (error) {
      if (seq !== checkSeq.current) return
      setResult({ status: 'error', error: toApiError(error) })
    }
  }

  const samples = useMemo(
    () => (api.mode === 'demo' && event ? DEMO_SCENARIOS.filter((s) => s.eventId === event.id) : []),
    [api.mode, event],
  )

  const reachable: Record<Step, boolean> = {
    home: true,
    market: true,
    event: true,
    listing: event !== null,
    review: extraction.status === 'success',
    result: lastResult !== null,
  }

  return (
    <>
      <TicketIntro />
      <SiteHeader
        onHome={step === 'home'}
        scrolled={scrolled}
        activeSection={activeSection}
        apiMode={api.mode}
        realPerformance={step !== 'home' && step !== 'market' && event?.source === 'KOPIS'}
        apiLabel={api.label}
        onNavigate={goToSection}
        onBrand={() => setStep('home')}
        onStart={() => setStep('market')}
        onIntro={() => setStep('home')}
      />
      {step === 'home' && (
        <Landing events={events} onStart={() => setStep('market')} onRetry={() => searchEvents('')} onActiveChange={setActiveSection} />
      )}
      {step === 'market' && (sharedMarketBaseUrl ? (sharedMarketOpen
        ? <ServerMarketplace baseUrl={sharedMarketBaseUrl} onSafety={() => setStep('event')} onPerformances={() => setStep('event')} onDemo={() => setSharedMarketOpen(false)} />
        : <Marketplace onSafety={() => setStep('event')} onPerformances={() => setStep('event')} onShared={() => setSharedMarketOpen(true)} />)
        : import.meta.env.VITE_API_BASE_URL?.trim() ? <ServerMarketplace baseUrl={import.meta.env.VITE_API_BASE_URL.trim()} onSafety={() => setStep('event')} onPerformances={() => setStep('event')} /> : <Marketplace onSafety={() => setStep('event')} onPerformances={() => setStep('event')} />)}
      {step !== 'home' && step !== 'market' && (
        <div className="app">
          <button type="button" className="market-return" onClick={() => setStep('market')}>← 티켓 둘러보기</button>
          <nav className="stepper" aria-label="진행 단계">
            <ol style={{ '--step': STEPS.findIndex((s) => s.id === step) } as CSSProperties}>
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={s.id === step ? 'current' : reachable[s.id] ? 'done' : ''}
                    aria-current={s.id === step ? 'step' : undefined}
                    disabled={!reachable[s.id]}
                    onClick={() => setStep(s.id)}
                  >
                    <span className="step-num">{i + 1}</span>
                    <span className="step-label">{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className={event && step !== 'event' && step !== 'listing' ? 'layout with-aside' : step === 'listing' ? 'layout listing-layout' : 'layout'}>
            {/* key 로 단계마다 등장 애니메이션을 다시 건다(상태는 App 에 있어 유지된다) */}
            <main className="main step-enter" key={step}>
              {step === 'event' && (
                <EventStep events={events} selectedId={event?.id ?? null} onSearch={searchEvents} onSelect={selectEvent} listPerformances={api.listPerformances} />
              )}

              {step === 'listing' && event && (
                <>
                  <ListingStep
                    event={event}
                    demoMode={api.mode === 'demo'}
                    onChangeEvent={() => setStep('event')}
                    value={listingText}
                    samples={samples}
                    submitting={extraction.status === 'loading'}
                    onChange={(text) => {
                      // 판매글이 바뀌면 이전 추출·대조 결과를 버린다.
                      if (text !== listingText && extraction.status !== 'idle') resetCheck()
                      setListingText(text)
                    }}
                    synthetic={syntheticListing}
                    onSyntheticChange={(value) => {
                      if (value !== syntheticListing && extraction.status !== 'idle') resetCheck()
                      setSyntheticListing(value)
                    }}
                    onSubmit={extract}
                  />
                  {extraction.status === 'loading' && <Loading label="판매글에서 공연·좌석·가격·전달 방식을 찾는 중" />}
                  {extraction.status === 'error' && (
                    <ErrorBox title="판매글을 분석하지 못했습니다" error={extraction.error} onRetry={extract}>
                      <button type="button" className="btn btn-secondary" onClick={startManualEntry}>
                        AI 추출 없이 직접 입력
                      </button>
                    </ErrorBox>
                  )}
                </>
              )}

              {step === 'review' && event && extraction.status === 'success' && (
                <>
                  <ReviewStep
                    event={event}
                    context={context.status === 'success' ? context.data : null}
                    source={extraction.data}
                    fields={fields}
                    submitting={result.status === 'loading'}
                    onChange={setFields}
                    onSubmit={compare}
                    onBack={() => setStep('listing')}
                  />
                  {result.status === 'loading' && <Loading label="공식 가격·규정과 대조하는 중" />}
                  {result.status === 'error' && (
                    <ErrorBox title="공식 자료와 대조하지 못했습니다" error={result.error} onRetry={compare} />
                  )}
                </>
              )}

              {step === 'result' && event && lastResult && (
                <>
                  <ResultStep
                    event={event}
                    result={lastResult}
                    currentFields={fields}
                    submitting={result.status === 'loading'}
                    onRecheck={compare}
                    onEdit={() => setStep('review')}
                    onRestart={() => {
                      resetCheck()
                      setListingText('')
                      setStep('listing')
                    }}
                  />
                  {result.status === 'error' && (
                    <ErrorBox title="다시 대조하지 못했습니다" error={result.error} onRetry={compare} />
                  )}
                </>
              )}
            </main>

            {event && step === 'listing' && (
              <details className="listing-official"><summary>선택한 공연의 공식 자료 보기</summary><OfficialPanel event={event} context={context} onRetry={() => loadContext(event.id)} /></details>
            )}
            {event && step !== 'event' && step !== 'listing' && (
              <OfficialPanel event={event} context={context} onRetry={() => loadContext(event.id)} />
            )}
          </div>
        </div>
      )}

      <footer className="footer small muted">
        티켓레이더는 티켓 진위·입장 가능 여부·위법성을 판단하지 않습니다.{' '}
        {api.mode === 'demo'
          ? '시연 데이터의 공연·가격·규정은 가상입니다.'
          : '공식 자료는 표시된 확인일 기준의 공지 스냅샷이며, 구매 전 예매처 공지를 다시 확인하세요.'}
        <p className="model-credit">
          3D 모델: <a href="https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec" target="_blank" rel="noopener noreferrer">iPhone 17 Pro by Ranguel</a> ·{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 화면 및 텍스처 변경
        </p>
        <p className="model-credit">3D 인트로 모델: <a href="https://sketchfab.com/3d-models/ticket-3ccf55052173471b981a8efd45330841" target="_blank" rel="noopener noreferrer">Ticket by papertractor</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 색상과 문구 변경, 분리 애니메이션 추가</p>
      </footer>
    </>
  )
}

const MANUAL_SOURCE: ReviewSource = {
  checkId: null,
  manual: true,
  extracted: unknownFields(),
  extraction: { method: 'manual', provider: null, model: null, actualModelCall: false, reused: false },
  notices: ['AI 추출 없이 직접 입력합니다. 아래 값은 모두 사용자가 입력한 값입니다.'],
  isDemo: null,
}

function sourceOf(response: CheckResponse): ReviewSource {
  return {
    checkId: response.checkId,
    manual: false,
    extracted: response.extracted,
    extraction: response.extraction,
    notices: response.notices,
    isDemo: response.isDemo,
  }
}

function valuesOf(extracted: ExtractedFields): ListingFields {
  return Object.fromEntries(FIELD_KEYS.map((key) => [key, extracted[key].value])) as ListingFields
}
