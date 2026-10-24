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
//           well: the type steps down from 108px to 60px and wraps to three lines at most.
//   kicker  optional small line above the title (a date, "Sermon series", "News and notes").
//   home    true draws the home card instead: the church's full name as the title
//           and `title` as the line under it (the Site settings tagline), kicker "Hamilton, Ohio".
//   brand   optional { name, place } for the lockup; defaults to the church's name.
//
// DETERMINISTIC: no clock, no randomness (the bricks are seeded, brick-courses.mjs), fonts come
// from public/fonts, and the PNG is written only when its bytes change, so re-running the
// generators leaves git clean unless a title or the design changed.
//
// The design ("night", picked 2026-10-24 from five directions in
// docs/design-directions/2026-10-24-og-cards/): the navy stone-tile ground of the site's dark bands,
// the white mark and the church's name top left, a small auburn kicker, the title in cream Young
// Serif, the building sketch faint in pale navy on the right, and a two-course brick sill along the
// foot. Home sets the church's name as the title with the Site settings tagline under it.
//
// Playwright is already a devDependency (the test suite); the PNGs are committed, so CI never
// runs this. If it ever does, the workflow needs `npx playwright install chromium`.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRICK_PATH_PRESETS, brickPath } from './brick-courses.mjs';
import { printMask } from './brick-print.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// The night palette: the site's dark-band ground, cream type, pale navy, a light auburn kicker.
const NIGHT = {
  ground: '#11294A',
  cream: '#FBF8F3',
  pale: '#7F98B8',
  kicker: '#E0876F',
};
const b64 = (rel) => readFileSync(resolve(root, rel)).toString('base64');
const FONTS = {
  serif: b64('public/fonts/young-serif-latin-400.woff2'),
  sans: b64('public/fonts/familjen-grotesk-latin-wght.woff2'),
};
const MARK_SVG = `data:image/svg+xml;base64,${b64('src/assets/brand/fbc-auburn-icon-white.svg')}`;
const TILE_NAVY = `data:image/svg+xml;base64,${b64('public/textures/tile-navy.svg')}`;
// The building sketch's lines (scripts/brand-sketch.mjs), used as a mask so it takes any ink.
const SKETCH = `data:image/webp;base64,${b64('src/assets/brand/building-sketch.webp')}`;

/** The sill along the foot of the card: two full courses, generated once (seeded). */
const SILL_H = 60;
const SILL_SVG = (() => {
  const stones = brickPath({ width: OG_WIDTH, height: SILL_H, preset: 'sill', seed: 7 });
  const paths = stones.map((s) => `<path d="${s.d}" fill="${s.fill}"/>`).join('');
  // The linocut flecks (scripts/lib/brick-print.mjs), punched through the bricks.
  const defs = printMask('og-print', {
    x: 0,
    y: 0,
    w: OG_WIDTH,
    h: SILL_H,
    u: BRICK_PATH_PRESETS.sill.h,
    seed: 53,
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_WIDTH} ${SILL_H}" width="${OG_WIDTH}" height="${SILL_H}">${defs}<g mask="url(#og-print)">${paths}</g></svg>`;
})();

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
  html,body{width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;background:${NIGHT.ground}}
  .card{position:relative;width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;
    background:${NIGHT.ground} url(${TILE_NAVY}) 0 0/420px 420px;color:${NIGHT.cream};
    font-family:Familjen,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .sketch{position:absolute;right:-60px;bottom:52px;width:660px;height:440px;background:${NIGHT.pale};opacity:.32;
    -webkit-mask:url(${SKETCH}) right bottom/contain no-repeat;mask:url(${SKETCH}) right bottom/contain no-repeat}
  .sill{position:absolute;left:0;bottom:0;width:${OG_WIDTH}px;height:${SILL_H}px}
  .lockup{position:absolute;left:76px;top:64px;display:flex;align-items:center;gap:17px}
  .lockup img{width:60px;height:60px;display:block}
  .lockup .n1{font-family:YoungSerif,serif;font-size:26px;line-height:1;color:${NIGHT.cream}}
  .lockup .n2{font-weight:600;font-size:19px;line-height:1.1;color:${NIGHT.pale};margin-top:4px}
  .body{position:absolute;left:76px;top:200px;width:760px;height:310px;display:flex;flex-direction:column;justify-content:center}
  .kicker{font-weight:700;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:${NIGHT.kicker};margin-bottom:20px}
  .title{font-family:YoungSerif,serif;line-height:1.02;letter-spacing:-.015em;text-wrap:balance;color:${NIGHT.cream}}
  .name{font-family:YoungSerif,serif;font-size:76px;line-height:1;letter-spacing:-.015em;color:${NIGHT.cream}}
  .tagline{font-family:YoungSerif,serif;line-height:1.15;text-wrap:balance;color:${NIGHT.pale};margin-top:22px}
  </style></head><body><div class="card"><div class="sketch"></div>
  <div class="lockup"><img src="${MARK_SVG}" alt="">
    <div><div class="n1">${esc(brand.line1)}</div><div class="n2">${esc(brand.line2)}</div></div></div>`;
  const foot = `<div class="sill">${SILL_SVG}</div></div></body></html>`;
  if (home) {
    return `${head}
  <div class="body">
    <div class="kicker">${esc(brand.home)}</div>
    <div class="name">${esc(brand.lead)} ${esc(brand.place)}</div>
    <div class="tagline" id="fit">${esc(title)}</div>
  </div>
  ${foot}`;
  }
  return `${head}
  <div class="body">
    ${kicker ? `<div class="kicker">${esc(kicker)}</div>` : ''}
    <div class="title" id="fit">${esc(title)}</div>
  </div>
  ${foot}`;
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
  // The Home card's kicker.
  home: 'Hamilton, Ohio',
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
      const body = el.parentElement;
      const box = { w: body.clientWidth, h: body.clientHeight };
      // Everything else in the column (the kicker, Home's name) takes its room first.
      const others = [...body.children].filter((c) => c !== el);
      const room = box.h - others.reduce((h, c) => h + c.offsetHeight + 22, 0);
      const [max, min, maxLines] = isHome ? [40, 30, 2] : [108, 60, 3];
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
