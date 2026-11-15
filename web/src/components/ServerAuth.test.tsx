import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ServerAuth, type ServerRequest } from './ServerAuth'

function setup(available = true) {
  const request = vi.fn(async (path: string) => path === '/auth/availability' ? { available } : path === '/auth/signup' ? { token: 'test-token' } : { ok: true })
  const done = vi.fn()
  render(<ServerAuth request={request as ServerRequest} onAuthenticated={done} />)
  return { request, done, user: userEvent.setup() }
}

it('이메일·닉네임 확인과 인증번호 후 서버 가입 계약을 사용한다', async () => {
  const { user, request, done } = setup()
  await user.click(screen.getByRole('button', { name: '회원가입 탭' }))
  await user.type(screen.getByLabelText('이메일'), 'fan@example.org')
  await user.click(screen.getByRole('button', { name: '이메일 중복 확인' }))
  expect(await screen.findByText('사용할 수 있는 이메일이에요.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
  await user.type(await screen.findByLabelText('인증번호'), '123456')
  await user.type(screen.getByLabelText('닉네임'), '팬이에요')
  await user.click(screen.getByRole('button', { name: '닉네임 중복 확인' }))
  await screen.findByText('사용할 수 있는 닉네임이에요.')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '가입하고 시작하기' }))
  expect(request).toHaveBeenCalledWith('/auth/signup', 'POST', { name: '팬이에요', email: 'fan@example.org', password: 'Password1!', verificationCode: '123456' })
  expect(done).toHaveBeenCalledWith('test-token', true)
})

it('중복된 이메일은 인증 요청과 가입을 막는다', async () => {
  const { user, request } = setup(false)
  await user.click(screen.getByRole('button', { name: '회원가입 탭' }))
  await user.type(screen.getByLabelText('이메일'), 'used@example.org')
  await user.click(screen.getByRole('button', { name: '이메일 중복 확인' }))
  expect(await screen.findByText('이미 사용 중인 이메일이에요.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '인증번호 받기' })).toBeDisabled()
  expect(screen.getByRole('button', { name: '가입하고 시작하기' })).toBeDisabled()
  expect(request).not.toHaveBeenCalledWith('/auth/email/send', expect.anything(), expect.anything())
})

it('확인한 이메일을 바꾸면 인증 요청 상태를 초기화한다', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: '회원가입 탭' }))
  await user.type(screen.getByLabelText('이메일'), 'first@example.org')
  await user.click(screen.getByRole('button', { name: '이메일 중복 확인' }))
  await user.click(await screen.findByRole('button', { name: '인증번호 받기' }))
  expect(await screen.findByLabelText('인증번호')).toBeInTheDocument()
  await user.type(screen.getByLabelText('이메일'), 'x')
  expect(screen.queryByLabelText('인증번호')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '인증번호 받기' })).toBeDisabled()
})

it('서버의 인증 메일 실패를 표시하고 인증번호 입력을 열지 않는다', async () => {
  const request = vi.fn(async (path: string) => { if (path === '/auth/availability') return { available: true }; throw new Error('인증 메일을 보내지 못했어요.') })
  render(<ServerAuth request={request as ServerRequest} onAuthenticated={vi.fn()} />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: '회원가입 탭' }))
  await user.type(screen.getByLabelText('이메일'), 'fan@example.org')
  await user.click(screen.getByRole('button', { name: '이메일 중복 확인' }))
  await user.click(await screen.findByRole('button', { name: '인증번호 받기' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('인증 메일을 보내지 못했어요.')
  expect(screen.queryByLabelText('인증번호')).not.toBeInTheDocument()
})

it('인증 서버가 잘못된 코드를 거부하면 로그인하지 않는다', async () => {
  const request = vi.fn(async (path: string) => { if (path === '/auth/availability') return { available: true }; if (path === '/auth/signup') throw new Error('인증번호를 확인해 주세요.'); return { ok: true } })
  const done = vi.fn(); render(<ServerAuth request={request as ServerRequest} onAuthenticated={done} />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: '회원가입 탭' }))
  await user.type(screen.getByLabelText('이메일'), 'fan@example.org')
  await user.click(screen.getByRole('button', { name: '이메일 중복 확인' }))
  await user.click(await screen.findByRole('button', { name: '인증번호 받기' }))
  await user.type(await screen.findByLabelText('인증번호'), '123456')
  await user.type(screen.getByLabelText('닉네임'), '팬이에요')
  await user.click(screen.getByRole('button', { name: '닉네임 중복 확인' }))
  await screen.findByText('사용할 수 있는 닉네임이에요.')
  await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
  await user.click(screen.getByRole('button', { name: '가입하고 시작하기' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('인증번호를 확인해 주세요.')
  expect(done).not.toHaveBeenCalled()
})
