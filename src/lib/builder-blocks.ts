// Safe to edit by hand
// =============================================================================
// builder-blocks - the pure logic behind the event and holiday page blocks
// =============================================================================
// The blocks in src/sanity/schemaTypes/builderSections.ts (2026-10-26) let the pastor build an
// event or holiday page himself: Event details, Schedule and Cards with photos. The editor types
// INPUTS (a date, a start time picked from a list, a place or nothing); everything else is worked
// out here at build time (rule 15): which dates are still to come, the time lines, the calendar
// file, the directions link, and how many columns a row of cards takes.
//
// Pure on purpose, so `node --test` covers it (builder-blocks.test.ts). Every string an editor
// typed goes through plain() first: in the Studio preview it arrives stega-encoded.
//
// Dates are the church's own calendar days (YYYY-MM-DD, Eastern), as in church-blocks.ts. The
// site rebuilds every morning (deploy.yml), so an event's past dates drop off within a day, the
// same way a dated notice comes down (inDateWindow in church-blocks.ts).
// =============================================================================

import { plain, type ChurchAddress } from './church-facts.ts';
import { CHURCH_TIME_ZONE, dateLabel, dayName, timeLabel, timeRange } from './church-calendar.ts';
import { isoDay } from './church-blocks.ts';
import { buildIcs } from './ics.ts';

// ── Times ───────────────────────────────────────────────────────────────────

/** The times an editor picks from: every quarter hour from 6 am to 11:45 pm, stored as "HH:MM". */
export const TIME_OPTIONS: { title: string; value: string }[] = (() => {
  const out: { title: string; value: string }[] = [];
  for (let m = 6 * 60; m < 24 * 60; m += 15) {
    const value = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    out.push({ title: timeLabel(m), value });
  }
  return out;
})();

/** "16:30" as minutes after midnight, or null when it is not a time. */
export function minutesOf(value?: string | null): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(plain(value));
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

/** "4:30 pm", or '' with no time. */
export function timeOf(value?: string | null): string {
  const m = minutesOf(value);
  return m === null ? '' : timeLabel(m);
}

// ── Event details ───────────────────────────────────────────────────────────

export interface RawOccurrence {
  _key?: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  label?: string | null;
}

export interface Occurrence {
  key: string;
  date: string;
  /** Minutes after midnight, or null for an all-day date. */
  start: number | null;
  /** Length in minutes, or null when no (later) end time was given. */
  duration: number | null;
  label: string;
  /** "Thursday, December 24" */
  day: string;
  /** "5:30 to 6:30 pm", "7 pm" or "All day" */
  time: string;
}

/**
 * The dates still to come (today counts), soonest first. A date with no usable day is dropped,
 * an end time at or before the start is ignored (the start alone shows), and a date that has
 * passed drops off. When every date has passed the list is empty and the block draws nothing,
 * like a notice after its last day.
 */
export function upcomingOccurrences(
  raw: RawOccurrence[] | null | undefined,
  today: string,
): Occurrence[] {
  const out: Occurrence[] = [];
  (raw ?? []).forEach((o, i) => {
    const date = isoDay(o?.date);
    if (!date || date < today) return;
    const start = minutesOf(o.startTime);
    const end = minutesOf(o.endTime);
    const duration = start !== null && end !== null && end > start ? end - start : null;
    out.push({
      key: plain(o._key) || `o${i}`,
      date,
      start,
      duration,
      label: plain(o.label),
      day: `${dayName(date)}, ${dateLabel(date)}`,
      time: timeRange(start, duration),
    });
  });
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? -1) - (b.start ?? -1));
}

export interface EventPlace {
  /** The lines to show. */
  lines: string[];
  /** One line, for the calendar file; '' when it should be left out. */
  oneLine: string;
  /** The directions link. */
  mapsUrl: string;
  /** False only for the church's own address while Church facts says it is not confirmed. */
  confirmed: boolean;
  /** True when the place is the church (no place typed). */
  atChurch: boolean;
}

/**
 * Where the event is. A typed place wins ("The fellowship hall", "Hamilton Park, 123 Main St");
 * blank means the church, from Site settings > Church facts. Never typed into code. Null when
 * there is neither.
 */
export function eventPlace(
  typed: string | null | undefined,
  church: ChurchAddress | null | undefined,
): EventPlace | null {
  const own = plain(typed);
  if (own) {
    const lines = own
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const oneLine = lines.join(', ');
    return {
      lines,
      oneLine,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(oneLine)}`,
      confirmed: true,
      atChurch: false,
    };
  }
  if (!church) return null;
  return {
    lines: church.lines,
    // Never put an unconfirmed address into someone's calendar (church-facts.ts, /sunday.ics).
    oneLine: church.confirmed ? church.oneLine : '',
    mapsUrl: church.mapsUrl,
    confirmed: church.confirmed,
    atChurch: true,
  };
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'event';

/** The calendar file's name: "christmas-eve.ics". */
export function icsFileName(title: string): string {
  return `${slug(plain(title))}.ics`;
}

/**
 * The calendar file for every date still to come, or '' when there are none. A timed date is a
 * wall time in the church's zone (so 5:30 pm stays 5:30 pm whatever the visitor's clock), one hour
 * long when no end time is given; a date with no time is an all-day event.
 */
export function eventIcs(opts: {
  title: string;
  occurrences: Occurrence[];
  place: EventPlace | null;
  note?: string | null;
  url?: string;
  /** Stable part of each UID: the block's key. */
  uidBase: string;
  host: string;
  now: Date;
}): string {
  if (!opts.occurrences.length) return '';
  const title = plain(opts.title) || 'Church event';
  const note = plain(opts.note);
  return buildIcs({
    prodId: `-//${opts.host}//events//EN`,
    now: opts.now,
    events: opts.occurrences.map((o) => ({
      uid: `${slug(opts.uidBase)}-${o.key}-${o.date}@${opts.host}`,
      start:
        o.start === null
          ? { date: o.date }
          : {
              date: o.date,
              time: `${String(Math.floor(o.start / 60)).padStart(2, '0')}:${String(o.start % 60).padStart(2, '0')}`,
              tzid: CHURCH_TIME_ZONE,
            },
      ...(o.start === null ? {} : { duration: `PT${o.duration ?? 60}M` }),
      summary: o.label ? `${title}: ${o.label}` : title,
      ...(note ? { description: note } : {}),
      ...(opts.place?.oneLine ? { location: opts.place.oneLine } : {}),
      ...(opts.url ? { url: opts.url } : {}),
    })),
  });
}

/** The calendar file as a link the browser saves (no route to build or leak: the file is the link). */
export function icsHref(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

// ── Cards with photos ───────────────────────────────────────────────────────

/**
 * How many across on a wide screen, from how many cards there are: two side by side, three in a
 * row, four as two pairs, five and six as rows of three. A phone always shows one.
 */
export function photoCardColumns(count: number): 2 | 3 {
  return count === 2 || count === 4 ? 2 : 3;
}
