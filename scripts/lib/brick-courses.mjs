// Safe to edit by hand
// The FBC Auburn brick generators (2026-10-21), as pure seeded functions, so the build script
// (scripts/gen-stones.mjs), the share card (og-card.mjs) and the tests share one copy. They
// replaced the pebble generators in stone-mosaic.mjs when the brand moved to brick: the logo is
// stepped horizontal courses with the cross cut out (scripts/brand-logo.mjs), and everything
// decorative on the site now speaks the same grammar: running bond, a hairline joint, a thin
// darker band along each brick's bottom edge, the five auburn tones (or a navy set on a navy
// ground), stepped ends. Direction: docs/design-directions/2026-10-21-brick-path/.
//
// - brickPath(): a low wall of two or three courses that steps up toward the right, where the
//   This Sunday card (the door) sits. Bricks come back in laying order, bottom course first and
//   left to right, so a page can lay them one by one.
// - brickTile(): a seamless running-bond tile (the card ground, the sermon art, the quiet panels).
// - brickMarker(): the section marker, three stepped bricks lifted from the mark's corner.
//
// Every output is {d, fill} paths, the shape the pebble generators used, so no consumer changed.
// Everything is seeded (the same LCG as stone-mosaic.mjs), so the same inputs always give
// byte-identical output.

import { lcg } from './stone-mosaic.mjs';

/** The five auburn tones, from fired-dark to sun-faded, and the band each bottom edge is drawn in. */
export const BRICK = {
  brick: '#9A3B2A',
  dark: '#7E2E20',
  deep: '#8A3526',
  light: '#B5503A',
  pale: '#C0634C',
};
export const BRICK_EDGE = {
  '#9A3B2A': '#7E2E20',
  '#7E2E20': '#66241A',
  '#8A3526': '#70291E',
  '#B5503A': '#9A3B2A',
  '#C0634C': '#A8453A',
};

/** The path's tone deck: lighter tones dominant (Nathan, 2026-10-21: "lower and lighter"). */
export const PATH_DECK = [
  [BRICK.light, 0.42],
  [BRICK.brick, 0.3],
  [BRICK.pale, 0.16],
  [BRICK.deep, 0.08],
  [BRICK.dark, 0.04],
];

const f1 = (v) => v.toFixed(1);

/** A rectangle with rounded corners as a closed path (straight sides, one quadratic per corner). */
export function rectPath(x, y, w, h, r = 1.2) {
  const k = Math.min(r, w / 2, h / 2);
  const X = x + w;
  const Y = y + h;
  return (
    `M${f1(x + k)} ${f1(y)}H${f1(X - k)}Q${f1(X)} ${f1(y)} ${f1(X)} ${f1(y + k)}` +
    `V${f1(Y - k)}Q${f1(X)} ${f1(Y)} ${f1(X - k)} ${f1(Y)}H${f1(x + k)}` +
    `Q${f1(x)} ${f1(Y)} ${f1(x)} ${f1(Y - k)}V${f1(y + k)}Q${f1(x)} ${f1(y)} ${f1(x + k)} ${f1(y)}Z`
  );
}

/** One brick: its face and, when `edge` is set, the darker band along its bottom edge. */
function brick(x, y, w, h, fill, rx, edge) {
  const out = [{ d: rectPath(x, y, w, h, rx), fill }];
  if (edge && h > 6) {
    out.push({
      d: rectPath(x + rx, y + h - edge, w - 2 * rx, edge, 0.4),
      fill: BRICK_EDGE[fill] ?? fill,
    });
  }
  return out;
}

function pick(deck, rnd) {
  let t = rnd();
  for (const [fill, p] of deck) {
    if ((t -= p) <= 0) return fill;
  }
  return deck[0][0];
}

// ── The path ───────────────────────────────────────────────────────────────

/**
 * Course rules per canvas. `courses` lists, bottom first, where each course starts (x, as a
 * fraction of the width) so the wall steps up toward the right edge; `h` is the course height,
 * `joint` the mortar line, `len` the brick length, `bottom` the gap under the lowest course.
 * Every course runs to the right edge, where the card (or the canvas edge) cuts it flush.
 */
export const BRICK_PATH_PRESETS = {
  wide: { courses: [0, 0.16, 0.34], h: 30, joint: 3, len: 84, bottom: 8, rx: 1.4, edge: 2.2 },
  phone: { courses: [0, 0.3], h: 26, joint: 2.4, len: 56, bottom: 4, rx: 1.2, edge: 1.8 },
  // The sill: two full courses, the doorstep along the footer and the top of the menu.
  sill: { courses: [0, 0], h: 26, joint: 2.6, len: 80, bottom: 4, rx: 1.2, edge: 1.8 },
  // The Studio Home banner's foot (kit.config.ts homeBanner.motif, card 118).
  banner: { courses: [0, 0.18], h: 30, joint: 3, len: 86, bottom: 4, rx: 1.4, edge: 2.2 },
  bannerPhone: { courses: [0, 0.26], h: 20, joint: 2, len: 54, bottom: 3, rx: 1, edge: 1.4 },
  // The share card's foot (scripts/lib/og-card.mjs): big bricks that read in a 300px thumbnail.
  og: { courses: [0, 0.18, 0.4], h: 44, joint: 4, len: 120, bottom: 10, rx: 2, edge: 3 },
};

/**
 * @param {{ width: number, height: number, preset: keyof typeof BRICK_PATH_PRESETS, seed: number, deck?: [string, number][] }} opts
 * @returns {{ d: string, fill: string }[]} bricks in laying order (bottom course first, left to right)
 */
export function brickPath({ width: W, height: H, preset, seed, deck = PATH_DECK }) {
  const rnd = lcg(seed);
  const P = BRICK_PATH_PRESETS[preset];
  const out = [];
  P.courses.forEach((startF, i) => {
    const y = H - P.bottom - (i + 1) * P.h - i * P.joint;
    // Each course starts a little off its rule (ragged ends) and odd courses open with a half
    // brick, so the bond staggers like a laid wall.
    let x = Math.max(0, startF * W + (rnd() - 0.5) * P.len * 0.5);
    let first = true;
    while (x < W - 2) {
      let len = P.len * (0.85 + rnd() * 0.3);
      if (first && i % 2) len = P.len * 0.5;
      first = false;
      const xe = Math.min(W, x + len - P.joint);
      if (xe - x > P.len * 0.22)
        out.push(...brick(x, y, xe - x, P.h, pick(deck, rnd), P.rx, P.edge));
      x += len;
    }
  });
  return out;
}

// ── The tile ───────────────────────────────────────────────────────────────

/**
 * A seamless running-bond tile: `fills` for the faces, `grout` behind the joints. Fourteen
 * courses of five bricks; every course's joints shift a little and the brick that crosses the
 * right edge continues from the left, so the tile repeats with no seam.
 * @param {{ size: number, grout: string, fills: string[], seed: number }} opts
 * @returns {string} a standalone SVG document
 */
export function brickTile({ size: T, grout, fills, seed }) {
  const rnd = lcg(seed);
  const rows = 14;
  const per = 5;
  const joint = T / 175; // 2.4 at 420
  const pitch = T / rows;
  const h = pitch - joint;
  const L = T / per;
  let paths = '';
  for (let r = 0; r < rows; r++) {
    const y = r * pitch;
    const base = (r % 2) * (L / 2);
    // Joint positions around the course, each nudged, in order.
    const joints = [];
    for (let k = 0; k < per; k++) joints.push(base + k * L + (rnd() - 0.5) * L * 0.22);
    for (let k = 0; k < per; k++) {
      const x0 = joints[k];
      const x1 = k + 1 < per ? joints[k + 1] : joints[0] + T;
      const fill = fills[Math.floor(rnd() * fills.length)];
      const w = x1 - x0 - joint;
      // Draw the brick, and again one tile to the left when it crosses the right edge.
      paths += `<path d="${rectPath(x0, y, w, h, 1)}" fill="${fill}"/>`;
      if (x0 + w > T) paths += `<path d="${rectPath(x0 - T, y, w, h, 1)}" fill="${fill}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="${grout}"/>${paths}</svg>`;
}

// ── The section marker ─────────────────────────────────────────────────────

/**
 * The section marker: three bricks stepping up to the right, the corner of the mark. One marker
 * everywhere (the section labels, the sermon art, the live stream block, the downloads list, the
 * Studio). viewBox 0 0 78 36. Faces only: at this size an edge band reads as a stripe.
 * @returns {{ d: string, fill: string }[]}
 */
export function brickMarker() {
  return [
    { d: rectPath(0, 24, 30, 11, 1.2), fill: BRICK.brick },
    { d: rectPath(24, 12.5, 34, 11, 1.2), fill: BRICK.light },
    { d: rectPath(52, 1, 26, 11, 1.2), fill: BRICK.dark },
  ];
}
