// Safe to edit by hand
// Unit tests for the event and holiday page blocks' derived values (builder-blocks.ts): the time
// list, which dates are still to come, the place and directions, the calendar file and the card
// columns.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIME_OPTIONS,
  eventIcs,
  eventPlace,
  icsFileName,
  icsHref,
  minutesOf,
  photoCardColumns,
  timeOf,
  upcomingOccurrences,
} from './builder-blocks.ts';
import type { ChurchAddress } from './church-facts.ts';

const CHURCH: ChurchAddress = {
  street: '1 Test Road',
  city: 'Testville',
  state: 'OH',
  zip: '45000',
  lines: ['1 Test Road', 'Testville, OH 45000'],
  oneLine: '1 Test Road, Testville, OH 45000',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=1%20Test%20Road',
  appleMapsUrl: 'https://maps.apple.com/?q=1%20Test%20Road',
  geo: null,
  findUs: '',
  confirmed: true,
};

describe('times', () => {
  it('offers every quarter hour from 6 am to 11:45 pm', () => {
    assert.equal(TIME_OPTIONS[0].value, '06:00');
    assert.equal(TIME_OPTIONS[0].title, '6 am');
    assert.equal(TIME_OPTIONS.at(-1)?.value, '23:45');
    assert.equal(TIME_OPTIONS.find((t) => t.value === '12:00')?.title, '12 noon');
    assert.equal(TIME_OPTIONS.length, 72);
  });
  it('reads a stored time, stega and all', () => {
    assert.equal(minutesOf('16:30'), 990);
    assert.equal(minutesOf('16:30​‌'), 990);
    assert.equal(minutesOf('25:00'), null);
    assert.equal(minutesOf(''), null);
    assert.equal(timeOf('17:30'), '5:30 pm');
    assert.equal(timeOf(undefined), '');
  });
});

describe('upcomingOccurrences', () => {
  it('drops past dates, sorts the rest and builds the lines', () => {
    const rows = upcomingOccurrences(
      [
        {
          _key: 'b',
          date: '2026-12-24',
          startTime: '17:30',
          endTime: '18:30',
          label: 'Candlelight',
        },
        { _key: 'a', date: '2026-12-24', startTime: '16:00' },
        { _key: 'old', date: '2026-12-01', startTime: '10:00' },
        { _key: 'x', date: 'not a date' },
      ],
      '2026-12-10',
    );
    assert.deepEqual(
      rows.map((r) => [r.key, r.time, r.label]),
      [
        ['a', '4 pm', ''],
        ['b', '5:30 to 6:30 pm', 'Candlelight'],
      ],
    );
    assert.equal(rows[0].day, 'Thursday, December 24');
  });
  it('keeps today, treats no time as all day and ignores an end before the start', () => {
    const rows = upcomingOccurrences(
      [{ date: '2026-12-10' }, { date: '2026-12-11', startTime: '19:00', endTime: '18:00' }],
      '2026-12-10',
    );
    assert.equal(rows[0].time, 'All day');
    assert.equal(rows[1].time, '7 pm');
    assert.equal(rows[1].duration, null);
  });
  it('is empty once every date has passed', () => {
    assert.deepEqual(upcomingOccurrences([{ date: '2026-01-01' }], '2026-12-10'), []);
    assert.deepEqual(upcomingOccurrences(undefined, '2026-12-10'), []);
  });
});

describe('eventPlace', () => {
  it('uses a typed place over the church', () => {
    const p = eventPlace('Hamilton Park\n123 Main St', CHURCH);
    assert.deepEqual(p?.lines, ['Hamilton Park', '123 Main St']);
    assert.equal(p?.atChurch, false);
    assert.match(p!.mapsUrl, /query=Hamilton%20Park%2C%20123%20Main%20St$/);
  });
  it('falls back to the church address, left out of the calendar while unconfirmed', () => {
    assert.equal(eventPlace('', CHURCH)?.oneLine, CHURCH.oneLine);
    const unconfirmed = eventPlace(null, { ...CHURCH, confirmed: false });
    assert.equal(unconfirmed?.oneLine, '');
    assert.equal(unconfirmed?.confirmed, false);
    assert.equal(eventPlace('', null), null);
  });
});

describe('eventIcs', () => {
  const occ = upcomingOccurrences(
    [
      {
        _key: 'k1',
        date: '2026-12-24',
        startTime: '17:30',
        endTime: '18:15',
        label: 'Candlelight',
      },
      { _key: 'k2', date: '2026-12-25' },
    ],
    '2026-12-01',
  );
  const ics = eventIcs({
    title: 'Christmas Eve',
    occurrences: occ,
    place: eventPlace('', CHURCH),
    note: 'Bring a friend.',
    uidBase: 'abc',
    host: 'example.org',
    now: new Date('2026-12-01T12:00:00Z'),
  });
  it('writes one event per date in the church zone', () => {
    assert.match(ics, /DTSTART;TZID=America\/New_York:20261224T173000/);
    assert.match(ics, /DURATION:PT45M/);
    assert.match(ics, /DTSTART;VALUE=DATE:20261225/);
    assert.match(ics, /SUMMARY:Christmas Eve: Candlelight/);
    assert.match(ics, /LOCATION:1 Test Road\\, Testville\\, OH 45000/);
    assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 2);
  });
  it('is empty with no dates, and links as a data address', () => {
    assert.equal(
      eventIcs({
        title: 'x',
        occurrences: [],
        place: null,
        uidBase: 'a',
        host: 'h',
        now: new Date(),
      }),
      '',
    );
    assert.match(icsHref(ics), /^data:text\/calendar;charset=utf-8,BEGIN%3AVCALENDAR/);
    assert.equal(icsFileName('Christmas Eve at Auburn!'), 'christmas-eve-at-auburn.ics');
    assert.equal(icsFileName(''), 'event.ics');
  });
});

describe('photoCardColumns', () => {
  it('picks two or three across from the count', () => {
    assert.deepEqual([2, 3, 4, 5, 6].map(photoCardColumns), [2, 3, 2, 3, 3]);
  });
});
