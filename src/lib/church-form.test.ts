// Safe to edit by hand
// Unit tests for the form builder's pure half (church-form.ts): shaping a form,
// the server's validation against the form's own questions, the recipient
// mapping, the email, and the migration matching the DDL.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FORM_SUBMISSIONS_DDL,
  buildFormNotification,
  normalizeForm,
  parseRecipients,
  recipientAddress,
  validateFormSubmission,
  type ChurchForm,
} from './church-form.ts';

const raw = {
  _id: 'form-visit',
  title: 'Plan a visit',
  recipient: 'pastor',
  questions: [
    { label: 'Which Sunday?', kind: 'select', options: ['This one', 'Next one'], required: true },
    { label: 'Anything we should know?', kind: 'textarea' },
    { label: 'Bringing children?', kind: 'checkbox' },
    { label: 'Phone', kind: 'phone' },
    { label: '', kind: 'text' },
  ],
};

const form = normalizeForm(raw) as ChurchForm;

describe('normalizeForm', () => {
  it('keeps usable questions and fills the defaults', () => {
    assert.equal(form.id, 'form-visit');
    assert.equal(form.questions.length, 4);
    assert.equal(form.mode, 'standard');
    assert.equal(form.askForContact, true);
    assert.equal(form.allowAnonymous, false);
    assert.equal(form.successMessage, 'Thank you. Your message has been sent.');
    assert.equal(form.submitLabel, 'Send');
  });
  it('gives a prayer form its own words and the office as the default recipient', () => {
    const p = normalizeForm({ _id: 'p', mode: 'prayer', allowAnonymous: true });
    assert.ok(p);
    assert.equal(p.mode, 'prayer');
    assert.equal(p.allowAnonymous, true);
    assert.equal(p.recipient, 'office');
    assert.match(p.successMessage, /praying/);
  });
  it('has no anonymous option on a form that does not ask for a name', () => {
    const p = normalizeForm({ _id: 'p', askForContact: false, allowAnonymous: true });
    assert.equal(p?.allowAnonymous, false);
  });
  it('rejects a form with no id', () => {
    assert.equal(normalizeForm({ title: 'x' }), null);
    assert.equal(normalizeForm(null), null);
  });
});

describe('validateFormSubmission', () => {
  const good = {
    name: 'Ruth',
    email: 'ruth@example.org',
    answers: ['This one', 'We use a wheelchair', true, ''],
  };
  it('accepts a good submission and labels each answer', () => {
    const r = validateFormSubmission(form, good);
    assert.equal(r.ok, true);
    assert.deepEqual(r.value?.answers, [
      { label: 'Which Sunday?', value: 'This one' },
      { label: 'Anything we should know?', value: 'We use a wheelchair' },
      { label: 'Bringing children?', value: 'Yes' },
    ]);
  });
  it('requires a name and a valid email when the form asks for them', () => {
    const r = validateFormSubmission(form, { ...good, name: ' ', email: 'ruth@' });
    assert.equal(r.ok, false);
    assert.ok(r.errors.name);
    assert.ok(r.errors.email);
  });
  it('refuses a required question left empty and a choice not on the list', () => {
    assert.ok(validateFormSubmission(form, { ...good, answers: [''] }).errors.q0);
    assert.ok(validateFormSubmission(form, { ...good, answers: ['Easter'] }).errors.q0);
  });
  it('checks a phone answer loosely and caps long answers', () => {
    assert.ok(
      validateFormSubmission(form, { ...good, answers: ['This one', '', false, 'call me'] }).errors
        .q3,
    );
    assert.ok(
      validateFormSubmission(form, { ...good, answers: ['This one', 'x'.repeat(2001)] }).errors.q1,
    );
  });
  it('ignores answers to questions the form does not ask', () => {
    const r = validateFormSubmission(form, {
      ...good,
      answers: [...good.answers, 'extra', 'more'],
    });
    assert.equal(r.value?.answers.length, 3);
  });
  it('drops the name and email of an anonymous prayer request', () => {
    const prayer = normalizeForm({
      _id: 'pr',
      mode: 'prayer',
      allowAnonymous: true,
      questions: [{ label: 'Your request', kind: 'textarea', required: true }],
    }) as ChurchForm;
    const r = validateFormSubmission(prayer, {
      anonymous: true,
      name: 'Should vanish',
      email: 'gone@example.org',
      answers: ['Please pray for my mother'],
    });
    assert.equal(r.ok, true);
    assert.equal(r.value?.name, '');
    assert.equal(r.value?.email, '');
    assert.equal(r.value?.anonymous, true);
  });
  it('does not honour "anonymous" on a form that does not offer it', () => {
    const r = validateFormSubmission(form, { ...good, anonymous: true, name: '' });
    assert.ok(r.errors.name);
  });
  it('refuses an entirely empty form', () => {
    const empty = normalizeForm({
      _id: 'e',
      askForContact: false,
      questions: [{ label: 'Anything?', kind: 'text' }],
    }) as ChurchForm;
    assert.ok(validateFormSubmission(empty, { answers: [''] }).errors.form);
  });
});

describe('recipients', () => {
  const map = parseRecipients(
    '{"office":"office@example.org","pastor":"pastor@example.org","bad":"nope"}',
  );
  it('parses the secret and drops anything that is not an address', () => {
    assert.deepEqual(Object.keys(map), ['office', 'pastor']);
    assert.deepEqual(parseRecipients('not json'), {});
    assert.deepEqual(parseRecipients('[1]'), {});
    assert.deepEqual(parseRecipients(undefined), {});
  });
  it('falls back to the office, then to the contact address', () => {
    assert.equal(recipientAddress('pastor', map), 'pastor@example.org');
    assert.equal(recipientAddress('youth', map), 'office@example.org');
    assert.equal(recipientAddress('youth', {}, 'to@example.org'), 'to@example.org');
    assert.equal(recipientAddress('youth', {}, ''), null);
  });
});

describe('buildFormNotification', () => {
  it('names the sender, lists the answers and escapes HTML', () => {
    const n = buildFormNotification(
      { title: 'Plan a visit', mode: 'standard' },
      {
        formId: 'f',
        name: 'Ruth <b>',
        email: 'ruth@example.org',
        anonymous: false,
        answers: [{ label: 'Note', value: '<script>' }],
        turnstileToken: null,
      },
      'FBC Auburn',
    );
    assert.equal(n.subject, 'Plan a visit: from Ruth <b>');
    assert.equal(n.replyTo, 'ruth@example.org');
    assert.ok(n.html.includes('&lt;script&gt;'));
    assert.ok(!n.html.includes('<script>'));
  });
  it('marks a prayer request and says when it came without a name', () => {
    const n = buildFormNotification(
      { title: 'Prayer', mode: 'prayer' },
      {
        formId: 'f',
        name: '',
        email: '',
        anonymous: true,
        answers: [{ label: 'Request', value: 'Healing' }],
        turnstileToken: null,
      },
      'FBC Auburn',
    );
    assert.equal(n.subject, 'Prayer request: from anonymous');
    assert.equal(n.replyTo, null);
    assert.ok(n.text.includes('Sent without a name'));
    assert.ok(n.text.includes('prayer request'));
  });
});

describe('the D1 migration', () => {
  it('matches FORM_SUBMISSIONS_DDL', () => {
    const sql = readFileSync(
      new URL('../../migrations/0002_form_submissions.sql', import.meta.url),
      'utf8',
    );
    assert.ok(sql.includes(FORM_SUBMISSIONS_DDL), 'copy FORM_SUBMISSIONS_DDL into the migration');
  });
});
