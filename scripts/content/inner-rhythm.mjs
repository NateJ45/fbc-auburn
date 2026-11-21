// The inner-page rhythm pass, content half (2026-11-21). The code half added the Photo break
// block, the Image + text panel layout, the white alternate band and the "On this page" index.
// This puts one photo break on Plan your visit, What we believe, About and Ministries, and turns
// Plan your visit's "Getting in and getting around" into the panel layout. The plan, and why each
// photo and line, is in inner-rhythm-plan.mjs (pure, unit-tested in scripts/lib).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/inner-rhythm.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/inner-rhythm.mjs <backup-folder> --apply
// Each page is written to <backup-folder>/<id>-before-inner-rhythm-<time>.json first. Keep that
// folder outside the repo. Run it only after the deploy that adds the Photo break block and the
// layout field, or the Studio shows them as unknown.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';
import { STEPS, planPage } from './inner-rhythm-plan.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

let writes = 0;
for (const step of STEPS) {
  const doc = await client.getDocument(step.id);
  if (!doc) {
    console.log(`\n${step.id}: not found; skipped`);
    continue;
  }
  if (await client.getDocument(`drafts.${step.id}`)) {
    console.log(`\n${step.id}: has an unpublished draft. Publish or discard it first; skipped.`);
    continue;
  }
  const { pageBuilder, notes, changed } = planPage(doc, step);
  console.log(`\n${step.id}:`);
  for (const n of notes) console.log(`  ${n}`);
  if (!changed) continue;
  console.log('  New order:');
  for (const b of pageBuilder) {
    const flag = b._key === step.breakKey ? '  <- new' : b.layout === 'panel' ? '  <- panel' : '';
    console.log(
      `    ${b._key.padEnd(18)} ${b._type.padEnd(20)} ${b.heading ?? b.line ?? ''}${flag}`,
    );
  }
  const backup = join(dir, `${step.id}-before-inner-rhythm-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(doc, null, 2));
  console.log(`  Backed up to ${backup}`);
  await apply(`set ${step.id}.pageBuilder`, async () => {
    await client.patch(step.id).set({ pageBuilder }).commit();
  });
  writes += 1;
}
done(writes);
