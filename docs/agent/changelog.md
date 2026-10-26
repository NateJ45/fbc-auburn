# Change history

_2026-10-26: Millville, and social links Pastor Jacob can add himself._

**Decision.** Pastor Jacob's goal is a "digital front door for Millville, Ross and Hamilton", and
Millville was nowhere on the site; his round 1 reply also listed WhatsApp with Facebook and TikTok.
The phrase now appears in the footer line, the Home and About descriptions and About subhead, Plan
your visit's "Find us" intro (content via `scripts/content/millville-whatsapp.mjs`, dry by
default) and the Church JSON-LD `areaServed` (`site.areaServed`). Nathan asked that the church
can add social accounts without us: Social links now take a pasted link and read the icon and name
from the address (fifteen platforms, a plain link icon otherwise), with https required, gentle
warnings and a cap of ten. WhatsApp shows only for a real invite or number link, and none is set
yet; a For Jacob note on Contact asks for it. Contact gains a "Follow along" row of the same
buttons. Detail: `docs/agent/church-data.md`.

_2026-10-26: the Studio catches up with the re-audit._

**Decision.** Nathan asked whether the re-audit left the Studio behind. It had mostly kept up (the
menus guide, the hero video text and the new fields' help came with it). The Site Guide's "What
each section is for" now mentions Contact details' `Lead with big Call and Text buttons` and the
Notice's `Small label` and tap-to-call numbers. The block picker's Walk and This week pictures are
reshot (`npm run thumbnails`); the other pictures came out the same to the eye and were left as they
were.

_2026-10-26: no crisis band, and two leftovers._

**Decision.** Nathan removed the 988/911 "If it cannot wait" band from the Prayer page and from Need the pastor? (content, `pr-crisis` and `pc-crisis` unset after a backup of each page). The Ministries phone thumbnails still cut the retired stepped corner (`FindYourPlace.astro`); they are now a plain frame with the inner corner like every card picture. Contact's For Jacob note no longer points at care drafts that moved to Need the pastor?. CI snapshot refreshed.

_2026-10-26: the Studio's own newsletter is hidden._

**Decision.** Nathan: hide it. Auburn's email list lives in Church Trac (2026-10-24), so the Studio's
screens for writing and sending the website's own issues (card 127) were for a list that is switched off.
One constant, `OWN_NEWSLETTER = false` in `src/sanity/ownNewsletter.ts`, leaves out Home's Newsletter
card (the kit's new `features.newsletter`, starter card 163; RSVP rows stay), the Quick update job "Start
this week's newsletter" and the "Send the newsletter" tile (`kit.config.ts`), Content > Newsletter
(`structure.ts`), the newsletter entry in the "+" menu (`sanity.config.ts`), the "Send the weekly
newsletter" guide page and its video script, and the newsletter editor tour (`studio-tours.ts`). The
weekly guide now says to send the newsletter from Church Trac. The `newsletter` schema type stays
registered, so nothing is lost; the file says how to bring it back.

_2026-10-26: the re-audit's fixes (six bugs, six of Nathan's changes)._

**Decision.** The five-reviewer re-audit of 2026-10-26 confirmed six bugs on the live site, and Nathan
made six calls. The code is in one PR; the content half is two dry-run scripts the lead applies, and
the code renders right before and after they run.

- **This week's Wednesday line.** Home read "6:00 and 6:00 pm · Bible study and prayer and Youth". Times
  are now grouped by day AND start time (`timeSlots`, `weeklyRhythm` in `src/lib/church-facts.ts`;
  `thisWeek` gives one row per day and time), so it reads "Every Wednesday · 6:00 pm · Bible study and
  prayer, Youth", and `timesPhrase` says a shared time once. Unit-tested.
- **The short times line names each time**: "Sunday School 9:45 · Worship 11:00" (`namedTimes`,
  `shortLabel`), from each service's label in Church facts, in the top strip, the phone menu, Home's
  fact line, the Sunday bar, the times band and the Find your place cards. Falls back to the old
  phrase when a service has no label. Unit-tested.
- **Prayer has one door.** Contact drops its prayer topic (in code and, by script, in the Studio's
  question), `/contact/?topic=prayer` goes to `/prayer/`, and Home's Ask card loses "something we can
  pray about" while a Prayer requests card links to `/prayer/` (content). The prayer form gains a
  "Would you rather talk? Call ... or send a text" line from Church facts.
- **Focus is never invisible.** Any flow, reveal or brick unit holding focus shows at once (end of
  `src/styles/flow.css`) and `flow.ts` lands it on `focusin` (`docs/agent/animation.md`).
- **The phone Menu pill is a real `<button>`** once the script runs, so Space opens it (it scrolled the
  page 710px). The no-JS link to the footer's page list stays.
- **Lining figures**: one `html { font-variant-numeric: lining-nums tabular-nums }` rule, so Young
  Serif's "11:00" no longer reads "II:00".
- **Title layout shift on phones**: metric-matched local fallbacks for Young Serif (Georgia and Times
  with size-adjust and ascent and descent overrides) second in the display stack; the preload stays.
  Load CLS at 375, font held 1.5s, throttled, median of three: Ministries 0.054 to 0.002, Plan your
  visit 0.053 to 0, What we believe 0.050 to 0.001, Need the pastor? 0.081 to 0.019, News and notes
  0.051 to 0.001 (`docs/agent/design-tokens.md`).
- **The header's red is the only red that repeats.** A body button that goes where the header's Plan
  your visit goes draws navy (`src/lib/red-budget.ts`, `SectionRenderer` and `HomeHero.astro`), Home's
  hero included; the red passes to the page's own step or to none.
- **Four menu groups**, Reach us beside the others (Contact, Need the pastor?, Prayer requests), in
  the menu and the footer (`scripts/content/menu-reach-us.mjs`, dry run only). The desktop row fits
  at 1024 and 1280 (64px and 48px between the lockup and New here) and the footer lays them out in a
  2 by 2 grid on a phone and one column each on a wide screen.
- **Plan your visit, shorter** (`scripts/content/reaudit-pages.mjs`): Good to know folds into the walk's
  intro, the sign into Find us, Find us moves up beside the walk, the walk loses its own copy of
  "Tell us you are coming" (the closing band is the invitation; the opener's copy is gone from the
  code), and the access asks become one list ask with every question kept. The times band carries the
  address with Directions and Apple Maps on a phone, the map card is a slim strip there, and the walk
  is tighter. 8,316px to 6,582px at 375 after the content runs (7,950px with the code alone);
  "Tell us you are coming" four times to two (the closing band's button and its line).
- **The phone footer**: groups in a 2 by 2 grid with 36px rows, the name and Give on one row, a
  shorter sill, the Directions link beside the address, no where-next rows on the Bulletin, a sermon
  page or the 404. At 375 with the pre-launch notes: 1,310px to 1,158px on band pages, 1,553px to
  1,401px on where-next pages, the Bulletin and the 404 1,553px to 1,158px. Not yet one screen.
- **Need the pastor? leads with action**: the contact card's new `callButtons` box draws big Call and
  Text buttons (tel: and sms: from the Church facts phone, the To confirm tag while unconfirmed),
  and Call takes the page's red. Notices make 988, 911 and phone numbers tap-to-call, and take an
  optional `label` ("If it cannot wait" on the two crisis lines, by script). The prayer form becomes a
  link card at the end instead of the red closing band (content).
  _2026-10-26: phones get a small copy of the Home hero video._

**Decision.** The re-audit found phones downloading the full 1 MB, 1280px hero clip on 4G, and the
Studio allowed 6 MB. Nathan asked for a phone-sized copy. Sanity serves files as uploaded (no
transcoding), so the Home banner gains an optional **Phone video** upload (`backgroundVideoPhone`):
under 768px the hero's script picks it before building the `<video>`, so only one copy is fetched,
and phones fall back to the main clip when it is empty. The example clip has a 640px copy
(`public/shot-examples/hero-pews-640.mp4`, 267 KB). The clip is also skipped when the browser
measures a downlink under 1 Mbps, on top of 2G/3G, Save-Data, reduced motion and print. The Studio
warns above 3 MB for the main clip (was 6 MB) and above 1 MB for the phone copy.

**Measured** on Home at 375px, throttled 4G (1.6 Mbps, 150 ms, CPU 4x, Playwright, three runs):
video 1,000 KB before, 267 KB after; LCP about 2.55 s both ways and still the poster image. At
1280px the full clip still plays. Lighthouse mobile on a local build scored the same before and
after (80 and 86 over two runs), with page weight down from 1,654 KB to 922 KB.

_2026-10-25: the Studio catches up with the day's site changes._

**Decision.** Nathan asked whether the Studio needed the day's content, page and design changes too.
Its fields, page list and preview links had kept up; three other things had not.

- **The Site Guide** (`src/sanity/guides/`): the menus guide describes the three groups (New here,
  Get involved, Stay connected) and the Give button; the live stream link shows at the top of Sermons,
  not on Watch; the newsletter guide says the list is kept in Church Trac (the website's own list is
  off here); and new lines cover the Home banner's background video, the This week block's `Show`
  choice and a sermon's length in minutes.
- **The block picker's pictures** (`public/section-thumbnails/`, `npm run thumbnails`): reshot, so
  they show the restraint pass, the quieter page heads, the gable photo shape and the Walk block's
  sketch. The calendar block draws nothing without a feed, so it keeps its earlier picture.
- **The loading splash** (`/studio`): it laid five pebbles joined by dashes after the site had moved
  to brick. `brand.config.json` sets `studio.look.splash: "motif"` (starter card 162), so the splash
  draws no stone path and `src/sanity/StudioSplashMotif.astro` sits in its place: the brick strip of
  the Studio Home banner, laid brick by brick in the sill's order (`src/lib/brick-lay.ts`), held,
  lifted and laid again while the editor loads. Reduced motion shows it laid. The offline page shows
  the strip without the path.

_2026-10-25: a stock clip plays in the Home hero before launch._

**Decision.** Nathan asked for a placeholder church video until Jacob's clips are cut. The hero's
shot request (`'/|hero'` in `src/data/shot-list.ts`) gains `video: hero-pews`, a 19 second Pexels
clip of a congregation reading in pews under stained glass (RDNE Stock project, 5875502, re-encoded
silent at 720p with fast start, 1 MB, credited in `public/shot-examples/CREDITS.md`). The first pick
(8675023) was swapped out the same day because a woman in a clerical robe walks through it, which
would not suit a Southern Baptist church; the new clip has no clergy in any frame. It has a new file
name because `/shot-examples/*` is cached for a year. `HomeHero.astro` plays it exactly
like an uploaded Background video (after load, over the example photo as poster, never with reduced
motion, Save-Data, slow connections or print, with the Pause button). It goes with the shot request
at launch (`PRE_LAUNCH_NOTES`), and an uploaded video replaces it straight away.

_2026-10-25: the hero video field checks for fast start._

**Decision.** Nathan asked whether the hero video streams like hppres.org's. It does: Sanity's CDN
answers range requests, so the browser plays an .mp4 as it arrives (hppres is a plain fast-start
mp4 on S3 too, not HLS). The catch is the file's layout, so the Background video field now reads the
first 64 KB of an .mp4 upload and warns when it is not saved for fast start
(`mp4FastStart()`, `checkFastStart()` in `src/lib/hero-video.ts`, unit tested), and its
description asks for "Fast start" or "Web optimized". Export settings and the ffmpeg commands:
`docs/agent/animation.md`, "Streaming and fast start".

_2026-10-25: the Home hero can play a video._

**Decision.** The audit asked for a video in the Home hero, and the shot request asks Pastor Jacob for
clips of church life that Nathan cuts into one silent video. The hero block gains **Background video
(Home only, optional)** (`heroSection.backgroundVideo`, a Sanity file limited to .mp4 and .webm; the
Studio errors on another type and warns over 6 MB). `HomeHero.astro` keeps the background photo as
the first paint and the LCP, then after the load event adds a muted, looping, inline `<video>` with
that photo as its poster, under the same shade; it fades in once it plays. Never with reduced motion,
Save-Data, a 2G or 3G connection, or in print (`src/lib/hero-video.ts`, unit tested); those
visitors get the still and download nothing. A Pause / Play button at the top right (WCAG 2.2.2)
remembers the choice on the device, and the clip pauses while the hero is off screen. A video fills
the hero's shot request, so its "Photo needed" note goes. Checked on
`/styleguide/home-hero/` (fixed data, the stock `sermon.mp4`) by `tests/hero-video.spec.ts`. No
CSP change: no `default-src` is set, so `media-src` is open to cdn.sanity.io.

_2026-10-25: CI builds the same site from the snapshot as a local build._

**Decision.** CI's `site` job built 19 pages where a local build of the same snapshot built 28, and
Plan your visit lost its Church and FAQPage JSON-LD. The cause: `ci.yml` and `lighthouse.yml` set no
`PUBLIC_SANITY_PROJECT_ID`, and `sanityFetch` treats a missing id as "no Sanity" and returns its
fallbacks without a request, so the snapshot server was never asked anything (the build log said
`[sanity] PUBLIC_SANITY_PROJECT_ID is not set`). The nine missing pages were events, leadership,
ministries, next-steps, pastoral-care, prayer, what-we-believe, the pastor's journal note and the
placeholder sermon. Both workflows now set the ids at the workflow level (as fbcm and stonesteps-50k do),
and `tests/page-weight.spec.ts` checks FAQPage, Church and the eager Ministries photo strictly again.
The guard that stops this happening silently (`snapshot.mjs run` reads the id from the snapshot, or
fails) is starter card 161, now copied here too.

_2026-10-25: a Give button, a red visit button, and a wider footer._

**Decision.** Nathan asked for a more obvious Give button in the header and footer, a red Plan your visit in the header, better use of the footer's width now the This Sunday card is often gone, and less padding at its bottom. The header shows Give (solid navy, hand-heart icon, the Give page or the online giving link through `giveHref`) beside a red Plan your visit; each turns to the outline on its own page, because the muted current-page fill hid white text. The phone menu puts the two side by side under This Sunday. The footer's name row ends with a light-outline Give. With no This Sunday panel the footer's links run as four even columns (New here, Get involved, This week, Contact) instead of the left half with Contact below. The pre-launch pill's 64px under the bottom bar became room at the bar's right end from 768px (`ForJacob.astro`).

_2026-10-25: the five-reviewer site audit, fixed in seven PRs._

**Decision.** Nathan had the pre-launch site audited by five reviewers (UX, graphic design, web
development, a pastor and a first-time visitor) and asked for every finding to be fixed and put live.
Six agents worked in parallel areas; the lead merged one at a time and applied the content.

- **Core (#170):** the flow layer's word splitter had lost its backslashes (`split(/(s+)/)`, so
  headings were cut on the letter "s"); it moved to `src/lib/flow-split.ts` with a test, and
  `scripts/lib/regex-backslash.test.mjs` now guards every script against stripped regexes. A print
  stylesheet (`src/styles/print.css`, `tests/print.spec.ts`): printed pages had been blank below the
  first screen. The contact form posts without JS, shows every error in one pass, keeps its draft in
  sessionStorage, and reads `?topic=` and `&about=`. White focus rings on dark surfaces
  (`data-dark-surface`). Motion: the full flow layer only on Home and the 404 (`data-flow-full`), a
  200ms fade elsewhere, quicker page transitions.
- **Pages (#171, `scripts/content/audit-pages.mjs`):** American spelling everywhere; a new
  "Need the pastor?" page (`/pastoral-care/`); Plan your visit restructured (times band at the top,
  Good to know, one Your kids block, What worship is like, Getting in and getting around); one prayer
  path with one privacy promise; named section anchors (`src/lib/section-anchors.ts`, e.g.
  `/what-we-believe/#the-gospel`). Every fact or doctrine only the church can give is a
  `[Jacob: ...]` placeholder; none was drafted.
- **Collections (#172, `scripts/content/audit-collections.mjs`):** the sermon list, the live button
  by state, the podcast link and the no-picture art; Events' "Every week" mode with card links and a
  build-time `.ics` per gathering (`/calendar/<key>.ics`); the bulletin falls back to last week's; a
  plain 404 with search; Ministries as compact rows on phones (14,168px to about 7,150px at 375) with
  one action per card.
- **Chrome (#174, `scripts/content/audit-chrome.mjs`):** the phone menu on a native `<dialog>`
  (`MobileNav.astro`, no React island); one dropdown model; the Menu pill hidden from 1024px; one
  closing device per page; a slimmer footer; the Sunday bar on Plan your visit too
  (`church/SundayBar.astro`); the menu's "This week" group (Sermons, Events, Bulletin, Prayer
  requests, Need the pastor?, Give); "Pastor Jacob on TikTok".
- **Visual (#173, `scripts/content/audit-visual.mjs`):** one red button per page (`SectionRenderer`
  assigns it; the rest use `variant="navy"`); less brick; markers only beside a worded eyebrow;
  shorter page heads; one H2 colour; the gable as the one photo shape (stepped corner retired); H1 at
  most 88px; Young Serif from 24px up; ImageText's "No picture" option.
- **CSP (#176):** the deploy of #172 failed because the one CSP line in `_headers` passed
  Cloudflare's 2,000-character limit; `vite.build.assetsInlineLimit: 0` now ships processed scripts
  as files (`docs/agent/deployment.md`).
- **Performance (#177):** per-page CSS purge (`scripts/purge-page-css.mjs`, 56% of the inline CSS);
  the Toaster removed; fonts and textures hashed under `src/assets/`; the first photo eager; FAQPage,
  Event and PodcastEpisode JSON-LD; `form-action` and `Permissions-Policy`; HSTS without
  `includeSubDomains` until cutover.

Content was written by the four scripts in the order collections, pages, visual, chrome (each backed
up first, dry run read, applied, verified live). CI snapshot refreshed in #177. The Home hero shot request now asks for clips of church life that Nathan cuts into one video (the hero cannot play a video yet: PENDING 1zt).

_2026-10-25: the header no longer shakes near the top._

**Decision.** On desktop, scrolling back up to within a few pixels of the top made the sticky header
flip between its compact and full sizes every few frames, and the page jumped with it (Nathan). From
`lg` up the bar is up to 36px taller when open, it sits in the flow, and the browser's scroll anchoring
moves the scroll position by that much to keep the content still, which crossed the single 8px line
again. The bar now compacts past 64px and opens again only at 8px or less (`Header.astro`,
`updateHeaderState`), a gap wider than the change in height. Phones never had it: the bar keeps its
height there.

_2026-10-24: the menu in three groups, and two pages folded into others._

**Decision.** The menu had grown to thirteen links of equal weight, so a visitor on a phone read the
whole list to find one thing (Nathan, from a screenshot). It is now three labelled groups: New here
(About, What we believe, Leadership), Get involved (Ministries, Next steps, Events) and Stay
connected (Sermons, News and notes, Give, Contact). On a phone each group's name is a small red label
with its pages as rows beneath, always open (`MobileNav.tsx`, `auburn.css`); the tap-to-open group
row is gone. On a wide screen the header's first items are now the three groups as dropdowns. Watch
folded into Sermons: `/sermons/` opens with the Watch band (live stream, Facebook, the latest
message) in place of the Latest sermon block, the Watch page is archived, and `/watch/` forwards
to `/sermons/`. Questions folded into Plan your visit: two Questions sections above its closing
band, the first one `id="questions"`, `src/pages/faq.astro` deleted and `/faq/` forwarding to
`/plan-your-visit/#questions`; the Questions singleton left the Studio's Pages list. The Questions
block now sits on the page's left edge (rule 17; it was centred). Prayer requests left the menu (it
stays in the footer) and Contact's "When life happens" gained a card linking to it. Content moved by
`scripts/content/menu-groups.mjs` (backup, dry run, write, verified); CI snapshot refreshed.

_2026-10-24: three phone decisions (the Sunday strip, the menu order, no walk plan)._

**Decision.** Three calls from Nathan after the phone polish pass. (1) Home's This Sunday card is a
compact strip on phones and tablets (961px down): the label and "To confirm" tag, the date with one
44px Directions button beside it, then the two times, 162px tall at 320, 375 and 414 (it was 395 to
423px). The forecast, the calendar link, the watch line and the full address are hidden there (the
address is a span of its own in `SundayCard.astro`, so Directions stays); the footer card still
carries the address. The phone Sunday bar still docks once the strip has scrolled away. Desktop is
untouched. (2) The phone menu (below 64rem) opens on the search field, then a compact This Sunday card
(date, times, Directions; a "Live now" row only while worship streams) and a full-width Plan your
visit button, then the 64px rows; the full card stays in the right column from 64rem, and each card
is `display: none` at the other width so only one is ever focusable. A menu row pointing where the
visit button does is dropped. (3) The Walk in with us plan (the stone-mosaic map of the lot, labels
about 6px on a phone) is gone on every width: the stops are one column down a gold stepping-stone
path, each with a stone icon picked in code from its words (`src/lib/walk-stops.ts` and its test),
46rem wide on desktop, the 18vh phone spacing kept. Removed with it: `src/lib/walk-plan.ts` and its
test, the plan lighting in `motion.ts`, the plan CSS in `motion.css`. No schema fields changed (the
plan had none); the walkSection title and descriptions no longer mention a drawing, and typegen gave
no diff. The section went from 4188px to 2176px tall at 1280. Files: `SundayCard.astro`,
`home-board.css`, `MobileNav.tsx`, `auburn.css`, `WalkSection.astro`, `motion.css`, `motion.ts`,
`board.css`, `auburnMotionSections.ts`.

_2026-10-24: the phone polish pass._

**Decision.** A section-by-section audit of every page at 320, 375 and 414 turned up 21 phone fixes;
all are phone only (below 768px, or below 961px in the board and Home files) and desktop is unchanged
(every element's box identical at 1280 on eight pages). Page head titles break a word longer than the
column instead of scrolling the page (the placeholder sermon title pushed it to 385px), and a title
still holding a yellow placeholder opens its lines so the next line's highlight no longer cuts the
descenders. Section headings, walk steps and card titles balance their lines, so none ends on one
word. An inner page's section ends about 40px above the next rule (it was 112px), Home drops the bare
rule before an editor's section, and that band ends on Home's 48px rhythm. Plan your visit's walk
steps are their words plus an 18vh gap (they were 422px boxes) and the caption sits left; the Next
steps rail uses a 48px stone in a 56px column with one pebble between steps (117px to 28px); What we
believe's icon cards put a 48px icon beside the title, a heading every 189px (it was 254px). The
closing invitation, the 404 and a text-and-picture band's one button go left and full width; the
footer's two buttons stack, its page links are a two-column list in 18px type, Get in touch is one
44px row per line with Text and the "To confirm" tag kept together, the Where next rows sit on the
20px gutter, and the 140px of navy under the bottom bar is gone (the Sunday bar hides while the footer
shows, so nothing is reserved for it; the For Jacob pill lifts above the bar only while it shows).
Under 360px the Sunday bar reads "Sundays / 9:45 & 11:00" with a map pin for Directions, so it stays
67px (it was 98px). The phone menu rows are 64px (88px) on the 20px gutter. Also: the Watch ghost
word is hidden below 640px, the Ministries chip row fades at its right edge, empty picture slots are
a 160px strip with the mark on the left, About's mark is 160px on the left, journal cards pad 20px,
a sermon's facts stack label over value, the Contact phone links are 44px tall, the Ways cards share
one height, FAQ groups are 48px apart, and search excerpts stop at three lines (in auburn.css, since
SearchPanel is PORTABLE). Files: `board.css`, `auburn.css`, `motion.css`, `home-board.css`,
`collections.css`, and the components named above.

_2026-10-24: a tighter page head on phones._

**Decision.** Below 961px the inner page head carried 66px above the eyebrow and, on nine pages, its
stone icon as a 112px picture on a row of its own under the title, so it took 144px of the first
screen for a decoration and pushed What we believe's first words below the fold (Nathan, from a
screenshot of Plan your visit). The icon is now a 48px mark at the top right, level with the eyebrow,
whose line stops short of it; the head pads 44px above and 36px below. Heads with an icon are about
175px shorter at 375px, the rest about 34px (`src/styles/board.css`). A head photo still follows the
words at full width; desktop is unchanged.

_2026-10-24: Watch gets a livestream icon._

**Decision.** The Watch page head wore the music note, which reads as worship music, not "watch
live" (Nathan). Round 26 drew a screen with a red play button in the same brick style (Gemini,
traced as drawn; master `brand/icons/stone-icon-play-screen.svg`, printed by
`node scripts/print-icons.mjs`) and added it to `STONE_ICONS` as `play-screen`. The data change is
`scripts/content/watch-icon.mjs`, which moves the Watch hero (`w-hero`) from music to the new icon
and leaves it alone if someone has already picked something else. It runs after the code deploys,
so the live page never asks for an icon the build does not have. Music stays in the picker for
worship and choir cards.

_2026-10-24: the phone Home hero is a photo band._

**Decision.** Below 961px the hero was a block 78% of the screen tall with the welcome at its foot,
so most of a phone's first screen was empty photo (Nathan, from a screenshot). The photo is now a
band (`--hb-band`, 44svh between 220 and 380px) whose foot fades into the tiled ground, and the
welcome starts on its last 160px, then carries on over the navy ground. Before launch the "Photo needed" note fills
the band and the words follow it directly. Desktop is unchanged (`src/styles/home-board.css`).

_2026-10-24: the background stone path no longer stalls phones._

**Decision.** The 362ms long task Lighthouse blamed on the Cloudflare beacon on Plan your visit was
not the beacon: with the beacon blocked the same task stayed (359 and 361ms), booked to the site's
own scripts instead. A CPU profile at 4x throttle put about 940ms of main thread per load in
`layPath()` (`src/scripts/motion.ts`), the faint background stones on pages with a rail or a walk.
It appended a stone and then asked an SVG path for the next point, and `getPointAtLength` needs fresh
styles, so every stone forced a style recalculation of the page, twice per load (first lay and
`fonts.ready`). It now reads the page once, works out the curve's points in plain arithmetic, and
swaps all the stones in at once: about 45ms for both lays, the same stones within a fifth of a pixel
(375 and 1280). Local Lighthouse mobile on Plan your visit: 99 and 99, TBT 0 and 6ms (live before:
89 and 89, TBT 387 and 291ms). The beacon itself costs about 100ms of script and stays as it is.

_2026-10-24: the mark lays itself, brick by brick._

**Decision.** Nathan asked for the mark to build up slowly into the cross, one brick at a time. `MarkBuild.astro` now
draws the print as 32 clipped bricks (`npm run gen:mark` splits them out of `brand/logo/mark.svg`) and lays them
bottom course first when the mark scrolls into view, about five seconds, ending in one slow swell. About's "The story
in our mark" and the Steps rail both use it; no JS, `?still` and reduced motion show the finished mark.

_2026-10-24: mobile audit._

**Decision.** A full phone audit (Lighthouse mobile on six pages; a sweep of 20 routes at 320, 360,
375 and 414 for overflow, tap targets, text size, alignment, fixed bars, images and the menu). No
overflow, no input under 16px, no fixed bar covering the footer, and the phone menu traps focus,
closes on Escape and locks the page. Fixed: (1) the flow layer held each page's first screen until
the fonts were in and the stagger reached it, so the main words showed 2.7 to 3.1s after they had
loaded; phones now show the first screen as it is (`flow.ts`, `flow.css`; animation.md). Local
Lighthouse mobile: Plan your visit 83 to 97, About 89 to 96, Sermons 91 to 99 (the local build has
no analytics beacon, so part of Plan your visit's gain is that). (2) The Home hero's photo and words
size to `svh`, the screen with the browser's bars showing, with a smaller top space on short phones,
so the welcome and Plan your first visit sit in the first screen once the pre-launch photo note is
gone. (3) The footer's Text link is 44px wide, the Next steps rail links 44px tall, and the Plan your
visit button runs the full column on phones like the Home hero's. Left as they are: the Cloudflare
beacon (a 362ms task on one page; a PORTABLE file, and it measures Web Vitals so it must load early),
13px uppercase labels (eyebrows and tags, by design), the 20px side gutter, and links inside sentences
(WCAG 2.5.8 exempts them). The small standalone links the sweep flagged already carry an invisible
44px hit area (`auburn.css`, `.hit-44`).

_2026-10-24: smoother phone scrolling; the footer verse reads on phones._

**Decision.** Phones felt laggy as a scroll started: the sticky header compacted (8px less padding over
300ms) the moment the page moved, and because it sits in the flow, every frame of that transition
re-laid the whole page and nudged the content up under the thumb. The bar now compacts from `lg` up
only; below that it keeps its height and just gains the white ground and shadow (`src/styles/auburn.css`).
The footer verse slid as one line about four screens wide on a 375px phone, through about 630px of
scroll, so only four or five words were ever visible. Under 768px it is now hidden, as on the
reference site (Nathan's pick over a wrapped sentence); `scrubVerse()` in `flow.ts` does nothing
there, and picks the slide up if a phone turns to landscape past 768px.

_2026-10-24: Dependabot sweep, wrangler to 4.151.3._

**Decision.** Ten Dependabot PRs merged: eight single-package bumps (#104, #103, #99, #11, #10, #9, #8, #2), the
17-package minor-and-patch group (#56, red only because its CI ran while `docs/agent/studio-kit.md` had drifted from the
starter; green once updated from main), and #16, which moved `wrangler` off the `~4.129.0` pin to `~4.151.3` to take the
undici 7.30.1 security fix. The group raises the Astro integrations' minimum Node to 22.22; CI and deploy use the latest
22.x, so nothing changed there. The first production deploy on wrangler 4.151.3 succeeded with no config warnings and the
static pages, `/preview/`, `/private/<slug>/` and `/studio` all answered. Rule 8's pin text in
`.claude/rules/dependencies.md` is updated; the starter and the sibling sites stay on 4.129 until moved on purpose.

_2026-10-24: the "night" share card._

**Decision.** With the brick letters gone the share cards were plain, so five directions were drawn
(`docs/design-directions/2026-10-24-og-cards/`) and Nathan picked "night": the navy stone-tile ground of the site's
dark bands, the white mark and name, the page head's eyebrow as an auburn kicker, a cream title, the building sketch
faint on the right and a two-course brick sill. `scripts/lib/og-card.mjs` draws it; `scripts/generate-og-pages.mjs`
now reads each page's eyebrow for the kicker. Cards grew from about 90 KB to about 240 KB with the texture.

_2026-10-24: page headings are plain type, not brick._

**Decision.** Nathan found the brick-letter H1s too busy. `StoneHeading.astro` (every inner page head through
`BoardPageHead`, and `ArchHero`) now renders plain Young Serif in deep navy, and the 404's brick-wall headline went the
same way. Then the rest: the share cards (`scripts/lib/og-card.mjs`, all 19 regenerated, plus first cards for events, next steps and prayer) set the title and the Home "Auburn" in plain navy, and the sermon and series art with no picture sets its word in plain cream type (`SermonArt.astro`, `.c-art__word`). The generator (`scripts/lib/brick-letters.mjs`), its tests and the flow layer's `lay` kind stay, unused.

_2026-10-24: the rest of the hppres.org audit._

**Decision.** Everything else worth taking from hppres.org, in Auburn's own shapes: "where next" rows at the top of the
footer on every page; two-tone page titles (headingAccent on the page head, set in auburn); a Sunday times
band under inner page heads (from Church facts, one bar on a phone); fold-out questions restyled as hairline rows; a
letter block for the pastor; an outlined ghost word and the stepped corner on the Watch band; a full-screen phone menu
of big serif rows; a new News and notes article layout (sticky rail, stepped cover); and stepped people portraits with a
brick stand-in. Plan your visit is headed with the visitor's own questions. Ministries moved onto the Find your place
hub in the live dataset the same day. Detail: `docs/agent/shapes.md`.

_2026-10-24: the shape system and Find your place._

**Decision.** From an audit of hppres.org: pictures take two Auburn shapes instead of rounded rectangles (a stepped brick
corner on cards; the building's gable over a navy brick slab on every ImageText photo), and Ministries becomes a "Find
your place" hub: a new `findYourPlaceSection` block with groups (New here, Kids and youth, Adults, Serve, Care) stacked
beside a sticky index that follows the scroll and the header, chips on a phone. Card times come from Church facts through
the new `dayWithTimes` (Home's bands use it too). All groups show at once rather than as tabs, because a small church's
groups would hold one card each. The CI snapshot pins the new Ministries page. Detail: `docs/agent/shapes.md`.

_2026-10-24: every Studio icon is brick._

**Decision.** The Studio's icons (desk lists, tabs, tools, templates, the Site Guide) mixed two styles: the newer
brick-course icons (Ministries, most beliefs) and the older pebble mosaic. Round 25 redrew the 24 pebble icons in brick in
Gemini (home, page, guide, search, camera, eye, link, envelope, gear, bin, undo arrow, lightning, help, health check,
calendar, palette, clock, map pin, music, open Bible, praying hands, giving hand, dove, broken chain), traced as drawn into
`brand/icons/` under the same names, so the site's pictures and the icon pickers update too. Seven meanings that still
fell back to `@sanity/icons` got their own: padlock (password pages), signpost (redirects), compass (the not-found page),
telephone (Contact), stack of pages (the Content tool), code brackets (custom code) and a label tag (categories), wired in
`src/sanity/brandIconArt.tsx`. The undo arrow was mirrored so it turns back. The trace now gives each brick its majority
colour, which removed Gemini's navy speckle. The toy blocks and the clouds stay as they were. The Home tile "Add a page" opens a pane, which has no document type to take art from, so `kit.config.ts` names its icon outright (`brandIcon('pages')`).

_2026-10-24: Lighthouse green again on Home. The "Photo needed" examples (#130) put a 2000px, 166 KB stock photo in the Home hero, which became the page's LCP element and took the mobile LCP past the 4.5 s gate (CI median 4656 ms; 5483 ms locally). The hero now has `srcset` with 800 and 1280 copies (16 and 29 KB, `heroSrcset` in `src/data/shot-list.ts`) and `sizes="(max-width: 767px) 150vw, 100vw"`, because on a phone the landscape photo is cropped to cover a taller box and is drawn about 1.5 times the screen width. Home's local median fell to 4001 ms (perf 0.78 to 0.87). The rest of the gap is the shared render-blocking CSS, unchanged._

_2026-10-24: a Church Trac tab in Site settings._

**Decision.** The seven Church Trac addresses (Church Trac address, connection card, contact form, prayer form, online
giving, calendar feed, member sign-in) sat among the church's facts. They now have their own tab, in the order the church
would set them up, under a short intro that says what each does and names Church Trac's Embed Domain setting. Display only:
the field names and data are unchanged, so no migration and nothing for "Remove field" to touch. The live stream link and
YouTube channel stay in Church facts (they are not Church Trac). The tab wears the link icon (`brand/brand.config.json`, the Studio icon groups).

_2026-10-24: Church Trac on the site, from fbcm (PORTS.md card 152)._

**Decision.** The church will run on Church Trac, and the site's own forms could not deliver. fbcm's three Church Trac pieces
came over, adapted to Auburn: Church facts boxes for the Church Trac address, connection card, contact form and prayer form;
`{token}` links filled in `queries.ts` (not `sanity.ts`, which is PORTABLE); a shared frame that replaces the Contact and
Prayer forms once a box is set (and sends the visit buttons to the connection card); a "Church Trac form" band; and a "Church
Trac page" band that reads a named Church Trac page at build time. Code stays in the church sites by decision (no starter
code); the card maps it. `docs/agent/church-trac.md`.

_2026-10-24: Ministries gets its own icons. Youth, Fellowship and Greeters all wore the coffee cup, Sunday School the clock and Workdays and grounds the map pin; round 24 drew seven new stone icons in the same style and five colours (backpack, chalkboard, plate and cutlery, handshake, open door, toolbox, grocery bag; masters in `brand/icons/`, printed by `node scripts/print-icons.mjs`, added to `STONE_ICONS`), and redrew the toy blocks with A, B, C under the same `blocks` name, so Kids, The children's room, the Ministries page head and the Studio's children icon all pick it up. `scripts/content/ministry-icons.mjs` set six cards: Youth (backpack), Sunday School (chalkboard), Fellowship (plate), Greeters (handshake), Food pantry and outreach (grocery bag), Workdays and grounds (toolbox). The open door is in the picker only._

_2026-10-24: the livestream features from First Baptist Muncie._

**Decision.** Auburn streams on Facebook and plans YouTube, so the live pieces work on Facebook now and
improve by themselves when a channel id is set. A Live now banner above the header on every page,
Home's watch card tag and the phone menu row share one clock (`src/lib/live-service.ts`, worship from
5 minutes before to 80 after, church time). The This Sunday card says where to watch, and names the
coming Sunday's scheduled YouTube stream once there is one. `/api/live-status/` (YouTube Data API,
needs `YOUTUBE_API_KEY`) is ported but dormant. The live link now prefers the YouTube channel's live
page over Facebook when both exist. Detail: `docs/agent/church-data.md`.

_2026-10-24: what visitors and members need, after an audit against two other church sites._

**Decision.** Auburn's newcomer pages already answered more than either reference (a FAQ, service
length, dress, the first-Sunday walk), but the member side was thin. Added as placeholders with For
Jacob notes (`scripts/content/next-steps-members.mjs`): a Next steps page, Youth and Ways to serve on
Ministries with a leader and place ask on each card, When life happens on Contact, Events and
Sermons in reach (the header shows five links: About, Ministries, Events, Watch, Give), and two
Church facts: `phoneTakesTexts` for "Call or text" and `memberLoginUrl` for a footer member
sign-in. Open items in PENDING.md 1x.

_2026-10-24: examples in the shot list. Each "Photo needed" slot now shows a stock example of the shot it asks for (12 Unsplash photos, one Pexels clip for the Last Sunday card, all in `public/shot-examples/`, about 2 MB, credits in its CREDITS.md) under a pinned yellow note with a "How to take yours" toggle, so Jacob sees a finished-looking site and exactly which pictures are his to take. `Shot.example` / `Shot.video` in `src/data/shot-list.ts`; the hero and the watch card draw theirs behind the tag note. The clip respects reduced motion. Removed at launch with `PRE_LAUNCH_NOTES`.

_2026-10-24: the shot list. Every photo slot that held a stand-in (the Facebook pantry, gift-table, building, sign and sanctuary photos; the Unsplash hero and Last Sunday poster) or sat empty now shows a yellow "Photo needed" box naming the photo we want, so the preview doubles as Pastor Jacob's shot list. Code-side only, no data written: `src/data/shot-list.ts` holds the shots (keyed by page and block heading) and decides when a slot shows one (before launch, while empty or a stand-in: an `fbca-fb-*` or `stand-in-*` upload or an Unsplash asset); `ShotRequest.astro` draws it (a frame in a picture slot, a pinned note over the hero and the Last Sunday card); the For Jacob pill lists the same shots. Open loop: PENDING 1x, the shot list._

_2026-10-24: eight belief icons for What we believe. Drawn in Gemini in the stone-icon style and the site's five icon colours (navy, navy mid, navy pale, auburn, auburn dark), traced as drawn into masters in `brand/icons/` (crown, cross, dove, cracked heart, broken chain, cup and loaf over waves, church, clouds with light), printed by `node scripts/print-icons.mjs`, and added to `STONE_ICONS` in `src/lib/stone-icons.ts`, so every stone-icon picker offers them. `scripts/content/belief-icons.mjs` set the icon on each of the page's nine cards (The Bible keeps the open Bible). The page's For Jacob note asks him to flag any picture that says the wrong thing._

_2026-10-24: the building sketch redrawn from the real site. The first sketch put the road sign and cross on the wrong side and gave the long wall five narrow windows; the redraw (Gemini, from street and aerial photos, the first sketch as the style reference) has the four tall windows, the white base, the portico with steps and the ramp to the right, and the steeple on the front gable. Nathan chose the building only, no road or sign, since Gemini kept misplacing the sign. `node scripts/brand-sketch.mjs` regenerated the webp (43 KB); the walk opener's door pin moved to the new doorway._

_2026-10-24: the pre-review pass (from a portfolio critique, 6.5/10 before it), and two of Jacob's named pages._

**Decision.** Before Jacob reviews the preview: Home's hero shows the church's own sanctuary photo (its Facebook page; hotspot on the "Jesus > Everything" banner) in place of a stock stand-in, with a two-line placeholder welcome and a dot in the kicker; an empty picture slot shows the brick-cross print on the Stone tint, shorter than a photo slot; the For Jacob pill moved bottom right and smaller (it covered left-edge text), with room under the footer bar so it never covers Privacy policy or Back to top; icon cards share one icon height (the Ministries titles drifted 12px) and What we believe's one stray icon is gone; Plan your visit's head has the map-pin and one intro; empty states are quiet cards; Journal's category row needs two categories; FAQ opens with the section marker; ten shadow recipes became three tokens; the Other ways in icons grow a little on hover. The walk map's outside follows the aerial and street photos (lot across the front and down the west side, the drive on the east, the sign at the east corner by the road, doors facing the road, annex at the back); its rooms are still a guess. New Studio pages `/prayer/` (a prayer-mode form: never stored, name optional, opt-in sharing) and `/events/` (the weekly rhythm and the Church Trac events), in the menu and the footer's Belong column (`scripts/content/prayer-events.mjs`, `scripts/content/pre-review.mjs`).

_2026-10-24: the building sketch back in the footer, faint (16%, 12% on one column) behind the top area at the bottom right, so the compact footer keeps its height; and the phone, now set but unconfirmed, shows only where it can carry the "To confirm" tag (the footer and Contact), not in the menu or Home's header line until `phoneConfirmed` is ticked._

_2026-10-24: the church phone, (513) 863-3500 (the church line on its earlier website and local listings), set in Site settings with `phoneConfirmed` false by `scripts/content/church-phone.mjs` under the write protocol; it shows with the "To confirm" tag and stays out of the JSON-LD until the church ticks the box. An earlier run the same day set a personal number by mistake; this replaced it._

_2026-10-24: the church's TikTok (@auburn.pastor, its bio names the church and address) added to Site settings > Social links after Facebook, by `scripts/content/social-tiktok.mjs` under the write protocol (document and dataset backups outside the repo, dry run, apply, `audit:data` clean). The footer draws it as an icon button beside Facebook._

_2026-10-24: a compact footer._

**Decision.** The footer was 1,523px on desktop and 1,646px on a phone, a third of a page. Nathan picked the compact option from three mock-ups: the display-size tagline and its line, the building sketch and the full-width brick "Auburn" signature are gone; the mark, the two buttons and the link rows share the left column beside the This Sunday panel (726px desktop, 1,224px phone; on one column the panel follows the buttons). The buttons stay as the closing invite on the pages that have no band of their own. The Studio's "Footer: the line under the big heading" field (`footerInvite`) is hidden, not removed, so its stored value is never offered for "Remove field"; the `tagline` field's help now says it shows in the menu. The repeated church name under Get in touch is gone (the bottom bar carries it).

_2026-10-24: checked live after the standardising pass merged._

**Decision.** Live builds from the church's real content, which the CI snapshot does not carry, and it showed two misses. A section an editor adds to Home below the board (the live "Meet Pastor Jacob" text-and-picture band) got none of the board grammar, which was scoped to `main:has(.board-head)`: a 24px gutter, a cream ground on white, 140px under its rule, and the arch the inner pages drop. The scope is now `main:is(:has(.board-head), :has(> .hb))`, and such a section paints no ground of its own on Home. And the brand's `cards: soft` layout gave every `.card-lift` card a 14px corner (globals.css), with the standalone sermon art on the inner 14px too; both are the 20px card corner now.

_2026-10-24: one scale for type, corners, buttons and spacing._

**Decision.** A computed-style audit of every route at 375 and 1280 px found about a hundred distinct font sizes, card corners of 12 to 22 px, section H2s at four sizes and three line heights, form fields at 8 px beside 10 px buttons, a 52 px hero button pair, three hand-rolled buttons (Contact's scheduling link, the email page's Unsubscribe, the newsletter's Subscribe), and FAQ questions rendering at 16 px because tailwind-merge dropped `text-h3` as a colour. All of it now reads from tokens at the top of `auburn.css` (`docs/agent/design-tokens.md`); Tailwind's xs/sm/base point at 13/15/18 px. Display type (the masthead, brick H1s, 404, countdown) was left as designed. Home's sections padded only their foot, so a heading under the hero's brick sill or the navy belong band sat on its edge; every Home section now pads its top with `--hb-rhythm` (`--spacing-section-md`), and pads its foot too before a tinted band. On the inner pages a section now ends on its padding, not its last paragraph's margin (gaps between sections were 163 to 189px, now 163 to 165), and the Watch band lost its own edge lines, which doubled the board rule. A further sweep the same day covered every block on `/styleguide/sections/`, pages that only exist with content (built from a throwaway local snapshot with a sermon, a series, a post and an issue), keyboard focus, hover and press, the open menu and search, 768 and 1024, and tap targets. It fixed stats labels at 9.9px, `rounded-md` on content cards and photos, a logo strip hiding its first logo, a lone board rule under an empty block, the sermon facts list flush under its summary (`.c-facts { margin: 0 }` beat `mt-l`), journal body headings at full section size, the starter's 4% paper grain showing as a darker band down a post, three looks for the "To confirm" tag, focus rings at 2, 3 and 4px offsets (now one: 3px, offset 3px, white on the hero photo, outside the FAQ question), presses that only some buttons had, three-across grids at 768 (now from 64rem), and 138 links under 44px on a phone (0 now, with the card 82 hit area).

_2026-10-21: the letterforms went brick (docs/design-directions/2026-10-21-brick-path/, sheet 13)._

**Decision.** The Auburn Stone letterforms (Young Serif split into pebbles, a webfont) are replaced by build-time SVG. `scripts/lib/brick-letters.mjs` draws a word as treatment A (each Young Serif glyph clips a running-bond field, every fourth letter in auburn) or treatment B (the word cut out of a stepped wall). The glyph outlines and kerning are baked into `scripts/lib/brick-font.generated.mjs` (`npm run gen:letters`), so the generator reads no files and runs in the Worker too. `StoneHeading` draws one SVG per word so a title still wraps, keeps the clean text in an aria-label plus a hidden copy, and puts the preview's stega run back after. The masthead, footer signature and share cards use A; the 404 headline and the sermon art with no picture use B. The Auburn Stone preload and `@font-face` are gone; the font file stays for the Studio banner lettering.

_2026-10-19: CI builds from a pinned content snapshot (starter card 138): `ci/sanity-snapshot.ndjson.gz`, `scripts/snapshot.mjs`, a daily non-blocking `live-watch.yml`._

_2026-10-19: Auburn's own tours and Quick update jobs on card 137._

**Decision.** The Phase A tour data became `src/sanity/studio-tours.ts` (pastor and staff first-run tours, Home and Quick update screen tours, three editor walk-throughs, a What's new entry), using the kit's anchors in place of the `needsHook` stops. Quick update gained a bulletin job (a `create` job with a PDF box, since the bulletin is a new download each week), Messages and RSVPs link tiles and a Send the newsletter tile that opens the Newsletter list, so the test-first send is unchanged. `guides/tours.ts` keeps only the video scripts. No new pictures or videos: Auburn is not launched.

_2026-10-19: the Studio teaches itself: tours, clips, Quick update jobs as data (PORTS card 137)._

**Decision.** The card 106 tour becomes a spotlight engine whose steps are plain data in each site's `src/sanity/studio-tours.ts`, anchored to the kit's own `data-tour` hooks and to a short, documented list of Sanity selectors; a missing anchor centres the popover rather than failing, so a Sanity rename degrades a tour instead of breaking it. A welcome and a dated What's new open once per person from localStorage and open nothing when storage is blocked. Quick update gains six job kinds declared as data, so a site covers its weekly jobs without writing save code; edits write the published copy and any open draft together so they never drift. Guides play the site's own clips from a registry by key, poster first. The recorder and the screenshot script drive the local kit harness with writes refused and the avatar and names covered. Background music is optional, mixed at a quiet bed, and never committed: the repos are public and the track's licence is not theirs.

_2026-10-19: Home's Visitors card reads Google Analytics 4, and a Search Console card (PORTS card 136)._

**Decision.** No Google key in any site Worker: the studio's own Worker, studio-status, already holds the read-only
service account, so it gains a `SiteData` RPC entrypoint and each site binds to it (`SITE_DATA`, `SITE_DATA_KEY`). The
site builds the report bodies and maps the answers onto the same shape the Cloudflare source makes, so the card draws
either. `ANALYTICS_PROVIDER` picks the source; unset, Cloudflare wins when it is set up, so no existing site moves.
GA4's own AI Assistant channel feeds the AI assistants group, with the source names as a fallback. Search Console is
its own card under Visitors, hidden until set up, reading 28 days that end three days ago because Google's search
figures lag. A refused key says "finish connecting Google" and nothing more. The in-Worker JWT sign-in, built first,
stays as a tested optional fallback for a site outside the studio's account. Fixtures, a mock binding and a throwaway
key in the tests; nothing calls Google.

_2026-10-19: the Studio covers the pastor's whole week (studio-plan.md)._

**Decision.** `docs/agent/studio-plan.md` maps each weekly, monthly and seasonal job to the Studio surface that serves it. Quick update gained three phone jobs (an event notice, a short news post, starting the week's newsletter, which is saved and never sent from there); the bulletin, which needs a file box Quick update does not have, replaced "Edit the menus" on Home's big buttons. The Site Guide opens on a new "Every week" category with four new guides and six more "How to" field chips. New screenshots and videos wait for launch, when the content is real; tours and video scripts are written as data in `src/sanity/guides/tours.ts` for the shared tour pieces (starter card 137). Sermon, post and newsletter web addresses now always keep their date (`datedSlug`), so a long title can no longer make two the same.

_2026-10-19: Home's banner look is a style slot, not site CSS (PORTS card 135)._

**Decision.** Five sites restyled Home's banner with CSS files that selected the kit's class names and Sanity's `data-ui` markup, so a kit rename would have switched their looks off without a failing test. The look is now data in `kitConfig.homeBanner.style` (eyebrow, greeting, title, the button's shape and colours, the background, the motif's place, a stamp), checked for contrast and for anything that could break a stylesheet, and the only markup a site may select is a short documented set (`data-hb-part` names, `data-hb-*` attributes, `--hb-*` variables) that a unit test holds. It lives in `kit.config.ts` beside the banner's other fields, not in `brand.config.json`, because a banner's fonts and button are not devices the whole Studio shares and a TypeScript type catches a wrong key. With no style set the banner is unchanged. The five sites' rules are written as migration recipes in studio-kit.md.

_2026-10-19: a "How to" beside fields, and icons on every field group (PORTS card 134)._

**Decision.** A field the guides config names (by field name, or by schema type) gets a quiet "How to" chip after its
description that opens that Site Guide section in a dialog; every other field is left exactly as Sanity draws it, and
the lookup is cached so the form does not slow. Field-group tabs take their icons from `brand.config.json` alone. The
branded heading inside the sign-in card stays undone: sanity 6.19 offers it only through a custom auth store, which
loses Sanity's own expired-session and CORS screens.

_2026-10-19: Studio polish, Home's ways-in tiles (PORTS card 133)._

**Decision.** Home's job tiles use a 260px minimum so the dashboard column holds three across at most, and a tile's art sits top left beside its title instead of floating at the middle. A title wraps to two lines, not three.

_2026-10-19: real Studio screenshots in the Site Guide (PORTS card 130)._

**Decision.** The guides that most need a picture now show the church's own Studio, captured signed in on the live site,
with numbered stones, rings and arrows on the real controls. A guide asks for a picture by key and
`src/sanity/guides/shots.ts` holds the eight captures (`studio-tabs`, `home-tiles`, `home-live`, `edit-page`,
`publish-button`, `quick-update`, `live-preview`, `checkup`) as WebP files in `public/guide-shots/`, each cropped, with
the account avatar and the greeting name covered. They sit in "Start here: how this all works", "Change the words on a
page", "What Home in the Studio shows you", "Quick update from your phone" and "Before you publish". Those last three also
gained a few lines of text so the words match what the pictures show (the tiles, the Sunday checklist and "Is it live?",
the fourth Quick update job, the Checkup). The unit test `guide-shots.test.ts` checks the files, the alt text and the marks.

_2026-10-19: the Studio design pass, part two: Home, Post a photo, the tour, the splash and offline page (PORTS card 132)._

**Decision.** A finished step is laid only in the calm mark colours (`look.calm`), so "On the website" is never the
warning colour, and a step not yet done is the same hand-laid stone outlined in its colour rather than a circle. Home's
ways in are tiles with the colour edge and the site's art; Coming up rows carry a date on a stone; Recent edits and
Pick up rows carry the type's art; Visitors is a display-font figure over bars in the calm colours; the newsletter and
RSVP cards match. Post a photo is a three-stone path, the tour has a stone trail and a lettered banner, the splash lays
the path while the Studio loads and the offline page shares it (with the last stone not yet laid). `restore` is a
meaning of its own. The Section Look radio draws each look as a small section in the site's devices. The last kit spinners are the
laid-stones loader.

_2026-10-19: eight more stone icons for the Studio (help, restore, quick, mail, settings, trash, calendar, palette)._

**Decision.** Six more meanings now draw stone art in `src/sanity/brandIconArt.tsx`: help, quickUpdate (the quick-update tool), message (messages and the newsletter), settings (Site settings and the settings and meta groups), trash (the Trash) and publishing (the scheduling group, drawn as the calendar), plus brandKit as the palette. They were generated in Gemini and vectorised faithfully. The restore (undo arrow) stone is in `src/assets/brand/` but not mapped: no meaning key stands for it yet, because the guides' `restore` and `bolt` are glyph names, not meanings.

_2026-10-19: every Studio surface in the design language, first pass (PORTS card 131)._

**Decision.** The Studio's middle now draws in card 128's language instead of plain @sanity/ui. Tool headings carry the
site's rule, art and display type; Home's cards are white cards with a marker and a display-font title; findings are
white cards with their severity along the left edge, grouped "Needs doing / Worth a look / Good to know", with an
all-clear that lays three stones over the motif; the weekly checklist is a path whose stones are the checkboxes; "Is
it live?" and the navbar line are three stones (Saved, Building, On the website); Quick update has art tiles and a
done screen that shows the path laid so far; a prayer request in Messages is a gentle sky callout. The pieces are
presentational (`kit/ui/surfaces.tsx`) so a dev-only bench can draw them with made-up data. The kit stylesheet now
goes into the page once instead of once per card. Severity is always words as well as colour; every new colour pair
is in the contrast gate.

_2026-10-19: eight stone icons for the Studio (guide, page, camera, home, eye, search, link, checkup)._

**Decision.** Eight more meanings now draw the brand's stone art in the Studio: guide, page, image, home, preview, search, link and checkup, in `src/sanity/brandIconArt.tsx` and `src/assets/brand/stone-icon-*.svg`. They were generated in Gemini and vectorised faithfully, with no redrawing. `page` replaces the building-blocks stone it used before; `pages` and the section meanings keep theirs.

_2026-10-18: the Studio's design language and a redesigned Site Guide (PORTS card 128)._

**Decision.** The Studio now has a small design language the site's brand drives: a marker, a stone shape, a connector,
three callout hues, a motif and optional lettering, set in `brand.config.json` `studio.look` and resolved to light and
dark tokens that hold AA text and 3:1 marks. The shared pieces live in `src/sanity/kit/ui/` for later surfaces. The Site
Guide is redrawn in it: a banner and a featured "Start here" on the index, a rule and marker per section, stones for
steps, and note, tip and careful callouts, with annotated screenshots available. Callout markers keep the brand's true
hue and take a darker outline for contrast (a first pass darkened the fill and the gold went brown). Guide icons are
meanings now, not emoji.

**Why.** The guide is what editors read most, and it read as documentation pasted into a form. A vocabulary also stops
each new surface rebuilding its own look.

**Left open.** Real screenshots for GuideShot, art for guide meanings with none, a signed-in look at the navbar status
line, and the next card's roughly twenty surfaces (`docs/PENDING.md`).

_2026-10-18: the email backbone: one sender, a newsletter with double opt-in, RSVPs (PORTS card 127)._

**Decision.** Everything the site emails now goes through one module (`src/lib/mail-send.ts`) with two providers
behind it, Cloudflare Email Sending and Resend, picked by a Worker setting; with neither, every piece says "not set up
yet". The contact form sends the same message through it. One D1 database (`CONTACT_DB`) now also holds newsletter
subscribers (address, status, timestamps only), the send log with a per-person claim that makes a second send to anyone
impossible, and RSVPs. A Newsletter document is sent from the Studio ("Send a test to me", "Send to everyone", in
batches); an RSVP section on any page takes replies with capacity and a waiting list decided in one SQL statement, and
the Studio's RSVPs tool lists them with a CSV download. A provider-hosted list was weighed and left out: one more
account and a second home for people's addresses.

_2026-10-18: section looks and a photo viewer (PORTS card 124)._

**Decision.** Editors can pick a section's look instead of a colour. The five content blocks (text, image + text,
gallery, quote, video) carry a `look` radio: Standard (the white board), Feature (the church blue with white text) and
Stone (the pale stepping-stone tiles with dark text). There is no Quiet look here: the board is already white.
SectionRenderer's cadence resolves the look with the neighbours in view, so two of the same look never touch and a
Feature never touches a dark band; every surface is a measured AA pair (Stone measured on the darkest gap in the tile). Rule 9 now allows that
one enum and still forbids free colour fields, and the gate test says so. Unset means Standard, so no page moved
(parity). Gallery photos, the photo section and journal post photos now open a full-screen viewer (native `<dialog>`, no dependency):
caption and position, arrows and swipe, Escape, a focus trap and focus return, reduced motion respected, and with
JavaScript off each photo is a link to the full-size picture. A Squarespace-style free background picker was weighed
and left out: it is how a site drifts.

_2026-10-18: the Studio on a phone, "Post a photo", and earlier versions from the nightly backups (PORTS card 125)._

**Decision.** `/studio` installs to a phone's home screen: its own manifest (`/studio/manifest.webmanifest`, scope
`/studio/`, standalone, the site's name and icons plus a padded maskable one, the Studio's navy and paper) and a small
service worker scoped to `/studio/` that keeps only the hashed code files, icons and an offline page ("You're
offline"). It never stores a Sanity answer, a login or anything from `/api/`, and fetches the boot page fresh every
time. Quick update gains "Post a photo": camera or gallery, a required description, into a gallery on any page or a new
post, saved as a DRAFT only (the editor presses Publish), with the photo redrawn smaller and without its EXIF location.
Every document gains an "Earlier versions" panel that reaches the last 14 nightly backups: the Worker
(`/api/studio/earlier-versions/`, same origin, a signed-in editor, rate limited) starts `restore-doc.yml` with the
existing deploy token, CI decrypts and either lists which fields differ (names and list lengths only, because public
run logs are public) or writes ONE draft after a dry run, with `NCS_PRODUCTION_WRITE` on that one step. Weighed and
left out: decrypting in the Worker (it would need the passphrase and a backup can exceed a Worker's memory), and a
network-first-with-timeout shell (a stale boot page can point at code a later deploy removed).

_2026-10-18: visitor site search and share buttons (PORTS card 126)._

**Decision.** Visitor search is on for this site (`site.search.enabled`). Pagefind 1.5.2, pinned as a
devDependency, indexes the built HTML straight after `astro build`, main content only, skipping noindex pages; the
index ships as static files under `/pagefind/`. A round search button beside the Menu pill and a row at the top of
the night menu open a native dialog styled from the theme tokens, with type filters, dates and sermon passages,
keyboard movement, a live result count and friendly suggestions when nothing matches. Nothing loads until search is
opened. Share buttons (Facebook, X, email, copy link, and the phone's share sheet) sit under every sermon, sermon
series and news post in the outline button style, as plain links with no third-party code. Pagefind's own UI was
left out: heavier, its own look.

_2026-10-18: writing help, "Before you publish" and AI visitors in the Studio (PORTS card 123)._

**Decision.** Three editor features that hosted site builders now ship. "Suggest" buttons under the Google
description, photo description and summary fields, and "Improve this paragraph" in rich text, ask a new Worker route
(`/api/studio/ai/`, guarded like deploy-status, an hourly limit per person) that calls the Claude API with a plain fetch
in the site's own voice; the editor accepts, edits or ignores every suggestion, and nothing is written or published by
it. Without the `ANTHROPIC_API_KEY` secret the buttons do not appear. A "Before you publish" document panel shows the
Checkup's findings for the open document as it will be once published, by running the Checkup's own rules with the
draft swapped in, with a "Show me" per field; it blocks nothing. Two new Checkup rules: example text left from a page
template, and stale or template `llms.txt` files. The Visitors card gives AI assistants (ChatGPT, Perplexity, Copilot,
Gemini, Claude and others) their own source group with a week-on-week count. No new dependency.

_2026-10-18: custom code, safe by default (PORTS card 121)._

**Decision.** Editors can paste a widget (a countdown, a sign-up gadget, a map, something an AI wrote) into the block
now called "Custom code or embed". Pasted code runs in its own box by default: an `srcdoc` iframe sandboxed without
`allow-same-origin`, so it gets an opaque origin and cannot read the site's cookies or localStorage, where the
embedded Studio keeps a signed-in editor's session, or touch the page. The box sizes itself (a height message the
parent checks by source, origin and shape, then clamps), and a base stylesheet gives it the site's fonts and light
colours. Before this, embed code was `set:html` straight into the page. Two deliberate opt-outs keep that power for
trusted providers: a "Runs directly on the page" switch on the block, and "Code on every page" in Site settings (head
and end of body, never on /studio or /preview). The Checkup lists both while they are in use. Field names are
unchanged (rule 1); `runsOnPage`, `headCode` and `bodyEndCode` are new. The "not both URL and code" check now reads
the block (`context.parent`) instead of the document, so it finally fires. A full CSP was weighed and left for later:
it would not stop same-origin script reading localStorage, which is the actual risk here.

_2026-10-18: hidden pages, password pages, and link and heading checks in the Checkup (PORTS card 122)._

**Decision.** "Hide this page from Google and the menus" now also keeps a page out of the menus, the menu picker and
site search. Password pages are a separate type, `privatePage` (Pages, Private pages), stored under a private id path
because the dataset is public (a password on an ordinary page would leave its words readable over the API), served
at `/private/<slug>/` by a server-rendered route with a hashed password, a signed cookie and a rate limit, and never
built. The Checkup gained dead external links (from the weekly link check), internal links to missing pages, skipped
headings, vague link words, long Google text, pages nobody can reach, and private-page guards. Detail and the
security note: `docs/agent/private-pages.md`.

_2026-10-18: custom code, safe by default (PORTS card 121)._

**Decision.** The pastor and editors can paste a widget (a VBS countdown, a sign-up gadget, a map, something an AI wrote) into the block
now called "Custom code or embed". Pasted code runs in its own box by default: an `srcdoc` iframe sandboxed without
`allow-same-origin`, so it gets an opaque origin and cannot read the site's cookies or localStorage, where the
embedded Studio keeps a signed-in editor's session, or touch the page. The box sizes itself (a height message the
parent checks by source, origin and shape, then clamps), and a base stylesheet gives it the site's fonts and light
colours. Before this, embed code was `set:html` straight into the page. Two deliberate opt-outs keep that power for
trusted providers: a "Runs directly on the page" switch on the block, and "Code on every page" in Site settings (head
and end of body, never on /studio or /preview). The Checkup lists both while they are in use. Field names are
unchanged (rule 1); `runsOnPage`, `headCode` and `bodyEndCode` are new. The "not both URL and code" check now reads
the block (`context.parent`) instead of the document, so it finally fires. A full CSP was weighed and left for later:
it would not stop same-origin script reading localStorage, which is the actual risk here.

_2026-10-18: Studio brand polish._

**What changed.** The stone icons fill their list tiles (inset 0 in brandIconArt.tsx; each file is already cropped to its art). The About page shows the church mark (aboutPage maps to the overview meaning, drawn with the full-colour mark). The Home banner strips draw the mark green run in a lighter #5E9B6B so it reads on navy; every other stone path keeps the mark six colours.

_2026-10-18: the Studio's edges: its own /studio page, the church's words, a wordmark (PORTS card 120)._

**What changed.** `/studio` is now the site's own page (`src/pages/studio/index.astro`) instead of @sanity/astro's:
the tab says "First Baptist Church of Auburn" with the church's icon from the first byte (no "Sanity Studio", no red
S), and while the editor loads the page shows the church's mark, its name in Young Serif and the stone path on the
Studio's own paper or dark ground, so there is no white flash. The sign-in card says "Sign in to update the church
website"; the signed-out notice and the user menu use plain church words ("Invite someone from church to edit"). The
navy top bar shows the white "First Baptist / Church of Auburn" wordmark beside the square icon on wider screens.
Settings: `src/sanity/studioEdges.config.ts` and `src/sanity/StudioSplashMotif.astro`. astro.config no longer sets
`studioBasePath`; `applySiteFavicon` is no longer called.

_2026-10-18: the stone icons across the Studio, and a picture on every list row (PORTS card 119)._

**What changed.** The eight stone icons from the brand kit now stand for what they mean all through the Studio: the
Bible for sermons, series and downloads, the clock for service times and the church facts, the coffee cup for notices
and news, the giving hand for giving and the people who serve, the map pin for the address and the newcomers'
questions, music for the podcast, praying hands for prayer and the forms, and the blocks for pages and sections. They
show on the desk, on the document types (lists, search, the create menu), on field-group tabs, on page templates and
on the tools in the phone sidebar, drawn exactly as in the kit. Every list row has a picture: its own photo when it
has one, else its stone icon on a small tile (a stone-coloured tile in dark mode, where the navy and green stones
would sink into a navy one). Subtitles say the date and status plainly: "Sun, Nov 8, 2026 · John 10:1-18" for a
sermon, "Mon, Nov 9, 2026 · Bulletin" for a download, "Shows until ..." for a notice. Art: `src/sanity/brandIconArt.tsx`;
which type means what: `brand/brand.config.json` `studio.icons`.

_2026-10-18: Home opens on a branded welcome banner (PORTS card 118)._

**What changed.** The plain text at the top of the Studio's Home is now a navy banner, the same colour as the top
bar: the date, "Good afternoon" with the editor's name in gold, "First Baptist Church of Auburn" with "Auburn" in
Auburn Stone (white, water and gold letters, as in the footer signature), the reassurance line and a View the website
button. The church's full-colour mark sits on a cream disc, and the stone path runs along the foot from the water to
the red cross, every stone rounded (the share card's filters). Settings: `homeBanner` in `src/sanity/kit.config.ts`;
the stone strips are `public/studio-banner/stone-path{,-phone}.svg`, written by `npm run gen:stones`.

_2026-10-18: the Studio's safety net (PORTS card 117)._

**What changed.** Four tools modelled on the Theology Matters WordPress admin. A **morning change note**: every day at
about 6 AM Eastern, `change-note.yml` lists what changed in the Studio in the last 24 hours (who, what, which page,
Studio and live links) as a GitHub issue "What changed on <date>", which GitHub emails to whoever watches the repo;
quiet days post nothing. **Share a preview**: a private link to one page's draft that works for 1, 3, 7 or 14 days
with no login, can be stopped, is noindex, and is signed on the Worker (`SHARE_PREVIEW_SECRET`), never a Sanity
token. **Messages**: the forms' submissions from D1 with New / Needs a person / Replied / Spam, prayer requests shown
only as "one arrived", nothing personal in Sanity; it says "Forms are not set up yet" until the forms are on.
**Table views** of sermons, downloads and people beside the normal lists.

_2026-10-18: the Studio reads as the church's own admin (starter PORTS card 116)._

**What changed.** The Studio now opens light for a new editor (the Appearance menu still switches and remembers), on a
warm paper, with the top bar in the church's deep sky navy (#1B4A75) in light and dark, and it really loads Young Serif
and Familjen Grotesk (`src/sanity/studioFonts.css`) instead of falling back to system fonts. Headings stay at Young
Serif's one weight. Body text, H2, H3 and quotes in rich text fields are edited in the site's fonts at a reading size.
Publish and the other solid status buttons are one step deeper in light mode, so their labels read at AA. The colour
gate checks every tone in both appearances, on the Studio and the top bar. No new packages. The paper is derived from
the site's white; `studio.paper` in brand.config.json can set it (for example the cool `#F3F6F9` ground-soft) if the
cream reads too far from the site.

_2026-10-18: the Studio Home dashboard (PORTS card 115)._

**What changed.** Home now reads like the WordPress dashboard on the studio's other sites: today's date above the
greeting; "Coming up" for pages set to publish by themselves; a Fix-it list naming each page that needs a picture
description, a Google description or a fact confirmed, each with an Edit button (the Checkup's own rules); a Visitors
card with the week's visits, a four-week chart, the most-read pages and how people found the site (Cloudflare Web
Analytics through `/api/studio/visitors/`, signed-in members only; it says "not set up yet" until Nathan adds the
token, PENDING 1l); a "Your pages" card with every page in the menu's own words; and a "Watch how it is done" row that
appears once a guide has a video. A new guide, "What Home in the Studio shows you", explains each card.

_2026-10-18: links in text accept addresses on this site._

**What changed.** The link in the privacy policy, question answers and News posts used Sanity's default URL check, which only accepts full https addresses, so the privacy policy's own link to /contact/ (written by visitor-audit.mjs) blocked Publish with "Not a valid URL". Those four link fields now accept a page on this site (/contact/), https, http, mailto: and tel:, and say so in the field help. Found by Nathan in the Studio.

_2026-10-18: fixes from the first signed-in Studio walkthrough._

**What changed.** Releases and Scheduled Drafts are switched off in `sanity.config.ts` (paid features that only showed an "Upgrade to unlock" screen; scheduling is the site's own "Publish automatically at"). The Content panel's inner "Content" list is now "Questions, notices and forms". "Privacy Policy Page" reads "Privacy page". "SEO title" and "SEO description" read "Google title" and "Google description" on every page type except the PORTABLE `_seoFields.ts` (starter first). The Home "Add a page" card no longer lists four templates. The "After Sunday: name the message" guide is retired: "Add Sunday's sermon" replaced it, and Home's help panel points there. Checked signed in: Home, the checklist, the template picker, the section picker, saved sections, Sermons, People and Downloads start panes, Quick update and Checkup.

_2026-10-18: the Studio remembers (PORTS card 111)._

**What changed.** For the pastor editing alone on Sanity's free plan. **Scheduled publishing** is ready:
`publish-due.yml` runs every half hour, reads `SANITY_API_WRITE_TOKEN`, skips cleanly without it, and starts a deploy
after it publishes; "Publish automatically at" is now on notices, posts, sermons and downloads as well as pages. **A
failed deploy says so**: `/api/studio/deploy-status/` reads `deploy.yml`'s newest run from GitHub (Worker secret
`GITHUB_DEPLOY_TOKEN`, var `GITHUB_REPO`), the status line and Home say "The last update didn't go through. Nathan has
been told." with Try again, and `deploy.yml` opens a `deploy-failed` issue so he is. **Undo from earlier in the week**:
`npm run restore:doc -- <id>` puts one document back from a nightly backup as a draft (dry by default, rule 16's
gate), plus a Site Guide entry telling the pastor to ask. **Sunday checklist** on Home: sermon, bulletin, news and
notices tick themselves, "Checkup is clear" too, and "Check this week's events in Church Trac" is ticked by hand on a
`studioWeek` document per week. **Quick update**, a phone tool with three forms (a notice with a last day, Sunday's
sermon link, a change or cancellation this week); builders in `src/lib/quick-updates.ts`, tested. **Alt text
everywhere**: every image field goes through `imageWithAlt()` (`schemaTypes/_imageWithAlt.ts`), still `type: 'image'`,
hotspot on, a required "Description of the photo" on content photos and a warning on logos, share images and hidden
legacy fields; no field removed or renamed. **Empty lists** the pastor uses explain themselves with "Create the first
one". New guides: "Undo a change from earlier in the week", "Publish something later, by itself", "Quick update from
your phone", "The Sunday checklist"; the guides now name Nathan.

**Not done here.** The two secrets (PENDING 1k) and every signed-in check. The starter carries the PORTABLE half
(draft PR first, per the marked-file order).

_2026-10-18: the section library brought up to Home's standard (block polish)._

**What changed.** The 21 church sections and the four collection blocks now use Home's own objects,
so a page built from blocks reads as the same hand-made site. No schema or field changed. Shared:
section H2s in the everyday deep sky (as the sermon archive's); `ChurchBand` gained `beside`
(heading in the split's text track, the object in the narrow track) for the countdown, newsletter,
calendar and form blocks; hand-laid stones in the walk's four shapes (`.cb-stone--0..3`, soft on
every side). Per block: **service times** on the This Sunday card's deep stone ground, a column per
day; **timeline** a gold stepping-stone rail with round pebble stones, the year in its own column
and a photo beside the words at 1024+; **countdown** the number on the deep stone card beside the
words; **giving** and **contact details** on Home's "Through the week" board with stone icons
(praying hands, map pin, giving hand); **Bible verse** on a green stone panel with a gold quote, as
the pastor's welcome on Home; **events** in the sermon rows' grammar; **progress** a path of twenty
gold brick stones; **accordion** a stone toggle that turns gold when open; **beliefs**, **columns**
and **link cards** led by one gold step, link cards with Home's lift; **affiliations** an initial on
a deep stone until a logo is uploaded; **live stream** the play card on the navy stone ground;
**newsletter** and **calendar** on a pale sky stone panel. Collections: **SermonArt** with no
picture is now series art (one of three stone grounds picked from the series title, the book in
Auburn Stone with white, sky and gold letters like the footer's Auburn, sized to its length); series
cards lift on hover; a person with no photo gets their initials in Auburn Stone on the pale sky
stones; the bulletin box is led by the gold steps; a series page with no picture shows its stone art
beside the sermon count. New generated tiles `tile-green.svg`, `tile-navy.svg`, `tile-sky.svg`
(`npm run gen:stones`, the same Voronoi stones as `tile-deep.svg`). Parity: every built page's HTML
is unchanged except the shared inline CSS, which lost the 357 bytes of `ServiceTimes.astro`'s
scoped style now that only `/styleguide/church-data/` uses it. Insert-menu thumbnails re-shot.

_2026-10-18: church page templates and seasonal saved sections._

**What changed.** The "new page" menu grew from five starting points to 39, in seven groups
(Visitors, About us, Ministries, Life events, Seasonal, Sermons and news, Blank). Sanity's menu has
no headings, so `sanity.config.ts` shows each as "Group: Title" (`templateMenuTitle`) and the list
is kept in group order. Every template is a sequence of existing blocks with warm, plain copy: lines
only the church can supply (names, dates, rooms, claims about how something is run) start
"Example:", generic true sentences are left plain, and service times, address, phone, giving and the
live stream come from the Church facts blocks, never typed. Verses are typed in the King James
Version. The builders moved to `src/sanity/templateBlocks.ts`. Twelve seasonal and one-off
**patterns** (Easter, Christmas, Homecoming, Revival week, Trunk-or-treat, Thanksgiving meal,
Building fund, Anniversary year, Snow Sunday notice, Lottie Moon, Annie Armstrong, Memorial for a
member) live in `src/sanity/sectionPatterns.ts`; the Seasonal templates reuse them, and
`scripts/content/seed-section-patterns.mjs` (dry by default, create-only, drafts) puts them in
the dataset where "Insert a saved section" reads them. The Site Guide gained a "Page templates"
category: the refreshed "Start a page from a template" guide, one guide per group and one for the
saved sections. The template tests now also check copy (no em-dashes, AI-tell words, UK spellings
or prices), schema limits, stone icon names, group order, and that a fresh page trips no warning
but "example text". The "Phone, email, giving" guide's emoji icon became `info`.

**Not done here.** Sermons landing: `/sermons/` already is one, so there is no template for it.
No new blocks were needed. The dataset write is queued in PENDING 1j.

_2026-10-18: sermons, people and downloads._

**What changed.** Three collections the pastor keeps himself. **Sermons**: `sermon` (title, date,
service, passage, preacher from the people list or a guest name, series, summary, video link,
audio file, notes file, picture), `sermonSeries` and the `sermonsPage` singleton (page head,
passage translation, podcast name, description, category, picture, Apple and Spotify links). Routes
`/sermons/` (latest, every sermon with series, preacher and book filters and "Show more", series,
podcast), `/sermons/<slug>/` (YouTube lite embed, Facebook link-out, audio player, BibleGateway
link, notes, more in the series; VideoObject or CreativeWork JSON-LD), `/sermons/series/<slug>/`
and `/sermons/podcast.xml` (RSS 2.0 + iTunes, only sermons with audio). The book, the passage
link, a series' order, dates and count, and the podcast are derived at build time (rule 15,
`src/lib/sermons.ts`, unit-tested including Apple's required tags). **People**: `person` and
editable `personGroup` documents; the People block replaces "Staff and leaders" (`teamSection`,
unused in the dataset, kept registered, offered nowhere). Email shows only when ticked, a
missionary's place only when unticked; the GROQ leaves both out otherwise. **Downloads**:
`download` (bulletin, newsletter, form, policy, other; expiry date) and `/bulletin/`, always the
newest current bulletin. Four page-builder blocks (`collectionSections.ts`): Latest sermon,
Sermon series grid, People, Downloads list, with thumbnails, in the Media and About the church
groups. The home "Last Sunday" card and the Watch band now name a sermon preached in the last eight
days first, then the YouTube replay, then the hand-typed message, then the newest sermon of any age,
then their own words; with no sermons both render exactly as before (parity 17/18, the 18th being
the sections wall). Studio: Sermons, People and Downloads headings, each opening on a "Start here"
pane (`CollectionIntro.tsx`; People offers to add the usual five groups), a Home quick action
"Add Sunday's sermon" (date = the Sunday just gone, preacher = the person whose role says Pastor),
two This week tasks, two Checkup rules, five Site Guide entries. Local example data:
`COLLECTIONS_FIXTURE=1` builds from `tests/fixtures/collections.json`; nothing was written to the
dataset. The collection styles ride in the site stylesheet (`collections.css`, imported by
`auburn.css`), so no page gains a stylesheet request.

_2026-10-18: the section library and the form builder._

**What changed.** Twenty-one page-builder sections so the church can build any page without a
developer (`src/sanity/schemaTypes/churchSections.ts`, components in `src/components/church-blocks/`
behind one `ChurchBlock` branch in SectionRenderer, styles in `src/styles/church-blocks.css`):
service times, map and directions (reuses `ChurchMap`), contact details, what we believe (Bible
references link to BibleGateway, optional Baptist Faith and Message 2000 link), history timeline,
fold-out questions (inline, apart from the FAQ collection), tabs, Bible verse, a notice with
start and end dates, a countdown, ways to give, progress toward a goal, live stream (Live now from
Service times, click-to-load player), upcoming events from the Church Trac feed with keyword filter,
calendar subscribe buttons (Google, Apple, Outlook, derived from the feed), newsletter sign-up
(reuses `NewsletterSignup`, which gained `hideHeading` and `idPrefix`), our wider Baptist family,
a row of buttons or link cards, text in columns, one wide photo, and a Form section. The photo pair
was not built: the photo gallery set to two across already is one. Derived values (date windows,
days left, dollars, Bible and calendar links, the live window) live in `src/lib/church-blocks.ts`
with tests. Church facts gained `officeHours`.

The form builder: a `form` document (Content > Forms: questions using `formQuestion`, a recipient
key from the new Site settings > Forms list, a prayer mode that warns in the Studio, an anonymous
option, a thank-you line), and `/api/form/` (`src/pages/api/form.ts`), Auburn's own endpoint so the
PORTABLE `/api/contact/` is untouched. It checks answers against the form's questions
(`src/lib/church-form.ts`, tested), stores them in D1 (`migrations/0002_form_submissions.sql`),
emails the recipient whose address comes from the `FORM_RECIPIENTS` secret, and clears a prayer
request's words once its email is accepted. Not switched on yet: see PENDING 1h.

Site Guide: "Sections you can add to a page", "Make a new form", "Prayer requests: what happens to
them", "Put up a notice for a snow Sunday" and "Count down to VBS". Rendered markup of every
existing page is unchanged (parity: only the shared CSS bundle grew, by the library's styles).

_2026-10-18: share images in the church's brand._

**What changed.** The share (Open Graph) cards were navy text in a thin frame on white, the
starter's generic card. They are now drawn by `scripts/lib/og-card.mjs`, site-specific: the
church lockup top left, the page title in Auburn Stone with the mosaic letter colours (deep sky
alone when it needs three lines), and the stone path rising across the foot from the water to the
red cross (a new `og` preset in `stone-mosaic.mjs`, seed 4, with stricter shape limits so no stone is pointy). Home and `og-default.png` carry the
masthead and the Site settings tagline. Picked from three directions (stone path; deep sky with the
This Sunday card ground; an arched mosaic window): the path won on brand (it is the site's own H1
and path) and on long titles, which the arch squeezed to five lines. Titles fit from 120px down to
64px in three lines; the cards are deterministic and rewritten only when their bytes change.
`renderCard({ title, kicker, outPath })` is the reusable call for new collections; journal posts
get their date as the kicker. Seventeen leftover cards from the starter's source site (portfolio,
shop, quiz and the rest) were deleted. `render-og.mjs` (PORTABLE) and `og-theme.mjs` are
untouched and no longer called by the generators.

_2026-10-18: the visitor audit fixes._

**What changed.** From a live audit of the pre-launch site. Church facts gained `emailConfirmed`,
`givingUrl`, `liveStreamUrl` and an optional map pin (`churchAddress.lat`/`lng`), and the resolver
(`src/lib/church-facts.ts`) now hands out the phone, email, Facebook page, live link and giving link,
so the header, menu, footer, Contact and Watch read one source; all hide when empty and carry the
"To confirm" tag until confirmed. The JSON-LD adds the logo, the map pin and the email, confirmed
only. A new `/give/` page (in person, by mail, online) takes the menu's Give link, and every menu
link to it swaps to `givingUrl` once set (`src/lib/give.ts`). Plan your visit names Sunday School
before worship (derived, `earlierSundayLine`) and shows a drawn map card with Google and Apple Maps
links under "Getting here" (`ChurchMap.astro`, no embed, nothing loads until clicked). Every title
uses "|"; `npm run og:pages` now draws a card for every Studio page plus /give/ and 404 (the four
`/[slug]` pages had 404ing OG images) and imports `closeRenderer`, which it called but never
imported. Focus rings are solid `--ring` everywhere (light `#96c3ea` in the footer and the night
menu), the desktop nav links are 32px tall, the 320px header no longer crowds the Menu pill, the
page-head title fits at 320px, Ministries' card titles are h2 when the band has no heading, and the
address reads "Hamilton, OH 45013" everywhere. Data (`scripts/content/visitor-audit.mjs`): the
church's privacy policy and the menu's Give link to /give/.

_2026-10-18: the Studio speaks church._

**What changed.** An audit of the Studio found about forty business-starter leftovers an editor could
see; this removes or rewords them. The desk opens on "Our church at a glance" (`ChurchOverview.tsx`,
read live from Church facts, with "To confirm" flags) and "Brand colors and fonts"; the "Help & Guide"
list, the "Start Here" panels and "Business info" are gone, so help lives in one place, the Site Guide.
`studioNotes` (type, panel, seed row) is removed and its one document retired by
`scripts/content/retire-studio-notes.mjs` (backup, dry run, apply, verify: 0 left). One name per thing,
as on the public site: News and notes and Posts, Questions and Question groups, Notices, Page not
found, Saved sections, Site settings. Section words read "Opening banner", "Small line above the
heading", "Line under the heading", "Closing invitation", "Invitation band", "Staff and leaders". The
founder, story, service-area, guarantee and logo-strip blocks stay registered but no builder or
insert-menu group offers them; the groups are "Voices and numbers" and "About the church". Posts lost
the Before/After and Source card blocks and the "Sourced from" mark (no post existed). Contact hides
the business dropdowns and booking-link fields (the church's own questions replace them; the old
placeholder data stays, hidden), and the roadmap is "What happens after you get in touch". Site
settings: Business type fixed to Church and hidden, the Reviews fields, the satisfaction guarantee and
every visibility switch but News and notes hidden, Pinterest and Houzz gone from the social list, the
header button fallback reads "Plan your visit". SEO help says "Start with the church name or
Hamilton"; the badge reads "Add search text"; guide icons are `@sanity/icons`, not emoji; US
spelling and no em-dashes in editor text. Rendered pages unchanged (parity 17/17 against `main`).
**Left in the starter's PORTABLE files** (fix there, then sync): the "Save a section as preset..."
action label (`saveSectionPreset.tsx`, quoted by `PageBuilderInput.tsx` and `PreviewNavigator.tsx`,
which must match it) and "colour" in `UndoRedo.tsx`. `privacyPage.ts` still has the old wording
(owned elsewhere). The signed-in click-through is `docs/PENDING.md` item 1g.

_2026-10-18: the authoring kit and a Studio that looks like the church's (PORTS.md cards 109 and 110)._

**What changed.** Ported from the starter, with Auburn's own pieces. New pages start from a template: Simple page,
Ministry, Event, Sermon series or Blank page (`src/sanity/pageTemplates.ts`), with every placeholder line starting
"Example:" and a yellow warning on any section that still has one. The "+ Add item" menu opens on pictures of each
block, shot from `/styleguide/sections/` in Auburn's brand by `npm run thumbnails`, the five church blocks included.
Saved sections can hold up to twelve sections and go onto a page as a copy or as a synced section that follows the
saved one (`syncedSection`, resolved in `sectionsProjection()`, expanded in `SectionRenderer` before the cadence); the
same "Insert a saved section" button sits under the Extra sections on Contact, FAQ, News and notes and Privacy. The
Studio is named "First Baptist Church of Auburn", shows the stone mark on the login screen, the workspace and the tab,
and uses the navy primary for buttons, links and focus rings, contrast-guarded by `studio-theme.test.ts`. Home has a
greeting and four quick actions for the pastor's jobs (last Sunday's message, service times, a new page, the menus),
a status line sits under the top bar, and "Help for this page" shows the page check and the right Site Guide entries.
The Site Guide gained Start a page from a template, Reuse a section and Keep a section the same on every page; Add a
page and Rearrange the home page mention them. `StudioLogo.tsx` is gone (Sanity 6 never drew it). Rendered pages are
unchanged (parity 16/16 against `main`). The signed-in click-through is `docs/PENDING.md` item 1f.

_2026-10-18: the pastor can run the site without a developer._

**Decision.** Nathan: "Jacob should be able to do as much as he wants without me." An audit of
the Studio found the gaps; this closes the ones that need no credentials. A custom page's "Show
in the top menu" and "Show in the footer" switches now work (`src/lib/page-switches.ts`, tested:
the page joins the end of the menu and the last footer row, never twice); the non-existent
Services/Resources placement is hidden and the empty Extra sections tab removed. Dropdown menu
links use the page-picker link type (no saved data used the old typed one). The footer's words
are Site settings fields (`footerInvite`, `footerSecondaryCta`, `footerAbout`) with the old
wording as fallback, and the state comes from Church facts. Contact, FAQ, News and notes and
Privacy gained an Extra sections zone (`additionalSections`, rendered before each page's closing
CTA). `studio`, `preview` and `api` are reserved slugs. The journal post page lost the starter's
"Studio Journal" wording and sales CTA (it reads the Journal page's Final CTA, church fallback).
The Site Guide gained Rearrange the home page, Change the service times or the address, and
After Sunday: name the message, and corrects Rename (redirects are automatic), Add a page and
the menu guide. Data: `scripts/content/faq-church.mjs` added church FAQ categories and six
questions from facts the site already states; the four starter questions were retired the same
day on Nathan's yes (`--retire`, backup in the studio's Sanity backups, 2026-10-18-faq-retire). The publish webhook (OPERATIONS.md, PENDING 1e) needs Nathan's token.

_2026-10-18: the footer and the menus rebuilt to feel alive._

**Decision.** Recorded in `docs/design-directions/2026-10-17-fbc-auburn/README.md`. Footer
(`Footer.astro`, CSS in `src/styles/auburn.css`): a sill of the mark's stones across the top edge
(`Sill.astro`, from the new `sill` preset in `scripts/lib/stone-mosaic.mjs`, `SILL` in
`stones.generated.ts`; it lays itself once in view), the closing invitation at display size
beside a live This Sunday panel (date, times, address, Directions, calendar link), the Sanity
footer columns as a directory of big serif links, a full-width mosaic "Auburn" signature running
off the bottom, and a bottom bar with a Back to top link. The floating back-to-top button is
gone (`BaseLayout.astro`). Menu (`MobileNav.tsx`): numbered links rise in one after another; the
number turns into a stone in the story's next colour on hover and focus, and the current page
keeps its stone (`aria-current`); a This Sunday card with the visit button (first on phones);
the sill laying itself along the bottom; the Menu pill's icon is three stones. Desktop nav: three
gold steps grow in under a link on hover and stay under the current page. Motion is CSS only and
off under reduced motion. Measured at 320, 390, 1280, 1440: no sideways scroll; the menu's sill
shows on a 1440x900 and 1280x800 screen; Tab and Escape behave.

_2026-10-17: Home after the church-site research: Your first Sunday, the phone Sunday bar._

**Decision.** Four research passes over about 100 church sites (first screen, first visit,
events and watch, closing and craft); recorded in `docs/design-directions/2026-10-17-fbc-auburn/README.md`.
Home is now hero, Your first Sunday (`HomeWalk.astro`, from a `stepsRailSection`, whose steps
gained `gathering` and `place`; `gathering` is in NON_STEGA_FIELDS), Who we are, This week beside
Last Sunday, Other ways in. Through the week is retired (`scripts/content/home-first-sunday.mjs`,
which also folded the footer's Connect column into Visit). This week shows the weekday rhythm
from Church facts, dated calendar events (a cancelled one struck through: `occurrences()` takes
`includeCancelled`, `WeekRow.cancelled`), and an empty-state line. The Watch card names last
Sunday's message for 8 days from `watchSection.lastMessage` and shows "Live now" during worship;
its poster is no longer dimmed. Header: the round mark alone on Home below 1280px until the hero
lockup passes; the menu opens on the Sunday times and address. Phones get a Sunday bar once the
This Sunday card scrolls away (it replaces back-to-top on Home). The footer's first row is the
closing invitation (Plan your visit, Ask a question). JSON-LD is a `Church` with weekly service
schedules; `/sunday.ics`; `churchAddress.findUs`; `SanityImage` aims CSS crops at the hotspot;
the masthead scales for long words; the photo grid adapts to 0 to 3 photos; the card tile is
preloaded.

_2026-10-17: Home refined after the audit: one stone system, the path ends at the card._

**Decision.** Recorded in `docs/design-directions/2026-10-17-fbc-auburn/README.md`.
`scripts/lib/stone-mosaic.mjs` seeds its Voronoi stones on a jittered, staggered grid along the path
(no random darts, so no three-sided "guitar pick" cells; one Lloyd pass; corners softened, sides
kept flatter; each row its own width, so the edges go in and out) and colours them in four clear
bands of the mark's six colours (water, green, gold, red, short blends); the wide path
is 960x240 at its own size, absolutely placed in the hero's lead row with its right edge on the
This Sunday card (`home-board.css`), whole stones only, and it lays on scroll into view
(IntersectionObserver, 350ms fallback). The phone path is a 390x96 strip. `tile-sky.svg` and
`tile-green.svg` are gone (flat bands); `tile-deep.svg` is the same grid-seeded stones, sizes
varied, wrapping without a seam.
`MARKERS` became one `MARKER` (three gold steps) and the `marker` prop is gone from SectionLabel,
BoardRule and the Home sections. The card's address row has no pin and adds the state. The
masthead gains the place line from Church facts. `.hb-mosaic` rows are `minmax(250px, auto)` so a
long welcome grows the panel. New field `imageTextSection.signedPhoto` (Home only) draws a round
portrait beside the signature. The footer link grid (`.site-footer__links`) shares the brand row's
columns, with no spacer and no empty Get in touch. Data: `scripts/content/nav-give.mjs` reordered
the menu (About, Watch, Ministries, Give first; Give goes to Contact until a giving link exists;
"Plan your visit" left the list because the header button carries it). Measured at 320, 390, 1024,
1280, 1366 and 1440: no sideways scroll, the path never meets text, a five-sentence welcome fits.

_2026-10-17: board E corrections on Home, and E's grammar on the inner pages._

**Decision.** Five critics reviewed live board E; these are the code fixes they agreed on. Home: on a phone the
This Sunday card now follows the welcome and its buttons, and a one-line fact strip under the red welcome
(`SundayFacts.astro`, derived from Church facts like the header's Sunday note) puts the time and place on
the first screen even with the browser's bars; the phone path follows the card, 24px clear above and below; "Meet
the church" sits beside the button (gap 16px, no side padding); the hero eyebrow is quieter (18px, 0.18em);
the forecast line is 15px and brighter; the Who we are note opens with a curly quote. Site-wide: the header's
"Plan your visit" is the outline button, so the page's own red button is the only red in view; the header
stripe, the desktop eyebrow strip (tagline on a pale band; the footer carries the tagline) and the resting hairline are gone on every page (E pages open on their own hairline); below 960px the
header and footer sit on the same 20px gutter as the page. Inner pages: `ArchHero` hands the short hero to
`BoardPageHead.astro` (label with stepping stones, title, subhead, buttons, a photo or stone icon beside them;
no arch, no second mark); `SectionRenderer` opens each section with `BoardRule.astro` instead of the
gold-stone divider; `src/styles/board.css` (shared with Home's labels) turns the bands white, puts centred
columns and the closing band on the left edge, drops the closing band's mark (the footer carries it), gives
pictures E's 20px frame and hides the faint background path. One stone moment per page: the title is the
mosaic unless the page draws the mark or the baptism picture (About, What we believe). Measured at 320, 375,
768, 1024 and 1440: no sideways scroll, one left edge per page.

_2026-10-17: board E on Home: the lockup hero, the This Sunday card, a generated stone path._

**Decision.** A second design round found the full-height ribbon still weaker than the Gemini comp;
Nathan picked board E (decision in `docs/design-directions/2026-10-17-fbc-auburn/README.md`).
`src/components/home/HomeBoard.astro` walks Home's page layout and draws each block in E's grammar (the
board owns the cadence; unknown blocks fall through to SectionRenderer; the Studio preview uses it too).
The path, tiles and markers are the design round's generators ported to `scripts/lib/stone-mosaic.mjs`
and `npm run gen:stones`, byte-identical to the approved art. Schema: `heroSection.welcome`,
`imageTextSection.signedBy` and `extraImages`, all hidden outside Home. Facts stay derived: the This
Sunday card, This week, the header's Sunday note, the footer's Sundays and a weekday card title
("Wednesdays") all read Church facts. `SundayWeather` gained a `reserve` mode so the forecast can
show inside the card while it is on screen. The header lockup is 84px from 1280px (64px below that and once
the page scrolls) and the footer is ink, site-wide. `StoneRibbon.astro` and `src/scripts/ribbon.ts` are
gone. Measured on the dev build at 320, 375, 768, 1024 and 1440: no sideways scroll, no stone painted
over text; reduced motion and no JS show the path finished. Data: `scripts/content/home-board-e.mjs`
(backup, dry run, apply, `audit:data` clean).

_2026-10-17: the header logo shows with JavaScript off (starter card 108)._

**Decision.** With JS off the header logo was only its alt text: the theme-aware img ships with no `src` so the
inline script can fetch just one variant. `Header.astro` now adds a `<noscript>` copy with the light logo and a scoped
rule that hides the src-less img, which is only src-less when that script never ran. With JS on nothing changes.

_2026-10-17: the bold home pass: a full-height stone ribbon, a white page, photos._

**Decision.** Home looked weaker than a Gemini comp of the same brief: the stone path was timid, there were no photos,
and the page alternated pale bands. `StoneRibbon.astro` (first in `<main>`) narrows the content column on wide
screens, whitens the page and hides the stone dividers; `src/scripts/ribbon.ts` lays two lanes of brick-like stones
along one path, crossing between sections only in the measured gap between the last words of one section and the
first of the next, and a left rail under 64rem. Measured on the built Home: no stone touches a heading, paragraph,
link, button or image at 320, 375, 768, 1024 or 1440, and no sideways scroll. `iconCard` gained an optional photo,
`watchSection` an optional poster (a dark video card linking to the Watch page until YouTube is connected), and the
masthead hero shows `ThisSunday`. CtaLink's href resolver moved to `src/lib/cta-href.ts` so the poster links the
same way. The data change (six stock photos, Home's new block order) is `scripts/content/home-bold-pass.mjs`. The
blank sections seen while jumping down the old Home were the 600ms `[data-reveal]` fade caught mid-way, not a bug.

_2026-10-17: the Studio kit is now the starter's PORTABLE copy; /build-info.json shows the commit._

**Decision.** The kit went back to ncs-astro-sanity-starter as PORTS.md card 106, and this site swapped its copies
for the marked ones (the nine `src/sanity/kit/` files, `src/lib/studio-{kit,checkup,trash}.ts` and tests,
`src/pages/build-info.json.ts`, `docs/agent/studio-kit.md`), so `npm run sync-check` keeps them in step.
`src/sanity/kit.config.ts` stays this site's own file, and its comments carry the church-specific notes the kit doc
used to. The deployed `/build-info.json` always said `"commit": null`: the route read `GITHUB_SHA` inside the
workerd prerender, which cannot see it. `astro.config.mjs` now reads the SHA in Node and passes it as the Vite
define `__NCS_BUILD_COMMIT__`.

_2026-10-17: the background path stays off the words; the built-in contact form is the visit form._

**Decision.** The faint background stones (motion layer) sit above the section grounds so they show on the tinted
bands, which also put them on top of text: on a phone they crossed paragraphs and the "About the church" button.
`layPath()` in `src/scripts/motion.ts` now leaves out any stone whose box (plus 10px) touches a heading, paragraph,
list item, link, button or form field, so the path runs through the gutters and the gaps between blocks. Measured on
the built Home: stones over text went from 17 (1280) and 24 (375) to none touching words. With no questions written in
the Studio, the Contact form now asks the visit questions (`DEFAULT_VISIT_QUESTIONS` in `contact.astro`) instead of the
starter's interior-design questionnaire, so a fresh build or CI matches the live site. Follow-up: a ResizeObserver on
the page body lays the path again when late content (the replay thumbnail, the This week rows) changes its height, so a
stone placed before that content arrived cannot end up on a heading.

_2026-10-17: Contact shows the church's address; content clean-up._

**Decision.** The Contact sidebar's "Studio location" map is replaced by `ChurchAddress` ("Find us": the address from
Site settings > Church facts, its "To confirm" tag and Get directions), and the send button uses the Auburn button
style. In Sanity (backups first): the nine unused starter modules (portfolio, shop, guides and the rest) are switched
off so no footer column or link points at a page this site does not build; the seeded satisfaction-guarantee line and
service areas are cleared; Home's "Find your place" is now the stone-icon cards, followed by the Watch and This week
blocks; What we believe has the baptism drawing band.

_2026-10-17: icon cards, This week and Watch blocks; three Studio pages._

**Decision.** Three FBC Auburn blocks live in `src/sanity/schemaTypes/auburnSections.ts` and are registered through
`pageSectionSchemas`: "Cards with stone icons" (`iconCardsSection`: icon, title, a few sentences, a small note, an
optional link; `IconCards.astro`), "This week" (`thisWeekSection`, around `ThisWeekList`) and "Watch"
(`watchSection`, around `LastSunday`, with an editor-written line for when there is no video). All three are content
blocks, so the cadence gives them the alternating surface. The hero has a stone-icon picker (`icon`, on
`NON_STEGA_FIELDS` already) drawn above an inner page's title; the eight names are `src/lib/stone-icons.ts` and
`StoneIcon.astro` renders one. Studio pages (`page.ts`) now take `PAGE_SECTION_TYPES` (general blocks plus team grid,
FAQ and dynamic list). In Sanity: What we believe, Leadership and Ministries pages (doctrine and people are marked as
the pastor's to write), and Home's "Find your place" became icon cards plus the Watch and This week blocks. Verified:
typegen, check, test:unit, Home at 375 and 1280 with the church-data fixture, no sideways scroll at 320.

_2026-10-17: the stone path and its motion, and Plan your visit with "Walk in with us"._

**Decision.** Ported the studio mockups' v3 motion pass. Two new content blocks in `auburnMotionSections.ts`:
`stepsRailSection` (numbered steps with a stone-icon picker, gold stones laid between them, ending in the mark
building itself) replaces Home's "A Sunday with us" text, and `walkSection` (Walk in with us: a stone-mosaic plan
pinned beside the stops, the route laid leg by leg, ending on /contact/?visit=sunday-11) carries the new Plan your visit
page (`page-plan-your-visit`). The plan is computed at build time (`src/lib/walk-plan.ts`, placeholder geometry
until the church shares a building plan, unit-tested), so it reads without JS. `imageTextSection` gained `art`
(photo, the mark, or the baptism drawing, each with its motion); About now has "The story in our mark". Motion is
CSS scroll-driven animation (`animation-timeline: view()`) with an IntersectionObserver fallback, all behind
`html.motion`, which an inline head script sets only when reduced motion is not asked for. Transforms and opacity
only, the cross never moves. Every built-in "Plan your visit" button now goes to /plan-your-visit/. With no Studio page of that slug (a fresh clone, or CI, which builds without a Sanity project), `[slug].astro` still builds the address from `DEFAULT_PLAN_VISIT_SECTIONS`, and the Home default now carries the rail. Also fixed: the Contact roadmap step numbers drew at 80% of the link colour (4.07:1 on the card, an axe failure); they use the full link colour now. Verified: typegen,
check, test:unit, build, format, Playwright suite (106); light and dark at 375 and 1280 with motion on and off, no sideways
scroll at 320, the walk's state at three stops in Chromium and WebKit.

_2026-10-17: the Studio kit, first part (Home, Site Guide, Checkup, staff view, Trash, tour)._

**Decision.** The editor gets a plain Studio: it opens on **Home** (welcome, This week, Is it live?, Site health,
Recent edits, Visitors placeholder, Ask), with **Site Guide** (search and print over the existing guides) and
**Checkup** (pure rules, one fetch) in the top bar, and Structure and Presentation renamed **Content** and **Live
preview**. A listed set of accounts, or with no list every non-administrator, sees the **staff view**: only those
five tools, no Delete (everyday lists get **Move to Trash**, restorable from a Trash list), no Drafts menu or
Releases link. `/build-info.json` records each build's time for "Is it live?". Everything generic sits in
`src/sanity/kit/` and `src/lib/studio-{kit,checkup,trash}.ts`; the church's settings are one file,
`src/sanity/kit.config.ts`. Two desk fixes came with it: singleton items carry their document id as their pane id
(intent links opened a blank pane before), and every `media.*` type stays out of the desk root (a "Media Folder"
list had leaked in). Verified: typegen, check, lint, test:unit (698 + 53 with main merged), build, format; signed in at `/studio` on
`astro dev`, light and dark, staff and full view, a Trash round trip on a throwaway item (moved, restored, deleted),
console clean. Not built yet: PENDING 1d.

_2026-10-17: the starter's card 104 fixes, taken back (PORTS cards 104 and 105)._

**Decision.** apply-brand now writes the share-image brand into `scripts/og-theme.mjs` and never touches the PORTABLE
`scripts/lib/render-og.mjs`, so a rerun no longer reports DRIFT (the re-check noted in "the reskin, first pass" is no
longer needed). `src/lib/default-sections.test.ts` checks every default block field against the schema and fails on
em-dashes or mis-encoded characters in default copy; it found the leftover services and process defaults still naming
their heading `headline`, the process spacer's `size` and a mis-encoded em-dash, all fixed. Card 105 (a text hero keeps
its buttons) is not taken: the split hero renders as ArchHero here, and the text hero is left as it is until the
interior heroes are designed.

_2026-10-17: church data, held once and derived everywhere._

**Decision.** The church's facts live in Site settings, group "Church facts" (address, service times, phone flag,
founding year, YouTube channel id, Church Trac iCal feed), each provisional fact with a `confirmed` flag; the values from
the church's Facebook page were written to the dataset unconfirmed (backup first). `src/lib/church-facts.ts` derives the
"This Sunday" line, the "This week" rows (service times merged per day plus calendar events, deduplicated), the map
link and the public calendar link; unconfirmed facts show the inline "To confirm" tag (`NotConfirmed.astro`) and stay out
of the JSON-LD. Build-time feeds (`church-feeds.ts`): the YouTube channel feed for the replay and the Church Trac iCal,
both skipped with no setting and null on any failure. The iCal parser and the weather line are ported from First Baptist
Muncie; the weather is a browser fetch from api.weather.gov after load (grid ILN 28,51), and it now skips an
early-morning frost or fog clause ("Widespread Frost then Sunny" reads "sunny"). `deploy.yml` rebuilds every morning and
Sunday afternoon so dates, replay and events move on their own. Seven drop-in components in `src/components/church/`,
shown on `/styleguide/church-data/`; usage in `docs/agent/church-data.md`. Verified: typegen, check, test:unit, build,
format:check; the wall at 375 and 1280 (light; the site is light only), no sideways scroll at 320, the play swap, the live forecast,
the fixture and the no-feed states.

_2026-10-17: text fonts preloaded (Lighthouse CLS)._

**Decision.** Lighthouse CI measured CLS 0.106 on Home against the 0.1 budget: on a cold phone load the hero
was drawn in Georgia and Arial, then rewrapped when Young Serif (about 14% wider than Georgia) and Familjen
Grotesk arrived. Their Latin faces now live at fixed paths in `public/fonts/` (OFL texts beside them), declared
in `src/styles/auburn.css` after the @fontsource faces so they win, and preloaded in `BaseLayout.astro` like
Auburn Stone. Other scripts still load from @fontsource. Measured on a throttled 412px load: CLS 0.039 to
0.002, and only the three preloaded font files are fetched. The `.dark` heading colours went back into
`auburn.css` (labelled test-only) because the shared a11y-dark suite still forces dark mode.

_2026-10-17: light only._

**Decision.** Nathan dropped dark mode for this site. The header and phone-menu theme toggles are gone
(`ThemeToggle.tsx` deleted), and the theme bootstrap in `BaseLayout.astro` now defaults to light and ignores
`prefers-color-scheme`. A stored `dark` still applies, only so the shared dark test suites (`a11y-dark`, the dark
half of `contrast` and `visual`, which seed that key) keep running unchanged; no visitor can store it. The `.dark`
tokens in `globals.css` and the dark heading colours in `auburn.css` stay for the same reason. CLAUDE.md
rule 3 and the visual-verification doc now say light only. The phone menu's button uses the Auburn button style.

_2026-10-17: the reskin, first pass (direction A blended with B and C)._

**Decision.** `brand.config.json` carries the church's palette (deep sky everyday colour, ink text, white and
cool-soft grounds), Young Serif and Familjen Grotesk, a 10px radius and the layout slots inline / split / airy / soft.
The split hero renders as `ArchHero.astro`: words on the left, an arched photo on the right (the stone mark until the
photo session); on Home, `size: tall` makes it the masthead with "Auburn" as a huge colour mosaic. Every H1 is set in
Auburn Stone through `StoneHeading.astro` (preloaded, OFL licence in `public/fonts/`); the stega run is kept after the
letters so click-to-edit still works. `src/styles/auburn.css` is the brand layer: buttons (red primary, outline
secondary), arched pictures, the light closing band with the mark, stone dividers. Church copy went into Home, About,
Contact and FAQ in Sanity (backup taken first) and into the built-in defaults. Three starter bugs surfaced and were fixed
here: the default richText and imageText blocks named their heading `headline` (the components read `heading`, so
the headings never rendered), CtaLink ignored a default button's `href` (every default button went to /contact/), and
the layout gate failed any fork that picks a layout (it now checks the config names real values and that
`src/data/layout.ts` matches). Verified: check, test:unit (639 + 53), build, light and dark at 375 and 1280, no sideways
scroll at 320. The rest of the mockups is queued in PENDING 1c. Share-image colours come from
`scripts/og-theme.mjs` through render-og's `theme` option: apply-brand writes them into the PORTABLE
`scripts/lib/render-og.mjs`, which sync-check reports as DRIFT, so that file was put back to the starter's copy
(re-check it after any apply-brand run until the starter fixes apply-brand).

_2026-10-17: Sanity phase 2, `@sanity/ui` 4 and `@sanity/icons` 5 (PORTS card 103)._

**Decision.** The site follows the starter off the phase-1 pin (`sanity` 6.9.1, `@sanity/ui` 3.5.4) for `sanity` 6.19.0, `@sanity/ui`
4.4.9, `@sanity/icons` 5.2.3, `@sanity/client` 8.9.0 and `@sanity/visual-editing` 6.1.3, so the richer Studio admin is
written once, on current Sanity, instead of against a pin it would have to be ported off. Studio code: `space` to `gap` (47), `Grid columns` to `gridTemplateColumns`, `Badge mode` dropped,
`Menu*` and `useToast` to their subpaths, every icon to `@sanity/icons/<Name>` (scaffold markers carried onto the new
lines), and `react/compiler-runtime` added to `optimizeDeps.include` so the dev Studio hydrates. Verified: one
`@sanity/ui` and one `@sanity/icons` on disk, one `errors.md#` chunk, typegen, check, build, 691 unit tests, 92
Playwright tests, parity 10/10 after recapturing `studio` (the new `@sanity/ui` stylesheet link), and this site's signed-in Studio
plus Presentation in a real browser.

_2026-10-17: date labels do not depend on the build machine's timezone (PORTS card 98)._

**Decision.** Every build-time date label goes through `formatDate()` in `src/lib/format-date.ts` (PORTABLE). Seven
components and pages called `toLocaleDateString` with no `timeZone`, so a local build in US Eastern rendered a Sanity `date`
of 2026-01-15 as "January 14, 2026" while CI (UTC) rendered the 15th. Date-only values now always keep their calendar day;
full datetimes format in UTC, because the starter has no site timezone setting and UTC is what production has always built
with, so live output does not move. Studio preview subtitles stay in the editor's zone. Verified: parity 12/12 with builds under
`TZ=America/New_York` and `TZ=UTC`, `check`, `build:full`, `test:unit`.

_2026-10-17: astro 7.4 with `@astrojs/cloudflare` 14.4.0 (PORTS card 97)._

**Decision.** `astro` ^7.4.0 and `@astrojs/cloudflare` 14.4.0 exact, together (14.4.0 peers `astro ^7.4.0`). `wrangler` stays
~4.129.0; the adapter's newer `@cloudflare/vite-plugin` nests its own wrangler 4.151 for prerender only. Lockfile: 45 version
moves, all in the astro, adapter, vite, rolldown, shiki and workerd subtree, plus 118 nested duplicates collapsed. Rendered HTML
of all 12 parity pages identical apart from Astro's island bootstrap script, which the new minifier writes 3 bytes shorter
(`{...;return}try` becomes `...;else try`). Verified: typegen, build, `astro check`, lint, unit and scripts tests, format,
links, `wrangler deploy --dry-run`, and `wrangler dev` in Chromium at 375 and 1280 in light and dark with `/studio` mounting.
Not verified: a real deploy (see PENDING item 4).

_2026-10-15: GA4 skips automated browsers (PORTS card 96)._

**Decision.** `GoogleAnalytics.astro` gains rule 4: it does nothing when `navigator.webdriver` is true or the user agent matches
`HeadlessChrome|Lighthouse|PTST|GTmetrix|Speed Insights`. FRT's property took 194 test "visitors" in one day of Playwright and
Lighthouse runs against production; card 58's hostname rule cannot stop that because the hostname is the real one. Fails open for
real browsers. Site branches `chore/ga-skip-automated` are pushed without PRs; open them after this merges.

_2026-10-13: the planned major stack upgrade (PORTS card 94)._

**Decision.** `astro` 7.3.8 with `@astrojs/cloudflare` 14.3.4 (14.2.4 imports an export astro 7.3 removed), `wrangler` ~4.129.0
(the adapter peers >=4.125.0; 4.126 and up bundle a miniflare 5 alpha), `@astrojs/react` 7, `@astrojs/mdx` 8, `motion` 14,
`@portabletext/react` 8, `eslint-plugin-astro` 3, `prettier-plugin-astro` 1 (60 `.astro` files reformatted in a separate commit, built
HTML identical), `cloudflare/wrangler-action` v4. `primereact` is deliberately held at 10.x: v11 is a rewrite under a licence-key
licence and nothing renders it. Sanity and react unchanged. Verified: build, `astro check`, lint, unit, the Chromium e2e suite, a
real `wrangler deploy` to a throwaway Worker, `astro dev` cold, `/studio/` mounting in a real browser. Visual baselines were not
touched (the suite runs on Linux CI only).

_2026-10-13: SanityImage's srcset ladder gains 160, 240 and 320 and drops steps below the smallest `sizes` slot (PORTS card 93)._

**Decision.** Measured on presacademy and mas-monograms: the ladder started at 400w, so small slots (presacademy's 112px course thumbnails) downloaded the 400w file, 1.4 to 2x the bytes they needed. The ladder is now `[160, 240, 320, 400, 600, 700, 800, 900, 1200, 1600, 2400]` in `src/lib/imageLadder.ts` (new, pure, with `imageLadder.test.ts`), and `SanityImage.astro` calls `buildLadder(width, sizes)`. When `sizes` is passed and readable, steps below 75% of its smallest slot are dropped. A slot that needs 400px or more picks the same candidate as before (asserted in the test against the old ladder). `SanityImage.astro` is marked "Foundation, edit with care", not `PORTABLE`, so `sync-check` does not gate the site PRs; each site's copy carries its own extras and gets the same three-line change. **Status.** Starter in this PR; presacademy, mas-monograms, reid-design-site, stonesteps-50k and fbcm take it in their own PRs (live before/after bytes on card 93).

_2026-10-13: one text/picture split on every band, and `scripts/measure-columns.mjs` (PORTS card 91)._

**Decision.** Ported from stonesteps-50k PR #31. The starter's text-plus-picture bands each declared their own grid (equal
halves, 1fr/1.2fr, 1fr/1.1fr, a 50/50 hero that ignored the content column), so the seam between words and picture sat in
four places and the split hero's text did not start on the column edge. `globals.css` now has `--split-text: 1.1fr`,
`--split-media: 0.9fr` and `--split-gutter: var(--spacing-l)` on `:root`, `.split` and `.split--media-first`, and the split
hero builds five tracks from the same variables. `ImageText`, `FounderSection`, `StorySection`, `ServiceAreaSection` and the
404 use it, at `lg` rather than `md`, so a tablet stacks instead of showing a half-width picture. Nothing is a pixel value:
the numbers come out of the 82.5rem container, the `px-m` gutter and the spacing scale (text 651, picture 533, seam at 723
at 1280, against Stone Steps' 656, 536 and 720). Stone Steps' rules about centred objects have no counterpart here, because
the starter's pictures are full width and its headings left aligned.

**The instrument.** `scripts/measure-columns.mjs` (and the pure `scripts/lib/column-alignment.mjs`, with its test) reads each
section's heading and each two-column band with `getBoundingClientRect` and reports the column edge and the seam per page. On
the layouts wall at 1280 the seams went from 678, 678 and 640 (spread 38px) to 723 on all three, and the hero text from x=0
to the column edge at 24. `/styleguide/layouts/` gained a `split-bands` region so a no-Sanity build has bands to measure. Five
baselines move, regenerated in CI: `hero-split-1280.png` and the four 1280 shots below it that the taller or shorter hero shifted by a pixel (`hero-editorial`, `cards-standard`, `cards-outline`, `cards-soft`). Four lessons from doing it: the `grid`
fallback (any two-track grid with a picture) is what makes the BEFORE number measurable on a site without `.split`; a band's
first heading can sit in the second column, so the edge rule judges a band by its outer edge; Git Bash rewrites `--paths /`
unless `MSYS_NO_PATHCONV=1`; and `.split` is unlayered, so a `gap-*` utility on the same element silently loses.

_2026-10-09: internal links end in a slash (PORTS card 89)._

**Decision.** `astro.config.mjs` sets `trailingSlash: 'always'`, matching the canonical tags and the sitemap. Before this, every internal link was written `/about`, Cloudflare answered each one with a 307, and Search Console reported "Page with redirect". Hand-written hrefs now carry the slash; links built from Sanity data (nav, footer, CTA blocks, Portable Text link marks, `/journal/<slug>` queries, JSON-LD urls) go through `withTrailingSlash()` in `src/lib/href.ts`. `/api/contact/`, `/api/draft-mode/enable/` and the other SSR URLs use the slash form too. Built-HTML check: 135 of 231 internal hrefs lacked the slash before, 0 after.

_2026-10-04: `scripts/measure-tap-targets.mjs` skips closed `<details>` content (PORTS card 83; closes `docs/PENDING.md` item 13 in the starter)._

**Decision.** Content inside a `<details>` without `open` is not rendered, but Chrome still reports its geometry, so the scan listed it as under 44px and its hit test landed on whatever lay underneath (mas-monograms `/style-gallery/`: 68 false stolen taps from a closed mobile filter panel). The script now checks `details:not([open])` on every ancestor at scan time, nested included, and skips the element unless it is that details' own `<summary>` (always measured). `--include-closed-details` is the opt-out. Hidden, `display: none` and `visibility: hidden` were already skipped and are untouched; sticky-element inflation, inline exemption, the stolen-tap test, flags and output format are unchanged. A fixture before/after (3 under 44px and 6 stolen, then 2 and 0, the 2 being undersized summaries) and the starter's own 8 routes (0 before and after) are on card 83. `scripts/lib/measure-tap-targets.test.mjs` is the new starter-only test (skips without Chromium). The file is `PORTABLE`: presacademy, mas-monograms and nixoncreativestudio resync by overwrite.

_2026-10-04: cards 82 and 83 learned from three more ports (presacademy #61 and #62, mas-monograms #72, nixoncreativestudio #90). Docs only._

**Decision.** Matrix cells for presacademy, mas-monograms and nixoncreativestudio set to `yes` on both cards, each read from its merged PR (all merged 2026-10-04). Card 82 gained the three site shapes (`.tap-44` and `.check-44`, redrawn native controls, `pointer: coarse` real boxes) and the rule for choosing between them; card 83 gained six lessons: the TOTAL is inflated by sticky elements, scan the live site after deploy, closed `<details>` false positives, Git Bash `MSYS_NO_PATHCONV=1` and per-scan server restarts, native controls cannot carry a hit area, and the footer growth that moves `visual` baselines. **Open.** PENDING item 13: teach `measure-tap-targets.mjs` to skip closed `<details>` content (a PORTABLE change, so not in this PR). fbcm has no matrix column; its PR #36 stays recorded as before. No `PORTABLE` file changed.

_2026-10-03: the starter now passes its own 44px tap scan at 390px (PORTS cards 82 and 83; closes `docs/PENDING.md` item 12)._

**Decision.** Card 83's first reading listed 6 footer links under 44px on every route and 16 on `/contact/`. Fixed by shape, not by one trick: footer column links are stacked rows about 28px apart, so a 44px invisible hit area would overlap neighbours; they take real row height (`min-h-[44px] min-w-[44px]`, lists lose `space-y-2`). The bottom-bar links and "View larger map" are standalone and underlined, so they take card 82's `.hit-44` hit area (added to `globals.css`, no layout shift). The contact form's inputs, selects, textareas and Send button took `min-h-[44px]` because they are visible controls. **Measured.** `scripts/measure-tap-targets.mjs` at 390px over `/`, `/services/`, `/contact/`, `/about/`, `/faq/`, `/journal/`, `/privacy/`, `/process/`: 58 under 44px to 0 (3 inline-in-sentence links exempt, 0 stolen taps). **Cost.** The footer is about 16px taller per link on a phone and form controls are 2 to 4px taller. No `PORTABLE` file changed.

_2026-10-03: cards 82 to 85 from the Impeccable audit fixes, and `scripts/measure-tap-targets.mjs` (PORTS cards 82 to 85)._

**Decision.** Four things the audit PRs on reid-design-site (#113), fbcm (#36) and stonesteps-50k (#77) proved became cards, written from their merged diffs: the invisible 44px hit area (82), the 390px tap-target scan (83, the only PORTABLE file, generalised from fbcm's original: default `--paths` is `/`, wording no longer names fbcm's class), the Linux-runner font-swap layout-shift trap (84) and the MapLibre 6.x `setMissingStyleImageResolver` rule (85, guidance only: no site but stonesteps-50k has MapLibre). **Found while checking:** the scan run on this starter's own build lists 6 footer links under 44px on `/`, and 16 targets on `/contact/`; logged as PENDING item 12, not fixed here. The small-text scan the brief mentioned is stonesteps-50k's and is not on its `main`, so it is not in the script.

_2026-10-03: card 81 rolled out, and what it did not fix (PORTS card 81 row note)._

Presacademy and stonesteps-50k resynced the script. Live check beforehand: both sites served the starter's interior-design `llms-full.txt` (stonesteps even listed a "Consultation, $150" price). The resync fixes the site name and URL only; the script still reads the starter's content types, so on a different kind of site it writes a stub. Stonesteps-50k's files were hand-written from its live pages and verified; presacademy's `llms-full.txt` was removed because its content is still seed data. Docs only in this repo.

_2026-10-03: `generate-llms-full` reads site identity from the brand config, `audit-studio` reads shared field consts, promoted from fbcm (PORTS card 81)._

**Decision.** fbcm un-marked its two scripts (PR #31) but left two generic fixes in them. (1) `generate-llms-full.mjs` fell back to the literal 'Studio Starter' and 'https://example.com' when SITE_NAME / PUBLIC_SITE_URL were unset, so a fork with a filled `brand/brand.config.json` still published the starter's name and a dead domain (presacademy, stonesteps-50k and 2ndpreschicago all have exactly that committed in `public/llms-full.txt`). Identity now resolves env, then `brand.config.json`, then today's placeholders, in `scripts/lib/site-identity.mjs`; fbcm's exit-if-missing is NOT promoted (a missing config behaves as before, with one `[warn]` line, exit 0). (2) `audit-studio.mjs` check 3 did not see fields declared as `const eyebrow = defineField(...)` and spread into several types, so it flagged every stored value of them; `scripts/lib/shared-field-consts.mjs` reads them. Both pieces are pure functions with unit tests. Church-specific parts of fbcm's copies (`/post/` links, `travelFees`, contact fields, the structuredInUse rule) stay in fbcm. Site resync order: starter merges first, then site PRs (rule in `.claude/rules/library-of-record.md`).

_2026-10-03: `sync-check` skips `_worktrees/` folders (PORTS card 80)._

**Decision.** The walker skipped `worktrees` (so `.claude/worktrees`) but not `_worktrees`, the studio's own worktree folder, so a local run in any checkout with a live worktree counted every marked file twice (fbcm: `86 same, 0 drifted, 86 missing in starter (172 checked)`) and buried real drift. Added `_worktrees` to `SKIP_DIRS` by exact name and a regression test (`scripts/lib/sync-check-skip-dirs.test.mjs`, run by `npm run test:scripts`). CI never saw it (a fresh checkout has no worktrees). Merging turns every site that enforces `sync-check` against live starter `main` red on `build` until it resyncs the file: presacademy, reid-design-site, mas-monograms, nixoncreativestudio. stonesteps-50k and fbcm only self-check; wcp and 2ndpreschicago are archived.

_2026-10-03: cards 77 to 79 rolled out to the sites, matrix rows 74 to 79 updated._

Presacademy (#57), reid-design-site (#108), mas-monograms (#69) and stonesteps-50k (#73) re-synced the marked `preview-morph`, `preview-stega` and `redirects` copies after the starter merge (mas carries no redirects file); fbcm resynced cards 75 and 76 (#33). Each site PR was held as a draft, red on the sync-check enforce step, until starter #70 merged, then re-run green. Docs only in this repo; no code or behaviour change.

_2026-10-03: redirect destinations keep `?query` and `#fragment`, promoted from fbcm (PORTS card 79)._

**Decision.** `buildRedirectMap` normalized the destination with the source's rules, which drop the query and fragment, so `/visit#accessibility` shipped as `/visit` (25 of fbcm's 42 targets were wrong). Promoted fbcm's `normalizeRedirectTarget` and its ten tests byte for byte; the self-redirect guard now compares paths so `/a -> /a#top` is still caught. Sources are unchanged, so no redirect key moves. Same site-CI caveat as card 77, for presacademy and reid-design-site.

_2026-10-03: `RUN_SOURCE` is exported from `preview-stega.ts` (PORTS card 78)._

**Decision.** fbcm needed the stega-run pattern in a site module and exported the existing private constant rather than copy a regex that must match the decoder exactly. One keyword, no behaviour change, promoted byte for byte. Same site-CI caveat as card 77: presacademy, reid-design-site and mas-monograms mark this file and go red until they re-sync.

_2026-10-03: the preview morph keeps reveal state, promoted from fbcm (PORTS card 77)._

**Decision.** The preview morph synced `class` to the server's HTML, which never has the classes run-once observers add after load (`is-visible`, `is-revealed`, `is-staggered`), so any draft edit re-hid revealed content until a full reload; fbcm hit it on 2026-09-26 and fixed it with a `CLIENT_STATE_CLASSES` keep-list. Promoted byte for byte with its test. **Not backward compatible for site CI:** presacademy, reid-design-site and mas-monograms carry marked copies and enforce sync-check against live starter `main`, so their `build` goes red until each re-syncs (the card's table). Shipped in a separate draft PR for that reason.

_2026-10-03: the visual suite's webServer timeout is configurable (PORTS card 76)._

**Decision.** fbcm's ~390-page build outran the 180 s `webServer` timeout in `playwright.visual.config.ts` (the timeout covers the build too) and fbcm hard-coded 600 s, which made the marked file drift. Promoted as an environment variable instead of a new literal: `PLAYWRIGHT_WEBSERVER_TIMEOUT_MS`, defaulting to 180000 when unset or invalid, so every site that does not set it behaves as before and the file stays byte-identical across the family. fbcm sets the variable in its visual workflow when it re-syncs.

_2026-10-03: the Sanity image disk cache for Playwright, promoted from fbcm (PORTS card 75)._

**Decision.** fbcm's Playwright runs were spending about 13 GB a week of Sanity image bandwidth, so on 2026-09-26 it added `tests/fixtures.ts`, which routes `cdn.sanity.io` images through a disk cache, and pointed its specs at it. Promoted here as a new marked file, with `a11y`, `reflow` and `smoke` switched to `./fixtures`. **Harmless without a cache or a Sanity project:** an empty cache fetches once and keeps; this starter's CI builds from fallbacks, so the route never fires. The smoke spec was merged by hand: the starter's card 58 GA test stays, fbcm's `/blog` and `/post` tests stay out (one site's content). `reduced-motion.spec.ts` was NOT switched: five site repos mark it and check against live starter `main`, so changing it would turn their `build` red. No workflow touched.

_2026-10-03: the scripts tests now run in CI (PORTS card 74 follow-up)._

**Decision.** Card 74 chained `test:scripts` onto `check:full`, but `ci.yml` and `deploy.yml` call `npm run test:unit` directly, so CI and the deploy gate never ran the 5 scripts tests. Fixed without touching a workflow: `test:unit` is now `node --experimental-strip-types --test src/lib/*.test.ts && npm run test:scripts`, and `check:full` drops its own `&& npm run test:scripts` so they do not run twice. The `src/lib` command is unchanged, so the four gate tests run exactly as before; `test:scripts` stays its own script. Job names and triggers are untouched.

_2026-10-03: page-parity `--exclude`, promoted from fbcm (PORTS card 74)._

**Decision.** fbcm added `--exclude` to its copy of the parity harness on 2026-09-20 (generated archive pages multiply baselines without adding coverage) and marked it `PORTABLE`, so it reported drift. Promoted here unchanged and byte-identical, with `scripts/lib/parity-glob.mjs` and its test. **Backward compatible:** no flag and no `PARITY_EXCLUDE` means nothing is excluded and the page list is the same. `package.json` gained `test:scripts` (chained onto the end of `test:unit`, so CI runs it; see the entry above). No site CI turns red: only fbcm and stonesteps-50k carry a marked copy, and both run sync-check against themselves.

_2026-10-03: layout variants, the structure axis of the brand config (PORTS card 72)._

**Decision.** Reskinning was colours, fonts and radius on one fixed structure, so every site looked like the same site. Structure is now a second config axis: `brand.config.json` `layout`, four slots with three values each, the first value of every slot being today's behaviour. Chosen because each fits an existing component without forking a page: `header` inline / centered / minimal (CSS on the existing header markup, plus hook classes), `hero` bleed / split / editorial (one `variant` prop on `Hero.astro`; split puts the existing dark panel beside the image, editorial drops the image), `density` standard / airy / tight (two spacing tokens), `cards` standard / outline / soft (the shared `.card-lift` surface). Left out on purpose: footer variants, a compact hero (density covers the need), per-card-type styles (one surface keeps the page on one grammar, rule 17), anything needing a second page template. **Mechanism:** defaults emit no attribute, so existing sites render pixel-identical (0 differing pixels on `/` and `/about/` at 390 and 1280); variants are unlayered CSS on `html[data-*]`. **Cost:** four hook classes added to `Header.astro` and `MobileNav.tsx`, so rendered HTML differs by class names only (a `parity compare` shows exactly that). **Visual coverage:** `/styleguide/layouts/` plus `tests/visual/layouts.spec.ts`, 24 baselines generated in CI.

_2026-10-03: card 71 rolled out to the family._

Presacademy, stonesteps-50k, reid-design-site and fbcm adopted both pieces (deny rules and the shared conventions import); mas-monograms took only the deny rules; 2ndpreschicago is archived. The PORTS matrix row 71 and the card's Rollout paragraph record it. No code or behaviour change in this repo.

_2026-10-03: tracked `.claude/settings.json` and the shared conventions file (PORTS card 71)._

Added `.claude/settings.json` (deny rules for `git reset --hard` and force pushes, Bash and PowerShell, marked PORTABLE through a `"_portable"` key) and `docs/claude/family-conventions.md` (the Code conventions and Working with Claude text shared by every site repo, PORTABLE, imported from CLAUDE.md with `@docs/claude/family-conventions.md`). CLAUDE.md went from 128 to 115 lines; behaviour is unchanged. `sync-check.mjs` was not edited, because its marker scan is a substring match on the first five lines.

_2026-10-03: staging abandoned; main is the only branch._

Removed `deploy-staging.yml` (and `scripts/worker-name.mjs`, which only it used), took `staging` out of the `ci.yml` and `lighthouse.yml` push filters, and rewrote the OPERATIONS.md Deploy section to the PR-into-`main` flow. Dated PORTS cards that describe the `main` + `staging` model are left as history; the card 30 row and note carry the current convention.

> Running change log, moved out of CLAUDE.md so it does not load on every task.

> **Scope note (2026-08-27).** This file stays **narrative**: what changed here, in
> sequence, in prose. The **machine-checkable** record of what is shared across the site
> family now lives in `PORTS.md` at the repo root: an applied-to matrix (improvement by
> repo), one dated port card per improvement, and `scripts/sync-check.mjs` to prove a
> site's canonical copies have not drifted. Something that needs to be _checked_ belongs
> in PORTS.md; something that needs to be _understood in sequence_ belongs here. Entries
> below may reference a card number.

_2026-09-30 — Reduced motion zeroes transitions; a spec holds it (PORTS card 61)._

The global reduced-motion reset gave transitions 0.01ms. Because `transition-property` defaults to `all`, that gives every element a transition, and WebKit never finishes a 10-microsecond one: in fbcm (its PR #6) 289 sat at progress 0 on the home page, each holding its property at the old value, and its motion test failed on the webkit-iphone project on `main`. Transitions are now 0s, duration and delay; animations stay at 0.01ms. New PORTABLE `tests/reduced-motion.spec.ts` checks every route has nothing running 2.5s after load under `reduce`, on chromium and the WebKit iPhone profile. The starter's own pages passed it before the fix too (they do not trip the change that starts a transition), so the proof of the check is fbcm's.

---

_2026-09-29 — `astro dev` works on Windows again: the Sanity dedupe alias is repaired (PORTS card 60)._

Found in reid-design-site (its PR #48) and folded back here. On Windows `astro dev` exited inside a minute with `[MISSING_EXPORT] ... is not exported by "node_modules/sanity/package.json"`, on the same `@sanity/astro` 3.4.2 and `sanity` 6.9.1 this starter pins. Cause: `@sanity/astro`'s dev-only `sanity:module-dedupe` plugin strips `/package.json` from a resolved path with a regex that only knows forward slashes, so on Windows every `import from 'sanity'` is aliased to a JSON file. `astro build` never loads the plugin, which is why CI and production were always green. New PORTABLE `src/lib/sanity-dedupe-alias.ts` (`fixSanityDedupeAlias()`, plus the testable `repairSanityDedupeAlias()`), wired into `vite.plugins` in `astro.config.mjs`, with `sanity-dedupe-alias.test.ts`. The upstream env off switch was tried and rejected: the server stays up but the Studio will not hydrate. No build output changed (byte-identical `dist/client` before and after, measured in the card).

---

_2026-09-06 — The starter catches up: Sanity phase 1, the family test standard, and two workflows harvested from the retiring church starter._

The starter had become the odd one out. It is structurally the canonical source (57 files carry the `PORTABLE` marker, PORTS.md has 44 cards, every client repo's `scripts/sync-check.mjs` diffs against it), but its stack and its gates were older than the sites it governs.

**A — Sanity phase 1** (PORTS card 10). `sanity` 6.4.0 to 6.9.1, `@sanity/vision` to 6.9.1, `@sanity/ui` 3.3.5 to 3.5.4, `@sanity/client` 7.23.0 to 7.26.2, `@sanity/visual-editing` 5.4.5 to 5.7.3 in both `dependencies` and `overrides` (npm refuses the whole install with EOVERRIDE otherwise), `@sanity/preview-url-secret` 4.0.8 to 4.1.5 (5.7.3 and 6.9.1 both want ^4.1.2, and 4.0.8 would nest a second copy). Stops at 6.9.1 deliberately: 6.9.2 is a PATCH release that crosses to `@sanity/ui` 4, which is a real migration. `@sanity/icons` stays on 3.x hoisted and the `sanity-plugin-utils` 2.0.6 override stays pinned. The same set is already human-verified in a signed-in Studio on presacademy, reid-design-site and mas-monograms. Verified here: exactly one `@sanity/ui` and one `styled-components` on disk and in the lockfile, one `errors.md#` bundle, typegen byte-stable, parity 10/10 after re-capture (the Studio's vendor CSS chunks moved; no page content did).

**B — The family test standard** (new PORTS card 35). The repo had `ci.yml`, `deploy-staging.yml` and `publish-due.yml`, no Playwright, no Lighthouse, and a CI job that ran typegen, build and the unit tests only. It now runs the family's whole gate: `astro check`, eslint, `prettier --check`, unit tests, `check:links`, the four Playwright suites on chromium and a WebKit iPhone profile, and a separate `lighthouse.yml` with an explicit url list and accessibility as a hard gate at 1.0.

Turning gates on for the first time is where the value was. `astro check` reported **222 errors**, and 163 of them were one bug: `sanityFetch(query, {}, null)` let TypeScript infer `T` from the empty fallback, so every page helper resolved to `Promise<null>` and every property read downstream was "does not exist on type 'never'". Two overloads on `sanityFetch` name what an untyped GROQ projection actually returns. The rest: `modules/` was being type checked in place when it is staged by design; nine components each redeclared a narrower image type than the projection returns (one shared `SanityImageObject` now); four hand-authored "U7" projected block types had drifted from the generated ones, which was a TODO the type check closed; a patch-builder interface that made `.setIfMissing(...).commit()` uncompilable; a spacer-divider branch testing for a variant the schema has never offered.

`check:links` found **135 broken internal links across ten pages**, all one cause: the nine opt-in module routes were treated as visible-unless-switched-off, like core sections, so a fresh clone rendered a footer and a nav full of links to routes it never builds. `getSectionVisibility` now has two rules, one per kind of route.

The Playwright suites found three real bugs on their first run: two region landmarks with the same accessible name on `/privacy`; `text-foreground/60` under 4.5:1 in two places; and every `<select>` on `/contact` with no focus indicator at all on Safari and iOS, because a Tailwind `focus:ring` is a box-shadow and WebKit drops box-shadow on native form controls. Chromium showed nothing wrong for that last one, which is the argument for running the sweep on both engines.

The format pass was verified with `npm run parity`, not by eye. A prettier pass can silently eat a meaningful space in an Astro template, and the one apparent text difference turned out to be React's `<!-- -->` separator moving where the parity normalizer collapses whitespace; the real `dist/client` HTML still reads "How did you hear about us? (optional)".

**C — Harvested from `ncs-church-starter`** before it is retired as a second library of record: `sanity-backup.yml` and `uptime.yml`, in the church starter's template stance (gated, schedule commented out, project id and origin read from repo variables) with the fixes the client repos had already earned folded in, encrypt-before-upload and the `--project-id` flag. The church-specific schema types were deliberately not taken; that is a separate decision.

---

_2026-08-28 — The Squarespace-grade editor: Astro 7, Sanity 6.4, embedded single-package Studio, live preview, in-canvas section controls._

The template takes the whole modern stack its descendant presacademy pioneered, so every future site is born with it. Four phases, each gated before the next.

**A — Framework upgrade.** Astro 6.3 to 7.2, `@astrojs/cloudflare` 13.5.5 to **14.2.4 exact** (the last release whose wrangler peer range fits the pin below), `@astrojs/react` 6, `@astrojs/mdx` 7, `wrangler` pinned `~4.110.0` (PORTS card 14), react/react-dom/react-is pinned **exact** 19.2.7 (card 13), and the `overrides: { vite: "^7" }` pin removed (it broke Astro 7's prerender step). `scripts/with-workerd.mjs` is now wired into `npm run build` (card 1), so the Windows prerender crash is handled rather than merely documented. Plus `session: false` in `astro.config.mjs`, `nodejs_compat` in `wrangler.jsonc`, `assets.not_found_handling` removed, and deploy switched to `wrangler deploy -c dist/server/wrangler.json`. Adapter 14 splits the output: `dist/client` is the static site, `dist/server` the SSR bundle.

Parity baselines were re-captured. Every diff across all nine routes was categorized first, and all of them fell into four framework-caused classes with nothing structural left over: the `<meta name="generator">` version string; `<astro-island uid="...">` (a generated identity, same family as the `prefix` the harness already normalizes); inline `<script>` and `<style>` bodies (esbuild and lightningcss changed their output); and whitespace inside text nodes (the Astro 7 compiler trims it). No class, id, aria, href, JSON-LD or text changed anywhere.

**B — Sanity 6.4 pin set and the studio fold.** The nested `studio/` package is **gone**. Schemas, structure and components moved to `src/sanity/`, the configs to the repo root (`sanity.config.ts`, `sanity.cli.ts`): one `package.json`, one `node_modules`. That is the real fix for the dual-module-tree crash that took presacademy's production Studio down on 2026-08-26 (card 10); `resolve.dedupe` is kept anyway as cheap insurance against a fork reintroducing a second resolution root. The Studio is now **embedded at `/studio`** through `@sanity/astro` and rebuilds with every deploy, so there is no hosted Studio to drift and no `studio:deploy` step; `sanity.cli.ts` deliberately omits `studioHost`/`deployment` so a stray `sanity deploy` cannot recreate the split. `buildLegacyTheme` (light-only, which left the Studio's dark mode all-white) gave way to `@sanity/ui`'s `buildTheme`; `apply-brand` now rewrites the Studio's two font stacks instead of a dozen legacy colour variables, and `brand.config.json`'s `studio.themeProps` became `studio.fonts`. `sanity-plugin-iframe-pane` retired in favour of the Presentation tool. CI lost its studio-prefix steps. Verified: exactly one `@sanity/ui` on disk, exactly one `errors.md#` chunk in the build, typegen byte-stable, standalone `npx sanity build .studio-dist` green, and the embedded Studio mounting in a real browser.

One markup change arrived with the refreshed lockfile and is unrelated to the fold: a newer react-aria inside `sonner` adds `data-react-aria-top-layer="true"` to the toaster region. After masking the framework-caused classes above, that attribute was the **only** residual difference on any page, which is what proved the fold itself render-neutral. Baselines re-captured a second time to absorb it.

**C — The preview stack** (cards 10 and 11). `src/lib/cms-preview.ts` (a second, runtime, draft-and-stega Sanity client, with this template's own enum fields seeded into `NON_STEGA_FIELDS`), `src/lib/preview-auth.ts` (a token fingerprint in the preview cookie, not the package's forgeable `'true'`), `/api/draft-mode/enable` and `/disable`, `/preview/live` (an SSE proxy over Sanity's listen API, never a poll), `/preview/[...slug]`, `PreviewLayout.astro` (chrome-less, forced motion end-states, the embedded-frame exit-button fix, and the click interceptor carrying this template's route map), `VisualEditingOverlay.tsx`, plus `src/sanity/resolve.ts` and a `PreviewNavigator` page list wired into `presentationTool`.

Because this template is page-builder-first, the four builder pages and every custom `page` doc preview in **full fidelity** through the same `SectionRenderer` the live page uses. The five bespoke pages (faq, contact, journal, privacy, 404) preview as their editable surface with a note saying so. No page-builder conversion was attempted: that is card 12 and a separate job.

Everything **fails closed** without `SANITY_TOKEN`, and legibly. The preview entry points answer 503 naming the missing pieces rather than throwing a Sanity client error, because a fresh clone hitting `/preview` should read as "not set up yet", not as a bug in the template.

**D — In-canvas section controls** (card 17). `src/lib/preview-edit-attr.ts` plus a preview-only wrapper in `SectionRenderer`: with `editDoc` absent the wrapper is a `<Fragment>` and renders nothing at all, which is why the static build stayed byte-identical and `npm run parity compare` passes 10/10 with the feature installed. The `pageBuilder` arrays gained a shared grouped, searchable insert menu (`SECTION_INSERT_MENU` in `sections.ts`), which is the menu that opens **in the canvas** when an editor inserts a section. The seeded in-Studio guide gained a Preview map row, two how-tos and a tip covering all of it.

---

_2026-05-30 — Forked from the Reid Design build; genericized to the ncs-astro-sanity-starter (core foundation + opt-in module library + bootstrap docs). Future projects start their own history from this entry._

---

_2026-06-12 — Audit-driven hardening + UI component stack + CI (U1-U10)._

- **Structured data genericization.** Replaced client-specific nouns in JSON-LD, OG, and page copy with generic tokens. `businessType` field on `siteSettings` drives the schema.org `@type` value.
- **Robots + RSS endpoints.** `src/pages/robots.txt.ts` generates allow-all + correct sitemap reference at build time; `src/pages/journal/rss.xml.ts` wires `@astrojs/rss` for the journal feed.
- **Accessibility fixes.** Skip-link, aria labels, color contrast, heading hierarchy, and keyboard-nav passes across all section components.
- **Module query fixes.** Co-located query files for all 13 modules audited and corrected; module routes verified against `siteSettings.sectionVisibility` toggles.
- **apply-brand hardening.** `--check` flag (dry-run diff mode), `brand.config.schema.json` validation, `--radius` knob for border-radius token, `workerName`/`domain` field coverage, print footer rewrite. `docs/brand/` is current.
- **CI + lint + 79 tests.** `.github/workflows/ci.yml` mirrors the local gate (`npm run check`): typegen, site build, Studio build, all tests. `npm run check` is the canonical one-command pre-commit gate. New scripts: `lint`, `lint:fix`, `format`. Test suite expanded to 79 tests across 6 files in `src/lib/` (adds `scriptAccent`, `slugify`, `sectionVisibility`, `utils`).
- **UI component stack.** `src/components/starwind/` (Astro-native accordion, dialog, dropdown, tabs primitives). `src/components/primereact/` (PrimeReact escape hatch with `PrimeIsland.tsx` wrapper). Magic UI token audit applied. `docs/agent/component-sources.md` added (shadcn, Radix, Vega, Starwind, Magic UI, PrimeReact sourcing guide + token-remap cheat sheet).
- **Four new page-builder blocks.** `faqSection` (inline FAQ accordion, SELF_CONTAINED, references `faqItem` docs), `logoStripSection` (client/partner logo row or grid, SELF_CONTAINED), `embedSection` (sandboxed iframe/URL embed for Calendly/Tally/etc., SELF_CONTAINED), `teamSection` (inline team member grid, SELF_CONTAINED). Block library grows from 17 to 21 total (11 general + 10 rich).
- **Schema flexibility.** `businessInfo` gains `businessModel` (`'in-person'`/`'remote'`) and `additionalLocations`. `siteSettings` gains `socialLinks` structured array (supersedes legacy flat social fields). `faqCategory` document type added; `faqItem` gains `categoryRef` reference field.
- **Three new modules + virtual-services rename.** `events`, `donations`, `team` modules added (routes: `/events`, `/donate`, `/team`). `e-design` module renamed to `virtual-services` (route: `/virtual-services`). Total modules: 13.

---

_2026-06-12 — Page-builder-first upgrade (A through D)._

**A -- Page-builder core.** `studio/schemaTypes/sections.ts` defines 9 general block types (heroSection, richTextSection, imageTextSection, gallerySection, quoteSection, statSection, ctaBandSection, videoSection, spacerSection), a `SECTION_TYPES` constant as the single source of truth, and `additionalSectionsField` as an append zone any page can import. `src/components/SectionRenderer.astro` maps each block `_type` to a component and owns the alternating-surface cadence (logic extracted to `src/lib/sectionCadence.ts`, unit-tested; blocks carry no color field). A custom `page` document type gives editors free-form pages served by `src/pages/[slug].astro`. Reserved-slug guard lives inside `getStaticPaths` (Astro isolated-scope requirement); shared list at `src/lib/reservedSlugs.ts`, unit-tested. `businessInfo` singleton split out of `siteSettings` (service areas, travel, availability, geo); `getSiteSettings()` merges them back under flat names. GROQ `sectionsProjection()`, `getPage`, `getAllPageSlugs`, and `getNavPages` added to `src/lib/queries.ts`.

**B -- Section-driven core pages.** `studio/schemaTypes/richSections.ts` defines 8 rich section types (founderSection, servicesGridSection, testimonialsSection, storySection, valuesSection, processSection, serviceAreaSection, guaranteeSection) and per-page curated lists. The home, about, services, and process pages now hold a `pageBuilder` array (their old structured fields are hidden + readOnly for rollback); all four routes render via `<SectionRenderer>`. `src/data/defaultSections.ts` holds code-defined default section arrays so a fresh clone with no Sanity project still renders non-blank. The process page graduated from a module into core. `scripts/seed-core.mjs` seeds the `pageBuilder` arrays.

**C -- Modules (lean).** The 9 feature modules (portfolio, shop, e-design, gift-certificates, press, resources, lead-magnets, style-quiz, budget-calculator) ship built and OFF under `modules/`. Enabling is now copy-a-folder: each module's query functions live at `modules/<name>/src/lib/<name>Queries.ts`, so there is no hand-pasting into core `queries.ts`. `siteSettings.sectionVisibility` toggles each. Offering pages (e-design, gift, press, resources) stay fixed-order by choice.

**D -- Brand reskin system.** `brand/brand.config.json` is the single source of truth (identity + palette + fonts + logo paths). `npm run apply-brand` (`scripts/apply-brand.mjs`) deterministically and idempotently rewrites `globals.css` tokens, `src/data/site.ts`, `studio/sanity.config.ts`, OG inputs, and font imports, then regenerates the OG image. The `/reskin` Claude skill (`.claude/skills/reskin/SKILL.md`) orchestrates the full rebrand: interview, font package install, apply-brand, WCAG AA contrast check, visual check via defaultSections, copy retone, and human checklist.

**Verification baseline after this upgrade:** `npm run build`, `npm run typegen`, `npm test` (22 node --test unit tests for sectionCadence + reservedSlugs), `npm --prefix studio run build`. Live Playwright screenshots and actual seed runs require a connected Sanity project.*

---

_2026-08-27: This starter becomes the library of record for the site family._

Six canonical files were installed at their natural paths, each carrying a first-line
`PORTABLE:` marker naming this repo as the library of record: `scripts/with-workerd.mjs`
(Windows workerd wrapper, a no-op until the Astro 7 / adapter 14 upgrade),
`scripts/free-dist.mjs` (releases a stale dev server's handle on `dist/`, genericized so
a copy needs no edit in any repo), `scripts/page-parity.mjs` (rendered-HTML parity
harness, parameterized to auto-detect `dist/client` versus `dist` and to auto-discover
its routes), `scripts/lib/sanity-lib.mjs` (seed/patch plumbing: dry-run-by-default apply
gate, Portable Text builders, idempotent asset uploader, reconciled onto the existing
`scripts/lib/loadEnv.mjs` rather than carrying a second env parser), `src/lib/contrast.ts`
(WCAG contrast math), and the new `scripts/sync-check.mjs` (the drift check itself).

`src/lib/theme-tokens.test.ts` applies contrast.ts to this repo's own `@theme` palette,
so a reskin that pushes body text under 4.5:1 fails `npm test` instead of shipping.
`.github/workflows/ci.yml` gained the stale-types guard: CI regenerates the Sanity types
and fails if the committed `src/lib/sanity.types.ts` differs. New npm scripts: `parity`,
`sync-check`, `free-dist`. Parity baselines for the nine built routes are committed in
`scripts/.parity/`, proven by a build, capture, rebuild, compare cycle at 9/9 PASS.

`PORTS.md` was created with fifteen port cards and the applied-to matrix. See the
[Library of record](../../.claude/rules/library-of-record.md) rules file (split out of CLAUDE.md) for the working rules, above
all the docs-in-sync clause: an improvement that generalizes gets a card in the same
commit that generalizes it.
