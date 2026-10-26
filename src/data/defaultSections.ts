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
      'We are a close-knit Southern Baptist family in Ross Township. Someone will meet you at the door, and there is coffee in the fellowship hall.',
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
        body: 'Small classes by age, adults included, before worship. It is optional on a first visit: plenty of people come just for worship.',
      },
      {
        _type: 'railStep',
        _key: 'default-fs-worship',
        icon: 'music',
        gathering: 'second',
        title: 'Worship',
        body: 'About an hour. We sing, pray and open the Bible together. Children are welcome in the service, and there is a room for little ones too.',
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
        body: 'Give in the offering on Sunday, or by mail',
        link: { _type: 'ctaBlock', label: 'Give', href: '/give/' },
      },
      {
        _type: 'iconCard',
        _key: 'default-how-ask',
        icon: 'coffee',
        title: 'Ask a question',
        body: 'Anything before you come, or something we can pray about',
        link: { _type: 'ctaBlock', label: 'Ask a question', href: '/contact/?topic=question' },
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
        '4241 Hamilton-Scipio Road, Hamilton, Ohio, in the hamlet of Auburn, Ross Township, easy to reach from Millville, Ross and Hamilton. Parking is free in the church lot next to the building (to be confirmed).',
      ),
    ],
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-pyv-cta',
    headline: 'Let us know you are coming, and we will look out for you.',
    cta: { _type: 'ctaBlock', label: 'Tell us you are coming', href: '/contact/?visit=sunday-11' },
  },
];

// ── Every main page a page builder (2026-10-26) ──────────────────────────────
// Contact, Privacy, News and notes and Sermons render their Page layout; these are what they show
// with none (a fresh clone, CI's empty build). The same shape as the live documents
// (scripts/content/builder-pages.mjs). The blocks they are built around fetch their own rows, so
// each still renders the form, the posts or the sermons with no section data at all.

export const DEFAULT_CONTACT_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-ct-hero',
    eyebrow: 'Get in touch',
    headline: 'Contact us',
    size: 'short',
  },
  { _type: 'contactFormSection', _key: 'default-ct-form', sidebar: true },
];

export const DEFAULT_PRIVACY_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-pv-hero',
    eyebrow: 'Your privacy',
    headline: 'Privacy policy',
    size: 'short',
  },
  // No words typed: the block shows the church's built-in policy (PrivacyPolicy.astro).
  { _type: 'privacyPolicySection', _key: 'default-pv-policy' },
];

// scaffold: journal
export const DEFAULT_JOURNAL_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-jn-hero',
    eyebrow: 'From the church',
    headline: 'News and notes',
    subhead: 'News, sermon notes and stories from the church family.',
    size: 'short',
  },
  {
    _type: 'journalPostsSection',
    _key: 'default-jn-posts',
    showCategories: true,
    showNewsletter: true,
  },
  // No fields: FinalCta's own closing words and button.
  { _type: 'ctaBandSection', _key: 'default-jn-cta' },
];
// scaffold:end

export const DEFAULT_SERMONS_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-sm-hero',
    eyebrow: 'Sunday by Sunday',
    headline: 'Sermons',
    subhead: 'Catch up on a Sunday you missed, or listen again.',
    size: 'short',
  },
  {
    _type: 'watchSection',
    // This key gives the heading the id #sermons-watch-heading (src/lib/section-anchors.ts).
    _key: 'sermons-watch',
    eyebrow: 'Sundays, wherever you are',
    heading: 'Watch live, or catch up',
    body: 'Worship is streamed live every Sunday, and the latest message is always here.',
    fallback: "Messages will appear here once the church's video channel is connected.",
  },
  { _type: 'sermonArchiveSection', _key: 'default-sm-archive', heading: 'Every sermon' },
  {
    _type: 'sermonSeriesSection',
    _key: 'default-sm-series',
    heading: 'Sermon series',
    limit: 24,
    hideWhenEmpty: true,
  },
  { _type: 'podcastSection', _key: 'default-sm-podcast', heading: 'Listen on the go' },
];

// Give and This week's bulletin (2026-10-26) are Studio pages like Plan your visit: [slug].astro
// always builds their addresses (the menus point at them) and renders these with no such page.
export const DEFAULT_GIVE_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-gv-hero',
    eyebrow: 'Giving',
    headline: 'Give',
    subhead:
      'Giving is part of worship here. Every gift supports the ministry in Auburn and the work of Southern Baptist churches around the world. Nobody is expected to give on a first visit.',
    icon: 'giving-hand',
    size: 'short',
  },
  // The three ways, from Church facts (GivingBlock.astro).
  { _type: 'givingSection', _key: 'default-gv-ways', heading: 'Ways to give' },
];

export const DEFAULT_BULLETIN_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-bl-hero',
    eyebrow: 'Sunday bulletin',
    headline: "This week's bulletin",
    subhead: "The order of service, this week's news and the dates to keep.",
    size: 'short',
  },
  { _type: 'bulletinSection', _key: 'default-bl-bulletin', earlierHeading: 'Earlier bulletins' },
];

/**
 * The Studio pages whose addresses are always built (the built-in buttons and menus point at
 * them), with what each shows when there is no such page in Sanity. Keyed by slug; the slugs are
 * repeated as literals inside getStaticPaths in [slug].astro (rule 10).
 */
export const BUILT_IN_PAGES: Record<
  string,
  { title: string; seoDescription?: string; pageBuilder: PageBuilderBlock[] }
> = {
  [PLAN_VISIT_SLUG]: { title: DEFAULT_PLAN_VISIT_TITLE, pageBuilder: DEFAULT_PLAN_VISIT_SECTIONS },
  give: {
    title: 'Give',
    seoDescription:
      'How to give to First Baptist Church of Auburn: in the offering on Sunday, by mail, or online.',
    pageBuilder: DEFAULT_GIVE_SECTIONS,
  },
  bulletin: {
    title: "This week's bulletin",
    seoDescription:
      "The newest Sunday bulletin from First Baptist Church of Auburn: the order of service, the week's news and the dates to keep.",
    pageBuilder: DEFAULT_BULLETIN_SECTIONS,
  },
};

// ── About page ───────────────────────────────────────────────────────────────

// scaffold: about
export const DEFAULT_ABOUT_SECTIONS: PageBuilderBlock[] = [
  {
    _type: 'heroSection',
    _key: 'default-about-hero',
    eyebrow: 'Our church',
    headline: 'About us',
    subhead:
      'A Southern Baptist church in the hamlet of Auburn, Ross Township, since 1959 (to be confirmed), serving Millville, Ross and Hamilton.',
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
