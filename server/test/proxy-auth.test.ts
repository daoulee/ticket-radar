import test from 'node:test';
import assert from 'node:assert/strict';
import { signProxyClient, verifyProxyClient } from '../../shared/proxy-auth.ts';

test('signed proxy identity rejects tampering, different routes, secrets and expired signatures', async () => {
  const secret = 's'.repeat(43), ip = '192.0.2.10', at = '1794740000000', route = '/auth/login';
  const sig = await signProxyClient(secret, ip, at, 'POST', route);
  assert.equal(await verifyProxyClient(secret, ip, at, 'POST', route, sig, Number(at)), true);
  assert.equal(await verifyProxyClient(secret, '192.0.2.11', at, 'POST', route, sig, Number(at)), false);
  assert.equal(await verifyProxyClient(secret, ip, at, 'GET', route, sig, Number(at)), false);
  assert.equal(await verifyProxyClient(secret, ip, at, 'POST', '/auth/signup', sig, Number(at)), false);
  assert.equal(await verifyProxyClient('z'.repeat(43), ip, at, 'POST', route, sig, Number(at)), false);
  assert.equal(await verifyProxyClient(secret, ip, at, 'POST', route, sig, Number(at) + 60_001), false);
});
