import { expect, test } from '@playwright/test'

// WEB-007: 새 메인(홈)·Pen 흰 배경 기준으로 갱신. 모션 축소·가로 넘침·폼 독립성 검사는 유지.
test('D1/WEB-007: 반응형·모션 축소·밝은 테마에서도 브랜드와 폼이 보인다', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '티켓레이더', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '바로 체험하기' })).toBeVisible()
  expect(await page.locator('.rb-sweep').evaluate(el => getComputedStyle(el).animationName)).toBe('none')
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)')
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await page.screenshot({ path: `evidence/screens/design-d1/${info.project.name}-${width}.png`, fullPage: true })
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  expect(await page.locator('.rb-sweep').evaluate(el => getComputedStyle(el).animationName)).toBe('rb-sweep')
  await page.getByRole('button', { name: '바로 체험하기' }).click()
  await page.getByRole('button', { name: /레이더 라이브/ }).click()
  await expect(page.getByLabel('판매글 내용')).toBeVisible()
  await page.getByLabel('판매글 내용').fill('판매글 입력은 브랜드 모션과 독립적입니다.')
  await expect(page.getByLabel('판매글 내용')).toHaveValue('판매글 입력은 브랜드 모션과 독립적입니다.')
})
