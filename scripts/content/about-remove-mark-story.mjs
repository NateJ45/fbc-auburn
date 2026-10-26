// About > "The story in our mark" (2026-10-26): Nathan asked for the section to come off the
// About page. Backs up aboutPage, then removes the about-mark block. The "mark" art option on
// imageTextSection stays, so the block can be added back from the Studio.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/about-remove-mark-story.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/about-remove-mark-story.mjs <backup-folder> --apply
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
const about = await client.getDocument('aboutPage');
if (!about) throw new Error('No aboutPage.');
// Timestamped, so a verify run after --apply cannot overwrite the real before-copy.
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
writeFileSync(
  join(dir, `aboutPage-before-remove-mark-story-${stamp}.json`),
  JSON.stringify(about, null, 2),
);
console.log(`Backed up aboutPage to ${dir}`);

const block = about.pageBuilder.find((b) => b._key === 'about-mark');
if (!block) {
  console.log('About has no about-mark block; nothing to do.');
  done(0);
} else {
  console.log(`Removing block about-mark (${block._type}, "${block.heading}")`);
  await apply(`aboutPage: remove "The story in our mark"`, () =>
    client.patch('aboutPage').unset([`pageBuilder[_key=="about-mark"]`]).commit(),
  );
  done(1);
}
