// Safe to edit by hand
// =============================================================================
// The church's Quick update documents (FBC Auburn, 2026-10-18; PORTS.md card 111)
// =============================================================================
// The Studio's Quick update tool (src/sanity/kit/QuickUpdateTool.tsx, PORTABLE)
// publishes whatever a form's `build` returns, straight away and without the
// Studio's validation. These are the builders for the phone jobs in
// src/sanity/kit.config.ts, kept pure so src/lib/quick-updates.test.ts can check
// that each one is a complete, valid document for its type:
//
//   - a notice (`announcement`) with a last day;
//   - a "this week" notice (a change or cancellation) that takes itself down
//     after the coming Sunday;
//   - Sunday's sermon (`sermon`) with its video link;
//   - an event notice, a short News and notes post (`journalEntry`) and the
//     start of the week's newsletter (`newsletter`), added 2026-10-19.
// =============================================================================

import { slugify } from './slugify.ts';

/**
 * A web address ending made from a title and a date ("hope-2026-10-18"). The
 * title part is cut first, so a long title never pushes the date (what keeps
 * two addresses apart) off the end.
 */
export function datedSlug(title: string, date: string): string {
  const head = slugify(title).slice(0, 53).replace(/-+$/, '');
  return head ? `${head}-${date}` : date;
}

// Type aliases, not interfaces: the Quick update tool wants a plain record.
export type NoticeDoc = {
  _type: 'announcement';
  internalTitle: string;
  message: string;
  style: 'info' | 'highlight' | 'urgent';
  enabled: true;
  endDate: string;
  link?: { label: string; url: string };
};

/** The end of a local day ("2026-10-18" -> 23:59 that evening, as ISO). */
export function endOfDay(date: string): string {
  return new Date(`${date}T23:59:00`).toISOString();
}

/** The Studio-only name of a notice: its first words, dated. */
export function noticeName(message: string, date: string): string {
  const words = message.trim().replace(/\s+/g, ' ');
  const short = words.length > 40 ? `${words.slice(0, 40).trimEnd()}...` : words;
  return `${short} (until ${date})`;
}

/** A notice that shows until the end of `lastDay`. */
export function buildNotice(
  v: { message: string; lastDay: string; link?: string },
  style: NoticeDoc['style'] = 'info',
): NoticeDoc {
  const doc: NoticeDoc = {
    _type: 'announcement',
    internalTitle: noticeName(v.message, v.lastDay),
    message: v.message.trim(),
    style,
    enabled: true,
    endDate: endOfDay(v.lastDay),
  };
  if (v.link) doc.link = { label: 'Find out more', url: v.link };
  return doc;
}

export type SermonDoc = {
  _type: 'sermon';
  title: string;
  date: string;
  service: 'sunday-morning';
  slug: { _type: 'slug'; current: string };
  videoUrl: string;
  passage?: string;
  preacher?: { _type: 'reference'; _ref: string };
};

/**
 * Sunday's sermon. The web address is the title plus the full date, so two
 * sermons with the same title never collide (a clash would stop the website
 * building).
 */
export function buildSermon(
  v: { title: string; date: string; videoUrl: string; passage?: string },
  pastorId?: string | null,
): SermonDoc {
  const doc: SermonDoc = {
    _type: 'sermon',
    title: v.title.trim(),
    date: v.date,
    service: 'sunday-morning',
    slug: { _type: 'slug', current: datedSlug(v.title, v.date) },
    videoUrl: v.videoUrl.trim(),
  };
  if (v.passage?.trim()) doc.passage = v.passage.trim();
  if (pastorId) doc.preacher = { _type: 'reference', _ref: pastorId };
  return doc;
}

/** The same "who is the pastor" lookup as the sermon type's initialValue (sermons.ts). */
export const PASTOR_QUERY = `*[_type == "person" && !(_id in path("drafts.**")) && role match "pastor" && !(role match "associate") && !(role match "youth")] | order(order asc, name asc)[0]._id`;

// ── Added 2026-10-19 (Studio complete): the rest of the pastor's weekly jobs ──
// A news post, an event notice and the start of the week's newsletter. Same
// rule as above: each returns a whole, valid document for its type.

/** "2026-10-25" -> "Saturday, October 25" (read at noon UTC, so no time zone moves the day). */
export function dayName(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Cut text to at most `max` characters at a word boundary, adding "..." when cut. */
export function clip(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 3);
  const space = cut.lastIndexOf(' ');
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trimEnd()}...`;
}

/**
 * A notice for an event: "Fall festival, Saturday, October 25 at 4 pm." It
 * shows until the end of the event's day, then takes itself down.
 */
export function buildEventNotice(v: {
  name: string;
  date: string;
  time?: string;
  link?: string;
}): NoticeDoc {
  const name = v.name.trim().replace(/[.\s]+$/, '');
  const time = v.time?.trim();
  const message = clip(`${name}, ${dayName(v.date)}${time ? ` at ${time}` : ''}.`, 160);
  return buildNotice({ message, lastDay: v.date, link: v.link || undefined }, 'highlight');
}

type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
type Block = {
  _type: 'block';
  _key: string;
  style: 'normal';
  markDefs: never[];
  children: Span[];
};

/** Plain text to Portable Text paragraphs: a blank line starts a new one. */
export function paragraphs(text: string, keyPrefix = 'p'): Block[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, ' '))
    .filter(Boolean)
    .map((p, i) => ({
      _type: 'block',
      _key: `${keyPrefix}${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `${keyPrefix}${i}s`, text: p, marks: [] }],
    }));
}

export type PostDoc = {
  _type: 'journalEntry';
  title: string;
  slug: { _type: 'slug'; current: string };
  excerpt: string;
  publishedAt: string;
  body: Block[];
};

/**
 * A short News and notes post. The web address is the title plus the day, so
 * two posts with the same title never collide.
 */
export function buildPost(v: { title: string; text: string }, now: Date): PostDoc {
  const iso = now.toISOString();
  return {
    _type: 'journalEntry',
    title: v.title.trim(),
    slug: { _type: 'slug', current: datedSlug(v.title, iso.slice(0, 10)) },
    excerpt: clip(v.text, 220),
    publishedAt: iso,
    body: paragraphs(v.text, 'post'),
  };
}

export type NewsletterDoc = {
  _type: 'newsletter';
  subject: string;
  date: string;
  slug: { _type: 'slug'; current: string };
  intro?: string;
  includeSermon: true;
  includeEvents: true;
  eventDays: 14;
  showOnWebsite: true;
};

/**
 * This week's newsletter, started from the phone: the subject and a few opening
 * words. The newest sermon, the notices box (empty) and the next two weeks of
 * Church Trac events fill the rest when it is sent. It is published, which is
 * NOT sent: sending stays two presses in the full editor (a test, then everyone).
 */
export function buildNewsletter(
  v: { subject: string; intro?: string },
  date: string,
): NewsletterDoc {
  const doc: NewsletterDoc = {
    _type: 'newsletter',
    subject: v.subject.trim(),
    date,
    slug: { _type: 'slug', current: datedSlug(v.subject, date) },
    includeSermon: true,
    includeEvents: true,
    eventDays: 14,
    showOnWebsite: true,
  };
  if (v.intro?.trim()) doc.intro = v.intro.trim();
  return doc;
}
