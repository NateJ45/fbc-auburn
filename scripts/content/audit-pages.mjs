// Site audit, content pages (2026-10-25): the structure and words of Home, Plan your visit, About,
// What we believe, Next steps, Leadership, Prayer and Contact, a new "Need the pastor?" page, the
// prayer form's questions, and American spelling across every document.
//
// Findings it answers (the audit reports are the studio's, not in this repo): the gospel near the
// top of Home and a link to What we believe's "The gospel, first"; one honest line about size and
// music asked of Jacob; "Watch a sermon" straight to /sermons/; "Come as you are" said once; the
// two first-Sunday stories told the same way; Plan your visit with the times band, a "Good to know"
// row, one "Your kids" block, "What worship is like" and "Getting in and getting around"; About's
// "A Sunday here"; the Baptist block on What we believe; Know Jesus set apart on Next steps; how
// the church is led and how to reach the pastor; one prayer privacy promise that is true on the
// Prayer page, Contact and the Privacy policy, a crisis line, and two new prayer form questions;
// a pastoral care page; one child safety ask worded the same everywhere; contact verbs.
//
// Doctrine is Jacob's: every statement of belief here is a "[Jacob: ...]" ask, never our words.
// Facts (times, the address, the phone) are never typed: they come from Church facts through the
// blocks (the times band, Contact details, the map).
//
// Section anchors (#the-gospel, #baptism, #kids, ...) come from the block keys this script uses;
// the map is src/lib/section-anchors.ts. Keep the keys.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/audit-pages.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/audit-pages.mjs <backup-folder> --apply
// Every document it changes is written to <backup-folder>/audit-pages-before.json first. Keep that
// folder outside the repo. Safe to run twice: it transforms whatever is there now, each step checks
// whether it is already done, and a document with no difference is left alone. Run it AFTER the
// other audit scripts: the spelling pass covers every document, so it also catches their words.
//
// `transform(docs)` is pure and exported, so a scratch script can apply the same change to a copy
// of the CI snapshot and build it before anything is written.

// ── Portable Text builders (local, so importing this file needs no token) ────────────────────
let n = 0;
const k = (prefix = 'ap') => `${prefix}${n++}`;
const span = (text, marks = []) => ({ _type: 'span', _key: k(), text, marks });
/** A paragraph from strings and { text, href } links. */
const p = (...parts) => {
  const markDefs = [];
  const children = parts.map((part) => {
    if (typeof part === 'string') return span(part);
    const mk = k();
    markDefs.push({ _type: 'link', _key: mk, href: part.href });
    return span(part.text, [mk]);
  });
  return { _type: 'block', _key: k(), style: 'normal', markDefs, children };
};
/** A bullet. */
const li = (...parts) => ({ ...p(...parts), listItem: 'bullet', level: 1 });
const a = (text, href) => ({ text, href });
const ref = (id) => ({ _type: 'reference', _ref: id });
const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});
const external = (label, url) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'external',
  externalUrl: url,
  openInNewTab: false,
});
const clone = (v) => JSON.parse(JSON.stringify(v));

// ── Words used in more than one place ───────────────────────────────────────────────────────
/** The child safety ask, the same words wherever children's care is described (P-5). */
export const SAFETY_ASK =
  '[Jacob: the child safety policy in a sentence or two, worded the same everywhere it appears: whether every volunteer is background-checked, whether two adults are always in the room, how check-in and pick-up work, and who a parent can ask. Parents read this first and read it closely.]';
/** The crisis line (P-3), on the Prayer page and the pastoral care page. */
export const CRISIS_LINE =
  'If you are in danger or thinking of harming yourself, call or text 988, or call 911.';
const PASTORAL_ID = 'page-pastoral-care';
/** A question link that opens Contact with the topic and a few words filled in. */
const ask = (about) => `/contact/?topic=question&about=${encodeURIComponent(about)}`;

// ── Helpers on a document ───────────────────────────────────────────────────────────────────
const log = [];
const note = (id, msg) => log.push(`${id}: ${msg}`);
const blocksOf = (doc, field = 'pageBuilder') => (doc[field] ??= []);
const byKey = (arr, key) => (arr ?? []).find((b) => b?._key === key);
const indexOf = (arr, key) => (arr ?? []).findIndex((b) => b?._key === key);
/** Insert `block` after the block keyed `after` (or at the end), unless its key is already there. */
function insertAfter(doc, after, block, field = 'pageBuilder') {
  const arr = blocksOf(doc, field);
  if (byKey(arr, block._key)) return false;
  const at = indexOf(arr, after);
  arr.splice(at < 0 ? arr.length : at + 1, 0, block);
  note(doc._id, `adds ${block._key} after ${at < 0 ? 'the end' : after}`);
  return true;
}
/** Move the block keyed `key` to just after `after`, if it is not there already. */
function moveAfter(doc, key, after, field = 'pageBuilder') {
  const arr = blocksOf(doc, field);
  const from = indexOf(arr, key);
  const at = indexOf(arr, after);
  if (from < 0 || at < 0 || from === at + 1) return;
  const [b] = arr.splice(from, 1);
  arr.splice(indexOf(arr, after) + 1, 0, b);
  note(doc._id, `moves ${key} after ${after}`);
}
function remove(doc, key, field = 'pageBuilder') {
  const arr = blocksOf(doc, field);
  const at = indexOf(arr, key);
  if (at < 0) return;
  arr.splice(at, 1);
  note(doc._id, `removes ${key}`);
}
/** Set fields on an object, logging each change. */
function setOn(doc, where, obj, fields) {
  if (!obj) {
    note(doc._id, `SKIPPED ${where}: not found (read the document and update this script)`);
    return;
  }
  for (const [f, v] of Object.entries(fields)) {
    if (JSON.stringify(obj[f]) === JSON.stringify(v)) continue;
    if (v === undefined) delete obj[f];
    else obj[f] = v;
    note(
      doc._id,
      `${where}.${f} = ${typeof v === 'string' ? JSON.stringify(v) : '(' + (Array.isArray(v) ? `${v.length} items` : typeof v) + ')'}`,
    );
  }
}
const plainOf = (body) =>
  (body ?? []).map((b) => (b.children ?? []).map((c) => c.text).join('')).join('\n');
/** Replace a Portable Text body only when its words differ (keys regenerate on every run). */
function setBody(doc, where, obj, field, body) {
  if (!obj) return setOn(doc, where, obj, {});
  const before = JSON.stringify(
    (obj[field] ?? []).map((b) => [
      plainOf([b]),
      b.listItem ?? '',
      b.markDefs?.map((m) => m.href) ?? [],
    ]),
  );
  const after = JSON.stringify(
    body.map((b) => [plainOf([b]), b.listItem ?? '', b.markDefs?.map((m) => m.href) ?? []]),
  );
  if (before === after) return;
  obj[field] = body;
  note(
    doc._id,
    `${where}.${field} rewritten:\n      ${plainOf(body).split('\n').join('\n      ')}`,
  );
}

// ── American spelling (P-6, V-10) ───────────────────────────────────────────────────────────
const SPELLING = [
  [/\b([Bb])aptis(e|ed|es|ing)\b/g, '$1aptiz$2'],
  [/\b([Nn])eighbour(s|hood|hoods|ly)?\b/g, '$1eighbor$2'],
  [/\b([Cc])olour(s|ed|ful)?\b/g, '$1olor$2'],
  [/\b([Ff])avourite(s)?\b/g, '$1avorite$2'],
  [/\b([Oo])rganis(e|ed|es|ing|ation|ations|er|ers)\b/g, '$1rganiz$2'],
  [/\b([Cc])entre(s)?\b/g, '$1enter$2'],
  [/\b([Cc])entred\b/g, '$1entered'],
  [/\b([Rr])ecognis(e|ed|es|ing)\b/g, '$1ecogniz$2'],
  [/\b([Rr])ealis(e|ed|es|ing)\b/g, '$1ealiz$2'],
  [/\b([Hh])onour(s|ed|ing)?\b/g, '$1onor$2'],
  [/\b([Ww])hilst\b/g, '$1hile'],
  [/\b([Pp])rogramme(s)?\b/g, '$1rogram$2'],
  [/\b([Ee])nquir(y|ies)\b/g, '$1nquir$2'],
  [/\bround a table\b/g, 'around a table'],
];
export const americanize = (s) => SPELLING.reduce((t, [re, to]) => t.replace(re, to), s);
// Never rewrite identifiers, links or enum values, only words people read.
const NOT_WORDS = new Set([
  '_key',
  '_type',
  '_ref',
  '_id',
  '_rev',
  '_createdAt',
  '_updatedAt',
  'current',
  'href',
  'externalUrl',
  'url',
  'style',
  'listItem',
  'marks',
  'linkType',
  'icon',
  'art',
  'imageSide',
  'gathering',
  'mode',
  'recipient',
  'kind',
  'day',
  'time',
  'platform',
  'emailAddress',
  'phoneNumber',
  'originalFilename',
  'mimeType',
  'extension',
  'path',
  'assetId',
  'sha1hash',
]);
function spell(v, path, hits) {
  if (Array.isArray(v)) return v.map((x, i) => spell(x, `${path}[${x?._key ?? i}]`, hits));
  if (v && typeof v === 'object') {
    for (const [f, x] of Object.entries(v)) {
      if (NOT_WORDS.has(f)) continue;
      v[f] = spell(x, `${path}.${f}`, hits);
    }
    return v;
  }
  if (typeof v === 'string') {
    const out = americanize(v);
    if (out !== v)
      hits.push(`${path}: ${JSON.stringify(v.length > 90 ? v.slice(0, 90) + '...' : v)}`);
    return out;
  }
  return v;
}

// ── The page changes ────────────────────────────────────────────────────────────────────────
function home(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // V-1 and P-19: one honest line about Sunday asked of Jacob; "close-knit" can read as a closed
  // circle, and "Come as you are" stays only as the big welcome.
  setOn(d, 'home-hero', b('home-hero'), {
    subhead:
      '[Placeholder: A church family in Ross Township with room for one more. Someone will meet you at the door.] [Jacob: one honest line: about how many come, the music, and who comes.]',
    // V-4, UX-L3, DEV-L6: a button that makes sense any day, straight to /sermons/.
    secondaryCta: internal('Watch a sermon', 'sermonsPage'),
  });
  // V-6: the two first-Sunday stories agree; Sunday School explained and optional.
  const steps = b('home-first-sunday')?.steps;
  setOn(d, 'home-first-sunday.fs-school', byKey(steps, 'fs-school'), {
    body: 'Small classes by age, adults included, before worship. It is optional on a first visit: plenty of people come just for worship.',
  });
  // P-2 (the one-line version) and V-2: point at the one "Your kids" block.
  setOn(d, 'home-first-sunday.fs-worship', byKey(steps, 'fs-worship'), {
    body: 'About an hour. We sing, pray and open the Bible together. Children are welcome in the service, and there is a room for little ones too.',
    linkLabel: 'About your kids',
    linkHref: '/plan-your-visit/#kids',
  });
  // P-1: the gospel, briefly, straight after the first-Sunday steps. Doctrine is Jacob's.
  insertAfter(d, 'home-first-sunday', {
    _key: 'home-gospel',
    _type: 'richTextSection',
    heading: 'The good news',
    width: 'narrow',
    align: 'left',
    body: [
      p(
        '[Jacob: two or three sentences of the good news in plain words for someone who has never been to church: who Jesus is, what he did, and why that is good news for them. This is the first place on the site a visitor meets the gospel.]',
      ),
      p(a('Read more in What we believe', '/what-we-believe/#the-gospel')),
    ],
  });
  // P-19: "Come as you are" once.
  const belong = b('home-belong');
  if (belong?.body?.[1]) {
    const t = plainOf([belong.body[1]]);
    if (t.includes('Come as you are, and come and see.'))
      setBody(d, 'home-belong', belong, 'body', [
        belong.body[0],
        p(t.replace('Come as you are, and come and see.', 'Come and see.')),
        ...belong.body.slice(2),
      ]);
  }
  // V-4: the Last Sunday link goes to /sermons/, not the forwarded /watch/.
  setOn(d, 'home-watch.link', b('home-watch')?.link, {
    internalLink: ref('sermonsPage'),
  });
  // P-18: online giving is not live (no Online giving link in Church facts), so do not promise it.
  setOn(d, 'home-other-ways.how-give', byKey(b('home-other-ways')?.cards, 'how-give'), {
    body: 'Give in the offering on Sunday, or by mail',
  });
  // UX-H2: "Ask a question" opens the form with the topic chosen.
  setOn(d, 'home-other-ways.how-ask.link', byKey(b('home-other-ways')?.cards, 'how-ask')?.link, {
    linkType: 'external',
    externalUrl: '/contact/?topic=question',
    internalLink: undefined,
  });
}

function planYourVisit(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // UX-M1, V-7: the times, the address and Directions under the title (TimesBand, Church facts).
  // P-19: "Come as you are" is Home's.
  setOn(d, 'pyv-hero', b('pyv-hero'), {
    showTimes: true,
    subhead:
      'Whether you have followed Christ for years, are looking for a church home, or simply have questions about faith, you are welcome here.',
  });
  // V-3: what to wear, how long, nobody on the spot, always visible.
  insertAfter(d, 'pyv-hero', {
    _key: 'pyv-good',
    _type: 'iconCardsSection',
    heading: 'Good to know',
    cards: [
      {
        _key: 'good-wear',
        _type: 'iconCard',
        icon: 'coffee',
        title: 'Wear whatever you like',
        body: '[Placeholder: You will see everything from jeans to Sunday best, and nobody minds either way.]',
      },
      {
        _key: 'good-long',
        _type: 'iconCard',
        icon: 'clock',
        title: 'About an hour',
        body: 'Worship lasts about an hour. Sunday School before it is optional.',
      },
      {
        _key: 'good-spot',
        _type: 'iconCard',
        icon: 'map-pin',
        title: 'Nobody will put you on the spot',
        body: 'Sit wherever you like. You are welcome just to watch and listen.',
      },
    ],
  });
  // V-2, P-5: ONE "Your kids" block, near the top, that home and the walk point at.
  const kids = b('pyv-kids');
  setOn(d, 'pyv-kids', kids, { heading: 'Your kids' });
  setBody(d, 'pyv-kids', kids, 'body', [
    p('Children are welcome in the service, and wiggles are fine.'),
    p(
      '[Jacob: the details parents look for first: what ages the nursery and the children’s room take, where you check children in and how you pick them up, whether it runs for the whole service or part of it, and what a five-year-old does if they stay in worship (a children’s message, an activity bag?).]',
    ),
    p(SAFETY_ASK),
    p('Sunday School before worship has a class for every age, from little ones to adults.'),
  ]);
  moveAfter(d, 'pyv-kids', 'pyv-good');
  // P-12, V-6: no exact minutes; Sunday School invited, and optional.
  const walk = b('pyv-walk');
  setOn(d, 'pyv-walk', walk, {
    intro:
      'Here is your first Sunday morning, from your parking space to your seat. Sunday School before worship is optional: plenty of people come just for worship.',
  });
  const stops = walk?.stops ?? [];
  setOn(d, 'pyv-walk.stop1', byKey(stops, 'stop1'), {
    time: undefined,
    body: 'Turn in from Hamilton-Scipio Road and park in the lot. The spaces nearest the front doors are kept for guests (to be confirmed).',
  });
  setOn(d, 'pyv-walk.stop2', byKey(stops, 'stop2'), { time: 'About 10:45' });
  setOn(d, 'pyv-walk.stop3', byKey(stops, 'stop3'), { time: undefined });
  setOn(d, 'pyv-walk.stop4', byKey(stops, 'stop4'), {
    time: undefined,
    body: 'Little ones can go to the children’s room during worship, or stay with you. Everything about it is under Your kids, above.',
  });
  setOn(d, 'pyv-walk.stop5', byKey(stops, 'stop5'), { time: '11:00' });
  // P-2: what the hour is like. Every answer is Jacob's.
  insertAfter(d, 'pyv-walk', {
    _key: 'pyv-worship',
    _type: 'richTextSection',
    heading: 'What worship is like',
    width: 'narrow',
    align: 'left',
    body: [
      p('We sing, pray and open the Bible together for about an hour.'),
      li(
        '[Jacob: the singing: hymns from a hymnal, newer songs, or both? A piano, an organ, a choir?]',
      ),
      li(
        '[Jacob: which Bible translation you preach from, and whether there are pew Bibles a guest can use.]',
      ),
      li(
        '[Jacob: the sermon: do you preach through books of the Bible, and about how long is it?]',
      ),
      li(
        '[Jacob: is there an invitation at the close, and what happens if someone comes forward?]',
      ),
      li(
        '[Jacob: how often the church shares the Lord’s Supper, and whether a visitor may take part.]',
      ),
      li('The offering is taken during worship. Nobody is expected to give on a first visit.'),
    ],
  });
  // P-13 and V-15: "Getting here" becomes the access list; the address is in the times band and
  // the map below (both from Church facts, never typed), and parking is said once, in the walk.
  const here = b('pyv-here');
  setOn(d, 'pyv-here', here, { heading: 'Getting in and getting around' });
  setBody(d, 'pyv-here', here, 'body', [
    li('[Placeholder: A ramp leads up to the front doors.]'),
    li('[Jacob: is there an accessible restroom, and where is it?]'),
    li('[Jacob: are there spaces for a wheelchair in the sanctuary, and any steps inside?]'),
    li('[Jacob: is there a hearing loop or assisted listening?]'),
    li('[Jacob: are there large-print bulletins or hymnals?]'),
  ]);
  moveAfter(d, 'pyv-here', 'pyv-worship');
  insertAfter(d, 'pyv-here', {
    _key: 'pyv-map',
    _type: 'mapSection',
    heading: 'Find us',
  });
  // V-15: the questions already answered above leave the list (the answers stay in the Studio).
  const faq = b('pyv-faq');
  if (faq) {
    const drop = new Set([
      'faq-where-do-i-go',
      'faq-how-long',
      'faq-what-to-wear',
      'faq-parking',
      'faq-children',
    ]);
    const church = b('pyv-faq-church');
    const items = [
      ...(faq.items ?? []).filter((i) => !drop.has(i._ref)),
      // "About the church" joins the one list; communion is in "What worship is like" now.
      ...(church?.items ?? []).filter((i) => i._ref !== 'faq-communion'),
    ];
    const seen = new Set();
    const merged = items.filter((i) => !seen.has(i._ref) && seen.add(i._ref));
    if (
      JSON.stringify(merged.map((i) => i._ref)) !==
      JSON.stringify((faq.items ?? []).map((i) => i._ref))
    ) {
      faq.items = merged;
      note(d._id, `pyv-faq.items = ${merged.map((i) => i._ref).join(', ')}`);
    }
    setOn(d, 'pyv-faq', faq, { subhead: undefined });
    remove(d, 'pyv-faq-church');
  }
}

function about(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // V-7 (part): "Who we are" should say something only Auburn could say.
  const story = b('about-story');
  if (story && !plainOf(story.body).includes('only Auburn could say')) {
    setBody(d, 'about-story', story, 'body', [
      ...(story.body ?? []),
      p(
        '[Jacob: this reads like many church websites. One or two sentences only Auburn could say would help a visitor most: something the church is known for in the township, a habit, a story the members tell.]',
      ),
    ]);
  }
  // UX-L1, V-9: "A Sunday here" in place of the logo story, which goes to the end, shorter.
  insertAfter(d, 'about-story', {
    _key: 'about-sunday',
    _type: 'imageTextSection',
    art: 'photo',
    imageSide: 'right',
    heading: 'A Sunday here',
    body: [
      p(
        '[Jacob: what a Sunday is like, in three or four sentences: the music, how you preach and for about how long, and who comes (how many, families, retirees, both). A real photo of a Sunday goes beside it.]',
      ),
    ],
  });
  const mark = b('about-mark');
  setBody(d, 'about-mark', mark, 'body', [
    p(
      'Our mark is the red-brown brick of our building, laid course by course, with a plain cross cut out of the middle: a hand-made mark for a church of real people.',
    ),
  ]);
  moveAfter(d, 'about-mark', 'about-building');
  // The closing band typed the worship time; the times live in Church facts.
  setOn(d, 'about-cta', b('about-cta'), { subhead: 'Someone will meet you at the door.' });
}

function whatWeBelieve(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // UX-L2: the card on baptism and the Baptism section are joined by a link (#baptism).
  setOn(d, 'wwb-cards.b5', byKey(b('wwb-cards')?.cards, 'b5'), {
    link: external('More on baptism', '/what-we-believe/#baptism'),
  });
  moveAfter(d, 'wwb-baptism', 'wwb-cards');
  setOn(d, 'wwb-baptism', b('wwb-baptism'), {
    cta: external('Ask about baptism', ask('Baptism')),
  });
  // P-8: what makes the church Baptist, and how it cooperates. Asks only, no doctrinal wording.
  insertAfter(d, 'wwb-baptism', {
    _key: 'wwb-baptist',
    _type: 'richTextSection',
    heading: 'What it means to be Baptist',
    width: 'narrow',
    align: 'left',
    body: [
      p(
        '[Jacob: what makes Auburn a Baptist church, in your words. People often ask how a Baptist church differs from the Methodist or Presbyterian church down the road, and this is the answer. The things usually covered: believer’s baptism by immersion, the Lord’s Supper, congregational church government, the autonomy of the local church, the priesthood of every believer, and soul liberty.]',
      ),
      p(
        '[Jacob: how Auburn works with other Southern Baptists: your local association, the State Convention of Baptists in Ohio, the Cooperative Program, and any missionaries the church supports.]',
      ),
    ],
  });
}

function nextSteps(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // P-9: Know Jesus set apart from the checklist, with Jacob's verse and an invitation.
  insertAfter(d, 'ns-hero', {
    _key: 'ns-know',
    _type: 'richTextSection',
    eyebrow: 'First of all',
    heading: 'Know Jesus',
    width: 'narrow',
    align: 'left',
    body: [
      p(
        '[Jacob: the verse you would like here, such as Romans 10:9, written out in the translation the church reads.]',
      ),
      p(
        'Everything else on this page grows out of this one. ',
        a('Read the good news', '/what-we-believe/#the-gospel'),
        '.',
      ),
      p(
        'If you have trusted Christ, we would love to hear about it. ',
        a('Tell Pastor Jacob', ask('I have trusted Christ')),
        '.',
      ),
    ],
  });
  const rail = b('ns-steps');
  if (rail) {
    const at = indexOf(rail.steps, 'ns-jesus');
    if (at >= 0) {
      rail.steps.splice(at, 1);
      note(d._id, 'ns-steps: Know Jesus leaves the rail (it has its own section above)');
    }
    setOn(d, 'ns-steps', rail, {
      heading: 'Then, one step at a time',
      // One closing button: the band below already says "Ask a question".
      primaryCta: undefined,
    });
    setOn(d, 'ns-steps.ns-baptism', byKey(rail.steps, 'ns-baptism'), {
      linkHref: ask('Baptism'),
    });
    setOn(d, 'ns-steps.ns-member', byKey(rail.steps, 'ns-member'), {
      linkHref: ask('Membership'),
    });
    // Times are never typed: Sunday School's comes from Church facts elsewhere on the site.
    setOn(d, 'ns-steps.ns-group', byKey(rail.steps, 'ns-group'), {
      body: 'Sunday School before worship has a class for every age, and Bible study and prayer meet on Wednesday evenings. [Jacob: any other groups people can join?]',
    });
  }
  // UX-H2: two contact verbs.
  setOn(d, 'ns-cta', b('ns-cta'), { cta: external('Ask a question', '/contact/?topic=question') });
}

function leadership(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // V-5: a real photo (the slot's shot request), a hello video, and the TikTok labelled as his.
  const pastor = b('lead-pastor');
  if (pastor && !plainOf(pastor.body).includes('TikTok')) {
    setBody(d, 'lead-pastor', pastor, 'body', [
      ...(pastor.body ?? []),
      p(
        '[Jacob: a 30-second video of you saying hello, filmed on a phone, would go here beside your photo. Visitors say a real voice is what makes a pastor feel real before they visit.]',
      ),
      p(
        'Pastor Jacob also posts short videos on ',
        a('TikTok', 'https://www.tiktok.com/@auburn.pastor'),
        '.',
      ),
    ]);
  }
  setOn(d, 'lead-pastor', pastor, {
    cta: external('Ask a question', ask('For Pastor Jacob')),
  });
  // P-17: how the church is governed, and who to call.
  setBody(d, 'lead-how', b('lead-how'), 'body', [
    p(
      '[Jacob: one sentence on how decisions are made here: whether the church votes on members, the budget and calling a pastor, and what the deacons do.]',
    ),
    p(
      '[Jacob: the deacons and ministry leaders you would like introduced here, with a photo each, and only once each of them has said yes.]',
    ),
  ]);
  insertAfter(d, 'lead-how', {
    _key: 'lead-contact',
    _type: 'contactCardSection',
    heading: 'Reach the pastor and the office',
    intro:
      '[Jacob: an email address for you and for the church office, and office hours if there are any. They go in Site settings and show here.]',
  });
}

function prayer(d) {
  const b = (key) => byKey(d.pageBuilder, key);
  // P-3, UX-L5: one promise, said once (the form says it beside the button), and who reads it.
  setOn(d, 'pr-hero', b('pr-hero'), {
    subhead:
      'Tell us what to pray for. Pastor Jacob reads every request, and you can leave your name off.',
  });
  insertAfter(d, 'pr-hero', {
    _key: 'pr-crisis',
    _type: 'noticeSection',
    message: CRISIS_LINE,
    urgency: 'info',
  });
  // P-4: the pastor, not the contact form, is the next step from a prayer request.
  setOn(d, 'pr-cta', b('pr-cta'), {
    headline: 'Would you rather talk to Pastor Jacob?',
    subhead: 'He visits the hospital and the homebound, and he is here for the hard days.',
    cta: internal('Need the pastor?', PASTORAL_ID),
  });
}

function prayerForm(d) {
  // P-3: who sees it, the prayer chain (off by default), and a call back.
  setOn(d, 'form-prayer', d, {
    intro:
      'Tell us what to pray for, in as few or as many words as you like. [Jacob: who else sees a request (a prayer team, the prayer chain?), and is one ever read aloud or put in the bulletin? The page will say exactly that, and nothing goes further without the tick box below.]',
  });
  const qs = (d.questions ??= []);
  setOn(d, 'questions.q-share', byKey(qs, 'q-share'), {
    label: 'You may share this with the prayer chain',
    required: false,
  });
  const add = (q) => {
    if (byKey(qs, q._key)) return;
    qs.push(q);
    note(d._id, `adds question "${q.label}"`);
  };
  add({
    _key: 'q-call',
    _type: 'formQuestion',
    label: 'I would like Pastor Jacob to call me',
    kind: 'checkbox',
    required: false,
  });
  add({
    _key: 'q-phone',
    _type: 'formQuestion',
    label: 'Your phone number, if you would like a call',
    kind: 'phone',
    required: false,
  });
}

function contact(d) {
  // UX-H2: two verbs; P-3: prayer requests have one path, the Prayer page.
  setOn(d, 'contactPage', d, {
    heroSubhead: 'Ask a question, or tell us you are coming on Sunday.',
    seoDescription: 'Ask a question or tell us you are visiting First Baptist Church of Auburn.',
    // V-8: how fast a text is answered is Jacob's to say.
    formIntroNote:
      'A real person reads every message, usually within a day or two. [Jacob: how quickly does someone answer a text, at weekends too? A line like "Text us any time; someone usually replies the same day" gets a nervous visitor through the door on a Saturday night.]',
  });
  setBody(d, 'contactPage', d, 'whatToExpectContent', [
    p(
      'Someone from the church reads it and replies, usually within a day or two. If you told us you are visiting, we will look out for you at the door.',
    ),
    p(
      'A prayer request has a private form of its own: ',
      a('send it from the prayer request page', '/prayer/'),
      ', and it goes straight to Pastor Jacob.',
    ),
  ]);
  // P-4: "When life happens" moves to the pastoral care page; Contact keeps two doors to it.
  const care = byKey(d.additionalSections, 'ct-care');
  setOn(d, 'ct-care', care, {
    intro:
      'Pastor Jacob is here for the hard days and the happy ones, whether or not you come on Sundays.',
  });
  if (care && !byKey(care.cards, 'care-pastor')) {
    const prayerCard = byKey(care.cards, 'care-prayer');
    care.cards = [
      {
        _key: 'care-pastor',
        _type: 'iconCard',
        icon: 'praying-hands',
        title: 'Need the pastor?',
        body: 'A hospital stay, a funeral, a wedding, or a hard week: how to reach Pastor Jacob.',
        link: internal('Need the pastor?', PASTORAL_ID),
      },
      {
        ...(prayerCard ?? {
          _key: 'care-prayer',
          _type: 'iconCard',
          title: 'Something to pray about',
        }),
        icon: 'bible',
        body: 'Send a prayer request, big or small. Pastor Jacob reads every one.',
        link: internal('Send a prayer request', 'page-prayer'),
      },
    ];
    note(d._id, 'ct-care: the five cards become two (Need the pastor?, Something to pray about)');
  }
}

function privacy(d) {
  // P-3: the policy says what the Prayer page promises, and that Contact messages are kept.
  const body = (d.body ??= []);
  if (body.some((x) => x._key === 'pv-prayer')) return;
  const at = body.findIndex((x) => plainOf([x]).startsWith('The contact form asks'));
  body.splice(at < 0 ? body.length : at + 1, 0, {
    ...p(
      'Prayer requests are different. A request sent from the ',
      a('prayer request page', '/prayer/'),
      ' goes by email to Pastor Jacob, and once that email has gone the website deletes its copy. If the email cannot be sent, the request waits in the website’s database so it is not lost. The church shares a request only if you tick the box that says it may.',
    ),
    _key: 'pv-prayer',
  });
  note(d._id, 'adds the prayer requests paragraph under "When you write to us"');
}

function ministries(d) {
  // P-5: the child safety ask in the same words; P-4: "When life happens" goes to the new page.
  // Smallest edits only: the Ministries page belongs to another part of the audit.
  const groups = byKey(d.pageBuilder, 'min-fyp')?.groups ?? [];
  const card = (g, c) => byKey(byKey(groups, g)?.cards, c);
  setOn(d, 'min-fyp.g-kids.k-kids', card('g-kids', 'k-kids'), {
    body: `[Placeholder: Sunday School classes, and a room for little ones during worship.] [Jacob: the ages and the nursery hours, and who leads it.] ${SAFETY_ASK}`,
  });
  setOn(d, 'min-fyp.g-serve.s-kids', card('g-serve', 's-kids'), {
    body: `Help with the little ones during worship. ${SAFETY_ASK}`,
  });
  setOn(d, 'min-fyp.g-care.c-life', card('g-care', 'c-life'), {
    link: internal('Need the pastor?', PASTORAL_ID),
  });
}

/** P-4, P-21: the new "Need the pastor?" page. Created once; never overwritten after that. */
function pastoralCarePage() {
  return {
    _id: PASTORAL_ID,
    _type: 'page',
    title: 'Need the pastor?',
    slug: { _type: 'slug', current: 'pastoral-care' },
    seoTitle: 'Need the pastor? | First Baptist Church of Auburn',
    seoDescription:
      'How to reach Pastor Jacob at First Baptist Church of Auburn for a hospital visit, a funeral, a wedding or a hard week, whether or not you come on Sundays.',
    pageBuilder: [
      {
        _key: 'pc-hero',
        _type: 'heroSection',
        eyebrow: 'Pastoral care',
        headline: 'Need the pastor?',
        subhead:
          'Pastor Jacob is here for the hard days and the happy ones, whether or not you come on Sundays. You are never a bother.',
        icon: 'praying-hands',
        size: 'short',
      },
      { _key: 'pc-crisis', _type: 'noticeSection', message: CRISIS_LINE, urgency: 'info' },
      {
        _key: 'pc-reach',
        _type: 'richTextSection',
        heading: 'How to reach him',
        width: 'narrow',
        align: 'left',
        body: [
          li(
            '[Jacob: the best way to reach you after hours or at the weekend (say Mom is taken to the hospital on a Saturday night), and whether you are happy for that to be on the site. If a deacon can be called instead, who?]',
          ),
          li(
            '[Jacob: the church office hours and email, if there are any. They go in Site settings and show in the card below.]',
          ),
        ],
      },
      {
        _key: 'pc-contact',
        _type: 'contactCardSection',
        heading: 'Call, text or write',
      },
      {
        _key: 'pc-care',
        _type: 'iconCardsSection',
        heading: 'When life happens',
        intro: 'Whatever it is, you do not need to be a member to ask.',
        cards: [
          {
            _key: 'pc-visit',
            _type: 'iconCard',
            icon: 'praying-hands',
            title: 'In the hospital or at home',
            body: '[Placeholder: If you or someone you love is in the hospital or cannot get out, let us know and Pastor Jacob will visit.] [Jacob: is that right, and do you visit the homebound regularly?]',
          },
          {
            _key: 'pc-communion',
            _type: 'iconCard',
            icon: 'bible',
            title: 'The Lord’s Supper at home',
            body: '[Jacob: do you bring the Lord’s Supper to members who cannot get to church, and how should someone ask?]',
          },
          {
            _key: 'pc-funeral',
            _type: 'iconCard',
            icon: 'bible',
            title: 'A funeral',
            body: '[Placeholder: We can help you plan a service, here or at the funeral home, whether or not your family attends.]',
          },
          {
            _key: 'pc-wedding',
            _type: 'iconCard',
            icon: 'music',
            title: 'A wedding',
            body: '[Jacob: do you marry couples who are not members, and what do you ask of them first?]',
          },
          {
            _key: 'pc-help',
            _type: 'iconCard',
            icon: 'giving-hand',
            title: 'A hand when you need it',
            body: '[Jacob: can the church help with food or a bill, and how should someone ask without embarrassment?]',
          },
        ],
      },
      {
        _key: 'pc-cta',
        _type: 'ctaBandSection',
        headline: 'Something to pray about?',
        subhead: 'Send a prayer request. Pastor Jacob reads every one.',
        cta: internal('Send a prayer request', 'page-prayer'),
      },
    ],
  };
}

/**
 * Pure: the documents as they should be. `docs` maps _id to the current document (published
 * only). Returns { changed: Map<id, doc>, created: doc[], spelling: string[], log: string[] }.
 */
export function transform(docs) {
  log.length = 0;
  const out = new Map();
  const work = (id, fn) => {
    if (!docs[id]) return note(id, 'SKIPPED: document not found');
    const d = clone(docs[id]);
    fn(d);
    out.set(id, d);
  };
  work('homePage', home);
  work('page-plan-your-visit', planYourVisit);
  work('aboutPage', about);
  work('page-what-we-believe', whatWeBelieve);
  work('page-next-steps', nextSteps);
  work('page-leadership', leadership);
  work('page-prayer', prayer);
  work('form-prayer', prayerForm);
  work('contactPage', contact);
  work('privacyPage', privacy);
  work('page-ministries', ministries);
  const created = docs[PASTORAL_ID] ? [] : [pastoralCarePage()];
  if (created.length) note(PASTORAL_ID, 'creates the "Need the pastor?" page at /pastoral-care/');

  // Spelling last, over every document (including the ones just changed and created).
  const spelling = [];
  for (const [id, doc] of Object.entries(docs)) {
    const d = out.get(id) ?? clone(doc);
    spell(d, id, spelling);
    out.set(id, d);
  }
  for (const d of created) spell(d, d._id, spelling);

  // Keep only documents that differ.
  const changed = new Map();
  for (const [id, d] of out) if (JSON.stringify(d) !== JSON.stringify(docs[id])) changed.set(id, d);
  return { changed, created, spelling, log: [...log] };
}

// ── Run ─────────────────────────────────────────────────────────────────────────────────────
const SYSTEM = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt', '_system']);

async function main() {
  const { writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { client, apply, done } = await import('../lib/sanity-lib.mjs');
  const dir = process.argv.slice(2).find((x) => !x.startsWith('--'));
  if (!dir) {
    console.error('Pass a backup folder (outside the repo).');
    process.exit(1);
  }
  // Every published document people can read (the spelling pass), never drafts or system ones.
  const all = await client.fetch(
    '*[!(_id in path("drafts.**")) && !(_id in path("versions.**")) && !(_type match "sanity.*") && !(_id in path("_.**"))]',
  );
  const docs = Object.fromEntries(all.map((d) => [d._id, d]));
  const { changed, created, spelling, log: lines } = transform(docs);
  const ids = [...changed.keys()].filter((id) => docs[id]);
  const drafts = await client.fetch('*[_id in $ids]._id', {
    ids: [...ids, PASTORAL_ID].map((id) => `drafts.${id}`),
  });
  if (drafts.length)
    throw new Error(
      `Unpublished drafts exist (${drafts.join(', ')}); publish or discard them first.`,
    );
  const before = Object.fromEntries(ids.map((id) => [id, docs[id]]));
  writeFileSync(join(dir, 'audit-pages-before.json'), JSON.stringify(before, null, 2));
  console.log(`Backed up ${ids.length} document(s) to ${join(dir, 'audit-pages-before.json')}\n`);
  console.log('Page changes:');
  for (const l of lines) console.log(`  ${l}`);
  console.log(`\nAmerican spelling (${spelling.length}):`);
  for (const s of spelling) console.log(`  ${s}`);
  console.log('');

  let count = 0;
  for (const d of created) {
    count++;
    await apply(`create ${d._id} (/${d.slug.current}/)`, () => client.createIfNotExists(d));
  }
  for (const id of ids) {
    const next = changed.get(id);
    const fields = Object.keys({ ...docs[id], ...next }).filter(
      (f) => !SYSTEM.has(f) && JSON.stringify(docs[id][f]) !== JSON.stringify(next[f]),
    );
    const set = Object.fromEntries(
      fields.filter((f) => next[f] !== undefined).map((f) => [f, next[f]]),
    );
    const unset = fields.filter((f) => next[f] === undefined);
    count++;
    await apply(`patch ${id}: ${fields.join(', ')}`, async () => {
      let patch = client.patch(id).ifRevisionId(docs[id]._rev);
      if (Object.keys(set).length) patch = patch.set(set);
      if (unset.length) patch = patch.unset(unset);
      await patch.commit();
    });
  }
  done(count);
}

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
