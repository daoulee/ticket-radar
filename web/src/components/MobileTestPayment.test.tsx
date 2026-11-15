import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MobileTestPayment, MobileTestPaymentReturn } from './MobileTestPayment'

const order = { orderId: 'ord-synthetic-1', providerOrderId: `trtest_${'a'.repeat(32)}`, amount: 99000, mode: 'test' as const }
afterEach(() => { sessionStorage.clear(); delete window.TossPayments; vi.unstubAllGlobals(); history.replaceState(null, '', '/') })

it('앱의 일회성 연결을 교환하고 주소에서 제거한 뒤 테스트 결제를 준비한다', async () => {
  history.replaceState(null, '', `/mobile-test-payment#code=${'x'.repeat(43)}`)
  const widgets = { setAmount: vi.fn().mockResolvedValue(undefined), renderPaymentMethods: vi.fn().mockResolvedValue(undefined), renderAgreement: vi.fn().mockResolvedValue(undefined), requestPayment: vi.fn().mockResolvedValue(undefined) }
  window.TossPayments = vi.fn(() => ({ widgets: () => widgets }))
  const fetchMock = vi.fn(async (input: string | URL | Request) => String(input).endsWith('/exchange') ? Response.json(order) : Response.json({ mode: 'test', clientKey: 'test_gck_synthetic' }))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<StrictMode><MobileTestPayment /></StrictMode>)
  await user.click(await screen.findByRole('button', { name: '테스트 결제 준비' }))
  expect(await screen.findByRole('button', { name: '토스 테스트 결제하기' })).toBeEnabled()
  expect(widgets.setAmount).toHaveBeenCalledWith({ currency: 'KRW', value: 99000 })
  expect(location.hash).toBe('')
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/exchange'))).toHaveLength(1)
})

it('반환 금액이 다르면 모바일 테스트 결제를 승인하지 않는다', () => {
  sessionStorage.setItem('ticketradar.mobile-test-payment', JSON.stringify(order))
  history.replaceState(null, '', `/mobile-toss-return?status=success&orderId=${order.providerOrderId}&paymentKey=synthetic&amount=1`)
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
  render(<MobileTestPaymentReturn />)
  expect(screen.getByText('결제 정보를 확인하지 못했어요')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('서버가 승인한 뒤에만 완료와 앱 복귀 링크를 보여준다', async () => {
  sessionStorage.setItem('ticketradar.mobile-test-payment', JSON.stringify(order))
  history.replaceState(null, '', `/mobile-toss-return?status=success&orderId=${order.providerOrderId}&paymentKey=synthetic&amount=99000`)
  const fetchMock = vi.fn(async () => Response.json({ orderId: order.orderId, status: 'sent', mode: 'test' })); vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<StrictMode><MobileTestPaymentReturn /></StrictMode>)
  await user.click(screen.getByRole('button', { name: '결제 결과 확인' }))
  expect(await screen.findByText('테스트 결제가 완료됐어요')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('link', { name: '앱으로 돌아가기' })).toHaveAttribute('href', 'ticketradar:///order/ord-synthetic-1'))
  expect(sessionStorage.getItem('ticketradar.mobile-test-payment')).toBeNull()
  expect(fetchMock).toHaveBeenCalledOnce()
})

it('모바일 승인 응답이 끊기면 상태 조회 후에만 완료를 표시한다', async () => {
  sessionStorage.setItem('ticketradar.mobile-test-payment', JSON.stringify(order))
  history.replaceState(null, '', `/mobile-toss-return?status=success&orderId=${order.providerOrderId}&paymentKey=synthetic&amount=99000`)
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => String(input).endsWith('/confirm') ? Response.json({ message: 'uncertain' }, { status: 503 }) : Response.json({ orderId: order.orderId, paymentStatus: 'approved', status: 'sent', mode: 'test' })))
  const user = userEvent.setup()
  render(<MobileTestPaymentReturn />)
  await user.click(screen.getByRole('button', { name: '결제 결과 확인' }))
  await screen.findByRole('alert')
  expect(screen.queryByText('테스트 결제가 완료됐어요')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '결제 상태 조회' }))
  expect(await screen.findByText('테스트 결제가 완료됐어요')).toBeInTheDocument()
})
