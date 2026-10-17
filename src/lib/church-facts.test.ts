// The church facts resolver and what is derived from it (src/lib/church-facts.ts):
// fallbacks, the confirmed flags, the "This Sunday" line and the "This week" rows.
// Instants are UTC with the church's wall clock beside them (EDT is UTC-4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calendarPageFor,
  clockLabel,
  FALLBACK_FACTS,
  parseClock,
  resolveChurchFacts,
  thisSunday,
  thisWeek,
  timesPhrase,
} from './church-facts.ts';
import { parseIcs } from './church-calendar.ts';

const SETTINGS = {
  churchAddress: {
    street: '1 Main St',
    city: 'Hamilton',
    state: 'OH',
    zip: '45013',
    confirmed: true,
  },
  serviceTimes: [
    { _key: 'w', label: 'Worship', day: 'sunday', time: '11:00', confirmed: true },
    { _key: 's', label: 'Sunday School', day: 'sunday', time: '09:45', confirmed: false },
    { _key: 'b', label: 'Bible study', day: 'wednesday', time: '18:00', confirmed: true },
    { _key: 'x', label: 'Half-filled', day: 'friday', time: 'noon' },
  ],
  phone: '(513) 555-0100',
  phoneConfirmed: true,
  foundedYear: 1960,
  foundedConfirmed: true,
  youtubeChannelId: 'UCabcdefghijklmnopqrstuv',
  churchTracIcalUrl: 'webcal://www.churchtrac.com/ical?ui=ABC123',
};

// Wednesday 2026-10-21, noon in Hamilton.
const WEDNESDAY = new Date('2026-10-21T16:00:00Z');

test('clock words', () => {
  assert.equal(parseClock('09:45'), 585);
  assert.equal(parseClock('24:00'), null);
  assert.equal(parseClock('​11:00﻿'), 660, 'stega payload is ignored');
  assert.equal(clockLabel(585), '9:45 am');
  assert.equal(clockLabel(720), '12:00 pm');
  assert.equal(clockLabel(1080), '6:00 pm');
  assert.equal(timesPhrase([660, 585]), '9:45 and 11:00 am');
  assert.equal(timesPhrase([660, 1080]), '11:00 am and 6:00 pm');
  assert.equal(timesPhrase([540, 585, 660]), '9:00, 9:45 and 11:00 am');
});

test('settings resolve, times sorted Sunday first, half-filled rows skipped', () => {
  const f = resolveChurchFacts(SETTINGS);
  assert.deepEqual(
    f.serviceTimes.map((s) => [s.label, s.timeLabel, s.confirmed]),
    [
      ['Sunday School', '9:45 am', false],
      ['Worship', '11:00 am', true],
      ['Bible study', '6:00 pm', true],
    ],
  );
  assert.deepEqual(f.address?.lines, ['1 Main St', 'Hamilton, OH 45013']);
  assert.equal(f.address?.confirmed, true);
  assert.match(f.address!.mapsUrl, /query=1%20Main%20St%2C%20Hamilton%2C%20OH%2C%2045013$/);
  assert.deepEqual(f.phone, {
    display: '(513) 555-0100',
    tel: 'tel:+15135550100',
    confirmed: true,
  });
  assert.deepEqual(f.founded, { year: 1960, confirmed: true });
  assert.equal(f.youtubeChannelId, 'UCabcdefghijklmnopqrstuv');
  assert.equal(f.icalUrl, 'https://www.churchtrac.com/ical?ui=ABC123');
  assert.equal(
    f.calendarPageUrl,
    'https://www.churchtrac.com/public_calendar?ui=ABC123&view=listMonth',
  );
});

test('an empty settings document falls back to the published facts, all unconfirmed', () => {
  const f = resolveChurchFacts(null);
  assert.equal(f.address?.street, FALLBACK_FACTS.churchAddress.street);
  assert.equal(f.address?.confirmed, false);
  assert.equal(f.serviceTimes.length, 3);
  assert.ok(f.serviceTimes.every((s) => s.confirmed === false));
  assert.deepEqual(f.founded, { year: 1959, confirmed: false });
  assert.equal(f.phone, null, 'no phone is ever invented');
  assert.equal(f.youtubeChannelId, null);
  assert.equal(f.icalUrl, null);
});

test('bad channel ids and calendar addresses are dropped, not fetched', () => {
  const f = resolveChurchFacts({ youtubeChannelId: 'not-a-channel', churchTracIcalUrl: 'ftp://x' });
  assert.equal(f.youtubeChannelId, null);
  assert.equal(f.icalUrl, null);
  assert.equal(calendarPageFor('https://example.com/cal.ics'), null);
});

test('This Sunday: the coming Sunday, today until after the last service', () => {
  const f = resolveChurchFacts(SETTINGS);
  const wed = thisSunday(f, WEDNESDAY)!;
  assert.equal(wed.date, '2026-10-25');
  assert.equal(wed.dateLabel, 'Sunday, October 25');
  assert.equal(wed.isToday, false);
  assert.equal(wed.services.length, 2);
  assert.equal(wed.confirmed, false, 'one Sunday time is unconfirmed');
  // Sunday 10:00 am: today.
  assert.equal(thisSunday(f, new Date('2026-10-25T14:00:00Z'))!.isToday, true);
  // Sunday 12:29 pm (11:00 + 89 min): still today. 12:31 pm: next week.
  assert.equal(thisSunday(f, new Date('2026-10-25T16:29:00Z'))!.date, '2026-10-25');
  assert.equal(thisSunday(f, new Date('2026-10-25T16:31:00Z'))!.date, '2026-11-01');
  // Saturday 11:30 pm is Sunday in UTC: still Saturday here.
  assert.equal(thisSunday(f, new Date('2026-10-25T03:30:00Z'))!.date, '2026-10-25');
  assert.equal(thisSunday({ serviceTimes: [] }, WEDNESDAY), null);
});

test('This week: services merged per day, calendar events added, duplicates and the past left out', () => {
  const f = resolveChurchFacts(SETTINGS);
  const events = parseIcs(
    readFileSync(new URL('../../tests/fixtures/church-calendar.ics', import.meta.url), 'utf8'),
  );
  const rows = thisWeek(f, events, WEDNESDAY);
  assert.deepEqual(
    rows.map((r) => [r.when, r.dateLabel, r.what, r.time, r.confirmed]),
    [
      ['Today', 'October 21', 'Bible study', '6:00 pm', true],
      ['Thursday', 'October 22', 'Youth group', '6:30 pm', true],
      ['Saturday', 'October 24', 'Fall festival', 'All day', true],
      ['Sunday', 'October 25', 'Sunday School and Worship', '9:45 and 11:00 am', false],
    ],
  );
  // The feed's own "Worship" at Sunday 11:00 is the same gathering: not a second row.
  assert.ok(!rows.some((r) => r.source === 'calendar' && r.what === 'Worship'));
  assert.equal(rows[1].where, 'Fellowship hall');
});

test('This week on a Wednesday evening: tonight has started, so next Wednesday shows', () => {
  const f = resolveChurchFacts(SETTINGS);
  const rows = thisWeek(f, null, new Date('2026-10-21T22:30:00Z')); // 6:30 pm
  assert.deepEqual(
    rows.map((r) => [r.when, r.dateLabel]),
    [
      ['Sunday', 'October 25'],
      ['Wednesday', 'October 28'],
    ],
  );
});

test('structured data carries only confirmed facts', async () => {
  const { churchJsonLd } = await import('./church-facts.ts');
  assert.deepEqual(churchJsonLd(resolveChurchFacts(null)), {}, 'the fallbacks are unconfirmed');
  const ld = churchJsonLd(resolveChurchFacts(SETTINGS));
  assert.equal((ld.address as { streetAddress: string }).streetAddress, '1 Main St');
  assert.equal(ld.telephone, '(513) 555-0100');
  const unconfirmed = churchJsonLd(
    resolveChurchFacts({
      ...SETTINGS,
      phoneConfirmed: false,
      churchAddress: { ...SETTINGS.churchAddress, confirmed: false },
    }),
  );
  assert.deepEqual(unconfirmed, {});
});
