// Refreshes saved-section drafts whose words changed in src/sanity/sectionPatterns.ts
// (2026-10-26: "Christmas services" and "Easter services" moved onto the event blocks).
//
// seed-section-patterns.mjs never overwrites, so a pattern rewritten in code stays old in the
// dataset. This script replaces one ONLY when it is safe to:
//   - it exists as a draft (`drafts.pattern-<id>`) and has NO published twin (the pastor never
//     published it), and
//   - its title, note and sections still match the OLD pattern exactly (keys ignored), so the
//     pastor has not edited it. The old pattern is read from a JSON snapshot taken before the code
//     changed ({ "<id>": { title, note, section } }, keys stripped), passed with --old <file>.
// Anything else is skipped and reported, never touched.
//
// Before any write it saves each draft it will replace, verbatim, to --backup-dir as
// pattern-<id>.<timestamp>.json (written on a dry run too, so the plan and the backup match).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node --experimental-strip-types scripts/content/refresh-section-patterns.mjs --old <file> --backup-dir <dir> christmas-services easter-services
//   NCS_PRODUCTION_WRITE=yes node --experimental-strip-types scripts/content/refresh-section-patterns.mjs --apply --old <file> --backup-dir <dir> christmas-services easter-services

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';
import { SECTION_PATTERNS } from '../../src/sanity/sectionPatterns.ts';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const oldFile = flag('--old');
const backupDir = flag('--backup-dir');
const ids = args.filter(
  (a, i) => !a.startsWith('--') && !['--old', '--backup-dir'].includes(args[i - 1]),
);
if (!oldFile || !backupDir || ids.length === 0) {
  console.error('Usage: --old <snapshot.json> --backup-dir <dir> <pattern-id> [...]');
  process.exit(1);
}
const old = JSON.parse(readFileSync(oldFile, 'utf8'));
mkdirSync(backupDir, { recursive: true });

/** A deep copy without `_key`, so two copies of one pattern compare equal. */
const strip = (v) =>
  Array.isArray(v)
    ? v.map(strip)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => k !== '_key')
            .map(([k, x]) => [k, strip(x)]),
        )
      : v;
/** JSON with sorted keys, so field order does not matter. */
const canon = (v) =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(
          Object.keys(x)
            .sort()
            .map((k) => [k, x[k]]),
        )
      : x,
  );

const raw = client.withConfig({ perspective: 'raw' });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
let changes = 0;

for (const id of ids) {
  const pattern = SECTION_PATTERNS.find((p) => p.id === id);
  const before = old[id];
  if (!pattern || !before) {
    console.log(`SKIP ${id}: not in sectionPatterns.ts or not in the --old snapshot.`);
    continue;
  }
  const draftId = `drafts.pattern-${id}`;
  const [draft, published] = await Promise.all([
    raw.getDocument(draftId),
    raw.getDocument(`pattern-${id}`),
  ]);
  if (published) {
    console.log(`SKIP ${id}: it has been published, so it is the church's now.`);
    continue;
  }
  if (!draft) {
    console.log(`SKIP ${id}: no draft in the dataset (run seed-section-patterns.mjs instead).`);
    continue;
  }
  const unedited =
    draft.title === before.title &&
    draft.note === before.note &&
    canon(strip(draft.section)) === canon(before.section);
  if (!unedited) {
    console.log(`SKIP ${id}: the draft differs from the old pattern, so it has been edited.`);
    continue;
  }
  const backup = join(backupDir, `pattern-${id}.${stamp}.json`);
  writeFileSync(backup, JSON.stringify(draft, null, 2));
  console.log(`Backed up ${draftId} to ${backup}`);

  const section = pattern.sections();
  await apply(
    `replace draft "${pattern.title}" with (${section.map((s) => s._type).join(', ')})`,
    () =>
      client
        .patch(draftId)
        .ifRevisionId(draft._rev)
        .set({
          title: pattern.title,
          note: pattern.note,
          sectionType: section[0]?._type,
          section,
        })
        .commit(),
  );
  changes++;
}
done(changes);
