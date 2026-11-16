// App entry: wires the Supabase client, data store, owner auth and renderer. Writes land in S-006.
import { SUPABASE_URL, SUPABASE_ANON_KEY, START } from './config.js';
import { torontoDate } from './rules.js';
import { createStore, errorMessage } from './data.js';
import { createAuth } from './auth.js';
import { page } from './ui.js';
import { openSheet, closeSheet, toast, X } from './sheets.js';

const client = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
const store = createStore({ client });
const auth = createAuth({ client });
const app = document.getElementById('app');

const state = { rows: [], today: torontoDate(), route: 'home', signedIn: false, offline: false, error: null, loading: true };
const routeFromHash = () => (location.hash === '#history' ? 'history' : 'home');
const hooks = []; // later stories register extra bindings (log sheet, edit)
export const onRender = fn => hooks.push(fn);

export function render() {
  state.today = torontoDate();
  if (state.today < START) state.today = START;
  state.route = routeFromHash();
  state.signedIn = auth.signedIn;
  app.innerHTML = page(state);
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
  on('back', e => { e.preventDefault(); history.replaceState(null, '', location.pathname + location.search); render(); scrollTo(0, 0); });
  on('signin', signInSheet);
  on('signout', async () => { await auth.signOut(); render(); toast('Signed out.'); });
  hooks.forEach(fn => fn(state));
}

export async function refresh() {
  const r = await store.load();
  Object.assign(state, { rows: r.rows, offline: r.offline, error: r.error, loading: false });
  render();
}

function signInSheet() {
  openSheet(`<div class="row"><h3>Sign in</h3>${X}</div>
   <form id="signform" style="display:flex;flex-direction:column;gap:12px" novalidate>
   <div><label class="lab" for="email">Email</label><input class="field" id="email" type="email" autocomplete="username" inputmode="email" data-autofocus></div>
   <div><label class="lab" for="pw">Password</label><input class="field" id="pw" type="password" autocomplete="current-password"></div>
   <p class="muted" style="font-size:13px;margin:0">Only Dee can sign in and log workouts. You'll stay signed in unless you're away for 2 days.</p>
   <p class="note warn" id="perr" hidden></p>
   <button class="cta" type="submit">Sign in</button></form>`, root => {
    const form = root.querySelector('#signform'), err = root.querySelector('#perr'), btn = form.querySelector('button[type=submit]');
    form.onsubmit = async ev => {
      ev.preventDefault(); err.hidden = true; btn.disabled = true; btn.textContent = 'Signing in…';
      const r = await auth.signIn(form.querySelector('#email').value, form.querySelector('#pw').value);
      btn.disabled = false; btn.textContent = 'Sign in';
      if (!r.ok) { err.textContent = errorMessage(r.error); err.hidden = false; return; }
      closeSheet(); render(); toast("Signed in. You'll stay signed in unless you're away for 2 days.");
    };
  });
}

addEventListener('hashchange', () => { render(); scrollTo(0, 0); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') auth.touch(); });

render();
auth.init().catch(() => false).then(render);
refresh();

export { client, state, auth };
