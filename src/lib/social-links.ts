// Safe to edit by hand
//
// One list of the church's social accounts for every place that shows the round icon buttons:
// the header strip, the phone menu and the footer (2026-10-24). Before this the footer read Site
// settings > Social links while the header and menu read only the Facebook fact, so an account
// added in the Studio (TikTok) showed in the footer and nowhere else.
//
// Order: the editor's Social links list as typed. With that list empty, the legacy Instagram /
// Facebook fields stand in so an older dataset keeps its buttons. A Facebook page from Church
// facts joins the front when no Facebook entry is in the list, so the menu never loses it.
// Icons for each platform live in social-icons.ts (kept apart so this file stays plain data).

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface RawSocialSettings {
  socialLinks?: { platform?: string | null; url?: string | null; label?: string | null }[] | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
}

export function resolveSocialLinks(
  settings: RawSocialSettings | null | undefined,
  facebookFact?: string | null,
): SocialLink[] {
  const listed: SocialLink[] = (settings?.socialLinks ?? [])
    .filter((l) => !!l?.url)
    .map((l) => ({
      platform: l.platform || 'Other',
      url: l.url as string,
      ...(l.label ? { label: l.label } : {}),
    }));
  const links: SocialLink[] =
    listed.length > 0
      ? listed
      : [
          ...(settings?.socialInstagram
            ? [{ platform: 'Instagram', url: settings.socialInstagram }]
            : []),
          ...(settings?.socialFacebook
            ? [{ platform: 'Facebook', url: settings.socialFacebook }]
            : []),
        ];
  if (facebookFact && !links.some((l) => l.platform === 'Facebook')) {
    links.unshift({ platform: 'Facebook', url: facebookFact });
  }
  return links;
}

/** The accessible name for an icon-only button: the editor's label, else the platform. */
export function socialLabel(link: SocialLink): string {
  return link.label || link.platform || 'Social link';
}
