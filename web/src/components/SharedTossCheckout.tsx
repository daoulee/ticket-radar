import { useRef, useState } from 'react'
import { loadSdk, type Widget } from './TossTestCheckout'
import type { ServerRequest } from './ServerAuth'

type Pending = { orderId: string; providerOrderId: string; amount: number; mode: 'test' }
const PENDING_KEY = 'ticketradar.shared-test-payment'
type Item = { id: string; pricePerTicket: number; quantity: number }

/** Test-only checkout for a server-backed listing. */
export function SharedTossCheckout({ item, title, request, token, onBack }: { item: Item; title: string; request: ServerRequest; token: string; onBack: () => void }) {
  const [order, setOrder] = useState<Pending | null>(null)
  const [widget, setWidget] = useState<Widget | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const running = useRef(false)

  async function prepare() {
    if (running.current || order) return
    running.current = true; setBusy(true); setError('')
    let prepared: Pending | null = null
    try {
      const config = await request<{ mode: string; clientKey: string }>('/test-payments/config', 'GET', undefined, token)
      if (config.mode !== 'test' || !config.clientKey?.startsWith('test_gck_')) throw new Error('테스트 결제 설정을 확인하지 못했어요.')
      const TossPayments = await loadSdk()
      prepared = await request<Pending>('/test-payments/prepare', 'POST', { listingId: item.id }, token)
      if (prepared.mode !== 'test' || !prepared.orderId || !prepared.providerOrderId || prepared.amount !== item.pricePerTicket * item.quantity) throw new Error('시연 주문 정보를 확인하지 못했어요.')
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(prepared))
      setOrder(prepared)
      const next = TossPayments(config.clientKey).widgets({ customerKey: crypto.randomUUID() })
      await next.setAmount({ currency: 'KRW', value: prepared.amount })
      await Promise.all([next.renderPaymentMethods({ selector: '#shared-toss-methods', variantKey: 'DEFAULT' }), next.renderAgreement({ selector: '#shared-toss-agreement', variantKey: 'AGREEMENT' })])
      setWidget(next)
    } catch (e) {
      if (prepared) {
        try { await request('/test-payments/cancel', 'POST', { orderId: prepared.orderId }, token); sessionStorage.removeItem(PENDING_KEY); setOrder(null) }
        catch { setError('주문 상태를 확인하지 못했어요. 내 거래에서 확인해 주세요.'); return }
      }
      setError(e instanceof Error ? e.message : '테스트 결제를 준비하지 못했어요.')
    } finally { running.current = false; setBusy(false) }
  }
  async function cancel() {
    if (running.current) return
    running.current = true; setBusy(true); setError('')
    try {
      if (order) await request('/test-payments/cancel', 'POST', { orderId: order.orderId }, token)
      sessionStorage.removeItem(PENDING_KEY); onBack()
    } catch { setError('주문 상태를 확인하지 못했어요. 내 거래에서 확인해 주세요.') }
    finally { running.current = false; setBusy(false) }
  }
  async function pay() {
    if (!widget || !order || running.current) return
    running.current = true; setBusy(true); setError('')
    try {
      await widget.requestPayment({ orderId: order.providerOrderId, orderName: title.slice(0, 100), successUrl: `${location.origin}/shared-toss-return?status=success`, failUrl: `${location.origin}/shared-toss-return?status=fail` })
    } catch { setError('테스트 결제가 취소되었거나 시작되지 않았어요. 다시 시도하거나 취소할 수 있어요.') }
    finally { running.current = false; setBusy(false) }
  }
  return <section className="market-page" aria-label="공통 거래 테스트 결제">
    <button type="button" className="market-back" disabled={busy} onClick={() => void cancel()}>← 매물로 돌아가기</button>
    <h3>토스 테스트 결제</h3><p>실제 금전 이동이나 티켓 발급은 이루어지지 않아요.</p>
    {error && <p role="alert" className="market-form-error">{error}</p>}
    <div id="shared-toss-methods" /><div id="shared-toss-agreement" />
    {!order ? <button type="button" className="market-outline" disabled={busy} onClick={() => void prepare()}>{busy ? '준비 중…' : '테스트 결제 준비'}</button> : <button type="button" className="market-outline" disabled={busy || !widget} onClick={() => void pay()}>{busy ? '처리 중…' : '토스 테스트 결제하기'}</button>}
  </section>
}

export function SharedTossReturn() {
  const [result, setResult] = useState<'checking' | 'done' | 'cancelled' | 'error'>('checking')
  const [error, setError] = useState('')
  const started = useRef(false)
  const [payment] = useState(() => {
    const url = new URL(location.href), status = url.searchParams.get('status'), providerOrderId = url.searchParams.get('orderId'), paymentKey = url.searchParams.get('paymentKey'), amount = url.searchParams.get('amount')
    history.replaceState(null, '', location.pathname)
    try {
      if (!status) {
        const previous = JSON.parse(sessionStorage.getItem(`${PENDING_KEY}.return`) ?? 'null') as { stored?: Pending; status?: string; paymentKey?: string | null } | null
        if (previous?.stored?.mode === 'test' && previous.stored.orderId && previous.stored.providerOrderId && (previous.status === 'fail' || previous.status === 'success' && previous.paymentKey)) return { stored: previous.stored, status: previous.status, paymentKey: previous.paymentKey ?? null }
        return null
      }
      const stored = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as Pending | null
      if (!stored || stored.mode !== 'test' || !stored.orderId || !stored.providerOrderId) return null
      if (status === 'success' && (!paymentKey || providerOrderId !== stored.providerOrderId || !amount || !/^\d+$/.test(amount) || Number(amount) !== stored.amount)) return null
      if (status !== 'success' && status !== 'fail') return null
      const value = { stored, status, paymentKey }
      sessionStorage.setItem(`${PENDING_KEY}.return`, JSON.stringify(value)); return value
    } catch { return null }
  })
  // Trigger from a button so retries remain available after an uncertain response.
  async function confirm() {
    if (!payment || started.current) return
    started.current = true; setResult('checking'); setError('')
    const path = payment.status === 'success' ? 'confirm' : 'cancel'
    const body = payment.status === 'success' ? { orderId: payment.stored.orderId, providerOrderId: payment.stored.providerOrderId, amount: payment.stored.amount, paymentKey: payment.paymentKey } : { orderId: payment.stored.orderId }
    try {
      const response = await fetch(`/api/shared/test-payments/${path}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!response.ok) throw new Error('테스트 결제 상태를 확인하지 못했어요. 다시 확인해 주세요.')
      const value: unknown = await response.json()
      if (!value || typeof value !== 'object' || !('mode' in value) || value.mode !== 'test' || !('orderId' in value) || value.orderId !== payment.stored.orderId || !('status' in value) || (path === 'cancel' ? value.status !== 'cancelled' : value.status !== 'held' && value.status !== 'sent' && value.status !== 'settled')) throw new Error('테스트 결제 응답을 확인하지 못했어요.')
      sessionStorage.removeItem(PENDING_KEY); sessionStorage.removeItem(`${PENDING_KEY}.return`); setResult('done')
    } catch (e) { setError(e instanceof Error ? e.message : '테스트 결제 상태를 확인하지 못했어요.'); setResult('error') }
    finally { started.current = false }
  }
  async function reconcile() {
    if (!payment || started.current) return
    started.current = true; setError('')
    try {
      const response = await fetch('/api/shared/test-payments/reconcile', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: payment.stored.orderId }) })
      if (!response.ok) throw new Error('테스트 결제 상태를 확인하지 못했어요. 잠시 후 다시 확인해 주세요.')
      const value: unknown = await response.json()
      if (!value || typeof value !== 'object' || !('mode' in value) || value.mode !== 'test' || !('orderId' in value) || value.orderId !== payment.stored.orderId || !('paymentStatus' in value)) throw new Error('테스트 결제 상태를 확인하지 못했어요.')
      if (value.paymentStatus === 'approved' || value.paymentStatus === 'cancelled') {
        sessionStorage.removeItem(PENDING_KEY); sessionStorage.removeItem(`${PENDING_KEY}.return`)
        setResult(value.paymentStatus === 'approved' ? 'done' : 'cancelled')
      } else throw new Error('아직 결제 결과를 확인 중이에요. 잠시 후 다시 확인해 주세요.')
    } catch (e) { setError(e instanceof Error ? e.message : '테스트 결제 상태를 확인하지 못했어요.'); setResult('error') }
    finally { started.current = false }
  }
  // No confirmation is claimed until the authenticated server accepts it.
  if (!payment) return <main className="market"><section className="market-page"><h1>주문 정보를 확인하지 못했어요</h1><a href="/">처음으로</a></section></main>
  return <main className="market"><section className="market-page"><h1>{result === 'cancelled' || result === 'done' && payment.status === 'fail' ? '테스트 결제가 취소됐어요' : result === 'done' ? '테스트 결제가 완료됐어요' : '테스트 결제 결과를 확인해 주세요'}</h1><p>실제 금전 이동과 티켓 발급은 이루어지지 않아요.</p>{error && <p role="alert">{error}</p>}{result !== 'done' && result !== 'cancelled' && <button type="button" className="market-outline" onClick={() => void confirm()}>{result === 'error' ? '승인 다시 시도' : '결제 결과 확인'}</button>}{result === 'error' && <button type="button" className="market-text-button" onClick={() => void reconcile()}>결제 상태 조회</button>}<a href="/">처음으로</a></section></main>
}
