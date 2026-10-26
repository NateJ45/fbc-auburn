# Performance budgets

> Core Web Vitals targets, bundle and image budgets, font loading, hydration strategy, and the current Lighthouse scorecard.

## Performance budgets

Performance is a UX feature, not a vanity score. Lighthouse 100 on Performance is the ceiling target; the more honest measures are the field metrics below.

### Core Web Vitals targets

- **LCP (Largest Contentful Paint)** < 1.0s on the home hero, < 1.5s site-wide. The hero image is usually LCP -- size it for mobile (750px wide, quality ~65) and let it grow on larger viewports.
- **CLS (Cumulative Layout Shift)** < 0.05. Reserve space for images with explicit width/height (or aspect-ratio CSS). Don't lazy-load above-the-fold images. Web fonts use `font-display: swap` to avoid invisible-text shifts.
- **INP (Interaction to Next Paint)** < 200ms. Keep React island hydration light. Favor `client:visible` and `client:idle` over `client:load` for anything below the fold.

### FBC Auburn, the 2026-10-24 Lighthouse pass

A mobile run on Home scored 91 / 100 / 100 / 100. What it flagged and what changed:

- **Render-blocking CSS (~440ms):** `build.inlineStylesheets: 'always'` in `astro.config.mjs`, so a
  page's CSS arrives in its HTML (about 50KB more per page, compressed). Measured the same day, Home
  over `scripts/serve-dist.mjs`, Lighthouse 12.6 mobile, median of three: inline FCP 1.35 s / LCP
  2.10 s, linked FCP 1.65 s / LCP 2.26 s. A live run from a home connection read LCP 3.1 to 3.2 s
  (real latency plus the simulated slow phone); compare like with like before undoing it.
- **Image delivery:** the pre-launch example photos have 480/640/800 copies and a srcset with
  `sizes="auto, ..."` (`exampleSrcset` in `src/data/shot-list.ts`); the video poster is 720 wide.
- **The example clip and cache lifetime:** `preload="none"`, played only while on screen
  (`HomeWeekWatch.astro`), and `/shot-examples/*` cached a year (`public/_headers`).
- **Non-composited animations:** the hero's `flow-hold` had zero length (`docs/agent/animation.md`).
- **Forced reflow:** the flow layer reads, then writes, in batches. What remains is Astro's router
  reading the scroll position on load, which is the page's first layout, not extra work.
- **CSP and HSTS:** `docs/agent/deployment.md`, "Security headers".
- **Left as they are, on purpose:** "Legacy JavaScript" is Cloudflare's own analytics beacon (third
  party). "Unused JavaScript" (~35KB) is React, which the phone menu needs (`client:idle`); dropping
  it means rewriting the menu without React. The weather fetch in the dependency tree already waits
  for idle time.

### FBC Auburn, the 2026-10-25 page-weight pass (site audit, DEV-M1, M2, M7, M8, L1, L10)

Measured on `scripts/serve-dist.mjs` (brotli, the deploy's `/_astro/` caching), before and after,
medians of three. "Lighthouse" is 12.x mobile (simulated slow 4G). "Throttled" is Playwright at
375px, DPR 2, 1.6 Mbps / 150 ms RTT, CPU 4x, cache off; "next page" is a click through the page
router after the first page has settled (scripts in the session scratchpad, `nav.mjs`).

|                                                    | Before               | Linked sheets (tried)     | After                |
| -------------------------------------------------- | -------------------- | ------------------------- | -------------------- |
| Lighthouse Home / Plan your visit / Ministries     | 99 / 98 / 91         | 98 / 87 / 99              | 99 / 97 / 99         |
| Lighthouse LCP, same pages                         | 2.10 / 2.40 / 3.46 s | 2.26 / 3.54 / 1.95 s      | 2.18 / 2.48 / 1.88 s |
| Throttled first visit FCP (Home, Ministries, Plan) | 808 / 872 / 852 ms   | 1036 / 1032 / 1100 ms     | 596 / 672 / 624 ms   |
| Next page through the router (3 pairs)             | 1097 / 924 / 728 ms  | 1107 / 704 / 477 ms       | 889 / 708 / 584 ms   |
| Bytes for that next page                           | 170 / 199 / 72 KB    | 64 / 158 / 31 KB          | 86 / 179 / 52 KB     |
| Home HTML (brotli) / its CSS                       | 62.6 / 41.1 KB       | 23.2 KB + 44 KB of sheets | 45.0 / 23.7 KB       |
| Journal post JS (files, brotli)                    | 29 files, 167 KB     |                           | 20 files, 113 KB     |

- **CSS stays inline, and each page is purged** (`scripts/purge-page-css.mjs`, run by
  `npm run build` after `astro build`; helpers and tests in `scripts/lib/css-purge.mjs`). Astro
  gives every page the CSS of every component its module graph reaches, and SectionRenderer
  imports every section, so every page carried every block's styles. The purge drops a rule only
  when every selector in it names a class that appears nowhere in the page's HTML (attributes,
  island props, inline scripts) or in the scripts the page loads (followed through their imports),
  so classes the islands and the flow layer add at runtime are kept. Rules without classes,
  `:not()`, `@font-face`, `@keyframes` and `@property` are never touched. About half the inline CSS
  goes (48% when measured, 56% once the phone menu became a dialog; Plan your visit 250 KB to
  about 128 KB). Checked by comparing the computed style of
  every element on all 27 built pages at 375 and 1280 (and with the phone menu and search open,
  and with motion on after a full scroll): zero differences. **If a script ever builds a class
  name from pieces** (`'cb-' + kind`), its rule would be dropped: name the prefix in `KEEP` at the
  top of the script.
- **Linked sheets were measured again and lost the first visit** (about 0.3 to 0.4 s later first
  paint, one more round trip before anything draws) while winning the next page by 20 to 40 KB.
  The purge closes most of that gap, so inline stays (`astro.config.mjs` comment).
- **Tailwind no longer scans `scripts/` and `tests/`** (`@source not` in `globals.css`): their
  words minted about 3 KB of rules nobody uses.
- **No toaster on every page** (DEV-M2): the copy-email button was its only caller; it is now an
  Astro component with a live region, so React, sonner and next-themes left the page.
  `JournalPortableText` hydrates only on a post with a before/after slider, and its heading ids
  are worked out at build time, so `slugify` no longer ships.
- **Fonts and textures are hashed** (DEV-M7): `src/assets/fonts/` and `src/assets/textures/`,
  cached a year under `/_astro/`; no more five revalidations per page view. Detail:
  `docs/agent/deployment.md`, "Caching".
- **First photo eager** (DEV-M8): `SectionRenderer`'s `leadImage` (set by `[slug].astro` and
  `about.astro`) gives the first section after the page head `isFirst`; `ImageText`,
  `FindYourPlace` (first card) and `ShotRequest` then load it `eager` with `fetchpriority="high"`.
  The journal cover and the first journal card do the same. Ministries' Lighthouse LCP went from
  3.46 s to 1.88 s. Check the real-photo path the same way when photos land.
- **The empty-arch mark is WebP at 150 and 300px** (DEV-L1), not the 128 KB master PNG.
- **Stone icons about 40% lighter** (DEV-L10): `scripts/print-icons.mjs` writes their path data in
  its shortest exact form (`scripts/lib/svg-path-compact.mjs`, which checks every point stays
  put): 1.45 MB to 0.90 MB for the 47 icons, brotli 464 to 313 KB. Side by side they look the
  same; a pixel compare finds a few anti-aliased edge pixels.
- **Build target left alone** (DEV-L11): the only "legacy JavaScript" Lighthouse lists is
  Cloudflare's analytics beacon (third party); the site's bundles already use Vite's modern
  default, and the matched dependency set is not moved for it (rule 8).

### Bundle budgets

| Slot                                                   | Target  |
| ------------------------------------------------------ | ------- |
| Total JS on home page (compressed)                     | < 100KB |
| Largest single React island bundle (compressed)        | < 50KB  |
| Total CSS (compressed)                                 | < 30KB  |
| Hero image (any viewport)                              | < 200KB |
| Home hero video (FBC Auburn, Studio warns above)       | < 3MB   |
| Home hero phone video (FBC Auburn, Studio warns above) | < 1MB   |

If a new dependency pushes a budget, that's a discussion before merging. Some are worth it (motion is the interaction language); some aren't (a 60KB icon library when three lucide-react icons would cover it).

### Image weight by slot

| Slot                       | Display max        | SanityImage props                                                              | Notes                                                   |
| -------------------------- | ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Home hero (full-bleed)     | viewport           | `width={2400} sizes="100vw" loading="eager" fetchpriority="high" quality={70}` | LCP element                                             |
| Portfolio/Journal cover    | ~896px             | `width={1800} sizes="(min-width: 920px) 896px, 100vw" loading="eager"`         | Capped at `max-w-4xl`                                   |
| Project gallery thumbnail  | viewport-dependent | `width={900} quality={75}` (via `urlFor`)                                      | Lightbox loads larger on tap                            |
| Project gallery fullscreen | viewport           | passed to `yet-another-react-lightbox` directly                                |                                                         |
| Testimonial avatar         | 120x120            | `urlFor(...).width(120).height(120).fit('crop')`                               | Static thumbnail                                        |
| OG image (committed)       | 1200x630           | n/a, generated once via `npm run og`                                           | Per-page JPEG at build via `scripts/build-og-cards.mjs` |

Use `<SanityImage />`'s `width` prop to drive these. **Never request larger than the slot renders at.** Format defaults to `auto` (AVIF / WebP / JPEG fallback), quality to 75 -- drop to 65 for big hero photos.

### Font loading

- **Libre Baskerville** (display serif): self-hosted via `@fontsource/libre-baskerville`. Load only the weights you use -- each unused weight file is ~50KB wasted across latin + latin-ext woff/woff2.
- **Inter** (body sans-serif): self-hosted via `@fontsource-variable/inter`. The variable file covers all weights in a single request.
- **Script accent font** (opt-in): no script font is loaded by default. To enable the `font-script` utility, add a `@fontsource` import in `globals.css` and point `--font-script` at the family. See `animation.md` for the full opt-in steps.
- No hand-written `<link rel="preload">` on a font URL: Vite hashes the filenames at build time, so a typed path would 404. FBC Auburn preloads its two Latin text faces through a `?url` import instead (`src/assets/fonts/`, BaseLayout), which gives the same hashed URL the `@font-face` uses (2026-10-25).

### Lighthouse scorecard

Target: 100 on all four categories (Performance, Accessibility, Best Practices, SEO) for all core routes on both mobile and desktop. Measure on the deployed Cloudflare URL via Chrome DevTools' bundled Lighthouse, not the dev server.

**Levers that achieve this -- preserve unless you have a stronger reason than "I want to simplify":**

- Every island hydrates at `client:idle` or `client:visible`. Nothing on a public page uses `client:only`: it skips SSR, so the island's markup is missing from the server HTML and its runtime lands on the critical path
- No smooth-scroll library: scrolling is native (Lenis removed 2026-10-17, PORTS.md card 102), so no extra chunk, no `requestAnimationFrame` loop
- Logo PNGs moved from `public/` to `src/assets/` so Astro emits WebPs
- Single-img theme-aware logo (one fetch per page load instead of two)
- SanityImage emits real width-descriptor srcset with 11 breakpoints (160-2400; small steps added in card 93, see images.md)
- AVIF as default format (`'auto'`) -- Sanity picks AVIF on supporting browsers
- `fetchpriority="high"` on hero LCP image
- FBC Auburn's Home hero video (2026-10-25) is added by script after the load event, with the already-chosen photo (`currentSrc`) as its poster, so the photo stays the LCP and nothing extra is fetched for the poster; reduced motion, Save-Data, 2G/3G and a downlink under 1 Mbps get no `<video>` at all, and phones under 768px get the optional 640px "Phone video" instead of the full clip (2026-10-26: 1,000 KB to 267 KB of video at 375px on throttled 4G, LCP unchanged; `src/lib/hero-video.ts`, `HomeHero.astro`)
- Portrait inline images capped to `max-w-[600px]` (smaller files at the smaller cap)
- Cloudflare adapter `imageService: 'compile'` (build-time Sharp, no runtime image binding)

### Hydration strategy

| Component             | Directive                                                      | Why                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeToggle`         | `client:idle`                                                  | Anti-FOUC inline script in `BaseLayout` already applies the correct theme class before first paint, so the React island only needs to hydrate by the time the visitor moves to click it. Demoting from `client:load` shaves real TBT off mobile Lighthouse runs.                                                                                         |
| `MobileNav`           | none (2026-10-25)                                              | No longer an island: server markup on a native `<dialog>` plus a small inline script (`MobileNav.astro`). Dropped the 22 KB MobileNav chunk and its Radix and shadcn helpers: about 130 KB to 93 KB of gzipped JS on every page. With the Toaster gone too (below), the copy-email button and the remaining islands no longer pull React onto every page |
| `ContactForm`         | `client:visible`                                               | Below the fold on most pages                                                                                                                                                                                                                                                                                                                             |
| `BackToTop`           | `client:idle`                                                  | Doesn't appear until the visitor scrolls 600px, so the JS doesn't need to race first paint                                                                                                                                                                                                                                                               |
| `JournalPortableText` | `client:visible`, only when the post has a before/after slider | Every other post renders it as plain HTML with no React; heading ids are worked out at build time by the page, so `slugify` never ships. The Toaster is gone (2026-10-25): its only caller, the copy-email button, has its own live region                                                                                                               |
| `FaqAccordion`        | `client:visible`                                               | Interactive but not critical-path                                                                                                                                                                                                                                                                                                                        |

Default to `client:visible` or `client:idle` for anything not immediately above the fold. Astro ships less JS up front. `client:load` is reserved for islands that genuinely must be live before first interaction -- and even then, ask twice whether `client:idle` is acceptable.

### Verifying

- `npm run build` then check `dist/` size for sanity. Astro reports the largest bundles in the build log.
- Run Lighthouse on the deployed Cloudflare URL after every push that touches a page template or component.
- Cloudflare Web Analytics surfaces real-user LCP, INP, CLS once traffic exists. Watch weekly post-launch; investigate any page that drifts past the budgets above.
