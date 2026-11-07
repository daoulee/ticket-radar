import { createHttpMarket } from '../src/market/api';

it('아이디와 이메일을 서버가 구분할 수 있게 보낸다', async () => {
  const request = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'token', user: {} }) });
  const api = createHttpMarket('http://example.test', request as unknown as typeof fetch);
  await api.login('  fan@example.com  ', 'password');
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ email: 'fan@example.com', password: 'password' });
  await api.login('fan01', 'password');
  expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ name: 'fan01', password: 'password' });
});

it('이메일 가입 정보를 서버로 전달한다', async () => {
  const request = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'token', user: {} }) });
  const api = createHttpMarket('http://example.test', request as unknown as typeof fetch);
  await api.signup('fan01', 'password', 'fan@example.com');
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ name: 'fan01', password: 'password', email: 'fan@example.com' });
});

it('잘못된 실제 공연 응답을 성공 데이터로 표시하지 않는다', async () => {
  const request = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 'PF1', title: '공연' }] });
  const api = createHttpMarket('http://example.test', request as unknown as typeof fetch);
  await expect(api.performances()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});
