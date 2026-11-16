// G-05 secret scan. Fails on: Supabase secret keys, any JWT whose role isn't "anon", committed .env files.
// Usage: node scripts/secret-scan.mjs   (exit 1 on findings)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const TEXT = /\.(js|mjs|html|css|json|webmanifest|sql|yml|yaml|md|txt|sh)$/i;
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.([A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]*/g;

function files(root) {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const p = join(dir, name), st = statSync(p);
      if (st.isDirectory()) walk(p);
      else out.push(p);
    }
  })(root);
  return out;
}

export function scan(root, inMemory) {
  const list = inMemory ?? files(root).map(p => ({ path: relative(root, p), abs: p }));
  const findings = [];
  for (const f of list) {
    const name = f.path.split('/').pop();
    if (/^\.env(\.|$)/.test(name) && name !== '.env.example') { findings.push(`${f.path}: committed env file`); continue; }
    if (!inMemory && !TEXT.test(name)) continue;
    const text = f.text ?? readFileSync(f.abs, 'utf8');
    if (/sb_secret_[A-Za-z0-9]/.test(text)) findings.push(`${f.path}: Supabase secret key (sb_secret_…)`);
    for (const m of text.matchAll(JWT)) {
      let role = '?';
      try { role = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8')).role ?? '?'; } catch {}
      if (role !== 'anon') findings.push(`${f.path}: JWT with role "${role}"`);
    }
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const found = scan(process.cwd());
  if (found.length) { console.error('Secret scan FAILED:\n' + found.join('\n')); process.exit(1); }
  console.log('Secret scan clean.');
}
