import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_SOCIAL_LINKS,
  isValidWhatsAppUrl,
  platformFromUrl,
  resolveSocialLinks,
  socialLabel,
  socialUrlWarning,
} from './social-links.ts';

const fb = 'https://www.facebook.com/FirstAuburnHamilton';
const tiktok = 'https://www.tiktok.com/@auburn.pastor';

test('the Social links list comes through in order, skipping empty rows', () => {
  const links = resolveSocialLinks({
    socialLinks: [
      { platform: 'Facebook', url: fb },
      { platform: 'YouTube', url: '' },
      { platform: 'TikTok', url: tiktok },
    ],
  });
  assert.deepEqual(
    links.map((l) => l.platform),
    ['Facebook', 'TikTok'],
  );
});

test('the Facebook fact is not doubled when the list already has Facebook', () => {
  const links = resolveSocialLinks(
    {
      socialLinks: [
        { platform: 'Facebook', url: fb },
        { platform: 'TikTok', url: tiktok },
      ],
    },
    fb,
  );
  assert.equal(links.length, 2);
});

test('the Facebook fact joins the front when the list lacks it', () => {
  const links = resolveSocialLinks({ socialLinks: [{ platform: 'TikTok', url: tiktok }] }, fb);
  assert.deepEqual(
    links.map((l) => l.platform),
    ['Facebook', 'TikTok'],
  );
});

test('an empty list falls back to the legacy fields', () => {
  const links = resolveSocialLinks({ socialLinks: [], socialInstagram: 'https://instagram.com/x' });
  assert.deepEqual(links, [{ platform: 'Instagram', url: 'https://instagram.com/x' }]);
});

test('nothing set gives no buttons', () => {
  assert.deepEqual(resolveSocialLinks(null), []);
});

test('the label wins over the platform for the accessible name', () => {
  assert.equal(socialLabel({ platform: 'Other', url: 'x', label: 'Church blog' }), 'Church blog');
  assert.equal(socialLabel({ platform: 'TikTok', url: 'x' }), 'TikTok');
});

// ── Editor-managed links (2026-10-26): the platform comes from the address. ──

test('the icon platform is read from the address for every common church account', () => {
  const cases: [string, string][] = [
    ['https://www.facebook.com/FirstAuburnHamilton', 'Facebook'],
    ['https://m.facebook.com/FirstAuburnHamilton', 'Facebook'],
    ['https://www.instagram.com/auburn', 'Instagram'],
    ['https://www.youtube.com/@auburn', 'YouTube'],
    ['https://youtu.be/abc123', 'YouTube'],
    ['https://www.tiktok.com/@auburn.pastor', 'TikTok'],
    ['https://wa.me/15135550100', 'WhatsApp'],
    ['https://chat.whatsapp.com/AbCdEf123', 'WhatsApp'],
    ['https://x.com/auburn', 'X'],
    ['https://twitter.com/auburn', 'X'],
    ['https://www.threads.net/@auburn', 'Threads'],
    ['https://open.spotify.com/show/abc', 'Spotify'],
    ['https://podcasts.apple.com/us/podcast/x/id1', 'Apple Podcasts'],
    ['https://vimeo.com/123', 'Vimeo'],
    ['https://www.linkedin.com/company/auburn', 'LinkedIn'],
    ['https://www.pinterest.com/auburn', 'Pinterest'],
    ['https://nextdoor.com/pages/auburn', 'Nextdoor'],
    ['https://www.flickr.com/photos/auburn', 'Flickr'],
    ['https://linktr.ee/auburn', 'Linktree'],
  ];
  for (const [url, platform] of cases) {
    assert.equal(platformFromUrl(url)?.key, platform, url);
    assert.equal(resolveSocialLinks({ socialLinks: [{ url }] })[0]?.platform, platform, url);
  }
});

test('a site we do not know gets the plain link and the label, or its domain', () => {
  const [withLabel] = resolveSocialLinks({
    socialLinks: [{ url: 'https://www.auburnblog.org/news', label: 'Church blog' }],
  });
  assert.equal(withLabel.platform, 'Other');
  assert.equal(socialLabel(withLabel), 'Church blog');
  const [bare] = resolveSocialLinks({ socialLinks: [{ url: 'https://www.auburnblog.org/news' }] });
  assert.equal(socialLabel(bare), 'auburnblog.org');
  assert.equal(platformFromUrl('https://notfacebook.com/x'), null);
});

test('existing rows keep working: the stored platform stands in for an unknown address', () => {
  const links = resolveSocialLinks({
    socialLinks: [
      // The live dataset's two rows (2026-10-26), with the old dropdown value.
      { platform: 'Facebook', url: fb },
      { platform: 'TikTok', url: tiktok, label: 'Pastor Jacob on TikTok' },
      // A vanity address that forwards to Facebook.
      { platform: 'Facebook', url: 'https://auburnfb.example.org' },
    ],
  });
  assert.deepEqual(
    links.map((l) => [l.platform, socialLabel(l)]),
    [
      ['Facebook', 'Facebook'],
      ['TikTok', 'Pastor Jacob on TikTok'],
      ['Facebook', 'Facebook'],
    ],
  );
});

test('the address wins over a wrong stored platform', () => {
  const [link] = resolveSocialLinks({ socialLinks: [{ platform: 'Other', url: tiktok }] });
  assert.equal(link.platform, 'TikTok');
});

test('a WhatsApp link renders only with a valid invite or number address', () => {
  for (const url of ['https://wa.me/15135550100', 'https://chat.whatsapp.com/AbCdEf123']) {
    assert.equal(isValidWhatsAppUrl(url), true, url);
    const links = resolveSocialLinks({ socialLinks: [{ url }] });
    assert.equal(links.length, 1, url);
    assert.equal(socialLabel(links[0]), 'WhatsApp');
  }
  for (const url of [
    '',
    'https://wa.me/',
    'http://wa.me/15135550100',
    'https://www.whatsapp.com/',
    'https://api.whatsapp.com/send?phone=15135550100',
    'https://web.whatsapp.com/',
  ]) {
    assert.equal(isValidWhatsAppUrl(url), false, url);
    assert.deepEqual(resolveSocialLinks({ socialLinks: [{ url }] }), [], url);
    assert.deepEqual(
      resolveSocialLinks({ socialLinks: [{ platform: 'WhatsApp', url }] }),
      [],
      `${url} (stored WhatsApp)`,
    );
  }
  // A row picked as WhatsApp in the old dropdown but pointing elsewhere is not drawn either.
  assert.deepEqual(
    resolveSocialLinks({ socialLinks: [{ platform: 'WhatsApp', url: 'https://example.org/x' }] }),
    [],
  );
});

test('no WhatsApp row means no WhatsApp button', () => {
  const links = resolveSocialLinks(
    {
      socialLinks: [
        { platform: 'Facebook', url: fb },
        { platform: 'TikTok', url: tiktok },
      ],
    },
    fb,
  );
  assert.equal(
    links.some((l) => l.platform === 'WhatsApp'),
    false,
  );
});

test('a non-web address is left out, and the row count is capped', () => {
  assert.deepEqual(resolveSocialLinks({ socialLinks: [{ url: 'javascript:alert(1)' }] }), []);
  assert.deepEqual(resolveSocialLinks({ socialLinks: [{ url: 'not a link' }] }), []);
  const many = Array.from({ length: MAX_SOCIAL_LINKS + 3 }, (_, i) => ({
    url: `https://example${i}.org/`,
  }));
  assert.equal(resolveSocialLinks({ socialLinks: many }).length, MAX_SOCIAL_LINKS);
});

test('the Studio warns, without blocking, on an odd address', () => {
  assert.equal(socialUrlWarning(fb), null);
  assert.equal(socialUrlWarning('https://www.auburnblog.org/'), null);
  assert.match(socialUrlWarning('https://www.whatsapp.com/') ?? '', /will not show/);
  assert.match(socialUrlWarning('https://www.facebook.com/') ?? '', /home page/);
  assert.match(socialUrlWarning('https://www.google.com/search?q=auburn') ?? '', /search/);
});
