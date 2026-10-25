// Unit tests for src/lib/sermons.ts: the derived parts of sermons, series,
// people, downloads and the podcast feed (rule 15).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bibleGatewayUrl,
  bookOf,
  currentDownloads,
  daysSince,
  fileLabel,
  groupPeople,
  isFreshSermon,
  itunesDuration,
  newestBulletin,
  podcastEpisodes,
  podcastXml,
  preacherName,
  rfc822,
  sermonJsonLd,
  sermonFilters,
  sermonSunday,
  sermonVideo,
  seriesSpan,
  sortSeries,
  sortSermons,
  watchSermon,
  youtubeId,
  type DownloadDoc,
  type SermonDoc,
} from './sermons.ts';

// 2026-10-14 is a Wednesday; noon Eastern.
const WED = new Date('2026-10-14T16:00:00Z');
const SUN = new Date('2026-10-18T15:00:00Z');

describe('the Bible', () => {
  it('finds the book in a passage, longest spelling first', () => {
    assert.equal(bookOf('John 3:1-21'), 'John');
    assert.equal(bookOf('1 John 4:7-12'), '1 John');
    assert.equal(bookOf('1John 1'), '1 John');
    assert.equal(bookOf('Psalm 23'), 'Psalms');
    assert.equal(bookOf('Song of Songs 2'), 'Song of Solomon');
    assert.equal(bookOf('rom. 8:28'), 'Romans');
    assert.equal(bookOf('II Timothy 3:16'), '2 Timothy');
    assert.equal(bookOf('Jude'), 'Jude');
    assert.equal(bookOf('Philippians 4:13'), 'Philippians');
    assert.equal(bookOf('Philemon 1'), 'Philemon');
  });
  it('says nothing about something it does not recognise', () => {
    assert.equal(bookOf(''), null);
    assert.equal(bookOf(null), null);
    assert.equal(bookOf('Christmas Eve'), null);
    assert.equal(bookOf('Johnny 3'), null);
  });
  it('builds the BibleGateway link from the passage', () => {
    assert.equal(
      bibleGatewayUrl('John 3:1-21'),
      'https://www.biblegateway.com/passage/?search=John%203%3A1-21',
    );
    assert.equal(
      bibleGatewayUrl('  Mark  4:1-20 ', 'KJV'),
      'https://www.biblegateway.com/passage/?search=Mark%204%3A1-20&version=KJV',
    );
    assert.equal(
      bibleGatewayUrl('Mark 4', 'NOPE'),
      'https://www.biblegateway.com/passage/?search=Mark%204',
    );
    assert.equal(bibleGatewayUrl(''), null);
  });
});

describe('video links', () => {
  it('reads every YouTube link shape', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=abc',
      'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
    ]) {
      assert.equal(youtubeId(url), 'dQw4w9WgXcQ', url);
    }
    assert.equal(youtubeId('https://www.youtube.com/@church'), null);
    assert.equal(youtubeId('not a url'), null);
  });
  it('knows a Facebook video from a YouTube one', () => {
    assert.equal(sermonVideo('https://www.facebook.com/fbcauburn/videos/123')?.kind, 'facebook');
    assert.equal(sermonVideo('https://fb.watch/abc/')?.kind, 'facebook');
    const yt = sermonVideo('https://youtu.be/dQw4w9WgXcQ');
    assert.equal(yt?.kind, 'youtube');
    assert.match(yt?.embedUrl ?? '', /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
    assert.equal(sermonVideo('javascript:alert(1)'), null);
    assert.equal(sermonVideo(''), null);
  });
});

describe('dates', () => {
  it('a new sermon is dated the Sunday just gone, or today on a Sunday', () => {
    assert.equal(sermonSunday(WED), '2026-10-11');
    assert.equal(sermonSunday(SUN), '2026-10-18');
    // Late Saturday night in Ohio is already Sunday in UTC: still Saturday here.
    assert.equal(sermonSunday(new Date('2026-10-18T02:00:00Z')), '2026-10-11');
  });
  it('a sermon is fresh for eight days, never in the future', () => {
    assert.equal(daysSince('2026-10-11', WED), 3);
    assert.equal(isFreshSermon('2026-10-11', WED), true);
    assert.equal(isFreshSermon('2026-10-06', WED), true);
    assert.equal(isFreshSermon('2026-10-05', WED), false);
    assert.equal(isFreshSermon('2026-10-18', WED), false);
    assert.equal(isFreshSermon(null, WED), false);
  });
});

const sermon = (over: Partial<SermonDoc>): SermonDoc => ({
  _id: over._id ?? 's',
  title: 'A message',
  slug: 'a-message',
  date: '2026-10-11',
  ...over,
});

describe('sermons', () => {
  it('names the preacher from the people list, else the guest', () => {
    assert.equal(
      preacherName({ preacher: { name: 'Pastor Jacob' }, guestPreacher: 'X' }),
      'Pastor Jacob',
    );
    assert.equal(preacherName({ preacher: null, guestPreacher: ' Rev. Smith ' }), 'Rev. Smith');
    assert.equal(preacherName({}), '');
  });
  it('sorts newest first, morning before evening on one day', () => {
    const list = sortSermons([
      sermon({ _id: 'a', date: '2026-10-04', service: 'sunday-morning' }),
      sermon({ _id: 'b', date: '2026-10-11', service: 'sunday-evening' }),
      sermon({ _id: 'c', date: '2026-10-11', service: 'sunday-morning' }),
    ]);
    assert.deepEqual(
      list.map((s) => s._id),
      ['c', 'b', 'a'],
    );
  });
  it('offers only the filters the sermons can answer', () => {
    const f = sermonFilters([
      sermon({
        passage: 'Mark 4:1-20',
        series: { slug: 'mark', title: 'Mark' },
        guestPreacher: 'B',
      }),
      sermon({ passage: 'Genesis 1', preacher: { name: 'A' } }),
      sermon({ passage: 'Advent reading' }),
    ]);
    assert.deepEqual(f.books, ['Genesis', 'Mark']);
    assert.deepEqual(f.preachers, ['A', 'B']);
    assert.deepEqual(f.series, [{ value: 'mark', title: 'Mark' }]);
  });
  it('the Watch card takes a fresh sermon first, and an old one only as a stand-in', () => {
    const fresh = watchSermon(sermon({ date: '2026-10-11' }), WED);
    assert.ok(fresh.fresh && fresh.latest);
    const old = watchSermon(sermon({ date: '2026-09-01' }), WED);
    assert.equal(old.fresh, null);
    assert.ok(old.latest);
    const future = watchSermon(sermon({ date: '2026-10-25' }), WED);
    assert.deepEqual(future, { fresh: null, latest: null });
    assert.deepEqual(watchSermon(null, WED), { fresh: null, latest: null });
    assert.deepEqual(watchSermon(sermon({ slug: null }), WED), { fresh: null, latest: null });
  });
});

describe('series', () => {
  it('orders by first sermon, newest first, empty series last', () => {
    const list = sortSeries([
      { title: 'Empty', firstDate: null },
      { title: 'Mark', firstDate: '2026-01-04' },
      { title: 'Ruth', firstDate: '2026-09-06' },
    ]);
    assert.deepEqual(
      list.map((s) => s.title),
      ['Ruth', 'Mark', 'Empty'],
    );
  });
  it('says the span in months', () => {
    assert.equal(seriesSpan('2026-10-04', '2027-01-10'), 'Oct 2026 to Jan 2027');
    assert.equal(seriesSpan('2026-10-04', '2026-10-25'), 'Oct 2026');
    assert.equal(seriesSpan(null, null), '');
  });
});

describe('people', () => {
  it('groups in the groups’ own order, people by order then name', () => {
    const out = groupPeople([
      { _id: '1', name: 'Zed', group: { _id: 'd', title: 'Deacons', order: 2 } },
      { _id: '2', name: 'Amy', group: { _id: 'd', title: 'Deacons', order: 2 } },
      { _id: '3', name: 'Pastor', order: 1, group: { _id: 's', title: 'Staff', order: 1 } },
      { _id: '4', name: 'Bo', order: 1, group: { _id: 'd', title: 'Deacons', order: 2 } },
      { _id: '5', name: 'Loose' },
      { _id: '6', name: '' },
    ]);
    assert.deepEqual(
      out.map((g) => [g.title, g.people.map((p) => p.name)]),
      [
        ['Staff', ['Pastor']],
        ['Deacons', ['Bo', 'Amy', 'Zed']],
        ['', ['Loose']],
      ],
    );
  });
});

describe('downloads', () => {
  const file = { url: 'https://cdn.sanity.io/files/x/y/a.pdf', size: 245_760, extension: 'pdf' };
  const list: DownloadDoc[] = [
    { _id: 'b1', title: 'Bulletin Oct 11', date: '2026-10-11', category: 'bulletin', file },
    { _id: 'b2', title: 'Bulletin Oct 4', date: '2026-10-04', category: 'bulletin', file },
    {
      _id: 'f1',
      title: 'Camp form',
      date: '2026-09-01',
      category: 'form',
      file,
      expires: '2026-10-13',
    },
    {
      _id: 'f2',
      title: 'VBS form',
      date: '2026-09-02',
      category: 'form',
      file,
      expires: '2026-10-14',
    },
    { _id: 'x', title: 'No file', date: '2026-10-12', category: 'bulletin' },
  ];
  it('drops expired ones (the expiry date is the last day shown) and ones with no file', () => {
    assert.deepEqual(
      currentDownloads(list, WED, 'all', 10).map((d) => d._id),
      ['b1', 'b2', 'f2'],
    );
    assert.deepEqual(
      currentDownloads(list, WED, 'form').map((d) => d._id),
      ['f2'],
    );
    assert.deepEqual(
      currentDownloads(list, WED, null, 1).map((d) => d._id),
      ['b1'],
    );
  });
  it("this week's bulletin is the newest current one", () => {
    assert.equal(newestBulletin(list, WED)?._id, 'b1');
    assert.equal(newestBulletin([], WED), null);
  });
  it('labels a file', () => {
    assert.equal(fileLabel(file), 'PDF, 240 KB');
    assert.equal(fileLabel({ originalFilename: 'x.docx', size: 2_500_000 }), 'DOCX, 2.4 MB');
    assert.equal(fileLabel(null), '');
  });
});

describe('the podcast feed (Apple Podcasts required tags)', () => {
  const channel = {
    title: 'First Baptist Church of Auburn Sermons',
    description: 'Sunday sermons from First Baptist Church of Auburn & friends.',
    siteUrl: 'https://example.org',
    feedUrl: 'https://example.org/sermons/podcast.xml',
    imageUrl: 'https://cdn.sanity.io/images/x/y/art.jpg?w=3000&h=3000&fm=jpg',
    author: 'First Baptist Church of Auburn',
    ownerName: 'First Baptist Church of Auburn',
    ownerEmail: 'office@example.org',
  };
  const sermons: SermonDoc[] = [
    sermon({
      _id: 'with-audio',
      title: 'Seed & soil',
      slug: 'seed-and-soil',
      passage: 'Mark 4:1-20',
      preacher: { name: 'Pastor' },
      audio: {
        url: 'https://cdn.sanity.io/files/x/y/a.mp3',
        size: 1234567,
        mimeType: 'audio/mpeg',
      },
      audioSeconds: 2525,
    }),
    sermon({ _id: 'video-only', slug: 'video-only', videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }),
  ];
  const episodes = podcastEpisodes(sermons, channel.siteUrl);
  const doc = podcastXml(channel, episodes);

  it('has only the sermons with audio', () => {
    assert.equal(episodes.length, 1);
    assert.equal(episodes[0].link, 'https://example.org/sermons/seed-and-soil/');
  });

  it('carries every channel tag Apple requires', () => {
    assert.match(doc, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(
      doc,
      /<rss version="2.0" xmlns:itunes="http:\/\/www.itunes.com\/dtds\/podcast-1.0.dtd"/,
    );
    const channelPart = doc.slice(doc.indexOf('<channel>'), doc.indexOf('<item>'));
    for (const re of [
      /<title>First Baptist Church of Auburn Sermons<\/title>/,
      /<description>Sunday sermons from First Baptist Church of Auburn &amp; friends.<\/description>/,
      /<language>en-us<\/language>/,
      /<itunes:image href="https:\/\/cdn.sanity.io\/images\/x\/y\/art.jpg\?w=3000&amp;h=3000&amp;fm=jpg"\/>/,
      /<itunes:category text="Religion &amp; Spirituality">\n<itunes:category text="Christianity"\/>\n<\/itunes:category>/,
      /<itunes:explicit>false<\/itunes:explicit>/,
      /<itunes:owner>\n<itunes:name>[^<]+<\/itunes:name>\n<itunes:email>office@example.org<\/itunes:email>\n<\/itunes:owner>/,
      /<itunes:author>[^<]+<\/itunes:author>/,
      /<link>https:\/\/example.org\/sermons\/<\/link>/,
      /<atom:link href="https:\/\/example.org\/sermons\/podcast.xml" rel="self"/,
    ]) {
      assert.match(channelPart, re);
    }
  });

  it('carries every episode tag Apple requires', () => {
    const item = doc.slice(doc.indexOf('<item>'), doc.indexOf('</item>'));
    assert.match(item, /<title>Seed &amp; soil<\/title>/);
    assert.match(
      item,
      /<enclosure url="https:\/\/cdn.sanity.io\/files\/x\/y\/a.mp3" length="1234567" type="audio\/mpeg"\/>/,
    );
    assert.match(item, /<guid isPermaLink="false">with-audio<\/guid>/);
    assert.match(item, /<pubDate>Sun, 11 Oct 2026 17:00:00 GMT<\/pubDate>/);
    assert.match(item, /<itunes:duration>42:05<\/itunes:duration>/);
    assert.match(item, /Mark 4:1-20 · Pastor/);
  });

  it('is well formed: every tag it opens, it closes', () => {
    const stack: string[] = [];
    for (const m of doc.matchAll(/<(\/?)([a-z:]+)[^>]*?(\/?)>/gi)) {
      const [, close, name, self] = m;
      if (self) continue;
      if (close) assert.equal(stack.pop(), name, `</${name}> closes the wrong tag`);
      else stack.push(name);
    }
    assert.deepEqual(stack, []);
    assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(doc), 'an unescaped ampersand');
  });

  it('is still a valid channel with no episodes and no art', () => {
    const empty = podcastXml({ ...channel, imageUrl: null, ownerEmail: null }, []);
    assert.ok(!empty.includes('<item>'));
    assert.match(empty, /<itunes:category text="Religion &amp; Spirituality">/);
  });

  it('formats dates and durations the way Apple reads them', () => {
    assert.equal(rfc822('2026-10-11'), 'Sun, 11 Oct 2026 17:00:00 GMT');
    assert.equal(itunesDuration(2525), '42:05');
    assert.equal(itunesDuration(3723), '1:02:03');
  });
});

describe('structured data', () => {
  it('a YouTube sermon is a VideoObject with what Google requires', () => {
    const ld = sermonJsonLd(
      sermon({
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
        passage: 'Mark 4',
        preacher: { name: 'P' },
      }),
      'https://example.org/sermons/a-message/',
      'FBC',
    );
    assert.equal(ld['@type'], 'VideoObject');
    assert.equal(ld.uploadDate, '2026-10-11');
    assert.match(String(ld.thumbnailUrl), /hqdefault\.jpg$/);
    assert.equal(ld.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    assert.ok(ld.description);
  });
  it('a recording with no YouTube video is a PodcastEpisode of the sermon podcast', () => {
    const ld = sermonJsonLd(
      sermon({
        audio: { url: 'https://cdn.sanity.io/files/a.mp3', mimeType: 'audio/mpeg' },
        audioSeconds: 1830,
      }),
      'https://example.org/sermons/a-message/',
      'FBC',
    );
    assert.equal(ld['@type'], 'PodcastEpisode');
    const media = ld.associatedMedia as { contentUrl: string; duration: string };
    assert.equal(media.contentUrl, 'https://cdn.sanity.io/files/a.mp3');
    assert.equal(media.duration, 'PT1830S');
    const series = ld.partOfSeries as { webFeed: string; name: string };
    assert.equal(series.webFeed, 'https://example.org/sermons/podcast.xml');
    assert.equal(series.name, 'FBC Sermons');
  });
  it('with neither, a plain CreativeWork', () => {
    const ld = sermonJsonLd(sermon({}), 'https://example.org/sermons/a-message/', 'FBC');
    assert.equal(ld['@type'], 'CreativeWork');
    assert.equal(ld.datePublished, '2026-10-11');
  });
});
