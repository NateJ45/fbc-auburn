// Safe to edit by hand
// =============================================================================
// church-blocks - the pure logic behind FBC Auburn's section library
// =============================================================================
// The blocks in src/sanity/schemaTypes/churchSections.ts take INPUTS from the
// editor (a date window, a goal, a Bible reference) and work out everything
// else here, at build time (rule 15): whether a notice is showing today, how
// many days are left, how full the progress bar is, where a Bible reference
// links to, the calendar subscribe links and the "Live now" window.
//
// Pure on purpose, so `node --test` covers it (church-blocks.test.ts). Every
// string an editor typed goes through plain() first: in the Studio preview it
// arrives stega-encoded, and an encoded date or keyword never compares equal
// to anything.
//
// Dates are the church's own calendar days (YYYY-MM-DD, Eastern), the same
// convention as church-facts.ts and church-calendar.ts. The site rebuilds every
// morning (deploy.yml), so a build-time "today" is at most a day old; the
// countdown and Live-now scripts correct it in the visitor's browser.
// =============================================================================

import { churchNow, plain, type ServiceTime } from './church-facts.ts';
import { addDays, daysBetween, timeLabel } from './church-calendar.ts';

/** A YYYY-MM-DD, or '' when the value is not one. Accepts a datetime and keeps its date. */
export function isoDay(value?: string | null): string {
  const v = plain(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return '';
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Today on the church's calendar. */
export const churchToday = (now: Date): string => churchNow(now).date;

// ── Notice band ─────────────────────────────────────────────────────────────

/**
 * Is a notice inside its window today? Both ends are optional and inclusive: a
 * notice from Saturday to Sunday shows on both days and is gone on Monday. A
 * blank start means "from now", a blank end means "until it is removed". An
 * end before the start shows nothing (a typo should hide, not shout).
 */
export function inDateWindow(
  start: string | null | undefined,
  end: string | null | undefined,
  today: string,
): boolean {
  const from = isoDay(start);
  const to = isoDay(end);
  if (from && to && to < from) return false;
  if (from && today < from) return false;
  if (to && today > to) return false;
  return true;
}

// ── Countdown ───────────────────────────────────────────────────────────────

export type CountdownPhase = 'before' | 'during' | 'after' | 'none';

export interface CountdownState {
  phase: CountdownPhase;
  /** Whole days until the first day; 0 on the day itself and after. */
  days: number;
}

/**
 * Where a countdown stands on `today`. `start` is the first day of the event,
 * `end` the last (optional; a one-day event ends the day it starts). Before:
 * days to go. On the day, or any day of a multi-day event: during. After the
 * last day: after. No usable start date: none (the block draws nothing).
 */
export function countdownState(
  start: string | null | undefined,
  end: string | null | undefined,
  today: string,
): CountdownState {
  const from = isoDay(start);
  if (!from) return { phase: 'none', days: 0 };
  let to = isoDay(end) || from;
  if (to < from) to = from;
  if (today < from) return { phase: 'before', days: daysBetween(today, from) };
  if (today <= to) return { phase: 'during', days: 0 };
  return { phase: 'after', days: 0 };
}

/** "1 day to go", "12 days to go". */
export const daysToGo = (days: number): string => `${days} ${days === 1 ? 'day' : 'days'} to go`;

// ── Progress bar ────────────────────────────────────────────────────────────

const WHOLE = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** 12500 -> "$12,500". Rounded to whole dollars; plain formatting, no "12.5K". */
export function dollars(value: number): string {
  return `$${WHOLE.format(Math.round(value))}`;
}

export interface ProgressState {
  /** False when there is no positive goal: the block then draws nothing. */
  valid: boolean;
  /** 0 to 100, whole, for the bar and its aria-valuenow. */
  percent: number;
  raised: string;
  goal: string;
  /** "$7,500 to go", or "Goal reached" at or past the goal. */
  remaining: string;
}

/** Goal and raised so far, as the bar and its words. */
export function progressState(
  goal: number | null | undefined,
  raised: number | null | undefined,
): ProgressState {
  const g = typeof goal === 'number' && Number.isFinite(goal) ? goal : 0;
  const r = typeof raised === 'number' && Number.isFinite(raised) ? Math.max(0, raised) : 0;
  if (g <= 0) return { valid: false, percent: 0, raised: dollars(r), goal: '', remaining: '' };
  const percent = Math.max(0, Math.min(100, Math.floor((r / g) * 100)));
  return {
    valid: true,
    percent,
    raised: dollars(r),
    goal: dollars(g),
    remaining: r >= g ? 'Goal reached' : `${dollars(g - r)} to go`,
  };
}

/** "As of October 18, 2026" for a YYYY-MM-DD, or '' when there is none. */
export function asOfLabel(value?: string | null): string {
  const iso = isoDay(value);
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  return `As of ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
}

/** "October 18, 2026" for a YYYY-MM-DD. */
export function longDate(value?: string | null): string {
  const iso = isoDay(value);
  if (!iso) return '';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ── Scripture ───────────────────────────────────────────────────────────────

/** The translations the Studio offers, as BibleGateway's codes. */
export const TRANSLATIONS = ['CSB', 'KJV', 'NKJV', 'ESV', 'NIV', 'NASB'] as const;

/**
 * A BibleGateway link for a reference like "John 3:16" or "Romans 8:28-39",
 * derived (rule 15): nobody pastes a URL. Empty reference: ''.
 */
export function bibleGatewayUrl(reference?: string | null, translation?: string | null): string {
  const ref = plain(reference);
  if (!ref) return '';
  const version = plain(translation).toUpperCase();
  const v = (TRANSLATIONS as readonly string[]).includes(version) ? `&version=${version}` : '';
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}${v}`;
}

/** "John 3:16; Romans 5:8" -> ["John 3:16", "Romans 5:8"]. Semicolons separate references. */
export function splitReferences(value?: string | null): string[] {
  return plain(value)
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Calendar subscribe ──────────────────────────────────────────────────────

export interface SubscribeLinks {
  /** webcal:// for Apple Calendar and desktop Outlook. */
  apple: string;
  /** Google Calendar's "add by URL". */
  google: string;
  /** Outlook on the web's "subscribe from web". */
  outlook: string;
}

/**
 * Subscribe links for the church's iCal feed, derived from the one address in
 * Church facts. A subscription stays up to date on the visitor's phone; a
 * download would not. null when there is no feed.
 */
export function subscribeLinks(
  icalUrl?: string | null,
  name = 'Church calendar',
): SubscribeLinks | null {
  const raw = plain(icalUrl);
  if (!/^(https|webcal):\/\//i.test(raw)) return null;
  const https = raw.replace(/^webcal:/i, 'https:');
  const webcal = https.replace(/^https:/i, 'webcal:');
  return {
    apple: webcal,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(name)}`,
  };
}

// ── Upcoming events ─────────────────────────────────────────────────────────

/** "vbs, bible school" -> ["vbs", "bible school"]. */
export function keywordsOf(value?: string | null): string[] {
  return plain(value)
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Keep the rows whose title, description or place mentions any keyword. No keywords: all. */
export function matchesKeywords<
  T extends { title: string; description?: string; location?: string },
>(items: T[], keywords: string[]): T[] {
  if (keywords.length === 0) return items;
  return items.filter((it) => {
    const hay = `${it.title} ${it.description ?? ''} ${it.location ?? ''}`.toLowerCase();
    return keywords.some((k) => hay.includes(k));
  });
}

// ── Livestream ──────────────────────────────────────────────────────────────

/** Minutes before the service starts that "Live now" turns on, and how long it stays. */
export const LIVE_LEAD_MINUTES = 5;
export const LIVE_LENGTH_MINUTES = 80;

/**
 * The streamed service: Sunday worship, which is the last Sunday gathering
 * (Sunday School comes first). The same rule the Home watch card uses.
 */
export function streamedService(times: ServiceTime[]): ServiceTime | null {
  const sunday = times.filter((s) => s.dayIndex === 0).sort((a, b) => a.minutes - b.minutes);
  return sunday.at(-1) ?? null;
}

export interface LiveWindow {
  /** Minutes since midnight Sunday, church clock, when Live now starts. */
  start: number;
  /** ...and ends. */
  end: number;
  /** "Sundays at 11 am" */
  label: string;
}

export function liveWindow(times: ServiceTime[]): LiveWindow | null {
  const s = streamedService(times);
  if (!s) return null;
  return {
    start: s.minutes - LIVE_LEAD_MINUTES,
    end: s.minutes + LIVE_LENGTH_MINUTES,
    label: `Sundays at ${timeLabel(s.minutes)}`,
  };
}

/** Is it inside the live window at `now`? (Sunday, church clock.) */
export function isLiveNow(win: LiveWindow | null, now: Date): boolean {
  if (!win) return false;
  const { date, minutes } = churchNow(now);
  return (
    new Date(`${date}T12:00:00Z`).getUTCDay() === 0 && minutes >= win.start && minutes <= win.end
  );
}

/** The date of the next streamed Sunday on or after today (today counts until the window ends). */
export function nextLiveDate(win: LiveWindow | null, now: Date): string {
  const { date, minutes } = churchNow(now);
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (dow === 0 && win && minutes <= win.end) return date;
  return addDays(date, (7 - dow) % 7 || 7);
}

// ── Embeds ──────────────────────────────────────────────────────────────────

/**
 * A YouTube or Facebook video address as an embeddable player URL, or '' when
 * it is neither. Only these two hosts are ever framed, so an editor cannot
 * point the block at an arbitrary site.
 */
export function streamEmbedUrl(value?: string | null): string {
  const url = plain(value);
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return '';
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtube.com' || host === 'youtu.be') {
    const live = /^\/live\/([\w-]{6,})/.exec(u.pathname)?.[1];
    const id =
      host === 'youtu.be'
        ? u.pathname.slice(1)
        : live || u.searchParams.get('v') || /^\/embed\/([\w-]+)/.exec(u.pathname)?.[1] || '';
    const channel = /^\/channel\/(UC[\w-]{22})/.exec(u.pathname)?.[1];
    if (channel) return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channel}`;
    return /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }
  return '';
}
