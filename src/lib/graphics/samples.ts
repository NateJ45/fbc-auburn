// Safe to edit by hand
// Sample words for the styleguide wall (/styleguide/graphics/) and the tests: one of each kind,
// close to what the church will really post, so a layout is judged on real lengths. The times and
// the address are the unconfirmed fallback facts (src/lib/church-facts.ts FALLBACK_FACTS); nothing
// here reaches a visitor-facing page. docs/agent/graphics.md.

import type { Church, Content, Kind } from './types';

export const SAMPLE_CHURCH: Church = {
  line1: 'First Baptist',
  line2: 'Church of Auburn',
  address: '4241 Hamilton-Scipio Road, Hamilton, OH 45013',
  place: 'Hamilton, Ohio',
  web: 'firstauburn.org',
};

export const SAMPLES: Record<Kind, Content> = {
  sunday: {
    kind: 'sunday',
    kicker: 'This Sunday',
    title: 'Come as you are',
    body: 'A small church on Hamilton-Scipio Road. Coffee is on, and there is a seat for you.',
    when: ['Sunday School, 9:45 am', 'Worship, 11:00 am'],
    link: 'firstauburn.org/plan-your-visit',
    qr: 'https://firstauburn.org/plan-your-visit/',
  },
  event: {
    kind: 'event',
    kicker: 'Christmas Eve',
    title: 'Candlelight service',
    body: 'Carols, the Christmas story and candles. Children welcome. About an hour.',
    date: 'Wednesday, December 24',
    when: ['6:00 pm'],
    link: 'firstauburn.org/christmas',
    qr: 'https://firstauburn.org/christmas/',
  },
  sermon: {
    kind: 'sermon',
    kicker: 'Sermon series',
    title: 'The Sermon on the Mount',
    reference: 'Matthew 5 to 7',
    speaker: 'Pastor Jacob Wysong',
    link: 'firstauburn.org/sermons',
    qr: 'https://firstauburn.org/sermons/',
  },
  verse: {
    kind: 'verse',
    title: 'Come to me, all of you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    translation: 'CSB',
  },
  announcement: {
    kind: 'announcement',
    kicker: 'Church family',
    title: 'Trunk or Treat',
    body: 'Bring a decorated car and a bag of candy. Hot dogs and cider in the fellowship hall.',
    date: 'Friday, October 30, 6:00 pm',
    link: 'firstauburn.org/events',
    qr: 'https://firstauburn.org/events/',
  },
  'time-change': {
    kind: 'time-change',
    kicker: 'A different Sunday',
    title: 'One service at 10:00 am',
    body: 'Sunday School takes the week off. We will worship together, then share a meal.',
    date: 'Sunday, November 30',
    link: 'firstauburn.org',
  },
  welcome: {
    kind: 'welcome',
    kicker: 'New here?',
    title: 'We would love to meet you',
    body: 'Fill this in and drop it in the plate, or scan the code. We will not put you on the spot.',
    when: ['Sunday School, 9:45 am', 'Worship, 11:00 am', 'Wednesday Bible study, 6:00 pm'],
    link: 'firstauburn.org/plan-your-visit',
    qr: 'https://firstauburn.org/plan-your-visit/',
  },
};
