// About > "Our building" (2026-10-23): a band with the pen-and-pencil sketch of the church
// (ImageText art "building", src/components/church/BuildingSketch.astro), between "Who we are" and
// "The story in our mark". The words are a marked placeholder until Jacob writes them.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/about-building-band.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/about-building-band.mjs <backup-folder> --apply
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
const about = await client.getDocument('aboutPage');
if (!about) throw new Error('No aboutPage.');
writeFileSync(join(dir, 'aboutPage-before-building-band.json'), JSON.stringify(about, null, 2));
console.log(`Backed up aboutPage to ${dir}`);

const keys = about.pageBuilder.map((b) => b._key);
if (keys.includes('about-building')) {
  console.log('About already has the building band; nothing to do.');
  done(0);
  process.exit(0);
}
if (!keys.includes('about-story'))
  throw new Error('About has no about-story block; read it first.');

const para = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s1`, marks: [], text }],
});
const band = {
  _type: 'imageTextSection',
  _key: 'about-building',
  art: 'building',
  eyebrow: 'Hamilton-Scipio Road',
  heading: 'Our building',
  body: [
    para(
      'about-building-p1',
      '[Placeholder: A brick church with a white porch and a small steeple, on the road through Auburn since 19__ (Jacob: what year was it built?). The ramp at the front makes every door an easy one, and the red cross by the sign has stood watch over the corner for years.]',
    ),
    para(
      'about-building-p2',
      '[Jacob: anything about the building people should know: who built it, what has changed, a story the older members tell.]',
    ),
  ],
};

await apply('aboutPage: add the "Our building" band after "Who we are"', () =>
  client
    .patch('aboutPage')
    .insert('after', 'pageBuilder[_key=="about-story"]', [band])
    .commit({ autoGenerateArrayKeys: false }),
);
done(1);
