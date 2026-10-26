// Safe to edit by hand
// The one call components make for the church's facts: Site settings,
// resolved (src/lib/church-facts.ts). getSiteSettings() is memoized for the
// whole build, so any number of components calling this costs one fetch.
// Kept apart from church-facts.ts so that file stays pure for `node --test`.

import { getSiteSettings } from '@/lib/queries';
import {
  addDays,
  resolveChurchFacts,
  resolveTimeChanges,
  thisSunday,
  type ChurchFacts,
} from '@/lib/church-facts';
import { churchDataNow } from '@/lib/church-feeds';

/**
 * In a fixture build (CHURCH_DATA_FIXTURE=1, see church-feeds.ts) the events come from
 * tests/fixtures/church-calendar.ics; give the facts a stand-in feed address too, so the blocks
 * that offer "Add to your calendar" (the section library) have something to draw on the
 * /styleguide/sections/ wall and in its thumbnails. Never set on a real build.
 */
const FIXTURE_ICAL = 'https://calendar.example.test/church.ics';

export async function getChurchFacts(): Promise<ChurchFacts> {
  const facts = resolveChurchFacts(await getSiteSettings().catch(() => null));
  const fixture = (import.meta.env as Record<string, string | undefined>).CHURCH_DATA_FIXTURE;
  if (fixture === 'changes') return withFixtureChanges(facts);
  if (fixture && fixture !== 'unavailable' && !facts.icalUrl) {
    return { ...facts, icalUrl: FIXTURE_ICAL };
  }
  return facts;
}

/**
 * CHURCH_DATA_FIXTURE=changes (a local build only, never a deploy): the fixture feeds plus a
 * made-up "A different Sunday" for the coming Sunday (Worship at 10:30, no Sunday School, a
 * note) and an extra service on the Thursday after, so every place that shows the change can be
 * seen and screenshotted without touching the dataset (docs/agent/church-data.md, "Testing").
 */
function withFixtureChanges(facts: ChurchFacts): ChurchFacts {
  const sunday = thisSunday(facts, churchDataNow());
  if (!sunday) return { ...facts, icalUrl: facts.icalUrl ?? FIXTURE_ICAL };
  const first = facts.serviceTimes.find((s) => s.dayIndex === 0);
  const last = [...facts.serviceTimes].reverse().find((s) => s.dayIndex === 0);
  const raw = [
    ...(last
      ? [
          {
            _key: 'fx-time',
            date: sunday.date,
            change: 'time',
            service: last.key,
            time: '10:30 am',
          },
        ]
      : []),
    ...(first && first !== last
      ? [
          {
            _key: 'fx-off',
            date: sunday.date,
            change: 'cancelled',
            service: first.key,
            note: 'Weather: no Sunday School today',
          },
        ]
      : []),
    {
      _key: 'fx-extra',
      date: addDays(sunday.date, 4),
      change: 'extra',
      label: 'Thanksgiving Eve service',
      time: '7 pm',
    },
  ];
  return {
    ...facts,
    icalUrl: facts.icalUrl ?? FIXTURE_ICAL,
    timeChanges: [...facts.timeChanges, ...resolveTimeChanges(raw)],
  };
}
