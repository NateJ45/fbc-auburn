// The Give swap (visitor audit, 2026-10-18): a menu link to the site's Give page goes to the
// online giving link once one is set (Site settings > Church facts), and nowhere else changes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GIVE_PATH, giveHref } from './give.ts';

test('the Give page link swaps to the online giving link only when one is set', () => {
  assert.equal(giveHref(GIVE_PATH, null), '/give/');
  assert.equal(giveHref(GIVE_PATH, ''), '/give/');
  assert.equal(giveHref(GIVE_PATH, 'http://insecure.example'), '/give/', 'https only');
  assert.equal(giveHref(GIVE_PATH, 'https://give.example.org/fbc'), 'https://give.example.org/fbc');
  assert.equal(giveHref('/contact/', 'https://give.example.org/fbc'), '/contact/');
});
