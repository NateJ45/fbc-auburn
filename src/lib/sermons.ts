// Safe to edit by hand
// =============================================================================
// Sermons, people and downloads: everything worked out from the data (rule 15)
// =============================================================================
// Pure: no fetch, no Sanity client, no clock (callers pass `now`), so every
// decision is unit-tested in sermons.test.ts. The pastor types the inputs (a
// passage like "John 3:1-21", a video link, a date); the book, the BibleGateway
// link, the YouTube id, "is this last Sunday's?", the series dates, the newest
// bulletin and the podcast feed are all derived here at build time, so none of
// them can disagree with what he typed.
// =============================================================================

import { CHURCH_TIME_ZONE } from './church-calendar.ts';

// ── The Bible ────────────────────────────────────────────────────────────────

/** The 66 books in canonical order, with the other spellings people type. */
export const BIBLE_BOOKS: { name: string; aliases?: string[] }[] = [
  { name: 'Genesis', aliases: ['Gen'] },
  { name: 'Exodus', aliases: ['Exod', 'Ex'] },
  { name: 'Leviticus', aliases: ['Lev'] },
  { name: 'Numbers', aliases: ['Num'] },
  { name: 'Deuteronomy', aliases: ['Deut'] },
  { name: 'Joshua', aliases: ['Josh'] },
  { name: 'Judges', aliases: ['Judg'] },
  { name: 'Ruth' },
  { name: '1 Samuel', aliases: ['1 Sam', 'I Samuel', 'First Samuel'] },
  { name: '2 Samuel', aliases: ['2 Sam', 'II Samuel', 'Second Samuel'] },
  { name: '1 Kings', aliases: ['1 Kgs', 'I Kings', 'First Kings'] },
  { name: '2 Kings', aliases: ['2 Kgs', 'II Kings', 'Second Kings'] },
  { name: '1 Chronicles', aliases: ['1 Chron', 'I Chronicles', 'First Chronicles'] },
  { name: '2 Chronicles', aliases: ['2 Chron', 'II Chronicles', 'Second Chronicles'] },
  { name: 'Ezra' },
  { name: 'Nehemiah', aliases: ['Neh'] },
  { name: 'Esther', aliases: ['Esth'] },
  { name: 'Job' },
  { name: 'Psalms', aliases: ['Psalm', 'Ps', 'Psa'] },
  { name: 'Proverbs', aliases: ['Prov'] },
  { name: 'Ecclesiastes', aliases: ['Eccl', 'Eccles'] },
  { name: 'Song of Solomon', aliases: ['Song of Songs', 'Song'] },
  { name: 'Isaiah', aliases: ['Isa'] },
  { name: 'Jeremiah', aliases: ['Jer'] },
  { name: 'Lamentations', aliases: ['Lam'] },
  { name: 'Ezekiel', aliases: ['Ezek'] },
  { name: 'Daniel', aliases: ['Dan'] },
  { name: 'Hosea', aliases: ['Hos'] },
  { name: 'Joel' },
  { name: 'Amos' },
  { name: 'Obadiah', aliases: ['Obad'] },
  { name: 'Jonah' },
  { name: 'Micah', aliases: ['Mic'] },
  { name: 'Nahum', aliases: ['Nah'] },
  { name: 'Habakkuk', aliases: ['Hab'] },
  { name: 'Zephaniah', aliases: ['Zeph'] },
  { name: 'Haggai', aliases: ['Hag'] },
  { name: 'Zechariah', aliases: ['Zech'] },
  { name: 'Malachi', aliases: ['Mal'] },
  { name: 'Matthew', aliases: ['Matt', 'Mt'] },
  { name: 'Mark', aliases: ['Mk'] },
  { name: 'Luke', aliases: ['Lk'] },
  { name: 'John', aliases: ['Jn'] },
  { name: 'Acts' },
  { name: 'Romans', aliases: ['Rom'] },
  { name: '1 Corinthians', aliases: ['1 Cor', 'I Corinthians', 'First Corinthians'] },
  { name: '2 Corinthians', aliases: ['2 Cor', 'II Corinthians', 'Second Corinthians'] },
  { name: 'Galatians', aliases: ['Gal'] },
  { name: 'Ephesians', aliases: ['Eph'] },
  { name: 'Philippians', aliases: ['Phil'] },
  { name: 'Colossians', aliases: ['Col'] },
  { name: '1 Thessalonians', aliases: ['1 Thess', 'I Thessalonians', 'First Thessalonians'] },
  { name: '2 Thessalonians', aliases: ['2 Thess', 'II Thessalonians', 'Second Thessalonians'] },
  { name: '1 Timothy', aliases: ['1 Tim', 'I Timothy', 'First Timothy'] },
  { name: '2 Timothy', aliases: ['2 Tim', 'II Timothy', 'Second Timothy'] },
  { name: 'Titus' },
  { name: 'Philemon', aliases: ['Philem'] },
  { name: 'Hebrews', aliases: ['Heb'] },
  { name: 'James', aliases: ['Jas'] },
  { name: '1 Peter', aliases: ['1 Pet', 'I Peter', 'First Peter'] },
  { name: '2 Peter', aliases: ['2 Pet', 'II Peter', 'Second Peter'] },
  { name: '1 John', aliases: ['1 Jn', 'I John', 'First John'] },
  { name: '2 John', aliases: ['2 Jn', 'II John', 'Second John'] },
  { name: '3 John', aliases: ['3 Jn', 'III John', 'Third John'] },
  { name: 'Jude' },
  { name: 'Revelation', aliases: ['Rev', 'Revelations'] },
];

/** For the Studio's "Book of the Bible" dropdown on a series. */
export const BIBLE_BOOK_NAMES = BIBLE_BOOKS.map((b) => b.name);

const norm = (s: string) => s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();

// Longest spelling first, so "1 John" wins over "John" and "Song of Songs" over "Song".
const SPELLINGS = BIBLE_BOOKS.flatMap((b) =>
  [b.name, ...(b.aliases ?? [])].map((s) => ({ spelling: norm(s), name: b.name })),
).sort((a, b) => b.spelling.length - a.spelling.length);

/** "1 John 3:1-10" -> "1 John"; "Psalm 23" -> "Psalms"; nothing recognised -> null. */
export function bookOf(passage?: string | null): string | null {
  if (!passage) return null;
  const p = norm(passage).replace(/^(\d)(?=[a-z])/, '$1 ');
  for (const { spelling, name } of SPELLINGS) {
    if (p === spelling || p.startsWith(`${spelling} `) || p.startsWith(`${spelling}:`)) return name;
  }
  return null;
}

/** Canonical position of a book (Genesis 0 ... Revelation 65), or 99. */
export const bookOrder = (name: string): number => {
  const i = BIBLE_BOOK_NAMES.indexOf(name);
  return i === -1 ? 99 : i;
};

/** Translations the Studio offers for the passage links (BibleGateway's codes). */
export const BIBLE_VERSIONS = ['KJV', 'NKJV', 'ESV', 'CSB', 'NASB', 'NIV'] as const;

/**
 * The passage on BibleGateway. `version` is the Sermons page setting; left
 * empty, BibleGateway uses its own default. Null when there is no passage.
 */
export function bibleGatewayUrl(passage?: string | null, version?: string | null): string | null {
  const text = passage?.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const v = version && (BIBLE_VERSIONS as readonly string[]).includes(version) ? version : null;
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(text)}${v ? `&version=${v}` : ''}`;
}

// ── Video links ──────────────────────────────────────────────────────────────

/** The 11-character id from any YouTube link shape, or null. */
export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id =
      u.searchParams.get('v') ??
      /^\/(?:embed|live|shorts|v)\/([^/?#]+)/.exec(u.pathname)?.[1] ??
      null;
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

export const isFacebookVideo = (url?: string | null): boolean => {
  if (!url) return false;
  try {
    return /(^|\.)(facebook\.com|fb\.watch)$/.test(new URL(url.trim()).hostname);
  } catch {
    return false;
  }
};

export interface SermonVideo {
  kind: 'youtube' | 'facebook' | 'other';
  watchUrl: string;
  /** youtube only: the privacy-enhanced player, loaded on a press. */
  embedUrl?: string;
  /** youtube only: hqdefault.jpg, 480 by 360. */
  thumbnailUrl?: string;
  /** youtube only. */
  id?: string;
}

/** What the player can do with a sermon's video link. */
export function sermonVideo(url?: string | null): SermonVideo | null {
  const raw = url?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  const id = youtubeId(raw);
  if (id) {
    return {
      kind: 'youtube',
      id,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  return { kind: isFacebookVideo(raw) ? 'facebook' : 'other', watchUrl: raw };
}

// ── Dates ────────────────────────────────────────────────────────────────────

const CHURCH_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: CHURCH_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today on the church's calendar, YYYY-MM-DD. */
export const churchToday = (now: Date): string => CHURCH_DAY.format(now);

/**
 * The Sunday a new sermon is most likely for: today when it is Sunday, else
 * the Sunday just gone. A sermon is nearly always typed in after it was
 * preached, and a Saturday entry for tomorrow is one click to change.
 */
export function sermonSunday(now: Date): string {
  const today = churchToday(now);
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

/** Whole days from `iso` (a date) to `now`, on the church's calendar. */
export function daysSince(iso: string, now: Date): number {
  const a = Date.parse(`${iso.slice(0, 10)}T12:00:00Z`);
  const b = Date.parse(`${churchToday(now)}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Same window as the YouTube replay (LAST_SUNDAY_MAX_DAYS in church-video.ts). */
export const FRESH_SERMON_DAYS = 8;

/** Preached in the last eight days, and not in the future. */
export const isFreshSermon = (date: string | null | undefined, now: Date): boolean =>
  !!date && daysSince(date, now) >= 0 && daysSince(date, now) <= FRESH_SERMON_DAYS;

const LONG = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const SHORT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
/** "October 12, 2026" from "2026-10-12". */
export const longDate = (iso?: string | null): string =>
  iso ? LONG.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`)) : '';
/** "Oct 12, 2026". */
export const shortDate = (iso?: string | null): string =>
  iso ? SHORT.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`)) : '';

// ── Sermons ──────────────────────────────────────────────────────────────────

export const SERVICES = [
  { title: 'Sunday morning', value: 'sunday-morning' },
  { title: 'Sunday evening', value: 'sunday-evening' },
  { title: 'Wednesday', value: 'wednesday' },
] as const;
export const serviceTitle = (value?: string | null): string =>
  SERVICES.find((s) => s.value === value)?.title ?? '';

export interface FileAsset {
  url?: string | null;
  size?: number | null;
  mimeType?: string | null;
  originalFilename?: string | null;
  extension?: string | null;
}

/** A sermon as the GROQ in src/lib/collection-queries.ts projects it. */
export interface SermonDoc {
  _id: string;
  title?: string | null;
  slug?: string | null;
  date?: string | null;
  passage?: string | null;
  service?: string | null;
  summary?: string | null;
  videoUrl?: string | null;
  guestPreacher?: string | null;
  preacher?: { _id?: string; name?: string | null; role?: string | null } | null;
  series?: {
    _id?: string;
    title?: string | null;
    slug?: string | null;
    art?: unknown;
  } | null;
  image?: { asset?: unknown } | null;
  audio?: FileAsset | null;
  notes?: FileAsset | null;
  /** Seconds, typed by the pastor if he wants the podcast to show a length. */
  audioSeconds?: number | null;
}

/** The person who preached: the people list, else the guest name typed in. */
export const preacherName = (s: Pick<SermonDoc, 'preacher' | 'guestPreacher'>): string =>
  s.preacher?.name?.trim() || s.guestPreacher?.trim() || '';

export const sermonHref = (slug?: string | null) => (slug ? `/sermons/${slug}/` : '/sermons/');
export const seriesHref = (slug?: string | null) =>
  slug ? `/sermons/series/${slug}/` : '/sermons/';

/** Newest first, then by service (morning before evening on the same day), then title. */
export function sortSermons<T extends Pick<SermonDoc, 'date' | 'service' | 'title'>>(
  list: T[],
): T[] {
  const svc = (v?: string | null) => SERVICES.findIndex((s) => s.value === v);
  return [...list].sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      svc(a.service) - svc(b.service) ||
      (a.title ?? '').localeCompare(b.title ?? ''),
  );
}

/** The values the /sermons/ filters offer, worked out from the sermons themselves. */
export function sermonFilters(list: SermonDoc[]): {
  series: { value: string; title: string }[];
  preachers: string[];
  books: string[];
} {
  const series = new Map<string, string>();
  const preachers = new Set<string>();
  const books = new Set<string>();
  for (const s of list) {
    if (s.series?.slug && s.series.title) series.set(s.series.slug, s.series.title);
    const p = preacherName(s);
    if (p) preachers.add(p);
    const b = bookOf(s.passage);
    if (b) books.add(b);
  }
  return {
    series: [...series].map(([value, title]) => ({ value, title })),
    preachers: [...preachers].sort((a, b) => a.localeCompare(b)),
    books: [...books].sort((a, b) => bookOrder(a) - bookOrder(b)),
  };
}

/**
 * Which sermon the Watch card names (home "Last Sunday" and the Watch band).
 * `fresh` is one preached in the last eight days: it goes FIRST, ahead of the
 * YouTube feed and the hand-typed "Last Sunday's message". `latest` is the
 * newest of any age: it stands in only when nothing fresher exists (no YouTube
 * replay, no recent hand-typed message), labelled "Latest message".
 */
export function watchSermon(
  newest: SermonDoc | null | undefined,
  now: Date,
): { fresh: SermonDoc | null; latest: SermonDoc | null } {
  if (!newest?.slug || !newest.title || !newest.date) return { fresh: null, latest: null };
  if (daysSince(newest.date, now) < 0) return { fresh: null, latest: null };
  return { fresh: isFreshSermon(newest.date, now) ? newest : null, latest: newest };
}

// ── Series ───────────────────────────────────────────────────────────────────

export interface SeriesDoc {
  _id: string;
  title?: string | null;
  slug?: string | null;
  book?: string | null;
  description?: string | null;
  art?: unknown;
  /** Derived in GROQ from the sermons that reference it. */
  firstDate?: string | null;
  lastDate?: string | null;
  count?: number | null;
}

/** Newest series first (by its first sermon); a series with no sermons yet goes last. */
export function sortSeries<T extends Pick<SeriesDoc, 'firstDate' | 'title'>>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      (b.firstDate ?? '').localeCompare(a.firstDate ?? '') ||
      (a.title ?? '').localeCompare(b.title ?? ''),
  );
}

/** "Oct 2026 to Jan 2027", "Oct 2026", or "". */
export function seriesSpan(first?: string | null, last?: string | null): string {
  const my = (iso: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${iso.slice(0, 10)}T12:00:00Z`),
    );
  if (!first) return '';
  const a = my(first);
  const b = last ? my(last) : a;
  return a === b ? a : `${a} to ${b}`;
}

// ── People ───────────────────────────────────────────────────────────────────

export interface PersonDoc {
  _id: string;
  name?: string | null;
  role?: string | null;
  group?: { _id?: string; title?: string | null; order?: number | null } | null;
  photo?: { asset?: unknown } | null;
  bio?: string | null;
  /** Projected only when "Show email" is ticked. */
  email?: string | null;
  /** Projected only when "Keep location private" is NOT ticked. */
  location?: string | null;
  order?: number | null;
}

const byOrderThenName = (a: PersonDoc, b: PersonDoc) =>
  (a.order ?? 999) - (b.order ?? 999) || (a.name ?? '').localeCompare(b.name ?? '');

/** People in their groups, groups in their own order, people by order then name. */
export function groupPeople(
  people: PersonDoc[],
): { title: string; id: string; people: PersonDoc[] }[] {
  const groups = new Map<
    string,
    { title: string; id: string; order: number; people: PersonDoc[] }
  >();
  for (const p of people) {
    if (!p.name) continue;
    const id = p.group?._id ?? 'none';
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        title: p.group?.title ?? '',
        order: p.group?.order ?? (id === 'none' ? 9999 : 999),
        people: [],
      });
    }
    groups.get(id)!.people.push(p);
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(({ title, id, people: list }) => ({ title, id, people: list.sort(byOrderThenName) }));
}

/** People picked by hand keep the editor's order; a group's people sort themselves. */
export const sortPeople = (people: PersonDoc[]): PersonDoc[] =>
  people.filter((p) => p.name).sort(byOrderThenName);

// ── Downloads ────────────────────────────────────────────────────────────────

export const DOWNLOAD_CATEGORIES = [
  { title: 'Bulletin', value: 'bulletin' },
  { title: 'Newsletter', value: 'newsletter' },
  { title: 'Form', value: 'form' },
  { title: 'Policy', value: 'policy' },
  { title: 'Other', value: 'other' },
] as const;
export const categoryTitle = (value?: string | null): string =>
  DOWNLOAD_CATEGORIES.find((c) => c.value === value)?.title ?? 'Other';

export interface DownloadDoc {
  _id: string;
  title?: string | null;
  date?: string | null;
  category?: string | null;
  note?: string | null;
  /** The last day it shows. Empty: it never comes down by itself. */
  expires?: string | null;
  file?: FileAsset | null;
}

/** Still up: no expiry date, or the expiry date is today or later. Needs a file. */
export const isCurrentDownload = (d: DownloadDoc, now: Date): boolean =>
  !!d.file?.url && (!d.expires || d.expires.slice(0, 10) >= churchToday(now));

/** The downloads a list shows: current ones in a category (or all), newest first, at most `limit`. */
export function currentDownloads(
  list: DownloadDoc[],
  now: Date,
  category?: string | null,
  limit = 10,
): DownloadDoc[] {
  return list
    .filter((d) => isCurrentDownload(d, now))
    .filter((d) => !category || category === 'all' || d.category === category)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, Math.max(1, limit));
}

/** This week's bulletin: the newest current Bulletin, or null. */
export const newestBulletin = (list: DownloadDoc[], now: Date): DownloadDoc | null =>
  currentDownloads(list, now, 'bulletin', 1)[0] ?? null;

/** "PDF, 240 KB" from a file asset, or "". */
export function fileLabel(f?: FileAsset | null): string {
  if (!f) return '';
  const ext = (f.extension || f.originalFilename?.split('.').pop() || '').toUpperCase();
  const size = typeof f.size === 'number' && f.size > 0 ? humanSize(f.size) : '';
  return [ext, size].filter(Boolean).join(', ');
}
export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
}

// ── The podcast feed ─────────────────────────────────────────────────────────
// Apple Podcasts' required channel tags: title, description, itunes:image,
// language, itunes:category, itunes:explicit. Required on each episode: title,
// enclosure (url, length, type) and guid. Recommended, and needed by Spotify
// to verify the owner: itunes:owner with an email, itunes:author, link.
// https://podcasters.apple.com/support/823-podcast-requirements

export const PODCAST_CATEGORY = 'Religion & Spirituality';
export const PODCAST_SUBCATEGORY = 'Christianity';

export interface PodcastChannel {
  title: string;
  description: string;
  /** The site's address, no trailing slash. */
  siteUrl: string;
  /** The feed's own address. */
  feedUrl: string;
  /** Square JPG or PNG, 1400 to 3000 pixels. */
  imageUrl: string | null;
  author: string;
  ownerName: string;
  ownerEmail: string | null;
  language?: string;
  /** Under Religion & Spirituality: Christianity (the default), Religion or Spirituality. */
  subcategory?: string | null;
}

export interface PodcastEpisode {
  guid: string;
  title: string;
  link: string;
  /** YYYY-MM-DD. */
  date: string;
  description: string;
  audioUrl: string;
  audioBytes: number;
  audioType: string;
  seconds?: number | null;
  imageUrl?: string | null;
}

const xml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** RFC 822 date for the feed: noon Eastern-ish (17:00 UTC) on the day preached. */
export const rfc822 = (iso: string): string =>
  new Date(`${iso.slice(0, 10)}T17:00:00Z`).toUTCString();

/** "1:02:03" / "42:05" from seconds. */
export function itunesDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(r)}` : `${m}:${two(r)}`;
}

/** The sermons that can be podcast episodes: those with an uploaded audio file. */
export function podcastEpisodes(
  sermons: SermonDoc[],
  siteUrl: string,
  imageFor: (s: SermonDoc) => string | null = () => null,
): PodcastEpisode[] {
  return sortSermons(sermons)
    .filter((s) => s.audio?.url && s.slug && s.title && s.date)
    .map((s) => {
      const bits = [
        s.passage,
        preacherName(s),
        s.series?.title ? `${s.series.title} series` : '',
      ].filter(Boolean);
      return {
        guid: s._id,
        title: s.title!,
        link: `${siteUrl}${sermonHref(s.slug)}`,
        date: s.date!,
        description: [s.summary?.trim(), bits.join(' · ')].filter(Boolean).join('\n\n'),
        audioUrl: s.audio!.url!,
        audioBytes: s.audio!.size ?? 0,
        audioType: s.audio!.mimeType || 'audio/mpeg',
        seconds: s.audioSeconds ?? null,
        imageUrl: imageFor(s),
      };
    });
}

/** The whole RSS 2.0 + iTunes document. */
export function podcastXml(channel: PodcastChannel, episodes: PodcastEpisode[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '<channel>',
    `<title>${xml(channel.title)}</title>`,
    `<link>${xml(`${channel.siteUrl}/sermons/`)}</link>`,
    `<atom:link href="${xml(channel.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    `<language>${xml(channel.language ?? 'en-us')}</language>`,
    `<description>${xml(channel.description)}</description>`,
    `<itunes:summary>${xml(channel.description)}</itunes:summary>`,
    `<itunes:author>${xml(channel.author)}</itunes:author>`,
    '<itunes:owner>',
    `<itunes:name>${xml(channel.ownerName)}</itunes:name>`,
    ...(channel.ownerEmail ? [`<itunes:email>${xml(channel.ownerEmail)}</itunes:email>`] : []),
    '</itunes:owner>',
    ...(channel.imageUrl
      ? [
          `<itunes:image href="${xml(channel.imageUrl)}"/>`,
          `<image><url>${xml(channel.imageUrl)}</url><title>${xml(channel.title)}</title><link>${xml(`${channel.siteUrl}/sermons/`)}</link></image>`,
        ]
      : []),
    `<itunes:category text="${xml(PODCAST_CATEGORY)}">`,
    `<itunes:category text="${xml(channel.subcategory || PODCAST_SUBCATEGORY)}"/>`,
    '</itunes:category>',
    '<itunes:explicit>false</itunes:explicit>',
    '<itunes:type>episodic</itunes:type>',
  ];
  for (const e of episodes) {
    lines.push(
      '<item>',
      `<title>${xml(e.title)}</title>`,
      `<link>${xml(e.link)}</link>`,
      `<guid isPermaLink="false">${xml(e.guid)}</guid>`,
      `<pubDate>${rfc822(e.date)}</pubDate>`,
      `<description>${xml(e.description)}</description>`,
      `<enclosure url="${xml(e.audioUrl)}" length="${Math.max(0, Math.round(e.audioBytes))}" type="${xml(e.audioType)}"/>`,
      ...(e.seconds ? [`<itunes:duration>${itunesDuration(e.seconds)}</itunes:duration>`] : []),
      ...(e.imageUrl ? [`<itunes:image href="${xml(e.imageUrl)}"/>`] : []),
      '<itunes:explicit>false</itunes:explicit>',
      '<itunes:episodeType>full</itunes:episodeType>',
      '</item>',
    );
  }
  lines.push('</channel>', '</rss>');
  return `${lines.join('\n')}\n`;
}

// ── Structured data ──────────────────────────────────────────────────────────

/**
 * JSON-LD for one sermon page. A YouTube sermon is a VideoObject (Google
 * needs name, thumbnailUrl and uploadDate, all of which a YouTube link
 * gives); anything else is a CreativeWork, with its recording as an
 * AudioObject when there is one.
 */
export function sermonJsonLd(
  s: SermonDoc,
  pageUrl: string,
  churchName: string,
): Record<string, unknown> {
  const video = sermonVideo(s.videoUrl);
  const who = preacherName(s);
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    name: s.title ?? '',
    url: pageUrl,
    ...(s.summary ? { description: s.summary } : {}),
    ...(who ? { author: { '@type': 'Person', name: who } } : {}),
    publisher: { '@type': 'Organization', name: churchName },
    ...(s.passage ? { about: s.passage } : {}),
    ...(s.series?.title
      ? { isPartOf: { '@type': 'CreativeWorkSeries', name: s.series.title } }
      : {}),
    inLanguage: 'en-US',
  };
  if (video?.kind === 'youtube') {
    return {
      ...base,
      '@type': 'VideoObject',
      description: s.summary || [s.passage, who].filter(Boolean).join(' · ') || s.title || '',
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: s.date ?? undefined,
      embedUrl: video.embedUrl?.replace('?autoplay=1&rel=0', ''),
      contentUrl: video.watchUrl,
    };
  }
  return {
    ...base,
    '@type': 'CreativeWork',
    ...(s.date ? { datePublished: s.date } : {}),
    ...(s.audio?.url
      ? {
          audio: {
            '@type': 'AudioObject',
            contentUrl: s.audio.url,
            encodingFormat: s.audio.mimeType || 'audio/mpeg',
          },
        }
      : {}),
  };
}
