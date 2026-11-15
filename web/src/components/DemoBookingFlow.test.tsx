import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { DemoBookingFlow } from './DemoBookingFlow'

const item = { kind: 'primary_demo' as const, title: '가상 공연', date: '시연 회차', seat: 'VIP석', price: 50000 }

it('가상 대기 건너뛰기 후 좌석 수를 지켜 시연 결제를 완료한다', async () => {
  const user = userEvent.setup()
  const onFinish = vi.fn()
  const onComplete = vi.fn()
  render(<DemoBookingFlow item={item} quantity={2} onBack={vi.fn()} onFinish={onFinish} onComplete={onComplete} />)
  expect(screen.getByText('가상 대기열 · 예매 시연')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '대기 건너뛰기' }))
  expect(screen.getByRole('button', { name: 'A3 좌석 · 선택 불가' })).toBeDisabled()
  expect(screen.getByRole('button', { name: /선택한 좌석 확인하기/ })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'A1 좌석' }))
  await user.click(screen.getByRole('button', { name: 'A2 좌석' }))
  await user.click(screen.getByRole('button', { name: 'A4 좌석' }))
  expect(screen.getByRole('button', { name: 'A4 좌석' })).toHaveAttribute('aria-pressed', 'false')
  await user.click(screen.getByRole('button', { name: /선택한 좌석 확인하기/ }))
  expect(screen.getByText('VIP석 · A1, A2')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /시연 결제 계속하기/ }))
  await user.click(screen.getByRole('radio', { name: '계좌이체' }))
  await user.click(screen.getByRole('button', { name: '100,000원 시연 결제하기' }))
  expect(screen.getByRole('heading', { name: '시연 결제를 처리하고 있어요' })).toBeInTheDocument()
  expect(onComplete).not.toHaveBeenCalled()
  expect(await screen.findByRole('heading', { name: '시연 결제가 완료됐어요' }, { timeout: 3000 })).toBeInTheDocument()
  expect(onComplete).toHaveBeenCalledExactlyOnceWith('VIP석 · A1, A2')
  expect(screen.getByText('계좌이체')).toBeInTheDocument()
  expect(screen.getByText(/실제 결제·좌석 예약·티켓 발급은 이뤄지지 않았어요/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '다른 티켓 둘러보기' }))
  expect(onFinish).toHaveBeenCalledOnce()
})

it('대기를 건너뛰지 않으면 짧은 대기 후 좌석 화면이 표시된다', () => {
  vi.useFakeTimers()
  try {
    render(<DemoBookingFlow item={item} quantity={1} onBack={vi.fn()} onFinish={vi.fn()} onComplete={vi.fn()} />)
    act(() => vi.advanceTimersByTime(2500))
    expect(screen.getByRole('heading', { name: '어디에서 관람할까요?' })).toBeInTheDocument()
  } finally { vi.useRealTimers() }
})

it('처리 중 이전 화면으로 돌아가면 시연 완료가 기록되지 않는다', () => {
  vi.useFakeTimers()
  try {
    const onComplete = vi.fn()
    render(<DemoBookingFlow item={{ ...item, kind: 'resale_demo' }} quantity={1} onBack={vi.fn()} onFinish={vi.fn()} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: /시연 결제 계속하기/ }))
    fireEvent.click(screen.getByRole('button', { name: /시연 결제하기/ }))
    expect(screen.getByRole('heading', { name: '시연 결제를 처리하고 있어요' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '← 이전으로' }))
    act(() => vi.advanceTimersByTime(2000))
    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: '결제 방법을 선택해 주세요' })).toBeInTheDocument()
  } finally { vi.useRealTimers() }
})
