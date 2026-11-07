import { useEffect, useState, type RefObject } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

// 소개 화면 스크롤 효과.
// - [data-reveal]: 화면에 들어오면 .is-in 을 붙인다(한 번만). CSS 가 등장 애니메이션을 담당.
// - [data-scrub]: 섹션을 지나가는 정도(0~1)를 CSS 변수 --p 로 넣는다. sticky 스토리 구간이 이 값으로 그려진다.
// - root 에는 읽은 정도 --read(0~1)를 넣는다(상단 진행 막대).
// 모션 축소·IntersectionObserver 미지원이면 처음부터 전부 보이게(--p=1) 해서 내용이 숨지 않게 한다.
export function useScrollEffects(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const scrubs = Array.from(root.querySelectorAll<HTMLElement>('[data-scrub]'))
    const marketProgress = Array.from(root.querySelectorAll<HTMLElement>('[data-market-progress]'))
    const marketScenes = Array.from(root.querySelectorAll<HTMLElement>('[data-market-scene]'))

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      reveals.forEach((el) => el.classList.add('is-in'))
      scrubs.forEach((el) => el.style.setProperty('--p', '1'))
      marketProgress.forEach((el) => el.style.setProperty('--market-p', '1'))
      root.style.setProperty('--read', '1')
      return
    }

    // 모션이 허용될 때만 효과용 클래스를 켠다. 이 클래스가 없으면 CSS 는 모든 내용을 그대로 보여준다.
    root.classList.add('fx')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    reveals.forEach((el) => io.observe(el))

    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      root.style.setProperty('--story-header', `${Math.max(0, headerBottom)}px`)
      const clamp = (n: number) => Math.min(1, Math.max(0, n))
      // 문단 그룹이 헤더 아래 화면 중앙에 도착하기 전에는 어떤 효과도 진행하지 않는다.
      for (const scene of marketScenes) {
        const stage = scene.querySelector<HTMLElement>('.l-market-stage')
        const content = scene.querySelector<HTMLElement>('.l-market-content')
        if (!stage || !content) continue
        const available = Math.max(1, vh - headerBottom)
        const tall = content.getBoundingClientRect().height > available - 1
        scene.classList.toggle('is-market-tall', tall)
        const rect = scene.getBoundingClientRect()
        const contentRect = content.getBoundingClientRect()
        const travel = Math.max(1, rect.height - stage.getBoundingClientRect().height)
        const duration = Math.max(1, travel - vh * .6)
        const midpoint = headerBottom + available / 2
        const groupCenter = contentRect.top + contentRect.height / 2
        const progress = tall ? clamp((midpoint - groupCenter) / (vh * .6)) : clamp((headerBottom - rect.top) / duration)
        scene.style.setProperty('--market-p', progress.toFixed(3))
        const assign = (el: HTMLElement, value: number) => el.style.setProperty('--market-p', clamp(value).toFixed(3))
        scene.querySelectorAll<HTMLElement>('[data-market-progress="card"]').forEach((el, index) => assign(el, (progress - (.32 + index * .24)) / .24))
        scene.querySelectorAll<HTMLElement>('[data-market-progress="steps"]').forEach(el => assign(el, (progress - .22) / .55))
        scene.querySelectorAll<HTMLElement>('[data-market-progress="step"]').forEach((el, index) => assign(el, (progress - (.20 + index * .18)) / .18))
        scene.querySelectorAll<HTMLElement>('[data-market-progress="seller"]').forEach(el => assign(el, (progress - .75) / .18))
      }
      for (const el of scrubs) {
        const rect = el.getBoundingClientRect()
        const travel = rect.height - vh
        // 휴대폰의 마지막 화면은 애니메이션을 마친 뒤에도 80vh 동안 그대로 유지한다.
        // 추가한 보류 구간만 빼므로 기존 접근·장면 전환의 실제 스크롤 거리는 그대로다.
        const animatedTravel = el.classList.contains('l-phone-scene') ? Math.max(1, travel - vh * 0.8) : travel
        const p = animatedTravel > 0 ? -rect.top / animatedTravel : (vh - rect.top) / (vh + rect.height)
        const progress = Math.min(1, Math.max(0, el.classList.contains('l-story') ? p / 0.78 : p))
        el.style.setProperty('--p', progress.toFixed(3))
        if (el.classList.contains('l-story')) {
          const entered = Math.min(1, Math.max(0, (vh - rect.top) / Math.max(1, vh * 0.35)))
          el.style.setProperty('--story-enter', entered.toFixed(3))
        }
        // 화면 설명·CSS 대체 화면·3D 텍스처가 동일한 스크롤 단계만 사용한다.
        if (el.classList.contains('l-phone-scene')) {
          // 먼저 휴대전화 접근을 완료한 다음, 첫 화면을 충분히 보여주고 다음 단계로 넘어간다.
          el.style.setProperty('--phone-approach', Math.min(1, progress / 0.45).toFixed(3))
          el.dataset.phoneStep = String(progress < 0.65 ? 0 : progress < 0.82 ? 1 : 2)
          // 휴대폰이 헤더 아래 11vh까지 퇴장하면 다음 문단을 나타낸다.
          // 스크롤 중단 시 중간 투명도로 멈추지 않도록 실제 전환은 CSS 시간 기반으로 마무리한다.
          root.dataset.listingVisible = String(rect.bottom <= headerBottom + vh * 0.11)
        }
      }
      const rect = root.getBoundingClientRect()
      const read = (vh - rect.top) / Math.max(1, rect.height)
      root.style.setProperty('--read', Math.min(1, Math.max(0, read)).toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    const marketResize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null
    marketScenes.forEach(scene => { const content = scene.querySelector<HTMLElement>('.l-market-content'); if (content) marketResize?.observe(content) })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      marketResize?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      root.classList.remove('fx')
    }
  }, [ref])
}

// 헤더를 스크롤 위치에 따라 투명 → 유리 효과로 바꾸기 위한 상태.
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

// 메뉴·섹션 표시로 구간 이동. 스크롤 연동(data-scrub) 구간은 시작점(진행 0 = 흐리고 투명한 상태)이 아니라
// 내용이 모두 드러난 지점(data-nav-at, 기본 0.95)으로 보낸다. 일반 구간은 헤더 바로 아래로.
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const header = document.querySelector('.topbar')?.getBoundingClientRect().height ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY
  const target = el.hasAttribute('data-scrub')
    ? top + Math.max(0, el.offsetHeight - window.innerHeight) * Number(el.dataset.navAt ?? 0.95)
    : top - header - 8
  window.scrollTo({ top: Math.max(0, target), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
