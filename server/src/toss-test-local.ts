/** Local-only Toss test shop bridge. No real payments, persistence or production use. */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { DemoMarketplace } from './demo-marketplace.ts';

type Pending = { amount: number; state: 'pending' | 'confirming' | 'done'; paymentKey?: string };
export function createTossTestServer(clientKey: string, secretKey: string, tossFetch: typeof fetch = fetch) {
  if (!clientKey.startsWith('test_gck_') || !secretKey.startsWith('test_gsk_')) throw new Error('테스트 전용 위젯 키가 필요합니다.');
  const pending = new Map<string, Pending>();
  const market = new DemoMarketplace();
  const catalog: Record<string, { eventId: string; showtimeId: string }> = {
    '레이더 라이브 2026': { eventId: 'demo-market-live', showtimeId: 'demo-market-live-s1' },
    '뮤지컬 나침반': { eventId: 'demo-market-compass', showtimeId: 'demo-market-compass-s1' },
  };
  return createServer(async (req, res) => {
    const send = (status: number, data: unknown) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
    try {
      if (req.headers.origin && !['http://127.0.0.1:5179', 'http://127.0.0.1:5180'].includes(req.headers.origin)) return send(403, { message: '허용되지 않은 요청입니다.' });
      if (req.method === 'GET' && req.url === '/config') return send(200, { clientKey, mode: 'test' });
      if (req.method !== 'POST' || !['/prepare', '/confirm'].includes(req.url ?? '')) return send(404, { message: '요청을 찾을 수 없어요.' });
      let text = ''; for await (const chunk of req) { text += chunk; if (text.length > 4096) return send(413, { message: '요청이 너무 커요.' }); }
      const body: unknown = JSON.parse(text); if (!body || typeof body !== 'object' || Array.isArray(body)) return send(400, { message: '요청을 확인해 주세요.' });
      const data = body as Record<string, unknown>;
      if (req.url === '/prepare') {
        const event = typeof data.title === 'string' ? catalog[data.title] : undefined;
        if (!event || typeof data.seat !== 'string' || !['primary_demo', 'resale_demo'].includes(String(data.kind)) || !Number.isInteger(data.quantity) || !Number.isInteger(data.price)) return send(400, { message: '시연 주문 정보를 확인해 주세요.' });
        const seatGrade = data.seat.replace(/석$/, '');
        const request = { ...event, seatGrade, quantity: data.quantity as number };
        let review;
        if (data.kind === 'primary_demo') review = market.prepareReview({ ...request, source: 'primary_demo' });
        else {
          const listing = market.registerResale({ ...event, seatGrade, originalUnitPrice: data.originalPrice, listingUnitPrice: data.price, simulatedQuantityAvailable: data.quantity, deliveryMethod: 'not_specified', isSynthetic: true });
          review = market.prepareReview({ ...request, source: 'resale_demo', listingId: listing.id });
        }
        if (review.unitPrice !== data.price) return send(400, { message: '시연 가격이 서버 기준과 일치하지 않아요.' });
        const orderId = `test-${randomUUID()}`; pending.set(orderId, { amount: review.priceSum, state: 'pending' });
        return send(200, { orderId, amount: review.priceSum, orderName: String(data.title), mode: 'test' });
      }
      const { orderId, paymentKey, amount } = data;
      if (typeof orderId !== 'string' || typeof paymentKey !== 'string' || paymentKey.length < 1 || paymentKey.length > 200 || !Number.isSafeInteger(amount)) return send(400, { message: '결제 정보를 확인해 주세요.' });
      const order = pending.get(orderId);
      if (!order || order.amount !== amount) return send(400, { message: '시연 주문의 금액이 일치하지 않아요.' });
      if (order.state === 'done' && order.paymentKey === paymentKey) return send(200, { status: 'DONE', mode: 'test' });
      if (order.state !== 'pending') return send(409, { message: '이미 처리 중인 시연 결제예요.' });
      if (order.paymentKey && order.paymentKey !== paymentKey) return send(409, { message: '기존 결제 정보와 일치하지 않아요.' });
      order.paymentKey = paymentKey;
      order.state = 'confirming';
      try {
        const response = await tossFetch('https://api.tosspayments.com/v1/payments/confirm', { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`, 'Content-Type': 'application/json', 'Idempotency-Key': orderId }, body: JSON.stringify({ orderId, paymentKey, amount }), signal: AbortSignal.timeout(15000) });
        const result = await response.json() as { orderId?: string; paymentKey?: string; totalAmount?: number; status?: string };
        if (!response.ok || result.orderId !== orderId || result.paymentKey !== paymentKey || result.totalAmount !== amount || result.status !== 'DONE') { order.state = 'pending'; return send(502, { message: '토스 테스트 결제를 승인하지 못했어요. 다시 확인해 주세요.' }); }
        order.state = 'done'; order.paymentKey = paymentKey; return send(200, { status: 'DONE', mode: 'test' });
      } catch { order.state = 'pending'; return send(502, { message: '토스 테스트 서버에 연결하지 못했어요.' }); }
    } catch { return send(400, { message: '시연 요청을 확인해 주세요.' }); }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createTossTestServer(process.env.TOSS_TEST_CLIENT_KEY ?? '', process.env.TOSS_TEST_SECRET_KEY ?? '');
  server.listen(3019, '127.0.0.1', () => console.log('토스 테스트 전용 로컬 서버: 127.0.0.1:3019'));
}
