// Safe to edit by hand
// The one call components make for the church's facts: Site settings,
// resolved (src/lib/church-facts.ts). getSiteSettings() is memoized for the
// whole build, so any number of components calling this costs one fetch.
// Kept apart from church-facts.ts so that file stays pure for `node --test`.

import { getSiteSettings } from '@/lib/queries';
import { resolveChurchFacts, type ChurchFacts } from '@/lib/church-facts';

export async function getChurchFacts(): Promise<ChurchFacts> {
  return resolveChurchFacts(await getSiteSettings().catch(() => null));
}
