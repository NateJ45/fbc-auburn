// Pre-launch preview for Pastor Jacob (2026-10-23): every page gets clearly marked placeholder
// content and the church's own photos, so he can react to a whole site instead of empty boxes.
//
// THE CONVENTION: wording that is ours, not Jacob's, sits in square brackets starting
// "[Placeholder: ...]" (a draft he can react to) or "[Jacob: ...]" (something only he can write).
// The site highlights both while PRE_LAUNCH_NOTES is on (src/data/for-jacob.ts). Doctrine is
// Jacob's: What we believe carries asks only. Facts we do not know are asks, never guesses.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/jacob-preview.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/jacob-preview.mjs <backup-folder> --apply
// Every document this changes is written to <backup-folder> first (never overwritten by a re-run).
// Keep that folder outside the repo.
//
// Photos come from the church's own Facebook page (kept in the studio vault, not the repo). Only
// photos with no people in them are used. fbca-fb-40 was swapped for 39: its gift tags show names.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  client,
  APPLY,
  apply,
  done,
  ref,
  p,
  strong,
  link,
  makeUploader,
} from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const FACEBOOK = 'https://www.facebook.com/FirstAuburnHamilton';
const CREDIT = "From the church's Facebook page";
// The folder holding the church's Facebook photos (kept outside the repo): FBCA_PHOTO_DIR. Only
// needed on a run that has not uploaded them yet; uploaded assets are reused.
const PHOTO_DIR = process.env.FBCA_PHOTO_DIR ?? '';
const STAND_IN_BELONG = 'image-b026ae09f5c532b7923038ea803b5a730e675009-2000x1333-jpg';

// ── Backup ───────────────────────────────────────────────────────────────────
const IDS = [
  'homePage',
  'aboutPage',
  'page-what-we-believe',
  'page-leadership',
  'page-ministries',
  'page-plan-your-visit',
  'page-watch',
  'faqPage',
  'journalPage',
  'journal-category-one',
  'journal-category-two',
  'contactPage',
  'siteSettings',
  'faq-where-do-i-go',
  'faq-how-long',
  'faq-sunday-school',
  'faq-children',
  'faq-watch-online',
  'faq-what-kind',
];
const docs = {};
for (const id of IDS) {
  const d = await client.getDocument(id);
  if (!d) throw new Error(`Missing ${id}; read the dataset before running this.`);
  docs[id] = d;
  const file = join(dir, `${id}.json`);
  if (!existsSync(file)) writeFileSync(file, JSON.stringify(d, null, 2));
}
console.log(`Backed up ${IDS.length} documents to ${dir} (existing backups kept)\n`);

// ── Photos ───────────────────────────────────────────────────────────────────
const PHOTOS = {
  39: 'Wrapped Christmas gifts stacked in the fellowship hall, ready to be given out',
  51: 'A table of wrapped Christmas gifts under garland and a Merry Christmas sign',
  54: 'The front of the sanctuary: the pulpit, the communion table carved In remembrance of me, and the baptistry behind',
  66: 'The red brick church building with its white steeple, front porch and ramp up to the doors',
  67: 'The church sign by the road, with the Sunday and Wednesday times and a red cross beside it',
  70: 'The fellowship hall set up as a food pantry, with tables of canned and boxed food',
};
const uploader = makeUploader();
const assetIds = {};
for (const [n, alt] of Object.entries(PHOTOS)) {
  const path = `${PHOTO_DIR}/fbca-fb-${n}.jpg`;
  if (APPLY) {
    assetIds[n] = await uploader.upload(path);
    await client.patch(assetIds[n]).set({ creditLine: CREDIT, altText: alt }).commit();
    console.log(`OK  photo ${n} -> ${assetIds[n]}`);
  } else {
    assetIds[n] = `image-DRYRUN-fbca-fb-${n}`;
    console.log(`DRY upload photo ${n} (${alt})`);
  }
}
const photo = (n) => ({ _type: 'image', alt: PHOTOS[n], asset: ref(assetIds[n]) });
const photoMember = (n) => ({ ...photo(n), _key: `fb-${n}` });

// ── Helpers ──────────────────────────────────────────────────────────────────
const blocks = (...texts) => texts.map((t) => (typeof t === 'string' ? p(t) : t));
const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});
function builder(docId, required) {
  const list = structuredClone(docs[docId].pageBuilder);
  const by = Object.fromEntries(list.map((b) => [b._key, b]));
  for (const k of required) if (!by[k]) throw new Error(`${docId} has no ${k} block.`);
  return { list, by };
}
const writes = []; // [label, docId, patchFn]
const plan = (label, id, fn) => writes.push([label, id, fn]);

// ── Home ─────────────────────────────────────────────────────────────────────
{
  const { list, by } = builder('homePage', ['home-hero', 'home-belong']);
  Object.assign(by['home-hero'], {
    eyebrow: 'First Baptist Church of',
    headline: 'Auburn',
    welcome: 'Come as you are.',
    subhead:
      '[Placeholder: A close-knit church family in Ross Township, where you will be known by name. If this is your first Sunday, someone will meet you at the door and save you a seat.]',
    primaryCta: internal('Plan your first visit', 'page-plan-your-visit'),
    secondaryCta: internal('Watch on Sunday', 'page-watch'),
    backgroundImage: {
      _type: 'image',
      alt: 'Two men embracing during a church gathering',
      asset: ref(STAND_IN_BELONG),
    },
  });
  Object.assign(by['home-belong'], {
    image: photo(70),
    extraImages: [photoMember(39), photoMember(51)],
    body: blocks(
      '[Jacob: two or three sentences of welcome in your own words. A draft to react to:]',
      '[Placeholder: Whether you have been coming for years or this is your first Sunday, there is a seat for you here. We are ordinary people who love Jesus, open the Bible together and look out for each other. Come as you are, and come and see.]',
    ),
  });
  // Coordinator follow-up (2026-10-23): the Give card goes to the site's own /give/ page.
  const ways = by['home-other-ways'];
  const give = ways?.cards?.find((c) => c._key === 'how-give');
  if (!give) throw new Error('Home has no how-give card in home-other-ways.');
  give.body = 'Give on Sunday, by mail, or online soon';
  give.link = { _type: 'ctaBlock', label: 'Give', linkType: 'external', externalUrl: '/give/' };
  plan(
    'homePage: hero texts and stand-in photo, belong mosaic (70, 39, 51), welcome, Give card to /give/',
    'homePage',
    (pt) => pt.set({ pageBuilder: list }),
  );
}

// ── About ────────────────────────────────────────────────────────────────────
{
  const { list, by } = builder('aboutPage', ['about-story', 'about-cta']);
  const i = list.indexOf(by['about-story']);
  list[i] = {
    _type: 'imageTextSection',
    _key: 'about-story',
    art: 'photo',
    image: photo(66),
    imageSide: 'left',
    heading: 'Who we are',
    body: blocks(
      '[Placeholder: First Baptist Church of Auburn is a close-knit Southern Baptist church on Hamilton-Scipio Road in Ross Township. We are ordinary people who gather on Sundays to worship, open the Bible together and look after each other through the week. Whoever you are, you are welcome here.]',
      '[Jacob: two or three sentences on how the church began, and the season it is in now.]',
    ),
  };
  by['about-cta'].cta = internal('Plan your visit', 'page-plan-your-visit');
  plan(
    'aboutPage: story draft with building photo (66); CTA to Plan your visit',
    'aboutPage',
    (pt) => pt.set({ pageBuilder: list }),
  );
}

// ── What we believe (asks only: doctrine is Jacob's) ─────────────────────────
{
  const { list, by } = builder('page-what-we-believe', [
    'wwb-short',
    'wwb-cards',
    'wwb-baptism',
    'wwb-full',
  ]);
  const i = list.indexOf(by['wwb-short']);
  list[i] = {
    _type: 'imageTextSection',
    _key: 'wwb-short',
    art: 'photo',
    image: photo(54),
    imageSide: 'left',
    heading: 'The short version',
    body: blocks(
      '[Jacob: the heart of our faith in two or three plain sentences, the way you would say it to a visitor over coffee.]',
    ),
  };
  const topics = {
    b1: ['the Bible', '2 Timothy 3:16'],
    b2: ['God: Father, Son and Holy Spirit', 'Matthew 28:19'],
    b3: ['who Jesus is and what he has done', 'John 1:14'],
    b4: ['how a person is saved', 'Ephesians 2:8-9'],
    b5: ['baptism and the Lord\u2019s Supper', 'Romans 6:4'],
    b6: ['the church and what it is for', 'Acts 2:42'],
  };
  for (const c of by['wwb-cards'].cards) {
    const t = topics[c._key];
    if (!t) continue;
    c.body = `[Jacob: two to four plain sentences on ${t[0]}.]`;
    c.note = `[Jacob: one verse, such as ${t[1]}]`;
  }
  by['wwb-baptism'].body = blocks(
    '[Jacob: what baptism means to this church, and what someone should do if they would like to be baptised.]',
  );
  by['wwb-full'].body = blocks(
    '[Jacob: the church\u2019s own statement of faith. If the church holds to the Baptist Faith and Message 2000 as written, this can say so and link to it instead.]',
  );
  plan(
    'page-what-we-believe: Jacob asks per topic, sanctuary photo (54)',
    'page-what-we-believe',
    (pt) => pt.set({ pageBuilder: list }),
  );
}

// ── Leadership ───────────────────────────────────────────────────────────────
{
  const { list, by } = builder('page-leadership', ['lead-pastor', 'lead-how']);
  by['lead-pastor'].body = blocks(
    '[Jacob: three or four sentences about you: how you came to Auburn, your family if you would like to share it, and what you love about this church. A photo of you goes beside it.]',
  );
  by['lead-how'].body = blocks(
    '[Jacob: a sentence or two on how the church is led: the congregation, the pastor and the deacons.]',
    '[Jacob: the deacons and ministry leaders you would like introduced here, each with their permission.]',
  );
  plan('page-leadership: bio and leadership asks', 'page-leadership', (pt) =>
    pt.set({ pageBuilder: list }),
  );
}

// ── Ministries ───────────────────────────────────────────────────────────────
{
  const { list, by } = builder('page-ministries', ['min-cards', 'min-serve']);
  for (const c of by['min-cards'].cards) {
    if (c.body && !c.body.startsWith('[')) c.body = `[Placeholder: ${c.body}]`;
  }
  const giveCard = by['min-give']?.cards?.find((c) => c._key === 'g1');
  if (giveCard) {
    giveCard.link = {
      _type: 'ctaBlock',
      label: 'Ways to give',
      linkType: 'external',
      externalUrl: '/give/',
    };
  }
  Object.assign(by['min-serve'], {
    art: 'photo',
    image: photo(70),
    body: blocks(
      '[Placeholder: At Christmas the church gathers gifts for families who need a hand, and the fellowship hall fills up with food for neighbours.]',
      '[Jacob: one or two real examples of how the church serves Auburn and Ross Township, and whether the food pantry runs through the year.]',
    ),
  });
  plan(
    'page-ministries: cards marked Placeholder, Serving our neighbours draft and photo (70)',
    'page-ministries',
    (pt) => pt.set({ pageBuilder: list }),
  );
}

// ── Plan your visit ──────────────────────────────────────────────────────────
{
  const { list, by } = builder('page-plan-your-visit', ['pyv-here']);
  const i = list.indexOf(by['pyv-here']);
  const here = {
    _type: 'imageTextSection',
    _key: 'pyv-here',
    art: 'photo',
    image: photo(66),
    imageSide: 'left',
    heading: 'Getting here',
    body: [
      p(
        strong('4241 Hamilton-Scipio Road'),
        ', Hamilton, Ohio, in the hamlet of Auburn, Ross Township.',
      ),
      p(
        '[Placeholder: Parking is free in the church lot in front of the building, and a ramp leads up to the front doors.]',
      ),
      p(
        '[Jacob: is there an accessible restroom inside, and anything else a first-time guest should know about getting in?]',
      ),
    ],
  };
  const sign = {
    _type: 'imageTextSection',
    _key: 'pyv-sign',
    art: 'photo',
    image: photo(67),
    imageSide: 'right',
    heading: 'Look for the sign',
    body: blocks(
      '[Placeholder: Our sign stands by the road with a red cross beside it, and it carries the Sunday and Wednesday times.]',
    ),
  };
  list.splice(i, 1, here, ...(by['pyv-sign'] ? [] : [sign]));
  plan(
    'page-plan-your-visit: Getting here with building photo (66), new sign section (67)',
    'page-plan-your-visit',
    (pt) => pt.set({ pageBuilder: list }),
  );
}

// ── Watch ────────────────────────────────────────────────────────────────────
{
  const { by, list } = builder('page-watch', ['w-live']);
  by['w-live'].body = [
    p(
      '[Placeholder: Sunday worship is streamed live on ',
      link('the church\u2019s Facebook page', FACEBOOK),
      '. Watch from home, or share it with someone who cannot be there.]',
    ),
  ];
  plan('page-watch: live text with the Facebook link', 'page-watch', (pt) =>
    pt.set({ pageBuilder: list }),
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const answer = (...parts) => [p(...parts)];
const FAQ_UPDATES = {
  'faq-where-do-i-go': answer(
    '[Placeholder: Come to the front doors. Someone will meet you there, show you around and point you to the coffee in the fellowship hall.]',
  ),
  'faq-how-long': answer(
    '[Placeholder: Worship lasts about an hour. Sunday School meets before it, if you would like to come to that too.]',
  ),
  'faq-sunday-school': answer(
    '[Placeholder: No. Sunday School is for all ages and meets before worship. Come for both, or just for worship.]',
  ),
  'faq-children': [
    p('[Placeholder: Children are always welcome in the service, and wiggles are fine.]'),
    p(
      '[Jacob: is there a nursery or children\u2019s room during worship, and who looks after it?]',
    ),
  ],
  'faq-watch-online': answer(
    '[Placeholder: Yes. Sunday worship is streamed live on ',
    link('the church\u2019s Facebook page', FACEBOOK),
    '.]',
  ),
  'faq-what-kind': answer(
    '[Placeholder: We are a close-knit Southern Baptist church in Ross Township. You can read what we believe on the What we believe page.]',
  ),
};
for (const [id, ans] of Object.entries(FAQ_UPDATES)) {
  plan(`${id}: answer marked Placeholder`, id, (pt) => pt.set({ answer: ans }));
}
const NEW_FAQS = [
  [
    'faq-what-to-wear',
    'faqcat-first-sunday',
    4,
    'What should I wear?',
    '[Placeholder: Whatever you are comfortable in. You will see everything from jeans to Sunday best, and nobody minds either way.]',
  ],
  [
    'faq-parking',
    'faqcat-first-sunday',
    5,
    'Where do I park?',
    '[Placeholder: Parking is free in the church lot in front of the building, and a ramp leads up to the front doors.]',
  ],
  [
    'faq-communion',
    'faqcat-church',
    2,
    'Do you take communion?',
    '[Jacob: how often the church shares the Lord\u2019s Supper, and who is welcome to take part.]',
  ],
  [
    'faq-baptism',
    'faqcat-church',
    3,
    'How do I ask about being baptised?',
    '[Jacob: how someone asks about being baptised here, and what happens next.]',
  ],
  [
    'faq-get-involved',
    'faqcat-church',
    4,
    'How can I get involved?',
    '[Placeholder: Come on a Sunday, stay for coffee and say hello. When you are ready, ask about Sunday School, Wednesday Bible study or helping out, and we will help you find your place.]',
  ],
];
const newFaqDocs = NEW_FAQS.map(([_id, cat, displayOrder, question, text]) => ({
  _id,
  _type: 'faqItem',
  question,
  answer: answer(text),
  categoryRef: ref(cat),
  displayOrder,
}));

// ── News and notes ───────────────────────────────────────────────────────────
plan('journal-category-one: Church news, real slug', 'journal-category-one', (pt) =>
  pt.set({
    title: 'Church news',
    slug: { _type: 'slug', current: 'church-news' },
    description: 'News and dates from the church family.',
  }),
);
plan('journal-category-two: Notes from Pastor Jacob, real slug', 'journal-category-two', (pt) =>
  pt.set({
    title: 'Notes from Pastor Jacob',
    slug: { _type: 'slug', current: 'notes-from-pastor-jacob' },
    description: 'Short notes from Pastor Jacob.',
  }),
);
plan('journalPage: CTA "Plan your visit" now links Plan your visit', 'journalPage', (pt) =>
  pt.set({ finalCta: internal('Plan your visit', 'page-plan-your-visit') }),
);
const post = {
  _id: 'journal-placeholder-note',
  _type: 'journalEntry',
  title: '[Placeholder: A note from Pastor Jacob]',
  slug: { _type: 'slug', current: 'a-note-from-pastor-jacob' },
  excerpt:
    '[Placeholder: An example post, so you can see how News and notes looks with something in it.]',
  coverImage: photo(54),
  categories: [{ ...ref('journal-category-two'), _key: 'cat-notes' }],
  author: 'Pastor Jacob',
  publishedAt: new Date().toISOString(),
  featured: false,
  body: blocks(
    '[Placeholder: This is an example post. News and notes is a place for short updates: something coming up, a thought from Sunday\u2019s message, or a thank you to the church family.]',
    '[Jacob: would you like this page? If so, what would you write about first, and how often?]',
  ),
};

// ── Sermons ──────────────────────────────────────────────────────────────────
const sermonsPage = {
  _id: 'sermonsPage',
  _type: 'sermonsPage',
  heroEyebrow: 'Sunday by Sunday',
  heroHeadline: 'Sermons',
  heroSubhead: 'Catch up on a Sunday you missed, or listen again.',
};
const lastSunday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
})();
const sermon = {
  _id: 'sermon-placeholder',
  _type: 'sermon',
  title: '[Placeholder: Sunday message title]',
  date: lastSunday,
  service: 'sunday-morning',
  slug: { _type: 'slug', current: `placeholder-sunday-message-${lastSunday.slice(0, 4)}` },
  summary:
    '[Jacob: a sentence or two about the message. An example sermon, to show how the page looks; the video link goes here once there is one.]',
};

// ── Contact and site settings: starter junk out, Facebook in ─────────────────
{
  const src = docs.contactPage.formSourceOptions ?? [];
  plan(
    'contactPage: unset starter budget and project-type options, drop "(replace me)" source',
    'contactPage',
    (pt) =>
      pt
        .unset(['formBudgetOptions', 'formProjectTypeOptions'])
        .set({ formSourceOptions: src.filter((s) => !/replace me/i.test(s)) }),
  );
  plan('siteSettings: unset starter travelFees, add Facebook social link', 'siteSettings', (pt) =>
    pt.unset(['travelFees']).set({
      socialLinks: [
        { _type: 'socialLink', _key: 'social-facebook', platform: 'Facebook', url: FACEBOOK },
      ],
    }),
  );
}

// ── Guard: no em or en dashes in anything we write ───────────────────────────
const newDocs = [...newFaqDocs, post, sermonsPage, sermon];
const scan = JSON.stringify([newDocs, writes.map((w) => w[0])]);
// The patches build their values from the same objects; walk them via a dry "set" capture.
const captured = [];
for (const [, , fn] of writes) {
  const fake = {
    set: (v) => (captured.push(v), fake),
    unset: () => fake,
  };
  fn(fake);
}
if (/[\u2013\u2014]/.test(scan + JSON.stringify(captured))) {
  throw new Error('An em or en dash slipped into the site text. Fix it before writing.');
}

// ── Write ────────────────────────────────────────────────────────────────────
for (const [label, id, fn] of writes) {
  await apply(label, () => fn(client.patch(id).ifRevisionId(docs[id]._rev)).commit());
}
for (const d of newDocs) {
  await apply(
    `createOrReplace ${d._type} ${d._id} (${d.title ?? d.question ?? d.heroHeadline})`,
    () => (d._id === 'sermonsPage' ? client.createIfNotExists(d) : client.createOrReplace(d)),
  );
}
done(writes.length + newDocs.length + Object.keys(PHOTOS).length);
