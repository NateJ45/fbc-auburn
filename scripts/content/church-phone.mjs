// The church phone (2026-10-24): sets Site settings > phone to 937-620-8693, the number in the
// church's TikTok bio (@auburn.pastor), with phoneConfirmed false, so the site shows it with the
// "To confirm" tag and keeps it out of the JSON-LD until the church ticks the box. A phone that is
// already set is left alone: this only fills an empty field.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/church-phone.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/church-phone.mjs <backup-folder> --apply
// The current siteSettings document is written to <backup-folder>/site-settings-before-phone.json
// first. Keep that folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const PHONE = '937-620-8693';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const settings = await client.getDocument('siteSettings');
if (!settings) throw new Error('No siteSettings document; read the dataset first.');
writeFileSync(join(dir, 'site-settings-before-phone.json'), JSON.stringify(settings, null, 2));
console.log(`Backed up siteSettings to ${join(dir, 'site-settings-before-phone.json')}`);
console.log(
  `\nphone now: ${JSON.stringify(settings.phone ?? null)}, confirmed: ${settings.phoneConfirmed === true}`,
);

if (settings.phone?.trim()) {
  console.log('A phone is already set; nothing to do.');
  done(0);
} else {
  console.log(`Setting:   "${PHONE}", confirmed: false\n`);
  await apply('set siteSettings.phone and phoneConfirmed=false', async () => {
    await client.patch('siteSettings').set({ phone: PHONE, phoneConfirmed: false }).commit();
  });
  done(1);
}
