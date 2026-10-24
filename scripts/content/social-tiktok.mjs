// The church's TikTok (2026-10-24): adds https://www.tiktok.com/@auburn.pastor to Site settings >
// Social links, after Facebook. The account's bio names the church and its address, so it is the
// church's own. The footer draws every social link as an icon button (TikTok is one of the listed
// platforms), and the links also feed the site's structured data. Nothing else changes; a second
// run finds the link already there and writes nothing.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/social-tiktok.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/social-tiktok.mjs <backup-folder> --apply
// The current siteSettings document is written to <backup-folder>/site-settings-before-tiktok.json
// first. Keep that folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const TIKTOK = 'https://www.tiktok.com/@auburn.pastor';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const settings = await client.getDocument('siteSettings');
if (!settings) throw new Error('No siteSettings document; read the dataset first.');
writeFileSync(join(dir, 'site-settings-before-tiktok.json'), JSON.stringify(settings, null, 2));
console.log(`Backed up siteSettings to ${join(dir, 'site-settings-before-tiktok.json')}`);

const links = settings.socialLinks ?? [];
console.log('\nSocial links now:');
for (const l of links) console.log(`  ${String(l.platform).padEnd(10)} ${l.url}`);

if (links.some((l) => l.platform === 'TikTok' || String(l.url).includes('tiktok.com'))) {
  console.log('\nA TikTok link is already there; nothing to do.');
  done(0);
} else {
  const tiktok = { _key: 'social-tiktok', _type: 'socialLink', platform: 'TikTok', url: TIKTOK };
  console.log(`\nAdding: TikTok     ${TIKTOK}\n`);
  await apply('append siteSettings.socialLinks[TikTok]', async () => {
    await client
      .patch('siteSettings')
      .setIfMissing({ socialLinks: [] })
      .insert('after', 'socialLinks[-1]', [tiktok])
      .commit();
  });
  done(1);
}
