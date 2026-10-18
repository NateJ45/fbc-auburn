// Safe to edit by hand
// Resolves a Sanity ctaBlock to a path. Moved out of CtaLink.astro (2026-10-17) so anything that
// links like a button (the Watch band's video card) resolves the same way. CtaLink still owns the
// button markup.
import { withTrailingSlash } from '@/lib/href';

export interface CtaTarget {
  linkType?: 'internal' | 'external' | 'email' | 'phone';
  internalLink?: { _type?: string; slug?: string } | null;
  externalUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  href?: string;
}

// Map Sanity document _type to its route. Mirrors the routes in src/pages/.
// Singletons go to a fixed path; journalEntry uses {slug} for the dynamic
// /journal/[slug] route.
const TYPE_TO_PATH: Record<string, string> = {
  homePage: '/',
  aboutPage: '/about/',
  faqPage: '/faq/',
  contactPage: '/contact/',
  journalPage: '/journal/', // scaffold: journal
  sermonsPage: '/sermons/',
};

function resolveHref(c: CtaTarget | null | undefined, fallbackHref: string): string {
  // No linkType: a built-in default button, which names its path directly. Before this line
  // read only fallbackHref, every default button went to /contact/ whatever it said.
  if (!c?.linkType) return c?.href ?? fallbackHref;
  switch (c.linkType) {
    case 'internal': {
      const t = c.internalLink?._type;
      if (!t) return fallbackHref;
      // Slug-based types need the slug appended. Singletons use a fixed path.
      // scaffold: journal
      if (t === 'journalEntry' && c.internalLink?.slug) {
        return `/journal/${c.internalLink.slug}`;
      }
      // scaffold:end
      // One sermon (2026-10-18): /sermons/<slug>/.
      if (t === 'sermon' && c.internalLink?.slug) {
        return `/sermons/${c.internalLink.slug}/`;
      }
      // Custom pages (type 'page') route via /[slug].astro.
      if (t === 'page' && c.internalLink?.slug) {
        return `/${c.internalLink.slug}`;
      }
      return TYPE_TO_PATH[t] ?? fallbackHref;
    }
    case 'external':
      return c.externalUrl ?? fallbackHref;
    case 'email':
      return c.emailAddress ? `mailto:${c.emailAddress}` : fallbackHref;
    case 'phone':
      return c.phoneNumber ? `tel:${c.phoneNumber.replace(/[^\d+]/g, '')}` : fallbackHref;
    default:
      return fallbackHref;
  }
}

/** The finished href for a ctaBlock, trailing slash included (rule 19). */
export function ctaHref(c: CtaTarget | null | undefined, fallbackHref = '/contact/'): string {
  return withTrailingSlash(resolveHref(c, fallbackHref));
}
