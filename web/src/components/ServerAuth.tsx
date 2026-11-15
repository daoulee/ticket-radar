import { useState, type FormEvent } from 'react'
import { isValidNewPassword, PASSWORD_RULE_MESSAGE } from '../../../shared/password-policy'

export type ServerRequest = <T>(path: string, method?: string, body?: unknown, auth?: string | null) => Promise<T>
type Check = { value: string; available: boolean }

/** 같은 거래 서버의 계정을 사용합니다. 인증번호의 진위와 계정 중복은 서버에서 최종 확인합니다. */
export function ServerAuth({ request, onAuthenticated }: { request: ServerRequest; onAuthenticated: (token: string, signup: boolean) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [identity, setIdentity] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [emailCheck, setEmailCheck] = useState<Check | null>(null)
  const [nameCheck, setNameCheck] = useState<Check | null>(null)
  const [sentEmail, setSentEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const cleanEmail = email.trim()
  const cleanName = name.trim()
  const emailConfirmed = !!emailCheck?.available && emailCheck.value === cleanEmail
  const nameConfirmed = !!nameCheck?.available && nameCheck.value === cleanName
  const canSignup = emailConfirmed && nameConfirmed && sentEmail === cleanEmail && /^\d{6}$/.test(code) && isValidNewPassword(password)

  async function run(action: () => Promise<void>) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : '요청을 처리하지 못했어요.') } finally { setBusy(false) }
  }
  async function check(kind: 'email' | 'name') {
    const value = kind === 'email' ? cleanEmail : cleanName
    if (!value) return
    await run(async () => {
      const result = await request<{ available: boolean }>('/auth/availability', 'POST', { kind, value })
      if (typeof result.available !== 'boolean') throw new Error('중복 확인 결과를 확인할 수 없어요.')
      const checked = { value, available: result.available }
      if (kind === 'email') setEmailCheck(checked); else setNameCheck(checked)
    })
  }
  async function sendCode() {
    if (!emailConfirmed) return
    const target = cleanEmail
    await run(async () => { await request('/auth/email/send', 'POST', { email: target }); setSentEmail(target); setCode(''); setNotice('인증번호를 보냈어요. 이메일을 확인해 주세요.') })
  }
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'signup' && !canSignup) { setError(!isValidNewPassword(password) ? PASSWORD_RULE_MESSAGE : '중복 확인과 이메일 인증번호를 확인해 주세요.'); return }
    await run(async () => {
      const body = mode === 'signup' ? { name: cleanName, email: cleanEmail, password, verificationCode: code } : { ...(identity.trim().includes('@') ? { email: identity.trim() } : { name: identity.trim() }), password }
      const result = await request<{ token: string }>(mode === 'signup' ? '/auth/signup' : '/auth/login', 'POST', body)
      if (typeof result.token !== 'string' || !result.token) throw new Error('로그인 응답을 확인할 수 없어요.')
      setPassword(''); setCode(''); onAuthenticated(result.token, mode === 'signup')
    })
  }
  function changeMode(next: 'login' | 'signup') { setMode(next); setError(''); setNotice(''); setPassword(''); setCode('') }
  return <section className="market-auth" aria-label="계정">
    <div className="market-auth-tabs" aria-label="계정 메뉴"><button type="button" className="market-text-button" aria-label="로그인 탭" aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>로그인</button><button type="button" className="market-text-button" aria-label="회원가입 탭" aria-pressed={mode === 'signup'} onClick={() => changeMode('signup')}>회원가입</button></div>
    <form key={mode} className="market-form" onSubmit={submit}>
      {mode === 'login' ? <label>아이디 또는 이메일<input value={identity} onChange={e => setIdentity(e.target.value)} autoComplete="username" required /></label> : <>
        <label>이메일<input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailCheck(null); setSentEmail(''); setCode('') }} autoComplete="email" required /></label>
        <button className="market-outline" type="button" disabled={busy || !cleanEmail} onClick={() => void check('email')}>이메일 중복 확인</button>
        {emailCheck?.value === cleanEmail && <p role="status">{emailCheck.available ? '사용할 수 있는 이메일이에요.' : '이미 사용 중인 이메일이에요.'}</p>}
        <button className="market-outline" type="button" disabled={busy || !emailConfirmed} onClick={() => void sendCode()}>{sentEmail === cleanEmail && cleanEmail ? '인증번호 다시 받기' : '인증번호 받기'}</button>
        {sentEmail === cleanEmail && cleanEmail && <label>인증번호<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required /></label>}
        <label>닉네임<input value={name} onChange={e => { setName(e.target.value); setNameCheck(null) }} minLength={2} maxLength={20} autoComplete="nickname" required /></label>
        <button className="market-outline" type="button" disabled={busy || cleanName.length < 2} onClick={() => void check('name')}>닉네임 중복 확인</button>
        {nameCheck?.value === cleanName && <p role="status">{nameCheck.available ? '사용할 수 있는 닉네임이에요.' : '이미 사용 중인 닉네임이에요.'}</p>}
      </>}
      <label>비밀번호<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
      {mode === 'signup' && <p className="market-form-help">{PASSWORD_RULE_MESSAGE}</p>}
      {error && <p role="alert" className="market-form-error">{error}</p>}{notice && <p role="status">{notice}</p>}
      <button className="market-outline" disabled={busy || (mode === 'signup' && !canSignup)}>{busy ? '처리 중…' : mode === 'signup' ? '가입하고 시작하기' : '로그인'}</button>
    </form>
  </section>
}
