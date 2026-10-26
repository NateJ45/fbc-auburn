// Foundation, edit with care
// =============================================================================
// /api/studio/people/ - "Invite a helper" in the Studio's People tool (2026-10-26)
// =============================================================================
// GET lists the project's members and pending invitations; POST invites a
// Helper or an Administrator, or resends or cancels an invitation. Protected
// like the other /api/studio/* routes (same origin and a signed-in Studio
// member, src/lib/studio-auth.ts), and on top of that the caller must be a
// project ADMINISTRATOR by their real Sanity role, checked before Sanity's
// Access API is touched.
//
// Needs one Worker secret, a Sanity robot token with the
// "Access Manager (Token only)" role:
//   SANITY_MEMBERS_TOKEN  (`npx wrangler secret put SANITY_MEMBERS_TOKEN`)
// Without it the route answers { configured: false } and the tool shows the
// sanity.io/manage steps instead. Administrator invites use the caller's own
// session (Sanity lets only administrators invite administrators).
//
// Every rule is in src/lib/studio-people.ts, where the unit tests reach it.
// =============================================================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handlePeople } from '@/lib/studio-people';
import { bearerToken, isSameOrigin, verifyStudioUser } from '@/lib/studio-auth';

export const prerender = false;

/** Who the pastor asks; matches kitConfig.helper.name (not imported: it pulls in the Studio). */
const HELPER_NAME = 'Nathan';

const handler: APIRoute = async ({ request }) =>
  handlePeople(request, {
    sameOrigin: isSameOrigin,
    verify: async (req) => {
      const token = bearerToken(req);
      const user = await verifyStudioUser(token, import.meta.env.PUBLIC_SANITY_PROJECT_ID);
      return user && token ? { ...user, token } : null;
    },
    membersToken: (env as unknown as { SANITY_MEMBERS_TOKEN?: string }).SANITY_MEMBERS_TOKEN,
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    helperName: HELPER_NAME,
  });

export const GET = handler;
export const POST = handler;
