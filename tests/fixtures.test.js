// S-003 — dirty-state fixtures from the Eval-Spec failure taxonomy (C-04, C-05, C-06, C-07, C-09).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { compute, torontoDate } from '../src/rules.js';

const dir = new URL('./fixtures/dirty/', import.meta.url);
for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  test(`fixture ${file}`, () => {
    const fx = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    if (fx.loggedAtUtc) assert.equal(torontoDate(new Date(fx.loggedAtUtc)), fx.expectDay);
    const c = compute(fx.rows, fx.today);
    for (const [k, v] of Object.entries(fx.expect)) assert.equal(c[k], v, `${file}: ${k}`);
  });
}
