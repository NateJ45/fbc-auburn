// The Watch band's video (src/lib/church-video.ts) and the build-time fetch
// (src/lib/church-feeds.ts). The fixture's entries are invented.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  decodeXml,
  latestVideo,
  parseYoutubeFeed,
  sundayOnOrAfter,
  upcomingStream,
  type FeedEntry,
} from './church-video.ts';
import { fetchFeed, loadChurchEvents, loadLatestVideo, resetChurchFeeds } from './church-feeds.ts';

const FEED = readFileSync(
  new URL('../../tests/fixtures/church-youtube.xml', import.meta.url),
  'utf8',
);
// Wednesday 2026-10-21, noon in Hamilton.
const WEDNESDAY = new Date('2026-10-21T16:00:00Z');

test('the feed parses, entities decoded', () => {
  const entries = parseYoutubeFeed(FEED);
  assert.equal(entries.length, 3);
  assert.equal(entries[1].title, 'Jesus Christ the Same & Forever');
  assert.equal(entries[0].views, 0);
  assert.equal(decodeXml('&#8217;&#x2014;&quot;'), '’—"');
  assert.deepEqual(parseYoutubeFeed('<html>error</html>'), []);
  assert.deepEqual(parseYoutubeFeed(null), []);
});

test('the latest watched video, never the scheduled stream', () => {
  const v = latestVideo(parseYoutubeFeed(FEED), WEDNESDAY)!;
  assert.equal(v.videoId, 'replayBBBBB');
  assert.equal(v.date, '2026-10-19', 'published 12:10 am Monday, church time');
  assert.equal(v.label, 'Last Sunday');
  assert.equal(v.watchUrl, 'https://www.youtube.com/watch?v=replayBBBBB');
  assert.match(v.embedUrl, /^https:\/\/www\.youtube-nocookie\.com\/embed\/replayBBBBB\?/);
});

test('the upcoming stream: the coming Sunday scheduled broadcast (2026-10-24)', () => {
  const entries = parseYoutubeFeed(FEED);
  const s = upcomingStream(entries, WEDNESDAY)!;
  assert.equal(s.videoId, 'upcomingAAA');
  assert.equal(s.sunday, '2026-10-25');
  assert.equal(s.watchUrl, 'https://www.youtube.com/watch?v=upcomingAAA');
  // On the Sunday itself it still names today's stream; the Monday after, nothing.
  assert.equal(upcomingStream(entries, new Date('2026-10-25T13:00:00Z'))?.videoId, 'upcomingAAA');
  assert.equal(upcomingStream(entries, new Date('2026-10-26T16:00:00Z')), null);
  // Not yet published as of the build: nothing.
  assert.equal(upcomingStream(entries, new Date('2026-10-20T16:00:00Z')), null);
  // Two different titles for one Sunday: never guess.
  const two: FeedEntry[] = [
    ...entries,
    { videoId: 'upcomingDDD', title: 'Another', published: '2026-10-21T14:00:00Z', views: 0 },
  ];
  assert.equal(upcomingStream(two, WEDNESDAY), null);
  assert.equal(sundayOnOrAfter('2026-10-25'), '2026-10-25');
  assert.equal(sundayOnOrAfter('2026-10-26'), '2026-11-01');
});

test('an old replay is "Latest message", not "Last Sunday"', () => {
  const v = latestVideo(parseYoutubeFeed(FEED), new Date('2026-11-10T16:00:00Z'))!;
  assert.equal(v.label, 'Latest message');
  assert.equal(latestVideo([], WEDNESDAY), null);
});

test('the fetch: usable text is returned, anything else is null and logged', async () => {
  const logs: string[] = [];
  const ok = async () => new Response(FEED, { status: 200 });
  assert.equal(
    await fetchFeed(
      'u',
      (t) => t.includes('<feed'),
      'v',
      ok,
      50,
      (m) => logs.push(m),
    ),
    FEED,
  );
  const html = async () => new Response('<html>nope</html>', { status: 200 });
  assert.equal(
    await fetchFeed(
      'u',
      (t) => t.includes('<feed'),
      'v',
      html,
      50,
      (m) => logs.push(m),
    ),
    null,
  );
  const boom = async () => {
    throw new Error('offline');
  };
  assert.equal(
    await fetchFeed(
      'u',
      () => true,
      'v',
      boom,
      50,
      (m) => logs.push(m),
    ),
    null,
  );
  assert.equal(logs.length, 4, 'two tries each, both logged');
});

test('no channel id or feed in Site settings: nothing is fetched at all', async () => {
  resetChurchFeeds();
  let calls = 0;
  const spy = async () => {
    calls++;
    return new Response('', { status: 500 });
  };
  assert.equal(await loadLatestVideo({ youtubeChannelId: null }, spy), null);
  assert.equal(await loadChurchEvents({ icalUrl: null }, spy), null);
  assert.equal(calls, 0);
  resetChurchFeeds();
});
