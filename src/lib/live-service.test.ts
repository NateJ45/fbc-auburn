// "Live now" (src/lib/live-service.ts): the window on the church's clock, the endpoint's
// override, and the settings the pages carry. Dates are real: 2026-10-25 is a Sunday in daylight
// time (11:00 am Eastern is 15:00 UTC), 2026-11-08 a Sunday in standard time (16:00 UTC).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_FRESH_MS,
  inCheckWindow,
  isLiveNow,
  liveState,
  safeLiveUrl,
  watchLabel,
  watchLive,
  weekMinutesIn,
  worshipStart,
} from './live-service.ts';

const ELEVEN = 660;
const at = (iso: string) => new Date(iso);

test('worship is the last Sunday gathering; weekday gatherings do not count', () => {
  const facts = {
    serviceTimes: [
      { dayIndex: 0, minutes: 585 },
      { dayIndex: 0, minutes: 660 },
      { dayIndex: 3, minutes: 1110 },
    ],
  } as never;
  assert.equal(worshipStart(facts), 660);
  assert.equal(worshipStart({ serviceTimes: [{ dayIndex: 3, minutes: 1110 }] } as never), null);
});

test('the window: 5 minutes before worship to 80 after, church time, either side of DST', () => {
  assert.equal(isLiveNow(at('2026-10-25T14:54:00Z'), ELEVEN), false, '10:54');
  assert.equal(isLiveNow(at('2026-10-25T14:55:00Z'), ELEVEN), true, '10:55');
  assert.equal(isLiveNow(at('2026-10-25T16:19:00Z'), ELEVEN), true, '12:19');
  assert.equal(isLiveNow(at('2026-10-25T16:20:00Z'), ELEVEN), false, '12:20');
  assert.equal(isLiveNow(at('2026-11-08T16:10:00Z'), ELEVEN), true, '11:10 in standard time');
  assert.equal(isLiveNow(at('2026-11-08T15:10:00Z'), ELEVEN), false, '10:10 in standard time');
  assert.equal(isLiveNow(at('2026-10-28T15:10:00Z'), ELEVEN), false, 'a Wednesday');
  assert.equal(isLiveNow(at('2026-10-25T15:10:00Z'), null), false, 'no Sunday gathering');
  assert.equal(weekMinutesIn(at('2026-10-25T15:00:00Z')), 660);
});

test('the check window is wider: an hour before to 135 minutes after', () => {
  assert.equal(inCheckWindow(at('2026-10-25T14:00:00Z'), ELEVEN), true, '10:00');
  assert.equal(inCheckWindow(at('2026-10-25T13:59:00Z'), ELEVEN), false, '9:59');
  assert.equal(inCheckWindow(at('2026-10-25T17:14:00Z'), ELEVEN), true, '1:14 pm');
  assert.equal(inCheckWindow(at('2026-10-25T17:15:00Z'), ELEVEN), false, '1:15 pm');
});

test('a fresh endpoint answer overrides the clock; a stale or unknown one does not', () => {
  const now = at('2026-10-25T15:10:00Z');
  const fresh = now.getTime() - 1000;
  const url = 'https://www.youtube.com/watch?v=abcdefghijk';
  assert.deepEqual(liveState(now, ELEVEN, { status: 'live', url, at: fresh }), {
    live: true,
    href: url,
  });
  assert.deepEqual(liveState(now, ELEVEN, { status: 'not-live', at: fresh }), { live: false });
  assert.deepEqual(liveState(now, ELEVEN, { status: 'unknown', at: fresh }), { live: true });
  const stale = now.getTime() - STATUS_FRESH_MS;
  assert.deepEqual(liveState(now, ELEVEN, { status: 'not-live', at: stale }), { live: true });
  assert.deepEqual(liveState(now, ELEVEN, null), { live: true });
  // An early stream: "live" at 10:15, inside the check window but before the clock's window.
  assert.deepEqual(
    liveState(at('2026-10-25T14:15:00Z'), ELEVEN, {
      status: 'live',
      at: at('2026-10-25T14:15:00Z').getTime() - 1000,
    }),
    { live: true, href: undefined },
  );
});

test('only a youtube.com address may replace a link', () => {
  assert.equal(
    safeLiveUrl('https://www.youtube.com/watch?v=abc'),
    'https://www.youtube.com/watch?v=abc',
  );
  assert.equal(safeLiveUrl('https://evil.example/watch'), undefined);
  assert.equal(safeLiveUrl('javascript:alert(1)'), undefined);
  assert.equal(safeLiveUrl(42), undefined);
});

test('the page settings: nothing without a live link; the check only with a YouTube channel', () => {
  const base = { serviceTimes: [{ dayIndex: 0, minutes: 660 }] } as never as {
    serviceTimes: { dayIndex: number; minutes: number }[];
  };
  assert.equal(
    watchLive({ ...base, liveUrl: null, liveVia: null, youtubeChannelId: null } as never),
    null,
  );
  assert.deepEqual(
    watchLive({
      ...base,
      liveUrl: 'https://www.facebook.com/fbcauburn',
      liveVia: 'Facebook',
      youtubeChannelId: null,
    } as never),
    { href: 'https://www.facebook.com/fbcauburn', via: 'Facebook', start: 660, check: false },
  );
  const yt = watchLive({
    ...base,
    liveUrl: 'https://www.youtube.com/channel/UCaaaaaaaaaaaaaaaaaaaaaa/live',
    liveVia: 'YouTube',
    youtubeChannelId: 'UCaaaaaaaaaaaaaaaaaaaaaa',
  } as never);
  assert.equal(yt?.check, true);
  assert.equal(watchLabel('Facebook'), 'Watch live on Facebook');
  assert.equal(watchLabel(null), 'Watch live');
});
