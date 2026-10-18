// Tests for the board E stone generators (scripts/lib/stone-mosaic.mjs) and the committed output
// of scripts/gen-stones.mjs. Run by `npm run test:scripts`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATH_RUNS, mosaicTile, stoneMarkers, stonePath } from './stone-mosaic.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ALL_PATH_FILLS = new Set(PATH_RUNS.flatMap((r) => r.set));

describe('stonePath', () => {
  it('is deterministic for a seed', () => {
    const opts = { width: 390, height: 180, preset: 'phone', seed: 11 };
    assert.deepEqual(stonePath(opts), stonePath(opts));
  });

  it('lays a path of a sensible size in story order', () => {
    const stones = stonePath({ width: 390, height: 180, preset: 'phone', seed: 11 });
    assert.ok(stones.length >= 20 && stones.length <= 60, `got ${stones.length}`);
    for (const s of stones) {
      assert.match(s.d, /^M[-\d. L]+Z$/);
      assert.ok(ALL_PATH_FILLS.has(s.fill), s.fill);
    }
    // Water first, the cross last.
    assert.ok(PATH_RUNS[0].set.includes(stones[0].fill));
    assert.ok(PATH_RUNS[3].set.includes(stones.at(-1).fill));
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
  it('gives four markers of three stones', () => {
    const m = stoneMarkers(21);
    assert.equal(m.length, 4);
    for (const ds of m) assert.equal(ds.length, 3);
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
