// Safe to edit by hand
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { walkStopIcon } from './walk-stops.ts';

test('each of the usual five stops gets its own stone', () => {
  const stops = [
    'Park in the lot',
    'Someone meets you at the door',
    'Coffee in the fellowship hall',
    'Kids check in, if you like',
    'Worship in the sanctuary',
  ];
  assert.deepEqual(
    stops.map((title, i) => walkStopIcon({ title }, i)),
    ['map-pin', 'praying-hands', 'coffee', 'blocks', 'bible'],
  );
});

test('the title decides before the text', () => {
  assert.equal(walkStopIcon({ title: 'Kids check in', body: 'Then head to worship' }, 0), 'blocks');
});

test('a stop with unknown words takes its place in the usual order', () => {
  assert.equal(walkStopIcon({ title: 'Say hi' }, 2), 'coffee');
  assert.equal(walkStopIcon({ title: 'Something else' }, 7), 'coffee');
});
