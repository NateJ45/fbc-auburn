# Animation layer

> The flow layer (line-by-line headings, fade-ups, parallax, the footer verse, page transitions), native scrolling (Lenis removed), scroll reset on navigation, Motion integration, scroll-triggered reveals, hero entry stagger, Ken Burns slideshow, view-transition cross-fade, and the opt-in script accent.

Non-animation polish (brand stripe, card-lift, surface-warm, reading-progress, sticky-header, paper-grain, print stylesheet) is covered in `polish-layer.md`.

## Scrolling: the browser's own (Lenis removed 2026-10-17)

The starter shipped Lenis until 2026-10-17 (PORTS.md card 102), when Nathan had it taken out, following fbcm (2026-09-24), reid-design-site and nixoncreativestudio. It added only a wheel glide, and for that it cost a chunk of JS on every page, a `requestAnimationFrame` loop that never stopped, a start 1.5 to 2 s after load (it waited on `requestIdleCallback`), and a class of "the wheel does nothing" bugs when a dialog or router swap left it stopped. The `lenis` package is gone from `package.json`; do not add a scroll library back.

What replaced each thing it did:

- **Forward navigation lands at the top; Back/Forward restores the position** (CLAUDE.md rule 5). Astro's router does both itself: `scrollTo({ top: 0, behavior: 'instant' })` on a push, and the saved `scrollX`/`scrollY` on a traverse, inside the swap and before `astro:after-swap`. The old Lenis reset (an `after-swap` `lenis.scrollTo(0, { immediate, force })`) existed only because Lenis's momentum overrode the router; with Lenis gone there is nothing to cancel. `tests/native-scroll.spec.ts` reads `scrollY` at `astro:after-swap` and proves both placements happen in the swap.
- **In-page anchors and programmatic scrolls glide** through `html[data-smooth-scroll] { scroll-behavior: smooth }` in `globals.css`, inside `prefers-reduced-motion: no-preference`. The attribute is set by BaseLayout's script on the visitor's first `pointerdown` or `keydown`, never before: with smooth scrolling on from the first paint, Chrome GLIDES its own scroll restoration on a reload (fbcm measured 0 to 600px over 400 ms), which is visible and leaves scroll-driven UI (the sticky header) unseeded. Every anchor click and scroll control follows a press, so nothing a visitor does loses the glide.
- **The router's placement is never animated.** Its swap copies the incoming document's `<html>` attributes onto the live one, which removes `data-smooth-scroll` before the router scrolls; the next press puts it back.
- **Anchors clear the sticky header through `scroll-mt-*` on the target**, which native scrolling honours exactly as a plain anchor jump does. The headings and sections already carry `scroll-mt-24`; do not add a manual offset (it double-applies).
- **The scroll controls** (home hero scroll cue, case-study TOC) call `scrollTo` / `scrollIntoView` with `behavior: 'smooth'`, or `'auto'` when the reader prefers reduced motion. Code that must place the page exactly (anything with a correction loop) uses `behavior: 'instant'`, since a glide re-aimed every frame never lands.
- **The wheel is the browser's own**, untouched. A test that sets a scroll position as setup passes `behavior: 'instant'`, since `scroll-behavior` turns a two-argument `scrollTo` into a glide once something has been pressed.

**Caveat for testing:** Astro dev full-reloads on back/forward, so the traverse (restore-position) behaviour can only be verified against the production build, as `tests/native-scroll.spec.ts` does.

---

## Motion integration

[Motion](https://motion.dev) (formerly Framer Motion) provides the animation primitives for React islands. Use `motion` components for enter/exit transitions on interactive UI (drawers, modals, toast regions). For scroll-triggered reveals on static content, prefer the lightweight `[data-reveal]` IntersectionObserver approach below -- it doesn't require hydrating a React island just to fade in a static section.

---

## Scroll-triggered reveals

### `[data-reveal]`

Once JavaScript runs, any element marked `data-reveal` starts at `opacity: 0; translate: 0 0.75rem`. An IntersectionObserver in BaseLayout adds `.is-visible` when the element crosses the viewport edge, transitioning to opacity 1 + no translate. The hidden start is scoped to `html.motion`, the same class the FBC Auburn motion switch in BaseLayout's `<head>` sets for `motion.css` (see below), so with JavaScript off or blocked the page renders finished; `[data-stagger-grid]` children and `.img-curtain` follow the same rule (PORTS.md card 107). Reduced-motion visitors and `?still` never get the class, and the global reset forces the end state as a backstop.

Apply selectively to section blocks. Don't add `data-reveal` to above-the-fold content -- it defeats the purpose and hides content from users with slow connections before the observer fires.

### Grid stagger entrance (`[data-stagger-grid]` / `.is-staggered`)

Card grids fade their children up in sequence as the grid crosses the viewport. Add `data-stagger-grid` to a grid container; the BaseLayout observer adds `.is-staggered` on intersection, and per-`nth-child` `transition-delay`s (0 / 100 / 200 / 300ms, capped at 400ms for item 5+) sequence the reveal.

Reduced-motion users get every child visible instantly.

**Filter caveat:** if a `[data-stagger-grid]` container also has filtered children (`.is-filtered-out`), the filter's hide state must be re-asserted at matching specificity (`[data-stagger-grid] > .is-filtered-out`, with `!important`) so the stagger rules don't override the filter's hide state.

### Image curtain reveal (`.img-curtain` / `.is-revealed`)

A surface-colored panel (`color: var(--background)`) scales away from the top edge to reveal an image, reading as materialization rather than a sliding panel. Wrap the image in a `relative overflow-hidden` div and drop `<div class="img-curtain" aria-hidden="true">` in as the last child; the BaseLayout observer adds `.is-revealed` on intersection (`scaleY` 1 to 0, 900ms). The curtain sits at `z-index: 10` so it covers any in-wrapper overlays during the reveal. Reduced-motion users never see the curtain (`display: none`).

---

## Hero entry stagger (`.hero-entry-stagger`)

The hero's content column wraps in `<div class="hero-entry-stagger">`. Each direct child fades up with a 120ms staggered delay on first paint (eyebrow -> decorative hairline -> h1 -> subhead -> CTAs). Animation lives in `globals.css`. Reduced-motion users get the final composition instantly via the global media-query reset.

Don't apply this class to other components -- the per-child delays are tuned for the hero's specific 4-5-element composition.

---

## Home hero slideshow (`HeroBackground.astro`)

The home hero can be a single static image (default) or a slow cross-fading slideshow with a subtle Ken Burns zoom. `homePage.heroImages` in Sanity controls this: one image renders the static hero, two or more render the slideshow.

`HeroBackground.astro` owns the background markup (single `SanityImage` for 0-1 images, or stacked `.hero-slide` images for 2+) plus the readability overlays.

**Why the slide CSS lives in `globals.css` (not a scoped component style):** the slides are rendered by the child `SanityImage` component and would not inherit a scoped style. Same reasoning as `.img-zoom` and `.hero-entry-stagger`.

Each slide is `position: absolute`, `opacity: 0` with a `1.5s` opacity transition; the active slide is `opacity: 1` and all slides run a gentle continuous Ken Burns (`scale(1)` to `scale(1.07)`, alternating origin and duration). A small `<script is:inline>` in HeroBackground advances the active slide every 4500ms (3s hold + 1.5s fade):

- Uses a single `window`-scoped timer that is cleared on every re-init.
- Pauses while the tab is hidden (`visibilitychange`).
- Re-registers once on `astro:page-load` (guarded by a `window.__heroSlideshowBound` flag).
- Never starts under `prefers-reduced-motion`.

The first slide stays the eager `fetchpriority="high"` LCP image; the rest lazy-load. The first slide carries its descriptive alt; the additional slides use empty alt so they are decorative.

---

## Home hero video (FBC Auburn, 2026-10-25)

Home's hero (`src/components/home/HomeHero.astro`, not the starter's `HeroBackground`) can play
a short silent clip: Studio > Home > Page layout > Opening banner > **Background video**. The rules:

- The photo is drawn first and stays the LCP. After the `load` event the hero's script builds a
  `<video muted playsinline loop preload="none">` with the photo's `currentSrc` as the
  poster, puts it over the photo and under `.hb-photo__shade` (so the words keep their contrast),
  starts it with `play()` (no `autoplay` attribute, so the Pause choice and the off-screen pause
  always win), and fades it in (0.6s opacity) on `playing`. It carries `aria-hidden`, `tabindex=-1`, no
  controls and `pointer-events: none`.
- `heroVideoAllowed()` (`src/lib/hero-video.ts`) says no for reduced motion, Save-Data, an
  `effectiveType` of slow-2g, 2g or 3g, a measured `downlink` under 1 Mbps (2026-10-26; 0 counts as
  unknown), and print. Then there is no `<video>` element at all.
  Switching reduced motion on while the page is open removes it. CSS hides it under reduced motion
  and in print as a second guard (`.hb-photo` is already hidden in print).
- A Pause / Play button (`[data-hero-video-toggle]`, `aria-pressed`) sits at the top right
  (WCAG 2.2.2, motion longer than five seconds). The choice is kept in `localStorage`
  (`fbc-hero-video-paused`). The clip pauses while the hero is off screen, and starts again when a tab opened in the background comes to the front (Chrome pauses a muted video in a hidden tab and does not always resume it).
- It drifts with the photo on scroll (class `hb-photo__img`), sits at `z-index: 0` under the shade's
  `z-index: 1`, and plays at `opacity: 0.99`, never 1. Chrome on Windows promotes a fully opaque video
  to a hardware overlay plane drawn outside the page; when it switched to that mid-scroll the navy
  shade vanished on screen (2026-10-25). It never shows in a browser screenshot (Playwright,
  DevTools, the extension), only in an OS screen capture, so check it by eye.
- **Phone video (2026-10-26).** Sanity serves a file as uploaded and does not transcode, so the
  small copy is a second upload: **Phone video** under Background video (`backgroundVideoPhone`).
  Under 768px (`HERO_PHONE_QUERY`) the script picks it with `heroVideoPick()` before it builds
  the `<video>`, so a phone fetches only the small copy; with no phone copy, phones play the main
  clip. The choice is made once, so turning a tablet does not swap the clip mid-play. Measured on
  Home at 375px, 1.6 Mbps / 150 ms, CPU 4x: 1,000 KB of video before, 267 KB after, LCP unchanged
  (about 2.55 s, the poster image).
- `tests/hero-video.spec.ts` drives `/styleguide/home-hero/` (fixed data). Playback itself is not
  asserted, since Playwright's browsers differ on H.264.

**Before launch (2026-10-25)** the hero's shot request carries a stock example clip
(`public/shot-examples/hero-pews.mp4`, Pexels), which plays by the same rules when no video is uploaded
and goes with the shot request at launch. Its phone copy is `hero-pews-640.mp4` (267 KB; the shot's
`video.phone` flag, `examplePhoneVideoSrc()` in `src/data/shot-list.ts`).

**Streaming and fast start (2026-10-25).** The clip is not downloaded before it plays: the browser
fetches it in pieces with HTTP range requests, which Sanity's CDN answers (`206 Partial Content`),
and starts after the first few hundred KB. That only works when the .mp4 is saved for **fast
start**, with its index (`moov`) before the video data (`mdat`); with the index at the end, as
many phone recordings and some export presets leave it, the browser needs nearly the whole file
before the first frame. hppres.org's 54 MB hero works the same way (a fast-start mp4 on S3, no HLS).

- The Studio checks it: on an .mp4 upload the Background video field reads the first 64 KB with one
  range request (`checkFastStart()` / `mp4FastStart()` in `src/lib/hero-video.ts`) and warns
  if the video data comes first. A failed request or a file it cannot read raises nothing.
- Exporting the hero clip: 1280x720 (720p), H.264, 24 to 30 fps, no audio track, about 1.5 to
  2 Mbps, 15 to 30 seconds, under 3 MB (the Studio warns above 3 MB since 2026-10-26). Tick "Web optimized" (HandBrake), "Fast
  start" / "Optimize for web" (Premiere, Media Encoder, CapCut, Shotcut). With ffmpeg:
  `ffmpeg -i in.mov -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 26 -movflags +faststart out.mp4`.
  An existing mp4 can be fixed without re-encoding: `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`.
- Exporting the phone copy: the same clip at 640 wide, no audio, fast start, under 1 MB (the
  Studio warns above 1 MB). The example was made with
  `ffmpeg -i in.mp4 -an -vf scale=640:-2 -c:v libx264 -profile:v main -preset veryslow -crf 30 -maxrate 160k -bufsize 320k -pix_fmt yuv420p -movflags +faststart out-640.mp4`
  (19 s, 267 KB). The navy shade sits over it, so the softer picture does not show.

## View-transition cross-fade

On FBC Auburn the cross-fade below is replaced by the flow layer's lift-and-rise (see "The flow layer").

`<main id="main">` carries `view-transition-name: main-content` and cross-fades on every navigation (`vt-fade-out` 150ms -> `vt-fade-in` 200ms). The header and footer are named (`site-header` / `site-footer`) and pinned with `animation: none` so they stay put through the swap instead of flashing. Astro respects `prefers-reduced-motion` automatically -- reduced-motion users get an instant cut. Pure CSS, no JS.

---

## Script accent font (opt-in)

The `@utility font-script` declaration and `--font-script` CSS custom property exist in `globals.css`, but no script font file is loaded by default. This is intentional: a calligraphic accent is project-specific and adds a font request for every visitor, so it should only be enabled when the design calls for it.

**FBC Auburn (2026-10-26):** the script accent is unused here and its Studio box ("Handwritten accent word") is hidden on the opening banner, the text block and the Invitation band, so editors see one accent box, "Accent word in the heading". The field is kept for its data (rule 1): on the text block and the band, which still draw it, it reappears on any block that holds a word, with a note to move the word. Helper: `scriptAccentField()` in `src/sanity/schemaTypes/_appearanceFields.ts`.

### How to enable the script accent

1. **Choose a script typeface** and install its `@fontsource` package, for example:

   ```
   npm install @fontsource/dancing-script
   ```

2. **Add the import** near the top of `src/styles/globals.css`, after the other `@fontsource` imports:

   ```css
   @import '@fontsource/dancing-script/400.css';
   ```

3. **Point `--font-script` at the family** in the `@theme` block in `globals.css`:
   ```css
   @theme {
     --font-script: 'Dancing Script', cursive;
   }
   ```

Once this is done, any element with the `font-script` Tailwind utility class will render in the script typeface.

### Usage discipline

The `font-script` utility is for a single-word editorial accent on hero headlines and section headings -- not for body text, buttons, or repeated decorative elements.

The shared logic lives in `src/lib/heading-accent.ts` (`splitHeadingAccent(heading, accent)`), which splits a headline string around the matching accent word and returns the before/after fragments for the template to wrap in `<span class="font-script">`. If the accent word is not found in the current headline, the heading renders plain -- editors can update copy without breaking anything. The same function serves the colour accent; only the class on the span differs. It had a second, weaker copy of its own (`src/lib/scriptAccent.ts`) until 2026-09-18, when that copy was retired (PORTS.md card 53).

**Discipline:** use at most one script accent per heading. Over-use dilutes the effect. The accent word is matched case-insensitively against the headline, first occurrence only. Think of it as an editorial signature, not decoration.

---

## The flow layer (FBC Auburn, 2026-10-24)

**Auburn's copy is a fork (2026-10-27).** The starter generalised this layer as PORTS.md card 192 (`layout.motion`, `addFlowExtension`). Auburn keeps its own `flow.ts` and `flow.css`, because the starter's copy holds the firstscreen still on every width and has no brick-laying unit, so it would change how Home and the 404 open. The wordsplitter `src/lib/flow-split.ts` is the shared copy. `brand.config.json` `layout.motion` stays `reveal`; Auburn'sscript does not read it.

Nathan asked for the whole site to feel alive as you scroll, the way a reference church site
(Highland Park Presbyterian, Dallas) does. Its motion was audited on 2026-10-24: GSAP with
ScrollTrigger, SplitText and Barba, driven by Alpine components. What it does, and what we kept:

| On the reference site                                                                                                                                             | Ours                                                                                                                                | How                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Headings, intros and quotes rise line by line out of a mask (SplitText lines, 101% to 0, 1.2s expo-out, 0.1s apart, starting when the top is 85% down the screen) | Every `h1`, `h2` and pull quote in `<main>`                                                                                         | `flow.ts` splits into `.flow-line` masks, `flow.css` `flow-line`                                                         |
| Everything else fades up as it arrives, staggered within a group                                                                                                  | Paragraphs, list items, cards, buttons, figures, forms, stone icons                                                                 | `.flow--up`, 600ms expo-out (calm pages: 200ms, 8px), 60ms apart for things arriving together                            |
| Photos fade in from a slight zoom                                                                                                                                 | Images in a cropping frame                                                                                                          | `.flow--photo` (scale 1.12 to 1)                                                                                         |
| Photos and arches drift with the scroll (scrubbed parallax)                                                                                                       | Big framed photos drift inside their frame                                                                                          | `.flow-par`, CSS view timeline (Chrome, Edge, Safari 26; still elsewhere)                                                |
| Hero text slides away as you scroll out; hero image slides in from the side on load                                                                               | Home: the photo sinks and zooms, the words lift and fade; the This Sunday card slides in from the right                             | view timeline on `.hb-hero` (`--hero-p` fallback in Firefox), `.flow--side`                                              |
| Footer: a big line of text slides sideways with the scroll                                                                                                        | The footer verse (Site settings > Social and footer > "Footer: the verse"; Matthew 11:28 by default), on Home only since 2026-10-25 | `scrubVerse()` in `flow.ts`, ends as the verse nears the top of the screen; from 768px. Phones show it wrapped and still |
| (ours only)                                                                                                                                                       | The building sketch draws itself in: the pen lines sweep across, the shading follows 35% behind                                     | `sketch-draw` in `flow.css`, view timeline; finished drawing elsewhere                                                   |
| Buttons lean toward the mouse (magnetic)                                                                                                                          | Primary buttons and the header's Plan your visit, mouse only                                                                        | `translate` from the pointer, 14px at most                                                                               |
| Page change: a full-screen curtain with the logo and a forced 1.2s wait                                                                                           | Main lifts out (120ms), the new page rises in (260ms); header and footer stay put                                                   | `::view-transition-*(main-content)` in `flow.css`                                                                        |

Left out on purpose: the loading curtain and its wait (slow on every click), anything that
rotates (the cross rule), scroll-jacking or pinning.

**Two levels: full on Home and the 404, calm everywhere else** (audit 2026-10-25: GD-L8, P-14,
UX-L7, V-14). The reviewers found the full layer busy on reading pages, and the pastor asked for
stillness on What we believe and Prayer. `flow.ts` sets `html[data-flow]` on every page:

- **full** when `<main>` holds a `[data-flow-full]` (HomeBoard's root and the 404's section). Everything in
  the table above runs, quicker than before: fade-ups 600ms and 16px (were 1s and 28px), heading lines
  800ms and 80ms apart (1.15s, 110ms), photos 900ms from a 1.06 zoom (1.4s, 1.12), the Sunday card
  800ms from 32px (1.1s, 64px), 60ms stagger (90ms). The brick laying (the stepped markers, the
  sill, the mark build, the brick-letter titles) and the footer verse slide run only here.
- **calm** everywhere else: every unit is one short fade, **200ms and 8px**, 40ms apart; nothing is
  split into lines, zoomed, drifted or laid; the markers, the sill and the mark (About) show already
  laid; the footer verse wraps and rests; the first screen shows as it is at every width (no hold, no
  font wait), so a page's main content (the Sermons video on a laptop) never looks missing on arrival.
  The sketch's draw-in on Plan your visit and the stone `.reveal`s keep their own scroll-scrubbed motion.

To give another page the full layer, put `data-flow-full` on an element inside its `<main>`. CSS keys
the full-only rules on `html[data-flow='full']` (set by the script) or on `html:has([data-flow-full])`
where it must apply before the script runs (the first-screen hold, the verse's one-line layout, the
mark's hidden bricks). Reduced motion and `?still` still switch all of it off: no `html.motion`, no
`data-flow`.

**Page changes are quick** (UX-L7): the old page lifts out in 120ms (8px) and the new one rises into
place in 260ms (12px) with no wait between; it was 220ms out, then 700ms in after a 60ms delay.

**Printing** (DEV-H1): `src/styles/print.css` puts every unit at rest in print (animations off,
opacity 1, no clip), hides the chrome and textures and prints black on white; `motion.ts` also drops
`html.motion` on `beforeprint` and restores it on `afterprint`. `tests/print.spec.ts` pins it.

**Splitting words** lives in `src/lib/flow-split.ts` (`splitWords`, unit-tested). Until 2026-10-25 the
regex in `flow.ts` had lost its backslashes to a Git Bash heredoc (`/(s+)/`), so headings were cut on
the letter s; `scripts/lib/regex-backslash.test.mjs` now fails on any regex in the repo that looks
stripped.

**Phones show the first screen as it is** (mobile audit, 2026-10-24). Below 768px, any unit already
on screen when the page arrives is left alone (never armed), and the CSS hold on the page head and
hero is off, so the page's main words paint with the page. Holding them for the fonts and the stagger
put Lighthouse mobile LCP at 3.3 to 3.7s on About, Plan your visit, Ministries and Sermons with the
text already loaded; without the hold those pages measured 1.9 to 2.7s. Everything below the fold
still rises as it arrives. Since 2026-10-25 calm pages do this at every width; only Home and the 404 hold their first screen on desktop.

**How it works.** `src/scripts/flow.ts` (called from `motion.ts` on every `astro:page-load`) picks
the units itself, so an editor's new section moves like the rest: a list of selectors (`UP_UNITS`,
`LINE_UNITS`) inside `<main>`, a unit only if no ancestor is one (a card moves as one piece), and a
`SKIP` list for things with their own motion (the stone `.reveal`s, `.mark-build`, the hero photo,
the background path). `data-flow="off"` opts a subtree out; `data-flow="lines"` or
`data-flow-item` opts something in. One IntersectionObserver (bottom margin -12%) starts each unit
once; units arriving together are staggered in document order, and on full pages the first screen waits 80ms so
it rises with the page. The observer starts once the fonts are in or 600ms have passed, whichever
comes first; headings split only on the real fonts (a heading whose font is still loading fades up
whole), live preview never splits (click-to-edit reads the text nodes), and a heading whose link
breaks across lines, or whose split would change its height, fades up instead.

**The safety rules.** Every hidden starting state is the first frame of a paused CSS animation
(`both paused`), started by `.flow-go`. So with no `html.motion` (reduced motion, `?still`) none of
it applies; a test that sets `animation: none` (`tests/helpers.ts` `settle`) sees the page at rest;
and once a unit lands the script takes its classes off. A split heading keeps its line spans
(they change nothing in the layout, and the mask goes with the class) so nothing in the DOM moves
after the page has settled; the spans come out, and the heading's own nodes go back, when the width
changes or the page is left. The first screen is held (`flow-hold`) until the script arms it, and the hold lets go by
itself after 1.6s, so a page whose script fails is never left blank. The hold is a real 1.6s animation
at opacity 0 with no fill, not a zero-length one with a delay: the compositor refuses zero-length
effects, which Lighthouse reports as "unsupported timing parameters". Headings are split in one
batch (`splitAll` in `flow.ts`: every read of a phase before any write of the next), so the page is
laid out a handful of times for all of them rather than three times per heading (Lighthouse's
"forced reflow"). Only `opacity`, `translate`,
`scale`, (for the parallax) `transform` and (for the sketch) a mask sweep move. The sketch's
sweep, `--sketch-draw`, rests at 150%, every sweep past the right edge, so it too is the finished
drawing whenever the animation does not run. The starter's `[data-reveal]`,
`[data-stagger-grid]` and `.img-curtain` stand down once the flow layer has armed a page.

**Brick, laid by brick (2026-10-24).** The brick pieces are laid the way a mason builds:
bottom course first, brick by brick along it, back the other way on the next course, each brick
set down with a small tap (`brick-set`: drops from 70% of its height above, lands 5% low and
squashed, settles).

- Brick-letter titles (`StoneHeading` mosaic, retired 2026-10-24, so nothing on the site uses `lay` today) are flow unit kind `lay`, not `lines`. The
  generator (`scripts/lib/brick-letters.mjs`, `paintCourses`) groups each word's bricks by
  course: `<g class="bl-c">` with `--o` (its turn, bottom course first; courses are numbered
  from the baseline so every word on a line shares them) and `--b` (its brick count); odd
  courses carry `bl-c--r` and run right to left. About 200 bricks a word made one element per
  brick too heavy, so a course is uncovered a brick's length at a time by a stepped clip
  (`steps(var(--b))`). `layPlan()` in `flow.ts` tells each word its line and place on it, and
  the title its time per line (`--tline`, 1.25s shared, at least 0.8s a line). A course takes four
  slots to run the line and the next starts one slot later, so courses rack back like a wall
  going up. A faint copy of the letters (`.bl-ghost`, `opacity="0"` at rest) shows while it is
  laid, like a chalk line. The share card (unit `px`) keeps the flat markup.
- The sill (`Sill.astro`) and the stepped section markers (`SectionLabel`, the only marker since
  2026-10-25: `BoardRule` is whitespace now) have one path per brick, so each brick gets the
  tap in turn; `src/lib/brick-lay.ts` works out the turns from the paths (a face and its rim
  share one).
- The clip on the letters is the one place this layer animates something other than a transform
  or opacity: it steps a handful of times per course and never touches layout.

**Rule change.** The stone path's "one moving moment per page" (below) still holds for the stone
drawings (the mark build, the baptism ring, the walk). The flow layer is the page's general
movement and runs everywhere, at the calm level outside Home and the 404 (above).

**Keyboard focus shows at once (re-audit 2026-10-26).** A link reached by Tab before its unit had
risen sat at opacity 0 ("Back to the home page" on the 404 measured 0.00; Home's "Read more in What
we believe" stayed hidden 2.5s). Now any unit that holds focus drops its starting frame: the end of
`src/styles/flow.css` sets `animation: none` and `opacity: 1` on `:focus-within` for the flow units
and their line, brick and marker pieces, the first screen's hold, the stone `.reveal`s, the older
`[data-reveal]` sections and stagger-grid children, the Home hero's scroll fade and the laid mark.
`flow.ts` also lands the unit on `focusin` (and marks a `.reveal` `.in`, a `[data-reveal]`
`.is-visible`), so it does not replay once focus moves on. A new layer that hides something must
add itself to that rule. `tests/reaudit.spec.ts` tabs through `/404.html` and `/` with motion on and
fails on any focused element whose effective opacity (its own times its ancestors') is under 0.99.

## The stone path (FBC Auburn, 2026-10-17)

Ported from the studio mockups' v3 motion pass (`motion.js`, `walk.js`). Files: `src/styles/motion.css`,
`src/scripts/motion.ts` (imported once by BaseLayout, re-run on `astro:page-load`), `src/components/motion/`
(`MarkBuild`, `BaptismGraphic`, `stones.ts`), `src/components/sections/StepsRail.astro` and
`WalkSection.astro`, `src/lib/walk-stops.ts`.

Nathan's rules, which every piece keeps: motion follows the scroll and never takes it over; transforms and opacity
only; one moving moment per page; the cross never rotates or tilts; reduced motion shows everything at rest.

- **The switch.** An inline script in BaseLayout's `<head>` adds `html.motion` unless the visitor prefers reduced
  motion or the address carries `?still`, and again after each View Transitions swap (the swap resets the class).
  Every hidden starting state is scoped to `html.motion`, so with no JS the page is the finished picture.
- **Reveals** (`class="reveal"`, placed with `--x --y --r --s`, staggered with `--d` and `--k`): pure CSS with
  `animation-timeline: view()` where supported (Chrome, Edge, Safari 26), an IntersectionObserver adding `.in`
  elsewhere. Used by the rail's icons and stones and the stone dividers; the icon cards and page icons can opt in with
  the same class.
- **The rail** (`stepsRailSection`): the site's one step connector, a 2px dashed light-navy line (`--step-dash-y`, auburn.css), runs down the icon column from each icon to the next and fills whatever height the text takes (2026-10-25, audit GD-M4; it was a winding laid-brick path that read as a worm). Step 1 sits on a white card. The path ends at the church mark as its last stop, at the icon column's size (72px, 48px on a phone), which builds itself in story order beside the closing line.
- **The mark build** (`MarkBuild.astro`, 2026-10-24): once 45% of the brick print is on screen the wall is laid
  one brick at a time, bottom course first and back and forth like a mason, each brick dropping with weight and
  settling, about two and a half seconds in all (five until 2026-10-25), until the last course seals the top of the cross; then the mark gives one
  slow swell. Each brick is the raster print clipped to that brick's outline (`mark-bricks.generated.ts`, from
  `npm run gen:mark`, which splits `brand/logo/mark.svg`; re-run only if the mark changes), and the whole print is
  shown underneath once it is laid, so the finished picture is exactly the logo. Timer, not scroll-scrubbed: it plays
  once. Styles in `motion.css` (`.mark-lay`); the old `.mark-build` stone rules there match nothing. In a
  text-and-picture band, pick
  "The church mark" under Picture (`imageTextSection.art = mark`); About uses it for "The story in our mark", where (a calm page) it shows finished; it is laid only on a full-motion page.
- **Baptism** (`BaptismGraphic.astro`, `art = baptism`): the green ring turns about 14 degrees across the scroll
  and the ripples swell; `#cross` is never transformed.
- **Background path**: on a page with a rail or a walk, faint stones on an S-curve behind `<main>`, laid just ahead
  of the reader; it skips the hero and any `[data-no-bgpath]` section. Script only (it needs layout). `layPath()`
  reads every rect first, computes the curve's points in plain arithmetic and adds the stones in one
  write; never append inside the loop or go back to `getPointAtLength` (each call forced a page style
  recalculation: about 940ms per load on a phone, 2026-10-24). Hidden on the
  board E inner pages since 2026-10-17 (`src/styles/board.css`): its stones drifted under body text.
- **Walk in with us** (`walkSection`): since 2026-10-24 a single column of stops down a gold stepping-stone path
  (the timeline's dashes), each stop beside its stone icon, picked in code from the stop's words
  (`src/lib/walk-stops.ts`; the schema has no icon field). No script of its own: the flow layer fades the stops up.
  The drawn stone-mosaic plan of the lot that used to pin beside the stops, and the IntersectionObserver that lit
  its route, were removed on every width (its labels were about 6px on a phone). Desktop caps the column at 46rem;
  below 768px the stone is 52px and 18vh of path runs between one stop's words and the next (phone polish).
- **Nav**: three tiny stones under the current page's link replace the underline.
- **Home's stone path** (board E, 2026-10-17; replaced the full-height ribbon): `src/components/home/StonePath.astro`
  inlines the generated mosaic (`stones.generated.ts`, from `npm run gen:stones`), one `<path class="hb-stone">`
  per stone in path order with `--i`. An inline script in `HomeHero.astro` adds `is-armed` before first paint and
  `is-laid` 350ms later; `home-board.css` then lands each stone 24ms after the last. The hidden state needs
  `html.motion` AND `is-armed`, so no JS, `?still` and reduced motion all show the finished path. Home has no rail
  or walk, so the background path does not run there. Cards that are links lift 4px on hover and focus
  (`.hb-lift`), not under reduced motion; the header's Sunday-note-to-logo swap is a short fade, off under reduced
  motion.

---

Cross-reference: `polish-layer.md` covers the non-animation visual layer (brand stripe, card-lift, surface-warm, reading-progress, sticky-header, paper-grain, print stylesheet).
