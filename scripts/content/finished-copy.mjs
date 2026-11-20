// Finished copy (2026-11-19). The 2026-11-09 pass (best-guess-drafts.mjs, borrowed-shapes.mjs)
// left 117 "[Placeholder: ...]" drafts and a set of "[Jacob: ...]" asks across the site. This pass
// turns them into finished copy, so the site no longer waits on the pastor to write it:
//
//   - Facts and voice come from the church's own public posts (its Facebook page and the pastor's
//     sermon clips): service times, the Wednesday meal and studies, Easter, the movie nights, the
//     fall bonfire, the coat giveaway, the Christmas gifts and program, the road sign and the ramp.
//   - Belief and usual practice come from the Baptist Faith and Message 2000 and the plain way
//     Southern Baptist churches put things. These are written as finished text, and the beliefs
//     pages are flagged for the pastor to approve before launch (docs/PENDING.md 1zt).
//   - A fact that no post gives (nursery ages, the child safety policy, office hours, who counts
//     the offering, the access inside the building) stays a short "[Jacob: ...]" ask. Nothing is
//     invented to fill it.
//
// Home's "The good news" (home-gospel) is NOT touched here: home-good-news-bricks.mjs rebuilds it.
//
// Each change is guarded: it is skipped unless the field still holds the text this script expects
// (`was`), so anything edited in the Studio since is never overwritten.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/finished-copy.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/finished-copy.mjs <backup-folder> --apply
// Every document it touches is written to <backup-folder>/finished-copy-before.json first.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

/** Straight quotes in, typographic quotes out, to match the rest of the site's copy. */
const typo = (s) =>
  s
    .replace(/(^|[\s(])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/'/g, '’');

/** The words inside a "[Placeholder: ...]", with any "[Jacob: ...]" after it dropped. */
const unwrapText = (s) => {
  const m = /^\[Placeholder: ([^\]]*)\]/.exec(s);
  if (!m) throw new Error(`not a placeholder: ${s.slice(0, 60)}`);
  return m[1];
};

/** One child safety ask, worded the same in its three places. */
export const SAFETY_ASK =
  '[Jacob: your child safety policy in one sentence: background checks, how many adults are in a room, and how children are signed in and picked up. It shows on Plan your visit and twice on Ministries, word for word the same, and it must be exactly true before launch.]';

const NURSERY_ASK =
  '[Jacob: is there a nursery during worship? If so, for what ages, where do parents sign children in and pick them up, and does it run for the whole service?]';

// Path helpers (Sanity patch paths with _key filters).
const block = (section, blockKey, spanKey) =>
  `pageBuilder[_key=="${section}"].body[_key=="${blockKey}"].children[_key=="${spanKey}"].text`;
const blockOnly = (section, blockKey) =>
  `pageBuilder[_key=="${section}"].body[_key=="${blockKey}"]`;
const card = (section, cardKey, field = 'body') =>
  `pageBuilder[_key=="${section}"].cards[_key=="${cardKey}"].${field}`;
const fyp = (group, cardKey, field = 'body') =>
  `pageBuilder[_key=="min-fyp"].groups[_key=="${group}"].cards[_key=="${cardKey}"].${field}`;
const step = (section, stepKey, field = 'body') =>
  `pageBuilder[_key=="${section}"].steps[_key=="${stepKey}"].${field}`;
const answer = (blockKey, spanKey) =>
  `answer[_key=="${blockKey}"].children[_key=="${spanKey}"].text`;

// Each op: { id, path, was, value }  set the field (value may be a function of the current value)
//          { id, path, was, unset: true }  remove it (an ask block that is no longer needed)
// `was` is what the current value must start with (strings), or a predicate.
const OPS = [];
const set = (id, path, was, value) => OPS.push({ id, path, was, value });
const unwrap = (id, path) => OPS.push({ id, path, was: '[Placeholder:', value: unwrapText });
const unset = (id, path, was) => OPS.push({ id, path, was, unset: true });

// ── About ────────────────────────────────────────────────────────────────────────────────────
set(
  'aboutPage',
  block('about-story', 'k6', 'k7'),
  '[Placeholder: First Baptist Church of Auburn has gathered',
  typo(
    'First Baptist Church of Auburn is a Southern Baptist church on Hamilton-Scipio Road in Ross Township, and here everyone is family and loves the Lord. We are ordinary people serving an extraordinary God: we open the Bible on Sunday mornings and Wednesday nights, eat together, and look for ways to love our neighbors well.',
  ),
);
set(
  'aboutPage',
  block('about-story', 'ap40', 'ap39'),
  '[Placeholder: Ask around Auburn',
  typo(
    'Ask around Auburn and you might hear about the coats, food and hygiene supplies we hand out before the cold weather comes, the Christmas gifts gathered for the children in our church family (one year, 35 children in 16 families), the movie nights on the lawn, or the tall red cross that stands beside our sign.',
  ),
);
// The timeline had five blank years. No post gives the church's dates, so it becomes the year as
// the church's own posts show it, Easter to Christmas, and keeps its block keys.
set(
  'aboutPage',
  'pageBuilder[_key=="about-timeline"].heading',
  'Our story so far',
  'A year with us',
);
set(
  'aboutPage',
  'pageBuilder[_key=="about-timeline"].intro',
  '[Jacob: a few dates',
  'Most years here look something like this.',
);
const year = [
  [
    'tl-begin',
    '[Placeholder: 18__]',
    'Easter',
    'Breakfast together before worship, baptisms and the Lord’s Supper, and an egg hunt to follow.',
  ],
  [
    'tl-building',
    '[Placeholder: 19__] The building',
    'Summer',
    'Free movie nights on the lawn, with pizza, popcorn and a bounce house, and free haircuts for kids before school starts.',
  ],
  [
    'tl-hall',
    '[Placeholder: 19__] Room',
    'Fall',
    'A coat giveaway before the cold weather comes, and a bonfire with chili, hot dogs and s’mores.',
  ],
  [
    'tl-neighbors',
    '[Placeholder: 20__] Serving',
    'Christmas',
    'The children’s Christmas program, carols and the Lord’s Supper, and gifts gathered for the children in our church family.',
  ],
  [
    'tl-today',
    '[Placeholder: 20__] A new',
    'Every week',
    'Sunday School and worship on Sunday morning, and a meal and Bible study on Wednesday night. Come and see.',
  ],
];
for (const [k, was, title, body] of year) {
  set('aboutPage', step('about-timeline', k, 'title'), was, title);
  set('aboutPage', step('about-timeline', k), '[Placeholder:', body);
}
set(
  'aboutPage',
  block('about-sunday', 'ap42', 'ap41'),
  '[Placeholder: Sunday morning here is simple.',
  typo(
    'Sunday starts with coffee and Sunday School, then worship. We sing, pray for one another and open the Bible, and Pastor Jacob preaches through books of the Bible a passage at a time. The whole service runs about an hour, and if you cannot be there, it is live on our Facebook page.',
  ),
);
set(
  'aboutPage',
  block('about-building', 'about-building-p1', 'about-building-p1-s1'),
  '[Placeholder: A brick church',
  typo(
    'A red brick church with a white porch and a steeple, on Hamilton-Scipio Road. A ramp runs from the parking lot up to the front doors, and a tall red cross stands beside our sign by the road.',
  ),
);
set(
  'aboutPage',
  block('about-building', 'about-building-p2', 'about-building-p2-s1'),
  '[Placeholder: The building has been looked after',
  typo(
    'Inside there is room for a meal and a crowd: the Wednesday dinners, cookies and punch after the children’s Christmas program, and tables full of coats, food and Christmas gifts when the church gives them away.',
  ),
);

// ── Contact and Prayer ───────────────────────────────────────────────────────────────────────
set(
  'contactPage',
  'formIntroNote',
  'A real person reads every message, usually within a day or two. [Placeholder:',
  'A real person reads every message, usually within a day or two. You can also call or text the church phone.',
);
set(
  'form-prayer',
  'intro',
  'Tell us what to pray for, in as few or as many words as you like. [Placeholder:',
  'Tell us what to pray for, in as few or as many words as you like. Your request goes to Pastor Jacob, and he will pray for you. Tick the box below if you would like the church family to pray too.',
);

// ── Home (not the good news) ─────────────────────────────────────────────────────────────────
set(
  'homePage',
  'pageBuilder[_key=="home-hero"].subhead',
  '[Placeholder: A church family',
  'Here at First Baptist Church of Auburn, everyone is family and loves the Lord. Come as you are, open the Bible with us, and you will not stay a stranger for long.',
);
unset('homePage', blockOnly('home-belong', 'k0'), (b) =>
  b?.children?.[0]?.text?.startsWith('[Jacob: two or three sentences of welcome'),
);
set(
  'homePage',
  block('home-belong', 'ap6', 'ap5'),
  '[Placeholder: Whether you have been coming',
  'Whether you have been coming for years or this is your first Sunday, there is a seat for you here. We are ordinary people serving an extraordinary God: we open the Bible together, share a meal on Wednesday nights and look out for each other. Come and see.',
);
set(
  'homePage',
  block('home-pastor', 'home-pastor-p1', 'home-pastor-p1-s1'),
  '[Placeholder: Hi, I’m Jacob Wysong',
  typo(
    "Hi, I'm Jacob Wysong, and I have the privilege of serving as pastor here. My wife, Kassie, and I are so grateful to call this church our family. On Sundays I open the Bible and say plainly what it says, because the biggest question any of us will ever answer is what we did with Jesus. I would love to meet you.",
  ),
);

// ── News and notes: the example post becomes a real one, from the church's own invitation ─────
set(
  'journal-placeholder-note',
  'title',
  '[Placeholder: A note from Pastor Jacob]',
  'Children’s Christmas Program, December 2',
);
set(
  'journal-placeholder-note',
  'excerpt',
  '[Placeholder:',
  'Our kids have been practicing every week. Come and hear them on Wednesday, December 2, at 7:30 in the evening.',
);
set(
  'journal-placeholder-note',
  'body[_key=="k65"].children[_key=="k66"].text',
  '[Placeholder: This is an example post.',
  'Our kids have been working hard, learning their songs and getting ready to share a little Christmas joy with you. Come to the Children’s Christmas Program on Wednesday, December 2, at 7:30 in the evening, here at the church.',
);
set(
  'journal-placeholder-note',
  'body[_key=="k67"].children[_key=="k68"].text',
  '[Jacob: would you like this page?',
  'Come for an evening of Christmas music, celebrate the birth of our Savior, and encourage the children who have been practicing each week. A sign language interpreter will be part of the program, so everyone can share in the evening, and there are cookies and punch downstairs afterward. Bring your family and invite a friend. We would love to see you there!',
);
set(
  'journal-placeholder-note',
  'slug.current',
  'a-note-from-pastor-jacob',
  'childrens-christmas-program-2026',
);
set('journal-placeholder-note', 'publishedAt', '2026-10-24', '2026-11-19T12:00:00.000Z');

// ── Events ───────────────────────────────────────────────────────────────────────────────────
set(
  'page-events',
  'pageBuilder[_key=="ev-coming"].emptyText',
  'Nothing special is on the calendar just now, so Sunday morning or Wednesday evening is the best time to meet everyone. [Jacob:',
  'Nothing special is on the calendar just now, so Sunday morning or Wednesday evening is the best time to meet everyone. News goes up on our Facebook page first.',
);

// ── Give ─────────────────────────────────────────────────────────────────────────────────────
set(
  'page-give',
  block('gv-care', 'gv-care-1', 'gv-care-1-s'),
  '[Placeholder: Every offering is counted',
  'Giving here is worship, not a bill. Jesus noticed the widow who gave two small coins, because God looks at the heart more than the size of the gift. Give what you have decided in your heart to give, and give it cheerfully. 2 Corinthians 9:7',
);
set(
  'page-give',
  block('gv-care', 'gv-care-2', 'gv-care-2-s'),
  '[Placeholder: If you give by check',
  '[Jacob: who counts the offering, and does anyone who gives by check or envelope get a statement for their taxes each January? Who should people ask?]',
);
set(
  'page-give',
  block('gv-care', 'gv-care-3', 'gv-care-3-s'),
  '[Placeholder: The church votes on its budget',
  '[Jacob: does the church vote on a yearly budget, and may any member see the figures?]',
);
set(
  'page-give',
  block('gv-care', 'gv-care-4', 'gv-care-4-s'),
  '[Placeholder: Through the Cooperative Program',
  'Through the Cooperative Program, Southern Baptist churches pool part of their giving to send missionaries, train pastors and start new churches. Part of what is given here goes on to that work, carrying the gospel far beyond Auburn.',
);

// ── Leadership ───────────────────────────────────────────────────────────────────────────────
set(
  'page-leadership',
  block('lead-pastor', 'k14', 'k15'),
  '[Placeholder: Jacob Wysong serves',
  'Jacob Wysong is the senior pastor of First Baptist Church of Auburn. He and his wife, Kassie, have served this church family for several years, and they count its people as their own family. Like many pastors of small churches, Jacob works another job through the week as well. He preaches through the Bible passage by passage, and Kassie leads the women’s Bible study and teaches the children. He would be glad to meet you.',
);
unset('page-leadership', blockOnly('lead-pastor', 'ap62'), (b) =>
  b?.children?.[0]?.text?.startsWith('[Jacob: a 30-second video'),
);
set(
  'page-leadership',
  block('lead-how', 'ap69', 'ap68'),
  '[Placeholder: We are a congregational church',
  'We are a congregational church: the members vote on the big decisions, such as receiving new members, the yearly budget and calling a pastor. The pastor leads and teaches, and others serve alongside him. Dr. Richard Rhodus, known here as Pastor Rick, often preaches and leads the Wednesday night Bible study.',
);

// ── Ministries ───────────────────────────────────────────────────────────────────────────────
set(
  'page-ministries',
  fyp('g-new', 'n-coffee'),
  '[Placeholder:',
  'Want to talk before you visit, or after? Call or text the church, and Pastor Jacob will be glad to sit down with you and answer anything.',
);
set(
  'page-ministries',
  fyp('g-every', 'e-school'),
  '[Placeholder:',
  'Classes before worship, working through the Bible together, with the coffee on.',
);
set(
  'page-ministries',
  fyp('g-every', 'a-fellowship'),
  '[Placeholder:',
  'A meal every Wednesday night, cookies and punch after the Christmas program, and a bonfire with s’mores in the fall.',
);
set(
  'page-ministries',
  fyp('g-kids', 'k-kids'),
  '[Placeholder: Sunday School classes for children',
  `On Wednesday nights the kids have their own Bible study, with a meal for them too, and every Christmas they put on a program for the whole church. Ms. Kassie teaches them about God’s love and the sacrifice of Jesus. ${SAFETY_ASK}`,
);
set(
  'page-ministries',
  fyp('g-kids', 'k-youth'),
  '[Placeholder:',
  'Youth meets on Wednesday nights while the adults are at Bible study: the Bible opened, real questions and some fun.',
);
set(
  'page-ministries',
  fyp('g-adults', 'a-bible'),
  '[Placeholder:',
  'On Wednesday nights, dinner and then Bible study, working through a book of the Bible together. There are men’s and women’s Bible studies through the year too.',
);
set(
  'page-ministries',
  fyp('g-adults', 'a-music'),
  '[Placeholder:',
  '[Jacob: is there a music team or choir people can join? If not, take this card out (it is under Serve too).]',
);
set(
  'page-ministries',
  fyp('g-serve', 's-kids'),
  'Help with the little ones during worship. [Placeholder:',
  `Help with the kids on Wednesday nights and at events like the Christmas program. ${SAFETY_ASK}`,
);
set('page-ministries', fyp('g-serve', 's-pantry', 'title'), 'Food pantry and outreach', 'Outreach');
set(
  'page-ministries',
  fyp('g-serve', 's-pantry'),
  '[Placeholder:',
  'Collect coats, food and personal care items, and help hand them out when we serve our neighbors.',
);
set(
  'page-ministries',
  fyp('g-serve', 's-grounds'),
  '[Placeholder:',
  'Mowing, fixing and building, from the church grounds to a neighbor’s chicken coop.',
);
set(
  'page-ministries',
  'pageBuilder[_key=="min-fyp"].groups[_key=="g-serve"].line',
  'Every church family runs on people who pitch in. [Jacob:',
  'Every church family runs on people who pitch in. Tell Pastor Jacob where you would like to help.',
);
set(
  'page-ministries',
  fyp('g-care', 'c-prayer'),
  '[Placeholder:',
  'Send a request any time, and we will pray for you by name.',
);
set(
  'page-ministries',
  block('min-serve', 'k20', 'k21'),
  '[Placeholder: At Christmas',
  'Before the cold weather comes, the church gathers coats, hats, gloves, food and personal care items and gives them away to families who need them, with help from Matthew 25 Ministries.',
);
set(
  'page-ministries',
  block('min-serve', 'k22', 'k23'),
  '[Placeholder: Through the year',
  'At Christmas we gather gifts for the children in our children’s ministry: one year, 35 children in 16 families. In summer there are free haircuts for kids before school, and through the year we visit our neighbors at a local nursing home.',
);

// ── Next steps ───────────────────────────────────────────────────────────────────────────────
unwrap('page-next-steps', block('ns-know', 'ap50', 'ap49'));
set(
  'page-next-steps',
  step('ns-steps', 'ns-baptism'),
  '[Placeholder: Baptism is how',
  'Baptism is how a believer says in front of everyone, I belong to Jesus. We baptize by immersion, after a person has trusted Christ. If that is you, tell Pastor Jacob. He will talk it through with you, and we will set a Sunday for the whole church family to celebrate.',
);
unwrap('page-next-steps', step('ns-steps', 'ns-member'));
set(
  'page-next-steps',
  step('ns-steps', 'ns-group'),
  'Sunday School before worship has a class for every age, and Bible study and prayer meet on Wednesday evenings. [Jacob:',
  'Sunday School before worship has a class for every age, and on Wednesday nights there is a meal and Bible study for adults, youth and children. Men’s and women’s Bible studies meet through the year too.',
);
set(
  'page-next-steps',
  'pageBuilder[_key=="ns-cta"].subhead',
  '[Placeholder:',
  'Not sure where to start? Call or text the church, and Pastor Jacob will be glad to talk.',
);

// ── Need the pastor? ─────────────────────────────────────────────────────────────────────────
set(
  'page-pastoral-care',
  block('pc-reach', 'ap85', 'ap84'),
  '[Placeholder: If it cannot wait',
  'If it cannot wait, call or text the church phone and say it is urgent. Pastor Jacob will get back to you as soon as he can.',
);
set(
  'page-pastoral-care',
  card('pc-care', 'pc-visit'),
  '[Placeholder:',
  'If you or someone you love is in the hospital or cannot get out, let us know and we will come and see you.',
);
set(
  'page-pastoral-care',
  card('pc-care', 'pc-communion'),
  '[Placeholder:',
  'If you cannot get to church, ask Pastor Jacob about sharing the Lord’s Supper with you at home or in the hospital.',
);
unwrap('page-pastoral-care', card('pc-care', 'pc-funeral'));
set(
  'page-pastoral-care',
  card('pc-care', 'pc-wedding'),
  '[Placeholder:',
  'Pastor Jacob is glad to talk with any couple planning to marry. Please get in touch well before the date, so there is time to meet and get ready together.',
);
unwrap('page-pastoral-care', card('pc-care', 'pc-help'));

// ── Plan your visit ──────────────────────────────────────────────────────────────────────────
set(
  'page-plan-your-visit',
  block('pyv-kids', 'ap10', 'ap9'),
  '[Placeholder: Babies and toddlers',
  `Children are welcome in worship, and nobody minds a little noise. Sunday School before worship and Wednesday nights both have a class just for them. ${NURSERY_ASK}`,
);
set(
  'page-plan-your-visit',
  block('pyv-kids', 'ap12', 'ap11'),
  '[Placeholder: Every adult',
  SAFETY_ASK,
);
set(
  'page-plan-your-visit',
  'pageBuilder[_key=="pyv-kids-ages"].intro',
  '[Jacob: our guess at your age groups',
  'Kids are part of the church family here, on Sunday mornings and Wednesday nights.',
);
set(
  'page-plan-your-visit',
  card('pyv-kids-ages', 'age-nursery'),
  '[Placeholder:',
  '[Jacob: is there a nursery during worship? If so, the ages and what happens there. If not, take this card out.]',
);
unset('page-plan-your-visit', card('pyv-kids-ages', 'age-nursery', 'note'), '[Placeholder:');
set(
  'page-plan-your-visit',
  card('pyv-kids-ages', 'age-children'),
  '[Placeholder:',
  'Sunday School before worship, with a Bible story and a verse to learn, and their own Bible study and a meal on Wednesday nights. Every Christmas they put on a program for the whole church.',
);
set(
  'page-plan-your-visit',
  card('pyv-kids-ages', 'age-children', 'note'),
  '[Placeholder:',
  'Sundays and Wednesdays',
);
set(
  'page-plan-your-visit',
  card('pyv-kids-ages', 'age-students'),
  '[Placeholder:',
  'A Sunday School class of their own, and youth on Wednesday nights: the Bible opened, real questions and some fun.',
);
set(
  'page-plan-your-visit',
  card('pyv-kids-ages', 'age-students', 'note'),
  '[Placeholder:',
  'Wednesday nights',
);
set(
  'page-plan-your-visit',
  'pageBuilder[_key=="pyv-map"].note',
  '[Placeholder:',
  'Our sign by the road reads Auburn Baptist Church, with a tall red cross beside it, and it carries the Sunday and Wednesday times.',
);
set(
  'page-plan-your-visit',
  'pageBuilder[_key=="pyv-walk"].intro',
  'Your first Sunday morning, step by step. [Placeholder:',
  'Your first Sunday morning, step by step. Wear whatever you like: you will see everything from jeans to Sunday best.',
);
set(
  'page-plan-your-visit',
  block('pyv-worship', 'ap18', 'ap17'),
  '[Placeholder:',
  'We sing songs of praise together, and you do not need to know the tunes. Listen in until you do.',
);
set(
  'page-plan-your-visit',
  block('pyv-worship', 'ap20', 'ap19'),
  '[Placeholder:',
  'Bring your Bible if you have one. If not, just come: every passage is read aloud before Pastor Jacob preaches on it.',
);
set(
  'page-plan-your-visit',
  block('pyv-worship', 'ap22', 'ap21'),
  '[Placeholder:',
  'Pastor Jacob preaches through books of the Bible passage by passage, so you hear what the text says and what it means for the week ahead.',
);
set(
  'page-plan-your-visit',
  block('pyv-worship', 'ap24', 'ap23'),
  '[Placeholder:',
  'At the close of the service there is a time to respond. If you want to follow Jesus, ask for prayer or join the church, you can come to the front and Pastor Jacob will meet you there. Nobody is singled out, and staying in your seat is fine.',
);
const SUPPER =
  'We share the Lord’s Supper on special Sundays through the year, Easter and the Sunday before Christmas among them. If you have trusted Jesus as your Savior, you are welcome to take part. If not, simply let the plate pass; nobody will mind.';
set('page-plan-your-visit', block('pyv-worship', 'ap26', 'ap25'), '[Placeholder:', SUPPER);
set(
  'page-plan-your-visit',
  block('pyv-here', 'ap30', 'ap29'),
  '[Placeholder:',
  'A ramp leads from the parking lot up to the front doors.',
);
set(
  'page-plan-your-visit',
  block('pyv-here', 'here-access', 'here-access-s'),
  '[Placeholder:',
  '[Jacob: inside the building, is everything on one level? Where is the accessible restroom, and is there a step-free way to the rooms downstairs?]',
);

// ── Questions (FAQ documents) ────────────────────────────────────────────────────────────────
set(
  'faq-baptism',
  answer('k61', 'k62'),
  '[Placeholder:',
  'Tell Pastor Jacob, after a service or through the Contact page. He will sit down with you and talk through what it means to follow Jesus and what baptism is, and then we will set a Sunday so the whole church family can celebrate with you.',
);
set(
  'faq-baptism-before',
  answer('faq-baptism-before-p', 'faq-baptism-before-s'),
  '[Placeholder:',
  'If you were baptized by immersion after you trusted Christ, that baptism stands, wherever it happened. If you were baptized as a baby, we would invite you to be baptized as a believer. That says nothing against the family who brought you; it is simply the step the New Testament shows.',
);
for (const k of ['immersion', 'infants', 'ready', 'saves', 'what'])
  unwrap(`faq-baptism-${k}`, answer(`faq-baptism-${k}-p`, `faq-baptism-${k}-s`));
set(
  'faq-children',
  answer('k44', 'k45'),
  '[Placeholder:',
  'Children are always welcome in worship, and wiggles are fine.',
);
set('faq-children', answer('k46', 'k47'), '[Placeholder:', NURSERY_ASK);
set('faq-communion', answer('k59', 'k60'), '[Placeholder:', `Yes. ${SUPPER}`);
set(
  'faq-get-involved',
  answer('k63', 'k64'),
  '[Placeholder:',
  'Come on a Sunday, have a coffee before Sunday School and say hello. On Wednesday nights there is a meal and Bible study for every age. When you are ready, tell Pastor Jacob where you would like to help, and we will find you a place.',
);
set(
  'faq-how-long',
  answer('k40', 'k41'),
  '[Placeholder:',
  'Worship lasts about an hour. Sunday School meets before it, with coffee ready, if you would like to come to that too.',
);
set(
  'faq-parking',
  answer('k57', 'k58'),
  '[Placeholder:',
  'Park in the lot in front of the church. A ramp leads from the lot up to the front doors.',
);
set(
  'faq-sunday-school',
  answer('k42', 'k43'),
  '[Placeholder:',
  'No. Sunday School meets before worship, and the coffee is on. Come for both, or just for worship.',
);
set(
  'faq-what-kind',
  answer('k53', 'k54'),
  '[Placeholder:',
  'A Southern Baptist church in Ross Township where everyone is family and loves the Lord. You can read what we believe on the What we believe page.',
);
unwrap('faq-what-to-wear', answer('k55', 'k56'));
set(
  'faq-where-do-i-go',
  answer('k38', 'k39'),
  '[Placeholder:',
  'Park in the lot and take the ramp up to the front doors. Someone will say hello and show you where to go, and the coffee will be on.',
);
// Linked sentences: the opening "[Placeholder: " and the closing "]" sit in different spans.
set(
  'faq-watch-online',
  answer('k48', 'k49'),
  '[Placeholder: Yes. Sunday worship',
  'Yes. Sunday worship is streamed live on ',
);
set('faq-watch-online', answer('k48', 'k52'), '.]', '.');
set(
  'page-watch',
  block('w-live', 'k33', 'k34'),
  '[Placeholder: Sunday worship',
  'Sunday worship is streamed live on ',
);
set(
  'page-watch',
  block('w-live', 'k33', 'k37'),
  '. Watch from home',
  '. Watch from home, or share it with someone who cannot be there.',
);

// ── What we believe: finished drafts, flagged for the pastor to approve (PENDING 1zt) ────────
set(
  'page-what-we-believe',
  block('wwb-short', 'wwb-short-p1', 'wwb-short-p1-s1'),
  '[Placeholder: God made the world',
  'God made us to know him, but every one of us has sinned, and sin separates us from a holy God. We cannot clean ourselves up. But while we were yet sinners, Christ died for us: Jesus, the sinless Son of God, went to the cross and shed his blood to pay for our sin, and on the third day he rose from the grave. He is not one way among many. He is the way, the truth and the life. Turn from your sin and trust him, and you will be forgiven and made new. Romans 5:8',
);
set(
  'page-what-we-believe',
  'pageBuilder[_key=="wwb-abc"].intro',
  '[Placeholder: Following Jesus',
  'Following Jesus starts simply. Many people remember it as A, B, C.',
);
for (const k of ['abc-admit', 'abc-believe', 'abc-confess'])
  unwrap('page-what-we-believe', step('wwb-abc', k));
for (const k of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9']) {
  unwrap('page-what-we-believe', card('wwb-cards', k));
  unwrap('page-what-we-believe', card('wwb-cards', k, 'note'));
}
unwrap('page-what-we-believe', block('wwb-baptism', 'k10', 'k11'));
unwrap('page-what-we-believe', block('wwb-baptist', 'ap46', 'ap45'));
set(
  'page-what-we-believe',
  block('wwb-baptist', 'ap48', 'ap47'),
  '[Placeholder: We are a Southern Baptist church.',
  'We are a Southern Baptist church. We work alongside sister churches in Ohio and across the country, and through the Cooperative Program our giving helps send missionaries across North America and around the world.',
);
set(
  'page-what-we-believe',
  block('wwb-full', 'wwb-full-p1', 'wwb-full-p1-s1'),
  '[Placeholder: We affirm',
  'We affirm the Baptist Faith and Message 2000, the confession of faith of the Southern Baptist Convention, as our full statement of faith. Read it at ',
);
set('page-what-we-believe', block('wwb-full', 'wwb-full-p1', 'wwb-full-p1-s3'), '.]', '.');
unset('page-what-we-believe', blockOnly('wwb-full', 'wwb-full-p2'), (b) =>
  b?.children?.[0]?.text?.startsWith('[Jacob: is this right?'),
);

// ── The example sermon: no fact to give it, so it says plainly what it is ─────────────────────
set(
  'sermon-placeholder',
  'title',
  '[Placeholder: Sunday message title]',
  '[Jacob: an example sermon. Replace it with a real one (title, date, passage and the Facebook video link) or delete it before launch.]',
);
unset('sermon-placeholder', 'summary', '[Jacob: a sentence or two');

// ── Church facts: what the church's own posts and road sign confirm ──────────────────────────
// Sunday School 9:45 and worship 11:00 (every recent post and the sign); Wednesday dinner at 6:00
// with adult Bible study at 6:30, and children and youth at 6:00 (the sign and the November post).
const st = (k, f) => `serviceTimes[_key=="${k}"].${f}`;
set('siteSettings', 'phoneConfirmed', (v) => !v, true);
set('siteSettings', 'churchAddress.confirmed', (v) => v === false, true);
for (const k of ['sunday-school', 'worship', 'wednesday', 'youth'])
  set('siteSettings', st(k, 'confirmed'), (v) => v === false, true);
set('siteSettings', st('wednesday', 'time'), '18:00', '18:30');
set('siteSettings', st('wednesday', 'label'), 'Bible study and prayer', 'Adult Bible study');
set('siteSettings', st('wednesday', 'note'), (v) => v == null, 'dinner first, at 6:00');
set('siteSettings', st('youth', 'label'), 'Youth', 'Children and youth');

// ── Photos: the church's own Facebook pictures stop counting as stand-ins ────────────────────
// Renamed from fbca-fb-NN to fbca-church-NN, so src/data/shot-list.ts no longer draws a
// "Photo needed" box over them. Every one shows the building, a room or things given away; no
// person. The road sign also goes on the Plan your visit card on Ministries.
const PHOTO_ASSETS = {
  39: 'image-fd2d4e95d8741e1cde414b67788858b1b3e806c4-1542x2048-jpg',
  51: 'image-47e743375e37d940e98855beae89571a59b54ac4-1600x1232-jpg',
  54: 'image-5c121bef3022c59358f3fedbf678c133b199690d-1440x1080-jpg',
  66: 'image-eef27773040776b9d5cfdce082b70b9fa856f284-682x682-jpg',
  67: 'image-509ada7dbc5f4325019615dee69f8c936c69a791-1536x2048-jpg',
  70: 'image-9052844d711b98c9025f0c07f84ffdfe90685531-1536x2048-jpg',
};
for (const [n, id] of Object.entries(PHOTO_ASSETS))
  set(id, 'originalFilename', `fbca-fb-${n}.jpg`, `fbca-church-${n}.jpg`);
set('page-ministries', fyp('g-new', 'n-visit', 'image'), (v) => v == null, {
  _type: 'image',
  alt: 'The church’s road sign, reading Auburn Baptist Church, with the Sunday and Wednesday times and a tall red cross beside it',
  asset: ref(PHOTO_ASSETS[67]),
});

// ── Run ──────────────────────────────────────────────────────────────────────────────────────

/** Read a value at a Sanity path with _key filters, e.g. a[_key=="x"].b.c */
function get(doc, path) {
  let cur = doc;
  for (const part of path.match(/[^.[\]]+(\[_key=="[^"]+"\])?/g)) {
    const m = /^([^[]+)(?:\[_key=="([^"]+)"\])?$/.exec(part);
    cur = cur?.[m[1]];
    if (m[2]) cur = Array.isArray(cur) ? cur.find((x) => x?._key === m[2]) : undefined;
  }
  return cur;
}
const matches = (was, cur) =>
  typeof was === 'function' ? was(cur) : typeof cur === 'string' && cur.startsWith(was);

const ids = [...new Set(OPS.map((o) => o.id))];
const docs = Object.fromEntries(
  (await client.fetch('*[_id in $ids]', { ids })).map((d) => [d._id, d]),
);
writeFileSync(join(dir, 'finished-copy-before.json'), JSON.stringify(Object.values(docs), null, 2));
console.log(`Backed up ${Object.keys(docs).length} documents to ${dir}`);

const byDoc = {};
let skipped = 0;
for (const op of OPS) {
  const doc = docs[op.id];
  const cur = doc ? get(doc, op.path) : undefined;
  if (!doc || !matches(op.was, cur)) {
    console.log(`SKIP ${op.id} ${op.path} (now: ${JSON.stringify(cur)?.slice(0, 70)})`);
    skipped++;
    continue;
  }
  (byDoc[op.id] ??= []).push(
    op.unset
      ? { unset: op.path }
      : { set: op.path, value: typeof op.value === 'function' ? op.value(cur) : op.value },
  );
}

let n = 0;
for (const [id, changes] of Object.entries(byDoc)) {
  await apply(`${id}: ${changes.length} change(s)`, async () => {
    let p = client.patch(id);
    for (const c of changes) p = c.unset ? p.unset([c.unset]) : p.set({ [c.set]: c.value });
    await p.commit();
  });
  for (const c of changes)
    console.log(
      `   ${c.unset ? 'unset' : 'set'} ${c.unset ?? c.set}${c.unset ? '' : ` = ${JSON.stringify(c.value).slice(0, 110)}`}`,
    );
  n += changes.length;
}
console.log(`${n} change(s) planned, ${skipped} skipped.`);
done(n);
