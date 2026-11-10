// The Find your place filter chips (fyp-filter.ts): which chips show, and a card's tags.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cardTags, countLine, fypChips } from './fyp-filter.ts';

test('no tags anywhere means no chips', () => {
  assert.deepEqual(fypChips([{ cards: [{}, { audience: [] }] }, { cards: null }]), []);
});

test('a chip shows only for a tag some card carries, in the fixed order', () => {
  const chips = fypChips([
    { cards: [{ when: ['weeknight'] }, { audience: ['families'] }] },
    { cards: [{ audience: ['kids'], when: ['sunday'] }] },
  ]);
  assert.deepEqual(
    chips.map((c) => c.value),
    ['kids', 'families', 'sunday', 'weeknight'],
  );
});

test('cardTags cleans preview markers, drops unknown values and repeats', () => {
  // A stega-style invisible run on the end of a value (the preview), and a retired value.
  assert.deepEqual(cardTags({ audience: ['kids​‌', 'kids', 'pets', null] }), ['kids']);
  assert.deepEqual(cardTags({ audience: ['adults'], when: ['sunday'] }), ['adults', 'sunday']);
});

test('countLine', () => {
  assert.equal(countLine(1), '1 ministry');
  assert.equal(countLine(0), '0 ministries');
  assert.equal(countLine(5), '5 ministries');
});
