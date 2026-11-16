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
