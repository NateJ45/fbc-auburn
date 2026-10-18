// Safe to edit by hand
// =============================================================================
// Downloads: bulletins, newsletters, forms and policies (FBC Auburn, 2026-10-18)
// =============================================================================
// One file each, with a date and a category. A "Downloads list" section shows
// the newest of a category; "This week's bulletin" is simply the newest
// Bulletin, worked out at build time (src/lib/sermons.ts, newestBulletin), so
// there is nothing to switch over each week: upload the new one and publish.
// An expiry date takes a file down by itself (the site rebuilds every morning).
//
// THE DATASET IS PUBLIC, and so is every uploaded file: a bulletin with a
// prayer list or phone numbers is public the moment it is uploaded.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { DownloadIcon } from '@sanity/icons/Download';
import { DOWNLOAD_CATEGORIES, categoryTitle, churchToday, longDate } from '../../lib/sermons';

export const download = defineType({
  name: 'download',
  title: 'Download',
  type: 'document',
  icon: DownloadIcon,
  initialValue: () => ({ date: churchToday(new Date()), category: 'bulletin' }),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'What people see, like "Bulletin for October 12" or "Camp sign-up form".',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'category',
      title: 'Kind',
      type: 'string',
      options: {
        list: DOWNLOAD_CATEGORIES.map((c) => ({ ...c })),
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'The newest date shows first. For a bulletin, the Sunday it is for.',
      options: { dateFormat: 'MMMM D, YYYY' },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description:
        'A PDF is best: it opens on every phone. Anything uploaded here is public, so leave out phone numbers and prayer requests that are not meant for everyone.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'note',
      title: 'Short note (optional)',
      type: 'string',
      description: 'A few words under the title, like "Due back by June 1".',
    }),
    defineField({
      name: 'expires',
      title: 'Take it down after (optional)',
      type: 'date',
      description:
        'The last day it shows. The website drops it the next morning. Leave empty to keep it up.',
      options: { dateFormat: 'MMMM D, YYYY' },
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', category: 'category', date: 'date', expires: 'expires' },
    prepare: ({ title, category, date, expires }) => ({
      title: title || 'New download',
      subtitle: [
        categoryTitle(category),
        longDate(date),
        expires && expires < churchToday(new Date()) ? 'taken down' : '',
      ]
        .filter(Boolean)
        .join(' · '),
      media: DownloadIcon,
    }),
  },
});
