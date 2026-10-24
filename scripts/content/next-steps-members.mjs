// Newcomer and member audit (2026-10-24): what the reference church sites gave their regulars that
// Auburn did not. Everything is placeholder copy for Jacob ("[Jacob: ...]" asks and "[Placeholder: ...]"
// drafts), built from blocks the Studio already has so he can edit it all:
//   - /next-steps/ (new): a page head, a steps rail (know Jesus, baptism, membership, a group, serving),
//     and a closing band offering coffee with the pastor.
//   - Ministries: a Youth card after Kids (the road sign advertises Wednesday youth), a "who leads it,
//     where it meets" ask on each card, a child-safety ask on Kids, the Prayer card pointed at /prayer/,
//     and a new "Ways to serve" cards section after the cards.
//   - Contact: a "When life happens" cards section (visits, funerals, weddings, a hand when you need
//     it) in its Extra sections.
//   - Site settings: the menu leads About, Ministries, Events, Watch, Give (the header shows the first
//     five), then Next steps and Sermons join it; the footer gets Next steps (Visit) and Sermons
//     (Belong); "This number takes texts" is ticked as a placeholder (the For Jacob note asks).
// Creates only what is missing; a section or card already there (by _key) is left alone.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/next-steps-members.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/next-steps-members.mjs <backup-folder> --apply
// Before the deploy that adds phoneTakesTexts to the schema, add --skip-texts (see step 4).
// siteSettings, page-ministries and contactPage are written to <backup-folder> first.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});
const step = (key, icon, title, body, linkLabel, linkHref) => ({
  _type: 'railStep',
  _key: key,
  icon,
  gathering: 'none',
  title,
  body,
  ...(linkLabel ? { linkLabel, linkHref } : {}),
});
const card = (key, icon, title, body, extra = {}) => ({
  _type: 'iconCard',
  _key: key,
  ...(icon ? { icon } : {}),
  title,
  body,
  ...extra,
});
const navLink = (key, label, target) => ({
  _key: key,
  _type: 'navLink',
  label,
  ...(target.startsWith('/')
    ? { href: target }
    : { linkType: 'internal', internalPage: ref(target) }),
});

// ── /next-steps/ ─────────────────────────────────────────────────────────────
const NEXT = {
  _id: 'page-next-steps',
  _type: 'page',
  title: 'Next steps',
  slug: { _type: 'slug', current: 'next-steps' },
  seoTitle: 'Next steps | First Baptist Church of Auburn',
  seoDescription:
    'Knowing Jesus, baptism, membership, a group and a place to serve at First Baptist Church of Auburn in Hamilton, Ohio.',
  pageBuilder: [
    {
      _key: 'ns-hero',
      _type: 'heroSection',
      eyebrow: 'After your first Sunday',
      headline: 'Next steps',
      icon: 'map-pin',
      size: 'short',
      subhead:
        'Wherever you are with God, there is a next step, and someone here to take it with you.',
    },
    {
      _key: 'ns-steps',
      _type: 'stepsRailSection',
      heading: 'One step at a time',
      intro: 'None of these is a test. Take one when you are ready, and ask us about any of them.',
      steps: [
        step(
          'ns-jesus',
          'bible',
          'Know Jesus',
          '[Placeholder: God made you and loves you. Jesus died for our sins and rose again, and anyone who turns to him is forgiven and made new. If you would like to talk about what that means, Pastor Jacob would love to.]',
          'Read the good news',
          '/what-we-believe/',
        ),
        step(
          'ns-baptism',
          'praying-hands',
          'Be baptised',
          '[Jacob: what baptism means here, and what someone does if they would like to be baptised: a conversation with you, a class, which Sunday?]',
          'Ask about baptism',
          '/contact/',
        ),
        step(
          'ns-member',
          'coffee',
          'Become a member',
          '[Jacob: how someone joins the church: a class, a conversation with you, a vote of the church? Two or three sentences.]',
          'Ask about membership',
          '/contact/',
        ),
        step(
          'ns-group',
          'clock',
          'Find a group',
          'Sunday School at 9:45 has a class for every age, and Bible study and prayer meet on Wednesday evenings. [Jacob: any other groups people can join?]',
          'See ministries',
          '/ministries/',
        ),
        step(
          'ns-serve',
          'giving-hand',
          'Find a place to serve',
          'Greeters, the children’s room, music, the food pantry, workdays: a church family runs on people who pitch in.',
          'Ways to serve',
          '/ministries/',
        ),
      ],
      endHeading: 'You belong here.',
      primaryCta: internal('Talk to Pastor Jacob', 'contactPage'),
    },
    {
      _key: 'ns-cta',
      _type: 'ctaBandSection',
      headline: 'Not sure where to start?',
      subhead:
        '[Jacob: would you like to offer coffee with you as the easiest first step? A line here invites people to ask.]',
      cta: internal('Get in touch', 'contactPage'),
    },
  ],
};

// ── Ministries additions ─────────────────────────────────────────────────────
const LEADS = ' [Jacob: who leads it, and where it meets.]';
// No youth icon exists yet; the coffee cup (a place to hang out) stands in until one is drawn.
const YOUTH = card(
  'c-youth',
  'coffee',
  'Youth',
  '[Placeholder: A Wednesday night for students to ask real questions, open the Bible and have some fun.] [Jacob: the ages, what happens, and who leads it.]',
  { note: 'Wednesdays, 6:00 pm (to be confirmed)' },
);
const SERVE = {
  _key: 'min-serve-teams',
  _type: 'iconCardsSection',
  heading: 'Ways to serve',
  intro:
    'Every church family runs on people who pitch in. [Jacob: which of these teams exist, and who should people ask?]',
  cards: [
    card(
      's-greet',
      'coffee',
      'Greeters',
      'Say hello at the door and point people to coffee and a seat.',
    ),
    card(
      's-kids',
      'blocks',
      'The children’s room',
      'Help with the little ones during worship. Every volunteer is background-checked first (to be confirmed).',
    ),
    card('s-music', 'music', 'Music', 'Sing or play on Sundays. New voices are always welcome.'),
    card(
      's-pantry',
      'giving-hand',
      'Food pantry and outreach',
      '[Placeholder: Stock the shelves, sort donations, or help with the Christmas gifts for families.]',
    ),
    card(
      's-grounds',
      'map-pin',
      'Workdays and grounds',
      '[Placeholder: Mowing, painting and fixing: the building is cared for by its people.]',
    ),
    card(
      's-prayer',
      'praying-hands',
      'Prayer team',
      'Pray by name for the requests that come in through the week.',
      { link: internal('Tell us you would like to help', 'contactPage') },
    ),
  ],
};

// ── Contact: When life happens ───────────────────────────────────────────────
const CARE = {
  _key: 'ct-care',
  _type: 'iconCardsSection',
  heading: 'When life happens',
  intro:
    'Pastor Jacob is here for the hard days and the happy ones, whether or not you come on Sundays. [Jacob: the best way to reach you in an emergency, and whether you are happy for that to be on the site.]',
  cards: [
    card(
      'care-visit',
      'praying-hands',
      'In the hospital or at home',
      '[Placeholder: If you or someone you love is in the hospital or cannot get out, let us know and Pastor Jacob will visit.]',
    ),
    card(
      'care-funeral',
      'bible',
      'A funeral',
      '[Placeholder: We can help you plan a service, here or at the funeral home, whether or not your family attends.]',
    ),
    card(
      'care-wedding',
      'music',
      'A wedding',
      '[Jacob: do you marry couples who are not members, and what do you ask of them first?]',
    ),
    card(
      'care-help',
      'giving-hand',
      'A hand when you need it',
      '[Jacob: can the church help with food or a bill, and how should someone ask?]',
    ),
  ],
};

// ── Read and back up ─────────────────────────────────────────────────────────
const [settings, ministries, contact] = await Promise.all([
  client.getDocument('siteSettings'),
  client.getDocument('page-ministries'),
  client.getDocument('contactPage'),
]);
if (!settings?.navItems?.length) throw new Error('siteSettings has no navItems; read it first.');
if (!ministries?.pageBuilder?.length) throw new Error('page-ministries has no sections.');
if (!contact) throw new Error('No contactPage.');
for (const [name, doc] of [
  ['site-settings', settings],
  ['page-ministries', ministries],
  ['contact-page', contact],
]) {
  writeFileSync(join(dir, `${name}-before-next-steps.json`), JSON.stringify(doc, null, 2));
}
console.log(`Backed up siteSettings, page-ministries and contactPage to ${dir}\n`);

let n = 0;

// 1. The new page.
if (await client.getDocument(NEXT._id)) {
  console.log(`${NEXT._id} exists; left alone.`);
} else {
  n++;
  await apply(`create ${NEXT._id} (/next-steps/)`, () => client.create(NEXT));
}

// 2. Ministries.
const blocks = structuredClone(ministries.pageBuilder);
const cardsBlock = blocks.find((b) => b._key === 'min-cards');
if (!cardsBlock) throw new Error('Ministries has no min-cards section; read the page first.');
const changes = [];
for (const c of cardsBlock.cards) {
  if (['c2', 'c3', 'c4', 'c6'].includes(c._key) && !c.body?.includes('[Jacob: who leads')) {
    c.body = `${c.body ?? ''}${LEADS}`.trim();
    changes.push(`${c.title}: leader and place ask`);
  }
  if (c._key === 'c1' && !c.body?.includes('[Jacob: the ages')) {
    c.body = `${c.body ?? ''} [Jacob: the ages, the nursery hours, who leads it, and the child safety policy in a sentence (background checks, two adults in every room?).]`;
    changes.push('Kids: ages, nursery and safety ask');
  }
  if (c._key === 'c5' && c.link?.internalLink?._ref === 'contactPage') {
    c.link = internal('Send a prayer request', 'page-prayer');
    c.body = `${c.body ?? ''} [Jacob: who is on the prayer team?]`;
    changes.push('Prayer: link to /prayer/, team ask');
  }
}
const youth = cardsBlock.cards.find((c) => c._key === YOUTH._key);
if (youth && !youth.icon) {
  youth.icon = YOUTH.icon;
  changes.push('Youth: icon');
}
if (!youth) {
  const kids = cardsBlock.cards.findIndex((c) => c._key === 'c1');
  cardsBlock.cards.splice(kids + 1, 0, YOUTH);
  changes.push('Youth card after Kids');
}
if (!blocks.some((b) => b._key === SERVE._key)) {
  const at = blocks.findIndex((b) => b._key === 'min-cards');
  blocks.splice(at + 1, 0, SERVE);
  changes.push('Ways to serve section after the cards');
}
if (changes.length) {
  n++;
  console.log(`page-ministries:\n${changes.map((c) => `  - ${c}`).join('\n')}`);
  await apply('patch page-ministries.pageBuilder', () =>
    client.patch('page-ministries').set({ pageBuilder: blocks }).commit(),
  );
}

// 3. Contact.
const extras = contact.additionalSections ?? [];
if (!extras.some((b) => b._key === CARE._key)) {
  n++;
  await apply('contactPage: add When life happens', () =>
    client
      .patch('contactPage')
      .set({ additionalSections: [...extras, CARE] })
      .commit(),
  );
}

// 4. Menu, footer and the texts flag.
const byKey = Object.fromEntries(settings.navItems.map((x) => [x._key, x]));
for (const k of ['n-about', 'n-ministries', 'n-events', 'n-watch', 'n-give']) {
  if (!byKey[k]) throw new Error(`Navigation has no ${k}; read the document first.`);
}
const lead = ['n-about', 'n-ministries', 'n-events', 'n-watch', 'n-give'].map((k) => byKey[k]);
const added = [
  byKey['n-next'] ?? navLink('n-next', 'Next steps', 'page-next-steps'),
  byKey['n-sermons'] ?? navLink('n-sermons', 'Sermons', '/sermons/'),
];
const rest = settings.navItems.filter((x) => ![...lead, ...added].some((y) => y._key === x._key));
const navItems = [...lead, ...added, ...rest];
console.log('\nNew menu order (the header shows the first five):');
for (const x of navItems) console.log(`  ${x._key.padEnd(14)} ${x.label}`);

const footerColumns = structuredClone(settings.footerColumns ?? []);
const visit = footerColumns.find((c) => c._key === 'f-visit');
const belong = footerColumns.find((c) => c._key === 'f-belong');
if (visit && !visit.links.some((l) => l._key === 'fv-next')) {
  const i = visit.links.findIndex((l) => l._key === 'fv1');
  visit.links.splice(i + 1, 0, navLink('fv-next', 'Next steps', 'page-next-steps'));
}
if (belong && !belong.links.some((l) => l._key === 'fb-sermons')) {
  const i = belong.links.findIndex((l) => l._key === 'fb-watch');
  belong.links.splice(i + 1, 0, navLink('fb-sermons', 'Sermons', '/sermons/'));
}

// --skip-texts holds back phoneTakesTexts until the deploy that adds the field to the Studio (an
// unknown field shows the "Remove field" banner, CLAUDE.md rule 1); re-run without it afterwards.
const texts = process.argv.includes('--skip-texts') ? {} : { phoneTakesTexts: true };
n++;
await apply(
  `set siteSettings navItems, footerColumns${texts.phoneTakesTexts ? ', phoneTakesTexts' : ''}`,
  () =>
    client
      .patch('siteSettings')
      .set({ navItems, footerColumns, ...texts })
      .commit(),
);
done(n);
