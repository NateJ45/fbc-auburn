// Safe to edit by hand
// The one call components make for the church's facts: Site settings,
// resolved (src/lib/church-facts.ts). getSiteSettings() is memoized for the
// whole build, so any number of components calling this costs one fetch.
// Kept apart from church-facts.ts so that file stays pure for `node --test`.

import { getSiteSettings } from '@/lib/queries';
import { resolveChurchFacts, type ChurchFacts } from '@/lib/church-facts';

/**
 * In a fixture build (CHURCH_DATA_FIXTURE=1, see church-feeds.ts) the events come from
 * tests/fixtures/church-calendar.ics; give the facts a stand-in feed address too, so the blocks
 * that offer "Add to your calendar" (the section library) have something to draw on the
 * /styleguide/sections/ wall and in its thumbnails. Never set on a real build.
 */
const FIXTURE_ICAL = 'https://calendar.example.test/church.ics';

export async function getChurchFacts(): Promise<ChurchFacts> {
  const facts = resolveChurchFacts(await getSiteSettings().catch(() => null));
  const fixture = (import.meta.env as Record<string, string | undefined>).CHURCH_DATA_FIXTURE;
  if (fixture && fixture !== 'unavailable' && !facts.icalUrl) {
    return { ...facts, icalUrl: FIXTURE_ICAL };
  }
  return facts;
}
