// Safe to edit by hand
// The shot list for Pastor Jacob (2026-10-24): the photo we want in each picture slot on the site.
// While PRE_LAUNCH_NOTES is true, a slot that is empty or still holds a stand-in (a photo from the
// church's Facebook page or an Unsplash picture) shows a "Photo needed" placeholder that names the
// shot (src/components/ShotRequest.astro) instead of the stand-in. Upload the church's own photo in
// the Studio and it shows straight away; at launch PRE_LAUNCH_NOTES goes false and every
// placeholder goes with it (a slot with no photo then falls back to what it showed before).
//
// Each shot also carries an example (2026-10-24): a free Unsplash photo (and, for Last Sunday, a
// Pexels clip) of the same kind of picture, kept in public/shot-examples/. The placeholder shows the
// example filling the slot with a yellow "Example" note pinned on it, so the page reads as finished
// while still saying which photo is Jacob's to take. Sources and photographers:
// public/shot-examples/CREDITS.md.
//
// The same list feeds the "For Jacob" pill (src/data/for-jacob.ts), one note per shot, so the
// pill and the placeholders never disagree.
//
// Keys: the page path with a trailing slash, then the block's heading exactly as it reads in the
// Studio ("/" for Home). A block with several photos (Home's Who we are) lists them in order: the
// big photo first, then the two small ones. Home's hero is keyed "hero", not by a heading. A
// renamed heading simply loses its request.

import { PRE_LAUNCH_NOTES } from './for-jacob.ts';

export interface Shot {
  /** The shot, in a few words: what Jacob points the camera at. */
  title: string;
  /** One or two plain sentences: who or what is in it, when, and anything to avoid. */
  detail: string;
  /** The way to hold the phone. The placeholder takes the slot's own shape either way. */
  orientation: 'landscape' | 'portrait' | 'square';
  /**
   * A free stock photo of the same kind of shot (2026-10-24), so the slot looks finished and Jacob
   * sees what we mean. `file` is its name in public/shot-examples/ (.webp); `credit` names the
   * photographer; `note: 'end'` pins the note to the right corner when the left one would hide the
   * subject. Never shipped at launch: it goes with the placeholder.
   */
  example?: { file: string; credit: string; note?: 'end' };
  /** A short silent clip shown instead of the example photo (the Last Sunday video card). */
  video?: { file: string; credit: string };
}

/** The public path of an example's photo, video (.mp4) or video poster. */
export const exampleSrc = (file: string, ext: 'webp' | 'mp4' = 'webp') =>
  `/shot-examples/${file}.${ext}`;

/**
 * The srcset for an example drawn full-width above the fold (the Home hero, its LCP element). The
 * 800 and 1280 copies sit beside the 2000px file as `<file>-800.webp` and `<file>-1280.webp`
 * (made with sharp, quality 60 and 62); a new full-width example needs both copies made too.
 */
export const heroSrcset = (file: string) =>
  [800, 1280].map((w) => `/shot-examples/${file}-${w}.webp ${w}w`).join(', ') +
  `, ${exampleSrc(file)} 2000w`;

const SHOTS: Record<string, Shot[]> = {
  '/|hero': [
    {
      title: 'Sunday morning, from the back of the room',
      detail:
        'The congregation during worship or the welcome, taken from behind the last pews so backs, not faces, fill the frame. The welcome words go over the left side, so keep that part calm.',
      orientation: 'landscape',
      example: { file: 'hero', credit: 'Christian Harb on Unsplash' },
    },
  ],
  '/|A place to belong': [
    {
      title: 'Sunday worship, wide from the back',
      detail: 'The whole room singing, with the front of the sanctuary in view.',
      orientation: 'portrait',
      example: { file: 'worship-wide', credit: 'Natalya Ukolova on Unsplash' },
    },
    {
      title: 'People talking after the service',
      detail: 'Coffee, a handshake, a laugh in the aisle. Ask before you share a face.',
      orientation: 'portrait',
      example: { file: 'after-service', credit: 'Connor Olson on Unsplash' },
    },
    {
      title: 'A small group or Bible study',
      detail: 'Open Bibles around a table, on a Sunday morning or a Wednesday night.',
      orientation: 'landscape',
      example: { file: 'bible-study', credit: 'Mitchell Leach on Unsplash' },
    },
  ],
  '/|Last Sunday': [
    {
      title: 'You preaching, seen from the pews',
      detail:
        'Taken from halfway back, with a few heads in the foreground. It stands in for the video until each Sunday’s recording is linked.',
      orientation: 'landscape',
      example: { file: 'preaching', credit: 'adrianna geo on Unsplash' },
      video: { file: 'sermon', credit: 'cottonbro studio on Pexels' },
    },
  ],
  '/|Meet Pastor Jacob': [
    {
      title: 'You, head and shoulders',
      detail: 'Natural light by a window or outside the front door. A phone is fine.',
      orientation: 'portrait',
      example: { file: 'pastor-portrait', credit: 'Susmit Sam on Unsplash' },
    },
  ],
  '/about/|Who we are': [
    {
      title: 'The church family together',
      detail:
        'A group photo on the front steps or by the sign after a Sunday service, everyone who would like to be in it.',
      orientation: 'landscape',
      example: { file: 'church-family', credit: 'Olek Buzunov on Unsplash' },
    },
  ],
  '/plan-your-visit/|Bringing children': [
    {
      title: 'The nursery or children’s room, ready for Sunday',
      detail:
        'The room set up, with toys or a lesson out. No children’s faces unless their parents have signed a release.',
      orientation: 'landscape',
      example: { file: 'nursery', credit: 'Atikah Akhtar on Unsplash' },
    },
  ],
  '/plan-your-visit/|Getting here': [
    {
      title: 'The front door, as a guest arrives',
      detail:
        'Stand where a first-time guest parks and take the walk up to the door, so they know where to go.',
      orientation: 'landscape',
      example: { file: 'front-door', credit: 'Roger Starnes Sr on Unsplash' },
    },
  ],
  '/plan-your-visit/|Look for the sign': [
    {
      title: 'The road sign, from a car',
      detail:
        'Hamilton-Scipio Road as a driver sees it, with the building behind the sign. A clear day, from the passenger seat.',
      orientation: 'landscape',
      example: { file: 'road-sign', credit: 'goodrich kingrey on Unsplash', note: 'end' },
    },
  ],
  '/ministries/|Serving our neighbours': [
    {
      title: 'Volunteers at the food pantry',
      detail:
        'People packing or handing out food on a pantry day, not just the tables. Only faces that are happy to be shown.',
      orientation: 'landscape',
      example: { file: 'food-pantry', credit: 'Raj Tuladhar on Unsplash' },
    },
  ],
  '/what-we-believe/|Baptism': [
    {
      title: 'A baptism',
      detail:
        'In the baptistry or outdoors, taken from the side. Only with the family’s say-so; the baptistry empty works too.',
      orientation: 'landscape',
      example: { file: 'baptism', credit: 'Vince Fleming on Unsplash' },
    },
  ],
  '/leadership/|Jacob Wysong': [
    {
      title: 'You, head and shoulders',
      detail: 'The same photo as on Home works here. Natural light, a phone is fine.',
      orientation: 'portrait',
      example: { file: 'pastor-portrait', credit: 'Susmit Sam on Unsplash' },
    },
  ],
};

/** The cover of a News and notes post: one request, whatever the post. */
const JOURNAL_COVER: Shot = {
  title: 'A photo that goes with this post',
  detail: 'Something from the news you are sharing. Optional: a post reads fine without one.',
  orientation: 'landscape',
  example: { file: 'news-cover', credit: 'Ray Kim on Unsplash' },
};

interface AssetLike {
  originalFilename?: string | null;
  source?: { name?: string | null } | null;
}

/**
 * True when a projected image is one of the pre-launch stand-ins: an Unsplash picture (its
 * asset's `source`) or a photo taken from the church's Facebook page (uploaded as `fbca-fb-*`),
 * or anything uploaded as `stand-in-*`. The church's own uploads are never stand-ins.
 */
export function isStandInPhoto(img: unknown): boolean {
  const asset = (img as { asset?: AssetLike | null } | null | undefined)?.asset;
  if (!asset) return false;
  if (asset.source?.name === 'unsplash') return true;
  return /^(fbca-fb-|stand-in-)/i.test(asset.originalFilename ?? '');
}

const keyOf = (path: string, heading: string) =>
  `${path.endsWith('/') ? path : `${path}/`}|${heading.trim()}`;

/** Every shot asked for on one page, in slot order. */
export function shotsForPage(path: string): Shot[] {
  const prefix = keyOf(path, '');
  return Object.entries(SHOTS)
    .filter(([k]) => k.startsWith(prefix))
    .flatMap(([, v]) => v);
}

/**
 * The placeholder for one picture slot, or null when the slot should show its photo: after launch,
 * when no shot is listed for it, or when the church's own photo is in it. `heading` must be the
 * plain heading (pass it through splitStega first on preview routes).
 */
export function shotFor(path: string, heading: string | undefined, index: number, img: unknown) {
  if (!PRE_LAUNCH_NOTES || !heading) return null;
  const shot = SHOTS[keyOf(path, heading)]?.[index];
  if (!shot) return null;
  const hasPhoto = Boolean((img as { asset?: unknown } | null | undefined)?.asset);
  return !hasPhoto || isStandInPhoto(img) ? shot : null;
}

/** A post's cover slot: the request while the cover is empty or a stand-in, before launch. */
export function journalCoverShot(img: unknown): Shot | null {
  if (!PRE_LAUNCH_NOTES) return null;
  const hasPhoto = Boolean((img as { asset?: unknown } | null | undefined)?.asset);
  return hasPhoto && isStandInPhoto(img) ? JOURNAL_COVER : null;
}
