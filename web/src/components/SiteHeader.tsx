import { useEffect, useRef, useState } from 'react'
import { RollText } from './RollText'

// 헤더 메뉴: 소개 화면의 구간으로 이동한다(체험 중이면 소개로 돌아가 해당 구간으로).
export const NAV_ITEMS: [string, string][] = [
  ['market-intro', '예매·양도'],
  ['market-flow', '이용 흐름'],
  ['phone-scene', '살펴보기'],
  ['story-listing', '문제'],
  ['story-compare', '대조 방식'],
  ['story-steps', '사용 방법'],
  ['preview', '결과 예시'],
  ['limits', '원칙'],
]

interface Props {
  onHome: boolean
  scrolled: boolean
  activeSection: string | null
  apiMode: 'demo' | 'http'
  realPerformance?: boolean
  apiLabel: string
  onNavigate: (sectionId: string) => void
  onBrand: () => void
  onStart: () => void
  onIntro: () => void
}

export function SiteHeader({ onHome, scrolled, activeSection, apiMode, realPerformance, onNavigate, onBrand, onStart, onIntro }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 펼침 메뉴: Esc·바깥 누르기로 닫는다
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [open])

  const go = (id: string) => { setOpen(false); onNavigate(id) }
  const modeLabel = realPerformance ? '공연 정보: KOPIS · 분석 기능 준비 중' : apiMode === 'demo' ? '시연 모드 · 합성 데이터' : '서버 연결 · 결과별 시연 표시'

  const links = (
    <ul className="nav-links">
      {NAV_ITEMS.map(([id, label]) => (
        <li key={id}>
          <button type="button" className={onHome && activeSection === id ? 'is-active' : ''} aria-current={onHome && activeSection === id ? 'true' : undefined} onClick={() => go(id)}>
            {label}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="topbar-inner" ref={menuRef}>
        <h1 className="brand">
          <button type="button" onClick={onBrand} title="처음 화면으로">
            <img className="brand-wordmark" src="/ticket-radar-wordmark.png" alt="티켓레이더" />
          </button>
        </h1>

        <nav className="site-nav" aria-label="서비스 소개 메뉴">{links}</nav>

        {onHome ? (
          // key 를 달리해 버튼을 새로 그린다(파란 버튼 → 회색 버튼으로 색이 전환되는 중간 상태 방지)
          <button key="to-app" type="button" className="btn btn-primary btn-sm" aria-label="바로 체험하기" onClick={onStart}>
            <RollText text="바로 체험하기" hoverText="Let’s Go!" />
          </button>
        ) : (
          <button key="to-intro" type="button" className="btn btn-secondary btn-sm" aria-label="서비스 소개" onClick={onIntro}>
            <RollText text="서비스 소개" />
          </button>
        )}

        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen((v) => !v)}>
          <span aria-hidden="true" />
        </button>
        <div id="mobile-menu" className="mobile-menu" hidden={!open}>
          <nav aria-label="서비스 소개 메뉴(모바일)">{links}</nav>
          <p className="small muted">{modeLabel}</p>
        </div>
      </div>
    </header>
  )
}
