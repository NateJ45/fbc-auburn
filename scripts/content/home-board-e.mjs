// Board E (2026-10-17): Home's page layout rewritten for the noticeboard design that replaced
// the full-height stone ribbon. HomeBoard.astro draws it; docs/design-directions/2026-10-17-fbc-auburn/
// README.md has the decision.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md),
// after a dataset export:
//   node scripts/content/home-board-e.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/home-board-e.mjs <backup-folder> --apply
//
// The current homePage document is written to <backup-folder>/home-before-board-e.json first.
// Keep that folder outside the repo.
//
// The new layout, top to bottom (every photo is one the bold pass already uploaded):
//   hero         lockup words kept; new welcome line; shorter subhead; "Plan your first visit"
//   week board   NEW "Through the week": Wednesdays (time from Church facts), Kids, Any day
//   who we are   "A place to belong" as a signed note, the church photo big, two more beside it
//   this week    heading "This week" (the list itself is derived)
//   watch        "Last Sunday", poster card "Watch the message"
//   ways         NEW "Other ways in": Ministries, Give, Ask a question
// Retired from Home (kept in the backup): the "Plan your visit" cards (their steps live on
// /plan-your-visit/) and the "Find your place" photo cards (Ministries carries them).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const home = await client.getDocument('homePage');
if (!home) throw new Error('No homePage document.');
writeFileSync(join(dir, 'home-before-board-e.json'), JSON.stringify(home, null, 2));
console.log(`Backed up homePage to ${join(dir, 'home-before-board-e.json')}`);

const byKey = Object.fromEntries(home.pageBuilder.map((b) => [b._key, b]));
for (const k of ['home-hero', 'home-belong', 'home-belong-cards', 'home-watch', 'home-week']) {
  if (!byKey[k]) throw new Error(`Home has no ${k} block; read the document before running this.`);
}
const hero = byKey['home-hero'];
const belong = byKey['home-belong'];
const watch = byKey['home-watch'];
const week = byKey['home-week'];
const photoCards = byKey['home-belong-cards'].cards;
const meal = photoCards.find((c) => c._key === 'hb-fellowship')?.image;
if (!hero.backgroundImage?.asset || !belong.image?.asset || !meal?.asset) {
  throw new Error('Expected the bold pass photos (hero, belong, fellowship) to be in place.');
}

const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});
const card = (key, icon, title, body, link) => ({
  _type: 'iconCard',
  _key: key,
  icon,
  title,
  body,
  ...(link ? { link } : {}),
});
const para = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s1`, text, marks: [] }],
});

const pageBuilder = [
  {
    ...hero,
    welcome: 'Come as you are.',
    subhead:
      'We are a small Southern Baptist family in Ross Township. Someone will meet you at the door, and there is coffee in the fellowship hall.',
    primaryCta: internal('Plan your first visit', 'page-plan-your-visit'),
    secondaryCta: internal('Meet the church', 'aboutPage'),
  },
  {
    _type: 'iconCardsSection',
    _key: 'home-through-week',
    heading: 'Through the week',
    cards: [
      card(
        'htw-wednesday',
        'clock',
        'Wednesdays',
        'Bible study and prayer, an open table for questions.',
      ),
      card(
        'htw-kids',
        'blocks',
        'Kids on Sunday',
        'Welcome in the service, with a checked-in room for little ones.',
      ),
      card(
        'htw-prayer',
        'praying-hands',
        'Any day',
        'Tell us what is on your heart.',
        internal('Send a prayer request', 'contactPage'),
      ),
    ],
  },
  {
    _type: 'imageTextSection',
    _key: 'home-belong',
    art: 'photo',
    imageSide: belong.imageSide ?? 'left',
    eyebrow: 'Who we are',
    heading: 'A place to belong',
    // Pastor Jacob writes this himself (the studio never words a pastor's welcome for him).
    body: [
      para('home-belong-p1', "[Two or three sentences of welcome in Pastor Jacob's own words.]"),
    ],
    signedBy: 'Jacob Wysong, Senior Pastor',
    cta: internal('About the church', 'aboutPage'),
    image: hero.backgroundImage,
    extraImages: [
      { ...belong.image, _key: 'belong-embrace' },
      { ...meal, _key: 'belong-meal' },
    ],
  },
  { ...week, heading: 'This week' },
  {
    ...watch,
    heading: 'Last Sunday',
    body: 'Streamed live on Facebook every Sunday',
    link: internal('Watch the message', 'page-watch'),
  },
  {
    _type: 'iconCardsSection',
    _key: 'home-other-ways',
    heading: 'Other ways in',
    cards: [
      card(
        'how-ministries',
        'bible',
        'Ministries',
        'Kids, Bible study, fellowship',
        internal('Ministries', 'page-ministries'),
      ),
      card(
        'how-give',
        'giving-hand',
        'Give',
        'Ask us how to give while online giving is set up',
        internal('Give', 'contactPage'),
      ),
      card(
        'how-ask',
        'coffee',
        'Ask a question',
        'Anything at all, before you come',
        internal('Ask a question', 'contactPage'),
      ),
    ],
  },
];

console.log('\nNew Home layout:');
for (const b of pageBuilder)
  console.log(`  ${b._key.padEnd(18)} ${b._type}  ${b.heading ?? b.headline ?? ''}`);
console.log(
  `Retired from Home: ${home.pageBuilder
    .filter((b) => !pageBuilder.some((n) => n._key === b._key))
    .map((b) => b._key)
    .join(', ')}\n`,
);

await apply('set homePage.pageBuilder to the board E layout', async () => {
  await client.patch('homePage').set({ pageBuilder }).commit();
});
done(1);
