// J-8 live update: a friend's open page picks up Dee's new workout without a reload.
// Realtime sockets can't be stubbed here, so this exercises the 60 s / on-focus refetch backstop;
// the real websocket path is checked against the live project in qa-verify.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../../scripts/serve.mjs';
import { SEED_ROWS, stubSupabase, chromium } from './helpers.mjs';

test('J-8: friend page updates within 60 s of a new workout, no reload', async () => {
  const srv = await startServer(0); const browser = await chromium.launch();
  try {
    const rows = SEED_ROWS.map(r => ({ ...r }));
    const page = await browser.newPage();
    await page.clock.install({ time: new Date('2026-11-16T17:00:00Z') });
    await stubSupabase(page, { rows });
    await page.goto(srv.url); await page.waitForSelector('.hero');
    assert.equal((await page.textContent('.big')).replace(/\s/g, ''), '25/38');
    rows.push({ id: 'new', day: '2026-11-16', type: 'kettle', location: 'ymca', minutes: 30 }); // Dee logs elsewhere
    await page.clock.runFor(61000);
    await page.waitForFunction(() => document.querySelector('.big')?.textContent.replace(/\s/g, '') === '24/38', null, { timeout: 5000 });
  } finally { await browser.close(); srv.close(); }
});
