// 화면 점검: 폭별(360/390/768/1280/1440, WebKit 390/1280) 글자 크기 분포·12px 미만·넘침·제목 줄 수를 수집하고 전체 화면을 저장한다.
// 사용: npm run audit:ui -- <URL>  (모션 축소 상태로 측정해 모든 내용이 보이는 상태를 본다)
import { chromium, webkit } from '@playwright/test'
const url = process.argv[2]
const out = {}
const collect = () => {
  const els = [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  })
  const sizes = {}; const small = []; const overflow = []; const bigHeads = []
  for (const el of els) {
    const cs = getComputedStyle(el); let fs = parseFloat(cs.fontSize); const t = el.textContent.trim().slice(0, 28)
    // SVG 글자는 viewBox 배율을 곱한 실제 화면 크기로 본다
    const svg = el.closest('svg'); if (svg && svg.viewBox?.baseVal?.width) fs = Math.round(fs * svg.getBoundingClientRect().width / svg.viewBox.baseVal.width * 10) / 10
    sizes[fs] = (sizes[fs] || 0) + 1
    if (fs < 12) small.push(`${fs}px ${typeof el.className === 'string' ? el.className : el.tagName} "${t}"`)
    /* 1px 숨김(보조기기 전용) 요소는 제외 */ if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && el.clientWidth > 1) overflow.push(`${el.tagName}.${el.className} "${t}"`)
    const r = el.getBoundingClientRect()
    if (r.right > innerWidth + 1 || r.left < -1) overflow.push(`OFFSCREEN ${el.tagName}.${el.className} "${t}" ${Math.round(r.left)}-${Math.round(r.right)}`)
    if (/^H[1-3]$/.test(el.tagName) || /title|num|question|verdict/.test(el.className)) {
      const lh = parseFloat(cs.lineHeight) || fs * 1.3; const lines = Math.round(r.height / lh)
      bigHeads.push(`${fs}px x${lines}줄 ${el.className || el.tagName} "${t}"`)
    }
  }
  return { sizes, small: [...new Set(small)].slice(0, 15), overflow: [...new Set(overflow)].slice(0, 15), heads: [...new Set(bigHeads)].slice(0, 30) }
}
for (const [engine, bt] of [['chrome', chromium], ['webkit', webkit]]) {
  const browser = await bt.launch(engine === 'chrome' ? { channel: 'chrome' } : {})
  for (const w of [360, 390, 768, 1280, 1440]) {
    if (engine === 'webkit' && ![390, 1280].includes(w)) continue
    const page = await browser.newPage({ viewport: { width: w, height: w < 700 ? 800 : 900 }, deviceScaleFactor: 1 })
    await page.emulateMedia({ reducedMotion: 'reduce' }) // 모든 내용 표시 상태에서 측정
    await page.goto(url, { waitUntil: 'networkidle' })
    const key = `${engine}-${w}`
    out[key] = { landing: await page.evaluate(collect) }
    await page.screenshot({ path: `evidence/audit/${key}-landing.png`, fullPage: true })
    await page.getByRole('button', { name: /서비스 체험하러 가기/ }).click()
    out[key].event = await page.evaluate(collect)
    await page.screenshot({ path: `evidence/audit/${key}-1event.png`, fullPage: true })
    await page.getByRole('button', { name: /레이더 라이브/ }).click()
    await page.locator('details.samples summary').click()
    await page.getByRole('button', { name: '예시 1 · 가격 차이와 캡처 전달' }).click()
    out[key].listing = await page.evaluate(collect)
    await page.screenshot({ path: `evidence/audit/${key}-2listing.png`, fullPage: true })
    await page.getByRole('button', { name: '판매글에서 정보 추출' }).click()
    await page.getByRole('heading', { name: '3. 추출 정보 확인·수정' }).waitFor()
    for (const [l, v] of [['선택한 공연에 대한 판매글인가요?', 'demo-radar-live'], ['가격 기준', 'per_ticket'], ['수수료 포함 여부', 'ticket_only'], ['할인 여부', 'standard']]) await page.getByLabel(l).selectOption(v)
    out[key].review = await page.evaluate(collect)
    await page.screenshot({ path: `evidence/audit/${key}-3review.png`, fullPage: true })
    await page.getByRole('button', { name: '이 값으로 공식 자료와 대조' }).click()
    await page.getByText('+76,000원').waitFor()
    out[key].result = await page.evaluate(collect)
    await page.screenshot({ path: `evidence/audit/${key}-4result.png`, fullPage: true })
    await page.close()
  }
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
