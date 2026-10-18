// Retire the starter's two placeholder News drafts (rule 16).
//
// The starter seeded "Welcome to the Journal" and "Second placeholder post (replace me)" as
// unpublished drafts. They were never shown on the site, but they sat at the top of the Studio's
// Home ("Pick up where you left off") and in the Checkup. Nathan said delete them on 2026-10-18.
//
// Guards: it deletes ONLY the two seeded ids below (draft and published forms), only while each is
// still a journalEntry, and only when nothing references it.
//
// Reads use perspective 'raw': newer API versions read the published view by default, which hides
// drafts, and both of these are drafts.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes
// (.claude/rules/data-scripts.md):
//   node scripts/content/retire-starter-posts.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/retire-starter-posts.mjs <backup-folder> --apply
// Every document it would delete is written verbatim to
// <backup-folder>/starter-posts-before-retire.json FIRST, on a dry run too. Keep that folder
// outside the repo. To restore: createOrReplace each document in that file.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, APPLY } from '../lib/sanity-lib.mjs';

const SEEDED = ['journal-entry-welcome', 'journal-entry-second-post'];
const ids = [...SEEDED, ...SEEDED.map((id) => `drafts.${id}`)];

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const raw = client.withConfig({ perspective: 'raw' });
const docs = await raw.fetch('*[_id in $ids && _type == "journalEntry"]', { ids });
if (docs.length === 0) {
  // Never overwrite an earlier backup with an empty one.
  console.log('Nothing to retire: the seeded posts are gone. Backup left untouched.');
  done(0);
} else {
  await retire(docs);
}

async function retire(docs) {
  const file = join(dir, 'starter-posts-before-retire.json');
  writeFileSync(file, JSON.stringify(docs, null, 2));
  console.log(`Backed up ${docs.length} post document(s) to ${file}`);

  let n = 0;
  for (const doc of docs) {
    const plainId = doc._id.replace(/^drafts\./, '');
    const refs = await raw.fetch('count(*[references($a) || references($b)])', {
      a: plainId,
      b: `drafts.${plainId}`,
    });
    if (refs > 0) {
      console.log(`SKIP ${doc._id}: ${refs} document(s) reference it.`);
      continue;
    }
    await apply(`delete ${doc._id} ("${doc.title}", updated ${doc._updatedAt})`, async () => {
      await client.delete(doc._id);
    });
    n++;
  }

  if (APPLY) {
    const left = await raw.fetch('count(*[_id in $ids])', { ids });
    console.log(`\nVerify: ${left} seeded post document(s) left.`);
    if (left !== 0) process.exitCode = 1;
  }
  done(n);
}
