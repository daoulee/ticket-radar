/** Public TEST-only checkout. Signed, expiring order tokens keep the amount server-authoritative across isolates. */
type Env = { TOSS_TEST_CLIENT_KEY?: string; TOSS_TEST_SECRET_KEY?: string }
type Payload = { id: string; amount: number; expires: number }
const catalog: Record<string, Record<string, { price: number; max: number }>> = {
  '레이더 라이브 2026': { VIP: { price: 154000, max: 12 }, R: { price: 132000, max: 3 } },
  '뮤지컬 나침반': { R: { price: 110000, max: 8 }, S: { price: 88000, max: 3 } },
}
const enc = new TextEncoder()
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
const unb64 = (s: string) => Uint8Array.from(atob(s.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0))
async function key(secret: string) { return crypto.subtle.importKey('raw', enc.encode(`ticket-radar-test-order-v1:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']) }
async function sign(data: Payload, secret: string) {
  const part = b64(enc.encode(JSON.stringify(data)))
  return `${part}.${b64(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), enc.encode(part))))}`
}
async function verify(token: string, secret: string): Promise<Payload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 2 || token.length > 1000 || !(await crypto.subtle.verify('HMAC', await key(secret), unb64(parts[1]), enc.encode(parts[0])))) return null
    const p = JSON.parse(new TextDecoder().decode(unb64(parts[0]))) as Payload
    if (!/^test-[a-f0-9-]{36}$/.test(p.id) || !Number.isSafeInteger(p.amount) || p.amount < 1000 || !Number.isSafeInteger(p.expires) || p.expires < Date.now()) return null
    return p
  } catch { return null }
}
async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.body || !request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 4096) { await reader.cancel(); return null } chunks.push(part.value) }
  const bytes = new Uint8Array(size); let at = 0; for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length }
  try { const x: unknown = JSON.parse(new TextDecoder().decode(bytes)); return x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : null } catch { return null }
}
export async function tossTest(request: Request, env: Env, upstream: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url); const ck = env.TOSS_TEST_CLIENT_KEY ?? ''; const sk = env.TOSS_TEST_SECRET_KEY ?? ''
  if (!ck.startsWith('test_gck_') || !sk.startsWith('test_gsk_')) return json(503, { message: '테스트 결제 설정을 확인할 수 없어요.' })
  if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return json(403, { message: '허용되지 않은 요청입니다.' })
  if (request.method === 'GET' && url.pathname === '/api/toss-test/config') return json(200, { mode: 'test', clientKey: ck })
  if (request.method !== 'POST' || !['/api/toss-test/prepare', '/api/toss-test/confirm'].includes(url.pathname)) return json(404, { message: '요청 경로를 찾을 수 없어요.' })
  if (request.headers.get('Origin') !== url.origin) return json(403, { message: '허용되지 않은 요청입니다.' })
  const data = await readBody(request); if (!data) return json(400, { message: '요청을 확인해 주세요.' })
  if (url.pathname.endsWith('/prepare')) {
    const { title, seat, kind, quantity, price, originalPrice } = data
    if (typeof title !== 'string' || !Object.hasOwn(catalog, title) || typeof seat !== 'string' || !Number.isSafeInteger(quantity) || !Number.isSafeInteger(price)) return json(400, { message: '시연 주문을 확인해 주세요.' })
    const grades = catalog[title]; const grade = seat.replace(/석$/, ''); const tier = Object.hasOwn(grades, grade) ? grades[grade] : undefined
    if (!tier || (quantity as number) < 1 || (quantity as number) > tier.max) return json(400, { message: '시연 좌석과 수량을 확인해 주세요.' })
    if (kind === 'primary_demo' ? price !== tier.price : kind === 'resale_demo' ? quantity !== 1 || !Number.isSafeInteger(originalPrice) || (originalPrice as number) < 1 || (price as number) < 1 || (price as number) > (originalPrice as number) || (price as number) > tier.price : true) return json(400, { message: '시연 가격을 확인해 주세요.' })
    const amount = (price as number) * (quantity as number)
    if (!Number.isSafeInteger(amount) || amount < 1000) return json(400, { message: '시연 결제 금액을 확인해 주세요.' })
    const order = { id: `test-${crypto.randomUUID()}`, amount, expires: Date.now() + 15 * 60_000 }
    return json(200, { orderId: order.id, amount, orderName: title, mode: 'test', orderToken: await sign(order, sk) })
  }
  const { orderId, paymentKey, amount, orderToken } = data
  if (typeof orderToken !== 'string' || typeof orderId !== 'string' || typeof paymentKey !== 'string' || paymentKey.length < 1 || paymentKey.length > 200 || !Number.isSafeInteger(amount)) return json(400, { message: '결제 정보를 확인해 주세요.' })
  const order = await verify(orderToken, sk)
  if (!order || order.id !== orderId || order.amount !== amount) return json(400, { message: '시연 주문을 확인하지 못했어요.' })
  try {
    const response = await upstream('https://api.tosspayments.com/v1/payments/confirm', { method: 'POST', headers: { Authorization: `Basic ${btoa(`${sk}:`)}`, 'Content-Type': 'application/json', 'Idempotency-Key': order.id }, body: JSON.stringify({ orderId, paymentKey, amount }), signal: AbortSignal.timeout(15000) })
    const result = await response.json() as { orderId?: unknown; paymentKey?: unknown; totalAmount?: unknown; status?: unknown }
    if (!response.ok || result.orderId !== orderId || result.paymentKey !== paymentKey || result.totalAmount !== amount || result.status !== 'DONE') return json(502, { message: '토스 테스트 결제를 승인하지 못했어요.' })
    return json(200, { status: 'DONE', mode: 'test' })
  } catch { return json(502, { message: '토스 테스트 서버에 연결하지 못했어요.' }) }
}
