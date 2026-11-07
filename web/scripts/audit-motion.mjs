// 효과 타이밍 점검: 소개 화면을 일정 간격으로 스크롤하며, 동시에 보이는(실효 불투명도 > 0.35) 내용 블록끼리 겹치는 곳을 찾는다.
// 사용: node scripts/audit-motion.mjs <URL> [출력폴더]
import { chromium } from '@playwright/test'
import fs from 'node:fs'
const url = process.argv[2]; const outDir = process.argv[3] ?? 'evidence/audit-motion'
fs.mkdirSync(outDir, { recursive: true })
const SEL = 'h2,h3,p,li,blockquote,.l-side,.l-listing,.l-float-card,.l-hero-art,.l-preview,.l-limit,.l-show,.btn,.l-scroll-cue,.l-dots,.chip,.example-tag,mark,.l-step-num'
const probe = ([SEL, scope]) => {
  const hb = document.querySelector('.topbar').getBoundingClientRect().bottom
  const eff = (el) => { let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o }
  const name = (el) => (el.id ? '#' + el.id : '') + '.' + [...el.classList].slice(0, 2).join('.') + `<${el.tagName.toLowerCase()}> "${(el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 18)}"`
  const els = [...document.querySelectorAll(SEL.split(',').map((x) => scope + ' ' + x).join(','))].filter((el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    // 닫힌 <details> 안 내용은 잘려 보이지 않으므로 제외
    if (el.closest('details:not([open])') && !el.closest('summary')) return false
    return r.width > 4 && r.height > 4 && r.bottom > hb + 2 && r.top < innerHeight && cs.visibility !== 'hidden' && eff(el) > 0.35
  })
  const hits = []
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i], b = els[j]
    if (a.contains(b) || b.contains(a)) continue
    // 여러 줄로 감긴 인라인 요소는 외곽 상자가 아니라 줄별 상자로 비교한다(오탐 방지)
    const rects = (el) => getComputedStyle(el).display === 'inline' ? [...el.getClientRects()] : [el.getBoundingClientRect()]
    let area = 0
    for (const ra of rects(a)) for (const rb of rects(b)) {
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
      if (w > 6 && h > 6) area += w * h
    }
    if (area > 0) hits.push({ a: name(a), b: name(b), area: Math.round(area), opA: +eff(a).toFixed(2), opB: +eff(b).toFixed(2) })
  }
  return hits
}
const browser = await chromium.launch({ channel: 'chrome' })
const report = {}
for (const [w, h] of [[1280, 900], [1100, 800], [768, 1024], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500)
  const total = await page.evaluate(() => document.querySelector('.landing').offsetHeight)
  const found = new Map()
  for (let y = 0; y < total; y += 60) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    for (const [phase, wait] of [['mid', 150], ['settled', 900]]) {
      await page.waitForTimeout(phase === 'mid' ? wait : wait - 150)
      for (const hit of await page.evaluate(probe, [SEL, '.landing'])) {
        const key = `${hit.a} × ${hit.b}`
        if (!found.has(key)) { found.set(key, { ...hit, firstY: y, phase, count: 0 }); await page.screenshot({ path: `${outDir}/${w}-${found.size}.png` }) }
        found.get(key).count++
      }
    }
  }
  // 체험 화면: 단계마다 들어간 직후(전환 중)와 끝난 뒤를 검사
  const APP_SEL = 'h2,h3,p,li,blockquote,.btn,.chip,.badge,.field-row,.finding,.price-card,.event-item,.stepper,.official,select,input,textarea,dl'
  const checkApp = async (label) => {
    for (const [phase, wait] of [['mid', 120], ['settled', 900]]) {
      await page.waitForTimeout(wait)
      for (const y of [0, 600, 1200, 1800]) {
        await page.evaluate((y) => window.scrollTo(0, y), y)
        for (const hit of await page.evaluate(probe, [APP_SEL, '.app'])) {
          const key = `[app:${label}] ${hit.a} × ${hit.b}`
          if (!found.has(key)) { found.set(key, { ...hit, a: `[app:${label}] ` + hit.a, firstY: y, phase, count: 0 }); await page.screenshot({ path: `${outDir}/${w}-app-${found.size}.png` }) }
          found.get(key).count++
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0))
    }
  }
  await page.getByRole('button', { name: '서비스 체험하러 가기' }).click(); await checkApp('event')
  await page.getByRole('button', { name: /레이더 라이브/ }).click(); await checkApp('listing')
  await page.locator('details.samples summary').click()
  await page.getByRole('button', { name: '예시 1 · 가격 차이와 캡처 전달' }).click()
  await page.getByRole('button', { name: '판매글에서 정보 추출' }).click(); await page.getByRole('heading', { name: '3. 추출 정보 확인·수정' }).waitFor(); await checkApp('review')
  for (const [l, v] of [['선택한 공연에 대한 판매글인가요?', 'demo-radar-live'], ['가격 기준', 'per_ticket'], ['수수료 포함 여부', 'ticket_only'], ['할인 여부', 'standard']]) await page.getByLabel(l).selectOption(v)
  await page.getByRole('button', { name: '이 값으로 공식 자료와 대조' }).click(); await page.getByText('+76,000원').waitFor(); await checkApp('result')
  report[w] = [...found.values()]
  await page.close()
}
await browser.close()
fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 1))
for (const [w, hits] of Object.entries(report)) { console.log(`== ${w}px: ${hits.length}건`); hits.forEach((h, i) => console.log(` ${i + 1}. y=${h.firstY} ${h.phase} ×${h.count} area=${h.area} op=${h.opA}/${h.opB}  ${h.a}  ⟷  ${h.b}`)) }
