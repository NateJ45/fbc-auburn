// scaffold-file: journal
// A News and notes post (the code name is "journal"): church news, sermon
// notes, stories, event write-ups. The body field accepts rich Portable Text
// plus five custom blocks (pullQuote, tipCallout, imageGallery, divider,
// videoEmbed) that the JournalPortableText renderer styles to brand.
// FBC Auburn (2026-10-18): the starter's beforeAfter and sourceCard blocks and
// the "Sourced from" annotation (interior-design leftovers) were removed from
// the schema; no post used them. The renderer still knows them, harmlessly.
//
// Editor experience: groups split fields into Meta / Content / SEO / Related so
// the form isn't a wall. The body field is the only one the editor touches for the
// actual post copy; everything else is metadata.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { imageMember, imageWithAlt } from './_imageWithAlt';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const journalEntry = defineType({
  name: 'journalEntry',
  title: 'Post',
  type: 'document',
  groups: [
    { name: 'meta', title: 'About this post' },
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'Google and sharing' },
    { name: 'related', title: 'Related' },
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // ---------- Meta ----------
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'The post title. Aim for under 70 characters so it reads as a single line on cards and in search.',
      group: 'meta',
      options: {
        canvasApp: {
          purpose:
            'Blog post headline, under 70 chars. Voice: warm, plain-spoken, specific. Prefer concrete details over vague category labels.',
        },
      },
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Web address ending',
      type: 'slug',
      description:
        "The end of the post's web address, made from the title when you press Generate. The post lives at /journal/ followed by this. Set it before you publish, and leave it alone afterwards.",
      options: { source: 'title', maxLength: 96 },
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description:
        "One or two sentences shown on the post's card in News and notes, and in Google. About 160 characters reads well.",
      rows: 3,
      group: 'meta',
      options: {
        canvasApp: {
          purpose:
            'One or two sentences shown on the post card and in Google (about 160 characters). Voice: warm, plain-spoken, slightly informal. Specific beats generic.',
        },
      },
      validation: (Rule) => Rule.required().max(220),
    }),
    imageWithAlt({
      name: 'coverImage',
      title: 'Cover image',
      description: 'Shows large at the top of the post and as the card picture in News and notes.',
      group: 'meta',
      fields: [
        defineField({
          name: 'caption',
          title: 'Caption (optional)',
          type: 'string',
          description: 'Italic line under the cover image, such as where or when it was taken.',
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description:
        'One or more categories. The first one shows on the card; all show on the post page.',
      group: 'meta',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'journalCategory' }] })],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description:
        'Who wrote it, shown under the title. Example: "Pastor Jacob". Leave blank for no byline.',
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description:
        'The date shown on the post, and the order posts are listed in. It does not hold a post back: Publish still makes it public straight away.',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      description:
        'Optional. Set this when you make a big change to a post, so Google sees the new date.',
      group: 'meta',
    }),
    defineField({
      name: 'featured',
      title: 'Featured (pin to top)',
      type: 'boolean',
      description: 'If checked, this post appears first in News and notes whatever its date.',
      group: 'meta',
      initialValue: false,
    }),

    // ---------- Content (the body) ----------
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description:
        'The post itself. Use headings to break it up; the extra blocks (pull quote, tip, gallery, divider, video) are in the "insert" menu.',
      group: 'content',
      options: {
        canvasApp: {
          purpose:
            "Church news post body. Voice: warm, plain-spoken, slightly informal, like a friend from church, not a brochure. Stop when done; don't tack on summary sentences. Be specific over general.",
        },
      },
      validation: (Rule) => Rule.required().min(1),
      of: [
        // Standard Portable Text block — paragraphs, headings, lists, marks
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Lead (large intro)', value: 'lead' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Highlight', value: 'highlight' },
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

        // Inline image (single, with caption)
        imageMember({
          name: 'inlineImage',
          title: 'Image',
          preview: { select: { title: 'caption', subtitle: 'alt', media: 'asset' } },
          fields: [
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              description: 'How wide to render. Default is "wide" (full content width).',
              options: {
                list: [
                  { title: 'Standard (column width)', value: 'standard' },
                  { title: 'Wide (full content)', value: 'wide' },
                  { title: 'Full-bleed (edge to edge)', value: 'full' },
                ],
                layout: 'radio',
              },
              initialValue: 'wide',
            }),
          ],
        }),

        // Pull quote: a line pulled out large
        defineArrayMember({
          type: 'object',
          name: 'pullQuote',
          title: 'Pull quote',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required().max(280),
            }),
            defineField({
              name: 'attribution',
              title: 'Attribution',
              type: 'string',
              description:
                'Optional. Who said it, or the Bible reference. Skip for a line from the post itself.',
            }),
          ],
          preview: {
            select: { quote: 'quote', attribution: 'attribution' },
            prepare: ({ quote, attribution }) => ({
              title: quote
                ? quote.length > 60
                  ? quote.slice(0, 60) + '…'
                  : quote
                : '(empty quote)',
              subtitle: attribution || 'Pull quote',
            }),
          },
        }),

        // Tip callout: a labeled aside ("Worth knowing", "Please note", etc.)
        defineArrayMember({
          type: 'object',
          name: 'tipCallout',
          title: 'Tip callout',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description:
                'Short label on the callout. Examples: "Worth knowing", "Please note", "Bring with you".',
              initialValue: 'Worth knowing',
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              description: 'The body of the callout. Supports bold/italic + links.',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{ title: 'Paragraph', value: 'normal' }],
                  lists: [{ title: 'Bullet', value: 'bullet' }],
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
          ],
          preview: {
            select: { label: 'label', content: 'content' },
            prepare: ({ label, content }) => {
              const first = Array.isArray(content) ? content[0] : null;
              const text =
                first?.children
                  ?.map((c: any) => c?.text ?? '')
                  .join(' ')
                  .trim() ?? '';
              return { title: label ?? 'Tip', subtitle: text.slice(0, 60) };
            },
          },
        }),

        // Image gallery — a row/grid of images
        defineArrayMember({
          type: 'object',
          name: 'imageGallery',
          title: 'Image gallery',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                imageMember({
                  fields: [defineField({ name: 'caption', title: 'Caption', type: 'string' })],
                }),
              ],
              validation: (Rule) => Rule.required().min(2),
            }),
            defineField({
              name: 'layout',
              title: 'Layout',
              type: 'string',
              description: 'How to arrange the images.',
              options: {
                list: [
                  { title: 'Grid (2-column)', value: 'grid2' },
                  { title: 'Grid (3-column)', value: 'grid3' },
                  { title: 'Row (horizontal scroll on mobile)', value: 'row' },
                ],
                layout: 'radio',
              },
              initialValue: 'grid2',
            }),
            defineField({
              name: 'caption',
              title: 'Gallery caption',
              type: 'string',
              description: 'Optional. Single caption that covers the whole gallery.',
            }),
          ],
          preview: {
            select: { images: 'images', caption: 'caption' },
            prepare: ({ images, caption }) => ({
              title: caption ?? `Image gallery (${images?.length ?? 0} images)`,
              media: images?.[0],
            }),
          },
        }),

        // Divider — visual section break
        defineArrayMember({
          type: 'object',
          name: 'divider',
          title: 'Divider',
          fields: [
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Line', value: 'line' },
                  { title: 'Ornament (✺ ✺ ✺)', value: 'ornament' },
                  { title: 'Space only', value: 'space' },
                ],
                layout: 'radio',
              },
              initialValue: 'ornament',
            }),
          ],
          preview: { prepare: () => ({ title: 'Divider' }) },
        }),

        // Video embed (YouTube/Vimeo URL)
        defineArrayMember({
          type: 'object',
          name: 'videoEmbed',
          title: 'Video embed',
          fields: [
            defineField({
              name: 'url',
              title: 'Video URL',
              type: 'url',
              description: 'YouTube or Vimeo URL. The frontend renders a responsive embed.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: { url: 'url', caption: 'caption' },
            prepare: ({ url, caption }) => ({ title: caption ?? '(video)', subtitle: url }),
          },
        }),
      ],
    }),

    // ---------- SEO (per-post overrides) ----------
    defineField({
      name: 'seoTitle',
      title: 'Google title',
      type: 'string',
      description:
        'Browser tab and Google result title. Aim for 50 to 60 characters. Optional: leave blank to use the post title.',
      group: 'seo',
      options: {
        canvasApp: {
          purpose:
            'Optional override for the HTML <title> tag. 50-60 chars. Start with the topic. No marketing puffery.',
        },
      },
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
      description:
        'The sentence under the title in Google results. Aim for 150 to 160 characters. Optional: leave blank to use the excerpt.',
      group: 'seo',
      options: {
        canvasApp: {
          purpose:
            "Optional override for the meta description. 150-160 chars. Written for a human about to click, not for a search engine. Don't restate the title.",
        },
      },
      validation: (Rule) =>
        Rule.max(160).warning(
          'Descriptions longer than about 160 characters get cut off in Google search results.',
        ),
    }),

    // ---------- Related ----------
    defineField({
      name: 'relatedPosts',
      title: 'Related posts',
      type: 'array',
      description:
        'Optional. Up to three other posts to show at the bottom of this one. If empty, the site picks the newest posts in the same category.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'journalEntry' }] })],
      validation: (Rule) => Rule.max(3),
      group: 'related',
    }),
    // Free-tier scheduled publishing; see ./_publishAt.ts.
    publishAtField(),
  ],
  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      featured: 'featured',
      media: 'coverImage',
    },
    prepare: ({ title, publishedAt, featured, media }) => ({
      title: title ?? 'Untitled post',
      subtitle: `${featured ? '★ ' : ''}${publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`,
      media,
    }),
  },
  orderings: [
    {
      title: 'Newest first (with featured pinned)',
      name: 'featuredThenDate',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      title: 'Newest first',
      name: 'dateDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
