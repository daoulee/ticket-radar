import { expect, test } from '@playwright/test'

test('휴대폰 뒤 판매글은 멈춰도 선명해지고 되돌리면 다시 숨는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.locator('.landing')).toHaveClass(/fx/)
  const location = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>('.l-phone-scene')!
    const header = document.querySelector<HTMLElement>('.topbar')!.getBoundingClientRect().bottom
    return { end: scene.offsetTop + scene.offsetHeight, header, height: window.innerHeight }
  })
  const opacityAt = async (offset: number) => {
    await page.evaluate(y => window.scrollTo(0, y), location.end - location.header + location.height * offset)
    await page.waitForTimeout(550)
    return Number(await page.locator('#story-listing .l-sticky').evaluate(el => getComputedStyle(el).opacity))
  }
  expect(await opacityAt(-0.30)).toBe(0)
  await expect(page.locator('.l-dots button[aria-current="true"]')).toHaveAttribute('aria-label', '살펴보기(으)로 이동')
  // 진입 직후 스크롤을 멈춰도 중간 투명도에 갇히지 않는다.
  expect(await opacityAt(-0.08)).toBe(1)
  expect(await opacityAt(0)).toBe(1)
  await expect(page.locator('.l-dots button[aria-current="true"]')).toHaveAttribute('aria-label', '판매글(으)로 이동')
  expect(await opacityAt(-0.30)).toBe(0)
  await expect(page.locator('.l-dots button[aria-current="true"]')).toHaveAttribute('aria-label', '살펴보기(으)로 이동')
})

test('데스크톱 스토리 내용은 고정 헤더 아래 공간의 중앙에 놓인다', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.locator('.landing')).toHaveClass(/fx/)
  for (const id of ['story-listing', 'story-compare', 'story-steps']) {
    await page.evaluate(id => {
      const section = document.getElementById(id)!
      window.scrollTo(0, section.offsetTop + (section.offsetHeight - window.innerHeight) * 0.8)
    }, id)
    await page.waitForTimeout(150)
    const offset = await page.evaluate(id => {
      const panel = document.querySelector<HTMLElement>(`#${id} .l-sticky`)!
      const rectangles = [...panel.children].map(el => el.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
      const headerBottom = document.querySelector('.topbar')!.getBoundingClientRect().bottom
      return (Math.min(...rectangles.map(r => r.top)) + Math.max(...rectangles.map(r => r.bottom))) / 2 - (headerBottom + window.innerHeight) / 2
    }, id)
    expect(Math.abs(offset), id).toBeLessThan(12)
  }
})
