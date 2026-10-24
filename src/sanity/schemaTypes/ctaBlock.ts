// Reusable object type: a CTA button + link.
// Embedded by page singletons wherever a primary/secondary CTA appears.

import { defineType, defineField } from 'sanity';
import { linkRule, LINK_TOKEN_HINT } from './_linkRule';

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'string',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal page', value: 'internal' },
          { title: 'External URL', value: 'external' },
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internalLink',
      title: 'Page to link to',
      type: 'reference',
      to: [
        { type: 'homePage' },
        { type: 'aboutPage' }, // scaffold: about
        { type: 'faqPage' }, // scaffold: faq
        { type: 'contactPage' },
        { type: 'journalPage' }, // scaffold: journal
        { type: 'journalEntry' }, // scaffold: journal
        // The sermon archive (2026-10-18): the list page and one sermon.
        { type: 'sermonsPage' },
        { type: 'sermon' },
        { type: 'page' },
      ],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Full URL',
      type: 'url',
      // Church systems placeholders such as {giving} (2026-10-24, docs/agent/church-trac.md).
      description: LINK_TOKEN_HINT,
      validation: linkRule(),
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email address',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value, ctx: any) => {
          if (ctx.parent?.linkType !== 'email') return true;
          if (!value) return 'Email is required';
          return /.+@.+\..+/.test(value) ? true : 'Must be a valid email';
        }),
      hidden: ({ parent }) => parent?.linkType !== 'email',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone number',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'phone',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { label: 'label', linkType: 'linkType' },
    prepare: ({ label, linkType }) => ({ title: label || '(no label)', subtitle: linkType }),
  },
});
