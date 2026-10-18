// Foundation, edit with care
// Rich section block library — the 8 generalized section types that power the
// four core pages (home, about, services, process). Each type is a generalized
// section rendered through a site component, with no client-specific copy,
// names, or domain vocabulary baked in.
//
// Per-page curated lists (HOME_SECTION_TYPES, ABOUT_SECTION_TYPES, etc.) each
// equal the general SECTION_TYPES plus the rich types that belong on that page.
// Register only via richSectionSchemas in studio/schemaTypes/index.ts.
//
// FBC Auburn (2026-10-18): founderSection, storySection, serviceAreaSection
// and guaranteeSection are business-starter blocks. They stay REGISTERED (so a
// document holding one would still open; none does, checked 2026-10-18) but
// are offered in no builder and no insert-menu group. See RETIRED_RICH below.
//
// SectionRenderer (src/components/SectionRenderer.astro) maps every _type here
// to a component in src/components/sections/.
//
// sectionCadence.ts classifies each type as SELF_CONTAINED or CONTENT.
// See the classification table in the Phase B plan for reasoning.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { UserIcon } from '@sanity/icons/User';
import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { StarIcon } from '@sanity/icons/Star';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline';
import { OlistIcon } from '@sanity/icons/Olist';
import { PinIcon } from '@sanity/icons/Pin';
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle';
import { UsersIcon } from '@sanity/icons/Users';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { SyncIcon } from '@sanity/icons/Sync';
import { SECTION_TYPES } from './sections';
import { columnsField, headingAccentField, hideWhenRich, richTwin } from './_appearanceFields';

// ── Shared helpers (mirrors sections.ts helpers — keep in sync if you change
//    the main helpers, or extract to a shared file in a future refactor) ──────

const imageWithAlt = (name = 'image', title = 'Image') =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'Describe the photo in a few words, for screen readers and search engines.',
        validation: (R) => R.required(),
      }),
    ],
  });

// Prose body identical to sections.ts proseBody
const proseBody = (name = 'body', title = 'Text') =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Heading', value: 'h2' },
          { title: 'Subheading', value: 'h3' },
          { title: 'Quote', value: 'blockquote' },
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
                defineField({
                  name: 'href',
                  title: 'URL',
                  type: 'url',
                  validation: (R) => R.uri({ allowRelative: true }),
                }),
              ],
            },
          ],
        },
      }),
    ],
  });

// scaffold: about
// ── 1. founderSection ────────────────────────────────────────────────────────
// Two-column bio block: portrait + prose intro. Use once per site (home page).
// Manages its own bg-background surface (SELF_CONTAINED).
export const founderSection = defineType({
  name: 'founderSection',
  title: 'Founder bio',
  type: 'object',
  icon: UserIcon,
  fields: [
    imageWithAlt('portrait', 'Portrait photo'),
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    proseBody('content', 'Bio text'),
    defineField({ name: 'cta', title: 'Button (optional)', type: 'ctaBlock' }),
  ],
  preview: {
    select: { title: 'headline', media: 'portrait' },
    prepare: ({ title, media }) => ({
      title: title || 'Founder bio',
      subtitle: 'Founder bio',
      media,
    }),
  },
});
// scaffold:end

// scaffold: about
// ── 4. storySection ──────────────────────────────────────────────────────────
// Long-form narrative block: sticky portrait, story prose, attribution + credential lines.
// Participates in alternating surface cadence (CONTENT) — receives surface prop.
export const storySection = defineType({
  name: 'storySection',
  title: 'Story / narrative',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    proseBody('content', 'Story text'),
    imageWithAlt('portrait', 'Portrait photo (optional)'),
    defineField({
      name: 'attribution',
      title: 'Attribution line (optional)',
      type: 'string',
      description: 'Example: "Pastor Jacob"',
    }),
    defineField({
      name: 'credentialLine',
      title: 'Credentials line (optional)',
      type: 'text',
      rows: 2,
      description: 'One plain sentence with real credentials. Must be accurate, not aspirational.',
    }),
    defineField({
      name: 'serviceAreaLine',
      title: 'Service area mention (optional)',
      type: 'string',
      description: 'Single line mentioning where you work.',
    }),
  ],
  preview: {
    select: { title: 'headline', media: 'portrait' },
    prepare: ({ title, media }) => ({
      title: title || 'Story',
      subtitle: 'Story / narrative',
      media,
    }),
  },
});
// scaffold:end

// ── 7. serviceAreaSection ────────────────────────────────────────────────────
// Two-column service area info + optional travel fee table (from businessInfo).
// Participates in alternating surface cadence (CONTENT) — receives surface prop.
export const serviceAreaSection = defineType({
  name: 'serviceAreaSection',
  title: 'Service area',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Lead paragraph about the primary service area.',
    }),
    defineField({
      name: 'showTravelFees',
      title: 'Show travel fee tiers',
      type: 'boolean',
      initialValue: true,
      description:
        'When on, the travel fee tier table from Business Info is pulled in automatically. Turn off to show the heading and description only.',
    }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title || 'Service area', subtitle: 'Service area' }),
  },
});

// ── 8. guaranteeSection ──────────────────────────────────────────────────────
// Trust/guarantee statement rendered as a styled callout band.
// Two sources: editor can write text inline, or leave blank to pull
// siteSettings.satisfactionGuarantee at render time.
// Participates in alternating surface cadence (CONTENT) — receives surface prop.
export const guaranteeSection = defineType({
  name: 'guaranteeSection',
  title: 'Guarantee / trust statement',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Statement text (optional)',
      type: 'text',
      rows: 2,
      description:
        'The guarantee or trust statement. Leave blank to use the default text from Site settings.',
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare: ({ title }) => ({
      title: title ? `"${String(title).slice(0, 60)}"` : 'Guarantee (from Site settings)',
      subtitle: 'Guarantee / trust statement',
    }),
  },
});

// scaffold: faq
// ── 9. faqSection ─────────────────────────────────────────────────────────--
// Inline FAQ accordion. References existing faqItem documents so editors pick
// from the curated collection rather than entering duplicate copy.
// SELF_CONTAINED — manages its own bg-background surface.
//
// NOTE: the dedicated /faq page emits FAQPage JSON-LD for Google rich results.
// This inline block deliberately does NOT re-emit that schema — Google penalises
// duplicate FAQPage markup on the same domain. The accordion renders without it.
export const faqSection = defineType({
  name: 'faqSection',
  title: 'Questions (open and close)',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    headingAccentField(),
    defineField({
      name: 'subhead',
      title: 'Line under the heading (optional)',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('subheadRich'),
    }),
    richTwin('subheadRich', 'Line under the heading'),
    defineField({
      name: 'items',
      title: 'Questions to show',
      type: 'array',
      description: 'Pick 3 to 6 questions. Fewer is better for inline blocks.',
      validation: (R) => R.max(8),
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faqItem' }] })],
    }),
    defineField({ name: 'cta', title: 'Link button (optional)', type: 'ctaBlock' }),
  ],
  preview: {
    select: { title: 'headline', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'Questions',
      subtitle: `Questions${Array.isArray(items) ? ` (${items.length})` : ''}`,
    }),
  },
});
// scaffold:end

// ── 10. teamSection ─────────────────────────────────────────────────────────
// Inline team member grid. Members are stored as inline objects rather than
// references to a teamMember collection. This keeps the core starter
// collection-free. A future modules/team module will own a full teamMember
// collection with richer fields; when that module ships, pages can migrate
// from this inline approach to the reference approach.
// SELF_CONTAINED — manages its own bg-background surface.
export const teamSection = defineType({
  name: 'teamSection',
  title: 'Staff and leaders',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subhead',
      title: 'Line under the heading (optional)',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('subheadRich'),
    }),
    richTwin('subheadRich', 'Line under the heading'),
    defineField({
      name: 'members',
      title: 'People',
      type: 'array',
      validation: (R) => R.min(1).max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'teamMember',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'role', title: 'Role or title (optional)', type: 'string' }),
            imageWithAlt('photo', 'Photo (optional)'),
            defineField({ name: 'bio', title: 'Short bio (optional)', type: 'text', rows: 2 }),
            defineField({
              name: 'socialLinks',
              title: 'Social links (optional)',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'socialLink',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'Examples: Facebook, Instagram, Website.',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'url',
                      title: 'URL',
                      type: 'url',
                      validation: (R) => R.required().uri({ scheme: ['http', 'https'] }),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'url' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'role', media: 'photo' },
            prepare: ({ title, subtitle, media }) => ({
              title: title || 'Person',
              subtitle: subtitle || '',
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'headline', members: 'members' },
    prepare: ({ title, members }) => ({
      title: title || 'Staff and leaders',
      subtitle: `Staff and leaders${Array.isArray(members) ? ` (${members.length})` : ''}`,
    }),
  },
});

// ── 11. dynamicListSection ────────────────────────────────────────────────────
// Pulls the latest items from a core collection automatically. No manual
// curation required: the editor picks the source and a limit, and the section
// self-fills at build time. Great for keeping a home page or about page fresh
// without touching code.
//
// Supported sources and what they surface:
//   journal      - Latest News and notes posts (newest first, up to `limit`).
//   (services and testimonials were starter sources for types this site does
//   not have; FBC Auburn dropped them from the choices on 2026-10-18.)
//   faqs         - FAQ items ordered by displayOrder. Renders as a mini
//                  accordion (no duplicate FAQPage JSON-LD — the /faq page owns
//                  that schema; this block deliberately omits it).
//
// IMPORTANT: This section is SELF_CONTAINED (manages its own surface via
// sectionCadence.ts). Blocks carry NO backgroundColor field — that rule is
// unconditional.
//
// Build-time note: items are fetched via GROQ subqueries inside sectionsProjection().
// The section renders the pre-fetched array; no client-side fetching occurs.
export const dynamicListSection = defineType({
  name: 'dynamicListSection',
  title: 'Latest posts or questions',
  type: 'object',
  icon: SyncIcon,
  description:
    'Shows the newest News and notes posts, or a few questions, by itself. Stays up to date without you touching it.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading (optional)',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subhead',
      title: 'Line under the heading (optional)',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('subheadRich'),
    }),
    richTwin('subheadRich', 'Line under the heading'),
    columnsField('dynamicListSection'),
    defineField({
      name: 'source',
      title: 'Show items from',
      type: 'string',
      options: {
        list: [
          { title: 'News and notes (latest posts)', value: 'journal' },
          { title: 'Questions (in their display order)', value: 'faqs' },
        ],
        layout: 'radio',
      },
      initialValue: 'journal',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'limit',
      title: 'How many to show',
      type: 'number',
      initialValue: 6,
      validation: (R) => R.required().min(3).max(12),
      description: 'Between 3 and 12 items. The section shows this many in a card grid.',
    }),
    defineField({ name: 'cta', title: 'Link button (optional)', type: 'ctaBlock' }),
  ],
  preview: {
    select: { title: 'headline', source: 'source', limit: 'limit' },
    prepare: ({ title, source, limit }) => ({
      title: title || 'Latest posts or questions',
      subtitle: `${source === 'faqs' ? 'Questions' : 'Latest posts'}${limit ? ` (up to ${limit})` : ''}`,
    }),
  },
});

// ── Exports ──────────────────────────────────────────────────────────────────

export const richSectionSchemas = [
  founderSection, // scaffold: about
  storySection, // scaffold: about
  serviceAreaSection,
  guaranteeSection,
  faqSection, // scaffold: faq
  teamSection,
  dynamicListSection,
];

/**
 * Registered but offered nowhere (FBC Auburn, 2026-10-18): business-starter
 * blocks. Keeping them registered means old data could still open; leaving them
 * out of every list below is what takes them off the insert menu.
 */
const RETIRED_RICH = new Set([
  'founderSection',
  'storySection',
  'serviceAreaSection',
  'guaranteeSection',
  // FBC Auburn (2026-10-18): replaced by the People block (collectionSections.ts), which
  // reads the people list. No page used it (dataset read 2026-10-18); kept registered.
  'teamSection',
]);

/** The rich blocks a saved section may hold (everything still on offer). */
export const RICH_SECTION_TYPES = richSectionSchemas
  .filter((s) => !RETIRED_RICH.has(s.name))
  .map((s) => ({ type: s.name }));

// Per-page curated lists. Each is SECTION_TYPES (11 general) plus the rich
// types that make sense on that page. Editors only see relevant blocks.
// U7 additions:
//   faqSection        -> HOME, ABOUT, SERVICES (inline FAQ on any marketing page)
//   logoStripSection  -> all pages (already in SECTION_TYPES via pageSectionSchemas)
//   embedSection      -> all pages (already in SECTION_TYPES via pageSectionSchemas)
//   teamSection       -> HOME, ABOUT
// Church-reverse-port additions:
//   dynamicListSection -> HOME, ABOUT (auto-pull latest content; generic small-biz sources)
export const HOME_SECTION_TYPES = [
  ...SECTION_TYPES,
  { type: 'faqSection' }, // scaffold: faq
  { type: 'dynamicListSection' },
];

// FBC Auburn: Studio pages (page.ts) also take the team grid, the FAQ block and the dynamic list.
export const PAGE_SECTION_TYPES = [
  ...SECTION_TYPES,
  { type: 'faqSection' }, // scaffold: faq
  { type: 'dynamicListSection' },
];

export const ABOUT_SECTION_TYPES = [
  ...SECTION_TYPES,
  { type: 'faqSection' }, // scaffold: faq
  { type: 'dynamicListSection' },
];
// (SERVICES_ and PROCESS_SECTION_TYPES went with those pages: nothing used them.)
