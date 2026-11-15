import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import type { EventSummary } from '../contract/types'
import { formatChecked, showtimeText } from '../ui/format'
import { useCountUp, useInView } from '../ui/useCountUp'
import { scrollToSection, useScrollEffects } from '../ui/useScrollEffects'
import { DemoBadge, ErrorBox, FULLY_SYNTHETIC_TITLE, ListingQuote, type AsyncState } from './common'
import { IconGateOff, IconGavelOff, IconTicketOff } from './LimitIcons'
import { RollText } from './RollText'
import { TicketArt } from './TicketArt'
import { Phone3D } from './Phone3D'
import './steps-sequence.css'
import './compare-fix.css'

interface Props {
  events: AsyncState<EventSummary[]>
  onStart: () => void
  onRetry: () => void
  onActiveChange?: (sectionId: string) => void
}

// 스크롤 구간 안에서 요소가 나타나기 시작하는 지점(0~1)
const at = (value: number) => ({ '--at': value }) as CSSProperties
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

// 왼쪽 섹션 표시(관찰 명세 C). id 는 각 섹션과 같다.
const SECTIONS: [string, string][] = [
  ['intro', '시작'], ['market-intro', '예매·양도'], ['market-flow', '이용 흐름'], ['phone-scene', '살펴보기'], ['story-listing', '판매글'], ['story-compare', '공식 대조'], ['story-steps', '사용 방법'],
  ['preview', '결과 미리보기'], ['limits', '판단하지 않는 것'], ['final', '체험하기'],
]

function useActiveSection(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState('intro')
  useEffect(() => {
    const root = ref.current
    if (!root) return
    let frame = 0
    const update = () => {
      frame = 0
      const header = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      const anchor = header + (window.innerHeight - header) / 2
      const section = SECTIONS.find(([id]) => {
        const rect = root.querySelector(`#${id}`)?.getBoundingClientRect()
        return rect && rect.top <= anchor && rect.bottom > anchor
      })
      if (!section) return
      let next = section[0]
      // 휴대폰이 화면 대부분을 차지하는 동안 '문제'가 먼저 활성화되지 않게 한다.
      // 실제 설명이 절반 이상 보이기 시작하면 메뉴도 함께 바뀐다.
      if (next === 'story-listing' && root.classList.contains('fx') && !window.matchMedia('(max-height: 600px)').matches) {
        const phoneBottom = root.querySelector('.l-phone-scene')?.getBoundingClientRect().bottom ?? -Infinity
        if (phoneBottom > header + window.innerHeight * 0.11) next = 'phone-scene'
      }
      setActive(next)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [ref])
  return active
}

function ExampleTag({ children = '가상 공연 예시' }: { children?: ReactNode }) {
  return <span className="example-tag">{children}</span>
}

// 서비스 소개: 예매·양도 시연 → 이용 흐름 → 부가 안심 확인 → 체험.
// 효과는 장식이다: 모든 문구는 처음부터 DOM 에 있고, 모션 축소에서는 전부 정지·표시된다.
// 예시 판매글·공식 문구·결과는 웹 시연 fixture(가상 공연)와 같은 값이며 실제 사례가 아니다.
export function Landing({ events, onStart, onRetry, onActiveChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollEffects(ref)
  const active = useActiveSection(ref)
  useEffect(() => onActiveChange?.(active), [active, onActiveChange])
  // 결과 미리보기 예시 금액: 가상 공연 예시 값이라 장식용 카운트업(WEB-012). 실제 대조 결과 화면에는 쓰지 않음
  const previewRef = useRef<HTMLDivElement>(null)
  const previewSeen = useInView(previewRef)
  const previewDiff = useCountUp(76000, { enabled: previewSeen, delayMs: 350, durationMs: 1100 })
  const first = events.status === 'success' ? events.data[0] : undefined
  const others = events.status === 'success' ? events.data.length - 1 : 0

  return (
    <div className="landing" ref={ref}>
      <div className="read-progress" aria-hidden="true" />
      <nav className="l-dots" aria-label="소개 구간">
        {SECTIONS.map(([id, label]) => (
          <button key={id} type="button" className={id === active ? 'is-active' : ''} aria-label={`${label}(으)로 이동`} aria-current={id === active ? 'true' : undefined}
            onClick={() => scrollToSection(id)}>
            <span className="l-dot-label" aria-hidden="true">{label}</span>
          </button>
        ))}
      </nav>

      {/* 1. 질문으로 시작 */}
      {/* 전면 무대가 스크롤에 따라 둥근 카드로 줄어든다(관찰 명세 B) */}
      <section id="intro" className="l-hero-stage" data-scrub data-nav-at="0" aria-labelledby="hero-title">
        <div className="l-hero-sticky">
          <div className="l-stage-panel" aria-hidden="true"><div className="l-glow" /></div>
          <div className="l-hero">
            <p className="l-eyebrow" data-reveal>예매부터 양도까지</p>
            <h2 id="hero-title" className="l-hero-title">
              <span className="line" data-reveal style={delay(80)}>좋아하는 공연을,</span>
              <span className="line" data-reveal style={delay(220)}>구매가 이하로 만나는 방법</span>
            </h2>
            <p className="l-hero-sub" data-reveal style={delay(380)}>
              예매와 원구매가 이하 양도를 한곳에서 살펴보고, 구매 전 확인할 점도 함께 알아봐요. 현재 화면은 가상 티켓 시연이에요.
            </p>
            <div className="l-hero-art" data-reveal style={delay(420)} aria-hidden="true">
              <TicketArt className="l-ticket" />
            </div>
            <div className="l-float-card" data-reveal style={delay(520)} aria-hidden="true">
              <ExampleTag>티켓 예시 · 가상</ExampleTag>
              <p>공연을 고르고, 티켓 조건을 살펴보세요.<br />예매와 양도는 가상 데이터로 시연해요.</p>
            </div>
            <button type="button" className="l-scroll-cue" data-reveal style={delay(700)} onClick={() => scrollToSection('market-intro')}>
              스크롤해서 알아보기
              <span className="chevron" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section id="market-intro" className="l-section l-market-story l-market-scene" data-market-progress="intro" data-market-scene aria-labelledby="market-intro-title">
        <div className="l-market-stage"><div className="l-market-content">
        <p className="l-kicker">하나의 플랫폼에서</p>
        <h2 id="market-intro-title" className="l-title">예매부터 양도까지,{' '}<br />티켓을 살펴보는 새로운 방법</h2>
        <p className="l-market-lede"><span className="l-market-mark">공연을 찾아 예매 흐름을 경험하고, 다른 팬의 양도 매물도 함께 확인해요.</span></p>
        <div className="l-market-options">
          <article className="l-market-option" data-market-progress="card">
            <span className="l-market-number">01</span><p className="l-market-option-label">가상 공연 · 시연용 좌석</p>
            <h3>공식 예매 흐름</h3>
            <p>시연 공연의 회차와 좌석, 수량을 살펴보고 구매 정보 확인 단계까지 경험해요.</p>
          </article>
          <article className="l-market-option" data-market-progress="card">
            <span className="l-market-number">02</span><p className="l-market-option-label">가상 매물 · 원구매가 정책</p>
            <h3>원구매가 이하 양도</h3>
            <p>판매자가 적은 원구매가 이하의 양도 매물을 등록하고 살펴볼 수 있어요.</p>
          </article>
        </div>
        <p className="l-market-note">예매·매물·좌석은 가상이에요. 공식 판매 권한과 실제 재고는 연결되지 않았어요.</p>
        </div></div>
      </section>

      <section id="market-flow" className="l-section l-market-story l-market-scene" data-market-progress="intro" data-market-scene aria-labelledby="market-flow-title">
        <div className="l-market-stage"><div className="l-market-content">
        <p className="l-kicker">이렇게 둘러봐요</p>
        <h2 id="market-flow-title" className="l-title">원하는 티켓을 고르고,{' '}<br />구매 정보를 확인해요</h2>
        <ol className="l-market-flow" data-market-progress="steps">
          <li data-market-progress="step"><span>01</span><div><strong>공연과 티켓을 찾아요</strong><p><span className="l-market-mark">가상 공식 예매와 양도 매물을 구분해 살펴봐요.</span></p></div></li>
          <li data-market-progress="step"><span>02</span><div><strong>회차·좌석·수량을 확인해요</strong><p><span className="l-market-mark">선택한 조건과 수수료를 제외한 시연 합계를 확인해요.</span></p></div></li>
          <li data-market-progress="step"><span>03</span><div><strong>결제 직전까지 살펴봐요</strong><p><span className="l-market-mark">시연은 구매 정보 확인에서 끝나요. 실제 결제·예약·티켓 이전은 진행되지 않아요.</span></p></div></li>
        </ol>
        <div className="l-market-seller" data-market-progress="seller">
          <div><strong>판매자라면 양도 매물도 등록해요</strong><p><span className="l-market-mark">시연에서는 양도가가 기재한 원구매가 이하여야 등록돼요.</span> 구매가의 진위와 티켓 보유 여부는 검증하지 않아요.</p></div>
          <button type="button" className="btn btn-primary" onClick={onStart}>예매·양도 시연하기</button>
        </div>
        <p className="l-market-note">시연 매물은 현재 브라우저에서만 유지되고 새로고침하면 초기화돼요.</p>
        </div></div>
      </section>

      {/* 스크롤에 맞춰 휴대전화가 가까워지는 독자적인 일러스트. 실제 화면 캡처가 아닌 가상 예시다. */}
      <section id="phone-scene" className="l-phone-scene" data-scrub data-nav-at="0" aria-labelledby="phone-scene-title">
        <div className="l-phone-sticky">
          <div className="l-phone-copy">
            <p className="l-kicker">부가 기능 · 구매 전 안심 확인</p>
            <h2 id="phone-scene-title" className="sr-only">판매글과 공식 안내를 대조하는 세 단계</h2>
            <div className="l-phone-copy-slides" aria-hidden="true">
              <div className="phone-frame frame-one"><h3>판매글에서<br />시작해요</h3><p>관심 있는 티켓의 조건을 살펴봐요.</p></div>
              <div className="phone-frame frame-two"><h3>공식 안내를<br />함께 확인해요</h3><p>공연별 입장 조건을 한눈에 봐요.</p></div>
              <div className="phone-frame frame-three"><h3>구매 전 확인할 점을<br />놓치지 않게</h3><p>차이와 확인이 필요한 이유를 보여드려요.</p></div>
            </div>
            <p className="l-phone-summary">부가 안심 확인 · 가상 예시 · 판매글 → 공식 안내 대조 → 확인할 점</p>
          </div>
          <div className="l-phone-perspective" aria-hidden="true">
            <Phone3D />
            <div className="l-phone-device">
              <div className="l-phone-camera" /><i className="l-phone-side side-one" /><i className="l-phone-side side-two" />
              <div className="l-phone-screen">
                <div className="phone-status"><span>9:41</span><span>● ▰</span></div>
                <div className="phone-ui-frame phone-frame frame-one"><span className="l-phone-tag">가상 판매글 예시</span><span className="l-phone-title">레이더 라이브<br />VIP석 1장</span><span className="l-phone-price">230,000원</span><span className="l-phone-description">입금 먼저 해주시면<br />QR 캡처 보내드려요</span><span className="l-phone-button">공식 안내와 비교</span></div>
                <div className="phone-ui-frame phone-frame frame-two"><span className="l-phone-tag">가상 공식 안내</span><span className="l-phone-title">입장 조건<br />살펴보기</span><span className="l-phone-description phone-notice">모바일 티켓은 예매자 본인의 예매처 앱에서 표시해요.</span><span className="l-phone-description">캡처 화면으로는 입장할 수 없어요.</span><span className="l-phone-button">판매글과 대조 중</span></div>
                <div className="phone-ui-frame phone-frame frame-three"><span className="l-phone-tag">가상 대조 결과</span><span className="l-phone-title">구매 전<br />확인할 점</span><span className="l-phone-price">+76,000원</span><span className="l-phone-description">공식 가격 대비 차이<br />캡처 전달 방식 확인 필요</span><span className="l-phone-button">근거 살펴보기</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 판매글의 문구가 하나씩 눈에 들어온다 (스크롤 연동) */}
      <section id="story-listing" className="l-story" data-scrub aria-labelledby="story-listing-title">
        <div className="l-sticky">
          <p className="l-kicker">판매글 속 단서</p>
          <h2 id="story-listing-title" className="l-title scrub-zoom">판매글은 보통 이렇게 생겼어요</h2>
          <div className="l-listing">
            <ExampleTag />
            <p data-source="listing">
              레이더 라이브 11/21(토) 저녁 공연 VIP석 1장 양도합니다.{' '}
              <mark className="scrub-mark" style={at(0.12)}>230,000원</mark>이고{' '}
              <mark className="scrub-mark" style={at(0.32)}>입금 먼저 해주시면</mark>{' '}
              <mark className="scrub-mark" style={at(0.52)}>QR 캡처 바로 보내드려요.</mark>{' '}
              <mark className="scrub-mark" style={at(0.72)}>캡처로 입장 가능합니다.</mark>
            </p>
          </div>
          <ul className="l-notes">
            <li className="scrub-in" style={at(0.14)}>정가보다 얼마나 비쌀까?</li>
            <li className="scrub-in" style={at(0.34)}>돈부터 보내도 괜찮을까?</li>
            <li className="scrub-in" style={at(0.54)}>캡처 화면으로 정말 들어갈 수 있을까?</li>
          </ul>
          {/* 단어가 하나씩 쌓인다(관찰 명세 G) */}
          <p className="l-question">
            <span className="scrub-word" style={at(0.62)}>이 말들,</span>{' '}
            <span className="scrub-word" style={at(0.68)}>어디까지</span>{' '}
            <span className="scrub-word" style={at(0.74)}>믿어도</span>{' '}
            <span className="scrub-word" style={at(0.8)}>될까요?</span>
          </p>
        </div>
      </section>

      {/* 3. 공식 안내를 옆에 놓으면 차이가 드러난다 */}
      <section id="story-compare" className="l-story" data-scrub aria-labelledby="story-compare-title">
        <div className="l-sticky">
          <p className="l-kicker">공식 안내와 나란히</p>
          <h2 id="story-compare-title" className="l-title scrub-zoom">공식 안내를 옆에 놓아 보면</h2>
          <div className="l-pair">
            <div className="l-side l-side-listing scrub-in" style={at(0.05)}>
              <span className="l-side-label">판매글</span>
              <ListingQuote>캡처로 입장 가능합니다.</ListingQuote>
            </div>
            <div className="l-link" aria-hidden="true"><span className="l-link-line" /></div>
            <div className="l-side l-side-official scrub-in" style={at(0.3)}>
              <svg className="l-side-trace" viewBox="0 0 1000 250" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M 2 125 L 2 26 Q 2 2 26 2 L 974 2 Q 998 2 998 26 L 998 125" pathLength="100" />
                <path d="M 2 125 L 2 224 Q 2 248 26 248 L 974 248 Q 998 248 998 224 L 998 125" pathLength="100" />
              </svg>
              <span className="l-side-label">공식 안내</span>
              <blockquote>모바일 티켓은 예매자 본인 휴대폰의 예매처 앱에서만 표시되며, 캡처 화면으로는 입장할 수 없습니다.</blockquote>
            </div>
          </div>
          <p className="l-verdict scrub-pop" style={at(0.45)}>
            <span className="chip chip-conflict">공식 안내와 다른 설명</span>
          </p>
          <div className="l-pair l-pair-price">
            <div className="l-side scrub-in" style={at(0.55)}>
              <span className="l-side-label">판매가</span>
              <strong className="l-num">230,000원</strong>
            </div>
            <div className="l-link" aria-hidden="true"><span className="l-link-line l-link-line-2" /></div>
            <div className="l-side l-side-price-official scrub-in" style={at(0.68)}>
              <svg className="l-side-trace l-side-trace-price" viewBox="0 0 1000 250" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M 2 125 L 2 26 Q 2 2 26 2 L 974 2 Q 998 2 998 26 L 998 125" pathLength="100" />
                <path d="M 2 125 L 2 224 Q 2 248 26 248 L 974 248 Q 998 248 998 224 L 998 125" pathLength="100" />
              </svg>
              <span className="l-side-label">공식 VIP석 기본가</span>
              <strong className="l-num">154,000원</strong>
            </div>
          </div>
          <p className="l-verdict scrub-pop" style={at(0.8)}>
            같은 공연·회차·좌석일 때 <strong><span className="l-price-highlight scrub-mark" style={at(0.84)}>+76,000원</span></strong> 차이
          </p>
          <p className="small muted scrub-in" style={at(0.8)}>가상 공연 예시입니다. 가격 차이만으로 불법 여부를 판단하지 않아요.</p>
        </div>
      </section>

      {/* 4. 사용 방법: 진행선이 채워지며 단계가 켜진다 */}
      <section id="story-steps" className="l-story l-story-short" data-scrub data-nav-at="0.92" aria-labelledby="story-steps-title">
        <div className="l-sticky">
          <p className="l-kicker">이렇게 확인해요</p>
          <h2 id="story-steps-title" className="l-title scrub-zoom">세 단계면 충분해요</h2>
          <ol className="l-steps">
            <li className="l-step l-step-first" style={at(0.1)}>
              <span className="l-step-num">1</span>
              <div><strong>판매글을 붙여넣어요</strong><p><span className="l-step-highlight">가격·좌석·회차·전달 방식 후보를 찾아 보여드려요. 직접 입력할 수도 있어요.</span></p></div>
            </li>
            <li className="l-step" style={at(0.4)}>
              <span className="l-step-num">2</span>
              <div><strong>읽은 값을 확인하고 고쳐요</strong><p><span className="l-step-highlight l-step-highlight-2">후보는 후보일 뿐. 판매글 근거 문구를 보고 직접 확정해요.</span></p></div>
            </li>
            <li className="l-step" style={at(0.7)}>
              <span className="l-step-num">3</span>
              <div><strong>공식 자료와 대조해요</strong><p><span className="l-step-highlight l-step-highlight-3">같은 공연·회차·좌석·조건일 때만 가격을 비교하고, 다르면 비교를 멈춰요.</span></p></div>
            </li>
          </ol>
        </div>
      </section>

      {/* 5. 결과 미리보기 */}
      <section id="preview" className="l-section" aria-labelledby="preview-title">
        <p className="l-kicker" data-reveal>결과 미리보기</p>
        <h2 id="preview-title" className="l-title" data-reveal>근거와 함께 보여드려요</h2>
        <div className="l-preview" data-reveal ref={previewRef}>
          <div className="l-preview-head">
            <ExampleTag>예시 결과 · 가상 공연</ExampleTag>
            <span className="small muted">공식 가격 대비</span>
            <strong className="l-preview-num" aria-label="+76,000원">
              <span aria-hidden="true">+{previewDiff.toLocaleString('ko-KR')}원</span>
            </strong>
          </div>
          <ul className="l-preview-list">
            <li style={delay(120)}><span className="chip chip-conflict">공식 안내와 다른 설명</span> 전달 방식이 공식 입장 안내와 다름</li>
            <li style={delay(240)}><span className="chip chip-conflict">공식 안내와 다른 설명</span> 양도 제한 안내와 다른 판매 방식</li>
            <li style={delay(360)}><span className="chip chip-needs_check">추가 확인 필요</span> 입금을 먼저 요구하는 문구</li>
          </ul>
          <p className="small muted">각 항목에 판매글 문구·공식 문구·출처 링크·확인일이 함께 붙어요.</p>
        </div>
      </section>

      {/* 6. 하지 않는 것 — 신뢰 */}
      <section id="limits" className="l-section" aria-labelledby="limits-title">
        <p className="l-kicker" data-reveal>대신, 이건 판단하지 않아요</p>
        <h2 id="limits-title" className="l-title" data-reveal>결정은 당신이, 근거는 저희가</h2>
        <div className="l-limits">
          <div className="l-limit" data-reveal style={delay(0)}><IconTicketOff /><strong>티켓 진위</strong><p>진짜 티켓인지 인증하지 않아요.</p></div>
          <div className="l-limit" data-reveal style={delay(160)}><IconGateOff /><strong>입장 가능 여부</strong><p>현장 입장을 보증하지 않아요.</p></div>
          <div className="l-limit" data-reveal style={delay(320)}><IconGavelOff /><strong>사기·불법 판정</strong><p>판매자나 거래를 판정하지 않아요.</p></div>
        </div>
        <p className="l-limits-note" data-reveal style={delay(450)}>
          <span className="sweep">공식 안내와 어긋나는 지점을 찾아, 구매 전 예매처에 확인할 수 있게 도와드려요.</span>
        </p>
      </section>

      {/* 7. 체험으로 */}
      <section id="final" className="l-final" aria-labelledby="final-title">
        {/* 두 덩어리가 좌우에서 모여 한 줄이 된다(관찰 명세 F의 반대 방향) */}
        <h2 id="final-title" className="l-final-title" data-reveal>
          <span className="gather-l">직접</span> <span className="gather-r">확인해 볼까요?</span>
        </h2>
        <div className="l-show" data-reveal aria-live="polite">
          <p className="soft-card-label">안심 확인 기능에서 볼 수 있는 시연 공연</p>
          {events.status === 'loading' && (
            <div className="skeleton-stack" role="status" aria-label="공연 목록을 불러오는 중">
              <span className="skeleton skeleton-line w60" />
              <span className="skeleton skeleton-line w40" />
            </div>
          )}
          {events.status === 'error' && <ErrorBox title="공연 목록을 불러오지 못했습니다" error={events.error} onRetry={onRetry} />}
          {events.status === 'success' && !first && <p className="muted">지금 확인할 수 있는 공연이 없어요.</p>}
          {first && (
            <>
              <DemoBadge isDemo={first.isDemo} title={first.isDemo ? FULLY_SYNTHETIC_TITLE : undefined} />
              <p className="show-title">{first.title}</p>
              <p className="small muted">
                {first.showtimes[0] ? showtimeText(first.showtimes[0]) : '회차 정보 없음'}
                {first.showtimes.length > 1 && ` 외 ${first.showtimes.length - 1}회`} · {first.venue ?? '공연장 정보 없음'}
              </p>
              <p className="small muted">공식 자료 확인: {formatChecked(first.sourceCheckedAt)}</p>
              {others > 0 && <p className="small muted">외 {others}개 공연은 다음 단계에서 고를 수 있어요.</p>}
            </>
          )}
        </div>
        <button type="button" className="btn btn-primary btn-cta btn-flow" onClick={onStart} data-reveal aria-label="서비스 체험하러 가기">
          <RollText text="서비스 체험하러 가기" hoverText="가시죠!" arrow />
        </button>
        <p className="small muted" data-reveal>티켓 진위·입장 가능 여부를 보증하지 않아요.</p>
      </section>
    </div>
  )
}
