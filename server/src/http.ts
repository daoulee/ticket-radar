import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { EventListSchema, OfficialContextSchema } from '../../shared/index.ts';
import { CheckService } from './service.ts';
import { ApiError } from './errors.ts';
import { searchKopis, type KopisPerformance } from './kopis.ts';
import { fetchKopisDetail, searchKopisCards } from './kopis-cards.ts';
import { parseReportRequest, ReportService } from './reports.ts';
import { handleMarket, MarketService } from './market.ts';
import { EmailVerification, verificationSenderFromEnv } from './email-verification.ts';
import { LoginGuard } from './login-guard.ts';

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
// 호출 제한용 클라이언트 주소(TODO 검토 ⑥). 기본은 소켓 주소. TRUST_PROXY=1 일 때만(신뢰하는 프록시·터널 뒤) X-Forwarded-For 첫 주소를 쓴다.
// 프록시 없이 TRUST_PROXY 를 켜면 헤더 위조로 제한을 피할 수 있으므로 기본은 끔.
export function clientIp(req: IncomingMessage, trustProxy = process.env.TRUST_PROXY === '1'): string {
  if (trustProxy) {
    const xff = req.headers['x-forwarded-for'];
    const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim();
    if (first && first.length <= 64) return first;
  }
  return req.socket.remoteAddress ?? 'unknown';
}
function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}
async function readJson(req: IncomingMessage): Promise<unknown> {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new ApiError('UNSUPPORTED_MEDIA_TYPE', 'application/json 형식이 필요합니다.', 415);
  if (Number(req.headers['content-length'] ?? 0) > 16384) throw new ApiError('PAYLOAD_TOO_LARGE', '요청 크기 제한을 초과했습니다.', 413);
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) {
    const b = Buffer.from(chunk); size += b.length;
    if (size > 16384) throw new ApiError('PAYLOAD_TOO_LARGE', '요청 크기 제한을 초과했습니다.', 413);
    chunks.push(b);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError('INVALID_JSON', 'JSON 요청을 읽지 못했습니다.'); }
}

export function createApi(service: CheckService, origins = DEFAULT_ORIGINS, kopisSearch: (query: string) => Promise<KopisPerformance[]> = query => searchKopis(process.env.KOPIS_API_KEY ?? '', query), reports = new ReportService(), market = new MarketService(), verification = new EmailVerification(verificationSenderFromEnv(process.env), Date.now, { dailyTotal: Number(process.env.EMAIL_DAILY_LIMIT) || undefined }), loginGuard = new LoginGuard(), kopisDetail = (id: string) => fetchKopisDetail(process.env.KOPIS_API_KEY ?? '', id)) {
  const limits = new Map<string, { count: number; until: number }>();
  const server = createServer(async (req, res) => {
    res.setHeader('Vary', 'Origin');
    try {
      const origin = req.headers.origin;
      if (origin && !origins.includes(origin)) throw new ApiError('ORIGIN_NOT_ALLOWED', '허용되지 않은 웹 출처입니다.', 403);
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') {
        send(res, 200, { status: 'ok', contractVersion: '0.1.0', aiConfigured: service.aiConfigured }); return;
      }
      if (req.method === 'GET' && url.pathname === '/events') {
        const query = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase();
        if (query.length > 200) throw new ApiError('BAD_REQUEST', '검색어가 너무 깁니다.');
        send(res, 200, EventListSchema.parse(service.entries.filter(e => [e.event.title, ...e.aliases].some(t => t.toLocaleLowerCase().includes(query))).map(e => e.event))); return;
      }
      if (req.method === 'GET' && url.pathname === '/performance-cards') {
        const now = Date.now();
        for (const [key, val] of limits) if (val.until <= now) limits.delete(key);
        const ip = `performance-cards:${clientIp(req)}`;
        const limit = limits.get(ip) ?? { count: 0, until: now + 60_000 };
        limit.count++; limits.set(ip, limit);
        if (limit.count > 30) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
        const category = url.searchParams.get('category');
        if (category !== null && category !== 'concert' && category !== 'musical') throw new ApiError('BAD_REQUEST', '공연 분류를 확인해 주세요.');
        const rawPage = url.searchParams.get('page') ?? '1';
        if (!/^[1-9]\d{0,2}$/.test(rawPage)) throw new ApiError('BAD_REQUEST', '공연 목록 페이지를 확인해 주세요.');
        send(res, 200, await searchKopisCards(process.env.KOPIS_API_KEY ?? '', { category: category ?? undefined, page: Number(rawPage) })); return;
      }
      const performanceDetail = url.pathname.match(/^\/performance-cards\/(PF\d{1,12})$/);
      const prepareDemo = url.pathname.match(/^\/performance-cards\/(PF\d{1,12})\/demo-market$/);
      if (req.method === 'POST' && prepareDemo) {
        market.userOf(req);
        if (prepareDemo[1] !== 'PF305681') throw new ApiError('DEMO_NOT_AVAILABLE', '이 공연의 시연은 아직 준비되지 않았어요.', 409);
        const now = Date.now(), ip = `kopis-demo:${clientIp(req)}`;
        const limit = limits.get(ip) ?? { count: 0, until: now + 60_000 };
        if (limit.until <= now) { limit.count = 0; limit.until = now + 60_000; }
        if (++limit.count > 10) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
        limits.set(ip, limit);
        const detail = await kopisDetail(prepareDemo[1]);
        send(res, 200, market.tx(() => market.prepareKopisDemo(detail))); return;
      }
      if (req.method === 'GET' && performanceDetail) {
        const now = Date.now();
        for (const [key, val] of limits) if (val.until <= now) limits.delete(key);
        const ip = `performance-detail:${clientIp(req)}`;
        const limit = limits.get(ip) ?? { count: 0, until: now + 60_000 };
        limit.count++; limits.set(ip, limit);
        if (limit.count > 30) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
        send(res, 200, await fetchKopisDetail(process.env.KOPIS_API_KEY ?? '', performanceDetail[1])); return;
      }
      if (req.method === 'GET' && url.pathname === '/performances') {
        const now = Date.now();
        for (const [key, val] of limits) if (val.until <= now) limits.delete(key);
        const ip = `performances:${clientIp(req)}`;
        const limit = limits.get(ip) ?? { count: 0, until: now + 60_000 };
        limit.count++; limits.set(ip, limit);
        if (limit.count > 30) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
        const query = (url.searchParams.get('q') ?? '').trim();
        send(res, 200, await kopisSearch(query)); return;
      }
      const context = url.pathname.match(/^\/events\/([^/]+)\/official-context$/);
      if (req.method === 'GET' && context) {
        let id: string;
        try { id = decodeURIComponent(context[1]); } catch { throw new ApiError('BAD_REQUEST', '공연 식별자가 올바르지 않습니다.'); }
        const entry = service.entries.find(e => e.event.id === id);
        if (!entry) throw new ApiError('EVENT_NOT_FOUND', '선택한 공연을 찾을 수 없습니다.', 404);
        send(res, 200, OfficialContextSchema.parse(entry.context)); return;
      }
      if (req.method === 'POST' && url.pathname === '/checks') {
        const now = Date.now();
        for (const [key, val] of limits) if (val.until <= now) limits.delete(key);
        const ip = clientIp(req);
        const limit = limits.get(ip) ?? { count: 0, until: now + 60_000 };
        limit.count++; limits.set(ip, limit);
        if (limit.count > 30) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
        send(res, 200, await service.check(await readJson(req))); return;
      }
      // 제보·주최 측 제보함(APP-021, reports.ts). 호출량 제한은 위와 같은 IP별 1분 창을 쓴다.
      const limited = (key: string, max: number, windowMs = 60_000) => {
        const now = Date.now();
        for (const [k, v] of limits) if (v.until <= now) limits.delete(k);
        const l = limits.get(key) ?? { count: 0, until: now + windowMs };
        l.count++; limits.set(key, l);
        if (l.count > max) throw new ApiError('RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 재시도하세요.', 429, true);
      };
      const ip = clientIp(req);
      if (req.method === 'POST' && url.pathname === '/auth/availability') {
        limited(`availability:${ip}`, 20);
        // 가입 여부 대량 조회 완화(WEB-020): 분당 20회에 더해 시간당 60회.
        limited(`availability-hour:${ip}`, 60, 3600_000);
        const body = await readJson(req) as Record<string, unknown>;
        send(res, 200, market.checkAvailability(body?.kind, body?.value)); return;
      }
      if (req.method === 'POST' && url.pathname === '/auth/email/send') {
        limited(`email-send:${ip}`, 5);
        const body = await readJson(req) as Record<string, unknown>;
        await verification.send(body?.email);
        send(res, 200, { ok: true }); return;
      }
      if (req.method === 'POST' && url.pathname === '/auth/signup') {
        limited(`auth:${ip}`, 20);
        const body = await readJson(req) as Record<string, unknown>;
        market.validateSignup(body);
        // 보안(APP-031): 가입은 기본적으로 이메일 인증 필수. 예전에는 본문에 email 이 있을 때만 검사해서
        // {name,password} 만 보내면 인증 없이 가입됐다. 로컬 테스트용 예외는 ALLOW_SIGNUP_WITHOUT_EMAIL=1 로 명시할 때만.
        const allowNoEmail = process.env.ALLOW_SIGNUP_WITHOUT_EMAIL === '1';
        const hasEmail = !!body && Object.hasOwn(body, 'email');
        if (!hasEmail && !allowNoEmail) throw new ApiError('EMAIL_REQUIRED', '이메일 인증 후 가입할 수 있어요.');
        if (hasEmail && !verification.verify(body.email, body.verificationCode)) {
          throw new ApiError('EMAIL_VERIFICATION_REQUIRED', '인증번호를 확인해 주세요.');
        }
        send(res, 201, market.tx(() => market.signup(body))); return;
      }
      if (req.method === 'POST' && url.pathname === '/reports') {
        limited(`reports:${ip}`, 10);
        const { report, duplicate } = reports.create(parseReportRequest(await readJson(req), new Set(service.entries.map(e => e.event.id))));
        send(res, duplicate ? 200 : 201, { reportId: report.id, status: report.status, createdAt: report.createdAt, duplicate }); return;
      }
      if (req.method === 'POST' && url.pathname === '/organizer/login') {
        limited(`login:${ip}`, 10);
        send(res, 200, reports.login(await readJson(req))); return;
      }
      if (req.method === 'POST' && url.pathname === '/organizer/logout') {
        reports.authorize(req); reports.logout(reports.tokenOf(req)); send(res, 200, { ok: true }); return;
      }
      if (url.pathname.startsWith('/organizer/')) limited(`organizer:${ip}`, 120);
      if (req.method === 'GET' && url.pathname === '/organizer/reports') {
        const account = reports.authorize(req);
        send(res, 200, reports.list(account, (url.searchParams.get('event_id') ?? '').trim())); return;
      }
      const one = url.pathname.match(/^\/organizer\/reports\/([0-9a-f-]{36})(\/export)?$/i);
      if (one && req.method === 'GET') {
        const account = reports.authorize(req);
        if (one[2]) send(res, 200, { format: 'text', content: reports.exportText(account, one[1]) });
        else send(res, 200, reports.get(account, one[1]));
        return;
      }
      if (one && !one[2] && req.method === 'PATCH') {
        const account = reports.authorize(req);
        send(res, 200, reports.update(account, one[1], await readJson(req))); return;
      }
      // 중개 구매 플랫폼(시연, APP-024, market.ts). 로그인·가입은 IP별 1분 20회.
      if (url.pathname.startsWith('/auth/')) limited(`auth:${ip}`, 20);
      else if (req.method !== 'GET') limited(`market:${ip}`, 120);
      // 계정별 로그인 실패 잠금(WEB-020): 같은 계정에 5회 실패하면 15분 잠금. 본문은 한 번만 읽어 market 처리기에 넘긴다.
      if (req.method === 'POST' && url.pathname === '/auth/login') {
        const body = await readJson(req);
        const key = LoginGuard.keyOf(body);
        loginGuard.check(key);
        try {
          const result = market.login(body);
          loginGuard.success(key);
          send(res, 200, result); return;
        } catch (error) {
          if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') loginGuard.fail(key);
          throw error;
        }
      }
      const handled = await handleMarket(market, req, url, () => readJson(req));
      if (handled) { send(res, handled.status, handled.body); return; }
      throw new ApiError('NOT_FOUND', '요청 경로를 찾을 수 없습니다.', 404);
    } catch (error) {
      if (res.writableEnded || res.destroyed) return;
      const safe = error instanceof ApiError ? error : new ApiError('INTERNAL_ERROR', '서버가 응답을 처리하지 못했습니다.', 500, true);
      send(res, safe.status, safe.body());
    }
  });
  server.requestTimeout = 10_000; server.headersTimeout = 10_000;
  return server;
}
