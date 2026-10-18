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

import { defineType, defineField, defineArrayMember } from 'sanity';
import { MicrophoneIcon } from '@sanity/icons/Microphone';
import { StackIcon } from '@sanity/icons/Stack';
import { UsersIcon } from '@sanity/icons/Users';
import { DownloadIcon } from '@sanity/icons/Download';
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

export const collectionSectionSchemas = [
  latestSermonSection,
  sermonSeriesSection,
  peopleSection,
  downloadsSection,
];
