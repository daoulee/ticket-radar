import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './marketplace.css'
import { MoneyInput } from './MoneyInput'
import { ServerAuth } from './ServerAuth'
import { SharedTossCheckout } from './SharedTossCheckout'

type Summary = { id: string; title: string; venue: string; firstSession: string | null; listingCount: number }
type Listing = { id: string; seatGrade: string; quantity: number; pricePerTicket: number; isDemo: boolean; safety: { priceText: string } }
type Show = { show: { id: string; title: string; faceSource?: { label: string } | null; sessions: { id: string; label: string }[]; facePrices: { seatGrade: string; price: number }[] }; listings: Listing[] }
type Order = { order: { id: string; status: 'held' | 'sent' | 'settled' | 'cancelled'; amount: number; testPayment?: { status: 'pending' | 'confirming' | 'approved' | 'expired' | 'cancelled' } }; role: 'buyer' | 'seller'; show: { title: string } }
const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`
class RequestError extends Error {
  readonly status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}
const sessionKey = (baseUrl: string) => `ticketradar.web-session:${baseUrl.replace(/\/+$/, '')}`
const COOKIE_SESSION = 'cookie-session'
const LEGACY_SESSION_KEY = sessionKey('https://ticketradar-shared-staging.daoule-6b5.workers.dev')
function readSession(key: string) { try { return sessionStorage.getItem(key) } catch { return null } }
function writeSession(key: string, value: string | null) { try { if (value) sessionStorage.setItem(key, value); else sessionStorage.removeItem(key) } catch { /* login remains available for this page */ } }

export function ServerMarketplace({ baseUrl, onSafety, onPerformances, onDemo }: { baseUrl: string; onSafety: () => void; onPerformances: () => void; onDemo?: () => void }) {
  const cookieMode = baseUrl.replace(/\/+$/, '') === '/api/shared'
  const [shows, setShows] = useState<Summary[] | null>(null)
  const [selected, setSelected] = useState<Show | null>(null)
  const [paymentListing, setPaymentListing] = useState<Listing | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [restoreError, setRestoreError] = useState('')
  const [restoreAttempt, setRestoreAttempt] = useState(0)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [grade, setGrade] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [delivery, setDelivery] = useState('onsite')
  const [booking, setBooking] = useState('unknown')
  const [notice, setNotice] = useState('')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const request = useCallback(async <T,>(path: string, method = 'GET', body?: unknown, auth?: string | null): Promise<T> => {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, { method, credentials: 'same-origin', headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(!cookieMode && auth ? { Authorization: `Bearer ${auth}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000) })
    const data: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      if (response.status === 401 && auth) {
        if (readSession(sessionKey(baseUrl)) === auth) writeSession(sessionKey(baseUrl), null)
        setToken(current => current === auth ? null : current)
        setOrders(null)
      }
      throw new RequestError(data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : '요청을 처리하지 못했어요.', response.status)
    }
    if (!data || typeof data !== 'object') throw new Error('서버 응답을 확인할 수 없어요.')
    if (cookieMode && (path === '/auth/login' || path === '/auth/signup')) {
      if (!('authenticated' in data) || data.authenticated !== true) throw new Error('로그인 응답을 확인할 수 없어요.')
      return { token: COOKIE_SESSION } as T
    }
    return data as T
  }, [baseUrl, cookieMode])

  const loadShows = useCallback(async () => {
    try { const data = await request<Summary[]>('/shows'); if (!Array.isArray(data)) throw new Error('공연 목록을 확인할 수 없어요.'); setShows(data); setError('') }
    catch (e) { setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') }
  }, [request])
  useEffect(() => {
    let active = true
    const key = sessionKey(baseUrl), saved = cookieMode ? COOKIE_SESSION : readSession(key)
    setRestoring(true); setRestoreError('')
    if (!saved) { setRestoring(false); return () => { active = false } }
    request<{ id: string }>('/me', 'GET', undefined, saved).then(data => {
      if (!data || typeof data.id !== 'string' || !data.id) throw new Error('계정 응답을 확인할 수 없어요.')
      if (active) { if (cookieMode) writeSession(LEGACY_SESSION_KEY, null); setToken(saved) }
    }).catch(async e => {
      if (!active) return
      if (e instanceof RequestError && e.status === 401) {
        const legacy = cookieMode ? readSession(LEGACY_SESSION_KEY) : null
        if (legacy) {
          try {
            const response = await fetch('/api/shared/auth/session-upgrade', { method: 'POST', credentials: 'same-origin', headers: { Authorization: `Bearer ${legacy}` }, signal: AbortSignal.timeout(15000) })
            if (response.ok) { if (active) { writeSession(LEGACY_SESSION_KEY, null); setToken(COOKIE_SESSION) }; return }
            if (response.status !== 401 && response.status !== 400) throw new Error('upgrade failed')
            writeSession(LEGACY_SESSION_KEY, null)
          } catch { if (active) setRestoreError('로그인 상태를 확인하지 못했어요. 연결을 확인하고 다시 시도해 주세요.'); return }
        }
        writeSession(key, null); setToken(null)
        if (!cookieMode || legacy) setNotice('로그인이 만료됐어요. 다시 로그인해 주세요.')
      } else setRestoreError('로그인 상태를 확인하지 못했어요. 연결을 확인하고 다시 시도해 주세요.')
    }).finally(() => { if (active) setRestoring(false) })
    return () => { active = false }
  }, [baseUrl, cookieMode, request, restoreAttempt])
  useEffect(() => {
    let active = true
    request<Summary[]>('/shows').then(data => {
      if (!Array.isArray(data)) throw new Error('공연 목록을 확인할 수 없어요.')
      if (active) { setShows(data); setError('') }
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') })
    return () => { active = false }
  }, [request])

  async function openShow(id: string) {
    setDirection('forward')
    setBusy(true); setError(''); setNotice(''); setOrders(null)
    try {
      const data = await request<Show>(`/shows/${encodeURIComponent(id)}`, 'GET', undefined, token)
      if (!data.show || !Array.isArray(data.show.sessions) || !Array.isArray(data.show.facePrices) || !Array.isArray(data.listings)) throw new Error('공연 정보를 확인할 수 없어요.')
      setSelected(data); setSessionId(data.show.sessions[0]?.id ?? ''); setGrade(data.show.facePrices[0]?.seatGrade ?? ''); setPrice(''); setOriginalPrice('')
    } catch (e) { setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') }
    finally { setBusy(false) }
  }
  async function refreshOrders(auth = token) {
    if (!auth) return
    const data = await request<Order[]>('/me/orders', 'GET', undefined, auth)
    if (!Array.isArray(data)) throw new Error('거래 목록을 확인할 수 없어요.')
    setDirection('forward'); setOrders(data); setSelected(null)
  }
  async function act(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : '요청을 처리하지 못했어요.') } finally { setBusy(false) }
  }
  async function register(e: FormEvent) {
    e.preventDefault()
    if (!selected || !token) return
    await act(async () => {
      await request('/listings', 'POST', { showId: selected.show.id, sessionId, seatGrade: grade, quantity: 1, pricePerTicket: Number(price), originalPricePerTicket: Number(originalPrice), delivery, bookingType: booking }, token)
      await openShow(selected.show.id); setNotice('시연 매물을 등록했어요.')
    })
  }
  return <main className="market" aria-label="서버 연결 티켓 거래">
    <div className="market-demo" role="note"><strong>서버 연결 · 시연 거래</strong><span>매물과 결제는 시연이며 실제 금전 이동은 없어요.</span></div>
    {onDemo && <button type="button" className="market-back" onClick={onDemo}>← 예매 시연으로</button>}
    <div className="market-heading"><div><p className="market-kicker">TICKET RADAR</p><h2>티켓 둘러보기</h2><p>앱과 같은 서버의 공연과 매물을 확인해요.</p></div><button className="market-outline" onClick={onPerformances}>공연 정보 찾기</button></div>
    {restoring ? <p role="status">로그인 상태를 확인하고 있어요.</p> : restoreError ? <div role="alert"><p>{restoreError}</p><button type="button" className="market-outline" onClick={() => setRestoreAttempt(value => value + 1)}>다시 시도</button><button type="button" className="market-text-button" onClick={() => { writeSession(sessionKey(baseUrl), null); if (cookieMode) writeSession(LEGACY_SESSION_KEY, null); setRestoreError(''); setToken(null) }}>다른 계정으로 로그인</button></div> : !token ? <ServerAuth request={request} onAuthenticated={(value, signup) => { if (!cookieMode) writeSession(sessionKey(baseUrl), value); else writeSession(LEGACY_SESSION_KEY, null); setToken(value); setNotice(signup ? '가입을 환영합니다!' : '로그인했어요.') }} /> : <div className="market-toolbar"><button className="market-outline" disabled={busy} onClick={() => void act(async () => refreshOrders())}>내 거래</button><button className="market-text-button" disabled={busy} onClick={() => void act(async () => { try { await request('/auth/logout', 'POST', {}, token) } catch (e) { if (!(e instanceof RequestError && e.status === 401)) throw e } writeSession(sessionKey(baseUrl), null); if (cookieMode) writeSession(LEGACY_SESSION_KEY, null); setToken(null); setOrders(null); setNotice('로그아웃했어요.') })}>로그아웃</button></div>}
    {error && <p role="alert" className="market-form-error">{error} <button type="button" onClick={() => void loadShows()}>공연 목록 다시 불러오기</button></p>}{notice && <p role="status">{notice}</p>}
    <div key={paymentListing ? 'payment' : orders ? 'orders' : selected ? 'detail' : 'browse'} className={`market-view market-view--${direction}`}>
    {paymentListing && selected && token ? <SharedTossCheckout item={paymentListing} title={selected.show.title} request={request} token={token} onBack={() => { setPaymentListing(null); void openShow(selected.show.id) }} /> : <>
    {orders ? <section className="market-page"><button className="market-back" onClick={() => { setDirection('back'); setOrders(null) }}>← 공연 목록</button><h3>내 시연 거래</h3>{orders.length === 0 ? <p>진행 중인 거래가 없어요.</p> : orders.map(({ order, role, show }) => <div className="market-extra" key={order.id}><div><strong>{show.title}</strong><p>{won(order.amount)} · {order.testPayment?.status === 'pending' ? '테스트 결제 대기' : order.testPayment?.status === 'confirming' ? '테스트 결제 확인 중' : order.testPayment?.status === 'expired' ? '테스트 결제 만료' : order.status === 'held' ? '전달 대기' : order.status === 'sent' ? '수령 확인 대기' : order.status === 'settled' ? '거래 완료' : '취소됨'}</p></div>{role === 'buyer' && order.testPayment?.status === 'pending' && <button className="market-outline" disabled={busy} onClick={() => void act(async () => { await request('/test-payments/cancel', 'POST', { orderId: order.id }, token); await refreshOrders(); setNotice('테스트 결제를 취소했어요.') })}>결제 취소</button>}{role === 'seller' && order.status === 'held' && (!order.testPayment || order.testPayment.status === 'approved') && <button className="market-outline" disabled={busy} onClick={() => void act(async () => { await request(`/orders/${encodeURIComponent(order.id)}/sent`, 'POST', {}, token); await refreshOrders(); setNotice('티켓 전달을 표시했어요.') })}>전달했어요</button>}{role === 'buyer' && order.status === 'sent' && <button className="market-outline" disabled={busy} onClick={() => void act(async () => { await request(`/orders/${encodeURIComponent(order.id)}/confirm`, 'POST', {}, token); await refreshOrders(); setNotice('시연 거래가 완료됐어요.') })}>티켓 받았어요</button>}</div>)}</section> : selected ? <section className="market-page"><button className="market-back" onClick={() => { setDirection('back'); setSelected(null) }}>← 공연 목록</button><h3>{selected.show.title}</h3>{selected.listings.length === 0 ? <p>등록된 시연 매물이 없어요.</p> : <div className="market-grid">{selected.listings.map(item => <div className="market-item" key={item.id}><strong>{item.seatGrade} · {item.quantity}매</strong><span>{won(item.pricePerTicket)} / 1매</span><span>{item.safety.priceText} · {item.isDemo ? '시연' : '매물'}</span><button className="market-outline" disabled={busy || !token} onClick={() => { if (import.meta.env.VITE_SHARED_TOSS_TEST === '1' && cookieMode) setPaymentListing(item); else void act(async () => { await request('/orders', 'POST', { listingId: item.id }, token); await refreshOrders(); setNotice('시연 주문을 만들었어요. 내 거래에서 확인해 주세요.') }) }}>시연 구매하기</button></div>)}</div>}
      {token && selected.show.faceSource?.label !== 'KOPIS 안내 기반 시연 기준가' && <form className="market-form" onSubmit={register}><h3>시연 매물 등록</h3><label>회차<select value={sessionId} onChange={e => setSessionId(e.target.value)}>{selected.show.sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label>좌석 등급<select value={grade} onChange={e => setGrade(e.target.value)}>{selected.show.facePrices.map(f => <option key={f.seatGrade} value={f.seatGrade}>{f.seatGrade} · 기준 {won(f.price)}</option>)}</select></label><label>원구매가<MoneyInput minAmount={1000} value={originalPrice} onValueChange={setOriginalPrice} required /></label><label>장당 가격<MoneyInput minAmount={1000} value={price} onValueChange={setPrice} required /></label><p>매물당 1매 · 원구매가는 판매자가 입력하며 구매 증빙은 확인하지 않아요.</p><label>전달 방식<select value={delivery} onChange={e => setDelivery(e.target.value)}><option value="onsite">현장 전달</option><option value="official_transfer">공식 양도</option><option value="qr_capture">QR 캡처</option><option value="courier">택배</option></select></label><label>예매 유형<select value={booking} onChange={e => setBooking(e.target.value)}><option value="unknown">모르겠어요</option><option value="general">일반 예매</option><option value="fanclub_presale">팬클럽 선예매</option></select></label><p>시연 거래 · 양도가는 입력한 원구매가와 확인된 기준가 이하여야 해요.</p><button className="market-outline" disabled={busy || !grade || !sessionId}>시연 매물 등록</button></form>}
    </section> : <section><div className="market-subhead"><h3>서버에 등록된 공연</h3><div><button className="market-text-button" disabled={busy} onClick={() => void loadShows()}>공연 새로고침</button>{' · '}<button className="market-text-button" onClick={onSafety}>판매글 안심 확인 →</button></div></div>{shows === null ? !error && <p>공연 목록을 불러오고 있어요.</p> : shows.length === 0 ? <p>등록된 공연이 없어요.</p> : <div className="market-grid">{shows.map(show => <button className="market-item" type="button" key={show.id} disabled={busy} onClick={() => void openShow(show.id)}><strong>{show.title}</strong><span>{show.venue} · {show.firstSession ?? '회차 미확인'}</span><span>매물 {show.listingCount}건</span></button>)}</div>}</section>}
    </>}
    </div>
  </main>
}
