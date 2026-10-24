// The laying order for the sill and the section markers (src/lib/brick-lay.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layOrder } from './brick-lay.ts';
import { MARKER, SILL } from '../components/home/stones.generated.ts';

test('a face and its rim share a turn, and the bottom course goes first', () => {
  const t = layOrder([
    { d: 'M0 30h10' }, // bottom course, first brick
    { d: 'M1 29h10' }, // its rim
    { d: 'M40 31h10' }, // bottom course, second brick
    { d: 'M0 2h10' }, // top course, left
    { d: 'M40 1h10' }, // top course, right: laid first on the way back
  ]);
  assert.deepEqual(t, [0, 0, 1, 3, 2]);
});

test('the sill is laid left to right, then back along the top course', () => {
  const t = layOrder(SILL);
  const turns = new Set(t);
  assert.ok(turns.size >= 30 && turns.size <= SILL.length, `${turns.size} turns`);
  assert.equal(Math.min(...t), 0);
});

test('the marker is laid bottom step first', () => {
  const t = layOrder(MARKER);
  const y = (d: string) => Number(/M\s*[\d.]+\s+([\d.]+)/.exec(d)![1]);
  const first = MARKER.filter((_, i) => t[i] === 0).map((m) => y(m.d));
  const last = MARKER.filter((_, i) => t[i] === Math.max(...t)).map((m) => y(m.d));
  assert.ok(Math.min(...first) > Math.max(...last));
  assert.equal(new Set(t).size, 3);
});
