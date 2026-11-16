// S-005 — owner sign-in with email + password (D-029) and 48 h inactivity sign-out (D-022, C-14).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuth } from '../src/auth.js';

const H = 3600e3;
function memoryStorage() { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; }
function fakeClient({ session = null, signInError = null } = {}) {
  const calls = { signOut: 0, signIn: [] , signUp: 0 };
  let current = session;
  return {
    calls,
    auth: {
      async getSession() { return { data: { session: current }, error: null }; },
      async signInWithPassword(creds) { calls.signIn.push(creds); if (signInError) return { data: {}, error: signInError }; current = { user: { id: 'owner' } }; return { data: { session: current }, error: null }; },
      async signOut() { calls.signOut++; current = null; return { error: null }; },
      async signUp() { calls.signUp++; throw new Error('must never be called'); },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    },
  };
}

test('no session → signed out, nothing to sign out', async () => {
  const c = fakeClient(); const a = createAuth({ client: c, storage: memoryStorage(), now: () => 0 });
  assert.equal(await a.init(), false); assert.equal(c.calls.signOut, 0);
});

test('session used within 48 h stays signed in and refreshes last-active', async () => {
  const s = memoryStorage(); s.setItem('wc:lastActive', String(0));
  const c = fakeClient({ session: { user: { id: 'owner' } } });
  const a = createAuth({ client: c, storage: s, now: () => 47 * H });
  assert.equal(await a.init(), true); assert.equal(c.calls.signOut, 0);
  assert.equal(s.getItem('wc:lastActive'), String(47 * H));
});

test('C-14 session idle more than 48 h is signed out on open', async () => {
  const s = memoryStorage(); s.setItem('wc:lastActive', String(0));
  const c = fakeClient({ session: { user: { id: 'owner' } } });
  const a = createAuth({ client: c, storage: s, now: () => 48 * H + 60e3 });
  assert.equal(await a.init(), false); assert.equal(c.calls.signOut, 1);
});

test('signIn with password succeeds and records activity', async () => {
  const s = memoryStorage(); const c = fakeClient();
  const a = createAuth({ client: c, storage: s, now: () => 5 });
  assert.deepEqual(await a.signIn(' Dee@Example.com ', 'pw'), { ok: true });
  assert.deepEqual(c.calls.signIn[0], { email: 'dee@example.com', password: 'pw' });
  assert.equal(s.getItem('wc:lastActive'), '5'); assert.equal(a.signedIn, true);
});

test('wrong password → BAD_CREDENTIALS; rate limit → RATE_LIMIT; blank fields rejected locally', async () => {
  const bad = createAuth({ client: fakeClient({ signInError: { message: 'Invalid login credentials', status: 400, code: 'invalid_credentials' } }), storage: memoryStorage() });
  assert.deepEqual(await bad.signIn('a@b.c', 'x'), { ok: false, error: 'BAD_CREDENTIALS' });
  const rl = createAuth({ client: fakeClient({ signInError: { message: 'Request rate limit reached', status: 429 } }), storage: memoryStorage() });
  assert.deepEqual(await rl.signIn('a@b.c', 'x'), { ok: false, error: 'RATE_LIMIT' });
  assert.deepEqual(await bad.signIn('', ''), { ok: false, error: 'BAD_CREDENTIALS' });
});

test('G-04 the client never calls sign-up', async () => {
  const c = fakeClient(); const a = createAuth({ client: c, storage: memoryStorage() });
  await a.init(); await a.signIn('a@b.c', 'x'); await a.signOut();
  assert.equal(c.calls.signUp, 0);
  assert.equal(typeof a.signUp, 'undefined');
});

test('signOut clears session and last-active', async () => {
  const s = memoryStorage(); const c = fakeClient({ session: { user: { id: 'owner' } } });
  const a = createAuth({ client: c, storage: s, now: () => 1 });
  await a.init(); await a.signOut();
  assert.equal(a.signedIn, false); assert.equal(s.getItem('wc:lastActive'), null);
});
