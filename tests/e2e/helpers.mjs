import { createRequire } from 'node:module';
// Playwright is preinstalled globally in dev/CI images; resolve it the CommonJS way so no npm install is needed.
export const { chromium } = createRequire(import.meta.url)('playwright');

export const SEED_ROWS = [
  ['2026-11-09', 'gravity', 'ymca', 30], ['2026-11-11', 'homeyoga', 'home', 45], ['2026-11-13', 'core', 'ymca', 30],
  ['2026-11-14', 'totaltone', 'ymca', 30], ['2026-11-15', 'homeyoga', 'home', 45],
].map(([day, type, location, minutes], i) => ({ id: `0b5e0000-0000-4000-8000-00000000000${i + 1}`, day, type, location, minutes, created_at: '2026-11-16T00:00:00Z' }));

/** Intercepts calls to the Supabase project so journeys run without the real network. */
export async function stubSupabase(page, { rows = [], fail = false, onWrite } = {}) {
  await page.route(/supabase\.co\/rest\/v1\/workouts/, async route => {
    if (fail) return route.abort('internetdisconnected');
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) });
    if (onWrite) return onWrite(route, req, rows);
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: '42501', message: 'permission denied' }) });
  });
  await page.route(/supabase\.co\/realtime/, route => route.abort());
}

export const OWNER_ID = '7bcf9a92-b2ba-4992-9b33-a1313a70e446';
/** Stubs Supabase Auth's password grant. `password` is the only one accepted. */
export async function stubAuth(page, { password = 'right-password', userId = OWNER_ID } = {}) {
  await page.route(/supabase\.co\/auth\/v1\/token/, async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (body.password !== password) return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'invalid_credentials', error_code: 'invalid_credentials', msg: 'Invalid login credentials' }) });
    const now = Math.floor(Date.now() / 1000);
    const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: body.email, app_metadata: {}, user_metadata: {}, created_at: '2026-11-16T00:00:00Z' };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'test.' + now, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'r', user }) });
  });
  await page.route(/supabase\.co\/auth\/v1\/logout/, route => route.fulfill({ status: 204, body: '' }));
  await page.route(/supabase\.co\/auth\/v1\/user/, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: userId, aud: 'authenticated', role: 'authenticated' }) }));
}

/** In-memory fake of the workouts table for owner writes (POST upsert / PATCH / DELETE). */
export function memoryTable(rows) {
  return async (route, req) => {
    const url = new URL(req.url()), id = (url.searchParams.get('id') || '').replace(/^eq\./, '');
    const m = req.method();
    if (m === 'POST') { const body = JSON.parse(req.postData()); for (const r of [].concat(body)) if (!rows.some(x => x.id === r.id)) rows.push(r); }
    else if (m === 'PATCH') { const patch = JSON.parse(req.postData()); Object.assign(rows.find(x => x.id === id) || {}, patch); }
    else if (m === 'DELETE') { const i = rows.findIndex(x => x.id === id); if (i >= 0) rows.splice(i, 1); }
    return route.fulfill({ status: m === 'POST' ? 201 : 204, body: '' });
  };
}

export async function signInAsOwner(page) {
  await page.click('#signin'); await page.fill('#email', 'dee@example.com'); await page.fill('#pw', 'right-password');
  await page.click('#signform button[type=submit]'); await page.waitForSelector('#logbtn');
}
