import { searchKopis, type KopisPerformance } from '../server/src/kopis.ts'
import { ApiError } from '../server/src/errors.ts'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  KOPIS_API_KEY?: string
}
type Search = (key: string, query: string) => Promise<KopisPerformance[]>

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/** The map is isolate-local and best-effort; it is not an account-wide quota. */
export function createWorker(search: Search = searchKopis) {
  const limits = new Map<string, { count: number; until: number }>()
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url)
      if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
      if (url.pathname !== '/api/performances') return json(404, { code: 'NOT_FOUND', message: '요청 경로를 찾을 수 없습니다.', retryable: false })
      if (request.method !== 'GET') return json(405, { code: 'METHOD_NOT_ALLOWED', message: 'GET 요청만 사용할 수 있습니다.', retryable: false })
      const origin = request.headers.get('Origin')
      if (origin && origin !== url.origin) return json(403, { code: 'ORIGIN_NOT_ALLOWED', message: '허용되지 않은 웹 출처입니다.', retryable: false })

      const now = Date.now()
      for (const [key, value] of limits) if (value.until <= now) limits.delete(key)
      // Cloudflare supplies this header. Missing IPs share one bounded bucket.
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
      const entry = limits.get(ip) ?? { count: 0, until: now + 60_000 }
      entry.count++
      if (limits.size >= 10_000 && !limits.has(ip)) limits.delete(limits.keys().next().value!)
      limits.set(ip, entry)
      if (entry.count > 30) return json(429, { code: 'RATE_LIMITED', message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', retryable: true })

      try {
        return json(200, await search(env.KOPIS_API_KEY ?? '', (url.searchParams.get('q') ?? '').trim()))
      } catch (error) {
        if (error instanceof ApiError) return json(error.status, error.body())
        return json(502, { code: 'KOPIS_UNAVAILABLE', message: '공연정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', retryable: true })
      }
    },
  }
}

export default createWorker()
