// The one-red-button budget's header rule (src/lib/red-budget.ts, re-audit 2026-10-26).
import test from 'node:test';
import assert from 'node:assert/strict';
import { repeatsHeaderCta } from './red-budget.ts';

const HEADER = { show: true, href: '/plan-your-visit/' };

test('a body button to the header button page repeats it', () => {
  assert.equal(repeatsHeaderCta('/plan-your-visit/', HEADER), true);
  assert.equal(repeatsHeaderCta('/plan-your-visit', HEADER), true, 'slash or not');
  assert.equal(repeatsHeaderCta('/plan-your-visit/#questions', HEADER), true, 'same page');
});

test('another page, a hidden header button or no link is not a repeat', () => {
  assert.equal(repeatsHeaderCta('/contact/?topic=visit', HEADER), false);
  assert.equal(repeatsHeaderCta('/plan-your-visit/', { ...HEADER, show: false }), false);
  assert.equal(repeatsHeaderCta(undefined, HEADER), false);
  assert.equal(repeatsHeaderCta('/', { show: true, href: 'https://give.example.com/' }), false);
});
