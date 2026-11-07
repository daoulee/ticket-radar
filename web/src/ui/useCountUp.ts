import { useEffect, useState, type RefObject } from 'react'
import { prefersReducedMotion } from './useScrollEffects'

// 화면에 처음 들어왔는지(한 번만). IntersectionObserver 가 없으면 바로 true.
export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0.3) {
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, threshold])
  return seen
}

// 장식용 예시 숫자 카운트업(0 → target). 사용자 결정(WEB-011): 임의로 정한 예시 가격에만 쓰고,
// 서버 대조 결과 금액에는 쓰지 않는다(DESIGN_SPEC D11 유지). 모션 축소면 처음부터 최종 값.
export function useCountUp(target: number, { delayMs = 0, durationMs = 1200, enabled = true } = {}) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  useEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      setValue(target)
      return
    }
    if (!enabled) return // 화면에 들어오기 전에는 0 에서 대기
    let frame = 0
    let start = 0
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - Math.pow(1 - t, 3) // 끝에서 천천히 멈춤
        setValue(Math.round(target * eased))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delayMs)
    return () => {
      window.clearTimeout(timer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [target, delayMs, durationMs, enabled])
  return value
}
