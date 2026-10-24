// Safe to edit by hand
// The linocut finish for every brick on the site (2026-10-23). The logo became a traced linocut
// print (brand/logo/mark.svg), and its look is what makes the brick feel real: edges that are a
// little chipped, a darker rim where the ink squeezed out at each brick's edge, and white flecks
// and scratches where the paper shows through. This module gives the generated bricks the same
// finish, measured from the print:
//
//   printBrick()   one brick as two paths: its face (a rough-edged shape) and its rim (an uneven
//                  darker ring round the face, heavier along the bottom, like the print's squeeze).
//                  Optional `flecks` cut holes in the face (for the cached tile files).
//   fleckPath()    flecks and scratches scattered over a box, as one path (holes or a mask).
//   printMask()    a <mask> that punches a repeating fleck pattern through whatever it is put on,
//                  so a drawing with many bricks gets the flecks for a few hundred bytes. The holes
//                  show the ground behind (white on the page, the grout on a tile), which also keeps
//                  every measured text contrast true.
//
// Everything is seeded (the LCG from stone-mosaic.mjs), so the same inputs give byte-identical
// output. Sizes are fractions of the brick height `h` (or the course height `u` for a pattern), so
// the finish reads the same on a 11 px marker brick and a 44 px share-card brick.

import { lcg } from './stone-mosaic.mjs';

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z';
/** Twice the signed area of a polygon: positive when it runs clockwise on screen (y down). */
const area2 = (pts) =>
  pts.reduce((a, [x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    return a + x0 * y1 - x1 * y0;
  }, 0);
/** A fleck as a hole: always counter-clockwise, so it cuts a clockwise face under nonzero. */
const hole = (pts) => poly(area2(pts) > 0 ? [...pts].reverse() : pts);

/**
 * The outline of a brick with chipped edges: each side split into short runs and every point
 * pushed inward by up to `rough`, corners a little more. Points never leave the box, so a brick
 * stays inside its slot. Clockwise.
 */
function roughOutline(x, y, w, h, rough, rnd) {
  const pts = [];
  const step = Math.max(h * 0.8, 3);
  const side = (x0, y0, x1, y1, nx, ny) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const corner = i === 0;
      const d = rnd() * rough * (corner ? 1.6 : 1);
      // A corner chips along both of its sides.
      const ex = corner ? (x1 > x0 ? 1 : x1 < x0 ? -1 : 0) * rnd() * rough * 1.2 : 0;
      const ey = corner ? (y1 > y0 ? 1 : y1 < y0 ? -1 : 0) * rnd() * rough * 1.2 : 0;
      pts.push([x0 + (x1 - x0) * t + nx * d + ex, y0 + (y1 - y0) * t + ny * d + ey]);
    }
  };
  side(x, y, x + w, y, 0, 1); // top, pushed down
  side(x + w, y, x + w, y + h, -1, 0); // right, pushed left
  side(x + w, y + h, x, y + h, 0, -1); // bottom, pushed up
  side(x, y + h, x, y, 1, 0); // left, pushed right
  return pts;
}

/** Shrink an outline toward the brick's middle by side-dependent amounts, with a little wobble. */
function inset(pts, x, y, w, h, { top, side, bottom }, rnd) {
  const cy = y + h / 2;
  return pts.map(([px, py]) => {
    const wob = 0.6 + rnd() * 0.8;
    const dx = px < x + w / 2 ? side : -side;
    const dy = py < cy ? top : -bottom;
    // Points near a side move mostly across it; corners move both ways.
    const nearX = Math.min(px - x, x + w - px) < h * 0.5;
    const nearY = Math.min(py - y, y + h - py) < h * 0.3;
    return [px + (nearX ? dx * wob : 0), py + (nearY ? dy * wob : 0)];
  });
}

/**
 * Flecks and scratches inside a box, as one path of small closed shapes (counter-clockwise, so
 * they cut holes in a clockwise face under the default nonzero rule). `u` is the size unit (the
 * brick or course height); `n` the count.
 */
export function fleckPath(x, y, w, h, u, n, rnd) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = x + rnd() * w;
    const cy = y + rnd() * h;
    if (rnd() < 0.78) {
      // A fleck: a small irregular four-sided chip.
      const r = u * (0.018 + rnd() * 0.045);
      const a = rnd() * Math.PI;
      const pts = [0, 1, 2, 3].map((k) => {
        const ang = a - (k * Math.PI) / 2; // decreasing angle: counter-clockwise on screen
        const rr = r * (0.55 + rnd() * 0.7);
        return [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
      });
      d += hole(pts);
    } else {
      // A scratch: a thin sliver, mostly on a shallow diagonal like the print's knife slips.
      const len = u * (0.12 + rnd() * 0.4);
      const wid = u * (0.012 + rnd() * 0.016);
      const a = (rnd() < 0.8 ? -0.25 - rnd() * 0.5 : 0.9 + rnd() * 0.5) * (rnd() < 0.5 ? 1 : -1);
      const ux = Math.cos(a),
        uy = Math.sin(a);
      const px = -uy * wid,
        py = ux * wid;
      const hx = (ux * len) / 2,
        hy = (uy * len) / 2;
      // Tapered ends: a long thin diamond, counter-clockwise.
      d += hole([
        [cx - hx, cy - hy],
        [cx - px, cy - py],
        [cx + hx, cy + hy],
        [cx + px, cy + py],
      ]);
    }
  }
  return d;
}

/**
 * One brick with the linocut finish.
 * @param {number} x @param {number} y @param {number} w @param {number} h
 * @param {{ fill: string, rim: string, rnd: () => number, flecks?: number, rough?: number, fleckFill?: string }} o
 *   flecks     how many flecks to put in the face (0 for drawings that use printMask instead)
 *   fleckFill  paint the flecks in this colour instead of cutting holes (a tile on a dark grout,
 *              where a hole would show darker, not paler)
 *   rough   how far the edges chip, as a fraction of h (default 0.06)
 * @returns {{ d: string, fill: string }[]} [face, rim]
 */
export function printBrick(x, y, w, h, { fill, rim, rnd, flecks = 0, rough = 0.06, fleckFill }) {
  const outer = roughOutline(x, y, w, h, h * rough, rnd);
  const t = Math.max(0.4, h * 0.06);
  const inner = inset(outer, x, y, w, h, { top: t, side: t, bottom: t * 1.8 }, rnd);
  let face = poly(inner);
  const fl =
    flecks > 0 ? fleckPath(x + t * 2, y + t * 2, w - t * 4, h - t * 5, h, flecks, rnd) : '';
  if (fl && !fleckFill) face += fl;
  // The rim is the ring between the outline and the face: the outline clockwise, the face's
  // outline reversed, so it never paints over the face.
  const ring = poly(outer) + poly([...inner].reverse());
  const out = [
    { d: face, fill },
    { d: ring, fill: rim },
  ];
  if (fl && fleckFill) out.push({ d: fl, fill: fleckFill });
  return out;
}

/**
 * A mask that punches repeating flecks through a drawing. Put the returned `defs` in the SVG and
 * `mask="url(#<id>)"` on the group that holds the bricks.
 * @param {string} id unique in the page
 * @param {{ x: number, y: number, w: number, h: number, u: number, seed: number, density?: number, tile?: [number, number] }} o
 *   u        the course height in the drawing's units (sizes the flecks and the tile)
 *   density  flecks per square course (default 4.5)
 *   tile     the repeat, in courses (default 7 x 5; the letterforms use a smaller one, since each
 *            word carries its own mask)
 */
export function printMask(id, { x, y, w, h, u, seed, density = 4.5, tile = [7, 5] }) {
  const rnd = lcg(seed);
  // A tall-ish, not square, tile so the repeat does not line up with the running bond.
  const tw = u * tile[0];
  const th = u * tile[1];
  const n = Math.round((tw / u) * (th / u) * density);
  const d = fleckPath(0, 0, tw, th, u, n, rnd);
  return (
    `<defs><pattern id="${id}-p" patternUnits="userSpaceOnUse" width="${f1(tw)}" height="${f1(th)}">` +
    `<path d="${d}" fill="#000"/></pattern>` +
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}">` +
    `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff"/>` +
    `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="url(#${id}-p)"/></mask></defs>`
  );
}
