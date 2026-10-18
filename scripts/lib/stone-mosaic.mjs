// Safe to edit by hand
// The FBC Auburn stone mosaic generators, as pure functions (no file access), so the build
// script (scripts/gen-stones.mjs) and the tests (stone-mosaic.test.mjs) share one copy.
// Ported from the 2026-10-17 design round (board E): pathgen.mjs, tile.mjs and markers.mjs.
//
// - stonePath(): a mosaic stone path. Poisson-disc sites in a band that follows a cubic curve,
//   Lloyd-relaxed Voronoi cells (half-plane clipping) inset for white grout, corners smoothed
//   (Chaikin), coloured in the mark's story order: water and sky, green, gold, red (the cross).
//   Stones come back sorted along the path so a page can lay them one by one.
// - mosaicTile(): a seamless texture tile (cells computed against the 8 neighbouring copies).
// - stoneMarkers(): the three-stone stepping markers that lead each section label.
//
// Everything is seeded (an LCG), so the same inputs always give byte-identical output. The
// seeds the site uses are the ones board E was approved with; change them only on purpose.

/** A seeded linear congruential generator, the same one the design round used. */
export function lcg(seed) {
  let s = Number(seed);
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Keep a*x + b*y <= c (Sutherland-Hodgman against one half-plane).
function clip(poly, a, b, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const pi = a * p[0] + b * p[1] - c;
    const qi = a * q[0] + b * q[1] - c;
    if (pi <= 0) out.push(p);
    if (pi <= 0 !== qi <= 0) {
      const t = pi / (pi - qi);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

function chaikinPass(p) {
  const n = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    n.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
    n.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
  }
  return n;
}

const toD = (p) => 'M' + p.map((v) => v[0].toFixed(1) + ' ' + v[1].toFixed(1)).join('L') + 'Z';

// ── The stone path ─────────────────────────────────────────────────────────

/** Centrelines as cubic bezier control points, in fractions of the canvas. */
export const PATH_PRESETS = {
  // Wide: enters low left, dips, then rises to the upper right (under the Sunday card).
  wide: [
    [-0.02, 0.7],
    [0.32, 0.98],
    [0.58, 0.16],
    [0.86, 0.4],
  ],
  // Phone: a short S across the screen.
  phone: [
    [-0.05, 0.75],
    [0.35, 1.0],
    [0.6, 0.05],
    [1.05, 0.35],
  ],
};

/** Colour runs along the path, start to end: the mark's story. */
export const PATH_RUNS = [
  { at: 0.0, set: ['#96C3EA', '#82B4E2', '#ACCFF0', '#3B83AA'] }, // water and sky
  { at: 0.3, set: ['#2C5B3A', '#376F47', '#24502F', '#2C5B3A'] }, // green ring
  { at: 0.58, set: ['#E8A93A', '#D99A2C', '#F0BB57', '#E8A93A'] }, // gold stepping stones
  { at: 0.84, set: ['#C4401F', '#B3391B', '#D2542F', '#C4401F'] }, // the cross
];

/**
 * @param {{ width: number, height: number, preset: 'wide' | 'phone', seed: number }} opts
 * @returns {{ d: string, fill: string }[]} stones in path order
 */
export function stonePath({ width: W, height: H, preset, seed }) {
  const rnd = lcg(seed);
  const pts = PATH_PRESETS[preset].map(([x, y]) => [x * W, y * H]);
  const bez = (t) => {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return [
      a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0],
      a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1],
    ];
  };
  // Sample the curve finely for nearest-point queries.
  const N = 600;
  const curve = [];
  let len = 0;
  for (let i = 0; i <= N; i++) {
    const p = bez(i / N);
    if (i) len += Math.hypot(p[0] - curve[i - 1].p[0], p[1] - curve[i - 1].p[1]);
    curve.push({ p, s: len });
  }
  const nearest = (x, y) => {
    let best = Infinity;
    let bi = 0;
    for (let i = 0; i < curve.length; i += 2) {
      const d = (curve[i].p[0] - x) ** 2 + (curve[i].p[1] - y) ** 2;
      if (d < best) {
        best = d;
        bi = i;
      }
    }
    return { d: Math.sqrt(best), f: curve[bi].s / len };
  };

  // Band half-width and stone size grow along the path (the near end is bigger: perspective).
  const isWide = preset === 'wide';
  const halfAt = (f) => (isWide ? 30 + 40 * f : 20 + 16 * f);
  const rAt = (f) => (isWide ? 15 + 17 * f * f : 10 + 6 * f);

  // Poisson-disc (dart throwing with variable radius) over the area around the band.
  const sites = [];
  const tries = isWide ? 160000 : 50000;
  for (let k = 0; k < tries; k++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const n = nearest(x, y);
    const r = rAt(n.f);
    if (n.d > halfAt(n.f) + r * 2.2) continue; // keep a margin of outside sites for clean edges
    let ok = true;
    for (const s of sites) {
      const rr = (r + s.r) * 0.8;
      if ((s.x - x) ** 2 + (s.y - y) ** 2 < rr * rr) {
        ok = false;
        break;
      }
    }
    if (ok) sites.push({ x, y, r, f: n.f, inside: n.d < halfAt(n.f) });
  }

  const colourAt = (f) => {
    let i = 0;
    while (i < PATH_RUNS.length - 1 && f >= PATH_RUNS[i + 1].at) i++;
    // Blend into the next run over the last 0.07 of this one.
    const next = PATH_RUNS[i + 1];
    if (next && f > next.at - 0.07 && rnd() < (f - (next.at - 0.07)) / 0.07) i++;
    const set = PATH_RUNS[i].set;
    return set[Math.floor(rnd() * set.length)];
  };

  // The Voronoi cell of s0: a box clipped by the bisector with every nearby site, each
  // bisector pulled toward s0 by half the grout width g. Null when it degenerates.
  const cellOf = (s0, g) => {
    let poly = [
      [s0.x - 200, s0.y - 200],
      [s0.x + 200, s0.y - 200],
      [s0.x + 200, s0.y + 200],
      [s0.x - 200, s0.y + 200],
    ];
    for (const t of sites) {
      if (t === s0) continue;
      const dx = t.x - s0.x;
      const dy = t.y - s0.y;
      if (dx * dx + dy * dy > (s0.r + t.r) ** 2 * 9) continue;
      const mx = (s0.x + t.x) / 2;
      const my = (s0.y + t.y) / 2;
      poly = clip(poly, dx, dy, dx * mx + dy * my - (g / 2) * Math.hypot(dx, dy));
      if (poly.length < 3) return null;
    }
    return poly;
  };
  const centroid = (poly) => {
    let a = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      const c = p[0] * q[1] - q[0] * p[1];
      a += c;
      cx += (p[0] + q[0]) * c;
      cy += (p[1] + q[1]) * c;
    }
    return a ? [cx / (3 * a), cy / (3 * a), Math.abs(a) / 2] : null;
  };

  // Lloyd relaxation: inside sites move to their cell's centroid, so stones are rounder and
  // the grout lines even out.
  for (let it = 0; it < 3; it++) {
    const moves = sites.map((st) => {
      if (!st.inside) return null;
      const c = cellOf(st, 0);
      const m = c && centroid(c);
      return m && m[2] < Math.PI * (st.r * 2.2) ** 2 ? m : null;
    });
    sites.forEach((st, i) => {
      if (moves[i]) {
        st.x = moves[i][0];
        st.y = moves[i][1];
      }
    });
  }

  const grout = isWide ? 3.2 : 2.2;
  const stones = [];
  for (const s of sites) {
    if (!s.inside) continue;
    const poly = cellOf(s, grout);
    if (!poly) continue;
    const area =
      Math.abs(
        poly.reduce((acc, p, i) => {
          const q = poly[(i + 1) % poly.length];
          return acc + p[0] * q[1] - q[0] * p[1];
        }, 0),
      ) / 2;
    if (area > Math.PI * (s.r * 2.2) ** 2) continue; // an open cell on the band edge: skip
    // Cut the corners, then two Chaikin passes: rounded stones.
    const cut = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      cut.push([p[0] + 0.24 * (q[0] - p[0]), p[1] + 0.24 * (q[1] - p[1])]);
      cut.push([p[0] + 0.76 * (q[0] - p[0]), p[1] + 0.76 * (q[1] - p[1])]);
    }
    const smooth = chaikinPass(chaikinPass(cut));
    stones.push({ f: s.f, d: toD(smooth), fill: colourAt(s.f) });
  }
  // In path order (water first, cross last). Array sort is stable, so ties keep site order.
  stones.sort((a, b) => a.f - b.f);
  return stones.map(({ d, fill }) => ({ d, fill }));
}

// ── The texture tile ───────────────────────────────────────────────────────

/**
 * @param {{ size: number, grout: string, fills: string[], seed: number }} opts
 * @returns {string} a standalone SVG document
 */
export function mosaicTile({ size: T, grout, fills, seed }) {
  const rnd = lcg(seed);
  const R = T / 9; // typical stone spacing
  let sites = [];
  for (let k = 0; k < 20000; k++) {
    const x = rnd() * T;
    const y = rnd() * T;
    let ok = true;
    for (const s of sites) {
      let dx = Math.abs(s.x - x);
      let dy = Math.abs(s.y - y);
      dx = Math.min(dx, T - dx);
      dy = Math.min(dy, T - dy);
      if (dx * dx + dy * dy < R * R) {
        ok = false;
        break;
      }
    }
    if (ok) sites.push({ x, y });
  }
  const copies = () => {
    const all = [];
    for (const ox of [-T, 0, T])
      for (const oy of [-T, 0, T])
        for (const s of sites) all.push({ x: s.x + ox, y: s.y + oy, o: s });
    return all;
  };
  const cell = (s, all, g) => {
    let poly = [
      [s.x - 3 * R, s.y - 3 * R],
      [s.x + 3 * R, s.y - 3 * R],
      [s.x + 3 * R, s.y + 3 * R],
      [s.x - 3 * R, s.y + 3 * R],
    ];
    for (const t of all) {
      if (t.x === s.x && t.y === s.y) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      if (dx * dx + dy * dy > 16 * R * R) continue;
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      poly = clip(poly, dx, dy, dx * mx + dy * my - (g / 2) * Math.hypot(dx, dy));
    }
    return poly;
  };
  for (let it = 0; it < 3; it++) {
    const all = copies();
    sites = sites.map((s) => {
      const p = cell(s, all, 0);
      let a = 0;
      let cx = 0;
      let cy = 0;
      for (let i = 0; i < p.length; i++) {
        const u = p[i];
        const v = p[(i + 1) % p.length];
        const c = u[0] * v[1] - v[0] * u[1];
        a += c;
        cx += (u[0] + v[0]) * c;
        cy += (u[1] + v[1]) * c;
      }
      return { x: (((cx / (3 * a)) % T) + T) % T, y: (((cy / (3 * a)) % T) + T) % T };
    });
  }
  const all = copies();
  const colour = new Map(sites.map((s) => [s, fills[Math.floor(rnd() * fills.length)]]));
  let paths = '';
  for (const s of all) {
    if (s.x < -2 * R || s.x > T + 2 * R || s.y < -2 * R || s.y > T + 2 * R) continue;
    const p = chaikinPass(chaikinPass(cell(s, all, R * 0.07)));
    paths += `<path d="${toD(p)}" fill="${colour.get(s.o)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="${grout}"/>${paths}</svg>`;
}

// ── Section markers ────────────────────────────────────────────────────────

/** One colour run per marker, in the path's order down the page. */
export const MARKER_RUNS = [
  ['#96C3EA', '#3B83AA', '#82B4E2'], // sky
  ['#2C5B3A', '#376F47', '#24502F'], // green
  ['#E8A93A', '#D99A2C', '#F0BB57'], // gold
  ['#C4401F', '#B3391B', '#D2542F'], // red
];

/**
 * @param {number} [seed]
 * @returns {string[][]} per marker, its three stone path `d` strings (fills are MARKER_RUNS)
 */
export function stoneMarkers(seed = 21) {
  const rnd = lcg(seed);
  const stone = (cx, cy, rx, ry, rot) => {
    let pts = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const j = 0.92 + rnd() * 0.12;
      const x = Math.cos(t) * rx * j;
      const y = Math.sin(t) * ry * j;
      pts.push([
        cx + x * Math.cos(rot) - y * Math.sin(rot),
        cy + x * Math.sin(rot) + y * Math.cos(rot),
      ]);
    }
    for (let k = 0; k < 3; k++) pts = chaikinPass(pts);
    return toD(pts);
  };
  return MARKER_RUNS.map(() => [
    stone(13, 26, 13, 9, -0.25),
    stone(38, 18, 14, 9.5, -0.15),
    stone(63, 10, 12.5, 8.5, -0.3),
  ]);
}
