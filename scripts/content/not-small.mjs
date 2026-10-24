// Sell the closeness, not the size (2026-10-24, from a design review): "small" can read as
// "dying" or "under-resourced" to a first-time visitor, so the copy says "close-knit" instead.
// The tagline (the footer's headline, the phone menu and the share images), About's "Who we are"
// draft and the "What kind of church" answer. "A small steeple" stays: that one is the building.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/not-small.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/not-small.mjs <backup-folder> --apply
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
const TAGLINE = 'A close-knit church with the door open.';
const ids = ['siteSettings', 'aboutPage', 'faq-what-kind'];
const docs = {};
for (const id of ids) {
  docs[id] = await client.getDocument(id);
  if (!docs[id]) throw new Error(`Missing ${id}`);
  writeFileSync(join(dir, `${id}-before-not-small.json`), JSON.stringify(docs[id], null, 2));
}
console.log(`Backed up ${ids.join(', ')} to ${dir}`);

// Rewrite "small" in a Portable Text field's spans, by exact phrase, and report what changed.
function rewrite(blocks, from, to) {
  let n = 0;
  const out = JSON.parse(JSON.stringify(blocks));
  for (const b of out)
    for (const c of b.children ?? [])
      if (typeof c.text === 'string' && c.text.includes(from)) {
        c.text = c.text.split(from).join(to);
        n++;
      }
  return { out, n };
}

let changes = 0;
if (docs.siteSettings.tagline !== TAGLINE) {
  await apply(`siteSettings: tagline -> "${TAGLINE}"`, () =>
    client.patch('siteSettings').set({ tagline: TAGLINE }).commit(),
  );
  changes++;
}

const about = docs.aboutPage;
const story = about.pageBuilder.find((b) => b._key === 'about-story');
if (story?.body) {
  const { out, n } = rewrite(
    story.body,
    'is a small Southern Baptist church',
    'is a close-knit Southern Baptist church',
  );
  if (n) {
    await apply('aboutPage: "Who we are" says close-knit, not small', () =>
      client.patch('aboutPage').set({ 'pageBuilder[_key=="about-story"].body': out }).commit(),
    );
    changes++;
  }
}

const faq = docs['faq-what-kind'];
if (faq.answer) {
  const { out, n } = rewrite(
    faq.answer,
    'We are a small Southern Baptist church',
    'We are a close-knit Southern Baptist church',
  );
  if (n) {
    await apply('faq-what-kind: close-knit, not small', () =>
      client.patch('faq-what-kind').set({ answer: out }).commit(),
    );
    changes++;
  }
}
done(changes);
