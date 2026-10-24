// Tests for the linocut brick finish (scripts/lib/brick-print.mjs, 2026-10-23). Run by
// `npm run test:scripts`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fleckPath, printBrick, printMask } from './brick-print.mjs';
import { lcg } from './stone-mosaic.mjs';

const pointsOf = (d) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
const subpaths = (d) => d.split('M').filter(Boolean);
/** Signed area of a closed polygon (positive = clockwise on screen, y down). */
const area = (sp) => {
  const p = pointsOf('M' + sp);
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[(i + 1) % p.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
};

describe('printBrick', () => {
  it('stays inside its slot and gives a face and a rim ring', () => {
    const [face, rim] = printBrick(10, 20, 84, 30, {
      fill: '#9A3B2A',
      rim: '#702619',
      rnd: lcg(3),
    });
    assert.equal(face.fill, '#9A3B2A');
    assert.equal(rim.fill, '#702619');
    for (const [x, y] of [...pointsOf(face.d), ...pointsOf(rim.d)]) {
      assert.ok(x >= 9.9 && x <= 94.1 && y >= 19.9 && y <= 50.1, `${x},${y} outside the slot`);
    }
    // The ring is the outline clockwise and the face's outline reversed, so it never covers the face.
    const [outer, inner] = subpaths(rim.d);
    assert.ok(area(outer) > 0 && area(inner) < 0, 'the ring does not wind as a hole');
  });

  it('cuts flecks as holes, or paints them when asked', () => {
    const cut = printBrick(0, 0, 84, 30, {
      fill: '#9A3B2A',
      rim: '#702619',
      rnd: lcg(5),
      flecks: 6,
    });
    const [outline, ...holes] = subpaths(cut[0].d);
    assert.equal(holes.length, 6);
    assert.ok(area(outline) > 0);
    for (const h of holes) assert.ok(area(h) < 0, 'a fleck winds the same way as the face');
    const painted = printBrick(0, 0, 84, 30, {
      fill: '#1F3A5F',
      rim: '#192E4C',
      rnd: lcg(5),
      flecks: 6,
      fleckFill: '#7F94AE',
    });
    assert.equal(painted.length, 3);
    assert.equal(subpaths(painted[0].d).length, 1, 'painted flecks should not also cut the face');
    assert.equal(painted[2].fill, '#7F94AE');
  });

  it('is deterministic for a seed', () => {
    const a = printBrick(0, 0, 80, 26, { fill: '#B5503A', rim: '#8A3526', rnd: lcg(9), flecks: 4 });
    const b = printBrick(0, 0, 80, 26, { fill: '#B5503A', rim: '#8A3526', rnd: lcg(9), flecks: 4 });
    assert.deepEqual(a, b);
  });
});

describe('fleckPath and printMask', () => {
  it('scatters the asked number of flecks inside the box', () => {
    const d = fleckPath(0, 0, 100, 60, 30, 25, lcg(1));
    assert.equal(subpaths(d).length, 25);
    for (const [x, y] of pointsOf(d)) assert.ok(x > -20 && x < 120 && y > -20 && y < 80);
  });

  it('builds one pattern and one mask with the given id, the same every time', () => {
    const opts = { x: 0, y: 0, w: 960, h: 240, u: 30, seed: 3 };
    const m = printMask('pm', opts);
    assert.equal(m, printMask('pm', opts));
    assert.match(m, /<pattern id="pm-p" patternUnits="userSpaceOnUse"/);
    assert.match(
      m,
      /<mask id="pm" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="240">/,
    );
    assert.match(m, /fill="url\(#pm-p\)"/);
  });
});
