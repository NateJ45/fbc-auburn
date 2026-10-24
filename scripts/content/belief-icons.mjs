// What we believe gets its icons back (2026-10-24): the pre-review pass removed the page's one stray
// icon, and round 23 drew eight belief icons in the site palette (src/lib/stone-icons.ts). This
// sets `icon` on each of the nine cards in the page's icon cards section, matched by card title
// (The Bible keeps the existing open Bible). Nothing else changes: titles, text, notes and links are
// untouched, and a card whose title has changed is skipped and reported. A second run finds every
// icon already set and writes nothing.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/belief-icons.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/belief-icons.mjs <backup-folder> --apply
// The current page (and its draft, if any) is written to <backup-folder> first. Keep that folder
// outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const PAGE = 'page-what-we-believe';
const SECTION = 'wwb-cards';
const ICON_BY_TITLE = {
  God: 'crown',
  Jesus: 'cross',
  'The Holy Spirit': 'dove',
  'The Bible': 'bible',
  'People and sin': 'cracked-heart',
  Salvation: 'broken-chain',
  "Baptism and the Lord's Supper": 'cup-and-loaf',
  'The church': 'church',
  'Jesus will return': 'clouds-and-light',
};

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const page = await client.getDocument(PAGE);
if (!page) throw new Error(`No ${PAGE} document; read the dataset first.`);
writeFileSync(join(dir, 'what-we-believe-before-icons.json'), JSON.stringify(page, null, 2));
console.log(`Backed up ${PAGE} to ${join(dir, 'what-we-believe-before-icons.json')}`);
const draft = await client.getDocument(`drafts.${PAGE}`);
if (draft) {
  writeFileSync(
    join(dir, 'what-we-believe-draft-before-icons.json'),
    JSON.stringify(draft, null, 2),
  );
  console.log(
    'A draft exists too; it was backed up and is NOT changed (publish or discard it in the Studio).',
  );
}

const section = (page.pageBuilder ?? []).find((s) => s._key === SECTION);
if (!section) throw new Error(`No section ${SECTION} on ${PAGE}.`);

const sets = {};
console.log('\nCards:');
for (const card of section.cards ?? []) {
  const want = ICON_BY_TITLE[card.title];
  const note = !want
    ? 'title not in the map, skipped'
    : card.icon === want
      ? 'already set'
      : `-> ${want}`;
  console.log(
    `  ${String(card.title).padEnd(32)} ${String(card.icon ?? '(none)').padEnd(18)} ${note}`,
  );
  if (want && card.icon !== want)
    sets[`pageBuilder[_key=="${SECTION}"].cards[_key=="${card._key}"].icon`] = want;
}

const n = Object.keys(sets).length;
if (n === 0) {
  console.log('\nEvery icon is already set; nothing to do.');
  done(0);
} else {
  console.log(`\nSetting ${n} icon(s) on ${PAGE}.\n`);
  await apply(`set ${n} icon(s) on ${PAGE}`, async () => {
    await client.patch(PAGE).set(sets).commit();
  });
  done(n);
}
