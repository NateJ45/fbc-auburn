// =============================================================================
// build-csp.mjs - write the public pages' script policy into _headers (2026-10-24)
// =============================================================================
// Runs straight after `astro build` (package.json "build"), so CI, Lighthouse,
// `npm run preview` and deploy all ship the same policy. It reads every built
// page in dist/client (the Studio's own pages excepted: /studio/* detaches the
// policy in public/_headers) and rewrites the /* rule's Content-Security-Policy
// line in dist/client/_headers from
//     frame-ancestors 'self'
// to
//     frame-ancestors 'self'; object-src 'none'; base-uri 'self'; script-src <list>
// where <list> is 'self', 'wasm-unsafe-eval' (Pagefind), the external script
// origins the pages load, and a sha256 hash of every inline script on every page
// (scripts/lib/csp.mjs says why it is one site-wide list).
//
// Only script-src, object-src and base-uri are restricted, never default-src:
// images, frames (YouTube, Facebook, maps), styles, fonts and fetches (the
// weather) carry on exactly as before, so a new embed cannot break silently.
// What CAN break: a script that pasted code (Custom code block, Site settings'
// page code) ADDS at runtime from an origin that is not in the HTML. If one
// appears, add its origin to RUNTIME_ORIGINS below. docs/agent/deployment.md ("Security headers").
//
// Fails the build if the line it replaces is missing, so the policy can never
// quietly fall back to none.
import fs from 'node:fs';
import path from 'node:path';
import { scanHtml, scriptSrc } from './lib/csp.mjs';

const ROOT = 'dist/client';
const HEADERS = path.join(ROOT, '_headers');
const PLACEHOLDER = "  Content-Security-Policy: frame-ancestors 'self'";

// Origins our own code adds at runtime, so they never appear as a <script src>.
// GA4 (GoogleAnalytics.astro) builds its tag in JS; included only when a page carries it.
const RUNTIME_ORIGINS = [
  { origin: 'https://www.googletagmanager.com', when: 'googletagmanager.com/gtag/js' },
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return p === path.join(ROOT, 'studio') ? [] : walk(p);
    return e.name.endsWith('.html') ? [p] : [];
  });

const pages = walk(ROOT);
const all = { inline: new Set(), origins: new Set(), handlers: new Set() };
for (const file of pages) {
  const found = scanHtml(fs.readFileSync(file, 'utf8'));
  for (const k of Object.keys(all)) for (const v of found[k]) all[k].add(v);
}
const inlineText = [...all.inline].join('\n');
const extra = RUNTIME_ORIGINS.filter((r) => inlineText.includes(r.when)).map((r) => r.origin);
const policy = `frame-ancestors 'self'; object-src 'none'; base-uri 'self'; script-src ${scriptSrc(all, extra)}`;

const headers = fs.readFileSync(HEADERS, 'utf8');
const lines = headers.split(/\r?\n/);
const at = lines.indexOf(PLACEHOLDER);
if (at === -1) {
  console.error(
    `[csp] ${HEADERS} has no line "${PLACEHOLDER.trim()}" under /* to replace. Not shipping without a policy.`,
  );
  process.exit(1);
}
lines[at] = `  Content-Security-Policy: ${policy}`;
fs.writeFileSync(HEADERS, lines.join('\n'));
console.log(
  `[csp] script-src written: ${pages.length} pages, ${all.inline.size} inline scripts, ` +
    `${all.origins.size + extra.length} external origins, ${all.handlers.size} inline handlers ` +
    `(${Buffer.byteLength(policy)} bytes)`,
);
