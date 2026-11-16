// Custom workout illustrations in the Power Moves palette (D-011/D-014). Static SVG strings, no user data.
import { TYPES } from './config.js';
const TONE = Object.fromEntries(TYPES.map(t => [t.id, t.tone]));
const S='stroke="var(--ill-ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
function face(x,y,k=1){return `<g transform="translate(${x} ${y}) scale(${k})"><circle cx="-3.6" cy="-1" r="1.4" fill="var(--ill-ink)"/><circle cx="3.6" cy="-1" r="1.4" fill="var(--ill-ink)"/><path d="M-2 1.8 Q0 3.6 2 1.8" fill="none" ${S} stroke-width="1.5"/><circle cx="-6" cy="2" r="1.6" fill="var(--blush)" opacity=".9"/><circle cx="6" cy="2" r="1.6" fill="var(--blush)" opacity=".9"/></g>`}
export const ICONS={
  gravity:`<rect x="5" y="25" width="38" height="7" rx="3.5" transform="rotate(-24 24 28)" fill="var(--ill-coral)" ${S}/><path d="M12 38 v5 M36 27 v15" ${S} fill="none"/><circle cx="22" cy="20" r="8.5" fill="var(--ill-teal)" ${S}/>${face(22,20,.8)}<path d="M34 8 l4 -2 M36 13 l5 -1" ${S} fill="none"/>`,
  totaltone:`<rect x="4" y="15" width="8" height="18" rx="3" fill="var(--ill-coral)" ${S}/><rect x="36" y="15" width="8" height="18" rx="3" fill="var(--ill-coral)" ${S}/><rect x="12" y="17" width="24" height="14" rx="7" fill="var(--ill-teal)" ${S}/>${face(24,24,.8)}`,
  core:`<path d="M24 5 L29 17 L42 18 L32 27 L35 40 L24 33 L13 40 L16 27 L6 18 L19 17 Z" fill="var(--ill-coral)" ${S}/>${face(24,23,.9)}`,
  kettle:`<path d="M16 20 V16 a8 8 0 0 1 16 0 V20" fill="none" ${S} stroke-width="3"/><path d="M11 30 a13 12 0 0 1 26 0 v6 a5 5 0 0 1 -5 5 h-16 a5 5 0 0 1 -5 -5 Z" fill="var(--ill-teal)" ${S}/>${face(24,31,.95)}`,
  yoga:`<path d="M24 8 C31 15 31 27 24 36 C17 27 17 15 24 8 Z" fill="var(--ill-teal)" ${S}/><path d="M23 36 C14 36 7 29 6 20 C13 20 20 25 23 36 Z" fill="var(--ill-teal-2)" ${S}/><path d="M25 36 C34 36 41 29 42 20 C35 20 28 25 25 36 Z" fill="var(--ill-teal-2)" ${S}/><path d="M10 41 h28" ${S}/>${face(24,24,.75)}`,
  gym:`<path d="M6 30 C6 22 12 18 18 18 L22 12 h6 l2 8 C36 21 42 25 42 31 v3 H6 Z" fill="var(--ill-coral)" ${S}/><rect x="5" y="34" width="38" height="6" rx="3" fill="var(--ill-cream)" ${S}/><path d="M21 21 l4 1 M19 25 l4 1" ${S} fill="none"/>${face(34,28,.75)}`,
  homeyoga:`<path d="M8 22 L24 9 L40 22" fill="var(--ill-coral)" ${S}/><rect x="11" y="21" width="26" height="20" rx="4" fill="var(--ill-teal)" ${S}/>${face(24,28,.85)}<path d="M24 35 c3 0 5 -2 5 -4 c-2 0 -4 1 -5 3 c-1 -2 -3 -3 -5 -3 c0 2 2 4 5 4 z" fill="var(--ill-cream)" ${S} stroke-width="1.2"/>`,
  other:`<path d="M24 5 C26 17 31 22 43 24 C31 26 26 31 24 43 C22 31 17 26 5 24 C17 22 22 17 24 5 Z" fill="var(--ill-teal)" ${S}/>${face(24,24,.85)}<circle cx="38" cy="9" r="2.5" fill="var(--ill-coral)"/>`,
  trophy:`<path d="M15 8 h18 v8 a9 9 0 0 1 -18 0 Z" fill="var(--ill-teal)" ${S}/><path d="M15 11 h-5 a5 5 0 0 0 5 7 M33 11 h5 a5 5 0 0 1 -5 7" fill="none" ${S}/><path d="M21 25 h6 v6 h-6 Z" fill="var(--ill-coral)" ${S}/><rect x="14" y="31" width="20" height="8" rx="3" fill="var(--ill-coral)" ${S}/>${face(24,14,.75)}`,
  sparkle:`<path d="M24 4 C26 16 32 22 44 24 C32 26 26 32 24 44 C22 32 16 26 4 24 C16 22 22 16 24 4 Z" fill="var(--ill-coral)" ${S}/>${face(24,24,.85)}`
};
export const icon=(id)=>`<svg viewBox="0 0 48 48" aria-hidden="true">${ICONS[id]}</svg>`;
export const bubble = (id, grey) => `<span class="bubble ${grey ? 'grey' : (TONE[id] || 'teal')}">${icon(id)}</span>`;
