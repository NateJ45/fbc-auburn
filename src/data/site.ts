// Safe to edit by hand
// Static identity values that don't change between deploys.
// Content editors update their fields through Sanity instead — see studio/ and src/lib/queries.ts.
// Replace these placeholders with your project's real values before launch.

/** Slugify a display name for use in localStorage key prefixes.
 *  "Studio Starter" -> "studio-starter"
 *  "My Client & Co." -> "my-client-co"
 *  Keeps apply-brand from ever needing to rewrite these fields — they stay
 *  in sync automatically whenever `name` is updated.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// apply-brand rewrites the two quoted strings on `name:` and `domain:` below.
// All derived fields (studio, storageKeyPrefix, themeStorageKey) are computed
// from `name` at module load time — they are never rewritten by the script and
// can never go stale across reskins.
const _name = 'First Baptist Church of Auburn';
// Pre-launch: the workers.dev address until the church's own domain is chosen.
const _domain = 'fbc-auburn.nathanjnixon86.workers.dev';
const _slug = slugify(_name);

export const site = {
  name: _name,
  domain: _domain,
  url: `https://${_domain}`,
  // BCP 47 language tag for the <html lang> attribute. Change if the site is not in English.
  lang: 'en',

  /** Short display name alias — same as name, kept for any consumer that
   *  accessed the old `site.studio` property. */
  studio: _name,

  /** localStorage key prefix derived from name — e.g. "studio-starter".
   *  Never needs to be touched by apply-brand; updates automatically. */
  storageKeyPrefix: _slug,

  /** localStorage key for theme preference — e.g. "studio-starter-theme".
   *  Never needs to be touched by apply-brand; updates automatically. */
  themeStorageKey: _slug + '-theme',

  // Brand colors are also declared in src/styles/globals.css.
  // Mirrored here for any script that needs them outside CSS (OG generator, structured data, etc.).
  brandColors: {
    primary: '#235E93', // Slate
    primaryDark: '#1B4A75', // Slate Dark
    accent: '#171A26', // Ink
    accentDark: '#0F1726', // Ink Dark
    secondary: '#2C5B3A', // Cool Gray
    tertiary: '#E8A93A', // Muted Sage
    bg: '#FFFFFF', // Paper
    bgSoft: '#F3F6F9', // Soft Paper
    border: '#DDE3EA', // Faint dividers
  },

  // Static asset paths under public/
  // Note: the logo files are in `src/assets/` and are imported directly
  // by Header.astro / Footer.astro so Astro's <Image> component can emit
  // optimized WebP variants with content-hashed filenames. The keys below
  // stay only for the OG image + favicon, which are still served straight
  // from public/.
  assets: {
    ogDefault: '/og-default.png',
    favicon: '/favicon.svg',
  },

  // Visitor site search (PORTS.md card 123, docs/agent/site-search.md). On for
  // FBC Auburn: a search button in the header and the mobile menu, a /search/
  // page, and a Pagefind index of every page's main content, written after
  // `astro build` by scripts/build-search-index.mjs. `suggestions` are the
  // friendly links shown before a search and when nothing matches.
  search: {
    enabled: true as boolean,
    placeholder: 'Search sermons, news and pages',
    suggestions: [
      { label: 'Plan your visit', href: '/plan-your-visit/' },
      { label: 'Contact us', href: '/contact/' },
    ],
  },

  // Public repo URL (used in footer credit if shown)
  repo: '',
};

export type Site = typeof site;
