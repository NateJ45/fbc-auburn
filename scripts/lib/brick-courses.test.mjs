// Tests for the brick generators (scripts/lib/brick-courses.mjs). The committed output of
// scripts/gen-stones.mjs is checked by stone-mosaic.test.mjs. Run by `npm run test:scripts`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BRICK,
  BRICK_EDGE,
  BRICK_PATH_PRESETS,
  brickMarker,
  brickPath,
  brickTile,
  rectPath,
} from './brick-courses.mjs';

const AUBURN = new Set([...Object.values(BRICK), ...Object.values(BRICK_EDGE)]);
const pointsOf = (d) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);

describe('brickPath', () => {
  it('is deterministic for a seed', () => {
    const opts = { width: 960, height: 240, preset: 'wide', seed: 7 };
    assert.deepEqual(brickPath(opts), brickPath(opts));
  });

  it('lays whole bricks inside the box, in the auburn tones only, for every preset', () => {
    for (const [preset, W, H] of [
      ['wide', 960, 240],
      ['phone', 390, 96],
      ['sill', 1600, 64],
      ['banner', 1040, 88],
      ['bannerPhone', 390, 56],
      ['og', 1200, 210],
    ]) {
      const bricks = brickPath({ width: W, height: H, preset, seed: 3 });
      assert.ok(bricks.length >= 8, `${preset}: only ${bricks.length} pieces`);
      for (const b of bricks) {
        assert.ok(AUBURN.has(b.fill), `${preset}: ${b.fill} is not an auburn tone`);
        for (const [x, y] of pointsOf(b.d)) {
          assert.ok(x >= -0.1 && x <= W + 0.1, `${preset}: x=${x} is outside 0..${W}`);
          assert.ok(y >= -0.1 && y <= H + 0.1, `${preset}: y=${y} is outside 0..${H}`);
        }
      }
    }
  });

  it('steps up toward the right: each course starts further along than the one under it', () => {
    const bricks = brickPath({ width: 960, height: 240, preset: 'wide', seed: 7 });
    const P = BRICK_PATH_PRESETS.wide;
    // The first face of each course is the first piece at that course's y.
    const starts = P.courses.map((_, i) => {
      const y = 240 - P.bottom - (i + 1) * P.h - i * P.joint;
      const first = bricks.find((b) => pointsOf(b.d).some(([, py]) => Math.abs(py - y) < 0.2));
      return Math.min(...pointsOf(first.d).map(([x]) => x));
    });
    for (let i = 1; i < starts.length; i++)
      assert.ok(starts[i] > starts[i - 1] + 40, `course ${i} does not step`);
  });

  it('leans on the lighter tones (the path is lower and lighter than the mock)', () => {
    // Faces and their edge bands alternate in the output; the faces are the even entries.
    const faces = brickPath({ width: 1600, height: 64, preset: 'sill', seed: 5 }).filter(
      (b, i) => i % 2 === 0 && b.fill in BRICK_EDGE,
    );
    const light = faces.filter((b) => b.fill === BRICK.light || b.fill === BRICK.pale).length;
    assert.ok(light / faces.length > 0.45, `only ${light} of ${faces.length} faces are light`);
  });
});

describe('brickTile', () => {
  it('is deterministic, uses only its own colours, and repeats without a seam', () => {
    const opts = { size: 420, grout: '#FFFFFF', fills: ['#000001', '#000002'], seed: 3 };
    const a = brickTile(opts);
    assert.equal(a, brickTile(opts));
    // The grout, each face, and each face's printed rim and pale flecks (2026-10-23): three
    // colours per face, nothing else.
    const fills = new Set([...a.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]));
    assert.ok(fills.has('#FFFFFF') && fills.has('#000001') && fills.has('#000002'));
    assert.ok(fills.size <= 1 + 3 * opts.fills.length, `${fills.size} colours`);
    // A brick crossing the right edge is drawn again, the same shapes moved one tile left.
    assert.match(a, /<g transform="translate\(-420 0\)">/, 'no wrapped brick on the left edge');
  });
});

describe('brickMarker', () => {
  it('gives one marker: three bricks stepping up to the right, auburn tones', () => {
    // Face then printed rim for each brick (2026-10-23).
    const m = brickMarker();
    assert.equal(m.length, 6);
    const faces = m.filter((_, i) => i % 2 === 0);
    const tops = faces.map((s) => Math.min(...pointsOf(s.d).map(([, y]) => y)));
    assert.ok(tops[0] > tops[1] && tops[1] > tops[2], 'the bricks do not step up');
    for (const s of faces) assert.ok(Object.values(BRICK).includes(s.fill));
    for (const [i, s] of m.entries()) if (i % 2) assert.equal(s.fill, BRICK_EDGE[m[i - 1].fill]);
  });
});

describe('rectPath', () => {
  it('closes and stays inside its box', () => {
    const d = rectPath(10, 20, 30, 8, 2);
    assert.match(d, /^M.*Z$/);
    for (const [x, y] of pointsOf(d)) {
      assert.ok(x >= 10 && x <= 40 && y >= 20 && y <= 28);
    }
  });
});
