// Safe to edit by hand
// =============================================================================
// CollectionIntro: the first item under Sermons, People and Downloads
// =============================================================================
// FBC Auburn (2026-10-18). Sanity's own list says only "No documents of this
// type" when it is empty, which tells the pastor nothing. This pane is the
// friendly front door instead: what the list is for, how many there are, one
// big button for the job he does most, and the Site Guide entry that walks
// him through it. Read-only except for one thing: on People, when no groups
// exist yet, a button adds the usual five (Staff, Deacons, Teachers,
// Missionaries, Volunteers). That is a write HE makes in his own Studio, with
// fixed ids so pressing it twice cannot make doubles.
//
// Card 132: drawn in the kit's design language, like the rest of the Studio:
// the rule and the type's stone art over a display-font title, the count as a
// display-font figure on a white card with the colour edge, one strong pill,
// callouts for the groups offer and the result, and the stone path along the
// foot. Everything comes from src/sanity/kit/ui and brand.config.json
// studio.look.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { useIntentLink } from 'sanity/router';
import type { BrandIconKey } from '../../lib/studio-icons';
import {
  ColourEdge,
  Figure,
  KitAction,
  KitLoading,
  KitNotice,
  KitScope,
  Sill,
  ToolHead,
} from '../kit/ui';

interface IntroConfig {
  title: string;
  /** Plain sentences, one per paragraph. */
  lines: string[];
  /** GROQ that counts what is there (published and drafts alike). */
  countQuery: string;
  /** "sermon" -> "1 sermon" / "3 sermons". */
  noun: [string, string];
  /** What the first-time line says when the count is 0. */
  empty: string;
  create: { type: string; label: string };
  /** The art drawn beside the title (a meaning in the icon registry). */
  meaning: BrandIconKey;
  /** Offer to add the usual people groups when there are none. */
  seedGroups?: boolean;
}

export const USUAL_GROUPS = ['Staff', 'Deacons', 'Teachers', 'Missionaries', 'Volunteers'];

export function makeCollectionIntro(config: IntroConfig) {
  function CollectionIntro() {
    const client = useClient({ apiVersion: '2024-01-01' });
    const [count, setCount] = useState<number | null>(null);
    const [groups, setGroups] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState('');

    const load = useCallback(() => {
      client
        .fetch<number>(config.countQuery)
        .then(setCount)
        .catch(() => setCount(null));
      if (config.seedGroups) {
        client
          .fetch<number>('count(*[_type == "personGroup"])')
          .then(setGroups)
          .catch(() => setGroups(null));
      }
    }, [client]);
    const create = useIntentLink({ intent: 'create', params: { type: config.create.type } });
    useEffect(load, [load]);

    const addGroups = async () => {
      setBusy(true);
      try {
        const tx = client.transaction();
        USUAL_GROUPS.forEach((title, i) =>
          tx.createIfNotExists({
            _id: `personGroup-${title.toLowerCase()}`,
            _type: 'personGroup',
            title,
            order: i + 1,
          }),
        );
        await tx.commit();
        setNote('Added. You can rename them or add more under Groups.');
        load();
      } catch {
        setNote('That did not work. Try again in a moment, or add a group by hand under Groups.');
      } finally {
        setBusy(false);
      }
    };

    const [one, many] = config.noun;
    return (
      <KitScope>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '28px 20px 32px',
            display: 'grid',
            gap: 22,
          }}
        >
          <ToolHead
            title={config.title}
            meaning={config.meaning}
            lead={
              <>
                {config.lines.map((line, i) => (
                  <span key={line} style={{ display: 'block', marginTop: i ? 10 : 0 }}>
                    {line}
                  </span>
                ))}
              </>
            }
          />
          <section className="ui-box" aria-label={`${config.title}: how many`}>
            <ColourEdge />
            <div className="ui-box__body" style={{ paddingTop: 24, gap: 18 }}>
              {count === null ? (
                <KitLoading label="Counting" />
              ) : count === 0 ? (
                <p className="ui-clear__title" style={{ fontSize: 24 }}>
                  {config.empty}
                </p>
              ) : (
                <Figure value={count} label={`${count === 1 ? one : many} so far`} />
              )}
              <div>
                <KitAction strong href={create.href} onClick={create.onClick}>
                  {config.create.label}
                </KitAction>
              </div>
            </div>
          </section>
          {config.seedGroups && groups === 0 && (
            <KitNotice tone="tip" title="There are no groups yet.">
              <p>
                Each person goes in a group, like Staff or Deacons. Add the usual five now, then
                rename or add to them under Groups whenever you like.
              </p>
              <div style={{ marginTop: 12 }}>
                <KitAction onClick={() => void addGroups()} disabled={busy}>
                  {busy ? 'Adding...' : `Add ${USUAL_GROUPS.join(', ')}`}
                </KitAction>
              </div>
            </KitNotice>
          )}
          {note && <KitNotice tone="plain">{note}</KitNotice>}
          <p className="ui-muted" style={{ fontSize: 15 }}>
            Step-by-step help is in Site Guide, in the bar at the top.
          </p>
          <Sill />
        </div>
      </KitScope>
    );
  }
  CollectionIntro.displayName = `CollectionIntro(${config.create.type})`;
  return CollectionIntro;
}

export const SermonsIntro = makeCollectionIntro({
  title: 'Sermons',
  lines: [
    'Every sermon you add here goes on the website at /sermons/, newest first, with the video, the recording and the notes. The home page card names the newest one for a week after it was preached.',
    'Group sermons into a series (a book of the Bible, or a topic) under Sermon series. Sermons with an uploaded recording also go into the podcast.',
  ],
  countQuery: 'count(*[_type == "sermon" && !(_id in path("drafts.**"))])',
  noun: ['sermon', 'sermons'],
  empty: 'No sermons yet. The first one takes about two minutes.',
  create: { type: 'sermon', label: "Add Sunday's sermon" },
  meaning: 'scripture',
});

export const PeopleIntro = makeCollectionIntro({
  title: 'People',
  lines: [
    'One list of the church’s people: staff, deacons, teachers, missionaries and volunteers. Type each person once, then show a group on any page with the People section.',
    'Everything typed here is public, even what the website does not show. Only add an email or a place that is fine to be public.',
  ],
  countQuery: 'count(*[_type == "person" && !(_id in path("drafts.**"))])',
  noun: ['person', 'people'],
  empty: 'Nobody on the list yet.',
  create: { type: 'person', label: 'Add someone' },
  meaning: 'people',
  seedGroups: true,
});

export const DownloadsIntro = makeCollectionIntro({
  title: 'Downloads',
  lines: [
    'Bulletins, newsletters, forms and policies people can open or print. The newest Bulletin is always at /bulletin/, so that one address never needs changing.',
    'Give a file a "take it down after" date and the website drops it by itself. Every file uploaded here is public.',
  ],
  countQuery: 'count(*[_type == "download" && !(_id in path("drafts.**"))])',
  noun: ['file', 'files'],
  empty: 'Nothing uploaded yet.',
  create: { type: 'download', label: "Put up this week's bulletin" },
  meaning: 'download',
});
