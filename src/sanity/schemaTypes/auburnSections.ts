// FBC Auburn page-builder blocks and fields that the starter does not have.
// Registered through sections.ts (pageSectionSchemas), so every page-builder array offers them.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
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
              name: 'title',
              title: 'Title',
              type: 'string',
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
            select: { title: 'title', subtitle: 'note' },
            prepare: ({ title, subtitle }) => ({ title: title || 'Card', subtitle }),
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
