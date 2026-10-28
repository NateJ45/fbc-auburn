// The builder-pages migration plan (2026-10-26): every array object carries _type and _key
// (rule 16's seeding rule), the old content lands where the page drew it, and no visitor text
// carries an em-dash (rule 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plans, newPages } from './builder-pages-plan.mjs';

const LIVE = {
  contactPage: {
    heroEyebrow: 'Get in touch',
    heroHeadline: 'Contact us',
    heroSubhead: 'Ask a question.',
    additionalSections: [{ _type: 'iconCardsSection', _key: 'ct-care' }],
  },
  privacyPage: { heroHeadline: 'Privacy policy', lastUpdated: '2026-10-18', body: [] },
  journalPage: { finalCtaHeadline: 'Come Sunday.', finalCta: { _type: 'ctaBlock' } },
  sermonsPage: { heroHeadline: 'Sermons' },
};

function walk(value, path, seen) {
  if (Array.isArray(value)) {
    const keys = new Set();
    for (const [i, item] of value.entries()) {
      if (item && typeof item === 'object') {
        assert.ok(item._type, `${path}[${i}] has no _type`);
        assert.ok(item._key, `${path}[${i}] has no _key`);
        assert.ok(!keys.has(item._key), `${path} repeats _key ${item._key}`);
        keys.add(item._key);
      }
      walk(item, `${path}[${i}]`, seen);
    }
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, seen);
  } else if (typeof value === 'string') {
    assert.ok(!value.includes('—'), `${path}: em-dash in "${value}"`);
  }
}

test('every planned section array is well formed', () => {
  for (const [id, plan] of Object.entries(plans)) walk(plan(LIVE[id]), id, null);
  for (const page of newPages) walk(page.pageBuilder, page._id, null);
});

test('the old content lands where each page drew it', () => {
  const contact = plans.contactPage(LIVE.contactPage);
  assert.deepEqual(
    contact.map((s) => s._type),
    ['heroSection', 'contactFormSection', 'iconCardsSection'],
  );
  assert.equal(contact[0].subhead, 'Ask a question.');
  const journal = plans.journalPage(LIVE.journalPage);
  assert.equal(journal.at(-1)._type, 'ctaBandSection');
  assert.equal(journal.at(-1).headline, 'Come Sunday.');
  const privacy = plans.privacyPage(LIVE.privacyPage);
  assert.equal(privacy[1].lastUpdated, '2026-10-18');
  // The Watch band keeps its anchor (src/lib/church-anchors.ts).
  assert.ok(plans.sermonsPage(LIVE.sermonsPage).some((s) => s._key === 'sermons-watch'));
  assert.deepEqual(
    newPages.map((p) => p.slug.current),
    ['give', 'bulletin'],
  );
});
