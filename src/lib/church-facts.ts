// Safe to edit by hand
// The church's facts, resolved ONCE from Site settings (group "Church facts",
// src/sanity/schemaTypes/churchFacts.ts) into the shapes the site draws, and
// everything worked out from them: the "This Sunday" line, the "This week at
// Auburn" rows, the map links, the public calendar link, and the phone, email,
// Facebook, live stream and giving links the chrome and pages show (CLAUDE.md rule 15).
//
// Pure: no fetch, no clock (callers pass `now`), no Sanity client, so every
// decision is unit-tested in church-facts.test.ts. Components read facts from
// `resolveChurchFacts(await getSiteSettings())`, never off the raw document
// and never from a string typed into a component.
//
// FALLBACK. With Sanity empty (a fresh clone, or a field never filled in)
// each fact falls back to FALLBACK_FACTS below: the values the church
// publishes on its Facebook page, every one UNCONFIRMED, so they render with a
// "To confirm" tag. Nothing here is invented: there is no fallback phone.
//
// STEGA. Values that are parsed or put in URLs are cleaned with `plain()`
// even though their field names are in NON_STEGA_FIELDS, because the street
// and city (display strings, so they keep their click-to-edit payload in the
// preview) also go into the map URL.

import { CHURCH_TIME_ZONE, occurrences, type CalendarEvent } from './church-calendar.ts';

export const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;
export type Weekday = (typeof WEEKDAY_NAMES)[number];

const DAY_TITLES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ── Raw shapes (what SITE_SETTINGS_PROJECTION returns) ─────────────────────

export interface RawServiceTime {
  _key?: string | null;
  label?: string | null;
  day?: string | null;
  time?: string | null;
  note?: string | null;
  confirmed?: boolean | null;
}

export interface RawChurchFacts {
  title?: string | null;
  phone?: string | null;
  phoneConfirmed?: boolean | null;
  phoneTakesTexts?: boolean | null;
  memberLoginUrl?: string | null;
  email?: string | null;
  emailConfirmed?: boolean | null;
  churchAddress?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    findUs?: string | null;
    lat?: number | null;
    lng?: number | null;
    confirmed?: boolean | null;
  } | null;
  /** Site settings > Social & footer. The Facebook entry is the church's page. */
  socialLinks?: ({ platform?: string | null; url?: string | null } | null)[] | null;
  socialFacebook?: string | null;
  givingUrl?: string | null;
  liveStreamUrl?: string | null;
  officeHours?: string | null;
  serviceTimes?: (RawServiceTime | null)[] | null;
  foundedYear?: number | null;
  foundedConfirmed?: boolean | null;
  youtubeChannelId?: string | null;
  churchTracIcalUrl?: string | null;
}

// ── Resolved shapes ─────────────────────────────────────────────────────────

export interface ServiceTime {
  key: string;
  label: string;
  day: Weekday;
  /** 0 = Sunday ... 6 = Saturday. */
  dayIndex: number;
  /** Minutes after midnight on the church's clock. */
  minutes: number;
  /** "9:45 am", "11:00 am", "6:00 pm". */
  timeLabel: string;
  note: string;
  confirmed: boolean;
}

export interface ChurchAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  /** ["4241 Hamilton-Scipio Road", "Hamilton, OH 45013"] */
  lines: string[];
  /** "4241 Hamilton-Scipio Road, Hamilton, OH 45013" */
  oneLine: string;
  /** Google Maps search for the address. */
  mapsUrl: string;
  /** Apple Maps search for the same address. */
  appleMapsUrl: string;
  /** The map pin, when both halves are set. */
  geo: { lat: number; lng: number } | null;
  /** Jacob's own "how to find us" line, or "" (Home audit, 2026-10-17). */
  findUs: string;
  confirmed: boolean;
}

export interface ChurchFacts {
  address: ChurchAddress | null;
  serviceTimes: ServiceTime[];
  /** `sms` is set only when Church facts says the number takes texts ("Call or text"). */
  phone: { display: string; tel: string; sms: string | null; confirmed: boolean } | null;
  email: { display: string; href: string; confirmed: boolean } | null;
  /** Church Trac member sign-in (Church facts > Member sign-in link), or null. */
  memberLoginUrl: string | null;
  /** The church's Facebook page (Social links), or null. */
  facebookUrl: string | null;
  /** Where Sunday is watched live: the Live stream link, else the Facebook page, else null. */
  liveUrl: string | null;
  /** Online giving (Church facts > Online giving link), or null: Give stays on the site. */
  givingUrl: string | null;
  founded: { year: number; confirmed: boolean } | null;
  /** UC... channel id, or null: no Watch replay is fetched. */
  youtubeChannelId: string | null;
  /** The Church Trac iCal feed, or null: no events are fetched. */
  icalUrl: string | null;
  /** Church Trac's public calendar page, derived from the feed, or null. */
  calendarPageUrl: string | null;
  /** Office hours, one line each (Church facts > Office hours), or [] when not set. */
  officeHours: string[];
}

/**
 * The church's facts as published on its Facebook page (read 2026-10-17),
 * all unconfirmed. The address is the public directory listing; the ZIP is
 * the Census geocoder's match for it. Used only where Site settings is empty.
 */
export const FALLBACK_FACTS = {
  churchAddress: {
    street: '4241 Hamilton-Scipio Road',
    city: 'Hamilton',
    state: 'OH',
    zip: '45013',
    confirmed: false,
  },
  serviceTimes: [
    {
      _key: 'sunday-school',
      label: 'Sunday School for all ages',
      day: 'sunday',
      time: '09:45',
      note: '',
      confirmed: false,
    },
    {
      _key: 'worship',
      label: 'Worship',
      day: 'sunday',
      time: '11:00',
      note: 'about an hour',
      confirmed: false,
    },
    {
      _key: 'wednesday',
      label: 'Bible study and prayer',
      day: 'wednesday',
      time: '18:00',
      note: '',
      confirmed: false,
    },
  ],
  foundedYear: 1959,
  foundedConfirmed: false,
} satisfies RawChurchFacts;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Strip stega's invisible payload and trim; '' for anything not a string. */
export function plain(value?: string | null): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[​-‏﻿\u{E0000}-\u{E007F}]/gu, '').trim();
}

/** "09:45" -> 585, or null when it is not a 24-hour time. */
export function parseClock(value?: string | null): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(plain(value));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 585 -> "9:45 am", 660 -> "11:00 am", 720 -> "12:00 pm". */
export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/**
 * Several start times read as one phrase, sharing the meridiem where they
 * can: [585, 660] -> "9:45 and 11:00 am"; [660, 1080] -> "11:00 am and 6:00 pm".
 */
export function timesPhrase(minutes: number[]): string {
  if (minutes.length === 0) return '';
  const sorted = [...minutes].sort((a, b) => a - b);
  const labels = sorted.map(clockLabel);
  const sameHalf = sorted.every((m) => m < 720) || sorted.every((m) => m >= 720);
  const parts = sameHalf
    ? labels.map((l, i) => (i < labels.length - 1 ? l.slice(0, -3) : l))
    : labels;
  return parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** "A", "A and B", "A, B and C". */
export function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const DAY_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: CHURCH_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const CLOCK_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: CHURCH_TIME_ZONE,
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Today (YYYY-MM-DD) and minutes since midnight on the church's clock. */
export function churchNow(now: Date): { date: string; minutes: number } {
  const parts = CLOCK_FMT.formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { date: DAY_FMT.format(now), minutes: get('hour') * 60 + get('minute') };
}

/** Add days to a YYYY-MM-DD. */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday for a YYYY-MM-DD. */
export const weekdayOf = (iso: string): number => new Date(`${iso}T12:00:00Z`).getUTCDay();

/** "October 18" for a YYYY-MM-DD. */
export const monthDay = (iso: string): string =>
  `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;

/** "Sunday" for a YYYY-MM-DD. */
export const dayTitle = (iso: string): string => DAY_TITLES[weekdayOf(iso)];

/** Church Trac's public calendar page for its iCal feed, or null. */
export function calendarPageFor(icalUrl: string | null): string | null {
  if (!icalUrl) return null;
  try {
    const u = new URL(icalUrl.replace(/^webcal:/i, 'https:'));
    if (!/(^|\.)churchtrac\.com$/i.test(u.hostname)) return null;
    const code = u.searchParams.get('ui');
    if (!code || !/^[A-Za-z0-9]{4,32}$/.test(code)) return null;
    return `https://www.churchtrac.com/public_calendar?ui=${encodeURIComponent(code)}&view=listMonth`;
  } catch {
    return null;
  }
}

/** An https address, cleaned of stega, or null. */
export function httpsUrl(value?: string | null): string | null {
  const v = plain(value);
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/** The church's Facebook page: the Facebook row in Social links, else the legacy field. */
function facebookFrom(s: RawChurchFacts): string | null {
  const row = (s.socialLinks ?? []).find((l) => plain(l?.platform) === 'Facebook' && l?.url);
  return httpsUrl(row?.url) ?? httpsUrl(s.socialFacebook);
}

/** Digits for a tel: link, with the US country code. */
function telHref(display: string): string | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return null;
}

// ── The resolver ────────────────────────────────────────────────────────────

function resolveServiceTimes(raw: RawChurchFacts['serviceTimes']): ServiceTime[] {
  const out: ServiceTime[] = [];
  for (const [i, row] of (raw ?? []).entries()) {
    const label = row?.label?.trim() ?? '';
    const dayIndex = WEEKDAY_NAMES.indexOf(plain(row?.day) as Weekday);
    const minutes = parseClock(row?.time);
    if (!label || dayIndex < 0 || minutes === null) continue; // half-filled row: skip it
    out.push({
      key: plain(row?._key) || `service-${i}`,
      label,
      day: WEEKDAY_NAMES[dayIndex],
      dayIndex,
      minutes,
      timeLabel: clockLabel(minutes),
      note: row?.note?.trim() ?? '',
      confirmed: row?.confirmed === true,
    });
  }
  // Sunday first, then through the week, then by time.
  return out.sort((a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes);
}

function resolveAddress(raw: RawChurchFacts['churchAddress']): ChurchAddress | null {
  const street = raw?.street?.trim() ?? '';
  const city = raw?.city?.trim() ?? '';
  if (!street || !city) return null;
  const state = raw?.state?.trim() ?? '';
  const zip = raw?.zip?.trim() ?? '';
  const second = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const lines = [street, second];
  const oneLine = lines.join(', ');
  const query = [street, city, state, zip].map(plain).filter(Boolean).join(', ');
  const lat = typeof raw?.lat === 'number' && Math.abs(raw.lat) <= 90 ? raw.lat : null;
  const lng = typeof raw?.lng === 'number' && Math.abs(raw.lng) <= 180 ? raw.lng : null;
  return {
    street,
    city,
    state,
    zip,
    lines,
    oneLine,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    appleMapsUrl: `https://maps.apple.com/?q=${encodeURIComponent(query)}`,
    geo: lat !== null && lng !== null ? { lat, lng } : null,
    findUs: raw?.findUs?.trim() ?? '',
    confirmed: raw?.confirmed === true,
  };
}

export function resolveChurchFacts(raw?: RawChurchFacts | null): ChurchFacts {
  const s = raw ?? {};
  const hasAddress = !!(s.churchAddress?.street?.trim() && s.churchAddress?.city?.trim());
  const times = resolveServiceTimes(s.serviceTimes);
  const phone = s.phone?.trim() ?? '';
  const tel = phone ? telHref(plain(phone)) : null;
  const year = typeof s.foundedYear === 'number' ? s.foundedYear : null;
  const channel = plain(s.youtubeChannelId);
  const ical = plain(s.churchTracIcalUrl);
  const email = s.email?.trim() ?? '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(plain(email));
  const facebookUrl = facebookFrom(s);

  return {
    address: resolveAddress(hasAddress ? s.churchAddress : FALLBACK_FACTS.churchAddress),
    serviceTimes: times.length > 0 ? times : resolveServiceTimes(FALLBACK_FACTS.serviceTimes),
    phone:
      phone && tel
        ? {
            display: phone,
            tel,
            sms: s.phoneTakesTexts === true ? tel.replace(/^tel:/, 'sms:') : null,
            confirmed: s.phoneConfirmed === true,
          }
        : null,
    memberLoginUrl: httpsUrl(s.memberLoginUrl),
    email: emailOk
      ? { display: email, href: `mailto:${plain(email)}`, confirmed: s.emailConfirmed === true }
      : null,
    facebookUrl,
    liveUrl: httpsUrl(s.liveStreamUrl) ?? facebookUrl,
    givingUrl: httpsUrl(s.givingUrl),
    founded:
      year !== null
        ? { year, confirmed: s.foundedConfirmed === true }
        : { year: FALLBACK_FACTS.foundedYear, confirmed: false },
    youtubeChannelId: /^UC[\w-]{22}$/.test(channel) ? channel : null,
    icalUrl: /^(https|webcal):\/\//i.test(ical) ? ical.replace(/^webcal:/i, 'https:') : null,
    calendarPageUrl: calendarPageFor(ical || null),
    officeHours: plain(s.officeHours)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  };
}

// ── "This Sunday" ───────────────────────────────────────────────────────────

/** A Sunday still counts as "this Sunday" until this long after its last service starts. */
export const SUNDAY_GRACE_MINUTES = 90;

export interface ThisSunday {
  /** YYYY-MM-DD on the church's calendar. */
  date: string;
  /** "Sunday, October 18" */
  dateLabel: string;
  /** True when the date is today. */
  isToday: boolean;
  /** The Sunday gatherings, by time. */
  services: ServiceTime[];
  /** True only when every Sunday time is confirmed. */
  confirmed: boolean;
}

/**
 * The coming Sunday as of `now`, with its gatherings. On a Sunday it is
 * today until SUNDAY_GRACE_MINUTES after the last service starts, then next
 * week. Null when no Sunday gathering is set.
 */
export function thisSunday(facts: Pick<ChurchFacts, 'serviceTimes'>, now: Date): ThisSunday | null {
  const services = facts.serviceTimes.filter((s) => s.dayIndex === 0);
  if (services.length === 0) return null;
  const { date: today, minutes } = churchNow(now);
  const wd = weekdayOf(today);
  const lastStart = Math.max(...services.map((s) => s.minutes));
  let date = addDays(today, (7 - wd) % 7);
  if (wd === 0 && minutes > lastStart + SUNDAY_GRACE_MINUTES) date = addDays(today, 7);
  return {
    date,
    dateLabel: `Sunday, ${monthDay(date)}`,
    isToday: date === today,
    services,
    confirmed: services.every((s) => s.confirmed),
  };
}

/**
 * The Sunday gatherings before worship as one line, for pages that walk a visitor through
 * worship only (Plan your visit): "Sunday School for all ages meets at 9:45 am, before worship
 * at 11:00 am." Worship is the last Sunday gathering. Null with fewer than two on a Sunday.
 */
export function earlierSundayLine(
  facts: Pick<ChurchFacts, 'serviceTimes'>,
): { text: string; confirmed: boolean } | null {
  const sunday = facts.serviceTimes.filter((s) => s.dayIndex === 0);
  if (sunday.length < 2) return null;
  const last = sunday[sunday.length - 1];
  const earlier = sunday.slice(0, -1);
  const what = andList(earlier.map((s) => s.label));
  const verb = earlier.length === 1 ? 'meets' : 'meet';
  // "Worship" reads mid-sentence as "worship"; a label with more capitals ("Sunday School") keeps them.
  const lastLabel = /^[A-Z][a-z]*$/.test(last.label) ? last.label.toLowerCase() : last.label;
  return {
    text: `${what} ${verb} at ${timesPhrase(earlier.map((s) => s.minutes))}, before ${lastLabel} at ${last.timeLabel}.`,
    confirmed: sunday.every((s) => s.confirmed),
  };
}

// ── "This week at Auburn" ───────────────────────────────────────────────────

export interface WeekRow {
  key: string;
  /** YYYY-MM-DD */
  date: string;
  /** "Sunday", or "Today" */
  when: string;
  /** "October 18" */
  dateLabel: string;
  /** "Sunday School for all ages and Worship", or the event's title. */
  what: string;
  /** "9:45 and 11:00 am", "All day", or a time. */
  time: string;
  /** Event location from the calendar, or ''. */
  where: string;
  /** False when any service time on the row is unconfirmed; calendar events are the church's own. */
  confirmed: boolean;
  source: 'services' | 'calendar';
  /** A calendar event the church marked cancelled (shown struck through, not hidden). */
  cancelled: boolean;
}

/** How many days ahead "This week" looks (today plus six). */
export const WEEK_DAYS = 7;

/**
 * The next seven days: the regular gatherings (one row per day, merged), and
 * any calendar events in the same days, by date then time. Today's rows drop
 * off once they have started; a Sunday dropped that way comes back as next
 * Sunday. A calendar event at the same day and time as a regular gathering is
 * the same gathering entered in Church Trac too, and is left out.
 */
export function thisWeek(
  facts: Pick<ChurchFacts, 'serviceTimes'>,
  events: CalendarEvent[] | null | undefined,
  now: Date,
): WeekRow[] {
  const { date: today, minutes: nowMinutes } = churchNow(now);
  type Item = WeekRow & { start: number };
  const items: Item[] = [];
  const serviceSlots = new Set<string>();

  for (let i = 0; i <= WEEK_DAYS; i++) {
    const date = addDays(today, i);
    const wd = weekdayOf(date);
    const day = facts.serviceTimes.filter(
      (s) => s.dayIndex === wd && !(i === 0 && s.minutes <= nowMinutes),
    );
    for (const s of facts.serviceTimes.filter((x) => x.dayIndex === wd)) {
      serviceSlots.add(`${date}|${s.minutes}`);
    }
    if (day.length === 0) continue;
    // Day 7 only fills in for today's weekday when today's gatherings are over.
    if (
      i === WEEK_DAYS &&
      items.some((it) => it.source === 'services' && weekdayOf(it.date) === wd)
    ) {
      continue;
    }
    items.push({
      key: `services-${date}`,
      date,
      when: i === 0 ? 'Today' : DAY_TITLES[wd],
      dateLabel: monthDay(date),
      what: andList(day.map((s) => s.label)),
      time: timesPhrase(day.map((s) => s.minutes)),
      where: '',
      confirmed: day.every((s) => s.confirmed),
      source: 'services',
      cancelled: false,
      start: day[0].minutes,
    });
  }

  for (const o of occurrences(events ?? [], today, addDays(today, WEEK_DAYS - 1), {
    includeCancelled: true,
  })) {
    if (o.date === today && o.startMinutes !== null && o.startMinutes <= nowMinutes) continue;
    if (o.startMinutes !== null && serviceSlots.has(`${o.date}|${o.startMinutes}`)) continue;
    items.push({
      key: `event-${o.uid}-${o.date}`,
      date: o.date,
      when: o.date === today ? 'Today' : DAY_TITLES[weekdayOf(o.date)],
      dateLabel: monthDay(o.date),
      what: o.title,
      time: o.startMinutes === null ? 'All day' : clockLabel(o.startMinutes),
      where: o.location,
      confirmed: true,
      source: 'calendar',
      cancelled: o.cancelled,
      start: o.startMinutes ?? -1,
    });
  }

  return items
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
    .map(({ start: _start, ...row }) => row);
}

// ── Structured data ─────────────────────────────────────────────────────────

/**
 * The church facts that go into the site-wide JSON-LD (src/lib/schemas.ts),
 * each only once confirmed: search engines are never told a provisional fact
 * (schema convention, PORTS.md card 66). Empty until the church confirms.
 */
export function churchJsonLd(
  facts: Pick<ChurchFacts, 'address' | 'phone'> &
    Partial<Pick<ChurchFacts, 'serviceTimes' | 'email'>>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const a = facts.address;
  if (a?.confirmed) {
    out.address = {
      '@type': 'PostalAddress',
      streetAddress: plain(a.street),
      addressLocality: plain(a.city),
      ...(a.state ? { addressRegion: plain(a.state) } : {}),
      ...(a.zip ? { postalCode: plain(a.zip) } : {}),
      addressCountry: 'US',
    };
    // The pin belongs to the address, so it is told only with a confirmed address.
    if (a.geo) {
      out.geo = { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng };
    }
  }
  if (facts.phone?.confirmed) out.telephone = plain(facts.phone.display);
  if (facts.email?.confirmed) out.email = plain(facts.email.display);
  // Weekly gatherings as schema.org Events with a weekly Schedule (Home audit research,
  // 2026-10-17). Google gives no rich result for recurring services, but search and answer
  // engines read a clean what and when. Confirmed times only, like everything else here.
  const services = (facts.serviceTimes ?? []).filter((s) => s.confirmed);
  if (services.length > 0) {
    const hhmm = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    out.event = services.map((s) => ({
      '@type': 'Event',
      name: plain(s.label),
      eventSchedule: {
        '@type': 'Schedule',
        byDay: `https://schema.org/${s.day[0].toUpperCase()}${s.day.slice(1)}`,
        startTime: hhmm(s.minutes),
        repeatFrequency: 'P1W',
        scheduleTimezone: 'America/New_York',
      },
    }));
  }
  return out;
}

// ── Add Sunday to a calendar ────────────────────────────────────────────────

/**
 * A calendar file for the Sunday gatherings (Home audit research, 2026-10-17: at a small
 * church's scale the one calendar action worth having is "add Sunday to my calendar"). One
 * weekly event per Sunday gathering, starting this Sunday, at the church's address. Built at
 * build time from the same facts as the This Sunday card, so a time changes in one place.
 * Returns null while no Sunday time is confirmed: we never put a provisional time in someone's
 * calendar.
 */
export function sundayIcs(
  facts: Pick<ChurchFacts, 'serviceTimes' | 'address'> & { title?: string },
  now: Date,
  siteUrl: string,
): string | null {
  const sunday = thisSunday(facts, now);
  const services = (sunday?.services ?? []).filter((s) => s.confirmed);
  if (!sunday || services.length === 0) return null;
  const esc = (v: string) => plain(v).replace(/([,;\\])/g, '\\$1');
  const ymd = sunday.date.replace(/-/g, '');
  const at = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}00`;
  const name = facts.title ? esc(facts.title) : 'Church';
  const stamp = `${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//fbc-auburn//sunday//EN',
    'CALSCALE:GREGORIAN',
    // Eastern time, so the event stays at 9:45 local through the clock changes.
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
  ];
  for (const s of services) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:sunday-${s.key}@${siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${ymd}T${at(s.minutes)}`,
      'DURATION:PT1H',
      'RRULE:FREQ=WEEKLY;BYDAY=SU',
      `SUMMARY:${esc(s.label)}\\, ${name}`,
      ...(facts.address?.confirmed ? [`LOCATION:${esc(facts.address.oneLine)}`] : []),
      `URL:${siteUrl}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
