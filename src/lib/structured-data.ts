// Safe to edit by hand
// Structured data (JSON-LD) for the church's calendar (audit DEV-M5 and PENDING 1zx, 2026-10-25).
// The Events block lists the next dated events from the Church Trac feed; this turns the same rows
// into schema.org Events, so search and answer engines read a clean what, when and where. Pure and
// free of `@/` imports, so `node --test` runs it (structured-data.test.ts).
//
// Weekly services are NOT here: the Church JSON-LD on every page carries them, and only once each
// time is confirmed (churchJsonLd in church-facts.ts). Calendar rows are the church's own feed, so
// they need no confirming.
import { CHURCH_TIME_ZONE, addDays, weekday, type DatedItem } from './church-calendar.ts';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

/**
 * The church's UTC offset ("-04:00" in summer, "-05:00" in winter) at a local date and time.
 * Read from Intl for the instant five hours after that wall-clock time read as UTC, which lands
 * on the right side of a clock change for every hour but the changeover itself.
 */
export function churchOffset(date: string, minutes: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 0, minutes) + 5 * 3_600_000);
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone: CHURCH_TIME_ZONE, timeZoneName: 'longOffset' })
      .formatToParts(guess)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-05:00';
  const off = name.replace('GMT', '');
  return off === '' ? '+00:00' : off;
}

/** A local date and minutes after midnight as ISO 8601 with the church's offset. */
export function churchDateTime(date: string, minutes: number): string {
  const day = addDays(date, Math.floor(minutes / 1440));
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${day}T${hhmm(m)}:00${churchOffset(day, m)}`;
}

export interface EventsLdOptions {
  /** The church's @id from the site-wide Church JSON-LD ("https://.../#business"). */
  organizerId: string;
  churchName: string;
  /** The church's confirmed PostalAddress, when there is one (churchJsonLd(...).address). */
  address?: unknown;
}

/** One schema.org Event per calendar row; null when there are none. */
export function calendarEventsJsonLd(rows: DatedItem[], opts: EventsLdOptions): string | null {
  if (!rows.length) return null;
  const events = rows.map((r) => {
    const timed = r.startMinutes !== null;
    const start = timed ? churchDateTime(r.date, r.startMinutes!) : r.date;
    const end =
      timed && r.durationMinutes
        ? churchDateTime(r.date, r.startMinutes! + r.durationMinutes)
        : !timed && r.allDayDays > 1
          ? addDays(r.date, r.allDayDays - 1)
          : undefined;
    const description = r.description?.trim();
    return {
      '@type': 'Event',
      name: r.title,
      startDate: start,
      ...(end ? { endDate: end } : {}),
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: r.location?.trim() || opts.churchName,
        // The church's own address only when the event is at the church (no other place named).
        ...(opts.address && !r.location?.trim() ? { address: opts.address } : {}),
      },
      organizer: { '@id': opts.organizerId },
      ...(description ? { description: description.slice(0, 300) } : {}),
      // A run the block shows as one row ("Tuesdays through Nov 18"): say it repeats weekly.
      ...(r.through && r.times > 1
        ? {
            eventSchedule: {
              '@type': 'Schedule',
              repeatFrequency: 'P1W',
              byDay: `https://schema.org/${DAYS[weekday(r.date)]}`,
              startDate: r.date,
              endDate: r.through,
              ...(timed ? { startTime: hhmm(r.startMinutes!) } : {}),
              scheduleTimezone: CHURCH_TIME_ZONE,
            },
          }
        : {}),
    };
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': events });
}
