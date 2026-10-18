// Tests for the board E stone generators (scripts/lib/stone-mosaic.mjs) and the committed output
// of scripts/gen-stones.mjs. Run by `npm run test:scripts`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARK, PATH_RUNS, mosaicTile, stoneMarkers, stonePath } from './stone-mosaic.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MARK_FILLS = new Set(Object.values(MARK));

describe('stonePath', () => {
  it('is deterministic for a seed', () => {
    const opts = { width: 390, height: 180, preset: 'phone', seed: 11 };
    assert.deepEqual(stonePath(opts), stonePath(opts));
  });

  it("lays a path of a sensible size, in the mark's colours only, water first and red last", () => {
    const stones = stonePath({ width: 390, height: 96, preset: 'phone', seed: 11 });
    assert.ok(stones.length >= 20 && stones.length <= 80, `got ${stones.length}`);
    for (const s of stones) {
      assert.match(s.d, /^M[-\d. L]+Z$/);
      assert.ok(MARK_FILLS.has(s.fill), `${s.fill} is not one of the mark's six colours`);
    }
    assert.ok(PATH_RUNS[0].set.includes(stones[0].fill));
    assert.equal(stones.at(-1).fill, MARK.red);
  });

  it('draws only whole stones (none cut by the right edge, where the card is)', () => {
    const W = 1200;
    for (const s of stonePath({ width: W, height: 240, preset: 'wide', seed: 7 })) {
      const xs = [...s.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[1]));
      assert.ok(Math.max(...xs) <= W, `a stone reaches x=${Math.max(...xs)}`);
    }
  });
});

describe('mosaicTile', () => {
  it('is deterministic and uses only its own colours', () => {
    const opts = { size: 120, grout: '#FFFFFF', fills: ['#000001', '#000002'], seed: 3 };
    const a = mosaicTile(opts);
    assert.equal(a, mosaicTile(opts));
    const fills = new Set([...a.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]));
    assert.deepEqual([...fills].sort(), ['#000001', '#000002', '#FFFFFF']);
  });
});

describe('stoneMarkers', () => {
  it('gives one marker: three gold steps', () => {
    const m = stoneMarkers();
    assert.equal(m.length, 3);
    for (const s of m) assert.equal(s.fill, MARK.gold);
  });
});

describe('committed output', () => {
  it('matches what gen-stones.mjs would write (run npm run gen:stones)', () => {
    // Exits 1 and names the file when a committed output is stale.
    execFileSync(process.execPath, [path.join(root, 'scripts', 'gen-stones.mjs'), '--check'], {
      stdio: 'pipe',
    });
  });
});
