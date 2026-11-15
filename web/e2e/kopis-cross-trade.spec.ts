import { expect, test } from '@playwright/test'

test('D2에서 준비한 KOPIS 공연 시연 매물을 웹에서 구매·수령한다', async ({ page }) => {
  test.skip(process.env.AID_KOPIS_CROSS_TEST !== '1', 'D2와 격리 KOPIS 시연 서버가 준비된 경우에만 실행')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:5173/')
  await page.getByRole('button', { name: '바로 체험하기' }).click()
  await page.getByLabel('아이디 또는 이메일').fill('appseller')
  await page.getByLabel('비밀번호').fill('Seller-pass-1!')
  await page.getByRole('button', { name: '로그인', exact: true }).click()
  await page.getByRole('button', { name: /마흔에 서/ }).click()
  const listing = page.locator('.market-item').filter({ hasText: '전석 · 1매' }).filter({ hasText: '40,000원' })
  await expect(listing).toHaveCount(1)
  await expect(listing).toContainText('시연')
  await listing.getByRole('button', { name: '시연 구매하기' }).click()
  await expect(page.getByText('수령 확인 대기')).toBeVisible()
  await page.getByRole('button', { name: '티켓 받았어요' }).click()
  await expect(page.getByText('거래 완료')).toBeVisible()
})
