// Safe to edit by hand
// /sermons/podcast.xml: the sermon podcast (FBC Auburn, 2026-10-18). Built at the same time as the
// site, so a sermon published with an audio file is a new episode on the next rebuild. Every
// sermon with an uploaded recording is an episode; the rest are not (a YouTube or Facebook video
// cannot go into a podcast). The XML itself is podcastXml() in src/lib/sermons.ts, unit-tested
// against Apple's required tags.
//
// The channel: name, description and category from the Sermons page in the Studio (Podcast tab);
// the picture from there too, else the sharing picture or logo from Site settings, cropped square
// at 3000 by 3000 (Apple's maximum) by the Sanity image pipeline; the owner name and email from
// Site settings (the church's public address, which Spotify emails to verify the show).
// Submitting it to Apple and Spotify is a one-time job: OPERATIONS.md, "The sermon podcast".

import type { APIRoute } from 'astro';
import { getSiteSettings } from '@/lib/queries';
import { getAllSermons, getSermonsPage } from '@/lib/collection-queries';
import { podcastEpisodes, podcastXml, type SermonDoc } from '@/lib/sermons';
import { urlFor } from '@/lib/sanity';
import { site } from '@/data/site';

const square = (img: unknown, size: number): string | null =>
  (img as { asset?: unknown } | null | undefined)?.asset
    ? urlFor(img as never)
        .width(size)
        .height(size)
        .fit('crop')
        .format('jpg')
        .quality(85)
        .url()
    : null;

export const GET: APIRoute = async () => {
  const [page, sermons, settings] = await Promise.all([
    getSermonsPage(),
    getAllSermons(),
    getSiteSettings(),
  ]);
  const churchName = (settings?.title as string | undefined) || site.name;
  const channelImage =
    square(page?.podcastArtwork, 3000) ??
    square(settings?.seoImage, 3000) ??
    square(settings?.logo, 3000);
  const episodeImage = (s: SermonDoc) => square(s.image, 1400) ?? square(s.series?.art, 1400);

  const body = podcastXml(
    {
      title: page?.podcastTitle?.trim() || `${churchName} Sermons`,
      description:
        page?.podcastDescription?.trim() ||
        `Sunday sermons from ${churchName} in Hamilton, Ohio. Come and visit us on a Sunday.`,
      siteUrl: site.url,
      feedUrl: `${site.url}/sermons/podcast.xml`,
      imageUrl: channelImage,
      author: churchName,
      ownerName: churchName,
      ownerEmail: (settings?.email as string | undefined)?.trim() || null,
      subcategory: page?.podcastCategory,
    },
    podcastEpisodes(sermons, site.url, episodeImage),
  );

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
