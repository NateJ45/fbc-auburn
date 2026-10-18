// Home audit research (2026-10-17): Home's middle becomes "Your first Sunday", and the footer's
// link grid loses its lone column. HomeWalk.astro draws the walk; the decision is in
// docs/design-directions/2026-10-17-fbc-auburn/README.md.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/home-first-sunday.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/home-first-sunday.mjs <backup-folder> --apply
// homePage and siteSettings are written to <backup-folder> first. Keep that folder outside the repo.
//
// Home, top to bottom: hero, NEW "Your first Sunday" (four steps; the two gathering steps take
// their times from Church facts), Who we are, This week, Last Sunday, Other ways in. Retired (kept
// in the backup): "Through the week". Its Wednesday is in This week (derived), its kids line is in
// the worship step, its prayer request is in the Ask card. The walk's words only restate what the
// site already says; Jacob confirms or rewrites them (docs/PENDING.md 1c).
// Footer: the "Connect" column (one link, Contact) folds into "Visit".

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const home = await client.getDocument('homePage');
const settings = await client.getDocument('siteSettings');
if (!home || !settings) throw new Error('Missing homePage or siteSettings.');
writeFileSync(join(dir, 'home-before-first-sunday.json'), JSON.stringify(home, null, 2));
writeFileSync(
  join(dir, 'site-settings-before-first-sunday.json'),
  JSON.stringify(settings, null, 2),
);
console.log(`Backed up homePage and siteSettings to ${dir}`);

const byKey = Object.fromEntries(home.pageBuilder.map((b) => [b._key, b]));
for (const k of ['home-hero', 'home-belong', 'home-week', 'home-watch', 'home-other-ways']) {
  if (!byKey[k]) throw new Error(`Home has no ${k} block; read the document before running this.`);
}

const step = (key, icon, gathering, title, body) => ({
  _type: 'railStep',
  _key: key,
  icon,
  gathering,
  title,
  body,
});
const walk = {
  _type: 'stepsRailSection',
  _key: 'home-first-sunday',
  heading: 'Your first Sunday',
  intro: 'What a Sunday morning here looks like, one step at a time.',
  steps: [
    step(
      'fs-arrive',
      'map-pin',
      'none',
      'Come to the front door',
      'Someone will meet you at the door and point you to the coffee in the fellowship hall.',
    ),
    step(
      'fs-school',
      'bible',
      'first',
      'Sunday School for all ages',
      'A class for every age before worship. Come for this too, or just for worship.',
    ),
    step(
      'fs-worship',
      'music',
      'second',
      'Worship',
      'About an hour. Children are welcome in the service, and there is a checked-in room for little ones.',
    ),
    step(
      'fs-after',
      'coffee',
      'none',
      'Stay and say hello',
      'We would love to meet you. Questions are always welcome.',
    ),
  ],
  primaryCta: {
    _type: 'ctaBlock',
    label: 'Plan your visit',
    linkType: 'internal',
    internalLink: ref('page-plan-your-visit'),
  },
};

const ways = structuredClone(byKey['home-other-ways']);
const ask = ways.cards.find((c) => c._key === 'how-ask');
if (ask) ask.body = 'Anything before you come, or something we can pray about';

const pageBuilder = [
  byKey['home-hero'],
  walk,
  byKey['home-belong'],
  byKey['home-week'],
  byKey['home-watch'],
  ways,
];

console.log('\nNew Home layout:');
for (const b of pageBuilder) console.log(`  ${b._key.padEnd(18)} ${b._type}  ${b.heading ?? ''}`);
console.log(
  `Retired from Home: ${home.pageBuilder
    .filter((b) => !pageBuilder.some((n) => n._key === b._key))
    .map((b) => b._key)
    .join(', ')}`,
);

// Footer: fold "Connect" (Contact) into "Visit".
const cols = structuredClone(settings.footerColumns ?? []);
const visit = cols.find((c) => c._key === 'f-visit');
const connect = cols.find((c) => c._key === 'f-connect');
let footerColumns = cols;
if (visit && connect) {
  visit.links = [
    ...visit.links,
    ...connect.links.filter((l) => !visit.links.some((v) => v._key === l._key)),
  ];
  footerColumns = cols.filter((c) => c._key !== 'f-connect');
}
console.log(
  `Footer columns: ${footerColumns.map((c) => `${c.title} (${c.links.length})`).join(', ')}\n`,
);

await apply('set homePage.pageBuilder (Your first Sunday)', async () => {
  await client.patch('homePage').set({ pageBuilder }).commit();
});
await apply('set siteSettings.footerColumns (Connect folded into Visit)', async () => {
  await client.patch('siteSettings').set({ footerColumns }).commit();
});
done(2);
