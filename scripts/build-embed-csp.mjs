// Safe to edit by hand
// =============================================================================
// build-embed-csp.mjs - allow a known embed service's scripts only where it is used
// =============================================================================
// Runs straight after scripts/build-csp.mjs (package.json "build"). build-csp
// has already written the site-wide script-src into dist/client/_headers from
// what the built pages load. A known service's widget (Tithe.ly, Calendly,
// Planning Center) often loads more of itself at RUNTIME from a sibling host,
// which never appears in the HTML, so build-csp cannot see it.
//
// The Custom code or embed block (src/components/sections/EmbedSection.astro)
// marks code from a known service with data-embed-provider="<id>". This step
// reads those ids off the built pages, looks each one up in the registry
// (src/lib/embed-providers.ts) and adds that service's script origins to the
// same line. A service nobody uses adds nothing, so the line stays short.
// Only ids the registry knows count: a marker an editor typed by hand into
// pasted code names no origin of its own.
//
// Kept apart from build-csp.mjs on purpose: that file is PORTABLE (the starter
// is its library of record), and this registry is this site's.
//
// Cloudflare rejects a _headers line over 2,000 characters (card 159), so the
// limit is checked again here and the build fails before a deploy would.
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { addScriptOrigins, providerIdsIn } from './lib/embed-csp.mjs';
import { providerById, providerCspOrigins } from '../src/lib/embed-providers.ts';

const ROOT = 'dist/client';
const HEADERS = path.join(ROOT, '_headers');
const LINE_LIMIT = 2000;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return p === path.join(ROOT, 'studio') ? [] : walk(p);
    return e.name.endsWith('.html') ? [p] : [];
  });

const ids = new Set();
for (const file of walk(ROOT)) {
  for (const id of providerIdsIn(fs.readFileSync(file, 'utf8'))) ids.add(id);
}
const providers = [...ids].map((id) => providerById(id)).filter(Boolean);
const origins = [...new Set(providers.flatMap((p) => providerCspOrigins(p)))];

if (origins.length === 0) {
  console.log('[embed-csp] no known embed service needs extra script origins');
  process.exit(0);
}

const headers = fs.readFileSync(HEADERS, 'utf8');
const result = addScriptOrigins(headers, origins);
if (!result.ok) {
  console.error(`[embed-csp] ${result.reason}`);
  process.exit(1);
}
if (result.lineLength > LINE_LIMIT) {
  console.error(
    `[embed-csp] With ${providers.map((p) => p.name).join(', ')} the Content-Security-Policy line is ` +
      `${result.lineLength} characters; Cloudflare's _headers limit is ${LINE_LIMIT}.`,
  );
  process.exit(1);
}
fs.writeFileSync(HEADERS, result.text);
console.log(
  `[embed-csp] added ${result.added.length} script origin(s) for ${providers.map((p) => p.name).join(', ')} ` +
    `(line ${result.lineLength} of ${LINE_LIMIT} characters)`,
);
