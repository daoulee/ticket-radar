import { expect, test, type Page } from '@playwright/test'

// 소개(메인) 화면: 실제 스크롤로 효과가 진행되는지, 모션 축소에서 내용이 모두 보이는지, 체험 진입이 막히지 않는지.
const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `evidence/screens/landing/${project}-${name}.png` })

async function scrollToFraction(page: Page, selector: string, fraction: number) {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel as string) as HTMLElement
      const top = el.getBoundingClientRect().top + window.scrollY
      const hold = el.classList.contains('l-phone-scene') ? window.innerHeight * 0.8 : 0
      window.scrollTo({ top: top + Math.max(0, el.offsetHeight - window.innerHeight - hold) * (f as number) })
    },
    [selector, fraction],
  )
  await page.waitForTimeout(450)
}

test('스크롤하면 소개가 단계적으로 드러나고, 끝에서 체험으로 들어간다', async ({ page }, info) => {
  const project = info.project.name
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  await expect(page.locator('.landing')).toHaveClass(/fx/)
  await expect(page.getByRole('heading', { name: /정말 이 조건이 맞을까요/ })).toBeVisible()
  await page.waitForTimeout(1200)
  await shot(page, '1-hero', project)
  await expect(page.locator('.topbar')).not.toHaveClass(/is-scrolled/)
  // 전면 무대: 처음엔 여백 없이 꽉 차 있다가 스크롤하면 둥근 카드로 줄어든다
  const radius0 = await page.locator('.l-stage-panel').evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 0.5 }))
  await page.waitForTimeout(400)
  const radius1 = await page.locator('.l-stage-panel').evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))
  expect(radius0).toBeLessThan(2)
  expect(radius1).toBeGreaterThan(20)
  await shot(page, '1b-stage-card', project)
  // 장식 티켓: 비스듬히 기울어져 있고 스크린리더에서 숨김, '가상 티켓' 표시 포함
  await expect(page.locator('.l-hero-art')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.l-ticket text', { hasText: '가상 티켓' })).toHaveCount(1)
  // 예시 가격 카운트업: 장식용 임의 가격(학교 설립일 1977.6.24)이 최종 값에서 멈춘다
  await expect(page.locator('.ta-price')).toHaveText('₩19,770', { timeout: 5000 })
  await expect(page.locator('.l-ticket text', { hasText: '실제 판매 아님' })).toHaveCount(1)

  // 판매글 스토리: 처음엔 강조가 비어 있다가 스크롤 끝에서 채워진다
  const story = page.locator('#story-listing')
  await scrollToFraction(page, '#story-listing', 0.02)
  const early = Number(await story.evaluate((el) => el.style.getPropertyValue('--p')))
  await expect(page.locator('.topbar')).toHaveClass(/is-scrolled/)
  await scrollToFraction(page, '#story-listing', 0.5)
  await shot(page, '2-listing-mid', project)
  await scrollToFraction(page, '#story-listing', 1)
  const late = Number(await story.evaluate((el) => el.style.getPropertyValue('--p')))
  expect(early).toBeLessThan(0.15)
  expect(late).toBeGreaterThan(0.95)
  await expect(page.locator('.scrub-word').last()).toHaveCSS('opacity', '1') // 단어 쌓기 마지막 단어까지 표시
  await shot(page, '3-listing-end', project)

  // 공식 안내와 나란히: 연결선이 그려지고 판정 칩·차액이 나타난다
  await scrollToFraction(page, 'section[aria-labelledby="story-compare-title"]', 0.95)
  await expect(page.locator('.l-verdict').last()).toHaveCSS('opacity', '1')
  await shot(page, '4-compare', project)

  await scrollToFraction(page, 'section[aria-labelledby="story-steps-title"]', 0.95)
  await shot(page, '5-steps', project)

  await page.getByRole('heading', { name: '근거와 함께 보여드려요' }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  await shot(page, '6-preview', project)
  await page.getByRole('heading', { name: '결정은 당신이, 근거는 저희가' }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await shot(page, '7-limits', project)

  const cta = page.getByRole('button', { name: /서비스 체험하러 가기/ })
  await cta.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await expect(page.getByText('[시연] 레이더 라이브 2026 (가상 공연)')).toBeVisible()
  await shot(page, '8-final', project)
  // CTA 빛줄기: 3초 주기로 계속 반복
  const sheen = await cta.evaluate((el) => {
    const cs = getComputedStyle(el, '::after')
    return { name: cs.animationName, duration: cs.animationDuration, count: cs.animationIterationCount }
  })
  expect(sheen).toEqual({ name: 'sheen', duration: '3s', count: 'infinite' })

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)

  await cta.click()
  await expect(page.getByRole('heading', { name: '1. 공연 선택' })).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)
  expect(errors).toEqual([])
})

test('모션 축소에서는 효과 없이 모든 소개 내용이 바로 보인다', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.landing')).not.toHaveClass(/fx/)
  await expect(page.locator('.ta-price')).toHaveText('₩19,770') // 모션 축소: 카운트업 없이 바로 최종 값
  for (const text of ['세 단계면 충분해요', '결정은 당신이, 근거는 저희가']) {
    await expect(page.getByText(text).first()).toHaveCSS('opacity', '1')
  }
  await expect(page.locator('.scrub-word').last()).toHaveCSS('opacity', '1')
  await expect(page.getByRole('button', { name: '서비스 체험하러 가기' })).toHaveCSS('opacity', '1')
  expect(await page.locator('.btn-flow').evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  expect(await page.locator('.btn-flow').evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe('none')
  expect(await page.locator('.l-story').first().evaluate((el) => getComputedStyle(el).position)).toBe('static')
  await page.screenshot({ path: `evidence/screens/landing/${info.project.name}-reduced-full.png`, fullPage: true })
  // 헤더 바로가기도 효과와 무관하게 동작
  await page.getByRole('button', { name: '바로 체험하기' }).click()
  await expect(page.getByRole('heading', { name: '1. 공연 선택' })).toBeVisible()
})

test('헤더: 메뉴로 구간 이동·현재 구간 강조, 모바일 펼침 메뉴, 버튼 hover 는 흔들리지 않고 글자 굴림이 끝까지 간다', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const isMobile = (page.viewportSize()?.width ?? 1280) <= 1024
  if (isMobile) {
    const toggle = page.getByRole('button', { name: '메뉴 열기' })
    await toggle.click()
    await expect(page.locator('#mobile-menu')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#mobile-menu')).toBeHidden()
    await toggle.click()
    await page.locator('#mobile-menu').getByRole('button', { name: '사용 방법' }).click()
    await expect(page.locator('#mobile-menu')).toBeHidden()
  } else {
    await page.locator('.site-nav').getByRole('button', { name: '사용 방법' }).click()
    await expect(page.locator('.site-nav .is-active')).toHaveText('사용 방법', { timeout: 5000 })
  }
  // 스크롤 연동 구간은 내용이 다 드러난 지점에 도착해야 한다(흐린 시작 화면 금지)
  await expect.poll(() => page.evaluate(() => Number(document.getElementById('story-steps')!.style.getPropertyValue('--p'))), { timeout: 5000 }).toBeGreaterThan(0.88)
  await page.waitForTimeout(300)
  await expect(page.locator('.l-step').last()).toHaveCSS('opacity', '1')
  expect(await page.locator('#story-steps-title').evaluate((el) => getComputedStyle(el).filter)).toMatch(/none|blur\(0px\)/)

  // 체험 중에도 메뉴로 소개 구간에 돌아갈 수 있다
  await page.getByRole('button', { name: '바로 체험하기' }).click()
  await expect(page.getByRole('heading', { name: '1. 공연 선택' })).toBeVisible()
  if (isMobile) { await page.getByRole('button', { name: '메뉴 열기' }).click(); await page.locator('#mobile-menu').getByRole('button', { name: '결과 예시' }).click() }
  else await page.locator('.site-nav').getByRole('button', { name: '결과 예시' }).click()
  await expect(page.locator('#preview')).toBeInViewport()

  if (!isMobile && info.project.name !== 'webkit-ipad') {
    await page.evaluate(() => window.scrollTo(0, 0))
    const btn = page.getByRole('button', { name: '바로 체험하기' })
    const before = await btn.boundingBox()
    await btn.hover()
    await page.waitForTimeout(800)
    const after = await btn.boundingBox()
    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(0.5) // hover 로 버튼이 움직이지 않음
    // 서로 다른 문구가 완전히 교체되고 버튼 크기는 유지된다.
    const roll = await btn.locator('.roll').evaluate((el) => el.getBoundingClientRect())
    const second = await btn.locator('.roll-hover').evaluate((el) => el.getBoundingClientRect())
    await expect(btn.locator('.roll-hover')).toHaveText('Let’s Go!')
    await expect(btn.locator('.roll-hover')).toHaveCSS('opacity', '1')
    await expect(btn.locator('.roll-default')).toHaveCSS('opacity', '0')
    expect(Math.abs(second.top - roll.top)).toBeLessThan(1)
    expect(Math.abs(second.bottom - roll.bottom)).toBeLessThan(1)
    // 큰 CTA 도 아래 가장자리 1px 에 포인터를 두어도 같은 결과
    const cta = page.getByRole('button', { name: '서비스 체험하러 가기' })
    await page.getByRole('button', { name: '바로 체험하기' }).click()
    await page.getByRole('button', { name: '서비스 소개' }).click()
    await cta.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200)
    const box = (await cta.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 1)
    await page.waitForTimeout(900)
    const r2 = await cta.locator('.roll').evaluate((el) => el.getBoundingClientRect())
    const s2 = await cta.locator('.roll-hover').evaluate((el) => el.getBoundingClientRect())
    await expect(cta.locator('.roll-hover')).toHaveText('가시죠!')
    await expect(cta.locator('.roll-hover')).toHaveCSS('opacity', '1')
    expect(Math.abs(s2.top - r2.top)).toBeLessThan(1)
  }
})

test('가상 휴대전화 장면은 스크롤에 따라 움직이고 모션 축소에서는 정지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const scene = page.locator('.l-phone-scene')
  const phone = page.locator('.l-phone-device')
  await expect(scene).toBeAttached()
  await scrollToFraction(page, '.l-phone-scene', 0.05)
  const early = await phone.evaluate((el) => getComputedStyle(el).transform)
  await scrollToFraction(page, '.l-phone-scene', 0.95)
  const late = await phone.evaluate((el) => getComputedStyle(el).transform)
  expect(late).not.toBe(early)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.locator('.landing')).not.toHaveClass(/fx/)
  const reducedEarly = await phone.evaluate((el) => getComputedStyle(el).transform)
  await page.evaluate(() => window.scrollBy(0, 300))
  const reducedLate = await phone.evaluate((el) => getComputedStyle(el).transform)
  expect(reducedLate).toBe(reducedEarly)
})

test('휴대전화 설명과 시연 화면은 스크롤 단계에 맞고 멈추면 자동 변경되지 않는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const scene = page.locator('.l-phone-scene')
  const names = ['frame-one', 'frame-two', 'frame-three']
  for (const [i, fraction] of [0.5, 0.72, 0.9].entries()) {
    await scrollToFraction(page, '.l-phone-scene', fraction)
    await expect(scene).toHaveAttribute('data-phone-step', String(i))
    await expect(scene.locator(`.l-phone-copy-slides .${names[i]}`)).toHaveCSS('opacity', '1')
    await expect(scene.locator(`.l-phone-screen .${names[i]}`)).toHaveCSS('opacity', '1')
    await expect(scene.locator(`.l-phone-copy-slides .${names[i]}`)).toHaveCSS('animation-name', 'none')
    await page.waitForTimeout(1100)
    await expect(scene).toHaveAttribute('data-phone-step', String(i))
    if (await page.locator('.phone-three').evaluate(el => el.classList.contains('is-ready'))) {
      await expect(page.locator('.phone-three')).toHaveAttribute('data-screen-step', String(i))
    }
  }
  await scrollToFraction(page, '.l-phone-scene', 0.1)
  await expect(scene).toHaveAttribute('data-phone-step', '0')
})

test('휴대전화가 가까워진 후에만 설명 단계가 바뀐다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const scene = page.locator('.l-phone-scene')
  for (const fraction of [0.1, 0.3, 0.45, 0.6]) {
    await scrollToFraction(page, '.l-phone-scene', fraction)
    await expect(scene).toHaveAttribute('data-phone-step', '0')
  }
  const approach = await scene.evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--phone-approach')))
  expect(approach).toBe(1)
  await scrollToFraction(page, '.l-phone-scene', 0.72)
  await expect(scene).toHaveAttribute('data-phone-step', '1')
  expect(await scene.evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--phone-approach')))).toBe(1)
})

test('마지막 휴대전화 설명은 전환이 끝난 뒤 충분한 스크롤 동안 고정되어 읽힌다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const scene = page.locator('.l-phone-scene')
  const sticky = page.locator('.l-phone-sticky')
  const end = await scene.evaluate(el => {
    const rect = el.getBoundingClientRect()
    return { top: rect.top + window.scrollY, travel: el.getBoundingClientRect().height - window.innerHeight, height: window.innerHeight }
  })
  const animationEnd = end.top + end.travel - end.height * 0.8
  for (const distance of [0, 0.3, 0.6]) {
    await page.evaluate(y => window.scrollTo(0, y), animationEnd + end.height * distance)
    await expect(scene).toHaveAttribute('data-phone-step', '2')
    await expect(scene.locator('.l-phone-copy-slides .frame-three')).toHaveCSS('opacity', '1')
    const top = await sticky.evaluate(el => el.getBoundingClientRect().top)
    expect(Math.abs(top - 72)).toBeLessThan(2)
    if (await page.locator('.phone-three').evaluate(el => el.classList.contains('is-ready'))) {
      await expect(page.locator('.phone-three')).toHaveAttribute('data-screen-step', '2')
    }
  }
  // 이전 장면으로 돌아갈 때도 원래 순서로 돌아간다.
  await scrollToFraction(page, '.l-phone-scene', 0.72)
  await expect(scene).toHaveAttribute('data-phone-step', '1')
})
