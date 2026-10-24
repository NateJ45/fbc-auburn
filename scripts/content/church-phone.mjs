// The church phone (2026-10-24): sets Site settings > phone to (513) 863-3500, the church's own line
// (on its earlier website and its local listings), with phoneConfirmed false, so the site shows it
// with the "To confirm" tag and keeps it out of the JSON-LD until the church ticks the box. An
// earlier run the same day set a personal number here by mistake; this replaces whatever is set
// unless it is already this number.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/church-phone.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/church-phone.mjs <backup-folder> --apply
// The current siteSettings document is written to <backup-folder>/site-settings-before-phone.json
// first. Keep that folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const PHONE = '(513) 863-3500';

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
  `\nphone set: ${settings.phone?.trim() ? 'yes' : 'no'}, confirmed: ${settings.phoneConfirmed === true}`,
);

if (settings.phone?.trim() === PHONE) {
  console.log('The church line is already set; nothing to do.');
  done(0);
} else {
  console.log(`Setting:   "${PHONE}", confirmed: false\n`);
  await apply('set siteSettings.phone (church line) and phoneConfirmed=false', async () => {
    await client.patch('siteSettings').set({ phone: PHONE, phoneConfirmed: false }).commit();
  });
  done(1);
}
