// S-008 — P-01 installable manifest, P-02 service worker caches the app shell only (never workout data), J-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startServer } from '../../scripts/serve.mjs';
import { SEED_ROWS, stubSupabase, chromium } from './helpers.mjs';

test('P-01 manifest: name, standalone, theme, 192 + 512 icons that exist', async () => {
  const m = JSON.parse(readFileSync(new URL('../../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(m.name, "Dee's workout challenge"); assert.equal(m.display, 'standalone');
  assert.ok(m.theme_color && m.background_color); assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const size of ['192x192', '512x512']) {
    const icon = m.icons.find(i => i.sizes === size); assert.ok(icon, size);
    const png = readFileSync(new URL('../../' + icon.src, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
  }
});

test('P-02 service worker installs, caches the shell, and never caches Supabase data', async () => {
  const srv = await startServer(0); const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    await stubSupabase(page, { rows: SEED_ROWS });
    await ctx.route(/supabase\.co\/rest\/v1\/workouts/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SEED_ROWS) }));
    await page.goto(srv.url); await page.waitForSelector('.hero');
    assert.ok(await page.evaluate(() => document.querySelector('link[rel=manifest]')?.href.endsWith('manifest.webmanifest')));
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); await page.waitForSelector('.hero');
    const cached = await page.evaluate(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(r.url); return out; });
    assert.ok(cached.some(u => u.endsWith('/src/rules.js')), 'shell cached');
    assert.equal(cached.filter(u => u.includes('supabase.co')).length, 0, 'no data cached');
  } finally { await browser.close(); srv.close(); }
});
