import { signProxyClient } from '../shared/proxy-auth.ts'

const BACKEND = 'https://ticketradar-shared-staging.daoule-6b5.workers.dev'
const COOKIE = '__Host-ticketradar-session'
const MAX_BODY = 16_384
const COOKIE_ATTRIBUTES = 'Path=/; Secure; HttpOnly; SameSite=Strict'

function json(status: number, body: unknown, cookie?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(JSON.stringify(body), { status, headers })
}
const clearCookie = `${COOKIE}=; ${COOKIE_ATTRIBUTES}; Max-Age=0`
function readCookie(request: Request): string | null {
  const matches = (request.headers.get('Cookie') ?? '').split(';').map(x => x.trim()).filter(x => x.startsWith(`${COOKIE}=`))
  if (matches.length !== 1) return null
  const token = matches[0].slice(COOKIE.length + 1)
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null
}
function validRoute(method: string, path: string) {
  if (method === 'GET') return path === '/me' || path === '/me/orders' || path === '/shows' || path === '/test-payments/config' || /^\/(?:shows|listings|orders)\/[^/]{1,100}$/.test(path)
  if (method === 'POST') return ['/auth/login', '/auth/signup', '/auth/logout', '/auth/availability', '/auth/email/send', '/listings', '/listings/preview', '/orders', '/test-payments/prepare', '/test-payments/confirm', '/test-payments/cancel', '/test-payments/reconcile'].includes(path) || /^\/orders\/[^/]{1,100}\/(?:sent|confirm|cancel)$/.test(path)
  return false
}
async function readBody(request: Request): Promise<Uint8Array | null> {
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return null
  if (!request.body) return new Uint8Array()
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const { value, done } = await reader.read(); if (done) break
    size += value.byteLength; if (size > MAX_BODY) { await reader.cancel(); return null }
    chunks.push(value)
  }
  const out = new Uint8Array(size); let offset = 0
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.byteLength }
  return out
}

/** Same-origin cookie gateway. Never returns the upstream bearer token to the browser. */
export async function sharedMarket(request: Request, upstream: typeof fetch = fetch, proxySecret = ''): Promise<Response> {
  const incoming = new URL(request.url)
  const path = incoming.pathname.slice('/api/shared'.length)
  const upgrade = request.method === 'POST' && path === '/auth/session-upgrade'
  if (!upgrade && !validRoute(request.method, path)) return json(404, { message: '요청 경로를 찾을 수 없습니다.' })
  if (request.method !== 'GET' && request.headers.get('Origin') !== incoming.origin) return json(403, { message: '허용되지 않은 요청입니다.' })
  const existing = readCookie(request)
  const authorization = request.headers.get('Authorization') ?? ''
  const candidate = upgrade ? (authorization.startsWith('Bearer ') ? authorization.slice(7) : null) : existing
  if (upgrade && (existing || !candidate || !/^[A-Za-z0-9_-]{43}$/.test(candidate))) return json(400, { message: '기존 로그인 정보를 확인할 수 없어요.' })
  const headers = new Headers({ Accept: 'application/json', Origin: 'https://ticketradar.month32.workers.dev' })
  if (candidate) headers.set('Authorization', `Bearer ${candidate}`)
  let body: Uint8Array | undefined
  if (request.method === 'POST' && !upgrade) {
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return json(415, { message: '요청 형식을 확인해 주세요.' })
    const value = await readBody(request); if (!value) return json(413, { message: '요청이 너무 큽니다.' })
    body = value; headers.set('Content-Type', 'application/json')
  }
  const target = new URL(upgrade ? '/me' : path, BACKEND); if (!upgrade) target.search = incoming.search
  const ip = request.headers.get('CF-Connecting-IP') ?? '', timestamp = String(Date.now()), method = upgrade ? 'GET' : request.method
  try {
    const signature = await signProxyClient(proxySecret, ip, timestamp, method, `${target.pathname}${target.search}`)
    headers.set('X-TR-Proxy-IP', ip); headers.set('X-TR-Proxy-Time', timestamp); headers.set('X-TR-Proxy-Signature', signature)
  } catch { return json(503, { message: '서버 연결 설정을 확인해 주세요.' }) }
  let response: Response
  try { response = await upstream(target, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(15_000) }) }
  catch { return json(503, { message: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' }) }
  if (response.status >= 300 && response.status < 400) return json(502, { message: '서버 응답을 확인하지 못했어요.' })
  let data: unknown
  try { data = await response.json() } catch { return json(502, { message: '서버 응답을 확인하지 못했어요.' }) }
  const login = path === '/auth/login' || path === '/auth/signup'
  if (response.ok && (login || upgrade)) {
    const value = data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : {}
    const token = upgrade ? candidate : value.token
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || (upgrade && (typeof value.id !== 'string' || !value.id))) return json(502, { message: '로그인 응답을 확인하지 못했어요.' })
    const expiry = upgrade ? 7 * 86400 : Math.max(0, Math.min(7 * 86400, Math.floor((Date.parse(String(value.expiresAt)) - Date.now()) / 1000)))
    if (!Number.isFinite(expiry) || expiry <= 0) return json(502, { message: '로그인 만료 시간을 확인하지 못했어요.' })
    return json(200, { authenticated: true }, `${COOKIE}=${token}; ${COOKIE_ATTRIBUTES}; Max-Age=${expiry}`)
  }
  const shouldClear = path === '/auth/logout' && (response.ok || response.status === 401) || response.status === 401 && !!existing && !login && !upgrade
  return json(response.status, data, shouldClear ? clearCookie : undefined)
}
