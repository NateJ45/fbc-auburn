// About > "The story in our mark" (2026-10-23): the logo is now the linocut brick print, so the
// story of the old stone mark (stones, water, a ring) goes. The section's art stays "mark", which
// now draws the print (src/components/motion/MarkBuild.astro).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/about-mark-story.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/about-mark-story.mjs <backup-folder> --apply
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
writeFileSync(join(dir, 'aboutPage-before-mark-story.json'), JSON.stringify(about, null, 2));
console.log(`Backed up aboutPage to ${dir}`);

const i = about.pageBuilder.findIndex((b) => b._key === 'about-mark');
if (i < 0) throw new Error('About has no about-mark block; read the document first.');

const para = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s1`, marks: [], text }],
});
const body = [
  para(
    'about-mark-p1',
    'Our mark is printed like a woodcut: the red-brown brick of our building on Hamilton-Scipio Road, laid course by course, with a plain cross cut out of the middle.',
  ),
  para(
    'about-mark-p2',
    'The cross sits at the heart of the wall, closed in by brick on every side. The chips and white flecks are left in on purpose: a hand-made mark for a church of real people.',
  ),
];

await apply(`aboutPage: rewrite "The story in our mark" for the brick print`, () =>
  client
    .patch('aboutPage')
    .set({ [`pageBuilder[_key=="about-mark"].body`]: body })
    .commit(),
);
done(1);
