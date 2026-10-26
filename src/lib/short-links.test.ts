// Safe to edit by hand
// Tests for the short-link rules (src/lib/short-links.ts): the address shape,
// clash detection, expiry, and the _redirects lines the build writes.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_SHORT_LINKS,
  countRedirectRules,
  isExpired,
  normalizeShortAddress,
  planShortLinks,
  renderShortLinkLines,
  shortAddressProblem,
  shortLinkClash,
  shortLinkDestination,
  shortLinkUrl,
  todayIn,
  type ClashContext,
} from './short-links.ts';
import { RESERVED_SLUGS } from './reservedSlugs.ts';

const ctx: ClashContext = {
  reserved: RESERVED_SLUGS,
  pages: ['plan-your-visit', 'ministries'],
  archivedPages: ['watch-old'],
  redirects: ['/watch', '/old-page'],
  shortLinks: ['easter'],
};

describe('the address', () => {
  it('is tidied from whatever he typed', () => {
    assert.equal(normalizeShortAddress('/VBS/'), 'vbs');
    assert.equal(normalizeShortAddress(' Fall Festival '), 'fall-festival');
    assert.equal(normalizeShortAddress('https://fbcauburn.org/vbs?x=1'), 'vbs');
    assert.equal(normalizeShortAddress('youth__night'), 'youth-night');
    assert.equal(normalizeShortAddress(null), '');
  });

  it('must be letters, numbers and dashes, 2 to 40 long', () => {
    assert.equal(shortAddressProblem('vbs'), null);
    assert.equal(shortAddressProblem('vbs-2027'), null);
    assert.match(String(shortAddressProblem('')), /Type the short address/);
    assert.match(String(shortAddressProblem('a')), /two letters/);
    assert.match(String(shortAddressProblem('kids/vbs')), /no slashes/);
    assert.match(String(shortAddressProblem('café')), /letters, numbers and dashes/);
    assert.match(String(shortAddressProblem('x'.repeat(41))), /under 40/);
  });
});

describe('clashes', () => {
  it('a built-in route, a page, another short link and a redirect are all errors', () => {
    assert.equal(shortLinkClash('give', ctx)?.level, 'error');
    assert.match(String(shortLinkClash('sermons', ctx)?.message), /already part of the website/);
    assert.match(String(shortLinkClash('/Plan-Your-Visit/', ctx)?.message), /A page already lives/);
    assert.match(String(shortLinkClash('easter', ctx)?.message), /Another short link/);
    assert.match(String(shortLinkClash('watch', ctx)?.message), /already forwards/);
  });

  it('an archived page is only a warning', () => {
    assert.equal(shortLinkClash('watch-old', ctx)?.level, 'warning');
  });

  it('a free word has no clash', () => {
    assert.equal(shortLinkClash('vbs', ctx), null);
    assert.equal(shortLinkClash('', ctx), null);
  });
});

describe('expiry', () => {
  it('works through the last day, in the church time zone', () => {
    assert.equal(isExpired('2026-10-26', '2026-10-26'), false);
    assert.equal(isExpired('2026-10-25', '2026-10-26'), true);
    assert.equal(isExpired(undefined, '2026-10-26'), false);
    assert.equal(isExpired('soon', '2026-10-26'), false);
    // 02:00 UTC on the 27th is still the evening of the 26th in Ohio.
    assert.equal(todayIn(new Date('2026-10-27T02:00:00Z')), '2026-10-26');
    assert.equal(todayIn(new Date('2026-10-27T12:00:00Z')), '2026-10-27');
  });
});

describe('destinations', () => {
  it('a page gets its trailing slash (rule 19); an outside link is kept', () => {
    assert.equal(shortLinkDestination({ linkKind: 'page', pagePath: '/sermons' }), '/sermons/');
    assert.equal(shortLinkDestination({ linkKind: 'page', pagePath: '/' }), '/');
    assert.equal(
      shortLinkDestination({ linkKind: 'page', pagePath: '/plan-your-visit#questions' }),
      '/plan-your-visit/#questions',
    );
    assert.equal(
      shortLinkDestination({ linkKind: 'url', url: 'https://www.signupgenius.com/go/abc' }),
      'https://www.signupgenius.com/go/abc',
    );
    assert.equal(shortLinkDestination({ linkKind: 'url', url: 'not a link' }), null);
    assert.equal(shortLinkDestination({ linkKind: 'page', pagePath: null }), null);
  });
});

describe('planShortLinks and the _redirects lines', () => {
  const base = { reserved: RESERVED_SLUGS, pages: ['ministries'], redirects: ['/watch'] };
  const today = '2026-10-26';

  it('writes a temporary 302 and a permanent 301, both with and without the slash', () => {
    const plan = planShortLinks(
      [
        { address: 'vbs', linkKind: 'page', pagePath: '/vbs-2027', lasting: 'temporary' },
        {
          address: 'give-online',
          linkKind: 'url',
          url: 'https://tithe.ly/give?c=1',
          lasting: 'permanent',
        },
      ],
      base,
      today,
    );
    assert.deepEqual(plan.skipped, []);
    assert.deepEqual(renderShortLinkLines(plan.rules), [
      '/vbs /vbs-2027/ 302',
      '/vbs/ /vbs-2027/ 302',
      '/give-online https://tithe.ly/give?c=1 301',
      '/give-online/ https://tithe.ly/give?c=1 301',
    ]);
  });

  it('defaults to temporary when the choice is missing', () => {
    const plan = planShortLinks([{ address: 'x1', linkKind: 'page', pagePath: '/' }], base, today);
    assert.equal(plan.rules[0].status, 302);
  });

  it('skips expired links, clashes, self-links and links with nowhere to go', () => {
    const plan = planShortLinks(
      [
        { address: 'old', linkKind: 'page', pagePath: '/', expires: '2026-10-25' },
        { address: 'still', linkKind: 'page', pagePath: '/', expires: '2026-10-26' },
        { address: 'ministries', linkKind: 'page', pagePath: '/' },
        { address: 'give', linkKind: 'page', pagePath: '/' },
        { address: 'watch', linkKind: 'page', pagePath: '/' },
        { address: 'loop', linkKind: 'page', pagePath: '/loop' },
        { address: 'nowhere', linkKind: 'url', url: '' },
        { address: 'bad word!', linkKind: 'page', pagePath: '/' },
      ],
      base,
      today,
    );
    assert.deepEqual(
      plan.rules.map((r) => r.address),
      ['still'],
    );
    assert.deepEqual(
      plan.skipped.map((s) => s.address),
      ['old', 'ministries', 'give', 'watch', 'loop', 'nowhere', 'bad word!'],
    );
  });

  it('when two short links share an address, the older one keeps it', () => {
    const plan = planShortLinks(
      [
        {
          address: 'easter',
          linkKind: 'url',
          url: 'https://b.example/new',
          _createdAt: '2026-10-20',
        },
        {
          address: 'easter',
          linkKind: 'url',
          url: 'https://a.example/old',
          _createdAt: '2026-03-01',
        },
      ],
      base,
      today,
    );
    assert.equal(plan.rules.length, 1);
    assert.equal(plan.rules[0].destination, 'https://a.example/old');
    assert.match(plan.skipped[0].reason, /Another short link/);
  });

  it(`stops at ${MAX_SHORT_LINKS}, inside Cloudflare's 2,000 static lines`, () => {
    const docs = Array.from({ length: MAX_SHORT_LINKS + 5 }, (_, i) => ({
      address: `link-${i}`,
      linkKind: 'page',
      pagePath: '/',
      _createdAt: String(i).padStart(4, '0'),
    }));
    const plan = planShortLinks(docs, base, today);
    assert.equal(plan.rules.length, MAX_SHORT_LINKS);
    assert.equal(plan.skipped.length, 5);
    assert.ok(renderShortLinkLines(plan.rules).length <= 2000);
  });

  it('skips a destination over the 1,000 character line limit', () => {
    const plan = planShortLinks(
      [{ address: 'long', linkKind: 'url', url: `https://a.example/${'x'.repeat(1000)}` }],
      base,
      today,
    );
    assert.equal(plan.rules.length, 0);
  });

  it('counts rules, not comments', () => {
    assert.equal(countRedirectRules('# note\n/a /b 301\n\n/c /d 302\n'), 2);
  });
});

describe('the QR address', () => {
  it('is the bare short address on the site domain', () => {
    assert.equal(shortLinkUrl('https://fbcauburn.org/', '/VBS/'), 'https://fbcauburn.org/vbs');
    assert.equal(shortLinkUrl('https://fbcauburn.org', ''), null);
  });
});
