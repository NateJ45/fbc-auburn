// Before Jacob reviews the preview (2026-10-24), from the portfolio critique:
//   1. Home hero: the church's own sanctuary photo (the "Jesus > Everything" banner over the
//      pulpit, from its Facebook page, already in the dataset) in place of a stock stand-in, and a
//      placeholder welcome short enough to keep the This Sunday times on a phone's first screen.
//   2. Plan your visit: the page head gets the map-pin icon (it was the only inner page with an
//      empty right half), and its subhead folds into the walk's intro so the page opens with one
//      intro, not two stacked.
//   3. What we believe: the one belief card with an icon (The Bible) loses it, so the nine line up;
//      the page head already shows the Bible.
// Each change checks the value it expects first and skips if someone has since edited it.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/pre-review.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/pre-review.mjs <backup-folder> --apply
// The three documents are written to <backup-folder>/pre-review-before.json first. Keep that folder
// outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const SANCTUARY = 'image-5c121bef3022c59358f3fedbf678c133b199690d-1440x1080-jpg';
const STAND_IN = 'image-b026ae09f5c532b7923038ea803b5a730e675009-2000x1333-jpg';
const WELCOME =
  '[Placeholder: A close-knit church family in Ross Township. Someone will meet you at the door.]';
const WALK_INTRO =
  'Everything you might wonder about before you come: here is your first Sunday morning, from your parking space to your seat.';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const [home, pyv, wwb] = await Promise.all(
  ['homePage', 'page-plan-your-visit', 'page-what-we-believe'].map((id) => client.getDocument(id)),
);
if (!home || !pyv || !wwb) throw new Error('A document is missing; read the dataset first.');
writeFileSync(join(dir, 'pre-review-before.json'), JSON.stringify({ home, pyv, wwb }, null, 2));
console.log(`Backed up homePage, page-plan-your-visit, page-what-we-believe to ${dir}\n`);

let n = 0;
const block = (doc, key) => doc.pageBuilder?.find((b) => b._key === key);

// 1. Home hero.
const hero = block(home, 'home-hero');
if (hero?.backgroundImage?.asset?._ref === STAND_IN) {
  n++;
  await apply('homePage hero: the sanctuary photo, and a two-line placeholder welcome', () =>
    client
      .patch('homePage')
      .set({
        'pageBuilder[_key=="home-hero"].backgroundImage': {
          _type: 'image',
          alt: 'The sanctuary at First Baptist Church of Auburn, the pulpit under a banner reading Jesus is greater than everything',
          asset: { _type: 'reference', _ref: SANCTUARY },
        },
        'pageBuilder[_key=="home-hero"].subhead': WELCOME,
      })
      .commit(),
  );
} else console.log('SKIP homePage hero: the photo is no longer the stand-in.');

// 1b. Keep the banner in the crop: the hero is much wider than the 4:3 photo, so aim it at the top,
// where "Jesus > Everything" hangs over the pulpit.
const heroNow = (await client.getDocument('homePage'))?.pageBuilder?.find(
  (b) => b._key === 'home-hero',
);
if (heroNow?.backgroundImage?.asset?._ref === SANCTUARY && !heroNow.backgroundImage.hotspot) {
  n++;
  await apply('homePage hero: hotspot at the banner (top of the photo)', () =>
    client
      .patch('homePage')
      .set({
        'pageBuilder[_key=="home-hero"].backgroundImage.hotspot': {
          _type: 'sanity.imageHotspot',
          x: 0.5,
          y: 0.14,
          width: 0.7,
          height: 0.3,
        },
      })
      .commit(),
  );
} else console.log('SKIP homePage hero hotspot: already set, or not the sanctuary photo.');

// 2. Plan your visit head and walk intro.
const head = block(pyv, 'pyv-hero');
const walk = block(pyv, 'pyv-walk');
if (head && walk && !head.icon) {
  n++;
  await apply('plan-your-visit: map-pin head icon, one intro (the walk carries it)', () =>
    client
      .patch('page-plan-your-visit')
      .set({
        'pageBuilder[_key=="pyv-hero"].icon': 'map-pin',
        'pageBuilder[_key=="pyv-walk"].intro': WALK_INTRO,
      })
      .unset(['pageBuilder[_key=="pyv-hero"].subhead'])
      .commit(),
  );
} else console.log('SKIP plan-your-visit: the head already has an icon.');

// 3. What we believe: the one icon off.
const cards = block(wwb, 'wwb-cards')?.cards ?? [];
const withIcon = cards.filter((c) => c.icon);
if (withIcon.length === 1 && withIcon[0]._key === 'b1') {
  n++;
  await apply('what-we-believe: The Bible card loses its lone icon', () =>
    client
      .patch('page-what-we-believe')
      .unset(['pageBuilder[_key=="wwb-cards"].cards[_key=="b1"].icon'])
      .commit(),
  );
} else console.log(`SKIP what-we-believe: ${withIcon.length} cards have icons now.`);

done(n);
