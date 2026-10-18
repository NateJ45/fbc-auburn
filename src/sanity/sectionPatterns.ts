// Safe to edit by hand
// =============================================================================
// Section patterns - seasonal and one-off groups of sections, ready to insert
// =============================================================================
// A PAGE TEMPLATE (pageTemplates.ts) starts a new page. A PATTERN is a few
// sections that go together, dropped into a page that already exists: the
// Easter times on the home page, a snow-Sunday notice at the top of Plan a
// visit, the building fund bar on Give.
//
// WHERE THEY LIVE. The page builder's "Insert a saved section" button reads
// saved sections (`sectionPreset` documents) from the dataset, so a pattern has
// to exist there to be offered. This file is the source of truth for their
// words; scripts/content/seed-section-patterns.mjs copies them into the dataset
// as DRAFT saved sections (dry by default, rule 16). Drafts on purpose: a copy
// can be added from a draft, but a synced section can only show a published
// one, so example text can never go live through a synced section by accident.
// The script never overwrites one that exists (draft or published), so the
// pastor's own edits are safe if it runs again.
//
// The seasonal page templates (pageTemplates.ts, group "Seasonal") reuse these
// sections, so a whole Easter page and an Easter band on the home page say the
// same thing.
//
// Every line the church must supply starts "Example:" (src/lib/authoring.ts),
// and the page builder warns about it once the copy is on a page.
// src/lib/authoring.test.ts checks every pattern the same way as a template.
//
// No `sanity` import here on purpose: node --test loads this file directly.
// =============================================================================

import { freshKeys } from '../lib/authoring.ts';
import {
  button,
  card,
  countdown,
  example,
  externalButton,
  iconCards,
  imageText,
  notice,
  paras,
  progress,
  richText,
  scripture,
  buttonRow,
  link,
} from './templateBlocks.ts';

type Rec = Record<string, unknown>;

export interface SectionPattern {
  /** Stable id. The saved section is stored as `pattern-<id>`. */
  id: string;
  /** The saved section's name, as the "Insert a saved section" list shows it. */
  title: string;
  /** One line under the name: where it fits and what to change. */
  note: string;
  /** The sections, with fresh keys every call. */
  sections: () => Rec[];
}

const list = (...sections: Rec[]) => freshKeys(sections);

// ── The sections, as functions so templates can reuse them ───────────────────

export const easterSections = (): Rec[] => [
  countdown({
    eventName: 'Easter Sunday',
    intro: example(
      'Come and celebrate the risen Lord with us. Everyone is welcome, and you do not need to dress up.',
    ),
    duringText: 'He is risen! Happy Easter from all of us.',
    afterText: 'He is risen indeed. Thank you to everyone who worshiped with us.',
  }),
  iconCards(
    'Easter at Auburn',
    [
      card(
        'praying-hands',
        example('Good Friday'),
        example('A quiet evening service remembering the cross. About an hour.'),
        example('Friday at 7:00 pm'),
      ),
      card(
        'coffee',
        example('Easter breakfast'),
        example('Breakfast in the fellowship hall before Sunday School. Bring the family.'),
        example('Sunday at 9:00 am'),
      ),
      card(
        'bible',
        example('Easter worship'),
        example('Singing, the Lord’s Supper and a message from the empty tomb.'),
        example('Sunday at 11:00 am'),
      ),
    ],
    example('Times for each service this Holy Week. Change or remove any card.'),
  ),
  scripture(
    'He is not here: for he is risen, as he said. Come, see the place where the Lord lay.',
    'Matthew 28:6',
  ),
];

export const christmasSections = (): Rec[] => [
  iconCards(
    'Christmas at Auburn',
    [
      card(
        'music',
        example('Christmas music Sunday'),
        example('The choir and the congregation sing the story of Christmas.'),
        example('A Sunday in December, at 11:00 am'),
      ),
      card(
        'praying-hands',
        example('Christmas Eve candlelight service'),
        example('Carols, the Christmas story from Luke 2 and candles at the end. About an hour.'),
        example('Christmas Eve at 6:00 pm'),
      ),
      card(
        'blocks',
        example('Children’s program'),
        example('The children tell the Christmas story. Grandparents, bring your camera.'),
        example('A Sunday in December, at 11:00 am'),
      ),
    ],
    example('Everyone is welcome at every one of these. Bring a friend.'),
  ),
  scripture(
    'For unto you is born this day in the city of David a Saviour, which is Christ the Lord.',
    'Luke 2:11',
  ),
];

export const homecomingSections = (): Rec[] => [
  countdown({
    eventName: 'Homecoming Sunday',
    intro: example(
      'Former members, old friends and new faces: come home to Auburn for a morning of worship and dinner on the grounds.',
    ),
    duringText: 'Welcome home! We are so glad you are here.',
    afterText: 'Thank you for coming home with us. See you next year.',
  }),
  imageText({
    heading: 'Homecoming Sunday',
    body: paras(
      example(
        'Worship begins at the usual time, with special music and our guest speaker, Rev. Name of the speaker.',
      ),
      example(
        'Dinner on the grounds follows. Bring a covered dish if you can, and come hungry if you cannot.',
      ),
    ),
    side: 'right',
  }),
];

export const revivalSections = (): Rec[] => [
  countdown({
    eventName: 'Revival services',
    intro: example('Five nights of preaching, singing and prayer. Bring a friend each night.'),
    duringText: 'Revival is happening now. Join us tonight.',
    afterText: 'Thank you for praying and coming. God is good.',
  }),
  iconCards(
    'Revival week',
    [
      card(
        'bible',
        example('The preacher'),
        example('Rev. Name of the evangelist, from the name of their church or ministry.'),
      ),
      card(
        'clock',
        example('Every night'),
        example('Sunday to Wednesday, with a nursery for little ones.'),
        example('7:00 pm each evening'),
      ),
      card(
        'music',
        example('Special music'),
        example('Different singers each night. The list goes here once it is set.'),
      ),
    ],
    example('One sentence about why the church is holding revival meetings this year.'),
  ),
  scripture('Wilt thou not revive us again: that thy people may rejoice in thee?', 'Psalm 85:6'),
];

export const fallFestivalSections = (): Rec[] => [
  imageText({
    heading: example('Trunk-or-treat and fall festival'),
    body: paras(
      example(
        'A safe, friendly evening for families in Auburn and Ross Township. Decorated car trunks full of candy, games for the kids, and hot chili and cider for everyone.',
      ),
      example('It is free, and everyone is welcome. Costumes are welcome too, nothing too scary.'),
    ),
    side: 'left',
  }),
  iconCards('The details', [
    card('clock', 'When', example('The date, and the time it starts and ends.')),
    card(
      'map-pin',
      'Where',
      example('The church parking lot. Inside the fellowship hall if it rains.'),
    ),
    card(
      'giving-hand',
      'Decorate a trunk',
      example('Church families: sign up to decorate a car and bring candy. Ask in the office.'),
    ),
  ]),
];

export const thanksgivingSections = (): Rec[] => [
  richText('A Thanksgiving meal for everyone', [
    ...paras(
      example(
        'Every year the church family shares a Thanksgiving meal, and you are welcome at the table. The turkey is provided; bring a side dish or a dessert if you can.',
      ),
      example(
        'If you would be eating alone this Thanksgiving, please come. If you need a ride or a plate delivered, let us know.',
      ),
    ),
  ]),
  scripture(
    'O give thanks unto the LORD, for he is good: for his mercy endureth for ever.',
    'Psalm 107:1',
  ),
  buttonRow(
    'Coming to the meal?',
    [
      link(button(example('Tell us you are coming')), example('So we have enough seats.')),
      link(button(example('Ask for a ride or a plate')), example('We are glad to help.')),
    ],
    { layout: 'cards' },
  ),
];

export const buildingFundSections = (): Rec[] => [
  progress(
    'Building fund',
    example(
      'What the fund is for, in one sentence, like "A new roof for the sanctuary before next winter."',
    ),
    button(example('Give to the building fund')),
  ),
  richText(example('Why we are building'), [
    ...paras(
      example(
        'A short paragraph about the project: what is being done, why now, and how it helps the church serve people.',
      ),
      example(
        'Say how to give to it: in the offering with "building fund" on the envelope, or online.',
      ),
    ),
  ]),
];

export const anniversarySections = (): Rec[] => [
  imageText({
    heading: example('Celebrating NN years together'),
    body: paras(
      example(
        'This year First Baptist Church of Auburn gives thanks for the number of years God has kept this church. Say when and how it began, in a sentence or two.',
      ),
      example('Say what is planned for the year: a special service, a meal, a history book.'),
    ),
    side: 'right',
    art: 'mark',
  }),
  scripture(
    'Then Samuel took a stone, and set it between Mizpeh and Shen, and called the name of it Ebenezer, saying, Hitherto hath the LORD helped us.',
    '1 Samuel 7:12',
  ),
  buttonRow(
    'Be part of it',
    [
      link(button(example('Share a memory')), example('Old photos and stories are very welcome.')),
      link(button(example('Read our story')), example('The church history, year by year.')),
    ],
    { layout: 'cards' },
  ),
];

export const snowSundaySections = (): Rec[] => [
  notice(
    example(
      'No services this Sunday because of the snow and ice. Please stay safe, and join us online if you can.',
    ),
    'urgent',
  ),
];

export const lottieMoonSections = (): Rec[] => [
  richText('The Lottie Moon Christmas Offering', [
    ...paras(
      'Each December, Southern Baptist churches give together to the Lottie Moon Christmas Offering. Every dollar goes to support missionaries sharing the gospel around the world through the International Mission Board.',
      example(
        'Say how the church gives: a special envelope, a Sunday to bring it, a week of prayer.',
      ),
    ),
  ]),
  progress(
    example('Our Lottie Moon goal'),
    example('Update the amount each Sunday so everyone can see how we are doing together.'),
    externalButton('About the International Mission Board', 'https://www.imb.org/'),
  ),
];

export const annieArmstrongSections = (): Rec[] => [
  richText('The Annie Armstrong Easter Offering', [
    ...paras(
      'Each spring, Southern Baptist churches give together to the Annie Armstrong Easter Offering. All of it supports missionaries and church planters across the United States and Canada through the North American Mission Board.',
      example(
        'Say how the church gives: a special envelope, a Sunday to bring it, a week of prayer.',
      ),
    ),
  ]),
  progress(
    example('Our Annie Armstrong goal'),
    example('Update the amount each Sunday so everyone can see how we are doing together.'),
    externalButton('About the North American Mission Board', 'https://www.namb.net/'),
  ),
];

export const memorialSections = (): Rec[] => [
  scripture(
    'Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.',
    'John 11:25',
  ),
  imageText({
    heading: example('In loving memory of Full Name'),
    body: paras(
      example(
        'A few sentences about their life and their place in this church family, written with the family’s blessing.',
      ),
      example('Born Month Day, Year. Went home to be with the Lord Month Day, Year.'),
    ),
    side: 'left',
  }),
  iconCards('Services', [
    card('clock', example('Visitation'), example('The day, the time and the place.')),
    card('praying-hands', example('Funeral service'), example('The day, the time and the place.')),
    card(
      'coffee',
      example('Meal for the family'),
      example('Who to tell if you can bring food or help serve.'),
    ),
  ]),
];

// ── The patterns, in the order the seed script writes them ───────────────────

export const SECTION_PATTERNS: SectionPattern[] = [
  {
    id: 'easter-services',
    title: 'Easter services',
    note: 'Countdown, the Holy Week times and a verse. For the home page or Plan a visit in spring.',
    sections: () => list(...easterSections()),
  },
  {
    id: 'christmas-services',
    title: 'Christmas services',
    note: 'The December services and a verse. For the home page in December.',
    sections: () => list(...christmasSections()),
  },
  {
    id: 'homecoming',
    title: 'Homecoming Sunday',
    note: 'Countdown and the day itself: worship, a guest speaker, dinner on the grounds.',
    sections: () => list(...homecomingSections()),
  },
  {
    id: 'revival-week',
    title: 'Revival week',
    note: 'Countdown, the preacher and the nightly times, and a verse.',
    sections: () => list(...revivalSections()),
  },
  {
    id: 'fall-festival',
    title: 'Trunk-or-treat and fall festival',
    note: 'An invitation and the details. For the home page in October.',
    sections: () => list(...fallFestivalSections()),
  },
  {
    id: 'thanksgiving-meal',
    title: 'Thanksgiving meal',
    note: 'An invitation to the church meal, a verse and two buttons (coming, or need a ride).',
    sections: () => list(...thanksgivingSections()),
  },
  {
    id: 'building-fund',
    title: 'Building fund',
    note: 'A progress bar toward the goal and why the church is building. For Give or the home page.',
    sections: () => list(...buildingFundSections()),
  },
  {
    id: 'anniversary-year',
    title: 'Anniversary year',
    note: 'The church mark, a few words on the years, a verse and two buttons. For a milestone year.',
    sections: () => list(...anniversarySections()),
  },
  {
    id: 'snow-sunday',
    title: 'Snow Sunday closing notice',
    note: 'An urgent notice. Set "Show from" and "Show until", then drag it to the top of the page.',
    sections: () => list(...snowSundaySections()),
  },
  {
    id: 'lottie-moon',
    title: 'Mission offering: Lottie Moon (December)',
    note: 'What the offering is, and a progress bar toward the church goal.',
    sections: () => list(...lottieMoonSections()),
  },
  {
    id: 'annie-armstrong',
    title: 'Mission offering: Annie Armstrong (spring)',
    note: 'What the offering is, and a progress bar toward the church goal.',
    sections: () => list(...annieArmstrongSections()),
  },
  {
    id: 'memorial',
    title: 'Memorial for a member',
    note: 'A verse, a few words about them, and the visitation and service times. Only with the family’s blessing.',
    sections: () => list(...memorialSections()),
  },
];
