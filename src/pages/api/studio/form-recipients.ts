// Safe to edit by hand
// =============================================================================
// /api/studio/form-recipients/ - where form messages go, set in the Studio (2026-10-26)
// =============================================================================
// GET                                  -> the addresses on file and whether a new one can be confirmed
// POST { action: 'set', key, email, name }   save a new address (pending until confirmed)
// POST { action: 'resend' | 'cancel' | 'clear', key }
//
// Same origin, then a signed-in member of this Sanity project (src/lib/studio-auth.ts), then the
// ADMINISTRATOR role, before the database is touched, on every method (these are private
// addresses; the dataset is public, so they never go there). All the rules are in
// src/lib/form-recipients.ts, where the tests reach them. The table comes from
// migrations/0005_form_recipients.sql; until it is applied the Studio says "not set up yet".
// =============================================================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '@/data/site';
import { parseRecipients } from '@/lib/church-form';
import { fallbackKeys, handleRecipientStudio } from '@/lib/form-recipients';
import type { D1Database } from '@/lib/mail-db';
import { originOf, workerMailer, type MailWorkerEnv } from '@/lib/mail-env';
import { secretUsable } from '@/lib/mail-token';
import { bearerToken, isSameOrigin, verifyStudioUser } from '@/lib/studio-auth';

export const prerender = false;

const handler: APIRoute = async ({ request }) => {
  const e = env as unknown as MailWorkerEnv & { FORM_RECIPIENTS?: string; CONTACT_DB?: D1Database };
  const { mailer } = workerMailer(e);
  return handleRecipientStudio(request, {
    sameOrigin: isSameOrigin,
    verify: (req) => verifyStudioUser(bearerToken(req), import.meta.env.PUBLIC_SANITY_PROJECT_ID),
    db: e.CONTACT_DB ?? null,
    mailer,
    secret: secretUsable(e.MAIL_SECRET) ? e.MAIL_SECRET : null,
    origin: originOf(request),
    siteName: site.name,
    fallbacks: fallbackKeys(parseRecipients(e.FORM_RECIPIENTS), e.CONTACT_TO),
  });
};

export const GET = handler;
export const POST = handler;
