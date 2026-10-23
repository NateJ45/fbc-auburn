// Safe to edit by hand
// Unit tests for the brick letterforms generator (scripts/lib/brick-letters.mjs, 2026-10-21):
// deterministic, only its own colours, a sane viewBox, a unique clip id per distinct call, and
// the shape of each treatment (A clips a field to the glyphs; B cuts the glyphs out of a wall).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LETTER_TONES,
  brickWord,
  shade,
  wallWord,
  wordWidth,
} from '../../scripts/lib/brick-letters.mjs';

const fills = (svg: string) => [...svg.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
const clipId = (svg: string) => svg.match(/<clipPath id="([^"]+)"/)?.[1];
const viewBox = (svg: string) => (svg.match(/viewBox="([^"]+)"/)?.[1] ?? '').split(' ').map(Number);

test('brickWord is deterministic for the same inputs and differs by seed', () => {
  assert.equal(brickWord('Auburn'), brickWord('Auburn'));
  assert.notEqual(brickWord('Auburn', { seed: 3 }), brickWord('Auburn', { seed: 4 }));
});

test('wallWord is deterministic for the same inputs and differs by seed', () => {
  assert.equal(wallWord('Off the path'), wallWord('Off the path'));
  assert.notEqual(wallWord('Mark', { seed: 1 }), wallWord('Mark', { seed: 2 }));
});

test('brickWord uses only the given tones, their shades and the accent tones', () => {
  const tones = LETTER_TONES.navy;
  const accent = { letters: [2], tones: LETTER_TONES.auburn };
  const allowed = new Set(
    [...tones, ...accent.tones].flatMap((c: string) => [c.toLowerCase(), shade(c).toLowerCase()]),
  );
  const used = fills(brickWord('Auburn', { tones, accent })).map((c) => c.toLowerCase());
  assert.ok(used.length > 0);
  for (const c of used) assert.ok(allowed.has(c), `unexpected colour ${c}`);
  // Both sets really appear: the accent letter is not swallowed.
  assert.ok(used.some((c) => accent.tones.map((t: string) => t.toLowerCase()).includes(c)));
  assert.ok(used.some((c) => tones.map((t: string) => t.toLowerCase()).includes(c)));
});

test('wallWord uses only the given tones, their shades and the letter colour', () => {
  const tones = LETTER_TONES.paleNavy;
  const allowed = new Set([
    '#fbf8f3',
    ...tones.flatMap((c: string) => [c.toLowerCase(), shade(c).toLowerCase()]),
  ]);
  for (const c of fills(wallWord('Mark', { tones, letter: '#FBF8F3' })))
    assert.ok(allowed.has(c.toLowerCase()), `unexpected colour ${c}`);
});

test('the viewBox is sane: positive size, baseline inside, the word wider than tall', () => {
  const [x, y, w, h] = viewBox(brickWord('Auburn', { size: 200 }));
  assert.equal(x, 0);
  assert.ok(y < 0 && y + h > 0, 'the baseline (y = 0) sits inside the box');
  assert.ok(w > h && h > 100 && h < 400, `box ${w} x ${h}`);
  assert.ok(Math.abs(w - wordWidth('Auburn', 200)) < 0.2);
  const [bx, , bw, bh] = viewBox(wallWord('Auburn', { size: 200 }));
  assert.ok(bx < 0 && bw > w && bh > h, 'the wall is a margin larger than the word');
});

test('em sizing follows the font-size; px sizing is plain attributes', () => {
  const em = brickWord('Auburn', { size: 200 });
  assert.match(em, /style="width:[\d.]+em;height:[\d.]+em;vertical-align:-[\d.]+em"/);
  const px = brickWord('Auburn', { size: 184, unit: 'px' });
  assert.match(px, /width="[\d.]+" height="[\d.]+"/);
  assert.doesNotMatch(px, /style=/);
});

test('clip ids are stable for a call and unique across different calls', () => {
  const a = clipId(brickWord('Auburn'));
  assert.ok(a && /^bl[a-z0-9]+$/.test(a));
  assert.equal(a, clipId(brickWord('Auburn')));
  const others = [
    brickWord('Auburn', { seed: 9 }),
    brickWord('Sermons'),
    brickWord('Auburn', { size: 100 }),
    wallWord('Auburn'),
  ].map(clipId);
  assert.equal(new Set([a, ...others]).size, 5);
  // the id is referenced by the group that uses it
  assert.ok(brickWord('Auburn').includes(`url(#${a})`));
});

test('the course height is a fixed fraction of the size', () => {
  // Same word at two sizes: the same number of bricks, since the brick scales with the letters.
  const count = (s: string) => (s.match(/h[\d.]+v[\d.]+h-[\d.]+z/g) ?? []).length;
  const small = count(brickWord('Auburn', { size: 96 }));
  const large = count(brickWord('Auburn', { size: 420 }));
  assert.ok(Math.abs(small - large) <= small * 0.05, `${small} vs ${large}`);
});

test('wallWord clips with an even-odd rule so the glyphs are holes', () => {
  const svg = wallWord('Mark');
  assert.match(svg, /<clipPath id="[^"]+"><path clip-rule="evenodd"/);
});

test('empty and space-only text give no SVG; kerning narrows "Av"', () => {
  assert.equal(brickWord(''), '');
  assert.equal(brickWord('   '), '');
  assert.equal(wallWord(''), '');
  assert.ok(wordWidth('Av', 100, 0) < wordWidth('A', 100, 0) + wordWidth('v', 100, 0));
});

test('no NaN and no stray undefined in the output', () => {
  for (const s of [brickWord('Auburn, Ohio'), wallWord('Off the path')]) {
    assert.doesNotMatch(s, /NaN|undefined/);
  }
});
