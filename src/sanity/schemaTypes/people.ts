// Safe to edit by hand
// =============================================================================
// People: the church's people list and its groups (FBC Auburn, 2026-10-18)
// =============================================================================
// One person, written once, shown wherever a "People" section asks for their
// group (or for them by name), and picked as a sermon's preacher. Groups are
// documents, not a fixed dropdown, so the pastor can add "Choir" or rename
// "Volunteers" himself; the Studio's People list offers to add the usual five
// (Staff, Deacons, Teachers, Missionaries, Volunteers) when there are none.
//
// THE DATASET IS PUBLIC. Anything typed here can be read by anyone who knows
// how, whether or not the website shows it. The email and location fields say
// so in their descriptions.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { UserIcon } from '@sanity/icons/User';
import { UsersIcon } from '@sanity/icons/Users';
import { imageWithAlt } from './_imageWithAlt';

export const personGroup = defineType({
  name: 'personGroup',
  title: 'People group',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Group name',
      type: 'string',
      description: 'Like Staff, Deacons, Teachers, Missionaries or Volunteers.',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'order',
      title: 'Position',
      type: 'number',
      description: 'Groups show in this order on a page that lists several: 1 first.',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare: ({ title, order }) => ({
      title: title || 'New group',
      subtitle: typeof order === 'number' ? `Position ${order}` : '',
    }),
  },
});

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'As the church knows them, like "Pastor Jacob Smith" or "Mary Jones".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description:
        'Like Pastor, Deacon, Sunday School teacher or Missionary. A person whose role says "Pastor" is filled in as the preacher on a new sermon.',
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'reference',
      to: [{ type: 'personGroup' }],
      description: 'Which list they appear in on the website.',
    }),
    imageWithAlt({
      name: 'photo',
      title: 'Photo',
      description:
        'A friendly head-and-shoulders photo. After uploading, click the photo and drag the circle onto their face so it crops well.',
    }),
    defineField({
      name: 'bio',
      title: 'A few sentences about them (optional)',
      type: 'text',
      rows: 4,
      validation: (R) => R.max(600).warning('Shorter reads better on a card.'),
    }),
    defineField({
      name: 'email',
      title: 'Email (optional)',
      type: 'string',
      description:
        'Shown on the website only when the box below is checked. Even unchecked, this is not secret: the church’s content is public, so only type an address that is fine to be public.',
      validation: (R) =>
        R.custom((v) =>
          !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string)
            ? true
            : 'That does not look like an email address.',
        ),
    }),
    defineField({
      name: 'showEmail',
      title: 'Show the email on the website',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      title: 'Where they serve (optional, for missionaries)',
      type: 'string',
      description:
        'Like "Lima, Peru". The church’s content is public, so for anyone serving where that could put them at risk, leave this empty.',
    }),
    defineField({
      name: 'keepLocationPrivate',
      title: 'Keep the location off the website',
      type: 'boolean',
      initialValue: true,
      description: 'Checked, the website never shows where they serve. Uncheck to show it.',
      hidden: ({ document }) => !document?.location,
    }),
    defineField({
      name: 'order',
      title: 'Position in their group',
      type: 'number',
      description: '1 first. Leave empty and they are listed by name after the numbered ones.',
    }),
  ],
  orderings: [
    { title: 'Name', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
    {
      title: 'Group, then position',
      name: 'groupOrder',
      by: [
        { field: 'group.order', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'name', role: 'role', group: 'group.title', media: 'photo' },
    prepare: ({ title, role, group, media }) => ({
      title: title || 'New person',
      subtitle: [role, group].filter(Boolean).join(' · '),
      media: media?.asset ? media : undefined,
    }),
  },
});

export const peopleSchemas = [personGroup, person];
