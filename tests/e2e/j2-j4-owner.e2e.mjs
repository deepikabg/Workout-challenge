// J-2 log a workout, J-3 short workout greyed, J-4 edit/delete from History, J-7 celebration — real browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../../scripts/serve.mjs';
import { SEED_ROWS, stubSupabase, stubAuth, memoryTable, signInAsOwner, chromium } from './helpers.mjs';

async function setup(rows, time = '2026-11-16T17:00:00Z') {
  const srv = await startServer(0); const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date(time) });
  await stubSupabase(page, { rows, onWrite: memoryTable(rows) }); await stubAuth(page);
  await page.goto(srv.url); await page.waitForSelector('.hero');
  await signInAsOwner(page);
  return { srv, browser, page, errors, close: async () => { await browser.close(); srv.close(); } };
}
const headline = async page => (await page.textContent('.big')).replace(/\s/g, '');

test('J-2: log Kettlebell 30 min in ≤3 taps after opening the sheet → 24/38', async () => {
  const rows = SEED_ROWS.map(r => ({ ...r })); const t = await setup(rows);
  try {
    await t.page.click('#logbtn');                       // open
    await t.page.click('[data-type="kettle"]');          // tap 1 (default 30 min preselected)
    await t.page.click('#save');                         // tap 2
    await t.page.waitForFunction(() => document.querySelector('.big')?.textContent.replace(/\s/g, '') === '24/38');
    assert.equal(rows.length, 6); assert.equal(rows.at(-1).type, 'kettle'); assert.equal(rows.at(-1).day, '2026-11-16');
    assert.match(await t.page.textContent('.toast'), /24 to go/);
    assert.deepEqual(t.errors, []);
  } finally { await t.close(); }
});

test('J-3: Home yoga 20 min is saved, greyed, and does not move the count', async () => {
  const rows = SEED_ROWS.map(r => ({ ...r })); const t = await setup(rows);
  try {
    await t.page.click('#logbtn'); await t.page.click('[data-type="homeyoga"]');
    await t.page.fill('#custom', '20');
    assert.match(await t.page.textContent('#hint'), /won't count/);
    await t.page.click('#save');
    await t.page.waitForSelector('.cell.today.short');
    assert.equal(await headline(t.page), '25/38');
    assert.match(await t.page.textContent('[aria-label="Stats"]'), /200/);
  } finally { await t.close(); }
});

test('J-4: edit a workout in History, then delete it', async () => {
  const rows = SEED_ROWS.map(r => ({ ...r })); const t = await setup(rows);
  try {
    await t.page.click('.histlink'); await t.page.waitForSelector('[data-edit]');
    await t.page.click(`[data-edit="${rows[0].id}"]`);          // Gravity Nov 9, 30 min
    await t.page.click('[data-min="60"]'); await t.page.click('#save');
    await t.page.waitForFunction(id => document.querySelector(`[data-edit="${id}"] .m`)?.textContent.startsWith('60'), rows[0].id);
    assert.equal(rows[0].minutes, 60);
    await t.page.click(`[data-edit="${rows[0].id}"]`);
    await t.page.click('#del'); assert.match(await t.page.textContent('#del'), /again/);
    await t.page.click('#del');
    await t.page.waitForFunction(() => document.querySelectorAll('[data-edit]').length === 4);
    assert.equal(rows.length, 4);
    await t.page.click('#back'); assert.equal(await headline(t.page), '26/38');
  } finally { await t.close(); }
});

test('J-7: logging the 30th counted day shows the celebration', async () => {
  // Clock on Dec 10; 29 counted days Nov 9 – Dec 7 already logged.
  const rows = Array.from({ length: 29 }, (_, i) => ({ id: `f${i}`, day: new Date(Date.UTC(2026, 10, 9 + i)).toISOString().slice(0, 10), type: 'gym', location: 'ymca', minutes: 30 }));
  const t = await setup(rows, '2026-12-10T17:00:00Z');
  try {
    assert.equal(await headline(t.page), '1/14');
    await t.page.click('#logbtn'); await t.page.click('[data-type="yoga"]'); await t.page.click('#save');
    await t.page.waitForSelector('.celebrate');
    assert.match(await t.page.textContent('.celebrate'), /30 workouts/);
    await t.page.click('.celebrate [data-close]');
    assert.equal(await headline(t.page), '0/14');
  } finally { await t.close(); }
});
