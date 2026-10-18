// Safe to edit by hand
// The FBC Auburn stone generators, as pure functions (no file access), so the build script
// (scripts/gen-stones.mjs) and the tests (stone-mosaic.test.mjs) share one copy.
//
// History (all 2026-10-17): board E drew random round pebbles in 13 colours; the Home audit found
// they did not match the logo's dressed stones; a squared, coursed redraw and then a full brick
// path went too far from the warmth; random soft stones still made pointy "guitar pick" cells.
// This is the pick: Voronoi stones seeded on a jittered, staggered grid, so every stone is four
// to six sided and a different size, with flatter sides and softened corners; edges that go in
// and out; the mark's six colours only, in four clear bands (its story: the water, the green ring,
// the gold steps, the red cross).
//
// - stonePath(): the path along a cubic curve. Grid sites in rows along the curve (each row its
//   own spacing, width and offset), one Lloyd pass, cells inset for one even white grout, corners
//   softened. The red end meets the This Sunday card (the door). Only whole stones: none is cut
//   by the canvas edge, and none is a wedge. Stones come back in path order so a page can lay
//   them one by one.
// - mosaicTile(): a seamless tile of the same stones in varied sizes (the card's ground).
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
function soften(poly, k = 0.18) {
  const cut = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    cut.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]);
    cut.push([p[0] + (1 - k) * (q[0] - p[0]), p[1] + (1 - k) * (q[1] - p[1])]);
  }
  return chaikinPass(cut);
}

/** The sharpest corner of a convex polygon, in degrees. A wedge-shaped Voronoi cell (the
 * "pointy pebble") has one under about 70. */
function minAngle(poly) {
  let min = 180;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[(i - 1 + poly.length) % poly.length];
    const b = poly[i];
    const c = poly[(i + 1) % poly.length];
    const v1 = [a[0] - b[0], a[1] - b[1]];
    const v2 = [c[0] - b[0], c[1] - b[1]];
    const l = Math.hypot(...v1) * Math.hypot(...v2);
    if (l < 1e-6) continue;
    const cos = Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / l));
    min = Math.min(min, (Math.acos(cos) * 180) / Math.PI);
  }
  return min;
}

/**
 * How many sides a stone really has: sides longer than an eighth of its perimeter. A rounded
 * triangle (the "guitar pick") has three, however many tiny clipped edges it carries.
 */
function realSides(poly) {
  const lens = poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    return Math.hypot(q[0] - p[0], q[1] - p[1]);
  });
  const per = lens.reduce((a, b) => a + b, 0);
  return lens.filter((l) => l > per / 8).length;
}

/** Farthest corner over nearest side, both measured from the centroid c ([x, y, ...]). */
function pointiness(poly, c) {
  let far = 0;
  let near = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    far = Math.max(far, Math.hypot(p[0] - c[0], p[1] - c[1]));
    const ex = q[0] - p[0];
    const ey = q[1] - p[1];
    const el = Math.hypot(ex, ey);
    if (el > 1e-6) near = Math.min(near, Math.abs(ex * (c[1] - p[1]) - ey * (c[0] - p[0])) / el);
  }
  return near > 0 ? far / near : Infinity;
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
    half: [40, 54], // half the band's width, near end to the card end
    r: [11, 17], // typical stone radius
    grout: 3.2,
  },
  phone: {
    curve: [
      [-0.04, 0.6],
      [0.36, 1.0],
      [0.62, 0.1],
      [1.0, 0.42],
    ],
    half: [18, 24],
    r: [7, 9],
    grout: 2.2,
  },
};

/** Four clear bands, the mark's story: the water, the green ring, the gold steps, the red cross. */
export const PATH_RUNS = [
  { at: 0.0, set: [MARK.water, MARK.sky, MARK.water, MARK.deep] },
  { at: 0.27, set: [MARK.green] },
  { at: 0.52, set: [MARK.gold] },
  { at: 0.77, set: [MARK.red] },
];

/**
 * @param {{ width: number, height: number, preset: 'wide' | 'phone', seed: number }} opts
 * @returns {{ d: string, fill: string }[]} stones in path order (the water first, red last)
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
  const lerp = ([a, b], f) => a + (b - a) * f;
  const halfAt = (f) => lerp(P.half, f);

  // Sites on a jittered, staggered grid laid along the path (not random darts): rows of varied
  // spacing, every other row offset by half a stone, every site nudged. Voronoi cells of such a
  // grid are four, five and six sided stones of varied size; random darts also made thin
  // three-sided cells, the "guitar picks". Two rings of outside sites keep the edge cells whole;
  // each row's own width makes the edge go in and out.
  const frame = (s) => {
    let i = 1;
    while (i < curve.length - 1 && curve[i].s < s) i++;
    const a = curve[i - 1];
    const b = curve[i];
    const t = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
    const dx = b.p[0] - a.p[0];
    const dy = b.p[1] - a.p[1];
    const l = Math.hypot(dx, dy) || 1;
    return { x: a.p[0] + dx * t, y: a.p[1] + dy * t, nx: -dy / l, ny: dx / l };
  };
  const sites = [];
  let row = 0;
  for (let s = 0; s < len; row++) {
    const f = s / len;
    const r = lerp(P.r, f);
    const across = 2 * r * (0.85 + rnd() * 0.4); // this row's stone width
    const edge = halfAt(f) * (0.84 + rnd() * 0.26); // this row's half width: ragged edges
    const offset = (row % 2) * 0.5 + (rnd() - 0.5) * 0.2;
    for (let k = -Math.ceil(edge / across) - 2; k <= Math.ceil(edge / across) + 2; k++) {
      const w = (k + offset) * across + (rnd() - 0.5) * r * 0.6;
      const ds = (rnd() - 0.5) * r * 0.6;
      const fs = frame(Math.max(0, Math.min(len, s + ds)));
      sites.push({
        x: fs.x + fs.nx * w,
        y: fs.y + fs.ny * w,
        r: r * (0.85 + rnd() * 0.3),
        f: (s + ds) / len,
        inside: Math.abs(w) < edge,
      });
    }
    s += 2 * r * (0.8 + rnd() * 0.4); // this row's depth along the path
  }

  const colourAt = (f) => {
    let i = 0;
    while (i < PATH_RUNS.length - 1 && f >= PATH_RUNS[i + 1].at) i++;
    // A short blend into the next band (the last 0.035 of this one), so the bands stay clear.
    const next = PATH_RUNS[i + 1];
    if (next && f > next.at - 0.035 && rnd() < (f - (next.at - 0.035)) / 0.035) i++;
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

  // One Lloyd pass evens the grout; the grid already keeps the stones from going thin.
  for (let it = 0; it < 1; it++) {
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
    // No wedges or teardrops: a stone whose farthest corner is more than twice as far from its
    // centre as its nearest side (a square is 1.41, a teardrop 2.2 and up) is left out, as is one
    // with a corner under 75 degrees. They sit mostly on the edges, so the path goes in and out
    // there instead of ending in points.
    if (minAngle(poly) < 75 || pointiness(poly, c) > 1.85 || realSides(poly) < 4) continue;
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
  // A jittered, staggered grid (as the path uses), so no cell comes out three-sided. The counts
  // divide the tile exactly and the row count is even, so the grid wraps without a seam.
  const cols = Math.round(T / (1.1 * R));
  const rows = 2 * Math.round(T / (2 * 0.95 * R));
  let sites = [];
  for (let rw = 0; rw < rows; rw++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + (rw % 2) * 0.5) * T) / cols + (rnd() - 0.5) * R * 0.85;
      const y = (rw * T) / rows + (rnd() - 0.5) * R * 0.7;
      sites.push({ x: ((x % T) + T) % T, y: ((y % T) + T) % T, r: R });
    }
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
  // One Lloyd pass evens the grout; the jitter keeps every stone its own size.
  for (let it = 0; it < 1; it++) {
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
