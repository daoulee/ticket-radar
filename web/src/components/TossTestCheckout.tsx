import { useEffect, useState } from 'react'

type Item = { kind: 'primary_demo' | 'resale_demo'; title: string; seat: string; price: number; originalPrice?: number }
export type Widget = {
  setAmount: (value: { currency: 'KRW'; value: number }) => Promise<unknown>
  renderPaymentMethods: (options: { selector: string; variantKey: string }) => Promise<unknown>
  renderAgreement: (options: { selector: string; variantKey: string }) => Promise<unknown>
  requestPayment: (options: { orderId: string; orderName: string; successUrl: string; failUrl: string }) => Promise<unknown>
}
type TossGlobal = (key: string) => { widgets: (options: { customerKey: string }) => Widget }
declare global { interface Window { TossPayments?: TossGlobal } }

export function loadSdk(): Promise<TossGlobal> {
  if (window.TossPayments) return Promise.resolve(window.TossPayments)
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v2/standard'
    script.onload = () => window.TossPayments ? resolve(window.TossPayments) : reject(new Error('결제 SDK를 불러오지 못했어요.'))
    script.onerror = () => { script.remove(); reject(new Error('결제 SDK에 연결하지 못했어요.')) }
    document.head.appendChild(script)
  })
}
async function api(path: string, body?: unknown) {
  const response = await fetch(`/api/toss-test/${path}`, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data: unknown = await response.json()
  if (!response.ok || !data || typeof data !== 'object') throw new Error('토스 테스트 결제 서버에 연결하지 못했어요.')
  return data as Record<string, unknown>
}

export function TossTestCheckout({ item, quantity }: { item: Item; quantity: number }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [widget, setWidget] = useState<Widget | null>(null)
  const [order, setOrder] = useState<{ orderId: string; orderName: string; amount: number; orderToken?: string } | null>(null)
  useEffect(() => {
    let active = true
    async function init() {
      setState('loading'); setError('')
      try {
        const config = await api('config')
        if (config.mode !== 'test' || typeof config.clientKey !== 'string' || !config.clientKey.startsWith('test_gck_')) throw new Error('테스트 전용 키를 확인해 주세요.')
        const prepared = await api('prepare', { ...item, quantity })
        if (prepared.mode !== 'test' || typeof prepared.orderId !== 'string' || typeof prepared.orderName !== 'string' || typeof prepared.amount !== 'number' || prepared.amount !== item.price * quantity) throw new Error('시연 주문 금액을 확인하지 못했어요.')
        const TossPayments = await loadSdk(); if (!active) return
        const widgets = TossPayments(config.clientKey).widgets({ customerKey: crypto.randomUUID() })
        await widgets.setAmount({ currency: 'KRW', value: prepared.amount }); if (!active) return
        await Promise.all([widgets.renderPaymentMethods({ selector: '#toss-methods', variantKey: 'DEFAULT' }), widgets.renderAgreement({ selector: '#toss-agreement', variantKey: 'AGREEMENT' })]); if (!active) return
        setOrder({ orderId: prepared.orderId, orderName: prepared.orderName, amount: prepared.amount, ...(typeof prepared.orderToken === 'string' ? { orderToken: prepared.orderToken } : {}) }); setWidget(widgets); setState('ready')
      } catch (e) { if (active) { setError(e instanceof Error ? e.message : '테스트 결제를 준비하지 못했어요.'); setState('error') } }
    }
    void init()
    return () => { active = false }
  }, [item, quantity, retry])
  async function pay() {
    if (!widget || !order || state !== 'ready') return
    setState('loading')
    try {
      sessionStorage.setItem('aid-toss-test-order', order.orderId)
      if (order.orderToken) sessionStorage.setItem('aid-toss-test-token', order.orderToken)
      await widget.requestPayment({ orderId: order.orderId, orderName: order.orderName, successUrl: `${location.origin}/toss-test-return?status=success`, failUrl: `${location.origin}/toss-test-return?status=fail` })
      setState('ready')
    } catch { setError('테스트 결제가 취소되었거나 시작되지 않았어요. 다시 시도할 수 있어요.'); setState('ready') }
  }
  return <section aria-labelledby="toss-test-title"><p className="market-kicker">토스페이먼츠 테스트 환경</p><h2 id="toss-test-title">테스트 결제</h2><p className="market-lede">가상 주문이에요. 실제 결제나 좌석 예약은 이루어지지 않아요.</p>
    {state === 'loading' && <p role="status">테스트 결제를 준비하고 있어요.</p>}
    {state === 'error' && <div role="alert"><p>{error}</p><button type="button" className="btn btn-secondary" onClick={() => setRetry(n => n + 1)}>다시 시도</button></div>}
    <div id="toss-methods" /><div id="toss-agreement" />
    {state === 'ready' && error && <p role="alert">{error}</p>}
    <button type="button" className="btn btn-primary market-primary" disabled={state !== 'ready'} onClick={() => void pay()}>토스 테스트 결제하기</button>
  </section>
}

const confirmations = new Map<string, Promise<Record<string, unknown>>>()
export function TossTestReturn() {
  const [params] = useState(() => new URLSearchParams(location.search))
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    const status = params.get('status'), orderId = params.get('orderId'), paymentKey = params.get('paymentKey'), amount = params.get('amount')
    history.replaceState(null, '', location.pathname)
    if (status !== 'success') { setMessage('테스트 결제가 취소되었거나 실패했어요.'); setState('error'); return }
    if (!orderId || !paymentKey || !amount || !/^\d+$/.test(amount) || sessionStorage.getItem('aid-toss-test-order') !== orderId) { setMessage('시연 주문 정보를 확인하지 못했어요.'); setState('error'); return }
    const key = `${orderId}:${paymentKey}:${amount}`
    let request = confirmations.get(key)
    if (!request) { request = api('confirm', { orderId, paymentKey, amount: Number(amount), ...(sessionStorage.getItem('aid-toss-test-token') ? { orderToken: sessionStorage.getItem('aid-toss-test-token') } : {}) }); confirmations.set(key, request) }
    request.then(result => { if (active && result.status === 'DONE' && result.mode === 'test') { sessionStorage.removeItem('aid-toss-test-order'); sessionStorage.removeItem('aid-toss-test-token'); setState('done') } else if (active) { setMessage('승인 결과를 확인하지 못했어요.'); setState('error') } }, () => { confirmations.delete(key); if (active) { setMessage('테스트 결제 승인에 실패했어요.'); setState('error') } })
    return () => { active = false }
  }, [params])
  return <main className="market"><div className="market-page"><div className="market-detail"><p className="market-kicker">토스페이먼츠 테스트 결제</p><h1>{state === 'loading' ? '테스트 결제 승인 확인 중' : state === 'done' ? '테스트 결제가 완료됐어요' : '테스트 결제를 완료하지 못했어요'}</h1><p>{state === 'done' ? '실제 금전 이동이나 좌석 예약은 이루어지지 않았어요.' : message}</p><a href="/">처음으로 돌아가기</a></div></div></main>
}
