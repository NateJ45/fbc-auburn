# Logo, icon, share images and popups from the Studio

Site-only (FBC Auburn, 2026-10-26). `docs/agent/studio-kit.md` is PORTABLE, so these notes live here.

## Logo and icon from the Studio (2026-10-26)

Site settings > Name and contact has two uploads, both empty by default, so the brand kit's files
keep rendering. Each field's description says the brand kit's files are the recommended ones, and
`BrandImageInput.tsx` draws a preview under the field: the logo in the top bar and phone menu, the
icon in a browser tab, on a home screen and in the footer (the brand kit's files when empty).

- **`logo`** (an existing field, now with guard rails): the header lockup and the phone menu
  (`Header.astro`, `MobileNav.astro` through `logoUrl`). SVG best; a raster under 400 px wide is an
  error, under 560 px or squarish a warning (`checkLogo`).
- **`siteIcon`** (new): must be square (2% slack) and, for a raster, at least 512 px
  (`checkIcon`, an error). It becomes the footer mark (`Footer.astro`), Home's small mark, the mark
  on every share card, the podcast artwork before the logo, and the whole favicon set:
  `scripts/build-brand-icons.mjs` runs in `npm run build` and writes favicon.ico (16/32/48),
  favicon.svg (the SVG itself, or the PNG wrapped in one), apple-touch-icon, icon-192, icon-512 and
  icon-maskable-512 into `dist/client` over the committed copies. The names do not change, so
  BaseLayout's links, `site.webmanifest`, the Studio's corner mark (`StudioIdentity.tsx` reads
  `/favicon.svg`) and the Studio app manifest follow. The download is cached by URL in
  `node_modules/.cache/brand-icon`. Any failure keeps the brand kit's files.

The size rules read the size from the asset id (`image-<hash>-<w>x<h>-<ext>`, `src/lib/brand-uploads.ts`,
unit tested), so they run the moment a file is chosen. `studio-theme.test.ts` is untouched: the
Studio's colours still come from `brand.config.json`. Guide: "Change the logo or the icon".

## Share images make themselves (2026-10-26)

Every prerendered page without a picture of its own gets a card drawn at build time; see
OPERATIONS.md, "Share images", for the order, the cache and the browser fallback. The Studio side:
a page's own Share image (its SEO tab) still wins, and Site settings' default share image now only
covers the password pages. Guide: "The picture when a page is shared".

## Popups (2026-10-26)

Content > Popups (`schemaTypes/popup.ts`, logic `src/lib/popup.ts` (PORTABLE since starter card 170; the
page addresses come from `SINGLETON_LIVE_PATHS` in `src/lib/nav-href.ts`), component
`src/components/SitePopup.astro`, rendered by BaseLayout). Fields: heading (60), message (200), one
button (text and link, both or neither), an optional picture, Show from, Show until (required, so a
popup always takes itself down), which pages (every page, Home only, chosen pages), how often
(once per visitor, localStorage; once per visit, sessionStorage), and the on/off switch.

Guard rails:

- **One at a time.** `pickPopup` puts one on the site: the switched-on popup that started most
  recently, else the soonest upcoming. A document-level warning names any other switched-on popup
  whose dates overlap.
- **Never straight away.** It opens only after 4 seconds on the page AND a quarter screen of
  scroll (8 seconds on a page too short to scroll that far). A timer alone interrupts someone
  reading the first screen (the times and address they came for); scroll shows they are browsing,
  and Google counts a box over the content on landing as an intrusive interstitial. It also waits
  while the phone menu is open and never opens for print.
- **Accessible.** A native `<dialog>` opened with `showModal()`, focus on Close and kept inside by
  a Tab wrap, Escape and the backdrop close it, focus goes back. Animation only under
  `prefers-reduced-motion: no-preference`; hidden in print; no layout shift (top layer).
- **Never on `/studio`, `/preview`, `/api` or a password page** (`popupShowsOn`).
- **Remembered** under `site-popup:<id>:<last edit>`, so an edited popup shows again. Storage that
  throws falls back to memory.
- **Free when unused.** No popup, no markup and no script (the component's script only loads on a
  page that renders it). Its CSS keyframes (about 0.3 KB) ride in the shared stylesheet.
- The dates are checked again in the visitor's browser, so a popup starts and ends on time between
  rebuilds.

`/styleguide/popup/` renders it with fixed words; `tests/popup.spec.ts` drives it with Playwright's
clock. Guide: "Put up a popup".
