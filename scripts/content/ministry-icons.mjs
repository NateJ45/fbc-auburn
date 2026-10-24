// Ministries gets its own icons (2026-10-24): Youth, Fellowship and Greeters all wore the coffee
// cup, Sunday School the clock and Workdays and grounds the map pin. Round 24 drew seven new stone
// icons (src/lib/stone-icons.ts) and redrew the toy blocks with A, B, C (same `blocks` name, so
// Kids, The children's room and the page head pick it up with no data change). This sets `icon`
// on six cards (Food pantry and outreach swaps the giving hand for the grocery bag), matched by section and card title; everything else is untouched, and a card
// whose title has changed is skipped and reported. A second run finds the icons set and writes
// nothing. The open door is offered in the picker only.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/ministry-icons.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/ministry-icons.mjs <backup-folder> --apply
// The current page (and its draft, if any) is written to <backup-folder> first. Keep that folder
// outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const PAGE = 'page-ministries';
// section _key -> { card title -> icon }
const PLAN = {
  'min-cards': {
    Youth: 'backpack',
    'Sunday School': 'chalkboard',
    Fellowship: 'plate',
  },
  'min-serve-teams': {
    Greeters: 'handshake',
    'Food pantry and outreach': 'grocery-bag',
    'Workdays and grounds': 'toolbox',
  },
};

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const page = await client.getDocument(PAGE);
if (!page) throw new Error(`No ${PAGE} document; read the dataset first.`);
writeFileSync(join(dir, 'ministries-before-icons.json'), JSON.stringify(page, null, 2));
console.log(`Backed up ${PAGE} to ${join(dir, 'ministries-before-icons.json')}`);
const draft = await client.getDocument(`drafts.${PAGE}`);
if (draft) {
  writeFileSync(join(dir, 'ministries-draft-before-icons.json'), JSON.stringify(draft, null, 2));
  console.log(
    'A draft exists too; it was backed up and is NOT changed (publish or discard it in the Studio).',
  );
}

const sets = {};
for (const [sectionKey, byTitle] of Object.entries(PLAN)) {
  const section = (page.pageBuilder ?? []).find((s) => s._key === sectionKey);
  if (!section) {
    console.log(`\nSection ${sectionKey} not found; skipped.`);
    continue;
  }
  console.log(`\n${sectionKey}:`);
  const seen = new Set();
  for (const card of section.cards ?? []) {
    const want = byTitle[card.title];
    if (!want) continue;
    seen.add(card.title);
    const note = card.icon === want ? 'already set' : `-> ${want}`;
    console.log(
      `  ${String(card.title).padEnd(28)} ${String(card.icon ?? '(none)').padEnd(14)} ${note}`,
    );
    if (card.icon !== want)
      sets[`pageBuilder[_key=="${sectionKey}"].cards[_key=="${card._key}"].icon`] = want;
  }
  for (const t of Object.keys(byTitle))
    if (!seen.has(t)) console.log(`  ${t}: card not found, skipped`);
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
