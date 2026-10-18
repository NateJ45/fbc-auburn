// The bold home pass (2026-10-17): Home's sections rewritten after the Gemini comp, with stock
// photos as stand-ins until the church's own photos arrive (docs/PENDING.md lists them).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md).
//   node scripts/content/home-bold-pass.mjs <photo-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/home-bold-pass.mjs <photo-folder> --apply
//
// <photo-folder> holds hero, belong, watch, kids, adults and fellowship .jpg (Unsplash, free
// licence; source ids below are stored on each asset so they are easy to find and replace).
//
// What it does to the homePage document:
//   hero      keeps its words; the subhead now opens "Come as you are."; the arch gets a photo
//   rail      removed from Home (the step-by-step lives on /plan-your-visit/)
//   pastor    becomes "A place to belong" with a photo (Pastor Jacob's welcome goes on About)
//   + "Plan your visit": three stone-icon cards from the old rail's steps
//   cards     "Find your place" cards get photos
//   watch     gets a poster picture, so it shows a video card instead of an empty box
//   week      unchanged
//   cta band  removed (Plan your visit does its job)
// Back up first: the previous document is printed to <photo-folder>/home-before-bold.json.

import { createReadStream, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref, APPLY } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass the folder that holds the photos.');
  process.exit(1);
}

const PHOTOS = {
  hero: { id: 'q5WkG46Btjk', alt: 'A small white church with a steeple among autumn trees' },
  belong: { id: '7KhbREQPFD4', alt: 'Two men embracing during a church gathering' },
  watch: { id: 'ZwaqicZOAgc', alt: '' },
  kids: { id: 'TJxotQTUr8o', alt: 'A child cutting out paper shapes at a craft table' },
  adults: { id: 'plAbojmGv5c', alt: 'A small group talking around a table' },
  fellowship: { id: 'gVyFFZo18ts', alt: 'People serving food from trays at a shared meal' },
};

const home = await client.getDocument('homePage');
if (!home) throw new Error('No homePage document.');
writeFileSync(join(dir, 'home-before-bold.json'), JSON.stringify(home, null, 2));
console.log(`Backed up homePage to ${join(dir, 'home-before-bold.json')}`);

const byKey = Object.fromEntries(home.pageBuilder.map((b) => [b._key, b]));
for (const k of ['home-hero', 'home-pastor', 'home-belong-cards', 'home-watch', 'home-week']) {
  if (!byKey[k]) throw new Error(`Home has no ${k} block; read the document before running this.`);
}

// Upload (or, dry, pretend to) and return an image field value.
const assets = {};
for (const [name, p] of Object.entries(PHOTOS)) {
  await apply(`upload ${name}.jpg (Unsplash ${p.id})`, async () => {
    const asset = await client.assets.upload('image', createReadStream(join(dir, `${name}.jpg`)), {
      filename: `stand-in-${name}.jpg`,
      creditLine: 'Stand-in photo from Unsplash',
      source: { name: 'unsplash', id: p.id, url: `https://unsplash.com/photos/${p.id}` },
    });
    assets[name] = asset._id;
  });
}
const img = (name) => ({
  _type: 'image',
  asset: ref(assets[name] ?? `image-DRY-${name}`),
  ...(PHOTOS[name].alt ? { alt: PHOTOS[name].alt } : {}),
});
const cta = (label, pageId) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(pageId),
});

const hero = {
  ...byKey['home-hero'],
  subhead:
    'Come as you are. We are a Southern Baptist family on Hamilton-Scipio Road in Ross Township, and someone will meet you at the door this Sunday.',
};

const belong = {
  ...byKey['home-pastor'],
  _key: 'home-belong',
  heading: 'A place to belong',
  imageSide: 'left',
  body: [
    {
      _type: 'block',
      _key: 'home-belong-p1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'home-belong-p1-s1',
          marks: [],
          text: 'Whether you have been in church all your life or not for years, there is a seat for you here. We are small enough to learn your name, and glad to.',
        },
      ],
    },
  ],
  cta: cta('About the church', 'aboutPage'),
};

const visit = {
  _type: 'iconCardsSection',
  _key: 'home-visit',
  heading: 'Plan your visit',
  intro: 'Never been to church, or not for a while? Here is what to expect.',
  cards: [
    {
      _type: 'iconCard',
      _key: 'hv-find',
      icon: 'map-pin',
      title: 'Find us in Auburn',
      body: '4241 Hamilton-Scipio Road, Hamilton. Park in the lot beside the building and come to the front doors.',
      link: cta('Walk in with us', 'page-plan-your-visit'),
    },
    {
      _type: 'iconCard',
      _key: 'hv-hello',
      icon: 'coffee',
      title: 'Someone will say hello',
      body: 'A greeter will meet you at the door, and there is coffee in the fellowship hall. Sit wherever you like; nobody will single you out.',
    },
    {
      _type: 'iconCard',
      _key: 'hv-worship',
      icon: 'bible',
      title: 'We sing, pray and open the Bible',
      body: 'Worship lasts about an hour, and children are welcome in the service.',
      link: cta('Plan your visit', 'page-plan-your-visit'),
    },
  ],
};

const cardPhoto = { 'hb-kids': 'kids', 'hb-bible': 'adults', 'hb-fellowship': 'fellowship' };
const findPlace = {
  ...byKey['home-belong-cards'],
  cards: byKey['home-belong-cards'].cards.map((c) =>
    cardPhoto[c._key] ? { ...c, image: img(cardPhoto[c._key]) } : c,
  ),
};

const watch = { ...byKey['home-watch'], poster: img('watch') };

const pageBuilder = [
  { ...hero, backgroundImage: img('hero') },
  belong,
  visit,
  watch,
  findPlace,
  byKey['home-week'],
];

const belongWithImage = pageBuilder[1];
belongWithImage.image = img('belong');

console.log('\nNew Home order:');
for (const b of pageBuilder)
  console.log(`  ${b._key}  ${b._type}  ${b.heading ?? b.headline ?? ''}`);
console.log(
  `Removed: ${home.pageBuilder
    .filter((b) => !pageBuilder.some((n) => n._key === b._key) && b._key !== 'home-pastor')
    .map((b) => b._key)
    .join(', ')}`,
);

await apply('homePage: set pageBuilder', () =>
  client.patch('homePage').set({ pageBuilder }).commit(),
);
if (!APPLY) console.log(JSON.stringify(pageBuilder, null, 1).slice(0, 1500));
done(Object.keys(PHOTOS).length + 1);
