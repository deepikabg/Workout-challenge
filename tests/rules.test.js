// S-001 — counting rules (Eval-Spec C-01..C-15). Clock is always injected.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, qualifies, minFor, torontoDate, quoteFor, shouldSignOut, addDays } from '../src/rules.js';
import { QUOTES, START, END } from '../src/config.js';

const SEED = [
  { id: 'a', day: '2026-11-09', type: 'gravity',  location: 'ymca', minutes: 30 },
  { id: 'b', day: '2026-11-11', type: 'homeyoga', location: 'home', minutes: 45 },
  { id: 'c', day: '2026-11-13', type: 'core',     location: 'ymca', minutes: 30 },
  { id: 'd', day: '2026-11-14', type: 'totaltone',location: 'ymca', minutes: 30 },
  { id: 'e', day: '2026-11-15', type: 'homeyoga', location: 'home', minutes: 45 },
];
const w = (day, type, location, minutes, id = day + type + minutes) => ({ id, day, type, location, minutes });

test('C-01 seed on Nov 16 → 25/38, 5 done', () => {
  const c = compute(SEED, '2026-11-16');
  assert.equal(c.done, 5); assert.equal(c.toGo, 25); assert.equal(c.daysLeft, 38);
});

test('C-02 window edges: Nov 9 → 45 left, Dec 23 → 1 left, Dec 24 → ended with 0', () => {
  assert.equal(compute([], '2026-11-09').daysLeft, 45);
  assert.equal(compute([], '2026-12-23').daysLeft, 1);
  const after = compute([], '2026-12-24');
  assert.equal(after.daysLeft, 0); assert.equal(after.ended, true);
  assert.equal(compute([], '2026-11-01').daysLeft, 45);
});

test('C-03 minimums: YMCA 29 no / 30 yes; home 44 no / 45 yes; Other uses chosen location', () => {
  assert.equal(qualifies(w('2026-11-16', 'kettle', 'ymca', 29)), false);
  assert.equal(qualifies(w('2026-11-16', 'kettle', 'ymca', 30)), true);
  assert.equal(qualifies(w('2026-11-16', 'homeyoga', 'home', 44)), false);
  assert.equal(qualifies(w('2026-11-16', 'homeyoga', 'home', 45)), true);
  assert.equal(minFor(w('2026-11-16', 'other', 'home', 40)), 45);
  assert.equal(minFor(w('2026-11-16', 'other', 'ymca', 40)), 30);
});

test('C-04 two qualifying sessions on one day count once, minutes add', () => {
  const c = compute([w('2026-11-16', 'yoga', 'ymca', 60), w('2026-11-16', 'gym', 'ymca', 30)], '2026-11-16');
  assert.equal(c.done, 1); assert.equal(c.totalMin, 90); assert.equal(c.sessions, 2);
});

test('C-05 short sessions do not add up to a counted day', () => {
  const c = compute([w('2026-11-16', 'homeyoga', 'home', 25), w('2026-11-16', 'other', 'home', 20)], '2026-11-16');
  assert.equal(c.done, 0); assert.equal(c.totalMin, 45);
});

test('C-06 entries outside Nov 9 – Dec 23 are ignored', () => {
  const c = compute([w('2026-11-08', 'gym', 'ymca', 60), w('2026-12-24', 'gym', 'ymca', 60)], '2026-12-24');
  assert.equal(c.done, 0); assert.equal(c.sessions, 0); assert.equal(c.totalMin, 0);
});

test('C-07 a workout at 23:30 Toronto stays on that Toronto date', () => {
  assert.equal(torontoDate(new Date('2026-11-17T04:30:00Z')), '2026-11-16');
});

test('C-08 days-left ticks at Toronto midnight, not UTC', () => {
  const before = compute([], torontoDate(new Date('2026-11-17T04:59:00Z')));
  const after = compute([], torontoDate(new Date('2026-11-17T05:01:00Z')));
  assert.equal(before.daysLeft, 38); assert.equal(after.daysLeft, 37);
});

test('C-09 short + qualifying on the same day → day counts, short entry still not qualifying', () => {
  const short = w('2026-11-16', 'homeyoga', 'home', 20), good = w('2026-11-16', 'kettle', 'ymca', 30);
  const c = compute([short, good], '2026-11-16');
  assert.equal(c.done, 1); assert.equal(qualifies(short), false); assert.ok(c.counted.has('2026-11-16'));
});

test('C-10 at 30 counted days → finished, to-go 0; never negative past 30', () => {
  const days = Array.from({ length: 31 }, (_, i) => w(addDays(START, i), 'gym', 'ymca', 30));
  const at30 = compute(days.slice(0, 30), addDays(START, 29));
  assert.equal(at30.done, 30); assert.equal(at30.toGo, 0); assert.equal(at30.finished, true);
  const at31 = compute(days, addDays(START, 30));
  assert.equal(at31.done, 31); assert.equal(at31.toGo, 0);
});

test('C-11 streaks: run ending today or yesterday; a greyed-only day breaks it', () => {
  const c = compute(SEED, '2026-11-16'); // 13,14,15 counted, 16 empty
  assert.equal(c.streak, 3); assert.equal(c.longest, 3);
  const broken = compute([...SEED, w('2026-11-16', 'homeyoga', 'home', 20)], '2026-11-17');
  assert.equal(broken.streak, 0);
  assert.equal(compute([...SEED, w('2026-11-16', 'gym', 'ymca', 40)], '2026-11-16').streak, 4);
});

test('C-12 pace: needed = to-go / days-left, actual = done / elapsed days incl. today', () => {
  const c = compute(SEED, '2026-11-16');
  assert.equal(c.elapsed, 8);
  assert.ok(Math.abs(c.need - 25 / 38) < 1e-9); assert.ok(Math.abs(c.actual - 5 / 8) < 1e-9);
});

test('C-13 quote is stable for a date and changes the next day', () => {
  assert.equal(quoteFor('2026-11-16'), quoteFor('2026-11-16'));
  assert.notEqual(quoteFor('2026-11-16'), quoteFor('2026-11-17'));
  assert.ok(QUOTES.includes(quoteFor('2026-12-23')));
});

test('C-14 sign out after 48 h inactivity, not before', () => {
  const t = Date.UTC(2026, 10, 16, 12), h = 3600e3;
  assert.equal(shouldSignOut(t, t + 47 * h + 59 * 60e3), false);
  assert.equal(shouldSignOut(t, t + 48 * h + 60e3), true);
  assert.equal(shouldSignOut(null, t), false);
});

test('C-15 quotes: encouraging only — no peer pressure, guilt, or rest/stillness lines', () => {
  const banned = /\b(friend|watch|brag|guilt|lazy|rest|still|stillness|calm|breathe|mindful|couch)\b/i;
  assert.ok(QUOTES.length >= 30);
  for (const q of QUOTES) assert.doesNotMatch(q, banned, q);
});

test('by-type breakdown counts sessions and minutes', () => {
  const c = compute(SEED, '2026-11-16');
  assert.deepEqual(c.byType.homeyoga, { n: 2, min: 90 });
  assert.equal(c.totalMin, 180);
});

test('config window matches the challenge', () => { assert.equal(START, '2026-11-09'); assert.equal(END, '2026-12-23'); });
