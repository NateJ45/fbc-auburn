// Safe to edit by hand
//
// The Tabler icon for each social platform (the keys in PLATFORMS, src/lib/social-links.ts, which
// reads the platform from the link's address), shared by the header strip, the phone menu, the
// footer and Contact. Tabler has no Nextdoor icon; it gets the neighborhood (community) icon.
// Any other site, and "Other", get the plain link icon.

import {
  IconBrandApplePodcast,
  IconBrandFacebook,
  IconBrandFlickr,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandLinktree,
  IconBrandPinterest,
  IconBrandSpotify,
  IconBrandThreads,
  IconBrandTiktok,
  IconBrandVimeo,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconBuildingCommunity,
  IconLink,
} from '@tabler/icons-react';

export function socialIcon(platform: string | undefined) {
  switch (platform) {
    case 'Instagram':
      return IconBrandInstagram;
    case 'Facebook':
      return IconBrandFacebook;
    case 'LinkedIn':
      return IconBrandLinkedin;
    case 'Pinterest':
      return IconBrandPinterest;
    case 'YouTube':
      return IconBrandYoutube;
    case 'TikTok':
      return IconBrandTiktok;
    case 'X':
      return IconBrandX;
    case 'WhatsApp':
      return IconBrandWhatsapp;
    case 'Threads':
      return IconBrandThreads;
    case 'Spotify':
      return IconBrandSpotify;
    case 'Apple Podcasts':
      return IconBrandApplePodcast;
    case 'Vimeo':
      return IconBrandVimeo;
    case 'Nextdoor':
      return IconBuildingCommunity;
    case 'Flickr':
      return IconBrandFlickr;
    case 'Linktree':
      return IconBrandLinktree;
    default:
      return IconLink;
  }
}
