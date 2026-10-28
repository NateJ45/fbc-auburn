// Safe to edit by hand
// =============================================================================
// "Make a graphic": the Studio tool (2026-10-27, docs/agent/graphics.md)
// =============================================================================
// Jacob picks what the graphic is for, checks the words (filled in from what the
// church already keeps: Church facts, sermons, event pages), picks the sizes and
// an optional photo, and downloads finished PNGs, or prints a print size to PDF.
// The design is fixed by the direction (src/lib/graphics/directions/): no colour,
// font or layout pickers, on purpose. Times, dates and the address come from
// Church facts and are shown read-only here, so a flyer can never disagree with
// the website.
//
// It opens on a choice of kinds; the "Make a graphic" document action (the id
// handed over in sessionStorage) opens straight onto a sermon, series or page.
// Everything is drawn in the browser (src/lib/graphics/raster.ts); nothing is
// saved to the dataset.
// =============================================================================

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useClient } from 'sanity';
import { Box, Flex, Grid, Stack, Text, TextArea, TextInput } from '@sanity/ui';
import {
  resolveChurchFacts,
  churchNow,
  type ChurchFacts,
  type TimeChange,
} from '../../lib/church-facts';
import { site } from '../../data/site';
import {
  FORMATS,
  FORMAT_BY_ID,
  GROUP_LABELS,
  type Format,
  type FormatGroup,
} from '../../lib/graphics/formats';
import { DEFAULT_DIRECTION, DIRECTIONS, LOOK_NAMES } from '../../lib/graphics/directions';
import { ASSETS } from '../../lib/graphics/assets';
import {
  canvasMeasure,
  download,
  fileName,
  loadFonts,
  printGraphic,
  svgToPng,
  svgUrl,
} from '../../lib/graphics/raster';
import {
  announcementContent,
  churchLines,
  eventContent,
  longDate,
  sermonContent,
  seriesContent,
  sundayContent,
  timeChangeContent,
  verseContent,
  welcomeContent,
  hasNotes,
  withoutNotes,
  standingFor,
} from '../../lib/graphics/content';
import type { Content, Ctx, Kind, Photo } from '../../lib/graphics/types';
import { KitAction, KitLoading, KitNotice, KitScope, TileCard, ToolHead } from '../kit/ui';
import { API_VERSION } from '../kit/shared';
import type { BrandIconKey } from '../../lib/studio-icons';

/** sessionStorage key the "Make a graphic" document action leaves the document id under. */
export const GRAPHICS_DOC_KEY = 'auburn-graphics:doc';

/** The first screen: what is it for. */
const KINDS: { kind: Kind; title: string; lead: string; meaning: BrandIconKey }[] = [
  {
    kind: 'sunday',
    title: 'Join us this Sunday',
    lead: 'This Sunday’s times, from Church facts.',
    meaning: 'place',
  },
  {
    kind: 'event',
    title: 'An event',
    lead: 'From a page with Event details, like Christmas Eve.',
    meaning: 'event',
  },
  {
    kind: 'sermon',
    title: 'A sermon or series',
    lead: 'Title, passage and preacher.',
    meaning: 'series',
  },
  {
    kind: 'verse',
    title: 'A Bible verse',
    lead: 'Type the verse and where it is from.',
    meaning: 'scripture',
  },
  {
    kind: 'announcement',
    title: 'An announcement',
    lead: 'A short notice in your own words.',
    meaning: 'notice',
  },
  {
    kind: 'time-change',
    title: 'A different Sunday',
    lead: 'A changed time, from Church facts.',
    meaning: 'times',
  },
  {
    kind: 'welcome',
    title: 'New here',
    lead: 'Connect cards, postcards and door hangers for the neighborhood.',
    meaning: 'people',
  },
];

/** The sizes ticked when a kind opens. */
const DEFAULT_SIZES: Record<Kind, string[]> = {
  sunday: ['post-portrait', 'story', 'slide'],
  event: ['post-portrait', 'story', 'event-cover', 'flyer'],
  sermon: ['post-portrait', 'slide', 'youtube-thumb'],
  verse: ['post-square', 'story', 'slide'],
  announcement: ['post-portrait', 'story', 'slide'],
  'time-change': ['post-portrait', 'story', 'slide'],
  welcome: ['connect-card', 'postcard', 'door-hanger'],
};

/** Word limits, shown as a count under each box (the templates also shrink to fit). */
const LIMITS = { kicker: 32, title: 60, verse: 220, body: 160 };

interface Source {
  id: string;
  label: string;
  sub?: string;
  content: Content;
  photoRef?: string | null;
}

interface AssetRow {
  _id: string;
  url: string;
  w: number;
  h: number;
}

const today = () => churchNow(new Date()).date;

/** Fetch a Sanity image at a sensible size as a data URI (so the canvas is never tainted). */
async function photoFrom(url: string, w: number, h: number, longest: number): Promise<Photo> {
  const scale = Math.min(1, longest / Math.max(w, h));
  const res = await fetch(`${url}?w=${Math.round(w * scale)}&fm=jpg&q=86`);
  if (!res.ok) throw new Error('The photo could not be loaded.');
  const blob = await res.blob();
  const src: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
  return { src, w: Math.round(w * scale), h: Math.round(h * scale) };
}

export function GraphicsTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const [facts, setFacts] = useState<ChurchFacts | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [kind, setKind] = useState<Kind | null>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [sourceId, setSourceId] = useState('');
  const [content, setContent] = useState<Content | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [assets, setAssets] = useState<AssetRow[] | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [busy, setBusy] = useState('');
  const [photoCount, setPhotoCount] = useState(12);
  const [lookId, setLookId] = useState(DEFAULT_DIRECTION.id);
  const look = DIRECTIONS.find((d) => d.id === lookId) ?? DEFAULT_DIRECTION;
  const measureRef = useRef<Ctx['measure'] | null>(null);

  // Fonts (for measuring) and the church's facts, once.
  useEffect(() => {
    let live = true;
    Promise.all([loadFonts(ASSETS), client.fetch(`*[_id == "siteSettings"][0]`)])
      .then(([, settings]) => {
        if (!live) return;
        measureRef.current = canvasMeasure();
        setFacts(resolveChurchFacts(settings));
        setReady(true);
      })
      .catch((e: unknown) => live && setError(String((e as Error)?.message ?? e)));
    return () => {
      live = false;
    };
  }, [client]);

  // Opened from a document's "Make a graphic" action: the id waits in sessionStorage.
  useEffect(() => {
    if (!ready) return;
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(GRAPHICS_DOC_KEY);
      sessionStorage.removeItem(GRAPHICS_DOC_KEY);
    } catch {
      // Private mode: no hand-off.
    }
    if (!id) return;
    client
      .fetch<{ _type: string } | null>(`*[_id == $id || _id == "drafts." + $id][0]{_type}`, { id })
      .then((d) => {
        const k: Kind | null =
          d?._type === 'sermon' || d?._type === 'sermonSeries'
            ? 'sermon'
            : d?._type === 'page'
              ? 'event'
              : null;
        if (k) openKind(k, id);
      })
      .catch(() => undefined);
    // openKind is stable enough for a one-shot read on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const siteUrl = site.url;
  const ctx: Ctx | null = useMemo(
    () =>
      facts && measureRef.current
        ? { measure: measureRef.current, assets: ASSETS, church: churchLines(facts, siteUrl) }
        : null,
    [facts, siteUrl],
  );

  async function loadSources(k: Kind): Promise<Source[]> {
    if (!facts) return [];
    const now = today();
    switch (k) {
      case 'sunday':
        return [
          {
            id: 'sunday',
            label: longDate(sundayContent(facts, now, siteUrl).date ?? now),
            content: sundayContent(facts, now, siteUrl),
          },
        ];
      case 'welcome':
        return [
          { id: 'welcome', label: 'Our weekly times', content: welcomeContent(facts, siteUrl) },
        ];
      case 'verse':
        return [{ id: 'verse', label: 'Your verse', content: verseContent('', '', 'CSB') }];
      case 'announcement':
        return [{ id: 'announcement', label: 'Your words', content: announcementContent(siteUrl) }];
      case 'time-change': {
        const upcoming = facts.timeChanges.filter((c: TimeChange) => c.date >= now);
        const byDate = [...new Map(upcoming.map((c) => [c.date, c])).values()];
        return byDate.map((c) => ({
          id: c.key,
          label: longDate(c.date),
          content: timeChangeContent(facts, c, siteUrl),
        }));
      }
      case 'sermon': {
        const rows = await client.fetch<
          {
            _id: string;
            _type: string;
            title?: string;
            date?: string;
            passage?: string;
            preacher?: string;
            series?: string;
            slug?: string;
            book?: string;
            picture?: string;
          }[]
        >(
          `[
            ...*[_type == "sermonSeries" && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...8]{_id, _type, title, book, "slug": slug.current, "picture": art.asset._ref},
            ...*[_type == "sermon" && !(_id in path("drafts.**"))] | order(date desc)[0...16]{_id, _type, title, date, passage, "slug": slug.current, "series": series->title, "preacher": coalesce(preacher->name, guestPreacher), "picture": picture.asset._ref}
          ]`,
        );
        return rows.map((r) => ({
          id: r._id,
          label: r.title || 'Untitled',
          sub: r._type === 'sermonSeries' ? 'Series' : r.date ? longDate(r.date) : 'Sermon',
          content:
            r._type === 'sermonSeries' ? seriesContent(r, siteUrl) : sermonContent(r, siteUrl),
          photoRef: r.picture ?? null,
        }));
      }
      case 'event': {
        const rows = await client.fetch<
          {
            _id: string;
            title?: string;
            slug?: string;
            details?: Parameters<typeof eventContent>[0]['details'];
            picture?: string;
          }[]
        >(
          `*[_type == "page" && !(_id in path("drafts.**")) && count(pageBuilder[_type == "eventDetailsSection"]) > 0] | order(_updatedAt desc)[0...20]{
            _id, title, "slug": slug.current,
            "details": pageBuilder[_type == "eventDetailsSection"][0]{title, note, occurrences[]{date, startTime, label}},
            "picture": pageBuilder[_type == "eventDetailsSection"][0].image.asset._ref
          }`,
        );
        return rows.map((r) => ({
          id: r._id,
          label: r.title || 'Untitled page',
          sub: r.slug ? `/${r.slug}/` : undefined,
          content: eventContent(r, now, siteUrl),
          photoRef: r.picture ?? null,
        }));
      }
    }
  }

  async function openKind(k: Kind, preferId?: string) {
    setKind(k);
    setSources(null);
    setSizes(DEFAULT_SIZES[k]);
    setPhoto(undefined);
    setPhotoId(null);
    try {
      const list = await loadSources(k);
      setSources(list);
      const pick =
        list.find((s) => s.id === preferId || s.id === preferId?.replace(/^drafts\./, '')) ??
        list[0];
      if (pick) choose(pick);
      else setContent(null);
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    }
  }

  function choose(s: Source) {
    setSourceId(s.id);
    setContent({ ...s.content });
    if (s.photoRef) void pickPhoto(s.photoRef);
  }

  async function loadAssets() {
    if (assets) return;
    const rows = await client.fetch<AssetRow[]>(
      `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...30]{_id, url, "w": metadata.dimensions.width, "h": metadata.dimensions.height}`,
    );
    setAssets(rows);
  }

  async function pickPhoto(id: string | null) {
    setPhotoId(id);
    if (!id) {
      setPhoto(undefined);
      return;
    }
    setBusy('Getting the photo');
    try {
      const a = await client.fetch<AssetRow | null>(
        `*[_id == $id][0]{_id, url, "w": metadata.dimensions.width, "h": metadata.dimensions.height}`,
        { id },
      );
      if (a) setPhoto(await photoFrom(a.url, a.w, a.h, 2400));
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setBusy('');
    }
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('Uploading the photo');
    try {
      const doc = await client.assets.upload('image', file, { filename: file.name });
      setAssets(null);
      await pickPhoto(doc._id);
      await loadAssets();
    } catch (err) {
      setError(String((err as Error)?.message ?? err));
    } finally {
      setBusy('');
    }
  }

  const drawn = useMemo(() => {
    if (!ctx || !content) return [];
    const c = {
      ...withoutNotes(content),
      photo,
      standing: facts ? standingFor(facts, content.kind) : undefined,
    };
    return sizes
      .map((id) => FORMAT_BY_ID[id])
      .filter(Boolean)
      .map((f) => ({ format: f, ...look.render(c, f, ctx) }));
  }, [ctx, content, photo, sizes, look, facts]);

  // Object URLs for the previews, revoked when they change.
  const urls = useMemo(() => drawn.map((d) => svgUrl(d.svg)), [drawn]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  async function save(svg: string, f: Format) {
    setBusy(`Saving the ${f.label.toLowerCase()}`);
    try {
      const blob = await svgToPng(svg, f);
      download(blob, fileName(f.id, content ? withoutNotes(content).title : ''));
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setBusy('');
    }
  }

  async function saveAll() {
    for (const d of drawn) {
      // One at a time, so a phone is never holding several full-size pictures at once.
      await save(d.svg, d.format);
    }
  }

  // What is actually drawn: the words without any pre-launch note.
  const drawnTitle = content ? withoutNotes(content).title.trim() : '';
  const canSave = !busy && !!drawnTitle;
  // The sizes the words are too long for, said once beside the headline.
  const tooLong = drawn.filter((d) => d.warnings.length).map((d) => d.format.label);

  // Phone and tablet: share straight to Photos or Facebook when the browser can share files.
  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] });
  async function share(svg: string, f: Format) {
    setBusy(`Getting the ${f.label.toLowerCase()} ready`);
    try {
      const blob = await svgToPng(svg, f);
      const file = new File([blob], fileName(f.id, drawnTitle), { type: 'image/png' });
      await navigator.share({ files: [file], title: drawnTitle });
    } catch (e) {
      // Closing the share sheet is not an error.
      if ((e as Error)?.name !== 'AbortError') setError(String((e as Error)?.message ?? e));
    } finally {
      setBusy('');
    }
  }

  // Times that come from Church facts but are not ticked Confirmed (the site shows "To confirm").
  const unconfirmed =
    !!facts &&
    (kind === 'sunday' || kind === 'welcome' || kind === 'time-change') &&
    facts.serviceTimes.some((t) => !t.confirmed);

  const set = (k: keyof Content) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.currentTarget.value;
    setContent((c) => (c ? { ...c, [k]: v } : c));
  };

  // ── Screens ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <KitScope>
        <Box padding={4} style={{ maxWidth: 760, margin: '0 auto' }}>
          <KitNotice tone="careful" title="Something went wrong">
            {error}{' '}
            <KitAction quiet onClick={() => setError('')}>
              Try again
            </KitAction>
          </KitNotice>
        </Box>
      </KitScope>
    );
  }

  if (!ready) {
    return (
      <KitScope>
        <Box padding={5}>
          <KitLoading label="Getting the fonts and your church facts" />
        </Box>
      </KitScope>
    );
  }

  if (!kind) {
    return (
      <KitScope>
        <Box padding={[3, 4, 5]} style={{ maxWidth: 1080, margin: '0 auto' }}>
          <ToolHead
            label="Make a graphic"
            title="What is it for?"
            meaning="image"
            lead="Pick one. The words come from what you already keep in the Studio, and the design is done for you, in the church’s own look, for Facebook, Instagram, the screen on Sunday and print."
          />
          <Grid gridTemplateColumns={[1, 1, 2, 3]} gap={3} marginTop={4}>
            {KINDS.map((k) => (
              <TileCard
                key={k.kind}
                title={k.title}
                lead={k.lead}
                meaning={k.meaning}
                dataQuick={`graphic-${k.kind}`}
                onClick={() => void openKind(k.kind)}
              />
            ))}
          </Grid>
        </Box>
      </KitScope>
    );
  }

  const meta = KINDS.find((k) => k.kind === kind)!;
  const groups: FormatGroup[] = ['social', 'screen', 'print'];
  const isVerse = kind === 'verse';
  const titleLimit = isVerse ? LIMITS.verse : LIMITS.title;

  return (
    <KitScope>
      <Box padding={[3, 4, 5]} style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Flex align="center" gap={3} wrap="wrap">
          <KitAction quiet onClick={() => setKind(null)}>
            Back to every kind
          </KitAction>
        </Flex>
        <ToolHead label="Make a graphic" title={meta.title} meaning={meta.meaning} />
        {busy && (
          <Box marginTop={3}>
            <KitLoading label={busy} />
          </Box>
        )}

        <div className="gfx-layout">
          {/* ── The words, the photo, the sizes ── */}
          <Stack gap={5} className="gfx-words">
            {sources && sources.length > 1 && (
              <Stack gap={2}>
                <Text as="label" htmlFor="gfx-source" size={1} weight="semibold">
                  {kind === 'sermon'
                    ? 'Which sermon or series'
                    : kind === 'event'
                      ? 'Which event page'
                      : 'Which day'}
                </Text>
                <select
                  id="gfx-source"
                  className="gfx-select"
                  value={sourceId}
                  onChange={(e) => {
                    const s = sources.find((x) => x.id === e.currentTarget.value);
                    if (s) choose(s);
                  }}
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                      {s.sub ? `  (${s.sub})` : ''}
                    </option>
                  ))}
                </select>
              </Stack>
            )}
            {sources && sources.length === 0 && (
              <KitNotice tone="tip" title="Nothing to use yet">
                {kind === 'event'
                  ? 'Add an Event details block to a page (like the Christmas page), publish it, and it will show here.'
                  : kind === 'time-change'
                    ? 'Add a change under Site settings > Church facts > A different Sunday, publish, and it will show here.'
                    : 'Publish a sermon or a series, and it will show here.'}
              </KitNotice>
            )}

            {content && (
              <Stack gap={4}>
                {!isVerse && (
                  <Field
                    label="Small line above"
                    hint="Like “This Sunday” or “Christmas Eve”."
                    value={content.kicker ?? ''}
                    limit={LIMITS.kicker}
                  >
                    <TextInput
                      id="gfx-kicker"
                      value={content.kicker ?? ''}
                      onChange={set('kicker')}
                    />
                  </Field>
                )}
                <Field
                  label={isVerse ? 'The verse' : 'Headline'}
                  hint={
                    isVerse
                      ? 'Copy it from your Bible exactly. No quotation marks: they are added.'
                      : 'A few words. Shorter reads bigger.'
                  }
                  value={content.title}
                  limit={titleLimit}
                >
                  {tooLong.length > 0 && (
                    <Text size={1} style={{ color: '#7E2E20' }}>
                      Too long for {tooLong.join(', ')}. Fewer words read bigger.
                    </Text>
                  )}
                  {isVerse ? (
                    <TextArea
                      id="gfx-title"
                      rows={4}
                      value={content.title}
                      onChange={set('title')}
                    />
                  ) : (
                    <TextInput id="gfx-title" value={content.title} onChange={set('title')} />
                  )}
                </Field>
                {isVerse && (
                  <Grid gridTemplateColumns={2} gap={3}>
                    <Field
                      label="Where it is from"
                      hint="Like Matthew 11:28."
                      value={content.reference ?? ''}
                      limit={32}
                    >
                      <TextInput
                        id="gfx-ref"
                        value={content.reference ?? ''}
                        onChange={set('reference')}
                      />
                    </Field>
                    <Field
                      label="Translation"
                      hint="Like CSB or KJV."
                      value={content.translation ?? ''}
                      limit={8}
                    >
                      <TextInput
                        id="gfx-tr"
                        value={content.translation ?? ''}
                        onChange={set('translation')}
                      />
                    </Field>
                  </Grid>
                )}
                {kind === 'sermon' && (
                  <Grid gridTemplateColumns={[1, 2]} gap={3}>
                    <Field
                      label="Passage (optional)"
                      hint="Like Matthew 5:1-12."
                      value={content.reference ?? ''}
                      limit={32}
                    >
                      <TextInput
                        id="gfx-passage"
                        value={content.reference ?? ''}
                        onChange={set('reference')}
                      />
                    </Field>
                    <Field
                      label="Preacher (optional)"
                      hint="Like Pastor Jacob Wysong."
                      value={content.speaker ?? ''}
                      limit={36}
                    >
                      <TextInput
                        id="gfx-speaker"
                        value={content.speaker ?? ''}
                        onChange={set('speaker')}
                      />
                    </Field>
                  </Grid>
                )}
                {(kind === 'announcement' ||
                  kind === 'event' ||
                  kind === 'sunday' ||
                  kind === 'welcome' ||
                  kind === 'time-change') && (
                  <Field
                    label="A line or two more (optional)"
                    hint="What to expect, or what to bring."
                    value={content.body ?? ''}
                    limit={LIMITS.body}
                  >
                    <TextArea
                      id="gfx-body"
                      rows={3}
                      value={content.body ?? ''}
                      onChange={set('body')}
                    />
                  </Field>
                )}
                {kind === 'announcement' && (
                  <Field
                    label="When (optional)"
                    hint="Like “Friday, October 30, 6:00 pm”."
                    value={content.date ?? ''}
                    limit={44}
                  >
                    <TextInput id="gfx-date" value={content.date ?? ''} onChange={set('date')} />
                  </Field>
                )}
                {content.when && content.when.length > 0 && (
                  <Stack gap={2}>
                    <Text size={1} weight="semibold">
                      Times
                    </Text>
                    <Text size={1} muted>
                      {content.when.join(' · ')}
                    </Text>
                    <Text size={1} muted>
                      From {kind === 'event' ? 'the event page' : 'Church facts'}. Change them there
                      and they change here.
                    </Text>
                  </Stack>
                )}
                {hasNotes(content) && (
                  <KitNotice tone="careful" title="A note is still in these words">
                    Something here still reads like “[Jacob: …]”. It is left off the graphic. Change it
                    on the page it came from, or type your own words above.
                  </KitNotice>
                )}
                {unconfirmed && (
                  <KitNotice tone="tip" title="Times not confirmed yet">
                    Some of these times are not ticked Confirmed in Site settings &gt; Church facts.
                    Check them there before you print anything.
                  </KitNotice>
                )}
                {content.link && (
                  <Text size={1} muted>
                    Points people to <strong className="gfx-link">{content.link}</strong>
                    {content.qr ? '. Print sizes carry a code to scan.' : '.'}
                  </Text>
                )}
              </Stack>
            )}
          </Stack>

          {content && (
            <Stack gap={5} className="gfx-options">
              {/* Photo */}
              <Stack gap={3}>
                <Text size={1} weight="semibold">
                  Photo (optional)
                </Text>
                <Text size={1} muted>
                  A real photo of your church and people beats any stock picture.
                </Text>
                {photo && (
                  <Flex gap={3} align="center">
                    <img className="gfx-picked" src={photo.src} alt="The photo in use" />
                    <KitAction quiet onClick={() => void pickPhoto(null)}>
                      Remove the photo
                    </KitAction>
                  </Flex>
                )}
                <Flex gap={2} wrap="wrap">
                  <KitAction onClick={() => void loadAssets()}>
                    Choose from the Studio’s photos
                  </KitAction>
                  <label className="ui-action gfx-upload">
                    Upload a photo
                    <input type="file" accept="image/*" onChange={(e) => void upload(e)} />
                  </label>
                </Flex>
                {assets && (
                  <div className="gfx-photos" role="list">
                    {assets.slice(0, photoCount).map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        role="listitem"
                        className="gfx-photo"
                        aria-pressed={photoId === a._id}
                        onClick={() => void pickPhoto(a._id)}
                      >
                        <img
                          src={`${a.url}?w=200&h=200&fit=crop&auto=format`}
                          alt=""
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {assets && assets.length > photoCount && (
                  <KitAction quiet onClick={() => setPhotoCount((n) => n + 12)}>
                    Show more photos
                  </KitAction>
                )}
              </Stack>

              {/* Sizes */}
              <Stack gap={4}>
                {groups.map((g) => (
                  <fieldset key={g} className="gfx-sizes">
                    <legend>{GROUP_LABELS[g]}</legend>
                    {FORMATS.filter((f) => f.group === g).map((f) => (
                      <label key={f.id} className="gfx-size">
                        <input
                          type="checkbox"
                          checked={sizes.includes(f.id)}
                          onChange={(e) => {
                            const on = e.currentTarget.checked;
                            setSizes((s) => (on ? [...s, f.id] : s.filter((x) => x !== f.id)));
                          }}
                        />
                        <span>
                          <span className="gfx-size__name">{f.label}</span>
                          <span className="gfx-size__hint">{f.hint}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </Stack>
            </Stack>
          )}

          {/* ── The previews ── */}
          {content && (
            <Stack gap={4} className="gfx-previews" id="gfx-previews">
              <div className="gfx-looks" role="group" aria-label="Look">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="gfx-look"
                    aria-pressed={d.id === look.id}
                    onClick={() => setLookId(d.id)}
                  >
                    <span className="gfx-look__name">{LOOK_NAMES[d.id]?.name ?? d.name}</span>
                    <span className="gfx-look__lead">{LOOK_NAMES[d.id]?.lead ?? d.summary}</span>
                  </button>
                ))}
              </div>
              {content && !drawnTitle && (
                <KitNotice tone="tip" title="Type a headline first">
                  {isVerse ? 'Type the verse' : 'Type a headline'} and the graphics appear here.
                </KitNotice>
              )}
              {drawnTitle && drawn.length > 1 && (
                <Flex gap={2} className="gfx-saveall">
                  <KitAction strong onClick={() => void saveAll()} disabled={!canSave}>
                    Download all {drawn.length}
                  </KitAction>
                </Flex>
              )}
              {drawnTitle && drawn.length === 0 && (
                <Text size={1} muted>
                  Tick a size below to see it here.
                </Text>
              )}
              <div className="gfx-grid">
                {(drawnTitle ? drawn : []).map((d, i) => (
                  <figure key={d.format.id} className="gfx-card">
                    <img src={urls[i]} alt={`${d.format.label} preview`} />
                    <figcaption>
                      <span className="gfx-card__name">{d.format.label}</span>
                      {d.warnings.length > 0 && (
                        <span className="gfx-card__warn">
                          Too long for this size. Try fewer words.
                        </span>
                      )}
                      <Flex gap={2} wrap="wrap">
                        <KitAction onClick={() => void save(d.svg, d.format)} disabled={!canSave}>
                          Download
                        </KitAction>
                        {canShare && (
                          <KitAction
                            quiet
                            onClick={() => void share(d.svg, d.format)}
                            disabled={!canSave}
                          >
                            Share
                          </KitAction>
                        )}
                        {d.format.print && (
                          <KitAction
                            quiet
                            onClick={() =>
                              void printGraphic(d.svg, d.format, content?.title ?? '').catch((e) =>
                                setError(String(e?.message ?? e)),
                              )
                            }
                          >
                            Print or save as PDF
                          </KitAction>
                        )}
                      </Flex>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Stack>
          )}
        </div>
        {drawnTitle && drawn.length > 0 && (
          <div className="gfx-phonebar">
            <button
              type="button"
              className="ui-action ui-action--strong"
              onClick={() =>
                document
                  .getElementById('gfx-previews')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              See the {drawn.length === 1 ? 'graphic' : `${drawn.length} graphics`}
            </button>
          </div>
        )}
      </Box>
      <style>{CSS}</style>
    </KitScope>
  );
}

/** A labelled box with its hint and a running count. */
function Field({
  label,
  hint,
  value,
  limit,
  children,
}: {
  label: string;
  hint?: string;
  value: string;
  limit: number;
  children: React.ReactNode;
}) {
  const over = value.length > limit;
  return (
    <Stack gap={2}>
      <Text size={1} weight="semibold">
        {label}
      </Text>
      {hint && (
        <Text size={1} muted>
          {hint}
        </Text>
      )}
      {children}
      <Text
        size={0}
        muted={!over}
        style={over ? { color: 'var(--card-badge-caution-fg-color, #7E2E20)' } : undefined}
      >
        {value.length} of about {limit} characters
        {over ? '. It will shrink to fit; shorter reads better.' : ''}
      </Text>
    </Stack>
  );
}

const CSS = `
.gfx-layout{display:grid;gap:32px;margin-top:24px;grid-template-columns:minmax(0,1fr);grid-template-areas:"words" "options" "previews"}
.gfx-phonebar{position:sticky;bottom:0;display:flex;justify-content:center;padding:12px 0 16px;margin-top:16px;background:var(--card-bg-color,#FBF8F3);border-top:1px solid var(--card-border-color,#E6DED2)}
@media (min-width:960px){.gfx-phonebar{display:none}}
.gfx-words{grid-area:words}.gfx-previews{grid-area:previews}.gfx-options{grid-area:options}
@media (min-width:960px){.gfx-layout{grid-template-columns:minmax(300px,380px) minmax(0,1fr);grid-template-areas:"words previews" "options previews";grid-template-rows:auto 1fr;align-items:start}
}
.gfx-select{width:100%;font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--card-border-color,#E6DED2);border-radius:6px;background:var(--card-bg-color,#fff);color:inherit}
.gfx-upload{position:relative;cursor:pointer}
.gfx-upload input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.gfx-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
.gfx-picked{width:72px;height:72px;object-fit:cover;border-radius:6px;display:block}
.gfx-link{overflow-wrap:anywhere}
.gfx-photo{width:100%;display:block;padding:0;border:2px solid transparent;border-radius:6px;overflow:hidden;cursor:pointer;background:none;aspect-ratio:1}
.gfx-photo img{display:block;width:100%;height:100%;object-fit:cover}
.gfx-photo[aria-pressed="true"]{border-color:#9A3B2A}
.gfx-photo:focus-visible{outline:3px solid #1F3A5F;outline-offset:2px}
.gfx-sizes{border:0;margin:0;padding:0;display:grid;gap:6px}
.gfx-sizes legend{font-weight:600;font-size:14px;margin-bottom:6px;padding:0}
.gfx-size{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:6px;cursor:pointer;min-height:44px}
.gfx-size:hover{background:var(--card-muted-bg-color,#F4EFE7)}
.gfx-size input{appearance:auto;-webkit-appearance:checkbox;opacity:1;position:static;margin:3px 0 0;width:20px;height:20px;accent-color:#1F3A5F;flex:none;cursor:pointer}
.gfx-size__name{display:block;font-size:15px;font-weight:600}
.gfx-size__hint{display:block;font-size:13px;opacity:.75;line-height:1.35}
.gfx-grid{display:grid;gap:24px;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));align-items:start}
.gfx-looks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.gfx-look{display:grid;gap:2px;text-align:left;font:inherit;color:inherit;padding:12px 14px;border-radius:8px;border:1px solid var(--card-border-color,#E6DED2);background:var(--card-bg-color,#fff);cursor:pointer;min-height:44px}
.gfx-look[aria-pressed="true"]{border-color:#1F3A5F;box-shadow:inset 0 0 0 1px #1F3A5F}
.gfx-look:focus-visible{outline:3px solid #1F3A5F;outline-offset:2px}
.gfx-look__name{font-weight:600;font-size:15px}
.gfx-look__lead{font-size:13px;opacity:.75;line-height:1.35}
.gfx-card{margin:0;display:grid;gap:10px}
.gfx-card img{display:block;width:100%;height:auto;max-height:520px;object-fit:contain;object-position:left top;box-shadow:0 0 0 1px rgb(22 38 61 / .12)}
.gfx-card figcaption{display:grid;gap:8px}
.gfx-card__name{font-weight:600;font-size:15px}
.gfx-card__warn{font-size:13px;color:#7E2E20}
`;
