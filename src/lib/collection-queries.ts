// Foundation, edit with care
// =============================================================================
// Route queries for the sermon archive, people and downloads (FBC Auburn, 2026-10-18)
// =============================================================================
// Each list is fetched ONCE per build (a module-level promise, like
// getSiteSettings) and shared by /sermons/, every /sermons/<slug>/, every
// /sermons/series/<slug>/ and the podcast feed.
//
// LOCAL EXAMPLE DATA. With COLLECTIONS_FIXTURE=1 in the environment, every
// loader here returns tests/fixtures/collections.json instead of asking Sanity.
// That is how the routes are built and screenshotted with example sermons
// without writing a single document to the production dataset. CI and the
// live build never set it.
// =============================================================================

import { sanityFetch } from './sanity';
import { sectionsProjection } from './queries';
import { SERMON_FIELDS, SERIES_FIELDS, DOWNLOAD_FIELDS } from './collection-arms';
import type { DownloadDoc, SeriesDoc, SermonDoc } from './sermons';

const IMG = `{ ..., asset->, "alt": coalesce(alt, asset->altText, "") }`;

const env = (name: string): string | undefined =>
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name] ??
  (typeof process !== 'undefined' ? process.env[name] : undefined);

interface Fixture {
  sermonsPage: SermonsPageDoc | null;
  sermons: SermonDoc[];
  series: SeriesDoc[];
  downloads: DownloadDoc[];
}
let fixtureShared: Promise<Fixture | null> | null = null;
function fixture(): Promise<Fixture | null> {
  if (!env('COLLECTIONS_FIXTURE')) return Promise.resolve(null);
  fixtureShared ??= import('../../tests/fixtures/collections.json').then(
    (m) => (m as { default: Fixture }).default,
  );
  return fixtureShared;
}

export interface SermonsPageDoc {
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroSubhead?: string | null;
  bibleVersion?: string | null;
  podcastTitle?: string | null;
  podcastDescription?: string | null;
  podcastCategory?: string | null;
  podcastArtwork?: { asset?: unknown } | null;
  applePodcastsUrl?: string | null;
  spotifyUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: { asset?: unknown } | null;
  additionalSections?: unknown[] | null;
}

let pageShared: Promise<SermonsPageDoc | null> | null = null;
export function getSermonsPage(): Promise<SermonsPageDoc | null> {
  pageShared ??= fixture().then(
    (f) =>
      f?.sermonsPage ??
      sanityFetch<SermonsPageDoc | null>(
        `*[_type == "sermonsPage"][0]{
          ...,
          podcastArtwork${IMG},
          seoImage${IMG},
          ${sectionsProjection('additionalSections')}
        }`,
        {},
        null,
      ),
  );
  return pageShared;
}

let sermonsShared: Promise<SermonDoc[]> | null = null;
/** Every published sermon with a web address, newest first. */
export function getAllSermons(): Promise<SermonDoc[]> {
  sermonsShared ??= fixture().then(async (f) => {
    if (f) return f.sermons;
    const list = await sanityFetch<SermonDoc>(
      `*[_type == "sermon" && defined(slug.current)] | order(date desc)${SERMON_FIELDS}`,
      {},
      [],
    );
    return Array.isArray(list) ? list : [];
  });
  return sermonsShared;
}

let seriesShared: Promise<SeriesDoc[]> | null = null;
/** Every series with a web address, with its derived dates and count. */
export function getAllSeries(): Promise<SeriesDoc[]> {
  seriesShared ??= fixture().then(async (f) => {
    if (f) return f.series;
    const list = await sanityFetch<SeriesDoc>(
      `*[_type == "sermonSeries" && defined(slug.current)]${SERIES_FIELDS}`,
      {},
      [],
    );
    return Array.isArray(list) ? list : [];
  });
  return seriesShared;
}

/** The newest bulletins (the /bulletin/ shortcut picks the newest current one). */
export async function getBulletins(): Promise<DownloadDoc[]> {
  const f = await fixture();
  if (f) return f.downloads.filter((d) => d.category === 'bulletin');
  const list = await sanityFetch<DownloadDoc>(
    `*[_type == "download" && category == "bulletin" && defined(file.asset)] | order(date desc)[0...12]${DOWNLOAD_FIELDS}`,
    {},
    [],
  );
  return Array.isArray(list) ? list : [];
}
