// scaffold-file: journal
// News and notes index page singleton (the code name is "journal"). Drives the
// banner copy and closing invitation on /journal. The posts grid itself is auto-populated from journalEntry documents.

import { defineType, defineField } from 'sanity';
import { additionalSectionsField, sectionArrayOptions } from './sections';
import { ABOUT_SECTION_TYPES } from './richSections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import { imageWithAlt } from './_imageWithAlt';

export const journalPage = defineType({
  name: 'journalPage',
  title: 'News and notes page',
  type: 'document',
  // Page singleton (banner + closing invitation only): structural, not free-form drafting.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'pageBuilder', title: 'Page layout', default: true },
    { name: 'seo', title: 'Google and sharing' },
    { name: 'hero', title: 'Opening banner' },
    { name: 'final', title: 'Closing invitation' },
    { name: 'extra', title: 'Extra sections' },
  ],
  fields: [
    // Every main page a page builder (2026-10-26): the sections of this page, in order. The old
    // banner and extra-section fields below are hidden fossils (rule 1); scripts/content/builder-pages.mjs
    // moved their content in here.
    defineField({
      name: 'pageBuilder',
      title: 'Page layout',
      type: 'array',
      group: 'pageBuilder',
      description:
        "Sections on this page. Drag to reorder, remove a section to hide it, or add a new block from the library. Edit each section's content by clicking into it.",
      of: ABOUT_SECTION_TYPES,
      options: sectionArrayOptions,
      ...pageBuilderAuthoring,
    }),
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
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Small line above the heading',
      type: 'string',
      group: 'hero',
      initialValue: 'From the church',
    }),
    defineField({
      name: 'heroHeadline',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'News and notes',
    }),
    defineField({
      name: 'heroSubhead',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
      initialValue: 'News, sermon notes and stories from the church family.',
    }),
    imageWithAlt({
      name: 'heroImage',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Banner photo',
      group: 'hero',
      description:
        'Full-width photo behind the banner text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
    }),
    defineField({
      name: 'heroScriptAccent',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in the handwritten script accent font. Must match exactly (case-sensitive). Leave blank to skip.',
    }),
    defineField({
      name: 'stickyCtaLabel',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Floating button label (on each post)',
      type: 'string',
      group: 'hero',
      description:
        'Short label for the small floating button that appears on every post once a visitor is halfway down. Example: "Got a question?". Leave blank to hide it.',
    }),

    defineField({
      name: 'finalCtaHeadline',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Closing invitation: heading',
      type: 'string',
      group: 'final',
      initialValue: 'Come and see us on a Sunday',
    }),
    defineField({
      name: 'finalCtaScriptAccent',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Closing invitation: script accent word (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in the handwritten script accent font. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({
      name: 'finalCtaSubhead',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Closing invitation: line under the heading',
      type: 'text',
      rows: 2,
      group: 'final',
    }),
    defineField({
      name: 'finalCta',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Closing invitation: button',
      type: 'ctaBlock',
      group: 'final',
    }),
    imageWithAlt({
      name: 'finalCtaBackgroundImage',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Closing invitation: background photo (optional)',
      group: 'final',
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    // FBC Auburn (2026-10-18): an append zone, so the pastor can add a photo, a callout or
    // anything from the section library to this page himself.
    // The authoring kit (card 109): Insert a saved section, plus gentle warnings.
    // Fossil (2026-10-26): the extra sections moved into the Page layout; kept, never deleted.
    defineField({
      ...additionalSectionsField,
      ...pageBuilderAuthoring,
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: { prepare: () => ({ title: 'News and notes page' }) },
});
