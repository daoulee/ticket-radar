import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { SharedTossCheckout, SharedTossReturn } from './SharedTossCheckout'
import type { ServerRequest } from './ServerAuth'

const pending = { orderId: 'ord-test', providerOrderId: `trtest_${'a'.repeat(32)}`, amount: 99000, mode: 'test' as const }
afterEach(() => { sessionStorage.clear(); delete window.TossPayments; vi.unstubAllGlobals(); history.replaceState(null, '', '/') })

it('사용자가 준비를 누른 후 서버 가격으로 테스트 결제를 준비하고 취소하면 예약을 해제한다', async () => {
  const widgets = { setAmount: vi.fn().mockResolvedValue(undefined), renderPaymentMethods: vi.fn().mockResolvedValue(undefined), renderAgreement: vi.fn().mockResolvedValue(undefined), requestPayment: vi.fn() }
  window.TossPayments = vi.fn(() => ({ widgets: () => widgets }))
  const request = vi.fn(async (path: string) => path.endsWith('/config') ? { mode: 'test', clientKey: 'test_gck_synthetic' } : path.endsWith('/prepare') ? pending : { status: 'cancelled', mode: 'test' }) as unknown as ServerRequest
  const back = vi.fn(), user = userEvent.setup()
  render(<SharedTossCheckout item={{ id: 'listing-test', pricePerTicket: 99000, quantity: 1 }} title="가상 공연" request={request} token="synthetic" onBack={back} />)
  expect(request).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: '테스트 결제 준비' }))
  await screen.findByRole('button', { name: '토스 테스트 결제하기' })
  expect(widgets.setAmount).toHaveBeenCalledWith({ currency: 'KRW', value: 99000 })
  await user.click(screen.getByRole('button', { name: /매물로 돌아가기/ }))
  await waitFor(() => expect(back).toHaveBeenCalledOnce())
  expect(request).toHaveBeenCalledWith('/test-payments/cancel', 'POST', { orderId: 'ord-test' }, 'synthetic')
})

it('반환 금액이 다르면 서버 승인 요청을 하지 않는다', () => {
  sessionStorage.setItem('ticketradar.shared-test-payment', JSON.stringify(pending))
  history.replaceState(null, '', `/shared-toss-return?status=success&orderId=${pending.providerOrderId}&paymentKey=synthetic&amount=1`)
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
  render(<SharedTossReturn />)
  expect(screen.getByText('주문 정보를 확인하지 못했어요')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('서버가 테스트 승인을 확인한 경우에만 완료를 표시하고 반환값을 지운다', async () => {
  sessionStorage.setItem('ticketradar.shared-test-payment', JSON.stringify(pending))
  history.replaceState(null, '', `/shared-toss-return?status=success&orderId=${pending.providerOrderId}&paymentKey=synthetic&amount=99000`)
  const fetchMock = vi.fn(async () => Response.json({ orderId: pending.orderId, status: 'sent', mode: 'test' })); vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<StrictMode><SharedTossReturn /></StrictMode>)
  await user.click(screen.getByRole('button', { name: '결제 결과 확인' }))
  expect(await screen.findByText('테스트 결제가 완료됐어요')).toBeInTheDocument()
  expect(sessionStorage.getItem('ticketradar.shared-test-payment')).toBeNull()
  expect(fetchMock).toHaveBeenCalledOnce()
})

it('승인 응답을 잃으면 성공으로 표시하지 않고 서버 상태 조회로 복구한다', async () => {
  sessionStorage.setItem('ticketradar.shared-test-payment', JSON.stringify(pending))
  history.replaceState(null, '', `/shared-toss-return?status=success&orderId=${pending.providerOrderId}&paymentKey=synthetic&amount=99000`)
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => String(input).endsWith('/confirm') ? Response.json({ message: 'uncertain' }, { status: 503 }) : Response.json({ orderId: pending.orderId, paymentStatus: 'approved', status: 'sent', mode: 'test' })))
  const user = userEvent.setup()
  render(<SharedTossReturn />)
  await user.click(screen.getByRole('button', { name: '결제 결과 확인' }))
  await screen.findByRole('alert')
  expect(screen.queryByText('테스트 결제가 완료됐어요')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '결제 상태 조회' }))
  expect(await screen.findByText('테스트 결제가 완료됐어요')).toBeInTheDocument()
})
