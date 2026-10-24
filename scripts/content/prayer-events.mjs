// Prayer Requests and Events (2026-10-24): two of the pages Jacob listed in his first reply that
// the site did not have yet. Built only from blocks the Studio already has, so he can edit both:
//   - /prayer/: a page head (praying hands), the prayer form (a new "form" document in prayer mode:
//     sent to the pastor, never saved by the website, name optional, an opt-in "share with the
//     church" tick box), and a closing band to Contact.
//   - /events/: a page head (clock), the weekly rhythm (This week, from Church facts), the coming
//     events (from the Church Trac calendar once its link is set; until then the block's own empty
//     line), and a closing band to Plan your visit.
//   - Site settings: "Events" and "Prayer requests" join the full menu (after Give, before
//     Contact; the bar still shows the first four) and the footer's Belong column.
// Creates only what is missing and adds a link only if no link already points at the page.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/prayer-events.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/prayer-events.mjs <backup-folder> --apply
// siteSettings is written to <backup-folder>/site-settings-before-prayer-events.json first.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const internal = (label, id) => ({
  _type: 'ctaBlock',
  label,
  linkType: 'internal',
  internalLink: ref(id),
});

const FORM = {
  _id: 'form-prayer',
  _type: 'form',
  title: 'Send a prayer request',
  mode: 'prayer',
  intro: 'Tell us what to pray for, in as few or as many words as you like.',
  recipient: 'pastor',
  askForContact: true,
  allowAnonymous: true,
  questions: [
    {
      _key: 'q-request',
      _type: 'formQuestion',
      label: 'How can we pray for you?',
      kind: 'textarea',
      required: true,
    },
    {
      _key: 'q-share',
      _type: 'formQuestion',
      label: 'You may share this with the church family',
      kind: 'checkbox',
      required: false,
    },
  ],
  submitLabel: 'Send my request',
  successMessage: 'Thank you. We will be praying for you.',
};

const PRAYER = {
  _id: 'page-prayer',
  _type: 'page',
  title: 'Prayer requests',
  slug: { _type: 'slug', current: 'prayer' },
  seoTitle: 'Prayer requests | First Baptist Church of Auburn',
  seoDescription:
    'Send a prayer request to First Baptist Church of Auburn. A real person reads it, and the website keeps no copy.',
  pageBuilder: [
    {
      _key: 'pr-hero',
      _type: 'heroSection',
      eyebrow: 'We will pray with you',
      headline: 'Prayer requests',
      icon: 'praying-hands',
      size: 'short',
      subhead:
        'Tell us what to pray for. A real person reads every request, the website keeps no copy, and you can leave your name off.',
    },
    { _key: 'pr-form', _type: 'formSection', form: ref('form-prayer') },
    {
      _key: 'pr-cta',
      _type: 'ctaBandSection',
      headline: 'Would you rather talk to someone?',
      subhead: 'Ask a question, or come and meet us on a Sunday.',
      cta: internal('Ask a question', 'contactPage'),
    },
  ],
};

const EVENTS = {
  _id: 'page-events',
  _type: 'page',
  title: 'Events',
  slug: { _type: 'slug', current: 'events' },
  seoTitle: 'Events | First Baptist Church of Auburn',
  seoDescription:
    'Weekly gatherings and what is coming up at First Baptist Church of Auburn in Hamilton, Ohio.',
  pageBuilder: [
    {
      _key: 'ev-hero',
      _type: 'heroSection',
      eyebrow: 'What is on',
      headline: 'Events',
      icon: 'clock',
      size: 'short',
      subhead: 'Our weekly gatherings, and what is coming up at the church.',
    },
    { _key: 'ev-week', _type: 'thisWeekSection', heading: 'Every week' },
    {
      _key: 'ev-coming',
      _type: 'eventsSection',
      heading: 'Coming up',
      count: 8,
      showSubscribe: true,
    },
    {
      _key: 'ev-cta',
      _type: 'ctaBandSection',
      headline: 'New here?',
      subhead: 'Sunday is a good place to start. Someone will meet you at the door.',
      cta: internal('Plan your visit', 'page-plan-your-visit'),
    },
  ],
};

const settings = await client.getDocument('siteSettings');
if (!settings) throw new Error('No siteSettings; read the dataset first.');
writeFileSync(
  join(dir, 'site-settings-before-prayer-events.json'),
  JSON.stringify(settings, null, 2),
);
console.log(`Backed up siteSettings to ${dir}\n`);

let n = 0;
for (const doc of [FORM, PRAYER, EVENTS]) {
  const exists = await client.getDocument(doc._id);
  if (exists) {
    console.log(`SKIP ${doc._id}: already there.`);
    continue;
  }
  n++;
  await apply(`create ${doc._id}`, () => client.createIfNotExists(doc));
}

// The full menu: Events after Give, Prayer requests before Contact.
const nav = settings.navItems ?? [];
const points = (items, id) =>
  items.some((i) => i.internalPage?._ref === id || i.internalLink?._ref === id);
const navLink = (key, label, id) => ({
  _key: key,
  _type: 'navLink',
  label,
  linkType: 'internal',
  internalPage: ref(id),
});
const navNext = [...nav];
if (!points(navNext, 'page-events')) {
  const at = navNext.findIndex((i) => i._key === 'n-give');
  navNext.splice(at < 0 ? navNext.length : at + 1, 0, navLink('n-events', 'Events', 'page-events'));
}
if (!points(navNext, 'page-prayer')) {
  const at = navNext.findIndex((i) => i._key === 'n-contact');
  navNext.splice(
    at < 0 ? navNext.length : at,
    0,
    navLink('n-prayer', 'Prayer requests', 'page-prayer'),
  );
}
if (navNext.length !== nav.length) {
  n++;
  console.log('Menu:', navNext.map((i) => i.label).join(', '));
  await apply('siteSettings.navItems: add Events and Prayer requests', () =>
    client.patch('siteSettings').set({ navItems: navNext }).commit(),
  );
}

// The footer's Belong column.
const cols = settings.footerColumns ?? [];
const belong = cols.find((c) => c._key === 'f-belong');
if (belong) {
  const links = [...(belong.links ?? [])];
  const sample = links[0] ?? {};
  const footLink = (key, label, id) => ({ ...sample, _key: key, label, internalPage: ref(id) });
  if (!points(links, 'page-events')) links.push(footLink('fb-events', 'Events', 'page-events'));
  if (!points(links, 'page-prayer'))
    links.push(footLink('fb-prayer', 'Prayer requests', 'page-prayer'));
  if (links.length !== (belong.links ?? []).length) {
    n++;
    console.log('Belong:', links.map((l) => l.label).join(', '));
    await apply('siteSettings.footerColumns[f-belong].links: add Events and Prayer requests', () =>
      client.patch('siteSettings').set({ 'footerColumns[_key=="f-belong"].links': links }).commit(),
    );
  }
} else console.log('SKIP footer: no Belong column.');

// A correction (2026-10-24): the first run's head said requests go "straight to Pastor Jacob", but
// until his email is connected the form sends to the church office (it says so itself).
const prayerNow = await client.getDocument('page-prayer');
const prHero = prayerNow?.pageBuilder?.find((b) => b._key === 'pr-hero');
if (
  prHero &&
  prHero.subhead ===
    'Your request goes straight to Pastor Jacob. The website keeps no copy, and you can leave your name off.'
) {
  n++;
  await apply('page-prayer head: no promise about who reads it', () =>
    client
      .patch('page-prayer')
      .set({
        'pageBuilder[_key=="pr-hero"].subhead':
          'Tell us what to pray for. A real person reads every request, the website keeps no copy, and you can leave your name off.',
      })
      .commit(),
  );
}

if (
  prayerNow?.seoDescription ===
  'Send a prayer request to First Baptist Church of Auburn. It goes to the pastor and the website keeps no copy.'
) {
  n++;
  await apply('page-prayer seoDescription: the same correction', () =>
    client
      .patch('page-prayer')
      .set({
        seoDescription:
          'Send a prayer request to First Baptist Church of Auburn. A real person reads it, and the website keeps no copy.',
      })
      .commit(),
  );
}

done(n);
