// scaffold-file: journal
// Journal category taxonomy. Lightweight — a category is just a name + slug
// + optional description. Posts can have multiple categories; the first one
// shows on the card.
//
// PLACEHOLDER CATEGORIES. Replace these with the ones this project publishes
// under; they are here to show the shape, not to be shipped:
//   Category One · Category Two · Behind the Scenes · Q&A · Announcements
//
// Editors create new categories as they need them. The journal index page
// renders category chips automatically based on what's been used.

import { defineType, defineField } from 'sanity';

export const journalCategory = defineType({
  name: 'journalCategory',
  title: 'Post category',
  type: 'document',
  // Taxonomy, not content — exclude from Canvas's free-form writing UI.
  options: { canvasApp: { exclude: true } },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Display name. Examples: "Church news", "Sermon notes".',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'slug',
      title: 'Web address ending',
      type: 'slug',
      description: 'Made from the title when you press Generate. Set it once and leave it.',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description:
        'Optional. One line on what this category covers. Shows when someone points at the category label.',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
});
