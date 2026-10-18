// Retire the starter's "Business Notes (Start Here)" document (rule 16).
//
// The studioNotes type held a business's "who you are / ideal client / voice /
// words to avoid" for a Start Here panel ("Your business at a glance"). The
// church site never used it: the one document is the starter's seeded
// placeholder text. The type, its panel and its seed row were removed on
// 2026-10-18 (PR "Studio speaks church"); this takes the orphaned document out
// of the dataset so nothing in the Studio points at a type that is gone.
//
// Guards: it deletes ONLY documents whose _type is studioNotes (the published
// one and any draft), and only when no other document references them.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes
// (.claude/rules/data-scripts.md):
//   node scripts/content/retire-studio-notes.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/retire-studio-notes.mjs <backup-folder> --apply
// Every document it would delete is written verbatim to
// <backup-folder>/studio-notes-before-retire.json FIRST, on a dry run too.
// Keep that folder outside the repo. To restore: createOrReplace each document
// in that file (and put the type back from git history).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, APPLY } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const docs = await client.fetch('*[_type == "studioNotes"]');
if (docs.length === 0) {
  // Never overwrite an earlier backup with an empty one.
  console.log('Nothing to retire: no studioNotes documents. Backup left untouched.');
  done(0);
} else {
  await retire(docs);
}

async function retire(docs) {
  const file = join(dir, 'studio-notes-before-retire.json');
  writeFileSync(file, JSON.stringify(docs, null, 2));
  console.log(`Backed up ${docs.length} studioNotes document(s) to ${file}`);

  let n = 0;
  for (const doc of docs) {
    const plainId = doc._id.replace(/^drafts\./, '');
    const refs = await client.fetch('count(*[references($a) || references($b)])', {
      a: plainId,
      b: `drafts.${plainId}`,
    });
    if (refs > 0) {
      console.log(`SKIP ${doc._id}: ${refs} document(s) reference it.`);
      continue;
    }
    await apply(`delete ${doc._id} (${doc._type}, updated ${doc._updatedAt})`, async () => {
      await client.delete(doc._id);
    });
    n++;
  }

  if (APPLY) {
    const left = await client.fetch('count(*[_type == "studioNotes"])');
    console.log(`\nVerify: ${left} studioNotes document(s) left.`);
    if (left !== 0) process.exitCode = 1;
  }
  done(n);
}
