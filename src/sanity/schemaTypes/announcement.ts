// Foundation, edit with care
// Site-wide announcement banner collection.
//
// Editors can queue several notices ahead of time (a sale, a closure, a
// seasonal promotion) and let them switch on and off by date. The active
// announcement shows at the top of every page above the header. BaseLayout
// picks the most urgent entry that is currently within its date window.
//
// "Active" = enabled AND (no startDate or startDate has passed) AND
//            (no endDate or endDate is still in the future).
//
// Build-time note: date-window logic is evaluated at BUILD TIME. This is a
// static site -- a banner only appears or disappears after a rebuild. Set up a
// Cloudflare deploy hook on a daily schedule (docs/agent/deployment.md) if you
// need banners to auto-expire without a manual publish.
//
// Style tokens map to existing semantic color tokens -- no new tokens are
// introduced here:
//   info      -> bg-muted (calm, informational)
//   highlight -> bg-primary / text-primary-foreground (brand accent, good news)
//   urgent    -> bg-destructive / text-destructive-foreground (red, closures)

import { defineType, defineField } from 'sanity';
import { previewDate, previewSubtitle } from '../../lib/studio-icons';
import { BellIcon } from '@sanity/icons/Bell';
import { publishAtField } from './_publishAt';

export const announcement = defineType({
  name: 'announcement',
  title: 'Notice',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal name',
      type: 'string',
      description:
        'For your reference in the Studio only. Not shown on the site. Example: "Christmas service times".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'string',
      description:
        'The text shown in the banner. Keep it short (under 160 characters). Example: "No Wednesday Bible study this week. See you Sunday."',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      description:
        'Info = calm muted background (neutral updates). Highlight = brand primary (good news, promotions). Urgent = red (closures, important warnings).',
      options: {
        list: [
          { title: 'Info (neutral, muted background)', value: 'info' },
          { title: 'Highlight (brand primary, good news)', value: 'highlight' },
          { title: 'Urgent (red, closures or warnings)', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'link',
      title: 'Link (optional)',
      type: 'object',
      description: 'Optional. Adds a clickable link at the end of the message.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'label',
          title: 'Link label',
          type: 'string',
          description: 'The clickable text. Example: "See our holiday schedule".',
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'string',
          description: 'A page on this site like /contact, or a full https:// address.',
        }),
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Show from (optional)',
      type: 'datetime',
      description:
        'Leave blank to show as soon as it is switched on. Set a date to put the notice up ahead of time. The website checks the dates when it updates (after each publish and every morning), so it can be a few hours out.',
    }),
    defineField({
      name: 'endDate',
      title: 'Hide after (optional)',
      type: 'datetime',
      description:
        'Leave blank to keep showing until you switch it off. Set a date and the notice takes itself down when the website next updates after that date.',
    }),
    defineField({
      name: 'enabled',
      title: 'Switched on',
      type: 'boolean',
      description: 'The on/off switch. When off, this notice never shows, whatever the dates say.',
      initialValue: true,
    }),
    // Free-tier scheduled publishing; see ./_publishAt.ts. No tab bar on this type, so no group.
    { ...publishAtField(), group: undefined },
  ],
  preview: {
    select: {
      message: 'message',
      style: 'style',
      enabled: 'enabled',
      start: 'startDate',
      end: 'endDate',
    },
    // "Off", "Starts Mon, Nov 3, 2026" or "Shows until Sun, Nov 9, 2026" (card 119).
    prepare: ({ message, style, enabled, start, end }) => {
      const now = new Date().toISOString();
      const when = !enabled
        ? 'Off'
        : start && start > now
          ? `Starts ${previewDate(start)}`
          : end
            ? `Shows until ${previewDate(end)}`
            : 'Showing, no end date';
      return {
        title: message || 'Notice',
        subtitle: previewSubtitle(when, style),
      };
    },
  },
  orderings: [
    { title: 'Soonest to end', name: 'endAsc', by: [{ field: 'endDate', direction: 'asc' }] },
    { title: 'Newest', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
});
