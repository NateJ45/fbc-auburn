// Visitor audit (2026-10-18), the two content changes it needed:
//
// 1. The Privacy page still carried the starter's policy ("Studio Starter", a design studio's
//    newsletter and projects). This replaces its SEO title and description, hero words, date and
//    body with a short policy for the church that says what the site actually does: Cloudflare Web
//    Analytics with no cookies, the contact form (kept in the site's own database and emailed to
//    the church), the Church Trac calendar, and YouTube and Facebook.
// 2. The menu's Give link went to the Contact page. It now goes to the site's own Give page
//    (/give/, src/pages/give.astro), which the menu swaps for the online giving link as soon as one
//    is set in Site settings > Church facts (src/lib/give.ts).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/visitor-audit.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/visitor-audit.mjs <backup-folder> --apply
// The privacyPage and siteSettings documents are written to <backup-folder> first. Keep that
// folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, block, p, link } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const [privacy, settings] = await Promise.all([
  client.getDocument('privacyPage'),
  client.getDocument('siteSettings'),
]);
if (!privacy) throw new Error('No privacyPage document; read the dataset first.');
if (!settings?.navItems?.length) throw new Error('siteSettings has no navItems; read it first.');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
for (const [name, doc] of [
  ['privacy-page', privacy],
  ['site-settings', settings],
]) {
  const file = join(dir, `${name}-before-visitor-audit-${stamp}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 2));
  console.log(`Backed up ${doc._id} (rev ${doc._rev}) to ${file}`);
}

// ── 1. Privacy ──────────────────────────────────────────────────────────────
// Plain words, no em-dashes (rule 2). Kept in step with the fallback copy in src/pages/privacy.astro.
const body = [
  p(
    'This page explains what the First Baptist Church of Auburn website collects and why. The short version: very little, and none of it is sold, shared for advertising or used to follow you around the web.',
  ),
  block('Counting visits', 'h2'),
  p(
    'We count page visits with Cloudflare Web Analytics. It sets no cookies, does not identify you and does not track you from one site to another. It tells us things like how many people opened the Plan your visit page this week.',
  ),
  block('When you write to us', 'h2'),
  p(
    'The contact form asks for your name, your email address and your message. Your message is kept in the website’s own database, hosted by Cloudflare, and a copy is emailed to the church so someone can reply. We use it only to answer you, and we never sell it or pass it on. If you would like a message you sent deleted, ',
    link('ask us', '/contact/'),
    ' and we will remove it.',
  ),
  block('Calendar, videos and Facebook', 'h2'),
  p(
    'The events calendar comes from Church Trac, the system the church uses to keep its calendar. Sermon videos come from YouTube. The page shows the video’s picture from YouTube’s image server, and the player itself only loads when you press play, in YouTube’s privacy-enhanced mode. Links to the church’s Facebook page take you to Facebook. Once you play a video or visit Facebook, that company’s own privacy policy applies.',
  ),
  block('Cookies', 'h2'),
  p(
    'This website sets no cookies of its own for visitors, and there are no advertising or social media trackers on it.',
  ),
  block('Questions', 'h2'),
  p(
    'If anything here is unclear, or you want to know what we hold about you, ',
    link('send us a message', '/contact/'),
    '.',
  ),
];

const today = new Date().toISOString().slice(0, 10);
await apply('privacyPage: church policy (SEO, hero, date, body)', async () => {
  await client
    .patch('privacyPage')
    .ifRevisionId(privacy._rev)
    .set({
      seoTitle: 'Privacy policy',
      seoDescription:
        'What the First Baptist Church of Auburn website collects, why, and what it never does with it.',
      heroEyebrow: 'Your privacy',
      heroHeadline: 'Privacy policy',
      lastUpdated: today,
      body,
    })
    .unset(['heroSubhead'])
    .commit();
});
for (const b of body) {
  const text = b.children.map((c) => c.text).join('');
  console.log(
    `    ${b.style === 'h2' ? '## ' : ''}${text.slice(0, 90)}${text.length > 90 ? '…' : ''}`,
  );
}

// ── 2. Give in the menu ─────────────────────────────────────────────────────
const give = settings.navItems.find((n) => n._key === 'n-give');
if (!give) {
  console.log('SKIP siteSettings.navItems: there is no n-give item.');
} else if (give.href === '/give/') {
  console.log('SKIP siteSettings.navItems[n-give]: already /give/.');
} else {
  console.log(
    `    n-give was ${give.linkType ?? '(no type)'} -> ${give.internalPage?._ref ?? give.href ?? '?'}`,
  );
  await apply('siteSettings.navItems[n-give]: Give -> /give/', async () => {
    await client
      .patch('siteSettings')
      .ifRevisionId(settings._rev)
      .set({ 'navItems[_key=="n-give"].href': '/give/' })
      .unset(['navItems[_key=="n-give"].linkType', 'navItems[_key=="n-give"].internalPage'])
      .commit();
  });
}

done(2);
