// What the large SBC church sites do, brought to Auburn (2026-10-23; the audit of Summit,
// Prestonwood, Second Baptist Houston, Bellevue and Brentwood is in the studio's notes):
//
// 1. What we believe, on the Prestonwood model with Summit's order: the gospel first, then short
//    headed topics with a verse each, then a plain line affirming the Baptist Faith and Message
//    2000 with a link. Every word is still Jacob's to write: these are asks and a marked
//    placeholder, never doctrine of ours.
// 2. Home: "Meet Pastor Jacob" (Bellevue), after This week and Last Sunday.
// 3. Plan your visit: the closing band's "Tell us you are visiting" opens Contact with the visit
//    filled in (/contact/?visit=sunday-11), like the walk's own end link.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/sbc-patterns.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/sbc-patterns.mjs <backup-folder> --apply
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
const IDS = ['page-what-we-believe', 'homePage', 'page-plan-your-visit'];
const docs = {};
for (const id of IDS) {
  docs[id] = await client.getDocument(id);
  if (!docs[id]) throw new Error(`Missing ${id}`);
  writeFileSync(join(dir, `${id}-before-sbc-patterns.json`), JSON.stringify(docs[id], null, 2));
}
console.log(`Backed up ${IDS.join(', ')} to ${dir}`);

const para = (key, children, markDefs = []) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs,
  children,
});
const span = (key, text, marks = []) => ({ _type: 'span', _key: key, marks, text });

// ── 1. What we believe ───────────────────────────────────────────────────────
const wwb = docs['page-what-we-believe'];
const keys = wwb.pageBuilder.map((b) => b._key);
for (const k of ['wwb-short', 'wwb-cards', 'wwb-full']) {
  if (!keys.includes(k)) throw new Error(`What we believe has no ${k}; read it first.`);
}
const old = Object.fromEntries(
  wwb.pageBuilder.find((b) => b._key === 'wwb-cards').cards.map((c) => [c._key, c]),
);
const card = (key, title, body, note, icon) => ({
  _type: 'iconCard',
  _key: key,
  title,
  body,
  note,
  ...(icon ? { icon } : {}),
});
const keep = (key) => {
  const c = old[key];
  if (!c) throw new Error(`No card ${key}`);
  return c;
};
const cards = [
  keep('b2'), // God
  card(
    'b3',
    'Jesus',
    old.b3?.body ?? '[Jacob: two to four plain sentences on who Jesus is and what he has done.]',
    old.b3?.note ?? '[Jacob: one verse, such as John 1:14]',
  ),
  card(
    'b7',
    'The Holy Spirit',
    '[Jacob: two to four plain sentences on the Holy Spirit and his work in a believer.]',
    '[Jacob: one verse, such as John 14:26]',
  ),
  keep('b1'), // The Bible
  card(
    'b8',
    'People and sin',
    '[Jacob: two to four plain sentences on how God made people, and what went wrong.]',
    '[Jacob: one verse, such as Romans 3:23]',
  ),
  keep('b4'), // Salvation
  keep('b5'), // Baptism and the Lord's Supper
  keep('b6'), // The church
  card(
    'b9',
    'Jesus will return',
    '[Jacob: two to four plain sentences on the return of Christ and what comes after.]',
    '[Jacob: one verse, such as John 14:3]',
  ),
];
const shortBody = [
  para('wwb-short-p1', [
    span(
      'wwb-short-p1-s1',
      '[Jacob: the good news in three or four plain sentences, the way you would tell a visitor over coffee: who Jesus is, what he did, and what it means for them. Everything below grows out of this.]',
    ),
  ]),
];
const fullBody = [
  para(
    'wwb-full-p1',
    [
      span(
        'wwb-full-p1-s1',
        '[Placeholder: We affirm the Baptist Faith and Message 2000, the confession of faith of the Southern Baptist Convention, as our full statement of faith. Read it at ',
      ),
      span('wwb-full-p1-s2', 'bfm.sbc.net', ['bfm-link']),
      span('wwb-full-p1-s3', '.]'),
    ],
    [{ _type: 'link', _key: 'bfm-link', href: 'https://bfm.sbc.net/bfm2000/' }],
  ),
  para('wwb-full-p2', [
    span(
      'wwb-full-p2-s1',
      '[Jacob: is this right? If the church holds to the Baptist Faith and Message as written, this line stays and links to it. The SBC page notes a later change to Article VI, on the office of pastor, so check you are happy with its current wording.]',
    ),
  ]),
];
await apply('What we believe: gospel first, nine topic asks, the BF&M line', () =>
  client
    .patch('page-what-we-believe')
    .set({
      'pageBuilder[_key=="wwb-short"].heading': 'The gospel, first',
      'pageBuilder[_key=="wwb-short"].body': shortBody,
      'pageBuilder[_key=="wwb-cards"].cards': cards,
      'pageBuilder[_key=="wwb-full"].heading': 'Our confession of faith',
      'pageBuilder[_key=="wwb-full"].body': fullBody,
    })
    .commit(),
);

// ── 2. Home: Meet Pastor Jacob ───────────────────────────────────────────────
const home = docs.homePage;
if (!home.pageBuilder.some((b) => b._key === 'home-pastor')) {
  if (!home.pageBuilder.some((b) => b._key === 'home-watch'))
    throw new Error('Home has no home-watch.');
  const pastor = {
    _type: 'imageTextSection',
    _key: 'home-pastor',
    art: 'photo',
    imageSide: 'right',
    eyebrow: 'Our pastor',
    heading: 'Meet Pastor Jacob',
    body: [
      para('home-pastor-p1', [
        span(
          'home-pastor-p1-s1',
          '[Jacob: three or four sentences: your name, your family if you would like to share it, how you came to Auburn, and what you hope someone finds here on their first Sunday.]',
        ),
      ]),
    ],
    cta: {
      _type: 'ctaBlock',
      label: 'More about our leadership',
      linkType: 'external',
      externalUrl: '/leadership/',
    },
  };
  await apply('Home: add "Meet Pastor Jacob" after Last Sunday', () =>
    client.patch('homePage').insert('after', 'pageBuilder[_key=="home-watch"]', [pastor]).commit(),
  );
}

// ── 3. Plan your visit: the closing band opens Contact with the visit filled in ─
await apply('Plan your visit: closing band links to /contact/?visit=sunday-11', () =>
  client
    .patch('page-plan-your-visit')
    .set({
      'pageBuilder[_key=="pyv-cta"].cta': {
        _type: 'ctaBlock',
        label: 'Tell us you are coming',
        linkType: 'external',
        externalUrl: '/contact/?visit=sunday-11',
      },
    })
    .commit(),
);
done(3);
