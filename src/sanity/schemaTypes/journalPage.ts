// scaffold-file: journal
// News and notes index page singleton (the code name is "journal"). Drives the
// banner copy and closing invitation on /journal. The posts grid itself is auto-populated from journalEntry documents.

import { defineType, defineField } from 'sanity';
import { additionalSectionsField } from './sections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';

export const journalPage = defineType({
  name: 'journalPage',
  title: 'News and notes page',
  type: 'document',
  // Page singleton (banner + closing invitation only): structural, not free-form drafting.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'Google and sharing' },
    { name: 'hero', title: 'Opening banner' },
    { name: 'final', title: 'Closing invitation' },
    { name: 'extra', title: 'Extra sections' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
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
      title: 'SEO description',
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
    defineField({
      name: 'seoImage',
      title: 'Social share image (this page)',
      type: 'image',
      group: 'seo',
      description:
        'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    defineField({
      name: 'heroEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'hero',
      initialValue: 'From the church',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'News and notes',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
      initialValue: 'News, sermon notes and stories from the church family.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Banner photo',
      type: 'image',
      group: 'hero',
      description:
        'Full-width photo behind the banner text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
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
      name: 'stickyCtaLabel',
      title: 'Floating button label (on each post)',
      type: 'string',
      group: 'hero',
      description:
        'Short label for the small floating button that appears on every post once a visitor is halfway down. Example: "Got a question?". Leave blank to hide it.',
    }),

    defineField({
      name: 'finalCtaHeadline',
      title: 'Closing invitation: heading',
      type: 'string',
      group: 'final',
      initialValue: 'Come and see us on a Sunday',
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
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Closing invitation: background photo (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    // FBC Auburn (2026-10-18): an append zone, so the pastor can add a photo, a callout or
    // anything from the section library to this page himself.
    // The authoring kit (card 109): Insert a saved section, plus gentle warnings.
    defineField({ ...additionalSectionsField, ...pageBuilderAuthoring }),
  ],
  preview: { prepare: () => ({ title: 'News and notes page' }) },
});
