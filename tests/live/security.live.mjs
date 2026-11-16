// Live security checks against the REAL Supabase project, no browser needed (J-6, G-01, G-02, G-04).
// Runs in GitHub Actions (open network). Locally: LIVE=1 node --test tests/live/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../src/config.js';

const live = process.env.LIVE === '1';
const H = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
const REST = `${SUPABASE_URL}/rest/v1/workouts`;

test('LIVE J-1 data: the public can read the seeded workouts', { skip: !live && 'set LIVE=1' }, async () => {
  const rows = await (await fetch(`${REST}?select=day,type,location,minutes&order=day`, { headers: H })).json();
  assert.ok(Array.isArray(rows), JSON.stringify(rows));
  for (const d of ['2026-11-09', '2026-11-11', '2026-11-13', '2026-11-14', '2026-11-15']) assert.ok(rows.some(r => r.day === d), d);
});

test('LIVE J-6 / G-01 / G-02: the public key cannot add, change or delete workouts', { skip: !live && 'set LIVE=1' }, async () => {
  const before = await (await fetch(`${REST}?select=id,minutes`, { headers: H })).json();
  assert.ok(Array.isArray(before) && before.length >= 5);
  const ins = await fetch(REST, { method: 'POST', headers: H, body: JSON.stringify({ id: crypto.randomUUID(), day: '2026-11-16', type: 'gym', location: 'ymca', minutes: 30 }) });
  assert.ok([401, 403].includes(ins.status), `insert refused (got ${ins.status})`);
  const upd = await fetch(`${REST}?id=eq.${before[0].id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ minutes: 599 }) });
  assert.ok([401, 403].includes(upd.status) || (await upd.json()).length === 0, 'update refused');
  const del = await fetch(`${REST}?id=eq.${before[0].id}`, { method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
  assert.ok([401, 403].includes(del.status) || (await del.json()).length === 0, 'delete refused');
  const after = await (await fetch(`${REST}?select=id,minutes`, { headers: H })).json();
  assert.deepEqual(after, before, 'nothing changed');
});

test('LIVE G-04: sign-up is switched off (read-only settings check — never creates an account)', { skip: !live && 'set LIVE=1' }, async () => {
  const settings = await (await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } })).json();
  assert.equal(settings.disable_signup, true, 'Authentication → "Allow new users to sign up" must be off');
  assert.equal(settings.external?.email, true, 'email sign-in must stay on');
});
