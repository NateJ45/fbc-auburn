// Safe to edit by hand
//
// Builds the First Baptist Church of Auburn logo set from its two traced masters, and copies the
// site's files into place.
//
// The mark (picked 2026-10-23) is a linocut print: a brick wall with a cross cut out of it,
// drawn by Gemini as a block print and traced as cut, with its leaning bricks, white scratches and
// flecks, and the darker squeezed rim on each brick. The masters are artwork, not geometry:
//   brand/logo/mark.svg              the full print (ink #8A3526, rim #5A1F15), 40 px and up
//   brand/logo/mark-small.svg        the same outline with the flecks dropped, for 64 px and under
//   brand/logo/source/cross-shape.svg  the exact shape of the cut cross (for the red alternate)
//   brand/logo/source/gemini-linocut.png  the print the trace was made from
// Edit the masters in Figma or by hand, never by reshaping them in code; then run npm run logo.
//
// Outputs (deterministic; a file is rewritten only when its bytes change):
//   brand/logo/mark-mono.svg, mark-small-mono.svg      one colour (ink)
//   brand/logo/mark-reversed.svg, mark-small-reversed.svg  on a paper plate, for dark grounds
//   brand/logo/favicon.svg                             small cut on an opaque plate, square
//   brand/logo/lockup-horizontal.svg                   small cut + name (site header)
//   brand/logo/lockup-horizontal-print.svg             full print + name (print, signs)
//   brand/logo/lockup-horizontal-reversed.svg          on the dark ground
//   brand/logo/lockup-stacked.svg                      full print above the name
//   brand/logo/seal.svg, seal-small.svg                the print in a navy ring, words on the arc
//   brand/logo/alternates/roadside-red/*               the cross filled in the roadside red
//   site copies: src/assets/logo-light.svg, src/assets/logo-dark.svg,
//     src/assets/brand/fbc-auburn-icon-full-color.svg, src/assets/brand/fbc-auburn-icon-white.svg,
//     src/assets/brand/mark-print.png (the hero's raster), public/favicon.svg,
//     public/studio-banner/mark.svg
// After it runs: npm run favicon, npm run og, npm run og:pages.
//
// The words are Young Serif (the site's display face) as outlines via fontkitten, so nothing here
// needs a font installed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { create as createFont } from 'fontkitten';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logo = (f) => path.join(root, 'brand', 'logo', f);

const INK = '#16263D';
const NAVY = '#1F3A5F';
const DARK_GROUND = '#0F2238';
const CREAM = '#F4EFE7';
const PAPER = '#FBF8F3';
const SLATE = '#4A4F5E';
const REVERSED_SUB = '#B6C0CF';
// The plain red of the cross by the road (sampled from the church's photo, held to the signal red
// used in the 2026-10-23 study).
const ROADSIDE_RED = '#D9262E';
const n2 = (v) => Number(v.toFixed(2));

// ---- The masters ----------------------------------------------------------------------------
const read = (f) => fs.readFileSync(logo(f), 'utf8');
const viewBoxOf = (svg) =>
  svg
    .match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
    .slice(1)
    .map(Number);
const innerOf = (svg) =>
  svg.replace(/^<svg[^>]*>(<title>.*?<\/title>)?/, '').replace(/<\/svg>\s*$/, '');
const MASTER = { full: read('mark.svg'), small: read('mark-small.svg') };
const [MW, MH] = viewBoxOf(MASTER.full);
const CROSS_D = read('source/cross-shape.svg').match(/ d="([^"]+)"/)[1];
const ink = { full: innerOf(MASTER.full), small: innerOf(MASTER.small) };
const mono = (s) => s.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${INK}"`);
const plate = `<rect width="${MW}" height="${MH}" rx="18" fill="${PAPER}"/>`;
const red = `<path d="${CROSS_D}" fill="${ROADSIDE_RED}"/>`;
const white = `<path d="${CROSS_D}" fill="#FFFFFF"/>`;

const TITLE = 'First Baptist Church of Auburn';
const doc = ([w, h], body, title = TITLE, x = 0, y = 0) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(x)} ${n2(y)} ${n2(w)} ${n2(h)}"><title>${title}</title>${body}</svg>\n`;
const markDoc = (body) => doc([MW, MH], body);
// The mark in a square view box, centred (the site's icon slots are square).
const S = Math.max(MW, MH);
const squareDoc = (body) => doc([S, S], body, TITLE, -(S - MW) / 2, -(S - MH) / 2);
// The mark placed inside another drawing at height h.
const place = (body, x, y, h) =>
  `<svg x="${n2(x)}" y="${n2(y)}" width="${n2((h * MW) / MH)}" height="${n2(h)}" viewBox="0 0 ${MW} ${MH}">${body}</svg>`;

// ---- Young Serif outlines -------------------------------------------------------------------
const font = createFont(
  fs.readFileSync(
    path.join(root, 'node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff'),
  ),
);
const UPM = font.unitsPerEm;
function glyphRun(text, size, tracking = 0) {
  const sc = size / UPM;
  let x = 0;
  const glyphs = [];
  for (const ch of text) {
    const g = font.glyphForCodePoint(ch.codePointAt(0));
    const adv = g.advanceWidth * sc;
    glyphs.push({ d: ch === ' ' ? '' : g.path.scale(sc, -sc).toSVG(), x, adv });
    x += adv + tracking * size;
  }
  return { glyphs, width: x - tracking * size };
}
function textPath(text, size, tracking, x, y, fill) {
  const run = glyphRun(text, size, tracking);
  const svg = run.glyphs
    .filter((g) => g.d)
    .map((g) => `<path transform="translate(${n2(x + g.x)} ${n2(y)})" d="${g.d}" fill="${fill}"/>`)
    .join('');
  return { svg, width: run.width };
}

// ---- Lockups --------------------------------------------------------------------------------
// Horizontal: the mark 100 tall; the name's caps sit level with the top courses and the place
// line on the lower ones.
function horizontal(markBody, { reversed = false } = {}) {
  const markH = 100,
    markW = (markH * MW) / MH,
    pad = 12,
    gap = 22;
  const tx = pad + markW + gap;
  const l1 = textPath('First Baptist Church', 44, 0.004, tx, pad + 52, reversed ? '#FFFFFF' : INK);
  const l2 = textPath(
    'AUBURN, OHIO',
    17.5,
    0.22,
    tx + 2,
    pad + 88,
    reversed ? REVERSED_SUB : SLATE,
  );
  const w = tx + Math.max(l1.width, l2.width) + pad,
    h = markH + 2 * pad;
  const ground = reversed ? `<rect width="${n2(w)}" height="${h}" fill="${DARK_GROUND}"/>` : '';
  return {
    svg: doc([w, h], ground + place(markBody, pad, pad, markH) + l1.svg + l2.svg),
    // The words' box as x, y, width, height (the Studio navbar's svgView crop).
    text: [tx - 4, pad - 2, w - tx + 4 - pad + 4, h - 2 * pad + 4],
  };
}
// Stacked: the mark above the name, centred.
function stacked(markBody) {
  const markH = 220,
    markW = (markH * MW) / MH,
    pad = 16;
  const r1 = glyphRun('First Baptist Church', 44, 0.004).width;
  const r2 = glyphRun('AUBURN, OHIO', 17.5, 0.22).width;
  const w = Math.max(markW, r1, r2) + 2 * pad;
  const l1 = textPath('First Baptist Church', 44, 0.004, (w - r1) / 2, pad + markH + 60, INK);
  const l2 = textPath('AUBURN, OHIO', 17.5, 0.22, (w - r2) / 2, pad + markH + 96, SLATE);
  return doc(
    [w, pad + markH + 96 + pad + 4],
    place(markBody, (w - markW) / 2, pad, markH) + l1.svg + l2.svg,
  );
}

// ---- The seal -------------------------------------------------------------------------------
// 1000 x 1000: cream disc, navy rule at r 484, navy inner rule at r 330, navy disc r 318, and the
// print on its paper plate in the middle. Words run round the ring in Young Serif caps, the top
// clockwise and the bottom anticlockwise so both stay upright; a navy dot at 9 and 3 o'clock.
function arcText(text, { size, tracking, r, top }) {
  const run = glyphRun(text, size, tracking);
  const capH = size * 0.71; // Young Serif's cap height, about 0.71 em
  let s = '';
  for (const g of run.glyphs) {
    if (!g.d) continue;
    const mid = g.x + g.adv / 2 - run.width / 2;
    const rb = top ? r - capH / 2 : r + capH / 2;
    const a = top ? -Math.PI / 2 + mid / rb : Math.PI / 2 - mid / rb;
    const rot = ((top ? a + Math.PI / 2 : a - Math.PI / 2) * 180) / Math.PI;
    s += `<path transform="translate(${n2(500 + rb * Math.cos(a))} ${n2(500 + rb * Math.sin(a))}) rotate(${n2(rot)}) translate(${n2(-g.adv / 2)} 0)" d="${g.d}" fill="${NAVY}"/>`;
  }
  return s;
}
function seal(markBody) {
  const markH = 400,
    markW = (markH * MW) / MH; // the plate's corners clear the disc
  const body =
    `<circle cx="500" cy="500" r="490" fill="${CREAM}"/>` +
    `<circle cx="500" cy="500" r="484" fill="none" stroke="${NAVY}" stroke-width="7"/>` +
    `<circle cx="500" cy="500" r="330" fill="none" stroke="${NAVY}" stroke-width="5"/>` +
    `<circle cx="500" cy="500" r="318" fill="${NAVY}"/>` +
    place(plate + markBody, 500 - markW / 2, 500 - markH / 2, markH) +
    arcText('FIRST BAPTIST CHURCH', { size: 56, tracking: 0.12, r: 404, top: true }) +
    arcText('AUBURN, OHIO', { size: 56, tracking: 0.2, r: 404, top: false }) +
    `<circle cx="96" cy="500" r="10" fill="${NAVY}"/><circle cx="904" cy="500" r="10" fill="${NAVY}"/>`;
  return doc([1000, 1000], body, 'First Baptist Church, Auburn, Ohio: seal');
}

// ---- Write ----------------------------------------------------------------------------------
const lockupLight = horizontal(ink.small);
const lockupDark = horizontal(plate + ink.small, { reversed: true });
const files = {
  'brand/logo/mark-mono.svg': markDoc(mono(ink.full)),
  'brand/logo/mark-small-mono.svg': markDoc(mono(ink.small)),
  'brand/logo/mark-reversed.svg': markDoc(plate + ink.full),
  'brand/logo/mark-small-reversed.svg': markDoc(plate + ink.small),
  'brand/logo/favicon.svg': squareDoc(plate + white + ink.small),
  'brand/logo/lockup-horizontal.svg': lockupLight.svg,
  'brand/logo/lockup-horizontal-print.svg': horizontal(ink.full).svg,
  'brand/logo/lockup-horizontal-reversed.svg': lockupDark.svg,
  'brand/logo/lockup-stacked.svg': stacked(ink.full),
  'brand/logo/seal.svg': seal(ink.full),
  'brand/logo/seal-small.svg': seal(ink.small),
  // The roadside-red alternate: the cut cross filled red, behind the ink so the hand-cut edge
  // stays. Large uses only: red on brick loses the cross below about 48 px, so small uses keep
  // the plain mark even if the church picks red.
  'brand/logo/alternates/roadside-red/mark.svg': markDoc(red + ink.full),
  'brand/logo/alternates/roadside-red/mark-reversed.svg': markDoc(plate + red + ink.full),
  'brand/logo/alternates/roadside-red/lockup-horizontal-print.svg': horizontal(red + ink.full).svg,
  'brand/logo/alternates/roadside-red/lockup-stacked.svg': stacked(red + ink.full),
  'brand/logo/alternates/roadside-red/seal.svg': seal(red + ink.full),
  // Site copies.
  'src/assets/logo-light.svg': lockupLight.svg,
  'src/assets/logo-dark.svg': lockupDark.svg,
  'src/assets/brand/fbc-auburn-icon-full-color.svg': squareDoc(white + ink.small),
  'src/assets/brand/fbc-auburn-icon-white.svg': squareDoc(plate + ink.small),
  'public/favicon.svg': squareDoc(plate + white + ink.small),
  'public/studio-banner/mark.svg': squareDoc(white + ink.small),
};
let changed = 0;
for (const [rel, body] of Object.entries(files)) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === body) continue;
  fs.writeFileSync(p, body);
  changed++;
}
// The hero raster: the full print is about 900 KB as SVG, so the pages that show it large use a
// PNG of it (Astro turns it into WebP at build). 720 px wide covers 250 css px at 2.5x.
const png = path.join(root, 'src/assets/brand/mark-print.png');
const pngBuf = await sharp(Buffer.from(MASTER.full), { density: 200 })
  .resize(720)
  .png({ compressionLevel: 9 })
  .toBuffer();
if (!fs.existsSync(png) || !fs.readFileSync(png).equals(pngBuf)) {
  fs.writeFileSync(png, pngBuf);
  changed++;
}
console.log(changed ? `[logo] ${changed} file(s) written` : '[logo] already up to date');
// The Studio navbar crops the dark lockup to its words (src/sanity/studioEdges.config.ts).
console.log(
  `[logo] dark lockup words crop (studioEdges view): ${lockupDark.text.map(n2).join(',')}`,
);
