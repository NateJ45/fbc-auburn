// Safe to edit by hand
// Is the church's YouTube channel live right now? (2026-10-24, ported from First Baptist Muncie's
// src/lib/live-status.ts, 2026-09-24.)
//
// The logic behind GET /api/live-status (src/pages/api/live-status.ts, which only adds the
// Worker's secret, the Church facts read and the edge cache). Pure apart from the injected
// `fetch`, so every branch is unit-tested with a mock (live-status.test.ts).
//
// DORMANT UNTIL TWO THINGS EXIST. The church streams on Facebook today, and Facebook offers no
// keyless way to ask whether a page is live, so on Facebook the browser goes by the clock alone
// (live-service.ts). Once the church has a YouTube channel: put its UC... id in Church facts >
// YouTube channel ID, and the Worker secret YOUTUBE_API_KEY (docs/agent/church-data.md says how).
// Without either, every answer is "unknown" and the clock decides, exactly as before.
//
// THE CALL, AND WHY NOT search.list. search.list with eventType=live costs 100 quota units a
// time against a 10,000 daily quota, which a Sunday morning of refreshes would spend. So this
// makes two 1-unit calls instead:
//   1. playlistItems.list on the channel's uploads playlist (UC... -> UU...), newest 10. A live
//      broadcast is a video on the channel, so it is in that playlist.
//   2. videos.list on those ids, reading snippet.liveBroadcastContent, 'live' only while on air.
// Known limit: a private or unlisted stream is not in the uploads playlist; the answer is then
// "not-live" and the link still goes to the channel's live page.

import { inCheckWindow } from './live-service.ts';

export type LiveState = 'live' | 'not-live' | 'unknown';

/** The endpoint's JSON body. */
export interface LiveStatusBody {
  status: LiveState;
  /** The live video, only with status 'live' and only when YouTube named it. */
  url?: string;
  /** When the answer was worked out (not when it was served from a cache). */
  checkedAt: string;
  /** Why, for anything but a clean YouTube answer: no-key, no-channel, outside-window... */
  reason?: string;
}

/** A channel's uploads playlist: UCxxxx -> UUxxxx. */
export function uploadsPlaylistId(channelId: string): string {
  return `UU${channelId.slice(2)}`;
}

export const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

type FetchLike = (url: string) => Promise<Response>;

async function errorReason(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { errors?: Array<{ reason?: string }> } };
    const reason = body?.error?.errors?.[0]?.reason;
    return `youtube-${res.status}${reason ? `-${reason}` : ''}`;
  } catch {
    return `youtube-${res.status}`;
  }
}

/** Ask YouTube, two 1-unit calls. Never throws. */
export async function youtubeLiveNow(
  channelId: string,
  key: string,
  fetchFn: FetchLike,
): Promise<{ status: LiveState; url?: string; reason?: string }> {
  try {
    const list = new URL(`${YOUTUBE_API}/playlistItems`);
    list.search = new URLSearchParams({
      part: 'contentDetails',
      playlistId: uploadsPlaylistId(channelId),
      maxResults: '10',
      fields: 'items(contentDetails(videoId))',
      key,
    }).toString();
    const r1 = await fetchFn(list.toString());
    if (!r1.ok) return { status: 'unknown', reason: await errorReason(r1) };
    const j1 = (await r1.json()) as { items?: Array<{ contentDetails?: { videoId?: string } }> };
    const ids = (j1.items ?? [])
      .map((i) => i?.contentDetails?.videoId ?? '')
      .filter((id) => /^[\w-]{11}$/.test(id));
    if (ids.length === 0) return { status: 'not-live' };

    const videos = new URL(`${YOUTUBE_API}/videos`);
    videos.search = new URLSearchParams({
      part: 'snippet',
      id: ids.join(','),
      fields: 'items(id,snippet(liveBroadcastContent))',
      key,
    }).toString();
    const r2 = await fetchFn(videos.toString());
    if (!r2.ok) return { status: 'unknown', reason: await errorReason(r2) };
    const j2 = (await r2.json()) as {
      items?: Array<{ id?: string; snippet?: { liveBroadcastContent?: string } }>;
    };
    const live = (j2.items ?? []).find((v) => v?.snippet?.liveBroadcastContent === 'live');
    if (live?.id && /^[\w-]{11}$/.test(live.id)) {
      return { status: 'live', url: `https://www.youtube.com/watch?v=${live.id}` };
    }
    return { status: 'not-live' };
  } catch {
    return { status: 'unknown', reason: 'youtube-unreachable' };
  }
}

/** The whole decision, in the order that spends nothing it does not need to. */
export async function computeLiveStatus(opts: {
  now: Date;
  key: string | null | undefined;
  /** Church facts' UC... id, or null. */
  channelId: string | null | undefined;
  /** Worship's start (live-service.ts worshipStart), or null. */
  start: number | null;
  fetch: FetchLike;
}): Promise<LiveStatusBody> {
  const checkedAt = opts.now.toISOString();
  const key = (opts.key ?? '').trim();
  if (!key) return { status: 'unknown', reason: 'no-key', checkedAt };
  if (opts.start === null) return { status: 'unknown', reason: 'no-service-time', checkedAt };
  if (!inCheckWindow(opts.now, opts.start)) {
    return { status: 'not-live', reason: 'outside-window', checkedAt };
  }
  const channel = opts.channelId ?? '';
  if (!/^UC[\w-]{22}$/.test(channel)) return { status: 'unknown', reason: 'no-channel', checkedAt };
  const answer = await youtubeLiveNow(channel, key, opts.fetch);
  return { ...answer, checkedAt };
}

/**
 * How long an answer may be reused, in seconds: 90 for a real answer, 5 minutes for "unknown"
 * (no key, YouTube down, quota spent), so a failing upstream is not hammered.
 */
export function ttlSeconds(body: LiveStatusBody): number {
  return body.status === 'unknown' ? 300 : 90;
}

/**
 * The in-isolate layer of the cache: the last answer is kept until its TTL runs out, and
 * requests that arrive while one refresh is in flight share it rather than each calling YouTube.
 */
export class StatusMemo {
  private hit: { body: LiveStatusBody; until: number } | null = null;
  private pending: Promise<LiveStatusBody> | null = null;

  async get(nowMs: number, compute: () => Promise<LiveStatusBody>): Promise<LiveStatusBody> {
    if (this.hit && nowMs < this.hit.until) return this.hit.body;
    if (this.pending) return this.pending;
    this.pending = compute()
      .then((body) => {
        this.hit = { body, until: nowMs + ttlSeconds(body) * 1000 };
        return body;
      })
      .finally(() => {
        this.pending = null;
      });
    return this.pending;
  }
}
