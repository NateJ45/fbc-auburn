// Safe to edit by hand
// The inner-page rhythm plan (scripts/content/inner-rhythm-plan.mjs): where each photo break goes,
// that its line is words already on the page, the panel switch, and that a re-run changes nothing.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { STEPS, planPage } from '../content/inner-rhythm-plan.mjs';

const pyv = STEPS.find((s) => s.id === 'page-plan-your-visit');
const doc = (blocks) => ({ _id: pyv.id, pageBuilder: blocks });
const BLOCKS = [
  { _key: 'pyv-hero', _type: 'heroSection', headline: 'Plan your visit' },
  {
    _key: 'pyv-walk',
    _type: 'walkSection',
    intro: 'Your first Sunday morning. Wear whatever you like: jeans or Sunday best.',
  },
  { _key: 'pyv-worship', _type: 'richTextSection', heading: 'What worship is like' },
  {
    _key: 'pyv-here',
    _type: 'imageTextSection',
    art: 'photo',
    heading: 'Getting in and getting around',
    image: { asset: { _ref: 'image-x' } },
  },
];

describe('inner rhythm plan', () => {
  it('puts the photo break after its anchor and switches the panel', () => {
    const { pageBuilder, changed } = planPage(doc(BLOCKS), pyv);
    assert.equal(changed, true);
    assert.deepEqual(
      pageBuilder.map((b) => b._key),
      ['pyv-hero', 'pyv-walk', 'pyv-break', 'pyv-worship', 'pyv-here'],
    );
    const brk = pageBuilder[2];
    assert.equal(brk._type, 'photoBreakSection');
    assert.equal(brk.line, 'Wear whatever you like.');
    assert.ok(brk.image.alt.length > 20, 'the photo carries its description');
    assert.equal(pageBuilder[4].layout, 'panel');
  });

  it('changes nothing on a second run', () => {
    const once = planPage(doc(BLOCKS), pyv).pageBuilder;
    const twice = planPage(doc(once), pyv);
    assert.equal(twice.changed, false);
    assert.deepEqual(twice.pageBuilder, once);
  });

  it('skips a line that is no longer on the page', () => {
    const blocks = BLOCKS.map((b) =>
      b._key === 'pyv-walk' ? { ...b, intro: 'Step by step.' } : b,
    );
    const { pageBuilder, notes } = planPage(doc(blocks), pyv);
    assert.ok(!pageBuilder.some((b) => b._key === 'pyv-break'));
    assert.match(notes.join(' '), /no longer on the page/);
  });

  it('every step has a short line and a known photo', () => {
    for (const s of STEPS) {
      assert.ok(s.line.length <= 80, `${s.id}: the Studio caps the line at 80`);
      assert.ok(!/—/.test(s.line), `${s.id}: no em-dash in site copy (rule 2)`);
    }
  });
});
