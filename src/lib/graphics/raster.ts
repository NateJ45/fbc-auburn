// Safe to edit by hand
// =============================================================================
// The graphics maker in the browser: fonts, measuring, PNG and print (2026-10-27).
// =============================================================================
// Browser only (the Studio tool and the styleguide wall). Templates are pure and
// return SVG; this file gives them a real measure (a canvas with the same two
// fonts loaded, so line breaks match what is drawn), turns an SVG into a PNG at
// full size, and opens a print window at the trimmed paper size for Save as PDF.
// docs/agent/graphics.md.
// =============================================================================

import { C, FAMILY } from './svg.ts';
import { shopPrintHtml } from './print.ts';
import type { Format } from './formats.ts';
import type { FontSpec, Measure } from './text.ts';
import type { Assets } from './types.ts';
import {
  pickVideoType,
  VIDEO,
  videoFrameAt,
  videoRect,
  type VideoPlan,
  type VideoType,
} from './video.ts';

let fontsReady: Promise<void> | null = null;

/** Load Young Serif and Familjen Grotesk into the page once (the measure needs them). */
export function loadFonts(assets: Assets): Promise<void> {
  if (fontsReady) return fontsReady;
  const faces = [
    new FontFace(FAMILY.serif, `url(${assets.serif})`),
    new FontFace(FAMILY.sans, `url(${assets.sans})`, { weight: '400 700' }),
  ];
  fontsReady = Promise.all(faces.map((f) => f.load())).then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
  });
  return fontsReady;
}

/** A measure backed by a canvas and the real fonts. Call after loadFonts(). */
export function canvasMeasure(): Measure {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('No canvas to measure text with.');
  const cache = new Map<string, number>();
  return (text: string, font: FontSpec) => {
    const t = font.caps ? text.toUpperCase() : text;
    const key = `${font.family}|${font.size}|${font.weight ?? 400}|${font.tracking ?? 0}|${t}`;
    const hit = cache.get(key);
    if (hit != null) return hit;
    ctx.font = `${font.weight ?? 400} ${font.size}px ${FAMILY[font.family]}`;
    const w = ctx.measureText(t).width + (font.tracking ?? 0) * font.size * t.length;
    cache.set(key, w);
    return w;
  };
}

/** An object URL for showing an SVG in an <img> (revoke it when the preview changes). */
export function svgUrl(svg: string): string {
  return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The graphic could not be drawn.'));
    img.src = src;
  });
}

/** The SVG drawn at full size as a PNG blob. */
export async function svgToPng(svg: string, format: Format): Promise<Blob> {
  // A data: URL, not a blob: URL, so Safari draws it without tainting the canvas.
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  // Give the embedded fonts a frame to settle before the draw (Chrome decodes them lazily).
  await img.decode().catch(() => undefined);
  const canvas = document.createElement('canvas');
  canvas.width = format.w;
  canvas.height = format.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas to draw on.');
  ctx.drawImage(img, 0, 0, format.w, format.h);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('The picture could not be saved.'))),
      'image/png',
    ),
  );
}

/** Save a blob as a file. */
export function download(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** A file name from the words ("flyer-christmas-eve.png"). */
export function fileName(formatId: string, title: string, ext = 'png'): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    // Trimmed after the cut, so a name never ends "-on-the-".
    .replace(/^-+|-+$/g, '');
  return `${formatId}${slug ? `-${slug}` : ''}.${ext}`;
}

/**
 * "Print at home": a print size at its TRIMMED paper size (the bleed hangs off the page), so
 * Save as PDF in the print dialog makes a PDF a home printer or copy shop can use.
 * Opens a new window: call from a click.
 */
export async function printGraphic(svg: string, format: Format, title: string): Promise<void> {
  if (!format.print) throw new Error('Only print sizes print.');
  const png = await svgToPng(svg, format);
  const url = URL.createObjectURL(png);
  const { inW, inH } = format.print;
  const win = window.open('', '_blank');
  if (!win)
    throw new Error('The print window was blocked. Allow pop-ups for the Studio and try again.');
  win.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/</g, '')}</title>
<style>@page{size:${inW}in ${inH}in;margin:0}html,body{margin:0;padding:0}
.page{width:${inW}in;height:${inH}in;overflow:hidden;position:relative}
.page img{position:absolute;left:-0.125in;top:-0.125in;width:${inW + 0.25}in;height:${inH + 0.25}in}</style></head>
<body><div class="page"><img src="${url}" alt=""></div></body></html>`);
  win.document.close();
  const img = win.document.querySelector('img');
  if (img && !img.complete)
    await new Promise((r) => img.addEventListener('load', r, { once: true }));
  win.focus();
  win.print();
}

/**
 * "Save a PDF for the print shop": a print window at the FULL size, 1/8" of bleed on every side,
 * with the SVG inlined so the words stay vector text with the fonts embedded (shopPrintHtml).
 * Save as PDF in the print dialog makes a bleed-ready file. Opens a new window: call from a click.
 */
export async function printForShop(svg: string, format: Format, title: string): Promise<void> {
  const win = window.open('', '_blank');
  if (!win)
    throw new Error('The print window was blocked. Allow pop-ups for the Studio and try again.');
  win.document.write(shopPrintHtml(svg, format, title));
  win.document.close();
  // The fonts are data URIs in the SVG's own style; wait for them so the PDF never has a fallback.
  await win.document.fonts?.ready.catch(() => undefined);
  const imgs = Array.from(win.document.querySelectorAll('image'));
  await new Promise((r) => setTimeout(r, imgs.length ? 300 : 50));
  win.focus();
  win.print();
}

/**
 * The short video for Reels and Stories (2026-10-28, video.ts): the Story graphic drawn onto a
 * canvas frame by frame (fading up from the paper color while it settles from 3.5% larger, then
 * holding) and recorded with MediaRecorder from the canvas's own stream. MP4 where the browser
 * records it (Chrome 126+, Safari), else WebM. Records in real time, so it takes the video's
 * length; `onProgress` gets 0 to 1. No dependency.
 */
export async function recordStoryVideo(
  svg: string,
  onProgress: (done: number) => void = () => undefined,
  plan: VideoPlan = VIDEO,
): Promise<{ blob: Blob; type: VideoType }> {
  if (typeof MediaRecorder === 'undefined')
    throw new Error('This browser cannot make a video. Try Chrome, Edge or Safari.');
  const type = pickVideoType((m) => MediaRecorder.isTypeSupported(m));
  if (!type) throw new Error('This browser cannot make a video. Try Chrome, Edge or Safari.');

  // The graphic, drawn once at full size, so every frame is one quick copy.
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  await img.decode().catch(() => undefined);
  const still = document.createElement('canvas');
  still.width = plan.w;
  still.height = plan.h;
  still.getContext('2d')?.drawImage(img, 0, 0, plan.w, plan.h);

  const canvas = document.createElement('canvas');
  canvas.width = plan.w;
  canvas.height = plan.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas to draw on.');
  ctx.imageSmoothingQuality = 'high';
  const draw = (t: number) => {
    const fr = videoFrameAt(t, plan);
    const r = videoRect(fr, plan);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.ground;
    ctx.fillRect(0, 0, plan.w, plan.h);
    ctx.globalAlpha = fr.alpha;
    ctx.drawImage(still, r.x, r.y, r.w, r.h);
  };
  draw(0);

  const stream = canvas.captureStream(plan.fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: type.mime,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error('The video could not be recorded.'));
  });
  recorder.start(500);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      draw(Math.min(t, plan.seconds));
      onProgress(Math.min(1, t / plan.seconds));
      if (t >= plan.seconds) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  recorder.stop();
  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  return { blob: new Blob(chunks, { type: type.mime.split(';')[0] }), type };
}
