// Owner logging: log sheet, edit/delete from History, finish celebration (ported from prototype v7).
import { START, GOAL, TYPES, MIN_MINUTES } from './config.js';
import { compute, qualifies, minFor } from './rules.js';
import { newWorkout, errorMessage } from './data.js';
import { bubble, icon } from './icons.js';
import { openSheet, closeSheet, toast, confetti, X } from './sheets.js';

const T = Object.fromEntries(TYPES.map(t => [t.id, t]));
const DURS = [30, 45, 60, 75];

/** ctx = { store, state, refresh } — called after every render while signed in. */
export function bindOwner(ctx) {
  const log = document.getElementById('logbtn');
  if (log) log.onclick = () => logSheet(ctx);
  document.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => { const w = ctx.state.rows.find(r => r.id === b.dataset.edit); if (w) logSheet(ctx, w); };
  });
}

function logSheet(ctx, edit) {
  const today = ctx.state.today;
  const e = edit ? { ...edit } : { day: today, type: null, minutes: null, location: 'ymca' };
  const newId = crypto.randomUUID(); // fixed for this sheet, so a retried save can't double-write
  openSheet(`<div class="row"><h3>${edit ? 'Edit workout' : 'Nice. What did you do?'}</h3>${X}</div>
   <div><span class="lab">Workout</span><div class="types">${TYPES.map(t => `<button class="type" data-type="${t.id}" aria-pressed="false">${bubble(t.id)}${t.name}</button>`).join('')}</div></div>
   <div id="wherebox" hidden><span class="lab">Where?</span><div class="seg"><button class="dur" data-where="ymca">YMCA</button><button class="dur" data-where="home">Home</button></div></div>
   <div><span class="lab">How long?</span><div class="durs">${DURS.map(m => `<button class="dur" data-min="${m}">${m}</button>`).join('')}<input class="field num" id="custom" inputmode="numeric" placeholder="Other min" style="width:120px" aria-label="Other number of minutes"></div></div>
   <div><label class="lab" for="date">When?</label><input class="field" id="date" type="date" min="${START}" max="${today}" value="${e.day}"></div>
   <p class="note" id="hint" hidden></p>
   <p class="note warn" id="saveerr" hidden></p>
   <button class="cta" id="save">${edit ? 'Save changes' : 'Log it'}</button>
   ${edit ? '<button class="danger" id="del">Delete this workout</button>' : ''}`, root => {
    const $ = s => root.querySelector(s);
    const sync = () => {
      root.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === e.type)));
      root.querySelectorAll('[data-min]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.min === e.minutes)));
      root.querySelectorAll('[data-where]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.where === e.location)));
      $('#wherebox').hidden = e.type !== 'other';
      const hint = $('#hint'), ready = Boolean(e.type && e.minutes);
      if (ready) {
        const m = minFor(e), ok = e.minutes >= m;
        hint.hidden = false; hint.className = 'note ' + (ok ? 'ok' : 'warn');
        hint.textContent = ok ? 'Counts toward your 30.' : `Under ${m} min ${m === MIN_MINUTES.home ? 'at home' : 'at the YMCA'}. It'll be saved and added to your total time, but won't count toward the challenge.`;
      } else hint.hidden = true;
      $('#save').disabled = !ready; $('#save').style.opacity = ready ? 1 : 0.5;
    };
    root.querySelectorAll('[data-type]').forEach(b => b.onclick = () => {
      e.type = b.dataset.type;
      if (T[e.type].where) e.location = T[e.type].where;
      if (!e.minutes) e.minutes = MIN_MINUTES[e.location];
      sync();
    });
    root.querySelectorAll('[data-min]').forEach(b => b.onclick = () => { e.minutes = +b.dataset.min; $('#custom').value = ''; sync(); });
    root.querySelectorAll('[data-where]').forEach(b => b.onclick = () => { e.location = b.dataset.where; sync(); });
    $('#custom').oninput = ev => { const v = parseInt(ev.target.value, 10); e.minutes = v > 0 && v <= 600 ? v : null; sync(); };
    $('#date').onchange = ev => { e.day = ev.target.value || today; };
    if (edit && !DURS.includes(e.minutes)) $('#custom').value = e.minutes;
    sync();

    $('#save').onclick = async () => {
      const btn = $('#save'); btn.disabled = true; btn.textContent = 'Saving…'; $('#saveerr').hidden = true;
      const before = compute(ctx.state.rows, today).done;
      const row = edit ? null : { ...newWorkout(e), id: newId };
      const r = edit ? await ctx.store.update(edit.id, e) : await ctx.store.add(row);
      if (!r.ok) {
        $('#saveerr').textContent = errorMessage(r.error) + (r.error === 'NETWORK' ? ' Tap "Log it" again to retry. It won\'t be saved twice.' : '');
        $('#saveerr').hidden = false; btn.disabled = false; btn.textContent = edit ? 'Save changes' : 'Log it';
        return;
      }
      closeSheet();
      await ctx.refresh();
      const after = compute(ctx.state.rows, ctx.state.today);
      if (after.done >= GOAL && before < GOAL) return celebrate();
      const q = qualifies(e);
      toast(edit ? 'Workout updated.' : q ? (after.done > before ? `Logged. ${after.toGo} to go!` : 'Logged. That day already counted, the minutes still add up.') : "Saved to your total time. It won't count toward the 30.");
    };

    if (edit) {
      let armed = false;
      $('#del').onclick = async ev => {
        if (!armed) { armed = true; ev.target.textContent = 'Tap again to delete'; return; }
        ev.target.disabled = true;
        const r = await ctx.store.remove(edit.id);
        if (!r.ok) { $('#saveerr').textContent = errorMessage(r.error); $('#saveerr').hidden = false; ev.target.disabled = false; return; }
        closeSheet(); await ctx.refresh(); toast('Workout deleted.');
      };
    }
  });
}

function celebrate() {
  openSheet(`<div class="celebrate">${icon('trophy')}<h3>30 workouts. You did it, Dee!</h3><p class="muted" style="margin:0">Every square you filled was a promise you kept to yourself.</p><button class="cta" data-close>Take a bow</button></div>`);
  confetti();
}
