// Service worker (P-02): caches the app shell so the home-screen app opens offline.
// Workout data from Supabase is NEVER cached here — the page keeps its own last-known copy.
const VERSION = 'wc-shell-v1';
const SHELL = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest', 'vendor/supabase-2.118.0.js',
  'src/main.js', 'src/config.js', 'src/rules.js', 'src/data.js', 'src/auth.js', 'src/ui.js',
  'src/icons.js', 'src/sheets.js', 'src/log.js', 'src/live.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // Supabase, fonts: straight to network
  // Network first so a new release shows up right away; fall back to the cached shell offline.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
