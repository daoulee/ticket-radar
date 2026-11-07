import { expect, test, type Page, type Request } from '@playwright/test'

// Sol 실제 서버(127.0.0.1:3001, AI 미설정)에 연결한 웹을 실제 브라우저로 확인한다.
// 판매글은 이 테스트를 위해 작성한 합성 문장이다. 실제 AI 추출은 서버에 설정돼 있지 않아 검증 대상이 아니다.
const LISTING = '대구 AKMU 토요일 5시 공연 VIP 한 장 25만원에 양도해요. 팬클럽 선예매 표라 예매자는 저예요. 입금 먼저 부탁드립니다.'
const EVENT_ID = 'akmu-daegu-20261121'
const YES24 = 'https://m.ticket.yes24.com/Notice/18447?order=1&type=1'
// SOL-005 이후 서버가 돌려주는 YES24 공지 가격 원문 (서버 생성 설명이 아님)
const PRICE_SOURCE_TEXT = '·티켓 가격: 스탠딩&VIP석 176,000원 / R석 165,000원 / 시야제한 154,000원'
const PRICE_CHECKED = /2026\. 11\. 01\. \(날짜 단위\)/ // 가격 원문 재확인일
const POLICY_CHECKED = /2026\. 10\. 29\. \(날짜 단위\)/ // 규정·공연 확인일

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `evidence/screens/${project}/${name}.png`, fullPage: true })

const result = (page: Page) => page.getByRole('heading', { name: '4. 공식 자료 대조 결과' })
const applied = (page: Page) => page.getByRole('definition').filter({ hasText: /./ })

async function compareNow(page: Page) {
  await page.getByRole('button', { name: '이 값으로 공식 자료와 대조' }).click()
  await expect(result(page)).toBeVisible()
}

test('실서버: 공식 자료 조회 → AI 미설정 → 직접 입력 → 조건 누락 보류 → 비교 → 수정 재대조 → 회차·공연 불일치 보류', async ({ page }, info) => {
  const project = info.project.name
  const checks: Request[] = []
  const errors: string[] = []
  page.on('request', (r) => r.url().endsWith('/checks') && r.method() === 'POST' && checks.push(r))
  page.on('pageerror', (e) => errors.push(e.message))

  // 1. 실제 서버에서 공연·공식 자료 조회
  await page.goto('/')
  await expect(page.getByRole('note')).toHaveAttribute('title', '연결: http://127.0.0.1:3001')
  await expect(page.getByRole('note', { name: '서버 연결 · 결과별 시연 표시' })).toBeVisible()
  await page.getByRole('button', { name: /서비스 체험하러 가기/ }).click()
  const eventButton = page.getByRole('button', { name: /2026 AKMU CONCERT TOUR - 대구/ })
  await expect(eventButton).toContainText('공식 자료 기반')
  await eventButton.click()
  const official = page.getByRole('complementary')
  await expect(official.getByText('176,000원').first()).toBeVisible()
  await expect(official.getByText(/출처 유형: 공식 공지 스냅샷/)).toBeVisible()
  await expect(official.getByText('팬클럽 선예매에만 적용')).toBeVisible()
  await expect(official.getByText('실관람자가 모두 동일인이어야 합니다.')).toBeVisible()
  await expect(official.getByRole('link', { name: '공식 근거 열기' }).first()).toHaveAttribute('href', YES24)
  await expect(official.locator('.source-line', { hasText: '2026. 11. 01.' })).toHaveCount(1) // 가격표 아래
  await expect(official.locator('.policy-list .source-line')).toContainText(POLICY_CHECKED)
  await expect(official.getByText(/공식 공지 스냅샷/)).toBeVisible()
  await expect(official.getByTestId('price-source-text')).toHaveText(PRICE_SOURCE_TEXT)
  await shot(page, 's1-official', project)

  // 2. AI 미설정 오류: 성공 결과로 바꾸지 않는다
  await page.getByLabel('판매글 내용').fill(LISTING)
  await expect(page.getByLabel(/시연용으로 작성한 합성 판매글/)).toBeChecked()
  await page.getByRole('button', { name: '판매글에서 정보 추출' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('AI_NOT_CONFIGURED')
  await expect(alert.getByRole('button', { name: '다시 시도' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '3. 추출 정보 확인·수정' })).toHaveCount(0)
  await shot(page, 's2-ai-not-configured', project)
  expect(checks[0].postDataJSON()).toEqual({ eventId: EVENT_ID, listingText: LISTING, syntheticListing: true })

  // 3. 사용자가 명시적으로 고른 직접 입력
  await alert.getByRole('button', { name: 'AI 추출 없이 직접 입력' }).click()
  await expect(page.getByTestId('extraction-mode')).toHaveText('추출 방식: AI 추출 없음 · 사용자가 직접 입력')
  await page.getByLabel('회차').selectOption(`${EVENT_ID}-s1`)
  await page.getByLabel('좌석 등급').selectOption('VIP')
  await page.getByLabel('1매 가격(원)').fill('250000')
  await page.getByLabel('매수').fill('1')

  // 5-a. 조건 누락 → 가격 비교 보류
  await compareNow(page)
  await expect(page.getByText('판매글의 공연 일치 여부를 확인하세요.').first()).toBeVisible()
  await expect(page.getByText(/공식 가격 대비/)).toHaveCount(0)
  await expect(page.getByTestId('extraction-mode')).toHaveText('추출 방식: AI 추출 없음 · 사용자가 직접 입력')
  await expect(page.getByTestId('provenance')).toContainText('시연용 합성 판매글')
  await shot(page, 's3-held-conditions', project)
  expect(checks[1].postDataJSON()).toMatchObject({ extractionMode: 'manual', syntheticListing: true, confirmedFields: { price: 250000, listingEventId: null } })

  // 6. 조건 확인 후 비교: 판매글 근거·공식 문구·출처·확인일 표시
  await page.getByRole('button', { name: '추출값 수정' }).click()
  await page.getByLabel('선택한 공연에 대한 판매글인가요?').selectOption(EVENT_ID)
  await page.getByLabel('가격 기준').selectOption('per_ticket')
  await page.getByLabel('수수료 포함 여부').selectOption('ticket_only')
  await page.getByLabel('할인 여부').selectOption('standard')
  await page.getByLabel('예매 유형').selectOption('fanclub_presale')
  await page.getByLabel('관람자가 예매자 본인인가요?').selectOption('false')
  await compareNow(page)
  await expect(page.getByText('+74,000원')).toBeVisible()
  const findings = page.getByRole('list', { name: '확인할 점 목록' })
  const priceItem = findings.getByRole('listitem').filter({ hasText: '같은 조건의 티켓 기본가 비교' })
  await expect(priceItem.locator('q[data-source="listing"]')).toContainText('VIP 한 장 25만원')
  await expect(priceItem.locator('blockquote.official-excerpt')).toHaveText(PRICE_SOURCE_TEXT)
  await expect(priceItem.getByRole('link', { name: '공식 근거 열기' })).toHaveAttribute('href', YES24)
  await expect(priceItem.locator('.source-line')).toContainText(PRICE_CHECKED)
  const policyItem = findings.getByRole('listitem').filter({ hasText: '실관람자가 모두 동일인이어야 합니다.' })
  await expect(policyItem.locator('blockquote.official-excerpt')).toHaveText('실관람자가 모두 동일인이어야 합니다.')
  await expect(policyItem.getByRole('link', { name: '공식 근거 열기' })).toHaveAttribute('href', YES24)
  await expect(policyItem.locator('.source-line')).toContainText(POLICY_CHECKED)
  // 가격 비교 카드의 확인일·출처도 가격 원문 기준
  await expect(page.locator('.price-card .source-line')).toContainText(PRICE_CHECKED)
  // W1: 공식 공지 + 합성 판매글 결과의 배지 도움말이 공식 자료까지 가상이라고 하지 않는다
  const badge = page.locator('section[aria-labelledby="result-step-title"] .badge-demo')
  await expect(badge).toHaveAttribute('title', /공식 가격·규정은 공지 스냅샷/)
  await expect(badge).not.toHaveAttribute('title', /실제 공연·가격·규정이 아닌/)
  await shot(page, 's4-compared-evidence', project)

  // 4. 확인값 수정 → 재대조 (적용값이 수정값으로 바뀌는지)
  await page.getByRole('button', { name: '추출값 수정' }).click()
  await page.getByLabel('1매 가격(원)').fill('200000')
  await page.getByRole('button', { name: /대조 결과/ }).click()
  await expect(page.getByText('추출값이 바뀌었습니다.')).toBeVisible()
  await page.getByRole('button', { name: '수정한 값으로 다시 대조' }).click()
  await expect(page.getByText('+24,000원')).toBeVisible()
  await expect(page.getByText('추출값이 바뀌었습니다.')).toHaveCount(0)
  await expect(page.locator('dl.applied')).toContainText('200,000원')
  await shot(page, 's5-recheck', project)
  expect(checks.at(-1)!.postDataJSON()).toMatchObject({ extractionMode: 'manual', confirmedFields: { price: 200000, bookingType: 'fanclub_presale' } })

  // 5-b. 회차 누락 → 보류, 5-c. 다른 공연 → 보류
  await page.getByRole('button', { name: '추출값 수정' }).click()
  await page.getByLabel('회차').selectOption('')
  await compareNow(page)
  await expect(page.getByText('회차가 없거나 선택한 공연의 회차와 일치하지 않습니다.').first()).toBeVisible()
  await expect(page.getByText(/공식 가격 대비/)).toHaveCount(0)
  await shot(page, 's6-held-showtime', project)

  await page.getByRole('button', { name: '추출값 수정' }).click()
  await page.getByLabel('회차').selectOption(`${EVENT_ID}-s1`)
  await page.getByLabel('선택한 공연에 대한 판매글인가요?').selectOption('other-event')
  await compareNow(page)
  await expect(page.getByText('판매글의 공연 일치 여부를 확인하세요.').first()).toBeVisible()
  await expect(page.getByText(/공식 가격 대비/)).toHaveCount(0)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  expect(errors).toEqual([])
  expect(applied(page)).toBeTruthy()
})
