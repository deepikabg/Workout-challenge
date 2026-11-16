// S-007 — live updates (J-8): realtime event → refetch; also refetch when the page becomes visible and every 60 s while visible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startLive } from '../src/live.js';

function fakeEnv() {
  const handlers = {}; let visible = 'visible'; const timers = [];
  const doc = { get visibilityState() { return visible; }, addEventListener: (ev, fn) => (handlers[ev] = fn) };
  const channelFns = {};
  const client = {
    channel(name) { const ch = { on(type, filter, fn) { channelFns.fn = fn; channelFns.filter = filter; channelFns.type = type; return ch; }, subscribe() { channelFns.subscribed = true; return ch; } }; channelFns.name = name; return ch; },
    removeChannel() { channelFns.removed = true; },
  };
  const timer = { setInterval: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearInterval: () => {} };
  return { doc, client, timer, timers, channelFns, setVisible: v => { visible = v; handlers.visibilitychange?.(); } };
}

test('subscribes to all changes on public.workouts and refetches on each event', () => {
  const env = fakeEnv(); let n = 0;
  startLive({ client: env.client, refresh: () => n++, doc: env.doc, timer: env.timer });
  assert.equal(env.channelFns.type, 'postgres_changes');
  assert.deepEqual(env.channelFns.filter, { event: '*', schema: 'public', table: 'workouts' });
  assert.ok(env.channelFns.subscribed);
  env.channelFns.fn({ eventType: 'INSERT' }); assert.equal(n, 1);
});

test('refetches when the page becomes visible again', () => {
  const env = fakeEnv(); let n = 0;
  startLive({ client: env.client, refresh: () => n++, doc: env.doc, timer: env.timer });
  env.setVisible('hidden'); assert.equal(n, 0);
  env.setVisible('visible'); assert.equal(n, 1);
});

test('polls every 60 s, but only while visible', () => {
  const env = fakeEnv(); let n = 0;
  startLive({ client: env.client, refresh: () => n++, doc: env.doc, timer: env.timer });
  assert.equal(env.timers[0].ms, 60000);
  env.timers[0].fn(); assert.equal(n, 1);
  env.setVisible('hidden'); env.timers[0].fn(); assert.equal(n, 1);
});

test('a realtime failure never throws into the page', () => {
  const env = fakeEnv(); env.client.channel = () => { throw new Error('ws blocked'); };
  assert.doesNotThrow(() => startLive({ client: env.client, refresh: () => {}, doc: env.doc, timer: env.timer }));
});
