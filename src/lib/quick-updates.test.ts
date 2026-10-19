// The church's Quick update builders (src/lib/quick-updates.ts): each one must be a
// complete, valid document, because the Quick update tool publishes it without the
// Studio's validation.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEventNotice,
  buildNewsletter,
  buildNotice,
  buildPost,
  buildSermon,
  clip,
  datedSlug,
  dayName,
  endOfDay,
  noticeName,
} from './quick-updates.ts';

describe('notices', () => {
  it('has every required field and ends at the end of the last day', () => {
    const n = buildNotice({
      message: '  No Wednesday Bible study this week. ',
      lastDay: '2026-10-21',
    });
    assert.equal(n._type, 'announcement');
    assert.equal(n.message, 'No Wednesday Bible study this week.');
    assert.ok(n.internalTitle.length > 0);
    assert.equal(n.enabled, true);
    assert.equal(n.style, 'info');
    assert.equal(n.endDate, endOfDay('2026-10-21'));
    const end = new Date(n.endDate);
    assert.equal(end.getHours(), 23);
    assert.equal(end.getMinutes(), 59);
    assert.equal(n.link, undefined);
  });
  it('a link becomes the notice link; the style can be urgent', () => {
    const n = buildNotice(
      { message: 'Service cancelled for snow', lastDay: '2026-12-06', link: 'https://x.org/a' },
      'urgent',
    );
    assert.deepEqual(n.link, { label: 'Find out more', url: 'https://x.org/a' });
    assert.equal(n.style, 'urgent');
  });
  it('the Studio name is short and dated', () => {
    assert.equal(noticeName('Snow', '2026-12-06'), 'Snow (until 2026-12-06)');
    assert.ok(noticeName('x'.repeat(100), '2026-12-06').length < 70);
  });
});

describe('sermons', () => {
  it('has a title, date, service, video and a dated web address', () => {
    const s = buildSermon({
      title: 'The Good Shepherd',
      date: '2026-10-18',
      videoUrl: 'https://youtu.be/abc',
    });
    assert.deepEqual(s, {
      _type: 'sermon',
      title: 'The Good Shepherd',
      date: '2026-10-18',
      service: 'sunday-morning',
      slug: { _type: 'slug', current: 'the-good-shepherd-2026-10-18' },
      videoUrl: 'https://youtu.be/abc',
    });
  });
  it('adds the passage and the pastor when there are any', () => {
    const s = buildSermon(
      { title: 'Hope', date: '2026-10-18', videoUrl: 'https://youtu.be/a', passage: 'John 3:16' },
      'person-1',
    );
    assert.equal(s.passage, 'John 3:16');
    assert.deepEqual(s.preacher, { _type: 'reference', _ref: 'person-1' });
  });
  it('the same title on two Sundays gives two addresses', () => {
    const a = buildSermon({ title: 'Hope', date: '2026-10-18', videoUrl: 'https://a.b/c' });
    const b = buildSermon({ title: 'Hope', date: '2026-10-25', videoUrl: 'https://a.b/c' });
    assert.notEqual(a.slug.current, b.slug.current);
  });
});

describe('the 2026-10-19 phone jobs', () => {
  it('a long title never loses the date from the web address', () => {
    const slug = datedSlug('A'.repeat(10) + ' word '.repeat(30), '2026-10-18');
    assert.ok(slug.endsWith('-2026-10-18'));
    assert.ok(slug.length <= 64);
    assert.equal(datedSlug('!!!', '2026-10-18'), '2026-10-18');
  });
  it('an event notice names the day and shows until the end of it', () => {
    const n = buildEventNotice({ name: 'Fall festival. ', date: '2026-10-24', time: '4 pm' });
    assert.equal(n.message, 'Fall festival, Saturday, October 24 at 4 pm.');
    assert.equal(n.endDate, endOfDay('2026-10-24'));
    assert.equal(n.style, 'highlight');
    assert.equal(n.enabled, true);
    assert.equal(n.link, undefined);
    const linked = buildEventNotice({ name: 'VBS', date: '2027-06-14', link: 'https://x.org/vbs' });
    assert.equal(linked.message, 'VBS, Monday, June 14.');
    assert.equal(linked.link?.url, 'https://x.org/vbs');
    assert.ok(
      buildEventNotice({ name: 'x'.repeat(300), date: '2026-10-24' }).message.length <= 160,
    );
  });
  it('a news post has every required field, its paragraphs and a short excerpt', () => {
    const now = new Date('2026-10-19T15:00:00Z');
    const p = buildPost(
      {
        title: ' Thank you for the food drive ',
        text: 'We filled the van.\n\nThank you,\nall of you.',
      },
      now,
    );
    assert.equal(p._type, 'journalEntry');
    assert.equal(p.title, 'Thank you for the food drive');
    assert.equal(p.slug.current, 'thank-you-for-the-food-drive-2026-10-19');
    assert.equal(p.publishedAt, now.toISOString());
    assert.equal(p.excerpt, 'We filled the van. Thank you, all of you.');
    assert.equal(p.body.length, 2);
    assert.equal(p.body[1]!.children[0]!.text, 'Thank you, all of you.');
    assert.equal(new Set(p.body.map((b) => b._key)).size, 2);
    const long = buildPost({ title: 'Long', text: 'word '.repeat(100) }, now);
    assert.ok(long.excerpt.length <= 220);
    assert.ok(long.excerpt.endsWith('...'));
  });
  it('a newsletter issue has its subject, date, address and the usual picks', () => {
    const n = buildNewsletter({ subject: 'This week at Auburn', intro: ' Hello! ' }, '2026-10-19');
    assert.equal(n._type, 'newsletter');
    assert.equal(n.slug.current, 'this-week-at-auburn-2026-10-19');
    assert.equal(n.intro, 'Hello!');
    assert.equal(n.includeSermon, true);
    assert.equal(n.includeEvents, true);
    assert.equal(n.eventDays, 14);
    assert.equal(buildNewsletter({ subject: 'x' }, '2026-10-19').intro, undefined);
  });
  it('dayName and clip', () => {
    assert.equal(dayName('2026-12-25'), 'Friday, December 25');
    assert.equal(clip('  a   b  ', 10), 'a b');
    assert.equal(clip('one two three four', 12), 'one two...');
  });
});
