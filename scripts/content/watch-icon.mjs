// The Watch page gets a livestream icon (2026-10-24): its page head wore the music note, which
// reads as worship music, not "watch live". Round 26 drew a screen with a play button
// (`play-screen`, src/lib/stone-icons.ts). This sets `icon` on the Watch hero only, matched by its
// section key; everything else is untouched. A hero whose icon has already been changed to
// something other than music is left alone and reported, and a second run writes nothing.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/watch-icon.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/watch-icon.mjs <backup-folder> --apply
// The current page (and its draft, if any) is written to <backup-folder> first. Keep that folder
// outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const PAGE = 'page-watch';
const HERO = 'w-hero';
const FROM = 'music';
const TO = 'play-screen';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const page = await client.getDocument(PAGE);
if (!page) throw new Error(`No ${PAGE} document; read the dataset first.`);
writeFileSync(join(dir, 'watch-before-icon.json'), JSON.stringify(page, null, 2));
console.log(`Backed up ${PAGE} to ${join(dir, 'watch-before-icon.json')}`);
const draft = await client.getDocument(`drafts.${PAGE}`);
if (draft) {
  writeFileSync(join(dir, 'watch-draft-before-icon.json'), JSON.stringify(draft, null, 2));
  console.log(
    'A draft exists too; it was backed up and is NOT changed (publish or discard it in the Studio).',
  );
}

const hero = (page.pageBuilder ?? []).find((s) => s._key === HERO);
if (!hero) {
  console.log(`\nSection ${HERO} not found; nothing to do.`);
  done(0);
} else if (hero.icon === TO) {
  console.log(`\n${HERO} already shows ${TO}; nothing to do.`);
  done(0);
} else if (hero.icon !== FROM) {
  console.log(`\n${HERO} shows ${hero.icon ?? '(none)'}, not ${FROM}: someone chose it; skipped.`);
  done(0);
} else {
  console.log(`\n${HERO}: ${FROM} -> ${TO}\n`);
  await apply(`set the ${HERO} icon on ${PAGE}`, async () => {
    await client
      .patch(PAGE)
      .set({ [`pageBuilder[_key=="${HERO}"].icon`]: TO })
      .commit();
  });
  done(1);
}
