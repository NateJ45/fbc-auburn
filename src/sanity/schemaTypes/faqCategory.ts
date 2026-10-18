// scaffold-file: faq
// Question group document (shown to editors as "Question group"). Lets editors define FAQ groupings as real content
// instead of hardcoded string options. Each faqItem can reference a category
// here via categoryRef; the frontend coalesces categoryRef->title with the
// legacy category string so both old and new data render correctly.
// Registered in index.ts and surfaced under Content in structure.ts.

import { defineType, defineField } from 'sanity';

export const faqCategory = defineType({
  name: 'faqCategory',
  title: 'Question group',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Group heading',
      type: 'string',
      description:
        'The heading shown above this group of questions on the Questions page. Example: "Your first Sunday".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address ending (optional)',
      type: 'slug',
      description:
        'Optional. Only needed if you ever want to link straight to this group. Press Generate to make one from the heading.',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description:
        'Lower numbers appear first on the Questions page. Leave blank to sort alphabetically.',
    }),
  ],
  preview: {
    select: { title: 'title', order: 'displayOrder' },
    prepare: ({ title, order }) => ({
      title: title ?? '(no title)',
      subtitle: order != null ? `Order: ${order}` : undefined,
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'title', direction: 'asc' },
      ],
    },
  ],
});
