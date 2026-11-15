import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TossTestReturn } from './TossTestCheckout'

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); history.replaceState(null, '', '/') })

it('서버가 테스트 승인 성공을 확인한 경우에만 완료를 표시하고 중복 요청을 막는다', async () => {
  sessionStorage.setItem('aid-toss-test-order', 'test-order-1')
  history.replaceState(null, '', '/toss-test-return?status=success&orderId=test-order-1&paymentKey=key-1&amount=100000')
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ mode: 'test', status: 'DONE' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  render(<StrictMode><TossTestReturn /></StrictMode>)
  expect(await screen.findByRole('heading', { name: '테스트 결제가 완료됐어요' })).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(location.search).toBe('')
})

it('다른 주문이나 실패 반환이면 승인 API를 호출하지 않는다', async () => {
  sessionStorage.setItem('aid-toss-test-order', 'test-order-2')
  history.replaceState(null, '', '/toss-test-return?status=success&orderId=other&paymentKey=key-2&amount=100000')
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
  render(<TossTestReturn />)
  expect(await screen.findByRole('heading', { name: '테스트 결제를 완료하지 못했어요' })).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})
