// 404 page singleton. Drives the eyebrow, headline, body, image, and the
// three CTAs on /404. Default values match what was hardcoded in the page
// before this singleton existed, so the site looks identical on launch.

import { defineType, defineField } from 'sanity';
import { imageWithAlt } from './_imageWithAlt';

export const notFoundPage = defineType({
  name: 'notFoundPage',
  title: 'Page not found',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'Google and sharing' },
    { name: 'content', title: 'Words and photo' },
    { name: 'ctas', title: 'Buttons' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Google title',
      type: 'string',
      group: 'seo',
      initialValue: 'Page not found',
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
      rows: 2,
      group: 'seo',
      initialValue: 'That page wandered off. Head back to the homepage or get in touch.',
      description:
        'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) =>
        Rule.max(160).warning(
          'Descriptions longer than about 160 characters get cut off in Google search results.',
        ),
    }),

    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'content',
      initialValue: '404',
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      group: 'content',
      initialValue: 'That page wandered off.',
    }),
    defineField({
      name: 'body',
      title: 'Main text',
      type: 'text',
      rows: 3,
      group: 'content',
      initialValue:
        "It happens. Maybe a link is old, maybe the URL has a typo. Either way, here's where to head next.",
    }),
    imageWithAlt({
      name: 'heroImage',
      title: 'Photo',
      group: 'content',
      description:
        'Shown beside the text (above it on a phone). A warm photo of the church works well.',
      fields: [
        defineField({
          name: 'caption',
          title: 'Caption (optional)',
          type: 'string',
          initialValue: 'First Baptist Church of Auburn',
        }),
      ],
    }),

    defineField({
      name: 'primaryCtaLabel',
      title: 'First button: text',
      type: 'string',
      group: 'ctas',
      initialValue: 'Back home',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'First button: where it goes',
      type: 'string',
      group: 'ctas',
      initialValue: '/',
      description: 'A page on this site like "/" or "/contact/". Full web addresses work too.',
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Second button: text',
      type: 'string',
      group: 'ctas',
      initialValue: 'Plan your visit',
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'Second button: where it goes',
      type: 'string',
      group: 'ctas',
      // FBC Auburn (2026-10-18): the Plan your visit page (a Custom page).
      initialValue: '/plan-your-visit/',
    }),
    defineField({
      name: 'tertiaryCtaLabel',
      title: 'Third button: text',
      type: 'string',
      group: 'ctas',
      initialValue: 'Get in touch',
    }),
    defineField({
      name: 'tertiaryCtaHref',
      title: 'Third button: where it goes',
      type: 'string',
      group: 'ctas',
      initialValue: '/contact',
    }),
  ],
  preview: { prepare: () => ({ title: 'Page not found' }) },
});
