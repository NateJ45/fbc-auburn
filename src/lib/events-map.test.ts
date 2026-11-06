// Safe to edit by hand
// Pins this site's events map (src/config/events.ts, PORTS.md card 217): what each kind of
// link sends to GA4, and the privacy sentence derived from the map. The church website sent
// no events before card 217, so there is no history to protect; these cases are the contract
// the Report (src/config/board.ts) reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyLink } from './track.ts';
import { eventsConfig } from '../config/events.ts';
import { eventKinds, eventsSentence } from './event-kinds.ts';
import { readFileSync } from 'node:fs';

type Expected = { event: string; params: Record<string, string> } | null;

const HOST = 'church.example.org';

// [href as written, page region, what is sent]
const CASES: Array<[string, string, Expected]> = [
  [
    '/give/',
    'header',
    { event: 'give_click', params: { destination: 'give_page', location: 'header' } },
  ],
  [
    '/give',
    'page',
    { event: 'give_click', params: { destination: 'give_page', location: 'page' } },
  ],
  ['/giveaway/', 'page', null],
  [
    'https://church.churchtrac.com/giving/online',
    'page',
    { event: 'give_click', params: { destination: 'church_trac', location: 'page' } },
  ],
  ['https://church.churchtrac.com/forms/12', 'page', null],
  ['https://elsewhere.org/give', 'page', null],
  ['/sunday.ics', 'footer', { event: 'calendar_add', params: { location: 'footer' } }],
  [
    'webcal://calendar.example.org/feed.ics',
    'page',
    { event: 'calendar_add', params: { location: 'page' } },
  ],
  [
    'https://www.facebook.com/FirstAuburnHamilton',
    'footer',
    { event: 'social_click', params: { network: 'facebook', location: 'footer' } },
  ],
  [
    'https://www.tiktok.com/@auburn.pastor',
    'page',
    { event: 'social_click', params: { network: 'tiktok', location: 'page' } },
  ],
  [
    'https://www.facebook.com/FirstAuburnHamilton/videos/123',
    'page',
    { event: 'watch_click', params: { destination: 'facebook', location: 'page' } },
  ],
  [
    'https://fb.watch/abc/',
    'page',
    { event: 'watch_click', params: { destination: 'facebook', location: 'page' } },
  ],
  [
    'https://www.youtube.com/watch?v=abc',
    'page',
    { event: 'watch_click', params: { destination: 'video', location: 'page' } },
  ],
  [
    'https://www.google.com/maps/search/?api=1&query=x',
    'page',
    { event: 'directions_click', params: { location: 'page' } },
  ],
  [
    'https://maps.apple.com/?q=x',
    'footer',
    { event: 'directions_click', params: { location: 'footer' } },
  ],
  [
    'mailto:office@example.org',
    'footer',
    { event: 'contact_click', params: { method: 'email', location: 'footer' } },
  ],
  [
    'tel:+15555550100',
    'header',
    { event: 'contact_click', params: { method: 'phone', location: 'header' } },
  ],
  // Switched off: Enhanced Measurement counts these.
  ['https://elsewhere.org/page', 'page', null],
  ['/bulletins/week.pdf', 'page', null],
];

for (const [href, region, expected] of CASES) {
  test(`events map: ${href}`, () => {
    const resolved = new URL(href, `https://${HOST}/`).href;
    const hit = classifyLink(href, resolved, HOST, region, eventsConfig);
    assert.deepEqual(hit, expected);
  });
}

test('privacy sentence names what is sent and nothing that is not', () => {
  const sentence = eventsSentence(eventsConfig);
  assert.match(sentence, /^It also records what visitors do on the site: /);
  for (const word of [
    'giving links',
    'calendar files',
    'social media pages',
    'video links',
    'map and directions links',
    'email and phone links',
    'whether a form is seen, used or sent',
    'how far down an article is read',
    'pages that could not be found',
  ]) {
    assert.ok(sentence.includes(word), `missing: ${word}`);
  }
  // The shared search panel sends no event, and Enhanced Measurement covers the rest.
  assert.ok(!sentence.includes('site search'));
  assert.ok(!sentence.includes('links to other sites'));
  assert.ok(!sentence.includes('file downloads'));
});

test('every kind has words', () => {
  assert.ok(eventKinds(eventsConfig).length >= 9);
});

test('the Report only reads events the map can send', () => {
  const sendable = new Set([
    'generate_lead',
    'form_view',
    'embed_interact',
    'watch_click',
    'give_click',
    'directions_click',
    'contact_click',
    'calendar_add',
  ]);
  // Read as text: board.ts imports the site data without a file extension, which node cannot load.
  const text = readFileSync(new URL('../config/board.ts', import.meta.url), 'utf8');
  for (const m of text.matchAll(/event:([a-z_]+)/g)) {
    assert.ok(sendable.has(m[1]), `the Report reads event:${m[1]}, which this site does not send`);
  }
});

test('the Report starts on launch day, not on a deploy day', () => {
  const text = readFileSync(new URL('../config/board.ts', import.meta.url), 'utf8');
  assert.match(text, /firstMonth: '2026-11'/);
  assert.match(text, /since: \{ all: '2026-11-25' \}/);
  assert.match(text, /timeZone: 'America\/New_York'/);
});
