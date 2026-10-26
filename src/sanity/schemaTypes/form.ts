// Safe to edit by hand
// =============================================================================
// form - a form the church writes itself (the form builder, 2026-10-18)
// =============================================================================
// The words of a form: its title, a sentence or two, its questions (the shared
// formQuestion type), who it goes to and what it says once sent. The "Form"
// section block (churchSections.ts) puts it on any page, and /api/form/
// (src/pages/api/form.ts) receives what visitors send. The logic both sides
// share is src/lib/church-form.ts.
//
// NO PERSONAL DATA IN SANITY. The public dataset holds the questions only.
// Answers go to the Worker, which stores them in its own D1 database and emails
// them; they never come back here. Who receives them is a recipient KEY from
// Site settings > Forms; the matching email address lives in the Worker's D1
// database, set there by an administrator (src/lib/form-recipients.ts, 2026-10-26), or in
// the Worker secret FORM_RECIPIENTS, never in the dataset (OPERATIONS.md, "Forms").
//
// RULE 8b: `mode` and `recipient` drive logic, so both are in NON_STEGA_FIELDS.
// =============================================================================

import { defineArrayMember, defineField, defineType } from 'sanity';
import { ClipboardIcon } from '@sanity/icons/Clipboard';
import { FormRecipientInput } from '../components/FormRecipientInput';
import { FormRecipientsInput } from '../components/FormRecipientEmails';

/** The recipients every site starts with. Their addresses are set in the Worker. */
export const DEFAULT_FORM_RECIPIENTS = [
  { _type: 'formRecipient', _key: 'office', key: 'office', name: 'Church office' },
  { _type: 'formRecipient', _key: 'pastor', key: 'pastor', name: 'Pastor' },
];

const PRAYER_WARNING =
  'Prayer request forms: what people write is emailed to the person you pick below and never saved in this editor. The website keeps no copy once the email has gone. Never paste someone’s prayer request into a page.';

export const form = defineType({
  name: 'form',
  title: 'Form',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Form name',
      type: 'string',
      description: 'Shown as the heading above the form, like "Prayer requests" or "VBS sign-up".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'mode',
      title: 'What kind of form is it?',
      type: 'string',
      options: {
        list: [
          { title: 'An ordinary form (sign-ups, questions, volunteers)', value: 'standard' },
          { title: 'Prayer requests (kept private)', value: 'prayer' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      validation: (R) => R.custom((mode) => (mode === 'prayer' ? PRAYER_WARNING : true)).warning(),
    }),
    defineField({
      name: 'intro',
      title: 'A sentence or two above the form (optional)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'recipient',
      title: 'Who receives it',
      type: 'string',
      description:
        'The people on this list are set in Site settings > Forms, where an administrator also sets the email address each one gets. Until someone has an address, their forms go to the church office.',
      components: { input: FormRecipientInput },
      initialValue: 'office',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'askForContact',
      title: 'Ask for their name and email',
      type: 'boolean',
      initialValue: true,
      description: 'On: the form starts with "Your name" and "Your email" so you can reply.',
    }),
    defineField({
      name: 'allowAnonymous',
      title: 'Let people send it without their name',
      type: 'boolean',
      initialValue: false,
      description:
        'Adds a "Send this without my name" checkbox. Good for prayer requests. You will not be able to reply to those.',
      hidden: ({ parent }) => parent?.askForContact === false,
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      description:
        'Up to 12. They come after the name and email boxes. Press Add item for a question, a date, or a list to tick any that apply.',
      // 2026-10-26: a date and "tick any that apply" join the shared question (formQuestionMore.ts).
      of: [
        defineArrayMember({ type: 'formQuestion' }),
        defineArrayMember({ type: 'formDateQuestion' }),
        defineArrayMember({ type: 'formTickQuestion' }),
      ],
      validation: (R) => R.max(12),
    }),
    defineField({
      name: 'submitLabel',
      title: 'Words on the send button (optional)',
      type: 'string',
      description: 'Leave empty for "Send" (or "Send my request" on a prayer form).',
      validation: (R) => R.max(30),
    }),
    defineField({
      name: 'successMessage',
      title: 'What it says once sent (optional)',
      type: 'text',
      rows: 2,
      description: 'Leave empty for "Thank you. Your message has been sent."',
    }),
  ],
  preview: {
    select: { title: 'title', mode: 'mode', recipient: 'recipient', questions: 'questions' },
    prepare: ({ title, mode, recipient, questions }) => ({
      title: title || 'Untitled form',
      subtitle: `${mode === 'prayer' ? 'Prayer requests' : 'Form'}, to ${recipient ?? 'office'}${
        Array.isArray(questions) ? `, ${questions.length} questions` : ''
      }`,
    }),
  },
});

/**
 * Site settings > Forms: the people forms can go to. Only a short key and a
 * name live here; the key is matched to an address in the Worker.
 */
export const formSettingsFields = [
  defineField({
    name: 'formRecipients',
    title: 'Who forms can go to',
    type: 'array',
    group: 'forms',
    description:
      'The names a form can be sent to. Their email addresses are not kept in this list, because this information is public: an administrator sets each one under the list, and it is kept on the website’s server. Rename freely.',
    initialValue: DEFAULT_FORM_RECIPIENTS,
    // 2026-10-26: the administrator-only "Where their messages go" panel under the list.
    components: { input: FormRecipientsInput },
    of: [
      defineArrayMember({
        type: 'object',
        name: 'formRecipient',
        title: 'Recipient',
        fields: [
          defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'Like "Pastor" or "Church office".',
            validation: (R) => R.required().max(60),
          }),
          defineField({
            name: 'key',
            title: 'Short code',
            type: 'string',
            description:
              'Lowercase letters only, like "office". The website uses it to find the email address. Do not change it once forms use it.',
            validation: (R) =>
              R.required().regex(/^[a-z][a-z0-9-]{1,30}$/, { name: 'lowercase code like office' }),
          }),
        ],
        preview: { select: { title: 'name', subtitle: 'key' } },
      }),
    ],
  }),
];
