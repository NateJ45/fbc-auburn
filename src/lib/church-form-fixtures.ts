// Safe to edit by hand
// Two made-up forms for testing the form builder without the Sanity dataset: the
// /styleguide/sections/ wall draws them, and /api/form/ accepts them ONLY when the Worker has
// FORM_TEST_FIXTURES=1 (set in .dev.vars for `npm run preview`, never in production). Their ids
// start with "fixture-", which no Sanity document id does.

export const FIXTURE_FORMS: Record<string, Record<string, unknown>> = {
  'fixture-signup': {
    _id: 'fixture-signup',
    title: 'Sign up to help',
    intro: 'Tell us how you would like to help and we will be in touch.',
    mode: 'standard',
    askForContact: true,
    allowAnonymous: false,
    recipient: 'office',
    recipientName: 'Church office',
    questions: [
      {
        _key: 'q1',
        _type: 'formQuestion',
        label: 'Which would you like to help with?',
        kind: 'select',
        options: ['Greeting', 'Kitchen', 'Children'],
        required: true,
      },
      { _key: 'q2', _type: 'formQuestion', label: 'Phone (optional)', kind: 'phone' },
      { _key: 'q3', _type: 'formQuestion', label: 'Anything else?', kind: 'textarea' },
      { _key: 'q4', _type: 'formQuestion', label: 'I am over 18', kind: 'checkbox' },
      // The two Auburn kinds (2026-10-26, formQuestionMore.ts).
      {
        _key: 'q5',
        _type: 'formTickQuestion',
        label: 'Which Sundays could you help?',
        options: ['First Sunday', 'Second Sunday', 'Third Sunday', 'Fourth Sunday'],
      },
      { _key: 'q6', _type: 'formDateQuestion', label: 'When could you start?', notPast: true },
    ],
    submitLabel: 'Sign me up',
  },
  'fixture-prayer': {
    _id: 'fixture-prayer',
    title: 'Prayer requests',
    intro: 'Share what you would like us to pray about.',
    mode: 'prayer',
    askForContact: true,
    allowAnonymous: true,
    recipient: 'pastor',
    recipientName: 'Pastor',
    questions: [
      {
        _key: 'p1',
        _type: 'formQuestion',
        label: 'Your prayer request',
        kind: 'textarea',
        required: true,
      },
    ],
  },
};
