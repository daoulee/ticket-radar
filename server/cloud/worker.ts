// Isolated staging adapter. This configuration has no public route and is disabled by default.
import { DurableObject, WorkerEntrypoint } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { MarketService } from '../src/market.ts';
import { createApi } from '../src/http.ts';
import { CheckService } from '../src/service.ts';
import { EmailVerification, gmailApiSender } from '../src/email-verification.ts';
import { LoginGuard } from '../src/login-guard.ts';
import { RequestLimiter } from '../src/request-limit.ts';
import { inspectMigration, migrateToEmptyStore } from '../src/market-migration.ts';
import { searchKopis } from '../src/kopis.ts';
import { searchKopisCards, fetchKopisDetail } from '../src/kopis-cards.ts';
import { cloudOrganizerAccounts, ReportService } from '../src/reports.ts';
import { verifyProxyClient } from '../../shared/proxy-auth.ts';
import { SharedTestPayment } from '../src/shared-test-payment.ts';
import { TestPaymentHandoffs } from '../src/test-payment-handoff.ts';
import { cloudAiProvider } from '../src/cloud-ai.ts';

type Env = {
  MARKET: DurableObjectNamespace;
  STAGING_ENABLED?: string;
  GMAIL_USER?: string;
  GMAIL_OAUTH_CLIENT_ID?: string;
  GMAIL_OAUTH_CLIENT_SECRET?: string;
  GMAIL_OAUTH_REFRESH_TOKEN?: string;
  KOPIS_API_KEY?: string;
  ORGANIZER_ACCOUNTS?: string;
  REPORTS_ENABLED?: string;
  WEB_PROXY_SECRET?: string;
  SHARED_TOSS_TEST_ENABLED?: string;
  TOSS_TEST_CLIENT_KEY?: string;
  TOSS_TEST_SECRET_KEY?: string;
  EXTRACTION_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  AI_MODEL?: string;
  AI_FALLBACK_MODELS?: string;
};

export class SharedMarket extends DurableObject<Env> {
  private handler: ReturnType<typeof httpServerHandler> | null = null;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  // Only accessible to Workers with this Durable Object binding, never through HTTP.
  // Run before serving traffic: a loaded MarketService must not retain stale state.
  importSnapshot(raw: string) {
    if (this.env.STAGING_ENABLED !== '1' || this.handler) throw new Error('Migration unavailable');
    const store = {
      load: () => (this.ctx.storage.kv.get('market') as string | null) ?? null,
      save: (value: string) => { this.ctx.storage.kv.put('market', value); },
    };
    return this.ctx.storage.transactionSync(() => migrateToEmptyStore(raw, store));
  }
  inspectSnapshot() {
    if (this.env.STAGING_ENABLED !== '1') throw new Error('Migration unavailable');
    const raw = this.ctx.storage.kv.get('market');
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== 'string') throw new Error('Invalid market storage');
    return inspectMigration(raw);
  }
  private initialize() {
    const ctx = this.ctx, env = this.env;
    const store = (key: string) => ({
      load: () => (ctx.storage.kv.get(key) as string | null) ?? null,
      save: (value: string) => { ctx.storage.kv.put(key, value); },
    });
    const sender = gmailApiSender(env.GMAIL_OAUTH_CLIENT_ID, env.GMAIL_OAUTH_CLIENT_SECRET, env.GMAIL_OAUTH_REFRESH_TOKEN, env.GMAIL_USER);
    const market = new MarketService(null, Date.now, store('market'));
    const verification = new EmailVerification(sender, Date.now, {}, store('verification'));
    const loginGuard = new LoginGuard(5, 15 * 60_000, 15 * 60_000, Date.now, 10_000, store('login-guard'));
    const reports = new ReportService(cloudOrganizerAccounts(env.REPORTS_ENABLED, env.ORGANIZER_ACCOUNTS), null, Date.now, store('reports'), store('organizer-sessions'));
    const requestLimiter = new RequestLimiter(Date.now, store('request-limits'));
    const testPayment = env.SHARED_TOSS_TEST_ENABLED === '1' ? new SharedTestPayment(market, env.TOSS_TEST_SECRET_KEY ?? '', fetch, Date.now, env.TOSS_TEST_CLIENT_KEY ?? '') : null;
    const handoffs = testPayment ? new TestPaymentHandoffs(market, store('test-payment-handoffs')) : null;
    const kopisKey = env.KOPIS_API_KEY ?? '';
    const api = createApi(new CheckService(cloudAiProvider(env)), ['https://ticketradar.month32.workers.dev', 'http://127.0.0.1:5173'], query => searchKopis(kopisKey, query), reports, market, verification, loginGuard, id => fetchKopisDetail(kopisKey, id), req => {
      const value = req.headers['x-ticketradar-client-ip'];
      return typeof value === 'string' && /^[0-9a-f:.]{2,45}$/i.test(value) ? value : 'unknown';
    }, requestLimiter, options => searchKopisCards(kopisKey, options), testPayment, handoffs);
    this.handler = httpServerHandler(api);
  }
  fetch(request: Request) {
    if (!this.handler) this.initialize();
    return this.handler!.fetch(request, this.env, this.ctx);
  }
}

// This entrypoint is reachable only through a trusted Cloudflare service binding.
// It is not included in the public HTTP router and cannot target arbitrary objects.
export class MigrationControl extends WorkerEntrypoint<Env> {
  importSnapshot(raw: string) {
    if (this.env.STAGING_ENABLED !== '1') throw new Error('Migration unavailable');
    if (typeof raw !== 'string' || new TextEncoder().encode(raw).byteLength > 1_500_000) throw new Error('Invalid snapshot');
    const stub = this.env.MARKET.get(this.env.MARKET.idFromName('market-v1'));
    return stub.importSnapshot(raw);
  }
  inspectSnapshot() {
    if (this.env.STAGING_ENABLED !== '1') throw new Error('Migration unavailable');
    return this.env.MARKET.get(this.env.MARKET.idFromName('market-v1')).inspectSnapshot();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    if (env.STAGING_ENABLED !== '1') return new Response('Unavailable', { status: 503 });
    const pathname = new URL(request.url).pathname;
    // Internal demonstration accounts must not become a public report inbox by accident.
    if ((pathname === '/reports' || pathname === '/organizer' || pathname.startsWith('/organizer/')) && env.REPORTS_ENABLED !== '1') {
      const origin = request.headers.get('Origin');
      const allowed = ['https://ticketradar.month32.workers.dev', 'http://127.0.0.1:5173'];
      if (origin && !allowed.includes(origin)) return new Response('Forbidden', { status: 403, headers: { Vary: 'Origin' } });
      const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization' });
      if (origin) headers.set('Access-Control-Allow-Origin', origin);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
      return Response.json({ code: 'REPORTS_NOT_CONFIGURED', message: '제보함 연결을 준비 중이에요.', retryable: true }, { status: 503, headers });
    }
    if (!/^\/(?:health$|events(?:\/|$)|checks$|performances$|performance-cards(?:\/|$)|test-payments(?:\/|$)|reports$|organizer(?:\/|$)|auth(?:\/|$)|shows(?:\/|$)|listings(?:\/|$)|orders(?:\/|$)|me(?:\/|$))/.test(pathname)) return new Response('Not found', { status: 404 });
    // Ignore any client-supplied internal header; only Cloudflare supplies the address.
    const headers = new Headers(request.headers);
    headers.delete('x-ticketradar-client-ip');
    let ip = request.headers.get('cf-connecting-ip');
    const signedIp = request.headers.get('x-tr-proxy-ip');
    const signedTime = request.headers.get('x-tr-proxy-time');
    const signature = request.headers.get('x-tr-proxy-signature');
    if (signedIp || signedTime || signature) {
      const url = new URL(request.url);
      if (!signedIp || !signedTime || !signature || !await verifyProxyClient(env.WEB_PROXY_SECRET ?? '', signedIp, signedTime, request.method, `${url.pathname}${url.search}`, signature)) return new Response('Forbidden', { status: 403 });
      ip = signedIp;
    }
    headers.delete('x-tr-proxy-ip'); headers.delete('x-tr-proxy-time'); headers.delete('x-tr-proxy-signature');
    if (ip && /^[0-9a-f:.]{2,45}$/i.test(ip)) headers.set('x-ticketradar-client-ip', ip);
    return env.MARKET.get(env.MARKET.idFromName('market-v1')).fetch(new Request(request, { headers }));
  },
};
