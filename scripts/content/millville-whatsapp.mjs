// Millville, Ross and Hamilton (2026-10-26). Pastor Jacob wants the site to be a "digital front
// door for Millville, Ross and Hamilton", and Millville appeared nowhere on it. This script puts his
// phrase into the content that lives in Sanity; the code side (the footer line, the page fallbacks
// and the Church JSON-LD's areaServed) ships in the same PR and needs no data.
//
//   Home         seoDescription        adds ", serving Millville, Ross and Hamilton"
//   About        seoDescription        the same
//   About        hero subhead          the same
//   Plan visit   "Find us" map intro   "Easy to reach from Millville, Ross and Hamilton."
//
// WhatsApp needs no data: Social links now take any link and read the icon from it, and nothing is
// added until the church sends its own WhatsApp link (a For Jacob note on Contact asks for it).
//
// Each change happens only when the field still holds the wording we wrote (or, for the map intro,
// is empty), so an edit made in the Studio is never overwritten, and a second run changes nothing.
//
// Dry by default, and a dry run needs no token (the dataset is public; it reads the published
// documents). Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/millville-whatsapp.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/millville-whatsapp.mjs <backup-folder> --apply
// Under --apply every document it touches is written to <backup-folder>/<id>-before-millville.json
// first. Keep that folder outside the repo. After applying: refresh ci/sanity-snapshot.ndjson.gz
// (node scripts/snapshot.mjs export).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readClient } from '../lib/reaudit-read.mjs';

const APPLY = process.argv.includes('--apply');
const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (APPLY && !dir) {
  console.error('Pass a backup folder (outside the repo) with --apply.');
  process.exit(1);
}

const lib = APPLY ? await import('../lib/sanity-lib.mjs') : null;
const client = lib ? lib.client : await readClient();

const SERVING = 'serving Millville, Ross and Hamilton';

// What each field holds now (our wording), and what it becomes.
const HOME_SEO_OLD =
  'A Southern Baptist church on Hamilton-Scipio Road in Ross Township, Ohio. Come as you are this Sunday.';
const HOME_SEO_NEW = `A Southern Baptist church on Hamilton-Scipio Road in Ross Township, Ohio, ${SERVING}. Come as you are this Sunday.`;
const ABOUT_SEO_OLD =
  'Who we are at First Baptist Church of Auburn, a Southern Baptist church in Ross Township, Ohio.';
const ABOUT_SEO_NEW = `Who we are at First Baptist Church of Auburn, a Southern Baptist church in Ross Township, Ohio, ${SERVING}.`;
const ABOUT_SUB_OLD =
  'A Southern Baptist church in the hamlet of Auburn, Ross Township, since 1959 (to be confirmed).';
const ABOUT_SUB_NEW = `A Southern Baptist church in the hamlet of Auburn, Ross Township, since 1959 (to be confirmed), ${SERVING}.`;
const MAP_INTRO = 'Easy to reach from Millville, Ross and Hamilton.';

/** One planned change: the document, a patch path, the value, and a line for the log. */
const plan = [];
const skipped = [];

function consider(doc, where, path, current, next, ok) {
  if (current === next) skipped.push(`${where}: already says it.`);
  else if (ok) plan.push({ id: doc._id, where, path, from: current, to: next });
  else skipped.push(`${where}: edited in the Studio since; left alone.`);
}

const [home, about, visit] = await Promise.all([
  client.getDocument('homePage'),
  client.getDocument('aboutPage'),
  client.getDocument('page-plan-your-visit'),
]);
if (!home || !about || !visit)
  throw new Error('homePage, aboutPage or page-plan-your-visit is missing.');

consider(
  home,
  'Home SEO description',
  'seoDescription',
  home.seoDescription,
  HOME_SEO_NEW,
  !home.seoDescription || home.seoDescription === HOME_SEO_OLD,
);
consider(
  about,
  'About SEO description',
  'seoDescription',
  about.seoDescription,
  ABOUT_SEO_NEW,
  !about.seoDescription || about.seoDescription === ABOUT_SEO_OLD,
);

const aboutHero = about.pageBuilder?.find((s) => s._key === 'about-hero');
if (aboutHero) {
  consider(
    about,
    'About hero subhead',
    'pageBuilder[_key=="about-hero"].subhead',
    aboutHero.subhead,
    ABOUT_SUB_NEW,
    aboutHero.subhead === ABOUT_SUB_OLD,
  );
} else skipped.push('About hero subhead: no about-hero block; left alone.');

const map = visit.pageBuilder?.find((s) => s._key === 'pyv-map');
if (map) {
  consider(
    visit,
    'Plan your visit "Find us" intro',
    'pageBuilder[_key=="pyv-map"].intro',
    map.intro,
    MAP_INTRO,
    !map.intro?.trim(),
  );
} else skipped.push('Plan your visit map: no pyv-map block; left alone.');

for (const s of skipped) console.log(`SKIP  ${s}`);
for (const c of plan) {
  console.log(`\n${APPLY ? 'SET ' : 'DRY '}  ${c.where} (${c.id} ${c.path})`);
  console.log(`  now:   ${c.from ?? '(empty)'}`);
  console.log(`  after: ${c.to}`);
}

const ids = [...new Set(plan.map((c) => c.id))];
if (lib && ids.length) {
  for (const id of ids) {
    // An unpublished draft would put the old words back the next time someone publishes it.
    if (await client.getDocument(`drafts.${id}`))
      throw new Error(`${id} has an unpublished draft; publish or discard it first.`);
  }
  const docs = { homePage: home, aboutPage: about, 'page-plan-your-visit': visit };
  for (const id of ids) {
    const file = join(dir, `${id}-before-millville.json`);
    writeFileSync(file, JSON.stringify(docs[id], null, 2));
    console.log(`\nBacked up ${id} to ${file}`);
  }
  for (const id of ids) {
    const set = Object.fromEntries(plan.filter((c) => c.id === id).map((c) => [c.path, c.to]));
    await lib.apply(`set ${id} ${Object.keys(set).join(', ')}`, async () => {
      await client.patch(id).set(set).commit();
    });
  }
}

console.log(
  `\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${plan.length} change(s) in ${ids.length} document(s).` +
    (APPLY || !plan.length ? '' : ' Re-run with --apply (and NCS_PRODUCTION_WRITE=yes) to write.'),
);
