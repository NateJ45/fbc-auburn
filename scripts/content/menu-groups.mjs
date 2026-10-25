// Menu groups (2026-10-24): the menu had grown to thirteen links of equal weight, so it becomes
// three labelled groups and two pages fold into others.
//
//   New here        About, What we believe, Leadership
//   Get involved    Ministries, Next steps, Events
//   Stay connected  Sermons, News and notes, Give, Contact
//
// - Watch folds into Sermons: /sermons/ now opens with the Watch band (code), the Watch page is
//   archived (not built, kept in the Studio), and /watch/ forwards to /sermons/ (astro.config.mjs).
// - Questions folds into Plan your visit: two "Questions (open and close)" sections go in above the
//   closing band (your first Sunday, then about the church), and /faq/ forwards to the first one.
// - Prayer requests leaves the menu; it stays in the footer, and Contact's "When life happens"
//   gains a card that links to it.
// - The footer drops Watch and Questions (both pages are gone); nothing else in it moves.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/menu-groups.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/menu-groups.mjs <backup-folder> --apply
// Every document it changes is written to <backup-folder>/menu-groups-before.json first. Keep that
// folder outside the repo. Safe to run twice: each step checks whether it is already done.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const ids = ['siteSettings', 'page-watch', 'page-plan-your-visit', 'contactPage'];
const docs = Object.fromEntries(
  await Promise.all(ids.map(async (id) => [id, await client.getDocument(id)])),
);
for (const id of ids) if (!docs[id]) throw new Error(`No ${id}; read the dataset first.`);
// An unpublished draft would put the old menu or page back the next time someone publishes it.
const drafts = await client.fetch('*[_id in $ids]._id', { ids: ids.map((id) => `drafts.${id}`) });
if (drafts.length)
  throw new Error(
    `Unpublished drafts exist (${drafts.join(', ')}); publish or discard them first.`,
  );
writeFileSync(join(dir, 'menu-groups-before.json'), JSON.stringify(docs, null, 2));
console.log(`Backed up ${ids.join(', ')} to ${join(dir, 'menu-groups-before.json')}`);

// ── 1. The menu ────────────────────────────────────────────────────────────────────────────
const settings = docs.siteSettings;
const byKey = {};
for (const item of settings.navItems ?? []) {
  if (item._type === 'navLink') byKey[item._key] = item;
  for (const l of item.links ?? []) byKey[l._key] = l;
}
const pick = (k) => {
  if (!byKey[k]) throw new Error(`The menu has no ${k}; read siteSettings.navItems first.`);
  return byKey[k];
};
const group = (key, label, keys) => ({
  _key: key,
  _type: 'navGroup',
  label,
  links: keys.map(pick),
});
const navItems = [
  group('g-new', 'New here', ['n-about', 'n-believe', 'n-leadership']),
  group('g-involved', 'Get involved', ['n-ministries', 'n-next', 'n-events']),
  group('g-connected', 'Stay connected', ['n-sermons', 'n-news', 'n-give', 'n-contact']),
];
console.log('\nNew menu:');
for (const g of navItems) console.log(`  ${g.label}: ${g.links.map((l) => l.label).join(', ')}`);

// ── 2. The footer: drop Watch and Questions ────────────────────────────────────────────────
const gone = new Set(['fb-watch', 'fb3']);
const footerColumns = (settings.footerColumns ?? []).map((col) => ({
  ...col,
  links: (col.links ?? []).filter((l) => !gone.has(l._key)),
}));
const dropped = (settings.footerColumns ?? [])
  .flatMap((c) => c.links ?? [])
  .filter((l) => gone.has(l._key))
  .map((l) => l.label);
console.log(`\nFooter drops: ${dropped.join(', ') || '(already gone)'}`);

// ── 3. Plan your visit: the questions, above the closing band ──────────────────────────────
const pyv = docs['page-plan-your-visit'];
const hasFaq = (pyv.pageBuilder ?? []).some((b) => b._type === 'faqSection');
const faq = (key, headline, subhead, items) => ({
  _key: key,
  _type: 'faqSection',
  headline,
  subhead,
  items: items.map((id) => ({ _key: id, ...ref(id) })),
});
const faqBlocks = [
  faq('pyv-faq', 'Questions people ask', 'Before a first Sunday, and once you are here.', [
    'faq-where-do-i-go',
    'faq-how-long',
    'faq-sunday-school',
    'faq-what-to-wear',
    'faq-parking',
    'faq-children',
    'faq-watch-online',
  ]),
  faq('pyv-faq-church', 'About the church', undefined, [
    'faq-what-kind',
    'faq-communion',
    'faq-baptism',
    'faq-get-involved',
  ]),
];
const blocks = pyv.pageBuilder ?? [];
const ctaAt = blocks.findIndex((b) => b._type === 'ctaBandSection');
const pageBuilder = hasFaq
  ? blocks
  : [
      ...blocks.slice(0, ctaAt < 0 ? blocks.length : ctaAt),
      ...faqBlocks,
      ...blocks.slice(ctaAt < 0 ? blocks.length : ctaAt),
    ];
console.log(
  `\nPlan your visit: ${hasFaq ? 'already has its questions' : 'adds two Questions sections'}`,
);
console.log(`  ${pageBuilder.map((b) => b._key).join(' > ')}`);

// ── 4. Contact: a card for prayer in "When life happens" ───────────────────────────────────
const contact = docs.contactPage;
const careAt = (contact.additionalSections ?? []).findIndex((s) => s._key === 'ct-care');
if (careAt < 0) throw new Error('Contact has no ct-care section; read contactPage first.');
const care = contact.additionalSections[careAt];
const hasPrayer = (care.cards ?? []).some((c) => c._key === 'care-prayer');
const prayerCard = {
  _key: 'care-prayer',
  _type: 'iconCard',
  title: 'Something to pray about',
  body: 'Send a prayer request, big or small. The pastor and the prayer team will pray for you.',
  link: {
    _type: 'ctaBlock',
    label: 'Send a prayer request',
    linkType: 'internal',
    internalLink: ref('page-prayer'),
  },
};
console.log(`\nContact: ${hasPrayer ? 'already has the prayer card' : 'adds the prayer card'}`);

// ── 5. Watch: archived ─────────────────────────────────────────────────────────────────────
const watchArchived = docs['page-watch'].archived === true;
console.log(
  `\nWatch page: ${watchArchived ? 'already archived' : 'archived (not built; /watch/ forwards to /sermons/)'}\n`,
);

await apply('set siteSettings.navItems and footerColumns', async () => {
  await client.patch('siteSettings').set({ navItems, footerColumns }).commit();
});
if (!hasFaq) {
  await apply('add the questions to Plan your visit', async () => {
    await client.patch('page-plan-your-visit').set({ pageBuilder }).commit();
  });
}
if (!hasPrayer) {
  await apply('add the prayer card to Contact', async () => {
    await client
      .patch('contactPage')
      .insert('after', `additionalSections[_key=="ct-care"].cards[-1]`, [prayerCard])
      .commit();
  });
}
if (!watchArchived) {
  await apply('archive the Watch page', async () => {
    await client.patch('page-watch').set({ archived: true }).commit();
  });
}
done(4);
