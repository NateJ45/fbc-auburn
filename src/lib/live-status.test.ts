// GET /api/live-status's decisions (src/lib/live-status.ts), with a mock fetch. 2026-10-25 is a
// Sunday; 15:10 UTC is 11:10 am Eastern, inside the check window for an 11:00 service.
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLiveStatus, StatusMemo, ttlSeconds, uploadsPlaylistId } from './live-status.ts';

const CHANNEL = 'UCaaaaaaaaaaaaaaaaaaaaaa';
const SUNDAY = new Date('2026-10-25T15:10:00Z');
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function youtube(liveId: string | null) {
  const calls: string[] = [];
  const fetch = async (url: string) => {
    calls.push(url);
    if (url.includes('/playlistItems')) {
      return json({
        items: [
          { contentDetails: { videoId: 'aaaaaaaaaaa' } },
          { contentDetails: { videoId: 'bbbbbbbbbbb' } },
        ],
      });
    }
    return json({
      items: [
        {
          id: 'aaaaaaaaaaa',
          snippet: { liveBroadcastContent: liveId === 'aaaaaaaaaaa' ? 'live' : 'none' },
        },
        { id: 'bbbbbbbbbbb', snippet: { liveBroadcastContent: 'none' } },
      ],
    });
  };
  return { calls, fetch };
}

const base = { now: SUNDAY, key: 'k', channelId: CHANNEL, start: 660 };

test('live: two 1-unit calls, and the live video named', async () => {
  const yt = youtube('aaaaaaaaaaa');
  const body = await computeLiveStatus({ ...base, fetch: yt.fetch });
  assert.equal(body.status, 'live');
  assert.equal(body.url, 'https://www.youtube.com/watch?v=aaaaaaaaaaa');
  assert.equal(yt.calls.length, 2);
  assert.match(yt.calls[0], new RegExp(`playlistId=${uploadsPlaylistId(CHANNEL)}`));
});

test('not live, and every reason that spends nothing', async () => {
  assert.equal(
    (await computeLiveStatus({ ...base, fetch: youtube(null).fetch })).status,
    'not-live',
  );
  const never = youtube(null);
  const noKey = await computeLiveStatus({ ...base, key: '', fetch: never.fetch });
  assert.deepEqual([noKey.status, noKey.reason], ['unknown', 'no-key']);
  const noChannel = await computeLiveStatus({ ...base, channelId: null, fetch: never.fetch });
  assert.deepEqual([noChannel.status, noChannel.reason], ['unknown', 'no-channel']);
  const noTime = await computeLiveStatus({ ...base, start: null, fetch: never.fetch });
  assert.deepEqual([noTime.status, noTime.reason], ['unknown', 'no-service-time']);
  const wednesday = await computeLiveStatus({
    ...base,
    now: new Date('2026-10-28T15:10:00Z'),
    fetch: never.fetch,
  });
  assert.deepEqual([wednesday.status, wednesday.reason], ['not-live', 'outside-window']);
  assert.equal(never.calls.length, 0, 'YouTube is never called for any of these');
});

test('a YouTube error or an unreachable API is "unknown", never a throw', async () => {
  const quota = await computeLiveStatus({
    ...base,
    fetch: async () => json({ error: { errors: [{ reason: 'quotaExceeded' }] } }, 403),
  });
  assert.deepEqual([quota.status, quota.reason], ['unknown', 'youtube-403-quotaExceeded']);
  const down = await computeLiveStatus({
    ...base,
    fetch: async () => {
      throw new Error('offline');
    },
  });
  assert.deepEqual([down.status, down.reason], ['unknown', 'youtube-unreachable']);
});

test('the memo reuses an answer for its TTL and shares one in flight', async () => {
  const memo = new StatusMemo();
  let computed = 0;
  const compute = async () => {
    computed++;
    return { status: 'not-live' as const, checkedAt: '' };
  };
  await Promise.all([memo.get(0, compute), memo.get(0, compute)]);
  await memo.get(89_000, compute);
  assert.equal(computed, 1);
  await memo.get(91_000, compute);
  assert.equal(computed, 2);
  assert.equal(ttlSeconds({ status: 'unknown', checkedAt: '' }), 300);
});
