// Safe to edit by hand
// =============================================================================
// FBC Auburn's event and holiday page blocks (2026-10-26)
// =============================================================================
// Three blocks so the pastor can build an event or holiday page himself, the way a Squarespace
// page is put together: Event details (dates, times, place, a sign-up button and an automatic
// "Add to my calendar"), a Schedule (times and what happens, by day) and Cards with photos.
//
// Spread into pageSectionSchemas (sections.ts), so every page builder offers them, and grouped in
// the "+ Add" menu by BUILDER_INSERT_GROUPS below. Drawn by src/components/builder-blocks/
// (BuilderBlock.astro picks the component); each has a fixture on /styleguide/sections/ and a
// picture in public/section-thumbnails/ (authoring.test.ts checks both). Logic, unit-tested:
// src/lib/builder-blocks.ts.
//
// THE RULES THESE FOLLOW:
//   - Rule 9: no colour field. Each block's only appearance field is `look`, through lookField(),
//     resolved by the cadence (src/lib/section-looks.ts); section-fields.test.ts reads this file.
//   - Rule 15: nothing computable is typed. The church's address comes from Church facts when
//     the place is left empty; the calendar file, the directions link, the day names and which
//     dates have passed are worked out at build time.
//   - Rule 8b: the time dropdowns (`startTime`, `endTime`) are in NON_STEGA_FIELDS.
//   - Words: plain American English for a pastor. No "CTA", "eyebrow" or "slug", no em-dashes.
// =============================================================================

import { defineArrayMember, defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ClockIcon } from '@sanity/icons/Clock';
import { ImagesIcon } from '@sanity/icons/Images';
import { imageWithAlt } from './_imageWithAlt';
import { lookField } from './_appearanceFields';
import { TIME_OPTIONS } from '../../lib/builder-blocks';

const timeField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'string',
    description,
    options: { list: TIME_OPTIONS },
  });

const smallLineField = () =>
  defineField({
    name: 'eyebrow',
    title: 'Small line above the title (optional)',
    type: 'string',
    description: 'A few words in small capitals, like "Christmas at Auburn".',
    validation: (R) => R.max(40),
  });

const headingField = () =>
  defineField({ name: 'heading', title: 'Heading (optional)', type: 'string' });

const introField = () =>
  defineField({
    name: 'intro',
    title: 'A sentence or two under the heading (optional)',
    type: 'text',
    rows: 2,
  });

// ── Event details ────────────────────────────────────────────────────────────
export const eventDetailsSection = defineType({
  name: 'eventDetailsSection',
  title: 'Event details (date, time, place)',
  type: 'object',
  icon: CalendarIcon,
  description:
    'The when and where of one event, with an "Add to my calendar" link and directions made for you. Each date drops off the day after it happens, and the block disappears once every date has passed.',
  fields: [
    smallLineField(),
    defineField({
      name: 'title',
      title: 'Name of the event',
      type: 'string',
      description: 'Like "Christmas Eve at Auburn" or "Vacation Bible School".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'occurrences',
      title: 'Dates and times',
      type: 'array',
      description:
        'One line per date. Two services on the same night? Add the date twice, each with its own time and a label.',
      validation: (R) => R.required().min(1).max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'eventDate',
          title: 'Date',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              validation: (R) => R.required(),
            }),
            timeField('startTime', 'Starts at (optional)', 'Leave empty for an all-day event.'),
            timeField(
              'endTime',
              'Ends at (optional)',
              'Used for the calendar link. Without it the calendar holds an hour.',
            ),
            defineField({
              name: 'label',
              title: 'Label (optional)',
              type: 'string',
              description: 'Like "Candlelight service" or "Children’s program".',
              validation: (R) => R.max(60),
            }),
          ],
          preview: {
            select: { date: 'date', start: 'startTime', label: 'label' },
            prepare: ({ date, start, label }) => ({
              title: [date, start].filter(Boolean).join(' at ') || 'Date',
              subtitle: label,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'place',
      title: 'Where (optional)',
      type: 'text',
      rows: 2,
      description:
        'Leave empty when it is at the church: the address comes from Church facts. Otherwise the place and its street address, like "Hamilton Park, 123 Main Street, Hamilton, OH". Directions are worked out from it.',
    }),
    defineField({
      name: 'note',
      title: 'A few words about it (optional)',
      type: 'text',
      rows: 3,
      description: 'What it is, who it is for, what to bring. Two or three sentences read best.',
    }),
    imageWithAlt({
      name: 'image',
      title: 'Photo (optional)',
      description: 'Shown beside the details on a computer, above them on a phone.',
    }),
    defineField({
      name: 'button',
      title: 'Main button (optional)',
      type: 'ctaBlock',
      description:
        'Sign up, RSVP or a link for more. "Add to my calendar" and "Directions" are added for you.',
    }),
    defineField({
      name: 'showCalendar',
      title: 'Show "Add to my calendar"',
      type: 'boolean',
      initialValue: true,
    }),
    lookField('eventDetailsSection'),
  ],
  preview: {
    select: { title: 'title', occ: 'occurrences', media: 'image' },
    prepare: ({ title, occ, media }) => ({
      title: title || 'Event details',
      subtitle: `Event details${Array.isArray(occ) && occ[0]?.date ? `, ${occ[0].date}` : ''}`,
      media,
    }),
  },
});

// ── Schedule ─────────────────────────────────────────────────────────────────
export const scheduleSection = defineType({
  name: 'scheduleSection',
  title: 'Schedule (times and what happens)',
  type: 'object',
  icon: ClockIcon,
  description:
    'A list of times and what happens at each, grouped by day if you like: "Christmas Eve: 4:00 children’s pageant, 5:30 candlelight service". For the church’s history, use the timeline instead.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'days',
      title: 'Days',
      type: 'array',
      description:
        'One day is plenty for a single evening (leave its name empty). Add more for a weekend or a week, like VBS.',
      validation: (R) => R.required().min(1).max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'scheduleDay',
          title: 'Day',
          fields: [
            defineField({
              name: 'title',
              title: 'Name of the day (optional)',
              type: 'string',
              description: 'Like "Christmas Eve" or "Monday, June 15".',
              validation: (R) => R.max(50),
            }),
            defineField({
              name: 'items',
              title: 'What happens',
              type: 'array',
              validation: (R) => R.required().min(1).max(20),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'scheduleItem',
                  title: 'Time',
                  fields: [
                    timeField(
                      'startTime',
                      'Time (optional)',
                      'Leave empty for something with no set time.',
                    ),
                    defineField({
                      name: 'title',
                      title: 'What happens',
                      type: 'string',
                      description: 'Like "Children’s pageant".',
                      validation: (R) => R.required().max(80),
                    }),
                    defineField({
                      name: 'note',
                      title: 'Short note (optional)',
                      type: 'string',
                      description: 'Like "In the fellowship hall" or "Nursery provided".',
                      validation: (R) => R.max(140),
                    }),
                  ],
                  preview: {
                    select: { title: 'title', time: 'startTime', note: 'note' },
                    prepare: ({ title, time, note }) => ({
                      title: [time, title].filter(Boolean).join('  ') || 'Time',
                      subtitle: note,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare: ({ title, items }) => ({
              title: title || 'Day',
              subtitle: `${Array.isArray(items) ? items.length : 0} times`,
            }),
          },
        }),
      ],
    }),
    lookField('scheduleSection'),
  ],
  preview: {
    select: { title: 'heading', days: 'days' },
    prepare: ({ title, days }) => ({
      title: title || 'Schedule',
      subtitle: `Schedule${Array.isArray(days) && days.length > 1 ? `, ${days.length} days` : ''}`,
    }),
  },
});

// ── Cards with photos ────────────────────────────────────────────────────────
export const photoCardsSection = defineType({
  name: 'photoCardsSection',
  title: 'Cards with photos',
  type: 'object',
  icon: ImagesIcon,
  description:
    'Two to six cards, each a photo, a title and a few words, with an optional link. They line up on their own: two or three across on a computer, one under another on a phone.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (R) => R.required().min(2).max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'photoCard',
          title: 'Card',
          fields: [
            imageWithAlt({
              name: 'image',
              title: 'Photo',
              validation: (R: { required: () => unknown }) => R.required(),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required().max(60),
            }),
            defineField({
              name: 'body',
              title: 'A few words (optional)',
              type: 'text',
              rows: 3,
              validation: (R) => R.max(240),
            }),
            defineField({
              name: 'link',
              title: 'Link (optional)',
              type: 'ctaBlock',
              description:
                'With a link the whole card can be tapped. The button words show under the text.',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'body', media: 'image' },
            prepare: ({ title, subtitle, media }) => ({ title: title || 'Card', subtitle, media }),
          },
        }),
      ],
    }),
    lookField('photoCardsSection'),
  ],
  preview: {
    select: { title: 'heading', cards: 'cards' },
    prepare: ({ title, cards }) => ({
      title: title || 'Cards with photos',
      subtitle: `Cards with photos${Array.isArray(cards) ? ` (${cards.length})` : ''}`,
    }),
  },
});

export const builderSectionSchemas = [eventDetailsSection, scheduleSection, photoCardsSection];

/**
 * Where these blocks sit in the "+ Add" menu. sections.ts merges these into its groups by name,
 * like CHURCH_INSERT_GROUPS: the event blocks join "Dates and notices" beside the countdown and
 * the notice, and the photo cards join Basics beside the stone-icon cards.
 */
export const BUILDER_INSERT_GROUPS: { name: string; title: string; of: string[] }[] = [
  { name: 'basics', title: 'Basics', of: ['photoCardsSection'] },
  { name: 'dates', title: 'Dates and notices', of: ['eventDetailsSection', 'scheduleSection'] },
];
