// Safe to edit by hand
// =============================================================================
// /api/form/ - where the church's forms are sent (the form builder, 2026-10-18)
// =============================================================================
// The Form block (src/components/church-blocks/FormBlock.astro) posts here. The
// Contact page keeps its own endpoint, /api/contact/, which is a PORTABLE file
// owned by the starter; this one is FBC Auburn's, so the two never drift. Both
// share the starter's pure helpers (honeypot and timing check, email check).
//
// GET  /api/form/?id=<form id>  -> { ready }  Can forms be delivered at all?
//      The block asks before it shows a form, and shows "please email us
//      instead" until the answer is yes. It says nothing about the config.
// POST /api/form/                -> { ok } | { ok: false, errors | error | unavailable }
//
// THE ORDER (the same as the contact endpoint, PORTS.md card 45):
//   1. drop bots silently (honeypot, too fast);
//   2. load the form from Sanity (published only) and check the answers
//      against ITS questions (src/lib/church-form.ts), never trusting the page;
//   3. Turnstile, when TURNSTILE_SECRET is set;
//   4. STORE in D1 (CONTACT_DB, table form_submissions) before anything else;
//   5. email the form's recipient (Email binding, else Web3Forms);
//   6. a prayer request whose email was accepted has its words cleared from
//      D1, so the recipient's inbox is the only lasting copy.
//
// NO PERSONAL DATA IN SANITY: nothing here ever writes to the dataset.
//
// THE WORKER'S SETTINGS (all optional; OPERATIONS.md "Forms" has the commands):
//   CONTACT_DB         D1 binding, shared with the contact form. The safety net: on its own
//                      it does not switch forms on (a message must reach a person).
//   EMAIL              Cloudflare Email Sending binding (Workers Paid, domain on
//                      Cloudflare), or RESEND_API_KEY for Resend: the email backbone
//                      (src/lib/mail-send.ts, PORTS.md card 127) picks one. MAIL_FROM,
//                      else CONTACT_FROM, is the sending address.
//   FORM_RECIPIENTS    secret, JSON of recipient key to address. A key with no
//                      address goes to "office", then to CONTACT_TO.
//   WEB3FORMS_KEY      fallback email transport (it emails the Web3Forms
//                      account's own address, whatever the recipient).
//   TURNSTILE_SECRET   spam check, with PUBLIC_TURNSTILE_SITE_KEY at build.
//   FORM_TEST_FIXTURES "1" lets the two made-up fixture forms through, for
//                      `npm run preview` only (.dev.vars). Never in production.
// =============================================================================

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { looksAutomated } from '@/lib/contact-submission';
import {
  buildFormNotification,
  normalizeForm,
  parseRecipients,
  recipientAddress,
  validateFormSubmission,
  type ChurchForm,
  type CleanFormSubmission,
  type RawFormSubmission,
} from '@/lib/church-form';
import { FIXTURE_FORMS } from '@/lib/church-form-fixtures';
import { sanityFetch } from '@/lib/sanity';
import { site } from '@/data/site';
import { workerMailer, type MailWorkerEnv } from '@/lib/mail-env';

export const prerender = false;

/** The slice of D1 this route uses (see the same note in /api/contact/). */
interface D1Lite {
  prepare(sql: string): {
    bind(...values: unknown[]): { run(): Promise<{ meta?: { last_row_id?: number } }> };
  };
}

interface FormEnv extends Omit<MailWorkerEnv, 'CONTACT_DB'> {
  CONTACT_DB?: D1Lite;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  FORM_RECIPIENTS?: string;
  WEB3FORMS_KEY?: string;
  TURNSTILE_SECRET?: string;
  FORM_TEST_FIXTURES?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/**
 * Can a submission reach a PERSON? An email path is required: the backbone's sender (Cloudflare or
 * Resend, with a sending address) and somewhere to send (FORM_RECIPIENTS or CONTACT_TO), or Web3Forms. The database alone
 * is a safety net nobody reads, so it does not count: a prayer request must never sit unread.
 */
const canDeliver = (e: FormEnv): boolean =>
  Boolean(
    (workerMailer(e).mailer &&
      (Object.keys(parseRecipients(e.FORM_RECIPIENTS)).length || e.CONTACT_TO)) ||
    e.WEB3FORMS_KEY,
  );

const ID = /^[A-Za-z0-9][\w.-]{0,119}$/;

/** The published form, or a fixture form when the Worker allows them. */
async function loadForm(e: FormEnv, id: string): Promise<ChurchForm | null> {
  if (!ID.test(id) || id.startsWith('drafts.')) return null;
  if (id.startsWith('fixture-')) {
    return e.FORM_TEST_FIXTURES === '1' ? normalizeForm(FIXTURE_FORMS[id]) : null;
  }
  const raw = await sanityFetch<Record<string, unknown>>(
    `*[_type == "form" && _id == $id][0]{
      _id, title, mode, askForContact, allowAnonymous, questions, recipient
    }`,
    { id },
    null,
  ).catch(() => null);
  return normalizeForm(raw);
}

async function passesTurnstile(
  secret: string | undefined,
  token: string | null,
  ip: string | null,
): Promise<boolean> {
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    // An outage must not eat a real message; the honeypot and timing check still stand.
    return true;
  }
}

/** Email the recipient. Returns null on success, else why it failed. */
async function notify(
  e: FormEnv,
  form: ChurchForm,
  s: CleanFormSubmission,
): Promise<string | null> {
  const note = buildFormNotification(form, s, site.name);
  const to = recipientAddress(form.recipient, parseRecipients(e.FORM_RECIPIENTS), e.CONTACT_TO);
  const { mailer, reason } = workerMailer(e);
  let failure: string | null = reason ?? 'no recipient address';
  if (mailer && to) {
    // The message this route always sent; the backbone keeps Reply-To and, on
    // Cloudflare, the retry without it.
    const r = await mailer.send({
      to,
      fromName: `${site.name} website`,
      subject: note.subject,
      text: note.text,
      html: note.html,
      replyTo: note.replyTo || undefined,
    });
    if (r.ok) return null;
    failure = r.error ?? 'send failed';
  }
  if (e.WEB3FORMS_KEY) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          access_key: e.WEB3FORMS_KEY,
          subject: note.subject,
          from_name: site.name,
          name: s.name || 'Sent without a name',
          email: s.email || undefined,
          message: note.text,
        }),
      });
      return res.ok ? null : `web3forms responded ${res.status}`;
    } catch (err) {
      return err instanceof Error ? err.message : 'web3forms request failed';
    }
  }
  return failure;
}

export const GET: APIRoute = async () => {
  const e = env as unknown as FormEnv;
  return json({ ready: canDeliver(e) });
};

export const POST: APIRoute = async ({ request }) => {
  const e = env as unknown as FormEnv;

  let raw: RawFormSubmission;
  try {
    raw = (await request.json()) as RawFormSubmission;
  } catch {
    return json({ ok: false, error: 'Could not read that form.' }, 400);
  }

  // Silent on purpose: a bot gets the same answer a person does.
  if (looksAutomated(raw, Date.now()).automated) return json({ ok: true });

  if (!canDeliver(e)) {
    console.error(
      '[form] no email path (Email binding + CONTACT_FROM + a recipient, or Web3Forms)',
    );
    return json({ ok: false, unavailable: true, error: 'This form is not switched on yet.' }, 503);
  }

  const form = await loadForm(e, typeof raw.formId === 'string' ? raw.formId : '');
  if (!form) return json({ ok: false, error: 'That form could not be found.' }, 404);

  const { ok, errors, value } = validateFormSubmission(form, raw);
  if (!ok || !value) return json({ ok: false, errors }, 422);

  const ip = request.headers.get('cf-connecting-ip');
  if (!(await passesTurnstile(e.TURNSTILE_SECRET, value.turnstileToken, ip))) {
    return json({ ok: false, error: 'That did not pass the spam check. Please try again.' }, 403);
  }

  // ---- Store first ----------------------------------------------------------
  let rowId: number | null = null;
  if (e.CONTACT_DB) {
    try {
      const res = await e.CONTACT_DB.prepare(
        `INSERT INTO form_submissions
           (received_at, form_id, form_title, recipient, mode, name, email, answers, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          new Date().toISOString(),
          form.id,
          form.title,
          form.recipient,
          form.mode,
          value.name || null,
          value.email || null,
          JSON.stringify(value.answers),
          request.headers.get('cf-ipcountry') ?? null,
        )
        .run();
      rowId = (res.meta?.last_row_id as number | undefined) ?? null;
    } catch (err) {
      console.error('[form] could not store submission:', err);
    }
  }

  // ---- Then notify ------------------------------------------------------------
  const failure = await notify(e, form, value);

  if (rowId !== null && e.CONTACT_DB) {
    try {
      // A prayer request that reached its recipient is cleared from the database.
      const clear = !failure && form.mode === 'prayer';
      await e.CONTACT_DB.prepare(
        clear
          ? `UPDATE form_submissions SET notified = 1, notify_error = NULL, answers = NULL, name = NULL, email = NULL, cleared = 1 WHERE id = ?`
          : `UPDATE form_submissions SET notified = ?, notify_error = ? WHERE id = ?`,
      )
        .bind(...(clear ? [rowId] : [failure ? 0 : 1, failure, rowId]))
        .run();
    } catch (err) {
      console.error('[form] could not record the notification state:', err);
    }
  }

  // Stored but not sent is still a success for the visitor: the row keeps it.
  if (failure) {
    console.error('[form] notification failed:', failure);
    if (rowId === null) {
      return json({ ok: false, unavailable: true, error: 'Sorry, that did not send.' }, 502);
    }
  }
  return json({ ok: true });
};

/** Anything else. */
export const ALL: APIRoute = () => json({ ok: false, error: 'Method not allowed.' }, 405);
