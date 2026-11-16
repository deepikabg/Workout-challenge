// S-003 — G-05: the shipped site must contain no secret keys.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scan } from '../scripts/secret-scan.mjs';

test('G-05 repository contains no secrets', () => {
  assert.deepEqual(scan(new URL('..', import.meta.url).pathname), []);
});
test('G-05 scanner catches a service_role JWT and a secret key', () => {
  const payload = Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url');
  const fake = `const k = "eyJhbGciOiJIUzI1NiJ9.${payload}.sig"; const s = "${'sb_' + 'secret_'}abc123";`;
  assert.equal(scan(null, [{ path: 'x.js', text: fake }]).length, 2);
  const anon = Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url');
  assert.equal(scan(null, [{ path: 'x.js', text: `"eyJhbGciOiJIUzI1NiJ9.${anon}.sig"` }]).length, 0);
});
