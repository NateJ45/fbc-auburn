// Home audit (2026-10-17): the header shows the first four menu links, and visitors looked for
// Watch and Give there (board E's comp had them). This reorders Site settings > Navigation so the
// four are About, Watch, Ministries and Give, adds Give (to the Contact page until online giving
// is set up; swap it for the Church Trac giving link in the Studio then), and drops "Plan your
// visit" from the menu list, because the header's own button already says it (the opened menu
// showed it twice). Nothing else in the menu changes; the rest keep their order after Give.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/nav-give.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/nav-give.mjs <backup-folder> --apply
// The current siteSettings document is written to <backup-folder>/site-settings-before-nav-give.json
// first. Keep that folder outside the repo.

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
writeFileSync(join(dir, 'site-settings-before-nav-give.json'), JSON.stringify(settings, null, 2));
console.log(`Backed up siteSettings to ${join(dir, 'site-settings-before-nav-give.json')}`);

const byKey = Object.fromEntries(settings.navItems.map((n) => [n._key, n]));
for (const k of ['n-about', 'n-watch', 'n-ministries']) {
  if (!byKey[k]) throw new Error(`Navigation has no ${k}; read the document before running this.`);
}
const give = byKey['n-give'] ?? {
  _key: 'n-give',
  _type: 'navLink',
  label: 'Give',
  linkType: 'internal',
  internalPage: ref('contactPage'),
};
const first = [byKey['n-about'], byKey['n-watch'], byKey['n-ministries'], give];
const rest = settings.navItems.filter(
  (n) => !first.some((f) => f._key === n._key) && n._key !== 'n-visit',
);
const navItems = [...first, ...rest];

console.log('\nNew menu order:');
for (const n of navItems) console.log(`  ${n._key.padEnd(14)} ${n.label}`);
console.log('');

await apply('set siteSettings.navItems', async () => {
  await client.patch('siteSettings').set({ navItems }).commit();
});
done(1);
