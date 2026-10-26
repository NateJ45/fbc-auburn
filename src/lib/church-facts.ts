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
  churchTracUrl?: string | null;
  connectCardUrl?: string | null;
  contactFormUrl?: string | null;
  prayerFormUrl?: string | null;
  newsletterFormUrl?: string | null;
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
  /** Church facts > A different Sunday: dated changes to the usual times (2026-10-26). */
  timeChanges?: (RawTimeChange | null)[] | null;
}

/** One "A different Sunday" entry as Sanity holds it (churchFacts.ts `timeChanges`). */
export interface RawTimeChange {
  _key?: string | null;
  /** YYYY-MM-DD on the church's calendar. */
  date?: string | null;
  /** 'time' (a different time), 'cancelled', or 'extra' (an extra service). */
  change?: string | null;
  /** Which gathering: a Service times row's key, its name ("Worship"), or 'all' / empty for every one that day. */
  service?: string | null;
  /** The new start time, "10:30", "10:30 am" or "6 pm" (for 'time' and 'extra'). */
  time?: string | null;
  /** What the extra service is called ("Christmas Eve candlelight"). */
  label?: string | null;
  /** An optional short note ("Weather: no Sunday School today"). */
  note?: string | null;
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
  /** Church Trac member sign-in (Church Trac > Member sign-in link), or null. */
  memberLoginUrl: string | null;
  /** Church Trac (docs/agent/church-trac.md): the church's address and four forms, each or null. */
  churchTracUrl: string | null;
  connectCardUrl: string | null;
  contactFormUrl: string | null;
  prayerFormUrl: string | null;
  /** The Church Trac form that adds people to the church's email list (the newsletter). */
  newsletterFormUrl: string | null;
  /** The church's Facebook page (Social links), or null. */
  facebookUrl: string | null;
  /**
   * Where Sunday is watched live: the Live stream link, else the YouTube channel's live page
   * (once a channel id is set), else the Facebook page, else null (2026-10-24; live-service.ts).
   */
  liveUrl: string | null;
  /** Which service liveUrl is on, for the words ("Watch live on Facebook"), or null. */
  liveVia: 'YouTube' | 'Facebook' | null;
  /** Online giving (Church Trac > Online giving link), or null: Give stays on the site. */
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
  /**
   * A different Sunday (2026-10-26): the dated changes to the usual times, by date, past ones
   * included (the resolver has no clock; dayPlan() and upcomingChanges() pick the ones that apply).
   */
  timeChanges: TimeChange[];
}

export type TimeChangeKind = 'time' | 'cancelled' | 'extra';

export interface TimeChange {
  key: string;
  /** YYYY-MM-DD on the church's calendar. */
  date: string;
  kind: TimeChangeKind;
  /** The gathering it is about (a key or a name), or '' for every gathering that day. */
  service: string;
  /** The new start time, minutes after midnight ('time' and 'extra'), else null. */
  minutes: number | null;
  /** An extra service's name, else ''. */
  label: string;
  note: string;
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
  // A time two gatherings share is said once: [1080, 1080] -> "6:00 pm", never "6:00 and 6:00 pm".
  const sorted = [...new Set(minutes)].sort((a, b) => a - b);
  const labels = sorted.map(clockLabel);
  const sameHalf = sorted.every((m) => m < 720) || sorted.every((m) => m >= 720);
  const parts = sameHalf
    ? labels.map((l, i) => (i < labels.length - 1 ? l.slice(0, -3) : l))
    : labels;
  return parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** The gatherings of one day that start at the same minute, with each one's own name. */
export interface TimeSlot {
  minutes: number;
  /** "6:00 pm" */
  timeLabel: string;
  /** Each gathering's own label, in the order Church facts lists them. */
  labels: string[];
  /** "Bible study and prayer, Youth": the names side by side, never merged into one. */
  what: string;
  confirmed: boolean;
}

/**
 * One day's gatherings grouped by start time (re-audit 2026-10-26): two gatherings at 6:00 pm make
 * ONE slot, "6:00 pm · Bible study and prayer, Youth", never "6:00 and 6:00 pm". Earliest first.
 */
export function timeSlots(
  services: readonly (Pick<ServiceTime, 'minutes' | 'label'> & { confirmed?: boolean })[],
): TimeSlot[] {
  const by = new Map<number, TimeSlot>();
  for (const s of services) {
    const slot = by.get(s.minutes) ?? {
      minutes: s.minutes,
      timeLabel: clockLabel(s.minutes),
      labels: [],
      what: '',
      confirmed: true,
    };
    const label = plain(s.label);
    if (label && !slot.labels.includes(label)) slot.labels.push(label);
    slot.confirmed = slot.confirmed && s.confirmed !== false;
    by.set(s.minutes, slot);
  }
  return [...by.values()]
    .sort((a, b) => a.minutes - b.minutes)
    .map((slot) => ({ ...slot, what: slot.labels.join(', ') }));
}

/** One line of the weekly rhythm: a day and a start time, with what happens then. */
export interface RhythmRow extends TimeSlot {
  dayIndex: number;
  /** "Wednesday" */
  day: string;
}

/**
 * The week's regular gatherings as one row per day AND time, Sunday first (Home's "This week"
 * lines; the Events "Every week" list shows the same gatherings one by one).
 */
export function weeklyRhythm(
  serviceTimes: readonly Pick<ServiceTime, 'dayIndex' | 'minutes' | 'label' | 'confirmed'>[],
): RhythmRow[] {
  const days = [...new Set(serviceTimes.map((s) => s.dayIndex))].sort((a, b) => a - b);
  return days.flatMap((d) =>
    timeSlots(serviceTimes.filter((s) => s.dayIndex === d)).map((slot) => ({
      ...slot,
      dayIndex: d,
      day: DAY_TITLES[d],
    })),
  );
}

/**
 * A gathering's name cut to its first words for a short line: "Sunday School for all ages" ->
 * "Sunday School". Stops at " for ", " with ", " (", " - " or a comma; a label with none of those
 * comes back whole.
 */
export function shortLabel(label?: string | null): string {
  const text = plain(label);
  const cut = text.split(/\s+(?:for|with)\s+|\s*\(|\s+[-–]\s+|,/i)[0]?.trim();
  return cut || text;
}

/**
 * The short Sunday times line the chrome shows (re-audit 2026-10-26): each time with its own
 * gathering's name, "Sunday School 9:45 · Worship 11:00", so two times never read as two services.
 * Built from Church facts' labels, never typed. When every time is in the morning (or every one in
 * the evening) the am/pm is left off, as the day already says it; mixed, each keeps its own. Any
 * gathering without a label falls back to the old phrase, "Sundays 9:45 and 11:00 am".
 */
export function namedTimes(
  services: readonly (Pick<ServiceTime, 'minutes' | 'label'> & { confirmed?: boolean })[],
  fallbackDay = 'Sundays',
): string {
  if (services.length === 0) return '';
  if (services.some((s) => !plain(s.label))) {
    return `${fallbackDay} ${timesPhrase(services.map((s) => s.minutes))}`;
  }
  const slots = timeSlots(services);
  const sameHalf = slots.every((s) => s.minutes < 720) || slots.every((s) => s.minutes >= 720);
  return slots
    .map((slot) => {
      const time = sameHalf ? slot.timeLabel.slice(0, -3) : slot.timeLabel;
      return `${andList(slot.labels.map(shortLabel))} ${time}`;
    })
    .join(' · ');
}

/**
 * A day as an editor typed it ("Wednesdays", "Sunday mornings") with that day's gathering times
 * from Church facts added: "Wednesdays, 6:00 pm". Text that does not start with a weekday, or a
 * day with no times on file, comes back as typed. Times are never typed into a card (the Find
 * your place cards and Home's bands both use this).
 *
 * `name` (a card's title) narrows the day to its own gathering when one is named after it: on a
 * Sunday with "Sunday School for all ages" at 9:45 and "Worship" at 11:00, a "Sunday School" card
 * gets 9:45 only, while a "Kids" card (no gathering of that name) gets both.
 */
export function dayWithTimes(
  day: string,
  serviceTimes: readonly Pick<ServiceTime, 'dayIndex' | 'minutes' | 'label'>[],
  name?: string,
): string {
  const first = plain(day).toLowerCase().split(/[\s,]/)[0]?.replace(/s$/, '') ?? '';
  const dayIndex = WEEKDAY_NAMES.indexOf(first as Weekday);
  if (dayIndex < 0) return day;
  const onDay = serviceTimes.filter((s) => s.dayIndex === dayIndex);
  const want = plain(name).toLowerCase().trim();
  const named = want
    ? onDay.filter((s) => {
        const label = plain(s.label).toLowerCase().trim();
        return label !== '' && (label.includes(want) || want.includes(label));
      })
    : [];
  const set = named.length ? named : onDay;
  if (set.length === 0) return day;
  // Two or more start times are named (re-audit 2026-10-26), so they never read as two services:
  // "Sundays: Sunday School 9:45 · Worship 11:00". One time stays "Wednesdays, 6:00 pm".
  const slots = new Set(set.map((s) => s.minutes));
  if (slots.size > 1 && set.every((s) => plain(s.label))) return `${day}: ${namedTimes(set)}`;
  return `${day}, ${timesPhrase(set.map((s) => s.minutes))}`;
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
/** The service a live link is on, read from its host; null for anything else. */
export function liveVia(url: string | null): 'YouTube' | 'Facebook' | null {
  if (!url) return null;
  if (/^https:\/\/([\w-]+\.)?(youtube\.com|youtu\.be)\//i.test(url)) return 'YouTube';
  if (/^https:\/\/([\w-]+\.)?(facebook\.com|fb\.watch|fb\.com)\//i.test(url)) return 'Facebook';
  return null;
}

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
  const channelId = /^UC[\w-]{22}$/.test(channel) ? channel : null;
  const liveUrl =
    httpsUrl(s.liveStreamUrl) ??
    (channelId ? `https://www.youtube.com/channel/${channelId}/live` : null) ??
    facebookUrl;

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
    churchTracUrl: httpsUrl(s.churchTracUrl),
    connectCardUrl: httpsUrl(s.connectCardUrl),
    contactFormUrl: httpsUrl(s.contactFormUrl),
    prayerFormUrl: httpsUrl(s.prayerFormUrl),
    newsletterFormUrl: httpsUrl(s.newsletterFormUrl),
    email: emailOk
      ? { display: email, href: `mailto:${plain(email)}`, confirmed: s.emailConfirmed === true }
      : null,
    facebookUrl,
    liveUrl,
    liveVia: liveVia(liveUrl),
    givingUrl: httpsUrl(s.givingUrl),
    founded:
      year !== null
        ? { year, confirmed: s.foundedConfirmed === true }
        : { year: FALLBACK_FACTS.foundedYear, confirmed: false },
    youtubeChannelId: channelId,
    icalUrl: /^(https|webcal):\/\//i.test(ical) ? ical.replace(/^webcal:/i, 'https:') : null,
    calendarPageUrl: calendarPageFor(ical || null),
    officeHours: plain(s.officeHours)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
    timeChanges: resolveTimeChanges(s.timeChanges),
  };
}

// ── A different Sunday: dated changes to the usual times (2026-10-26) ───────
//
// Jacob adds an entry in Church facts (a date, what changes, an optional note) and every place
// that shows that day's times shows the change; the day after, it is simply in the past and the
// usual times come back. Nothing is retyped (rule 15). The site is static, so "on that day" means
// "in the builds whose clock is on or before that day": the publish webhook rebuilds as soon as the
// entry is published, and deploy.yml rebuilds every morning (10:00 UTC), so the change is gone
// from the first build of the next day (docs/agent/church-data.md, "A different Sunday").

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real YYYY-MM-DD, or ''. */
function isoDate(value?: string | null): string {
  const v = plain(value);
  const m = ISO_DATE.exec(v);
  if (!m) return '';
  const d = new Date(`${v}T12:00:00Z`);
  return d.toISOString().slice(0, 10) === v ? v : '';
}

/**
 * A start time the way people type it, to minutes after midnight: "10:30", "10:30 am", "6 pm",
 * "6:30pm", "18:00", "noon". A bare hour ("6") is too unsure to guess, so it is null; "6:00" with no
 * am or pm is read on the 24-hour clock (6 in the morning), and the Studio warns about it.
 */
export function parseFriendlyTime(value?: string | null): number | null {
  const t = plain(value).toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (t === 'noon' || t === '12 noon') return 720;
  const m = /^(\d{1,2})(?::([0-5]\d))?\s*(am|pm|a|p)?$/.exec(t);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3];
  if (mer) {
    if (h < 1 || h > 12) return null;
    if (mer.startsWith('p') && h !== 12) h += 12;
    if (mer.startsWith('a') && h === 12) h = 0;
  } else {
    if (!m[2] || h > 23) return null;
  }
  return h * 60 + min;
}

const CHANGE_KINDS: readonly TimeChangeKind[] = ['time', 'cancelled', 'extra'];

/** The entries as the site uses them: half-filled ones dropped, by date. */
export function resolveTimeChanges(raw: RawChurchFacts['timeChanges']): TimeChange[] {
  const out: TimeChange[] = [];
  for (const [i, row] of (raw ?? []).entries()) {
    const date = isoDate(row?.date);
    const kind = plain(row?.change) as TimeChangeKind;
    if (!date || !CHANGE_KINDS.includes(kind)) continue;
    const minutes = parseFriendlyTime(row?.time);
    const label = plain(row?.label).slice(0, 80);
    const service = plain(row?.service);
    if (kind === 'time' && (minutes === null || !service || service === 'all')) continue;
    if (kind === 'extra' && (minutes === null || !label)) continue;
    out.push({
      key: plain(row?._key) || `change-${i}`,
      date,
      kind,
      service: service === 'all' ? '' : service,
      minutes: kind === 'cancelled' ? null : minutes,
      label: kind === 'extra' ? label : '',
      note: plain(row?.note).slice(0, 120),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * The regular gatherings an entry is about: every one that day for '' (or 'all'), else the one
 * whose key matches, else the one whose name does ("Worship", or the short name "Sunday School"
 * for "Sunday School for all ages"). Only gatherings that meet on that weekday can match, so a
 * Worship change dated on a Thursday changes nothing (the Studio warns about it).
 */
export function matchGatherings(service: string, onDay: readonly ServiceTime[]): ServiceTime[] {
  const want = plain(service).toLowerCase();
  if (!want || want === 'all') return [...onDay];
  const byKey = onDay.filter((s) => s.key.toLowerCase() === want);
  if (byKey.length) return byKey;
  const byName = onDay.filter((s) => plain(s.label).toLowerCase() === want);
  if (byName.length) return byName;
  return onDay.filter((s) => shortLabel(s.label).toLowerCase() === want);
}

/** One gathering as it happens on a given date. */
export interface PlannedService extends ServiceTime {
  /** The usual start ("11:00 am") when this date's is different, else null. */
  movedFrom: string | null;
  /** True for an extra service on this date only. */
  extra: boolean;
}

/** What happens on one date: the usual gatherings with that date's changes made. */
export interface DayPlan {
  date: string;
  /** What meets, by time. */
  services: PlannedService[];
  /** The usual gatherings that do not meet that day. */
  cancelled: ServiceTime[];
  /** The entries' notes, in order. */
  notes: string[];
  /** True when any entry changed anything (or left a note). */
  changed: boolean;
}

/** The entries dated on `date`. */
const changesOn = (facts: Partial<Pick<ChurchFacts, 'timeChanges'>>, date: string): TimeChange[] =>
  (facts.timeChanges ?? []).filter((c) => c.date === date);

/** One date's gatherings, with that date's entries applied. A cancellation beats a new time. */
export function dayPlan(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
  date: string,
): DayPlan {
  const wd = weekdayOf(date);
  const onDay = facts.serviceTimes.filter((s) => s.dayIndex === wd);
  const changes = changesOn(facts, date);
  const cancelled = new Set<string>();
  const moved = new Map<string, number>();
  const extras: PlannedService[] = [];
  for (const c of changes) {
    if (c.kind === 'extra' && c.minutes !== null) {
      extras.push({
        key: `extra-${c.key}`,
        label: c.label,
        day: WEEKDAY_NAMES[wd],
        dayIndex: wd,
        minutes: c.minutes,
        timeLabel: clockLabel(c.minutes),
        note: '',
        // Typed by the church itself for this one day, so it is the church's own word.
        confirmed: true,
        movedFrom: null,
        extra: true,
      });
      continue;
    }
    for (const s of matchGatherings(c.service, onDay)) {
      if (c.kind === 'cancelled') cancelled.add(s.key);
      else if (c.kind === 'time' && c.minutes !== null) moved.set(s.key, c.minutes);
    }
  }
  const services: PlannedService[] = onDay
    .filter((s) => !cancelled.has(s.key))
    .map((s) => {
      const m = moved.get(s.key);
      return m === undefined || m === s.minutes
        ? { ...s, movedFrom: null, extra: false }
        : {
            ...s,
            minutes: m,
            timeLabel: clockLabel(m),
            movedFrom: s.timeLabel,
            confirmed: true,
            extra: false,
          };
    });
  services.push(...extras);
  services.sort((a, b) => a.minutes - b.minutes);
  const notes = changes.map((c) => c.note).filter(Boolean);
  const changedAny =
    cancelled.size > 0 ||
    extras.length > 0 ||
    services.some((s) => s.movedFrom !== null) ||
    notes.length > 0;
  return {
    date,
    services,
    cancelled: onDay.filter((s) => cancelled.has(s.key)),
    notes: [...new Set(notes)],
    changed: changedAny,
  };
}

/** "A", "A or B", "A, B or C". */
function orList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;
}

/**
 * A changed day in one or two short sentences, for the line beside the times: "Worship at
 * 10:30 am instead of 11:00 am. No Sunday School. Weather: no Sunday School today." '' when the day
 * is as usual.
 */
export function changeSummary(plan: Pick<DayPlan, 'services' | 'cancelled' | 'notes'>): string {
  const parts: string[] = [];
  for (const s of plan.services) {
    if (s.movedFrom) parts.push(`${s.label} at ${s.timeLabel} instead of ${s.movedFrom}.`);
    else if (s.extra) parts.push(`${s.label} at ${s.timeLabel}.`);
  }
  if (plan.cancelled.length) {
    parts.push(`No ${orList([...new Set(plan.cancelled.map((s) => shortLabel(s.label)))])}.`);
  }
  for (const n of plan.notes) parts.push(/[.!?]$/.test(n) ? n : `${n}.`);
  return parts.join(' ');
}

/** The entries from today on (church clock), by date. Past ones are ignored everywhere. */
export function upcomingChanges(
  facts: Partial<Pick<ChurchFacts, 'timeChanges'>>,
  now: Date,
): TimeChange[] {
  const today = churchNow(now).date;
  return (facts.timeChanges ?? []).filter((c) => c.date >= today);
}

/** The church's UTC offset at an instant, in minutes (-240 in summer, -300 in winter). */
function zoneOffset(at: Date): number {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone: CHURCH_TIME_ZONE, timeZoneName: 'longOffset' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(name);
  if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** A wall time on the church's clock as ISO 8601 with its offset: "2026-11-01T10:30:00-05:00". */
export function churchIso(date: string, minutes: number): string {
  const [y, mo, d] = date.split('-').map(Number);
  const wall = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60);
  const off = zoneOffset(new Date(wall - zoneOffset(new Date(wall)) * 60_000));
  const abs = Math.abs(off);
  const hhmm = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return `${date}T${hhmm(minutes)}:00${off < 0 ? '-' : '+'}${hhmm(abs)}`;
}

/**
 * For the calendar files: the upcoming dates one regular gathering does not meet at its usual
 * time (cancelled or moved), and the moved ones' new times.
 */
export function gatheringExceptions(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
  key: string,
  now: Date,
): { skip: string[]; moved: { date: string; minutes: number }[] } {
  const skip: string[] = [];
  const moved: { date: string; minutes: number }[] = [];
  for (const date of [...new Set(upcomingChanges(facts, now).map((c) => c.date))]) {
    const plan = dayPlan(facts, date);
    const m = plan.services.find((s) => s.key === key && s.movedFrom);
    if (m) {
      skip.push(date);
      moved.push({ date, minutes: m.minutes });
    } else if (plan.cancelled.some((s) => s.key === key)) {
      skip.push(date);
    }
  }
  return { skip, moved };
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
  /**
   * What meets that Sunday, by time: the usual gatherings with any "A different Sunday" entry
   * for that date made (a new time, one cancelled, an extra service). May be empty when
   * everything is cancelled.
   */
  services: PlannedService[];
  /** The usual Sunday gatherings, whatever that date's changes. */
  regular: ServiceTime[];
  /** The usual gatherings that do not meet that Sunday. */
  cancelled: ServiceTime[];
  /** True when that Sunday is not as usual (or has a note). */
  changed: boolean;
  /** The change in a sentence or two ("Worship at 10:30 am instead of 11:00 am."), or ''. */
  change: string;
  /** True only when every Sunday time is confirmed. */
  confirmed: boolean;
}

/**
 * The coming Sunday as of `now`, with its gatherings. On a Sunday it is
 * today until SUNDAY_GRACE_MINUTES after the last service starts, then next
 * week. Null when no Sunday gathering is set.
 */
export function thisSunday(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
  now: Date,
): ThisSunday | null {
  const regular = facts.serviceTimes.filter((s) => s.dayIndex === 0);
  if (regular.length === 0) return null;
  const { date: today, minutes } = churchNow(now);
  const wd = weekdayOf(today);
  let date = addDays(today, (7 - wd) % 7);
  if (wd === 0) {
    // Today's own plan decides when "today" is over: a later start keeps it today for longer.
    const starts = [...regular, ...dayPlan(facts, today).services].map((s) => s.minutes);
    if (minutes > Math.max(...starts) + SUNDAY_GRACE_MINUTES) date = addDays(today, 7);
  }
  const plan = dayPlan(facts, date);
  return {
    date,
    dateLabel: `Sunday, ${monthDay(date)}`,
    isToday: date === today,
    services: plan.services,
    regular,
    cancelled: plan.cancelled,
    changed: plan.changed,
    change: plan.changed ? changeSummary(plan) : '',
    confirmed: plan.services.every((s) => s.confirmed),
  };
}

/**
 * The Sunday gatherings the chrome's short lines name (the times band, the Sunday bar, the menu,
 * the footer): the coming Sunday's when it is changed, else the usual ones.
 */
export function sundayLineServices(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
  now: Date,
): { services: ServiceTime[]; sunday: ThisSunday | null } {
  const sunday = thisSunday(facts, now);
  const regular = facts.serviceTimes.filter((s) => s.dayIndex === 0);
  return { services: sunday?.changed ? sunday.services : regular, sunday };
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
  /**
   * A different Sunday (2026-10-26): what is different about this row ("Instead of 11:00 am",
   * "This week only", "Cancelled this week"), with the day's note on its first row, or ''.
   */
  note: string;
}

/** How many days ahead "This week" looks (today plus six). */
export const WEEK_DAYS = 7;

/**
 * The next seven days: the regular gatherings (one row per day and start time), and
 * any calendar events in the same days, by date then time. Today's rows drop
 * off once they have started; a Sunday dropped that way comes back as next
 * Sunday. A calendar event at the same day and time as a regular gathering is
 * the same gathering entered in Church Trac too, and is left out.
 */
export function thisWeek(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
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
    // A different Sunday (2026-10-26): the day's gatherings with that date's entries made.
    const plan = dayPlan(facts, date);
    const upcoming = (s: { minutes: number }) => !(i === 0 && s.minutes <= nowMinutes);
    const day = plan.services.filter(upcoming);
    const off = plan.cancelled.filter(upcoming);
    for (const s of [...facts.serviceTimes.filter((x) => x.dayIndex === wd), ...plan.services]) {
      serviceSlots.add(`${date}|${s.minutes}`);
    }
    if (day.length === 0 && off.length === 0) continue;
    // Day 7 only fills in for today's weekday when today's gatherings are over.
    if (
      i === WEEK_DAYS &&
      items.some((it) => it.source === 'services' && weekdayOf(it.date) === wd)
    ) {
      continue;
    }
    const before = items.length;
    // One row per start time (re-audit 2026-10-26): Sunday School at 9:45 and Worship at 11:00 are
    // two rows, and two gatherings at 6:00 pm share one row with both names.
    for (const slot of timeSlots(day)) {
      const inSlot = day.filter((s) => s.minutes === slot.minutes);
      const moved = inSlot.find((s) => s.movedFrom);
      items.push({
        key: `services-${date}-${slot.minutes}`,
        date,
        when: i === 0 ? 'Today' : DAY_TITLES[wd],
        dateLabel: monthDay(date),
        what: slot.what,
        time: slot.timeLabel,
        where: '',
        confirmed: slot.confirmed,
        source: 'services',
        cancelled: false,
        note: moved
          ? `Instead of ${moved.movedFrom}`
          : inSlot.every((s) => s.extra)
            ? 'This week only'
            : '',
        start: slot.minutes,
      });
    }
    // A cancelled gathering stays on the list, struck through, so nobody thinks it was forgotten.
    for (const s of off) {
      items.push({
        key: `cancelled-${date}-${s.key}`,
        date,
        when: i === 0 ? 'Today' : DAY_TITLES[wd],
        dateLabel: monthDay(date),
        what: s.label,
        time: s.timeLabel,
        where: '',
        confirmed: true,
        source: 'services',
        cancelled: true,
        note: 'Cancelled this week',
        start: s.minutes,
      });
    }
    // The day's own note goes on its first row.
    const dayRows = items.slice(before).sort((a, b) => a.start - b.start);
    if (plan.notes.length && dayRows[0]) {
      const first = dayRows[0];
      first.note = [first.note, ...plan.notes].filter(Boolean).join('. ');
    }
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
      note: '',
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
    Partial<Pick<ChurchFacts, 'serviceTimes' | 'email' | 'timeChanges'>>,
  /** The build moment; with it, upcoming "A different Sunday" entries are told too. */
  now?: Date,
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
    // In person, at the church (the confirmed address when there is one), every week. The
    // attendance mode and status are what validators ask an Event for (audit DEV-M5, 2026-10-25).
    out.event = services.map((s) => {
      // A different Sunday: the dates it does not meet at its usual time come off the schedule.
      const skip = now
        ? gatheringExceptions(
            { serviceTimes: services, timeChanges: facts.timeChanges },
            s.key,
            now,
          )
        : null;
      return {
        '@type': 'Event',
        name: plain(s.label),
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        ...(out.address ? { location: { '@type': 'Place', address: out.address } } : {}),
        eventSchedule: {
          '@type': 'Schedule',
          byDay: `https://schema.org/${s.day[0].toUpperCase()}${s.day.slice(1)}`,
          startTime: hhmm(s.minutes),
          repeatFrequency: 'P1W',
          scheduleTimezone: 'America/New_York',
          ...(skip?.skip.length ? { exceptDate: skip.skip } : {}),
        },
      };
    });
  }
  // A different Sunday (2026-10-26): each upcoming changed date as its own dated Event, so search
  // and answer engines hear "Worship is at 10:30 this Sunday", "cancelled" or the extra service.
  // A change to a gathering is told only once that gathering's usual time is confirmed; an extra
  // service is the church's own entry, so it is told as it is.
  if (now && facts.serviceTimes) {
    const all = facts as Pick<ChurchFacts, 'serviceTimes'> &
      Partial<Pick<ChurchFacts, 'timeChanges'>>;
    const place = out.address ? { location: { '@type': 'Place', address: out.address } } : {};
    const oneOff: Record<string, unknown>[] = [];
    for (const date of [...new Set(upcomingChanges(all, now).map((c) => c.date))]) {
      const plan = dayPlan(all, date);
      const usual = (key: string) => all.serviceTimes.find((s) => s.key === key);
      for (const s of plan.services) {
        if (s.extra || (s.movedFrom && usual(s.key)?.confirmed)) {
          const base = usual(s.key);
          oneOff.push({
            '@type': 'Event',
            name: plain(s.label),
            startDate: churchIso(date, s.minutes),
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: s.extra
              ? 'https://schema.org/EventScheduled'
              : 'https://schema.org/EventRescheduled',
            ...(base && s.movedFrom ? { previousStartDate: churchIso(date, base.minutes) } : {}),
            ...place,
          });
        }
      }
      for (const s of plan.cancelled.filter((x) => x.confirmed)) {
        oneOff.push({
          '@type': 'Event',
          name: plain(s.label),
          startDate: churchIso(date, s.minutes),
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventCancelled',
          ...place,
        });
      }
    }
    if (oneOff.length) {
      out.event = [...((out.event as Record<string, unknown>[] | undefined) ?? []), ...oneOff];
    }
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
  facts: Pick<ChurchFacts, 'serviceTimes' | 'address'> &
    Partial<Pick<ChurchFacts, 'timeChanges'>> & { title?: string },
  now: Date,
  siteUrl: string,
): string | null {
  const sunday = thisSunday(facts, now);
  // The weekly events are the USUAL gatherings; a different Sunday is written as an exception.
  const services = (sunday?.regular ?? []).filter((s) => s.confirmed);
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
  const host = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const where = facts.address?.confirmed ? [`LOCATION:${esc(facts.address.oneLine)}`] : [];
  const tz = (date: string, m: number) =>
    `TZID=America/New_York:${date.replace(/-/g, '')}T${at(m)}`;
  for (const s of services) {
    // A different Sunday (2026-10-26): a cancelled date is an EXDATE; a new time is the same
    // event again with a RECURRENCE-ID, so a calendar app moves that one Sunday and no other.
    const { skip, moved } = gatheringExceptions(facts, s.key, now);
    const cancelledOn = skip.filter((d) => d >= sunday.date && !moved.some((m) => m.date === d));
    lines.push(
      'BEGIN:VEVENT',
      `UID:sunday-${s.key}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${ymd}T${at(s.minutes)}`,
      'DURATION:PT1H',
      'RRULE:FREQ=WEEKLY;BYDAY=SU',
      ...cancelledOn.map((d) => `EXDATE;${tz(d, s.minutes)}`),
      `SUMMARY:${esc(s.label)}\\, ${name}`,
      ...where,
      `URL:${siteUrl}`,
      'END:VEVENT',
    );
    for (const m of moved.filter((x) => x.date >= sunday.date)) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:sunday-${s.key}@${host}`,
        `DTSTAMP:${stamp}`,
        `RECURRENCE-ID;${tz(m.date, s.minutes)}`,
        `DTSTART;${tz(m.date, m.minutes)}`,
        'DURATION:PT1H',
        `SUMMARY:${esc(s.label)}\\, ${name}`,
        ...where,
        `URL:${siteUrl}`,
        'END:VEVENT',
      );
    }
  }
  // An extra service on a coming Sunday is its own one-off event.
  for (const date of [...new Set(upcomingChanges(facts, now).map((c) => c.date))]) {
    if (weekdayOf(date) !== 0 || date < sunday.date) continue;
    for (const x of dayPlan(facts, date).services.filter((p) => p.extra)) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${x.key}-${date}@${host}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;${tz(date, x.minutes)}`,
        'DURATION:PT1H',
        `SUMMARY:${esc(x.label)}\\, ${name}`,
        ...where,
        `URL:${siteUrl}`,
        'END:VEVENT',
      );
    }
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
