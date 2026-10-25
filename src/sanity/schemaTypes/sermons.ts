// Safe to edit by hand
// =============================================================================
// Sermons: the sermon archive, sermon series and the Sermons page (FBC Auburn, 2026-10-18)
// =============================================================================
// The pastor keeps these himself, so every field says what it is for in plain
// words. Things the website can work out are NOT fields (rule 15): the book of
// the Bible and the BibleGateway link come from the passage, a series' dates
// and order come from its sermons, the podcast comes from the sermons with
// audio. Logic: src/lib/sermons.ts. Pages: src/pages/sermons/.
//
// The dataset is PUBLIC: everything typed here can be read by anyone.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { previewDate, previewSubtitle } from '../../lib/studio-icons';
import { MicrophoneIcon } from '@sanity/icons/Microphone';
import { StackIcon } from '@sanity/icons/Stack';
import { PlayIcon } from '@sanity/icons/Play';
import {
  BIBLE_BOOK_NAMES,
  BIBLE_VERSIONS,
  SERVICES,
  bookOf,
  sermonSunday,
} from '../../lib/sermons';
import { additionalSectionsField } from './sections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import { imageWithAlt } from './_imageWithAlt';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

// ── Sermon ───────────────────────────────────────────────────────────────────
export const sermon = defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  icon: MicrophoneIcon,
  groups: [
    { name: 'main', title: 'The sermon', default: true },
    { name: 'media', title: 'Video, audio and notes' },
    PUBLISH_AT_GROUP,
  ],
  // A new sermon is dated the Sunday just gone (today on a Sunday) and,
  // when someone on the people list has "Pastor" in their role, preached by him.
  initialValue: async (_params, { getClient }) => {
    const base = { date: sermonSunday(new Date()), service: 'sunday-morning' };
    try {
      const pastorId: string | null = await getClient({ apiVersion: '2024-01-01' }).fetch(
        `*[_type == "person" && !(_id in path("drafts.**")) && role match "pastor" && !(role match "associate") && !(role match "youth")] | order(order asc, name asc)[0]._id`,
      );
      return pastorId ? { ...base, preacher: { _type: 'reference', _ref: pastorId } } : base;
    } catch {
      return base;
    }
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Sermon title',
      type: 'string',
      group: 'main',
      validation: (R) => R.required().max(120),
    }),
    defineField({
      name: 'date',
      title: 'Date preached',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'MMMM D, YYYY' },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'service',
      title: 'Which service',
      type: 'string',
      group: 'main',
      options: { list: SERVICES.map((s) => ({ ...s })), layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'passage',
      title: 'Bible passage',
      type: 'string',
      group: 'main',
      description:
        'Like "John 3:1-21" or "Psalm 23". The website works out the book for the filters and adds a link to read the passage.',
      validation: (R) =>
        R.custom((value) =>
          !value || bookOf(value)
            ? true
            : 'The website does not recognise the book here, so this sermon will not show under a book in the filters. Check the spelling, like "1 John 4:7".',
        ).warning(),
    }),
    defineField({
      name: 'preacher',
      title: 'Preacher',
      type: 'reference',
      group: 'main',
      to: [{ type: 'person' }],
      description:
        'Pick from the people list. For a visiting preacher, leave this and type the name below.',
    }),
    defineField({
      name: 'guestPreacher',
      title: 'Visiting preacher (name)',
      type: 'string',
      group: 'main',
      description: 'Only when the preacher is not on the people list.',
      hidden: ({ document }) => Boolean((document?.preacher as { _ref?: string })?._ref),
    }),
    defineField({
      name: 'series',
      title: 'Sermon series (optional)',
      type: 'reference',
      group: 'main',
      to: [{ type: 'sermonSeries' }],
      description: 'Leave empty for a one-off sermon.',
    }),
    defineField({
      name: 'summary',
      title: 'A sentence or two about it (optional)',
      type: 'text',
      rows: 3,
      group: 'main',
      description:
        'Shown under the title, in Google and in the podcast. About 160 characters reads well.',
      validation: (R) => R.max(400).warning('Shorter reads better: about 160 characters.'),
    }),
    defineField({
      name: 'slug',
      title: 'Web address ending',
      type: 'slug',
      group: 'main',
      description:
        'Press Generate to make it from the title. The sermon lives at /sermons/ followed by this. Leave it alone once published, so shared links keep working.',
      options: {
        source: (doc) =>
          `${(doc as { title?: string }).title ?? ''} ${(doc as { date?: string }).date?.slice(0, 4) ?? ''}`,
        maxLength: 96,
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link (YouTube or Facebook)',
      type: 'url',
      group: 'media',
      description:
        'Copy the address of the video and paste it here. A YouTube video plays right on the page; a Facebook video opens on Facebook.',
      validation: (R) => R.uri({ scheme: ['http', 'https'] }),
    }),
    // The length people see in the sermon list and the podcast (audit 2026-10-25). Typed, because
    // a Facebook or YouTube video's length cannot be read at build time without a key.
    defineField({
      name: 'minutes',
      title: 'Length in minutes (optional)',
      type: 'number',
      group: 'media',
      description: 'About how long the sermon is, like 32. It shows in the list of sermons.',
      validation: (R) => R.min(1).max(240).integer(),
    }),
    defineField({
      name: 'audio',
      title: 'Audio recording (optional)',
      type: 'file',
      group: 'media',
      options: { accept: 'audio/*' },
      description:
        'An MP3 of the sermon. It plays on the page, and sermons with audio go into the podcast (Apple Podcasts and Spotify).',
    }),
    defineField({
      name: 'notes',
      title: 'Notes or outline (optional)',
      type: 'file',
      group: 'media',
      options: { accept: '.pdf,.doc,.docx' },
      description: 'A PDF or Word file people can download from the sermon page.',
    }),
    // Alt text everywhere (2026-10-18): the picture now carries a required description, and
    // the Checkup asks for one (it left altExemptFields in kit.config.ts).
    imageWithAlt({
      name: 'picture',
      title: 'Picture (optional)',
      group: 'media',
      description: 'A wide picture for this sermon. Leave empty to use the series picture.',
    }),
    // Free-tier scheduled publishing; see ./_publishAt.ts.
    publishAtField(),
  ],
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Oldest first', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      series: 'series.title',
      passage: 'passage',
      media: 'picture',
      seriesArt: 'series.art',
    },
    prepare: ({ title, date, series, passage, media, seriesArt }) => ({
      title: title || 'New sermon',
      // "Sunday, November 9, 2026 · John 3:16-21" (the series when there is no passage).
      subtitle: previewSubtitle(previewDate(date) || 'No date yet', passage || series),
      // Its own picture, else the series art, else the type's icon on a tile (card 119).
      media: media?.asset ? media : seriesArt?.asset ? seriesArt : undefined,
    }),
  },
});

// ── Sermon series ────────────────────────────────────────────────────────────
// Ordered on the site by its first sermon's date (derived), so there is no date to type here.
export const sermonSeries = defineType({
  name: 'sermonSeries',
  title: 'Sermon series',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Series title',
      type: 'string',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Web address ending',
      type: 'slug',
      description: 'Press Generate. The series lives at /sermons/series/ followed by this.',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    imageWithAlt({
      name: 'art',
      title: 'Series picture',
      description:
        'A wide picture, about 1600 by 900. Sermons in the series without their own picture use it.',
    }),
    defineField({
      name: 'book',
      title: 'Book of the Bible (optional)',
      type: 'string',
      description: 'For a series through one book. Leave empty for a topical series.',
      options: { list: BIBLE_BOOK_NAMES.map((b) => ({ title: b, value: b })) },
    }),
    defineField({
      name: 'description',
      title: 'What the series is about',
      type: 'text',
      rows: 3,
      validation: (R) => R.max(500).warning('Shorter reads better.'),
    }),
  ],
  preview: {
    select: { title: 'title', book: 'book', media: 'art' },
    prepare: ({ title, book, media }) => ({
      title: title || 'New series',
      subtitle: book ? `Series · ${book}` : 'Series',
      media: media?.asset ? media : undefined,
    }),
  },
});

// ── The Sermons page (singleton) ─────────────────────────────────────────────
// The words at the top of /sermons/, the podcast's name and picture, and the
// translation the passage links open in. Being a document is also what puts
// "Sermons" in the menu's page picker (navLink.ts).
export const sermonsPage = defineType({
  name: 'sermonsPage',
  title: 'Sermons page',
  type: 'document',
  icon: PlayIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page', default: true },
    { name: 'podcast', title: 'Podcast' },
    { name: 'seo', title: 'Google and sharing' },
    { name: 'extra', title: 'Extra sections' },
  ],
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Sunday by Sunday',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Sermons',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
      initialValue: 'Catch up on a Sunday you missed, or listen again.',
    }),
    defineField({
      name: 'bibleVersion',
      title: 'Bible translation for the passage links',
      type: 'string',
      group: 'hero',
      description:
        'Which translation opens when someone clicks a Bible passage. Leave empty for BibleGateway’s own choice.',
      options: { list: BIBLE_VERSIONS.map((v) => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'podcastTitle',
      title: 'Podcast name',
      type: 'string',
      group: 'podcast',
      description: 'Leave empty for "First Baptist Church of Auburn Sermons".',
    }),
    defineField({
      name: 'podcastDescription',
      title: 'Podcast description',
      type: 'text',
      rows: 3,
      group: 'podcast',
      description: 'A few sentences Apple Podcasts and Spotify show under the name.',
    }),
    defineField({
      name: 'podcastCategory',
      title: 'Podcast category',
      type: 'string',
      group: 'podcast',
      description: 'Under "Religion & Spirituality" in Apple Podcasts.',
      initialValue: 'Christianity',
      options: {
        list: ['Christianity', 'Religion', 'Spirituality'].map((v) => ({ title: v, value: v })),
        layout: 'radio',
      },
    }),
    imageWithAlt({
      name: 'podcastArtwork',
      title: 'Podcast picture',
      group: 'podcast',
      description:
        'A SQUARE picture, at least 1400 by 1400 pixels (3000 by 3000 is best). Leave empty to use the sharing picture from Site settings, cropped square.',
      altRequired: false,
    }),
    defineField({
      name: 'applePodcastsUrl',
      title: 'Link to the podcast on Apple Podcasts (after it is approved)',
      type: 'url',
      group: 'podcast',
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Link to the podcast on Spotify (after it is approved)',
      type: 'url',
      group: 'podcast',
    }),
    defineField({
      name: 'seoTitle',
      title: 'Title in Google',
      type: 'string',
      group: 'seo',
      validation: (R) => R.max(60).warning('Titles longer than about 60 characters get cut off.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Description in Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (R) =>
        R.max(160).warning('Descriptions longer than about 160 characters get cut off.'),
    }),
    imageWithAlt({
      name: 'seoImage',
      title: 'Sharing picture (this page)',
      group: 'seo',
      altRequired: false,
    }),
    defineField({ ...additionalSectionsField, ...pageBuilderAuthoring }),
  ],
  preview: { prepare: () => ({ title: 'Sermons page' }) },
});

export const sermonSchemas = [sermon, sermonSeries, sermonsPage];
