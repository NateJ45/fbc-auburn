// Safe to edit by hand
// The build-time reads behind the church data components: the YouTube channel
// feed (Watch band) and the Church Trac iCal feed (This week). The pure halves
// are church-video.ts and church-calendar.ts; this file only fetches, once per
// build, and turns every failure into null so a component draws its fallback
// and the build carries on. Shaped like First Baptist Muncie's
// church-calendar-feed.ts and last-sunday.ts.
//
// NOTHING IS FETCHED WITHOUT A SETTING. An empty YouTube channel id or
// calendar feed in Site settings means no request at all.
//
// THE TEST SEAM. Set CHURCH_DATA_FIXTURE=1 (and optionally CHURCH_DATA_NOW, an
// ISO instant) to build from tests/fixtures/church-youtube.xml and
// church-calendar.ics at a fixed moment, offline; CHURCH_DATA_FIXTURE=
// unavailable proves the fallbacks. No deploy sets either. They are read
// through import.meta.env and the fixtures through `?raw` imports, because the
// build prerenders inside workerd, where process.env and node:fs are not the
// build machine's.

import { parseIcs, type CalendarEvent } from './church-calendar.ts';
import type { ChurchFacts } from './church-facts.ts';
import {
  feedUrl,
  latestVideo,
  parseYoutubeFeed,
  upcomingStream,
  type FeedEntry,
  type LatestVideo,
  type UpcomingStream,
} from './church-video.ts';

export const FEED_TIMEOUT_MS = 8000;

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * A feed's text, or null on any failure. Two tries; every failure is LOGGED
 * with its reason, so a missing band is never a silent one in the deploy log.
 * `looksRight` rejects an answer that is not the expected kind of document
 * (an HTML error page served with a 200).
 */
export async function fetchFeed(
  url: string,
  looksRight: (text: string) => boolean,
  label: string,
  fetchImpl: Fetch = fetch,
  timeoutMs: number = FEED_TIMEOUT_MS,
  log: (msg: string) => void = (m) => console.warn(m),
): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        signal: controller.signal,
        // Church Trac answers 403 to a request with no User-Agent (the workerd
        // prerender sends none) and to Node's `Accept-Language: *` (measured
        // by First Baptist Muncie, 2026-09-25). YouTube does not mind either.
        headers: {
          Accept: 'text/calendar, application/atom+xml, application/xml;q=0.9, */*;q=0.1',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (compatible; fbc-auburn-website-build)',
        },
      });
      const text = await res.text();
      if (res.ok && looksRight(text)) return text;
      log(
        `[${label}] try ${attempt}: HTTP ${res.status}, not usable: ${JSON.stringify(text.slice(0, 120))}`,
      );
    } catch (err) {
      const aborted = (err as Error)?.name === 'AbortError';
      log(
        `[${label}] try ${attempt}: ${aborted ? `timed out after ${timeoutMs} ms` : String(err)}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** Vite's env in a build; undefined under `node --test`. */
const env = (name: string): string | undefined =>
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];

/** The build's moment: CHURCH_DATA_NOW in a fixture build, else the clock. */
export function churchDataNow(): Date {
  const fixed = env('CHURCH_DATA_NOW');
  const d = fixed ? new Date(fixed) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** undefined: no fixture build; null: the "unavailable" fixture; else the text. */
async function fixture(which: 'youtube' | 'calendar'): Promise<string | null | undefined> {
  const flag = env('CHURCH_DATA_FIXTURE');
  if (!flag) return undefined;
  if (flag === 'unavailable') return null;
  return which === 'youtube'
    ? (await import('../../tests/fixtures/church-youtube.xml?raw')).default
    : (await import('../../tests/fixtures/church-calendar.ics?raw')).default;
}

let entriesShared: Promise<FeedEntry[] | null> | null = null;
let eventsShared: Promise<CalendarEvent[] | null> | null = null;

/** The channel feed's entries, once per build, or null (the replay and the upcoming stream). */
function loadYoutubeEntries(
  facts: Pick<ChurchFacts, 'youtubeChannelId'>,
  fetchImpl: Fetch,
): Promise<FeedEntry[] | null> {
  if (entriesShared) return entriesShared;
  entriesShared = (async () => {
    let xml = await fixture('youtube');
    if (xml === undefined) {
      if (!facts.youtubeChannelId) return null;
      xml = await fetchFeed(
        feedUrl(facts.youtubeChannelId),
        (t) => /<feed[\s>]/.test(t),
        'church-video',
        fetchImpl,
      );
    }
    return xml ? parseYoutubeFeed(xml) : null;
  })();
  return entriesShared;
}

/** The channel's latest watched video, or null. */
export async function loadLatestVideo(
  facts: Pick<ChurchFacts, 'youtubeChannelId'>,
  fetchImpl: Fetch = fetch,
): Promise<LatestVideo | null> {
  const entries = await loadYoutubeEntries(facts, fetchImpl);
  return entries ? latestVideo(entries, churchDataNow()) : null;
}

/** The coming Sunday's scheduled YouTube stream, or null (church-video.ts upcomingStream). */
export async function loadUpcomingStream(
  facts: Pick<ChurchFacts, 'youtubeChannelId'>,
  fetchImpl: Fetch = fetch,
): Promise<UpcomingStream | null> {
  const entries = await loadYoutubeEntries(facts, fetchImpl);
  return entries ? upcomingStream(entries, churchDataNow()) : null;
}

/** The Church Trac calendar's events, once per build, or null. */
export function loadChurchEvents(
  facts: Pick<ChurchFacts, 'icalUrl'>,
  fetchImpl: Fetch = fetch,
): Promise<CalendarEvent[] | null> {
  if (eventsShared) return eventsShared;
  eventsShared = (async () => {
    let text = await fixture('calendar');
    if (text === undefined) {
      if (!facts.icalUrl) return null;
      text = await fetchFeed(
        facts.icalUrl,
        (t) => /BEGIN:VCALENDAR/i.test(t),
        'church-events',
        fetchImpl,
      );
    }
    return text ? parseIcs(text) : null;
  })();
  return eventsShared;
}

/** Test hook: forget the once-per-build answers. */
export function resetChurchFeeds(): void {
  entriesShared = null;
  eventsShared = null;
}
