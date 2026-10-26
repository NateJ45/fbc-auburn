// Safe to edit by hand
// =============================================================================
// Site Guide: the pastor's week (FBC Auburn, 2026-10-19)
// =============================================================================
// The weekly jobs in docs/agent/studio-plan.md, one guide each where none
// existed: the week at a glance, notices, events, a news post. Appended to the
// guides in content.ts (guides.push). content.ts also moves the other weekly
// guides (the sermon, the bulletin, the newsletter, photos, messages) into the
// "Every week" category with EVERY_WEEK below, so the Site Guide opens on the
// jobs he does most.
//
// Same conventions as content.ts: `backticks` for a thing you click, **bold**
// for a concept, no em-dashes, US spelling, the Studio's own names. Pictures
// are keys in shots.ts. src/lib/studio-guides.test.ts checks the structure.
// =============================================================================

import type { Guide } from './content.ts';

export const WEEKLY_CATEGORY = 'Every week' as const;

/**
 * Guides written elsewhere that are weekly jobs too: content.ts files them
 * under "Every week" after every list has been pushed.
 */
export const EVERY_WEEK = [
  'sunday-checklist',
  'quick-update',
  'add-sermon',
  'bulletin',
  'post-a-photo',
  'rsvps',
  'messages',
  'prayer-requests',
];

export const weeklyGuides: Guide[] = [
  {
    slug: 'your-week',
    category: WEEKLY_CATEGORY,
    title: 'Your week on the website',
    icon: 'clock',
    lead: 'The few jobs that keep the website current, in the order most weeks go.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'None of these takes more than a few minutes, and most can be done from your phone in `Quick update`. Home keeps count for you in the **Sunday checklist**.',
      },
      {
        kind: 'steps',
        items: [
          "**Sunday afternoon or Monday:** add Sunday's sermon. The title and the video link are enough.",
          "**Midweek:** put up this week's bulletin, and check the coming events in Church Trac.",
          '**When something comes up:** a notice for an event, a change or a cancellation. Each one takes itself down after its day.',
          '**When there is good news:** a short news post, or a photo from your phone.',
          '**Thursday or Friday:** send the church newsletter from Church Trac. The website’s sign-up adds people to that list.',
          '**Any day:** read new messages and prayer requests in `Messages`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Missed a week?',
        text: 'Nothing breaks. The home page stops naming an old sermon after eight days, notices take themselves down, and the checklist starts fresh every Monday.',
      },
      {
        kind: 'seealso',
        items: ['Quick update from your phone', 'The Sunday checklist'],
      },
    ],
  },
  {
    slug: 'put-up-a-notice',
    category: WEEKLY_CATEGORY,
    title: 'Put up a notice',
    icon: 'notice',
    lead: 'A short line across the top of every page, until the day you pick.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'From your phone' },
      {
        kind: 'steps',
        items: [
          'Open `Quick update` and tap `Put up a notice`.',
          'Type the notice in one or two short sentences, like "Fall festival this Saturday at 4 pm."',
          '`Last day to show it` starts as the coming Sunday. Change it if the notice should stay up longer.',
          'Add a link if there is more to read, then press the green button.',
        ],
      },
      {
        kind: 'p',
        text: 'For a change or a cancellation this week, tap `Cancel or change something this week` instead. That notice is red and comes down by itself after Sunday.',
      },
      { kind: 'h', text: 'Change or take one down' },
      {
        kind: 'steps',
        items: [
          'Open `Content`, then `Notices`.',
          'Click the notice. Change the `Message` or the `Hide after` day, or switch off `Switched on` to take it down now.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Only one at a time is best.',
        text: 'If two notices are on at once, visitors see both stacked at the top of every page. Keep the most important one, and put the rest in a news post.',
      },
      {
        kind: 'seealso',
        items: ['Put up a notice for a snow Sunday', 'Tell people about an event'],
      },
    ],
  },
  {
    slug: 'tell-about-an-event',
    category: WEEKLY_CATEGORY,
    title: 'Tell people about an event',
    icon: 'event',
    lead: 'Church Trac holds the calendar; the website points people to it.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'The calendar on the website comes straight from **Church Trac**, so an event goes in Church Trac first. The website picks it up by itself. To make sure people notice it:',
      },
      {
        kind: 'steps',
        items: [
          'Add the event in Church Trac with its day, time and place.',
          'In `Quick update`, tap `Tell people about an event`. Type what is happening, pick the day and add the time.',
          'For **A link for more**, paste the event from Church Trac, or the page where people RSVP.',
          'Press the green button. The notice reads like "Fall festival, Saturday, October 24 at 4 pm." and comes down after that day.',
        ],
      },
      { kind: 'h', text: 'Need to know who is coming?' },
      {
        kind: 'p',
        text: 'For a meal, VBS or anything with a headcount, add an `RSVP (who is coming)` section to the event’s page. Replies show under `RSVPs` in the top bar.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Type it once, in Church Trac.',
        text: 'The website’s Events page reads the Church Trac calendar, so an event typed there shows on the website without retyping.',
      },
      {
        kind: 'seealso',
        items: ['Let people RSVP', 'Put up a notice'],
      },
    ],
  },
  {
    slug: 'news-post',
    category: WEEKLY_CATEGORY,
    title: 'Write a news post',
    icon: 'post',
    lead: 'A thank-you, a report from Sunday or good news, under News and notes.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'A few lines from your phone' },
      {
        kind: 'steps',
        items: [
          'Open `Quick update` and tap `Write a short news post`.',
          'Type a headline and the post. Leave an empty line between paragraphs.',
          'Press the green button. The post is on the website a few minutes later.',
        ],
      },
      {
        kind: 'p',
        text: 'To add a photo, tap `Open it in the full editor` afterwards and choose a `Cover image`. Or start from `Post a photo` instead, which makes a post around the picture.',
      },
      { kind: 'h', text: 'A longer post, at a desk' },
      {
        kind: 'steps',
        items: [
          'Open `Content`, then `News and notes`, and press `+`.',
          'Write the `Title` and the post in `Body`. Headings, links and pictures go in with the bar above the text.',
          'The `Excerpt` is the one or two sentences on the post’s card and in Google.',
          'Click `Generate` next to `Web address ending`, then Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'critical',
        title: 'Prayer needs are private unless they ask.',
        text: 'Only share a prayer need in a post if the person asked for it to be shared, and in their words. Everything published is public, and stays in Google for a while even after it is taken down.',
      },
      {
        kind: 'seealso',
        items: ['Post a photo from your phone', 'Get help with the words'],
      },
    ],
  },
];
