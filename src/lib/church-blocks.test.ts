// Safe to edit by hand
// Unit tests for the section library's derived values (church-blocks.ts): the
// notice date window, the countdown phases, the progress bar's numbers, the
// Bible and calendar links and the Live-now window.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  bibleGatewayUrl,
  countdownState,
  daysToGo,
  dollars,
  inDateWindow,
  isLiveNow,
  isoDay,
  keywordsOf,
  liveWindow,
  matchesKeywords,
  nextLiveDate,
  progressState,
  splitReferences,
  streamEmbedUrl,
  subscribeLinks,
  asOfLabel,
} from './church-blocks.ts';
import type { ServiceTime } from './church-facts.ts';

const STEGA = String.fromCharCode(0x200b, 0x200c, 0x200d, 0xfeff);

describe('isoDay', () => {
  it('keeps a date, takes the date of a datetime, and rejects anything else', () => {
    assert.equal(isoDay('2026-12-24'), '2026-12-24');
    assert.equal(isoDay('2026-12-24T18:00:00Z'), '2026-12-24');
    assert.equal(isoDay(`2026-12-24${STEGA}`), '2026-12-24');
    assert.equal(isoDay('Christmas Eve'), '');
    assert.equal(isoDay('2026-13-01'), '');
    assert.equal(isoDay(null), '');
  });
});

describe('inDateWindow (notice band)', () => {
  it('shows inside the window, both ends included', () => {
    assert.equal(inDateWindow('2026-01-10', '2026-01-11', '2026-01-10'), true);
    assert.equal(inDateWindow('2026-01-10', '2026-01-11', '2026-01-11'), true);
  });
  it('hides before the start and after the end', () => {
    assert.equal(inDateWindow('2026-01-10', '2026-01-11', '2026-01-09'), false);
    assert.equal(inDateWindow('2026-01-10', '2026-01-11', '2026-01-12'), false);
  });
  it('treats a blank end as open-ended and a blank start as from now', () => {
    assert.equal(inDateWindow('2026-01-10', '', '2027-06-01'), true);
    assert.equal(inDateWindow(null, '2026-01-11', '2025-01-01'), true);
    assert.equal(inDateWindow(undefined, undefined, '2026-01-01'), true);
  });
  it('hides a window whose end is before its start', () => {
    assert.equal(inDateWindow('2026-01-11', '2026-01-10', '2026-01-10'), false);
  });
  it('reads stega-encoded dates from the preview', () => {
    assert.equal(inDateWindow(`2026-01-10${STEGA}`, `2026-01-11${STEGA}`, '2026-01-12'), false);
  });
});

describe('countdownState', () => {
  it('counts whole days before the first day', () => {
    assert.deepEqual(countdownState('2026-06-15', null, '2026-06-01'), {
      phase: 'before',
      days: 14,
    });
    assert.deepEqual(countdownState('2026-06-15', null, '2026-06-14'), {
      phase: 'before',
      days: 1,
    });
  });
  it('is "during" on the day and every day of a multi-day event', () => {
    assert.equal(countdownState('2026-06-15', null, '2026-06-15').phase, 'during');
    assert.equal(countdownState('2026-06-15', '2026-06-19', '2026-06-19').phase, 'during');
  });
  it('is "after" once the last day has passed', () => {
    assert.equal(countdownState('2026-06-15', '2026-06-19', '2026-06-20').phase, 'after');
    assert.equal(countdownState('2026-06-15', null, '2026-06-16').phase, 'after');
  });
  it('ignores an end date before the start', () => {
    assert.equal(countdownState('2026-06-15', '2026-06-01', '2026-06-16').phase, 'after');
  });
  it('is "none" without a usable date', () => {
    assert.equal(countdownState('', null, '2026-06-16').phase, 'none');
  });
  it('crosses a month and a year correctly', () => {
    assert.equal(countdownState('2027-01-02', null, '2026-12-30').days, 3);
  });
  it('words the days', () => {
    assert.equal(daysToGo(1), '1 day to go');
    assert.equal(daysToGo(12), '12 days to go');
  });
});

describe('progressState and dollars', () => {
  it('formats whole dollars with commas', () => {
    assert.equal(dollars(12500), '$12,500');
    assert.equal(dollars(999.6), '$1,000');
    assert.equal(dollars(0), '$0');
  });
  it('works out the percent, floored, and the amount to go', () => {
    const p = progressState(50000, 12500);
    assert.equal(p.valid, true);
    assert.equal(p.percent, 25);
    assert.equal(p.raised, '$12,500');
    assert.equal(p.goal, '$50,000');
    assert.equal(p.remaining, '$37,500 to go');
    assert.equal(progressState(3, 2).percent, 66);
  });
  it('caps at 100 and says the goal is reached', () => {
    const p = progressState(1000, 1500);
    assert.equal(p.percent, 100);
    assert.equal(p.remaining, 'Goal reached');
  });
  it('is invalid with no positive goal, and never negative', () => {
    assert.equal(progressState(0, 10).valid, false);
    assert.equal(progressState(null, 10).valid, false);
    assert.equal(progressState(100, -5).percent, 0);
  });
  it('labels the as-of date', () => {
    assert.equal(asOfLabel('2026-10-18'), 'As of October 18, 2026');
    assert.equal(asOfLabel(''), '');
  });
});

describe('bibleGatewayUrl and splitReferences', () => {
  it('builds a search link with the chosen translation', () => {
    assert.equal(
      bibleGatewayUrl('John 3:16', 'CSB'),
      'https://www.biblegateway.com/passage/?search=John%203%3A16&version=CSB',
    );
  });
  it('leaves the version off when none (or an unknown one) is picked', () => {
    assert.equal(
      bibleGatewayUrl(`Romans 8:28-39${STEGA}`, 'XYZ'),
      'https://www.biblegateway.com/passage/?search=Romans%208%3A28-39',
    );
    assert.equal(bibleGatewayUrl('', 'KJV'), '');
  });
  it('splits references on semicolons', () => {
    assert.deepEqual(splitReferences('John 3:16; Romans 5:8 ;'), ['John 3:16', 'Romans 5:8']);
  });
});

describe('subscribeLinks', () => {
  it('derives Apple, Google and Outlook links from one feed address', () => {
    const l = subscribeLinks('https://www.churchtrac.com/ical?ui=ABC123');
    assert.ok(l);
    assert.equal(l.apple, 'webcal://www.churchtrac.com/ical?ui=ABC123');
    assert.equal(
      l.google,
      `https://calendar.google.com/calendar/r?cid=${encodeURIComponent('webcal://www.churchtrac.com/ical?ui=ABC123')}`,
    );
    assert.ok(l.outlook.startsWith('https://outlook.live.com/calendar/0/addfromweb?url=https%3A'));
  });
  it('accepts a webcal address and rejects anything else', () => {
    assert.equal(subscribeLinks('webcal://x.test/cal.ics')?.apple, 'webcal://x.test/cal.ics');
    assert.equal(subscribeLinks('http://x.test/cal.ics'), null);
    assert.equal(subscribeLinks(null), null);
  });
});

describe('keywords', () => {
  const rows = [
    { title: 'Vacation Bible School', description: '', location: '' },
    { title: 'Business meeting', description: 'Quarterly', location: 'Fellowship hall' },
  ];
  it('splits and lowercases', () => {
    assert.deepEqual(keywordsOf(' VBS, Bible School ,'), ['vbs', 'bible school']);
  });
  it('matches title, description or place, and keeps everything with no keyword', () => {
    assert.equal(matchesKeywords(rows, ['bible school']).length, 1);
    assert.equal(matchesKeywords(rows, ['fellowship']).length, 1);
    assert.equal(matchesKeywords(rows, []).length, 2);
  });
});

describe('live window', () => {
  const times = [
    { dayIndex: 0, minutes: 585 },
    { dayIndex: 0, minutes: 660 },
    { dayIndex: 3, minutes: 1080 },
  ] as ServiceTime[];
  const win = liveWindow(times);
  it('streams the last Sunday gathering', () => {
    assert.ok(win);
    assert.equal(win.start, 655);
    assert.equal(win.label, 'Sundays at 11 am');
  });
  it('is live on Sunday inside the window, Eastern time', () => {
    // 2026-10-18 is a Sunday. 15:10 UTC is 11:10 am EDT.
    assert.equal(isLiveNow(win, new Date('2026-10-18T15:10:00Z')), true);
    assert.equal(isLiveNow(win, new Date('2026-10-18T13:00:00Z')), false);
    assert.equal(isLiveNow(win, new Date('2026-10-19T15:10:00Z')), false);
    assert.equal(isLiveNow(null, new Date('2026-10-18T15:10:00Z')), false);
  });
  it('names the next streamed Sunday', () => {
    assert.equal(nextLiveDate(win, new Date('2026-10-18T15:10:00Z')), '2026-10-18');
    assert.equal(nextLiveDate(win, new Date('2026-10-18T20:00:00Z')), '2026-10-25');
    assert.equal(nextLiveDate(win, new Date('2026-10-21T12:00:00Z')), '2026-10-25');
  });
});

describe('streamEmbedUrl', () => {
  it('embeds YouTube watch, live and short links on the no-cookie host', () => {
    assert.equal(
      streamEmbedUrl('https://www.youtube.com/watch?v=abcdefghijk'),
      'https://www.youtube-nocookie.com/embed/abcdefghijk',
    );
    assert.equal(
      streamEmbedUrl('https://youtube.com/live/abcdefghijk?si=x'),
      'https://www.youtube-nocookie.com/embed/abcdefghijk',
    );
    assert.equal(
      streamEmbedUrl('https://youtu.be/abcdefghijk'),
      'https://www.youtube-nocookie.com/embed/abcdefghijk',
    );
  });
  it('embeds a Facebook video through the video plugin', () => {
    assert.ok(
      streamEmbedUrl('https://www.facebook.com/fbcauburn/videos/123').startsWith(
        'https://www.facebook.com/plugins/video.php?href=https%3A',
      ),
    );
  });
  it('refuses any other host', () => {
    assert.equal(streamEmbedUrl('https://evil.example/watch?v=abcdefghijk'), '');
    assert.equal(streamEmbedUrl('not a url'), '');
  });
});

describe('rule 9: the church library carries no colour field', () => {
  it('declares no tone, surface, background, accent or colour field', () => {
    const src = readFileSync(
      new URL('../sanity/schemaTypes/churchSections.ts', import.meta.url),
      'utf8',
    );
    const names = [...src.matchAll(/name:\s*'([A-Za-z]+)'/g)].map((m) => m[1]);
    for (const banned of ['tone', 'surface', 'background', 'accent', 'color', 'colour']) {
      assert.ok(!names.includes(banned), `churchSections.ts declares a "${banned}" field`);
    }
  });
});
