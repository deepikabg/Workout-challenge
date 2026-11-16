// S-010 live journeys against the REAL Supabase project (no stubs). Run with: LIVE=1 npm run e2e
// Needs network access to the project host. Read-only except the write attempts, which must be refused.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../src/config.js';
import { startServer } from '../../scripts/serve.mjs';
import { chromium } from './helpers.mjs';

const live = process.env.LIVE === '1';
const H = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
const REST = `${SUPABASE_URL}/rest/v1/workouts`;

test('LIVE J-1: the real page loads real workouts for a friend', { skip: !live && 'set LIVE=1' }, async () => {
  const srv = await startServer(0); const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(srv.url); await page.waitForSelector('.hero');
    await page.waitForFunction(() => !document.querySelector('.banner'), null, { timeout: 10000 });
    assert.ok(await page.locator('.cell.done').count() >= 5, 'seeded workouts visible');
    await page.screenshot({ path: '.pipeline/results/live-j1-home.png', fullPage: true });
    assert.deepEqual(errors, []);
  } finally { await browser.close(); srv.close(); }
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
