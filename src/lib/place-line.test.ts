// Unit tests for the one place line (src/lib/place-line.ts, PORTABLE since PORTS.md card 196).
import test from 'node:test';
import assert from 'node:assert/strict';
import { placeLine, townOf } from './place-line.ts';

test('townOf drops the ZIP (and ZIP+4) and keeps the town and state', () => {
  assert.equal(townOf('Hamilton, OH 45013'), 'Hamilton, OH');
  assert.equal(townOf('Hamilton, OH 45013-1234'), 'Hamilton, OH');
  assert.equal(townOf('Hamilton, OH'), 'Hamilton, OH');
  assert.equal(townOf(undefined), '');
});

test('placeLine joins the town and state from the address parts', () => {
  assert.equal(placeLine({ city: 'Hamilton', state: 'OH' }), 'Hamilton, OH');
  assert.equal(placeLine({ city: 'Hamilton' }), 'Hamilton');
  assert.equal(placeLine({}), '');
});
