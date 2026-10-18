// Foundation, edit with care
// The church's facts, held ONCE on the Site settings document (group "Church
// facts") and derived everywhere else through src/lib/church-facts.ts:
// address, service times, the phone and email confirmations, founding year, the
// YouTube channel, the Church Trac calendar feed, and the giving and live stream
// links. Kept in its own file and spread into
// siteSettings.ts so the shared settings schema carries a one-line change.
//
// THE `confirmed` FLAGS (schema convention, PORTS.md card 66). Every fact here
// that did not come from the church in writing starts unconfirmed, and the
// site shows a small "To confirm" tag beside it (src/components/church/
// NotConfirmed.astro) until someone ticks the box. Unconfirmed facts are also
// kept out of structured data, so search engines are never told a guess.
//
// RULE 15. Nothing computable is stored: the next Sunday's date, the "This
// Sunday" line, the public calendar link and the map link are all worked out
// at build time from these inputs.
//
// RULE 8b. `day` is a dropdown that drives logic, and `time`,
// `youtubeChannelId`, `churchTracIcalUrl`, `givingUrl` and `liveStreamUrl` are
// parsed, fetched or put in hrefs, so all six are in NON_STEGA_FIELDS
// (src/lib/cms-preview.ts). `lat` and `lng` are numbers, which stega leaves alone.

import { defineArrayMember, defineField } from 'sanity';
import { ClockIcon } from '@sanity/icons/Clock';

/** The standard unconfirmed flag, with a description naming what it covers. */
const confirmedField = (name: string, what: string) =>
  defineField({
    name,
    title: 'Confirmed by the church',
    type: 'boolean',
    initialValue: false,
    group: 'church',
    description: `Tick once the church has confirmed ${what}. Until then the site shows a small "To confirm" tag beside it.`,
  });

export const WEEKDAYS = [
  { title: 'Sunday', value: 'sunday' },
  { title: 'Monday', value: 'monday' },
  { title: 'Tuesday', value: 'tuesday' },
  { title: 'Wednesday', value: 'wednesday' },
  { title: 'Thursday', value: 'thursday' },
  { title: 'Friday', value: 'friday' },
  { title: 'Saturday', value: 'saturday' },
] as const;

export const churchFactsFields = [
  defineField({
    name: 'churchAddress',
    title: 'Church address',
    type: 'object',
    group: 'church',
    description:
      'The one place the address is typed. The footer, Plan your visit, the map link and search listings all read it from here.',
    options: { collapsible: false },
    fields: [
      defineField({ name: 'street', title: 'Street', type: 'string' }),
      defineField({ name: 'city', title: 'City', type: 'string' }),
      defineField({
        name: 'state',
        title: 'State (2-letter code)',
        type: 'string',
        validation: (Rule) => Rule.length(2).warning('Use the 2-letter code, like "OH".'),
      }),
      defineField({ name: 'zip', title: 'ZIP code', type: 'string' }),
      defineField({
        name: 'findUs',
        title: 'How to find us (optional)',
        type: 'string',
        description:
          'One short sentence in your own words for someone driving out: which road, what is nearby, where to park. It shows in the footer under the address. Leave empty to hide it.',
        validation: (Rule) => Rule.max(140),
      }),
      defineField({
        name: 'lat',
        title: 'Map pin: latitude (optional)',
        type: 'number',
        description:
          'Only if you want search engines to have the exact spot, like 39.4321. Leave empty and the address alone is used.',
        validation: (Rule) => Rule.min(-90).max(90),
      }),
      defineField({
        name: 'lng',
        title: 'Map pin: longitude (optional)',
        type: 'number',
        description: 'Goes with the latitude above, like -84.5678.',
        validation: (Rule) => Rule.min(-180).max(180),
      }),
      defineField({
        name: 'confirmed',
        title: 'Confirmed by the church',
        type: 'boolean',
        initialValue: false,
        description:
          'Tick once the church has confirmed the address. Until then the site shows a small "To confirm" tag beside it.',
      }),
    ],
  }),
  defineField({
    name: 'serviceTimes',
    title: 'Service times',
    type: 'array',
    group: 'church',
    description:
      'Each regular gathering, one row each. The "This Sunday" line, the "This week" list and Plan your visit are all built from these rows, so change a time here and it changes everywhere on the next publish.',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'serviceTime',
        title: 'Gathering',
        icon: ClockIcon,
        fields: [
          defineField({
            name: 'label',
            title: 'What it is',
            type: 'string',
            description: 'Like "Sunday School for all ages" or "Worship".',
            validation: (Rule) => Rule.required().max(60),
          }),
          defineField({
            name: 'day',
            title: 'Day',
            type: 'string',
            options: { list: [...WEEKDAYS], layout: 'dropdown' },
            initialValue: 'sunday',
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: 'time',
            title: 'Start time',
            type: 'string',
            description: 'On the 24-hour clock, like 09:45, 11:00 or 18:00.',
            validation: (Rule) =>
              Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
                name: '24-hour time like 09:45',
              }),
          }),
          defineField({
            name: 'note',
            title: 'Short note (optional)',
            type: 'string',
            description: 'Like "about an hour". Shown after the time on Plan your visit.',
            validation: (Rule) => Rule.max(60),
          }),
          defineField({
            name: 'confirmed',
            title: 'Confirmed by the church',
            type: 'boolean',
            initialValue: false,
            description:
              'Tick once the church has confirmed this time. Until then the site shows a small "To confirm" tag beside it.',
          }),
        ],
        preview: {
          select: { title: 'label', day: 'day', time: 'time', confirmed: 'confirmed' },
          prepare: ({ title, day, time, confirmed }) => ({
            title: title ?? '(no name)',
            subtitle: `${day ?? '?'} ${time ?? '?'}${confirmed ? '' : ' · to confirm'}`,
          }),
        },
      }),
    ],
  }),
  confirmedField('phoneConfirmed', 'the phone number (Identity & contact)'),
  confirmedField('emailConfirmed', 'the email address (Identity & contact)'),
  defineField({
    name: 'givingUrl',
    title: 'Online giving link',
    type: 'url',
    group: 'church',
    description:
      'The page where people give online (from Church Trac or another giving service). When it is set, every "Give" link goes straight there. Leave empty and Give opens the site’s own page about giving on Sunday or by mail.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'liveStreamUrl',
    title: 'Live stream link',
    type: 'url',
    group: 'church',
    description:
      'Where people watch on Sunday, like the church’s Facebook live videos page. Shown on Watch and in the footer. Leave empty to use the Facebook link from Social links.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'foundedYear',
    title: 'Year founded',
    type: 'number',
    group: 'church',
    description: 'Shown on About as "since {year}".',
    validation: (Rule) => Rule.integer().min(1700).max(2100),
  }),
  confirmedField('foundedConfirmed', 'the founding year'),
  defineField({
    name: 'youtubeChannelId',
    title: 'YouTube channel ID',
    type: 'string',
    group: 'church',
    description:
      'Starts with UC and is 24 characters long (YouTube Studio > Settings > Channel > Advanced settings). The newest video shows on Home and Watch after each publish and every morning. Leave blank until the church has a channel.',
    validation: (Rule) =>
      Rule.regex(/^UC[\w-]{22}$/, { name: 'channel ID starting with UC' }).warning(),
  }),
  defineField({
    name: 'churchTracIcalUrl',
    title: 'Church Trac calendar feed (iCal address)',
    type: 'url',
    group: 'church',
    description:
      'In Church Trac: Calendar > Share > iCal link. The "This week" list reads upcoming events from it every morning. Leave blank to show the service times only.',
    validation: (Rule) => Rule.uri({ scheme: ['https', 'webcal'] }),
  }),
];
