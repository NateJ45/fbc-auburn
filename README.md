# First Baptist Church of Auburn: website

The website for First Baptist Church of Auburn (Hamilton, Ohio): a simple, welcoming site with sermons, giving, events and a plan-your-visit page.

- **For Claude sessions:** see `CLAUDE.md`.
- **Stack:** Astro 7, Sanity v6 (Studio embedded at `/studio`) and a Cloudflare Worker, forked from `ncs-astro-sanity-starter` on 2026-10-17.
- **Status:** designed and built, not launched. The church is reviewing draft content (marked `[Placeholder: ...]` in the CMS) before the site goes live.

## What exists

| Thing              | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Sanity project     | `wdpzvn6m`, dataset `production` (public read: never store personal data in it) |
| Cloudflare Worker  | `fbc-auburn`                                                                    |
| Pre-launch address | https://fbc-auburn.nathanjnixon86.workers.dev                                   |
| Production domain  | not chosen yet                                                                  |

## Run it

```powershell
npm ci
npm run dev
```

The site serves on http://localhost:4321 and the Studio on http://localhost:4321/studio. `.env` and `.dev.vars` hold the Sanity values (copy them from `.env.example` and `.dev.vars.example`); they are git-ignored and never committed.

## Automatic jobs

- **CI** (`.github/workflows/ci.yml`): static checks, one build, link check and the Playwright suite on every push and pull request. `build` and `test` are required to merge.
- **Deploy** (`deploy.yml`): ships production on a push to `main`, on the Sanity publish webhook and on manual dispatch.
- **Lighthouse** and **Visual regression**: run on pull requests and `main`.
- **Sanity backup** (`sanity-backup.yml`): encrypted dataset exports.
- **Dependabot lockfile repair** (`dependabot-lockfile.yml`): on Dependabot's PRs only, rebuilds a lockfile that CI's npm rejects, commits it and re-runs `ci.yml` (starter PORTS.md card 226).
- **Dependabot**: weekly dependency updates.

How to deploy, patch content and run audits: `OPERATIONS.md`. Open loops: `docs/PENDING.md`.
