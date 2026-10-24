// Find your place (2026-10-24, from the hppres.org audit): Ministries becomes a hub. The two card
// sections ("min-cards", the ministries, and "min-serve-teams", Ways to serve) are replaced by ONE
// "Find your place" block (findYourPlaceSection) with five groups: New here, Kids and youth,
// Adults, Serve, Care. Every card's words, icon and link are carried over from the live cards, so
// nothing Jacob or the placeholders said is lost; a card that belongs in two groups is in both.
// The typed times in the old "note" lines go: each card now names a DAY ("Wednesdays") and the
// site adds that day's times from Church facts.
// Also: the page head reads "Find your place" (eyebrow "Ministries"), and the closing band names
// a person ("Questions? Ask Pastor Jacob."), the way every hppres.org ministry page ends.
// The food pantry block (min-serve) and Giving (min-give) stay as they are, after the hub.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/ministries-find-your-place.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/ministries-find-your-place.mjs <backup-folder> --apply
// page-ministries is written to <backup-folder> first. Run it only after the deploy that adds the
// block to the schema, or the Studio shows the new block as unknown.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const page = await client.getDocument('page-ministries');
if (!page) throw new Error('No page-ministries document.');
writeFileSync(
  join(dir, 'page-ministries-before-find-your-place.json'),
  JSON.stringify(page, null, 2),
);

const blocks = structuredClone(page.pageBuilder ?? []);
if (blocks.some((b) => b._type === 'findYourPlaceSection')) {
  console.log('Ministries already has a Find your place block; nothing to do.');
  done(0);
  process.exit(0);
}
const ministries = blocks.find((b) => b._key === 'min-cards');
const serve = blocks.find((b) => b._key === 'min-serve-teams');
if (!ministries || !serve) throw new Error('Ministries is missing min-cards or min-serve-teams.');

const from = (section, key) => {
  const c = section.cards.find((x) => x._key === key);
  if (!c) throw new Error(`No card ${key} in ${section._key}.`);
  return c;
};
const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});
/** A hub card: carries the old card's icon, body and link unless `extra` says otherwise. */
const card = (key, old, extra = {}) => {
  const c = {
    _type: 'fypCard',
    _key: key,
    ...(old?.icon ? { icon: old.icon } : {}),
    ...(old?.image ? { image: old.image } : {}),
    title: old?.title,
    ...(old?.body ? { body: old.body } : {}),
    ...(old?.link?.label ? { link: old.link } : {}),
    ...extra,
  };
  if (!c.title) throw new Error(`Card ${key} has no title.`);
  return c;
};
const group = (key, title, line, cards) => ({ _type: 'fypGroup', _key: key, title, line, cards });

const kids = from(ministries, 'c1');
const youth = from(ministries, 'c-youth');
const sundaySchool = from(ministries, 'c2');
const bibleStudy = from(ministries, 'c3');
const music = from(ministries, 'c4');
const prayer = from(ministries, 'c5');
const fellowship = from(ministries, 'c6');

const HUB = {
  _type: 'findYourPlaceSection',
  _key: 'min-fyp',
  groups: [
    group('g-new', 'New here', 'Your first Sunday, and the people you will meet.', [
      card(
        'n-visit',
        { icon: 'map-pin', title: 'Plan your visit' },
        {
          forWho: 'Your first Sunday',
          day: 'Sundays',
          body: 'Where to park, which door to use, and what happens from the car to your seat.',
          link: internal('Plan your visit', 'page-plan-your-visit'),
        },
      ),
      card(
        'n-coffee',
        { icon: 'coffee', title: 'Coffee with the pastor' },
        {
          forWho: 'Anyone with questions',
          body: '[Placeholder: Sit down with Pastor Jacob over a coffee, ask anything, and tell him your story.] [Jacob: would you like to offer this?]',
          link: internal('Ask to meet', 'contactPage'),
        },
      ),
      card(
        'n-next',
        { icon: 'church', title: 'Next steps' },
        {
          forWho: 'After your first Sunday',
          body: 'Knowing Jesus, baptism, membership, a group and a place to serve.',
          link: internal('See the next steps', 'page-next-steps'),
        },
      ),
    ]),
    group(
      'g-kids',
      'Kids and youth',
      'Children are welcome in the service, and wiggles are fine.',
      [
        card('k-kids', kids, { forWho: 'Children', day: 'Sundays' }),
        card('k-youth', youth, { forWho: 'Students', day: 'Wednesdays' }),
        card('k-school', sundaySchool, { forWho: 'Every age', day: 'Sundays' }),
      ],
    ),
    group('g-adults', 'Adults', 'Open the Bible together, pray, sing and share a meal.', [
      card('a-school', sundaySchool, { forWho: 'Every age', day: 'Sundays' }),
      card('a-bible', bibleStudy, { forWho: 'Adults', day: 'Wednesdays' }),
      card('a-music', music, { forWho: 'Singers and players' }),
      card('a-fellowship', fellowship, { forWho: 'Everyone' }),
    ]),
    group('g-serve', 'Serve', serve.intro ?? 'Every church family runs on people who pitch in.', [
      card('s-greet', from(serve, 's-greet'), { place: 'The front door' }),
      card('s-kids', from(serve, 's-kids')),
      card('s-music', from(serve, 's-music')),
      card('s-pantry', from(serve, 's-pantry')),
      card('s-grounds', from(serve, 's-grounds')),
      card('s-prayer', from(serve, 's-prayer')),
    ]),
    group('g-care', 'Care', 'When life is hard, you do not have to carry it alone.', [
      card('c-prayer', prayer, { forWho: 'Anyone' }),
      card(
        'c-life',
        { icon: 'praying-hands', title: 'When life happens' },
        {
          forWho: 'Members and neighbours',
          body: 'A hospital visit, a wedding, a funeral, or a hand when you need one.',
          link: internal('Get in touch', 'contactPage'),
        },
      ),
    ]),
  ],
};

const next = [];
for (const b of blocks) {
  if (b._key === 'min-cards') next.push(HUB);
  else if (b._key === 'min-serve-teams') continue;
  else if (b._key === 'min-hero')
    next.push({
      ...b,
      eyebrow: 'Ministries',
      headline: 'Find your place',
      subhead:
        'Ways to grow, serve and belong, for every age. Pick a group, or scroll through them all.',
    });
  else if (b._key === 'min-cta')
    next.push({
      ...b,
      headline: 'Questions? Ask Pastor Jacob.',
      subhead: 'Not sure where you fit? He would be glad to help you find your place.',
    });
  else next.push(b);
}

console.log('Ministries, before:', blocks.map((b) => b._key).join(', '));
console.log('Ministries, after: ', next.map((b) => b._key).join(', '));
for (const g of HUB.groups) {
  console.log(
    `  ${g.title}: ${g.cards.map((c) => `${c.title}${c.day ? ` [${c.day}]` : ''}`).join(', ')}`,
  );
}

// The page as it will read, for a dry-run look (and to pin it in ci/sanity-snapshot.ndjson.gz).
writeFileSync(
  join(dir, 'page-ministries-after-find-your-place.json'),
  JSON.stringify({ ...page, pageBuilder: next }, null, 2),
);

await apply('patch page-ministries.pageBuilder (Find your place)', () =>
  client.patch('page-ministries').set({ pageBuilder: next }).commit(),
);
done(1);
