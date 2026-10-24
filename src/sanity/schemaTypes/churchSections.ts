// Safe to edit by hand
// =============================================================================
// FBC Auburn's general section library (2026-10-18)
// =============================================================================
// The blocks a small church needs to build any page without a developer:
// service times, a map, beliefs, a history timeline, fold-out questions, tabs,
// a Bible verse, a dated notice, a countdown, giving, the live stream, upcoming
// events, a newsletter box, calendar subscribe buttons, a progress bar,
// affiliations, a row of buttons, contact details, text in columns, one wide
// photo and a form.
//
// Spread into pageSectionSchemas (sections.ts), so every page builder offers
// them, and grouped in the "+ Add" menu by CHURCH_INSERT_GROUPS below. Each
// renders through src/components/church-blocks/ (ChurchBlock.astro picks the
// component), and each has a fixture on /styleguide/sections/ and a picture in
// public/section-thumbnails/ (authoring.test.ts checks both).
//
// THE RULES THESE FOLLOW:
//   - Rule 9: no colour, surface, tone or background field. The notice's
//     "how urgent" choice is named `urgency` and says what the notice IS; the
//     renderer decides how that looks. church-sections.test.ts pins it.
//   - Rule 15: nothing computable is typed. Service times, the address, the
//     phone, email, office hours, the giving link, the live stream link and
//     the calendar feed all come from Site settings > Church facts; a Bible
//     link is built from the reference; days left and "Live now" are worked
//     out at build time (and in the browser) from dates.
//   - Rule 8b: every dropdown that drives logic (`urgency`, `translation`,
//     `layout`) is in NON_STEGA_FIELDS, and every typed string the code
//     compares (dates, keywords) goes through plain() in church-blocks.ts.
//   - Words: plain English for a church secretary. No "CTA", "eyebrow" or
//     "slug", no em-dashes, US spelling.
// =============================================================================

import { defineArrayMember, defineField, defineType } from 'sanity';
import { BellIcon } from '@sanity/icons/Bell';
import { BlockquoteIcon } from '@sanity/icons/Blockquote';
import { BookIcon } from '@sanity/icons/Book';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ChartUpwardIcon } from '@sanity/icons/ChartUpward';
import { ClipboardIcon } from '@sanity/icons/Clipboard';
import { ClockIcon } from '@sanity/icons/Clock';
import { DocumentVideoIcon } from '@sanity/icons/DocumentVideo';
import { EarthAmericasIcon } from '@sanity/icons/EarthAmericas';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { ExpandIcon } from '@sanity/icons/Expand';
import { HeartIcon } from '@sanity/icons/Heart';
import { ImageIcon } from '@sanity/icons/Image';
import { LaunchIcon } from '@sanity/icons/Launch';
import { LinkIcon } from '@sanity/icons/Link';
import { MenuIcon } from '@sanity/icons/Menu';
import { MobileDeviceIcon } from '@sanity/icons/MobileDevice';
import { PinIcon } from '@sanity/icons/Pin';
import { SplitVerticalIcon } from '@sanity/icons/SplitVertical';
import { SyncIcon } from '@sanity/icons/Sync';
import { TimelineIcon } from '@sanity/icons/Timeline';
import { imageWithAlt } from './_imageWithAlt';
import { rsvpSection } from './rsvpSection';
import { checkPaste } from '../../lib/church-trac-form';
import { churchTracPageName } from '../../lib/church-trac-address';

// ── Shared fields ────────────────────────────────────────────────────────────

const headingField = (initialValue?: string) =>
  defineField({ name: 'heading', title: 'Heading (optional)', type: 'string', initialValue });

const introField = () =>
  defineField({
    name: 'intro',
    title: 'A sentence or two under the heading (optional)',
    type: 'text',
    rows: 2,
  });

/** Short formatted text: paragraphs, bold, italic, bullet lists and links. */
const simpleText = (name = 'body', title = 'Text') =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{ title: 'Normal', value: 'normal' }],
        lists: [
          { title: 'Bullet list', value: 'bullet' },
          { title: 'Numbered list', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Bold', value: 'strong' },
            { title: 'Italic', value: 'em' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                defineField({
                  name: 'href',
                  title: 'Web address',
                  type: 'url',
                  description: 'A page on this site (starting with /) or a full https:// address.',
                  validation: (R) =>
                    R.uri({ allowRelative: true, scheme: ['https', 'http', 'mailto', 'tel'] }),
                }),
              ],
            },
          ],
        },
      }),
    ],
  });

/** A photo with its description for people who cannot see it. */
const photoField = (name: string, title: string, required = false) =>
  imageWithAlt({
    name,
    title,
    validation: required ? (R: { required: () => unknown }) => R.required() : undefined,
    // A logo is not a photo of people; the description is a reminder only.
    altRequired: name !== 'logo',
  });

const linkField = (title = 'Button (optional)') =>
  defineField({ name: 'link', title, type: 'ctaBlock' });

const translationField = () =>
  defineField({
    name: 'translation',
    title: 'Bible translation for the links',
    type: 'string',
    description: 'The links open the verses on BibleGateway in this translation.',
    options: {
      list: [
        { title: 'Christian Standard Bible (CSB)', value: 'CSB' },
        { title: 'King James Version (KJV)', value: 'KJV' },
        { title: 'New King James Version (NKJV)', value: 'NKJV' },
        { title: 'English Standard Version (ESV)', value: 'ESV' },
        { title: 'New International Version (NIV)', value: 'NIV' },
        { title: 'New American Standard Bible (NASB)', value: 'NASB' },
      ],
    },
    initialValue: 'CSB',
  });

const FROM_FACTS =
  'Comes from Site settings > Church facts, so it is only ever typed in one place.';

// ── 1. Service times ─────────────────────────────────────────────────────────
export const serviceTimesSection = defineType({
  name: 'serviceTimesSection',
  title: 'Service times',
  type: 'object',
  icon: ClockIcon,
  description: `Lists every regular gathering with its day and time. ${FROM_FACTS}`,
  fields: [headingField('When we meet'), introField()],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Service times',
      subtitle: 'Service times, from Church facts',
    }),
  },
});

// ── 2. Map and directions ────────────────────────────────────────────────────
export const mapSection = defineType({
  name: 'mapSection',
  title: 'Map and directions',
  type: 'object',
  icon: PinIcon,
  description:
    'The church address on a drawn map, with buttons for Google Maps and Apple Maps. Nothing loads from a map company until a visitor taps a button.',
  fields: [
    headingField('Find us'),
    introField(),
    defineField({
      name: 'note',
      title: 'Extra directions (optional)',
      type: 'text',
      rows: 2,
      description:
        'Like "Park in the side lot and use the glass doors." The address and the short "How to find us" line come from Church facts.',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Map and directions',
      subtitle: 'Map and directions',
    }),
  },
});

// ── 3. What we believe ───────────────────────────────────────────────────────
export const beliefsSection = defineType({
  name: 'beliefsSection',
  title: 'What we believe',
  type: 'object',
  icon: BookIcon,
  description:
    'A statement of faith: a short heading and a few sentences for each belief, with Bible references that link to the verses.',
  fields: [
    headingField('What we believe'),
    introField(),
    defineField({
      name: 'beliefs',
      title: 'Beliefs',
      type: 'array',
      validation: (R) => R.min(1).max(20),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'belief',
          title: 'Belief',
          fields: [
            defineField({
              name: 'title',
              title: 'Heading',
              type: 'string',
              description: 'Like "The Bible" or "Salvation".',
              validation: (R) => R.required().max(80),
            }),
            defineField({ name: 'text', title: 'A few sentences', type: 'text', rows: 4 }),
            defineField({
              name: 'references',
              title: 'Bible references (optional)',
              type: 'string',
              description:
                'Separate them with semicolons, like "2 Timothy 3:16; Psalm 119:105". Each one becomes a link to the verse.',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'references' },
          },
        }),
      ],
    }),
    translationField(),
    defineField({
      name: 'linkFaithAndMessage',
      title: 'Link to the Baptist Faith and Message 2000',
      type: 'boolean',
      initialValue: true,
      description: 'Adds a link to the full statement of faith Southern Baptist churches share.',
    }),
  ],
  preview: {
    select: { title: 'heading', beliefs: 'beliefs' },
    prepare: ({ title, beliefs }) => ({
      title: title || 'What we believe',
      subtitle: `Beliefs${Array.isArray(beliefs) ? ` (${beliefs.length})` : ''}`,
    }),
  },
});

// ── 4. Timeline ──────────────────────────────────────────────────────────────
export const timelineSection = defineType({
  name: 'timelineSection',
  title: 'History timeline',
  type: 'object',
  icon: TimelineIcon,
  description:
    'Moments from the church’s history in order: a year, a title, a few words and a photo if you have one.',
  fields: [
    headingField('Our story'),
    introField(),
    defineField({
      name: 'entries',
      title: 'Moments',
      type: 'array',
      validation: (R) => R.min(1).max(30),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineEntry',
          title: 'Moment',
          fields: [
            defineField({
              name: 'year',
              title: 'Year',
              type: 'string',
              description: 'Like "1959", or "1960s" when you are not sure of the exact year.',
              validation: (R) => R.required().max(12),
            }),
            defineField({
              name: 'title',
              title: 'What happened',
              type: 'string',
              validation: (R) => R.required().max(100),
            }),
            defineField({
              name: 'text',
              title: 'A few sentences (optional)',
              type: 'text',
              rows: 3,
            }),
            photoField('image', 'Photo (optional)'),
          ],
          preview: {
            select: { title: 'title', subtitle: 'year', media: 'image' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', entries: 'entries' },
    prepare: ({ title, entries }) => ({
      title: title || 'History timeline',
      subtitle: `Timeline${Array.isArray(entries) ? ` (${entries.length} moments)` : ''}`,
    }),
  },
});

// ── 5. Fold-out questions ────────────────────────────────────────────────────
export const accordionSection = defineType({
  name: 'accordionSection',
  title: 'Fold-out questions and answers',
  type: 'object',
  icon: ExpandIcon,
  description:
    'Questions a visitor taps to open the answer. Typed right here, for one page. (The questions on the FAQ page live in their own list.)',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      validation: (R) => R.min(1).max(20),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'accordionItem',
          title: 'Question',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (R) => R.required().max(160),
            }),
            simpleText('answer', 'Answer'),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'Fold-out questions',
      subtitle: `Questions${Array.isArray(items) ? ` (${items.length})` : ''}`,
    }),
  },
});

// ── 6. Tabs ──────────────────────────────────────────────────────────────────
export const tabsSection = defineType({
  name: 'tabsSection',
  title: 'Tabs',
  type: 'object',
  icon: MenuIcon,
  description:
    'Two to five labeled tabs, each with its own text. Good for "Kids / Students / Adults". If a browser cannot run the tabs, every tab shows in turn.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      validation: (R) => R.min(2).max(5),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tabPanel',
          title: 'Tab',
          fields: [
            defineField({
              name: 'label',
              title: 'Tab label',
              type: 'string',
              description: 'One or two words.',
              validation: (R) => R.required().max(30),
            }),
            simpleText('body', 'Text in this tab'),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', tabs: 'tabs' },
    prepare: ({ title, tabs }) => ({
      title: title || 'Tabs',
      subtitle: Array.isArray(tabs)
        ? `Tabs: ${tabs.map((t: { label?: string }) => t?.label ?? '').join(', ')}`
        : 'Tabs',
    }),
  },
});

// ── 7. Bible verse ───────────────────────────────────────────────────────────
export const scriptureSection = defineType({
  name: 'scriptureSection',
  title: 'Bible verse',
  type: 'object',
  icon: BlockquoteIcon,
  description:
    'A verse set large, with its reference. The reference links to the passage on BibleGateway.',
  fields: [
    defineField({
      name: 'verse',
      title: 'The verse',
      type: 'text',
      rows: 4,
      description:
        'Type it as it reads in the translation you choose below. No quote marks needed.',
      validation: (R) => R.required().max(700),
    }),
    defineField({
      name: 'reference',
      title: 'Reference',
      type: 'string',
      description: 'Like "Psalm 46:1" or "Romans 8:38-39".',
      validation: (R) => R.required().max(60),
    }),
    translationField(),
  ],
  preview: {
    select: { title: 'reference', verse: 'verse' },
    prepare: ({ title, verse }) => ({
      title: title || 'Bible verse',
      subtitle: typeof verse === 'string' ? verse.slice(0, 80) : 'Bible verse',
    }),
  },
});

// ── 8. Notice ────────────────────────────────────────────────────────────────
export const noticeSection = defineType({
  name: 'noticeSection',
  title: 'Notice with dates (snow Sunday, a change of plans)',
  type: 'object',
  icon: BellIcon,
  description:
    'A short notice that shows only between the dates you set. The site updates itself every morning at about 6 am, so a notice appears and disappears on its own.',
  fields: [
    defineField({
      name: 'message',
      title: 'Message',
      type: 'string',
      description:
        'One or two short sentences, like "No services this Sunday because of the snow."',
      validation: (R) => R.required().max(200),
    }),
    defineField({
      name: 'urgency',
      title: 'How important is it?',
      type: 'string',
      options: {
        list: [
          { title: 'Good to know', value: 'info' },
          { title: 'Urgent: weather, a cancellation, a change of plans', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    linkField('Link for more details (optional)'),
    defineField({
      name: 'startDate',
      title: 'Show from',
      type: 'date',
      description: 'Leave empty to show it from the next update.',
    }),
    defineField({
      name: 'endDate',
      title: 'Show until (this day included)',
      type: 'date',
      description:
        'The notice is gone the morning after. Leave empty to keep it up until you remove it.',
      validation: (R) =>
        R.custom((end, ctx) => {
          const start = (ctx.parent as { startDate?: string } | undefined)?.startDate;
          return !end || !start || end >= start || 'The last day is before the first day.';
        }),
    }),
  ],
  preview: {
    select: { title: 'message', start: 'startDate', end: 'endDate', urgency: 'urgency' },
    prepare: ({ title, start, end, urgency }) => ({
      title: title || 'Notice',
      subtitle: `${urgency === 'urgent' ? 'Urgent notice' : 'Notice'}${
        start || end ? `, ${start ?? 'now'} to ${end ?? 'until removed'}` : ''
      }`,
    }),
  },
});

// ── 9. Countdown ─────────────────────────────────────────────────────────────
export const countdownSection = defineType({
  name: 'countdownSection',
  title: 'Countdown to a date (VBS, Easter)',
  type: 'object',
  icon: LaunchIcon,
  description:
    'Shows how many days are left until an event, then a "happening now" line during it and a thank-you line afterward. It changes on its own.',
  fields: [
    defineField({
      name: 'eventName',
      title: 'What you are counting down to',
      type: 'string',
      description: 'Like "Vacation Bible School".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'startDate',
      title: 'First day',
      type: 'date',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Last day (optional)',
      type: 'date',
      description: 'For an event that runs several days, like VBS Monday to Friday.',
    }),
    defineField({
      name: 'intro',
      title: 'A sentence under the countdown (optional)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'duringText',
      title: 'What it says during the event',
      type: 'string',
      initialValue: 'It is happening now. Come join us!',
    }),
    defineField({
      name: 'afterText',
      title: 'What it says afterward',
      type: 'string',
      description: 'Leave empty to hide the whole block once the event is over.',
      initialValue: 'Thank you to everyone who came!',
    }),
    linkField(),
  ],
  preview: {
    select: { title: 'eventName', start: 'startDate' },
    prepare: ({ title, start }) => ({
      title: title || 'Countdown',
      subtitle: start ? `Countdown to ${start}` : 'Countdown',
    }),
  },
});

// ── 10. Giving ───────────────────────────────────────────────────────────────
export const givingSection = defineType({
  name: 'givingSection',
  title: 'Ways to give',
  type: 'object',
  icon: HeartIcon,
  description:
    'In person on Sunday, by mail to the church address, and online when an online giving link is set in Church facts.',
  fields: [
    headingField('Ways to give'),
    introField(),
    defineField({
      name: 'textToGive',
      title: 'Text-to-give line (optional)',
      type: 'string',
      description: 'Like "Text GIVE to 555-555-5555". Leave empty if the church does not offer it.',
      validation: (R) => R.max(100),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Ways to give',
      subtitle: 'Giving, from Church facts',
    }),
  },
});

// ── 11. Live stream ──────────────────────────────────────────────────────────
export const livestreamSection = defineType({
  name: 'livestreamSection',
  title: 'Live stream',
  type: 'object',
  icon: DocumentVideoIcon,
  description:
    'A button to watch the service live. During Sunday worship it says "Live now"; the rest of the week it gives the next service time. The link and the times come from Church facts.',
  fields: [
    headingField('Watch live'),
    introField(),
    defineField({
      name: 'videoUrl',
      title: 'A video to show on the page (optional)',
      type: 'url',
      description:
        'A YouTube or Facebook video link. It shows as a picture with a play button, and nothing loads from YouTube or Facebook until someone presses play.',
      validation: (R) => R.uri({ scheme: ['https'] }),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Live stream', subtitle: 'Live stream' }),
  },
});

// ── 12. Upcoming events ──────────────────────────────────────────────────────
export const eventsSection = defineType({
  name: 'eventsSection',
  title: 'Upcoming events (from the church calendar)',
  type: 'object',
  icon: CalendarIcon,
  description:
    'The next events from the Church Trac calendar, read fresh every morning. Nothing to type but the heading.',
  fields: [
    headingField('Coming up'),
    introField(),
    defineField({
      name: 'count',
      title: 'How many events to show',
      type: 'number',
      initialValue: 5,
      validation: (R) => R.integer().min(1).max(12),
    }),
    defineField({
      name: 'keywords',
      title: 'Only events that mention (optional)',
      type: 'string',
      description:
        'Words to look for in the event name or description, separated by commas, like "VBS, Bible School". Leave empty for every event.',
    }),
    defineField({
      name: 'showSubscribe',
      title: 'Show the "Add to your calendar" buttons',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'emptyText',
      title: 'When there are no events',
      type: 'string',
      initialValue:
        'Nothing else is on the calendar just now. Our weekly gatherings are under service times.',
    }),
  ],
  preview: {
    select: { title: 'heading', keywords: 'keywords' },
    prepare: ({ title, keywords }) => ({
      title: title || 'Upcoming events',
      subtitle: keywords ? `Events about: ${keywords}` : 'Upcoming events, from the calendar',
    }),
  },
});

// ── 13. Newsletter ───────────────────────────────────────────────────────────
export const newsletterSection = defineType({
  name: 'newsletterSection',
  title: 'Newsletter sign-up',
  type: 'object',
  icon: EnvelopeIcon,
  description:
    'An email sign-up box. It uses the email service set up in Site settings > Newsletter. Until that is connected, it shows a button to the sign-up page below, or nothing.',
  fields: [
    headingField('Stay in touch'),
    introField(),
    defineField({
      name: 'signupUrl',
      title: 'Sign-up page (optional)',
      type: 'url',
      description:
        'A sign-up page from your email service, used when the box in Site settings is not switched on.',
      validation: (R) => R.uri({ scheme: ['https'] }),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Newsletter sign-up',
      subtitle: 'Newsletter sign-up',
    }),
  },
});

// ── 14. Calendar subscribe ───────────────────────────────────────────────────
export const calendarSubscribeSection = defineType({
  name: 'calendarSubscribeSection',
  title: 'Add our calendar to your phone',
  type: 'object',
  icon: SyncIcon,
  description:
    'Buttons that add the church calendar to Google, Apple or Outlook calendars, so new events show up on people’s phones. Uses the calendar feed in Church facts.',
  fields: [headingField('Never miss a Sunday'), introField()],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Calendar buttons', subtitle: 'Add our calendar' }),
  },
});

// ── 15. Progress bar ─────────────────────────────────────────────────────────
export const progressSection = defineType({
  name: 'progressSection',
  title: 'Progress toward a goal (building fund)',
  type: 'object',
  icon: ChartUpwardIcon,
  description: 'A bar that fills toward a goal, like a building fund or a mission offering.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'goal',
      title: 'Goal in dollars',
      type: 'number',
      description: 'Numbers only, like 50000.',
      validation: (R) => R.required().positive(),
    }),
    defineField({
      name: 'raised',
      title: 'Raised so far, in dollars',
      type: 'number',
      validation: (R) => R.required().min(0),
    }),
    defineField({
      name: 'asOf',
      title: 'As of',
      type: 'date',
      description: 'The day you last updated the amount, so readers know how fresh it is.',
    }),
    linkField(),
  ],
  preview: {
    select: { title: 'heading', goal: 'goal', raised: 'raised' },
    prepare: ({ title, goal, raised }) => ({
      title: title || 'Progress bar',
      subtitle: typeof goal === 'number' ? `$${raised ?? 0} of $${goal}` : 'Progress toward a goal',
    }),
  },
});

// ── 16. Affiliations ─────────────────────────────────────────────────────────
export const affiliationsSection = defineType({
  name: 'affiliationsSection',
  title: 'Our wider Baptist family (SBC and others)',
  type: 'object',
  icon: EarthAmericasIcon,
  description:
    'The wider family the church belongs to, each with a link and a logo if you have one.',
  fields: [
    headingField('Part of a wider family'),
    introField(),
    defineField({
      name: 'items',
      title: 'Groups',
      type: 'array',
      validation: (R) => R.min(1).max(8),
      initialValue: [
        {
          _type: 'affiliation',
          name: 'Southern Baptist Convention',
          url: 'https://www.sbc.net/',
        },
        {
          _type: 'affiliation',
          name: 'State Convention of Baptists in Ohio',
          url: 'https://scbo.org/',
        },
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'affiliation',
          title: 'Group',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (R) => R.required().max(80),
            }),
            defineField({
              name: 'url',
              title: 'Website',
              type: 'url',
              validation: (R) => R.uri({ scheme: ['https', 'http'] }),
            }),
            defineField({
              name: 'note',
              title: 'One line about it (optional)',
              type: 'string',
              validation: (R) => R.max(120),
            }),
            photoField('logo', 'Logo (optional)'),
          ],
          preview: { select: { title: 'name', subtitle: 'url', media: 'logo' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'Partners',
      subtitle: `Partner groups${Array.isArray(items) ? ` (${items.length})` : ''}`,
    }),
  },
});

// ── 17. Button row ───────────────────────────────────────────────────────────
export const buttonRowSection = defineType({
  name: 'buttonRowSection',
  title: 'Row of buttons or link cards',
  type: 'object',
  icon: LinkIcon,
  description: 'Two to six links side by side, as buttons or as cards with a line of text.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'layout',
      title: 'Show them as',
      type: 'string',
      options: {
        list: [
          { title: 'Buttons', value: 'buttons' },
          { title: 'Cards with a line of text', value: 'cards' },
        ],
        layout: 'radio',
      },
      initialValue: 'buttons',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      validation: (R) => R.min(2).max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'quickLink',
          title: 'Link',
          fields: [
            defineField({ name: 'link', title: 'Button', type: 'ctaBlock' }),
            defineField({
              name: 'note',
              title: 'Line of text (cards only)',
              type: 'string',
              validation: (R) => R.max(120),
            }),
          ],
          preview: {
            select: { title: 'link.label', subtitle: 'note' },
            prepare: ({ title, subtitle }) => ({ title: title || 'Link', subtitle }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', links: 'links' },
    prepare: ({ title, links }) => ({
      title: title || 'Buttons',
      subtitle: `Links${Array.isArray(links) ? ` (${links.length})` : ''}`,
    }),
  },
});

// ── 18. Contact details ──────────────────────────────────────────────────────
export const contactCardSection = defineType({
  name: 'contactCardSection',
  title: 'Contact details',
  type: 'object',
  icon: MobileDeviceIcon,
  description: `Phone, email, address and office hours in one card. ${FROM_FACTS}`,
  fields: [headingField('Get in touch'), introField()],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Contact details',
      subtitle: 'Contact details, from Church facts',
    }),
  },
});

// ── 19. Text in columns ──────────────────────────────────────────────────────
export const columnsSection = defineType({
  name: 'columnsSection',
  title: 'Text in columns',
  type: 'object',
  icon: SplitVerticalIcon,
  description: 'Two or three columns of text side by side. On a phone they stack.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'textColumns',
      title: 'Columns',
      type: 'array',
      validation: (R) => R.min(2).max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'textColumn',
          title: 'Column',
          fields: [
            defineField({ name: 'heading', title: 'Column heading (optional)', type: 'string' }),
            simpleText('body', 'Text'),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Column' }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', columns: 'textColumns' },
    prepare: ({ title, columns }) => ({
      title: title || 'Text in columns',
      subtitle: `${Array.isArray(columns) ? columns.length : 0} columns`,
    }),
  },
});

// ── 20. One wide photo ───────────────────────────────────────────────────────
export const photoSection = defineType({
  name: 'photoSection',
  title: 'One wide photo with a caption',
  type: 'object',
  icon: ImageIcon,
  description:
    'A single photo across the page with a caption under it. For two or more photos side by side, use the photo gallery.',
  fields: [
    photoField('image', 'Photo', true),
    defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
  ],
  preview: {
    select: { title: 'caption', media: 'image' },
    prepare: ({ title, media }) => ({
      title: title || 'Wide photo',
      subtitle: 'Wide photo',
      media,
    }),
  },
});

// ── 21. Form ─────────────────────────────────────────────────────────────────
export const formSection = defineType({
  name: 'formSection',
  title: 'Form (prayer requests, sign-ups)',
  type: 'object',
  icon: ClipboardIcon,
  description:
    'Shows one of your forms. Make the form first under Content > Forms, then pick it here. Answers are emailed to the person the form names; they are never saved in this editor.',
  fields: [
    defineField({
      name: 'form',
      title: 'Which form',
      type: 'reference',
      to: [{ type: 'form' }],
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'form.title', mode: 'form.mode' },
    prepare: ({ title, mode }) => ({
      title: title || 'Form: none picked yet',
      subtitle: mode === 'prayer' ? 'Prayer request form' : 'Form',
    }),
  },
});

// ── 22. Church Trac form (2026-10-24, PORTS.md card 152) ─────────────────────
// A form built in Church Trac (a connection card, a sign-up, a prayer request) shown on the page in
// the site's own frame. Only an https churchtrac.com address survives the paste
// (src/lib/church-trac-form.ts); the page draws its own <iframe>. docs/agent/church-trac.md.
export const churchTracFormSection = defineType({
  name: 'churchTracFormSection',
  title: 'Church Trac form',
  type: 'object',
  icon: ClipboardIcon,
  description:
    'Shows a form you built in Church Trac, right on the page. In Church Trac, copy the form’s embed code and paste it here.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'embed',
      title: 'Church Trac embed code',
      type: 'text',
      rows: 4,
      description:
        'Paste the code Church Trac gives you (it starts with <iframe), or the form’s address. Only the Church Trac address is kept.',
      validation: (R) => R.custom((value) => checkPaste(value)),
    }),
    defineField({
      name: 'size',
      title: 'Form size',
      type: 'string',
      description: 'How tall the frame is. Pick Long for a form with many questions.',
      options: {
        list: [
          { title: 'Short', value: 'short' },
          { title: 'Medium', value: 'medium' },
          { title: 'Long', value: 'long' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: { title: 'heading', size: 'size' },
    prepare: ({ title, size }) => ({
      title: title || 'Church Trac form',
      subtitle: `Church Trac form${size ? ` · ${size}` : ''}`,
    }),
  },
});

// ── 23. Church Trac page (2026-10-24, PORTS.md card 152) ─────────────────────
// A page the church keeps in Church Trac (a bulletin, a ministry newsletter), read at build time
// from <Church Trac address>/<page> and drawn in the site's own type (src/lib/church-trac-pages.ts).
// The daily rebuild keeps it within a day of a Church Trac edit. docs/agent/church-trac.md.
export const churchTracPageSection = defineType({
  name: 'churchTracPageSection',
  title: 'Church Trac page',
  type: 'object',
  icon: BookIcon,
  description:
    'Shows a page you keep in Church Trac, like a bulletin or a newsletter, in this site’s look. It updates every morning. Needs the Church Trac address in Site settings > Church facts.',
  fields: [
    headingField(),
    introField(),
    defineField({
      name: 'page',
      title: 'Church Trac page name',
      type: 'string',
      description:
        'The last part of the page’s address in Church Trac: for https://yourchurch.churchtrac.com/bulletin, type bulletin. Pasting the whole address works too.',
      validation: (R) =>
        R.custom((value) => {
          if (!value) return 'Type the page name from its Church Trac address.';
          return churchTracPageName(value)
            ? true
            : 'Use the page name from its address: letters, numbers and dashes only.';
        }),
    }),
  ],
  preview: {
    select: { title: 'heading', page: 'page' },
    prepare: ({ title, page }) => ({
      title: title || 'Church Trac page',
      subtitle: page ? `Church Trac page: ${page}` : 'Church Trac page: none named yet',
    }),
  },
});

// ── Exports ──────────────────────────────────────────────────────────────────

export const churchSectionSchemas = [
  serviceTimesSection,
  mapSection,
  beliefsSection,
  timelineSection,
  accordionSection,
  tabsSection,
  scriptureSection,
  noticeSection,
  countdownSection,
  givingSection,
  livestreamSection,
  eventsSection,
  newsletterSection,
  calendarSubscribeSection,
  progressSection,
  affiliationsSection,
  buttonRowSection,
  contactCardSection,
  columnsSection,
  photoSection,
  formSection,
  churchTracFormSection,
  churchTracPageSection,
  // The email backbone (card 127): replies kept in D1, never in Sanity.
  rsvpSection,
];

/**
 * Where these blocks sit in the "+ Add" menu. sections.ts merges these into
 * its groups by name: a group that exists gains the types, a new one is added.
 */
export const CHURCH_INSERT_GROUPS: { name: string; title: string; of: string[] }[] = [
  { name: 'basics', title: 'Basics', of: ['columnsSection', 'buttonRowSection', 'photoSection'] },
  {
    name: 'visit',
    title: 'Your first visit',
    of: ['serviceTimesSection', 'mapSection', 'contactCardSection'],
  },
  {
    name: 'dates',
    title: 'Dates and notices',
    of: ['noticeSection', 'countdownSection', 'eventsSection', 'calendarSubscribeSection'],
  },
  {
    name: 'faith',
    title: 'Faith and history',
    of: ['scriptureSection', 'beliefsSection', 'timelineSection', 'affiliationsSection'],
  },
  {
    name: 'folding',
    title: 'Fold-outs and tabs',
    of: ['accordionSection', 'tabsSection'],
  },
  {
    name: 'giving',
    title: 'Giving and sign-ups',
    of: [
      'givingSection',
      'progressSection',
      'formSection',
      'churchTracFormSection',
      'newsletterSection',
      'rsvpSection',
    ],
  },
  { name: 'media', title: 'Media', of: ['livestreamSection', 'churchTracPageSection'] },
];

/** Blocks that fill themselves from Church facts or the calendar (page checks). */
export const CHURCH_SELF_FILLING = [
  'serviceTimesSection',
  'mapSection',
  'givingSection',
  'livestreamSection',
  'eventsSection',
  'newsletterSection',
  'calendarSubscribeSection',
  'contactCardSection',
  'formSection',
  'churchTracPageSection',
];

/** Blocks that draw their own band (the notice); the rest take the page cadence. */
export const CHURCH_SELF_CONTAINED = ['noticeSection'];
