import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ServerMarketplace } from './ServerMarketplace'

afterEach(() => vi.unstubAllGlobals())

it('서버 공연을 보고 계정으로 시연 주문 후 수령을 확인한다', async () => {
  const calls: { path: string; authorization: string | null; body: unknown }[] = []
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    calls.push({ path, authorization: new Headers(init?.headers).get('Authorization'), body: init?.body ? JSON.parse(String(init.body)) : null })
    let data: unknown = {}
    if (path === '/shows') data = [{ id: 'show1', title: '서버 공연', venue: '공연장', firstSession: '11월 25일', listingCount: 1 }]
    else if (path === '/auth/login') data = { token: 'test-token' }
    else if (path === '/shows/show1') data = { show: { id: 'show1', title: '서버 공연', sessions: [{ id: 's1', label: '11월 25일' }], facePrices: [{ seatGrade: '전석', price: 40000 }] }, listings: [{ id: 'l1', seatGrade: '전석', quantity: 1, pricePerTicket: 40000, isDemo: true, safety: { priceText: '정가와 같아요' } }] }
    else if (path === '/orders') data = { id: 'o1', status: 'sent' }
    else if (path === '/me/orders') data = [{ order: { id: 'o1', status: calls.some(c => c.path === '/orders/o1/confirm') ? 'settled' : 'sent', amount: 40000 }, role: 'buyer', show: { title: '서버 공연' } }]
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.type(screen.getByLabelText('아이디 또는 이메일'), 'fan@example.org')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '로그인' }))
  await screen.findByText('로그인했어요.')
  await user.click(await screen.findByRole('button', { name: /서버 공연/ }))
  await user.click(await screen.findByRole('button', { name: '시연 구매하기' }))
  await screen.findByText('시연 주문을 만들었어요. 내 거래에서 확인해 주세요.')
  await user.click(screen.getByRole('button', { name: '티켓 받았어요' }))
  expect(await screen.findByText('시연 거래가 완료됐어요.')).toBeInTheDocument()
  expect(calls.find(c => c.path === '/orders')?.authorization).toBe('Bearer test-token')
  expect(calls.find(c => c.path === '/orders')?.body).toEqual({ listingId: 'l1' })
})

it('서버 오류를 표시하고 공연 목록 재시도를 제공한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('네트워크 연결 실패')))
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('네트워크 연결 실패')
  await waitFor(() => expect(screen.getByRole('button', { name: '공연 목록 다시 불러오기' })).toBeEnabled())
})

it('시연 매물 등록에서 서버의 정가 초과 거절을 그대로 보여준다', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname
    if (path === '/listings') return new Response(JSON.stringify({ code: 'PRICE_ABOVE_FACE', message: '판매가는 확인된 기준 가격 이하여야 해요.' }), { status: 400 })
    const data = path === '/shows' ? [{ id: 'show1', title: '서버 공연', venue: '공연장', firstSession: null, listingCount: 0 }] : path === '/auth/login' ? { token: 'test-token' } : { show: { id: 'show1', title: '서버 공연', sessions: [{ id: 's1', label: '회차' }], facePrices: [{ seatGrade: '전석', price: 40000 }] }, listings: [] }
    return new Response(JSON.stringify(data), { status: 200 })
  }))
  const user = userEvent.setup()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.type(screen.getByLabelText('아이디 또는 이메일'), 'seller')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '로그인' }))
  await screen.findByText('로그인했어요.')
  await user.click(await screen.findByRole('button', { name: /서버 공연/ }))
  await user.type(await screen.findByLabelText('장당 가격'), '41000')
  await user.click(screen.getByRole('button', { name: '시연 매물 등록' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('판매가는 확인된 기준 가격 이하여야 해요.')
})
