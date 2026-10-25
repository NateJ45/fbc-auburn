// Safe to edit by hand
// FBC Auburn's two "stone path" blocks (2026-10-17, from the studio mockups' v3 motion pass):
//
//   stepsRailSection  The stepping-stone rail ("A Sunday with us, one step at a time" on Home):
//                     numbered steps, each with a big stone icon, gold stepping stones laid
//                     between them, ending in the mark building itself stone by stone.
//   walkSection       "Walk in with us" (Plan your visit): the stops of a first Sunday down a gold
//                     stepping-stone path, each with a stone icon picked in code from its words
//                     (src/lib/walk-stops.ts). Each stop carries its time, so it is also the visit
//                     timeline. The drawn plan of the lot beside it was removed on 2026-10-24; it
//                     had no fields of its own, so nothing here changed shape.
//
// Both are CONTENT blocks: SectionRenderer gives them the alternating surface (rule 9, no colour
// field here). The motion is CSS and a small script (src/styles/motion.css,
// src/scripts/motion.ts); every word is in the markup, so the page reads fully without JS.
//
// Links are a label plus a plain address rather than a ctaBlock, because these links need an
// anchor or a query (/plan-your-visit/#walk, /contact/?visit=sunday-11), which a ctaBlock's page
// reference cannot carry. The address goes through withTrailingSlash() when it renders.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ArrowDownIcon } from '@sanity/icons/ArrowDown';
import { PinIcon } from '@sanity/icons/Pin';
import { checkLinkBox, isUnknownToken, linkTokenOf } from '../../lib/church-links.ts';

/**
 * The eight stone icons in src/assets/brand/stone-icon-*.svg. The field that picks one is named
 * `icon`, which is in NON_STEGA_FIELDS (src/lib/cms-preview.ts, rule 8b): the value picks a file,
 * so it must reach the renderer as the bare string.
 */
export const STONE_ICONS = [
  { title: 'Map pin', value: 'map-pin' },
  { title: 'Clock', value: 'clock' },
  { title: 'Coffee cup', value: 'coffee' },
  { title: 'Open Bible', value: 'bible' },
  { title: 'Praying hands', value: 'praying-hands' },
  { title: 'Giving hand', value: 'giving-hand' },
  { title: 'Music', value: 'music' },
  { title: 'Building blocks (children)', value: 'blocks' },
] as const;

export type StoneIconName = (typeof STONE_ICONS)[number]['value'];

/**
 * An address field: a site path starting with /, a full https:// URL, or a Church systems
 * placeholder such as {connect} (2026-10-24, docs/agent/church-trac.md).
 */
const linkHrefField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'string',
    description,
    validation: (R) =>
      R.custom((value) => {
        if (!value) return true;
        if (linkTokenOf(value) || isUnknownToken(value)) return checkLinkBox(value);
        return /^(\/|https:\/\/)/.test(String(value))
          ? true
          : 'Start with / for a page on this site, or https:// for another site, or use a placeholder like {connect}.';
      }),
  });

export const stepsRailSection = defineType({
  name: 'stepsRailSection',
  title: 'Stepping-stone steps',
  type: 'object',
  icon: ArrowDownIcon,
  description:
    'Numbered steps down a path of stepping stones, each with a stone icon, ending in the church mark.',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'intro', title: 'Intro (optional)', type: 'text', rows: 2 }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      validation: (R) => R.required().min(2).max(8),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'railStep',
          fields: [
            defineField({
              name: 'icon',
              title: 'Stone icon',
              type: 'string',
              options: { list: [...STONE_ICONS] },
              initialValue: 'map-pin',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required().max(80),
            }),
            defineField({ name: 'body', title: 'Text (optional)', type: 'text', rows: 3 }),
            // Home audit research (2026-10-17): on Home this block is "Your first Sunday". A step
            // that IS one of the Sunday gatherings takes its time from Site settings > Church
            // facts, so the time is typed once (rule 15). Logic-driving, so it is in
            // NON_STEGA_FIELDS (src/lib/cms-preview.ts, rule 8b).
            defineField({
              name: 'gathering',
              title: 'Which Sunday gathering is this? (optional)',
              description:
                'Pick one and the step shows its time from Church facts, so you never type it here.',
              type: 'string',
              options: {
                list: [
                  { title: 'Not a gathering', value: 'none' },
                  { title: 'The first Sunday gathering (Sunday School)', value: 'first' },
                  { title: 'The second Sunday gathering (worship)', value: 'second' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            }),
            defineField({
              name: 'place',
              title: 'Where (optional)',
              description:
                'A few words, like "Front door" or "Fellowship hall". Shows beside the time.',
              type: 'string',
              validation: (R) => R.max(40),
            }),
            defineField({
              name: 'times',
              title: 'Times (optional)',
              description: 'A short list of times, such as 9:45 am, Sunday School for all ages.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'railTime',
                  fields: [
                    defineField({
                      name: 'time',
                      title: 'Time',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'label',
                      title: 'What happens',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                  ],
                  preview: { select: { title: 'time', subtitle: 'label' } },
                }),
              ],
            }),
            defineField({ name: 'linkLabel', title: 'Link text (optional)', type: 'string' }),
            linkHrefField(
              'linkHref',
              'Link address (optional)',
              'A page on this site, such as /plan-your-visit/#walk, or a full https:// address.',
            ),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
            prepare: ({ title, subtitle }) => ({
              title: title || 'Step',
              subtitle: subtitle ? `Icon: ${subtitle}` : '',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'endHeading',
      title: 'Closing line under the mark (optional)',
      description: 'The path ends in the church mark. This line sits under it.',
      type: 'string',
    }),
    defineField({ name: 'primaryCta', title: 'Main button (optional)', type: 'ctaBlock' }),
    defineField({ name: 'secondaryCta', title: 'Second button (optional)', type: 'ctaBlock' }),
  ],
  preview: {
    select: { title: 'heading', steps: 'steps' },
    prepare: ({ title, steps }) => ({
      title: title || 'Stepping-stone steps',
      subtitle: `Steps${Array.isArray(steps) ? ` (${steps.length})` : ''}`,
    }),
  },
});

export const walkSection = defineType({
  name: 'walkSection',
  title: 'Walk in with us (the visit, stop by stop)',
  type: 'object',
  icon: PinIcon,
  description:
    'Your first Sunday, stop by stop, down a path of stepping stones. Each stop gets a stone icon to match its words (parking, the door, coffee, the children, worship).',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Walk in with us',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'intro', title: 'Intro (optional)', type: 'text', rows: 2 }),
    defineField({
      name: 'stops',
      title: 'Stops, in order',
      description:
        'Up to five stops, in the order a visitor meets them: parking, the front doors, coffee, the children’s room, the sanctuary. The words are yours.',
      type: 'array',
      validation: (R) => R.required().min(1).max(5),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'walkStop',
          fields: [
            defineField({ name: 'time', title: 'Time (optional)', type: 'string' }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required().max(80),
            }),
            defineField({ name: 'body', title: 'Text (optional)', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'time' } },
        }),
      ],
    }),
    defineField({
      name: 'endHeading',
      title: 'Last step heading',
      type: 'string',
      initialValue: 'You made it. We would love to see you.',
    }),
    defineField({ name: 'endBody', title: 'Last step text (optional)', type: 'text', rows: 2 }),
    defineField({
      name: 'endLinkLabel',
      title: 'Last step button text',
      type: 'string',
      initialValue: 'Tell us you are coming',
    }),
    linkHrefField(
      'endLinkHref',
      'Last step button address',
      'Usually /contact/?visit=sunday-11, which opens the contact form with the visit filled in.',
    ),
  ],
  initialValue: { endLinkHref: '/contact/?visit=sunday-11' },
  preview: {
    select: { title: 'heading', stops: 'stops' },
    prepare: ({ title, stops }) => ({
      title: title || 'Walk in with us',
      subtitle: `Walk-through${Array.isArray(stops) ? ` (${stops.length} stops)` : ''}`,
    }),
  },
});

export const auburnSectionSchemas = [stepsRailSection, walkSection];
