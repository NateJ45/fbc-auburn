// A better stand-in for the Home hero (2026-10-24). The sanctuary photo from the church's Facebook
// page was 1440px wide (soft on a wide screen) and its "Jesus > Everything" banner fought the
// welcome set over it. In its place: a warm, soft-focus congregation seen from behind in wooden
// pews (Unsplash e77txgeniiU, free licence), which reads as a Sunday morning and leaves the lower
// left quiet for the words. Its `source` is Unsplash, so the hero shows the "Stand-in photograph"
// caption until the church's own photo replaces it (Studio: Home, Hero, Background photo). The
// sanctuary photo stays in the dataset for other uses. A second run finds the stand-in already
// set and writes nothing.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/hero-stand-in.mjs <folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/hero-stand-in.mjs <folder> --apply
// <folder> holds hero.jpg (https://unsplash.com/photos/e77txgeniiU/download?w=2400) and receives
// homePage-before-hero-stand-in.json, the document as it was. Keep that folder outside the repo.

import { createReadStream, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const UNSPLASH_ID = 'e77txgeniiU';
const ALT = 'A congregation seated in wooden pews during a Sunday service, seen from behind';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass the folder that holds hero.jpg (outside the repo).');
  process.exit(1);
}

const home = await client.getDocument('homePage');
if (!home) throw new Error('No homePage document; read the dataset first.');
writeFileSync(join(dir, 'homePage-before-hero-stand-in.json'), JSON.stringify(home, null, 2));
console.log(`Backed up homePage to ${join(dir, 'homePage-before-hero-stand-in.json')}`);

const hero = home.pageBuilder?.find((b) => b._key === 'home-hero');
if (!hero) throw new Error('Home has no home-hero block; read the document before running this.');

const current = hero.backgroundImage?.asset?._ref
  ? await client.getDocument(hero.backgroundImage.asset._ref)
  : null;
if (current?.source?.id === UNSPLASH_ID) {
  console.log('The hero already shows this stand-in; nothing to do.');
  done(0);
} else {
  console.log(`Hero photo now: ${current?.originalFilename ?? 'none'}`);
  let assetId = `image-DRYRUN-${UNSPLASH_ID}`;
  await apply(`upload hero.jpg (Unsplash ${UNSPLASH_ID})`, async () => {
    const asset = await client.assets.upload('image', createReadStream(join(dir, 'hero.jpg')), {
      filename: 'stand-in-hero-congregation.jpg',
      creditLine: 'Stand-in photo from Unsplash',
      source: {
        name: 'unsplash',
        id: UNSPLASH_ID,
        url: `https://unsplash.com/photos/${UNSPLASH_ID}`,
      },
    });
    assetId = asset._id;
  });
  // Setting the whole image replaces the old hotspot, which aimed at the banner.
  await apply('homePage hero: the congregation stand-in', () =>
    client
      .patch('homePage')
      .set({
        'pageBuilder[_key=="home-hero"].backgroundImage': {
          _type: 'image',
          alt: ALT,
          asset: { _type: 'reference', _ref: assetId },
        },
      })
      .commit(),
  );
  done(2);
}
