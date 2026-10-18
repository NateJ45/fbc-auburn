// scaffold-file: faq
// FAQ page singleton (editors see it as "Questions"). Questions auto-populate
// from the faqItem collection, grouped by question group.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { additionalSectionsField } from './sections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import { imageWithAlt } from './_imageWithAlt';

export const faqPage = defineType({
  name: 'faqPage',
  title: 'Questions page',
  type: 'document',
  // Locked and structural: edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'Google and sharing' },
    { name: 'hero', title: 'Opening banner' },
    { name: 'list', title: 'Order of the groups' },
    { name: 'final', title: 'Closing invitation' },
    { name: 'extra', title: 'Extra sections' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Google title',
      type: 'string',
      group: 'seo',
      description:
        'Browser tab and Google result title. Aim for 50 to 60 characters. Start with the church name or Hamilton.',
      validation: (Rule) =>
        Rule.max(60).warning(
          'Titles longer than about 60 characters get cut off in Google search results.',
        ),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Google description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) =>
        Rule.max(160).warning(
          'Descriptions longer than about 160 characters get cut off in Google search results.',
        ),
    }),
    imageWithAlt({
      name: 'seoImage',
      title: 'Social share image (this page)',
      group: 'seo',
      description:
        'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      altRequired: false,
    }),

    defineField({
      name: 'heroEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Before you visit',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Questions',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    imageWithAlt({
      name: 'heroImage',
      title: 'Banner photo',
      group: 'hero',
      description:
        'Full-width photo behind the banner text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in the handwritten script accent font. Must match exactly (case-sensitive). Leave blank to skip.',
    }),

    defineField({
      name: 'categoryOrder',
      title: 'Order of the question groups',
      type: 'array',
      group: 'list',
      description:
        'Drag to reorder. Each line must match a Question group heading exactly, such as "Your first Sunday".',
      of: [defineArrayMember({ type: 'string' })],
    }),

    defineField({
      name: 'finalCtaEyebrow',
      title: 'Closing invitation: small line above the heading',
      type: 'string',
      group: 'final',
      initialValue: 'Still wondering?',
    }),
    defineField({
      name: 'finalCtaHeadline',
      title: 'Closing invitation: heading',
      type: 'string',
      group: 'final',
      initialValue: 'Just ask.',
    }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Closing invitation: script accent word (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in the handwritten script accent font. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({
      name: 'finalCtaSubhead',
      title: 'Closing invitation: line under the heading',
      type: 'text',
      rows: 2,
      group: 'final',
    }),
    defineField({
      name: 'finalCta',
      title: 'Closing invitation: button',
      type: 'ctaBlock',
      group: 'final',
    }),
    imageWithAlt({
      name: 'finalCtaBackgroundImage',
      title: 'Closing invitation: background photo (optional)',
      group: 'final',
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Closing invitation: second button (optional)',
      type: 'ctaBlock',
      group: 'final',
      description: 'Optional second button beside the main one, for example "Plan your visit".',
    }),

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description:
        'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    // FBC Auburn (2026-10-18): an append zone, so the pastor can add a photo, a callout or
    // anything from the section library to this page himself.
    // The authoring kit (card 109): Insert a saved section, plus gentle warnings.
    defineField({ ...additionalSectionsField, ...pageBuilderAuthoring }),
  ],
  preview: { prepare: () => ({ title: 'Questions page' }) },
});
