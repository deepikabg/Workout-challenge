// Pure challenge rules — no DOM, no network. Every function takes its clock as an argument.
import { START, END, GOAL, TOTAL_DAYS, TIME_ZONE, MIN_MINUTES, INACTIVITY_MS, TYPES, QUOTES } from './config.js';

const TYPE_BY_ID = Object.fromEntries(TYPES.map(t => [t.id, t]));
const DAY_MS = 864e5;

/** Calendar date (YYYY-MM-DD) in America/Toronto for an instant. */
export function torontoDate(at = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}
export const dayNumber = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / DAY_MS;
export const addDays = (d, n) => new Date((dayNumber(d) + n) * DAY_MS).toISOString().slice(0, 10);
export const inWindow = d => d >= START && d <= END;

/** Location decides the minimum: stored on the row; falls back to the type's default. */
export function locationOf(w) { return w.location || TYPE_BY_ID[w.type]?.where || 'ymca'; }
export function minFor(w) { return MIN_MINUTES[locationOf(w)]; }
export function qualifies(w) { return w.minutes >= minFor(w); }

/** All headline numbers and stats for a list of workouts as of `today` (Toronto date). */
export function compute(workouts, today) {
  const rows = workouts.filter(w => inWindow(w.day));
  const byDay = {};
  for (const w of rows) (byDay[w.day] ||= []).push(w);
  const counted = new Set(Object.keys(byDay).filter(d => byDay[d].some(qualifies)));

  const done = counted.size;
  const toGo = Math.max(0, GOAL - done);
  const ended = today > END;
  const daysLeft = today < START ? TOTAL_DAYS : ended ? 0 : dayNumber(END) - dayNumber(today) + 1;
  const elapsed = Math.min(TOTAL_DAYS, Math.max(1, dayNumber(today) - dayNumber(START) + 1));

  let streak = 0;
  for (let d = counted.has(today) ? today : addDays(today, -1); counted.has(d); d = addDays(d, -1)) streak++;
  let longest = 0, run = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    if (counted.has(addDays(START, i))) longest = Math.max(longest, ++run); else run = 0;
  }

  const byType = {};
  for (const w of rows) { const t = (byType[w.type] ||= { n: 0, min: 0 }); t.n++; t.min += w.minutes; }
  const totalMin = rows.reduce((a, w) => a + w.minutes, 0);
  const need = daysLeft ? toGo / daysLeft : 0;
  const actual = done / elapsed;

  return {
    byDay, counted, done, toGo, daysLeft, elapsed, ended, finished: done >= GOAL,
    streak, longest, need, actual, projected: Math.round(actual * TOTAL_DAYS * 10) / 10,
    byType, totalMin, sessions: rows.length, avg: rows.length ? Math.round(totalMin / rows.length) : 0,
  };
}

/** Same quote for everyone on a given Toronto date; changes daily. */
export function quoteFor(day) {
  const n = QUOTES.length;
  return QUOTES[((dayNumber(day) % n) + n) % n];
}

/** D-022: sign the owner out after 48 h without opening the app. */
export function shouldSignOut(lastActiveMs, nowMs) {
  return lastActiveMs != null && nowMs - lastActiveMs > INACTIVITY_MS;
}
