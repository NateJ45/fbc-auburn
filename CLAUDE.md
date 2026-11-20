# First Baptist Church of Auburn website: CLAUDE.md

Always-loaded rules for this repo, the website for First Baptist Church of Auburn (Hamilton, Ohio). This file stays under 200 lines on purpose. File-specific rules live in `.claude/rules/*.md` and load only when you touch matching files; long reference lives in `docs/claude/` and `docs/agent/` and is read on demand. The docs map at the bottom lists every one of them.
**Read this first.** Read the vault session guide: `C:\Users\natha\Documents\Claude\Projects\_vault\projects\first-baptist-auburn-session-guide.md`. Also read `~/.claude/CLAUDE.md` and the Projects `CLAUDE.md`.

**Read `docs/PENDING.md` early in a session.** It is the live registry of open loops: queued work, known gaps, and waiting-on-a-human items. If you finish or discover one, update it in the same commit.

Companion tactical runbook: `OPERATIONS.md`. Setup followed the starter's `docs/bootstrap/NEW-PROJECT.md`; `docs/bootstrap/setup-checklist.md` is its sign-off. `PORTS.md` is a copy of the starter's registry of shared improvements (see Ports below).
Design context: `PRODUCT.md` (brief) and `DESIGN.md` (brand tokens and rules). The reskin history and the current design layers (board E home, flow layer, shapes, client notes layer, CTA budget) are in `docs/claude/overview.md` ("Design context and reskin history") and `docs/agent/changelog.md`.

## What this is

The church's site on **Astro 7 + Sanity v6 + Cloudflare Workers**, forked from `ncs-astro-sanity-starter` on 2026-10-17. Sanity project `wdpzvn6m`, dataset `production` (public, so no personal data in it), Studio embedded at `/studio` (Studio kit: `docs/agent/studio-kit.md`). Worker `fbc-auburn`, pre-launch address https://fbc-auburn.nathanjnixon86.workers.dev. **Page-builder-first**: pages render through `SectionRenderer` from Sanity `pageBuilder` arrays. The rest of the overview, Church Trac, church-facts detail, Self-serve in the Studio and the Authoring kit are in `docs/claude/overview.md`, `docs/agent/church-trac.md`, `docs/agent/church-data.md`, `docs/agent/studio-links.md` and `docs/agent/sanity.md`.

The must-knows:

- TypeScript strict, `output: 'static'` with a handful of SSR routes (`/preview/**`, `/api/draft-mode/*`, `/private/<slug>/`). Node 22.23.4 (pinned in `.nvmrc`, which every workflow reads; starter card 209). Tailwind 4 via `@tailwindcss/vite` (no `tailwind.config.mjs`; tokens in `@theme` in `src/styles/globals.css`). React 19 islands only where interactive.
- The Sanity Studio is **embedded at `/studio`**. There is no separate studio dev server or deploy. Never run `npx sanity deploy`. `/studio` is the site's own page (`src/pages/studio/index.astro`: title, icons, splash; card 120), so `astro.config.mjs` sets no `studioBasePath`. Its name, mark (`public/favicon.svg`) and accent and background colours come from `brand/brand.config.json` at build time, contrast-guarded by `studio-theme.test.ts` (PORTS.md card 110); `studio.components.logo` is dead in Sanity 6, so never use it.
- `sanityFetch(query, params, fallback)` in `src/lib/sanity.ts` is the single chokepoint for Sanity reads; with no project configured it returns the fallback, so `npm run build` works on a fresh clone.
- The church's facts (address, service times, phone, YouTube channel, Church Trac feed) are typed ONCE in Site settings > Church facts and drawn through `src/components/church/`. Never type a time or address into a component: `docs/agent/church-data.md`. No bracketed `[Jacob: ...]` or `[Placeholder: ...]` text survives launch: `docs/agent/content-pages.md`.
- Password pages (`privatePage`) are SSR and stored under the private `privatePage.` id path: `docs/agent/private-pages.md`.
- Hosting is **Cloudflare Workers**, not Pages. Deploy with `npm run deploy` (`wrangler deploy -c dist/server/wrangler.json`). A bare `wrangler deploy` 404s every sub-route.

## Commands

- `npm run dev`: dev server on :4321, Studio at `/studio`.
- `npm run typegen`: regenerate Sanity types. Run after ANY schema change, before `npm run build`. `npm run build:full` chains both.
- `npm run build`: `astro build` plus the post-build scripts (CSS purge, brand icons, share cards, CSP, search index). Does NOT chain typegen. Full chain in `docs/claude/build-and-scripts.md`.
- `npm run check` (`astro check && npm run lint`) is the fast gate; `npm run check:full` is typegen, build and unit tests (`test:unit` includes the scripts tests).
- `npm run test:unit` (node --test, `src/lib/*.test.ts`, then `npm run test:scripts`; five are GATES: `theme-tokens`, `layout-variants`, `section-fields`, `site-layout`, `corner-shadow-scale`). `npm test` is the Playwright suite. Also `npm run format:check` and `npm run check:links`.
- `npm run preview`: `wrangler dev` on the last build; the only way to exercise SSR routes locally.
- Everything else (parity, references, apply-brand, seed, scaffold, audits, thumbnails, og, sync-check, free-dist): `docs/claude/build-and-scripts.md`.

## Branch, CI and deploy

- Work on a branch and open a PR; `main` is production. CI (`ci.yml`) runs on every push and PR, as parallel jobs (`static`, `site`, three Playwright shards `e2e`, and the required aggregators `build` and `test`; PORTS.md card 70): the static checks, one build, `check:links` and `npm test` (Playwright); `lighthouse.yml` runs `npx lhci autorun` separately. Parity is deliberately a local gate.
- `deploy.yml` ships production on a push to `main` (docs-only paths, including `CLAUDE.md`, are ignored), on the Sanity publish webhook (`repository_dispatch`) and on manual dispatch. It will not deploy if the unit tests fail.
- CI never reads live content (snapshot at `ci/sanity-snapshot.ndjson.gz`; a new build-time `createClient` read must spread `...snapshotClientOptions(process.env)`): `docs/agent/deployment.md`.
- Content is statically built: a Sanity edit goes live only after a rebuild (rule 6).

## Rules that bite

Numbering is load-bearing; other docs cite it. Full text of every rule: `docs/claude/rules-detail.md`; path-scoped detail loads from `.claude/rules/*.md` when you touch matching files.

1. **Never click "Remove field" in the Studio** (deletes that field's data everywhere). After a schema change: edit schema, `npm run typegen`, commit, deploy.
2. **No em-dashes in public-facing site copy.** Code comments, commits and internal docs are exempt.
3. **Light only.** No theme toggle, no dark styles (`docs/agent/theme-and-color.md`).
4. **Desktop nav is server-rendered** in `Header.astro`; do not make it a client-only island.
5. **Scrolling is the browser's own; no Lenis** and no scroll library or `after-swap` scroll call (`docs/agent/animation.md`).
6. **Content is statically built.** A Sanity edit goes live only after a rebuild.
7. **After any schema change run `npm run typegen` before `npm run build`** (`build:full` runs both).
8. **Astro, adapter, wrangler, React and Sanity versions are a MATCHED SET;** never bump one alone, never `npm audit fix --force`, never regenerate `package-lock.json` (`.claude/rules/dependencies.md`). Curling a page is not verifying it.
   8b. A new logic-driving dropdown goes into `NON_STEGA_FIELDS` in `src/lib/cms-preview.ts`.
9. **Blocks carry no colour/surface field** (`section-fields.test.ts` fails if one appears); `look` is the one exception.
10. **The reserved-slug guard lives inside `getStaticPaths`** in `[slug].astro`.
11. to 13. Fork residue, `apply-brand` font packages, build after `apply-brand` (`.claude/rules/brand-reskin.md`).
12. **A capability is added with its scaffold markers in the same commit** (`.claude/rules/scaffold.md`).
13. **Anything computable from data is derived at build time,** never an editable field.
14. **Retiring data is a backup-then-delete script, run dry first.** A production write needs `--apply` AND `NCS_PRODUCTION_WRITE=yes` (`.claude/rules/data-scripts.md`).
15. **One grammar per page** (`.claude/rules/ui-grammar.md`).
16. **Layout variants are a config axis** in `brand.config.json` (`.claude/rules/brand-reskin.md`).
17. **Internal page links end in a slash;** data-built hrefs go through `withTrailingSlash()`.

## Design flow and authoring kit

Brief -> references -> design-directions -> reskin, in that order (`.claude/rules/design-flow.md`, `docs/claude/overview.md`). Clients build their own pages from templates and saved sections; a new block needs a styleguide fixture and a thumbnail or the `authoring` test fails (`docs/agent/sanity.md`, "Authoring kit").

## Live draft preview

The `/preview/**` stack (second Sanity client with stega, SSE proxy, instant text, morph refresh, in-canvas controls) is the most fragile area. Never compare or measure a stega-encoded string, never poll instead of the SSE proxy, `/preview/**` must send `Cache-Control: no-store`, and the `/preview/live` listen must stay `visibility: 'query'`. Everything else is in `.claude/rules/preview-stack.md`, which loads when you touch preview files; read PORTS.md cards 29-29d before touching the refresh loop.

## Code conventions and Working with Claude

Shared by every site repo in the family, so they live in one PORTABLE file imported here (it is expanded into context at launch, so this saves lines in this file, not tokens): the code conventions (strict TypeScript, header comments, Astro and React islands, images, Tailwind) and the working-with-Claude habits (desktop app, Plan Mode, confirm before installing, describe design in plain language, verify in a real browser).

@docs/claude/family-conventions.md

## Visual verification

Every UI change is verified rendered, in light (the only theme, rule 3), at ~375px and ~1280px, with hover/focus/active states and the neighbouring sections checked, before it is reported done. Use the Playwright MCP; for Studio changes open `/studio` in a real browser and read the console. Full loop: `docs/claude/visual-verification.md`.

## Style

Warm, conversational, step-by-step for processes. No em-dashes in public-facing site copy (rule 2). No AI-tell phrases (delve, leverage, robust, seamless and the rest) and no filler openers or closers. The full lists and the site copy voice are in `docs/claude/communication-style.md`.

## Edit zones

Files are either safe to edit by hand (`docs/claude/safe-to-edit.md`) or foundation (`.claude/rules/foundation-files.md`, loads when you touch one). A change to the foundation set is a planned session, and this doc is updated when the architecture shifts.

## Vault

Business context and decisions live in the studio vault, not here: the session guide above, then `_vault/clients/first-baptist-auburn.md` at the Projects root (read only its `## Current state`; log a Work log row per session of real work). Update repo docs in the same piece of work as any change; repo docs stay in the repo, and no vault notes are created inside this repo.

## Ports

The starter (`internal/ncs-astro-sanity-starter`) owns `PORTS.md` and the files marked `PORTABLE:`; the copies here stay byte-identical to it, and `npm run sync-check` (run from this repo, it finds the sibling starter) reports drift. Change a marked file in the starter first, never only here. Auburn's deliberate forks of starter copies (2026-10-27) are listed in `docs/PENDING.md`. A fix found here that is not church-specific goes back to the starter with a port card in the same commit that generalises it. Cross-project lessons go to `_vault/gotchas/`. Full working rules: `.claude/rules/library-of-record.md`.

## Docs map

Path-scoped rules are in `.claude/rules/` (load when matching files are touched). Reference is in `docs/claude/` (overview, build-and-scripts, routes, safe-to-edit, visual-verification, communication-style, rules-detail) and `docs/agent/` deep-dives. The full map with one line per file: `docs/claude/topic-index.md`. Tactical playbook: `OPERATIONS.md`. GA4 events and the Report: `docs/agent/analytics.md`.
