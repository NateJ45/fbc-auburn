// Safe to edit by hand
// =============================================================================
// templateBlocks - small builders the page templates and patterns are written in
// =============================================================================
// pageTemplates.ts (start a page) and sectionPatterns.ts (drop a few sections
// into a page that already exists) both describe pages as lists of sections.
// Written as raw objects they run to thousands of lines; with these builders a
// template reads like an outline of the page.
//
// Every builder returns plain data in the shape the schema stores
// (src/sanity/schemaTypes/*Sections.ts). Keys are not set here: the callers run
// the result through freshKeys() (src/lib/authoring.ts), so every new page or
// inserted pattern gets its own.
//
// Two habits keep the output honest:
//   - Anything the church must supply (a name, a date, a room, a claim about
//     how something is run) goes through `example()`, so it starts "Example:"
//     and the page builder warns until it is replaced.
//   - Facts that already live in Site settings > Church facts (service times,
//     the address, phone, email, giving link, live stream) are never typed:
//     the blocks that read them (serviceTimes, map, contactCard, giving,
//     livestream) are used instead (rule 15).
//
// No links inside Portable Text on purpose: freshKeys() renews a link's
// markDef `_key` but not the span's `marks` that point at it, so a link would
// come out broken. Links go in buttons (ctaBlock) instead.
//
// No `sanity` import here on purpose: node --test loads this file directly.
// =============================================================================

import { example } from '../lib/authoring.ts';

type Rec = Record<string, unknown>;

export { example };

// ── Text ─────────────────────────────────────────────────────────────────────

/** One Portable Text paragraph (or heading, with a style). */
export const para = (text: string, style = 'normal'): Rec => ({
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _type: 'span', marks: [], text }],
});

/** Portable Text bullet points, one block per item. */
export const bullets = (...items: string[]): Rec[] =>
  items.map((text) => ({ ...para(text), listItem: 'bullet', level: 1 }));

/** Several paragraphs at once. */
export const paras = (...texts: string[]): Rec[] => texts.map((t) => para(t));

// ── Buttons ──────────────────────────────────────────────────────────────────

/** A button the editor points at a page of their choice (no page picked yet). */
export const button = (label: string): Rec => ({ _type: 'ctaBlock', label, linkType: 'internal' });

/** A button to a real, public page on another website. Opens in a new tab. */
export const externalButton = (label: string, url: string): Rec => ({
  _type: 'ctaBlock',
  label,
  linkType: 'external',
  externalUrl: url,
  openInNewTab: true,
});

// ── General blocks (sections.ts) ─────────────────────────────────────────────

export const hero = (o: {
  headline: string;
  subhead?: string;
  eyebrow?: string;
  primary?: Rec;
  secondary?: Rec;
  /**
   * "Photo behind the words" (heroStyle 'photo'): the background photo across
   * the whole opening with the title over it in white. Until a photo is added
   * the page shows the standard arch, so it is safe to set in a template.
   */
  photo?: boolean;
}): Rec => ({
  _type: 'heroSection',
  ...(o.eyebrow ? { eyebrow: o.eyebrow } : {}),
  headline: o.headline,
  ...(o.subhead ? { subhead: o.subhead } : {}),
  ...(o.primary ? { primaryCta: o.primary } : {}),
  ...(o.secondary ? { secondaryCta: o.secondary } : {}),
  ...(o.photo ? { heroStyle: 'photo' } : {}),
  size: 'short',
});

export const richText = (heading: string, body: Rec[]): Rec => ({
  _type: 'richTextSection',
  heading,
  body,
});

/**
 * Picture beside text. `art` is a photo (a soft arch shows until one is
 * added), the church mark, or the baptism drawing.
 */
export const imageText = (o: {
  heading: string;
  body: Rec[];
  side?: 'left' | 'right';
  art?: 'photo' | 'mark' | 'baptism' | 'building' | 'none';
  cta?: Rec;
}): Rec => ({
  _type: 'imageTextSection',
  art: o.art ?? 'photo',
  imageSide: o.side ?? 'right',
  heading: o.heading,
  body: o.body,
  ...(o.cta ? { cta: o.cta } : {}),
});

export const quote = (text: string, attribution: string): Rec => ({
  _type: 'quoteSection',
  quote: text,
  attribution,
});

/** The band at the foot of a page: one line and one button. */
export const ctaBand = (headline: string, subhead: string, cta: Rec): Rec => ({
  _type: 'ctaBandSection',
  headline,
  subhead,
  cta,
});

/** One card in a "Cards with stone icons" section (icon names: src/lib/stone-icons.ts). */
export const card = (icon: string, title: string, body: string, note?: string): Rec => ({
  _type: 'iconCard',
  icon,
  title,
  body,
  ...(note ? { note } : {}),
});

export const iconCards = (heading: string, cards: Rec[], intro?: string): Rec => ({
  _type: 'iconCardsSection',
  heading,
  ...(intro ? { intro } : {}),
  cards,
});

/** The watch band: the latest message and where to watch. */
export const watch = (heading: string, body: string): Rec => ({
  _type: 'watchSection',
  heading,
  body,
});

/** News and notes, the latest posts from the News list. */
export const latestNews = (headline: string, subhead?: string): Rec => ({
  _type: 'dynamicListSection',
  source: 'journal',
  headline,
  ...(subhead ? { subhead } : {}),
});

// ── FBC Auburn's motion blocks (auburnMotionSections.ts) ─────────────────────

/** One stone on the stepping-stone rail. */
export const railStep = (icon: string, title: string, body: string): Rec => ({
  _type: 'railStep',
  icon,
  title,
  body,
  gathering: 'none',
});

export const stepsRail = (heading: string, steps: Rec[], intro?: string): Rec => ({
  _type: 'stepsRailSection',
  heading,
  ...(intro ? { intro } : {}),
  steps,
});

// ── Collection blocks (collectionSections.ts) ────────────────────────────────

export const latestSermon = (heading: string, intro?: string): Rec => ({
  _type: 'latestSermonSection',
  heading,
  ...(intro ? { intro } : {}),
  mode: 'newest',
});

export const sermonSeries = (heading: string, intro?: string): Rec => ({
  _type: 'sermonSeriesSection',
  heading,
  ...(intro ? { intro } : {}),
  limit: 6,
});

/** People from the People list. The editor picks the group (a staff group, a committee). */
export const people = (heading: string, intro?: string): Rec => ({
  _type: 'peopleSection',
  heading,
  ...(intro ? { intro } : {}),
  mode: 'group',
  showBios: true,
});

export const downloads = (heading: string, category: string, intro?: string): Rec => ({
  _type: 'downloadsSection',
  heading,
  ...(intro ? { intro } : {}),
  category,
  limit: 5,
  showDates: true,
  featureBulletin: false,
});

// ── The church library (churchSections.ts) ───────────────────────────────────

/** Service times, from Church facts. */
export const serviceTimes = (heading = 'When we meet', intro?: string): Rec => ({
  _type: 'serviceTimesSection',
  heading,
  ...(intro ? { intro } : {}),
});

/** The church address on a map, from Church facts. */
export const map = (heading = 'Find us', note?: string): Rec => ({
  _type: 'mapSection',
  heading,
  ...(note ? { note } : {}),
});

/** Phone, email, address and office hours, from Church facts. */
export const contactCard = (heading = 'Get in touch', intro?: string): Rec => ({
  _type: 'contactCardSection',
  heading,
  ...(intro ? { intro } : {}),
});

/** Ways to give, from Church facts. */
export const giving = (heading = 'Ways to give', intro?: string): Rec => ({
  _type: 'givingSection',
  heading,
  ...(intro ? { intro } : {}),
});

/** The live stream button, from Church facts. */
export const livestream = (heading = 'Watch live', intro?: string): Rec => ({
  _type: 'livestreamSection',
  heading,
  ...(intro ? { intro } : {}),
});

/** Upcoming events from the church calendar, optionally only ones that mention some words. */
export const events = (heading: string, o: { intro?: string; keywords?: string } = {}): Rec => ({
  _type: 'eventsSection',
  heading,
  ...(o.intro ? { intro: o.intro } : {}),
  count: 5,
  ...(o.keywords ? { keywords: o.keywords } : {}),
  showSubscribe: true,
  emptyText:
    'Nothing else is on the calendar just now. Our weekly gatherings are under service times.',
});

export const newsletter = (heading = 'Stay in touch', intro?: string): Rec => ({
  _type: 'newsletterSection',
  heading,
  ...(intro ? { intro } : {}),
});

export const calendarSubscribe = (heading = 'Never miss a Sunday', intro?: string): Rec => ({
  _type: 'calendarSubscribeSection',
  heading,
  ...(intro ? { intro } : {}),
});

/**
 * A form. The form itself is made under Content > Forms and picked here; a
 * template cannot pick one, so the Studio asks for it before Publish.
 */
export const form = (): Rec => ({ _type: 'formSection' });

/** A Bible verse. King James wording, so no translation's copyright is in question. */
export const scripture = (verse: string, reference: string): Rec => ({
  _type: 'scriptureSection',
  verse,
  reference,
  translation: 'KJV',
});

/** One belief: a real heading, the church's own words, real references. */
export const belief = (title: string, text: string, references: string): Rec => ({
  _type: 'belief',
  title,
  text,
  references,
});

export const beliefs = (heading: string, items: Rec[], intro?: string): Rec => ({
  _type: 'beliefsSection',
  heading,
  ...(intro ? { intro } : {}),
  beliefs: items,
  translation: 'CSB',
  linkFaithAndMessage: true,
});

/**
 * One moment on the history timeline. The year field holds at most 12
 * characters, so it carries a blank year ("19__") rather than "Example:"; the
 * title beside it carries the marker.
 */
export const moment = (year: string, title: string, text: string): Rec => ({
  _type: 'timelineEntry',
  year,
  title,
  text,
});

export const timeline = (heading: string, entries: Rec[], intro?: string): Rec => ({
  _type: 'timelineSection',
  heading,
  ...(intro ? { intro } : {}),
  entries,
});

/** A question and its answer, for a fold-out list. */
export const qa = (question: string, ...answer: string[]): Rec => ({
  _type: 'accordionItem',
  question,
  answer: paras(...answer),
});

export const accordion = (heading: string, items: Rec[], intro?: string): Rec => ({
  _type: 'accordionSection',
  heading,
  ...(intro ? { intro } : {}),
  items,
});

export const tab = (label: string, ...body: string[]): Rec => ({
  _type: 'tabPanel',
  label,
  body: paras(...body),
});

export const tabs = (heading: string, panels: Rec[], intro?: string): Rec => ({
  _type: 'tabsSection',
  heading,
  ...(intro ? { intro } : {}),
  tabs: panels,
});

export const column = (heading: string, ...body: string[]): Rec => ({
  _type: 'textColumn',
  heading,
  body: paras(...body),
});

export const columns = (heading: string, cols: Rec[], intro?: string): Rec => ({
  _type: 'columnsSection',
  heading,
  ...(intro ? { intro } : {}),
  textColumns: cols,
});

/** A row of buttons, or link cards with a line of text each. */
export const link = (cta: Rec, note?: string): Rec => ({
  _type: 'quickLink',
  link: cta,
  ...(note ? { note } : {}),
});

export const buttonRow = (
  heading: string,
  links: Rec[],
  o: { intro?: string; layout?: 'buttons' | 'cards' } = {},
): Rec => ({
  _type: 'buttonRowSection',
  heading,
  ...(o.intro ? { intro: o.intro } : {}),
  layout: o.layout ?? 'cards',
  links,
});

/**
 * A notice with dates. No dates are set: the editor picks "Show from" and
 * "Show until", and until then it shows as soon as the page is published.
 */
export const notice = (message: string, urgency: 'info' | 'urgent' = 'info'): Rec => ({
  _type: 'noticeSection',
  message,
  urgency,
});

/** A countdown. The first day is required, so the Studio asks for it before Publish. */
export const countdown = (o: {
  eventName: string;
  intro?: string;
  duringText?: string;
  afterText?: string;
  link?: Rec;
}): Rec => ({
  _type: 'countdownSection',
  eventName: o.eventName,
  ...(o.intro ? { intro: o.intro } : {}),
  duringText: o.duringText ?? 'It is happening now. Come join us!',
  afterText: o.afterText ?? 'Thank you to everyone who came!',
  ...(o.link ? { link: o.link } : {}),
});

// ── Event and holiday blocks (builderSections.ts) ────────────────────────────

/**
 * One date line in "Event details". The date itself is the church's own fact,
 * so it is never filled in: the Studio asks for it before Publish, and until
 * then the block shows nothing (a line with no date is not upcoming). The time
 * is left empty too, to be picked with the date, so no invented time can ride
 * along once the label is rewritten. The label carries the marker.
 */
export const eventDate = (label: string): Rec => ({
  _type: 'eventDate',
  label,
});

/**
 * The when and where of one event, with "Add to my calendar" and directions.
 * Leave `place` empty for an event at the church: the address comes from
 * Church facts (rule 15).
 */
export const eventDetails = (o: {
  title: string;
  dates: Rec[];
  eyebrow?: string;
  place?: string;
  note?: string;
  cta?: Rec;
}): Rec => ({
  _type: 'eventDetailsSection',
  ...(o.eyebrow ? { eyebrow: o.eyebrow } : {}),
  title: o.title,
  occurrences: o.dates,
  ...(o.place ? { place: o.place } : {}),
  ...(o.note ? { note: o.note } : {}),
  ...(o.cta ? { button: o.cta } : {}),
  showCalendar: true,
});

/**
 * One line of a schedule. `time` is a value from the Studio's time list
 * ("18:00", quarter hours from 6 am); the row's title carries the marker, so the
 * page builder warns until the church has checked the time beside it.
 */
export const slot = (time: string | null, title: string, note?: string): Rec => ({
  _type: 'scheduleItem',
  ...(time ? { startTime: time } : {}),
  title,
  ...(note ? { note } : {}),
});

/** A day of a schedule. Pass an empty name for a single evening. */
export const scheduleDay = (title: string, ...items: Rec[]): Rec => ({
  _type: 'scheduleDay',
  ...(title ? { title } : {}),
  items,
});

export const schedule = (heading: string, days: Rec[], intro?: string): Rec => ({
  _type: 'scheduleSection',
  heading,
  ...(intro ? { intro } : {}),
  days,
});

/**
 * One card in "Cards with photos". The photo is required and is the church's
 * own, so it is left for the editor: the Studio asks for it before Publish.
 */
export const photoCard = (title: string, body?: string, cta?: Rec): Rec => ({
  _type: 'photoCard',
  title,
  ...(body ? { body } : {}),
  ...(cta ? { link: cta } : {}),
});

export const photoCards = (heading: string, cards: Rec[], intro?: string): Rec => ({
  _type: 'photoCardsSection',
  heading,
  ...(intro ? { intro } : {}),
  cards,
});

/**
 * A progress bar. The goal and the amount raised are the church's own numbers,
 * so neither is filled in: the Studio asks for both before Publish.
 */
export const progress = (heading: string, intro: string, cta?: Rec): Rec => ({
  _type: 'progressSection',
  heading,
  intro,
  ...(cta ? { link: cta } : {}),
});
