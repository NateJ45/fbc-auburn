// Unit tests for the one place line (src/lib/place-line.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import { placeLine, townOf } from './place-line.ts';

test('townOf drops the ZIP (and ZIP+4) and keeps the town and state', () => {
  assert.equal(townOf('Hamilton, OH 45013'), 'Hamilton, OH');
  assert.equal(townOf('Hamilton, OH 45013-1234'), 'Hamilton, OH');
  assert.equal(townOf('Hamilton, OH'), 'Hamilton, OH');
  assert.equal(townOf(undefined), '');
});

test('placeLine leads with Auburn, then the town', () => {
  assert.equal(placeLine('Hamilton, OH 45013'), 'Auburn · Hamilton, OH');
  assert.equal(placeLine(''), 'Auburn');
});
