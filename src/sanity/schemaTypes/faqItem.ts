// scaffold-file: faq
// One question and answer. Grouped by question group on the Questions page.
// (`alsoShowOnProcessPage` is hidden: this site has no Process page.)
// U8: categoryRef (reference to faqCategory document) replaces the legacy
// hardcoded category string. The frontend coalesces categoryRef->title with
// the legacy category string so existing data renders without migration.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Question',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'The question as a visitor would ask it.',
      options: {
        canvasApp: {
          purpose:
            'The question as a visitor would actually ask it, in plain words. Example: "Where do I park on Sunday?" not "What parking provision is available for worship services?"',
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description: 'The answer in your voice. Paragraphs, lists, and bold are supported.',
      options: {
        canvasApp: {
          purpose:
            "Plain-English answer. Voice: warm, welcoming, slightly informal, as if the pastor were answering at the door. Lead with the direct answer; expand if needed. Stop when done, don't pad.",
        },
      },
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Sub-heading', value: 'h4' },
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
                  { name: 'href', type: 'url', title: 'URL' },
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
      validation: (Rule) => Rule.required(),
    }),
    // LEGACY — superseded by categoryRef below.
    // Kept hidden + readOnly so existing FAQ items continue to validate.
    // The frontend coalesces categoryRef->title with this field as the fallback.
    // Do not delete; seed data and migrated items still carry these strings.
    defineField({
      name: 'category',
      title: 'Category (legacy)',
      type: 'string',
      description: 'Legacy hardcoded category. Use categoryRef for new items.',
      options: {
        list: [
          // The starter's old fixed groups. Hidden and read-only; never shown.
          { title: 'Pricing & Cost', value: 'Pricing & Cost' },
          { title: 'The Process', value: 'The Process' },
          { title: 'Logistics', value: 'Logistics' },
          { title: 'Service Area', value: 'Service Area' },
          { title: 'Getting Started', value: 'Getting Started' },
        ],
      },
      hidden: true,
      readOnly: true,
    }),
    // New: reference to a faqCategory document. Optional — existing items that
    // only carry the legacy category string still display correctly via coalesce.
    defineField({
      name: 'categoryRef',
      title: 'Question group',
      type: 'reference',
      to: [{ type: 'faqCategory' }],
      description:
        'Which group this question belongs in, such as "Your first Sunday". Pick from the Question groups list.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers show first within the group.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'alsoShowOnProcessPage',
      title: 'Also show on Process page',
      type: 'boolean',
      // This site has no Process page (removed at fork time).
      hidden: true,
      description:
        'If checked, this question also appears in the FAQ block at the bottom of the Process page.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      question: 'question',
      category: 'category',
      categoryRefTitle: 'categoryRef.title',
      displayOrder: 'displayOrder',
    },
    prepare: ({ question, category, categoryRefTitle, displayOrder }) => ({
      title: question ?? '(no question)',
      subtitle: `${categoryRefTitle ?? category ?? '?'} · #${displayOrder ?? '?'}`,
    }),
  },
  orderings: [
    {
      title: 'Group, then order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
  ],
});
