// Four page shapes borrowed from a large church's site (2026-11-09), built from blocks this site
// already has and filled with marked drafts, the same convention as best-guess-drafts.mjs: every
// "[Placeholder: ...]" is our guess for Pastor Jacob to edit, and no bracket survives launch
// (docs/agent/content-pages.md, docs/PENDING.md 1zt).
//
//   1. Plan your visit, after "Your kids": "By age" (Cards with stone icons), three age bands, each
//      saying what a child does and what a parent can expect.
//   2. What we believe, after "Baptism": "Questions about baptism" (Questions block), six new
//      questions (faq-baptism-*), the ones a visitor from another tradition asks.
//   3. What we believe, after "The gospel, first": "How to begin" (Stepping-stone steps), the
//      gospel as Admit, Believe, Confess with one verse each.
//   4. About, after "Who we are": "Our story so far" (Stepping-stone steps), a timeline whose years
//      are blanks for Jacob to fill.
//
// Each section is added only if its key is not on the page yet, so a re-run changes nothing.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/borrowed-shapes.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/borrowed-shapes.mjs <backup-folder> --apply
// The three pages are written to <backup-folder>/borrowed-shapes-before.json first. Keep that
// folder outside the repo.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

/** Straight apostrophes in, typographic out, to match the rest of the site's copy. */
const typo = (s) => s.replace(/'/g, '’');
const draft = (text, ask) => typo(`[Placeholder: ${text}]${ask ? ` [Jacob: ${ask}]` : ''}`);
const jacob = (ask) => typo(`[Jacob: ${ask}]`);

// --- 1. Kids, by age -----------------------------------------------------------------------------
const kidsByAge = {
  _key: 'pyv-kids-ages',
  _type: 'iconCardsSection',
  heading: 'By age',
  intro: jacob(
    'our guess at your age groups. Correct the ages, what each group does and who leads it, or remove a card.',
  ),
  cards: [
    {
      _key: 'age-nursery',
      _type: 'iconCard',
      icon: 'blocks',
      title: 'Babies and toddlers',
      note: draft('Birth to age 3'),
      body: draft(
        'A nursery during worship, with toys, a Bible story and a snack. Sign your little one in before the service, and you will see the same faces looking after them each week. If you would rather keep your baby with you, that is fine too.',
      ),
    },
    {
      _key: 'age-children',
      _type: 'iconCard',
      icon: 'chalkboard',
      title: 'Children',
      note: draft('Age 4 to grade 5'),
      body: draft(
        'A Sunday School class before worship, with a Bible story, something to make and a verse to learn. During worship, children sit with their families. When you collect your child, the teacher will tell you what they learned so you can talk about it at home.',
      ),
    },
    {
      _key: 'age-students',
      _type: 'iconCard',
      icon: 'backpack',
      title: 'Students',
      note: draft('Grades 6 to 12'),
      body: draft(
        'A Sunday School class of their own, and youth group on Wednesday evenings: a game or a meal, the Bible opened, and leaders who know them by name.',
      ),
    },
  ],
};

// --- 2. Questions about baptism ------------------------------------------------------------------
const para = (id, text) => [
  {
    _key: `${id}-p`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _key: `${id}-s`, _type: 'span', marks: [], text }],
  },
];
const QUESTIONS = [
  [
    'faq-baptism-what',
    'What is baptism?',
    draft(
      'Baptism is a picture, acted out in water, of what Jesus has done for a believer: the old life buried with him, and a new life raised with him. It is the first public step of following him. Romans 6:4',
      'our drafts, from the Baptist Faith and Message, for you to rewrite. Add or remove questions as you like.',
    ),
  ],
  [
    'faq-baptism-ready',
    'How do I know I am ready?',
    draft(
      'If you have turned from your sin and put your trust in Jesus, you are ready. You do not need every answer or a tidied-up life first. Talk with Pastor Jacob and he will help you think it through.',
    ),
  ],
  [
    'faq-baptism-saves',
    'Does baptism save me?',
    draft(
      "No. We are saved by God's grace through faith in Jesus, and by nothing we do. Baptism does not add to that. It shows it, the way a wedding ring shows a marriage without making one. Ephesians 2:8-9",
    ),
  ],
  [
    'faq-baptism-immersion',
    'Why do you baptize by immersion?',
    draft(
      'Because that is what the New Testament shows: people went down into the water and came up out of it. Going under and coming up is also the clearest picture of a burial and a resurrection.',
    ),
  ],
  [
    'faq-baptism-infants',
    'Do you baptize babies?',
    draft(
      "No. In the New Testament, baptism follows a person's own faith, so we baptize people who are old enough to trust Jesus for themselves. We do gladly dedicate babies: parents promise to raise their child to know the Lord, and the church promises to help.",
      'do you hold baby dedications?',
    ),
  ],
  [
    'faq-baptism-before',
    'I was baptized as a baby, or in another church. What then?',
    draft(
      'If you were baptized by immersion after you came to faith, that baptism stands, wherever it happened. If you were baptized as an infant, we would ask you to be baptized as a believer. That says nothing against the faith of the family who brought you.',
      "is that the church's practice for people joining from other churches?",
    ),
  ],
];
const baptismFaq = {
  _key: 'wwb-baptism-faq',
  _type: 'faqSection',
  headline: 'Questions about baptism',
  items: QUESTIONS.map(([id]) => ({ _key: id, _type: 'reference', _ref: id })),
};

// --- 3. The gospel as three steps ----------------------------------------------------------------
const railStep = (key, icon, title, body, link) => ({
  _key: key,
  _type: 'railStep',
  icon,
  title,
  body,
  gathering: 'none',
  ...(link ? { linkLabel: link[0], linkHref: link[1] } : {}),
});
const howToBegin = {
  _key: 'wwb-abc',
  _type: 'stepsRailSection',
  heading: 'How to begin',
  intro: draft(
    'Following Jesus starts simply. Many people remember it as A, B, C.',
    'our draft. Change the three words or the verses to the way you explain it.',
  ),
  steps: [
    railStep(
      'abc-admit',
      'praying-hands',
      'Admit',
      draft('Admit to God that you have sinned and cannot save yourself. Romans 3:23'),
    ),
    railStep(
      'abc-believe',
      'bible',
      'Believe',
      draft(
        "Believe that Jesus is God's Son, that he died for your sins and that he rose again. John 3:16",
      ),
    ),
    railStep(
      'abc-confess',
      'giving-hand',
      'Confess',
      draft(
        'Confess Jesus as Lord. Tell him so in prayer, and then tell someone else. Romans 10:9',
      ),
      ['Tell Pastor Jacob', '/contact/?topic=question&about=I%20have%20trusted%20Christ'],
    ),
  ],
  endHeading: 'A new life begins here.',
};

// --- 4. The church's story as a timeline ---------------------------------------------------------
const timeline = {
  _key: 'about-timeline',
  _type: 'stepsRailSection',
  heading: 'Our story so far',
  intro: jacob(
    "a few dates tell a church's story better than a paragraph. These are blanks: give each a year and one true line, and add or remove steps as you like.",
  ),
  steps: [
    railStep(
      'tl-begin',
      'bible',
      typo('[Placeholder: 18__] A church begins'),
      draft(
        'A handful of families in Auburn begin meeting to worship, and call their first pastor.',
      ),
    ),
    railStep(
      'tl-building',
      'map-pin',
      typo('[Placeholder: 19__] The building goes up'),
      draft(
        "The brick church on Hamilton-Scipio Road is built, much of it by the members' own hands.",
      ),
    ),
    railStep(
      'tl-hall',
      'coffee',
      typo('[Placeholder: 19__] Room to gather'),
      draft('The fellowship hall is added, and church dinners have a home.'),
    ),
    railStep(
      'tl-neighbors',
      'giving-hand',
      typo('[Placeholder: 20__] Serving our neighbors'),
      draft('The food pantry and the Christmas gifts for local families begin.'),
    ),
    railStep(
      'tl-today',
      'praying-hands',
      typo('[Placeholder: 20__] A new season'),
      draft(
        'Pastor Jacob Wysong is called, and the church turns its attention to welcoming new neighbors.',
      ),
    ),
  ],
  endHeading: 'And the story goes on.',
};

// [page id, the block it goes after, the new block]
const SECTIONS = [
  ['page-plan-your-visit', 'pyv-kids', kidsByAge],
  ['page-what-we-believe', 'wwb-baptism', baptismFaq],
  ['page-what-we-believe', 'wwb-short', howToBegin],
  ['aboutPage', 'about-story', timeline],
];

const ids = [...new Set(SECTIONS.map(([id]) => id))];
const docs = await client.fetch('*[_id in $ids]', { ids });
const byId = new Map(docs.map((d) => [d._id, d]));
const draftCopies = await client.fetch('*[_id in $ids]._id', {
  ids: ids.map((id) => `drafts.${id}`),
});
if (draftCopies.length) {
  console.error(
    `Unpublished drafts exist (${draftCopies.join(', ')}). Publish or discard them first.`,
  );
  process.exit(1);
}
writeFileSync(join(dir, 'borrowed-shapes-before.json'), JSON.stringify(docs, null, 2));

let count = 0;
for (const [id, question, text] of QUESTIONS) {
  count += 1;
  console.log(`\n${id}: ${question}\n  ${text}`);
  await apply(`${id}: create if missing`, () =>
    client.createIfNotExists({
      _id: id,
      _type: 'faqItem',
      question,
      answer: para(id, text),
      categoryRef: { _type: 'reference', _ref: 'faqcat-church' },
      displayOrder: 20 + QUESTIONS.findIndex(([q]) => q === id),
    }),
  );
}
for (const [id, after, section] of SECTIONS) {
  const blocks = byId.get(id)?.pageBuilder ?? [];
  if (blocks.some((b) => b._key === section._key)) {
    console.log(`SKIP ${id}: ${section._key} is already there`);
    continue;
  }
  if (!blocks.some((b) => b._key === after)) {
    console.log(`SKIP ${id}: no block "${after}" to put ${section._key} after`);
    continue;
  }
  count += 1;
  console.log(`\n${id}: ${section._type} "${section.heading ?? section.headline}" after ${after}`);
  await apply(`${id}: add ${section._key}`, () =>
    client.patch(id).insert('after', `pageBuilder[_key=="${after}"]`, [section]).commit(),
  );
}
done(count);
