// Safe to edit by hand
// Save the graphics maker's output as real PNGs, through the same export the Studio uses
// (window.__graphics.png on /styleguide/graphics/), for design review and the docs.
// docs/agent/graphics.md.
//
//   node scripts/shoot-graphics.mjs [--base http://localhost:4321] [--out <dir>]
//     [--d night,porch] [--kind event,sunday] [--format post-portrait,flyer] [--photo]
//     [--max 1400]   longest side of the saved file, px (review copies; 0 keeps full size)
//
// Needs the dev server (npm run dev) or a preview. Writes <out>/<direction>/<kind>/<format>.png.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const base = arg('base', 'http://localhost:4321');
const out = resolve(arg('out', 'graphics-shots'));
const max = Number(arg('max', '1400'));
const photo = args.includes('--photo');

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage();
const q = new URLSearchParams({ kind: 'none' });
if (photo) q.set('photo', '1');
await page.goto(`${base}/styleguide/graphics/?${q}`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => document.documentElement.dataset.graphicsReady === 'true', null, {
  timeout: 120000,
});
const all = await page.evaluate(() => {
  const g = window.__graphics;
  return { d: g.directions, kind: g.kinds, format: g.formats };
});
const pick = (k) => (arg(k) ? arg(k).split(',') : all[k]);

let n = 0;
for (const d of pick('d')) {
  for (const kind of pick('kind')) {
    for (const format of pick('format')) {
      const dataUrl = await page.evaluate(
        async ({ d, kind, format, max }) => {
          const url = await window.__graphics.png(d, kind, format);
          if (!max) return url;
          const img = new Image();
          img.src = url;
          await img.decode();
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * s);
          c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          return c.toDataURL('image/png');
        },
        { d, kind, format, max },
      );
      const dir = join(out, d, kind);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${format}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
      n++;
    }
  }
}
await browser.close();
console.log(`shoot-graphics: ${n} PNGs in ${out}`);
