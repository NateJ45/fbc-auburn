// Foundation, edit with care
// Generates public/og-default.png, the fallback share image for any route without its own
// /og/<slug>.png. Run via `npm run og`. Drawn by scripts/lib/og-card.mjs (the Auburn card, home
// layout: the masthead and the Site settings tagline). The tagline is read from Sanity when a
// project is configured, else from brand/brand.config.json. Writes only when the bytes change.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { renderCard, closeCards } from './lib/og-card.mjs';
import { loadEnv } from './lib/loadEnv.mjs';
import { snapshotClientOptions } from './snapshot.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = loadEnv(root);
const brand = JSON.parse(readFileSync(resolve(root, 'brand/brand.config.json'), 'utf8'));

let tagline = brand.tagline;
if (env.PUBLIC_SANITY_PROJECT_ID) {
  const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
    useCdn: true,
    perspective: 'published',
    // CI reads a pinned snapshot (PORTS.md card 138); empty unless SANITY_SNAPSHOT_URL is set.
    ...snapshotClientOptions(process.env),
  });
  const settings = await client.fetch(`*[_type == "siteSettings"][0]{ tagline }`).catch(() => null);
  tagline = settings?.tagline || tagline;
}

const result = await renderCard({
  title: tagline,
  home: true,
  outPath: resolve(root, 'public/og-default.png'),
});

// Not optional: the shared browser keeps the process alive until it is closed.
await closeCards();

console.log(
  `OG default ${result.changed ? 'written' : 'unchanged'}: ${result.outPath} (${(result.bytes / 1024).toFixed(0)} KB)`,
);
