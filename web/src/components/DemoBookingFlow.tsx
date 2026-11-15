import { useEffect, useRef, useState } from 'react'
import { TossTestCheckout } from './TossTestCheckout'

type BookingItem = { kind: 'primary_demo' | 'resale_demo'; title: string; date: string; seat: string; price: number; originalPrice?: number }
type Stage = 'queue' | 'seats' | 'review' | 'payment' | 'processing' | 'done'
const seats = ['A', 'B', 'C'].flatMap(row => Array.from({ length: 8 }, (_, i) => `${row}${i + 1}`))
const unavailable = new Set(['A3', 'A6', 'B3', 'B7'])
const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`

export function DemoBookingFlow({ item, quantity, posterUrl, onBack, onFinish, onComplete }: { item: BookingItem; quantity: number; posterUrl?: string | null; onBack: () => void; onFinish: () => void; onComplete: (seats: string) => void }) {
  const [stage, setStage] = useState<Stage>(item.kind === 'primary_demo' ? 'queue' : 'review')
  const [chosen, setChosen] = useState<string[]>([])
  const [method, setMethod] = useState('card')
  const completion = useRef(onComplete)
  useEffect(() => { completion.current = onComplete }, [onComplete])
  useEffect(() => {
    if (stage !== 'queue') return
    const timer = window.setTimeout(() => setStage('seats'), 2500)
    return () => window.clearTimeout(timer)
  }, [stage])
  useEffect(() => {
    if (stage !== 'processing') return
    const timer = window.setTimeout(() => {
      completion.current(item.kind === 'primary_demo' ? `${item.seat} · ${chosen.join(', ')}` : `${item.seat} · ${quantity}매`)
      setStage('done')
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [stage, item.kind, item.seat, chosen, quantity])
  const choose = (seat: string) => setChosen(current => current.includes(seat) ? current.filter(value => value !== seat) : current.length < quantity ? [...current, seat] : current)
  const back = () => {
    if (stage === 'queue' || stage === 'seats') onBack()
    else if (stage === 'review') { if (item.kind === 'primary_demo') setStage('seats'); else onBack() }
    else if (stage === 'payment') setStage('review')
    else if (stage === 'processing') setStage('payment')
    else onFinish()
  }
  const seatText = item.kind === 'primary_demo' ? `${item.seat} · ${chosen.join(', ')}` : `${item.seat} · ${quantity}매`
  return <div className="market-page booking-flow" key={stage}>
    <button type="button" className="market-back" onClick={back}>← {stage === 'review' && item.kind === 'resale_demo' ? '티켓으로' : '이전으로'}</button>
    <div className="market-detail">
      {stage === 'queue' && <section aria-labelledby="queue-title">
        <p className="market-kicker">가상 대기열 · 예매 시연</p><div className="booking-queue-mark" aria-hidden="true"><span /></div>
        <h2 id="queue-title">예매 페이지로 이동하고 있어요</h2><p className="market-lede">잠시만 기다려 주세요. 실제 대기 인원은 표시하지 않아요.</p>
        <button type="button" className="btn btn-primary market-primary" onClick={() => setStage('seats')}>대기 건너뛰기</button>
      </section>}
      {stage === 'seats' && <section aria-labelledby="seats-title">
        <p className="market-kicker">가상 좌석 · 예매 시연</p><h2 id="seats-title">어디에서 관람할까요?</h2>
        <p className="market-lede">{item.title} · {item.date}<br />가상의 {item.seat} {quantity}석을 선택해 주세요. 실제 배치와 잔여석이 아니에요.</p>
        <div className="booking-stage" aria-hidden="true">무대</div>
        <div className="booking-seat-grid" role="group" aria-label="가상 좌석 선택">
          {seats.map(seat => <button key={seat} type="button" className="booking-seat" disabled={unavailable.has(seat)} aria-pressed={chosen.includes(seat)} aria-label={`${seat} 좌석${unavailable.has(seat) ? ' · 선택 불가' : ''}`} onClick={() => choose(seat)}>{seat}</button>)}
        </div>
        <p className="booking-seat-status" aria-live="polite">선택 {chosen.length} / {quantity}석 {chosen.length ? `· ${chosen.join(', ')}` : ''}</p>
        <button type="button" className="btn btn-primary market-primary" disabled={chosen.length !== quantity} onClick={() => setStage('review')}>선택한 좌석 확인하기 →</button>
      </section>}
      {stage === 'review' && <section aria-labelledby="booking-review-title">
        <p className="market-kicker">마지막 확인 · 시연</p><h2 id="booking-review-title">구매 정보를 확인해 주세요</h2><p className="market-lede">실제 예약과 금전 이동이 없는 시연이에요.</p>
        <div className="booking-review-show">{posterUrl && <figure className="booking-review-poster"><img src={posterUrl} alt={`${item.title} 가상 공연 포스터`} width="768" height="1152" /><figcaption>가상 공연 포스터</figcaption></figure>}<div><span>공연</span><strong>{item.title}</strong></div></div><div className="market-detail-row"><span>공연일</span><strong>{item.date}</strong></div>
        <div className="market-detail-row"><span>좌석</span><strong>{seatText}</strong></div><div className="market-detail-row"><span>시연 합계 · 수수료 미포함</span><strong>{won(item.price * quantity)}</strong></div>
        <p className="market-warning">가상 좌석과 가격으로 진행하는 시연이에요. 실제 결제, 좌석 예약과 티켓 양도는 진행되지 않습니다.</p>
        <button type="button" className="btn btn-primary market-primary" onClick={() => setStage('payment')}>시연 결제 계속하기 →</button>
      </section>}
      {stage === 'payment' && (import.meta.env.VITE_TOSS_TEST === '1' ? <TossTestCheckout item={item} quantity={quantity} /> : <section aria-labelledby="payment-title">
        <p className="market-kicker">결제 수단 · 시연</p><h2 id="payment-title">결제 방법을 선택해 주세요</h2><p className="market-lede">결제 수단의 실제 정보는 입력하지 않아요.</p>
        <fieldset className="booking-methods"><legend>시연 결제 수단</legend>{[['card', '카드'], ['bank', '계좌이체']].map(([value, label]) => <label key={value} className={method === value ? 'is-selected' : undefined}><input type="radio" name="demo-payment" checked={method === value} onChange={() => setMethod(value)} />{label}</label>)}</fieldset>
        <div className="market-detail-row"><span>시연 결제 금액</span><strong>{won(item.price * quantity)}</strong></div><p className="market-warning">시연 결제예요. 실제 돈이 오가지 않으며 좌석이 예약되지 않아요.</p>
        <button type="button" className="btn btn-primary market-primary" onClick={() => setStage('processing')}>{won(item.price * quantity)} 시연 결제하기</button>
      </section>)}
      {stage === 'processing' && <section aria-labelledby="payment-processing-title" role="status" aria-live="polite">
        <p className="market-kicker">결제 처리 · 시연</p><div className="booking-queue-mark" aria-hidden="true"><span /></div>
        <h2 id="payment-processing-title">시연 결제를 처리하고 있어요</h2><p className="market-lede">선택한 {method === 'card' ? '카드' : '계좌이체'} 결제 흐름을 보여드리고 있어요.</p>
        <p className="market-warning">실제 결제 요청이나 금전 이동은 일어나지 않아요.</p>
      </section>}
      {stage === 'done' && <section aria-labelledby="booking-done-title">
        <p className="market-kicker">결제 완료 · 시연</p><div className="booking-done-mark" aria-hidden="true">✓</div><h2 id="booking-done-title">시연 결제가 완료됐어요</h2><p className="market-lede">{item.title} · {seatText}</p>
        <div className="market-detail-row"><span>시연 결제 수단</span><strong>{method === 'card' ? '카드' : '계좌이체'}</strong></div><div className="market-detail-row"><span>시연 결제 금액</span><strong>{won(item.price * quantity)}</strong></div><p className="market-warning">실제 결제·좌석 예약·티켓 발급은 이뤄지지 않았어요. 시연 내역은 체험 화면을 벗어나거나 새로고침하면 사라져요.</p>
        <button type="button" className="btn btn-primary market-primary" onClick={onFinish}>다른 티켓 둘러보기</button>
      </section>}
    </div>
  </div>
}
