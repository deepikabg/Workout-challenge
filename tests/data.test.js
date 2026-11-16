// S-004 — data layer: live read, last-known cache, offline fallback (J-1, P-02, NETWORK copy).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, errorMessage } from '../src/data.js';

const ROWS = [{ id: 'a', day: '2026-11-09', type: 'gravity', location: 'ymca', minutes: 30, created_at: 'x' }];
function memoryStorage() { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; }
function fakeClient({ rows = ROWS, error = null } = {}) {
  const q = { select() { return q; }, order() { return Promise.resolve(error ? { data: null, error } : { data: rows, error: null }); } };
  return { from(t) { assert.equal(t, 'workouts'); return q; } };
}

test('load returns live rows and caches them', async () => {
  const storage = memoryStorage();
  const s = createStore({ client: fakeClient(), storage, now: () => 1000 });
  const r = await s.load();
  assert.equal(r.offline, false); assert.equal(r.rows.length, 1);
  assert.deepEqual(Object.keys(r.rows[0]).sort(), ['day', 'id', 'location', 'minutes', 'type']);
  assert.equal(JSON.parse(storage.getItem('wc:last')).rows.length, 1);
});

test('network failure falls back to last-known rows, flagged offline', async () => {
  const storage = memoryStorage();
  await createStore({ client: fakeClient(), storage, now: () => 1000 }).load();
  const r = await createStore({ client: fakeClient({ error: { message: 'Failed to fetch' } }), storage, now: () => 2000 }).load();
  assert.equal(r.offline, true); assert.equal(r.rows.length, 1); assert.equal(r.savedAt, 1000);
});

test('network failure with no cache → offline with empty rows and an error code', async () => {
  const r = await createStore({ client: fakeClient({ error: { message: 'Failed to fetch' } }), storage: memoryStorage() }).load();
  assert.equal(r.offline, true); assert.deepEqual(r.rows, []); assert.equal(r.error, 'NETWORK');
});

test('a throwing storage (private mode) never breaks loading', async () => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const r = await createStore({ client: fakeClient(), storage: bad }).load();
  assert.equal(r.rows.length, 1);
});

test('rows with unknown types are dropped rather than crashing the page', async () => {
  const r = await createStore({ client: fakeClient({ rows: [...ROWS, { id: 'z', day: '2026-11-10', type: 'zumba', location: 'ymca', minutes: 30 }] }), storage: memoryStorage() }).load();
  assert.equal(r.rows.length, 1);
});

test('error codes map to plain-language copy (Contract.md)', () => {
  assert.match(errorMessage('NETWORK'), /Can't reach the server/);
  assert.match(errorMessage('NOT_ALLOWED'), /Only Dee/);
  assert.match(errorMessage('whatever'), /Something went wrong/);
});
