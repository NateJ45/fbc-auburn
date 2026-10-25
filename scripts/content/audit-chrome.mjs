// Site audit, chrome (2026-10-25): the menu, the footer's page list and the TikTok label.
//
// The menu (UX audit M2, the pastor's note 7): Plan your visit becomes the first item in New here,
// Prayer requests and the Bulletin join the menu (neither was in it; nothing linked the Bulletin),
// and "Stay connected" becomes "This week", the members' door: Sermons, Events, Bulletin, Prayer
// requests, Give. News and notes moves to Get involved and Contact to New here, so each group stays
// short and labelled:
//
//   New here       Plan your visit, About, What we believe, Leadership, Contact
//   Get involved   Ministries, Next steps, News and notes
//   This week      Sermons, Events, Bulletin, Prayer requests, Give
//
// The footer's page list takes the same three groups under the same names (it had "Visit" and
// "Belong", with no Give and no Bulletin), so every destination has one name everywhere.
//
// The TikTok account in the footer is Pastor Jacob's own (the pastor's note 15): its button is
// labelled "Pastor Jacob on TikTok" so it reads as his, not the church speaking. Whether it stays
// in the footer is the church's call (asked in src/data/for-jacob.ts).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/audit-chrome.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/audit-chrome.mjs <backup-folder> --apply
// The siteSettings document is written to <backup-folder>/audit-chrome-before.json first. Keep that
// folder outside the repo. Safe to run twice: it writes only what differs.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const settings = await client.getDocument('siteSettings');
if (!settings?.navItems?.length) throw new Error('siteSettings has no navItems; read it first.');
// An unpublished draft would put the old menu back the next time someone publishes it.
const draft = await client.getDocument('drafts.siteSettings');
if (draft) throw new Error('siteSettings has an unpublished draft; publish or discard it first.');
writeFileSync(join(dir, 'audit-chrome-before.json'), JSON.stringify(settings, null, 2));
console.log(`Backed up siteSettings to ${join(dir, 'audit-chrome-before.json')}`);

// ── 1. The menu ────────────────────────────────────────────────────────────────────────────
const byKey = {};
for (const item of settings.navItems) {
  if (item._type === 'navLink') byKey[item._key] = item;
  for (const l of item.links ?? []) byKey[l._key] = l;
}
// The two pages the menu never had, made the way the menu's other links are.
byKey['n-visit'] ??= {
  _key: 'n-visit',
  _type: 'navLink',
  label: 'Plan your visit',
  linkType: 'internal',
  internalPage: ref('page-plan-your-visit'),
};
byKey['n-prayer'] ??= {
  _key: 'n-prayer',
  _type: 'navLink',
  label: 'Prayer requests',
  linkType: 'internal',
  internalPage: ref('page-prayer'),
};
// "Need the pastor?" (/pastoral-care/) is made by audit-pages.mjs; it sits beside Prayer requests
// once that page exists, so run audit-pages.mjs first.
const hasCare = Boolean(await client.fetch(`count(*[_id == "page-pastoral-care"])`));
if (hasCare)
  byKey['n-care'] ??= {
    _key: 'n-care',
    _type: 'navLink',
    label: 'Need the pastor?',
    linkType: 'internal',
    internalPage: ref('page-pastoral-care'),
  };
else
  console.log('page-pastoral-care does not exist yet: Need the pastor? is left out of the menu.');
const care = hasCare ? ['n-care'] : [];
// The Bulletin is a site route (/bulletin/, the newest bulletin), linked like Sermons and Give.
byKey['n-bulletin'] ??= {
  _key: 'n-bulletin',
  _type: 'navLink',
  label: 'Bulletin',
  href: '/bulletin/',
};
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
  group('g-new', 'New here', ['n-visit', 'n-about', 'n-believe', 'n-leadership', 'n-contact']),
  group('g-involved', 'Get involved', ['n-ministries', 'n-next', 'n-news']),
  group('g-connected', 'This week', [
    'n-sermons',
    'n-events',
    'n-bulletin',
    'n-prayer',
    ...care,
    'n-give',
  ]),
];

// ── 2. The footer's page list: the same groups and names ───────────────────────────────────
// Each footer link keeps its own _key where it already exists (fv1 is Plan your visit, and so
// on), so only Give and the Bulletin are new.
const footerByTarget = {};
for (const col of settings.footerColumns ?? []) {
  for (const l of col.links ?? []) footerByTarget[l.internalPage?._ref ?? l.href ?? l._key] = l;
}
const footerLink = (navKey, newKey) => {
  const n = pick(navKey);
  const target = n.internalPage?._ref ?? n.href;
  const have = footerByTarget[target];
  const { _key, ...rest } = n;
  return { ...rest, _key: have?._key ?? newKey, label: n.label };
};
const column = (key, title, links) => ({ _key: key, _type: 'footerColumn', title, links });
const columnType = settings.footerColumns?.[0]?._type ?? 'footerColumn';
const footerColumns = [
  column('f-visit', 'New here', [
    footerLink('n-visit', 'fv1'),
    footerLink('n-about', 'fv2'),
    footerLink('n-believe', 'fv3'),
    footerLink('n-leadership', 'fv4'),
    footerLink('n-contact', 'fc1'),
  ]),
  column('f-belong', 'Get involved', [
    footerLink('n-ministries', 'fb1'),
    footerLink('n-next', 'fv-next'),
    footerLink('n-news', 'fb2'),
  ]),
  column('f-week', 'This week', [
    footerLink('n-sermons', 'fb-sermons'),
    footerLink('n-events', 'fb-events'),
    footerLink('n-bulletin', 'fw-bulletin'),
    footerLink('n-prayer', 'fb-prayer'),
    ...care.map((k) => footerLink(k, 'fw-care')),
    footerLink('n-give', 'fw-give'),
  ]),
].map((c) => ({ ...c, _type: columnType }));

// ── 3. The TikTok button: Pastor Jacob's own account ───────────────────────────────────────
const TIKTOK_LABEL = 'Pastor Jacob on TikTok';
const socialLinks = (settings.socialLinks ?? []).map((l) =>
  l.platform === 'TikTok' ? { ...l, label: TIKTOK_LABEL } : l,
);

// ── Report and write ───────────────────────────────────────────────────────────────────────
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const show = (cols, name) => {
  console.log(`\n${name}:`);
  for (const g of cols)
    console.log(`  ${(g.label ?? g.title).padEnd(13)} ${g.links.map((l) => l.label).join(', ')}`);
};
show(
  settings.navItems.filter((n) => n.links),
  'Menu now',
);
show(navItems, 'Menu after');
show(settings.footerColumns ?? [], 'Footer now');
show(footerColumns, 'Footer after');
const tiktok = (settings.socialLinks ?? []).find((l) => l.platform === 'TikTok');
console.log(
  `\nTikTok button: ${tiktok ? `"${tiktok.label ?? tiktok.platform}" -> "${TIKTOK_LABEL}"` : '(no TikTok link)'}\n`,
);

const patch = {};
if (!same(settings.navItems, navItems)) patch.navItems = navItems;
if (!same(settings.footerColumns, footerColumns)) patch.footerColumns = footerColumns;
if (!same(settings.socialLinks, socialLinks)) patch.socialLinks = socialLinks;
if (Object.keys(patch).length === 0) {
  console.log('Nothing to change: already applied.');
  done(0);
} else {
  await apply(`set siteSettings ${Object.keys(patch).join(', ')}`, async () => {
    await client.patch('siteSettings').set(patch).commit();
  });
  done(1);
}
