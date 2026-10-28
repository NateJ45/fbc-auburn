// Safe to edit by hand
// =============================================================================
// The short video for Reels and Stories: the motion, as pure math (2026-10-28).
// =============================================================================
// A 7 second 1080 x 1920 video of the Story graphic, recorded in the browser
// (raster.ts recordStoryVideo: a canvas, captureStream and MediaRecorder; no
// dependency). The motion is calm on purpose: the graphic fades up from the
// paper colour while it settles from 3.5% larger to its own size, then holds.
// No cuts, wipes, bounces or spins. This file says, for any moment, how opaque
// and how large the graphic is, and which file type to record, so both are
// unit-tested. docs/agent/graphics.md.
// =============================================================================

export interface VideoPlan {
  w: number;
  h: number;
  fps: number;
  /** The whole video, seconds. */
  seconds: number;
  /** The fade up from the paper colour, seconds. */
  fade: number;
  /** The scale-in, seconds (it overlaps the fade, then the graphic holds). */
  settle: number;
  /** The scale at the first frame (1.035 = 3.5% larger). */
  from: number;
}

export const VIDEO: VideoPlan = {
  w: 1080,
  h: 1920,
  fps: 30,
  seconds: 7,
  fade: 1.2,
  settle: 3.4,
  from: 1.035,
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/** Slow at the end: the graphic comes to rest rather than stopping. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Slow at both ends. */
const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

export interface VideoFrame {
  /** The graphic's opacity over the paper colour, 0 to 1. */
  alpha: number;
  /** The graphic's scale about the centre, `from` down to 1. */
  scale: number;
}

/** How the graphic is drawn `t` seconds in. */
export function videoFrameAt(t: number, v: VideoPlan = VIDEO): VideoFrame {
  return {
    alpha: easeInOutSine(clamp01(t / v.fade)),
    scale: 1 + (v.from - 1) * (1 - easeOutCubic(clamp01(t / v.settle))),
  };
}

/** Where the graphic is drawn on the canvas for a frame: scaled about the centre. */
export function videoRect(frame: VideoFrame, v: VideoPlan = VIDEO) {
  const w = v.w * frame.scale;
  const h = v.h * frame.scale;
  return { x: (v.w - w) / 2, y: (v.h - h) / 2, w, h };
}

export const frameCount = (v: VideoPlan = VIDEO) => Math.round(v.seconds * v.fps);

/** The types to try, best first: MP4 (H.264) where the browser records it, else WebM. */
export const VIDEO_TYPES = [
  'video/mp4;codecs=avc1.640028',
  'video/mp4;codecs=avc1.42E01E',
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

export interface VideoType {
  mime: string;
  ext: 'mp4' | 'webm';
  /** False for WebM: Facebook may want MP4, so the tool says so. */
  mp4: boolean;
}

/** The first type the browser can record (`MediaRecorder.isTypeSupported`), or null. */
export function pickVideoType(isSupported: (mime: string) => boolean): VideoType | null {
  for (const mime of VIDEO_TYPES) {
    let ok = false;
    try {
      ok = isSupported(mime);
    } catch {
      ok = false;
    }
    if (ok) {
      const mp4 = mime.startsWith('video/mp4');
      return { mime, ext: mp4 ? 'mp4' : 'webm', mp4 };
    }
  }
  return null;
}

/** "story-video-candlelight-service.mp4". */
export function videoFileName(title: string, ext: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return `story-video${slug ? `-${slug}` : ''}.${ext}`;
}
