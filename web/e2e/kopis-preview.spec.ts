import { expect, test } from '@playwright/test'

test('로컬 시연 공연 선택에서 실제 KOPIS 목록을 불러온다', async ({ page }) => {
  test.skip(process.env.AID_KOPIS_LIVE_TEST !== '1', '실제 KOPIS와 별도 로컬 서버가 필요한 테스트')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:5179/')
  await page.getByRole('button', { name: '서비스 체험하러 가기' }).click()
  await page.getByRole('button', { name: /판매글 안심 확인/ }).click()
  const section = page.locator('.performance-section')
  await expect(section.getByText('KOPIS 공연 정보').first()).toBeVisible({ timeout: 20000 })
  await expect(section.getByText('실제 공연 목록을 불러오지 못했어요')).toHaveCount(0)
  await expect(section.getByText('가격·입장 규정 미등록').first()).toBeVisible()
})
