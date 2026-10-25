// The site audit's collections pass (2026-10-25), the content half. The code half (the same PR)
// adds the "Every week" mode, the compact Ministries rows, the card actions and the rest.
//
//   - Church facts: Youth on Wednesday at 6:00 pm joins the service times (from the road sign,
//     unconfirmed like the rest), so Home's This week and the Events page both list it.
//   - Events: "Every week" lists each gathering once (mode everyWeek), and an empty "Coming up"
//     says something warm, with a [Jacob: ...] ask to put the big days in Church Trac early.
//   - Ministries: Sunday School once, under a new "Every age" group (with Fellowship, which is for
//     everyone); Giving leaves the page as its own section and becomes one card under Serve that
//     links to /give/; the page picture is the open door, not the ABC blocks; the two praying-hands
//     cards in Care no longer share a picture; the closing button says "Ask a question"; American
//     spelling ("neighbors").
//   - The missing page: its second button says "Ask a question" (the shared contact verb).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/data-scripts.md):
//   node scripts/content/audit-collections.mjs <backup-folder>
//   NCS_PRODUCTION_WRITE=yes node scripts/content/audit-collections.mjs <backup-folder> --apply
// Every document it changes is written to <backup-folder>/audit-collections-before.json first.
// Keep that folder outside the repo. Safe to run twice: each step checks whether it is done.
// Run it after the deploy that adds thisWeekSection.mode (an older Studio would offer to remove it).

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { client, apply, done } from '../lib/sanity-lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Pass a backup folder (outside the repo).');
  process.exit(1);
}

const ids = ['siteSettings', 'page-events', 'page-ministries', 'notFoundPage'];
const docs = Object.fromEntries(
  await Promise.all(ids.map(async (id) => [id, await client.getDocument(id)])),
);
for (const id of ids) if (!docs[id]) throw new Error(`No ${id}; read the dataset first.`);
// An unpublished draft would put the old page back the next time someone publishes it.
const drafts = await client.fetch('*[_id in $ids]._id', { ids: ids.map((id) => `drafts.${id}`) });
if (drafts.length)
  throw new Error(
    `Unpublished drafts exist (${drafts.join(', ')}); publish or discard them first.`,
  );
writeFileSync(join(dir, 'audit-collections-before.json'), JSON.stringify(docs, null, 2));
console.log(`Backed up ${ids.join(', ')} to ${join(dir, 'audit-collections-before.json')}\n`);

let changes = 0;
const us = (text) => (typeof text === 'string' ? text.replace(/neighbour/g, 'neighbor') : text);

// ── 1. Church facts: Youth on Wednesday ──────────────────────────────────────────────────────
{
  const times = docs.siteSettings.serviceTimes ?? [];
  const hasYouth = times.some((t) => t._key === 'youth' || /youth/i.test(t.label ?? ''));
  if (hasYouth) console.log('SKIP service times: Youth is already there');
  else {
    const row = {
      _key: 'youth',
      _type: 'serviceTime',
      label: 'Youth',
      day: 'wednesday',
      time: '18:00',
      confirmed: false,
    };
    const after = times.some((t) => t._key === 'wednesday');
    // The after version, for review (and for building against a patched snapshot).
    const next = [...times];
    next.splice(after ? times.findIndex((t) => t._key === 'wednesday') + 1 : times.length, 0, row);
    writeFileSync(
      join(dir, 'audit-collections-serviceTimes-after.json'),
      JSON.stringify(next, null, 2),
    );
    console.log('  service times + Youth, Wednesday 18:00 (unconfirmed, from the road sign)');
    changes++;
    await apply('add Youth to siteSettings.serviceTimes', async () => {
      const p = client.patch('siteSettings').setIfMissing({ serviceTimes: [] });
      await (
        after
          ? p.insert('after', 'serviceTimes[_key=="wednesday"]', [row])
          : p.append('serviceTimes', [row])
      ).commit();
    });
  }
}

// ── 2. Events ────────────────────────────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-events'].pageBuilder ?? []);
  const log = [];
  const week = blocks.find((b) => b._key === 'ev-week' && b._type === 'thisWeekSection');
  if (!week) throw new Error('page-events has no ev-week thisWeekSection; read it first.');
  if (week.mode !== 'everyWeek') {
    week.mode = 'everyWeek';
    week.intro ??=
      'Sunday School, worship and the Wednesday evening, every week of the year. Come to any of them.';
    log.push('ev-week: mode everyWeek, an intro line');
  }
  const coming = blocks.find((b) => b._key === 'ev-coming' && b._type === 'eventsSection');
  if (!coming) throw new Error('page-events has no ev-coming eventsSection; read it first.');
  if (!coming.emptyText) {
    coming.emptyText =
      'Nothing special is on the calendar just now, so Sunday morning or Wednesday evening is the best time to meet everyone. [Jacob: please put the big days in Church Trac as soon as their dates are set (homecoming, revival, VBS, Christmas Eve, Easter, the Thanksgiving meal, baptism Sundays), so they show here and on Home and the church looks as busy as it is.]';
    log.push('ev-coming: a warm empty state with the ask for the big days');
  }
  if (log.length) {
    log.forEach((l) => console.log(`  ${l}`));
    changes++;
    writeFileSync(
      join(dir, 'audit-collections-events-after.json'),
      JSON.stringify(blocks, null, 2),
    );
    await apply('set page-events.pageBuilder', () =>
      client.patch('page-events').set({ pageBuilder: blocks }).commit(),
    );
  } else console.log('SKIP page-events: already done');
}

// ── 3. Ministries ────────────────────────────────────────────────────────────────────────────
{
  const blocks = structuredClone(docs['page-ministries'].pageBuilder ?? []);
  const log = [];

  const hero = blocks.find((b) => b._type === 'heroSection');
  if (hero && hero.icon === 'blocks') {
    hero.icon = 'open-door';
    log.push('hero: the open door, not the ABC blocks');
  }

  const fyp = blocks.find((b) => b._type === 'findYourPlaceSection');
  if (!fyp) throw new Error('page-ministries has no findYourPlaceSection; read it first.');
  const groups = fyp.groups ?? [];
  const group = (key) => groups.find((g) => g._key === key);

  // Sunday School once, under "Every age", with Fellowship beside it.
  if (!group('g-every')) {
    const school = group('g-kids')?.cards?.find((c) => c._key === 'k-school') ??
      group('g-adults')?.cards?.find((c) => c._key === 'a-school') ?? {
        _type: 'fypCard',
        title: 'Sunday School',
        forWho: 'Every age',
        day: 'Sundays',
        icon: 'chalkboard',
        body: '[Placeholder: Classes for every age before worship, working through the Bible together.] [Jacob: who leads it, and where it meets.]',
      };
    const fellowship = group('g-adults')?.cards?.find((c) => c._key === 'a-fellowship');
    for (const g of groups) {
      if (g.cards)
        g.cards = g.cards.filter(
          (c) =>
            !(c.title === 'Sunday School' || c._key === 'k-school' || c._key === 'a-school') &&
            c._key !== 'a-fellowship',
        );
    }
    const every = {
      _key: 'g-every',
      _type: 'fypGroup',
      title: 'Every age',
      line: 'Before worship on Sunday, and around a table now and then.',
      cards: [
        { ...school, _key: 'e-school', forWho: 'Children, youth and adults' },
        ...(fellowship ? [fellowship] : []),
      ],
    };
    const at = groups.findIndex((g) => g._key === 'g-new');
    groups.splice(at + 1, 0, every);
    log.push(
      `find your place: Sunday School once, in a new "Every age" group${fellowship ? ' with Fellowship' : ''}`,
    );
  }

  // Giving: one card under Serve that links to /give/.
  const serve = group('g-serve');
  if (serve && !serve.cards?.some((c) => c._key === 's-give')) {
    serve.cards = [
      ...(serve.cards ?? []),
      {
        _key: 's-give',
        _type: 'fypCard',
        title: 'Giving',
        icon: 'giving-hand',
        body: 'The offering is part of worship on Sunday. Nobody is expected to give on a first visit.',
        link: {
          _type: 'ctaBlock',
          linkType: 'external',
          externalUrl: '/give/',
          label: 'Ways to give',
        },
      },
    ];
    log.push('find your place: a Giving card under Serve, linking to /give/');
  }

  // Care: two cards shared the praying hands.
  const life = group('g-care')?.cards?.find((c) => c._key === 'c-life');
  if (life && life.icon === 'praying-hands') {
    life.icon = 'dove';
    log.push('find your place: "When life happens" takes the dove');
  }

  // American spelling, anywhere in the hub and the serving section.
  const before = JSON.stringify(blocks);
  const fixed = JSON.parse(before, (_k, v) => us(v));
  if (JSON.stringify(fixed) !== before) log.push('spelling: neighbours -> neighbors');

  // Giving leaves as its own section.
  const out = fixed.filter((b) => !(b._type === 'iconCardsSection' && b._key === 'min-give'));
  if (out.length !== fixed.length) log.push('the Giving section goes (now a card under Serve)');

  // The closing band uses the shared contact verb. It stays an internal link (an external one opens
  // a new tab); the button is the page's one red button.
  const cta = out.find((b) => b._type === 'ctaBandSection' && b._key === 'min-cta');
  if (cta?.cta && cta.cta.label !== 'Ask a question') {
    cta.cta.label = 'Ask a question';
    log.push('closing band: "Ask a question"');
  }

  if (log.length) {
    log.forEach((l) => console.log(`  ${l}`));
    changes++;
    await apply('set page-ministries.pageBuilder', () =>
      client.patch('page-ministries').set({ pageBuilder: out }).commit(),
    );
    writeFileSync(
      join(dir, 'audit-collections-ministries-after.json'),
      JSON.stringify(out, null, 2),
    );
  } else console.log('SKIP page-ministries: already done');
}

// ── 4. The missing page: the shared contact verb ──────────────────────────────────────────────
{
  const nf = docs.notFoundPage;
  if (nf.secondaryCtaLabel === 'Ask a question') console.log('SKIP notFoundPage: already done');
  else {
    console.log('  404: second button "Ask a question", to the contact form with the topic set');
    changes++;
    await apply('set notFoundPage.secondaryCta', () =>
      client
        .patch('notFoundPage')
        .set({ secondaryCtaLabel: 'Ask a question', secondaryCtaHref: '/contact/?topic=question' })
        .commit(),
    );
  }
}

done(changes);
