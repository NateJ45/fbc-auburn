// Safe to edit by hand
// =============================================================================
// church-form - the pure half of FBC Auburn's form builder
// =============================================================================
// A `form` document (src/sanity/schemaTypes/form.ts) holds the WORDS of a form:
// its questions, who it goes to (a recipient KEY, never an address), and its
// thank-you line. The "Form" section block draws it; /api/form/ receives it.
//
// This file is what both halves agree on, with no bindings, fetch or Astro, so
// `node --test` covers it (church-form.test.ts):
//   - normalizeForm: a raw Sanity form as the shape the page and the endpoint
//     use, unusable questions dropped (same caps as the Contact page's custom
//     questions, src/lib/custom-form-fields.ts);
//   - normalizeFormQuestions: the shared six question kinds plus Auburn's own two, a date and
//     "tick any that apply" (formQuestionMore.ts, 2026-10-26);
//   - validateFormSubmission: the server's check of a posted form AGAINST THE
//     FORM'S OWN QUESTIONS. Answers to questions the form does not ask are
//     ignored; a required one left empty, a choice that is not on the list or
//     an over-long answer is refused;
//   - recipientAddress: the recipient key mapped to an address through the
//     Worker's FORM_RECIPIENTS secret, so no address is ever in the public
//     dataset;
//   - buildFormNotification: the email;
//   - FORM_SUBMISSIONS_DDL: the D1 table (migrations/0002_form_submissions.sql
//     is checked against it by the test).
//
// NO PERSONAL DATA IN SANITY. A submission never goes near the dataset: it is
// stored in the Worker's own D1 database and emailed. A prayer request is
// cleared from D1 as soon as its email is accepted (see the endpoint), so the
// church's inbox is the only lasting copy.
// =============================================================================

import { looksLikeEmail } from './contact-submission.ts';
import {
  MAX_CUSTOM_FIELDS,
  MAX_FIELD_LENGTH,
  MAX_TOTAL_LENGTH,
  normalizeCustomFields,
  type CustomFormField,
} from './custom-form-fields.ts';
import { churchNow, plain } from './church-facts.ts';

/** The most boxes one "tick any that apply" question offers (formQuestionMore.ts says the same). */
export const MAX_TICK_CHOICES = 12;

/** A date question (schema type formDateQuestion, 2026-10-26). */
export interface DateQuestion {
  kind: 'date';
  label: string;
  required: boolean;
  options: string[];
  /** Only today or later (the church's clock). */
  notPast: boolean;
}

/** "Tick any that apply" (schema type formTickQuestion, 2026-10-26). */
export interface TickQuestion {
  kind: 'multi';
  label: string;
  required: boolean;
  options: string[];
}

/** Any question a church form can ask: the shared six kinds, a date, or tick any that apply. */
export type ChurchQuestion = CustomFormField | DateQuestion | TickQuestion;

/**
 * A form's questions as the page and the endpoint use them: the shared formQuestion rows through
 * the starter's normalizeCustomFields (unchanged), and the two Auburn kinds read here. Unusable
 * rows are dropped; at most MAX_CUSTOM_FIELDS in all.
 */
export function normalizeFormQuestions(raw: unknown): ChurchQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: ChurchQuestion[] = [];
  for (const row of raw) {
    if (out.length >= MAX_CUSTOM_FIELDS) break;
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const label = typeof r.label === 'string' ? plain(r.label).slice(0, 200) : '';
    if (r._type === 'formDateQuestion') {
      if (label) {
        out.push({
          kind: 'date',
          label,
          required: r.required === true,
          options: [],
          notPast: r.notPast !== false,
        });
      }
      continue;
    }
    if (r._type === 'formTickQuestion') {
      const options = [
        ...new Set(
          (Array.isArray(r.options) ? r.options : [])
            .map((o) => (typeof o === 'string' ? plain(o).slice(0, 120) : ''))
            .filter(Boolean),
        ),
      ].slice(0, MAX_TICK_CHOICES);
      if (label && options.length > 0) {
        out.push({ kind: 'multi', label, required: r.required === true, options });
      }
      continue;
    }
    out.push(...normalizeCustomFields([row]));
  }
  return out;
}

const LONG_DATE = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-11-01" -> "Sunday, November 1, 2026", or '' for anything that is not a real date. */
export function formDateLabel(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return '';
  return LONG_DATE.format(d);
}

export type FormMode = 'standard' | 'prayer';

/** A form as the page draws it and the endpoint checks it. */
export interface ChurchForm {
  id: string;
  title: string;
  intro: string;
  mode: FormMode;
  /** Ask for name and email first (on by default). */
  askForContact: boolean;
  /** Offer "send this without my name". Only meaningful with askForContact. */
  allowAnonymous: boolean;
  questions: ChurchQuestion[];
  /** A key from Site settings > Forms > Who forms can go to. */
  recipient: string;
  /** The recipient's plain name ("Pastor"), for the page's own words. */
  recipientName: string;
  successMessage: string;
  submitLabel: string;
}

const DEFAULT_SUCCESS = 'Thank you. Your message has been sent.';
const DEFAULT_PRAYER_SUCCESS = 'Thank you. Your request has been sent, and we will be praying.';

/** The recipient used when a form names none, or one with no address on file. */
export const DEFAULT_RECIPIENT = 'office';

const str = (v: unknown, max = 500): string =>
  typeof v === 'string' ? plain(v).slice(0, max) : '';

/** A Sanity form document (projected) as a ChurchForm, or null when it is unusable. */
export function normalizeForm(raw: unknown): ChurchForm | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r._id ?? r.id, 120);
  if (!id) return null;
  const mode: FormMode = str(r.mode) === 'prayer' ? 'prayer' : 'standard';
  const askForContact = r.askForContact !== false;
  return {
    id,
    title: str(r.title, 120) || 'Form',
    intro: typeof r.intro === 'string' ? r.intro.trim().slice(0, 1000) : '',
    mode,
    askForContact,
    allowAnonymous: askForContact && r.allowAnonymous === true,
    questions: normalizeFormQuestions(r.questions),
    recipient: str(r.recipient, 40) || DEFAULT_RECIPIENT,
    recipientName: typeof r.recipientName === 'string' ? r.recipientName.trim() : '',
    successMessage:
      (typeof r.successMessage === 'string' && r.successMessage.trim()) ||
      (mode === 'prayer' ? DEFAULT_PRAYER_SUCCESS : DEFAULT_SUCCESS),
    submitLabel:
      (typeof r.submitLabel === 'string' && r.submitLabel.trim()) ||
      (mode === 'prayer' ? 'Send my request' : 'Send'),
  };
}

/** A posted form, before any trust is extended. */
export interface RawFormSubmission {
  formId?: unknown;
  name?: unknown;
  email?: unknown;
  /** True when the visitor ticked "send without my name". */
  anonymous?: unknown;
  /**
   * One entry per question, in question order: a string, a boolean for a yes/no box, or a list of
   * the ticked choices for "tick any that apply".
   */
  answers?: unknown;
  company?: unknown;
  renderedAt?: unknown;
  turnstileToken?: unknown;
}

export interface FormAnswer {
  label: string;
  /** In plain words: "Kitchen, Children", "Sunday, November 1, 2026". */
  value: string;
  /** The two Auburn kinds say what they are, so the email can lay them out. */
  kind?: 'date' | 'multi';
  /** "Tick any": each ticked choice; a date: its YYYY-MM-DD. */
  values?: string[];
}

export interface CleanFormSubmission {
  formId: string;
  /** '' when anonymous or the form does not ask. */
  name: string;
  email: string;
  anonymous: boolean;
  answers: FormAnswer[];
  turnstileToken: string | null;
}

export interface FormValidation {
  ok: boolean;
  /** "name", "email" or "q<index>" to a visitor-facing problem. */
  errors: Record<string, string>;
  value: CleanFormSubmission | null;
}

const PHONE = /^[\d\s()+.-]{7,25}$/;

/** Check a posted form against the form's own questions. `now` is for "only from today on". */
export function validateFormSubmission(
  form: ChurchForm,
  raw: RawFormSubmission,
  now: Date = new Date(),
): FormValidation {
  const errors: Record<string, string> = {};
  const anonymous = form.allowAnonymous && raw.anonymous === true;
  let name = '';
  let email = '';
  if (form.askForContact && !anonymous) {
    name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 120) : '';
    email = typeof raw.email === 'string' ? raw.email.trim().slice(0, 254) : '';
    if (!name) errors.name = 'Please tell us your name.';
    if (!email) errors.email = 'Please give us an email address so we can reply.';
    else if (!looksLikeEmail(email)) errors.email = 'That email address does not look right.';
  }

  const posted = Array.isArray(raw.answers) ? raw.answers : [];
  const answers: FormAnswer[] = [];
  let total = 0;
  form.questions.forEach((q, i) => {
    const v = posted[i];
    let value = '';
    if (q.kind === 'multi') {
      // Tick any that apply: a list of the ticked choices, each one on the question's own list.
      const ticked: unknown[] = Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
      const names = ticked.map((t) => (typeof t === 'string' ? t.trim() : null));
      if (
        names.length > q.options.length ||
        names.some((t) => t === null || !q.options.includes(t))
      ) {
        errors[`q${i}`] = 'Please pick from the choices.';
        return;
      }
      const picked = q.options.filter((o) => names.includes(o));
      if (picked.length === 0) {
        if (q.required) errors[`q${i}`] = 'Please tick at least one.';
        return;
      }
      value = picked.join(', ');
      total += value.length;
      answers.push({ label: q.label, value, kind: 'multi', values: picked });
      return;
    }
    if (q.kind === 'date') {
      const iso = typeof v === 'string' ? v.trim() : '';
      if (!iso) {
        if (q.required) errors[`q${i}`] = 'Please pick a date.';
        return;
      }
      const words = formDateLabel(iso);
      if (!words) {
        errors[`q${i}`] = 'That date does not look right.';
        return;
      }
      if (q.notPast && iso < churchNow(now).date) {
        errors[`q${i}`] = 'Please pick today or a day after.';
        return;
      }
      answers.push({ label: q.label, value: words, kind: 'date', values: [iso] });
      return;
    }
    if (q.kind === 'checkbox') {
      if (v === true || v === 'true' || v === 'on' || v === 'Yes') value = 'Yes';
      if (q.required && value !== 'Yes') errors[`q${i}`] = 'Please check this box to go on.';
      answers.push({ label: q.label, value: value || 'No' });
      return;
    }
    value = typeof v === 'string' ? v.trim() : '';
    if (value.length > MAX_FIELD_LENGTH) {
      errors[`q${i}`] = `Please keep this under ${MAX_FIELD_LENGTH} characters.`;
      return;
    }
    if (!value) {
      if (q.required) errors[`q${i}`] = 'Please answer this question.';
      return;
    }
    if (q.kind === 'select' && !q.options.includes(value)) {
      errors[`q${i}`] = 'Please pick one of the choices.';
      return;
    }
    if (q.kind === 'email' && !looksLikeEmail(value)) {
      errors[`q${i}`] = 'That email address does not look right.';
      return;
    }
    if (q.kind === 'phone' && !PHONE.test(value)) {
      errors[`q${i}`] = 'That phone number does not look right.';
      return;
    }
    total += value.length;
    answers.push({ label: q.label, value });
  });
  if (total > MAX_TOTAL_LENGTH) errors.form = 'That is a lot of text. Please shorten it a little.';

  // A form with no questions and no contact boxes has nothing to send.
  const hasContent = Boolean(name || answers.some((a) => a.value && a.value !== 'No'));
  if (!hasContent && Object.keys(errors).length === 0) errors.form = 'Please fill in the form.';

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    value: ok
      ? {
          formId: form.id,
          name,
          email,
          anonymous,
          answers,
          turnstileToken: typeof raw.turnstileToken === 'string' ? raw.turnstileToken : null,
        }
      : null,
  };
}

/**
 * The Worker secret FORM_RECIPIENTS, a JSON object of key to address
 * (`{"office":"office@example.org","pastor":"pastor@example.org"}`), as a map.
 * Anything malformed reads as empty rather than throwing.
 */
export function parseRecipients(json: string | undefined | null): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && looksLikeEmail(v.trim())) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Where a form goes: its recipient's address, else the office's, else the
 * Contact form's CONTACT_TO. null when there is nowhere at all.
 */
export function recipientAddress(
  key: string,
  recipients: Record<string, string>,
  contactTo?: string | null,
): string | null {
  return recipients[key] ?? recipients[DEFAULT_RECIPIENT] ?? (contactTo?.trim() || null);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface FormNotification {
  subject: string;
  text: string;
  html: string;
  /** Set when the visitor gave an address to reply to. */
  replyTo: string | null;
}

/** The email the recipient gets. */
export function buildFormNotification(
  form: Pick<ChurchForm, 'title' | 'mode'>,
  s: CleanFormSubmission,
  siteName: string,
): FormNotification {
  const who = s.anonymous ? 'Sent without a name' : s.name ? `${s.name} <${s.email}>` : '';
  const lines = [
    ...(who ? [`From: ${who}`, ''] : []),
    ...s.answers.flatMap((a) => [
      `${a.label}`,
      ...(a.kind === 'multi' && a.values ? a.values.map((x) => `- ${x}`) : [a.value]),
      '',
    ]),
    `Sent from the "${form.title}" form on ${siteName}.`,
    ...(form.mode === 'prayer'
      ? ['This is a prayer request. Please keep it as private as the person would expect.']
      : []),
  ];
  const html =
    (who ? `<p><strong>From:</strong> ${escapeHtml(who)}</p><hr>` : '') +
    s.answers
      .map((a) =>
        a.kind === 'multi' && a.values
          ? `<p><strong>${escapeHtml(a.label)}</strong></p><ul>${a.values
              .map((x) => `<li>${escapeHtml(x)}</li>`)
              .join('')}</ul>`
          : `<p><strong>${escapeHtml(a.label)}</strong><br><span style="white-space:pre-wrap">${escapeHtml(a.value)}</span></p>`,
      )
      .join('') +
    `<hr><p style="color:#666;font-size:12px">Sent from the "${escapeHtml(form.title)}" form on ${escapeHtml(siteName)}.` +
    (form.mode === 'prayer'
      ? ' This is a prayer request. Please keep it as private as the person would expect.'
      : '') +
    `</p>`;
  const from = s.anonymous ? 'anonymous' : s.name || 'a visitor';
  return {
    subject: `${form.mode === 'prayer' ? 'Prayer request' : form.title}: from ${from}`,
    text: lines.join('\n'),
    html,
    replyTo: s.email || null,
  };
}

/**
 * The D1 table /api/form/ writes to. `answers` is the JSON of the answers; for
 * a prayer request it is set to NULL once the email has gone (`cleared = 1`).
 */
export const FORM_SUBMISSIONS_DDL = `
CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL,
  form_id TEXT NOT NULL,
  form_title TEXT NOT NULL,
  recipient TEXT NOT NULL,
  mode TEXT NOT NULL,
  name TEXT,
  email TEXT,
  answers TEXT,
  -- Whether the notification email was accepted. A row with notified = 0 is a
  -- message that still needs reading here.
  notified INTEGER NOT NULL DEFAULT 0,
  notify_error TEXT,
  -- 1 once a prayer request's words have been removed after a good send.
  cleared INTEGER NOT NULL DEFAULT 0,
  country TEXT
);
CREATE INDEX IF NOT EXISTS form_submissions_received_at
  ON form_submissions (received_at DESC);
`.trim();
