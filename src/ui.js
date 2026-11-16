// Rendering (ported from approved prototype v7). Pure string builders + one render() entry point.
// All dynamic values are enums, numbers or dates from the DB; text still goes through esc() as a backstop.
import { START, END, GOAL, TOTAL_DAYS, TYPES } from './config.js';
import { compute, qualifies, minFor, quoteFor, addDays, dayNumber } from './rules.js';
import { icon, bubble } from './icons.js';
import { errorMessage } from './data.js';

const T = Object.fromEntries(TYPES.map(t => [t.id, t]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (d, o) => new Date(dayNumber(d) * 864e5).toLocaleDateString('en-CA', { timeZone: 'UTC', ...o });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function header({ today, signedIn }) {
  const day = Math.min(TOTAL_DAYS, Math.max(1, dayNumber(today) - dayNumber(START) + 1));
  const action = signedIn
    ? '<button class="link" id="signout" style="font-size:12px">Sign out</button>'
    : '<button class="link" id="signin" style="font-size:12px">Dee? Sign in</button>';
  return `<header class="top"><div><div class="eyebrow">30 in 45 · Nov 9 – Dec 23</div><h1>Dee's workout challenge</h1></div>
  <div class="who">Day ${day} of 45<br>${action}</div></header>`;
}

export function hero(c) {
  const R = 44, C = 2 * Math.PI * R, frac = Math.min(1, c.done / GOAL);
  const [paceTxt, paceCls] = c.finished ? ['Challenge complete', 'ok'] : c.ended ? ['Challenge over', 'grey'] : c.projected >= GOAL ? ['On pace', 'ok'] : ['Just behind pace', 'warn'];
  const pace = c.finished
    ? `<span class="muted">${c.done} workouts, ${c.totalMin.toLocaleString()} minutes. Legend.</span>`
    : `<span class="muted">Needs <span class="num">${c.need.toFixed(2)}</span>/day · averaging <span class="num">${c.actual.toFixed(2)}</span>/day</span>`;
  return `<section class="card hero" aria-label="Progress">
   <div><div class="eyebrow">${c.finished ? 'You did it' : 'To go'}</div>
     <div class="big"><span>${c.toGo}</span><span class="slash">/</span><span class="days">${c.daysLeft}</span></div>
     <div class="legend"><strong>${c.toGo} more</strong> workout${c.toGo === 1 ? '' : 's'} in <strong>${plural(c.daysLeft, 'day')}</strong></div></div>
   <div class="ring" role="img" aria-label="${c.done} of 30 done"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--elevated)" stroke-width="10"/><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C * frac} ${C}"/></svg><div class="lbl"><div><b>${c.done}</b>of 30 done</div></div></div>
   <div class="pace"><span class="pill ${paceCls}">${paceTxt}</span>${pace}</div>
  </section>`;
}

export function quote(today) {
  const q = quoteFor(today);
  return `<section class="card quote" aria-label="Quote of the day"><span class="spark">${icon('sparkle')}</span><figure><div class="eyebrow" style="margin-bottom:6px">Today's nudge</div><blockquote><p>“${esc(q.text)}”</p></blockquote><figcaption class="tag">— ${esc(q.by)}</figcaption></figure></section>`;
}

export function calendar(c, today) {
  let cells = '';
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = addDays(START, i), list = c.byDay[d] || [], counted = c.counted.has(d);
    let cls = 'cell', inner = `<span class="d">${+d.slice(8)}</span>`, label = fmt(d, { month: 'short', day: 'numeric' });
    if (list.length) {
      const main = list.find(qualifies) || list[0];
      cls += counted ? ' done' : ' short'; inner += icon(main.type);
      if (counted && list.filter(qualifies).length > 1) cls += ' multi';
      label += ': ' + list.map(w => `${T[w.type].name} ${w.minutes} min`).join(', ') + (counted ? ' (counted)' : ' (not counted)');
    } else if (d > today) { cls += ' future'; label += ': upcoming'; } else { label += ': no workout'; }
    if (d === today) cls += ' today';
    cells += `<div class="${cls}" role="img" aria-label="${esc(label)}" title="${esc(label)}">${inner}</div>`;
  }
  return `<section class="card" aria-label="Calendar"><div class="cal-head"><h2>45 days</h2><span class="muted" style="font-size:13px">${c.done} counted · ${c.daysLeft} left</span></div>
   <div class="dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
   <div class="grid" style="margin-top:6px">${cells}</div>
   <div class="keys"><span><i style="background:var(--bubble-teal)"></i>Counted</span><span><i style="background:var(--bubble-grey)"></i>Logged, didn't count</span><span><i style="outline:2px solid var(--cta);outline-offset:-2px"></i>Today</span></div></section>`;
}

export function stats(c) {
  const max = Math.max(1, ...Object.values(c.byType).map(v => v.n));
  const rows = TYPES.filter(t => c.byType[t.id]).sort((a, b) => c.byType[b.id].n - c.byType[a.id].n).map(t => {
    const v = c.byType[t.id];
    return `<div class="bt">${bubble(t.id)}<div><div>${t.name}</div><div class="bar"><span style="width:${v.n / max * 100}%"></span></div></div><span class="num muted">${v.n}× · ${v.min}m</span></div>`;
  }).join('');
  return `<section class="card" aria-label="Stats"><h2 style="margin-bottom:12px">Stats</h2><div class="stats">
   <div class="stat"><div class="v">${c.totalMin}<small> min</small></div><div class="k">Total time moving</div></div>
   <div class="stat"><div class="v">${c.streak}<small> day${c.streak === 1 ? '' : 's'}</small></div><div class="k">Current streak · best ${c.longest}</div></div>
   <div class="stat"><div class="v">${c.avg}<small> min</small></div><div class="k">Average session</div></div>
   <div class="stat"><div class="v">${c.projected}</div><div class="k">Finish projection at this pace</div></div>
   </div>${rows ? `<div class="bytype">${rows}</div>` : ''}</section>`;
}

export function historyLink(c, signedIn) {
  return `<a class="card histlink" href="#history"><span><strong>Workout history</strong><span class="muted" style="display:block;font-size:13px">${c.sessions} logged · ${c.totalMin} min${signedIn ? ' · edit or delete here' : ''}</span></span><span aria-hidden="true" style="font-size:20px">→</span></a>`;
}

export function history(rows, signedIn) {
  const list = rows.filter(w => w.day >= START && w.day <= END).sort((a, b) => b.day.localeCompare(a.day));
  if (!list.length) return `<section class="card empty" aria-label="Workout history">${icon('sparkle')}<h2 style="margin:8px 0 4px">Day 1. Let's go.</h2><p style="margin:0">No workouts yet. The first one fills a square on the calendar.</p></section>`;
  const items = list.map(w => {
    const q = qualifies(w), where = w.type === 'other' ? (w.location === 'home' ? ' · home' : ' · YMCA') : '';
    const inner = `${bubble(w.type, !q)}<div><div class="t">${T[w.type].name}${where}</div><div class="s">${fmt(w.day, { weekday: 'short', month: 'short', day: 'numeric' })}${q ? '' : ` · <span class='pill grey'>Didn't count · under ${minFor(w)} min</span>`}</div></div><div class="m num">${w.minutes}<small class="muted" style="font-weight:500;font-size:11px">min</small></div>`;
    return `<li>${signedIn ? `<button class="entry${q ? '' : ' short'}" data-edit="${esc(w.id)}" aria-label="Edit ${T[w.type].name} on ${w.day}">${inner}</button>` : `<div class="entry${q ? '' : ' short'}">${inner}</div>`}</li>`;
  }).join('');
  return `<section class="card" aria-label="Workout history"><div class="cal-head"><h2>Workout history</h2><span class="muted" style="font-size:13px">${list.length} logged${signedIn ? ' · tap to edit' : ''}</span></div><ul class="log">${items}</ul></section>`;
}

/** Whole-page render. `state` = { rows, today, route, signedIn, offline, error, loading } */
export function page(state) {
  const { rows, today, route, signedIn, offline, error, loading } = state;
  let h = header(state);
  if (loading) return h + '<div class="skel" style="height:190px"></div><div class="skel" style="height:90px"></div><div class="skel" style="height:320px"></div>';
  if (offline) h += `<div class="banner" role="status"><strong>${esc(errorMessage(error || 'NETWORK'))}</strong>${signedIn ? ' New workouts can be logged when you\'re back online.' : ''}</div>`;
  const c = compute(rows, today);
  if (route === 'history') {
    h += '<a class="link" href="#" id="back" style="align-self:flex-start">← Back to progress</a>' + history(rows, signedIn);
  } else {
    h += hero(c);
    if (signedIn) h += `<button class="cta" id="logbtn"${offline ? ' disabled' : ''}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Log a workout</button>`;
    h += quote(today) + calendar(c, today) + stats(c) + historyLink(c, signedIn);
  }
  h += '<p class="muted" style="font-size:12px;text-align:center;margin:8px 0 0">A day counts when one workout hits 30 min at the YMCA or 45 min at home.<br>Updates live as Dee logs.</p>';
  return h;
}
