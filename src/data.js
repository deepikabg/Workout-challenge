// Data access (Contract.md). Reads are public; writes arrive in S-006. Keeps a last-known copy for offline use.
import { TYPES } from './config.js';

const KNOWN = new Set(TYPES.map(t => t.id));
const CACHE_KEY = 'wc:last';
const FIELDS = 'id,day,type,location,minutes,created_at';

const MESSAGES = {
  NETWORK: "Can't reach the server. Showing your last saved progress.",
  NOT_ALLOWED: 'Only Dee can log workouts. Sign in to make changes.',
  INVALID_INPUT: "That date or duration isn't valid for the challenge (Nov 9 – Dec 23, 1–600 min).",
  BAD_CREDENTIALS: "That email and password don't match. Try again.",
  RATE_LIMIT: 'Too many tries. Wait a minute, then try again.',
  UNKNOWN: 'Something went wrong. Try again in a moment.',
};
export const errorMessage = code => MESSAGES[code] || MESSAGES.UNKNOWN;

/** Map a Supabase/PostgREST/network error to a Contract.md error code. */
export function classify(err) {
  if (!err) return null;
  const msg = String(err.message || err);
  if (err.code === '42501' || err.status === 401 || err.status === 403) return 'NOT_ALLOWED';
  if (err.code === '23514' || err.code === '22P02') return 'INVALID_INPUT';
  if (err.code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) return 'BAD_CREDENTIALS';
  if (err.status === 429 || /rate limit/i.test(msg)) return 'RATE_LIMIT';
  if (/fetch|network|load failed|offline/i.test(msg) || err.name === 'TypeError') return 'NETWORK';
  return 'UNKNOWN';
}

const clean = r => ({ id: r.id, day: r.day, type: r.type, location: r.location, minutes: r.minutes });

function safeGet(storage, key) { try { return JSON.parse(storage?.getItem(key) ?? 'null'); } catch { return null; } }
function safeSet(storage, key, value) { try { storage?.setItem(key, JSON.stringify(value)); } catch { /* private mode: fine */ } }

export function createStore({ client, storage = globalThis.localStorage, now = () => Date.now() }) {
  async function load() {
    let res;
    try { res = await client.from('workouts').select(FIELDS).order('day', { ascending: false }); }
    catch (e) { res = { data: null, error: e }; }
    if (res.error || !Array.isArray(res.data)) {
      const cached = safeGet(storage, CACHE_KEY);
      return { rows: cached?.rows ?? [], offline: true, savedAt: cached?.savedAt ?? null, error: classify(res.error) || 'NETWORK' };
    }
    const rows = res.data.filter(r => KNOWN.has(r.type)).map(clean);
    safeSet(storage, CACHE_KEY, { rows, savedAt: now() });
    return { rows, offline: false, savedAt: now(), error: null };
  }
  return { load };
}
