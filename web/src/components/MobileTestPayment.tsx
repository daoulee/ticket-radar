import { useEffect, useRef, useState } from 'react'
import { loadSdk, type Widget } from './TossTestCheckout'

type Payment = { orderId: string; providerOrderId: string; amount: number; mode: 'test' }
const ORDER_KEY = 'ticketradar.mobile-test-payment'
const RETURN_KEY = `${ORDER_KEY}.return`
const exchanges = new Map<string, Promise<Payment>>()
function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<Payment>
  return v.mode === 'test' && typeof v.orderId === 'string' && /^ord-[A-Za-z0-9-]{1,96}$/.test(v.orderId) && typeof v.providerOrderId === 'string' && /^trtest_[a-f0-9]{32}$/.test(v.providerOrderId) && Number.isSafeInteger(v.amount) && (v.amount ?? 0) > 0
}
async function api(path: string, body?: unknown) {
  const response = await fetch(`/api/mobile-test-payment/${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error('테스트 결제 상태를 확인하지 못했어요. 앱에서 다시 시작해 주세요.')
  return response.json() as Promise<unknown>
}

export function MobileTestPayment() {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [widget, setWidget] = useState<Widget | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const codeRef = useRef<string | null>(null), running = useRef(false)
  useEffect(() => {
    let active = true
    try {
      if (!codeRef.current) {
        const fragment = new URLSearchParams(location.hash.slice(1))
        codeRef.current = fragment.get('code')
        history.replaceState(null, '', location.pathname)
      }
      const code = codeRef.current
      if (!code) {
        const saved: unknown = JSON.parse(sessionStorage.getItem(ORDER_KEY) ?? 'null')
        if (isPayment(saved)) setPayment(saved); else setError('결제 연결을 확인하지 못했어요. 앱에서 다시 시작해 주세요.')
        return () => { active = false }
      }
      if (!/^[A-Za-z0-9_-]{43}$/.test(code)) throw new Error('결제 연결을 확인하지 못했어요.')
      let exchange = exchanges.get(code)
      if (!exchange) {
        exchange = api('exchange', { code }).then(value => { if (!isPayment(value)) throw new Error('주문 정보를 확인하지 못했어요.'); return value })
        exchanges.set(code, exchange)
      }
      exchange.then(value => { exchanges.delete(code); if (active) { sessionStorage.setItem(ORDER_KEY, JSON.stringify(value)); setPayment(value) } }, () => { exchanges.delete(code); if (active) setError('결제 연결이 만료됐어요. 앱에서 다시 시작해 주세요.') })
    } catch { setError('결제 연결을 확인하지 못했어요. 앱에서 다시 시작해 주세요.') }
    return () => { active = false }
  }, [])
  async function prepare() {
    if (!payment || running.current) return
    running.current = true; setBusy(true); setError('')
    try {
      const config = await api('config') as { mode?: unknown; clientKey?: unknown }
      if (config.mode !== 'test' || typeof config.clientKey !== 'string' || !config.clientKey.startsWith('test_gck_')) throw new Error('테스트 결제 설정을 확인하지 못했어요.')
      const TossPayments = await loadSdk(), next = TossPayments(config.clientKey).widgets({ customerKey: crypto.randomUUID() })
      await next.setAmount({ currency: 'KRW', value: payment.amount })
      await Promise.all([next.renderPaymentMethods({ selector: '#mobile-toss-methods', variantKey: 'DEFAULT' }), next.renderAgreement({ selector: '#mobile-toss-agreement', variantKey: 'AGREEMENT' })])
      setWidget(next)
    } catch (e) { setError(e instanceof Error ? e.message : '테스트 결제를 준비하지 못했어요.') }
    finally { running.current = false; setBusy(false) }
  }
  async function pay() {
    if (!payment || !widget || running.current) return
    running.current = true; setBusy(true); setError('')
    try { await widget.requestPayment({ orderId: payment.providerOrderId, orderName: '티켓레이더 시연 티켓', successUrl: `${location.origin}/mobile-toss-return?status=success`, failUrl: `${location.origin}/mobile-toss-return?status=fail` }) }
    catch { setError('테스트 결제가 취소되었거나 시작되지 않았어요. 다시 시도할 수 있어요.') }
    finally { running.current = false; setBusy(false) }
  }
  async function cancel() {
    if (!payment || running.current) return
    running.current = true; setBusy(true); setError('')
    try { await api('cancel', {}); sessionStorage.removeItem(ORDER_KEY); location.assign(`ticketradar:///order/${encodeURIComponent(payment.orderId)}`) }
    catch { setError('취소 상태를 확인하지 못했어요. 앱에서 거래를 확인해 주세요.') }
    finally { running.current = false; setBusy(false) }
  }
  return <main className="market"><section className="market-page" aria-label="앱 테스트 결제"><h1>토스 테스트 결제</h1><p>실제 금전 이동이나 티켓 발급은 이루어지지 않아요.</p>{error && <p role="alert">{error}</p>}{!payment && !error && <p role="status">주문을 확인하고 있어요.</p>}<div id="mobile-toss-methods" /><div id="mobile-toss-agreement" />{payment && <><button type="button" className="market-outline" disabled={busy} onClick={() => void (widget ? pay() : prepare())}>{busy ? '처리 중…' : widget ? '토스 테스트 결제하기' : '테스트 결제 준비'}</button><button type="button" className="market-text-button" disabled={busy} onClick={() => void cancel()}>결제 취소</button></>}</section></main>
}

export function MobileTestPaymentReturn() {
  const [result, setResult] = useState<'ready' | 'done' | 'cancelled' | 'error'>('ready'), [error, setError] = useState('')
  const running = useRef(false)
  const [payment] = useState(() => {
    const url = new URL(location.href), status = url.searchParams.get('status'), providerId = url.searchParams.get('orderId'), paymentKey = url.searchParams.get('paymentKey'), amount = url.searchParams.get('amount')
    history.replaceState(null, '', location.pathname)
    try {
      if (!status) {
        const previous: unknown = JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? 'null')
        if (previous && typeof previous === 'object') { const value = previous as { order?: unknown; status?: unknown; paymentKey?: unknown }; if (isPayment(value.order) && (value.status === 'fail' || value.status === 'success' && typeof value.paymentKey === 'string' && !!value.paymentKey)) return { order: value.order, status: value.status, paymentKey: value.paymentKey as string | null } }
        return null
      }
      const order: unknown = JSON.parse(sessionStorage.getItem(ORDER_KEY) ?? 'null')
      if (!isPayment(order) || (status !== 'success' && status !== 'fail')) return null
      if (status === 'success' && (!paymentKey || providerId !== order.providerOrderId || !amount || !/^\d+$/.test(amount) || Number(amount) !== order.amount)) return null
      const value = { order, status, paymentKey }; sessionStorage.setItem(RETURN_KEY, JSON.stringify(value)); return value
    } catch { return null }
  })
  async function confirm() {
    if (!payment || running.current) return
    running.current = true; setError('')
    try {
      const result = await api(payment.status === 'success' ? 'confirm' : 'cancel', payment.status === 'success' ? { providerOrderId: payment.order.providerOrderId, amount: payment.order.amount, paymentKey: payment.paymentKey } : {})
      if (!result || typeof result !== 'object' || !('mode' in result) || result.mode !== 'test' || !('orderId' in result) || result.orderId !== payment.order.orderId || !('status' in result) || (payment.status === 'fail' ? result.status !== 'cancelled' : result.status !== 'held' && result.status !== 'sent' && result.status !== 'settled')) throw new Error('테스트 결제 결과를 확인하지 못했어요.')
      sessionStorage.removeItem(ORDER_KEY); sessionStorage.removeItem(RETURN_KEY); setResult('done')
    } catch (e) { setError(e instanceof Error ? e.message : '결제 결과를 확인하지 못했어요.'); setResult('error') }
    finally { running.current = false }
  }
  async function reconcile() {
    if (!payment || running.current) return
    running.current = true; setError('')
    try {
      const value = await api('reconcile', {})
      if (!value || typeof value !== 'object' || !('mode' in value) || value.mode !== 'test' || !('orderId' in value) || value.orderId !== payment.order.orderId || !('paymentStatus' in value)) throw new Error('테스트 결제 상태를 확인하지 못했어요.')
      if (value.paymentStatus === 'approved' || value.paymentStatus === 'cancelled') {
        sessionStorage.removeItem(ORDER_KEY); sessionStorage.removeItem(RETURN_KEY)
        setResult(value.paymentStatus === 'approved' ? 'done' : 'cancelled')
      } else throw new Error('아직 결제 결과를 확인 중이에요. 잠시 후 다시 확인해 주세요.')
    } catch (e) { setError(e instanceof Error ? e.message : '테스트 결제 상태를 확인하지 못했어요.'); setResult('error') }
    finally { running.current = false }
  }
  if (!payment) return <main className="market"><section className="market-page"><h1>결제 정보를 확인하지 못했어요</h1><p>앱에서 거래 상태를 확인해 주세요.</p></section></main>
  return <main className="market"><section className="market-page"><h1>{result === 'cancelled' || result === 'done' && payment.status === 'fail' ? '테스트 결제가 취소됐어요' : result === 'done' ? '테스트 결제가 완료됐어요' : '테스트 결제 결과를 확인해 주세요'}</h1><p>실제 금전 이동이나 티켓 발급은 이루어지지 않아요.</p>{error && <p role="alert">{error}</p>}{result !== 'done' && result !== 'cancelled' && <button type="button" className="market-outline" onClick={() => void confirm()}>{result === 'error' ? '승인 다시 시도' : '결제 결과 확인'}</button>}{result === 'error' && <button type="button" className="market-text-button" onClick={() => void reconcile()}>결제 상태 조회</button>}{(result === 'done' || result === 'cancelled') && <a href={`ticketradar:///order/${encodeURIComponent(payment.order.orderId)}`}>앱으로 돌아가기</a>}</section></main>
}
