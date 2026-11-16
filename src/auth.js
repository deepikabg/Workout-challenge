// Owner sign-in: email + password (D-029). No sign-up path exists in the client (G-04).
// Signs out after 48 h without opening the app (D-022) — enforced here, on this device.
import { shouldSignOut } from './rules.js';
import { classify } from './data.js';

const KEY = 'wc:lastActive';
const read = s => { try { const v = s?.getItem(KEY); return v == null ? null : Number(v); } catch { return null; } };
const write = (s, v) => { try { v == null ? s?.removeItem(KEY) : s?.setItem(KEY, String(v)); } catch { /* private mode */ } };

export function createAuth({ client, storage = globalThis.localStorage, now = () => Date.now() }) {
  const auth = {
    signedIn: false,

    /** Restore an existing session, unless it has been idle for more than 48 h. */
    async init() {
      const { data } = await client.auth.getSession();
      if (!data?.session) { auth.signedIn = false; return false; }
      if (shouldSignOut(read(storage), now())) { await auth.signOut(); return false; }
      auth.signedIn = true; auth.touch();
      return true;
    },

    async signIn(email, password) {
      email = String(email || '').trim().toLowerCase();
      if (!email || !password) return { ok: false, error: 'BAD_CREDENTIALS' };
      let res;
      try { res = await client.auth.signInWithPassword({ email, password }); } catch (e) { res = { error: e }; }
      if (res.error || !res.data?.session) {
        const code = classify(res.error);
        return { ok: false, error: code === 'NETWORK' || code === 'RATE_LIMIT' ? code : 'BAD_CREDENTIALS' };
      }
      auth.signedIn = true; auth.touch();
      return { ok: true };
    },

    async signOut() {
      try { await client.auth.signOut(); } catch { /* offline: local session still cleared below */ }
      auth.signedIn = false; write(storage, null);
    },

    /** Call on open / when the app becomes visible again. */
    touch() { if (auth.signedIn) write(storage, now()); },
  };
  return auth;
}
