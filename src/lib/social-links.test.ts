import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSocialLinks, socialLabel } from './social-links.ts';

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
