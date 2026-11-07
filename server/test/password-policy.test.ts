import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidNewPassword } from '../../shared/password-policy.ts';
import { MarketService } from '../src/market.ts';

test('new passwords require length, uppercase, lowercase and a special character', () => {
  for (const value of ['Abcd!23', 'abcdefgh!', 'ABCDEFGH!', 'Abcdefgh', 'Abcdefg ', 'a'.repeat(201) + 'A!']) assert.equal(isValidNewPassword(value), false);
  for (const value of ['Abcdefg!', 'Longer Pass!']) assert.equal(isValidNewPassword(value), true);
});

test('server enforces the same rule for new accounts', () => {
  const service = new MarketService();
  assert.throws(() => service.signup({ name: 'newfan', password: 'password1' }), { code: 'BAD_REQUEST' });
  assert.equal(service.signup({ name: 'newfan', password: 'Password1!' }).user.name, 'newfan');
});
