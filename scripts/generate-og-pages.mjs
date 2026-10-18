// Foundation, edit with care
// Generates one share image per page at public/og/<route-slug>.png, drawn by
// scripts/lib/og-card.mjs (the Auburn card: the lockup, the title in Auburn Stone, the stone
// path), matching the per-route convention in BaseLayout (the pathname with slashes turned into
// dashes; falls back to og-default.png when a route has no matching file).
//
// Run via `npm run og:pages` after editing a title in Sanity or after adding a page. Output PNGs
// are committed to git so Cloudflare does not need Sanity access (or a browser) at build time.
// Deterministic: a card is rewritten only when its bytes change, so a re-run with no title
// change leaves git clean. Titles come from data (seoTitle, then the heading), never from here,
// except the code-only routes in STATIC_ROUTES.
//
// A new collection (sermons, series) adds a row to COLLECTIONS below, with an optional
// `kicker` (a date, "Sermon series"). OPERATIONS.md, "Share images", has the walkthrough.

import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { renderCard, closeCards } from './lib/og-card.mjs';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
// A read token, when present, also sees documents an anonymous read cannot (drafts never: the
// perspective is published). Falls back to the write token, which can also read.
const readToken = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID not set. Skipping page OG generation.');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Token reads disable the CDN (Sanity rejects token + useCdn:true).
  useCdn: !readToken,
  perspective: 'published',
  ...(readToken ? { token: readToken } : {}),
});

const outDir = resolve(root, 'public/og');

// The church's name, used only to strip a "Title | First Baptist Church of Auburn" tail (the
// card carries the name in its lockup). SITE_NAME in env overrides it.
const WORDMARK = env.SITE_NAME ?? 'First Baptist Church of Auburn';

let count = 0;
let changed = 0;
const written = new Set();
// The card already carries the name, so a title written as "About us | First Baptist Church of
// Auburn" drops its brand half (either separator) before it is drawn.
const brandTail = (t) => {
  const s = String(t);
  for (const sep of [' | ', ' — ', ' – ', ' - ']) {
    if (s.toLowerCase().endsWith(`${sep}${WORDMARK}`.toLowerCase())) {
      return s.slice(0, -(sep.length + WORDMARK.length)) || s;
    }
  }
  return s;
};

// One card. `kicker` is the optional small line over the title (a date, "Sermon series");
// `home` draws the masthead layout with `rawTitle` as the line under it.
async function render(slug, rawTitle, { kicker, home = false } = {}) {
  const title = home ? String(rawTitle) : brandTail(rawTitle);
  const r = await renderCard({ title, kicker, home, outPath: resolve(outDir, `${slug}.png`) });
  count += 1;
  if (r.changed) changed += 1;
  written.add(`${slug}.png`);
  const t = String(title);
  console.log(
    `  ${slug}.png ${r.changed ? 'written' : 'same'}, ${(r.bytes / 1024).toFixed(0)} KB, ${r.size}px: ${t.slice(0, 60)}${t.length > 60 ? '...' : ''}`,
  );
}

// "October 12, 2026" from an ISO date, in UTC so the kicker never depends on the machine.
const longDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : undefined;

// ---- Home: the masthead card, with the church's tagline (Site settings) under it ----------
const settings = await client.fetch(`*[_type == "siteSettings"][0]{ tagline }`).catch(() => null);
await render('home', settings?.tagline || 'A small church with the door open.', { home: true });

// ---- Page singletons → /og/<slug>.png -----------------------------------
// `defaultTitle` is the fallback when Sanity's seoTitle and heroHeadline are both empty.
const SINGLETONS = [
  { type: 'aboutPage', slug: 'about', defaultTitle: 'About us' },
  { type: 'faqPage', slug: 'faq', defaultTitle: 'Questions' },
  { type: 'contactPage', slug: 'contact', defaultTitle: 'Contact us' },
  { type: 'journalPage', slug: 'journal', defaultTitle: 'News and notes' },
  { type: 'privacyPage', slug: 'privacy', defaultTitle: 'Privacy policy' },
];

// Code-only routes with no Studio document: a fixed card title (visitor audit, 2026-10-18).
const STATIC_ROUTES = [
  { slug: 'give', title: 'Give' },
  { slug: '404', title: 'Page not found' },
];
for (const r of STATIC_ROUTES) await render(r.slug, r.title);

for (const page of SINGLETONS) {
  const doc = await client
    .fetch(`*[_type == $type][0]{ seoTitle, heroHeadline }`, { type: page.type })
    .catch(() => null);
  await render(page.slug, doc?.seoTitle || doc?.heroHeadline || page.defaultTitle);
}

// ---- Dynamic collections → /og/<prefix>-<slug>.png ----------------------
// Mirrors BaseLayout: /journal/my-post/ → journal-my-post.png. Field names are checked against
// src/sanity/schemaTypes/<type>.ts before a row is enabled.
const COLLECTIONS = [
  // Studio pages (the page builder's /[slug] routes: Plan your visit, Leadership, Ministries,
  // Watch, What we believe and any page added later). No prefix: /leadership/ -> leadership.png.
  // Archived pages are not built, so they get no card.
  {
    prefix: '',
    query: `*[_type=="page" && defined(slug.current) && archived != true]{ "slug": slug.current, seoTitle, title }`,
    pick: (d) => d.seoTitle || d.title,
  },
  // News and notes posts carry their date as the kicker. A post with a cover photo shares the
  // photo instead (journal/[slug].astro passes ogImage); this card is its fallback.
  {
    prefix: 'journal',
    query: `*[_type=="journalEntry" && defined(slug.current)]{ "slug": slug.current, seoTitle, title, publishedAt }`,
    pick: (d) => d.seoTitle || d.title,
    kicker: (d) => longDate(d.publishedAt),
  },
  // A new collection is one more row. Sermons (/sermons/<slug>/ -> sermons-<slug>.png), say:
  //   { prefix: 'sermons',
  //     query: `*[_type=="sermon" && defined(slug.current)]{ "slug": slug.current, title, date }`,
  //     pick: (d) => d.title, kicker: (d) => longDate(d.date) },
  // and a series row with `kicker: () => 'Sermon series'`. An index page (/sermons/) is a
  // STATIC_ROUTES or SINGLETONS row. Nested routes join with dashes: /sermons/series/x/ ->
  // prefix 'sermons-series'.
];

for (const col of COLLECTIONS) {
  const docs = await client.fetch(col.query).catch(() => []);
  for (const d of docs) {
    const title = col.pick(d);
    if (!d.slug || !title) continue;
    await render(col.prefix ? `${col.prefix}-${d.slug}` : d.slug, title, {
      kicker: col.kicker?.(d),
    });
  }
}

// Not optional: the shared browser keeps the process alive until it is closed, so without this
// the script writes every card and then hangs.
await closeCards();

// Files in public/og this run did not draw: a route that was removed or renamed. Listed, not
// deleted, so a card made by hand is never lost; delete one yourself once its route is gone.
const orphans = readdirSync(outDir).filter((f) => f.endsWith('.png') && !written.has(f));
if (orphans.length) console.log(`\nNot drawn this run (no route?): ${orphans.join(', ')}`);

console.log(`\nDone. ${count} OG images (${changed} changed) in ${outDir}`);
