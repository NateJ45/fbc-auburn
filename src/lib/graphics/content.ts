// Safe to edit by hand
// =============================================================================
// The words of a graphic, built from what the church already keeps (2026-10-27).
// =============================================================================
// Pure functions. Each takes Sanity data and returns a Content the templates draw,
// so the times, the address and the dates on a graphic are never typed by hand:
// they come from Church facts (src/lib/church-facts.ts, dayPlan) exactly as the
// site shows them. Jacob may change the words in the Studio afterwards; the facts
// stay derived (rule 15). docs/agent/graphics.md.
// =============================================================================

import {
  addDays,
  changeSummary,
  clockLabel,
  dayPlan,
  dayTitle,
  monthDay,
  parseClock,
  shortLabel,
  weekdayOf,
  type ChurchFacts,
  type TimeChange,
} from '../church-facts.ts';
import { withTrailingSlash } from '../href.ts';
import type { Church, Content } from './types.ts';

/** "Wednesday, December 24" for a YYYY-MM-DD. */
export const longDate = (iso: string) => `${dayTitle(iso)}, ${monthDay(iso)}`;

/** The next Sunday on or after `today` (YYYY-MM-DD). */
export function nextSunday(today: string): string {
  return addDays(today, (7 - weekdayOf(today)) % 7);
}

/** The printed web address ("firstauburn.org/christmas") and the QR target for a path. */
export function linkFor(siteUrl: string, path: string): { link: string; qr: string } {
  const base = siteUrl.replace(/\/+$/, '');
  const clean = path === '/' ? '/' : withTrailingSlash(path.startsWith('/') ? path : `/${path}`);
  const shown = `${base.replace(/^https?:\/\//, '').replace(/^www\./, '')}${clean === '/' ? '' : clean.replace(/\/$/, '')}`;
  return { link: shown, qr: `${base}${clean}` };
}

/** The church's own lines for the templates. */
export function churchLines(facts: Pick<ChurchFacts, 'address'>, siteUrl: string): Church {
  return {
    line1: 'First Baptist',
    line2: 'Church of Auburn',
    address: facts.address?.oneLine ?? null,
    place: facts.address
      ? `${facts.address.city}, ${stateName(facts.address.state)}`
      : 'Hamilton, Ohio',
    web: linkFor(siteUrl, '/').link,
  };
}

const stateName = (s: string) => (s.toUpperCase() === 'OH' ? 'Ohio' : s);

/** One line per gathering: "Sunday School, 9:45 am". */
function gatheringLines(services: { label: string; timeLabel: string }[]): string[] {
  return services.map((s) => `${shortLabel(s.label)}, ${s.timeLabel}`);
}

/** Join us this Sunday: that Sunday's plan, with any time change already applied. */
export function sundayContent(facts: ChurchFacts, today: string, siteUrl: string): Content {
  const date = nextSunday(today);
  const plan = dayPlan(facts, date);
  const changed = changeSummary(plan);
  return {
    kind: 'sunday',
    kicker: date === today ? 'Today' : 'This Sunday',
    title: 'Come as you are',
    body: changed || 'Coffee is on, and there is a seat for you.',
    when: gatheringLines(plan.services),
    date: longDate(date),
    ...linkFor(siteUrl, '/plan-your-visit/'),
  };
}

/** A different Sunday (Church facts > A different Sunday). */
export function timeChangeContent(
  facts: ChurchFacts,
  change: TimeChange,
  siteUrl: string,
): Content {
  const plan = dayPlan(facts, change.date);
  const first = plan.services.find((s) => s.movedFrom || s.extra);
  const title = plan.services.length
    ? first
      ? `${shortLabel(first.label)} at ${first.timeLabel}`
      : 'A change to our times'
    : 'No services this day';
  return {
    kind: 'time-change',
    kicker: 'A different Sunday',
    date: longDate(change.date),
    title,
    body: changeSummary(plan),
    when: gatheringLines(plan.services),
    ...linkFor(siteUrl, '/'),
  };
}

/** New here: the times of every week, for the connect card, postcard and door hanger. */
export function welcomeContent(facts: ChurchFacts, siteUrl: string): Content {
  const weekly = [...facts.serviceTimes].sort(
    (a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes,
  );
  return {
    kind: 'welcome',
    kicker: 'New here?',
    title: 'We would love to meet you',
    body: 'Come as you are. We will not put you on the spot.',
    when: weekly.map((s) =>
      s.dayIndex === 0
        ? `${shortLabel(s.label)}, ${s.timeLabel}`
        : `${dayTitle(dayIso(s.dayIndex))} ${shortLabel(s.label)}, ${s.timeLabel}`,
    ),
    ...linkFor(siteUrl, '/plan-your-visit/'),
  };
}

/** Any date with the given weekday (only its weekday name is read). */
const dayIso = (dayIndex: number) => addDays('2026-01-04', dayIndex); // 2026-01-04 is a Sunday

export interface SermonLike {
  title?: string | null;
  date?: string | null;
  passage?: string | null;
  preacher?: string | null;
  series?: string | null;
  slug?: string | null;
}

/** A sermon: its title, passage and preacher. */
export function sermonContent(s: SermonLike, siteUrl: string): Content {
  return {
    kind: 'sermon',
    kicker: s.series ? s.series : s.date ? longDate(s.date) : 'Sermon',
    title: s.title || 'Sermon title',
    reference: s.passage || undefined,
    speaker: s.preacher || undefined,
    ...{
      link: linkFor(siteUrl, '/sermons/').link,
      qr: linkFor(siteUrl, s.slug ? `/sermons/${s.slug}/` : '/sermons/').qr,
    },
  };
}

export interface SeriesLike {
  title?: string | null;
  book?: string | null;
  slug?: string | null;
}

/** A sermon series. */
export function seriesContent(s: SeriesLike, siteUrl: string): Content {
  return {
    kind: 'sermon',
    kicker: 'Sermon series',
    title: s.title || 'Series title',
    reference: s.book || undefined,
    ...{
      link: linkFor(siteUrl, '/sermons/').link,
      qr: linkFor(siteUrl, s.slug ? `/sermons/series/${s.slug}/` : '/sermons/').qr,
    },
  };
}

export interface EventLike {
  /** The page's title. */
  title?: string | null;
  slug?: string | null;
  /** The page's first Event details block. */
  details?: {
    title?: string | null;
    note?: string | null;
    occurrences?:
      { date?: string | null; startTime?: string | null; label?: string | null }[] | null;
  } | null;
}

/** An event page: the next date from its Event details block, or the soonest one listed. */
export function eventContent(e: EventLike, today: string, siteUrl: string): Content {
  const dates = (e.details?.occurrences ?? []).filter((o) => o?.date) as {
    date: string;
    startTime?: string | null;
    label?: string | null;
  }[];
  dates.sort((a, b) => a.date.localeCompare(b.date));
  const next = dates.find((d) => d.date >= today) ?? dates[0];
  const times = dates
    .filter((d) => next && d.date === next.date)
    .map((d) => {
      const m = parseClock(d.startTime);
      return m == null ? '' : d.label ? `${d.label}, ${clockLabel(m)}` : clockLabel(m);
    })
    .filter(Boolean);
  return {
    kind: 'event',
    kicker: next ? longDate(next.date) : undefined,
    title: e.details?.title || e.title || 'Event',
    body: e.details?.note || undefined,
    when: times,
    ...linkFor(siteUrl, e.slug ? `/${e.slug}/` : '/'),
  };
}

/** A Bible verse (typed by Jacob: the words are his to choose and his translation). */
export function verseContent(text: string, reference: string, translation: string): Content {
  return { kind: 'verse', title: text, reference, translation };
}

/** A short notice, starting empty. */
export function announcementContent(siteUrl: string): Content {
  return {
    kind: 'announcement',
    kicker: 'Church family',
    title: '',
    body: '',
    ...linkFor(siteUrl, '/'),
  };
}

/** The pre-launch notes in page copy ("[Jacob: ...]", "[Placeholder: ...]"): MARKERS in src/data/client-notes.ts. */
const NOTE_RE = /\s*\[(?:Jacob|Placeholder|Client|Photo):[^\]]*\]\s*/g;

/** True when any of the words still holds a pre-launch note. */
export function hasNotes(c: Content): boolean {
  return [c.kicker, c.title, c.body, c.date, ...(c.when ?? [])].some(
    (v) => typeof v === 'string' && /\[(?:Jacob|Placeholder|Client|Photo):/.test(v),
  );
}

/** The words with any pre-launch note taken out: a graphic never prints one. */
export function withoutNotes(c: Content): Content {
  const strip = (v?: string) =>
    v == null ? v : v.replace(NOTE_RE, ' ').replace(/\s+/g, ' ').trim();
  return {
    ...c,
    kicker: strip(c.kicker),
    title: strip(c.title) ?? '',
    body: strip(c.body),
    date: strip(c.date),
    when: c.when?.map((w) => strip(w) ?? '').filter(Boolean),
  };
}

/**
 * The standing invitation, the regular Sunday gatherings ("Worship, 11:00 am"), for the foot of a
 * graphic about something else (an event, a sermon, a notice), so every piece says when to come.
 * Kinds already about Sunday carry their own times and get none.
 */
export function standingFor(
  facts: Pick<ChurchFacts, 'serviceTimes'>,
  kind: Content['kind'],
): string[] | undefined {
  if (kind === 'sunday' || kind === 'time-change' || kind === 'welcome') return undefined;
  const sunday = facts.serviceTimes
    .filter((s) => s.dayIndex === 0)
    .sort((a, b) => a.minutes - b.minutes);
  return sunday.length ? gatheringLines(sunday) : undefined;
}
