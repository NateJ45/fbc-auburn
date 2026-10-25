// Safe to edit by hand
// =============================================================================
// Every week: the church's regular gatherings as one list (audit 2026-10-25)
// =============================================================================
// Pure: no fetch, no clock (callers pass `now`). Used by the Events page's "Every week" list
// (src/components/church/EveryWeekList.astro), the per-gathering calendar files
// (src/pages/calendar/[key].ics.ts) and the Find your place hub's card anchors
// (src/components/sections/FindYourPlace.astro), so a gathering on Events can link to the card
// that describes it on Ministries.
//
// The gatherings ARE Site settings > Church facts > Service times, the same rows Home's "This
// week" merges by day, so the two pages cannot disagree (docs/agent/church-data.md).
import {
  addDays,
  churchNow,
  plain,
  weekdayOf,
  type ChurchFacts,
  type ServiceTime,
} from './church-facts.ts';

/** "Kids and youth" -> "kids-and-youth". */
export function slugify(title?: string | null): string {
  return (
    plain(title)
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'group'
  );
}

export interface FypShape {
  title?: string | null;
  cards?: { title?: string | null }[] | null;
}

/** The groups Find your place shows: named, with at least one card. */
export const keptGroups = <T extends FypShape>(groups: T[]): T[] =>
  groups.filter((g) => g.title && g.cards?.length);

/**
 * The ids Find your place gives its groups and cards, in order: one id space for the whole
 * section, so a card and a group never share one, and a repeated name gets "-2". Cards are
 * prefixed "fyp-" ("/ministries/#fyp-sunday-school") so a card id never takes a group's name.
 */
export function fypIds(groups: FypShape[]): { group: string; cards: string[] }[] {
  const seen = new Map<string, number>();
  const take = (base: string) => {
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  return groups.map((g) => ({
    group: take(slugify(g.title)),
    cards: (g.cards ?? []).map((c) => take(`fyp-${slugify(c.title)}`)),
  }));
}

export interface MinistryCard {
  title: string;
  /** The card's anchor on its page. */
  id: string;
}

/** Every card of a Find your place section with its anchor (first of a repeated name wins). */
export function ministryCards(groups: FypShape[]): MinistryCard[] {
  // The groups Find your place draws (a named group with cards), so the ids line up with its own.
  const kept = keptGroups(groups);
  const ids = fypIds(kept);
  const out: MinistryCard[] = [];
  kept.forEach((g, gi) =>
    (g.cards ?? []).forEach((c, ci) => {
      const title = plain(c.title);
      if (title) out.push({ title, id: ids[gi].cards[ci] });
    }),
  );
  return out;
}

/**
 * The card that describes a gathering: its label contains the card's title or the other way
 * round ("Sunday School for all ages" finds "Sunday School"), the longest title winning; null
 * when nothing matches.
 */
export function matchMinistry(label: string, cards: MinistryCard[]): MinistryCard | null {
  const want = plain(label).toLowerCase();
  if (!want) return null;
  let best: MinistryCard | null = null;
  for (const c of cards) {
    const t = c.title.toLowerCase();
    if (!(want.includes(t) || t.includes(want))) continue;
    if (!best || c.title.length > best.title.length) best = c;
  }
  return best;
}

const PLURAL_DAYS = [
  'Sundays',
  'Mondays',
  'Tuesdays',
  'Wednesdays',
  'Thursdays',
  'Fridays',
  'Saturdays',
];
/** "Sundays" for a weekday index. */
export const pluralDay = (dayIndex: number): string => PLURAL_DAYS[dayIndex] ?? '';

/** The gatherings in the order the week runs: Sunday first, then by time. */
export const everyWeek = (facts: Pick<ChurchFacts, 'serviceTimes'>): ServiceTime[] =>
  [...facts.serviceTimes].sort((a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes);

/** The next date (YYYY-MM-DD) a weekday falls on, today included. */
export function nextDateFor(dayIndex: number, now: Date): string {
  const today = churchNow(now).date;
  const ahead = (dayIndex - weekdayOf(today) + 7) % 7;
  return addDays(today, ahead);
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * A weekly calendar file for one gathering, or null while its time is not confirmed (the
 * church's rule since /sunday.ics: never put a provisional time in someone's calendar).
 */
export function gatheringIcs(
  facts: Pick<ChurchFacts, 'serviceTimes' | 'address'> & { title?: string },
  key: string,
  now: Date,
  siteUrl: string,
): string | null {
  const s = facts.serviceTimes.find((x) => x.key === key);
  if (!s || !s.confirmed) return null;
  const esc = (v: string) => plain(v).replace(/([,;\\])/g, '\\$1');
  const ymd = nextDateFor(s.dayIndex, now).replace(/-/g, '');
  const hh = String(Math.floor(s.minutes / 60)).padStart(2, '0');
  const mm = String(s.minutes % 60).padStart(2, '0');
  const stamp = `${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const host = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const name = facts.title ? esc(facts.title) : 'Church';
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//fbc-auburn//gatherings//EN',
      'CALSCALE:GREGORIAN',
      // Eastern time, so the event keeps its local time through the clock changes.
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:weekly-${s.key}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${ymd}T${hh}${mm}00`,
      'DURATION:PT1H',
      `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[s.dayIndex]}`,
      `SUMMARY:${esc(s.label)}\\, ${name}`,
      ...(facts.address?.confirmed ? [`LOCATION:${esc(facts.address.oneLine)}`] : []),
      `URL:${siteUrl}/events/`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n'
  );
}
