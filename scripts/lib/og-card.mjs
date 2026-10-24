// Safe to edit by hand
// The FBC Auburn share card (Open Graph image): one 1200x630 PNG per route, drawn in the church's
// own brand. Site-specific on purpose: scripts/lib/render-og.mjs is the starter's PORTABLE generic
// card (a wordmark in a hairline frame) and stays untouched; this file replaces it for Auburn.
//
// USE IT FROM ANY GENERATOR (pages, journal posts, sermons, series):
//
//   import { renderCard, closeCards } from './lib/og-card.mjs';
//   await renderCard({ title: 'Plan your visit', outPath: '/abs/public/og/plan-your-visit.png' });
//   await renderCard({ title: 'The Sermon on the Mount', kicker: 'Sermon series', outPath });
//   await renderCard({ title: 'Living hope', kicker: '12 October 2026', outPath });
//   await closeCards(); // once, at the end: the shared browser keeps the process alive otherwise
//
//   title   the page title, from data (Sanity), never hard-coded. Up to about 70 characters reads
//           well: the type steps down from 120px to 64px and wraps to three lines at most.
//   kicker  optional small line above the title (a date, "Sermon series", "News and notes").
//   home    true draws the home card instead: the masthead (mark, "First Baptist Church of",
//           Auburn in plain navy type) and `title` as the line under it (the Site settings tagline).
//   brand   optional { name, place } for the lockup; defaults to the church's name.
//
// DETERMINISTIC: no clock, no randomness (the stones are seeded, stone-mosaic.mjs), fonts come
// from public/fonts, and the PNG is written only when its bytes change, so re-running the
// generators leaves git clean unless a title or the design changed.
//
// The design (picked 2026-10-18 from three directions, comparison in the PR): white ground, the
// church lockup top left, the title in plain navy Young Serif (as the site's own H1; it was brick
// letters until 2026-10-24), and the brick wall across the foot.
//
// Playwright is already a devDependency (the test suite); the PNGs are committed, so CI never
// runs this. If it ever does, the workflow needs `npx playwright install chromium`.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARK } from './stone-mosaic.mjs';
import { BRICK_PATH_PRESETS, brickMarker, brickPath } from './brick-courses.mjs';
import { printMask } from './brick-print.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const INK = '#16263D';
const b64 = (rel) => readFileSync(resolve(root, rel)).toString('base64');
const FONTS = {
  serif: b64('public/fonts/young-serif-latin-400.woff2'),
  sans: b64('public/fonts/familjen-grotesk-latin-wght.woff2'),
};
const MARK_SVG = `data:image/svg+xml;base64,${b64('src/assets/brand/fbc-auburn-icon-full-color.svg')}`;

/** The brick wall across the foot of the card, generated once (seeded, so always the same). */
const PATH_H = 210;
const PATH_SVG = (() => {
  const stones = brickPath({ width: OG_WIDTH, height: PATH_H, preset: 'og', seed: 4 });
  const paths = stones.map((s) => `<path d="${s.d}" fill="${s.fill}"/>`).join('');
  // The linocut flecks (scripts/lib/brick-print.mjs), punched through the wall.
  const defs = printMask('og-print', {
    x: 0,
    y: 0,
    w: OG_WIDTH,
    h: PATH_H,
    u: BRICK_PATH_PRESETS.og.h,
    seed: 53,
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_WIDTH} ${PATH_H}" width="${OG_WIDTH}" height="${PATH_H}">${defs}<g mask="url(#og-print)">${paths}</g></svg>`;
})();
const STEPS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78 36" width="52" height="24">${brickMarker()
  .map((s) => `<path d="${s.d}" fill="${s.fill}"/>`)
  .join('')}</svg>`;

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Card text never carries an em or en dash (house rule for public copy): it becomes a colon. */
export const cleanText = (s) =>
  String(s ?? '')
    .replace(/\s*[—–]\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();

function cardHtml({ title, kicker, home, brand }) {
  const head = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:YoungSerif;src:url(data:font/woff2;base64,${FONTS.serif}) format('woff2');font-display:block}
  @font-face{font-family:Familjen;src:url(data:font/woff2;base64,${FONTS.sans}) format('woff2');font-weight:400 700;font-display:block}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;background:#fff}
  .card{position:relative;width:${OG_WIDTH}px;height:${OG_HEIGHT}px;background:#fff;color:${INK};
    font-family:Familjen,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .path{position:absolute;left:0;bottom:0;width:${OG_WIDTH}px;height:${PATH_H}px}
  .lockup{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:22px}
  .lockup img{width:92px;height:92px;display:block}
  .lockup .n1{font-family:YoungSerif,serif;font-size:40px;line-height:1;color:${INK}}
  .lockup .n2{font-family:Familjen,sans-serif;font-weight:600;font-size:28px;line-height:1.1;color:${MARK.deep};margin-top:6px}
  .body{position:absolute;left:72px;right:72px;top:190px;height:250px;display:flex;flex-direction:column;justify-content:center}
  .kicker{display:flex;align-items:center;gap:14px;margin-bottom:14px;font-weight:700;font-size:24px;
    letter-spacing:.14em;text-transform:uppercase;color:${MARK.deep}}
  /* Plain navy Young Serif, as the site's page headings (the brick letters were dropped 2026-10-24). */
  .title{font-family:YoungSerif,serif;line-height:1.02;letter-spacing:-.01em;text-wrap:balance;color:${MARK.deep}}
  /* Home: the masthead, as the site's home hero sets it. */
  .mast{position:absolute;left:64px;right:64px;top:50px;display:flex;align-items:center;gap:40px}
  .mast img{width:250px;height:250px;flex:none}
  .mast .place{font-weight:700;font-size:28px;letter-spacing:.16em;text-transform:uppercase;color:${MARK.deep}}
  .mast .auburn{font-family:YoungSerif,serif;font-size:184px;line-height:.98;letter-spacing:-.02em;margin-top:4px;color:${MARK.deep}}
  .tagline{position:absolute;left:72px;right:72px;top:340px;font-family:YoungSerif,serif;font-size:50px;line-height:1.1;color:${INK}}
  </style></head><body><div class="card">`;
  const path = `<div class="path">${PATH_SVG}</div>`;
  if (home) {
    return `${head}
    <div class="mast"><img src="${MARK_SVG}" alt="">
      <div><div class="place">${esc(brand.lead)}</div><div class="auburn">${esc(brand.place)}</div></div></div>
    <div class="tagline" id="fit">${esc(title)}</div>
    ${path}</div></body></html>`;
  }
  return `${head}
  <div class="lockup"><img src="${MARK_SVG}" alt="">
    <div><div class="n1">${esc(brand.line1)}</div><div class="n2">${esc(brand.line2)}</div></div></div>
  <div class="body">
    ${kicker ? `<div class="kicker">${STEPS_SVG}<span>${esc(kicker)}</span></div>` : ''}
    <div class="title" id="fit">${esc(title)}</div>
  </div>
  ${path}</div></body></html>`;
}

// ONE BROWSER FOR THE WHOLE RUN (launching chromium per card is minutes on a full site).
let browser = null;
async function getBrowser() {
  if (browser) return browser;
  const { chromium } = await import('playwright');
  browser = await chromium.launch();
  return browser;
}

/** Close the shared browser. Call once at the end of a generator, or the process never exits. */
export async function closeCards() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

const DEFAULT_BRAND = {
  line1: 'First Baptist',
  line2: 'Church of Auburn',
  lead: 'First Baptist Church of',
  place: 'Auburn',
};

/**
 * Draw one share card and write it to `outPath` (PNG; .jpg also works) if its bytes changed.
 * @param {{ title: string, kicker?: string, home?: boolean, outPath: string,
 *   brand?: Partial<typeof DEFAULT_BRAND> }} opts
 * @returns {Promise<{ outPath: string, bytes: number, changed: boolean, size: number }>}
 */
export async function renderCard({ title, kicker, home = false, outPath, brand = {} }) {
  const t = cleanText(title);
  if (!t) throw new Error(`renderCard: empty title for ${outPath}`);
  const k = kicker ? cleanText(kicker) : '';
  const b = await getBrowser();
  const page = await b.newPage({
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    cardHtml({ title: t, kicker: k, home, brand: { ...DEFAULT_BRAND, ...brand } }),
    {
      waitUntil: 'load',
    },
  );
  await page.evaluate(() => document.fonts.ready);
  // Fit the title: the largest size, in 2px steps, at which it fits its box in three lines or
  // fewer (two for the home tagline). Measured in the browser with the real font, so the result
  // is the same on every run.
  const size = await page.evaluate(
    ({ home: isHome }) => {
      const el = document.getElementById('fit');
      const box = isHome ? { w: 1056, h: 120 } : { w: 1056, h: el.parentElement.clientHeight };
      const kick = el.previousElementSibling?.classList.contains('kicker')
        ? el.previousElementSibling
        : null;
      const room = box.h - (kick ? kick.offsetHeight + 14 : 0);
      const [max, min, maxLines] = isHome ? [50, 36, 2] : [120, 64, 3];
      let s = max;
      for (; s > min; s -= 2) {
        el.style.fontSize = `${s}px`;
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        const lines = Math.round(el.offsetHeight / lh);
        if (el.scrollWidth <= box.w && el.offsetHeight <= room && lines <= maxLines) break;
      }
      el.style.fontSize = `${s}px`;
      return s;
    },
    { home },
  );
  const type = /\.jpe?g$/i.test(outPath) ? 'jpeg' : 'png';
  const buf = await page.screenshot({ type, ...(type === 'jpeg' ? { quality: 88 } : {}) });
  await page.close();
  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
  const same = existsSync(outPath) && readFileSync(outPath).equals(buf);
  if (!same) writeFileSync(outPath, buf);
  return { outPath, bytes: buf.length, changed: !same, size };
}
