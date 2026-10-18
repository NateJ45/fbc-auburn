// Tests for mergePageSwitches (src/lib/page-switches.ts): a custom page's "Show in the top menu"
// and "Show in the footer" switches.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergePageSwitches } from './page-switches.ts';

const nav = [
  { kind: 'flat' as const, label: 'About', href: '/about/' },
  { kind: 'flat' as const, label: 'Watch', href: '/watch/' },
];
const footer = [
  { title: 'Visit', links: [{ label: 'About', href: '/about/' }] },
  { title: 'Belong', links: [{ label: 'Watch', href: '/watch/' }] },
];

test('a ticked page joins the end of the menu and the last footer row', () => {
  const out = mergePageSwitches(nav, footer, [
    { title: 'Youth group', slug: 'youth', addToMainNav: true, addToFooter: true },
  ]);
  assert.deepEqual(out.nav.at(-1), { kind: 'flat', label: 'Youth group', href: '/youth/' });
  assert.deepEqual(out.footer[1].links.at(-1), { label: 'Youth group', href: '/youth/' });
  assert.equal(out.footer[0].links.length, 1, 'other rows are untouched');
});

test('the menu label wins over the title, and nothing is listed twice', () => {
  const out = mergePageSwitches(nav, footer, [
    { title: 'A long page title', slug: 'vbs', navLabel: 'VBS', addToMainNav: true },
    { title: 'Watch online', slug: 'watch', addToMainNav: true, addToFooter: true },
  ]);
  assert.deepEqual(
    out.nav.map((i) => (i.kind === 'flat' ? i.label : '')),
    ['About', 'Watch', 'VBS'],
  );
  assert.equal(out.footer[1].links.length, 1, 'Watch is already in the footer');
});

test('switches off, or no pages: nothing changes', () => {
  const out = mergePageSwitches(nav, footer, [{ title: 'Draft', slug: 'draft' }, null]);
  assert.deepEqual(out, { nav, footer });
  assert.deepEqual(mergePageSwitches(nav, footer, null), { nav, footer });
});
