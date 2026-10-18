// Safe to edit by hand
// The FBC Auburn stone generators, as pure functions (no file access), so the build script
// (scripts/gen-stones.mjs) and the tests (stone-mosaic.test.mjs) share one copy.
//
// History: board E (2026-10-17) drew round pebbles in 13 colours; the Home audit the same day
// found they did not match the logo's dressed stones; a squared, coursed redraw lost the warmth.
// This is the middle ground Nathan asked for: the same random, hand-laid Voronoi stones (edges
// going in and out, every stone a different size and shape) but only SOFTENED at the corners, not
// rounded into blobs, so they sit between the pebbles and the mark's stones. Colours are the
// mark's six, nothing else.
//
// - stonePath(): a stone path along a cubic curve. Poisson-disc sites of varied size in a band
//   around the curve, Lloyd-relaxed Voronoi cells inset for one even white grout, corners
//   softened. Coloured in the mark's story order: the water, the ring, the gold steps; the gold
//   end meets the This Sunday card (the door). Only whole stones: none is cut by the canvas edge.
//   Stones come back in path order so a page can lay them one by one.
// - mosaicTile(): a seamless texture tile of the same soft stones in varied sizes (the card).
// - stoneMarkers(): the section marker, three gold steps lifted from the mark.
//
// Everything is seeded (an LCG), so the same inputs always give byte-identical output.

/** A seeded linear congruential generator. */
export function lcg(seed) {
  let s = Number(seed);
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** The mark's six colours, and nothing else. */
export const MARK = {
  deep: '#235E93',
  green: '#2C5B3A',
  sky: '#3B83AA',
  water: '#96C3EA',
  red: '#C4401F',
  gold: '#E8A93A',
};

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

const f1 = (v) => v.toFixed(1);
const toD = (p) => 'M' + p.map((v) => f1(v[0]) + ' ' + f1(v[1])).join('L') + 'Z';

/**
 * Soften a cell's corners without rounding it into a blob: cut each corner a little (k of each
 * edge), then one Chaikin pass. Long straight sides stay straight, as on a dressed stone.
 */
function soften(poly, k = 0.22) {
  const cut = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    cut.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]);
    cut.push([p[0] + (1 - k) * (q[0] - p[0]), p[1] + (1 - k) * (q[1] - p[1])]);
  }
  return chaikinPass(cut);
}

/**
 * A polygon with its corners rounded by r, as an SVG path (straight edges, one quadratic curve
 * per corner). Used for the hand-drawn marker steps.
 */
export function roundedPoly(p, r) {
  const n = p.length;
  const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ins = [];
  const outs = [];
  for (let i = 0; i < n; i++) {
    const c = p[i];
    const prev = p[(i - 1 + n) % n];
    const next = p[(i + 1) % n];
    ins.push(at(c, prev, Math.min(r / Math.hypot(prev[0] - c[0], prev[1] - c[1]), 0.4)));
    outs.push(at(c, next, Math.min(r / Math.hypot(next[0] - c[0], next[1] - c[1]), 0.4)));
  }
  let d = `M${f1(outs[0][0])} ${f1(outs[0][1])}`;
  for (let k = 1; k <= n; k++) {
    const i = k % n;
    d += `L${f1(ins[i][0])} ${f1(ins[i][1])}`;
    d += `Q${f1(p[i][0])} ${f1(p[i][1])} ${f1(outs[i][0])} ${f1(outs[i][1])}`;
  }
  return d + 'Z';
}

// ── The stone path ─────────────────────────────────────────────────────────

/**
 * Centrelines as cubic bezier control points (fractions of the canvas) and the size rules. Both
 * end at the right edge with a level tangent: on desktop that edge is the This Sunday card's left
 * side, so the gold end meets the card.
 */
export const PATH_PRESETS = {
  wide: {
    curve: [
      [-0.02, 0.62],
      [0.34, 1.0],
      [0.6, 0.14],
      [1.0, 0.44],
    ],
    half: [34, 42], // half the band's width, near end to the card end
    r: [15, 24], // typical stone radius
    grout: 3.2,
    tries: 140000,
  },
  phone: {
    curve: [
      [-0.04, 0.6],
      [0.36, 1.0],
      [0.62, 0.1],
      [1.0, 0.42],
    ],
    half: [17, 22],
    r: [10, 13],
    grout: 2.2,
    tries: 40000,
  },
};

/** The story along the path, start to end: the water, the ring, the gold steps. */
export const PATH_RUNS = [
  { at: 0.0, set: [MARK.water, MARK.sky, MARK.water, MARK.deep] },
  { at: 0.42, set: [MARK.green, MARK.green, MARK.deep] },
  { at: 0.8, set: [MARK.gold] },
];

/**
 * @param {{ width: number, height: number, preset: 'wide' | 'phone', seed: number }} opts
 * @returns {{ d: string, fill: string }[]} stones in path order (the water first, gold last)
 */
export function stonePath({ width: W, height: H, preset, seed }) {
  const rnd = lcg(seed);
  const P = PATH_PRESETS[preset];
  const pts = P.curve.map(([x, y]) => [x * W, y * H]);
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
  const lerp = ([a, b], f) => a + (b - a) * f;
  const halfAt = (f) => lerp(P.half, f);

  // Poisson-disc dart throwing with a varied radius per stone (0.7 to 1.3 of the local size), so
  // no two stones are quite the same size.
  const sites = [];
  for (let k = 0; k < P.tries; k++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const n = nearest(x, y);
    const r = lerp(P.r, n.f) * (0.7 + rnd() * 0.6);
    if (n.d > halfAt(n.f) + r * 2.2) continue; // a margin of outside sites for a clean edge
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
    // Blend into the next run over the last 0.06 of this one.
    const next = PATH_RUNS[i + 1];
    if (next && f > next.at - 0.06 && rnd() < (f - (next.at - 0.06)) / 0.06) i++;
    const set = PATH_RUNS[i].set;
    return set[Math.floor(rnd() * set.length)];
  };

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

  // Two Lloyd passes: the grout evens out, the stones keep some irregularity.
  for (let it = 0; it < 2; it++) {
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

  const stones = [];
  for (const s of sites) {
    if (!s.inside) continue;
    const poly = cellOf(s, P.grout);
    if (!poly) continue;
    const c = centroid(poly);
    if (!c || c[2] > Math.PI * (s.r * 2.2) ** 2) continue; // an open cell on the band edge
    // Only whole stones: none sliced by the canvas edge (the card side above all).
    if (poly.some(([x, y]) => x > W - 1 || y < 1 || y > H - 1)) continue;
    stones.push({ f: s.f, d: toD(soften(poly)), fill: colourAt(s.f) });
  }
  stones.sort((a, b) => a.f - b.f);
  return stones.map(({ d, fill }) => ({ d, fill }));
}

// ── The texture tile ───────────────────────────────────────────────────────

/**
 * A seamless tile of the same soft stones, in varied sizes (cells are computed against the eight
 * neighbouring copies, so it repeats without a seam).
 * @param {{ size: number, grout: string, fills: string[], seed: number }} opts
 * @returns {string} a standalone SVG document
 */
export function mosaicTile({ size: T, grout, fills, seed }) {
  const rnd = lcg(seed);
  const R = T / 8; // typical stone spacing
  let sites = [];
  for (let k = 0; k < 20000; k++) {
    const x = rnd() * T;
    const y = rnd() * T;
    const r = R * (0.65 + rnd() * 0.8); // every stone its own size
    let ok = true;
    for (const s of sites) {
      let dx = Math.abs(s.x - x);
      let dy = Math.abs(s.y - y);
      dx = Math.min(dx, T - dx);
      dy = Math.min(dy, T - dy);
      const rr = (r + s.r) / 2;
      if (dx * dx + dy * dy < rr * rr) {
        ok = false;
        break;
      }
    }
    if (ok) sites.push({ x, y, r });
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
  // One Lloyd pass only: enough to even the grout, not enough to make the stones uniform.
  {
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
      return { x: (((cx / (3 * a)) % T) + T) % T, y: (((cy / (3 * a)) % T) + T) % T, r: s.r };
    });
  }
  const all = copies();
  const colour = new Map(sites.map((s) => [s, fills[Math.floor(rnd() * fills.length)]]));
  let paths = '';
  for (const s of all) {
    if (s.x < -2 * R || s.x > T + 2 * R || s.y < -2 * R || s.y > T + 2 * R) continue;
    paths += `<path d="${toD(soften(cell(s, all, R * 0.07)))}" fill="${colour.get(s.o)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="${grout}"/>${paths}</svg>`;
}

// ── The section marker ─────────────────────────────────────────────────────

/**
 * The section marker: three gold steps rising to the right and shrinking as they go, as the
 * mark's stepping stones do. One marker everywhere. viewBox 0 0 78 36.
 * @returns {{ d: string, fill: string }[]}
 */
export function stoneMarkers() {
  const steps = [
    [
      [1, 24],
      [25, 21.5],
      [27, 34.5],
      [2.5, 35],
    ],
    [
      [29, 13.5],
      [49.5, 11.5],
      [51, 22],
      [30.5, 23],
    ],
    [
      [54, 4],
      [71.5, 2.5],
      [72.5, 11.5],
      [55.5, 12.5],
    ],
  ];
  return steps.map((q) => ({ d: roundedPoly(q, 3), fill: MARK.gold }));
}
