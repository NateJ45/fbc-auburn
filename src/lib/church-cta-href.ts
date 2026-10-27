// Safe to edit by hand
// Auburn's button resolver: the starter's ctaHref (src/lib/cta-href.ts, PORTABLE, PORTS.md card 187)
// plus the one route the starter does not have, a single sermon at /sermons/<slug>/. Every Auburn
// component imports ctaHref from here, so a button that points at a sermon still lands on it.
// Page types otherwise resolve through SINGLETON_LIVE_PATHS in nav-href.ts, the menus' own table.
import { ctaHref as starterCtaHref, type CtaTarget } from './cta-href.ts';

export type { CtaTarget };

/** The finished href for a ctaBlock, trailing slash included (rule 19). */
export function ctaHref(c: CtaTarget | null | undefined, fallbackHref = '/contact/'): string {
  const link = c?.internalLink;
  if (c?.linkType === 'internal' && link?._type === 'sermon' && link.slug) {
    return `/sermons/${link.slug}/`;
  }
  return starterCtaHref(c, fallbackHref);
}
