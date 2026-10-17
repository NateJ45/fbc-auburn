// Foundation, edit with care
// Default section arrays for the four core pages.
// Used when: (a) no Sanity project is connected, or (b) the page's pageBuilder
// is empty (unseeded project). Routes render these arrays instead of a blank page.
//
// IMPORTANT: only use blocks that render fully from INLINE data:
//   heroSection, richTextSection, imageTextSection (no image), statSection,
//   ctaBandSection, quoteSection, spacerSection.
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
  {
    _type: 'heroSection',
    _key: 'default-home-hero',
    // The masthead: "First Baptist Church of" over a huge colour mosaic "Auburn" (ArchHero.astro).
    // The subhead's first sentence becomes the large intro line.
    eyebrow: 'First Baptist Church of',
    headline: 'Auburn',
    subhead:
      'A small church with the door open. We are a Southern Baptist family on Hamilton-Scipio Road in Ross Township. Come as you are this Sunday, and someone will meet you at the door.',
    size: 'tall',
    primaryCta: { _type: 'ctaBlock', label: 'Plan your visit', href: '/contact/' },
    secondaryCta: { _type: 'ctaBlock', label: 'About the church', href: '/about/' },
  },
  {
    _type: 'richTextSection',
    _key: 'default-home-sunday',
    heading: 'A Sunday with us, one step at a time',
    width: 'narrow',
    align: 'center',
    body: [
      para(
        'default-home-sunday-p1',
        'Never been to church, or not for a while? Here is what to expect. Park in the lot beside the building at 4241 Hamilton-Scipio Road and come to the front doors. A greeter will meet you there, and there is coffee in the fellowship hall.',
      ),
      para(
        'default-home-sunday-p2',
        'Sunday School for all ages is at 9:45 am and worship is at 11:00 am, with Bible study and prayer on Wednesdays at 6:00 pm (times to be confirmed). Worship lasts about an hour. Sit wherever you like; nobody will single you out.',
      ),
    ],
  },
  {
    _type: 'imageTextSection',
    _key: 'default-home-pastor',
    heading: 'Meet our pastor',
    body: [
      para(
        'default-home-pastor-p1',
        "A short welcome in Pastor Jacob's own words goes here: why this church, what a first-time guest can expect, and an honest hope for the year ahead. Two or three sentences, written together.",
      ),
    ],
    cta: { _type: 'ctaBlock', label: 'About the church', href: '/about/' },
    imageSide: 'right',
  },
  {
    _type: 'iconCardsSection',
    _key: 'default-home-belong',
    heading: 'Find your place',
    intro: 'Small enough to know your name, with something through the week for every age.',
    cards: [
      {
        _type: 'iconCard',
        _key: 'default-home-belong-kids',
        icon: 'blocks',
        title: 'Kids',
        body: 'Sunday School and a safe, checked-in room during worship.',
      },
      {
        _type: 'iconCard',
        _key: 'default-home-belong-bible',
        icon: 'bible',
        title: 'Bible study and prayer',
        body: 'Wednesday evenings, an open table for questions and prayer.',
      },
      {
        _type: 'iconCard',
        _key: 'default-home-belong-fellowship',
        icon: 'coffee',
        title: 'Fellowship',
        body: 'Meals, workdays and the ordinary life of a church family.',
      },
    ],
  },
  {
    _type: 'watchSection',
    _key: 'default-home-watch',
    heading: 'Missed a Sunday?',
    body: 'Every message is streamed live on Facebook, and the latest one is always here.',
    fallback: 'Messages will appear here once the church channel is connected.',
  },
  {
    _type: 'thisWeekSection',
    _key: 'default-home-week',
    heading: 'This week at Auburn',
  },
  {
    _type: 'ctaBandSection',
    _key: 'default-home-cta',
    headline: 'We would love to meet you this Sunday.',
    subhead: 'Tell us you are coming, or ask anything at all.',
    cta: { _type: 'ctaBlock', label: 'Plan your visit', href: '/contact/' },
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
    cta: { _type: 'ctaBlock', label: 'Plan your visit', href: '/contact/' },
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
