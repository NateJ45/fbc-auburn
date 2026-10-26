// Re-audit, chrome (2026-10-26): the menu and the footer's page list become four groups, with
// Need the pastor? beside Contact in a small group of its own (Nathan's call):
//
//   New here      Plan your visit, About, What we believe, Leadership
//   Get involved  Ministries, Next steps, News and notes
//   This week     Sermons, Events, Bulletin, Give
//   Reach us      Contact, Need the pastor?, Prayer requests
//
// The footer columns take the same four groups under the same names. The code already lays out
// four groups (Header.astro fits them at 1024 and 1280; the footer runs them in a 2 by 2 grid on a
// phone and one column each on a wide screen), and it draws three groups as before until this runs.
// The plan itself is scripts/lib/reaudit-content.mjs (menuPlan), unit-tested.
//
// Dry by default, and a dry run needs no token (the dataset is public; it reads the published
// document). Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/menu-reach-us.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/menu-reach-us.mjs <backup-folder> --apply
// Under --apply the siteSettings document is written to <backup-folder>/menu-reach-us-before.json
// first. Keep that folder outside the repo. Safe to run twice: it writes only what differs.
// After applying: refresh ci/sanity-snapshot.ndjson.gz (node scripts/snapshot.mjs export).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { menuPlan } from '../lib/reaudit-content.mjs';
import { readClient } from '../lib/reaudit-read.mjs';

const APPLY = process.argv.includes('--apply');
const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (APPLY && !dir) {
  console.error('Pass a backup folder (outside the repo) with --apply.');
  process.exit(1);
}

// Under --apply the write client (sanity-lib refuses production without NCS_PRODUCTION_WRITE=yes).
const lib = APPLY ? await import('../lib/sanity-lib.mjs') : null;
const client = lib ? lib.client : await readClient();

const settings = await client.getDocument('siteSettings');
if (!settings?.navItems?.length) throw new Error('siteSettings has no navItems; read it first.');
if (lib) {
  // An unpublished draft would put the old menu back the next time someone publishes it.
  if (await client.getDocument('drafts.siteSettings'))
    throw new Error('siteSettings has an unpublished draft; publish or discard it first.');
  writeFileSync(join(dir, 'menu-reach-us-before.json'), JSON.stringify(settings, null, 2));
  console.log(`Backed up siteSettings to ${join(dir, 'menu-reach-us-before.json')}`);
}

const patch = menuPlan(settings);
const show = (cols, name) => {
  console.log(`\n${name}:`);
  for (const g of cols ?? [])
    console.log(`  ${(g.label ?? g.title).padEnd(13)} ${g.links.map((l) => l.label).join(', ')}`);
};
show(
  settings.navItems.filter((n) => n.links),
  'Menu now',
);
show(patch.navItems ?? settings.navItems.filter((n) => n.links), 'Menu after');
show(settings.footerColumns, 'Footer now');
show(patch.footerColumns ?? settings.footerColumns, 'Footer after');
console.log('');

const fields = Object.keys(patch);
if (fields.length === 0) {
  console.log('Nothing to change: already applied.');
} else if (lib) {
  await lib.apply(`set siteSettings ${fields.join(', ')}`, async () => {
    await client.patch('siteSettings').set(patch).commit();
  });
} else {
  console.log(`DRY set siteSettings ${fields.join(', ')}`);
}
console.log(
  `\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${fields.length ? 1 : 0} change(s).` +
    (APPLY ? '' : ' Re-run with --apply (and NCS_PRODUCTION_WRITE=yes) to write.'),
);
