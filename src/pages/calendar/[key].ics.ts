// Safe to edit by hand
// /calendar/<key>.ics: "Add to calendar" for one regular gathering (the Events page's "Every
// week" list, audit 2026-10-25). Built at build time from Site settings > Church facts > Service
// times (gatheringIcs in src/lib/gatherings.ts), one weekly event from its next date. Only a
// CONFIRMED time gets a file: we never put a provisional time in someone's calendar, and the
// list hides the link until the box is ticked. /sunday.ics stays the all-Sundays file.
import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '@/data/site';
import { getChurchFacts } from '@/lib/church-data';
import { churchDataNow } from '@/lib/church-feeds';
import { gatheringIcs } from '@/lib/gatherings';

export const getStaticPaths: GetStaticPaths = async () => {
  const facts = await getChurchFacts();
  return facts.serviceTimes
    .filter((s) => s.confirmed && /^[a-z0-9-]+$/i.test(s.key))
    .map((s) => ({ params: { key: s.key } }));
};

export const GET: APIRoute = async ({ params }) => {
  const facts = await getChurchFacts();
  const body = gatheringIcs(
    { ...facts, title: site.name },
    String(params.key),
    churchDataNow(),
    site.url,
  );
  if (!body) return new Response('Not found', { status: 404 });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
