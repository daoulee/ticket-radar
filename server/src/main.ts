import { createApi } from './http.ts';
import { CheckService } from './service.ts';
import { providerFromEnv } from './extraction.ts';
import { accountsFromEnv, ReportService } from './reports.ts';
import { MarketService } from './market.ts';
import { existsSync } from 'node:fs';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3001);
const timeout = Number(process.env.AI_TIMEOUT_MS ?? 10000);
if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isFinite(timeout) || timeout < 1 || timeout > 120000) throw new Error('Invalid port or timeout');
const origins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean);
// 제보는 server/var/reports.json(권한 600, Git 제외)에 보관한다. REPORTS_FILE=none 이면 메모리에만 둔다.
const reportsFile = process.env.REPORTS_FILE === 'none' ? null : (process.env.REPORTS_FILE || new URL('../var/reports.json', import.meta.url).pathname);
const reports = new ReportService(accountsFromEnv(process.env.ORGANIZER_ACCOUNTS), reportsFile);
const marketFile = process.env.MARKET_FILE === 'none' ? null : (process.env.MARKET_FILE || new URL('../var/market.json', import.meta.url).pathname);
if (marketFile && existsSync(`${marketFile}.migrated`)) throw new Error('이 거래 저장소는 공통 서버로 이전되어 로컬 서버를 시작할 수 없습니다. 복구 절차를 확인하세요.');
const server = createApi(new CheckService(providerFromEnv(process.env), undefined, timeout), origins, undefined, reports, new MarketService(marketFile));
server.listen(port, host, () => console.log(`Ticket Radar API: http://${host}:${port} (contract 0.1.0)`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close(() => process.exit(0)));
