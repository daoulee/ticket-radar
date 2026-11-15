import { createHttpMarket } from '../../src/market/api';
import { request } from 'node:http';

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

// Explicit isolated test server only; never target the user's persisted server.
it('앱 API가 격리 서버에 시연 매물을 등록하고 같은 서버에서 확인한다', async () => {
  const base = process.env.AID_SHARED_TEST_BASE;
  if (base !== 'http://127.0.0.1:31760' && base !== 'http://127.0.0.1:31761') throw new Error('isolated shared test server is required');
  const api = createHttpMarket(base, localFetch);
  const seller = await api.login('appseller', 'Seller-pass-1!');
  const { listing } = await api.createListing(seller.token, { showId: 'demo-musical', sessionId: 'demo-mu-1', seatGrade: 'VIP', quantity: 1, pricePerTicket: 99000, originalPricePerTicket: 99000, delivery: 'onsite', bookingType: 'general' });
  expect(listing.isDemo).toBe(true);
  const show = await api.show('demo-musical');
  expect(show.listings.some(item => item.id === listing.id)).toBe(true);
});
