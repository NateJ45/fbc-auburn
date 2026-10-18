// The church's Quick update builders (src/lib/quick-updates.ts): each one must be a
// complete, valid document, because the Quick update tool publishes it without the
// Studio's validation.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNotice, buildSermon, endOfDay, noticeName } from './quick-updates.ts';

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
