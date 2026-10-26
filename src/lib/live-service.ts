// Safe to edit by hand
// Is Sunday worship streaming right now? (2026-10-24, ported from First Baptist Muncie's
// src/lib/live-service.ts, 2026-09-24.)
//
// The site is static, so every page is built saying nothing about "live". In the browser,
// src/lib/live-client.ts asks liveState() once a minute and, only inside the window, shows the
// Live now banner (components/church/LiveBanner.astro), the Live tag on Home's watch card and the
// phone menu's Live now row. Without JavaScript nothing claims to be live, which is always true
// enough.
//
// THE WINDOW. Worship is the LAST Sunday gathering in Church facts > Service times (Sunday School
// comes first and is not streamed). "Live now" shows from 5 minutes before it starts to 80 minutes
// after, read on the CHURCH's wall clock (America/New_York), not the visitor's: a visitor in
// California at 8:00 their time is watching the 11:00 service. The zone's own wall clock (via
// Intl) is also what makes daylight saving a non-event.
//
// A REAL "LIVE NOW", ONCE THERE IS A YOUTUBE CHANNEL. The window is a guess about the clock.
// With a YouTube channel id in Church facts, the browser also asks /api/live-status
// (src/lib/live-status.ts) whether the channel is actually on air, inside a wider CHECK window
// (an hour before to 135 minutes after the start), at most once a minute. Its answer, while
// fresh, overrides the clock: 'live' shows Live now (and links to the live video), 'not-live'
// hides it even at 11:10, 'unknown' (no key, YouTube failing) leaves the clock in charge.
// Facebook offers no keyless way to ask, so on Facebook the clock always decides.

import { CHURCH_TIME_ZONE } from './church-calendar.ts';
import { thisSunday, type ChurchFacts } from './church-facts.ts';

/** "Live now" starts this many minutes before worship... */
export const LIVE_LEAD_MINUTES = 5;
/** ...and lasts this long after it starts (the hour plus the time a service runs over). */
export const LIVE_WINDOW_MINUTES = 80;
/** Ask YouTube from this long before worship starts... */
export const CHECK_BEFORE_MINUTES = 60;
/** ...until this long after it starts. */
export const CHECK_AFTER_MINUTES = 135;
/** An answer older than this is ignored, and the clock decides again. */
export const STATUS_FRESH_MS = 150_000;

/** What the pages carry for the browser: everything live-client.ts needs, derived at build. */
export interface WatchLive {
  /** Where the stream is watched (Church facts liveUrl). */
  href: string;
  /** 'YouTube', 'Facebook' or null, for the words. */
  via: 'YouTube' | 'Facebook' | null;
  /** Worship's start, minutes after midnight church time, or null (no Sunday gathering set). */
  start: number | null;
  /** Ask /api/live-status? Only with a YouTube channel to ask about. */
  check: boolean;
}

/** Worship's start: the last Sunday gathering, in minutes after midnight, or null. */
export function worshipStart(facts: Pick<ChurchFacts, 'serviceTimes'>): number | null {
  const sunday = facts.serviceTimes.filter((s) => s.dayIndex === 0).map((s) => s.minutes);
  return sunday.length ? Math.max(...sunday) : null;
}

/**
 * Worship's start on the coming Sunday (A different Sunday, 2026-10-26): the usual start, or the
 * new time when that Sunday moves it, or null when worship is cancelled that Sunday. The site
 * rebuilds every morning, so the Live now banner keys on the right time for the right Sunday.
 */
export function worshipStartThisSunday(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'timeChanges'>>,
  now: Date,
): number | null {
  const usual = worshipStart(facts);
  const sunday = thisSunday(facts, now);
  if (usual === null || !sunday?.changed) return usual;
  const streamed = sunday.regular.find((s) => s.minutes === usual);
  const thatDay = streamed ? sunday.services.find((s) => s.key === streamed.key) : null;
  return thatDay ? thatDay.minutes : null;
}

/** The live settings for the pages, or null when there is nowhere to watch. */
export function watchLive(
  facts: Pick<ChurchFacts, 'serviceTimes' | 'liveUrl' | 'liveVia' | 'youtubeChannelId'>,
): WatchLive | null {
  if (!facts.liveUrl) return null;
  return {
    href: facts.liveUrl,
    via: facts.liveVia,
    start: worshipStart(facts),
    check: Boolean(facts.youtubeChannelId),
  };
}

/** "Watch live on Facebook", "Watch live on YouTube", or "Watch live". */
export function watchLabel(via: WatchLive['via']): string {
  return via ? `Watch live on ${via}` : 'Watch live';
}

/** Minutes since Sunday 00:00 on the wall clock of `timeZone`. */
export function weekMinutesIn(now: Date, timeZone: string = CHURCH_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return day * 1440 + Number(get('hour')) * 60 + Number(get('minute'));
}

/** True inside the live window: Sunday, worship start minus the lead, plus the window. */
export function isLiveNow(now: Date, start: number | null): boolean {
  if (start === null) return false;
  const t = weekMinutesIn(now);
  return t >= start - LIVE_LEAD_MINUTES && t < start + LIVE_WINDOW_MINUTES;
}

/** Is it worth asking YouTube now? Sunday, around worship, church time. */
export function inCheckWindow(now: Date, start: number | null): boolean {
  if (start === null) return false;
  const t = weekMinutesIn(now);
  return t >= start - CHECK_BEFORE_MINUTES && t < start + CHECK_AFTER_MINUTES;
}

/** What the browser keeps of /api/live-status's last answer. */
export interface ClientLiveStatus {
  status: 'live' | 'not-live' | 'unknown';
  /** The live video, when YouTube named one. Only ever a youtube.com URL. */
  url?: string;
  /** Date.now() when the answer arrived. */
  at: number;
}

/** Only a youtube.com watch address may replace a link's own. */
export function safeLiveUrl(url: unknown): string | undefined {
  return typeof url === 'string' && /^https:\/\/(www\.)?youtube\.com\/[\w?=&/.-]+$/.test(url)
    ? url
    : undefined;
}

/**
 * The live state: the endpoint's answer while it is fresh and we are inside the check window,
 * else the clock. `href` is set only when the endpoint named the live video.
 */
export function liveState(
  now: Date,
  start: number | null,
  status: ClientLiveStatus | null | undefined,
): { live: boolean; href?: string } {
  const age = status ? now.getTime() - status.at : -1;
  if (status && age >= 0 && age < STATUS_FRESH_MS && inCheckWindow(now, start)) {
    if (status.status === 'live') return { live: true, href: safeLiveUrl(status.url) };
    if (status.status === 'not-live') return { live: false };
  }
  return { live: isLiveNow(now, start) };
}
