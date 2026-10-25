// Calendar events as schema.org Events (structured-data.ts).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calendarEventsJsonLd, churchDateTime, churchOffset } from './structured-data.ts';
import type { DatedItem } from './church-calendar.ts';

const row = (over: Partial<DatedItem>): DatedItem => ({
  key: 'k',
  title: 'Trunk or treat',
  location: '',
  description: '',
  date: '2026-10-31',
  startMinutes: 18 * 60,
  durationMinutes: 120,
  allDayDays: 1,
  through: null,
  times: 1,
  ...over,
});
const opts = {
  organizerId: 'https://example.org/#business',
  churchName: 'First Baptist',
  address: { '@type': 'PostalAddress', streetAddress: '1 Main St' },
};

describe('church clock offsets', () => {
  it('is -04:00 in summer time and -05:00 in winter', () => {
    assert.equal(churchOffset('2026-07-05', 600), '-04:00');
    assert.equal(churchOffset('2026-12-06', 600), '-05:00');
    // The first Sunday of November 2026 is the 1st: 10:30 that morning is already winter time.
    assert.equal(churchOffset('2026-11-01', 630), '-05:00');
  });
  it('writes a local time with its offset, rolling past midnight', () => {
    assert.equal(churchDateTime('2026-10-31', 18 * 60), '2026-10-31T18:00:00-04:00');
    assert.equal(churchDateTime('2026-12-31', 23 * 60 + 90), '2027-01-01T00:30:00-05:00');
  });
});

describe('calendarEventsJsonLd', () => {
  it('is null with no rows', () => {
    assert.equal(calendarEventsJsonLd([], opts), null);
  });
  it('gives each row a start, an end, the church as place and organiser', () => {
    const ld = JSON.parse(calendarEventsJsonLd([row({})], opts)!);
    assert.equal(ld['@context'], 'https://schema.org');
    const [e] = ld['@graph'];
    assert.equal(e['@type'], 'Event');
    assert.equal(e.name, 'Trunk or treat');
    assert.equal(e.startDate, '2026-10-31T18:00:00-04:00');
    assert.equal(e.endDate, '2026-10-31T20:00:00-04:00');
    assert.equal(e.location.name, 'First Baptist');
    assert.equal(e.location.address.streetAddress, '1 Main St');
    assert.equal(e.organizer['@id'], 'https://example.org/#business');
    assert.equal(e.eventAttendanceMode, 'https://schema.org/OfflineEventAttendanceMode');
    assert.equal(e.eventSchedule, undefined);
  });
  it('names another place without the church address', () => {
    const [e] = JSON.parse(calendarEventsJsonLd([row({ location: 'The park' })], opts)!)['@graph'];
    assert.equal(e.location.name, 'The park');
    assert.equal(e.location.address, undefined);
  });
  it('an all-day event is dates only', () => {
    const [e] = JSON.parse(
      calendarEventsJsonLd(
        [row({ startMinutes: null, durationMinutes: null, allDayDays: 3, date: '2026-11-06' })],
        opts,
      )!,
    )['@graph'];
    assert.equal(e.startDate, '2026-11-06');
    assert.equal(e.endDate, '2026-11-08');
  });
  it('a weekly run carries its schedule', () => {
    const [e] = JSON.parse(
      calendarEventsJsonLd(
        [row({ date: '2026-10-27', through: '2026-11-17', times: 4, startMinutes: 19 * 60 })],
        opts,
      )!,
    )['@graph'];
    assert.equal(e.eventSchedule.repeatFrequency, 'P1W');
    assert.equal(e.eventSchedule.byDay, 'https://schema.org/Tuesday');
    assert.equal(e.eventSchedule.endDate, '2026-11-17');
    assert.equal(e.eventSchedule.startTime, '19:00');
  });
});
