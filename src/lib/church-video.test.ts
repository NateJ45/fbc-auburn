// The Watch band's video (src/lib/church-video.ts) and the build-time fetch
// (src/lib/church-feeds.ts). The fixture's entries are invented.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeXml, latestVideo, parseYoutubeFeed } from './church-video.ts';
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
