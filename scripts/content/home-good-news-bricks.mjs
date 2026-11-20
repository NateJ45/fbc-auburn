// Home's good news as four stones on the brick wall (2026-11-19, from the fbcbremen.org
// comparison; design sketch in docs/design-directions/2026-11-19-good-news/). The plain text band
// "The good news" (richTextSection, key home-gospel) becomes a "Cards with stone icons" block in
// the Brick wall look: four numbered cream stones on the navy brick wall (IconCards.astro).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/home-good-news-bricks.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/home-good-news-bricks.mjs <backup-folder> --apply
// homePage is written to <backup-folder> first. Keep that folder outside the repo.
//
// The words are our draft of the gospel split into four, each still marked [Placeholder: ...],
// with one [Jacob: ...] ask in the intro: doctrine is Jacob's (docs/agent/content-pages.md). The
// block keeps the key home-gospel, so the section and its heading id stay where they were.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const home = await client.getDocument('homePage');
if (!home) throw new Error('Missing homePage.');
const draft = await client.getDocument('drafts.homePage');
if (draft) {
  throw new Error('homePage has an unpublished draft; publish or discard it in the Studio first.');
}
writeFileSync(join(dir, 'home-before-good-news-bricks.json'), JSON.stringify(home, null, 2));
console.log(`Backed up homePage to ${dir}`);

const old = home.pageBuilder.find((b) => b._key === 'home-gospel');
if (!old) throw new Error('Home has no home-gospel block; read the document before running this.');
if (old._type === 'iconCardsSection') {
  console.log('home-gospel is already the brick wall. Nothing to do.');
  done(0);
  process.exit(0);
}

const stone = (key, icon, title, body, link) => ({
  _type: 'iconCard',
  _key: key,
  icon,
  title,
  body: `[Placeholder: ${body}]`,
  ...(link ? { link } : {}),
});

const goodNews = {
  _type: 'iconCardsSection',
  _key: 'home-gospel',
  eyebrow: 'The good news',
  heading: 'Why we open the Bible every Sunday',
  intro:
    '[Jacob: our draft of the good news in four short stones, for you to rewrite in your own words. This is the first place on the site a visitor meets the gospel.]',
  look: 'bricks',
  cards: [
    stone('gn-made', 'crown', 'Made to know him', 'God made us to know him and be known by him.'),
    stone(
      'gn-turned',
      'cracked-heart',
      'We turned away',
      'Every one of us has turned away, and that sin separates us from him.',
    ),
    stone(
      'gn-jesus',
      'cross',
      'Jesus in our place',
      'Jesus, God’s own Son, lived the life we could not, died on the cross in our place and rose again on the third day.',
    ),
    stone(
      'gn-new',
      'broken-chain',
      'Made new',
      'Anyone who turns from sin and trusts him is forgiven, made new and welcomed into God’s family for good.',
      {
        _type: 'ctaBlock',
        linkType: 'external',
        externalUrl: '/what-we-believe/#the-gospel',
        label: 'Read more in What we believe',
      },
    ),
  ],
};

console.log(`\nReplacing home-gospel (${old._type}) with the brick wall:`);
console.log(`  ${goodNews.eyebrow} / ${goodNews.heading}`);
for (const c of goodNews.cards) console.log(`  ${c.icon.padEnd(14)} ${c.title}`);

await apply('replace homePage home-gospel with the brick wall', async () => {
  await client
    .patch('homePage')
    .insert('replace', 'pageBuilder[_key=="home-gospel"]', [goodNews])
    .commit();
});
done(1);
