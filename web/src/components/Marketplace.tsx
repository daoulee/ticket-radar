import { useMemo, useState, type FormEvent } from 'react'
import { DemoResaleRegistrationSchema } from '@ticket-radar/shared/marketplace'
import { DemoBookingFlow } from './DemoBookingFlow'
import { MoneyInput } from './MoneyInput'
import './marketplace.css'

type Kind = 'primary_demo' | 'resale_demo'
type Listing = { id: string; kind: Kind; title: string; venue: string; date: string; seat: string; quantity: number; price: number; originalPrice: number }
type View = 'browse' | 'detail' | 'register' | 'booking'
const initial: Listing[] = [
  { id: 'primary-1', kind: 'primary_demo', title: '레이더 라이브 2026', venue: '가상 아레나', date: '2026.11.21 19:00', seat: 'VIP석', quantity: 12, price: 154000, originalPrice: 154000 },
  { id: 'primary-2', kind: 'primary_demo', title: '뮤지컬 나침반', venue: '가상 극장', date: '2026.12.05 14:00', seat: 'R석', quantity: 8, price: 110000, originalPrice: 110000 },
  { id: 'resale-1', kind: 'resale_demo', title: '레이더 라이브 2026', venue: '가상 아레나', date: '2026.11.21 19:00', seat: 'R석', quantity: 1, price: 132000, originalPrice: 132000 },
  { id: 'resale-2', kind: 'resale_demo', title: '뮤지컬 나침반', venue: '가상 극장', date: '2026.12.05 14:00', seat: 'S석', quantity: 1, price: 88000, originalPrice: 88000 },
]
const registrationEvents = [
  { id: 'demo-market-live', title: '레이더 라이브 2026', venue: '가상 아레나', showtimes: [{ id: 'demo-market-live-s1', label: '2026.11.21 19:00', seats: ['VIP', 'R'] }] },
  { id: 'demo-market-compass', title: '뮤지컬 나침반', venue: '가상 극장', showtimes: [{ id: 'demo-market-compass-s1', label: '2026.12.05 14:00', seats: ['R', 'S'] }] },
] as const
const money = (n: number) => `${n.toLocaleString('ko-KR')}원`
// 시연 공연의 좌석별 기준가(1매). 양도가가 이보다 높으면 등록하지 않는다.
const FACE_VALUE: Record<string, Record<string, number>> = {
  'demo-market-live-s1': { VIP: 154000, R: 132000 },
  'demo-market-compass-s1': { R: 110000, S: 88000 },
}

export function Marketplace({ onSafety, onPerformances, onShared }: { onSafety: () => void; onPerformances: () => void; onShared?: () => void }) {
  const [view, setView] = useState<View>('browse')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [navigated, setNavigated] = useState(false)
  const navigate = (next: View, backwards = false) => {
    setDirection(backwards ? 'back' : 'forward')
    setNavigated(true)
    setView(next)
  }
  const [items, setItems] = useState<Listing[]>(initial)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [registrationEvent, setRegistrationEvent] = useState<string>(registrationEvents[0].id)
  const [showtime, setShowtime] = useState<string>(registrationEvents[0].showtimes[0].id)
  const [seat, setSeat] = useState<string>(registrationEvents[0].showtimes[0].seats[0])
  const [original, setOriginal] = useState('')
  const [price, setPrice] = useState('')
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [receipt, setReceipt] = useState<{ title: string; seats: string; amount: number } | null>(null)
  const matches = useMemo(() => items.filter(item => (filter === 'all' || item.kind === filter) && item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [items, filter, query])
  const currentEvent = registrationEvents.find(item => item.id === registrationEvent)
  const currentShowtime = currentEvent?.showtimes.find(item => item.id === showtime)
  const open = (item: Listing) => { setSelected(item); setPurchaseQuantity(1); navigate('detail'); window.scrollTo({ top: 0 }) }
  const back = () => { navigate('browse', true); setError(''); window.scrollTo({ top: 0 }) }
  function register(e: FormEvent) {
    e.preventDefault()
    if (!currentEvent || !currentShowtime || !currentShowtime.seats.some(grade => grade === seat)) { setError('선택한 공연의 유효한 회차와 좌석을 선택해 주세요.'); return }
    const registration = DemoResaleRegistrationSchema.safeParse({ eventId: currentEvent.id, showtimeId: currentShowtime.id, seatGrade: seat, originalUnitPrice: Number(original), listingUnitPrice: Number(price), simulatedQuantityAvailable: 1, deliveryMethod: 'not_specified', isSynthetic: true })
    if (!registration.success) { setError(registration.error.issues.some(issue => issue.path.includes('listingUnitPrice')) && Number(original) > 0 && Number(price) > Number(original) ? '양도가는 입력한 원 구매가 이하여야 해요.' : '구매가와 양도가, 매수를 올바르게 입력해 주세요.'); return }
    const data = registration.data
    const cap = FACE_VALUE[currentShowtime.id]?.[data.seatGrade]
    if (!cap) { setError('이 좌석의 공식 가격을 확인할 수 없어 등록할 수 없어요.'); return }
    if (data.listingUnitPrice > cap) { setError(`양도가는 이 좌석의 시연 기준가 ${money(cap)} 이하여야 해요.`); return }
    const item: Listing = { id: `local-${Date.now()}`, kind: 'resale_demo', title: currentEvent.title, venue: currentEvent.venue, date: currentShowtime.label, seat: `${data.seatGrade}석`, quantity: data.simulatedQuantityAvailable, price: data.listingUnitPrice, originalPrice: data.originalUnitPrice }
    setItems(prev => [item, ...prev]); setFilter('all'); setQuery(''); setSelected(item); setPurchaseQuantity(1); setError(''); navigate('detail'); window.scrollTo({ top: 0 })
  }
  const badge = (item: Listing) => item.kind === 'primary_demo' ? '공식 예매 시연' : '원구매가 이하 양도 시연'
  const poster = (item: Listing) => item.title === '레이더 라이브 2026' ? '/images/demo/radar-live-poster.webp' : item.title === '뮤지컬 나침반' ? '/images/demo/compass-poster.webp' : null
  return <main className="market" aria-label="티켓 예매와 양도 시연">
    <div className="market-demo" role="note"><strong>시연용 가상 데이터</strong><span>매물과 좌석은 실제가 아니며 결제·예약·양도는 실행되지 않아요.</span></div>
    <div key={view} className={navigated ? `market-view market-view--${direction}` : undefined}>
    {view === 'browse' && <>
      <div className="market-heading"><div><p className="market-kicker">TICKET RADAR</p><h2>좋아하는 순간을<br />구매가 이하로 만나요</h2><p>예매부터 원구매가 이하 양도까지, 티켓 정보를 한곳에서 살펴봐요.</p></div><button className="market-outline" onClick={() => navigate('register')}>양도 등록하기 <span aria-hidden="true">↗</span></button></div>
      {onShared && <div className="market-extra"><div><strong>앱과 함께 거래하기</strong><p>같은 계정으로 시연 거래를 확인해요.</p></div><button className="market-outline" onClick={onShared}>공통 거래 열기 →</button></div>}
      <p className="market-warning">양도 시연 매물은 한 건당 1매이며, 양도가는 입력한 원 구매가 이하여야 해요. 이 시연은 한 사람의 중복 등록이나 실제 구매가를 검증하지 않아요.</p>
      <div className="market-toolbar"><div className="market-tabs" aria-label="티켓 유형">
        {([['all','전체'],['primary_demo','공식 예매 시연'],['resale_demo','원구매가 이하 양도 시연']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}
      </div><label className="market-search"><span className="sr-only">시연 공연 검색</span><input type="search" placeholder="시연 공연 검색" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      {receipt && <div className="market-extra" role="status"><div><strong>내 시연 예매 · {receipt.title}</strong><p>{receipt.seats} · {money(receipt.amount)} · 이 브라우저에서만 보여요.</p></div></div>}
      <div className="market-subhead"><div><h3>지금 살펴볼 티켓</h3><p>실제 판매가 아닌 가상 공연과 매물이에요.</p></div><span>{matches.length}건</span></div>
      {matches.length === 0 ? <p className="market-empty">검색 결과가 없어요. 다른 공연명을 입력해 보세요.</p> : <div className="market-grid">{matches.map(item => <button key={item.id} type="button" className="market-item" onClick={() => open(item)}>
        <span className="market-item-top"><span className="market-pill">{badge(item)}</span><span className="market-arrow" aria-hidden="true">↗</span></span>
        <strong>{item.title}</strong><span className="market-item-meta">{item.venue} · {item.date}</span><span className="market-item-seat">{item.seat} · {item.quantity}매</span>
        <span className="market-price">{money(item.price)} <small>/ 1매</small></span><span className="market-item-note">가상 티켓 · 구매 불가</span>
      </button>)}</div>}
      <div className="market-extra"><div><strong>실제 공연 정보를 찾고 있나요?</strong><p>KOPIS 공연 목록을 확인할 수 있어요. 실제 판매 재고는 연결되지 않았어요.</p></div><button className="market-text-button" onClick={onPerformances}>실제 공연 찾아보기 →</button></div>
      <div className="market-extra market-extra-safety"><div><strong>판매글이 마음에 걸리나요?</strong><p>판매글과 공식 안내를 비교하는 기존 기능을 사용할 수 있어요.</p></div><button className="market-text-button" onClick={onSafety}>판매글 안심 확인 →</button></div>
      <p className="market-footnote">이 화면의 매물은 이 브라우저에서만 유지되며 새로고침하면 초기화돼요.</p>
    </>}
    {view === 'detail' && selected && <div className="market-page"><button className="market-back" onClick={back}>← 목록으로</button><div className="market-detail"><div className="market-show-head">{poster(selected) && <figure className="market-poster"><img src={poster(selected)!} alt={`${selected.title} 가상 공연 포스터`} width="768" height="1152" /><figcaption>가상 공연 포스터</figcaption></figure>}<div><p className="market-kicker">{badge(selected)} · 가상 데이터</p><h2>{selected.title}</h2><p className="market-lede">{selected.venue} · {selected.date}</p></div></div><div className="market-detail-row"><span>좌석</span><strong>{selected.seat}</strong></div><div className="market-detail-row"><span>시연 수량</span><strong>{selected.quantity}매</strong></div>{selected.kind === 'resale_demo' && <div className="market-detail-row"><span>기재한 원 구매가</span><strong>{money(selected.originalPrice)} / 1매</strong></div>}<div className="market-detail-row"><span>{selected.kind === 'resale_demo' ? '시연 양도가' : '시연 티켓 가격'}</span><strong>{money(selected.price)} / 1매</strong></div><label className="market-quantity">시연 구매 수량<select value={purchaseQuantity} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= selected.quantity) setPurchaseQuantity(n) }}>{Array.from({length: selected.quantity}, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}매</option>)}</select></label><div className="market-detail-row"><span>시연 합계 · 수수료 미포함</span><strong>{money(selected.price * purchaseQuantity)}</strong></div><p className="market-warning">가상 공연과 티켓으로 보여주는 시연이에요.<br />티켓 보유 여부와 구매가의 진위, 양도 가능 여부는 확인하지 않았어요.</p><button className="btn btn-primary market-primary" onClick={() => navigate('booking')}>구매 정보 확인하기 →</button><button className="market-text-button market-inline" onClick={onSafety}>판매글 안심 확인 살펴보기</button></div></div>}
    {view === 'booking' && selected && <DemoBookingFlow item={selected} quantity={purchaseQuantity} posterUrl={poster(selected)} onBack={() => navigate('detail', true)} onFinish={back} onComplete={(seats) => setReceipt({ title: selected.title, seats, amount: selected.price * purchaseQuantity })} />}
    {view === 'register' && <div className="market-page"><button className="market-back" onClick={back}>← 목록으로</button><div className="market-detail"><p className="market-kicker">원구매가 이하 양도 · 시연</p><h2>양도할 티켓을 등록해요</h2><p className="market-lede">아래 정보는 가상 매물로 이 브라우저에서만 보여요.</p><form className="market-form" onSubmit={register}>
      <label>가상 공연<select value={registrationEvent} onChange={e => { const next = registrationEvents.find(item => item.id === e.target.value); if (!next) return; setRegistrationEvent(next.id); setShowtime(next.showtimes[0].id); setSeat(next.showtimes[0].seats[0]); setError('') }}>{registrationEvents.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>가상 회차<select value={showtime} onChange={e => { const next = currentEvent?.showtimes.find(item => item.id === e.target.value); if (!next) return; setShowtime(next.id); setSeat(next.seats[0]); setError('') }}>{currentEvent?.showtimes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>가상 좌석<select value={seat} onChange={e => setSeat(e.target.value)}>{currentShowtime?.seats.map(grade => <option key={grade} value={grade}>{grade}석</option>)}</select></label>
      <div className="market-form-pair"><label>원 구매가 (1매)<MoneyInput minAmount={1} maxAmount={100000000} value={original} onValueChange={setOriginal} placeholder="원" required /></label><label>양도가 (1매)<MoneyInput minAmount={1} maxAmount={100000000} value={price} onValueChange={setPrice} placeholder="원" required /></label></div>
      <p className="market-form-help">양도 매수: 1매 · 한 사람의 중복 등록은 시연에서 확인하지 않아요.</p>
      <p className="market-form-help">양도가는 원 구매가와 시연 기준가{FACE_VALUE[showtime]?.[seat] ? `(${money(FACE_VALUE[showtime][seat])})` : ''} 이하여야 해요. 입력값은 실제 구매 증빙으로 확인하지 않습니다.</p>{error && <p role="alert" className="market-form-error">{error}</p>}
      <button type="submit" className="btn btn-primary market-primary">시연 매물 등록하기</button></form></div></div>}
    </div>
  </main>
}
