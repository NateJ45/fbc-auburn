// Safe to edit by hand
// =============================================================================
// The church's Quick update documents (FBC Auburn, 2026-10-18; PORTS.md card 111)
// =============================================================================
// The Studio's Quick update tool (src/sanity/kit/QuickUpdateTool.tsx, PORTABLE)
// publishes whatever a form's `build` returns, straight away and without the
// Studio's validation. These are the builders for the three phone jobs in
// src/sanity/kit.config.ts, kept pure so src/lib/quick-updates.test.ts can check
// that each one is a complete, valid document for its type:
//
//   - a notice (`announcement`) with a last day;
//   - a "this week" notice (a change or cancellation) that takes itself down
//     after the coming Sunday;
//   - Sunday's sermon (`sermon`) with its video link.
// =============================================================================

import { slugify } from './slugify.ts';

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
    slug: { _type: 'slug', current: slugify(`${v.title} ${v.date}`) },
    videoUrl: v.videoUrl.trim(),
  };
  if (v.passage?.trim()) doc.passage = v.passage.trim();
  if (pastorId) doc.preacher = { _type: 'reference', _ref: pastorId };
  return doc;
}

/** The same "who is the pastor" lookup as the sermon type's initialValue (sermons.ts). */
export const PASTOR_QUERY = `*[_type == "person" && !(_id in path("drafts.**")) && role match "pastor" && !(role match "associate") && !(role match "youth")] | order(order asc, name asc)[0]._id`;
