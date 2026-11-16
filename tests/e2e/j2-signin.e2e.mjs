// J-2 (sign-in step) + C-14 in a real browser: wrong password, right password, survives reload, 48 h idle signs out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../../scripts/serve.mjs';
import { SEED_ROWS, stubSupabase, stubAuth, chromium } from './helpers.mjs';

test('J-2 sign-in: wrong password shows plain error; right password shows Log a workout; reload keeps session; sign out works', async () => {
  const srv = await startServer(0); const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.clock.install({ time: new Date('2026-11-16T17:00:00Z') });
    await stubSupabase(page, { rows: SEED_ROWS }); await stubAuth(page);
    await page.goto(srv.url); await page.waitForSelector('.hero');
    assert.equal(await page.locator('#logbtn').count(), 0);
    await page.click('#signin');
    await page.fill('#email', 'dee@example.com'); await page.fill('#pw', 'wrong');
    await page.click('#signform button[type=submit]');
    await page.waitForSelector('#perr:not([hidden])');
    assert.match(await page.textContent('#perr'), /don't match/);
    await page.fill('#pw', 'right-password'); await page.click('#signform button[type=submit]');
    await page.waitForSelector('#logbtn');
    assert.match(await page.textContent('.who'), /Sign out/);
    await page.reload(); await page.waitForSelector('#logbtn');
    await page.click('#signout'); await page.waitForSelector('#signin');
    assert.equal(await page.locator('#logbtn').count(), 0);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); srv.close(); }
});

test('C-14 in browser: reopening after more than 48 h idle requires signing in again', async () => {
  const srv = await startServer(0); const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    await page.clock.install({ time: new Date('2026-11-16T17:00:00Z') });
    await stubSupabase(page, { rows: SEED_ROWS }); await stubAuth(page);
    await page.goto(srv.url); await page.waitForSelector('.hero');
    await page.click('#signin'); await page.fill('#email', 'dee@example.com'); await page.fill('#pw', 'right-password');
    await page.click('#signform button[type=submit]'); await page.waitForSelector('#logbtn');
    await page.clock.setSystemTime(new Date('2026-11-18T17:30:00Z')); // 48 h 30 min later
    await page.reload(); await page.waitForSelector('.hero');
    await page.waitForSelector('#signin');
    assert.equal(await page.locator('#logbtn').count(), 0);
  } finally { await browser.close(); srv.close(); }
});
