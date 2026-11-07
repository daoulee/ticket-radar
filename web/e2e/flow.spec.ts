import { expect, test, type Page } from '@playwright/test'

// 소개(메인) 끝의 버튼으로 체험을 시작해 공연 선택 단계로 간다
async function start(page: Page) {
  await page.getByRole('button', { name: /서비스 체험하러 가기/ }).click()
  await expect(page.getByRole('heading', { name: '1. 공연 선택' })).toBeVisible()
}

// 시연 예시는 접혀 있으므로 펼친 뒤 고른다 (DESIGN_SPEC S01·S07)
async function pickSample(page: Page, name: string) {
  const details = page.locator('details.samples')
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open))) await details.locator('summary').click()
  await page.getByRole('button', { name }).click()
}

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `evidence/screens/${project}/${name}.png`, fullPage: true })

test('공연 선택 → 판매글 → 추출값 수정 → 대조 결과 (시연 데이터)', async ({ page }, info) => {
  const project = info.project.name
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('dialog', (d) => {
    errors.push(`dialog: ${d.message()}`)
    void d.dismiss()
  })

  await page.goto('/')
  await expect(page.getByRole('note', { name: '시연 모드 · 합성 데이터' })).toBeVisible()
  await start(page)
  await page.getByRole('button', { name: /레이더 라이브/ }).click()
  await expect(page.getByText('154,000원').first()).toBeVisible()
  await shot(page, '1-listing', project)

  await pickSample(page, '예시 1 · 가격 차이와 캡처 전달')
  await page.getByRole('button', { name: '판매글에서 정보 추출' }).click()
  await expect(page.getByRole('heading', { name: '3. 추출 정보 확인·수정' })).toBeVisible()
  await shot(page, '2-review', project)

  // 가격 비교 조건은 사용자가 직접 확인한다
  await page.getByLabel('선택한 공연에 대한 판매글인가요?').selectOption('demo-radar-live')
  await page.getByLabel('가격 기준').selectOption('per_ticket')
  await page.getByLabel('수수료 포함 여부').selectOption('ticket_only')
  await page.getByLabel('할인 여부').selectOption('standard')
  await page.getByRole('button', { name: '이 값으로 공식 자료와 대조' }).click()
  await expect(page.getByText('+76,000원')).toBeVisible()
  await expect(page.getByRole('link', { name: '공식 근거 (시연용 예시 링크)' }).first()).toBeVisible()
  await shot(page, '3-result', project)

  // 수정 후 재대조 (T05)
  await page.getByRole('button', { name: '추출값 수정' }).click()
  await page.getByLabel('1매 가격(원)').fill('154000')
  await page.getByRole('button', { name: /대조 결과/ }).click()
  await expect(page.getByText('추출값이 바뀌었습니다.')).toBeVisible()
  await shot(page, '4-stale', project)
  await page.getByRole('button', { name: '수정한 값으로 다시 대조' }).click()
  await expect(page.getByText('공식 가격과 같은 판매가')).toBeVisible()

  // 스크립트가 섞인 판매글 (T07)
  await page.getByRole('button', { name: '새 판매글 확인' }).click()
  await pickSample(page, '예시 3 · 가격이 없는 글')
  await page.getByRole('button', { name: '판매글에서 정보 추출' }).click()
  await page.getByRole('button', { name: '이 값으로 공식 자료와 대조' }).click()
  await expect(page.getByText('판매가가 확인되지 않아 가격 비교를 보류합니다.')).toBeVisible()
  await shot(page, '5-held', project)

  // 가로 스크롤이 생기지 않아야 한다 (반응형)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  expect(errors).toEqual([])
})

test('API 실패 화면과 재시도', async ({ page }, info) => {
  await page.goto('/?demoFail=checks')
  await start(page)
  await page.getByRole('button', { name: /레이더 라이브/ }).click()
  await pickSample(page, '예시 2 · 좌석 등급이 모호한 글')
  await page.getByRole('button', { name: '판매글에서 정보 추출' }).click()
  await expect(page.getByText('판매글을 분석하지 못했습니다')).toBeVisible()
  await shot(page, '6-error', info.project.name)
  await page.getByRole('button', { name: '다시 시도' }).click()
  await expect(page.getByRole('heading', { name: '3. 추출 정보 확인·수정' })).toBeVisible()
  await shot(page, '7-ambiguous-review', info.project.name)
})
