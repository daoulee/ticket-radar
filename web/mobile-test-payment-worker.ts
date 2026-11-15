import { signProxyClient } from '../shared/proxy-auth.ts'

const BACKEND = 'https://ticketradar-shared-staging.daoule-6b5.workers.dev'
const COOKIE = '__Host-ticketradar-test-payment'
const ATTRS = 'Path=/; Secure; HttpOnly; SameSite=Strict'
const clearCookie = `${COOKIE}=; ${ATTRS}; Max-Age=0`
function json(status: number, value: unknown, cookie?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(JSON.stringify(value), { status, headers })
}
function scopedCookie(request: Request) {
  const matches = (request.headers.get('Cookie') ?? '').split(';').map(x => x.trim()).filter(x => x.startsWith(`${COOKIE}=`))
  if (matches.length !== 1) return null
  const value = matches[0].slice(COOKIE.length + 1)
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null
}
async function bodyBytes(request: Request) {
  if (Number(request.headers.get('Content-Length') ?? 0) > 4096) return null
  if (!request.body) return new Uint8Array()
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 4096) { await reader.cancel(); return null }; chunks.push(part.value) }
  const out = new Uint8Array(size); let offset = 0
  for (const part of chunks) { out.set(part, offset); offset += part.byteLength }
  return out
}

/** Scoped payment-only cookie; never forwards a general web or app login session. */
export async function mobileTestPayment(request: Request, upstream: typeof fetch = fetch, proxySecret = '') {
  const url = new URL(request.url), path = url.pathname.slice('/api/mobile-test-payment'.length)
  const routes: Record<string, string> = { '/exchange': '/test-payments/mobile-exchange', '/config': '/test-payments/mobile-config', '/confirm': '/test-payments/mobile-confirm', '/cancel': '/test-payments/mobile-cancel', '/reconcile': '/test-payments/mobile-reconcile' }
  if (!Object.hasOwn(routes, path) || (path === '/config' ? request.method !== 'GET' : request.method !== 'POST')) return json(404, { message: '요청 경로를 찾을 수 없습니다.' })
  if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json(403, { message: '허용되지 않은 요청입니다.' })
  const token = scopedCookie(request)
  if (path !== '/exchange' && !token) return json(401, { message: '결제 연결이 만료됐어요.' }, clearCookie)
  const headers = new Headers({ Accept: 'application/json', Origin: 'https://ticketradar.month32.workers.dev' })
  if (token && path !== '/exchange') headers.set('Authorization', `Bearer ${token}`)
  let body: Uint8Array | undefined
  if (request.method === 'POST') {
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return json(415, { message: '요청 형식을 확인해 주세요.' })
    const value = await bodyBytes(request); if (!value) return json(413, { message: '요청이 너무 큽니다.' })
    body = value; headers.set('Content-Type', 'application/json')
  }
  const ip = request.headers.get('CF-Connecting-IP') ?? '', timestamp = String(Date.now())
  try {
    headers.set('X-TR-Proxy-IP', ip); headers.set('X-TR-Proxy-Time', timestamp)
    headers.set('X-TR-Proxy-Signature', await signProxyClient(proxySecret, ip, timestamp, request.method, routes[path]))
  } catch { return json(503, { message: '서버 연결 설정을 확인해 주세요.' }) }
  let response: Response
  try { response = await upstream(new URL(routes[path], BACKEND), { method: request.method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(15_000) }) }
  catch { return json(503, { message: '서버에 연결하지 못했어요.' }) }
  if (response.status >= 300 && response.status < 400) return json(502, { message: '서버 응답을 확인하지 못했어요.' })
  let result: unknown
  try { result = await response.json() } catch { return json(502, { message: '서버 응답을 확인하지 못했어요.' }) }
  if (path === '/exchange' && response.ok) {
    const value = result && typeof result === 'object' && !Array.isArray(result) ? result as Record<string, unknown> : {}
    if (typeof value.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value.token) || typeof value.orderId !== 'string' || typeof value.providerOrderId !== 'string' || !Number.isSafeInteger(value.amount) || value.mode !== 'test') return json(502, { message: '결제 연결을 확인하지 못했어요.' })
    return json(200, { orderId: value.orderId, providerOrderId: value.providerOrderId, amount: value.amount, mode: 'test' }, `${COOKIE}=${value.token}; ${ATTRS}; Max-Age=900`)
  }
  const terminalReconciliation = path === '/reconcile' && response.ok && !!result && typeof result === 'object' && 'paymentStatus' in result && (result.paymentStatus === 'approved' || result.paymentStatus === 'cancelled')
  return json(response.status, result, response.status === 401 || ((path === '/cancel' || path === '/confirm') && response.ok) || terminalReconciliation ? clearCookie : undefined)
}
