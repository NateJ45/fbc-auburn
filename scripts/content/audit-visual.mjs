// The restraint pass, content half (site audit 2026-10-25: GD-H4, GD-H5, GD-L2, UX-M3, UX-M5,
// P-9, P-22). The code half is in the same PR; this only changes which picture or icon a block
// shows. No words change.
//
// 1. The church mark is kept for one deliberate moment, About's "The story in our mark". The two
//    other big mark panels go to the new "No picture (the words alone)" option:
//      What we believe  "The gospel, first"  (art: mark -> none)
//      Plan your visit  "Bringing children"  (art: photo with no photo, so it showed the mark as an
//                                             empty slot; children are never photographed -> none)
// 2. Page-head icons that match their page, none repeated across the page heads:
//      Next steps  map-pin -> signpost   (the pin is Plan your visit's)
//      Leadership  coffee  -> church
//      Ministries  blocks  -> open-door  ("Find your place")
//      Events      clock   -> calendar
// 3. Next steps' steps, icons that match the words:
//      Know Jesus     bible         -> cross
//      Be baptized    praying-hands -> dove   (no water icon exists yet; see the PR)
//      Become a member coffee       -> handshake
//      Find a group   clock         -> bible  (the open Bible: a class, a study)
//      Serve          giving-hand   (kept)
//
// Dry by default, and a dry run needs no token (the dataset is public, so it reads it anonymously).
// Writing needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md), and then the
// token-authed client from scripts/lib/sanity-lib.mjs:
//   node scripts/content/audit-visual.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/audit-visual.mjs <backup-folder> --apply
// Every document it changes is written to <backup-folder>/audit-visual-before.json first (keep the
// folder outside the repo). Safe to run twice: each change checks the current value first, and a
// block or step that is not where it was is skipped with a note, never guessed at.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@sanity/client';

const APPLY = process.argv.includes('--apply');
const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

// --apply goes through sanity-lib (token, production second factor); a dry run reads anonymously.
const lib = APPLY ? await import('../lib/sanity-lib.mjs') : null;
const client = lib
  ? lib.client
  : createClient({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'wdpzvn6m',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2026-05-01',
      useCdn: false,
    });

// [doc id, block _key, field, from, to]
const BLOCK_CHANGES = [
  ['page-what-we-believe', 'wwb-short', 'art', 'mark', 'none'],
  ['page-plan-your-visit', 'pyv-kids', 'art', 'photo', 'none'],
  ['page-next-steps', 'ns-hero', 'icon', 'map-pin', 'signpost'],
  ['page-leadership', 'lead-hero', 'icon', 'coffee', 'church'],
  ['page-ministries', 'min-hero', 'icon', 'blocks', 'open-door'],
  ['page-events', 'ev-hero', 'icon', 'clock', 'calendar'],
];
// [doc id, block _key, step title starts with, from, to]
const STEP_CHANGES = [
  ['page-next-steps', 'ns-steps', 'Know Jesus', 'bible', 'cross'],
  ['page-next-steps', 'ns-steps', 'Be bapti', 'praying-hands', 'dove'],
  ['page-next-steps', 'ns-steps', 'Become a member', 'coffee', 'handshake'],
  ['page-next-steps', 'ns-steps', 'Find a group', 'clock', 'bible'],
];

const ids = [...new Set([...BLOCK_CHANGES, ...STEP_CHANGES].map((c) => c[0]))];
const docs = Object.fromEntries(
  await Promise.all(ids.map(async (id) => [id, await client.getDocument(id)])),
);
for (const id of ids) if (!docs[id]) throw new Error(`No ${id}; read the dataset first.`);
if (APPLY) {
  // An unpublished draft would put the old picture back the next time someone publishes it.
  const drafts = await client.fetch('*[_id in $ids]._id', {
    ids: ids.map((id) => `drafts.${id}`),
  });
  if (drafts.length)
    throw new Error(`Unpublished drafts exist (${drafts.join(', ')}); publish or discard them.`);
}
writeFileSync(join(dir, 'audit-visual-before.json'), JSON.stringify(docs, null, 2));
console.log(`Backed up ${ids.join(', ')} to ${join(dir, 'audit-visual-before.json')}\n`);

const plain = (s) => (typeof s === 'string' ? s.replace(/[​-‏﻿]/g, '') : '');
const patches = {}; // id -> { path: value }
let count = 0;

for (const [id, blockKey, field, from, to] of BLOCK_CHANGES) {
  const block = (docs[id].pageBuilder ?? []).find((b) => b._key === blockKey);
  const label = `${id} ${blockKey}.${field}`;
  if (!block) {
    console.log(`SKIP ${label}: no such block`);
    continue;
  }
  const now = block[field] ?? (field === 'art' ? 'photo' : undefined);
  if (now === to) {
    console.log(`DONE ${label} is already ${to}`);
    continue;
  }
  if (now !== from) {
    console.log(`SKIP ${label}: is ${now}, expected ${from} (an editor changed it; left alone)`);
    continue;
  }
  (patches[id] ??= {})[`pageBuilder[_key=="${blockKey}"].${field}`] = to;
  console.log(`${APPLY ? 'SET ' : 'DRY '} ${label}: ${from} -> ${to}`);
  count++;
}

for (const [id, blockKey, title, from, to] of STEP_CHANGES) {
  const block = (docs[id].pageBuilder ?? []).find((b) => b._key === blockKey);
  const step = block?.steps?.find((s) => plain(s.title).startsWith(title));
  const label = `${id} ${blockKey} "${title}" icon`;
  if (!step) {
    console.log(`SKIP ${label}: no such step`);
    continue;
  }
  if (step.icon === to) {
    console.log(`DONE ${label} is already ${to}`);
    continue;
  }
  if (step.icon !== from) {
    console.log(`SKIP ${label}: is ${step.icon}, expected ${from} (left alone)`);
    continue;
  }
  (patches[id] ??= {})[`pageBuilder[_key=="${blockKey}"].steps[_key=="${step._key}"].icon`] = to;
  console.log(`${APPLY ? 'SET ' : 'DRY '} ${label}: ${from} -> ${to}`);
  count++;
}

if (APPLY) {
  for (const [id, set] of Object.entries(patches)) {
    await lib.apply(`patch ${id} (${Object.keys(set).length} field(s))`, () =>
      client.patch(id).set(set).commit(),
    );
  }
  lib.done(count);
} else {
  console.log(`\nDRY RUN: ${count} change(s) in ${Object.keys(patches).length} document(s).`);
  console.log('Re-run with --apply and NCS_PRODUCTION_WRITE=yes to write.');
}
