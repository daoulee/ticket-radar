import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError } from './api/client'
import { createDemoApi } from './api/demoApi'
import { withKopisPerformances } from './api/kopisDemoApi'
import { DEMO_SCENARIOS } from './demo/fixtures'

// 화면 문구가 진위·입장·위법을 확정하지 않는지 확인한다. 판매글 원문 인용(data-source="listing")은 제외한다.
const FORBIDDEN = ['사기입니다', '사기 확정', '암표 확정', '진짜 티켓', '정품', '입장 가능합니다', '입장할 수 있습니다', '안전한 티켓', '안전합니다', '위험도', '매크로 판매자']

function uiTextWithoutListingQuotes() {
  const clone = document.body.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[data-source="listing"], textarea').forEach((el) => el.remove())
  return clone.textContent ?? ''
}

function setup(options: Parameters<typeof createDemoApi>[0] = {}) {
  const api = createDemoApi({ latencyMs: 0, ...options })
  const user = userEvent.setup()
  render(<App api={api} />)
  return { api, user }
}

async function pickEvent(user: ReturnType<typeof userEvent.setup>, title: RegExp = /레이더 라이브/) {
  // 새 메인(홈)에서 시작한 뒤 공연을 고른다
  const start = screen.queryByRole('button', { name: /서비스 체험하러 가기/ })
  if (start) await user.click(start)
  const safety = screen.queryByRole('button', { name: /판매글 안심 확인/ })
  if (safety) await user.click(safety)
  await user.click(await screen.findByRole('button', { name: title }))
}

async function extractSample(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(await screen.findByRole('button', { name: label }))
  await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))
  await screen.findByRole('heading', { name: '3. 추출 정보 확인·수정' })
}

// 가격 비교 조건 4개를 사용자가 직접 확인한다 (웹은 자동으로 채우지 않는다).
async function confirmBasePriceConditions(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('선택한 공연에 대한 판매글인가요?'), 'demo-radar-live')
  await user.selectOptions(screen.getByLabelText('가격 기준'), 'per_ticket')
  await user.selectOptions(screen.getByLabelText('수수료 포함 여부'), 'ticket_only')
  await user.selectOptions(screen.getByLabelText('할인 여부'), 'standard')
}

async function compare(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '이 값으로 공식 자료와 대조' }))
  return screen.findByRole('heading', { name: '4. 공식 자료 대조 결과' })
}

describe('티켓레이더 웹 핵심 흐름 (시연 데이터)', () => {
  it('소개에서 예매·양도와 이용 흐름을 안심 확인보다 먼저 보여주고 시연 한계를 밝힌다', () => {
    setup()
    const market = document.getElementById('market-intro')!
    const flow = document.getElementById('market-flow')!
    const safety = document.getElementById('phone-scene')!
    expect(market.compareDocumentPosition(flow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(flow.compareDocumentPosition(safety) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(market).toHaveTextContent('공식 판매 권한과 실제 재고는 연결되지 않았어요')
    expect(flow).toHaveTextContent('실제 결제·예약·티켓 이전은 진행되지 않아요')
    expect(flow).toHaveTextContent('구매가의 진위와 티켓 보유 여부는 검증하지 않아요')
  })
  it('실제 공연은 기간·출처와 대조 불가 상태를 보여주고 시연으로 둔갑시키지 않는다', async () => {
    const sample = { id: 'PF123', title: '실제 공연 테스트', venue: '공연장', startsOn: '2026-11-01', endsOn: '2026-11-30', status: '공연중', source: 'KOPIS', fetchedAt: '2026-11-03T00:00:00.000Z' }
    const api = withKopisPerformances(createDemoApi({ latencyMs: 0 }), vi.fn(async () => new Response(JSON.stringify([sample]))) as unknown as typeof fetch)
    const user = userEvent.setup()
    render(<App api={api} />)
    await user.click(screen.getByRole('button', { name: '바로 체험하기' }))
    await user.click(screen.getByRole('button', { name: /실제 공연 찾아보기/ }))
    await user.click(await screen.findByRole('button', { name: /실제 공연 테스트/ }))
    expect(screen.getByText(/공연 기간 2026-11-01 ~ 2026-11-30/)).toBeInTheDocument()
    expect(screen.getByText(/이 공연의 공식 가격·입장 규정과 AI 분석 연결은 준비 중/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공식 자료와 AI 연결 준비 중' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: /시연용으로 작성한 합성 판매글/ })).not.toBeChecked()
  })
  it('공연 선택 → 판매글 → 추출값 확인 → 대조 결과까지 원문·공식 근거·확인 시각을 보여준다 (T01·T04)', async () => {
    const { user } = setup()
    expect(screen.getByText('티켓 예시 · 가상')).toBeInTheDocument()

    await pickEvent(user)
    expect(await screen.findByRole('heading', { name: '공식 자료' })).toBeInTheDocument()
    expect(await screen.findByText('154,000원')).toBeInTheDocument()

    await extractSample(user, '예시 1 · 가격 차이와 캡처 전달')
    expect(screen.getByLabelText('1매 가격(원)')).toHaveValue(230000)
    expect(screen.getByLabelText('좌석 등급')).toHaveValue('VIP')
    expect(screen.getAllByText('230,000원', { selector: 'q' }).length).toBeGreaterThan(0)
    // 가격 비교 조건은 자동으로 채우지 않는다
    expect(screen.getByLabelText('가격 기준')).toHaveValue('')
    expect(screen.getByLabelText('선택한 공연에 대한 판매글인가요?')).toHaveValue('')

    // 조건을 확인하지 않고 대조하면 가격 비교는 보류된다
    await compare(user)
    expect(screen.getByText('공연 일치·가격 기준·수수료·할인 조건이 확인되지 않아 가격 비교를 보류합니다.')).toBeInTheDocument()
    expect(screen.queryByText('+76,000원')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '추출값 수정' }))
    await confirmBasePriceConditions(user)
    await compare(user)
    expect(screen.getByText('+76,000원')).toBeInTheDocument()
    expect(screen.getByText(/\+49\.4%/)).toBeInTheDocument()

    const findings = screen.getByRole('list', { name: '확인할 점 목록' })
    const pickup = within(findings).getByText('전달 방식이 공식 입장 안내와 다름').closest('li')!
    expect(within(pickup).getByText('공식 안내와 다른 설명')).toBeInTheDocument()
    expect(within(pickup).getByText(/QR 캡처 바로 보내드려요/, { selector: 'q' })).toBeInTheDocument()
    expect(within(pickup).getByText(/캡처 화면으로는 입장할 수 없습니다/)).toBeInTheDocument()
    expect(within(pickup).getByRole('link', { name: '공식 근거 (시연용 예시 링크)' })).toHaveAttribute('href', expect.stringContaining('example.com'))
    expect(within(pickup).getByText(/확인 2026\. 10\. 28\. 09:00 KST/)).toBeInTheDocument()

    const text = uiTextWithoutListingQuotes()
    for (const phrase of FORBIDDEN) expect(text).not.toContain(phrase)
  })

  it('결과 후 가격을 고치면 이전 결과를 수정 전 값 기준으로 표시하고, 다시 대조하면 새 결과로 바뀐다 (T05)', async () => {
    const { user } = setup()
    await pickEvent(user)
    await extractSample(user, '예시 1 · 가격 차이와 캡처 전달')
    await confirmBasePriceConditions(user)
    await compare(user)

    await user.click(screen.getByRole('button', { name: '추출값 수정' }))
    const price = screen.getByLabelText('1매 가격(원)')
    await user.clear(price)
    await user.type(price, '154000')
    expect(within(screen.getByLabelText('1매 가격(원)').closest('.field-row')!).getByText('직접 수정함')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /대조 결과/ }))
    expect(screen.getByText('추출값이 바뀌었습니다.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '수정한 값으로 다시 대조' }))
    expect(await screen.findByText('공식 가격과 같은 판매가')).toBeInTheDocument()
    expect(screen.queryByText('추출값이 바뀌었습니다.')).not.toBeInTheDocument()
    expect(screen.getByText(/공식 가격 대비/).textContent).toContain('0원')
  })

  it('좌석 등급이 모호하면 가격 비교를 보류하고, 사용자가 등급·가격을 확정하면 비교한다 (T02·T03)', async () => {
    const { user } = setup()
    await pickEvent(user)
    await extractSample(user, '예시 2 · 좌석 등급이 모호한 글')
    expect(screen.getAllByText('후보 여러 개')).toHaveLength(2)
    expect(screen.getByText(/확인 불가 항목 9개/)).toBeInTheDocument()

    await compare(user)
    expect(screen.getAllByText('가격 비교 보류').length).toBeGreaterThan(0)
    expect(screen.getByText('좌석 등급과 1매 가격이 확인되지 않아 가격 비교를 보류합니다.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '추출값 수정' }))
    await user.selectOptions(screen.getByLabelText('좌석 등급'), 'R')
    await user.type(screen.getByLabelText('1매 가격(원)'), '125000')
    await confirmBasePriceConditions(user)
    await compare(user)
    expect(screen.getByText('−7,000원')).toBeInTheDocument()
    expect(screen.getByText(/−5\.3%/)).toBeInTheDocument()
  })

  it('빈 판매글은 요청하지 않고 입력 안내를 보여준다 (T06)', async () => {
    const { api, user } = setup()
    const spy = vi.spyOn(api, 'createCheck')
    await pickEvent(user)
    await user.click(await screen.findByRole('button', { name: '판매글에서 정보 추출' }))
    expect(screen.getByRole('alert')).toHaveTextContent('판매글을 붙여넣거나 입력하세요.')
    expect(spy).not.toHaveBeenCalled()
  })

  it('API 실패 시 성공 결과를 만들지 않고 오류와 재시도를 보여준다 (T06)', async () => {
    const { user } = setup({ failOnce: ['checks'] })
    await pickEvent(user)
    await user.click(await screen.findByRole('button', { name: '예시 1 · 가격 차이와 캡처 전달' }))
    await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))

    const alert = await screen.findByText('판매글을 분석하지 못했습니다')
    expect(alert.closest('[role="alert"]')).toHaveTextContent('DEMO_FORCED_FAILURE')
    expect(screen.queryByRole('heading', { name: '3. 추출 정보 확인·수정' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('heading', { name: '3. 추출 정보 확인·수정' })).toBeInTheDocument()
  })

  it('공식 자료가 없는 공연은 확인 불가·가격 비교 보류로 표시한다', async () => {
    const { user } = setup()
    await pickEvent(user, /뮤지컬 나침반/)
    expect(await screen.findByText(/등록된 공식 가격이 없습니다/)).toBeInTheDocument()

    await user.type(screen.getByLabelText('판매글 내용'), '나침반 12/5 R석 1장 15만원')
    await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))
    await screen.findByRole('heading', { name: '3. 추출 정보 확인·수정' })
    await compare(user)
    expect(screen.getByText('이 공연의 공식 가격 자료가 등록되지 않아 가격 비교를 보류합니다.')).toBeInTheDocument()
    expect(screen.getByText('공식 입장·양도 규정 확인 불가')).toBeInTheDocument()
  })

  it('판매글 속 스크립트·지시문은 텍스트로만 표시하고 실행하지 않는다 (T07)', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { user } = setup()
    await pickEvent(user)
    await extractSample(user, '예시 3 · 가격이 없는 글')
    await compare(user)

    expect(document.querySelectorAll('main script')).toHaveLength(0)
    expect(alertSpy).not.toHaveBeenCalled()
    expect(screen.getByText('판매글 안의 지시문과 스크립트는 실행하지 않고 텍스트로만 다뤘습니다.')).toBeInTheDocument()
    expect(screen.getByText('판매가가 확인되지 않아 가격 비교를 보류합니다.')).toBeInTheDocument()
    expect(uiTextWithoutListingQuotes()).not.toContain('안전하다고 표시')
  })

  it('시연 데이터에 없는 판매글은 추출 결과를 지어내지 않고 모든 값을 확인 불가로 둔다', async () => {
    const { user } = setup()
    await pickEvent(user)
    await user.type(screen.getByLabelText('판매글 내용'), '직접 쓴 판매글입니다')
    await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))
    await screen.findByRole('heading', { name: '3. 추출 정보 확인·수정' })
    expect(screen.getAllByText('판매글에서 찾지 못함')).toHaveLength(12)
    expect(screen.getByText(/예시 판매글에만 미리 준비된 추출 결과가 있습니다/)).toBeInTheDocument()
  })

  it('시연 시나리오 fixture는 모두 isDemo 응답으로 돌아온다', async () => {
    const api = createDemoApi({ latencyMs: 0 })
    for (const scenario of DEMO_SCENARIOS) {
      const res = await api.createCheck({ eventId: scenario.eventId, listingText: scenario.listingText, confirmedFields: scenario.results[0].fields })
      expect(res.isDemo).toBe(true)
      expect(res.dataMode).toBe('demo')
      for (const f of res.findings) if (f.type === 'policy' && f.officialExcerpt) expect(f.sourceUrl && f.checkedAt).toBeTruthy()
    }
  })

  it('추출 방식을 표시한다: 시연 모드는 AI 호출 없음으로 보인다', async () => {
    const { user } = setup()
    await pickEvent(user)
    await extractSample(user, '예시 1 · 가격 차이와 캡처 전달')
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent('시연 fixture 조회 · AI 호출 없음')
  })

  it('AI 미설정 오류는 fixture 결과로 대체하지 않고, 사용자가 고르면 직접 입력으로 대조한다', async () => {
    const api = createDemoApi({ latencyMs: 0 })
    const realCreate = api.createCheck.bind(api)
    const createSpy = vi.fn(async (req: Parameters<typeof api.createCheck>[0]) => {
      if (!req.confirmedFields) throw new ApiError({ code: 'AI_NOT_CONFIGURED', message: 'AI 추출 제공자가 설정되지 않았습니다.', retryable: false })
      return realCreate(req)
    })
    api.createCheck = createSpy
    const user = userEvent.setup()
    render(<App api={api} />)
    await pickEvent(user)
    await user.click(await screen.findByRole('button', { name: '예시 1 · 가격 차이와 캡처 전달' }))
    await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))

    const alert = (await screen.findByText('판매글을 분석하지 못했습니다')).closest('[role="alert"]') as HTMLElement
    expect(alert).toHaveTextContent('AI_NOT_CONFIGURED')
    expect(within(alert).queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '3. 추출 정보 확인·수정' })).not.toBeInTheDocument()

    await user.click(within(alert).getByRole('button', { name: 'AI 추출 없이 직접 입력' }))
    expect(screen.getByTestId('extraction-mode')).toHaveTextContent('AI 추출 없음 · 사용자가 직접 입력')
    expect(screen.getAllByText('판매글에서 찾지 못함')).toHaveLength(12)
    expect(screen.getByLabelText('1매 가격(원)')).toHaveValue(null)

    await user.selectOptions(screen.getByLabelText('좌석 등급'), 'VIP')
    await user.type(screen.getByLabelText('1매 가격(원)'), '230000')
    await compare(user)
    const lastCall = createSpy.mock.calls.at(-1)![0]
    expect(lastCall).toMatchObject({ extractionMode: 'manual', confirmedFields: { seatGrade: 'VIP', price: 230000 } })
    expect(lastCall.previousCheckId).toBeUndefined()
    expect(screen.getAllByTestId('extraction-mode').at(-1)).toHaveTextContent('AI 추출 없음 · 사용자가 직접 입력')
    expect(screen.getByText('230,000원', { selector: 'dd' })).toBeInTheDocument()
  })

  it('서버 추출 후 수정·재대조는 previousCheckId 와 12개 확인값 전체를 보낸다', async () => {
    const { api, user } = setup()
    const spy = vi.spyOn(api, 'createCheck')
    await pickEvent(user)
    await extractSample(user, '예시 1 · 가격 차이와 캡처 전달')
    const first = await spy.mock.results[0].value
    expect(spy.mock.calls[0][0]).toMatchObject({ syntheticListing: true })
    expect(spy.mock.calls[0][0].confirmedFields).toBeUndefined()

    await confirmBasePriceConditions(user)
    await compare(user)
    const recheck = spy.mock.calls[1][0]
    expect(recheck.previousCheckId).toBe(first.checkId)
    expect(recheck.extractionMode).toBeUndefined()
    expect(Object.keys(recheck.confirmedFields!).sort()).toHaveLength(12)
    expect(recheck.confirmedFields).toMatchObject({ price: 230000, listingEventId: 'demo-radar-live', priceBasis: 'per_ticket', bookingType: null })
  })
})

describe('늦은 검사 응답 무효화', () => {
  it('추출 중 원문을 바꾸면 이전 응답으로 확인 화면을 열지 않는다', async () => {
    const api = createDemoApi({ latencyMs: 0 })
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const original = api.createCheck
    api.createCheck = async (request) => { const response = await original(request); await gate; return response }
    const user = userEvent.setup()
    render(<App api={api} />)
    await pickEvent(user)
    await user.click(screen.getByRole('button', { name: '예시 1 · 가격 차이와 캡처 전달' }))
    await user.click(screen.getByRole('button', { name: '판매글에서 정보 추출' }))
    await user.clear(screen.getByLabelText('판매글 내용'))
    await user.type(screen.getByLabelText('판매글 내용'), '다른 판매글')
    const { act } = await import('@testing-library/react')
    await act(async () => { release(); await gate })
    expect(screen.queryByRole('heading', { name: '3. 추출 정보 확인·수정' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('판매글 내용')).toHaveValue('다른 판매글')
  })

  it('서비스 소개에서 예매·양도 시연으로 이동하고 안심 확인에 진입한다', async () => {
    const { user } = setup()
    expect(screen.getByRole('heading', { name: /구매가 그대로 만나는 방법/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '판매글은 보통 이렇게 생겼어요' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '결정은 당신이, 근거는 저희가' })).toBeInTheDocument()
    expect(screen.getByText('진짜 티켓인지 인증하지 않아요.')).toBeInTheDocument()
    expect(screen.getAllByText('가상 공연 예시').length).toBeGreaterThan(0)
    expect(screen.queryByRole('navigation', { name: '진행 단계' })).not.toBeInTheDocument()
    expect(await screen.findByText('[시연] 레이더 라이브 2026 (가상 공연)')).toBeInTheDocument()
    expect(screen.getByText('외 1개 공연은 다음 단계에서 고를 수 있어요.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '1. 공연 선택' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /서비스 체험하러 가기/ }))
    expect(screen.getByRole('heading', { name: /구매가 그대로 만나요/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /판매글 안심 확인/ }))
    expect(screen.getByRole('heading', { name: '1. 공연 선택' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '진행 단계' })).toBeInTheDocument()
  })
})
