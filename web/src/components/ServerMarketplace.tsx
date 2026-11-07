import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './marketplace.css'

type Summary = { id: string; title: string; venue: string; firstSession: string | null; listingCount: number }
type Listing = { id: string; seatGrade: string; quantity: number; pricePerTicket: number; isDemo: boolean; safety: { priceText: string } }
type Show = { show: { id: string; title: string; faceSource?: { label: string } | null; sessions: { id: string; label: string }[]; facePrices: { seatGrade: string; price: number }[] }; listings: Listing[] }
type Order = { order: { id: string; status: 'held' | 'sent' | 'settled' | 'cancelled'; amount: number }; role: 'buyer' | 'seller'; show: { title: string } }
const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`

export function ServerMarketplace({ baseUrl, onSafety, onPerformances }: { baseUrl: string; onSafety: () => void; onPerformances: () => void }) {
  const [shows, setShows] = useState<Summary[] | null>(null)
  const [selected, setSelected] = useState<Show | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [grade, setGrade] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [delivery, setDelivery] = useState('onsite')
  const [booking, setBooking] = useState('unknown')
  const [notice, setNotice] = useState('')

  const request = useCallback(async <T,>(path: string, method = 'GET', body?: unknown, auth?: string | null): Promise<T> => {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, { method, headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000) })
    const data: unknown = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : '요청을 처리하지 못했어요.')
    if (!data || typeof data !== 'object') throw new Error('서버 응답을 확인할 수 없어요.')
    return data as T
  }, [baseUrl])

  const loadShows = useCallback(async () => {
    try { const data = await request<Summary[]>('/shows'); if (!Array.isArray(data)) throw new Error('공연 목록을 확인할 수 없어요.'); setShows(data); setError('') }
    catch (e) { setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') }
  }, [request])
  useEffect(() => {
    let active = true
    request<Summary[]>('/shows').then(data => {
      if (!Array.isArray(data)) throw new Error('공연 목록을 확인할 수 없어요.')
      if (active) { setShows(data); setError('') }
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') })
    return () => { active = false }
  }, [request])

  async function openShow(id: string) {
    setBusy(true); setError(''); setNotice(''); setOrders(null)
    try {
      const data = await request<Show>(`/shows/${encodeURIComponent(id)}`, 'GET', undefined, token)
      if (!data.show || !Array.isArray(data.show.sessions) || !Array.isArray(data.show.facePrices) || !Array.isArray(data.listings)) throw new Error('공연 정보를 확인할 수 없어요.')
      setSelected(data); setSessionId(data.show.sessions[0]?.id ?? ''); setGrade(data.show.facePrices[0]?.seatGrade ?? ''); setPrice('')
    } catch (e) { setError(e instanceof Error ? e.message : '공연을 불러오지 못했어요.') }
    finally { setBusy(false) }
  }
  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const result = await request<{ token: string }>('/auth/login', 'POST', { ...(identity.trim().includes('@') ? { email: identity.trim() } : { name: identity.trim() }), password })
      if (typeof result.token !== 'string' || !result.token) throw new Error('로그인 응답을 확인할 수 없어요.')
      setToken(result.token); setPassword(''); setNotice('로그인했어요.')
    } catch (e) { setPassword(''); setError(e instanceof Error ? e.message : '로그인하지 못했어요.') }
    finally { setBusy(false) }
  }
  async function refreshOrders(auth = token) {
    if (!auth) return
    const data = await request<Order[]>('/me/orders', 'GET', undefined, auth)
    if (!Array.isArray(data)) throw new Error('거래 목록을 확인할 수 없어요.')
    setOrders(data); setSelected(null)
  }
  async function act(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : '요청을 처리하지 못했어요.') } finally { setBusy(false) }
  }
  async function register(e: FormEvent) {
    e.preventDefault()
    if (!selected || !token) return
    await act(async () => {
      await request('/listings', 'POST', { showId: selected.show.id, sessionId, seatGrade: grade, quantity: Number(quantity), pricePerTicket: Number(price), delivery, bookingType: booking }, token)
      await openShow(selected.show.id); setNotice('시연 매물을 등록했어요.')
    })
  }
  return <main className="market" aria-label="서버 연결 티켓 거래">
    <div className="market-demo" role="note"><strong>서버 연결 · 시연 거래</strong><span>매물과 결제는 시연이며 실제 금전 이동은 없어요.</span></div>
    <div className="market-heading"><div><p className="market-kicker">TICKET RADAR</p><h2>티켓 둘러보기</h2><p>앱과 같은 서버의 공연과 매물을 확인해요.</p></div><button className="market-outline" onClick={onPerformances}>공연 정보 찾기</button></div>
    {!token ? <form className="market-form" onSubmit={login}><label>아이디 또는 이메일<input value={identity} onChange={e => setIdentity(e.target.value)} autoComplete="username" required /></label><label>비밀번호<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="market-outline" disabled={busy}>로그인</button></form> : <div className="market-toolbar"><button className="market-outline" disabled={busy} onClick={() => void act(async () => refreshOrders())}>내 거래</button><button className="market-text-button" disabled={busy} onClick={() => void act(async () => { await request('/auth/logout', 'POST', {}, token); setToken(null); setOrders(null); setNotice('로그아웃했어요.') })}>로그아웃</button></div>}
    {error && <p role="alert" className="market-form-error">{error} <button type="button" onClick={() => void loadShows()}>공연 목록 다시 불러오기</button></p>}{notice && <p role="status">{notice}</p>}
    {orders ? <section className="market-page"><button className="market-back" onClick={() => setOrders(null)}>← 공연 목록</button><h3>내 시연 거래</h3>{orders.length === 0 ? <p>진행 중인 거래가 없어요.</p> : orders.map(({ order, role, show }) => <div className="market-extra" key={order.id}><div><strong>{show.title}</strong><p>{won(order.amount)} · {order.status === 'held' ? '전달 대기' : order.status === 'sent' ? '수령 확인 대기' : order.status === 'settled' ? '거래 완료' : '취소됨'}</p></div>{role === 'seller' && order.status === 'held' && <button className="market-outline" disabled={busy} onClick={() => void act(async () => { await request(`/orders/${encodeURIComponent(order.id)}/sent`, 'POST', {}, token); await refreshOrders(); setNotice('티켓 전달을 표시했어요.') })}>전달했어요</button>}{role === 'buyer' && order.status === 'sent' && <button className="market-outline" disabled={busy} onClick={() => void act(async () => { await request(`/orders/${encodeURIComponent(order.id)}/confirm`, 'POST', {}, token); await refreshOrders(); setNotice('시연 거래가 완료됐어요.') })}>티켓 받았어요</button>}</div>)}</section> : selected ? <section className="market-page"><button className="market-back" onClick={() => setSelected(null)}>← 공연 목록</button><h3>{selected.show.title}</h3>{selected.listings.length === 0 ? <p>등록된 시연 매물이 없어요.</p> : <div className="market-grid">{selected.listings.map(item => <div className="market-item" key={item.id}><strong>{item.seatGrade} · {item.quantity}매</strong><span>{won(item.pricePerTicket)} / 1매</span><span>{item.safety.priceText} · {item.isDemo ? '시연' : '매물'}</span><button className="market-outline" disabled={busy || !token} onClick={() => void act(async () => { await request('/orders', 'POST', { listingId: item.id }, token); await refreshOrders(); setNotice('시연 주문을 만들었어요. 내 거래에서 확인해 주세요.') })}>시연 구매하기</button></div>)}</div>}
      {token && selected.show.faceSource?.label !== 'KOPIS 안내 기반 시연 기준가' && <form className="market-form" onSubmit={register}><h3>시연 매물 등록</h3><label>회차<select value={sessionId} onChange={e => setSessionId(e.target.value)}>{selected.show.sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label>좌석 등급<select value={grade} onChange={e => setGrade(e.target.value)}>{selected.show.facePrices.map(f => <option key={f.seatGrade} value={f.seatGrade}>{f.seatGrade} · 기준 {won(f.price)}</option>)}</select></label><label>장당 가격<input type="number" min="1000" value={price} onChange={e => setPrice(e.target.value)} required /></label><label>매수<input type="number" min="1" max="4" value={quantity} onChange={e => setQuantity(e.target.value)} required /></label><label>전달 방식<select value={delivery} onChange={e => setDelivery(e.target.value)}><option value="onsite">현장 전달</option><option value="official_transfer">공식 양도</option><option value="qr_capture">QR 캡처</option><option value="courier">택배</option></select></label><label>예매 유형<select value={booking} onChange={e => setBooking(e.target.value)}><option value="unknown">모르겠어요</option><option value="general">일반 예매</option><option value="fanclub_presale">팬클럽 선예매</option></select></label><p>시연 거래 · 기준가 초과 시 등록할 수 없어요.</p><button className="market-outline" disabled={busy || !grade || !sessionId}>시연 매물 등록</button></form>}
    </section> : <section><div className="market-subhead"><h3>서버에 등록된 공연</h3><div><button className="market-text-button" disabled={busy} onClick={() => void loadShows()}>공연 새로고침</button>{' · '}<button className="market-text-button" onClick={onSafety}>판매글 안심 확인 →</button></div></div>{shows === null ? !error && <p>공연 목록을 불러오고 있어요.</p> : shows.length === 0 ? <p>등록된 공연이 없어요.</p> : <div className="market-grid">{shows.map(show => <button className="market-item" type="button" key={show.id} disabled={busy} onClick={() => void openShow(show.id)}><strong>{show.title}</strong><span>{show.venue} · {show.firstSession ?? '회차 미확인'}</span><span>매물 {show.listingCount}건</span></button>)}</div>}</section>}
  </main>
}
