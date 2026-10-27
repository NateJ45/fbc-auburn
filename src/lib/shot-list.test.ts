// The shot list (src/data/shot-list.ts): which picture slots show a "Photo needed" box before launch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isStandInPhoto, shotFor, shotsForPage, journalCoverShot } from '../data/shot-list.ts';

const facebook = { asset: { originalFilename: 'fbca-fb-70.jpg' } };
const unsplash = { asset: { originalFilename: 'x.jpg', source: { name: 'unsplash' } } };
const standIn = { asset: { originalFilename: 'stand-in-hero.jpg' } };
const own = { asset: { originalFilename: 'IMG_2041.jpg' } };

test('stand-ins are the Facebook, Unsplash and stand-in- uploads only', () => {
  assert.equal(isStandInPhoto(facebook), true);
  assert.equal(isStandInPhoto(unsplash), true);
  assert.equal(isStandInPhoto(standIn), true);
  assert.equal(isStandInPhoto(own), false);
  assert.equal(isStandInPhoto(null), false);
  assert.equal(isStandInPhoto({}), false);
});

test('a listed slot asks for its shot while empty or a stand-in, and yields to a real photo', () => {
  assert.ok(shotFor('/', 'A place to belong', 0, facebook));
  assert.ok(shotFor('/', 'A place to belong', 2, null));
  assert.equal(shotFor('/', 'A place to belong', 0, own), null);
  assert.ok(shotFor('/leadership', 'Jacob Wysong', 0, undefined), 'path without a trailing slash');
});

test('the draft preview finds the same shots as the live page (2026-10-26)', () => {
  // A heading in the preview carries a stega run of zero-width characters.
  const zw = (...codes: number[]) => String.fromCharCode(...codes);
  const stega =
    'A place to belong' +
    zw(0x200b, 0x200b, 0x200b, 0x200b) +
    zw(0x200c, 0x200d, 0xfeff, 0x200b).repeat(6);
  assert.deepEqual(
    shotFor('/preview/', stega, 0, facebook),
    shotFor('/', 'A place to belong', 0, facebook),
  );
  assert.ok(shotFor('/preview/leadership/', 'Jacob Wysong', 0, undefined));
  assert.deepEqual(shotsForPage('/preview/'), shotsForPage('/'));
  assert.ok(shotsForPage('/preview/').length > 0);
});

test('an unlisted slot, heading or index asks for nothing', () => {
  assert.equal(shotFor('/', 'Some new block', 0, facebook), null);
  assert.equal(shotFor('/', undefined, 0, facebook), null);
  assert.equal(shotFor('/', 'A place to belong', 9, facebook), null);
});

test('Home lists the hero, the three Who we are photos, Last Sunday and Meet Pastor Jacob', () => {
  assert.equal(shotsForPage('/').length, 6);
  assert.equal(shotsForPage('/no-such-page/').length, 0);
});

test('a post cover asks only while it is a stand-in; an empty cover stays empty', () => {
  assert.ok(journalCoverShot(facebook));
  assert.equal(journalCoverShot(own), null);
  assert.equal(journalCoverShot(null), null);
});

test('no em-dashes in what visitors and Jacob read', () => {
  for (const s of [
    '/',
    '/about/',
    '/plan-your-visit/',
    '/ministries/',
    '/what-we-believe/',
    '/leadership/',
  ].flatMap(shotsForPage)) {
    assert.ok(!/\u2014/.test(s.title + s.detail), s.title);
  }
});
