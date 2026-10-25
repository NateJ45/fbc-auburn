// Every week (gatherings.ts): the Find your place anchors, the gathering-to-card match and the
// per-gathering calendar file.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  everyWeek,
  fypIds,
  gatheringIcs,
  matchMinistry,
  ministryCards,
  nextDateFor,
} from './gatherings.ts';
import type { ServiceTime } from './church-facts.ts';

const time = (over: Partial<ServiceTime>): ServiceTime => ({
  key: 'k',
  label: 'Worship',
  day: 'sunday',
  dayIndex: 0,
  minutes: 660,
  timeLabel: '11:00 am',
  note: '',
  confirmed: false,
  ...over,
});

const groups = [
  { title: 'Every age', cards: [{ title: 'Sunday School' }] },
  { title: 'Kids and youth', cards: [{ title: 'Youth' }, { title: 'The children’s room' }] },
  { title: 'Adults', cards: [{ title: 'Bible study and prayer' }, { title: 'Music' }] },
  { title: 'Serve', cards: [{ title: 'Music' }] },
];

test('fypIds: groups keep their plain names, cards are prefixed, repeats numbered', () => {
  const ids = fypIds(groups);
  assert.deepEqual(
    ids.map((g) => g.group),
    ['every-age', 'kids-and-youth', 'adults', 'serve'],
  );
  assert.deepEqual(ids[1].cards, ['fyp-youth', 'fyp-the-childrens-room']);
  assert.deepEqual(ids[3].cards, ['fyp-music-2']);
});

test('matchMinistry: a gathering finds the card it is about', () => {
  const cards = ministryCards(groups);
  assert.equal(matchMinistry('Sunday School for all ages', cards)?.id, 'fyp-sunday-school');
  assert.equal(matchMinistry('Bible study and prayer', cards)?.id, 'fyp-bible-study-and-prayer');
  assert.equal(matchMinistry('Youth', cards)?.id, 'fyp-youth');
  assert.equal(matchMinistry('Worship', cards), null);
  // The first of a repeated name wins.
  assert.equal(matchMinistry('Music', cards)?.id, 'fyp-music');
});

test('everyWeek: Sunday first, then by time', () => {
  const rows = everyWeek({
    serviceTimes: [
      time({ key: 'wed', dayIndex: 3, minutes: 1080 }),
      time({ key: 'worship', minutes: 660 }),
      time({ key: 'school', minutes: 585 }),
    ],
  });
  assert.deepEqual(
    rows.map((r) => r.key),
    ['school', 'worship', 'wed'],
  );
});

test('nextDateFor: today counts, otherwise the next one', () => {
  // Wednesday 21 October 2026, noon in Ohio.
  const now = new Date('2026-10-21T16:00:00Z');
  assert.equal(nextDateFor(3, now), '2026-10-21');
  assert.equal(nextDateFor(0, now), '2026-10-25');
});

test('gatheringIcs: nothing until the time is confirmed, then a weekly event', () => {
  const now = new Date('2026-10-21T16:00:00Z');
  const facts = {
    serviceTimes: [time({ key: 'wed', label: 'Youth', dayIndex: 3, minutes: 1080 })],
    address: null,
    title: 'First Baptist Church of Auburn',
  };
  assert.equal(gatheringIcs(facts, 'wed', now, 'https://example.org'), null);
  facts.serviceTimes[0].confirmed = true;
  const ics = gatheringIcs(facts, 'wed', now, 'https://example.org') ?? '';
  assert.match(ics, /DTSTART;TZID=America\/New_York:20261021T180000/);
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=WE/);
  assert.match(ics, /SUMMARY:Youth\\, First Baptist Church of Auburn/);
  assert.equal(gatheringIcs(facts, 'missing', now, 'https://example.org'), null);
});
