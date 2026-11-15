import { expect, test } from '@playwright/test'

test('토스 테스트 결제 UI를 시연 주문에 렌더링한다', async ({ page }) => {
  test.skip(process.env.AID_TOSS_WIDGET_TEST !== '1', '격리 토스 테스트 서버가 필요한 검증')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:5180/')
  await page.getByRole('button', { name: '서비스 체험하러 가기' }).click()
  await page.getByRole('button', { name: /뮤지컬 나침반/ }).first().click()
  await page.getByRole('button', { name: /구매 정보 확인하기/ }).click()
  await page.getByRole('button', { name: '대기 건너뛰기' }).click()
  await page.getByRole('button', { name: 'A1 좌석' }).click()
  await page.getByRole('button', { name: /선택한 좌석 확인하기/ }).click()
  await page.getByRole('button', { name: /시연 결제 계속하기/ }).click()
  await expect(page.getByRole('heading', { name: '테스트 결제', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '토스 테스트 결제하기' })).toBeEnabled({ timeout: 20000 })
  await expect(page.locator('#toss-methods iframe').first()).toBeVisible()
  await page.screenshot({ path: '/private/tmp/aid-toss-widget.png', fullPage: true })
})
