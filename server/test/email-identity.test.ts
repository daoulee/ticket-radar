import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail } from '../src/email-identity.ts';

test('normalizes surrounding whitespace and the domain without changing the local part', () => {
  assert.equal(normalizeEmail('  Ticket.User+demo@Example.COM  '), 'Ticket.User+demo@example.com');
});

test('rejects missing or malformed email addresses', () => {
  for (const value of [null, '', 'no-at-sign', 'a@@example.com', 'a b@example.com', '.a@example.com', 'a..b@example.com', 'a@-example.com', 'a@example', `${'a'.repeat(65)}@example.com`]) {
    assert.equal(normalizeEmail(value), null);
  }
});
