// FBC Auburn page-builder blocks and fields that the starter does not have.
// Registered through sections.ts (pageSectionSchemas), so every page-builder array offers them.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { PlayIcon } from '@sanity/icons/Play';
import { UsersIcon } from '@sanity/icons/Users';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { STONE_ICONS } from '../../lib/stone-icons';
import { imageWithAlt } from './_imageWithAlt';
import { lookField } from './_appearanceFields';

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
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
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
            imageWithAlt({
              name: 'image',
              title: 'Photo (optional)',
              description: 'With a photo the card shows the photo instead of the stone icon.',
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
    // 2026-10-26: Standard or Stone (src/lib/section-looks.ts); rule 9's one appearance field.
    lookField('iconCardsSection'),
  ],
  preview: {
    select: { title: 'heading', cards: 'cards' },
    prepare: ({ title, cards }) => ({
      title: title || 'Cards with stone icons',
      subtitle: `Cards${Array.isArray(cards) ? ` (${cards.length})` : ''}`,
    }),
  },
});

// ── Find your place ──────────────────────────────────────────────────────────
// The Ministries hub (2026-10-24, from the hppres.org audit): groups of cards ("New here", "Kids
// and youth", "Adults", "Serve", "Care") beside a sticky index that follows the scroll, chips on a
// phone. Every group shows at once; the index jumps to one (/ministries/#serve). A card that
// belongs in two groups is simply in both (Duplicate it in the Studio).
// TIMES ARE NEVER TYPED: a card's "When" is a day ("Wednesdays"), and that day's times come from
// Site settings > Church facts (src/lib/church-facts.ts, dayWithTimes).
// Drawn by src/components/sections/FindYourPlace.astro. A content block: no colour field (rule 9).
export const findYourPlaceSection = defineType({
  name: 'findYourPlaceSection',
  title: 'Find your place (groups of cards)',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading (optional)',
      type: 'string',
      description: 'Leave it empty when the page title already says it.',
    }),
    defineField({ name: 'intro', title: 'Intro line (optional)', type: 'text', rows: 2 }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      description:
        'Each group gets a place in the list down the side. Keep the names short: "New here", "Kids and youth", "Adults", "Serve", "Care".',
      validation: (R) => R.min(1).max(8),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'fypGroup',
          title: 'Group',
          fields: [
            defineField({
              name: 'title',
              title: 'Group name',
              type: 'string',
              validation: (R) => R.required().max(24),
            }),
            defineField({
              name: 'line',
              title: 'One line about the group (optional)',
              type: 'string',
            }),
            defineField({
              name: 'cards',
              title: 'Cards',
              type: 'array',
              validation: (R) => R.min(1).max(12),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'fypCard',
                  title: 'Card',
                  fields: [
                    imageWithAlt({
                      name: 'image',
                      title: 'Photo (optional)',
                      description:
                        'Shown with a stepped brick corner. Without a photo the card shows its stone icon on brick.',
                    }),
                    stoneIconField('Stone icon (shown when there is no photo)'),
                    defineField({
                      name: 'title',
                      title: 'Title',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'forWho',
                      title: 'Who it is for (optional)',
                      type: 'string',
                      description: 'A few words, like "Birth to 5th grade" or "Everyone".',
                    }),
                    defineField({
                      name: 'day',
                      title: 'When (optional)',
                      type: 'string',
                      description:
                        'A day, like "Wednesdays". The times come from Church facts, so never type a time here.',
                    }),
                    defineField({
                      name: 'place',
                      title: 'Where (optional)',
                      type: 'string',
                      description: 'Like "Fellowship hall".',
                    }),
                    defineField({
                      name: 'body',
                      title: 'A sentence or two',
                      type: 'text',
                      rows: 3,
                    }),
                    defineField({ name: 'link', title: 'Link (optional)', type: 'ctaBlock' }),
                  ],
                  preview: {
                    select: { title: 'title', day: 'day', forWho: 'forWho', media: 'image' },
                    prepare: ({ title, day, forWho, media }) => ({
                      title: title || 'Card',
                      subtitle: [forWho, day].filter(Boolean).join(' · '),
                      media,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', cards: 'cards' },
            prepare: ({ title, cards }) => ({
              title: title || 'Group',
              subtitle: `Cards${Array.isArray(cards) ? ` (${cards.length})` : ''}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', groups: 'groups' },
    prepare: ({ title, groups }) => ({
      title: title || 'Find your place',
      subtitle: `Groups${Array.isArray(groups) ? ` (${groups.length})` : ''}`,
    }),
  },
});

// ── A letter ─────────────────────────────────────────────────────────────────
// A letter from the pastor (2026-10-24, from the hppres.org audit): "Dear friends," in a narrow
// column, a few paragraphs, the sign-off, a signature picture if there is one, the name and role,
// and an optional button. Warm and personal, and cheap to write. Drawn by
// src/components/sections/LetterSection.astro. A content block: no colour field (rule 9).
export const letterSection = defineType({
  name: 'letterSection',
  title: 'A letter',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the letter (optional)',
      type: 'string',
      initialValue: 'A letter from our pastor',
    }),
    defineField({
      name: 'greeting',
      title: 'Greeting',
      type: 'string',
      initialValue: 'Dear friends,',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'body',
      title: 'The letter',
      type: 'array',
      validation: (R) => R.required(),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'signOff',
      title: 'Sign-off',
      type: 'string',
      initialValue: 'In Christ,',
    }),
    imageWithAlt({
      name: 'signature',
      title: 'Signature (optional)',
      description:
        'A photo or scan of the signature in dark ink on white paper. Without one, the name is set in the heading font.',
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'role', title: 'Role (optional)', type: 'string' }),
    defineField({ name: 'link', title: 'Button (optional)', type: 'ctaBlock' }),
  ],
  preview: {
    select: { title: 'greeting', name: 'name' },
    prepare: ({ title, name }) => ({
      title: title || 'A letter',
      subtitle: name ? `A letter from ${name}` : 'A letter',
    }),
  },
});

// ── This week ────────────────────────────────────────────────────────────────
// The next seven days from Site settings (service times) and the Church Trac calendar, drawn by
// src/components/church/ThisWeekList.astro. Nothing to type but the heading: the rows derive.
// "Every week" (2026-10-25, the Events page) lists each regular gathering instead, with a link to
// its Ministries card and an Add to calendar link (src/components/church/EveryWeekList.astro).
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
    defineField({
      name: 'mode',
      title: 'Show',
      type: 'string',
      options: {
        list: [
          { title: 'The next seven days, with dates (Home)', value: 'thisWeek' },
          { title: 'Every regular gathering, once each (Events)', value: 'everyWeek' },
        ],
        layout: 'radio',
      },
      initialValue: 'thisWeek',
      description:
        'Both come from the service times in Site settings, so they always agree. Every week also links each gathering to its Ministries card.',
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
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Missed a Sunday?',
    }),
    defineField({ name: 'body', title: 'A sentence or two', type: 'text', rows: 3 }),
    defineField({ name: 'link', title: 'Link (optional)', type: 'ctaBlock' }),
    // Home audit research (2026-10-17): the card should say WHICH message. Facebook has no feed a
    // site can read, so this is a 30-second entry after Sunday. Shown for 8 days after its date;
    // then the card falls back to the words above.
    defineField({
      name: 'lastMessage',
      title: "Last Sunday's message (optional)",
      type: 'object',
      description:
        'Fill this in after Sunday and the card names the message for the week after. Leave it and the card shows the words above.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
          name: 'passage',
          title: 'Bible passage',
          type: 'string',
          description: 'Like "Mark 4:1-20".',
        }),
        defineField({ name: 'date', title: 'Date it was preached', type: 'date' }),
        defineField({
          name: 'videoUrl',
          title: 'Link to the video (Facebook or YouTube)',
          type: 'url',
        }),
      ],
    }),
    imageWithAlt({
      name: 'poster',
      title: 'Picture for the video card (optional)',
      description:
        'Until the YouTube channel is connected, this picture stands in for the video, with a play button that goes to the link above.',
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
