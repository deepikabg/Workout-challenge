// S-009 — keep-alive (D-019) and Pages deploy workflows: shape checks (the live runs are verified after merge).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('keep-alive runs weekly + on demand, read-only, with the public key only', () => {
  const y = read('.github/workflows/keepalive.yml');
  assert.match(y, /schedule:\s*\n\s*- cron: '\d+ \d+ \* \* \d'/);
  assert.match(y, /workflow_dispatch/);
  assert.match(y, /rest\/v1\/workouts\?select=id&limit=1/);
  assert.doesNotMatch(y, /-X (POST|PATCH|DELETE)|service_role|secrets\./);
  assert.match(y, /permissions:\s*\n\s*contents: read/);
});

test('Pages deploy publishes only the app files from main', () => {
  const y = read('.github/workflows/pages.yml');
  assert.match(y, /branches: \[main\]/);
  assert.match(y, /actions\/deploy-pages@v4/);
  for (const f of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js', 'src', 'vendor', 'icons']) assert.match(y, new RegExp(`\\b${f.replace('.', '\\.')}\\b`));
  for (const f of ['.pipeline', 'tests', 'db']) assert.doesNotMatch(y.split('cp -r')[1] || '', new RegExp(f.replace('.', '\\.')), `${f} must not ship`);
  assert.ok(existsSync(new URL('../.nojekyll', import.meta.url)) || /\.nojekyll/.test(y));
});
