// Safe to edit by hand
// /sunday.ics: "Add Sunday to my calendar" (Home audit research, 2026-10-17). Built at build time
// from Site settings > Church facts (sundayIcs in src/lib/church-facts.ts), so it changes with the
// times. While no Sunday time is confirmed it is an empty calendar, and the This Sunday card hides
// its link (we never put a provisional time in someone's calendar).
import type { APIRoute } from 'astro';
import { site } from '@/data/site';
import { getChurchFacts } from '@/lib/church-data';
import { sundayIcs } from '@/lib/church-facts';
import { churchDataNow } from '@/lib/church-feeds';

export const GET: APIRoute = async () => {
  const facts = await getChurchFacts();
  const body =
    sundayIcs({ ...facts, title: site.name }, churchDataNow(), site.url) ??
    'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//fbc-auburn//sunday//EN\r\nEND:VCALENDAR\r\n';
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
