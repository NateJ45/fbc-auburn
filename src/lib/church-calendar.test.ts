// The church calendar parser (src/lib/church-calendar.ts), ported with the
// file from First Baptist Muncie (clients/fbcm). These are its pure tests, the
// ones that build their own calendar inline; Muncie's real-feed tests stay
// there. Hamilton and Muncie keep the same Eastern clock, so the instants hold.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  daysPlural,
  occurrences,
  parseIcs,
  parseRrule,
  readStamp,
  timeLabel,
  timeRange,
  unfold,
  whenLine,
} from './church-calendar.ts';

const ics = (...events: string[][]) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...events.flatMap((e) => ['BEGIN:VEVENT', ...e, 'END:VEVENT']),
    'END:VCALENDAR',
  ].join('\r\n');

test('a TZID time is the church wall-clock time, whatever zone it names (the feed says Halifax)', () => {
  const s = readStamp('20260712T093000', { TZID: 'America/Halifax' });
  assert.deepEqual(s, { date: '2026-07-12', minutes: 570, zone: 'America/Halifax' });
});

test('a UTC time is converted to the church clock, DST included', () => {
  // 14:45Z is 10:45 am EDT in July and 9:45 am EST in December.
  assert.equal(readStamp('20260712T144500Z', {})?.minutes, 645);
  assert.equal(readStamp('20261213T144500Z', {})?.minutes, 585);
  // Late evening UTC is still the same church day... or the one before.
  assert.equal(readStamp('20261001T020000Z', {})?.date, '2026-09-30');
});

test('an all-day event has no time and spans its days (DTEND exclusive)', () => {
  const [ev] = parseIcs(
    ics(['UID:a', 'SUMMARY:Retreat', 'DTSTART;VALUE=DATE:20261009', 'DTEND;VALUE=DATE:20261012']),
  );
  assert.equal(ev.startMinutes, null);
  assert.equal(ev.allDayDays, 3);
  assert.equal(
    whenLine({ date: ev.date, through: null, allDayDays: 3 }),
    'October 9 to October 11',
  );
});

test('folded lines and escaped text are read back', () => {
  assert.deepEqual(unfold('SUMMARY:Messiah\r\n  Sing-In\r\nX:1'), [
    'SUMMARY:Messiah Sing-In',
    'X:1',
  ]);
  const [ev] = parseIcs(
    ics([
      'UID:b',
      'SUMMARY:Soup\\, salad\\; and pie',
      'DTSTART:20261001T180000',
      'DESCRIPTION:One\\nTwo',
    ]),
  );
  assert.equal(ev.title, 'Soup, salad; and pie');
  assert.equal(ev.description, 'One\nTwo');
});

test('RRULE: weekly with BYDAY, INTERVAL and COUNT; monthly by ordinal weekday', () => {
  const two = parseIcs(
    ics([
      'UID:c',
      'SUMMARY:Prayer',
      'DTSTART:20261005T120000',
      'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4',
    ]),
  );
  assert.deepEqual(
    occurrences(two, '2026-10-01', '2026-12-31').map((o) => o.date),
    ['2026-10-05', '2026-10-07', '2026-10-12', '2026-10-14'],
  );
  const fortnight = parseIcs(
    ics(['UID:d', 'SUMMARY:Life group', 'DTSTART:20261008T183000', 'RRULE:FREQ=WEEKLY;INTERVAL=2']),
  );
  assert.deepEqual(
    occurrences(fortnight, '2026-10-01', '2026-11-10').map((o) => o.date),
    ['2026-10-08', '2026-10-22', '2026-11-05'],
  );
  const monthly = parseIcs(
    ics(['UID:e', 'SUMMARY:Deacons', 'DTSTART:20261008T190000', 'RRULE:FREQ=MONTHLY;BYDAY=2TH']),
  );
  assert.deepEqual(
    occurrences(monthly, '2026-10-01', '2026-12-31').map((o) => o.date),
    ['2026-10-08', '2026-11-12', '2026-12-10'],
  );
  const last = parseIcs(
    ics(['UID:f', 'SUMMARY:Board', 'DTSTART:20261030T190000', 'RRULE:FREQ=MONTHLY;BYDAY=-1FR']),
  );
  assert.deepEqual(
    occurrences(last, '2026-10-01', '2026-12-31').map((o) => o.date),
    ['2026-10-30', '2026-11-27', '2026-12-25'],
  );
});

test('EXDATE and a cancelled event are left out', () => {
  const evs = parseIcs(
    ics(
      [
        'UID:g',
        'SUMMARY:Choir',
        'DTSTART:20261001T190000',
        'RRULE:FREQ=WEEKLY;COUNT=3',
        'EXDATE:20261008T190000',
      ],
      ['UID:h', 'SUMMARY:Picnic', 'DTSTART:20261003T120000', 'STATUS:CANCELLED'],
    ),
  );
  assert.deepEqual(
    occurrences(evs, '2026-10-01', '2026-10-31').map((o) => o.date),
    ['2026-10-01', '2026-10-15'],
  );
});

test('a rule not read here shows the event once, never invented dates', () => {
  assert.equal(parseRrule('FREQ=MONTHLY;BYDAY=TH;BYSETPOS=2'), null);
  const [ev] = parseIcs(
    ics([
      'UID:i',
      'SUMMARY:Odd',
      'DTSTART:20261001T190000',
      'RRULE:FREQ=MONTHLY;BYDAY=TH;BYSETPOS=2',
    ]),
  );
  assert.equal(ev.recurrence, null);
  assert.ok(ev.unreadRule);
  assert.equal(occurrences([ev], '2026-10-01', '2026-12-31').length, 1);
});

test('words: times, ranges and days', () => {
  assert.equal(timeLabel(570), '9:30 am');
  assert.equal(timeLabel(19 * 60), '7 pm');
  assert.equal(timeLabel(720), '12 noon');
  assert.equal(timeLabel(0), '12 am');
  assert.equal(timeRange(19 * 60, 90), '7 to 8:30 pm');
  assert.equal(timeRange(11 * 60 + 30, 90), '11:30 am to 1 pm');
  assert.equal(timeRange(null, null), 'All day');
  assert.equal(timeRange(645, null), '10:45 am');
  assert.equal(daysPlural([0]), 'Sundays');
  assert.equal(daysPlural([1, 3]), 'Mondays and Wednesdays');
  assert.equal(daysPlural([2, 3, 4]), 'Tuesdays, Wednesdays and Thursdays');
});
