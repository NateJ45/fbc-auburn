// Safe to edit by hand
// =============================================================================
// Page templates - the starting points offered when someone makes a new page
// =============================================================================
// When an editor clicks "+" on Custom pages, the Studio asks which of these to
// start from (PORTS.md card 109). Each one fills the page with sections and
// clearly marked example text, so nobody faces an empty page wondering what
// goes where, and nothing example-shaped can go live unnoticed: every example
// line starts "Example:", and the page builder shows a warning on any section
// that still has one (src/lib/page-guardrails.ts).
//
// THIS FILE IS THE SITE'S OWN. It is not PORTABLE: a church, a shop and a
// studio want different starting points, so each fork rewrites this list. Keep
// to block types a custom page accepts (SECTION_TYPES in schemaTypes/sections.ts);
// src/lib/authoring.test.ts fails if a template names one that does not exist,
// leaves an array member without a `_key`, or forgets the example marker.
//
// `sections` is a FUNCTION, called each time a page is made, and it runs the
// result through freshKeys(), so two pages made from one template never share a
// `_key`. Write any `_key` you like below (or none): they are all replaced.
//
// No `sanity` import here on purpose: node --test loads this file directly.
// sanity.config.ts turns the list into Studio templates.
// =============================================================================

import { example, freshKeys } from '../lib/authoring.ts';

export interface PageTemplate {
  /** Stable id. Changing it only changes the menu; pages already made keep their content. */
  id: string;
  /** What the "new page" menu says. */
  title: string;
  /** One line under the title, in the menu. */
  description: string;
  /** The sections a new page starts with. */
  sections: () => Record<string, unknown>[];
}

// ── Small builders, so the templates read as page outlines ───────────────────

/** One Portable Text paragraph (or heading, with a style). */
const para = (text: string, style = 'normal') => ({
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _type: 'span', marks: [], text }],
});

/** A button the editor points at a page of their choice. */
const button = (label: string) => ({ _type: 'ctaBlock', label, linkType: 'internal' });

const hero = (headline: string, subhead: string, withButton = true) => ({
  _type: 'heroSection',
  headline: example(headline),
  subhead: example(subhead),
  size: 'short',
  ...(withButton ? { primaryCta: button(example('Get in touch')) } : {}),
});

/** The band at the foot of a page: one line and one button. */
const callToAction = (headline: string, subhead: string, label: string) => ({
  _type: 'ctaBandSection',
  headline: example(headline),
  subhead: example(subhead),
  cta: button(example(label)),
});

/** One card in a "Cards with stone icons" section (icon names: src/lib/stone-icons.ts). */
const card = (icon: string, title: string, body: string) => ({
  _type: 'iconCard',
  icon,
  title: example(title),
  body: example(body),
});

/** Build a list and give every array member a fresh key. */
const page = (...sections: Record<string, unknown>[]) => freshKeys(sections);

// ── The templates, in menu order ─────────────────────────────────────────────
// FBC Auburn (2026-10-18): the pastor's three most likely new pages are a
// ministry, an event and a sermon series, so each has its own starting point.
// Every block here is one a Custom page accepts (PAGE_SECTION_TYPES), and none
// holds a real time, date or name: those are the pastor's to type.

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'page-simple',
    title: 'Simple page',
    description: 'A heading, then text. Good for most pages.',
    sections: () =>
      page(hero('Page title', 'One sentence that says what this page is about.', false), {
        _type: 'richTextSection',
        heading: example('A section heading'),
        body: [
          para(example('Write the main text of the page here. Short paragraphs read best.')),
          para(example('Add a second paragraph, or delete this one.')),
        ],
      }),
  },
  {
    id: 'page-ministry',
    title: 'Ministry',
    description: 'One ministry: who it is for, when it meets, and who to ask.',
    sections: () =>
      page(
        hero(
          'Name of the ministry',
          'One warm sentence about who it is for, like "Bible study for anyone, any age".',
          false,
        ),
        {
          _type: 'imageTextSection',
          imageSide: 'right',
          heading: example('What we do together'),
          body: [
            para(
              example(
                'Two or three sentences about what a gathering is like. Add a photo of the group if you have one.',
              ),
            ),
          ],
        },
        {
          _type: 'iconCardsSection',
          heading: example('When and where'),
          cards: [
            card('clock', 'When', 'The day and time it meets, like "Wednesdays at 6:30pm".'),
            card('map-pin', 'Where', 'The room, like "the fellowship hall".'),
            card('praying-hands', 'Who to ask', 'The name of the person who leads it.'),
          ],
        },
        callToAction(
          'Come and see',
          'You are welcome to come along, no need to sign up first.',
          'Ask a question',
        ),
      ),
  },
  {
    id: 'page-event',
    title: 'Event',
    description: 'One event: what it is, when and where, and what to expect.',
    sections: () =>
      page(
        hero('Name of the event', 'The date and time, and one line about what it is.', false),
        {
          _type: 'iconCardsSection',
          heading: example('The details'),
          cards: [
            card('clock', 'When', 'The date, the start time and roughly when it ends.'),
            card('map-pin', 'Where', 'Where it is, at the church or somewhere else.'),
            card('coffee', 'Bring', 'Anything people should bring, or "just yourself".'),
          ],
        },
        {
          _type: 'richTextSection',
          heading: example('What to expect'),
          body: [
            para(
              example(
                'A short paragraph about what will happen, so someone new knows what they are coming to.',
              ),
            ),
            para(example('Say whether children are welcome, and if there is food.')),
          ],
        },
        callToAction(
          'Questions about the event?',
          'Get in touch and we will be glad to help.',
          'Ask a question',
        ),
      ),
  },
  {
    id: 'page-sermon-series',
    title: 'Sermon series',
    description: 'A series of messages: what it is about, and the latest one to watch.',
    sections: () =>
      page(
        hero(
          'Name of the series',
          'The book or passage it follows, like "The Gospel of Mark".',
          false,
        ),
        {
          _type: 'richTextSection',
          heading: example('About this series'),
          body: [
            para(
              example(
                'Two or three sentences about what the series covers and why, in your own words.',
              ),
            ),
          ],
        },
        {
          _type: 'watchSection',
          heading: example('Watch the latest message'),
          body: example('A line about where to watch, like "Streamed live every Sunday".'),
        },
        callToAction(
          'Join us on Sunday',
          'Hear the next message in person. You are very welcome.',
          'Plan your visit',
        ),
      ),
  },
  {
    id: 'page-blank',
    title: 'Blank page',
    description: 'No sections. Add your own with "+ Add item".',
    sections: () => [],
  },
];
