// Live updates (D-015, J-8). Realtime push when it works; refetch on focus and every 60 s as a backstop.
export function startLive({ client, refresh, doc = document, timer = globalThis, intervalMs = 60000 }) {
  let channel = null;
  try {
    channel = client.channel('workouts-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => refresh())
      .subscribe();
  } catch { /* realtime unavailable: polling below still keeps pages fresh */ }
  doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible') refresh(); });
  const id = timer.setInterval(() => { if (doc.visibilityState === 'visible') refresh(); }, intervalMs);
  return () => { timer.clearInterval(id); if (channel) try { client.removeChannel(channel); } catch { /* ignore */ } };
}
