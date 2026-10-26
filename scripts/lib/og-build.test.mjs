import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeCardRequest,
  encodeCardRequest,
  readCardRequest,
  replaceShareImage,
  routeForFile,
  stripCardMarker,
  versionShareImage,
} from './og-build.mjs';
import { buildIco, iconSet } from './brand-icons.mjs';

const page = (marker, og = 'https://site.test/og/plan-your-visit.jpg') =>
  `<head><title>x</title>${marker ? `<meta name="x-og-card" content="${marker}">` : ''}<meta property="og:image" content="${og}"><meta name="twitter:image" content="${og}"></head>`;

test('a card request survives the round trip, quotes and accents included', () => {
  const req = { title: 'Christmas Eve: "Silent night" & café', kicker: 'Sermon series' };
  assert.deepEqual(decodeCardRequest(encodeCardRequest(req)), { ...req, home: false });
  assert.equal(decodeCardRequest('not-json'), null);
  assert.equal(decodeCardRequest(encodeCardRequest({ title: '  ' })), null);
});

test('reads the request and the file its og:image names', () => {
  const html = page(encodeCardRequest({ title: 'Plan your visit', kicker: 'Sundays' }));
  assert.deepEqual(readCardRequest(html), {
    title: 'Plan your visit',
    kicker: 'Sundays',
    home: false,
    file: 'plan-your-visit.jpg',
  });
  assert.equal(readCardRequest(page(null)), null, 'no marker, no card');
  assert.equal(
    readCardRequest(page(encodeCardRequest({ title: 'x' }), 'https://cdn.sanity.io/a.jpg')),
    null,
    'a page sharing its own picture is left alone',
  );
});

test('strips the marker, versions the card URL, or falls back to og-default', () => {
  const html = page(encodeCardRequest({ title: 'Plan your visit' }));
  const stripped = stripCardMarker(html);
  assert.ok(!stripped.includes('x-og-card'));
  const v = versionShareImage(stripped, 'plan-your-visit.jpg', 'abc12345');
  assert.equal(v.match(/plan-your-visit\.jpg\?v=abc12345"/g)?.length, 2, 'og and twitter');
  const f = replaceShareImage(stripped, 'plan-your-visit.jpg', 'https://site.test/og-default.png');
  assert.equal(f.match(/og-default\.png"/g)?.length, 2);
  assert.ok(!f.includes('plan-your-visit.jpg'));
});

test('maps built files to routes', () => {
  assert.equal(routeForFile('index.html'), '/');
  assert.equal(routeForFile('about/index.html'), '/about/');
  assert.equal(routeForFile('404.html'), '/404');
});

test('icon set: an ICO with three sizes and every file, from one square SVG', async () => {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#B5503A"/></svg>',
  );
  const files = await iconSet(svg, 'image/svg+xml');
  assert.deepEqual(Object.keys(files).sort(), [
    'apple-touch-icon.png',
    'favicon.ico',
    'favicon.svg',
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512.png',
  ]);
  assert.equal(files['favicon.ico'].readUInt16LE(4), 3);
  assert.equal(files['favicon.svg'].toString(), svg.toString(), 'an SVG upload is used as is');
  const ico = buildIco([{ size: 16, buffer: Buffer.from([1, 2]) }]);
  assert.equal(ico.length, 6 + 16 + 2);
});

test('icon set: a PNG upload is wrapped for favicon.svg', async () => {
  const { default: sharp } = await import('sharp');
  const png = await sharp({
    create: { width: 600, height: 600, channels: 3, background: '#1F3A5F' },
  })
    .png()
    .toBuffer();
  const files = await iconSet(png, 'image/png');
  assert.match(files['favicon.svg'].toString(), /data:image\/png;base64,/);
  const meta = await sharp(files['icon-192.png']).metadata();
  assert.equal(meta.width, 192);
});
