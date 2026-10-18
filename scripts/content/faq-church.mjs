// The FAQ page still showed the starter's four placeholder questions ("How much does it cost to
// work with you?", "Replace this with real numbers...") and their business categories, live and in
// the FAQPage JSON-LD (found 2026-10-18). This retires them and adds church questions whose answers
// only restate what the site already says (the door, coffee, about an hour, Sunday School before
// worship, the checked-in room, Facebook, Southern Baptist). Pastor Jacob confirms or rewrites them
// (docs/PENDING.md 1c); no times are typed here (rule 15: the times live in Church facts).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/faq-church.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/faq-church.mjs <backup-folder> --apply
//   ...and --retire as well to delete the four starter questions (after Nathan's yes).
// Every faqItem, faqCategory and the faqPage are written to <backup-folder> first (rule 16:
// retiring data is backup-then-delete). Keep that folder outside the repo.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done, ref, toPT } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const before = await client.fetch(`{
  "items": *[_type == "faqItem"],
  "categories": *[_type == "faqCategory"],
  "page": *[_id == "faqPage"][0]
}`);
writeFileSync(join(dir, 'faq-before-church.json'), JSON.stringify(before, null, 2));
console.log(
  `Backed up ${before.items.length} questions, ${before.categories.length} categories and faqPage.`,
);

const STARTER = [
  'faq-do-you-travel',
  'faq-how-long-does-it-take',
  'faq-how-to-get-started',
  'faq-what-does-it-cost',
];
const retire = before.items.filter((i) => STARTER.includes(i._id.replace(/^drafts\./, '')));
console.log(`Retiring: ${retire.map((i) => i.question).join(' | ') || '(none left)'}`);

const categories = [
  { _id: 'faqcat-first-sunday', title: 'Your first Sunday', slug: 'your-first-sunday', order: 1 },
  { _id: 'faqcat-kids', title: 'Kids and families', slug: 'kids-and-families', order: 2 },
  { _id: 'faqcat-online', title: 'Watching online', slug: 'watching-online', order: 3 },
  { _id: 'faqcat-church', title: 'About the church', slug: 'about-the-church', order: 4 },
];
const q = (id, cat, order, question, answer) => ({
  _id: id,
  _type: 'faqItem',
  question,
  answer: toPT(answer),
  categoryRef: ref(cat),
  displayOrder: order,
});
const items = [
  q(
    'faq-where-do-i-go',
    'faqcat-first-sunday',
    1,
    'Where do I go when I arrive?',
    'Come to the front door. Someone will meet you there and point you to the coffee in the fellowship hall.',
  ),
  q(
    'faq-how-long',
    'faqcat-first-sunday',
    2,
    'How long is the service?',
    'Worship lasts about an hour.',
  ),
  q(
    'faq-sunday-school',
    'faqcat-first-sunday',
    3,
    'Do I have to come to Sunday School as well?',
    'No. Sunday School is for all ages and meets before worship. Come for both, or just for worship.',
  ),
  q(
    'faq-children',
    'faqcat-kids',
    1,
    'What about my children?',
    'Children are welcome in the service, and there is a checked-in room for little ones.',
  ),
  q(
    'faq-watch-online',
    'faqcat-online',
    1,
    'Can I watch online?',
    'Yes. Sunday worship is streamed live on Facebook.',
  ),
  q(
    'faq-what-kind',
    'faqcat-church',
    1,
    'What kind of church is this?',
    'We are a small Southern Baptist church in Ross Township. You can read what we believe on the What we believe page.',
  ),
];

for (const c of categories) {
  await apply(`create faqCategory ${c.title}`, () =>
    client.createOrReplace({
      _id: c._id,
      _type: 'faqCategory',
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      displayOrder: c.order,
    }),
  );
}
for (const it of items) {
  await apply(`create faqItem "${it.question}"`, () => client.createOrReplace(it));
}
await apply('set faqPage.categoryOrder', () =>
  client
    .patch('faqPage')
    .set({ categoryOrder: categories.map((c) => c.title) })
    .commit(),
);
// The deletions run only with --retire as well, after Nathan says yes (studio rule: stop before
// deleting data, even when it is backed up).
const RETIRE = process.argv.includes('--retire');
if (!RETIRE && retire.length)
  console.log('Not retiring the starter questions: pass --retire to delete them.');
for (const it of RETIRE ? retire : []) {
  await apply(`delete starter faqItem "${it.question}" (in the backup)`, () =>
    client.delete(it._id),
  );
}
done(categories.length + items.length + 1 + (RETIRE ? retire.length : 0));
