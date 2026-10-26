// Safe to edit by hand
// The Home hero's video (2026-10-25, PENDING 1zt). Home's hero can play a short silent clip of
// church life behind the welcome words; the background photo stays underneath as its poster and
// is all that shows when the clip should not play. This file holds the two decisions, so they are
// unit tested (hero-video.test.ts) and shared by the Studio field (sections.ts) and the hero's
// script (HomeHero.astro):
//   - which uploads count as a hero video (mp4 or webm only), and the size budget;
//   - whether this visitor gets the clip at all: never with reduced motion, Save-Data or a slow
//     connection (2G, 3G), and never in print, which shows the photo.

/** The file types the field takes; the Studio's file picker is limited to these too. */
export const HERO_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;
export const HERO_VIDEO_ACCEPT = HERO_VIDEO_TYPES.join(',');

/** The size budget the Studio warns above (bytes). A 20 second 720p clip with no sound is 3 to 5 MB. */
export const HERO_VIDEO_BUDGET = 6 * 1024 * 1024;

export interface HeroVideoAsset {
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
}

/** The clip's URL and type when the upload is a playable hero video, else null. */
export function heroVideoSource(
  asset: HeroVideoAsset | null | undefined,
): { url: string; type: string } | null {
  const url = asset?.url?.trim();
  const type = asset?.mimeType ?? '';
  if (!url || !(HERO_VIDEO_TYPES as readonly string[]).includes(type)) return null;
  return { url, type };
}

/**
 * The Studio's note on an upload: an error for a type the hero cannot play, a warning over the
 * size budget, else nothing. Plain words, because Pastor Jacob reads them.
 */
export function heroVideoProblem(
  asset: HeroVideoAsset | null | undefined,
): { level: 'error' | 'warning'; message: string } | null {
  if (!asset) return null;
  if (asset.mimeType && !(HERO_VIDEO_TYPES as readonly string[]).includes(asset.mimeType)) {
    return { level: 'error', message: 'The video must be an .mp4 or .webm file.' };
  }
  if (typeof asset.size === 'number' && asset.size > HERO_VIDEO_BUDGET) {
    const mb = (asset.size / 1024 / 1024).toFixed(1);
    return {
      level: 'warning',
      message: `This video is ${mb} MB. Keep it under 6 MB (shorter, or exported at 720p with no sound) so Home loads quickly on a phone.`,
    };
  }
  return null;
}

export interface MotionContext {
  /** matchMedia('(prefers-reduced-motion: reduce)').matches */
  reducedMotion: boolean;
  /** navigator.connection.saveData */
  saveData?: boolean;
  /** navigator.connection.effectiveType: 'slow-2g', '2g', '3g' or '4g' */
  effectiveType?: string;
  /** matchMedia('print').matches */
  print?: boolean;
}

const SLOW = new Set(['slow-2g', '2g', '3g']);

/** True when this visitor should get the clip; false keeps the still photo. */
export function heroVideoAllowed(ctx: MotionContext): boolean {
  if (ctx.reducedMotion || ctx.print) return false;
  if (ctx.saveData) return false;
  if (ctx.effectiveType && SLOW.has(ctx.effectiveType)) return false;
  return true;
}
