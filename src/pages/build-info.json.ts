// Foundation, edit with care
// =============================================================================
// /build-info.json: when the live site was built (Studio kit, 2026-10-17)
// =============================================================================
// Prerendered, so the file holds the moment this build rendered it. The
// Studio's Home card ("Is it live?") compares it with the newest published
// change: anything published after it is not on the website yet (CLAUDE.md
// rule 6). The time is taken when this route renders, late in the build, so a
// Publish made DURING a build can briefly read as live; the next build fixes
// that, and Home re-checks every minute.
//
// `commit` is the short SHA when GitHub Actions builds it, else null.
// =============================================================================

import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => {
  const sha = typeof process !== 'undefined' ? process.env?.GITHUB_SHA : undefined;
  return new Response(
    JSON.stringify({ builtAt: new Date().toISOString(), commit: sha ? sha.slice(0, 7) : null }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
