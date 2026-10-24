// The Church systems link tokens (src/lib/church-links.ts): what each fills to, what a blank box
// falls back to, and the Studio's check.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHURCH_LINKS,
  checkLinkBox,
  churchTracFormFor,
  fillLink,
  fillLinkTokens,
  linkTokenOf,
  linkValues,
  type LinkValues,
} from './church-links.ts';

const EMPTY = linkValues({
  givingUrl: null,
  connectCardUrl: null,
  contactFormUrl: null,
  prayerFormUrl: null,
  calendarPageUrl: null,
  memberLoginUrl: null,
  liveUrl: null,
});
const FULL: LinkValues = linkValues({
  givingUrl: 'https://x.churchtrac.com/give',
  connectCardUrl: 'https://x.churchtrac.com/connectcard',
  contactFormUrl: null,
  prayerFormUrl: 'https://x.churchtrac.com/prayer',
  calendarPageUrl: 'https://www.churchtrac.com/public_calendar?ui=ABC',
  memberLoginUrl: 'https://x.churchtrac.com/portal',
  liveUrl: 'https://www.facebook.com/x/live',
});

test('a token is recognised only as a whole value, any case, with space around it', () => {
  assert.equal(linkTokenOf('{giving}'), '{giving}');
  assert.equal(linkTokenOf('  {Connect} '), '{connect}');
  assert.equal(linkTokenOf('Give at {giving}'), null);
  assert.equal(linkTokenOf('{nope}'), null);
  assert.equal(linkTokenOf(undefined), null);
});

test('a filled box gives its address; the contact form falls back to the connection card', () => {
  assert.equal(fillLink('{giving}', FULL), 'https://x.churchtrac.com/give');
  assert.equal(fillLink('{contact-form}', FULL), 'https://x.churchtrac.com/connectcard');
  assert.equal(fillLink('{calendar}', FULL), 'https://www.churchtrac.com/public_calendar?ui=ABC');
  assert.equal(fillLink('{watch}', FULL), 'https://www.facebook.com/x/live');
});

test('a blank box falls back to the site’s own page and warns', () => {
  const warned: string[] = [];
  const fallbacks = CHURCH_LINKS.map((l) => fillLink(l.token, EMPTY, (t) => warned.push(t)));
  assert.deepEqual(fallbacks, [
    '/give/',
    '/contact/',
    '/contact/',
    '/prayer/',
    '/events/',
    '/contact/',
    '/watch/',
  ]);
  assert.equal(warned.length, CHURCH_LINKS.length);
});

test('the visit links go to the connection card only once it is set', () => {
  assert.equal(fillLink('/contact/?visit=sunday-11', FULL), 'https://x.churchtrac.com/connectcard');
  assert.equal(fillLink('/contact?visit=sunday-11', FULL), 'https://x.churchtrac.com/connectcard');
  assert.equal(fillLink('/contact/?visit=sunday-11', EMPTY), '/contact/?visit=sunday-11');
  assert.equal(fillLink('/contact/', FULL), '/contact/');
});

test('the fill walks a document and leaves untouched parts as the same objects', () => {
  const doc = {
    title: 'Give',
    untouched: { a: 1, b: ['x'] },
    sections: [{ cta: { externalUrl: '{giving}' } }, { cta: { externalUrl: 'https://a.example' } }],
  };
  const out = fillLinkTokens(doc, FULL);
  assert.equal(out.sections[0].cta.externalUrl, 'https://x.churchtrac.com/give');
  assert.equal(out.sections[1], doc.sections[1]);
  assert.equal(out.untouched, doc.untouched);
  assert.equal(doc.sections[0].cta.externalUrl, '{giving}', 'the input is not changed');
  const plain = { a: 'no tokens here' };
  assert.equal(fillLinkTokens(plain, FULL), plain);
  assert.equal(fillLinkTokens(null, FULL), null);
});

test('the Studio check: known tokens pass, unknown ones and relative paths in absolute boxes do not', () => {
  assert.equal(checkLinkBox('{prayer}'), true);
  assert.equal(checkLinkBox('/contact/'), true);
  assert.equal(checkLinkBox(''), true);
  assert.match(String(checkLinkBox('{givng}')), /Unknown link placeholder/);
  assert.match(String(checkLinkBox('/contact/', true)), /full address/);
  assert.equal(checkLinkBox('{giving}', true), true);
});

test('which Church Trac form replaces the site’s own: contact form, else connection card; prayer form', () => {
  const none = { contactFormUrl: null, connectCardUrl: null, prayerFormUrl: null };
  assert.equal(churchTracFormFor('contact', none), null);
  assert.equal(churchTracFormFor('prayer', none), null);
  const card = { ...none, connectCardUrl: 'https://x.churchtrac.com/connectcard' };
  assert.equal(churchTracFormFor('contact', card), 'https://x.churchtrac.com/connectcard');
  assert.equal(churchTracFormFor('prayer', card), null, 'the card never stands in for prayer');
  const both = { ...card, contactFormUrl: 'https://x.churchtrac.com/form/contact' };
  assert.equal(churchTracFormFor('contact', both), 'https://x.churchtrac.com/form/contact');
  assert.equal(
    churchTracFormFor('prayer', { ...none, prayerFormUrl: 'https://x.churchtrac.com/pray' }),
    'https://x.churchtrac.com/pray',
  );
});
