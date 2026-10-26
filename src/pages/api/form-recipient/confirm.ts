// Safe to edit by hand
// =============================================================================
// /api/form-recipient/confirm/ - "Yes, send them to me" (2026-10-26)
// =============================================================================
// The link in the email an administrator's new form address gets (src/lib/form-recipients.ts).
// GET shows one button and changes nothing, so a mail scanner that opens the link cannot
// confirm it; the button POSTs the same signed token, and only then does the address start
// receiving messages. No Studio sign-in: the signed, expiring token is the proof, and it only
// ever confirms the exact address that was saved as pending. The page is drawn by the starter's
// PORTABLE form-recipients.ts (card 174); the colours below are passed in.
// =============================================================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '@/data/site';
import { handleRecipientConfirm, type ConfirmTheme } from '@/lib/form-recipients';
import type { D1Database } from '@/lib/mail-db';
import { secretUsable } from '@/lib/mail-token';

export const prerender = false;

/** Paper, navy and the brick red of the site (light only, rule 3). */
const THEME: ConfirmTheme = {
  background: '#f6f3ee',
  text: '#16263d',
  heading: '#1f3a5f',
  button: '#9a3b2a',
  buttonText: '#ffffff',
};

const handler: APIRoute = async ({ request }) => {
  const e = env as unknown as { CONTACT_DB?: D1Database; MAIL_SECRET?: string };
  return handleRecipientConfirm(request, {
    db: e.CONTACT_DB ?? null,
    secret: secretUsable(e.MAIL_SECRET) ? e.MAIL_SECRET : null,
    siteName: site.name,
    theme: THEME,
  });
};

export const GET = handler;
export const POST = handler;
