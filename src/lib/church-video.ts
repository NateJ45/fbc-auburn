// Safe to edit by hand
// The latest message from the church's YouTube channel, for the Watch band
// and Watch page ("Last Sunday" replay). Read at BUILD time from the public
// channel feed, https://www.youtube.com/feeds/videos.xml?channel_id=<UC...>:
// no key, newest 15 uploads, Atom. The site rebuilds on every publish and on
// a schedule (deploy.yml: every morning and Sunday afternoon), which is what
// keeps the band current.
//
// The parser is First Baptist Muncie's (clients/fbcm src/lib/youtube-feed.ts,
// 2026-09-24), trimmed to what Auburn draws. Muncie found the feed flaky in
// late September 2026 and moved to the Data API with a key; Auburn has no key
// and no channel yet, so it starts on the feed with the safe failure: ANY
// problem (no channel id, network, status, timeout, nothing usable) gives
// null, the band draws its fallback, and the build carries on. If the feed
// proves flaky here too, port Muncie's youtube-feed-api.ts.
//
// WHICH VIDEO. The newest upload that has been watched at least once and is
// not in the future. A scheduled livestream sits in the feed days early with
// 0 views; skipping it keeps next week's empty stream off the page.
//
// THE LABEL. "Last Sunday" only when it is: published on a Sunday or Monday,
// church time (a replay usually lands just after midnight), at most 8 days
// before the build. Otherwise "Latest message", so the band never claims an
// old video is last week's.

import { CHURCH_TIME_ZONE } from './church-calendar.ts';

/** One <entry> of the feed, decoded. */
export interface FeedEntry {
  videoId: string;
  title: string;
  /** ISO timestamp, as the feed wrote it. */
  published: string;
  /** media:statistics views, or null when the feed carried none. */
  views: number | null;
}

export interface LatestVideo {
  videoId: string;
  title: string;
  /** YYYY-MM-DD on the church's calendar. */
  date: string;
  /** "Last Sunday" or "Latest message". */
  label: string;
  watchUrl: string;
  /** The privacy-enhanced embed, autoplaying (only loaded on a press). */
  embedUrl: string;
  /** hqdefault.jpg, 480 x 360, always present for a public video. */
  thumbnailUrl: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** Decode the XML entities the feed uses (named, decimal and hex). */
export function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code[0] === '#') {
        const n =
          code[1] === 'x' || code[1] === 'X'
            ? parseInt(code.slice(2), 16)
            : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
      }
      return ENTITIES[code.toLowerCase()] ?? whole;
    });
}

const tag = (xml: string, name: string): string => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  return m?.[1] !== undefined ? decodeXml(m[1]).trim() : '';
};

/** Every entry in a YouTube channel feed. Malformed entries are dropped. */
export function parseYoutubeFeed(xml: string | null | undefined): FeedEntry[] {
  if (!xml || !/<feed[\s>]/.test(xml)) return [];
  const out: FeedEntry[] = [];
  for (const [, body] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    if (!body) continue;
    const videoId = tag(body, 'yt:videoId');
    const title = tag(body, 'title');
    const published = tag(body, 'published');
    if (!/^[\w-]{11}$/.test(videoId) || !title || Number.isNaN(Date.parse(published))) continue;
    const views = /<media:statistics[^>]*\sviews="(\d+)"/.exec(body)?.[1];
    out.push({
      videoId,
      title: title.replace(/\s+/g, ' '),
      published,
      views: views === undefined ? null : Number(views),
    });
  }
  return out;
}

const DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: CHURCH_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** A replay older than this is "Latest message", not "Last Sunday". */
export const LAST_SUNDAY_MAX_DAYS = 8;

/** The newest watched upload as of `now`, labelled, or null. */
export function latestVideo(entries: FeedEntry[], now: Date): LatestVideo | null {
  const pick = entries
    .filter((e) => e.views !== 0 && Date.parse(e.published) <= now.getTime())
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))[0];
  if (!pick) return null;
  const at = new Date(pick.published);
  const date = DAY.format(at);
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const ageDays = (now.getTime() - at.getTime()) / 86_400_000;
  const lastSunday = (weekday === 0 || weekday === 1) && ageDays <= LAST_SUNDAY_MAX_DAYS;
  return {
    videoId: pick.videoId,
    title: pick.title,
    date,
    label: lastSunday ? 'Last Sunday' : 'Latest message',
    watchUrl: `https://www.youtube.com/watch?v=${pick.videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${pick.videoId}?autoplay=1&rel=0`,
    thumbnailUrl: `https://i.ytimg.com/vi/${pick.videoId}/hqdefault.jpg`,
  };
}

export const feedUrl = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
export const channelUrl = (channelId: string) =>
  `https://www.youtube.com/channel/${encodeURIComponent(channelId)}`;
