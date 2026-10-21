// Safe to edit by hand
//
// Draws the First Baptist Church of Auburn logo masters into brand/logo/ as plain SVG.
//
// The mark: seven horizontal brick courses in auburn tones, each stepping in and out
// at the sides, with the cross cut out of them as negative space. Every edge of the
// cut is a degree or two off square, as if cut by hand (the "chisel" cut picked on
// 2026-10-21 from the working sheets). The geometry below is hand-set, not generated:
// every course length, tone and cut point is a chosen number, so a change here is a
// design decision and should be made on purpose.
//
// Outputs (all deterministic; a file is rewritten only when its bytes change):
//   brand/logo/mark.svg                  the mark in colour on a transparent ground
//   brand/logo/mark-mono.svg             one colour (ink) for print, embroidery, stamps
//   brand/logo/mark-reversed.svg         for dark grounds: lighter bricks, the cut is the ground
//   brand/logo/favicon.svg               five courses, wider cut, for 16 to 32 px
//   brand/logo/lockup-horizontal.svg     mark left, name right (site header, sign)
//   brand/logo/lockup-stacked.svg        mark above the name (social avatar, print)
//   brand/logo/lockup-horizontal-reversed.svg
//
// The wordmark is Young Serif (the site's display face) converted to paths with
// opentype.js, so the lockups need no font installed. Run: npm run logo

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { create as createFont } from 'fontkitten';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'brand', 'logo');
fs.mkdirSync(outDir, { recursive: true });

// Palette. Brick tones are auburn, the colour the church is named after. Ink is the
// site's text colour; the reversed set is lifted so it reads on the dark ground.
// Five brick tones, from fired-dark to sun-faded, and for each the shade its bottom
// edge is drawn in (a thin band that gives the face a little depth without a gradient).
const TONES = {
  brick: '#9A3B2A',
  dark: '#7E2E20',
  deep: '#8A3526',
  light: '#B5503A',
  pale: '#C0634C',
};
const TONES_REVERSED = {
  brick: '#B5503A',
  dark: '#9A3B2A',
  deep: '#A8453A',
  light: '#C9654E',
  pale: '#D47A62',
};
const EDGE = {
  brick: '#7E2E20',
  dark: '#66241A',
  deep: '#70291E',
  light: '#9A3B2A',
  pale: '#A8453A',
};
const INK = '#171A26';
const DARK_GROUND = '#171A26';

// ---------------------------------------------------------------------------
// The mark. Drawn on a 100 x 120 box.
// ---------------------------------------------------------------------------

// Seven courses. Each is {x0, x1, bricks}: the left and right ends step a little,
// chosen so no two neighbours step the same way and the arm course (index 2) is
// the widest, which keeps brick either side of the arm ends. `bricks` lists the
// bricks in the course left to right as [rightEdge, tone]; the last right edge is
// the course's own. Joints are placed well clear of the cut (nothing between x 34
// and 66 except under the stem, where the cut hides it), so no sliver is left
// beside the cross, and the bond staggers from course to course.
const MARK = {
  box: [100, 120],
  top: 4,
  mortar: 1.0,
  edge: 1.3,
  courses: [
    {
      x0: 5,
      x1: 93,
      bricks: [
        [30, 'brick'],
        [72, 'light'],
        [93, 'dark'],
      ],
    },
    {
      x0: 2,
      x1: 97,
      bricks: [
        [25, 'dark'],
        [78, 'brick'],
        [97, 'deep'],
      ],
    },
    {
      x0: 6,
      x1: 94,
      bricks: [
        [50, 'pale'],
        [94, 'brick'],
      ],
    }, // the arm course; the joint is under the cut
    {
      x0: 3,
      x1: 96,
      bricks: [
        [22, 'light'],
        [74, 'brick'],
        [96, 'dark'],
      ],
    },
    {
      x0: 7,
      x1: 92,
      bricks: [
        [32, 'brick'],
        [68, 'deep'],
        [92, 'pale'],
      ],
    },
    {
      x0: 2,
      x1: 95,
      bricks: [
        [27, 'dark'],
        [80, 'light'],
        [95, 'brick'],
      ],
    },
    {
      x0: 4,
      x1: 97,
      bricks: [
        [33, 'brick'],
        [67, 'pale'],
        [97, 'deep'],
      ],
    },
  ],
  // The chisel cut, clockwise from the top-left of the stem. The arm occupies the
  // third course plus half a mortar line each side (35.8 to 51.9), and every edge
  // leans by 1 to 3 units. The stem is 13 wide at the top and 17 at the base.
  cut: 'M 43.5 2 L 57 3.6 L 56 36.2 L 82 35.3 L 80.6 52.3 L 56.6 51.7 L 59.6 118 L 41.6 116.4 L 43.4 52.1 L 18.8 52.9 L 20.2 35.6 L 44.2 36.4 Z',
  rx: 0.8,
};

// The favicon is the same idea with five courses and a wider cut, because at 16 px
// seven courses and a 13-unit stem turn to noise.
const FAVICON = {
  box: [100, 120],
  top: 4,
  mortar: 1.4,
  edge: 0,
  courses: [
    {
      x0: 4,
      x1: 95,
      bricks: [
        [28, 'brick'],
        [95, 'light'],
      ],
    },
    { x0: 6, x1: 93, bricks: [[93, 'brick']] }, // the arm course
    {
      x0: 2,
      x1: 97,
      bricks: [
        [72, 'dark'],
        [97, 'brick'],
      ],
    },
    {
      x0: 5,
      x1: 94,
      bricks: [
        [30, 'light'],
        [94, 'brick'],
      ],
    },
    {
      x0: 3,
      x1: 96,
      bricks: [
        [70, 'brick'],
        [96, 'dark'],
      ],
    },
  ],
  cut: 'M 41 2 L 59 3.8 L 58 26.4 L 84 25.9 L 82.4 48.9 L 58.4 48.4 L 62 118 L 39.4 116.2 L 41.4 48.7 L 16.6 49.2 L 18.2 26.2 L 42 26.6 Z',
  rx: 1.2,
};

const n2 = (n) => Number(n.toFixed(2)).toString();

// tones: the face colours by tone name; edges: the bottom-edge colours (null for
// mono, where the faces are one ink and an edge band would read as a stripe).
function courseRects(spec, tones, edges) {
  const [, h] = spec.box;
  const n = spec.courses.length;
  const H = (h - spec.top * 2 - (n - 1) * spec.mortar) / n;
  let s = '';
  spec.courses.forEach((c, i) => {
    const y = spec.top + i * (H + spec.mortar);
    let x = c.x0;
    c.bricks.forEach(([right, tone], j) => {
      const last = j === c.bricks.length - 1;
      const w = (last ? c.x1 : right - spec.mortar / 2) - x;
      s += `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(H)}" rx="${spec.rx}" fill="${tones[tone]}"/>`;
      if (edges && spec.edge) {
        s += `<rect x="${n2(x + spec.rx)}" y="${n2(y + H - spec.edge)}" width="${n2(w - spec.rx * 2)}" height="${n2(spec.edge)}" fill="${edges[tone]}"/>`;
      }
      x = right + spec.mortar / 2;
    });
  });
  return s;
}

const monoTones = () => Object.fromEntries(Object.keys(TONES).map((k) => [k, INK]));

// mode: 'colour' | 'mono' | 'reversed'. The cut is a filled path over the courses in
// the ground colour (white, or the dark ground), so the files stay simple shapes
// that any tool can open and recolour. On a transparent ground the cut is white; the
// reversed file paints its own dark ground.
function markSvg(spec, mode, { title, size, ground }) {
  const [w, h] = spec.box;
  const tones = mode === 'mono' ? monoTones() : mode === 'reversed' ? TONES_REVERSED : TONES;
  const edges = mode === 'mono' ? null : EDGE;
  const cutFill = mode === 'reversed' ? DARK_GROUND : (ground ?? '#FFFFFF');
  const bg = mode === 'reversed' ? `<rect width="${w}" height="${h}" fill="${DARK_GROUND}"/>` : '';
  const dims = size ? ` width="${size}" height="${Math.round((size * h) / w)}"` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${dims}>` +
    `<title>${title}</title>` +
    bg +
    courseRects(spec, tones, edges) +
    `<path d="${spec.cut}" fill="${cutFill}"/>` +
    `</svg>`
  );
}

// Inner markup of the mark, for placing inside a lockup at (x, y) with a scale.
function markGroup(spec, mode, x, y, scale, ground) {
  const tones = mode === 'mono' ? monoTones() : mode === 'reversed' ? TONES_REVERSED : TONES;
  const edges = mode === 'mono' ? null : EDGE;
  const cutFill = mode === 'reversed' ? DARK_GROUND : ground;
  return `<g transform="translate(${n2(x)} ${n2(y)}) scale(${n2(scale)})">${courseRects(spec, tones, edges)}<path d="${spec.cut}" fill="${cutFill}"/></g>`;
}

// ---------------------------------------------------------------------------
// The wordmark. Young Serif, from the fontsource package, as paths.
// ---------------------------------------------------------------------------

const fontFile = path.join(
  root,
  'node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff',
);
const fontBuf = fs.readFileSync(fontFile);
// Two readers of the same file: fontkitten draws the outlines (opentype.js drops a
// control point in a few of this font's CFF glyphs and writes NaN into the path),
// and opentype.js supplies the kerning pairs, which fontkitten does not expose.
const outlines = createFont(fontBuf);
const font = opentype.parse(
  fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength),
);

// Returns {d, width} for a line of text at a size, with tracking in em.
function textPath(text, size, tracking = 0) {
  const scale = size / outlines.unitsPerEm;
  let x = 0;
  let d = '';
  const chars = [...text];
  chars.forEach((ch, i) => {
    const glyph = outlines.glyphForCodePoint(ch.codePointAt(0));
    if (ch !== ' ') d += glyph.path.scale(scale, -scale).translate(x, 0).toSVG();
    x += glyph.advanceWidth * scale;
    if (i < chars.length - 1) {
      const kern = font.getKerningValue(font.charToGlyph(ch), font.charToGlyph(chars[i + 1]));
      x += (kern / font.unitsPerEm) * size + tracking * size;
    }
  });
  return { d, width: x };
}

// Two lines: "First Baptist Church" then "AUBURN, OHIO" in spaced small caps.
function wordmark(fill, muted, x, y, size) {
  const l1 = textPath('First Baptist Church', size, 0.005);
  const l2 = textPath('AUBURN, OHIO', size * 0.4, 0.22);
  const gap = size * 0.42;
  return {
    svg:
      `<path transform="translate(${n2(x)} ${n2(y)})" d="${l1.d}" fill="${fill}"/>` +
      `<path transform="translate(${n2(x)} ${n2(y + gap + size * 0.4)})" d="${l2.d}" fill="${muted}"/>`,
    width: Math.max(l1.width, l2.width),
    height: gap + size * 0.4,
    ascent: size * 0.72,
  };
}

function lockupHorizontal(mode) {
  const ground = mode === 'reversed' ? DARK_GROUND : '#FFFFFF';
  const ink = mode === 'reversed' ? '#F3F6F9' : INK;
  const muted = mode === 'reversed' ? '#B4B8C4' : '#4A4F5E';
  const size = 44;
  const markH = 100,
    markW = (markH * 100) / 120;
  const pad = 12;
  const wm = wordmark(ink, muted, markW + pad + 18, pad + 46, size);
  const w = markW + pad + 18 + wm.width + pad;
  const h = markH + pad * 2;
  const bg =
    mode === 'reversed' ? `<rect width="${n2(w)}" height="${h}" fill="${DARK_GROUND}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${h}">` +
    `<title>First Baptist Church of Auburn</title>` +
    bg +
    markGroup(MARK, mode, pad, pad, markH / 120, ground) +
    wm.svg +
    `</svg>`
  );
}

function lockupStacked(mode) {
  const ground = mode === 'reversed' ? DARK_GROUND : '#FFFFFF';
  const ink = mode === 'reversed' ? '#F3F6F9' : INK;
  const muted = mode === 'reversed' ? '#B4B8C4' : '#4A4F5E';
  const size = 36;
  const markH = 120,
    markW = 100;
  const pad = 16;
  const probe = wordmark(ink, muted, 0, 0, size);
  const w = Math.max(probe.width, markW) + pad * 2;
  const wm = wordmark(ink, muted, (w - probe.width) / 2, pad + markH + 14 + size * 0.72, size);
  const h = pad + markH + 14 + size * 0.72 + wm.height + pad;
  const bg =
    mode === 'reversed' ? `<rect width="${n2(w)}" height="${n2(h)}" fill="${DARK_GROUND}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}">` +
    `<title>First Baptist Church of Auburn</title>` +
    bg +
    markGroup(MARK, mode, (w - markW) / 2, pad, 1, ground) +
    wm.svg +
    `</svg>`
  );
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const files = {
  'mark.svg': markSvg(MARK, 'colour', { title: 'First Baptist Church of Auburn' }),
  'mark-mono.svg': markSvg(MARK, 'mono', { title: 'First Baptist Church of Auburn' }),
  'mark-reversed.svg': markSvg(MARK, 'reversed', { title: 'First Baptist Church of Auburn' }),
  'favicon.svg': markSvg(FAVICON, 'colour', { title: 'First Baptist Church of Auburn' }),
  'lockup-horizontal.svg': lockupHorizontal('colour'),
  'lockup-horizontal-reversed.svg': lockupHorizontal('reversed'),
  'lockup-stacked.svg': lockupStacked('colour'),
};

let changed = 0;
for (const [name, svg] of Object.entries(files)) {
  const file = path.join(outDir, name);
  const body = svg + '\n';
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === body) continue;
  fs.writeFileSync(file, body);
  changed++;
  console.log('wrote', path.relative(root, file), `${body.length} bytes`);
}
console.log(
  changed ? `${changed} file(s) written to brand/logo/` : 'brand/logo/ already up to date',
);
