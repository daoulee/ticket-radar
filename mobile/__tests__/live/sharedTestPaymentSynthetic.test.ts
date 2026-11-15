import { request } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHttpMarket } from '../../src/market/api';

const base = 'http://127.0.0.1:31942';
const stateFile = '/private/tmp/aid-payment-synthetic-flow.json';
const localFetch = ((url: string, options: RequestInit = {}) => new Promise((resolve, reject) => {
  if (!url.startsWith(`${base}/`)) return reject(new Error('Unexpected test target'));
  const req = request(url, { method: options.method, headers: options.headers as Record<string, string> }, res => {
    const chunks: Buffer[] = [];
    res.on('data', chunk => chunks.push(Buffer.from(chunk)));
    res.on('end', () => { const status = res.statusCode ?? 500; resolve({ ok: status < 400, status, json: async () => JSON.parse(Buffer.concat(chunks).toString('utf8')) } as Response); });
  });
  req.on('error', reject);
  if (typeof options.body === 'string') req.write(options.body);
  req.end();
})) as typeof fetch;

it('앱의 결제 API가 격리된 웹 결제 및 거래 완료와 연동된다', async () => {
  const phase = process.env.AID_SYNTHETIC_PAYMENT_PHASE;
  if (phase !== 'setup' && phase !== 'settled' && phase !== 'cancelled') throw new Error('Explicit synthetic test phase is required');
  const api = createHttpMarket(base, localFetch);
  const buyer = await api.login('paymentbuyer', 'Synthetic-pass1!');
  if (phase === 'setup') {
    if (!api.prepareTestPayment || !api.issueTestPaymentHandoff) throw new Error('Test payment API unavailable');
    const order = await api.prepareTestPayment(buyer.token, 'lst-mu-1');
    const handoff = await api.issueTestPaymentHandoff(buyer.token, order.orderId);
    writeFileSync(stateFile, JSON.stringify({ ...order, code: handoff.code }), { mode: 0o600, flag: 'wx' });
    expect(order.mode).toBe('test'); expect(order.amount).toBe(99000);
  } else {
    const data = JSON.parse(readFileSync(stateFile, 'utf8')) as { orderId: string };
    const order = await api.order(buyer.token, data.orderId);
    if (phase === 'settled') {
      expect(order.order.testPayment?.status).toBe('approved');
      expect(order.order.status).toBe('settled');
    } else {
      expect(order.order.testPayment?.status).toBe('cancelled');
      expect(order.order.status).toBe('cancelled');
      expect(order.listing.status).toBe('active');
    }
  }
});
