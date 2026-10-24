// The rest of the hppres.org audit (2026-10-24), the content half. Every change is to blocks the
// site already has or that this deploy adds (the Sunday times band, two-tone titles, the letter):
//   - Plan your visit: the page head shows the Sunday times band and "your visit" in auburn; the
//     three picture blocks are headed with the visitor's own questions ("What about my kids?",
//     "Where do I park?", "How will I find it?"); a "Good to know" fold-out list follows them
//     (what to wear, how long, access, directions from nearby towns, watching first).
//   - Ministries: "your place" in auburn in the page head (needs ministries-find-your-place.mjs).
//   - Leadership: a letter from Pastor Jacob after his section, placeholder words for him to make
//     his own.
//   - Watch: the live section says plainly what is NOT streamed (a [Jacob: ...] ask).
// Placeholder copy is marked "[Placeholder: ...]" and "[Jacob: ...]" as everywhere before launch.
// Creates only what is missing; a block already there (by _key) is left alone.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/hppres-wayfinding.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/hppres-wayfinding.mjs <backup-folder> --apply
// The four pages are written to <backup-folder> first, and the "after" versions beside them.
// Run it after the deploy that adds showTimes, headingAccent on page heads and letterSection.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

let blockKey = 0;
/** One plain paragraph of Portable Text. */
const para = (text) => ({
  _type: 'block',
  _key: `hw${++blockKey}`,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `hw${++blockKey}`, marks: [], text }],
});
const item = (key, question, ...answer) => ({
  _type: 'accordionItem',
  _key: key,
  question,
  answer: answer.map(para),
});

const IDS = ['page-plan-your-visit', 'page-ministries', 'page-leadership', 'page-watch'];
const docs = Object.fromEntries(
  await Promise.all(IDS.map(async (id) => [id, await client.getDocument(id)])),
);
for (const id of IDS) {
  if (!docs[id]) throw new Error(`Missing ${id}.`);
  writeFileSync(join(dir, `${id}-before-wayfinding.json`), JSON.stringify(docs[id], null, 2));
}

const changes = [];
const patches = {};

// ── Plan your visit ──────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-plan-your-visit'].pageBuilder);
  const hero = blocks.find((b) => b._key === 'pyv-hero');
  if (hero && !hero.showTimes) {
    hero.showTimes = true;
    hero.headingAccent = 'your visit';
    changes.push('Plan your visit: times band, "your visit" in auburn');
  }
  const RENAME = {
    'pyv-kids': 'What about my kids?',
    'pyv-here': 'Where do I park?',
    'pyv-sign': 'How will I find it?',
  };
  for (const [key, heading] of Object.entries(RENAME)) {
    const b = blocks.find((x) => x._key === key);
    if (b && b.heading !== heading) {
      changes.push(`Plan your visit: "${b.heading}" becomes "${heading}"`);
      b.heading = heading;
    }
  }
  if (!blocks.some((b) => b._key === 'pyv-good')) {
    const at = blocks.findIndex((b) => b._key === 'pyv-sign');
    blocks.splice(at < 0 ? blocks.length - 1 : at + 1, 0, {
      _type: 'accordionSection',
      _key: 'pyv-good',
      heading: 'Good to know',
      items: [
        item(
          'g-wear',
          'What should I wear?',
          '[Placeholder: Whatever you are comfortable in. You will see jeans and you will see Sunday best, and nobody minds which.] [Jacob: is that right?]',
        ),
        item(
          'g-long',
          'How long is the service?',
          '[Placeholder: About an hour, with Sunday School for every age before it.]',
        ),
        item(
          'g-access',
          'Is the building accessible?',
          '[Placeholder: A ramp leads up to the front door, and there are seats near the back for anyone who needs to step out.] [Jacob: is there an accessible restroom, large print, or help for hearing?]',
        ),
        item(
          'g-directions',
          'Coming from Hamilton, Fairfield or Oxford?',
          '[Jacob: the simplest way in from each town, in a sentence each, the way you would tell a friend on the phone.]',
        ),
        item(
          'g-watch',
          'Can I watch first?',
          'Yes. Sunday worship is streamed live, and the latest message is on the Watch page, so you can see a Sunday before you come.',
        ),
      ],
    });
    changes.push('Plan your visit: "Good to know" fold-out list');
  }
  patches['page-plan-your-visit'] = blocks;
}

// ── Ministries ───────────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-ministries'].pageBuilder);
  const hero = blocks.find((b) => b._key === 'min-hero');
  if (hero && /your place/i.test(hero.headline ?? '') && !hero.headingAccent) {
    hero.headingAccent = 'your place';
    changes.push('Ministries: "your place" in auburn');
  }
  patches['page-ministries'] = blocks;
}

// ── Leadership ───────────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-leadership'].pageBuilder);
  if (!blocks.some((b) => b._key === 'lead-letter')) {
    const at = blocks.findIndex((b) => b._key === 'lead-pastor');
    blocks.splice(at < 0 ? 1 : at + 1, 0, {
      _type: 'letterSection',
      _key: 'lead-letter',
      eyebrow: 'A letter from our pastor',
      greeting: 'Dear friends,',
      body: [
        para(
          '[Placeholder: Whether you have lived in Ross Township all your life or you just moved in down the road, I am glad you found us. First Baptist Auburn is a small church with a big table, and there is a seat at it for you.]',
        ),
        para(
          '[Placeholder: We are ordinary people who open the Bible together, pray for each other and try to love our neighbours well. Come as you are, ask any question you like, and let us get to know you.]',
        ),
        para(
          '[Jacob: make this letter your own: a few sentences in your voice about why you love this church and what you hope a visitor finds here.]',
        ),
      ],
      signOff: 'In Christ,',
      name: 'Jacob Wysong',
      role: 'Senior Pastor',
    });
    changes.push('Leadership: a letter from Pastor Jacob');
  }
  patches['page-leadership'] = blocks;
}

// ── Watch ────────────────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-watch'].pageBuilder);
  const live = blocks.find((b) => b._key === 'w-live');
  const ASK =
    '[Jacob: what is not streamed, so nobody waits for it: Sunday School? Wednesday nights?]';
  if (live && !JSON.stringify(live.body ?? []).includes('what is not streamed')) {
    live.body = [...(live.body ?? []), para(ASK)];
    changes.push('Watch: say what is not streamed');
  }
  patches['page-watch'] = blocks;
}

for (const c of changes) console.log(`  ${c}`);
for (const [id, pageBuilder] of Object.entries(patches)) {
  writeFileSync(
    join(dir, `${id}-after-wayfinding.json`),
    JSON.stringify({ ...docs[id], pageBuilder }, null, 2),
  );
  // A page with nothing to change is not written.
  if (JSON.stringify(pageBuilder) === JSON.stringify(docs[id].pageBuilder)) continue;
  await apply(`patch ${id}.pageBuilder`, () => client.patch(id).set({ pageBuilder }).commit());
}
done(changes.length);
