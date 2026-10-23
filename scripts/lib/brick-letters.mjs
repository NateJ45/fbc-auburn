// Safe to edit by hand
// The FBC Auburn brick letterforms (2026-10-21), as pure seeded functions: a word in Young Serif
// drawn as brick, at build time, as one inline SVG. Direction and sheet:
// docs/design-directions/2026-10-21-brick-path/ ("The letterforms").
//
//   brickWord(text, opts)  treatment A: each letter is a clean Young Serif glyph that clips a
//                          running-bond field (a hairline joint, a darker band along each brick's
//                          bottom edge). `accent` re-tones chosen letters (the auburn "b").
//   wallWord(text, opts)   treatment B: the word cut out of a block of brick whose course ends
//                          step in and out like the mark; the letters are the negative space.
//
// Both return an SVG string, deterministic for the same inputs (no clock, no Math.random: the
// bricks are placed by a hash of their row, column and the seed), and use only the colours they
// are given plus a darker shade of each for the bottom band. The course height is a fixed
// fraction of the size (`course`, default 0.075 of the size), so the brick reads the same at
// 96 px as at 420 px. Courses are anchored to the baseline, so every word of a line shares one
// bond. The outlines come from brick-font.generated.mjs (npm run gen:letters), so nothing here
// reads a file and the module also runs inside the Worker.
//
// Sizing: unit 'em' (default) makes the SVG width and height em values of the surrounding
// font-size, with a vertical-align that puts the baseline on the line's baseline, so the word
// scales with the CSS font-size just as text does. unit 'px' emits plain pixel width and height
// of `size` (the share card, which has no CSS font-size to follow).
//
// Accessibility is the caller's job: the SVG is decorative (aria-hidden); keep the words as text
// in an aria-label (StoneHeading.astro does).
import { UPM, GLYPHS, KERN } from './brick-font.generated.mjs';

/** Navy (letters on the warm ground), auburn (the accent letter), and the pale sets for the dark footer. */
export const LETTER_TONES = {
  navy: ['#1F3A5F', '#223F66', '#1B3454', '#2C4F7C', '#25446D'],
  auburn: ['#9A3B2A', '#7E2E20', '#8A3526', '#B5503A', '#C0634C'],
  paleNavy: ['#7F98B8', '#8AA2BF', '#7590B0', '#93A9C4'],
  paleAuburn: ['#C9654E', '#D47A62', '#C0634C', '#DA8A74'],
};

const f1 = (n) => (Math.round(n * 10) / 10).toString();

/** Stable hash of integers to [0, 1). */
function hash(a, b, seed) {
  let x =
    Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** A darker shade of a #rrggbb colour (the band along a brick's bottom edge). */
export function shade(hex, f = 0.8) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** A short stable id from the inputs, so identical calls give identical markup. */
function idFor(parts) {
  let h = 2166136261;
  for (const ch of JSON.stringify(parts)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return 'bl' + (h >>> 0).toString(36);
}

/** Lay a line of text out: glyph positions (px at `size`), kerning applied. */
function layout(text, size, tracking) {
  const s = size / UPM;
  let x = 0;
  const glyphs = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    const g = GLYPHS[ch] ?? GLYPHS['?'];
    if (ch !== ' ' && GLYPHS[ch])
      glyphs.push({ ch, x, adv: g[0] * s, yMin: g[1] * s, yMax: g[2] * s, d: g[3] });
    x += g[0] * s;
    if (i < chars.length - 1) x += (KERN[ch + chars[i + 1]] ?? 0) * s + tracking * size;
  });
  return { glyphs, width: x };
}

/** A glyph path (font units, y up negative) scaled to `s` and moved right by `x`. */
function placePath(d, x, s) {
  let out = '';
  let k = 0;
  for (const t of d.match(/[MLQCZ]|-?\d*\.?\d+/g) ?? []) {
    if (/[MLQCZ]/.test(t)) {
      out += t;
      k = 0;
    } else {
      const isX = k++ % 2 === 0;
      out += f1(Number(t) * s + (isX ? x : 0)) + (isX ? ' ' : ' ');
    }
  }
  return out.replace(/ ([MLQCZ])/g, '$1').trim();
}

/** Bricks of the running-bond field that touch [x0, x1] by [y0, y1], keyed so none repeats. */
function bricksIn(x0, x1, y0, y1, g, seen, tones, seed, ends = null) {
  const out = [];
  const r0 = Math.floor(y0 / g.H);
  const r1 = Math.ceil(y1 / g.H);
  for (let r = r0; r < r1; r++) {
    const Lr = g.L * (0.92 + 0.16 * hash(r, 0, seed));
    const off = (r & 1 ? Lr / 2 : 0) + (hash(r, 1, seed) - 0.5) * Lr * 0.35;
    const c0 = Math.floor((x0 - off) / Lr);
    const c1 = Math.ceil((x1 - off) / Lr);
    for (let c = c0; c < c1; c++) {
      const key = `${r}:${c}`;
      if (seen) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      const t = hash(r, c, seed + 7);
      const i = t < 0.5 ? 0 : t < 0.7 ? 1 : t < 0.85 ? 2 : t < 0.95 ? 3 : 4;
      const fill = tones[Math.min(tones.length - 1, i)];
      let x = off + c * Lr;
      let w = Lr - g.m;
      if (ends) {
        const [l, rr] = ends(r);
        if (x < l) {
          w -= l - x;
          x = l;
        }
        if (x + w > rr) w = rr - x;
        if (w < g.m * 2) continue;
      }
      out.push({ x, y: r * g.H, w, h: g.H - g.m, fill });
    }
  }
  return out;
}

/** Group bricks into one path per colour: the faces, then the bottom bands in a darker shade. */
function paint(bricks, edgeF) {
  const faces = new Map();
  const bands = new Map();
  for (const b of bricks) {
    faces.set(
      b.fill,
      (faces.get(b.fill) ?? '') + `M${f1(b.x)} ${f1(b.y)}h${f1(b.w)}v${f1(b.h)}h${f1(-b.w)}z`,
    );
    const e = Math.max(0.8, b.h * 0.16);
    const sh = shade(b.fill, edgeF);
    bands.set(
      sh,
      (bands.get(sh) ?? '') + `M${f1(b.x)} ${f1(b.y + b.h - e)}h${f1(b.w)}v${f1(e)}h${f1(-b.w)}z`,
    );
  }
  let s = '';
  for (const [fill, d] of faces) s += `<path fill="${fill}" d="${d}"/>`;
  for (const [fill, d] of bands) s += `<path fill="${fill}" d="${d}"/>`;
  return s;
}

function svg({ x, y, w, h, body, size, unit, descent }) {
  const dim =
    unit === 'px'
      ? `width="${f1(w)}" height="${f1(h)}"`
      : `style="width:${(w / size).toFixed(3)}em;height:${(h / size).toFixed(3)}em;vertical-align:${(-descent / size).toFixed(3)}em"`;
  return `<svg class="bl-word" xmlns="http://www.w3.org/2000/svg" viewBox="${f1(x)} ${f1(y)} ${f1(w)} ${f1(h)}" ${dim} aria-hidden="true" focusable="false">${body}</svg>`;
}

function geometry(size, course) {
  const H = size * course;
  return { H, L: H * 2.6, m: Math.max(0.6, H * 0.1) };
}

/**
 * Treatment A: brick-filled letters.
 * @param {string} text one word (spaces are kept as gaps, but wrapping needs one call per word)
 * @param {{ size?: number, tones?: string[], accent?: { letters: number[], tones: string[] } | null,
 *           seed?: number, course?: number, tracking?: number, unit?: 'em' | 'px', edge?: number }} [o]
 *   size      logical size (default 200; with unit 'em' it only sets the drawing resolution)
 *   tones     brick colours, most common first (up to five are used)
 *   accent    letters (0-based, among the word's visible characters) drawn in their own tones
 *   course    brick course height as a fraction of size
 *   tracking  letter-spacing in em (negative tightens)
 */
export function brickWord(text, o = {}) {
  const {
    size = 200,
    tones = LETTER_TONES.navy,
    accent = null,
    seed = 3,
    course = 0.075,
    tracking = -0.01,
    unit = 'em',
    edge = 0.8,
  } = o;
  const { glyphs, width } = layout(text, size, tracking);
  if (!glyphs.length) return '';
  const g = geometry(size, course);
  const s = size / UPM;
  const pad = size * 0.03;
  const top = Math.min(...glyphs.map((q) => q.yMin)) - pad;
  const bottom = Math.max(0, ...glyphs.map((q) => q.yMax)) + pad;
  const id = idFor(['A', text, size, tones, accent, seed, course, tracking, unit, edge]);
  // One brick field across the whole word, laid twice with the same geometry (so the joints line
  // up from letter to letter): once in the base tones, clipped to the other letters' outlines, and
  // once in the accent tones, clipped to the accent letters only. A running-bond brick straddles
  // letter boundaries, so laying bricks per letter box let the "b" carry its auburn into the
  // following "u" (fixed 2026-10-23).
  const acc = new Set(accent?.letters ?? []);
  const fx0 = Math.min(...glyphs.map((q) => q.x)) - g.L;
  const fx1 = width + g.L;
  const outlines = (keep) =>
    glyphs
      .filter((_, i) => keep(i))
      .map((q) => placePath(q.d, q.x, s))
      .join('');
  const layer = (lid, set, d) =>
    d
      ? `<defs><clipPath id="${lid}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${lid})">${paint(bricksIn(fx0, fx1, top, bottom, g, null, set, seed), edge)}</g>`
      : '';
  const body =
    layer(
      id,
      tones,
      outlines((i) => !acc.has(i)),
    ) +
    (acc.size && accent
      ? layer(
          `${id}-a`,
          accent.tones,
          outlines((i) => acc.has(i)),
        )
      : '');
  return svg({ x: 0, y: top, w: width, h: bottom - top, body, size, unit, descent: bottom });
}

/**
 * Treatment B: the word cut out of a brick wall, the letters as negative space.
 * @param {string} text
 * @param {{ size?: number, tones?: string[], seed?: number, course?: number, tracking?: number,
 *           pad?: number, letter?: string | null, unit?: 'em' | 'px', edge?: number }} [o]
 *   pad     wall margin around the word, as a fraction of size
 *   letter  a colour to paint the letters (behind the wall); omit to show whatever is behind
 */
export function wallWord(text, o = {}) {
  const {
    size = 200,
    tones = LETTER_TONES.auburn,
    seed = 5,
    course = 0.085,
    tracking = 0,
    pad = 0.2,
    letter = null,
    unit = 'em',
    edge = 0.8,
  } = o;
  const { glyphs, width } = layout(text, size, tracking);
  if (!glyphs.length) return '';
  const g = geometry(size, course);
  const s = size / UPM;
  const px = size * pad;
  const gTop = Math.min(...glyphs.map((q) => q.yMin));
  const gBot = Math.max(0, ...glyphs.map((q) => q.yMax));
  // Snap the block to whole courses so the top and bottom rows are full bricks.
  const top = Math.floor((gTop - px * 0.7) / g.H) * g.H;
  const bot = Math.ceil((gBot + px * 0.7) / g.H) * g.H;
  const x0 = -px;
  const x1 = width + px;
  const id = idFor(['B', text, size, tones, seed, course, tracking, pad, letter, unit, edge]);
  // Each course ends a little in or out at both sides, like the courses of the mark.
  const ends = (r) => [x0 + hash(r, 3, seed) * px * 0.8, x1 - hash(r, 4, seed) * px * 0.8];
  const bricks = bricksIn(x0, x1, top, bot, g, null, tones, seed, ends);
  const glyphD = glyphs.map((q) => placePath(q.d, q.x, s)).join('');
  const block = `M${f1(x0)} ${f1(top)}H${f1(x1)}V${f1(bot)}H${f1(x0)}Z`;
  const behind = letter ? `<path fill="${letter}" d="${glyphD}"/>` : '';
  const body = `<defs><clipPath id="${id}"><path clip-rule="evenodd" d="${block}${glyphD}"/></clipPath></defs>${behind}<g clip-path="url(#${id})">${paint(bricks, edge)}</g>`;
  return svg({ x: x0, y: top, w: x1 - x0, h: bot - top, body, size, unit, descent: bot });
}

/** Width of a word at `size` in the same units (kerning and tracking included). */
export function wordWidth(text, size = 200, tracking = -0.01) {
  return layout(text, size, tracking).width;
}
