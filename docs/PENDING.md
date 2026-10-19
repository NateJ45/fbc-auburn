# PENDING.md - open loops in this repo

Created 2026-08-28 (PORTS.md card 15). This is a **registry, not a narrative**: every
entry is a live open loop with its blocker, and it is edited in the same commit as the
thing it tracks. When an item closes, delete it and note the closure in
`docs/agent/changelog.md`, which is the prose ledger.

Read this early in a session. The point is that a new session inherits the queue instead
of rediscovering it.

Related registries: `PORTS.md` (what is shared with the rest of the site family, plus the
applied-to matrix and `npm run sync-check`), `docs/agent/changelog.md` (what happened, in
sequence).

---

## Waiting on a human

### 1v. Card 127 (the email backbone): a real send, and the Studio buttons signed in (opened 2026-10-18)

**Blocker: a sending domain and a signed-in Studio.** Unit-tested on real SQLite and exercised under `wrangler dev` with
a local D1 and the local `send_email` binding (OPERATIONS.md "Email"). Not yet seen: an email arriving through Resend
or Cloudflare (and how Gmail and Outlook show the template in dark mode), "Send a test to me" and "Send to everyone"
pressed signed in, the RSVPs tool and its CSV opened in Excel, Home's Newsletter card with real numbers, and the
List-Unsubscribe one-click button in Gmail.

### 1. Verify the live preview against a real Sanity project

**Blocker: this template has no Sanity project, by design.**

The 2026-08-28 upgrade installed the whole preview stack, but a template cannot prove the
half that needs credentials. What WAS verified here: the build, the embedded Studio
mounting in a real browser, `/preview/live` returning 403 without the Studio cookie, and
every preview entry point failing closed with a 503 that names the missing configuration.

What is still unproven, and what a fork should check on its first real project:

- `/preview` renders a draft page (a builder page in full fidelity, a bespoke page as its
  editable surface with the note).
- `/api/draft-mode/enable` returns **401** on a bad secret and sets the cookie on a good
  one. (With no project configured it cannot get that far and returns 503 instead.)
- Click-to-edit opens the right field, and no enum-driven block takes the wrong branch
  (that would mean a missing name in `NON_STEGA_FIELDS`).
- The in-canvas section controls appear on hover: insert before/after through the grouped
  menu, duplicate, remove, drag to reorder.
- An edit in another tab reaches the preview through `/preview/live` without a reload.
- **The floating controls from PORTS.md card 28** (added 2026-08-28). These are the least
  provable part of the stack, because every one of them needs a resolver context the host
  only builds against a real schema:
  - clicking a heading on a text block, CTA band, services grid, testimonials or FAQ
    section shows "Accent a word", and clicking a word in the card sets `headingAccent`
    in the draft (the Studio's unpublished-changes badge should move);
  - clicking the same word again clears it;
  - clicking a subhead on any of the six twin-carrying sections shows "Edit here", the box
    is seeded with the plain string, and the B / I buttons store `strong` / `em`;
  - pasting a styled paragraph out of a word processor into that box keeps only bold and
    italic and drops fonts, colours and tables;
  - the card survives the pointer travelling to it (see the own-open-state rule on the
    card) and closes on Escape, on Save, and on a click outside;
  - Ctrl+Z in the Studio undoes what the card wrote (card 27).

Whoever does this first should report back so PORTS.md cards 10 and 28's starter cells
carry a verified-in-anger note rather than an installed-and-gated one.

---

### 1a. Drive an in-canvas control on the phase-2 Sanity set until it writes back

**Blocker: the write lands in the church's real dataset, so it needs their say-so.**

2026-10-17 moved this site onto the family's phase-2 Sanity set (`sanity` 6.19.0, `@sanity/ui`
4.4.9, `@sanity/icons` 5.2.3, `@sanity/client` 8.9.0, `@sanity/visual-editing` 6.1.3; the starter's PORTS.md
card 103). The signed-in Studio was checked in a browser against this site's own project the same day: on
`astro dev` the desk, the help and overview panels and a page document; on the built site
under `wrangler dev`, Presentation with the preview iframe, `/preview/live` connected, stega present and the
overlay box drawing. All with a clean console. What is still unverified is an in-canvas control (the text
popover or the heading accent picker) writing a change back, because that leaves a draft in the church's
dataset. Do it once with the church's content in place, then close this item.

### 1b. Run `npm run cutover --write` against a real zone, once

**Blocker: this template owns no domain, and the one real cutover predates the script.**

Added 2026-09-18 with PORTS.md card 48. `scripts/cutover.mjs` generalises the
stonesteps50k.com move from GoDaddy to Cloudflare, which was done by hand that morning:
every API call in the script is one that was made, in that order, and worked. What has
NOT happened is the script itself making them.

What IS proved here: the whole dry-run path against a fake domain, and the zone audit
against `scripts/fixtures/godaddy-zone-export.txt`, which carries every fault the real
export had (25 unit cases in `src/lib/zone-audit.test.ts`).

What the next client's cutover should confirm, in order, and note here:

- The zone create returns nameservers and the script prints them before anything else.
- The import POST accepts the cleaned file, and the resulting record set matches the
  audit's `import + rewrite` count exactly.
- The script refuses to import over a zone that already holds records.
- With the zone still `pending`, step 3 stops and says nothing below was attempted.
- After the nameservers move: both custom domains attach, the redirect rule lands in the
  `http_request_dynamic_redirect` phase, and the four TLS settings read back.
- A second `--write` run is a clean no-op, with a printed reason on every step.
- The verify table: apex 200 with the title, www and http 301, MX still resolving.

Read the plan line by line before passing `--write`. The blast radius is a client's live
domain and their mail.

---

### 1c. Finish the reskin: the rest of the mockups

**Blocker: none; queued work.** The pick is recorded (A blended with B and C). The first pass
(2026-10-17) brought in the palette, Young Serif + Familjen Grotesk, Auburn Stone and
`StoneHeading.astro`, the logo and favicons, the arched hero (`ArchHero.astro`, Home masthead
and inner pages), red sentence-case buttons, the light closing band with the mark, stone
dividers, the "Off the path" 404, and church copy on Home, About, Contact, FAQ, Journal and the
404 (in Sanity and in
`src/data/defaultSections.ts`). The design source is the studio's static mockups (8 pages and a
404). Still to build, roughly in this order:

- DONE 2026-10-17: the stepping-stone rail (`stepsRailSection`, on Home as "A Sunday with us") and
  the Plan your visit timeline, which is the "Walk in with us" block (`walkSection`: each stop
  carries its time). Both in `auburnMotionSections.ts`; detail in `docs/agent/animation.md`. Plan
  your visit is a Studio page (`page-plan-your-visit`), and every built-in "Plan your visit" button
  goes to /plan-your-visit/.
- DONE 2026-10-17: "Cards with stone icons" (`iconCardsSection`), "This week" (`thisWeekSection`,
  wraps `ThisWeekList`) and "Watch" (`watchSection`, wraps `LastSunday`) blocks, in
  `src/sanity/schemaTypes/auburnSections.ts`; a stone-icon picker on the hero (`icon`, already on
  `NON_STEGA_FIELDS`; the list is `src/lib/stone-icons.ts`); Studio pages What we believe,
  Leadership, Ministries and Watch in Sanity; Home uses the cards, Watch and This week blocks.
  Studio pages also accept the team grid, FAQ and dynamic list blocks.
- DONE 2026-10-17: the Menu (a full-screen panel at every width, the header shows the first four
  links) and the footer columns in Site settings; the contact form is a visit form (editor-written
  questions in the Contact page; `?visit=sunday-11` pre-fills it).
- DONE 2026-10-17: the motion layer and "Walk in with us" (`src/styles/motion.css`,
  `src/scripts/motion.ts`): reveals, the rail, the mark building itself with wave drift (About,
  "The story in our mark"), the baptism ring and ripples, the background path, stone dividers and
  nav stones. Waiting on the church: a rough plan of the building (which door guests use, where
  the fellowship hall, children's room and sanctuary are). Until then the Walk's drawing is
  placeholder geometry in `src/lib/walk-plan.ts` (ROOMS, STOPS, ROUTE); only those change.
- Still open: Events in the menu once the church's Church Trac links exist; Give is in the menu
  (2026-10-17) but goes to Contact until there is a giving link (swap it in Site settings >
  Navigation); the deacons' team grid once names and permissions exist.
- Waiting on Pastor Jacob (Home, 2026-10-17): the four "Your first Sunday" steps (Studio: Home,
  Your first Sunday). Their words only restate what the site already says; he confirms or
  rewrites them, and can add a place to each step ("Fellowship hall"). Also optional and his to
  fill: "How to find us" (Site settings > Church facts > address; parking, which door), and
  "Last Sunday's message" on the Watch block after each Sunday (title, passage, date, video
  link), which names the message on Home for 8 days. A one-line belief statement on Home (a
  "Who is Jesus?" door, as All Souls does) is his to write if he wants it; nothing is built yet.
- Waiting on Pastor Jacob: a head-and-shoulders photo for the round portrait beside his signature
  in Who we are (Studio: Home, Who we are, "Photo of who signed it"; square, 600px or more).
- DONE 2026-10-17: board E on Home (decision in the directions README), replacing the bold pass's
  full-height ribbon: the lockup hero, the This Sunday card, the generated stone path, Through the
  week, Who we are, This week and Last Sunday, Other ways in, the ink footer and the header's
  Sunday note. Built by `src/components/home/HomeBoard.astro`; data change
  `scripts/content/home-board-e.mjs`.
- Photos: Home uses four STOCK stand-ins from Unsplash (free licence; each asset's `source` field
  holds its Unsplash id): the church, the embrace and the shared meal in Who we are, and the Last
  Sunday poster. Each carries a "Stand-in photograph" caption, derived from that `source`, which
  goes by itself when a real photo is uploaded (Studio: Home, then the block). Replace them from the
  photo session before launch.
- Waiting on Pastor Jacob: his welcome for Who we are. The note reads "[Two or three sentences of
  welcome in Pastor Jacob's own words.]" until he writes it (Studio: Home, Who we are, Text).
- Waiting on the church: a Give link (the Give card goes to Contact until there is one) and the
  social links for the footer's Follow column (Site settings; the column hides while empty).
- Inner pages are on board E's grammar (2026-10-17): white ground, stepping-stone rules, one left
  edge, no arch. Still open there: the empty picture slots (Serving our neighbours, Bringing
  children) wait on the photo session, and the faint background path from the motion layer is
  hidden on these pages (`board.css`); bring it back only if Nathan wants it under the white.

Service times, the 1959 founding and Hebrews 13:8 are still unconfirmed with the church; copy
marks them "to be confirmed". Since 2026-10-17 the facts themselves live in Site settings > Church
facts with `confirmed` flags, and the drop-in components in `src/components/church/` draw them with
the "To confirm" tag (`docs/agent/church-data.md`). Use those components when building the This
week list, the Watch band and Plan your visit. The prose in `src/data/defaultSections.ts` and in
Sanity page copy still types the times as words; when a section is rebuilt, put `ThisSunday` or
`ServiceTimes` there instead of a sentence with a time in it.

### 1e. The pastor's Studio login (the publish webhook is done)

**The webhook is live (2026-10-18):** a publish starts a Deploy run within seconds, tested end to end
(two publishes, two green `repository_dispatch` runs, the page live at the next build).

**Blocker: Nathan (a Sanity invite).** Invite Pastor Jacob to the Sanity project (Editor role), and once he accepts, add his user id
to `staff` in `src/sanity/kit.config.ts` so he gets the staff view (no permanent delete).
The webhook's filter (OPERATIONS.md) skips `studioWeek`, the Home checklist's weekly tick document (card 111),
so ticking a box does not rebuild the website.

### 1k. Two secrets for "the Studio remembers" (opened 2026-10-18)

**Both secrets are set (2026-10-18).** `/api/studio/deploy-status/` answers `configured: true, state: ok`, and a
manual run of "Publish scheduled drafts" passed its gate and reported "nothing scheduled is due". What is left here
is the signed-in checks below. The two secrets, for reference:

1. **`SANITY_API_WRITE_TOKEN`**, a GitHub Actions repo secret: a Sanity token with the **Editor** role (sanity.io/manage,
   project `wdpzvn6m`, API, Tokens). Turns on scheduled publishing ("Publish automatically at"), which now runs every
   half hour and starts a deploy after it publishes. Steps: OPERATIONS.md, "Scheduled publishing".
2. **`GITHUB_DEPLOY_TOKEN`**, a Worker secret (`npx wrangler secret put GITHUB_DEPLOY_TOKEN`): a fine-grained GitHub
   token on `NateJ45/fbc-auburn` only, **Actions: Read and write**. Turns on "The last update didn't go through" and
   Try again in the Studio. Steps: OPERATIONS.md, "When an update does not go through".

A first signed-in walkthrough ran on 2026-10-18 (Home, the checklist, the template and section pickers, saved
sections, the Sermons, People and Downloads panes, Quick update, Checkup, Site Guide; fixes in #50 to #52), and
Home and Quick update were checked signed in at 390px (no sideways scroll). Still to check, signed in: a hand tick on the Sunday checklist saves and the
list is fresh next Monday; the Quick update tool at 375px on a phone (each of the three forms publishes, the notice
shows on the site after the deploy); a scheduled draft publishes itself and a Deploy run follows; an empty list (for
example Question groups, if it is empty) shows its note and "Create the first one"; and, once a deploy fails for
real, the red line, the `deploy-failed` issue and Try again. Also run `npm run restore:doc -- <some id>` dry once
against a real backup artifact (needs `BACKUP_PASSPHRASE` and the write token in `.env`); it has only been
unit-tested.

Alt text is now required on every content photo (2026-10-18). Existing published photos with no description stay
live, but the next edit to their document will not publish until the description is filled in; the Checkup's "pictures
with no description" lists them.

### 1l. Visitor numbers on Home, and the Home dashboard signed in (opened 2026-10-18)

**Blocker: Nathan, about fifteen minutes in the Cloudflare dashboard.** PORTS.md card 115 gave Home a Visitors card
reading Cloudflare Web Analytics through `/api/studio/visitors/` (signed-in Studio members only). It says "Not set up
yet" until all of this is done, in order (full steps: OPERATIONS.md, "Visitor numbers"):

1. Turn on Web Analytics for `fbc-auburn.nathanjnixon86.workers.dev` (Analytics & Logs, Web Analytics, Add a site,
   manual JS snippet) and set its beacon token as the repo variable `PUBLIC_CF_ANALYTICS_TOKEN`. Nothing is counted
   until the next deploy after that. Redo this at cutover for the church's own domain.
2. **Done 2026-10-18:** `CF_ACCOUNT_ID` and `CF_WEB_ANALYTICS_SITE_TAG` are in `wrangler.jsonc` `vars` (the site tag
   is the Web Analytics site id from the dashboard's edit URL). If the card says "could not load" with the token set,
   check this id against the `siteTag~in=` value in the site's Web Analytics address bar first.
3. Create a Cloudflare API token, Custom, one permission: **Account, Account Analytics, Read**, on this account only.
   `npx wrangler secret put CF_ANALYTICS_TOKEN`, paste, and keep a copy in 1Password.
4. Deploy and look at Home: compare "visits in the last 7 days" with the Web Analytics dashboard. The GraphQL field
   names came from the dashboard's own query and have not met a real token yet; if the card says "could not load",
   `npx wrangler tail` shows Cloudflare's answer.

Also still to see signed in, light and dark, 375 and 1280: the dated greeting and the "Need help?" line; Coming up with
a real scheduled draft (and its empty sentence); the Fix-it list (each Edit opens the right field); Your pages (every
link opens the right form or list, and Give opens the online giving link); and a guide with a `video` once one exists.

### 1m. Studio workflow tools: two settings and the signed-in checks (opened 2026-10-18)

**Blocker: Nathan.** Two things only Nathan should do:

1. `npx wrangler secret put SHARE_PREVIEW_SECRET` (32+ random characters; OPERATIONS.md, "Studio workflow tools").
   Until then "Share a preview" says links are not set up, and `?share=` is ignored.
2. Add `"previewShare"` to the publish webhook's deny-list (sanity.io/manage, API, Webhooks; the filter is in
   OPERATIONS.md). Without it, making or stopping a preview link starts a deploy.

Also: make sure the people who should get the morning change note watch `NateJ45/fbc-auburn` (All Activity, or
Custom with Issues). Messages needs the forms on (item 1h) and `migrations/0003_message_status.sql` applied remotely.

Still to check, signed in: make a link, open it in a private window (the draft, the banner, no Exit button), stop it,
reload (the published page); Messages against a local D1 with a real Studio session; each table view sorting and
Open; the first real change-note issue. Unit-tested and checked under `wrangler dev` signed out so far.

### 1d. Church data waiting on the church

**Blocker: answers from the church, after signing.** All empty-safe today; each lights up with one
edit in Site settings > Church facts, then a publish.

- Tick `confirmed` on the address, each service time and the founding year once the church
  confirms them (the tags disappear and the confirmed address joins the JSON-LD).
- The church phone (Identity & contact > Phone) and `phoneConfirmed`; there is none on file.
- The church email (Identity & contact > Public email) and `emailConfirmed`; none on file, so no
  mailto: shows anywhere yet.
- The Facebook page (Social & footer > Social links, platform Facebook) and, if it differs, the
  Church facts `liveStreamUrl`. Until one is set, /watch/ and the footer have no live link and the
  Home "Live now" card still goes to /watch/ (visitor audit, 2026-10-18).
- `givingUrl` once online giving exists (Church Trac); until then Give opens /give/.
- Optional `churchAddress.lat` / `lng` for the JSON-LD map pin.
- The contact form's transport: the privacy policy (2026-10-18) describes the intended setup, the
  message kept in the site's D1 database and emailed to the church, but `wrangler.jsonc` binds
  neither `CONTACT_DB` nor `EMAIL` yet. Wire both before launch, or reword the policy.
- The Home "Other ways in" Give card still links to Contact: a `ctaBlock` has no typed-path link
  type, so it cannot point at /give/ without a Give page document. Repoint it in the Studio once
  `givingUrl` is set (external link), or add a Give page document.
- The YouTube channel id, if the church streams there (the Watch band shows its fallback until
  then). If the public feed proves flaky, port First Baptist Muncie's Data API reader
  (`youtube-feed-api.ts`, needs a key).
- The Church Trac calendar's iCal link (Calendar > Share), which fills This week with events and
  adds the "Full calendar" link.
- Set Identity > business type to Church when the Studio kit allows it; the JSON-LD still says
  `LocalBusiness` with the starter's `priceRange`.

### 1d. Studio kit: the parts not built yet

(Since 2026-10-17 the kit files are the starter's PORTABLE copies, PORTS.md card 106: build the rest starter first.)

**Blocker: mixed; queued work plus three things only a person can supply.** The kit's first part landed
2026-10-17 (`docs/agent/studio-kit.md`): Home, Site Guide, Checkup, the staff view, Trash, the note after Publish
and the tour, checked signed in at `/studio` in light and dark. Still to do:

- **Nathan to review the new stone icons; alternatives in the overnight scratchpad.** Eight icons (guide, page, camera, home, eye, search, link, checkup) are in `brandIconArt.tsx`.
- **The editor's Sanity user id in `kitConfig.staff`** once he has accepted the invitation. Until then the staff
  view goes by role, and he is an administrator, so he would see the full Studio.
- **`PUBLIC_STUDIO_HELP_EMAIL`** as a build variable (`.env` and the deploy workflow) so Home's Ask card shows its
  email button.
- **The rest of the Worker half**: the Ask form through Cloudflare Email Sending once the church's domain is on
  Cloudflare, an external link check, and the monthly report with its cron. `src/lib/studio-auth.ts` and deploy status
  landed with card 111 (item 1k); visitors (Cloudflare Web Analytics, not GA4) with card 115 (item 1l).
- **The live publish checklist** (a document inspector, plus "Publish anyway" for blocking items).
- **Tutorial videos**, recorded at the end of the site build once the Studio stops changing. The slot is built (card
  115): add `video: '/guides/<slug>.mp4'` (a file in `public/guides/`) or a YouTube/Vimeo link to a guide in
  `src/sanity/guides/content.ts`, and it shows under "Watch how it is done" on Home and in the Site Guide.
- **Guide recipes in the church's own jobs** (sermons, events, the bulletin) as those features land; the guides
  are still the starter's generic set.
- **The signed-in Studio at 375px**: checked 2026-10-18 at 390px in a frame (Home and Quick update fit, no sideways
  scroll). Submitting a Quick update form on a phone is still untested.

### 1g. The church-speaking Studio: the signed-in click-through (opened 2026-10-18)

**Blocker: needs a signed-in Sanity session.** The 2026-10-18 Studio wording pass (changelog) passed
typegen, check, build, the unit tests and parity, and the Studio login screen loads with a clean
console, but nobody has opened the signed-in desk yet. Check: Content opens on "Our church at a
glance" (service times, address, "To confirm" flags) and "Brand colors and fonts"; there is no "Help
& Guide", "Start Here" or "Business info"; Pages lists Questions, News and notes (the list page) and
Page not found; Content lists Question groups, Questions and Notices; the "+ Add item" menu has no
founder, story, service area, guarantee or logo strip block, and its groups read "Voices and numbers"
and "About the church"; the Site Guide shows icons, not emoji; Site settings has no Reviews tab, and
"Parts of the site" shows only News and notes. Also still open: the `studioGuide` document (the
starter's old handbook, full of business text) is unshown but still in the dataset; retire it the same
way as `studioNotes` if nobody wants it, and the starter-side leftovers listed in the changelog entry.

### 1f. Authoring kit and branded Studio: the signed-in click-through (opened 2026-10-18)

**Blocker: the pastor's Sanity login (1e), then about 20 minutes with him or Nathan signed in.** PORTS.md cards
109 and 110 landed together on branch `feat/authoring-kit`: page templates (Simple page, Ministry, Event, Sermon
series, Blank page), the picture grid in "+ Add item" (thumbnails shot in Auburn's brand), saved sections that hold
several sections and go in as a copy or synced, page-builder warnings, the Studio's name, stone mark and navy accent,
the status line under the top bar, "Help for this page" and Home's quick actions. Checked so far: types, build, unit
tests (the colour gate included), and the `/studio` login screen in light and dark with a clean console. Nobody has
signed in to it yet. Signed in, in light and dark, check and screenshot:

- Make a page from each template under Pages, then Custom pages. Every "Example:" line shows a yellow warning until
  it is replaced; nothing blocks Publish.
- "+ Add item" opens on the picture grid, Auburn's blocks included; the list view and search still work. Do the same
  from the in-canvas insert menu in Live preview.
- Save a section, add two more to it under Pages, then Saved sections, publish it, and insert it on a page as a copy
  and as synced; change the saved section and check the synced page follows after a rebuild. Try it in an Extra
  sections zone (Contact, FAQ, News and notes, Privacy) too.
- Home: the greeting, and each of the four quick actions opens the right place ("Name last Sunday's message" lands
  on the home page's sections, "Change the service times" on Church facts, "Add a page" on Custom pages, "Edit the
  menus" on the Navigation tab). Fix any target that lands wrong in `kit.config.ts`.
- The status line under the top bar (needs the deployed `/build-info.json`), "Help for this page" on the home page,
  Site settings and a custom page, and the amber "Shown on every page" in Live preview on Site settings.
- Primary buttons, links, focus rings and the selected desk row are navy; Publish is still green.
- Read the console on every screen. Close this item when it is clean.

### 1l. The Studio look: the signed-in check (opened 2026-10-18)

Starter PORTS.md card 116, branch `feat/studio-branded-look`. Checked so far: the colour gate, types, build, and the
`/studio` login screen in light (with the computer set to dark) and dark at 1280 and 390, Young Serif and Familjen
Grotesk loaded; the top bar and the editor typography were checked in a throwaway page that renders the same themes,
not in the signed-in Studio. Signed in, in light and dark, check: the top bar in navy (tool tabs, search, the user
menu and its Appearance switch, the status line under it); a News post body and a rich text section showing body,
H2, H3 and a quote in the site's fonts, the style menu readable, list bullets lined up; Publish green and readable.
Known, Sanity's own: on the login screen the small "Sanity" wordmark follows the computer's setting, not the Studio's,
so with the Studio light on a dark-mode computer it is white on cream. Not fixable without styling Sanity's internals.

### 1n. Home's banner: the signed-in check (opened 2026-10-18)

Starter PORTS.md card 118, branch `feat/studio-home-banner`. Checked so far: unit tests, types, build, and the banner
in a throwaway page with the real Studio theme, light and dark, 1280 and 375 (mark on its disc, the stone path, the
name in gold, "Auburn" in Auburn Stone, no sideways scroll). Signed in, check: the banner sits under the navy top bar
as one colour, the pastor's real first name shows, and View the website opens the live site in a new tab.

### 1o. Stone icons and list-row pictures: the signed-in check (opened 2026-10-18)

Starter PORTS.md card 119, branch `feat/studio-brand-icons`. Checked so far: unit tests (every document type has an
icon meaning and a preview), types, build, and Sanity's own preview rows plus every icon at 16, 20 and 24px in a
throwaway page with the real Studio theme, light and dark. Signed in, check in light and dark at 1280 and 375: the
desk items and the Sermons, People, Downloads and News lists with their tiles; a sermon with a photo beside one
without; the field-group tabs (Church facts with the clock); the create menu and page templates; and the tools' stone
icons in the phone sidebar.

### 1p. The Studio's edges: the signed-in check (opened 2026-10-18)

Starter PORTS.md card 120, branch `feat/studio-edges`. Checked signed out under `astro dev` and `wrangler dev`: the
tab says "First Baptist Church of Auburn" with the church's icon from the first byte, the splash (mark, name in Young
Serif, the stone path) shows on the paper or the dark ground before the Studio loads, light and dark, 1280 and 375,
throttled; the sign-in card reads "Sign in to update the church website"; `#/structure` and `#/presentation` links
keep their place. Signed in, check: the white "First Baptist / Church of Auburn" wordmark beside the square icon in
the navy bar (gone on a phone), the user menu's "Invite someone from church to edit" and "Manage who can edit", and
Presentation opening a page.

### 1q. Card 121 (custom code): the signed-in Studio checks (opened 2026-10-18)

Unit-tested (`custom-code.test.ts`, the two Checkup rules in `studio-checkup.test.ts`), proved in Playwright
(`tests/custom-code.spec.ts`: the boxed probe cannot read `parent.document`, the page's localStorage or cookies; the
on-page probe can), and seen under `wrangler dev` with the site fonts loading in the box, light and dark, 375 and 1280. Not yet seen signed in: the monospace code box and its count, the warning under it, the switch appearing only
once there is code, Site settings' "Code on every page" tab, both Checkup findings opening the right field, and the
boxed frame in Presentation.

### 1r. Card 122 (hidden and password pages, link checks): secrets and the signed-in checks (opened 2026-10-18)

Built and tested locally (unit tests, the static half of `tests/private-pages.spec.ts`, the Worker half against
`wrangler dev` with the fixture page). Waiting on a human:

- [ ] `npx wrangler secret put PRIVATE_PAGE_SECRET` (32+ random characters). `SANITY_TOKEN` is already set for the
      preview. Until then `/private/<slug>/` says "not ready yet".
- [ ] Repo secret `SANITY_API_WRITE_TOKEN` (if not already there) so the Monday link check saves its report for the
      Checkup.
- [ ] Add `"privatePage"` and `"linkReport"` to the publish webhook's deny-list (OPERATIONS.md).
- [ ] Signed in: make a page from Pages, Private pages (password); check its id starts `privatePage.` (draft and
      published), set a password, publish, open `/private/<slug>/` on the live site in a private window.
- [ ] Look at the new Checkup findings on the real content (links, headings, pages nobody can reach).

### 1s. Card 123 (writing help, Before you publish, AI visitors): the key and the signed-in checks (opened 2026-10-18)

Starter PORTS.md card 123, branch `feat/studio-ai`. Unit-tested, `astro check`, build and `npm test` clean;
under `astro dev` `/api/studio/ai/` answers `configured` and refuses a cross-site POST (403) and a POST without a
Sanity session (401), and the Studio loads with the plugin, signed out, no console errors.

- **Nathan: the Anthropic key.** Make a key for the church site in its own Anthropic workspace, set a monthly spend
  limit of a few dollars there (a description costs about a tenth of a cent, a photo description under a cent), then
  `npx wrangler secret put ANTHROPIC_API_KEY`. Steps: OPERATIONS.md, "Writing help". Until then the buttons do not
  show, which is the intended state.
- **Signed in, light and dark, 375 and 1280:** "Suggest a Google description" on a page, "Suggest a summary" on a
  sermon and a journal post, "Suggest a description of the photo" on a person's photo, "Improve this paragraph" (the
  dialog, Use this on a plain paragraph, Copy on one with a link), and "Before you publish" on a page with a missing
  description and example text, "Show me" opening the field.
- **llms files.** The Checkup will now say 'The summary for AI assistants still has the template's words': `public/llms.txt`
  and `public/llms-full.txt` are still the starter's. Rewrite `llms.txt` for the church before launch and run
  `npm run llms:full`.

### 1t. Card 128 (Studio design language, Site Guide): captures, art, the signed-in checks (opened 2026-10-18)

Unit-tested, checked, built and Playwright-clean, and seen in the dev bench (`/kit-harness/guide/`, `/kit-harness/studio/`) at 375 and 1280, light and dark. Still open: (a) real Studio screenshots for `GuideShot` in place of the wireframe `public/guide-shots/example-editor.svg`; (b) art for the eight guide meanings that have only a placeholder glyph on a stone (the Gemini brief is drafted; liked art goes into Figma as it is); (c) the navbar status line: a signed-in check on the live Studio, since the clipping seen once did not reproduce under mock auth (the text now wraps; ask for a screenshot with the exact width if it persists); (d) the next card: redraw the remaining roughly twenty Studio surfaces from `src/sanity/kit/ui/`.

### 1h. Sermons, people and downloads: the human half (opened 2026-10-18)

- The signed-in Studio click-through of the new desk (the Start here panes, "Add the usual
  groups", the "Add Sunday's sermon" quick action prefilling date and preacher, Help for this page
  on a sermon, the two Checkup rules) has not been done: verified by build, typegen and tests only.
- The pastor adds "Sermons" to the menu himself (the Site Guide says how); menu data was not edited.
- Before the podcast is submitted (OPERATIONS.md, "The sermon podcast"): Site settings needs the
  church email (the feed's owner email; Spotify's verification code goes there) and the Sermons
  page needs a square podcast picture. The production feed today has neither.
- `sermonsPage`, `sermon` and `sermonSeries` have no `/preview/` route, so Live preview opens
  the live address for them (src/sanity/urls.ts) rather than a draft.

---

### 1h. Switch the form builder on (opened 2026-10-18)

**Blocker: Cloudflare resources and secrets only Nathan should create, and Email Sending needs the
church's domain on Cloudflare plus Workers Paid.**

The form builder (Content > Forms, the Form section, `/api/form/`) is built and tested locally
against a local D1 and a simulated email binding, but `wrangler.jsonc` binds neither, so on the
live site every Form section shows "please email or call us instead". The six steps are in
OPERATIONS.md, "Forms": create the D1 database, apply `migrations/` remotely, enable Email Sending,
put `CONTACT_FROM`, `CONTACT_TO` and `FORM_RECIPIENTS` as secrets, uncomment the two bindings,
deploy, send one labelled test and read `notified = 1` back. Close this when that row reads 1.

Also open with it: the church names who forms go to (Site settings > Forms starts with "Church
office" and "Pastor"), and the office hours in Church facts are empty until the church gives them.

### 1i. Section library: the signed-in Studio click-through (opened 2026-10-18)

The 21 new sections render on `/styleguide/sections/` (Playwright: `tests/church-blocks.spec.ts`)
and the schema type-checks, but no one has added each from the "+ Add" menu in the signed-in Studio
yet: check the grid pictures, the plain-English descriptions, the "Who receives it" picker on a form
(it reads Site settings > Forms live), the prayer-form warning, and that a page with a notice or a
countdown publishes and shows on the next build. The Sanity dataset needs no migration: every field
is new and optional.

### 1j. Church page templates and seasonal saved sections (opened 2026-10-18)

**Blocker: the signed-in click-through.** The dataset write is done: the 12 saved sections were
seeded as drafts on 2026-10-18 (`seed-section-patterns.mjs --apply`; a rerun now reports 0 changes).

39 page templates in seven menu groups (`src/sanity/pageTemplates.ts`, shown as "Group: Title")
and 12 seasonal saved sections (`src/sanity/sectionPatterns.ts`) landed on
`feat/church-templates`. Verified by typegen (no change), check, build, unit tests (every template
and pattern: allowed blocks, fresh keys, example markers, copy rules, schema limits, and no page
warning but "example text") and four templates rendered locally at 375 and 1280.

- **Seed the saved sections.** They live in the dataset, so they are offered only once
  `scripts/content/seed-section-patterns.mjs` has run. It creates twelve DRAFT saved sections,
  skips any that exist, and never overwrites or deletes. Dry run (read only, already clean on
  2026-10-18: 12 to create): `node --experimental-strip-types scripts/content/seed-section-patterns.mjs`;
  write: the same with `--apply` and `NCS_PRODUCTION_WRITE=yes`. Then check Pages, Saved sections.
- **Signed in:** make one page from each group, check the "Group: Title" menu reads well, that
  every Example line warns, and that the red "required" boxes left for the pastor (a countdown's
  first day, a progress bar's goal and amount, which form to show) are the only errors. Insert one
  saved section as a copy.
- **Pastor's words:** the Beliefs drafts follow the Baptist Faith and Message 2000 but are Example
  lines for him to rewrite; the State Convention of Baptists in Ohio card is there for him to keep
  or remove.

### 1t. Search and share on real sermons and news (opened 2026-10-18)

**Blocker: the production dataset has no sermons or news posts yet.** Card 126 put visitor search and share buttons
on the site. Verified on a local build of the live content plus a temporary sermon-shaped page (not committed): the
dialog finds pages, the type filters, the date and passage line, the keyboard, axe, the night-menu row, the share links
and Copy link. CI builds without content, so its search tests cover pages only and its share tests find nothing to
check. Once the first sermon and news post are published and deployed:

- Search the live site for a word from the sermon and for its passage ("Romans 8"); the result shows Sermon, the date
  and the passage. Same for a news post (News, the date).
- Under the sermon, the share buttons: Facebook and X open their share pages with the sermon's address, Email opens a
  message, Copy link says "Link copied". On a phone, Share opens the phone's share sheet.
- Build with the public identifiers (`PUBLIC_SANITY_PROJECT_ID=wdpzvn6m PUBLIC_SANITY_DATASET=production npm run build`)
  and run `npx playwright test tests/search.spec.ts`: the share half finds the sermon and news pages by itself.

## Known gaps, deliberately open

### 1u. Section looks and the photo viewer: the signed-in check (opened 2026-10-18)

Built and verified on the built site (PORTS.md card 124): the looks wall `/styleguide/looks/`, the
viewer's keyboard, focus and swipe tests, axe, and parity on the fallback build (no Sanity project in
the worktree, so real pages were not compared). Still to do signed in:

- Open a text block in the Studio, check the **Look** radio shows its three cards with their band
  pictures, pick Feature and then Standard (Standard clears the field), and publish.
- In the preview, pick Feature and Stone on a page and check the band changes without a reload
  (`look` is in `NON_STEGA_FIELDS`).
- On the live site, open a real gallery and a photo section on a phone: swipe, close, and check the
  full-size photo is sharp.

### 2. `npm run parity compare` is not a CI step

The baselines in `scripts/.parity/` are captured on a developer machine, and nobody in
this family has yet proved a Linux CI build reproduces them byte for byte. Parity is a
local gate today; `.github/workflows/ci.yml` carries the reason inline. To close this:
capture on CI once, diff against the committed baselines, and wire the step in if they
match.

### 3. `@astrojs/mdx` is installed but unused

No `.mdx` file exists in `src/` or `modules/`. It is kept because a project may want MDX
for long-form content, and removing it from a template is harder to undo than leaving it.
Drop it during a slop sweep (card 16) if it is still unused then.

### 4. The adapter and wrangler pins are tighter than the bug requires

`@astrojs/cloudflare` is pinned exact at 14.4.0 (with `astro` ^7.4.0 since 2026-10-17, card 97)
and `wrangler` at `~4.129.0` (moved from 14.2.4 and `~4.110.0` on 2026-10-13, card 94, with a
real `wrangler deploy`). Verified that 14.3.4 and 14.4.0 do **not** emit `legacy_env` into the
generated config, so card 14's
original failure does not reproduce here; the pin holds the pair together because the
adapter peers `wrangler ^4.125.0` and every wrangler from 4.126 bundles a miniflare 5 alpha.
Revisit when a newer adapter's peer range and emitted config are both checked by hand
against a real `wrangler dev` and a real deploy.

**Open, card 97 (2026-10-17):** the astro 7.4 / adapter 14.4.0 move was checked with a
`wrangler deploy --dry-run` (exit 0, one `k2` unexpected-field warning) and a local `wrangler dev`,
not a real deploy: this session had no Cloudflare credentials. Do one real deploy to a throwaway
Worker (or watch the first production deploy after merge) before porting it to the sites.

### 4a. Thirty npm advisories, accepted rather than fixed

**Checked 2026-09-18. `npm audit` reports 30: 14 high, 14 moderate, 2 low, 0 critical.**

**Rechecked 2026-10-17, with Sanity phase 2 (PORTS.md card 103): 42 (28 high, 11 moderate, 2 low,
1 critical).** The rise since 2026-09-18 is new upstream advisories, not the upgrade: `origin/main`'s
lockfile the same day (still the phase-1 set) reports 44. Phase 2 removes four (`@module-federation/vite`,
`@module-federation/dts-plugin`, `@sanity/workbench-cli`, `adm-zip`) and adds two CLI-only packages
(`@sanity/cli-build`, `@sanity/runtime-cli`). New since September, and flagged `fixAvailable` without
`--force`: `proxy-addr` (the critical), `compression`, `postcss-selector-parser` and
`@modelcontextprotocol/sdk`, all dev or CLI tooling. A plain `npm audit fix` is therefore no longer a
no-op; take it in its own PR, read its lockfile diff, and run the gates, rather than folding it into
a stack move. The counts below are the September baseline.

**NEVER RUN `npm audit fix --force` IN THIS REPO.** Its offered fix for the Sanity half of
the list is a DOWNGRADE of `sanity` from 6.19.0 to 5.14.1 and of `@sanity/vision` from 6.19.0
to 5.31.2, each across a major version. That takes the embedded Studio back a major line
with it, and the Studio ships with the site, so the damage lands on editors, not on a
developer's machine. It would also downgrade `@lhci/cli` from 0.15.1 to 0.6.1 and push
`wrangler` to 4.135.0, which breaks the pin CLAUDE.md rule 8 exists to hold. The plain
`npm audit fix`, with no `--force`, is harmless and already has nothing left to do.

**Why they are accepted.** Every one of the 30 is in tooling that runs at build time or in
CI. None of it is in the bundle a visitor downloads, and none of it is in the Studio
runtime either: the `sanity` and `@sanity/vision` entries are flagged through
`@sanity/cli`, the command-line package used for `typegen`, `sanity cors` and dataset work,
not through the Studio code the browser loads. The three roots:

- **The Cloudflare build chain, 5 packages.** `wrangler`, `@cloudflare/vite-plugin`,
  `miniflare`, `sharp`, `undici`. Everything here runs on the machine doing the build.
- **The Sanity CLI chain, 13 packages.** `sanity`, `@sanity/vision`, the four `@sanity/*`
  CLI packages, the two `@module-federation/*` packages, `@vercel/frameworks`, and the
  `js-yaml`, `smol-toml`, `adm-zip` and `typeid-js` underneath them.
- **Lighthouse CI, 12 packages.** `@lhci/cli`, `@lhci/utils`, `lighthouse`,
  `puppeteer-core`, `@puppeteer/browsers`, `extract-zip`, `tmp`, `external-editor`,
  `inquirer`, `qs`, `body-parser`, `uuid`. This one only ever runs in
  `.github/workflows/lighthouse.yml`.

**What would actually change this.** Upstream releases, nothing else. The Sanity set moves
as one planned set (phase 2 was taken on 2026-10-17, PORTS.md card 103), which is a
deliberate piece of work and not an audit fix. `wrangler` and `sharp` clear when a wrangler
release inside the `~4.129.0` line picks up a patched `sharp` and `undici`, or when rule 8's
pin is revisited on purpose. Lighthouse CI clears when `@lhci/cli` ships a 0.15.x that drops
the old `puppeteer-core` and `tmp`.

**To check whether anything has changed since this was written:** run `npm audit`. If the
summary still reads 30 with the same 14/14/2 split, nothing has moved and this entry stands.
If the numbers differ, find out which root moved before editing anything, and re-read the
`--force` warning above before touching a dependency.

### 5. Seven eslint warnings, all unused bindings

`npm run lint` is a CI step now (2026-09-06) and exits clean, but it still prints seven
`@typescript-eslint/no-unused-vars` warnings: unused imports in `Footer.astro`,
`richSections.ts`, `structure.ts`, the journal index and a couple of others, plus one unused
`SHOW_THRESHOLD` in `BaseLayout.astro`. Warnings do not fail the run. Triage them in a
slop sweep (card 16); each is either a dead import to delete or a binding that was meant
to be used and is not, which is the more interesting kind.

### 7. Two PORTABLE scripts are excluded from prettier

`scripts/sync-check.mjs` and `scripts/page-parity.mjs` are the only marked files whose
quoting `prettier --write` would rewrite, and reid-design-site, mas-monograms and
presacademy carry them byte-exact. Formatting them here would put four repos into DRIFT
the moment anyone runs `npm run sync-check`. They are in `.prettierignore` with that
reason inline. To close: format them in ONE pass that lands in every repo in the family
at the same time.

### 8. The sibling repos will report DRIFT on the new test files

The family test standard's six canonical files were written here on 2026-09-06
(`playwright.config.ts` and five of the six files in `tests/`). The client repos got the
same standard the same day, but their copies were written against their own sites and
carry different comments and, in `a11y-dark.spec.ts`, an inline `FORM_ROUTES` that has
been moved out to `routes.ts` here. So the first `npm run sync-check <repo>` after this
lands will report DRIFT on those files. That is the library of record working as
designed, not a bug: the next sync session pushes this repo's copies out. Do the sync
before treating any drift report from those paths as meaningful.

### 9. `apply-brand` is not idempotent on globals.css

**Cosmetic, found 2026-09-13, deliberately not fixed in the same commit.**

CLAUDE.md and the script's own header call `apply-brand` idempotent, and semantically it
is: running it twice produces the same STYLESHEET. It does not produce the same FILE.
Running it on this repo, whose globals.css already matches its own brand.config.json,
rewrote 75 lines: single quotes to double on the `@import` lines, and lowercase hex to
uppercase (`#434e5c` to `#434E5C`, because the config stores uppercase). Prettier then
disagrees with the result, so `npm run format:check` fails on a file nobody edited.

That is harmless until somebody runs the script on a project with a clean tree, sees a
75-line diff in the most load-bearing file in the repo, and has to read all of it to
confirm it says nothing. To close: normalise hex case and quote style to what Prettier
writes before comparing, or run the file through Prettier at the end of the rewrite.

### 10. The scaffold is finished (DONE, 2026-09-18)

`faq` and `about` are marked, and so are `testimonials` and `philosophy`, which this item
did not ask for and which a race site or a school wants gone just as much. Seven
capabilities are removable now: `about` (31 files), `faq` (34), `journal` (31),
`philosophy` (16), `process` (29), `services` (32), `testimonials` (21). Each was proven
by running its own removal followed by typegen, `astro check`, build and the unit tests,
and all seven together were proven the same way.

This item's open question was whether re-pointing tests at a section every project keeps
counts as editing tests to suit a tool. It does not, and the reason is worth keeping: in
all three files the faq section was the EXAMPLE and something else was the subject, so
pointing the example at a block nobody removes is a correction, not a concession. The
same turned out to be true of `about`: `storySection` and `founderSection` were the
cadence suite's stand-in CONTENT and SELF_CONTAINED types, and a fork dropping about
would have lost coverage of the cadence itself. Where a section really IS the subject it
kept its name and took a marker.

The seed audit landed with it, along with the modules archive, the reserved-slug
cleanup, and the Studio audit ported from the Stone Steps build.

### 15. Studio app, Post a photo, Earlier versions (starter card 125): switch on and check (opened 2026-10-18)

Built, unit-tested and checked on the build (manifest valid, worker on /studio/ only, offline page, Chrome's
installability check clean). To switch Earlier versions on: the nightly backup running (`sanity-backup.yml` with
`BACKUP_PASSPHRASE`, `SANITY_AUTH_TOKEN` and the `SANITY_PROJECT_ID` variable), the repo secret
`SANITY_API_WRITE_TOKEN`, and the Worker's `GITHUB_DEPLOY_TOKEN` (fine-grained, this repo only, Actions: Read and
write) with `GITHUB_REPO` in wrangler.jsonc. Until then the panel offers "Ask Nathan to restore this". Not yet done:
install it on an iPhone and an Android phone, post a photo from a phone into a gallery and into a News and notes post
(signed in), and one scan and restore round trip on a real page, finished with Discard changes.

### 11. Three things the scaffold work left open

**Queued, 2026-09-18.** None blocks anything; each is a smaller job than it looks and
each is written down because the reason decays faster than the code.

**`dynamicListSection` cannot lose its last source cleanly.** Its four sources (journal,
services, testimonials, faqs) each belong to a capability, and the block itself belongs
to none. Removing all four now leaves a valid build, because the `source` prop widened to
`string` and the GROQ `select()` gained a `[]` default arm, but it also leaves an
editor-facing block whose dropdown offers nothing and which can only ever render empty.
Either the block should become a capability of its own, or the schema should hide it when
its options list is empty. The second is probably right and is a ten-line change.

**Seed markers cannot express a capability inside another capability's page.** Markers
never nest, so the aboutPage seed is `about` end to end including the `valuesSection` in
its pageBuilder, which is `philosophy`. Remove philosophy while keeping about and the
seeder plants a block of a type the schema no longer declares. It is a dataset problem
rather than a build one and the boundary is defended in the file's header, but a fork
doing exactly that combination will see an unknown-type block in the Studio.

**`lighthouserc.json` still says "the nine module routes under modules/".** There are two
staged modules now and eleven archived ones. The file is owned by another agent's wave
(the family test standard, PORTS.md card 35), so the sentence was left alone rather than
edited across an ownership line. One-line fix, next time someone is in there.

### 13. `measure-tap-targets.mjs` reports closed `<details>` content

**Closed 2026-10-04 in the starter (PR: fix/tap-scan-closed-details).** The script now skips anything inside a closed
`<details>` other than its own `<summary>`, with `--include-closed-details` as the opt-out, and
`scripts/lib/measure-tap-targets.test.mjs` pins it; see PORTS.md card 83, "Closed `<details>`". What is left is the per-site
resync only: presacademy, mas-monograms and nixoncreativestudio each carry the previous marked copy and take the new one
by straight overwrite (starter PR first, then the three, in the order in `.claude/rules/library-of-record.md`). Delete this
item once all three have merged. The original report follows.

**Queued, 2026-10-04.** False positive found by the mas-monograms port (PR #72, PORTS.md card 83 lesson 3). Content
inside a closed `<details>` other than its `<summary>` (a mobile filter panel, say) is not rendered, but the script still
reads its geometry and hit-tests it, and the point lands on whatever sits underneath. mas-monograms `/style-gallery/`
reported 68 stolen-tap warnings; with the panel opened it was 0 under 44px and 0 stolen. Teach the script to skip any
element inside a `<details>` without the `open` attribute unless it is that `<details>`'s own `<summary>`, add a fixture
check for it, and say so on card 83. The script is `PORTABLE`, so the order in `.claude/rules/library-of-record.md`
applies: starter PR as a draft first, then the three ported sites (presacademy, mas-monograms, nixoncreativestudio) resync.
Until then, open the panel in the scan or read the list and ignore warnings under a closed `<details>`. Not done in the
2026-10-04 docs PR on purpose: it changes a marked file.

### 6. `docs/agent/` deep-dives still carry client-specific nouns

Flagged in the topic index (now docs/claude/topic-index.md, formerly in CLAUDE.md) since the fork. The 2026-08-28 pass corrected every
stale `studio/` path and every `studio:deploy` instruction in the live docs, but the
examples inside them were not retoned. Trust the patterns; fix nouns when you touch a
file.

### 14. Share images: the styleguide (opened 2026-10-18)

The branded share cards (OPERATIONS.md, "Share images") cover every visitor route. Two loose ends:
`/sermons/` and `/bulletin/` have cards (2026-10-18); a sermon or series page shares its own
picture or YouTube thumbnail and falls back to `sermons.png`, so there is no card per sermon. The
one left: the four noindex `/styleguide/` pages point at `/og/styleguide*.png` files that do not exist (harmless,
nobody shares them; a `STATIC_ROUTES` row each, or leave them).
