// =============================================================================
// GET /api/live-status - is the church's YouTube channel live? (2026-10-24)
// =============================================================================
// Safe to edit by hand. Ported from First Baptist Muncie (2026-09-24). The browser
// (src/lib/live-client.ts) asks this only when Church facts has a YouTube channel id, only on
// Sunday mornings around worship, and at most once a minute, so "Live now" follows the stream
// rather than the clock. Every decision is in src/lib/live-status.ts, unit-tested; this file adds
// only what a unit test cannot: the Worker's secret, the Church facts read and the edge cache.
//
//   { "status": "live" | "not-live" | "unknown", "url"?, "checkedAt", "reason"? }
//
// THE SECRET. YOUTUBE_API_KEY is a Worker runtime secret (`npx wrangler secret put
// YOUTUBE_API_KEY -c dist/server/wrangler.json`; .dev.vars locally), read from
// `cloudflare:workers` at request time, never baked into the build. Without it every answer is
// "unknown" and the browser keeps to the clock.
//
// THE CACHE, TWO LAYERS, so visitors never multiply YouTube calls: StatusMemo in the isolate, and
// the Cache API per Cloudflare location, keyed on this path with no query string. The Cache API
// is a no-op on *.workers.dev hostnames, so until the church's domain is live the memo is the
// only layer.
//
// SSR only (prerender = false): it exists in dist/server, so `npm run preview` is the only local
// way to exercise it.
// =============================================================================
export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getChurchFacts } from '@/lib/church-data';
import { computeLiveStatus, StatusMemo, ttlSeconds, type LiveStatusBody } from '@/lib/live-status';
import { worshipStart } from '@/lib/live-service';

const memo = new StatusMemo();

// Church facts change only with a publish, and a publish redeploys the Worker, so ten minutes in
// the isolate costs nothing in freshness.
let factsMemo: { at: number; channelId: string | null; start: number | null } | null = null;
async function liveFacts(
  nowMs: number,
): Promise<{ channelId: string | null; start: number | null }> {
  if (factsMemo && nowMs - factsMemo.at < 600_000) return factsMemo;
  let value = { channelId: null as string | null, start: null as number | null };
  try {
    const facts = await getChurchFacts();
    value = { channelId: facts.youtubeChannelId, start: worshipStart(facts) };
  } catch {
    /* no facts: the answer is "unknown" */
  }
  factsMemo = { at: nowMs, ...value };
  return value;
}

interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}
function edgeCache(): EdgeCache | null {
  const store = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return store?.default ?? null;
}

function respond(body: LiveStatusBody, ttl: number, source: string): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=60, s-maxage=${ttl}`,
      'X-Live-Status-Source': source,
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const cache = edgeCache();
  const cacheKey = new Request(new URL('/api/live-status/', request.url).toString());
  if (cache) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) {
        const res = new Response(hit.body, hit);
        res.headers.set('X-Live-Status-Source', 'edge-cache');
        return res;
      }
    } catch {
      /* a cache failure is only a miss */
    }
  }

  const now = Date.now();
  const key = ((env as { YOUTUBE_API_KEY?: string }).YOUTUBE_API_KEY ?? '').trim();
  const body = await memo.get(now, async () => {
    // No key, no Sanity read either: the answer is "unknown" regardless.
    const facts = key ? await liveFacts(now) : { channelId: null, start: null };
    return computeLiveStatus({
      now: new Date(now),
      key,
      channelId: facts.channelId,
      start: facts.start,
      fetch: (url) => fetch(url, { headers: { Accept: 'application/json' } }),
    });
  });
  const res = respond(body, ttlSeconds(body), 'origin');
  if (cache) {
    try {
      await cache.put(cacheKey, res.clone());
    } catch {
      /* not cached this time; the isolate memo still holds it */
    }
  }
  return res;
};
