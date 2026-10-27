# Page architecture

> Core page and section architecture, nav structure, the page-builder system, and the section-visibility toggle system.

## Page architecture

### Core routes

The starter ships these routes (always on, not toggleable):

| Path              | Source                           | Notes                                                                                   |
| ----------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `/`               | `src/pages/index.astro`          | Home — section-driven via `pageBuilder` + `SectionRenderer`                             |
| `/about`          | `src/pages/about.astro`          | About — section-driven                                                                  |
| `/services`       | `src/pages/services.astro`       | Services — section-driven                                                               |
| `/process`        | `src/pages/process.astro`        | Process — section-driven                                                                |
| `/[slug]`         | `src/pages/[slug].astro`         | Custom pages created in the Studio; reserved slugs are filtered inside `getStaticPaths` |
| `/faq`            | `src/pages/faq.astro`            | FAQ page + faqItem collection grouped by category                                       |
| `/contact`        | `src/pages/contact.astro`        | Contact: section-driven since 2026-10-26 (the Contact form block)                       |
| `/journal`        | `src/pages/journal/index.astro`  | News and notes: section-driven since 2026-10-26 (the posts block)                       |
| `/journal/[slug]` | `src/pages/journal/[slug].astro` | Post detail: reading progress + header + cover + body + related                         |
| `/privacy`        | `src/pages/privacy.astro`        | Privacy: section-driven since 2026-10-26 (the policy text block)                        |
| `/404`            | `src/pages/404.astro`            | Custom 404                                                                              |

Additional routes come from opt-in modules staged under `modules/` (off by default). Each module is documented under `docs/modules/`. There are 13 opt-in modules: `portfolio`, `shop`, `virtual-services`, `gift-certificates`, `press`, `resources`, `lead-magnets`, `newsletter`, `style-quiz`, `budget-calculator`, `events`, `donations`, `team`. Key routes they add: `/virtual-services` (was `/e-design`), `/events`, `/donate`, `/team`. (The `process` route is always-on core, not a module.)

---

## Page builder

### How section-driven pages work

The four core pages (home, about, services, process) and every custom `page` document render from a `pageBuilder` array: an ordered list of typed blocks the editor builds in Sanity Studio. No code change is needed to reorder sections, add a new one, or remove one. The code handles layout; the editor handles content.

**FBC Auburn: every main page is a page builder (2026-10-26).** So the pastor can rearrange, remove and add sections on every main page in the Studio. Home (`homePage`, drawn by `HomeBoard`), About, Contact, Privacy, News and notes (`journalPage`) and Sermons (`sermonsPage`) render their `pageBuilder` through `SectionRenderer`; Plan your visit, Give (`page-give`) and This week's bulletin (`page-bulletin`) are ordinary Studio `page` documents that `[slug].astro` always builds (`ALWAYS` inside `getStaticPaths`, rule 10; fallbacks in `BUILT_IN_PAGES`), so `src/pages/give.astro` and `bulletin.astro` are gone and their slugs are no longer reserved. The parts those pages drew in code became blocks (`collectionSections.ts`, components in `src/components/sections/`):

| `_type`                | Component            | Offered           | What it draws                                                                                       |
| ---------------------- | -------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `contactFormSection`   | `ContactFormSection` | Contact page only | The form (or the Church Trac form, `church-trac.md`) with the phones and the sticky sidebar         |
| `privacyPolicySection` | `PrivacyPolicy`      | Privacy page only | The policy text and date typed in the block; empty shows the built-in, analytics-aware policy       |
| `journalPostsSection`  | `JournalPosts`       | Every builder     | Category chips, every post (first featured gets the big card), the newsletter sign-up when it is on |
| `sermonArchiveSection` | `SermonArchive`      | Every builder     | Every sermon with the series, preacher and book filters and Show more (nothing until a sermon)      |
| `podcastSection`       | `PodcastSection`     | Every builder     | The podcast buttons and feed address (`id="sermons-podcast"`; nothing until a sermon)               |
| `bulletinSection`      | `BulletinSection`    | Every builder     | The newest bulletin (else last week's, with when the next goes up) and the earlier ones             |

All six are self-contained in the cadence (each draws the white band its page drew). The Contact form's questions and "What happens next" stay on the Contact page's "The form" tab; the block's GROQ arm (`collection-arms.ts`) reads them in, so the preview shows their drafts. The collection blocks read their rows from the route loaders (`getAllSermons`, `getAllJournalEntries`, `getBulletins`), so `COLLECTIONS_FIXTURE` still works. `sermonSeriesSection` gained `hideWhenEmpty` (the Sermons page hides its series band until there is a series). The old banner, closing-band and Extra sections fields on those four documents are hidden fossils (rule 1); `scripts/content/builder-pages.mjs` moved their content into the new arrays. `faqPage` is orphaned (it forwards to `/plan-your-visit/#questions`) and appears nowhere in the Studio.

**Default fallback.** `src/data/defaultSections.ts` holds code-defined default section arrays for each core page. When `PUBLIC_SANITY_PROJECT_ID` is absent (fresh clone) or a page's `pageBuilder` array is empty, the route renders from these defaults. The site always renders non-blank content.

### Block library (`src/sanity/schemaTypes/sections.ts`)

`SECTION_TYPES` (exported from `sections.ts`) is the single source of truth for the general block types available on every page builder (eleven from the starter plus FBC Auburn's two):

| `_type`            | Cadence        | Description                                                                      |
| ------------------ | -------------- | -------------------------------------------------------------------------------- |
| `heroSection`      | SELF_CONTAINED | Full-width headline block, optional background photo, primary and secondary CTAs |
| `richTextSection`  | CONTENT        | Portable Text with heading, prose, optional alignment and width controls         |
| `imageTextSection` | CONTENT        | Side-by-side image and text, configurable image side                             |
| `gallerySection`   | CONTENT        | Image grid with optional lightbox, configurable column count                     |
| `quoteSection`     | CONTENT        | Pull quote with attribution and optional context line                            |
| `statSection`      | SELF_CONTAINED | Row of up to 4 labeled numbers (auto-counted up animation)                       |
| `ctaBandSection`   | SELF_CONTAINED | Full-width call-to-action band, optional background photo                        |
| `videoSection`     | CONTENT        | YouTube or Vimeo embed with optional heading and caption                         |
| `spacerSection`    | SELF_CONTAINED | Explicit vertical gap -- ornament, line, or invisible space                      |
| `logoStripSection` | SELF_CONTAINED | Row or grid of client/partner logos with optional eyebrow and headline           |
| `embedSection`     | SELF_CONTAINED | Embed URL, or pasted code in its own sandboxed box (card 121, custom-code.md)    |
| `stepsRailSection` | CONTENT        | FBC Auburn: numbered steps on a stone path with stone icons, ending in the mark  |
| `walkSection`      | CONTENT        | FBC Auburn: Walk in with us, the visit stop by stop down a stepping-stone path   |

The two FBC Auburn blocks live in `auburnMotionSections.ts` and are spread into `pageSectionSchemas`. Their stone
icon picker is the `icon` field and `imageTextSection`'s new picture choice is `art` (photo, mark or baptism); both
are in `NON_STEGA_FIELDS`. Motion: `docs/agent/animation.md`, "The stone path".

Blocks deliberately carry no `backgroundColor` field. Background assignment is `SectionRenderer`'s responsibility.

### Rich section types (`src/sanity/schemaTypes/richSections.ts`)

Ten additional types for the core pages. These are richer blocks that auto-populate from Sanity collections (services, testimonials, process steps, philosophy points) or use structured inline data:

| `_type`               | Cadence        | Description                                                                                                           |
| --------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `founderSection`      | SELF_CONTAINED | Two-column bio: portrait, headline, prose, optional CTA                                                               |
| `servicesGridSection` | SELF_CONTAINED | Services grid, auto-populated from the `service` collection; two layout variants (grid or full list)                  |
| `testimonialsSection` | SELF_CONTAINED | Featured pull-quote + testimonial grid, references `testimonial` docs                                                 |
| `storySection`        | CONTENT        | Long-form narrative: sticky portrait, story prose, attribution and credential lines                                   |
| `valuesSection`       | SELF_CONTAINED | Numbered values/philosophy card grid, auto-populated from `philosophyPoint` docs                                      |
| `processSection`      | SELF_CONTAINED | Ordered process steps, auto-populated from `processStep` docs; preview (4-step) or full variant                       |
| `serviceAreaSection`  | CONTENT        | Service area prose + optional travel fee table pulled from `businessInfo`                                             |
| `guaranteeSection`    | CONTENT        | Trust/guarantee statement -- editor text or falls back to `siteSettings.satisfactionGuarantee`                        |
| `faqSection`          | SELF_CONTAINED | Inline FAQ accordion; references `faqItem` docs. Does not re-emit FAQPage JSON-LD (the dedicated /faq page owns that) |
| `teamSection`         | SELF_CONTAINED | Team member grid with inline member objects (name, role, photo, bio, social links)                                    |

**Per-page curated lists.** Each core page exposes only the block types that make sense on it. These are defined at the bottom of `richSections.ts`:

- `HOME_SECTION_TYPES` -- all 11 general + `founderSection`, `servicesGridSection`, `testimonialsSection`, `processSection`, `faqSection`, `teamSection`
- `ABOUT_SECTION_TYPES` -- all 11 general + `storySection`, `valuesSection`, `faqSection`, `teamSection`
- `SERVICES_SECTION_TYPES` -- all 11 general + `servicesGridSection`, `serviceAreaSection`, `guaranteeSection`, `faqSection`
- `PROCESS_SECTION_TYPES` -- all 11 general + `processSection`, `faqSection`

Custom `page` documents expose `SECTION_TYPES` (the eleven general blocks only).

### `SectionRenderer.astro`

`src/components/SectionRenderer.astro` is the page-builder runtime. It receives the resolved section array from the GROQ query and:

0. Expands any **synced section** into the sections its saved copy holds (`expandSyncedSections()` in `src/lib/authoring.ts`, PORTS.md card 109), so everything below sees ordinary blocks and the cadence runs across them.
1. Classifies each block as **self-contained** (`heroSection`, `ctaBandSection`, `statSection`, `spacerSection`, `logoStripSection`, `embedSection`, `founderSection`, `servicesGridSection`, `testimonialsSection`, `valuesSection`, `processSection`, `faqSection`, `teamSection`) or **content** (the rest).
2. Assigns alternating `surface` / `surface-muted` classes to content blocks in sequence, skipping self-contained blocks in the count.
3. FBC Auburn (board E, 2026-10-17): opens every section after the hero with `BoardRule.astro` (whitespace only since the 2026-10-25 audit; the brick marker shows only beside a worded eyebrow) instead of a `SectionDivider` between surfaces, and passes `quiet` to the hero when the page draws the mark or the baptism picture, so there is one stone moment per page. On the inner pages `src/styles/board.css` turns the tinted surfaces white.
4. Delegates rendering to individual section components in `src/components/sections/`.

The cadence logic is in `src/lib/sectionCadence.ts` (unit-tested). Blocks have no color field and never call `SectionDivider` or `BoardRule` directly. Since 2026-10-18 the five content blocks carry a `look` (Standard, Feature, Stone; `src/lib/section-looks.ts`), which the cadence resolves with the neighbours in view: Feature (the church blue) and Stone (the pale tint, flat since 2026-10-27) sit outside the alternation, two of the same look never touch, and a Feature never touches a dark band (rule 9 as amended, PORTS.md card 124). This means an editor can reorder sections in Studio without ever producing a background collision or a missing divider.

### `additionalSectionsField`

`additionalSectionsField` (defined in `sections.ts`; at FBC Auburn a hidden fossil on Contact, Privacy, News and notes and Sermons since 2026-10-26, its sections moved into each page's Page layout) is a secondary `pageBuilder`-style array that appends to the bottom of a page's rendered output. Any page schema can include it as an append zone for supplementary content (a CTA band, a testimonial quote) without requiring a fully structured bottom section in the main builder. Empty means no change.

---

## Custom pages

### `page` document type (`src/sanity/schemaTypes/page.ts`)

A multi-instance (non-singleton) document type editors use to create new pages from the block library without touching code. Fields: `title`, `slug`, `pageBuilder` (array of general section blocks), `addToMainNav`, `navGroup`, `navLabel`, `addToFooter`, and SEO fields.

**Reserved-slug guard.** The slug field's validation rule checks the value against the list in `page.ts` (which mirrors `src/lib/reservedSlugs.ts`) and returns a validation error if the editor tries to use a slug that belongs to a built-in route. This guard runs inside Sanity Studio before the document can be published.

**Route.** `src/pages/[slug].astro` handles all custom pages. `getStaticPaths` fetches all published `page` documents and filters out reserved slugs. The filter must live **inside** `getStaticPaths` — an Astro static-build isolation requirement. The reserved list is in `src/lib/reservedSlugs.ts`.

**Nav wiring.** Pages with `addToMainNav: true` are fetched via `getNavPages()` and injected into `Header.astro` and `Footer.astro` alongside the built-in links.

---

## Section visibility

Optional sections of the site can be turned on or off without touching code. The system is designed so the live site is completely unchanged until a toggle is explicitly set to off.

**Schema.** `siteSettings` has a `sectionVisibility` object field in a dedicated `'visibility'` field group. It contains boolean flags corresponding to each toggleable section.

**Helper.** `src/lib/sectionVisibility.ts` exports `getSectionVisibility(raw)`, which converts the raw Sanity object into a flat `SectionVisibility` map of plain booleans. The critical rule is `value !== false`: undefined, null, or true all produce `true` (visible). Only an explicit `false` produces `false` (hidden). This rule is what makes new sites safe to deploy before content is ready.

**What "off" does.** When a toggle is off, the section disappears everywhere simultaneously:

- Removed from the desktop nav and mobile drawer
- Removed from the footer link columns
- The section's own index page redirects home via `return Astro.redirect('/')` at the top of the page
- Dynamic detail routes return an empty array from `getStaticPaths()` so they build zero pages and 404

**What stays on always.** Home, About, Services, Process, FAQ, Contact, Journal, Privacy, and 404 are not gated by visibility toggles. They are always built and always accessible.

**Draft safety.** Turning a section off does not delete or unpublish any content in Sanity. Drafts and published documents are untouched. Turning it back on makes everything reappear after the next rebuild.

---

## Header nav

Header nav uses a grouped structure: flat links and optional dropdown groups, left to right. The exact items depend on which modules are active.

The desktop nav is **server-rendered** in `Header.astro` as Astro/SSR markup: flat items are real `<a>` tags, dropdown groups are native `<details>`/`<summary>` disclosures with the child links as real `<a>` tags inside. Everything is present in the server HTML at build time, so search-engine crawlers see every internal link and there is no flash-of-missing-nav (or CLS) before any JS runs. A small progressive-enhancement `<script>` at the bottom of `Header.astro` layers on open-on-hover, close-on-outside-click, close-on-Escape, and close-on-navigation (re-bound on `astro:page-load`, document-level listeners guarded by a `window.__headerNavBound` flag so they don't stack across View Transitions). The nav is fully functional with JS disabled.

**One dropdown model (2026-10-25, UX audit H4).** A mouse opens a group by hovering. A click on the label of a group that hover has just opened keeps it open (it used to toggle the `<details>` shut under the cursor); a second click closes it. Leaving the label and panel starts a 300ms close, cancelled when the pointer comes back, so a diagonal path to a link does not drop the menu; hovering another group switches straight to it. Touch and keyboard skip all of this: a tap, Enter or Space toggles the native `<details>` (keyboard clicks carry `detail === 0`), Tab walks the links, Escape closes and returns focus to the label.

**One navigation system per width (2026-10-25, design audit M8).** From 1024px the header row shows the first five menu items (`DESKTOP_ITEMS` in `Header.astro`). When that is every item, `MobileNav` gets `navComplete` and the "Menu" pill is hidden from 1024px (`.site-header__menu[data-nav-complete]`), leaving the dropdowns, the navy Give button, the red "Plan your visit" button (both since 2026-10-25) and the search button, all 44px tall with the 10px control corner. A longer menu keeps the pill, so nothing is out of reach.

**The full-screen menu is not an island (2026-10-25, web-dev audit M2 and M6).** `MobileNav.astro` is server markup on a native `<dialog>`: `showModal()` gives the focus trap, Escape, the inert page behind and focus back on the pill, and `html:has(.auburn-menu[open])` locks the page scroll. A small inline script opens and closes it (delegated click listener in the capture phase, because the pill is a same-page `#` link the router would otherwise take), closes it when a link inside is followed or a View Transitions navigation starts, sends "Search the site" on to the search dialog, and keeps the watch row in step with "Live now" (`window.__churchLive` and the `church:live` event from `src/lib/live-client.ts`). With JavaScript off the pill is a plain link to `#site-footer-nav`, the footer's page list. Removing the React island took about 37 KB of gzipped JS off every page (129.8 KB to 93.1 KB on Home, measured on the built pages).

**Header compaction is transform-only (2026-10-25, web-dev audit L5).** From 1024px the scrolled bar slides up by `--hdr-shrink` (its top strip goes off screen), its row's children slide down by half that, and the lockup scales to 40px tall. Its layout height never changes, so nothing under it moves (CLS on Home at 1280 went from 0.022 to 0 in a scripted scroll).

**Do NOT regress the desktop nav to a client-only island.** An earlier pattern hydrated a `NavDropdowns.tsx` React island with `client:only="react"`, which left the ENTIRE desktop nav out of the server HTML, bad for SEO and CLS. The problem was the directive, not the library: Radix primitives server-render fine here (see `components.md`), and `client:only` is what skips SSR. If a future change reintroduces a Radix dropdown island, hydrate it at `client:idle` and keep the flat links and the group structure in the server markup, using the island only for the open/close interaction.

The `<summary>` triggers carry `.nav-underline` and get `aria-current="page"` (which locks the underline wide) when one of their children is the active route, matching the flat-link pattern.

**Header breakpoint is `lg:` (1024 px), not `md:` (768 px).** Between md and lg the desktop nav + CTA button cram the nav items against the logo and visibly squish the wordmark. Bumping the breakpoint means tablet/narrow-laptop widths see the centered-logo + hamburger layout, and the desktop layout only appears once there is actual room for it.

**The `NAV_ITEMS` definition.** Each item is `{ kind: 'flat' }` or `{ kind: 'dropdown', items: [...] }`, defined once in `Header.astro` and shared with `MobileNav.astro` so desktop + mobile stay in sync. The menu (Site settings > Menus) is four groups since the re-audit (2026-10-26, `scripts/content/menu-reach-us.mjs`; it was three, set by `audit-chrome.mjs`): New here (Plan your visit, About, What we believe, Leadership), Get involved (Ministries, Next steps, News and notes), This week (Sermons, Events, Bulletin, Give) and Reach us (Contact, Need the pastor?, Prayer requests). One name per destination: the footer's page list, the where-next rows and the menu use the same labels. Four groups still fit the desktop row beside Give, Plan your visit and search (`DESKTOP_ITEMS` is 5, so `navComplete` holds and the Menu pill stays hidden from 1024px): the lockup no longer shrinks (`flex: none`), and between 1024 and 1279px the nav type is 16px, the gaps tighter, the buttons' side padding 0.85rem and Give drops its icon; from 1280px the lockup is 50px tall. Measured on the built pages: 64px between the lockup and New here at 1024 and 48px at 1280, with the row ending inside the window at both (`src/styles/auburn.css`, "Four menu groups").

**The Menu pill is a real button (re-audit 2026-10-26).** The server renders a link to `#site-footer-nav` (so a phone with scripts off still reaches every page); the script swaps it for a `<button type="button">` with the same class, children and `aria-*`, so Space opens the dialog as Enter does (a link with `role="button"` scrolled the page 710px on Space). `.menu-pill` sets `font-family` and `line-height` to inherit, so both shapes draw alike. Pinned by `tests/reaudit.spec.ts`.

### Page endings (2026-10-25, the site audit)

Every page ends with one closing device, then a footer of facts and links:

- **One closing device.** A page that ends on its own closing band (`FinalCta.astro`, marked `data-final-cta`) does not also get the footer's where-next rows (`WhereNext.astro` hides itself with `body:has(main [data-final-cta])`); a page without one gets the rows. The rows never list the page you are on. Since 2026-10-26 the short pages get none either: the Bulletin, a sermon's own page and the 404 (`SHORT` in `WhereNext.astro`).
- **No footer buttons.** The footer's "Plan your visit" and "Ask a question" buttons are gone: the header carries the visit button and the page list covers the rest. (`siteSettings.footerSecondaryCta` is no longer drawn.)
- **The This Sunday panel only where nothing above gives the times.** `Footer.astro` leaves it out on Home and Plan your visit, and CSS hides it on any page whose `<main>` holds `[data-this-sunday]`, `[data-service-times]` or `.times-band-wrap`. Give a new Sunday card one of those markers.
- **The verse on Home only**, at `clamp(2rem, 1.2rem + 2.5vw, 3.5rem)`: wrapped and still on a phone, sliding with the scroll from 768px (`docs/agent/animation.md`).
- **The page list** (`#site-footer-nav`): the Sanity footer columns as short columns in Familjen Grotesk, 17px weight 500 (design audit M2; Young Serif stays for the where-next rows, the church's name and the Sunday numerals), on a phone a tight 2 by 2 grid of the four groups with 36px rows (re-audit 2026-10-26), Contact across the full width under them with the number, Watch live and the social buttons sharing rows, the church's name and Give on one row, a 44px sill and a slimmer bottom bar. On a wide screen the church's name runs across the top, the list sits on the left (four columns at 1280, as many as fit at 1024) and the This Sunday panel on the right; with no panel each group and Contact take a column of their own (five).
- **The phone Sunday bar** (`src/components/church/SundayBar.astro`, rendered by the footer): Home ("Plan your visit") and Plan your visit ("Tell us you are coming", `/contact/?topic=visit`). It shows once the page's This Sunday card, or with none the page's `h1`, has scrolled above the screen, and hides while the footer is in view.

Measured on the built pages at 375px (footer, pre-launch notes on): 1,852px on every route before; about 1,245px on pages with a closing band and 1,490px on pages with where-next rows after, about 150px less again once the "[Jacob: ...]" asks and the For Jacob pill's room go at launch. At 1280px: 1,776px before; 759px (band pages) and 1,112px (where-next pages) after. The re-audit pass (2026-10-26, four groups, measured on the built pages at 375 with the pre-launch notes on): 1,310px to 1,158px on band pages, 1,553px to 1,401px on where-next pages, and the Bulletin and 404 from 1,553px to 1,158px (no rows). Still more than one screen. The Jacob asks in Contact and the For Jacob pill's room come off at launch (about 90px).

**Availability indicator.** The mobile header carries an availability status pill (pulsing dot + short label, links to `/contact`). Renders only when `siteSettings.availabilityStatus` is set.

### Sanity-driven nav (additive, fallback-first)

`siteSettings.navItems` and `siteSettings.footerColumns` are optional Sanity fields that let an editor override the built-in nav without touching code.

**Header nav:** When `siteSettings.navItems` is a non-empty array, `Header.astro` uses it instead of `FALLBACK_NAV_ITEMS`. The built-in links (About, Services, FAQ, Journal) are the fallback for any site that has never set this field. Sanity items support two shapes: `navLink` (flat, `{ _type: 'navLink', label, href }`) and `navGroup` (dropdown, `{ _type: 'navGroup', label, links: [{ label, href }] }`). The `normaliseSanityNav()` helper in `Header.astro` converts both to the internal `{ kind: 'flat' | 'dropdown', ... }` format.

**Footer columns:** When `siteSettings.footerColumns` is a non-empty array, `Footer.astro` renders those columns instead of the built-in Studio / Work / Free tools columns. "Get in touch" and "Latest Projects" always render (the latter only when the portfolio module is visible). The `normaliseSanityFooterColumns()` helper in `Footer.astro` filters out columns with no title or no links.

**Additive guarantee:** Both fields default to empty in a fresh dataset. An existing clone that has never touched these fields is byte-identical to before. Only non-empty values change the nav. Do not set a `required` validation on these fields.
