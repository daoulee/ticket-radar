import { request } from 'node:http';
import { createHttpMarket } from '../../src/market/api';

// Synthetic data only; the port guard prevents accidental use of real user records.
const localFetch = ((url: string, options: RequestInit = {}) => new Promise((resolve, reject) => {
  const req = request(url, { method: options.method, headers: options.headers as Record<string, string> }, res => {
    const chunks: Buffer[] = [];
    res.on('data', chunk => chunks.push(Buffer.from(chunk)));
    res.on('end', () => { const status = res.statusCode ?? 500; resolve({ ok: status < 400, status, json: async () => JSON.parse(Buffer.concat(chunks).toString('utf8')) } as Response); });
  });
  req.on('error', reject);
  if (typeof options.body === 'string') req.write(options.body);
  req.end();
})) as typeof fetch;

it('웹에서 만든 격리 계정으로 앱 API가 로그인하고 시연 매물을 구매한다', async () => {
  const base = process.env.AID_AUTH_CROSS_BASE;
  if (base !== 'http://127.0.0.1:31765') throw new Error('isolated auth test server is required');
  const api = createHttpMarket(base, localFetch);
  const session = await api.login('isolated-fan@example.test', 'Test-pass1!');
  const order = await api.createOrder(session.token, 'lst-mu-1');
  expect(order.isDemoPayment).toBe(true);
  expect(order.status).toBe('sent');
});
