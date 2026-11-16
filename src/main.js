// App entry: wires the Supabase client, data store and renderer. Owner sign-in and writes land in S-005/S-006.
import { SUPABASE_URL, SUPABASE_ANON_KEY, START } from './config.js';
import { torontoDate } from './rules.js';
import { createStore } from './data.js';
import { page } from './ui.js';

const client = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
const store = createStore({ client });
const app = document.getElementById('app');

const state = { rows: [], today: torontoDate(), route: 'home', signedIn: false, offline: false, error: null, loading: true };
const routeFromHash = () => (location.hash === '#history' ? 'history' : 'home');

function render() {
  state.today = torontoDate();
  if (state.today < START) state.today = START;
  state.route = routeFromHash();
  app.innerHTML = page(state);
  const back = document.getElementById('back');
  if (back) back.onclick = e => { e.preventDefault(); history.replaceState(null, '', location.pathname + location.search); render(); scrollTo(0, 0); };
}

async function refresh() {
  const r = await store.load();
  Object.assign(state, { rows: r.rows, offline: r.offline, error: r.error, loading: false });
  render();
}

addEventListener('hashchange', () => { render(); scrollTo(0, 0); });
render();
refresh();

export { client, state, render, refresh };
