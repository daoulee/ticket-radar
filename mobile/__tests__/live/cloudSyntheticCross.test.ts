import { request } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHttpMarket } from '../../src/market/api';

// Dedicated loopback bridge to a Cloudflare fixture only. Never point at user data.
const base = 'http://127.0.0.1:31922/__cross';
const stateFile = '/private/tmp/aid-cloud-cross-synthetic.json';
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

it('가상 Cloudflare 환경에서 앱 API와 웹이 같은 거래 상태를 사용한다', async () => {
  const phase = process.env.AID_SYNTHETIC_CROSS_PHASE;
  if (!['setup', 'sent', 'settled'].includes(phase ?? '')) throw new Error('Explicit synthetic test phase is required');
  const api = createHttpMarket(base, localFetch);
  const seller = await api.login('appseller', 'Seller-pass-1!');
  if (phase === 'setup') {
    const { listing } = await api.createListing(seller.token, { showId: 'demo-musical', sessionId: 'demo-mu-1', seatGrade: 'VIP', quantity: 1, pricePerTicket: 98500, originalPricePerTicket: 99000, delivery: 'official_transfer', bookingType: 'general' });
    writeFileSync(stateFile, JSON.stringify({ listingId: listing.id }), { mode: 0o600, flag: 'wx' });
    expect(listing.status).toBe('active');
  } else {
    const state = JSON.parse(readFileSync(stateFile, 'utf8')) as { listingId: string };
    const order = (await api.orders(seller.token)).find(item => item.order.listingId === state.listingId);
    expect(order).toBeDefined();
    if (!order) throw new Error('Synthetic order not found');
    if (phase === 'sent') expect((await api.markSent(seller.token, order.order.id)).status).toBe('sent');
    else expect((await api.order(seller.token, order.order.id)).order.status).toBe('settled');
  }
});
