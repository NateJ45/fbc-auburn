// A different Sunday (2026-10-26): dated changes to the usual times in Church facts, applied by
// src/lib/church-facts.ts (dayPlan, thisSunday, thisWeek, churchJsonLd, sundayIcs) and
// src/lib/gatherings.ts (gatheringIcs). Instants are UTC with the church's wall clock beside them:
// EDT is UTC-4 until November 1, 2026, then EST is UTC-5.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  changeSummary,
  churchIso,
  churchJsonLd,
  dayPlan,
  parseFriendlyTime,
  resolveChurchFacts,
  resolveTimeChanges,
  sundayIcs,
  sundayLineServices,
  thisSunday,
  thisWeek,
  upcomingChanges,
  type RawTimeChange,
} from './church-facts.ts';
import { gatheringIcs } from './gatherings.ts';

const BASE = {
  churchAddress: { street: '1 Main St', city: 'Hamilton', state: 'OH', confirmed: true },
  serviceTimes: [
    {
      _key: 'ss',
      label: 'Sunday School for all ages',
      day: 'sunday',
      time: '09:45',
      confirmed: true,
    },
    { _key: 'w', label: 'Worship', day: 'sunday', time: '11:00', confirmed: true },
    { _key: 'b', label: 'Bible study', day: 'wednesday', time: '18:00', confirmed: true },
  ],
};

const facts = (timeChanges: RawTimeChange[]) => resolveChurchFacts({ ...BASE, timeChanges });

// Wednesday, October 28, 2026, noon in Hamilton.
const WED = new Date('2026-10-28T16:00:00Z');

test('friendly times: am/pm, the 24-hour clock, noon; a bare hour is refused', () => {
  assert.equal(parseFriendlyTime('10:30'), 630);
  assert.equal(parseFriendlyTime('10:30 am'), 630);
  assert.equal(parseFriendlyTime('6 pm'), 1080);
  assert.equal(parseFriendlyTime('6:30PM'), 1110);
  assert.equal(parseFriendlyTime('6 p.m.'), 1080);
  assert.equal(parseFriendlyTime('18:00'), 1080);
  assert.equal(parseFriendlyTime('12 am'), 0);
  assert.equal(parseFriendlyTime('12 pm'), 720);
  assert.equal(parseFriendlyTime('noon'), 720);
  assert.equal(parseFriendlyTime('6'), null);
  assert.equal(parseFriendlyTime('13 pm'), null);
  assert.equal(parseFriendlyTime('soon'), null);
});

test('half-filled entries are dropped, the rest sorted by date', () => {
  const list = resolveTimeChanges([
    { _key: 'a', date: '2026-11-08', change: 'cancelled', service: 'w' },
    { _key: 'b', date: '2026-11-01', change: 'time', service: 'w' }, // no time
    { _key: 'c', date: '2026-02-30', change: 'cancelled', service: 'all' }, // not a date
    { _key: 'd', date: '2026-11-01', change: 'extra', time: '6 pm' }, // no name
    { _key: 'e', date: '2026-11-01', change: 'moved', service: 'w', time: '10:30' }, // no such kind
    { _key: 'f', date: '2026-11-01', change: 'time', service: 'all', time: '10:30' }, // all + time
    { _key: 'g', date: '2026-11-01', change: 'time', service: 'w', time: '10:30' },
  ]);
  assert.deepEqual(
    list.map((c) => c.key),
    ['g', 'a'],
  );
  assert.equal(list[1].service, 'w');
});

test('a different time on the coming Sunday shows on the This Sunday card', () => {
  const f = facts([
    {
      _key: 'g',
      date: '2026-11-01',
      change: 'time',
      service: 'w',
      time: '10:30 am',
      note: 'Fall back: clocks change tonight',
    },
  ]);
  const s = thisSunday(f, WED);
  assert.ok(s);
  assert.equal(s.date, '2026-11-01');
  assert.equal(s.changed, true);
  assert.deepEqual(
    s.services.map((x) => [x.label, x.timeLabel, x.movedFrom]),
    [
      ['Sunday School for all ages', '9:45 am', null],
      ['Worship', '10:30 am', '11:00 am'],
    ],
  );
  assert.equal(
    s.change,
    'Worship at 10:30 am instead of 11:00 am. Fall back: clocks change tonight.',
  );
  // The usual times are still there for whatever needs them.
  assert.deepEqual(
    s.regular.map((x) => x.timeLabel),
    ['9:45 am', '11:00 am'],
  );
});

test('matching by name: "Sunday School" finds "Sunday School for all ages"; "all" cancels the day', () => {
  const byName = thisSunday(
    facts([
      {
        date: '2026-11-01',
        change: 'cancelled',
        service: 'Sunday School',
        note: 'Weather: no Sunday School today',
      },
    ]),
    WED,
  );
  assert.deepEqual(
    byName?.services.map((x) => x.label),
    ['Worship'],
  );
  assert.equal(byName?.change, 'No Sunday School. Weather: no Sunday School today.');

  const all = thisSunday(facts([{ date: '2026-11-01', change: 'cancelled', service: 'all' }]), WED);
  assert.deepEqual(all?.services, []);
  assert.equal(all?.change, 'No Sunday School or Worship.');
});

test('an extra service joins the day; a cancellation beats a new time', () => {
  const plan = dayPlan(
    facts([
      { _key: 'x', date: '2026-11-01', change: 'extra', label: 'Hymn sing', time: '6 pm' },
      { date: '2026-11-01', change: 'time', service: 'w', time: '10:30' },
      { date: '2026-11-01', change: 'cancelled', service: 'w' },
    ]),
    '2026-11-01',
  );
  assert.deepEqual(
    plan.services.map((x) => [x.label, x.timeLabel, x.extra]),
    [
      ['Sunday School for all ages', '9:45 am', false],
      ['Hymn sing', '6:00 pm', true],
    ],
  );
  assert.equal(changeSummary(plan), 'Hymn sing at 6:00 pm. No Worship.');
});

test('entries on other weekdays: a Worship change on a Thursday changes nothing; an extra service is added', () => {
  const f = facts([
    { date: '2026-12-24', change: 'time', service: 'w', time: '18:00' },
    { date: '2026-12-24', change: 'extra', label: 'Christmas Eve candlelight', time: '6 pm' },
  ]);
  const plan = dayPlan(f, '2026-12-24');
  assert.deepEqual(
    plan.services.map((x) => [x.label, x.timeLabel]),
    [['Christmas Eve candlelight', '6:00 pm']],
  );
  // The Sunday before and after are untouched.
  assert.equal(dayPlan(f, '2026-12-20').changed, false);
  assert.equal(dayPlan(f, '2026-12-27').changed, false);
  // This week on Monday the 21st shows the extra service on Thursday, marked for this week only.
  const rows = thisWeek(f, [], new Date('2026-12-21T17:00:00Z'));
  const eve = rows.find((r) => r.date === '2026-12-24');
  assert.equal(eve?.what, 'Christmas Eve candlelight');
  assert.equal(eve?.time, '6:00 pm');
  assert.equal(eve?.note, 'This week only');
});

test('past entries are ignored, and the day after everything is back to normal', () => {
  const f = facts([{ date: '2026-11-01', change: 'time', service: 'w', time: '10:30' }]);
  // Sunday afternoon after worship (14:30 EST = 19:30 UTC): This Sunday is next week, as usual.
  const after = thisSunday(f, new Date('2026-11-01T19:30:00Z'));
  assert.equal(after?.date, '2026-11-08');
  assert.equal(after?.changed, false);
  // Monday morning: nothing upcoming, the lines are the usual ones.
  const monday = new Date('2026-11-02T11:00:00Z');
  assert.deepEqual(upcomingChanges(f, monday), []);
  assert.deepEqual(
    sundayLineServices(f, monday).services.map((s) => s.timeLabel),
    ['9:45 am', '11:00 am'],
  );
  assert.equal(
    thisWeek(f, [], monday).some((r) => r.note),
    false,
  );
});

test('the church clock decides the day (America/New_York), not UTC', () => {
  const f = facts([{ date: '2026-11-01', change: 'cancelled', service: 'ss' }]);
  // Saturday October 31, 10 pm EDT is already Sunday in UTC; it is still Saturday at church, so
  // the change is upcoming and This Sunday is November 1.
  const sat = new Date('2026-11-01T02:00:00Z');
  assert.equal(upcomingChanges(f, sat).length, 1);
  assert.equal(thisSunday(f, sat)?.date, '2026-11-01');
  assert.equal(thisSunday(f, sat)?.changed, true);
  // Sunday November 1, 9 pm EST is Monday in UTC; at church it is still Sunday, so the entry is
  // today's and not yet past.
  assert.equal(upcomingChanges(f, new Date('2026-11-02T02:00:00Z')).length, 1);
  // Monday 00:30 EST: past.
  assert.equal(upcomingChanges(f, new Date('2026-11-02T05:30:00Z')).length, 0);
});

test('on the day, a later new time keeps "Today" for longer', () => {
  const f = facts([{ date: '2026-11-01', change: 'time', service: 'w', time: '13:00' }]);
  // 13:30 EST: past 11:00 + 90 minutes, but the moved worship started at 1 pm.
  const s = thisSunday(f, new Date('2026-11-01T18:30:00Z'));
  assert.equal(s?.isToday, true);
});

test('This week strikes a cancelled gathering through and notes a new time', () => {
  const f = facts([
    { date: '2026-11-01', change: 'cancelled', service: 'ss', note: 'Snow' },
    { date: '2026-11-01', change: 'time', service: 'w', time: '11:30' },
  ]);
  const rows = thisWeek(f, [], WED).filter((r) => r.date === '2026-11-01');
  assert.deepEqual(
    rows.map((r) => [r.what, r.time, r.cancelled, r.note]),
    [
      ['Sunday School for all ages', '9:45 am', true, 'Cancelled this week. Snow'],
      ['Worship', '11:30 am', false, 'Instead of 11:00 am'],
    ],
  );
});

test('churchIso gives the right offset either side of the clock change', () => {
  assert.equal(churchIso('2026-10-25', 660), '2026-10-25T11:00:00-04:00');
  assert.equal(churchIso('2026-11-01', 630), '2026-11-01T10:30:00-05:00');
});

test('JSON-LD: the date comes off the weekly schedule and is told as its own event', () => {
  const f = facts([
    { date: '2026-11-01', change: 'time', service: 'w', time: '10:30' },
    { date: '2026-11-08', change: 'cancelled', service: 'ss' },
    { date: '2026-12-24', change: 'extra', label: 'Christmas Eve candlelight', time: '18:00' },
    { date: '2026-10-18', change: 'cancelled', service: 'w' }, // past
  ]);
  const ld = churchJsonLd(f, WED) as { event: Record<string, unknown>[] };
  const worship = ld.event.find((e) => e.name === 'Worship' && e.eventSchedule) as {
    eventSchedule: { exceptDate?: string[] };
  };
  assert.deepEqual(worship.eventSchedule.exceptDate, ['2026-11-01']);
  const oneOff = ld.event.filter((e) => e.startDate);
  assert.deepEqual(
    oneOff.map((e) => [e.name, e.startDate, String(e.eventStatus).split('/').pop()]),
    [
      ['Worship', '2026-11-01T10:30:00-05:00', 'EventRescheduled'],
      ['Sunday School for all ages', '2026-11-08T09:45:00-05:00', 'EventCancelled'],
      ['Christmas Eve candlelight', '2026-12-24T18:00:00-05:00', 'EventScheduled'],
    ],
  );
  // Without the build moment nothing dated is told (the old behaviour).
  const plain = churchJsonLd(f) as { event: Record<string, unknown>[] };
  assert.equal(
    plain.event.some((e) => e.startDate),
    false,
  );
});

test('JSON-LD keeps a change to an unconfirmed gathering to itself', () => {
  const f = resolveChurchFacts({
    serviceTimes: [{ _key: 'w', label: 'Worship', day: 'sunday', time: '11:00', confirmed: false }],
    timeChanges: [{ date: '2026-11-01', change: 'time', service: 'w', time: '10:30' }],
  });
  assert.equal(churchJsonLd(f, WED).event, undefined);
});

test('/sunday.ics: an EXDATE for a cancelled Sunday, a RECURRENCE-ID for a new time', () => {
  const f = facts([
    { date: '2026-11-01', change: 'time', service: 'w', time: '10:30' },
    { date: '2026-11-08', change: 'cancelled', service: 'ss' },
    { _key: 'hs', date: '2026-11-15', change: 'extra', label: 'Hymn sing', time: '6 pm' },
  ]);
  const ics = sundayIcs(f, WED, 'https://example.org') ?? '';
  assert.match(ics, /EXDATE;TZID=America\/New_York:20261108T094500/);
  assert.match(
    ics,
    /RECURRENCE-ID;TZID=America\/New_York:20261101T110000\r\nDTSTART;TZID=America\/New_York:20261101T103000/,
  );
  assert.match(ics, /UID:extra-hs-2026-11-15@example\.org/);
  assert.match(ics, /SUMMARY:Hymn sing/);
  // The weekly event itself still starts at the usual time.
  assert.match(
    ics,
    /UID:sunday-w@example\.org\r\nDTSTAMP:\d+T\d+Z\r\nDTSTART;TZID=America\/New_York:20261101T110000/,
  );
});

test('/calendar/<key>.ics carries the same exceptions, and nothing extra when there are none', () => {
  const f = facts([
    { date: '2026-11-04', change: 'cancelled', service: 'b' },
    { date: '2026-11-11', change: 'time', service: 'Bible study', time: '7 pm' },
  ]);
  const ics = gatheringIcs(f, 'b', WED, 'https://example.org') ?? '';
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=WE\r\nEXDATE;TZID=America\/New_York:20261104T180000/);
  assert.match(
    ics,
    /RECURRENCE-ID;TZID=America\/New_York:20261111T180000\r\nDTSTART;TZID=America\/New_York:20261111T190000/,
  );
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  const usual = gatheringIcs(facts([]), 'b', WED, 'https://example.org') ?? '';
  assert.doesNotMatch(usual, /EXDATE|RECURRENCE-ID/);
});

test('no entries: everything reads exactly as before', () => {
  const f = facts([]);
  const s = thisSunday(f, WED);
  assert.equal(s?.changed, false);
  assert.equal(s?.change, '');
  assert.deepEqual(
    s?.services.map((x) => x.key),
    ['ss', 'w'],
  );
  assert.equal(
    thisWeek(f, [], WED).every((r) => r.note === ''),
    true,
  );
});

test('the Live now banner keys on the coming Sunday: a new time moves it, a cancellation drops it', async () => {
  const { worshipStartThisSunday } = await import('./live-service.ts');
  assert.equal(worshipStartThisSunday(facts([]), WED), 660);
  assert.equal(
    worshipStartThisSunday(
      facts([{ date: '2026-11-01', change: 'time', service: 'w', time: '10:30' }]),
      WED,
    ),
    630,
  );
  assert.equal(
    worshipStartThisSunday(facts([{ date: '2026-11-01', change: 'cancelled', service: 'w' }]), WED),
    null,
  );
  // A change to Sunday School alone leaves worship's time as it is.
  assert.equal(
    worshipStartThisSunday(
      facts([{ date: '2026-11-01', change: 'cancelled', service: 'ss' }]),
      WED,
    ),
    660,
  );
});
