# Change history

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
