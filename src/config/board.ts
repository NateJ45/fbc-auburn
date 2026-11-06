// Safe to edit by hand
// =============================================================================
// board.ts - this site's Report (the Studio tool, PORTS.md card 218)
// =============================================================================
// The shared half (the arithmetic in src/lib/studio-board.ts, the screen in
// src/sanity/kit/board/, the route /api/studio/board/) reads this and nothing
// else, so the church's report is its own: its parts, its words, its measures.
//
// The tool appears in the Studio when PUBLIC_BOARD_REPORT is "true" at build
// time (deploy.yml passes the repository variable, which stays UNSET until the
// church has a Google Analytics property). The numbers come from Google
// Analytics and Search Console through studio-status (card 136's SITE_DATA
// binding); without that the tool explains what is needed. Every `event:<name>`
// here must also be in this site's entry in studio-status
// `src/site-series-config.ts`, kept in step by hand.
//
// WORDS: what a pastor would say. "Visitors" and "pages viewed", never
// "sessions". No em-dashes. How a number is counted sits in `explain`, behind
// the "i" button.
// =============================================================================

import type { BoardConfig } from '../lib/studio-board';
import { site } from '../data/site';

const CLICK_NOT_GIFT =
  'Clicks on a Give link, whether it opens the Give page or goes on to online giving. These are clicks, not gifts: the website cannot see whether a gift was made or how much it was.';
const WATCH =
  'Clicks to watch a sermon or a service video, on the website or on YouTube. It counts the press, not how long anyone watched.';
const FORMS =
  'Each time someone sent a form on the website, such as the contact form or a prayer request. It counts the sending only, never what was written. A form that sits inside Church Trac cannot tell the website it was sent, so this leaves those out.';
const GOOGLE =
  'Times someone chose the church website in a Google search. From Google Search Console, which runs about three days behind.';
const DIRECTIONS = 'Clicks on a map or directions link. The website cannot see who then came.';
const CONTACT = 'Clicks on the church email address or phone number.';

export const boardConfig: BoardConfig = {
  siteName: site.name,
  // LAUNCH DATE. The report is written to start on the day the website opens and Google
  // Analytics begins counting (the church's own address; the workers.dev preview is never
  // counted). If launch moves, correct firstMonth and since.all here and in studio-status
  // `src/site-report-email.ts`. Search Console keeps its own earlier history once it is
  // connected: give searchClicks and searchAppearances their own date then.
  firstMonth: '2026-11',
  timeZone: 'America/New_York',
  since: { all: '2026-11-25' },
  gaps: [],

  overview: {
    tiles: [
      {
        measure: 'visitors',
        label: 'Visitors',
        explain:
          'People who came to the website. Someone who comes back in the same period is counted once.',
      },
      { measure: 'event:generate_lead', label: 'Forms sent', explain: FORMS },
      { measure: 'event:watch_click', label: 'Watch clicks', explain: WATCH },
      { measure: 'event:give_click', label: 'Give clicks', explain: CLICK_NOT_GIFT },
      { measure: 'event:directions_click', label: 'Clicks for directions', explain: DIRECTIONS },
      { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
    ],
    charts: [
      { measure: 'visitors', title: 'Visitors by month' },
      { measure: 'event:watch_click', title: 'Watch clicks by month' },
      { measure: 'channels', title: 'How people found the website' },
      { measure: 'topContent', title: 'Most viewed pages' },
    ],
  },

  parts: [
    {
      id: 'new-here',
      title: 'New here?',
      explain:
        'Someone thinking about visiting usually reads these pages first, then sends a note, calls or looks up directions. "Forms sent" counts a form going through; the clicks are presses on a link, and the website cannot see the call or the visit that followed.',
      tiles: [
        { measure: 'newVisitors', label: 'First-time visitors' },
        { measure: 'event:generate_lead', label: 'Forms sent', explain: FORMS },
        { measure: 'event:directions_click', label: 'Clicks for directions', explain: DIRECTIONS },
        { measure: 'event:contact_click', label: 'Email and phone clicks', explain: CONTACT },
      ],
      charts: [
        {
          measure: 'topContent',
          title: 'Pages for visitors',
          prefix: [
            '/plan-your-visit',
            '/about',
            '/what-we-believe',
            '/leadership',
            '/ministries',
            '/next-steps',
            '/contact',
          ],
        },
        { measure: 'event:generate_lead', title: 'Forms sent by month' },
      ],
      more: [
        { measure: 'newVisitors', title: 'First-time visitors by month' },
        { measure: 'event:form_view', title: 'Times a form was seen, by month' },
        { measure: 'event:contact_click', title: 'Email and phone clicks by month' },
        { measure: 'event:directions_click', title: 'Clicks for directions by month' },
      ],
    },
    {
      id: 'sundays',
      title: 'Sundays and sermons',
      explain: WATCH,
      tiles: [{ measure: 'event:watch_click', label: 'Watch clicks', explain: WATCH }],
      charts: [
        { measure: 'event:watch_click', title: 'Watch clicks by month' },
        {
          measure: 'topContent',
          title: 'Sermon and service pages',
          prefix: ['/sermons', '/watch', '/bulletin'],
        },
      ],
      more: [
        {
          measure: 'event:embed_interact',
          title: 'Videos and forms used on the page, by month',
        },
      ],
    },
    {
      id: 'events',
      title: 'Events and the calendar',
      explain:
        'A calendar add is someone pressing a link to put the Sunday times or an event on their own calendar. It counts the press, not whether the calendar kept it.',
      tiles: [
        {
          measure: 'event:calendar_add',
          label: 'Calendar adds',
          explain:
            'Times someone pressed a link to put the church calendar, or an event, on their own calendar.',
        },
      ],
      charts: [
        { measure: 'event:calendar_add', title: 'Calendar adds by month' },
        {
          measure: 'topContent',
          title: 'Event pages',
          prefix: ['/events', '/christmas'],
        },
      ],
    },
    {
      id: 'giving',
      title: 'Giving (clicks, not gifts)',
      explain: CLICK_NOT_GIFT,
      tiles: [{ measure: 'event:give_click', label: 'Give clicks', explain: CLICK_NOT_GIFT }],
      charts: [
        {
          measure: 'event:give_click',
          title: 'Give clicks by month',
          note: 'These are clicks, not gifts.',
        },
      ],
    },
    {
      id: 'found-locally',
      title: 'Found locally',
      explain:
        'From Google Search Console. A click is someone choosing the website in a search; an appearance is the website being listed, chosen or not. Google keeps about sixteen months, so older periods are not compared. "Where visitors were" is from Google Analytics.',
      tiles: [
        { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
        { measure: 'searchAppearances', label: 'Times you appeared', up: 'flat' },
      ],
      charts: [
        { measure: 'searchQueries', title: 'Searches that found you' },
        { measure: 'places', title: 'Where visitors were' },
        { measure: 'searchPages', title: 'Pages Google sent people to' },
      ],
      more: [{ measure: 'searchClicks', title: 'Clicks from Google by month' }],
    },
  ],
};
