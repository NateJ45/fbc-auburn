// Best-guess drafts for Pastor Jacob (2026-11-09). Until now a "[Jacob: ...]" ask stood wherever
// only he could give the words. Empty asks are hard to start from, so each one that CAN be drafted
// now holds a draft he can edit: "[Placeholder: our guess]" and, where the guess carries a fact or
// a belief, a short "[Jacob: ...]" naming what to check. Both still show yellow on the pre-launch
// site (src/data/client-notes.ts), so nothing here reads as the church's settled word.
//
// WHERE THE GUESSES COME FROM
//   - Belief: plain-word summaries of the Baptist Faith and Message 2000, the confession the page
//     already says the church affirms. Verses are in the King James wording the church quotes on
//     its Facebook page.
//   - Practice (music, the invitation, the Lord's Supper, how members join, the offering): what is
//     usual in a Southern Baptist church of this size. Every one is a guess until Jacob says so.
//   - The child safety sentence is one guess, worded the same in its three places (SAFETY_DRAFT).
//     It MUST be made true before launch.
// Left as asks, because no guess would help: his own story and family, names of leaders, email
// addresses and office hours, the hello video, and yes-or-no questions about what he wants.
//
// Each change is skipped unless the field still holds the wording this script expects (WAS), so a
// field Jacob has since edited is never overwritten.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/best-guess-drafts.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/best-guess-drafts.mjs <backup-folder> --apply
// Every document it touches is written to <backup-folder>/best-guess-drafts-before.json first.
// Keep that folder outside the repo.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

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

const draft = (text, ask) => typo(`[Placeholder: ${text}]${ask ? ` [Jacob: ${ask}]` : ''}`);

export const SAFETY_DRAFT = draft(
  'Every adult who works with children here has passed a background check, two adults are always in the room, and a child is released only to the parent or guardian who signed them in. Ask Pastor Jacob if you would like to know more.',
  'this is our guess at your child safety policy, worded the same everywhere it appears. Please correct it before launch: parents read this first, and it must be exactly true.',
);

const OUR_DRAFT =
  'our draft from the Baptist Faith and Message, for you to rewrite in your own words.';

const block = (section, blockKey, spanKey) =>
  `pageBuilder[_key=="${section}"].body[_key=="${blockKey}"].children[_key=="${spanKey}"].text`;
const card = (section, cardKey, field = 'body') =>
  `pageBuilder[_key=="${section}"].cards[_key=="${cardKey}"].${field}`;
const fyp = (group, cardKey) =>
  `pageBuilder[_key=="min-fyp"].groups[_key=="${group}"].cards[_key=="${cardKey}"].body`;
const step = (stepKey) => `pageBuilder[_key=="ns-steps"].steps[_key=="${stepKey}"].body`;
const answer = (blockKey, spanKey) =>
  `answer[_key=="${blockKey}"].children[_key=="${spanKey}"].text`;

/** One belief card: the draft, and the verse reference in its note. */
const belief = (cardKey, was, text, verse) => [
  [
    'page-what-we-believe',
    card('wwb-cards', cardKey),
    `[Jacob: two to four plain sentences on ${was}`,
    draft(text),
  ],
  [
    'page-what-we-believe',
    card('wwb-cards', cardKey, 'note'),
    '[Jacob: one verse, such as',
    draft(verse),
  ],
];

// [document id, path, what the field must still start with, the new value]
const CHANGES = [
  // --- About ---------------------------------------------------------------------------------
  [
    'aboutPage',
    block('about-story', 'k6', 'k7'),
    '[Jacob: two or three sentences on how the church began',
    draft(
      'First Baptist Church of Auburn has gathered on this corner of Ross Township for generations. Families have been baptized, married and remembered here, and plenty of the people you will meet on a Sunday grew up in these pews. Today we are a close-knit church in a season of fresh starts, praying for our neighbors and making room for new faces.',
      'the year the church began and how, if you know it, and the season it is in now.',
    ),
  ],
  [
    'aboutPage',
    block('about-story', 'ap40', 'ap39'),
    '[Jacob: this reads like many church websites.',
    draft(
      'Ask around Auburn about the church and you will likely hear about the Christmas gifts gathered for local families, the meals in the fellowship hall, and the red cross that stands by the sign on Hamilton-Scipio Road.',
      'swap in the thing only Auburn could say: what the church is known for in the township, a habit, a story the members tell.',
    ),
  ],
  [
    'aboutPage',
    block('about-sunday', 'ap42', 'ap41'),
    '[Jacob: what a Sunday is like',
    draft(
      'Sunday morning here is simple. We sing hymns and a few newer songs together, pray for one another by name, and open the Bible for a sermon of about thirty minutes that walks through a passage and shows what it means on Monday. You will find children, parents, grandparents and great-grandparents in the same room, and you will not stay a stranger for long.',
      'check the music and the sermon length, and add about how many come. A real photo of a Sunday goes beside it.',
    ),
  ],
  [
    'aboutPage',
    block('about-building', 'about-building-p2', 'about-building-p2-s1'),
    '[Jacob: anything about the building people should know',
    draft(
      'The building has been looked after by its own members down the years, from the paint on the porch to the fellowship hall where we share a meal after church.',
      'who built it, what has changed, or a story the older members tell.',
    ),
  ],

  // --- Contact and Prayer ----------------------------------------------------------------------
  [
    'contactPage',
    'formIntroNote',
    'A real person reads every message, usually within a day or two. [Jacob: how quickly',
    `A real person reads every message, usually within a day or two. ${draft(
      'You can also text the church phone any time. Someone usually replies the same day, weekends included.',
      'is that right, on a Saturday night too?',
    )}`,
  ],
  [
    'form-prayer',
    'intro',
    'Tell us what to pray for, in as few or as many words as you like. [Jacob: who else sees a request',
    `Tell us what to pray for, in as few or as many words as you like. ${draft(
      'Your request goes to Pastor Jacob. It is passed to the church prayer chain only if you tick the box below, and it is never read aloud or printed in the bulletin unless you ask.',
      'is that right? The page should say exactly who sees a request.',
    )}`,
  ],

  // --- Questions people ask --------------------------------------------------------------------
  [
    'faq-baptism',
    answer('k61', 'k62'),
    '[Jacob: how someone asks about being baptized here',
    draft(
      'Tell Pastor Jacob, after a service or through the Contact page. He will sit down with you to talk about what it means to follow Jesus and what baptism is, and then we set a Sunday so the whole church can celebrate with you.',
      'is that how it works here?',
    ),
  ],
  [
    'faq-children',
    answer('k46', 'k47'),
    '[Jacob: is there a nursery or children',
    draft(
      'There is also a nursery for babies and toddlers during worship, looked after by members of the church family you can meet beforehand.',
      "is there a nursery or children's room during worship, for what ages, and who looks after it?",
    ),
  ],
  [
    'faq-communion',
    answer('k59', 'k60'),
    '[Jacob: how often the church shares the Lord',
    draft(
      "Yes. We share the Lord's Supper together several times a year, and we say so ahead of time. Every believer who has trusted Jesus as Savior is welcome to take part, and you are free simply to pass the plate along.",
      'how often, and who is welcome to take part (every believer, baptized believers, members)?',
    ),
  ],

  // --- Home ------------------------------------------------------------------------------------
  [
    'homePage',
    'pageBuilder[_key=="home-hero"].subhead',
    '[Placeholder: A church family in Ross Township with room for one more.',
    draft(
      'A church family in Ross Township with room for one more. Hymns, an open Bible and people who learn your name. Someone will meet you at the door.',
      'is that an honest line about a Sunday here?',
    ),
  ],
  [
    'homePage',
    block('home-gospel', 'ap1', 'ap0'),
    '[Jacob: two or three sentences of the good news',
    draft(
      "God made us to know him, but every one of us has turned away, and that sin separates us from him. Jesus, God's own Son, lived the life we could not, died on the cross in our place and rose again on the third day. Anyone who turns from sin and trusts him is forgiven, made new and welcomed into God's family for good.",
      'our draft of the good news, for you to rewrite in your own words. This is the first place on the site a visitor meets the gospel.',
    ),
  ],
  [
    'homePage',
    block('home-pastor', 'home-pastor-p1', 'home-pastor-p1-s1'),
    '[Jacob: three or four sentences: your name',
    draft(
      "Hi, I'm Jacob Wysong, and I have the privilege of serving as pastor here. On Sundays I open the Bible and try to say plainly what it says. My hope for your first Sunday is simple: that you are welcomed like family and that you hear about Jesus. I would love to meet you.",
      'add your family and how you came to Auburn, if you would like to share them.',
    ),
  ],

  // --- Give ------------------------------------------------------------------------------------
  [
    'page-give',
    block('gv-care', 'gv-care-1', 'gv-care-1-s'),
    '[Jacob: how the offering is counted',
    draft(
      'Every offering is counted by two people together, recorded, and deposited the same week, so no one handles gifts alone.',
      'is that how it is done here?',
    ),
  ],
  [
    'page-give',
    block('gv-care', 'gv-care-2', 'gv-care-2-s'),
    '[Jacob: whether givers get a giving statement',
    draft(
      'If you give by check or in a named envelope, you will receive a giving statement each January for your taxes. Ask the church treasurer if you need one sooner.',
      'is that right, and who should people ask?',
    ),
  ],
  [
    'page-give',
    block('gv-care', 'gv-care-3', 'gv-care-3-s'),
    '[Jacob: how the budget is set',
    draft(
      "The church votes on its budget each year at a members' meeting, and the treasurer reports on giving and spending through the year. Any member may ask to see the figures.",
      'is that right?',
    ),
  ],
  [
    'page-give',
    block('gv-care', 'gv-care-4', 'gv-care-4-s'),
    '[Jacob: a sentence on the Cooperative Program',
    draft(
      'Through the Cooperative Program, Southern Baptist churches pool part of their giving to send missionaries, train pastors and start new churches. A share of every gift given here goes on to that work.',
      'the share of each gift that goes to it, if you would like that told.',
    ),
  ],

  // --- Leadership ------------------------------------------------------------------------------
  [
    'page-leadership',
    block('lead-pastor', 'k14', 'k15'),
    '[Jacob: three or four sentences about you',
    draft(
      'Jacob Wysong serves as senior pastor of First Baptist Church of Auburn. He preaches most Sundays, visits when someone is sick or grieving, and loves this church for the way its people look after one another. He would be glad to meet you.',
      'add how you came to Auburn, and your family if you would like to share it. A photo of you goes beside it.',
    ),
  ],
  [
    'page-leadership',
    block('lead-how', 'ap69', 'ap68'),
    '[Jacob: one sentence on how decisions are made here',
    draft(
      'We are a congregational church: the members vote on the big decisions, such as receiving new members, the yearly budget and calling a pastor. The pastor leads and teaches, and the deacons serve alongside him, caring for members and for the practical needs of the church.',
      'is that how it works here?',
    ),
  ],

  // --- Ministries ------------------------------------------------------------------------------
  [
    'page-ministries',
    fyp('g-kids', 'k-kids'),
    '[Placeholder: Sunday School classes, and a room for little ones during worship.]',
    `${draft(
      'Sunday School classes for children of every age, and a nursery for babies through age three during worship.',
      'the ages and the nursery hours, and who leads it.',
    )} ${SAFETY_DRAFT}`,
  ],
  [
    'page-ministries',
    fyp('g-kids', 'k-youth'),
    '[Placeholder: A Wednesday night for students to ask real questions',
    draft(
      'A Wednesday night for students in grades 6 to 12 to ask real questions, open the Bible and have some fun.',
      'the ages, what happens, and who leads it.',
    ),
  ],
  [
    'page-ministries',
    fyp('g-serve', 's-kids'),
    'Help with the little ones during worship. [Jacob: the child safety policy',
    `Help with the little ones during worship. ${SAFETY_DRAFT}`,
  ],
  [
    'page-ministries',
    block('min-serve', 'k22', 'k23'),
    '[Jacob: one or two real examples of how the church serves',
    draft(
      'Through the year, members keep a food pantry stocked for neighbors in Auburn and Ross Township, and take meals to families who are sick or grieving.',
      'one or two real examples, and whether the food pantry runs through the year.',
    ),
  ],

  // --- Next steps ------------------------------------------------------------------------------
  [
    'page-next-steps',
    block('ns-know', 'ap50', 'ap49'),
    '[Jacob: the verse you would like here',
    draft(
      '"That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." Romans 10:9',
      'this is the King James wording, as on your Facebook page. Swap in the verse and the translation the church reads.',
    ),
  ],
  [
    'page-next-steps',
    step('ns-baptism'),
    '[Jacob: what baptism means here',
    draft(
      'Baptism is how a believer says in front of everyone, I belong to Jesus. We baptize by immersion, after a person has trusted Christ. If that is you, tell Pastor Jacob. He will talk it through with you, and we will set a Sunday.',
      'is there a class first, or a conversation with you? Which Sundays?',
    ),
  ],
  [
    'page-next-steps',
    step('ns-member'),
    '[Jacob: how someone joins the church',
    draft(
      'Joining the church means saying, these are my people, and letting them say the same of you. Talk with Pastor Jacob about how you came to faith and about your baptism, and the church then welcomes you by a vote of its members, usually at the close of a Sunday service.',
      'is there a class, and is that how the vote works here?',
    ),
  ],
  [
    'page-next-steps',
    'pageBuilder[_key=="ns-cta"].subhead',
    '[Jacob: would you like to offer coffee with you',
    draft(
      'Not sure where to start? Have a coffee with Pastor Jacob and ask him anything.',
      'would you like to offer this as the easiest first step?',
    ),
  ],

  // --- Need the pastor? ------------------------------------------------------------------------
  [
    'page-pastoral-care',
    block('pc-reach', 'ap85', 'ap84'),
    '[Jacob: the best way to reach you after hours',
    draft(
      'If it cannot wait, call or text the church phone at any hour and say it is urgent. Pastor Jacob will get back to you as soon as he can, and if he cannot be reached, a deacon will.',
      'is that the best way after hours and at the weekend, and are you happy for it to be on the site? If a deacon can be called instead, who?',
    ),
  ],
  [
    'page-pastoral-care',
    card('pc-care', 'pc-communion'),
    '[Jacob: do you bring the Lord',
    draft(
      "If you cannot get to church, Pastor Jacob and a deacon will gladly bring the Lord's Supper to you at home or in the hospital. Just ask.",
      'do you offer this, and how should someone ask?',
    ),
  ],
  [
    'page-pastoral-care',
    card('pc-care', 'pc-wedding'),
    '[Jacob: do you marry couples who are not members',
    draft(
      'Pastor Jacob is glad to talk with any couple planning to marry, member or not. He asks to meet with you a few times beforehand to help you get ready for marriage, so please get in touch well before the date.',
      'do you marry couples who are not members, and what do you ask of them first?',
    ),
  ],
  [
    'page-pastoral-care',
    card('pc-care', 'pc-help'),
    '[Jacob: can the church help with food or a bill',
    draft(
      'If you are short on groceries or facing a bill you cannot cover, tell Pastor Jacob quietly, by a call, a text or the Contact page. We cannot fix everything, but we will do what we can, and it stays between us.',
      'can the church help this way, and how should someone ask?',
    ),
  ],

  // --- Plan your visit -------------------------------------------------------------------------
  [
    'page-plan-your-visit',
    block('pyv-kids', 'ap10', 'ap9'),
    '[Jacob: the details parents look for first',
    draft(
      'Babies and toddlers up to age three have a nursery during worship, just off the sanctuary. A greeter will show you where, and you sign your child in and collect them yourself afterward. Older children stay in worship with their families, and nobody minds a little noise. Sunday School before worship has a class for every age.',
      "the real ages, where you check children in and pick them up, whether the nursery runs for the whole service, and what a five-year-old does in worship (a children's message, an activity bag?).",
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-kids', 'ap12', 'ap11'),
    '[Jacob: the child safety policy',
    SAFETY_DRAFT,
  ],
  [
    'page-plan-your-visit',
    block('pyv-worship', 'ap18', 'ap17'),
    '[Jacob: the singing',
    draft(
      'We sing hymns from the hymnal along with a few newer songs, led from the piano. You do not need to know the tunes. Listen in until you do.',
      'hymns, newer songs, or both? A piano, an organ, a choir?',
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-worship', 'ap20', 'ap19'),
    '[Jacob: which Bible translation',
    draft(
      'Pastor Jacob preaches from the King James Version, and there are Bibles in the pews, so you do not need to bring one.',
      'which translation do you preach from, and are there pew Bibles a guest can use?',
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-worship', 'ap22', 'ap21'),
    '[Jacob: the sermon',
    draft(
      'The sermon runs about thirty minutes. Most weeks it works through a book of the Bible passage by passage, so you hear what the text says and what it means for the week ahead.',
      'do you preach through books of the Bible, and about how long?',
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-worship', 'ap24', 'ap23'),
    '[Jacob: is there an invitation at the close',
    draft(
      'The service closes with a hymn of invitation. If you want to follow Jesus, ask for prayer or join the church, you can walk to the front and Pastor Jacob will meet you there. Nobody is singled out, and staying in your seat is fine.',
      'is there an invitation, and is that what happens?',
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-worship', 'ap26', 'ap25'),
    '[Jacob: how often the church shares the Lord',
    draft(
      "We share the Lord's Supper several times a year. Every believer who has trusted Jesus as Savior is welcome to take part, and you are free simply to pass the plate along.",
      'how often, and may a visitor take part?',
    ),
  ],
  [
    'page-plan-your-visit',
    block('pyv-here', 'here-access', 'here-access-s'),
    '[Jacob: access, in one short list.',
    draft(
      'Once you are inside there are no steps, the restrooms are on the same floor as the sanctuary, and there is room for a wheelchair at the end of a pew. Tell a greeter if you need a hand with anything.',
      'this one is a guess. Is there an accessible restroom, and where? Any steps inside? A hearing loop or assisted listening? Large-print bulletins or hymnals?',
    ),
  ],

  // --- What we believe -------------------------------------------------------------------------
  [
    'page-what-we-believe',
    block('wwb-short', 'wwb-short-p1', 'wwb-short-p1-s1'),
    '[Jacob: the good news in three or four plain sentences',
    draft(
      'God made the world, and he made us to know him. All of us have gone our own way instead. The Bible calls that sin; it cuts us off from God, and we cannot mend it ourselves. So God sent his Son, Jesus, who lived without sin, died on the cross to take the punishment we deserved, and rose from the dead. Everyone who turns from sin and puts their trust in him is forgiven and given new life, now and forever.',
      'our draft of the good news, for you to rewrite the way you would tell it over coffee. The beliefs below are our drafts too, taken from the Baptist Faith and Message.',
    ),
  ],
  ...belief(
    'b2',
    'God',
    'There is one living and true God, who made everything and rules over it all. He has shown himself as Father, Son and Holy Spirit: three persons, one God, equal in every way.',
    'Matthew 28:19',
  ),
  ...belief(
    'b3',
    'who Jesus is',
    "Jesus Christ is the eternal Son of God. He became a man, born of the virgin Mary, and lived without sin. He died on the cross for our sins, rose bodily from the grave, and now reigns at the Father's right hand.",
    'John 1:14',
  ),
  ...belief(
    'b7',
    'the Holy Spirit',
    'The Holy Spirit is fully God. He shows us our sin and draws us to Christ, and he lives in every believer from the moment they are saved, bringing comfort, understanding of the Bible and strength to live for God.',
    'John 14:26',
  ),
  ...belief(
    'b1',
    'the Bible',
    "The Bible is God's Word, written by people God inspired. It is true and trustworthy in all it says, and it is the final authority for what we believe and how we live.",
    '2 Timothy 3:16',
  ),
  ...belief(
    'b8',
    'how God made people',
    'God made every person in his own image, so every life has worth. But the first man and woman chose to disobey God, and all of us have followed them. Sin separates us from God, and we cannot save ourselves.',
    'Romans 3:23',
  ),
  ...belief(
    'b4',
    'how a person is saved',
    "Salvation is God's free gift, never something we earn. Anyone who turns from sin and trusts Jesus Christ as Lord is forgiven, made new and kept by God forever.",
    'Ephesians 2:8-9',
  ),
  ...belief(
    'b5',
    'baptism and the Lord',
    "Baptism is the immersion of a believer in water, a picture of dying to the old life and rising to a new one in Christ. The Lord's Supper is bread and the cup, shared to remember Jesus' death until he comes. Neither one saves us. Both point to the One who does.",
    'Romans 6:4',
  ),
  ...belief(
    'b6',
    'the church',
    'The church is the family of baptized believers, gathered to worship God, learn the Bible, care for one another and take the good news to our neighbors and to the world. Jesus is its head, and each local church governs itself under him.',
    'Acts 2:42',
  ),
  ...belief(
    'b9',
    'the return of Christ',
    'Jesus will come again, in person and in glory, at a time only God knows. The dead will be raised and he will judge everyone rightly. Those who have rejected him will be separated from God forever, and those who belong to him will live with him forever.',
    'John 14:3',
  ),
  [
    'page-what-we-believe',
    block('wwb-baptism', 'k10', 'k11'),
    '[Jacob: what baptism means to this church',
    draft(
      'We baptize people who have personally put their faith in Jesus, and we baptize by immersion, the way the New Testament describes. Going under the water pictures dying with Christ, and coming up pictures rising to a new life. Baptism does not save anyone, but it is the first step of obedience for everyone who is saved. If you would like to be baptized, talk with Pastor Jacob.',
      OUR_DRAFT,
    ),
  ],
  [
    'page-what-we-believe',
    block('wwb-baptist', 'ap46', 'ap45'),
    '[Jacob: what makes Auburn a Baptist church',
    draft(
      "Baptists are people of the Book. We baptize believers only, and by immersion. We share the Lord's Supper as a remembrance of what Jesus did. Each church is free under Christ to run its own affairs, and its members decide together. Every believer can pray to God directly and read the Bible for themselves, and nobody's faith should be forced by a government or by a church.",
      'our draft of what makes Auburn Baptist, for you to rewrite. People often ask how a Baptist church differs from the Methodist or Presbyterian church down the road, and this is the answer.',
    ),
  ],
  [
    'page-what-we-believe',
    block('wwb-baptist', 'ap48', 'ap47'),
    '[Jacob: how Auburn works with other Southern Baptists',
    draft(
      'We are a Southern Baptist church. We work with sister churches through our local Baptist association and the State Convention of Baptists in Ohio, and through the Cooperative Program our giving helps send missionaries across North America and around the world.',
      'the name of your association, and any missionaries the church supports.',
    ),
  ],
];

/** Read a value at a patch path ("a.b[_key==\"k\"].c") from a document. */
function read(doc, path) {
  let node = doc;
  for (const seg of path.match(/[^.[\]]+|\[_key=="[^"]+"\]/g) ?? []) {
    if (node == null) return undefined;
    const k = seg.match(/^\[_key=="(.+)"\]$/);
    node = k
      ? Array.isArray(node)
        ? node.find((item) => item?._key === k[1])
        : undefined
      : node[seg];
  }
  return node;
}

/** Curly and straight apostrophes compare the same, so WAS can be typed plainly. */
const plain = (s) => s.replace(/’/g, "'");

const ids = [...new Set(CHANGES.map(([id]) => id))];
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
writeFileSync(join(dir, 'best-guess-drafts-before.json'), JSON.stringify(docs, null, 2));

const sets = new Map();
let skipped = 0;
for (const [id, path, was, value] of CHANGES) {
  const now = read(byId.get(id), path);
  if (typeof now !== 'string' || !plain(now).startsWith(plain(was))) {
    skipped += 1;
    console.log(
      `SKIP ${id} ${path}\n     now: ${typeof now === 'string' ? now.slice(0, 90) : now}`,
    );
    continue;
  }
  if (!sets.has(id)) sets.set(id, {});
  sets.get(id)[path] = value;
  console.log(`\n${id} ${path}\n  - ${now}\n  + ${value}`);
}

let count = 0;
for (const [id, set] of sets) {
  const n = Object.keys(set).length;
  count += n;
  await apply(`${id}: ${n} draft${n === 1 ? '' : 's'}`, () => client.patch(id).set(set).commit());
}
console.log(`\n${count} drafts in ${sets.size} documents, ${skipped} skipped.`);
done(count);
