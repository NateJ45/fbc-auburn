// The Home rhythm pass (2026-11-20). Home read as one pattern seven times (a small brick label,
// a big title, then cards), so this does the content half of the fix; the code half is in
// HomeWalk, HomeWeekWatch and HomeBand.
//
//   1. Clears the eyebrow labels over "Why we open the Bible every Sunday", "A place to belong"
//      and "Meet Pastor Jacob": each has its own title, and the label above it only repeated it.
//   2. Gives two of the four Sunday walk steps a photo the church already owns: the building for
//      "Come to the front door" and the sanctuary for "Worship". The other two keep their
//      "Photo needed" request until the photo Sunday (src/data/shot-list.ts).
//   3. Adds "Bring the kids" after A place to belong: Home said almost nothing to parents. It must
//      come AFTER that block: HomeBoard draws the first Image + text block on Home as the Who we
//      are photo mosaic, so a kids block placed earlier took its place (found live 2026-11-20). Its words
//      are only what the finished copy already says on Plan your visit (no nursery, no safety
//      sentence: those are still Pastor Jacob's to give) and it links there.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/home-rhythm.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/home-rhythm.mjs <backup-folder> --apply
// The Home document is written to <backup-folder>/home-before-rhythm-<time>.json first (one per run). Keep that folder
// outside the repo. Run it only after the deploy that adds the steps' Photo field, or the Studio
// shows the new value as an unknown field.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, imageValue, p } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const home = await client.getDocument('homePage');
if (!home?.pageBuilder?.length) throw new Error('homePage has no page layout; read it first.');
if (await client.getDocument('drafts.homePage')) {
  throw new Error('Home has an unpublished draft. Publish or discard it in the Studio first.');
}
const backup = join(dir, `home-before-rhythm-${Date.now()}.json`);
writeFileSync(backup, JSON.stringify(home, null, 2));
console.log(`Backed up homePage to ${backup}`);

const byKey = Object.fromEntries(home.pageBuilder.map((b) => [b._key, b]));
for (const k of ['home-first-sunday', 'home-gospel', 'home-belong', 'home-pastor']) {
  if (!byKey[k]) throw new Error(`Home has no ${k} block; read the document before running this.`);
}

// The church's own photos (renamed fbca-church-* on 2026-11-19, no people in them).
const BUILDING = 'image-eef27773040776b9d5cfdce082b70b9fa856f284-682x682-jpg';
const SANCTUARY = 'image-5c121bef3022c59358f3fedbf678c133b199690d-1440x1080-jpg';
const STEP_PHOTOS = {
  'Come to the front door': {
    ...imageValue(BUILDING),
    alt: 'The red brick church building with its white steeple, front porch and ramp up to the doors',
  },
  Worship: {
    ...imageValue(SANCTUARY),
    alt: 'The front of the sanctuary: the pulpit, the communion table and the baptistry behind',
  },
};

const walk = byKey['home-first-sunday'];
const steps = walk.steps.map((s) =>
  STEP_PHOTOS[s.title] && !s.image?.asset ? { ...s, image: STEP_PHOTOS[s.title] } : s,
);
const photoed = steps.filter((s, i) => s !== walk.steps[i]).map((s) => s.title);

const kids = {
  _key: 'home-kids',
  _type: 'imageTextSection',
  art: 'photo',
  imageSide: 'left',
  heading: 'Bring the kids',
  body: [
    p('Children are welcome in worship, and nobody minds a little noise.'),
    p(
      'Sunday School before worship has a class for every age, from little ones to adults, and Wednesday nights have a class just for children and youth.',
    ),
  ],
  cta: {
    _type: 'ctaBlock',
    linkType: 'external',
    externalUrl: '/plan-your-visit/#kids',
    label: 'What to expect with kids',
  },
};

const pageBuilder = [];
for (const b of home.pageBuilder) {
  if (b._key === 'home-kids') continue; // re-runs replace it in place below
  if (b._key === 'home-first-sunday') pageBuilder.push({ ...b, steps });
  else if (['home-gospel', 'home-belong', 'home-pastor'].includes(b._key)) {
    const { eyebrow: _drop, ...rest } = b;
    pageBuilder.push(rest);
  } else pageBuilder.push(b);
  if (b._key === 'home-belong') pageBuilder.push(kids);
}

console.log('\nNew Home order:');
for (const b of pageBuilder) {
  console.log(`  ${b._key.padEnd(20)} ${b._type.padEnd(20)} ${b.heading ?? ''}`);
}
console.log(
  `\nEyebrows cleared: ${['home-gospel', 'home-belong', 'home-pastor'].map((k) => byKey[k].eyebrow ?? '(none)').join(', ')}`,
);
console.log(`Step photos set: ${photoed.join(', ') || '(none, already set)'}\n`);

await apply('set homePage.pageBuilder', async () => {
  await client.patch('homePage').set({ pageBuilder }).commit();
});
done(1);
