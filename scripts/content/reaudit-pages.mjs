// Re-audit, pages (2026-10-26): the content half of the re-audit's fixes. The code half is in the
// same PR, and it renders right both before and after this runs.
//
//   contactPage           the "A prayer request" topic goes (prayer has its own page and promise;
//                         contact.astro already hides it and sends ?topic=prayer to /prayer/)
//   homePage              the Ask card is for questions; a Prayer requests card links to /prayer/
//   page-plan-your-visit  shorter: Good to know folds into the walk's intro, the sign into Find us,
//                         Find us moves up beside the walk, the walk loses its own button (the
//                         closing band is the one invitation), the access asks become one list ask
//   page-pastoral-care    Call and Text first (the contact card's big buttons), the crisis line
//                         labelled "If it cannot wait" (its 988 and 911 are tap-to-call in code),
//                         the prayer form a link card at the end instead of the red closing band
//   page-prayer           the same label on its crisis line
//
// No "[Jacob: ...]" ask is dropped: the script counts them per page before and after and refuses
// to write a page that would lose one (the access asks are folded into one ask, word for word).
// The plan is scripts/lib/reaudit-content.mjs, unit-tested in reaudit-content.test.mjs.
//
// Dry by default, and a dry run needs no token (the dataset is public). Production needs --apply
// AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/reaudit-pages.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/reaudit-pages.mjs <backup-folder> --apply
// Under --apply each document is written to <backup-folder>/reaudit-pages-<id>.json first. Keep that
// folder outside the repo. Safe to run twice: it writes only what differs.
// After applying: refresh ci/sanity-snapshot.ndjson.gz (node scripts/snapshot.mjs export).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGE_PLANS, jacobAsks } from '../lib/reaudit-content.mjs';
import { readClient } from '../lib/reaudit-read.mjs';

const APPLY = process.argv.includes('--apply');
const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (APPLY && !dir) {
  console.error('Pass a backup folder (outside the repo) with --apply.');
  process.exit(1);
}
const lib = APPLY ? await import('../lib/sanity-lib.mjs') : null;
const client = lib ? lib.client : await readClient();

/** A short outline of a page's blocks, for the before and after. */
const outline = (doc) =>
  (doc?.pageBuilder ?? [])
    .map((b) => b.heading || b.headline || b.message?.slice(0, 24) || b._type)
    .join(' | ');

let changes = 0;
for (const [id, plan] of Object.entries(PAGE_PLANS)) {
  const doc = await client.getDocument(id);
  if (!doc) {
    console.log(`${id}: not found, skipped.`);
    continue;
  }
  const patch = plan(doc);
  const fields = Object.keys(patch);
  if (fields.length === 0) {
    console.log(`${id}: already applied.`);
    continue;
  }
  const after = { ...doc, ...patch };
  const asksBefore = jacobAsks(doc);
  const asksAfter = jacobAsks(after);
  // Folding several asks into one is allowed; losing an ask's words is not.
  const lost = asksBefore.filter((a) => {
    const words = a.replace(/^\[Jacob:\s*|\]$/g, '').toLowerCase();
    const core = words.split(/[,;?]/)[0].trim().slice(0, 24);
    return !asksAfter.some((b) => b.toLowerCase().includes(core));
  });
  console.log(`\n${id}: set ${fields.join(', ')}`);
  if (doc.pageBuilder && patch.pageBuilder) {
    console.log(`  before: ${outline(doc)}`);
    console.log(`  after:  ${outline(after)}`);
  }
  if (id === 'contactPage') {
    const opts = (d) => (d.formFields ?? []).flatMap((f) => f.options ?? []).join(', ');
    console.log(`  topics: ${opts(doc)}  ->  ${opts(after)}`);
  }
  console.log(`  [Jacob: ...] asks: ${asksBefore.length} -> ${asksAfter.length}`);
  if (lost.length) {
    console.error(`  REFUSING ${id}: these asks would be lost:\n    ${lost.join('\n    ')}`);
    process.exitCode = 1;
    continue;
  }
  changes++;
  if (lib) {
    if (await client.getDocument(`drafts.${id}`)) {
      console.error(`  ${id} has an unpublished draft; publish or discard it first. Skipped.`);
      process.exitCode = 1;
      continue;
    }
    writeFileSync(join(dir, `reaudit-pages-${id}.json`), JSON.stringify(doc, null, 2));
    await lib.apply(`set ${id} ${fields.join(', ')}`, async () => {
      await client.patch(id).set(patch).commit();
    });
  } else {
    console.log(`  DRY set ${id} ${fields.join(', ')}`);
  }
}
console.log(
  `\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${changes} change(s).` +
    (APPLY ? '' : ' Re-run with --apply (and NCS_PRODUCTION_WRITE=yes) to write.'),
);
