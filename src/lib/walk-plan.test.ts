// Safe to edit by hand
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWalkPlan, VIEWBOX } from './walk-plan.ts';

test('five stops give five markers and four laid legs', () => {
  const plan = buildWalkPlan(5);
  assert.equal(plan.stops.length, 5);
  const legs = new Set(plan.stones.map((s) => s.leg));
  assert.deepEqual([...legs].sort(), [2, 3, 4, 5]);
  for (const leg of legs) assert.ok(plan.stones.filter((s) => s.leg === leg).length >= 1);
});

test('the plan never shows a stop the list does not describe', () => {
  const plan = buildWalkPlan(3);
  assert.equal(plan.stops.length, 3);
  assert.ok(plan.stones.every((s) => s.leg <= 3));
  assert.equal(buildWalkPlan(9).stops.length, 5, 'capped at the drawing’s five stops');
  assert.equal(buildWalkPlan(0).stones.length, 0);
});

test('the mosaic is the same on every build', () => {
  assert.deepEqual(buildWalkPlan(5), buildWalkPlan(5));
});

test('every tile and stop sits inside the drawing', () => {
  const plan = buildWalkPlan(5);
  for (const room of plan.rooms) {
    assert.ok(room.tiles.length > 0, `${room.kind} has tiles`);
    for (const t of room.tiles) {
      assert.ok(t.x >= 0 && t.y >= 0 && t.x + t.w <= VIEWBOX.w && t.y + t.h <= VIEWBOX.h);
    }
  }
  for (const s of plan.stops) assert.ok(s.x > 0 && s.x < VIEWBOX.w && s.y > 0 && s.y < VIEWBOX.h);
});
