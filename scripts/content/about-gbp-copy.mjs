// The church's own words (2026-10-25): the description the church wrote for its Google Business
// Profile replaces our bracketed draft in About > "Who we are" (its closing line, "know Christ, make
// Him known, and glorify God", ends the second paragraph), and its welcome to every kind of visitor
// becomes the Plan your visit hero's subhead. The "[Jacob: how the church began]" ask stays.
//
// Each change is skipped if the block no longer holds what we expect (our placeholder, or an empty
// subhead), so an edit made in the Studio is never overwritten.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/about-gbp-copy.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/about-gbp-copy.mjs <backup-folder> --apply
// The aboutPage and page-plan-your-visit documents are written to <backup-folder> first. Keep that
// folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const STORY = [
  'First Baptist Church of Auburn is a welcoming, Bible-believing church on Hamilton-Scipio Road in Ross Township. We are here to proclaim the gospel of Jesus Christ and to help people grow in their relationship with Him. We believe the Bible is the inspired Word of God, and we seek to faithfully teach it and live out its truth.',
  'Our desire is to be a church where individuals and families worship together, grow through God’s Word, build meaningful relationships and serve our community. Together we seek to know Christ, make Him known, and glorify God in all that we do.',
];

const VISIT_SUBHEAD =
  'Whether you have followed Christ for years, are looking for a church home, or simply have questions about faith, you are welcome here. Come as you are.';

const block = (k, text) => ({
  _key: k,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: `${k}s`, _type: 'span', marks: [], text }],
});

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const about = await client.getDocument('aboutPage');
const visit = await client.getDocument('page-plan-your-visit');
if (!about || !visit) throw new Error('aboutPage or page-plan-your-visit is missing.');
writeFileSync(join(dir, 'about-before-gbp.json'), JSON.stringify(about, null, 2));
writeFileSync(join(dir, 'plan-your-visit-before-gbp.json'), JSON.stringify(visit, null, 2));
console.log(`Backed up both documents to ${dir}`);

let changes = 0;

const story = about.pageBuilder?.find((s) => s._key === 'about-story');
const first = story?.body?.[0]?.children?.map((c) => c.text).join('') ?? '';
if (first.startsWith('[Placeholder: First Baptist Church of Auburn is a close-knit')) {
  // Keep every block after our placeholder (the Jacob ask), replace the placeholder with two.
  const body = [block('gbp1', STORY[0]), block('gbp2', STORY[1]), ...story.body.slice(1)];
  console.log('About > Who we are: placeholder found, replacing it with the church’s words.');
  await apply('set aboutPage about-story body', async () => {
    await client.patch('aboutPage').set({ 'pageBuilder[_key=="about-story"].body': body }).commit();
  });
  changes++;
} else {
  console.log('About > Who we are: no longer our placeholder; left alone.');
}

const hero = visit.pageBuilder?.find((s) => s._key === 'pyv-hero');
if (hero && !hero.subhead?.trim()) {
  console.log('Plan your visit hero: subhead empty, adding the welcome.');
  await apply('set page-plan-your-visit pyv-hero subhead', async () => {
    await client
      .patch('page-plan-your-visit')
      .set({ 'pageBuilder[_key=="pyv-hero"].subhead': VISIT_SUBHEAD })
      .commit();
  });
  changes++;
} else {
  console.log('Plan your visit hero: subhead already set; left alone.');
}

done(changes);
