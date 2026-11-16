// S-010 live journeys against the REAL Supabase project (no stubs). Run with: LIVE=1 npm run e2e
// Needs network access to the project host. Security checks without a browser live in tests/live/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../../scripts/serve.mjs';
import { chromium } from './helpers.mjs';

const live = process.env.LIVE === '1';

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
