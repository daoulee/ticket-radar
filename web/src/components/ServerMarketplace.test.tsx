import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ServerMarketplace } from './ServerMarketplace'

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear() })

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
  let submitted: unknown = null
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    if (path === '/listings') { submitted = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ code: 'PRICE_ABOVE_FACE', message: '판매가는 확인된 기준 가격 이하여야 해요.' }), { status: 400 }) }
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
  await user.type(await screen.findByLabelText('원구매가'), '41000')
  await user.type(await screen.findByLabelText('장당 가격'), '41000')
  expect(screen.getByLabelText('장당 가격')).toHaveValue('41,000')
  await user.click(screen.getByRole('button', { name: '시연 매물 등록' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('판매가는 확인된 기준 가격 이하여야 해요.')
  expect(submitted).toMatchObject({ pricePerTicket: 41000 })
})

it('같은 탭에서 다시 열면 서버에서 세션을 확인하고 로그아웃 시 제거한다', async () => {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname
    const data = path === '/auth/login' ? { token: 'synthetic-token' } : path === '/me' ? { id: 'synthetic-user' } : path === '/shows' ? [] : { ok: true }
    return new Response(JSON.stringify(data), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  const first = render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.type(await screen.findByLabelText('아이디 또는 이메일'), 'test@example.test')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '로그인' }))
  await screen.findByRole('button', { name: '로그아웃' })
  first.unmount()
  const second = render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await screen.findByRole('button', { name: '로그아웃' })
  expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/me'))).toBe(true)
  await user.click(screen.getByRole('button', { name: '로그아웃' }))
  await screen.findByText('로그아웃했어요.')
  second.unmount()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  expect(await screen.findByLabelText('아이디 또는 이메일')).toBeInTheDocument()
})

it('일시적 오류에는 세션을 지우지 않고 재시도하며 만료된 세션은 제거한다', async () => {
  sessionStorage.setItem('ticketradar.web-session:http://server.test', 'synthetic-token')
  let mode: 'offline' | 'expired' = 'offline'
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname
    if (path === '/shows') return new Response('[]', { status: 200 })
    if (mode === 'offline') throw new Error('offline')
    return new Response(JSON.stringify({ message: '만료됨' }), { status: 401 })
  }))
  const user = userEvent.setup()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await screen.findByText(/로그인 상태를 확인하지 못했어요/)
  expect(sessionStorage.getItem('ticketradar.web-session:http://server.test')).toBe('synthetic-token')
  mode = 'expired'
  await user.click(screen.getByRole('button', { name: '다시 시도' }))
  await screen.findByText('로그인이 만료됐어요. 다시 로그인해 주세요.')
  expect(sessionStorage.getItem('ticketradar.web-session:http://server.test')).toBeNull()
})

it('사용 중 세션이 만료되면 저장된 세션을 지우고 다시 로그인하도록 한다', async () => {
  sessionStorage.setItem('ticketradar.web-session:http://server.test', 'synthetic-token')
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname
    if (path === '/me/orders') return new Response(JSON.stringify({ message: '로그인이 만료됐어요.' }), { status: 401 })
    return new Response(JSON.stringify(path === '/me' ? { id: 'test-user' } : []), { status: 200 })
  }))
  const user = userEvent.setup()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.click(await screen.findByRole('button', { name: '내 거래' }))
  expect(await screen.findByLabelText('아이디 또는 이메일')).toBeInTheDocument()
  expect(sessionStorage.getItem('ticketradar.web-session:http://server.test')).toBeNull()
})

it('쿠키 모드에서는 토큰을 탭 저장소에 남기지 않고 서버 세션을 복원한다', async () => {
  let signedIn = false
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input), 'https://example.test').pathname
    if (path === '/api/shared/shows') return new Response('[]', { status: 200 })
    if (path === '/api/shared/auth/login') { signedIn = true; return Response.json({ authenticated: true }) }
    if (path === '/api/shared/auth/logout') { signedIn = false; return Response.json({ ok: true }) }
    if (path === '/api/shared/me') return signedIn ? Response.json({ id: 'fake-user' }) : Response.json({ message: '로그인이 필요해요.' }, { status: 401 })
    return new Response('{}', { status: 200 })
  }))
  const user = userEvent.setup()
  const first = render(<ServerMarketplace baseUrl="/api/shared" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.type(await screen.findByLabelText('아이디 또는 이메일'), 'fake@example.test')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '로그인' }))
  await screen.findByRole('button', { name: '로그아웃' })
  expect(sessionStorage.length).toBe(0)
  first.unmount()
  render(<ServerMarketplace baseUrl="/api/shared" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await screen.findByRole('button', { name: '로그아웃' })
  await user.click(screen.getByRole('button', { name: '로그아웃' }))
  await screen.findByLabelText('아이디 또는 이메일')
})

it('기존 탭 세션을 서버 검증 후 쿠키로 전환하고 기존 토큰을 지운다', async () => {
  const oldKey = 'ticketradar.web-session:https://ticketradar-shared-staging.daoule-6b5.workers.dev'
  sessionStorage.setItem(oldKey, 'a'.repeat(43))
  let upgradeAuthorization = ''
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = new URL(String(input), 'https://example.test').pathname
    if (path === '/api/shared/shows') return new Response('[]', { status: 200 })
    if (path === '/api/shared/me') return Response.json({ message: 'no cookie' }, { status: 401 })
    if (path === '/api/shared/auth/session-upgrade') { upgradeAuthorization = new Headers(init?.headers).get('Authorization') ?? ''; return Response.json({ authenticated: true }) }
    return new Response('{}', { status: 200 })
  }))
  render(<ServerMarketplace baseUrl="/api/shared" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await screen.findByRole('button', { name: '로그아웃' })
  expect(upgradeAuthorization).toBe(`Bearer ${'a'.repeat(43)}`)
  expect(sessionStorage.getItem(oldKey)).toBeNull()
})

it('승인되지 않은 테스트 결제는 전달 대기가 아닌 결제 대기로 표시한다', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname
    const data = path === '/auth/login' ? { token: 'synthetic-token' } : path === '/shows' ? [] : path === '/me/orders' ? [{ order: { id: 'order-test', status: 'held', amount: 99000, testPayment: { status: 'pending' } }, role: 'seller', show: { title: '가상 공연' } }] : {}
    return Response.json(data)
  }))
  const user = userEvent.setup()
  render(<ServerMarketplace baseUrl="http://server.test" onSafety={vi.fn()} onPerformances={vi.fn()} />)
  await user.type(await screen.findByLabelText('아이디 또는 이메일'), 'seller')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '로그인' }))
  await user.click(await screen.findByRole('button', { name: '내 거래' }))
  expect(await screen.findByText(/테스트 결제 대기/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '전달했어요' })).not.toBeInTheDocument()
})
