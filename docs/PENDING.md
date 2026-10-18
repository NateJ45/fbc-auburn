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
`astro dev` the desk, Help & Guide, Start Here (overview and brand kit) and a page document; on the built site
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

### 1e. The publish webhook, and the pastor's Studio login

**Blocker: Nathan (a GitHub token and a Sanity invite).** Until the webhook exists, a publish in
the Studio only goes live at the next scheduled build (daily 10:00 UTC, Sunday 18:00 UTC), though
the Studio tells editors "a few minutes". Steps: OPERATIONS.md, "Sanity publish → GitHub → live".
Then invite Pastor Jacob to the Sanity project (Editor role), and once he accepts, add his user id
to `staff` in `src/sanity/kit.config.ts` so he gets the staff view (no permanent delete).

### 1d. Church data waiting on the church

**Blocker: answers from the church, after signing.** All empty-safe today; each lights up with one
edit in Site settings > Church facts, then a publish.

- Tick `confirmed` on the address, each service time and the founding year once the church
  confirms them (the tags disappear and the confirmed address joins the JSON-LD).
- The church phone (Identity & contact > Phone) and `phoneConfirmed`; there is none on file.
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

- **The editor's Sanity user id in `kitConfig.staff`** once he has accepted the invitation. Until then the staff
  view goes by role, and he is an administrator, so he would see the full Studio.
- **`PUBLIC_STUDIO_HELP_EMAIL`** as a build variable (`.env` and the deploy workflow) so Home's Ask card shows its
  email button.
- **The Worker half**: `src/lib/studio-auth.ts` and `/api/studio/*` (visitors from GA4 with a service-account key,
  the Ask form through Cloudflare Email Sending once the church's domain is on Cloudflare, deploy status from GitHub,
  an external link check, the monthly report with its cron). The spike's findings are in the kit doc.
- **The live publish checklist** (a document inspector, plus "Publish anyway" for blocking items).
- **Tutorial videos**, recorded at the end of the site build once the Studio stops changing.
- **Guide recipes in the church's own jobs** (sermons, events, the bulletin) as those features land; the guides
  are still the starter's generic set.
- **The signed-in Studio at 375px**: the Home grid drops to one column by design, but the desktop browser used for
  the check could not be narrowed.

## Known gaps, deliberately open

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
`BusinessOverview.tsx`, the journal index and a couple of others, plus one unused
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
