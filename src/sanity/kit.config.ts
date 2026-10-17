// Safe to edit by hand
// =============================================================================
// The Studio kit's settings for First Baptist Church of Auburn
// =============================================================================
// The ONE site-specific file for the kit in src/sanity/kit/ (which names no
// site and can go back to the starter unchanged). Everything the editor reads
// in Home, the Checkup and the tour that is about THIS church lives here.
// Detail: docs/agent/studio-kit.md.
//
// The repo is public: no email addresses or other private contacts here. The
// help address comes from PUBLIC_STUDIO_HELP_EMAIL at build time (unset means
// the Ask card shows its words without an email button).
// =============================================================================

import type { KitConfig } from './kit/types';
import { genericRules, unconfirmedRule, plural, type CheckupRule } from '../lib/studio-checkup';
import { guides, GUIDE_CATEGORIES } from './guides/content';
import { makeGuideView } from './components/GuideView';
import { envVal } from './urls';

const PUBLISHED = '!(_id in path("drafts.**"))';

/**
 * Page types with a Google description (seoDescription). Not journalEntry: a
 * post's excerpt is its description when the SEO box is empty.
 */
const SEO_TYPES = [
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'journalPage',
  'privacyPage',
  'page',
];

/** Site rule: a notice still switched on after its end date. */
const expiredNotices: CheckupRule = {
  id: 'expired-notices',
  run: ({ published, now }) => {
    const old = published.filter(
      (d) =>
        d._type === 'announcement' &&
        d.enabled === true &&
        typeof d.endDate === 'string' &&
        Date.parse(d.endDate) < now,
    );
    if (!old.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(old.length, 'notice')} past its end date and still switched on`,
      detail:
        'The website stops showing a notice after its end date, so nothing is wrong, but switching it off keeps the list tidy.',
      target: { pane: 'content;announcement' },
      targetLabel: 'Open the notices',
    };
  },
};

export const kitConfig: KitConfig = {
  siteName: 'the church website',

  helper: {
    name: 'Nathan',
    email: envVal('PUBLIC_STUDIO_HELP_EMAIL'),
  },

  // Sanity user ids of the people who get the staff view. The pastor is a
  // Sanity Administrator, so he is listed here rather than relying on his
  // role. Add his id once he has accepted the invitation (sanity.io/manage,
  // Members). Until the list has an entry, anyone who is not an administrator
  // gets the staff view.
  staff: [],

  staffTools: ['home', 'structure', 'presentation', 'site-guide', 'checkup'],
  toolOrder: ['home', 'structure', 'presentation', 'site-guide', 'checkup', 'media'],
  toolTitles: { structure: 'Content', presentation: 'Live preview' },

  // Desk items only a developer needs (ids from src/sanity/structure.ts).
  // None yet: the guides send the editor to Redirects, Start Here holds his
  // own notes, and Saved sections feed Live preview. Add an id here when a
  // list appears that only a developer should see.
  staffHiddenPanes: [],

  trashTypes: {
    announcement: 'Notice',
    faqItem: 'Question and answer',
    faqCategory: 'Question group',
    journalEntry: 'News post',
    journalCategory: 'News category',
  },

  weekStartsOn: 1,
  thisWeek: [
    {
      id: 'news',
      title: "Post this week's news",
      detail:
        'A short post about Sunday, an event or a prayer need keeps the website looking cared for.',
      query: `count(*[_type == "journalEntry" && ${PUBLISHED} && publishedAt >= $weekStart])`,
      target: { create: 'journalEntry' },
      targetLabel: 'Write a post',
    },
    {
      id: 'notices',
      title: 'Take down notices that have ended',
      detail: 'Switch off any notice banner whose date has passed.',
      query: `count(*[_type == "announcement" && ${PUBLISHED} && enabled == true && defined(endDate) && endDate < $now]) == 0`,
      target: { pane: 'content;announcement' },
      targetLabel: 'Open the notices',
    },
  ],

  checkup: {
    rules: [
      ...genericRules({
        seoTypes: SEO_TYPES,
        altExemptFields: ['logo', 'favicon', 'icon', 'logoImage', 'seoImage'],
      }),
      // Seeded copy marks unconfirmed facts "to be confirmed" (service times,
      // the founding year, the verse), so the pastor can see what is left.
      unconfirmedRule(),
      expiredNotices,
    ],
    ignoreTypes: ['sectionPreset', 'studioGuide', 'studioNotes', 'redirect'],
  },

  guide: {
    guides,
    categories: GUIDE_CATEGORIES,
    view: makeGuideView,
  },

  tourSteps: [
    {
      title: 'This is Home',
      body: 'Home opens first every time. It shows what to do this week, whether your last change is on the website yet, and anything that needs fixing.',
    },
    {
      title: 'Content is where you edit',
      body: 'Click Content in the top bar to change the words and pictures on any page, add a news post or put up a notice.',
    },
    {
      title: 'Live preview shows the real page',
      body: 'Live preview shows the website as visitors will see it, with your unpublished changes in place. Click any words on it to edit them right there.',
    },
    {
      title: 'Nothing is public until you press Publish',
      body: 'Your changes are private until you press the green Publish button. After that the website updates itself in a few minutes. Changed your mind? Use Undo, or move a thing to the Trash and bring it back later.',
    },
    {
      title: 'Help is always one click away',
      body: 'Site Guide in the top bar has step-by-step help for every job, and you can print any of it. Stuck? Home has a card for asking Nathan.',
    },
  ],

  liveSlowAfterMinutes: 15,

  features: {
    home: true,
    guide: true,
    checkup: true,
    tour: true,
    trash: true,
    publishNote: true,
    // GA4 (decided 2026-10-17) needs the analytics route and a property; until
    // then the Home card says "not set up yet".
    visitors: false,
  },
};
