// FBC Auburn page-builder blocks and fields that the starter does not have.
// Registered through sections.ts (pageSectionSchemas), so every page-builder array offers them.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { PlayIcon } from '@sanity/icons/Play';
import { STONE_ICONS } from '../../lib/stone-icons';

/** A stone-icon picker. Always named `icon` (on NON_STEGA_FIELDS, so the preview keeps it clean). */
export const stoneIconField = (title = 'Stone icon (optional)', description?: string) =>
  defineField({
    name: 'icon',
    title,
    type: 'string',
    description,
    options: { list: STONE_ICONS.map((i) => ({ title: i.title, value: i.value })) },
  });

// ── Cards with stone icons ───────────────────────────────────────────────────
// A heading, an intro line, then cards: icon, title, a few sentences, a small note (a time, a Bible
// reference) and an optional link. Ministries, What we believe, "Find your place" on Home.
// A card with a photo shows the photo in place of the icon (the bold home pass, 2026-10-17).
// A content block: SectionRenderer gives it the alternating surface.
export const iconCardsSection = defineType({
  name: 'iconCardsSection',
  title: 'Cards with stone icons',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow (optional)', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading (optional)', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro line (optional)', type: 'text', rows: 2 }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (R) => R.min(1).max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'iconCard',
          fields: [
            stoneIconField(),
            defineField({
              name: 'image',
              title: 'Photo (optional)',
              type: 'image',
              options: { hotspot: true },
              description: 'With a photo the card shows the photo instead of the stone icon.',
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description:
                'On Home, a title that starts with a weekday ("Wednesdays") gets that day’s times from Church facts added, so never type a time here.',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'body', title: 'A few sentences', type: 'text', rows: 3 }),
            defineField({
              name: 'note',
              title: 'Small note (optional)',
              type: 'string',
              description: 'A time, a day or a Bible reference, shown under the text.',
            }),
            defineField({ name: 'link', title: 'Link (optional)', type: 'ctaBlock' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'note', media: 'image' },
            prepare: ({ title, subtitle, media }) => ({ title: title || 'Card', subtitle, media }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', cards: 'cards' },
    prepare: ({ title, cards }) => ({
      title: title || 'Cards with stone icons',
      subtitle: `Cards${Array.isArray(cards) ? ` (${cards.length})` : ''}`,
    }),
  },
});

// ── This week ────────────────────────────────────────────────────────────────
// The next seven days from Site settings (service times) and the Church Trac calendar, drawn by
// src/components/church/ThisWeekList.astro. Nothing to type but the heading: the rows derive.
export const thisWeekSection = defineType({
  name: 'thisWeekSection',
  title: 'This week (times and calendar)',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'This week at Auburn',
    }),
    defineField({
      name: 'intro',
      title: 'Intro line (optional)',
      type: 'text',
      rows: 2,
      description:
        'The list itself comes from the service times in Site settings and the Church Trac calendar.',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'This week', subtitle: 'This week' }),
  },
});

// ── Watch ────────────────────────────────────────────────────────────────────
// Words beside the latest message from the church's YouTube channel (src/components/church/
// LastSunday.astro). With no channel set, or the feed down, the "no video yet" line shows instead.
export const watchSection = defineType({
  name: 'watchSection',
  title: 'Watch (latest message)',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow (optional)', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Missed a Sunday?',
    }),
    defineField({ name: 'body', title: 'A sentence or two', type: 'text', rows: 3 }),
    defineField({ name: 'link', title: 'Link (optional)', type: 'ctaBlock' }),
    defineField({
      name: 'poster',
      title: 'Picture for the video card (optional)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Until the YouTube channel is connected, this picture stands in for the video, with a play button that goes to the link above.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'fallback',
      title: 'When there is no video yet',
      type: 'string',
      description:
        'Shown in place of the video until the YouTube channel is set in Site settings, or if it cannot be reached.',
      initialValue: 'Messages will appear here once the church channel is connected.',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Watch', subtitle: 'Latest message' }),
  },
});
