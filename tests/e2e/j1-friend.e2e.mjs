// J-1 friend views progress — real browser, Supabase responses stubbed at the network layer, clock fixed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../../scripts/serve.mjs';
import { SEED_ROWS, stubSupabase, chromium } from './helpers.mjs';

test('J-1: friend sees 25/38, calendar, stats, quote, history — and no write controls', async () => {
  const srv = await startServer(0);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-16T17:00:00Z'));
    await stubSupabase(page, { rows: SEED_ROWS });
    await page.goto(srv.url);
    await page.waitForSelector('.hero');
    assert.equal((await page.textContent('.big')).replace(/\s/g, ''), '25/38');
    assert.equal(await page.locator('.cell.done').count(), 5);
    assert.ok((await page.textContent('[aria-label="Quote of the day"]')).length > 20);
    assert.match(await page.textContent('[aria-label="Stats"]'), /180/);
    assert.equal(await page.locator('#logbtn, [data-edit]').count(), 0, 'no write controls for friends');
    await page.click('.histlink');
    await page.waitForSelector('[aria-label="Workout history"]');
    assert.equal(await page.locator('.entry').count(), 5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'no sideways scroll');
    await page.screenshot({ path: '.pipeline/results/j1-friend-history.png' });
    assert.deepEqual(errors, []);
  } finally { await browser.close(); srv.close(); }
});

test('J-1 offline: server unreachable shows last-known data with a banner', async () => {
  const srv = await startServer(0);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date('2026-11-16T17:00:00Z'));
    await stubSupabase(page, { rows: SEED_ROWS });
    await page.goto(srv.url); await page.waitForSelector('.hero');
    await page.unrouteAll(); await stubSupabase(page, { fail: true });
    await page.reload(); await page.waitForSelector('.hero');
    assert.match(await page.textContent('.banner'), /Can't reach the server/);
    assert.equal((await page.textContent('.big')).replace(/\s/g, ''), '25/38');
  } finally { await browser.close(); srv.close(); }
});
