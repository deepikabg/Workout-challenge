// Bottom sheets, toasts and the finish confetti (ported from prototype v7).
const $ = s => document.querySelector(s);
export const X = '<button class="x" data-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';

export function closeSheet() { $('#sheet-root').innerHTML = ''; }

export function openSheet(html, onBind) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="scrim" id="scrim"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  $('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') closeSheet(); });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheet));
  onBind?.(root);
  (root.querySelector('[data-autofocus]') || root.querySelector('button'))?.focus();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

let toastTimer;
export function toast(msg) {
  const root = $('#toast-root');
  root.innerHTML = '';
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
  root.append(el);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { root.innerHTML = ''; }, 2600);
}

export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  cv.hidden = false; cv.width = innerWidth; cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--ill-teal', '--ill-coral', '--ill-teal-2', '--ill-coral-2'].map(v => cs.getPropertyValue(v).trim());
  const P = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, c: cols[Math.random() * 4 | 0], a: Math.random() * 6 }));
  let f = 0;
  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.a += 0.1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-4, -2, 8 + p.r, 4); ctx.restore(); }
    if (++f < 200) requestAnimationFrame(tick); else cv.hidden = true;
  })();
}
