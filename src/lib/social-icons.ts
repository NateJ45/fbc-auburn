// Safe to edit by hand
//
// The Tabler icon for each Social links platform (the options in siteSettings.ts), shared by the
// header strip, the phone menu and the footer. Tabler has no Houzz icon; it and "Other" get the
// plain link icon.

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
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
    default:
      return IconLink;
  }
}
