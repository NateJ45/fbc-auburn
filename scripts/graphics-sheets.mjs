// Safe to edit by hand
// Contact sheets of the graphics wall for design review: one PNG per direction, kind and photo
// state, each showing every size (the wall's own previews). docs/agent/graphics.md.
//
//   node scripts/graphics-sheets.mjs <out dir> [night,porch,press] [--base http://localhost:4321]
//
// Needs the dev server. Full-size files come from scripts/shoot-graphics.mjs.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const out = process.argv[2];
if (!out) throw new Error('Usage: node scripts/graphics-sheets.mjs <out dir> [directions]');
mkdirSync(out, { recursive: true });
const bi = process.argv.indexOf('--base');
const base = bi > 0 ? process.argv[bi + 1] : 'http://localhost:4321';
const dirs = (
  (process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '') || 'porch,press'
).split(',');
const kinds = ['sunday', 'event', 'sermon', 'verse', 'announcement', 'time-change', 'welcome'];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
for (const d of dirs)
  for (const k of kinds)
    for (const ph of ['0', '1']) {
      await p.goto(`${base}/styleguide/graphics/?d=${d}&kind=${k}&photo=${ph}`, {
        waitUntil: 'load',
        timeout: 120000,
      });
      await p.waitForFunction(
        () => document.documentElement.dataset.graphicsReady === 'true',
        null,
        { timeout: 120000 },
      );
      // Every preview decoded (the big print sizes take longest).
      await p.waitForFunction(
        () =>
          [...document.querySelectorAll('.gw-item img')].every(
            (i) => i.complete && i.naturalWidth > 0,
          ),
        null,
        { timeout: 120000 },
      );
      await p.waitForTimeout(500);
      const el = await p.$('.gw-dir');
      await el.screenshot({ path: `${out}/${d}-${k}${ph === '1' ? '-photo' : ''}.png` });
    }
await b.close();
console.log('sheets done');
