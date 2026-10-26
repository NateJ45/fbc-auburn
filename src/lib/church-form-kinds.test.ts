// The two Auburn question kinds (2026-10-26): a date and "tick any that apply"
// (src/sanity/schemaTypes/formQuestionMore.ts), read, checked on the server and written into the
// email by src/lib/church-form.ts.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFormNotification,
  formDateLabel,
  normalizeForm,
  normalizeFormQuestions,
  validateFormSubmission,
  type ChurchForm,
} from './church-form.ts';

const FORM = normalizeForm({
  _id: 'f1',
  title: 'Volunteer',
  askForContact: false,
  questions: [
    { _type: 'formQuestion', label: 'Your name', kind: 'text', required: true },
    {
      _type: 'formTickQuestion',
      label: 'Which ministries?',
      options: ['Kitchen', 'Children', 'Kitchen', '', 'Music'],
      required: true,
    },
    { _type: 'formDateQuestion', label: 'Start date', notPast: true },
    { _type: 'formDateQuestion', label: 'Born on', notPast: false },
  ],
}) as ChurchForm;

// Wednesday, October 28, 2026, at 9 pm in Hamilton (already the 29th in UTC).
const NOW = new Date('2026-10-29T01:00:00Z');
const post = (answers: unknown[]) => validateFormSubmission(FORM, { formId: 'f1', answers }, NOW);

test('the questions read in order, with the choices cleaned', () => {
  assert.deepEqual(
    FORM.questions.map((q) => q.kind),
    ['text', 'multi', 'date', 'date'],
  );
  assert.deepEqual(FORM.questions[1].options, ['Kitchen', 'Children', 'Music']);
  assert.equal(FORM.questions[2].kind === 'date' && FORM.questions[2].notPast, true);
  // A tick question with no choices, or any question with no words, is dropped.
  assert.deepEqual(
    normalizeFormQuestions([
      { _type: 'formTickQuestion', label: 'Empty', options: [] },
      { _type: 'formDateQuestion', label: '' },
    ]),
    [],
  );
});

test('tick any: a list of choices on the list; required means at least one', () => {
  const ok = post(['Ann', ['Music', 'Kitchen'], '', '']);
  assert.equal(ok.ok, true);
  // Kept in the question's own order, and in plain words.
  assert.deepEqual(ok.value?.answers[1], {
    label: 'Which ministries?',
    value: 'Kitchen, Music',
    kind: 'multi',
    values: ['Kitchen', 'Music'],
  });
  assert.equal(post(['Ann', [], '', '']).errors.q1, 'Please tick at least one.');
  assert.equal(
    post(['Ann', ['Kitchen', 'Golf'], '', '']).errors.q1,
    'Please pick from the choices.',
  );
  assert.equal(post(['Ann', [3], '', '']).errors.q1, 'Please pick from the choices.');
  // One choice posted on its own (a page without the script) still counts.
  assert.equal(post(['Ann', 'Children', '', '']).ok, true);
});

test('a date: a real day, and not before today on the church clock', () => {
  const ok = post(['Ann', ['Music'], '2026-10-28', '1960-02-29']);
  assert.equal(ok.ok, true, JSON.stringify(ok.errors));
  assert.deepEqual(ok.value?.answers[2], {
    label: 'Start date',
    value: 'Wednesday, October 28, 2026',
    kind: 'date',
    values: ['2026-10-28'],
  });
  // "Born on" may be in the past.
  assert.equal(ok.value?.answers[3].value, 'Monday, February 29, 1960');
  assert.equal(
    post(['Ann', ['Music'], '2026-10-27', '']).errors.q2,
    'Please pick today or a day after.',
  );
  assert.equal(
    post(['Ann', ['Music'], '2026-02-30', '']).errors.q2,
    'That date does not look right.',
  );
  assert.equal(
    post(['Ann', ['Music'], 'next week', '']).errors.q2,
    'That date does not look right.',
  );
  // Not required and empty: simply left out.
  assert.equal(post(['Ann', ['Music'], '', '']).value?.answers.length, 2);
});

test('the email lists the ticked choices one per line and gives the date in words', () => {
  const v = post(['Ann', ['Kitchen', 'Music'], '2026-11-01', '']).value!;
  const note = buildFormNotification(FORM, v, 'FBC Auburn');
  assert.match(note.text, /Which ministries\?\n- Kitchen\n- Music\n/);
  assert.match(note.text, /Start date\nSunday, November 1, 2026/);
  assert.match(note.html, /<ul><li>Kitchen<\/li><li>Music<\/li><\/ul>/);
});

test('formDateLabel refuses what is not a date', () => {
  assert.equal(formDateLabel('2026-11-01'), 'Sunday, November 1, 2026');
  assert.equal(formDateLabel('2026-13-01'), '');
  assert.equal(formDateLabel('11/01/2026'), '');
});
