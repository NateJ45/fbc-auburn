// Privacy policy page singleton. Route: /privacy.
// Portable Text body + last-updated date, editable by the site editor.
// One instance only; singleton enforcement in sanity.config.ts.
// Safe to edit by hand.

import { defineType, defineField, defineArrayMember, type Rule } from 'sanity';
import { additionalSectionsField, sectionArrayOptions } from './sections';
import { PRIVACY_SECTION_TYPES } from './richSections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import { imageWithAlt } from './_imageWithAlt';

export const privacyPage = defineType({
  name: 'privacyPage',
  title: 'Privacy page',
  type: 'document',
  // Configuration, not prose the editor writes — exclude from Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'pageBuilder', title: 'Page layout', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Content' },
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
      of: PRIVACY_SECTION_TYPES,
      options: sectionArrayOptions,
      ...pageBuilderAuthoring,
    }),
    // SEO
    defineField({
      name: 'seoTitle',
      title: 'Google title',
      type: 'string',
      group: 'seo',
      description:
        'Browser tab and Google result title. Aim for 50 to 60 characters. Front-load the location or service.',
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
        'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site Settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      altRequired: false,
    }),

    // Hero
    defineField({
      name: 'heroEyebrow',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      initialValue: 'Your privacy',
    }),
    defineField({
      name: 'heroHeadline',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Privacy Policy',
      // No longer required: a hidden fossil since 2026-10-26.
    }),
    defineField({
      name: 'heroSubhead',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Hero subhead',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    imageWithAlt({
      name: 'heroImage',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Hero background image (optional)',
      group: 'hero',
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
        'A single word from the headline to render in the script accent font. Must match exactly. Leave blank to skip.',
    }),

    // Content
    defineField({
      name: 'lastUpdated',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Last updated date',
      type: 'date',
      group: 'content',
      description: 'Shown at the top of the policy. Update whenever the policy content changes.',
      // No longer required: a hidden fossil since 2026-10-26.
    }),
    defineField({
      name: 'body',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Policy body',
      type: 'array',
      group: 'content',
      description: 'The full privacy policy text. Use headings (H2/H3) to organize sections.',
      of: [
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
      ],
      // No longer required: a hidden fossil since 2026-10-26.
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
  preview: { prepare: () => ({ title: 'Privacy page' }) },
});
