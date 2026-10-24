// What we believe, pictures (2026-10-23): the Baptism section showed the retired stone-mosaic
// baptism drawing, so it takes the sanctuary photo (the baptistry stands behind the pulpit), and
// "The gospel, first" takes the brick-cross mark in its place.
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/wwb-pictures.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/wwb-pictures.mjs <backup-folder> --apply
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}
const doc = await client.getDocument('page-what-we-believe');
if (!doc) throw new Error('No page-what-we-believe.');
writeFileSync(join(dir, 'page-what-we-believe-before-pictures.json'), JSON.stringify(doc, null, 2));
const short = doc.pageBuilder.find((b) => b._key === 'wwb-short');
if (!short?.image?.asset) throw new Error('wwb-short has no photo to move; read the page first.');

await apply(
  'What we believe: the sanctuary photo moves to Baptism, the mark to The gospel, first',
  () =>
    client
      .patch('page-what-we-believe')
      .set({
        'pageBuilder[_key=="wwb-baptism"].art': 'photo',
        'pageBuilder[_key=="wwb-baptism"].image': short.image,
        'pageBuilder[_key=="wwb-short"].art': 'mark',
      })
      .commit(),
);
done(1);
