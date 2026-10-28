// Safe to edit by hand
// =============================================================================
// The sizes the graphics maker draws (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// Every size the church posts, projects or prints, in pixels, with the room a
// template must keep clear:
//
//   bleed  print only: the strip past the trim the printer cuts off. Colour and
//          photos run into it; words never do.
//   safe   the inset (from the canvas edge) that words, the mark and the QR code
//          stay inside. On print it is bleed + 1/8". On a story it keeps clear of
//          the app's own name bar and reply box; on a Facebook page cover and a
//          YouTube banner it is the middle strip every device shows.
//
// `shape` is what a template lays out for: five shapes cover every size, so a
// new size needs a row here and nothing else.
//
// Print sizes are drawn at 300 dpi (the yard sign at 150: a sign is read from
// across a road, and 300 dpi at 24x18 inches is past what a phone browser can
// hold in memory).
// =============================================================================

import type { Kind } from './types.ts';

export type FormatGroup = 'social' | 'screen' | 'print';
export type Shape = 'tall' | 'portrait' | 'square' | 'landscape' | 'banner';

/** Insets in px from each edge of the canvas. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Format {
  id: string;
  group: FormatGroup;
  /** What Jacob sees on the size chip. */
  label: string;
  /** One line under it: where it goes. */
  hint: string;
  w: number;
  h: number;
  shape: Shape;
  bleed: number;
  safe: Insets;
  /** Print sizes: the trimmed size in inches and the resolution. */
  print?: { inW: number; inH: number; dpi: number };
  /** The kinds the Studio offers this size for (unset: every kind). */
  onlyFor?: Kind[];
}

/** True when the Studio offers this size for this kind. */
export const offeredFor = (f: Format, kind: Kind) => !f.onlyFor || f.onlyFor.includes(kind);

const all = (n: number): Insets => ({ top: n, right: n, bottom: n, left: n });

/** A print size: px from inches, 1/8" bleed, words 1/8" inside the trim. */
function printFormat(
  id: string,
  label: string,
  hint: string,
  inW: number,
  inH: number,
  shape: Shape,
  dpi = 300,
): Format {
  const bleed = Math.round(0.125 * dpi);
  return {
    id,
    group: 'print',
    label,
    hint,
    w: Math.round((inW + 0.25) * dpi),
    h: Math.round((inH + 0.25) * dpi),
    shape,
    bleed,
    safe: all(bleed + Math.round(0.25 * dpi)),
    print: { inW, inH, dpi },
  };
}

export const FORMATS: Format[] = [
  // ── Facebook and Instagram ────────────────────────────────────────────────
  {
    id: 'post-portrait',
    group: 'social',
    label: 'Post, tall',
    hint: 'Facebook and Instagram feed. The best size for a post.',
    w: 1080,
    h: 1350,
    shape: 'portrait',
    bleed: 0,
    safe: all(72),
  },
  {
    id: 'post-square',
    group: 'social',
    label: 'Post, square',
    hint: 'Facebook and Instagram feed, and the Instagram grid.',
    w: 1080,
    h: 1080,
    shape: 'square',
    bleed: 0,
    safe: all(68),
  },
  {
    id: 'story',
    group: 'social',
    label: 'Story',
    hint: 'Facebook and Instagram stories, and Reels covers.',
    w: 1080,
    h: 1920,
    shape: 'tall',
    bleed: 0,
    // The name bar at the top and the reply box at the foot cover these strips.
    safe: { top: 250, right: 84, bottom: 340, left: 84 },
  },
  {
    id: 'event-cover',
    group: 'social',
    label: 'Facebook event',
    hint: 'The picture at the top of a Facebook event.',
    w: 1920,
    h: 1005,
    shape: 'landscape',
    bleed: 0,
    safe: all(96),
  },
  {
    id: 'page-cover',
    group: 'social',
    label: 'Facebook page cover',
    hint: 'The wide picture across the top of the church page.',
    w: 1640,
    h: 624,
    shape: 'banner',
    bleed: 0,
    // Phones crop the sides; the profile picture covers the lower left on a computer.
    safe: { top: 60, right: 230, bottom: 60, left: 230 },
  },
  {
    id: 'youtube-thumb',
    group: 'social',
    label: 'YouTube thumbnail',
    hint: 'The picture on a sermon video.',
    w: 1280,
    h: 720,
    shape: 'landscape',
    bleed: 0,
    // YouTube prints the video length in the lower right corner.
    safe: { top: 64, right: 64, bottom: 96, left: 64 },
  },
  {
    id: 'youtube-banner',
    group: 'social',
    label: 'YouTube channel banner',
    hint: 'The top of the YouTube channel. Only the middle shows on phones.',
    w: 2560,
    h: 1440,
    shape: 'banner',
    bleed: 0,
    // The 1546 x 423 strip every device shows.
    safe: { top: 509, right: 507, bottom: 508, left: 507 },
  },
  // ── Screens in the sanctuary ──────────────────────────────────────────────
  {
    id: 'slide',
    group: 'screen',
    label: 'Sunday slide',
    hint: 'The screen in the sanctuary (16:9), for ProPresenter or Google Slides.',
    w: 1920,
    h: 1080,
    shape: 'landscape',
    bleed: 0,
    safe: all(108),
  },
  // ── Sermon series art (2026-10-28) ────────────────────────────────────────
  // The set a series needs, drawn from the series' own words (series-art.ts trims them to the
  // title, the series name, the book or passage and the church's name). They keep the group
  // whose type rules they follow (a slide is read from the back pew); the tool lists them
  // together under "Sermon series art" (SERIES_ART).
  {
    id: 'series-slide',
    group: 'screen',
    label: 'Series title slide',
    hint: 'The title slide for the sanctuary screen while the series runs (16:9).',
    w: 1920,
    h: 1080,
    shape: 'landscape',
    bleed: 0,
    safe: all(108),
    onlyFor: ['sermon'],
  },
  {
    id: 'series-square',
    group: 'social',
    label: 'Series square',
    hint: 'For the feed and the Instagram grid, the same art every week of the series.',
    w: 1080,
    h: 1080,
    shape: 'square',
    bleed: 0,
    safe: all(68),
    onlyFor: ['sermon'],
  },
  {
    id: 'podcast-cover',
    group: 'social',
    label: 'Podcast cover',
    hint: '3000 x 3000, the size Apple Podcasts asks for. Upload it in Sermons page > Podcast > Podcast picture.',
    w: 3000,
    h: 3000,
    shape: 'square',
    bleed: 0,
    safe: all(190),
    onlyFor: ['sermon'],
  },
  // ── Print ─────────────────────────────────────────────────────────────────
  printFormat(
    'flyer',
    'Flyer',
    'Letter, 8.5 x 11 in. Print at home or the copy shop.',
    8.5,
    11,
    'portrait',
  ),
  printFormat(
    'half-sheet',
    'Bulletin insert',
    'Half letter, 5.5 x 8.5 in. Two to a sheet.',
    5.5,
    8.5,
    'portrait',
  ),
  printFormat(
    'connect-card',
    'Connect card',
    '4 x 6 in, for the pews and the welcome table.',
    6,
    4,
    'landscape',
  ),
  printFormat(
    'postcard',
    'Neighborhood postcard',
    '6 x 11 in, the size USPS Every Door Direct Mail takes. Check with the print shop.',
    11,
    6,
    'landscape',
  ),
  {
    ...printFormat(
      'postcard-back',
      'Postcard, mailing side',
      'The address side of the 6 x 11 postcard, for Every Door Direct Mail. Confirm the size and the postage box with the post office or your printer before printing.',
      11,
      6,
      'landscape',
    ),
    // A neighborhood mailing is for Sunday, an event with a date, or New here.
    onlyFor: ['sunday', 'event', 'welcome'],
  },
  // A business card keeps words 1/8" inside the trim (the printers' own rule for this size),
  // not the 1/4" the larger pieces keep: on a 2" card the extra 1/8" is a fifth of the room.
  {
    ...printFormat(
      'invite-card',
      'Invite card',
      'Business card, 3.5 x 2 in. For members to hand to a friend.',
      3.5,
      2,
      'landscape',
    ),
    safe: all(Math.round(0.25 * 300)),
    onlyFor: ['invite'],
  },
  printFormat(
    'door-hanger',
    'Door hanger',
    '4.25 x 11 in. Leave room for the hole at the top. Never put a door hanger in a mailbox: it is against federal law (18 U.S.C. 1725).',
    4.25,
    11,
    'tall',
  ),
  printFormat(
    'yard-sign',
    'Yard sign',
    '24 x 18 in, read from across the road.',
    24,
    18,
    'landscape',
    150,
  ),
];

export const FORMAT_BY_ID: Record<string, Format> = Object.fromEntries(
  FORMATS.map((f) => [f.id, f]),
);

/** The sermon series art set, listed together in the tool (only for a sermon or series). */
export const SERIES_ART: string[] = ['series-slide', 'series-square', 'podcast-cover'];
export const SERIES_ART_LABEL = 'Sermon series art';

export const GROUP_LABELS: Record<FormatGroup, string> = {
  social: 'Facebook and Instagram',
  screen: 'Screens',
  print: 'Print',
};

/** The box words may use: the canvas minus the safe insets. */
export function safeBox(f: Format): { x: number; y: number; w: number; h: number } {
  return {
    x: f.safe.left,
    y: f.safe.top,
    w: f.w - f.safe.left - f.safe.right,
    h: f.h - f.safe.top - f.safe.bottom,
  };
}

/**
 * The type scale unit for a size: 1 on a 1080-wide post. Templates size type
 * as multiples of it, so a flyer and a post share proportions. Based on the
 * shorter side of the safe box, so a wide banner does not get giant type.
 */
export function unit(f: Format): number {
  const b = safeBox(f);
  return Math.min(b.w, b.h * 1.25) / 936;
}
