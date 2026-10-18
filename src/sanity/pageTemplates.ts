// Safe to edit by hand
// =============================================================================
// Page templates - the starting points offered when someone makes a new page
// =============================================================================
// When an editor clicks "+" on Custom pages, the Studio asks which of these to
// start from (PORTS.md card 109). Each one fills the page with sections and
// warm, plain starting copy, so nobody faces an empty page wondering what goes
// where, and nothing example-shaped can go live unnoticed: every line the
// church must supply starts "Example:", and the page builder shows a warning on
// any section that still has one (src/lib/page-guardrails.ts).
//
// THIS FILE IS THE SITE'S OWN. It is not PORTABLE: a church, a shop and a
// studio want different starting points, so each fork rewrites this list. Keep
// to block types a custom page accepts (PAGE_SECTION_TYPES in
// schemaTypes/richSections.ts); src/lib/authoring.test.ts fails if a template
// names one that does not exist, leaves an array member without a `_key`,
// forgets the example marker, or has an em-dash in its copy.
//
// `sections` is a FUNCTION, called each time a page is made, and it runs the
// result through freshKeys(), so two pages made from one template never share a
// `_key`. Write any `_key` you like below (or none): they are all replaced.
//
// FBC Auburn (2026-10-18): the full set a small Southern Baptist church needs,
// written for a pastor editing alone. The rules the copy follows:
//   - Facts that live in Site settings > Church facts (service times, address,
//     phone, email, giving link, live stream) are never typed: the blocks that
//     read them are used instead (rule 15).
//   - No invented names, dates, numbers or claims about how something is run:
//     those are "Example:" lines. Generic, true sentences are left plain, so a
//     page needs only its examples replaced.
//   - US English, no em-dashes (rule 2), no prices. Bible verses are typed in
//     the King James Version, so no translation's copyright is in question.
// The builders are in templateBlocks.ts; the seasonal sections are shared with
// the saved-section patterns in sectionPatterns.ts.
//
// GROUPS. Sanity's "new document" menu has no headings, so sanity.config.ts
// shows each template as "<group>: <title>" and this list is kept in group
// order (TEMPLATE_GROUPS). The test checks the order.
//
// No `sanity` import here on purpose: node --test loads this file directly.
// sanity.config.ts turns the list into Studio templates.
// =============================================================================

import { freshKeys } from '../lib/authoring.ts';
import {
  accordion,
  belief,
  beliefs,
  button,
  buttonRow,
  calendarSubscribe,
  card,
  column,
  columns,
  contactCard,
  countdown,
  ctaBand,
  downloads,
  events,
  example,
  externalButton,
  form,
  giving,
  hero,
  iconCards,
  imageText,
  latestNews,
  latestSermon,
  link,
  livestream,
  map,
  moment,
  newsletter,
  para,
  paras,
  people,
  qa,
  railStep,
  richText,
  scripture,
  serviceTimes,
  sermonSeries,
  stepsRail,
  tab,
  tabs,
  timeline,
  watch,
} from './templateBlocks.ts';
import {
  anniversarySections,
  christmasSections,
  easterSections,
  fallFestivalSections,
  homecomingSections,
  revivalSections,
  thanksgivingSections,
} from './sectionPatterns.ts';

type Rec = Record<string, unknown>;

/** The headings the template menu is sorted under, in menu order. */
export const TEMPLATE_GROUPS = [
  'Visitors',
  'About us',
  'Ministries',
  'Life events',
  'Seasonal',
  'Sermons and news',
  'Blank',
] as const;
export type TemplateGroup = (typeof TEMPLATE_GROUPS)[number];

export interface PageTemplate {
  /** Stable id. Changing it only changes the menu; pages already made keep their content. */
  id: string;
  /** Which heading it sits under in the menu. */
  group: TemplateGroup;
  /** What the "new page" menu says (after the group). */
  title: string;
  /** One line under the title, in the menu. */
  description: string;
  /** The sections a new page starts with. */
  sections: () => Rec[];
}

/** "Visitors: Plan a visit", the way the Studio menu shows a template. */
export const templateMenuTitle = (t: PageTemplate): string => `${t.group}: ${t.title}`;

/** Build a list and give every array member a fresh key. */
const page = (...sections: Rec[]) => freshKeys(sections);

/** The usual first-visit button, pointed at Plan a visit by the editor. */
const planVisit = () => button(example('Plan your visit'));

/** The usual "ask us" band at the foot of a page. */
const askBand = (headline: string, subhead: string, label = 'Get in touch') =>
  ctaBand(headline, example(subhead), button(example(label)));

// ── The templates, in menu order ─────────────────────────────────────────────

export const PAGE_TEMPLATES: PageTemplate[] = [
  // ── Visitors ───────────────────────────────────────────────────────────────
  {
    id: 'page-visit',
    group: 'Visitors',
    title: 'Plan a visit',
    description: 'For someone new: service times, what to expect, questions, and the map.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Your first Sunday',
          headline: 'Plan your visit',
          subhead:
            'Everything you might wonder about before you come, so you can walk in feeling at home.',
          primary: button(example('Tell us you are coming')),
        }),
        serviceTimes('When we meet'),
        iconCards('What to expect', [
          card(
            'coffee',
            'A friendly welcome',
            example('Someone will meet you at the door, answer any question and show you around.'),
          ),
          card(
            'bible',
            'About an hour',
            example('We sing, pray and open the Bible together for about an hour.'),
          ),
          card(
            'blocks',
            'Your children',
            example(
              'Children are welcome in worship. There is also a checked-in room with background-checked volunteers.',
            ),
          ),
        ]),
        accordion('Questions people ask', [
          qa(
            'What should I wear?',
            example(
              'Whatever you are comfortable in. You will see jeans and you will see Sunday best.',
            ),
          ),
          qa(
            'Will I be asked to stand up or say something?',
            example('No. Nobody will put you on the spot. Sit wherever you like.'),
          ),
          qa(
            'Do I need to bring anything?',
            example(
              'Just yourself. Bring a Bible if you have one; if not, there are Bibles in the pews.',
            ),
          ),
          qa(
            'Is there something for my kids?',
            example(
              'Yes. Sunday School has a class for every age, and there is a nursery during worship.',
            ),
          ),
        ]),
        map('Find us', example('Park in the side lot and come in through the front doors.')),
        ctaBand(
          'We would love to meet you',
          'Let us know you are coming and we will look out for you at the door.',
          button(example('Tell us you are coming')),
        ),
      ),
  },
  {
    id: 'page-next-steps',
    group: 'Visitors',
    title: 'Next steps',
    description: 'For someone who has visited: following Jesus, baptism, joining, serving.',
    sections: () =>
      page(
        hero({
          headline: 'Your next step',
          subhead: 'Wherever you are with God and with this church, here is a good place to start.',
        }),
        stepsRail(
          'One step at a time',
          [
            railStep(
              'bible',
              'Follow Jesus',
              example(
                'If you want to know what it means to become a Christian, the pastor would love to sit down with you, open the Bible and pray with you.',
              ),
            ),
            railStep(
              'praying-hands',
              'Be baptized',
              example(
                'Baptism is how a new believer shows the world they belong to Jesus. Ask the pastor about the next baptism Sunday.',
              ),
            ),
            railStep(
              'map-pin',
              'Join the church',
              example(
                'Come to a short membership class to hear what we believe and how the church works, then join the family.',
              ),
            ),
            railStep(
              'giving-hand',
              'Find a place to serve',
              example(
                'Greeters, the nursery, music, the kitchen: there is a place for everyone to help.',
              ),
            ),
          ],
          'None of these has to happen in a hurry. Take the one that fits where you are today.',
        ),
        scripture(
          'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.',
          '2 Corinthians 5:17',
        ),
        buttonRow(
          'Where to go from here',
          [
            link(
              button(example('Talk with the pastor')),
              example('Ask anything. No question is too small.'),
            ),
            link(button(example('Baptism')), example('What it means and how to be baptized.')),
            link(button(example('Membership class')), example('When the next class meets.')),
            link(
              button(example('Serve')),
              example('Ways to help on Sundays and through the week.'),
            ),
          ],
          { layout: 'cards' },
        ),
        askBand(
          'Not sure what comes next?',
          'Tell us where you are and we will help you find the next step.',
        ),
      ),
  },
  {
    id: 'page-contact',
    group: 'Visitors',
    title: 'Get in touch',
    description: 'Phone, email and address from Church facts, a form, and the map.',
    sections: () =>
      page(
        hero({
          headline: 'Get in touch',
          subhead: 'Call, email or stop by. We are always glad to hear from you.',
        }),
        contactCard(
          'How to reach us',
          example(
            'Questions about faith, the church or a need you have: the pastor reads every message and will get back to you.',
          ),
        ),
        form(),
        map('Find us'),
      ),
  },

  // ── About us ───────────────────────────────────────────────────────────────
  {
    id: 'page-beliefs',
    group: 'About us',
    title: 'Beliefs',
    description:
      'What the church believes, with Bible references and the Baptist Faith and Message 2000.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Our faith',
          headline: 'What we believe',
          subhead:
            'The heart of our faith in plain words, with the Bible verses behind each belief.',
        }),
        beliefs(
          'What we believe',
          [
            belief(
              'The Bible',
              example(
                'The Bible is God’s Word. It is true and trustworthy, and it is our final authority for what we believe and how we live.',
              ),
              '2 Timothy 3:16-17; Psalm 119:105',
            ),
            belief(
              'God',
              example(
                'There is one true God, who has made himself known as Father, Son and Holy Spirit.',
              ),
              'Deuteronomy 6:4; Matthew 28:19',
            ),
            belief(
              'Jesus Christ',
              example(
                'Jesus is God the Son, who became a man, lived without sin, died on the cross for our sins and rose again from the dead.',
              ),
              'John 1:14; 1 Corinthians 15:3-4',
            ),
            belief(
              'Salvation',
              example(
                'Salvation is a free gift of God’s grace. It is received by faith in Jesus, not earned by good works.',
              ),
              'Ephesians 2:8-9; Romans 10:9',
            ),
            belief(
              'Baptism and the Lord’s Supper',
              example(
                'Baptism by immersion is a believer’s public picture of new life in Christ. The Lord’s Supper is how the church remembers his death until he comes.',
              ),
              'Romans 6:4; 1 Corinthians 11:23-26',
            ),
            belief(
              'The church',
              example(
                'The local church is a family of baptized believers who worship, grow and serve together, and share the gospel near and far.',
              ),
              'Acts 2:42; Matthew 28:19-20',
            ),
            belief(
              'Christ’s return',
              example('Jesus will come again in glory to judge the world and make all things new.'),
              'John 14:3; Revelation 21:4-5',
            ),
          ],
          'As a Southern Baptist church we hold to the Baptist Faith and Message 2000. The link below opens the full statement.',
        ),
        {
          _type: 'affiliationsSection',
          heading: 'Part of a wider family',
          items: [
            {
              _type: 'affiliation',
              name: 'Southern Baptist Convention',
              url: 'https://www.sbc.net/',
              note: example(
                'Churches working together for missions, disaster relief and training.',
              ),
            },
            {
              _type: 'affiliation',
              name: 'State Convention of Baptists in Ohio',
              url: 'https://scbo.org/',
              note: example('Southern Baptist churches across Ohio.'),
            },
          ],
        },
        ctaBand(
          'Questions about faith are welcome here',
          'Ask us anything, or come and talk with us on Sunday.',
          button(example('Ask a question')),
        ),
      ),
  },
  {
    id: 'page-our-story',
    group: 'About us',
    title: 'Our story',
    description: 'The church’s history as a timeline, from its first meeting to today.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Our story',
          headline: example('How God has kept this church'),
          subhead: example('From a handful of families to the church family we are today.'),
        }),
        imageText({
          heading: 'Who we are',
          body: paras(
            example(
              'Two or three sentences about the church today: who comes, what a Sunday is like, and what the church cares about.',
            ),
          ),
          side: 'right',
          art: 'mark',
        }),
        timeline(
          'Through the years',
          [
            moment(
              '19__',
              example('The church is founded'),
              example('Who started it, where they first met, and why.'),
            ),
            moment(
              '19__',
              example('A building of our own'),
              example('When the first building went up, and who helped build it.'),
            ),
            moment(
              '19__',
              example('The church grows'),
              example('A new sanctuary, a fellowship hall, or a season of growth.'),
            ),
            moment(
              '20__',
              example('Today'),
              example('Where the church is now, and what it is praying for next.'),
            ),
          ],
          example('Add a moment for each part of the story. A photo makes each one come alive.'),
        ),
        scripture(
          'For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.',
          'Psalm 100:5',
        ),
        ctaBand('Be part of the next chapter', 'Come and worship with us on Sunday.', planVisit()),
      ),
  },
  {
    id: 'page-leadership',
    group: 'About us',
    title: 'Leadership',
    description: 'Pastor, staff and deacons from the People list, and how the church is led.',
    sections: () =>
      page(
        hero({
          headline: 'Our leadership',
          subhead: example('The people who serve this church as pastor, staff and deacons.'),
        }),
        people('Pastor and staff', example('The people you will see leading on a Sunday.')),
        people('Deacons', example('Men who serve the church family with care and prayer.')),
        richText('How the church is led', [
          ...paras(
            example(
              'As a Baptist church, the members make decisions together in business meetings. Say how often they meet.',
            ),
            example('Say what the deacons and the committees do, in a sentence each.'),
          ),
        ]),
        askBand(
          'Want to talk with one of us?',
          'Call or email the church office and we will put you in touch.',
        ),
      ),
  },
  {
    id: 'page-pastor',
    group: 'About us',
    title: 'Pastor',
    description: 'Meet the pastor: a word from him, his story, and his latest sermon.',
    sections: () =>
      page(
        hero({
          headline: 'Meet our pastor',
          subhead: example('Pastor Name has served First Baptist Church of Auburn since Year.'),
        }),
        imageText({
          heading: example('A word from Pastor Name'),
          body: paras(
            example(
              'A few sentences in his own voice: how he came to faith, how God called him to preach, and what he loves about this church.',
            ),
            example('A line about his family, if he would like to share it.'),
          ),
          side: 'left',
        }),
        iconCards('A little more', [
          card(
            'bible',
            example('A favorite passage'),
            example('The passage and a line about why.'),
          ),
          card(
            'praying-hands',
            example('Before Auburn'),
            example('Where he studied and served before.'),
          ),
          card(
            'coffee',
            'Say hello',
            example('Stop him after church, or call the office to set up a time.'),
          ),
        ]),
        latestSermon('Hear him preach'),
        askBand(
          'Would you like to talk?',
          'The pastor is glad to meet with anyone. Call the office for a time.',
        ),
      ),
  },
  {
    id: 'page-give',
    group: 'About us',
    title: 'Give',
    description: 'Ways to give from Church facts, a verse, and common questions about giving.',
    sections: () =>
      page(
        hero({
          headline: 'Give',
          subhead: 'Giving is part of our worship. Thank you for every gift, large and small.',
        }),
        giving('Ways to give'),
        scripture(
          'Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.',
          '2 Corinthians 9:7',
        ),
        accordion('Questions about giving', [
          qa(
            'Where does my gift go?',
            example(
              'To the ministry here in Auburn, and to missions around the world through the Cooperative Program of the Southern Baptist Convention.',
            ),
          ),
          qa(
            'Will I get a record for my taxes?',
            example('Yes. The church office sends a giving statement each January.'),
          ),
          qa(
            'Am I expected to give when I visit?',
            example('No. Nobody is expected to give on a first visit. You are our guest.'),
          ),
        ]),
        askBand('Questions about giving?', 'The church office is glad to help.'),
      ),
  },
  {
    id: 'page-pastor-search',
    group: 'About us',
    title: 'Pastor search',
    description: 'While the church seeks a pastor: where things stand, for candidates, and prayer.',
    sections: () =>
      page(
        hero({
          headline: 'Pastor search',
          subhead: 'Our church is praying for and seeking the next pastor God has for us.',
        }),
        richText('Where we are', [
          ...paras(
            example(
              'A few sentences about where the search stands: when the committee was formed and what happens next.',
            ),
            example('Say who is filling the pulpit on Sundays in the meantime.'),
          ),
        ]),
        scripture(
          'And I will give you pastors according to mine heart, which shall feed you with knowledge and understanding.',
          'Jeremiah 3:15',
        ),
        accordion('For candidates', [
          qa(
            'What are you looking for?',
            example('A few sentences about the kind of pastor the church is praying for.'),
          ),
          qa(
            'How do I apply?',
            example(
              'Email a résumé and a link to a recent sermon to the search committee. Every one is read, and all are kept confidential.',
            ),
          ),
          qa(
            'What is the church like?',
            example('Two or three sentences about the church family and the community.'),
          ),
        ]),
        people('The search committee', example('The members the church chose to lead the search.')),
        askBand(
          'Questions about the search?',
          'Write to the search committee through the church office.',
          'Contact the committee',
        ),
      ),
  },

  // ── Ministries ─────────────────────────────────────────────────────────────
  {
    id: 'page-ministry',
    group: 'Ministries',
    title: 'Ministry (any)',
    description: 'One ministry: who it is for, when it meets, and who to ask.',
    sections: () =>
      page(
        hero({
          headline: example('Name of the ministry'),
          subhead: example(
            'One warm sentence about who it is for, like "Bible study for anyone, any age".',
          ),
        }),
        imageText({
          heading: example('What we do together'),
          body: paras(
            example(
              'Two or three sentences about what a gathering is like. Add a photo of the group if you have one.',
            ),
          ),
        }),
        iconCards(example('When and where'), [
          card(
            'clock',
            'When',
            example('The day and time it meets, like "Wednesdays at 6:30 pm".'),
          ),
          card('map-pin', 'Where', example('The room, like "the fellowship hall".')),
          card('praying-hands', 'Who to ask', example('The name of the person who leads it.')),
        ]),
        ctaBand(
          'Come and see',
          'You are welcome to come along, no need to sign up first.',
          button(example('Ask a question')),
        ),
      ),
  },
  {
    id: 'page-kids',
    group: 'Ministries',
    title: 'Kids',
    description: 'Children: Sunday School, safety and check-in, and kids’ events.',
    sections: () =>
      page(
        hero({
          headline: 'Kids',
          subhead: example(
            'Bible stories, songs and friends for children from birth through fifth grade.',
          ),
          primary: planVisit(),
        }),
        imageText({
          heading: 'A Sunday for kids',
          body: paras(
            example(
              'A few sentences about what a Sunday morning is like for a child: the class, the Bible story, the craft or game.',
            ),
          ),
        }),
        iconCards('Safe and cared for', [
          card(
            'praying-hands',
            'Checked in',
            example('A parent signs each child in and picks them up from the same room.'),
          ),
          card(
            'blocks',
            'Trusted volunteers',
            example('Every volunteer who works with children is background-checked and trained.'),
          ),
          card(
            'coffee',
            'Welcome in worship',
            example('Children are always welcome in the service, and wiggles are fine.'),
          ),
        ]),
        serviceTimes('When kids meet'),
        scripture(
          'Train up a child in the way he should go: and when he is old, he will not depart from it.',
          'Proverbs 22:6',
        ),
        events('Coming up for kids', { keywords: 'Kids, Children, VBS' }),
        ctaBand(
          'Bringing your kids for the first time?',
          'Let us know and we will be ready to welcome them.',
          button(example('Tell us you are coming')),
        ),
      ),
  },
  {
    id: 'page-students',
    group: 'Ministries',
    title: 'Students',
    description: 'Sixth to twelfth grade: what they do, when they meet, a word to parents.',
    sections: () =>
      page(
        hero({
          headline: 'Students',
          subhead: example(
            'For sixth through twelfth grade: Bible study, good friends and a place to ask real questions.',
          ),
        }),
        imageText({
          heading: 'What we do',
          body: paras(
            example(
              'A few sentences about a normal week: Bible study, games, food, and the trips and camps through the year.',
            ),
          ),
        }),
        iconCards('When and where', [
          card('clock', 'When', example('Wednesdays at 6:30 pm, and Sunday School on Sundays.')),
          card('map-pin', 'Where', example('The student room, downstairs.')),
          card('praying-hands', 'Who leads', example('The name of the student leader.')),
        ]),
        scripture(
          'Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.',
          '1 Timothy 4:12',
        ),
        richText('For parents', [
          para(
            example(
              'A few sentences to parents: how you keep students safe, how to reach the leader, and how parents can help.',
            ),
          ),
        ]),
        events('Coming up for students', { keywords: 'Students, Youth, Camp' }),
        askBand(
          'Questions about the student ministry?',
          'Get in touch and the leader will get back to you.',
        ),
      ),
  },
  {
    id: 'page-women',
    group: 'Ministries',
    title: 'Women',
    description: 'Bible study, fellowship and mission for the women of the church.',
    sections: () =>
      page(
        hero({
          headline: 'Women',
          subhead: example('Bible study, friendship and serving together, for women of every age.'),
        }),
        imageText({
          heading: 'Growing together',
          body: paras(
            example(
              'A few sentences about the women’s ministry: what you do together and how a newcomer can join in.',
            ),
          ),
        }),
        iconCards('Ways to connect', [
          card(
            'bible',
            example('Bible study'),
            example('When the women’s Bible study meets and what it is reading.'),
          ),
          card(
            'coffee',
            example('Fellowship'),
            example('Brunches, a retreat, or a night out together.'),
          ),
          card(
            'giving-hand',
            example('Women on Mission'),
            example('Praying for and giving to missionaries, and serving neighbors in need.'),
          ),
        ]),
        scripture(
          'And let us consider one another to provoke unto love and to good works.',
          'Hebrews 10:24',
        ),
        events('Coming up for women', { keywords: 'Women, Ladies' }),
        askBand('Would you like to come along?', 'Get in touch and we will save you a seat.'),
      ),
  },
  {
    id: 'page-men',
    group: 'Ministries',
    title: 'Men',
    description: 'Breakfast, Bible study and workdays for the men of the church.',
    sections: () =>
      page(
        hero({
          headline: 'Men',
          subhead: example('Men growing in faith, sharpening one another and serving together.'),
        }),
        imageText({
          heading: 'Iron sharpens iron',
          body: paras(
            example(
              'A few sentences about the men’s ministry: what you do together and how a newcomer can join in.',
            ),
          ),
        }),
        iconCards('Ways to connect', [
          card(
            'coffee',
            example('Men’s breakfast'),
            example('Once a month on a Saturday morning. Come hungry.'),
          ),
          card(
            'bible',
            example('Bible study'),
            example('When the men’s study meets and what it is reading.'),
          ),
          card(
            'giving-hand',
            example('Workdays'),
            example('Fixing things around the church, and for neighbors who need a hand.'),
          ),
        ]),
        scripture(
          'Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.',
          'Proverbs 27:17',
        ),
        events('Coming up for men', { keywords: 'Men' }),
        askBand('Want to join us?', 'Get in touch, or just show up to the next breakfast.'),
      ),
  },
  {
    id: 'page-seniors',
    group: 'Ministries',
    title: 'Senior adults',
    description: 'Fellowship, trips and visits for the church’s senior adults.',
    sections: () =>
      page(
        hero({
          headline: 'Senior adults',
          subhead: example(
            'Fellowship, Bible study and care for the senior adults of our church family.',
          ),
        }),
        imageText({
          heading: 'Still growing',
          body: paras(
            example(
              'A few sentences about the senior adult ministry: what you do together and who is welcome.',
            ),
          ),
        }),
        iconCards('Ways to connect', [
          card('coffee', example('Fellowship lunch'), example('How often it meets and where.')),
          card(
            'map-pin',
            example('Day trips'),
            example('Where the group has been and where it is going next.'),
          ),
          card(
            'praying-hands',
            example('Visits and calls'),
            example('If you cannot get out, we will come to you. Call the church office.'),
          ),
        ]),
        scripture(
          'And even to your old age I am he; and even to hoar hairs will I carry you: I have made, and I will bear; even I will carry, and will deliver you.',
          'Isaiah 46:4',
        ),
        events('Coming up for senior adults', { keywords: 'Seniors, Senior adults' }),
        askBand('Need a ride on Sunday?', 'Let us know and we will see that you get here.'),
      ),
  },
  {
    id: 'page-music',
    group: 'Ministries',
    title: 'Music',
    description: 'Choir, musicians and children’s music, and how to join in.',
    sections: () =>
      page(
        hero({
          headline: 'Music',
          subhead: example(
            'Singers and players who lead the church in worship. New voices are welcome.',
          ),
        }),
        imageText({
          heading: 'Singing together',
          body: paras(
            example(
              'A few sentences about music at Auburn: the hymns and songs you sing, and what music means in worship here.',
            ),
          ),
        }),
        iconCards('Ways to take part', [
          card(
            'music',
            example('Choir'),
            example('When the choir rehearses, and who to ask about joining.'),
          ),
          card(
            'music',
            example('Musicians'),
            example('Piano, organ, guitar or another instrument? Let us know.'),
          ),
          card(
            'blocks',
            example('Children’s choir'),
            example('When the children sing, and how to sign up.'),
          ),
        ]),
        scripture(
          'Make a joyful noise unto the LORD, all ye lands. Serve the LORD with gladness: come before his presence with singing.',
          'Psalm 100:1-2',
        ),
        askBand('Love to sing or play?', 'Get in touch with the music leader. No audition needed.'),
      ),
  },
  {
    id: 'page-missions',
    group: 'Ministries',
    title: 'Missions',
    description: 'Sharing the gospel near and far: local outreach, NAMB, IMB, and how to go.',
    sections: () =>
      page(
        hero({
          headline: 'Missions',
          subhead: 'Sharing Jesus in Auburn, across North America and around the world.',
        }),
        columns('Near and far', [
          column(
            'In Auburn',
            example(
              'How the church serves its neighbors: a food pantry, a community meal, help for a family in need.',
            ),
          ),
          column(
            'Across North America',
            example(
              'Through the Annie Armstrong Easter Offering we support missionaries and church plants across the United States and Canada.',
            ),
          ),
          column(
            'Around the world',
            example(
              'Through the Lottie Moon Christmas Offering we support missionaries sharing the gospel among the nations.',
            ),
          ),
        ]),
        richText('Giving together', [
          para(
            example(
              'A share of every offering goes to the Cooperative Program, which Southern Baptist churches use together to support missionaries, seminaries and disaster relief.',
            ),
          ),
        ]),
        buttonRow(
          'Our mission partners',
          [
            link(
              externalButton('International Mission Board', 'https://www.imb.org/'),
              'Southern Baptist missionaries around the world.',
            ),
            link(
              externalButton('North American Mission Board', 'https://www.namb.net/'),
              'Southern Baptist missionaries and church plants in North America.',
            ),
          ],
          { layout: 'cards' },
        ),
        scripture(
          'How then shall they call on him in whom they have not believed? and how shall they believe in him of whom they have not heard? and how shall they hear without a preacher?',
          'Romans 10:14',
        ),
        askBand('Want to be part of it?', 'Ask about the next mission project or trip.'),
      ),
  },
  {
    id: 'page-mission-trip',
    group: 'Ministries',
    title: 'Mission trip',
    description: 'One trip: where, when, what the team will do, a countdown, and how to help.',
    sections: () =>
      page(
        hero({
          headline: example('Name of the trip'),
          subhead: example('Where the team is going, when, and what it will do there.'),
        }),
        countdown({
          eventName: example('Our mission trip'),
          intro: example('Pray for the team as the day gets closer.'),
          duringText: 'The team is serving now. Please pray for them today.',
          afterText: 'The team is home. Thank you for praying and giving.',
        }),
        iconCards('The trip', [
          card(
            'map-pin',
            'Where',
            example('The town or country, and the church or ministry the team will serve.'),
          ),
          card('clock', 'When', example('The dates the team leaves and comes home.')),
          card(
            'giving-hand',
            'How to help',
            example('Pray, give toward the trip, or send supplies with the team.'),
          ),
        ]),
        imageText({
          heading: 'What the team will do',
          body: paras(
            example(
              'A few sentences about the work: building, Bible school for children, medical care, or sharing the gospel door to door.',
            ),
          ),
        }),
        scripture(
          'Also I heard the voice of the Lord, saying, Whom shall I send, and who will go for us? Then said I, Here am I; send me.',
          'Isaiah 6:8',
        ),
        askBand(
          'Want to go next time?',
          'Tell us, and we will let you know when the next trip is planned.',
        ),
      ),
  },
  {
    id: 'page-sunday-school',
    group: 'Ministries',
    title: 'Sunday School and classes',
    description: 'A class for every age, with the time from Church facts and a tab per age group.',
    sections: () =>
      page(
        hero({
          headline: 'Sunday School',
          subhead: 'A class for every age, every Sunday before worship.',
        }),
        serviceTimes('When classes meet'),
        tabs(
          'Find your class',
          [
            tab(
              example('Children'),
              example('The classes for little ones through fifth grade, and where they meet.'),
            ),
            tab(
              example('Students'),
              example('The class for sixth through twelfth grade, and who teaches it.'),
            ),
            tab(
              example('Adults'),
              example('The adult classes, what each is studying, and where they meet.'),
            ),
          ],
          'Pick an age to see the classes.',
        ),
        scripture(
          'Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.',
          '2 Timothy 2:15',
        ),
        askBand(
          'Not sure which class is yours?',
          'Ask at the front door on Sunday, or get in touch first.',
        ),
      ),
  },
  {
    id: 'page-serve',
    group: 'Ministries',
    title: 'Serve',
    description: 'Ways to volunteer, a verse, and a sign-up form.',
    sections: () =>
      page(
        hero({
          headline: 'Serve',
          subhead: 'There is a place for everyone to help. Here are a few.',
        }),
        iconCards('Ways to serve', [
          card(
            'coffee',
            'Greeters',
            example('Say hello at the door and help guests find their way.'),
          ),
          card(
            'blocks',
            'Children',
            example('Help in the nursery or a Sunday School class. Training is provided.'),
          ),
          card('music', 'Music', example('Sing in the choir or play an instrument.')),
          card(
            'giving-hand',
            'Kitchen',
            example('Help with church meals and meals for families in need.'),
          ),
          card('map-pin', 'Grounds', example('Mowing, repairs and workdays around the building.')),
          card(
            'praying-hands',
            'Prayer team',
            example('Pray for the requests that come in each week.'),
          ),
        ]),
        scripture(
          'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.',
          'Mark 10:45',
        ),
        form(),
      ),
  },
  {
    id: 'page-prayer',
    group: 'Ministries',
    title: 'Prayer',
    description: 'A prayer-request form, a note on privacy, and how else to ask for prayer.',
    sections: () =>
      page(
        hero({
          headline: 'Prayer',
          subhead: 'However big or small, we would be honored to pray for you.',
        }),
        form(),
        richText('Your request stays private', [
          ...paras(
            'A request sent here goes by email to the person who looks after prayer requests, and to nobody else. It is never posted on this website, and the website does not keep a copy once it has been sent.',
            example(
              'The pastor and our prayer team pray for every request by name. If you would like the whole church family to pray, say so in your request.',
            ),
          ),
        ]),
        scripture(
          'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
          'Philippians 4:6',
        ),
        contactCard(
          'Rather talk to someone?',
          'Call the church, or ask for the pastor after the service.',
        ),
      ),
  },

  // ── Life events ────────────────────────────────────────────────────────────
  {
    id: 'page-baptism',
    group: 'Life events',
    title: 'Baptism',
    description: 'What baptism means, the baptism drawing, common questions, and how to ask.',
    sections: () =>
      page(
        hero({
          headline: 'Baptism',
          subhead: 'A public picture of new life in Jesus.',
        }),
        imageText({
          heading: 'What baptism means',
          body: paras(
            example(
              'When a believer is baptized, they go under the water and come up again: a picture of dying to the old life and rising to new life with Christ.',
            ),
            example(
              'It does not save anyone. It shows the church and the world that you belong to Jesus.',
            ),
          ),
          side: 'left',
          art: 'baptism',
        }),
        scripture(
          'Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life.',
          'Romans 6:4',
        ),
        accordion('Questions about baptism', [
          qa(
            'Who can be baptized?',
            example('Anyone who has trusted Jesus as Savior and wants to follow him.'),
          ),
          qa(
            'What happens on the day?',
            example(
              'The pastor asks you a simple question about your faith in front of the church, then baptizes you. It takes a few minutes.',
            ),
          ),
          qa(
            'What should I bring?',
            example('A change of clothes and a towel. A robe is provided.'),
          ),
          qa(
            'I was baptized as a baby. Should I be baptized again?',
            example(
              'Talk with the pastor. He would be glad to open the Bible with you and answer that question.',
            ),
          ),
        ]),
        askBand(
          'Ready to be baptized?',
          'Talk with the pastor. He would love to hear your story.',
          'Talk with the pastor',
        ),
      ),
  },
  {
    id: 'page-membership',
    group: 'Life events',
    title: 'Membership class',
    description: 'Why join, the steps to membership, and when the next class meets.',
    sections: () =>
      page(
        hero({
          headline: 'Membership class',
          subhead: 'Thinking about joining the church? Start here.',
        }),
        richText('Why join a church?', [
          para(
            example(
              'A few sentences on why membership matters: belonging to a family, caring for one another, and serving together.',
            ),
          ),
        ]),
        stepsRail('How to join', [
          railStep(
            'bible',
            'Come to the class',
            example('One session over a meal: what we believe and how the church works.'),
          ),
          railStep(
            'praying-hands',
            'Share your story',
            example('Meet with the pastor and tell him how you came to faith.'),
          ),
          railStep(
            'map-pin',
            'Be welcomed',
            example('The church votes to receive you, and you are part of the family.'),
          ),
        ]),
        iconCards('The next class', [
          card('clock', 'When', example('The date and time of the next class.')),
          card('map-pin', 'Where', example('The room, like "the fellowship hall".')),
          card(
            'coffee',
            'Bring',
            example('Just yourself. Lunch is provided, and childcare is available.'),
          ),
        ]),
        scripture(
          'And they continued stedfastly in the apostles’ doctrine and fellowship, and in breaking of bread, and in prayers.',
          'Acts 2:42',
        ),
        askBand(
          'Sign up for the next class',
          'Let us know you are coming so we have a seat for you.',
          'Sign up',
        ),
      ),
  },
  {
    id: 'page-weddings',
    group: 'Life events',
    title: 'Weddings',
    description: 'Getting married at the church: what to expect, questions, and who to call.',
    sections: () =>
      page(
        hero({
          headline: 'Weddings',
          subhead: 'We would be glad to help you begin your marriage with God at the center.',
        }),
        richText('Getting married at Auburn', [
          ...paras(
            example(
              'A few sentences about weddings here: the pastor meets with every couple before the wedding, and the sanctuary and fellowship hall can be used for the service and reception.',
            ),
          ),
        ]),
        accordion('Questions couples ask', [
          qa(
            'Who can be married here?',
            example('Say who the pastor marries and who may use the building.'),
          ),
          qa(
            'Do we need to meet with the pastor first?',
            example(
              'Yes. The pastor meets with every couple a few times before the wedding to talk about marriage.',
            ),
          ),
          qa(
            'How far ahead should we ask?',
            example('As early as you can, and at least six months ahead.'),
          ),
          qa(
            'Can we hold the reception here?',
            example('Yes, in the fellowship hall. Ask the office about the date.'),
          ),
        ]),
        scripture(
          'Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.',
          'Genesis 2:24',
        ),
        contactCard('Start planning', example('Call or email the church office to check a date.')),
      ),
  },
  {
    id: 'page-funerals',
    group: 'Life events',
    title: 'Funerals and memorial services',
    description: 'How the church helps when someone dies: who to call, the service, a meal.',
    sections: () =>
      page(
        hero({
          headline: 'Funerals and memorial services',
          subhead: 'When you lose someone you love, the church is here to help.',
        }),
        richText('We are here for you', [
          para(
            example(
              'A few gentle sentences: the pastor will come alongside the family, help plan a service that honors the one who has died, and point everyone to the hope we have in Christ.',
            ),
          ),
        ]),
        scripture(
          'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
          'Psalm 23:4',
        ),
        accordion('What happens next', [
          qa(
            'Who do I call first?',
            example(
              'Call the funeral home of your choice, then the church office. The pastor will come to you.',
            ),
          ),
          qa(
            'Can the service be held at the church?',
            example('Yes. The sanctuary is available for funerals and memorial services.'),
          ),
          qa(
            'Will the church help with a meal?',
            example(
              'Yes. The church family usually prepares a meal for the family after the service.',
            ),
          ),
        ]),
        contactCard(
          'Call us any time',
          example('If it is after hours, leave a message and the pastor will call you back.'),
        ),
      ),
  },
  {
    id: 'page-facility-use',
    group: 'Life events',
    title: 'Facility use',
    description:
      'Using the building for a wedding, a shower or a meeting: spaces, policy and how to ask.',
    sections: () =>
      page(
        hero({
          headline: 'Using our building',
          subhead: example(
            'The church building is available for weddings, showers, meetings and community groups.',
          ),
        }),
        columns('Our spaces', [
          column('Sanctuary', example('How many it seats, and what it is used for.')),
          column(
            'Fellowship hall',
            example('How many it seats, and whether the kitchen can be used.'),
          ),
          column('Classrooms', example('How many there are, and what they suit.')),
        ]),
        accordion('Before you ask', [
          qa(
            'Who can use the building?',
            example('Say who may use it: members, the community, other groups.'),
          ),
          qa(
            'How do I ask for a date?',
            example('Call or email the church office with the date, the time and what it is for.'),
          ),
          qa(
            'Are there rules?',
            example('The facility use policy below covers what is allowed, setup and cleanup.'),
          ),
        ]),
        downloads('Facility use policy and forms', 'policy'),
        contactCard('Ask about a date'),
      ),
  },

  // ── Seasonal ───────────────────────────────────────────────────────────────
  {
    id: 'page-event',
    group: 'Seasonal',
    title: 'Event (any)',
    description: 'One event: what it is, when and where, and what to expect.',
    sections: () =>
      page(
        hero({
          headline: example('Name of the event'),
          subhead: example('The date and time, and one line about what it is.'),
        }),
        iconCards(example('The details'), [
          card('clock', 'When', example('The date, the start time and roughly when it ends.')),
          card('map-pin', 'Where', example('Where it is, at the church or somewhere else.')),
          card('coffee', 'Bring', example('Anything people should bring, or "just yourself".')),
        ]),
        richText(example('What to expect'), [
          ...paras(
            example(
              'A short paragraph about what will happen, so someone new knows what they are coming to.',
            ),
            example('Say whether children are welcome, and if there is food.'),
          ),
        ]),
        ctaBand(
          'Questions about the event?',
          'Get in touch and we will be glad to help.',
          button(example('Ask a question')),
        ),
      ),
  },
  {
    id: 'page-vbs',
    group: 'Seasonal',
    title: 'Vacation Bible School',
    description: 'VBS: a countdown, the details, a sign-up form, and photos afterward.',
    sections: () =>
      page(
        hero({
          headline: 'Vacation Bible School',
          subhead: example(
            'A week of songs, Bible stories, crafts and games for children. Free, and every child is welcome.',
          ),
        }),
        countdown({
          eventName: 'Vacation Bible School',
          intro: example('Five mornings of songs, stories and games. Bring a friend!'),
          duringText: 'VBS is happening now. Come join us!',
          afterText: 'Thank you to every child, parent and volunteer who came!',
        }),
        iconCards('The details', [
          card('clock', 'When', example('Monday to Friday, 9:00 am to noon.')),
          card('blocks', 'Who', example('Children who are four years old through fifth grade.')),
          card('map-pin', 'Where', example('At the church. Drop off at the front doors.')),
        ]),
        form(),
        imageText({
          heading: example('Last year at VBS'),
          body: paras(
            example(
              'A few words about last year: the theme and a favorite moment. Add a photo here, and after this year’s VBS add a Photo gallery section with the best pictures (with parents’ permission).',
            ),
          ),
          side: 'right',
        }),
        askBand(
          'Want to help with VBS?',
          'Teachers, helpers, snacks and crafts: we need you.',
          'Volunteer',
        ),
      ),
  },
  {
    id: 'page-easter',
    group: 'Seasonal',
    title: 'Easter',
    description: 'Holy Week and Easter Sunday: a countdown, the services, a verse and the map.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Easter',
          headline: 'Christ is risen',
          subhead: 'Come and celebrate Easter with us. Everyone is welcome.',
          primary: planVisit(),
        }),
        ...easterSections(),
        map('Find us'),
        askBand(
          'Coming for the first time?',
          'Let us know and we will look out for you at the door.',
          'Tell us you are coming',
        ),
      ),
  },
  {
    id: 'page-christmas',
    group: 'Seasonal',
    title: 'Christmas',
    description: 'The Christmas services, a verse, the live stream and the map.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Christmas',
          headline: 'Christmas at Auburn',
          subhead: 'Come and celebrate the birth of Jesus with us. Everyone is welcome.',
          primary: planVisit(),
        }),
        ...christmasSections(),
        livestream('Watch from home'),
        map('Find us'),
      ),
  },
  {
    id: 'page-homecoming',
    group: 'Seasonal',
    title: 'Homecoming',
    description: 'Homecoming Sunday: a countdown, the day, and the map.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Homecoming',
          headline: 'Welcome home',
          subhead: example(
            'Come home to Auburn for a day of worship, memories and dinner on the grounds.',
          ),
        }),
        ...homecomingSections(),
        map('Find us'),
        askBand(
          'Coming home this year?',
          'Let us know so we can save you a seat and a plate.',
          'Tell us you are coming',
        ),
      ),
  },
  {
    id: 'page-revival',
    group: 'Seasonal',
    title: 'Revival week',
    description:
      'Revival meetings: a countdown, the preacher, the nightly times and the live stream.',
    sections: () =>
      page(
        hero({
          eyebrow: 'Revival',
          headline: example('Revival services'),
          subhead: example('Nightly preaching, singing and prayer. Everyone is welcome.'),
        }),
        ...revivalSections(),
        livestream('Watch each night live'),
        map('Find us'),
      ),
  },
  {
    id: 'page-fall-festival',
    group: 'Seasonal',
    title: 'Trunk-or-treat and fall festival',
    description: 'An October evening for families: the invitation, the details and the map.',
    sections: () =>
      page(
        hero({
          headline: example('Trunk-or-treat'),
          subhead: example(
            'Candy, games and chili for the whole family. Free and open to everyone.',
          ),
        }),
        ...fallFestivalSections(),
        map('Find us'),
      ),
  },
  {
    id: 'page-thanksgiving',
    group: 'Seasonal',
    title: 'Thanksgiving meal',
    description:
      'An invitation to the church Thanksgiving meal, with a ride or a plate for anyone who needs one.',
    sections: () =>
      page(
        hero({
          headline: 'Thanksgiving meal',
          subhead: example('A seat at the table for everyone. Come and give thanks with us.'),
        }),
        ...thanksgivingSections(),
        map('Find us'),
      ),
  },
  {
    id: 'page-anniversary',
    group: 'Seasonal',
    title: 'Anniversary year',
    description: 'A milestone year: the celebration, a short timeline, and a call for memories.',
    sections: () =>
      page(
        hero({
          headline: example('NN years of God’s faithfulness'),
          subhead: example('Celebrating the anniversary of First Baptist Church of Auburn.'),
        }),
        ...anniversarySections(),
        timeline('A few moments along the way', [
          moment('19__', example('The church is founded'), example('A sentence or two.')),
          moment('19__', example('A building of our own'), example('A sentence or two.')),
          moment('20__', example('This year'), example('How the church is celebrating.')),
        ]),
        events('Anniversary events', { keywords: 'Anniversary' }),
      ),
  },

  // ── Sermons and news ───────────────────────────────────────────────────────
  {
    id: 'page-sermon-series',
    group: 'Sermons and news',
    title: 'Sermon series',
    description: 'A series of messages: what it is about, and the latest one to watch.',
    sections: () =>
      page(
        hero({
          headline: example('Name of the series'),
          subhead: example('The book or passage it follows, like "The Gospel of Mark".'),
        }),
        richText(example('About this series'), [
          para(
            example(
              'Two or three sentences about what the series covers and why, in your own words.',
            ),
          ),
        ]),
        watch(
          example('Watch the latest message'),
          example('A line about where to watch, like "Streamed live every Sunday".'),
        ),
        sermonSeries('More series'),
        ctaBand(
          'Join us on Sunday',
          'Hear the next message in person. You are very welcome.',
          planVisit(),
        ),
      ),
  },
  {
    id: 'page-news',
    group: 'Sermons and news',
    title: 'News',
    description: 'A news page: latest posts, coming events, the newsletter and email sign-up.',
    sections: () =>
      page(
        hero({
          headline: 'News',
          subhead: example('What is happening at Auburn, and how the church family is doing.'),
        }),
        latestNews('Latest news'),
        events('Coming up'),
        downloads('The newsletter', 'newsletter'),
        newsletter('Get the news by email'),
        calendarSubscribe('Never miss a Sunday'),
      ),
  },

  // ── Blank ──────────────────────────────────────────────────────────────────
  {
    id: 'page-simple',
    group: 'Blank',
    title: 'Simple page',
    description: 'A heading, then text. Good for most pages.',
    sections: () =>
      page(
        hero({
          headline: example('Page title'),
          subhead: example('One sentence that says what this page is about.'),
        }),
        richText(example('A section heading'), [
          ...paras(
            example('Write the main text of the page here. Short paragraphs read best.'),
            example('Add a second paragraph, or delete this one.'),
          ),
        ]),
      ),
  },
  {
    id: 'page-blank',
    group: 'Blank',
    title: 'Blank page',
    description: 'No sections. Add your own with "+ Add item".',
    sections: () => [],
  },
];
