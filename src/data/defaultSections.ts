// Foundation, edit with care
// Default section arrays for the four core pages.
// Used when: (a) no Sanity project is connected, or (b) the page's pageBuilder
// is empty (unseeded project). Routes render these arrays instead of a blank page.
//
// IMPORTANT: only use blocks that render fully from INLINE data:
//   heroSection, richTextSection, imageTextSection (no image), statSection,
//   ctaBandSection, quoteSection, spacerSection, and FBC Auburn's stepsRailSection,
//   walkSection, iconCardsSection, thisWeekSection and watchSection.
// Collection-dependent rich sections (servicesGridSection, testimonialsSection,
// processSection, valuesSection) are NOT used here — they'd render empty without
// Sanity collections and would defeat the purpose of a no-data safety net.
//
// Each block carries a _key for parity with Sanity-seeded pageBuilder arrays.
// The seed script (scripts/seed-core.mjs) imports from this file so these
// arrays are the single source of truth — a fresh clone renders the same copy
// that a seeded project receives as its first content.

import type { PageBuilderBlock } from '@/lib/pageBuilder.types';

/** One plain Portable Text paragraph. */
function para(key: string, text: string) {
  return {
    _type: 'block' as const,
    _key: key,
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: key + '-s1', text, marks: [] }],
  };
}

// ── Home page ────────────────────────────────────────────────────────────────

export const DEFAULT_HOME_SECTIONS: PageBuilderBlock[] = [
  // Board E (2026-10-17), drawn by src/components/home/HomeBoard.astro. Same shape as the live
  // Home document (scripts/content/home-board-e.mjs) without the photos, and without links to
  // the Studio-only pages (Watch, Ministries), which a fresh clone does not have. Times are never typed:
  // the walk's gathering steps and This week take theirs from Church facts.
  {
    _type: 'heroSection',
    _key: 'default-home-hero',
    // The lockup: "First Baptist Church of" over a mosaic "Auburn".
    eyebrow: 'First Baptist Church of',
    headline: 'Auburn',
    welcome: 'Come as you are.',
    subhead:
      'We are a small Southern Baptist family in Ross Township. Someone will meet you at the door, and there is coffee in the fellowship hall.',
    primaryCta: { _type: 'ctaBlock', label: 'Plan your first visit', href: '/plan-your-visit/' },
    secondaryCta: { _type: 'ctaBlock', label: 'Meet the church', href: '/about/' },
  },
  // "Your first Sunday" (Home audit research, 2026-10-17): the steps of a Sunday morning, drawn by
  // HomeWalk. Gathering steps take their times from Church facts; nothing here types a time. It
  // replaces "Through the week": Wednesday is in This week, kids are in step 3, prayer is in Ask.
  {
    _type: 'stepsRailSection',
    _key: 'default-home-first-sunday',
    heading: 'Your first Sunday',
    intro: 'What a Sunday morning here looks like, one step at a time.',
    steps: [
      {
        _type: 'railStep',
        _key: 'default-fs-arrive',
        icon: 'map-pin',
        gathering: 'none',
        title: 'Come to the front door',
        body: 'Someone will meet you at the door and point you to the coffee in the fellowship hall.',
      },
      {
        _type: 'railStep',
        _key: 'default-fs-school',
        icon: 'bible',
        gathering: 'first',
        title: 'Sunday School for all ages',
        body: 'A class for every age before worship. Come for this too, or just for worship.',
      },
      {
        _type: 'railStep',
        _key: 'default-fs-worship',
        icon: 'music',
        gathering: 'second',
        title: 'Worship',
        body: 'About an hour. Children are welcome in the service, and there is a checked-in room for little ones.',
      },
      {
        _type: 'railStep',
        _key: 'default-fs-after',
        icon: 'coffee',
        gathering: 'none',
        title: 'Stay and say hello',
        body: 'We would love to meet you. Questions are always welcome.',
      },
    ],
    primaryCta: { _type: 'ctaBlock', label: 'Plan your visit', href: '/plan-your-visit/' },
  },
  {
    _type: 'imageTextSection',
    _key: 'default-home-belong',
    eyebrow: 'Who we are',
    heading: 'A place to belong',
    body: [
      para(
        'default-home-belong-p1',
        "[Two or three sentences of welcome in Pastor Jacob's own words.]",
      ),
    ],
    signedBy: 'Jacob Wysong, Senior Pastor',
    cta: { _type: 'ctaBlock', label: 'About the church', href: '/about/' },
  },
  {
    _type: 'thisWeekSection',
    _key: 'default-home-week',
    heading: 'This week',
  },
  {
    _type: 'watchSection',
    _key: 'default-home-watch',
    heading: 'Last Sunday',
    body: 'Streamed live on Facebook every Sunday',
    fallback: 'Messages will appear here once the church channel is connected.',
  },
  {
    _type: 'iconCardsSection',
    _key: 'default-home-other-ways',
    heading: 'Other ways in',
    cards: [
      {
        _type: 'iconCard',
        _key: 'default-how-ministries',
        icon: 'bible',
        title: 'Ministries',
        body: 'Kids, Bible study, fellowship',
      },
      {
        _type: 'iconCard',
        _key: 'default-how-give',
        icon: 'giving-hand',
        title: 'Give',
        body: 'In the offering on Sunday, by mail, or online once it is set up',
        link: { _type: 'ctaBlock', label: 'Give', href: '/give/' },
      },
      {
        _type: 'iconCard',
        _key: 'default-how-ask',
        icon: 'coffee',
        title: 'Ask a question',
        body: 'Anything before you come, or something we can pray about',
        link: { _type: 'ctaBlock', label: 'Ask a question', href: '/contact/' },
      },
    ],
  },
];

// Plan your visit (FBC Auburn, 2026-10-17). A Studio page (page document, slug plan-your-visit)
// owns this address; [slug].astro renders these sections only when no such page exists (a fresh
// clone, or a project with no Sanity), so the built-in "Plan your visit" buttons never 404.
export const PLAN_VISIT_SLUG = 'plan-your-visit';
export const DEFAULT_PLAN_VISIT_TITLE = 'Plan your visit';
export const DEFAULT_PLAN_VISIT_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-pyv-hero',
    eyebrow: 'Your first Sunday',
    headline: 'Plan your visit',
    subhead:
      'Everything you might wonder about before you come, so you can walk in feeling at home.',
    size: 'short',
  },
  {
    _type: 'walkSection',
    _key: 'default-pyv-walk',
    heading: 'Walk in with us',
    intro:
      'From your parking space to your seat, here is your first Sunday morning, one stone at a time.',
    stops: [
      {
        _type: 'walkStop',
        _key: 'default-stop-1',
        time: '10:40',
        title: 'Park in the lot',
        body: 'Turn in from Hamilton-Scipio Road. The spaces nearest the front doors are kept for guests (to be confirmed).',
      },
      {
        _type: 'walkStop',
        _key: 'default-stop-2',
        time: '10:45',
        title: 'Someone meets you at the door',
        body: 'A greeter will be at the front doors to say hello, answer any question and show you around.',
      },
      {
        _type: 'walkStop',
        _key: 'default-stop-3',
        time: '10:48',
        title: 'Coffee in the fellowship hall',
        body: 'Grab a coffee and a seat. Nobody will put you on the spot.',
      },
      {
        _type: 'walkStop',
        _key: 'default-stop-4',
        time: '10:52',
        title: 'Kids check in, if you like',
        body: "Little ones can stay in the children's room with trained, background-checked volunteers. Children are always welcome in the service too (to be confirmed).",
      },
      {
        _type: 'walkStop',
        _key: 'default-stop-5',
        time: '11:00',
        title: 'Worship in the sanctuary',
        body: 'Sit wherever you like. We sing, pray and open the Bible together for about an hour.',
      },
    ],
    endHeading: 'You made it. We would love to see you.',
    endBody: 'Let us know you are coming and we will look out for you at the door.',
    endLinkLabel: 'Tell us you are coming',
    endLinkHref: '/contact/?visit=sunday-11',
  },
  {
    _type: 'richTextSection',
    _key: 'default-pyv-here',
    heading: 'Getting here',
    width: 'narrow',
    body: [
      para(
        'default-pyv-here-p1',
        '4241 Hamilton-Scipio Road, Hamilton, Ohio, in the hamlet of Auburn, Ross Township. Parking is free in the church lot next to the building (to be confirmed).',
      ),
    ],
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-pyv-cta',
    headline: 'Let us know you are coming, and we will look out for you.',
    cta: { _type: 'ctaBlock', label: 'Tell us you are visiting', href: '/contact/' },
  },
];

// ── About page ───────────────────────────────────────────────────────────────

// scaffold: about
export const DEFAULT_ABOUT_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-about-hero',
    eyebrow: 'Our church',
    headline: 'About us',
    subhead:
      'A Southern Baptist church in the hamlet of Auburn, Ross Township, since 1959 (to be confirmed).',
    size: 'short',
  },
  {
    _type: 'richTextSection',
    _key: 'default-about-story',
    heading: 'Who we are',
    body: [
      para(
        'default-about-story-p1',
        "The story of the church, in the pastor's words, goes here: how it began, the season it is in now, and who it hopes to welcome. Edit it in the Studio under the About Page document.",
      ),
    ],
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-about-cta',
    headline: 'Come and see.',
    subhead: 'Sunday worship is at 11:00 am (to be confirmed). Someone will meet you at the door.',
    cta: { _type: 'ctaBlock', label: 'Plan your visit', href: '/plan-your-visit/' },
  },
];
// scaffold:end

// ── Services page ─────────────────────────────────────────────────────────────

export const DEFAULT_SERVICES_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-services-hero',
    eyebrow: 'What We Offer.',
    headline: 'Design Services for Every Space and Stage.',
    subhead:
      'Whether you need a fresh perspective or want to hand the whole project over, there is a service for you.',
    size: 'short',
  },
  {
    _type: 'richTextSection',
    _key: 'default-services-intro',
    eyebrow: 'The Tiers.',
    heading: 'Find the right fit for your project.',
    body: [
      {
        _type: 'block',
        _key: 'default-services-intro-p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'default-services-intro-p1-s1',
            text: 'Add your service documents in Sanity Studio. Once seeded, this page will display your full service tier list with pricing and features. Each pricing is discussed before any work begins.',
          },
        ],
      },
    ],
  },
  {
    _type: 'imageTextSection',
    _key: 'default-services-area',
    eyebrow: 'Service Area.',
    heading: 'Where We Work.',
    body: [
      {
        _type: 'block',
        _key: 'default-services-area-p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'default-services-area-p1-s1',
            text: 'We serve the greater metro area and surrounding region. Travel fees for out-of-area projects are always quoted upfront. Edit your service area details in Sanity Studio under Business Info.',
          },
        ],
      },
    ],
    imageSide: 'right',
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-services-cta',
    eyebrow: "Let's Talk.",
    headline: 'Not sure which service is right?',
    subhead:
      'Send a message with a few details about your space. We will point you toward the best fit.',
    cta: { _type: 'ctaBlock', label: 'Start a Conversation', href: '/contact/' },
  },
];

// ── Process page ──────────────────────────────────────────────────────────────

export const DEFAULT_PROCESS_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-process-hero',
    eyebrow: 'The Process.',
    headline: 'From First Call to Final Reveal.',
    subhead: 'A clear, pressure-free process from the first inquiry through installation day.',
    size: 'short',
  },
  {
    _type: 'richTextSection',
    _key: 'default-process-overview',
    eyebrow: 'How It Works.',
    heading: 'A clear process, start to finish.',
    body: [
      {
        _type: 'block',
        _key: 'default-process-overview-p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'default-process-overview-p1-s1',
            text: 'Add your process steps in Sanity Studio under Process Steps. Once seeded, this page will display your full step-by-step workflow in detailed cards. No guesswork, no surprises: you will always know exactly where things stand.',
          },
        ],
      },
    ],
  },
  {
    _type: 'spacerSection',
    _key: 'default-process-spacer',
  },
  {
    _type: 'imageTextSection',
    _key: 'default-process-consultation',
    eyebrow: 'Step 1.',
    heading: 'Initial Inquiry.',
    body: [
      {
        _type: 'block',
        _key: 'default-process-consultation-p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'default-process-consultation-p1-s1',
            text: 'Fill out the contact form with a few details about your project. We review every inquiry personally and reply within two business days.',
          },
        ],
      },
    ],
    imageSide: 'left',
    cta: { _type: 'ctaBlock', label: 'Get in Touch', href: '/contact/' },
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-process-cta',
    eyebrow: 'Ready to Begin?',
    headline: 'Start the Conversation.',
    subhead: 'Fill out the contact form with a few details about your space.',
    cta: { _type: 'ctaBlock', label: 'Get in Touch', href: '/contact/' },
  },
];
