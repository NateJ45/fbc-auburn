// Every main page a page builder (2026-10-26). Contact, Privacy, News and notes and Sermons kept a
// fixed top and an "Extra sections" zone; Give and Bulletin were hard-coded with no Studio document.
// This moves the live content into the new Page layout arrays, so the pastor can rearrange,
// remove and add sections on every main page, and creates the Give and Bulletin pages:
//
//   contactPage   Page layout = opening banner (the old hero fields), Contact form, then the old
//                 Extra sections. The form's questions stay on the page's "The form" tab.
//   privacyPage   Page layout = opening banner, Privacy policy text (the old body and date).
//   journalPage   Page layout = opening banner, News and notes posts, the old Extra sections, then
//                 the closing band (the old Closing invitation fields).
//   sermonsPage   Page layout = opening banner, Watch, Every sermon, Sermon series (hidden until
//                 there is one), Podcast, then the old Extra sections.
//   page-give     A Studio page at /give/: banner, Ways to give, How gifts are cared for (the asks).
//   page-bulletin A Studio page at /bulletin/: banner, This week's bulletin.
//
// The old fields are NOT deleted (rule 1): the schema hides them as fossils. Run this BEFORE the
// code that reads the new arrays deploys; the code it replaces ignores them, so the order is safe.
// The copy here matches what each page renders today (the fixed fallbacks in the old page files).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (rule 16):
//   node scripts/content/builder-pages.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/builder-pages.mjs <backup-folder> --apply
// Every touched document is written to <backup-folder>/builder-pages-<stamp>.json first (keep it
// outside the repo). Safe to run twice: a page whose Page layout is already filled is skipped.
// After applying: refresh ci/sanity-snapshot.ndjson.gz (node scripts/snapshot.mjs export).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { client, APPLY, apply, done } from '../lib/sanity-lib.mjs';
import { plans, newPages } from '../lib/builder-pages-plan.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const ids = [
  'contactPage',
  'privacyPage',
  'journalPage',
  'sermonsPage',
  'page-give',
  'page-bulletin',
];
const docs = Object.fromEntries(
  await Promise.all(ids.map(async (id) => [id, await client.getDocument(id)])),
);
for (const id of ids.slice(0, 4)) {
  if (await client.getDocument(`drafts.${id}`))
    throw new Error(`${id} has an unpublished draft; publish or discard it first.`);
}
const giveTaken = await client.fetch(
  `*[_type == "page" && slug.current in ["give", "bulletin"] && !(_id in ["page-give", "page-bulletin"])]._id`,
);
if (giveTaken.length) throw new Error(`Another page already uses give or bulletin: ${giveTaken}`);

mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = join(dir, `builder-pages-${stamp}.json`);
if (APPLY) {
  writeFileSync(backup, JSON.stringify(docs, null, 2));
  console.log(`Backed up ${ids.length} documents (missing ones as null) to ${backup}\n`);
}

let n = 0;
for (const [id, build] of Object.entries(plans)) {
  const d = docs[id];
  if (!d) {
    console.log(`SKIP ${id}: no published document (the page renders its built-in sections)`);
    continue;
  }
  if (d.pageBuilder?.length) {
    console.log(`SKIP ${id}: Page layout already has ${d.pageBuilder.length} section(s)`);
    continue;
  }
  const sections = build(d);
  n++;
  await apply(`${id}: Page layout = ${sections.map((s) => s._type).join(', ')}`, () =>
    client.patch(id).set({ pageBuilder: sections }).commit(),
  );
}

for (const p of newPages) {
  if (docs[p._id]) {
    console.log(`SKIP ${p._id}: already exists`);
    continue;
  }
  n++;
  await apply(
    `create ${p._id} (/${p.slug.current}/): ${p.pageBuilder.map((s) => s._type).join(', ')}`,
    () => client.createIfNotExists(p),
  );
}

done(n);
