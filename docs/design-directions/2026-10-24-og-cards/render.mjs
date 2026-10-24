// Share-card directions (2026-10-24): five looks for the 1200x630 Open Graph cards, each drawn
// for four sample pages, plus one contact sheet per direction. Mockups only: the live cards are
// still scripts/lib/og-card.mjs until a direction is picked.
//
//   node docs/design-directions/2026-10-24-og-cards/render.mjs
//
// Writes <direction>-<page>.png and sheet-<direction>.png next to this file.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { BRICK_PATH_PRESETS, brickMarker, brickPath } from '../../../scripts/lib/brick-courses.mjs';
import { printMask } from '../../../scripts/lib/brick-print.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const b64 = (rel) => readFileSync(resolve(root, rel)).toString('base64');
const svgUri = (rel) => `data:image/svg+xml;base64,${b64(rel)}`;

const W = 1200;
const H = 630;
const C = {
  ink: '#16263D',
  navy: '#1F3A5F',
  navyDark: '#11294A',
  navyMid: '#2C4F7C',
  navyPale: '#7F98B8',
  auburn: '#9A3B2A',
  auburnLight: '#B5503A',
  paper: '#FBF8F3',
  paperSoft: '#F4EFE7',
  line: '#E6DED2',
};
const FONTS = `
@font-face{font-family:YS;src:url(data:font/woff2;base64,${b64('public/fonts/young-serif-latin-400.woff2')}) format('woff2');font-display:block}
@font-face{font-family:FG;src:url(data:font/woff2;base64,${b64('public/fonts/familjen-grotesk-latin-wght.woff2')}) format('woff2');font-weight:400 700;font-display:block}`;
const MARK = svgUri('src/assets/brand/fbc-auburn-icon-full-color.svg');
const MARK_WHITE = svgUri('src/assets/brand/fbc-auburn-icon-white.svg');
const SKETCH = `data:image/webp;base64,${b64('src/assets/brand/building-sketch.webp')}`;
const TILE_NAVY = svgUri('public/textures/tile-navy.svg');
const FLECKS = svgUri('public/textures/print-flecks.svg');
const icon = (name) => svgUri(`brand/icons/stone-icon-${name}.svg`);

const steps = (w = 52) =>
  `<svg viewBox="0 0 78 36" width="${w}" height="${(w * 36) / 78}">${brickMarker()
    .map((s) => `<path d="${s.d}" fill="${s.fill}"/>`)
    .join('')}</svg>`;
function wall(width, height, preset = 'og', seed = 4) {
  const stones = brickPath({ width, height, preset, seed });
  const defs = printMask(`p${seed}${width}`, {
    x: 0,
    y: 0,
    w: width,
    h: height,
    u: BRICK_PATH_PRESETS[preset].h,
    seed: 53,
  });
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${defs}<g mask="url(#p${seed}${width})">${stones
    .map((s) => `<path d="${s.d}" fill="${s.fill}"/>`)
    .join('')}</g></svg>`;
}

// The sample pages: Home, an inner page with a short title, one with a longer title, a series.
const PAGES = [
  {
    slug: 'home',
    home: true,
    title: 'A close-knit church with the door open.',
    kicker: 'Hamilton, Ohio',
    icon: 'church',
  },
  { slug: 'ministries', title: 'Ministries', kicker: 'Through the week', icon: 'blocks' },
  { slug: 'plan-your-visit', title: 'Plan your visit', kicker: 'New here', icon: 'open-door' },
  {
    slug: 'series-mark',
    title: 'The Gospel of Mark',
    kicker: 'Sermon series',
    icon: 'bible',
  },
];

const base = (body, css) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.c{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:FG,sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:YS,serif;font-weight:400}
.kick{font-family:FG;font-weight:700;text-transform:uppercase;letter-spacing:.16em}
${css}</style></head><body><div class="c">${body}</div></body></html>`;

// The church's name as a small lockup, light or dark.
const lockup = (
  dark,
  size = 64,
) => `<div class="lk" style="display:flex;align-items:center;gap:${size * 0.28}px">
  <img src="${dark ? MARK_WHITE : MARK}" width="${size}" height="${size}" alt="">
  <div><div class="serif" style="font-size:${size * 0.44}px;line-height:1;color:${dark ? C.paper : C.ink}">First Baptist</div>
  <div style="font-weight:600;font-size:${size * 0.31}px;margin-top:4px;color:${dark ? C.navyPale : C.navy}">Church of Auburn</div></div></div>`;

const DIRECTIONS = {
  // A. The drawing room: paper ground, the building sketch in pale navy bleeding off the right,
  // the title big on the left. Calm and editorial; the building is the picture on every card.
  sketch: (p) =>
    base(
      `<div class="sk"></div>
      <div style="position:absolute;left:76px;top:64px">${lockup(false, 60)}</div>
      <div class="body">
        <div class="kick" style="display:flex;align-items:center;gap:14px;color:${C.auburn};font-size:22px;margin-bottom:22px">${steps(46)}<span>${p.kicker}</span></div>
        <div class="serif t" id="fit">${p.home ? 'First Baptist Church of Auburn' : p.title}</div>
        ${p.home ? `<div class="serif" style="font-size:34px;color:${C.auburn};margin-top:20px;max-width:620px;line-height:1.15;text-wrap:balance">${p.title}</div>` : ''}
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:14px;background:${C.auburn}"></div>`,
      `.c{background:${C.paper}}
      .sk{position:absolute;right:-90px;bottom:6px;width:760px;height:510px;background:${C.navyPale};opacity:.55;
        -webkit-mask:url(${SKETCH}) right bottom/contain no-repeat;mask:url(${SKETCH}) right bottom/contain no-repeat}
      .body{position:absolute;left:76px;top:210px;width:660px}
      .t{font-size:${p.home ? 74 : 104}px;line-height:1;letter-spacing:-.015em;color:${C.navy};text-wrap:balance}`,
    ),

  // B. Evening service: the navy stone-tile ground the site uses for its dark bands, cream title,
  // the white mark, a thin brick sill. Strong in a feed of white link cards.
  night: (p) =>
    base(
      `<div style="position:absolute;left:76px;top:64px">${lockup(true, 60)}</div>
      <div class="sk"></div>
      <div class="body">
        <div class="kick" style="color:#E0876F;font-size:22px;margin-bottom:22px">${p.kicker}</div>
        <div class="serif t">${p.home ? 'First Baptist Church of Auburn' : p.title}</div>
        ${p.home ? `<div class="serif" style="font-size:36px;color:${C.navyPale};margin-top:22px;max-width:680px;line-height:1.15;text-wrap:balance">${p.title}</div>` : ''}
      </div>
      <div style="position:absolute;left:0;bottom:0">${wall(W, 60, 'sill', 7)}</div>`,
      `.c{background:${C.navyDark} url(${TILE_NAVY}) 0 0/420px 420px}
      .sk{position:absolute;right:-60px;bottom:52px;width:660px;height:440px;background:${C.navyPale};opacity:.32;
        -webkit-mask:url(${SKETCH}) right bottom/contain no-repeat;mask:url(${SKETCH}) right bottom/contain no-repeat}
      .body{position:absolute;left:76px;top:212px;width:720px}
      .t{font-size:${p.home ? 76 : 108}px;line-height:1;letter-spacing:-.015em;color:${C.paper};text-wrap:balance}`,
    ),

  // C. The page's own icon: each card carries the brick icon its page head shows, big on a soft
  // paper tile, so a Ministries link looks different from a Give link at a glance.
  icon: (p) =>
    base(
      `<div style="position:absolute;left:76px;top:64px">${lockup(false, 60)}</div>
      <div class="body">
        <div class="kick" style="display:flex;align-items:center;gap:14px;color:${C.auburn};font-size:22px;margin-bottom:22px">${steps(46)}<span>${p.kicker}</span></div>
        <div class="serif t">${p.home ? 'First Baptist Church of Auburn' : p.title}</div>
        ${p.home ? `<div class="serif" style="font-size:32px;color:${C.auburn};margin-top:20px;line-height:1.15;text-wrap:balance">${p.title}</div>` : ''}
      </div>
      <div class="tile"><img src="${p.home ? MARK : icon(p.icon)}" alt=""></div>`,
      `.c{background:#fff}
      .c::after{content:'';position:absolute;left:76px;right:76px;bottom:56px;height:2px;background:${C.line}}
      .body{position:absolute;left:76px;top:206px;width:640px}
      .t{font-size:${p.home ? 70 : 100}px;line-height:1;letter-spacing:-.015em;color:${C.navy};text-wrap:balance}
      .tile{position:absolute;right:76px;top:120px;width:350px;height:350px;border-radius:28px;background:${C.paperSoft};display:grid;place-items:center}
      .tile img{width:${p.home ? 230 : 270}px;height:${p.home ? 230 : 270}px}`,
    ),

  // D. The arch: the site's arched hero, as a card. The right side is an auburn brick arch with
  // the print flecks and the building drawn in cream inside it; the words sit on paper.
  arch: (p) =>
    base(
      `<div style="position:absolute;left:76px;top:64px">${lockup(false, 56)}</div>
      <div class="body">
        <div class="kick" style="color:${C.auburn};font-size:21px;margin-bottom:22px">${p.kicker}</div>
        <div class="serif t">${p.home ? 'First Baptist Church of Auburn' : p.title}</div>
        ${p.home ? `<div class="serif" style="font-size:30px;color:${C.ink};margin-top:20px;line-height:1.2;max-width:520px;text-wrap:balance">${p.title}</div>` : ''}
      </div>
      <div class="arch"><div class="fl"></div><img class="am" src="${MARK_WHITE}" alt=""><div class="sk"></div></div>`,
      `.c{background:${C.paper}}
      .body{position:absolute;left:76px;top:200px;width:600px}
      .t{font-size:${p.home ? 66 : 96}px;line-height:1;letter-spacing:-.015em;color:${C.navy};text-wrap:balance}
      .arch{position:absolute;right:70px;top:56px;width:400px;height:630px;border-radius:200px 200px 0 0;background:${C.auburn};overflow:hidden}
      .arch .fl{position:absolute;inset:0;background:url(${FLECKS}) 0 0/64px 44px;opacity:.6}
      .arch .am{position:absolute;left:50%;top:92px;width:96px;height:96px;margin-left:-48px}
      .arch .sk{position:absolute;left:-150px;right:-150px;bottom:-6px;height:400px;background:${C.paper};
        -webkit-mask:url(${SKETCH}) center bottom/contain no-repeat;mask:url(${SKETCH}) center bottom/contain no-repeat}`,
    ),

  // E. The bulletin: a printed order-of-service feel. Centred, a fine double rule inset, the
  // mark on top, the title in the middle, the place underneath. Quiet and churchly.
  bulletin: (p) =>
    base(
      `<div class="frame"></div>
      <div class="mid">
        <img src="${MARK}" width="76" height="76" alt="">
        <div class="kick" style="color:${C.auburn};font-size:20px;margin-top:26px">${p.home ? 'First Baptist Church of Auburn' : p.kicker}</div>
        <div class="serif t">${p.title}</div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:30px;color:${C.navyMid};font-weight:600;font-size:22px">
          <span class="rule"></span><span>${p.home ? 'Hamilton, Ohio' : 'First Baptist Church of Auburn'}</span><span class="rule"></span></div>
      </div>`,
      `.c{background:${C.paper}}
      .frame{position:absolute;inset:30px;border:2px solid ${C.navy};outline:1px solid ${C.navy};outline-offset:-12px}
      .mid{position:absolute;inset:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 110px}
      .t{font-size:${p.home ? 62 : 96}px;line-height:1.02;letter-spacing:-.015em;color:${C.navy};margin-top:14px;text-wrap:balance}
      .rule{display:block;width:56px;height:2px;background:${C.auburnLight}}`,
    ),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const [name, draw] of Object.entries(DIRECTIONS)) {
  for (const p of PAGES) {
    await page.setContent(draw(p), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(here, `${name}-${p.slug}.png`) });
  }
  // A 2x2 contact sheet at half size, for reading the direction as a set.
  const imgs = PAGES.map(
    (p) =>
      `<img src="data:image/png;base64,${readFileSync(resolve(here, `${name}-${p.slug}.png`)).toString('base64')}">`,
  ).join('');
  const sheet = await browser.newPage({ viewport: { width: 1224, height: 654 } });
  await sheet.setContent(
    `<style>*{margin:0}body{background:#d9d4cc;display:grid;grid-template-columns:600px 600px;gap:8px;padding:8px}img{width:600px;height:315px;display:block;box-shadow:0 1px 3px rgb(0 0 0/.15)}</style>${imgs}`,
    { waitUntil: 'load' },
  );
  await sheet.screenshot({ path: resolve(here, `sheet-${name}.png`) });
  await sheet.close();
}
await browser.close();
console.log('done');
