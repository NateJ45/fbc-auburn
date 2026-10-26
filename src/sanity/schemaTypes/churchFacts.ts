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
import { CalendarIcon } from '@sanity/icons/Calendar';
import {
  clockLabel,
  parseFriendlyTime,
  resolveChurchFacts,
  matchGatherings,
  weekdayOf,
  type RawChurchFacts,
  type RawTimeChange,
} from '../../lib/church-facts';
import { ServicePickerInput } from '../components/ServicePickerInput';

/** "What is different" choices (A different Sunday). Kept here so the Quick update job uses them too. */
export const TIME_CHANGE_KINDS = [
  { title: 'A different time', value: 'time' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'An extra service', value: 'extra' },
] as const;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Sunday, November 1" for a YYYY-MM-DD. */
function longDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
}

/** The list line: "Worship at 10:30 am", "Sunday School cancelled", "Extra: Christmas Eve, 6 pm". */
function changeTitle(c: { change?: string; service?: string; time?: string; label?: string }) {
  const who = !c.service || c.service === 'all' ? 'Everything' : c.service;
  if (c.change === 'cancelled') return `${who} cancelled`;
  if (c.change === 'extra') return `Extra: ${c.label || '(no name)'}${c.time ? `, ${c.time}` : ''}`;
  return `${who} at ${c.time || '?'}`;
}

/**
 * A warning when the picked gathering does not meet on that day (a Worship change dated on a
 * Thursday changes nothing on the website), or is no longer in Service times. Null when fine.
 */
function gatheringProblem(service: string, date: unknown, doc: unknown): string | null {
  const facts = resolveChurchFacts((doc ?? {}) as RawChurchFacts);
  const any = matchGatherings(service, facts.serviceTimes);
  if (any.length === 0) {
    return 'This gathering is no longer in Service times, so this change does nothing. Pick another.';
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const wd = weekdayOf(date);
  if (!any.some((s) => s.dayIndex === wd)) {
    const usual = DAY_NAMES[any[0].dayIndex];
    return `${any[0].label} meets on ${usual}s, but this day is a ${DAY_NAMES[wd]}, so nothing changes. For a service on another day, choose "An extra service".`;
  }
  return null;
}

/** The standard unconfirmed flag, with a description naming what it covers. */
const confirmedField = (name: string, what: string) =>
  defineField({
    name,
    title: 'Confirmed by the church',
    type: 'boolean',
    initialValue: false,
    group: 'church',
    description: `Check once the church has confirmed ${what}. Until then the site shows a small "To confirm" tag beside it.`,
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
          'Check once the church has confirmed the address. Until then the site shows a small "To confirm" tag beside it.',
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
              'Check once the church has confirmed this time. Until then the site shows a small "To confirm" tag beside it.',
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
  // A different Sunday (2026-10-26, docs/agent/church-data.md): dated changes to the times above
  // that undo themselves. Applied by dayPlan() in src/lib/church-facts.ts; nothing is retyped.
  defineField({
    name: 'timeChanges',
    title: 'A different Sunday',
    type: 'array',
    group: 'church',
    description:
      'For one day only: a different time, something cancelled, or an extra service (like Christmas Eve). The This Sunday card, the times across the website, This week, the calendar files and Google all show it on that day, and the usual times come back by themselves the day after. You never have to change the times above. Live in about two minutes after you publish.',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'timeChange',
        title: 'Change',
        icon: CalendarIcon,
        fields: [
          defineField({
            name: 'date',
            title: 'Which day',
            type: 'date',
            options: { dateFormat: 'dddd, MMMM D, YYYY' },
            description: 'The day it is different. Usually a Sunday.',
            validation: (Rule) =>
              Rule.required()
                .custom((value) => {
                  if (typeof value !== 'string') return true;
                  const today = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'America/New_York',
                  }).format(new Date());
                  return value >= today
                    ? true
                    : 'This day has passed, so the website ignores this change. You can remove it.';
                })
                .warning(),
          }),
          defineField({
            name: 'change',
            title: 'What is different',
            type: 'string',
            options: {
              list: [...TIME_CHANGE_KINDS],
              layout: 'radio',
            },
            initialValue: 'time',
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: 'service',
            title: 'Which gathering',
            type: 'string',
            description: 'Pick from your service times above.',
            components: { input: ServicePickerInput },
            hidden: ({ parent }) => parent?.change === 'extra',
            validation: (Rule) =>
              Rule.custom((value, context) => {
                const parent = context.parent as RawTimeChange | undefined;
                if (!parent || parent.change === 'extra') return true;
                if (!value) return 'Pick which gathering this is about.';
                if (value === 'all') {
                  return parent.change === 'time'
                    ? 'A new time needs one gathering. Pick it, or add a change for each one.'
                    : true;
                }
                return gatheringProblem(value, parent.date, context.document) ?? true;
              }).warning(),
          }),
          defineField({
            name: 'time',
            title: 'The time that day',
            type: 'string',
            description: 'Like "10:30 am" or "6 pm".',
            hidden: ({ parent }) => parent?.change === 'cancelled',
            validation: (Rule) =>
              Rule.custom((value, context) => {
                const parent = context.parent as RawTimeChange | undefined;
                if (!parent || parent.change === 'cancelled') return true;
                if (!value) return 'Type the time, like "10:30 am".';
                const minutes = parseFriendlyTime(value);
                if (minutes === null) return 'Type a time like "10:30 am" or "6 pm".';
                if (!/[ap]\.?m?\.?\s*$|noon/i.test(value) && minutes < 7 * 60) {
                  return `That reads as ${clockLabel(minutes)}. Add "am" or "pm" to be sure.`;
                }
                return true;
              }).warning(),
          }),
          defineField({
            name: 'label',
            title: 'What the extra service is called',
            type: 'string',
            description: 'Like "Christmas Eve candlelight service".',
            hidden: ({ parent }) => parent?.change !== 'extra',
            validation: (Rule) =>
              Rule.max(80).custom((value, context) => {
                const parent = context.parent as RawTimeChange | undefined;
                return parent?.change === 'extra' && !value
                  ? 'Give the extra service a name.'
                  : true;
              }),
          }),
          defineField({
            name: 'note',
            title: 'A short note (optional)',
            type: 'string',
            description:
              'One line people see beside the times, like "Weather: no Sunday School today".',
            validation: (Rule) => Rule.max(120),
          }),
        ],
        preview: {
          select: {
            date: 'date',
            change: 'change',
            service: 'service',
            time: 'time',
            label: 'label',
            note: 'note',
          },
          prepare: ({ date, change, service, time, label, note }) => ({
            title: changeTitle({ change, service, time, label }),
            subtitle: [date ? longDate(date) : 'No day picked', note].filter(Boolean).join(' · '),
          }),
        },
      }),
    ],
  }),
  confirmedField('phoneConfirmed', 'the phone number (Identity & contact)'),
  // Newcomer and member audit (2026-10-24): "Call or text" beside the number.
  defineField({
    name: 'phoneTakesTexts',
    title: 'This number takes texts',
    type: 'boolean',
    initialValue: false,
    group: 'church',
    description:
      'Check if people can text the church phone. The site then says "Call or text" and adds a Text link on phones.',
  }),
  confirmedField('emailConfirmed', 'the email address (Identity & contact)'),
  defineField({
    name: 'liveStreamUrl',
    title: 'Live stream link',
    type: 'url',
    group: 'church',
    description:
      'Where people watch on Sunday, like the church’s Facebook live videos page. Shown on Watch, in the footer, on the This Sunday card and in the Live now banner that appears at the top of every page during Sunday worship. Leave empty to use the YouTube channel below (once it is set), else the Facebook link from Social links.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  // Section library (2026-10-18): the "Contact details" block shows these lines.
  defineField({
    name: 'officeHours',
    title: 'Office hours (optional)',
    type: 'text',
    rows: 3,
    group: 'church',
    description:
      'When someone can be reached at the church office, one line each, like "Tuesday to Thursday, 9 am to 1 pm". Shown in the Contact details block. Leave empty to leave them out.',
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
      'Starts with UC and is 24 characters long (YouTube Studio > Settings > Channel > Advanced settings). The newest video shows on Home and Watch after each publish and every morning, the This Sunday card names the coming Sunday’s scheduled stream, and Watch live links go to the channel’s live page. Leave blank until the church has a channel.',
    validation: (Rule) =>
      Rule.regex(/^UC[\w-]{22}$/, { name: 'channel ID starting with UC' }).warning(),
  }),
];

// ── The Church Trac tab (2026-10-24) ─────────────────────────────────────────
// The seven addresses the church pastes in from Church Trac, in the order it would set them up,
// on a tab of their own in Site settings (docs/agent/church-trac.md, PORTS.md card 152). Moving a
// field to another tab is display only: the names and the data are unchanged. Each box is optional;
// a link box anywhere on the site can point at one with a placeholder such as {connect}.
export const CHURCH_TRAC_GROUP = { name: 'churchTrac', title: 'Church Trac' };

export const CHURCH_TRAC_FIELDSET = {
  name: 'churchTrac',
  title: 'Paste these in from Church Trac',
  description:
    'Each one switches part of the website over to Church Trac on the next update: forms, giving, the calendar and member sign-in. Leave a box empty and the website keeps its own page for it. For a form to open inside the website, its "Embed Domain" setting in Church Trac must hold this website’s address.',
  options: { collapsible: false },
};

export const churchTracFields = [
  defineField({
    name: 'churchTracUrl',
    title: 'Church Trac address',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'The church’s own Church Trac address, like https://yourchurch.churchtrac.com. A "Church Trac page" section reads its pages from here.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'connectCardUrl',
    title: 'Connection card',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'The Church Trac connection card. Once it is set, Contact shows it in place of the site’s own form, and every "Tell us you are coming" button goes straight to it. Links can use {connect}.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'contactFormUrl',
    title: 'Contact form (optional)',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'A Church Trac form for general questions. Contact shows it in place of the site’s own form; leave empty to use the connection card there. Links can use {contact-form}.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'prayerFormUrl',
    title: 'Prayer request form',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'The Church Trac prayer request form. Once it is set, the Prayer requests page shows it in place of the site’s own form. Links can use {prayer}.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'newsletterFormUrl',
    title: 'Newsletter sign-up form',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'A Church Trac form that adds the person to the church’s email list (set the form to add them to your newsletter group). Once it is set, the footer shows "Get the church newsletter" and every Newsletter section shows the form. Links can use {newsletter}.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'givingUrl',
    title: 'Online giving link',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'The page where people give online (from Church Trac or another giving service). When it is set, every "Give" link goes straight there. Leave empty and Give opens the site’s own page about giving on Sunday or by mail.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
  defineField({
    name: 'churchTracIcalUrl',
    title: 'Church Trac calendar feed (iCal address)',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'In Church Trac: Calendar > Share > iCal link. The "This week" list reads upcoming events from it every morning. Leave blank to show the service times only.',
    validation: (Rule) => Rule.uri({ scheme: ['https', 'webcal'] }),
  }),
  defineField({
    name: 'memberLoginUrl',
    title: 'Member sign-in link',
    type: 'url',
    group: 'churchTrac',
    fieldset: 'churchTrac',
    description:
      'Where members sign in to Church Trac (the member portal or app page). Shown in the footer as "Members: sign in". Leave empty to leave it out.',
    validation: (Rule) => Rule.uri({ scheme: ['https'] }),
  }),
];
