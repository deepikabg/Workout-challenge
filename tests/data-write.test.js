// S-006 — owner writes: idempotent create (client UUID + upsert), update, delete, error mapping (J-2..J-4, Contract.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, newWorkout } from '../src/data.js';

function fakeClient(result = { error: null }) {
  const calls = [];
  const chain = (op, payload, opts) => {
    const q = {
      eq(col, val) { calls.push({ op, payload, opts, eq: [col, val] }); return Promise.resolve(result); },
      then(res, rej) { calls.push({ op, payload, opts }); return Promise.resolve(result).then(res, rej); },
    };
    return q;
  };
  return { calls, from() { return { upsert: (p, o) => chain('upsert', p, o), update: p => chain('update', p), delete: () => chain('delete') }; } };
}

test('newWorkout builds a row with a fresh UUID and the right location', () => {
  const a = newWorkout({ day: '2026-11-16', type: 'kettle', minutes: 30 });
  assert.match(a.id, /^[0-9a-f-]{36}$/); assert.equal(a.location, 'ymca');
  assert.equal(newWorkout({ day: '2026-11-16', type: 'homeyoga', minutes: 45 }).location, 'home');
  assert.equal(newWorkout({ day: '2026-11-16', type: 'other', location: 'home', minutes: 45 }).location, 'home');
  assert.notEqual(a.id, newWorkout({ day: '2026-11-16', type: 'kettle', minutes: 30 }).id);
});

test('add uses upsert on id with ignoreDuplicates, so a retry never double-writes', async () => {
  const c = fakeClient(); const s = createStore({ client: c, storage: null });
  const row = newWorkout({ day: '2026-11-16', type: 'gym', minutes: 40 });
  assert.deepEqual(await s.add(row), { ok: true });
  await s.add(row);
  assert.equal(c.calls.length, 2);
  assert.deepEqual(c.calls[0].opts, { onConflict: 'id', ignoreDuplicates: true });
  assert.equal(c.calls[0].payload.id, c.calls[1].payload.id);
  assert.equal('owner_id' in c.calls[0].payload, false, 'owner_id comes from the server default');
});

test('update sends only editable fields, filtered by id', async () => {
  const c = fakeClient(); const s = createStore({ client: c, storage: null });
  await s.update('abc', { day: '2026-11-17', type: 'other', location: 'home', minutes: 50, owner_id: 'evil', id: 'x' });
  assert.deepEqual(c.calls[0].payload, { day: '2026-11-17', type: 'other', location: 'home', minutes: 50 });
  assert.deepEqual(c.calls[0].eq, ['id', 'abc']);
});

test('remove deletes by id', async () => {
  const c = fakeClient(); const s = createStore({ client: c, storage: null });
  assert.deepEqual(await s.remove('abc'), { ok: true }); assert.deepEqual(c.calls[0].eq, ['id', 'abc']);
});

test('write errors map to Contract codes', async () => {
  const rls = createStore({ client: fakeClient({ error: { code: '42501', message: 'new row violates row-level security policy' } }), storage: null });
  assert.deepEqual(await rls.add(newWorkout({ day: '2026-11-16', type: 'gym', minutes: 40 })), { ok: false, error: 'NOT_ALLOWED' });
  const chk = createStore({ client: fakeClient({ error: { code: '23514', message: 'violates check constraint' } }), storage: null });
  assert.deepEqual(await chk.update('a', { minutes: 0 }), { ok: false, error: 'INVALID_INPUT' });
  const net = createStore({ client: fakeClient({ error: { message: 'Failed to fetch' } }), storage: null });
  assert.deepEqual(await net.remove('a'), { ok: false, error: 'NETWORK' });
});
