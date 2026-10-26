// Safe to edit by hand
// =============================================================================
// Page-builder blocks fed by the sermon, people and downloads collections
// (FBC Auburn, 2026-10-18)
// =============================================================================
// Each block holds only its own heading and a choice of WHAT to show; the rows
// themselves come from the collections in the GROQ (COLLECTION_SECTION_ARMS in
// src/lib/collection-queries.ts), so a sermon or a bulletin is typed once and
// every page that shows it agrees. No colour or surface field (rule 9): the
// SectionRenderer cadence owns that. Registered through sections.ts
// (pageSectionSchemas), so every page builder and the saved sections offer them.
//
// The dropdowns here (mode, category) are on NON_STEGA_FIELDS (rule 8b).
// =============================================================================

import { defineType, defineField, defineArrayMember, type Rule } from 'sanity';
import { MicrophoneIcon } from '@sanity/icons/Microphone';
import { StackIcon } from '@sanity/icons/Stack';
import { UsersIcon } from '@sanity/icons/Users';
import { DownloadIcon } from '@sanity/icons/Download';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { LockIcon } from '@sanity/icons/Lock';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { ListIcon } from '@sanity/icons/List';
import { PlayIcon } from '@sanity/icons/Play';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { DOWNLOAD_CATEGORIES, categoryTitle } from '../../lib/sermons';

const headingField = (initial: string) =>
  defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: initial });
const introField = defineField({
  name: 'intro',
  title: 'A line under the heading (optional)',
  type: 'text',
  rows: 2,
});

// ── Latest sermon ────────────────────────────────────────────────────────────
export const latestSermonSection = defineType({
  name: 'latestSermonSection',
  title: 'Latest sermon',
  type: 'object',
  icon: MicrophoneIcon,
  fields: [
    headingField('Latest sermon'),
    introField,
    defineField({
      name: 'mode',
      title: 'Which sermon',
      type: 'string',
      initialValue: 'newest',
      options: {
        list: [
          { title: 'The newest one (changes by itself)', value: 'newest' },
          { title: 'One I pick', value: 'pick' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'sermon',
      title: 'Sermon',
      type: 'reference',
      to: [{ type: 'sermon' }],
      hidden: ({ parent }) => (parent as { mode?: string })?.mode !== 'pick',
    }),
  ],
  preview: {
    select: { title: 'heading', mode: 'mode', picked: 'sermon.title' },
    prepare: ({ title, mode, picked }) => ({
      title: title || 'Latest sermon',
      subtitle: mode === 'pick' ? `Sermon: ${picked || 'none picked yet'}` : 'The newest sermon',
    }),
  },
});

// ── Sermon series grid ───────────────────────────────────────────────────────
export const sermonSeriesSection = defineType({
  name: 'sermonSeriesSection',
  title: 'Sermon series grid',
  type: 'object',
  icon: StackIcon,
  fields: [
    headingField('Sermon series'),
    introField,
    defineField({
      name: 'limit',
      title: 'How many series',
      type: 'number',
      initialValue: 6,
      description: 'The newest series first.',
      validation: (R) => R.min(1).max(24).integer(),
    }),
    // FBC Auburn (2026-10-26): the Sermons page hid its series band until there was a series, while
    // the block on other pages says the series are coming. This keeps both.
    defineField({
      name: 'hideWhenEmpty',
      title: 'Hide this section until there is a series to show',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'heading', limit: 'limit' },
    prepare: ({ title, limit }) => ({
      title: title || 'Sermon series',
      subtitle: `The newest ${limit ?? 6} series`,
    }),
  },
});

// ── People ───────────────────────────────────────────────────────────────────
// Replaces "Staff and leaders" (teamSection, people typed into the section),
// which stays registered but is no longer offered: no page used it (dataset
// read 2026-10-18), and a person typed once on the people list can be shown on
// several pages and picked as a preacher.
export const peopleSection = defineType({
  name: 'peopleSection',
  title: 'People',
  type: 'object',
  icon: UsersIcon,
  fields: [
    headingField('Our people'),
    introField,
    defineField({
      name: 'mode',
      title: 'Who to show',
      type: 'string',
      initialValue: 'group',
      options: {
        list: [
          { title: 'Everyone in the groups I pick', value: 'group' },
          { title: 'People I pick, in my order', value: 'hand' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'personGroup' }] })],
      description: 'Several groups show one after another, each under its own name.',
      hidden: ({ parent }) => (parent as { mode?: string })?.mode === 'hand',
    }),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'person' }] })],
      description: 'Drag to change the order.',
      hidden: ({ parent }) => (parent as { mode?: string })?.mode !== 'hand',
    }),
    defineField({
      name: 'showBios',
      title: 'Show the few sentences about each person',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'heading', mode: 'mode', g0: 'groups.0.title', g1: 'groups.1.title' },
    prepare: ({ title, mode, g0, g1 }) => ({
      title: title || 'People',
      subtitle:
        mode === 'hand'
          ? 'People picked by hand'
          : `People: ${[g0, g1].filter(Boolean).join(', ') || 'pick a group'}`,
    }),
  },
});

// ── Downloads list ───────────────────────────────────────────────────────────
export const downloadsSection = defineType({
  name: 'downloadsSection',
  title: 'Downloads list',
  type: 'object',
  icon: DownloadIcon,
  fields: [
    headingField('Downloads'),
    introField,
    defineField({
      name: 'category',
      title: 'Which kind',
      type: 'string',
      initialValue: 'all',
      options: {
        list: [
          { title: 'Every kind', value: 'all' },
          ...DOWNLOAD_CATEGORIES.map((c) => ({ ...c })),
        ],
      },
    }),
    defineField({
      name: 'limit',
      title: 'How many',
      type: 'number',
      initialValue: 5,
      description: 'The newest first.',
      validation: (R) => R.min(1).max(24).integer(),
    }),
    defineField({
      name: 'showDates',
      title: 'Show the dates',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featureBulletin',
      title: "Put this week's bulletin at the top",
      type: 'boolean',
      initialValue: false,
      description: 'The newest Bulletin, in a box of its own above the list.',
    }),
  ],
  preview: {
    select: { title: 'heading', category: 'category', limit: 'limit' },
    prepare: ({ title, category, limit }) => ({
      title: title || 'Downloads',
      subtitle: `Downloads: ${category && category !== 'all' ? categoryTitle(category) : 'every kind'}, newest ${limit ?? 5}`,
    }),
  },
});

// ── Every main page a page builder (2026-10-26) ──────────────────────────────
// The parts of Contact, Privacy, News and notes, Sermons and Bulletin that were drawn in code
// became blocks, so the pastor can move them, put sections around them or take them off. Each
// still draws what its page drew (src/components/sections/*), and none carries a colour (rule 9).

// ── News and notes posts ─────────────────────────────────────────────────────
export const journalPostsSection = defineType({
  name: 'journalPostsSection',
  title: 'News and notes posts',
  type: 'object',
  icon: DocumentTextIcon,
  description: 'Every post, newest first, with the category buttons above them.',
  fields: [
    defineField({
      name: 'showCategories',
      title: 'Show the category buttons above the posts',
      type: 'boolean',
      initialValue: true,
      description: 'They show once there are posts in two or more categories.',
    }),
    defineField({
      name: 'showNewsletter',
      title: 'Show the newsletter sign-up under the posts',
      type: 'boolean',
      initialValue: true,
      description: 'Only while the newsletter is switched on in Site settings.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'News and notes posts', subtitle: 'Every post, newest first' }),
  },
});

// ── Every sermon (the archive) ───────────────────────────────────────────────
export const sermonArchiveSection = defineType({
  name: 'sermonArchiveSection',
  title: 'Every sermon (with filters)',
  type: 'object',
  icon: ListIcon,
  description:
    'Every sermon newest first, with series, preacher and book filters. Shows once the first sermon is published.',
  fields: [headingField('Every sermon')],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Every sermon', subtitle: 'The sermon archive' }),
  },
});

// ── Podcast ──────────────────────────────────────────────────────────────────
export const podcastSection = defineType({
  name: 'podcastSection',
  title: 'Podcast',
  type: 'object',
  icon: PlayIcon,
  description:
    'How to get the sermons as a podcast. The Apple Podcasts and Spotify links are on the Sermons page, tab Podcast.',
  fields: [headingField('Listen on the go'), introField],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Listen on the go', subtitle: 'Podcast' }),
  },
});

// ── This week's bulletin ─────────────────────────────────────────────────────
export const bulletinSection = defineType({
  name: 'bulletinSection',
  title: "This week's bulletin",
  type: 'object',
  icon: DocumentsIcon,
  description:
    'The newest bulletin from the Downloads list, with the few before it. It changes by itself when a new one is uploaded.',
  fields: [
    defineField({
      name: 'postedWhen',
      title: 'When a new bulletin goes up (optional)',
      type: 'string',
      description:
        'A few words, like "by Saturday evening". Shown when this week\'s is not up yet: "A new bulletin goes up each week, by Saturday evening."',
    }),
    defineField({
      name: 'earlierHeading',
      title: 'Heading over the earlier bulletins',
      type: 'string',
      initialValue: 'Earlier bulletins',
    }),
  ],
  preview: {
    prepare: () => ({ title: "This week's bulletin", subtitle: 'The newest bulletin' }),
  },
});

export const collectionSectionSchemas = [
  latestSermonSection,
  sermonSeriesSection,
  peopleSection,
  downloadsSection,
  journalPostsSection,
  sermonArchiveSection,
  podcastSection,
  bulletinSection,
];

// ── Page-only blocks (2026-10-26) ────────────────────────────────────────────
// Offered only on their own page (CONTACT_ and PRIVACY_SECTION_TYPES in richSections.ts), not in
// the general library or the saved sections. Registered in schemaTypes/index.ts.

// The policy's Portable Text, shared with the hidden privacyPage.body it replaced.
export const policyBodyMembers = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Paragraph', value: 'normal' },
      { title: 'Heading 2', value: 'h2' },
      { title: 'Heading 3', value: 'h3' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
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
            {
              name: 'href',
              type: 'url',
              title: 'Link to',
              description:
                'A page on this website, like /contact/, or a full address starting https://. Email and phone links work too (mailto:, tel:).',
              validation: (R: Rule) =>
                R.uri({ allowRelative: true, scheme: ['https', 'http', 'mailto', 'tel'] }),
            },
            {
              name: 'openInNewTab',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: false,
            },
          ],
        },
      ],
    },
  }),
];

// ── Contact form ─────────────────────────────────────────────────────────────
export const contactFormSection = defineType({
  name: 'contactFormSection',
  title: 'Contact form',
  type: 'object',
  icon: EnvelopeIcon,
  description:
    'The contact form with the phone, email and address beside it. Its questions and the "What happens next" words are on this page\'s "The form" tab.',
  fields: [
    defineField({
      name: 'sidebar',
      title: 'Show the email, phone and address beside the form',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Contact form', subtitle: 'Questions on the "The form" tab' }),
  },
});

// ── Privacy policy text ──────────────────────────────────────────────────────
export const privacyPolicySection = defineType({
  name: 'privacyPolicySection',
  title: 'Privacy policy text',
  type: 'object',
  icon: LockIcon,
  fields: [
    defineField({
      name: 'lastUpdated',
      title: 'Last updated date',
      type: 'date',
      description: 'Shown at the top of the policy. Update whenever the policy changes.',
    }),
    defineField({
      name: 'body',
      title: 'Policy text',
      type: 'array',
      description:
        'The full privacy policy. Use headings to organize it. Leave empty to show the built-in policy.',
      of: policyBodyMembers,
    }),
  ],
  preview: {
    select: { date: 'lastUpdated' },
    prepare: ({ date }) => ({
      title: 'Privacy policy text',
      subtitle: date ? `Last updated ${date}` : 'The built-in policy',
    }),
  },
});

export const pageOnlySectionSchemas = [contactFormSection, privacyPolicySection];
