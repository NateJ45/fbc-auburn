// Safe to edit by hand
// =============================================================================
// SVG building blocks for the graphics maker (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// Small string helpers every template uses, so a template reads as layout and
// not as markup: the document shell with the two fonts inlined, set lines of
// text, a photo cropped around its hotspot, the brick sill and marker from the
// site's own generators (scripts/lib/brick-courses.mjs, seeded, so the same
// words always draw the same bricks), the tile grounds and the QR code.
// =============================================================================

import qrcode from 'qrcode-generator';
import { BRICK_PATH_PRESETS, brickMarker, brickPath } from '../../../scripts/lib/brick-courses.mjs';
import { printMask } from '../../../scripts/lib/brick-print.mjs';
import { qrPath, QUIET_ZONE } from '../qr';
import type { Format } from './formats';
import type { FontSpec } from './text';
import type { Assets, Photo } from './types';

/** The palette (DESIGN.md), plus the night card's ground and kicker (scripts/lib/og-card.mjs). */
export const C = {
  auburn: '#9A3B2A',
  auburnDark: '#7E2E20',
  auburnLight: '#B5503A',
  /** The auburn that reads on navy (the share card's kicker). */
  auburnOnNavy: '#E0876F',
  navy: '#1F3A5F',
  navyDark: '#16304D',
  navyMid: '#2C4F7C',
  navyLight: '#7F98B8',
  night: '#11294A',
  ink: '#16263D',
  inkMuted: '#4A5A73',
  ground: '#FBF8F3',
  groundSoft: '#F4EFE7',
  tint: '#E9EEF5',
  border: '#E6DED2',
  white: '#FFFFFF',
  wallDark: '#66291E',
} as const;

export const FAMILY = { serif: 'YoungSerif', sans: 'Familjen' } as const;

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const f1 = (n: number) => String(Math.round(n * 10) / 10);

/** The whole SVG: size, fonts, defs, then the drawing. */
export function doc(format: Format, assets: Assets, defs: string, body: string): string {
  const { w, h } = format;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    `<style>@font-face{font-family:${FAMILY.serif};src:url(${assets.serif}) format('woff2')}` +
    `@font-face{font-family:${FAMILY.sans};src:url(${assets.sans}) format('woff2');font-weight:400 700}` +
    `text{font-kerning:normal;font-variant-ligatures:common-ligatures}</style>` +
    `<defs>${defs}</defs>${body}</svg>`
  );
}

export interface TextOpts extends FontSpec {
  x: number;
  /** Top of the block (the first line's baseline is placed from it). */
  y: number;
  leading: number;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}

/**
 * Lines of text as one <text>. `y` is the TOP of the block: each line's baseline
 * sits at about 0.8 of its line box (cap height of both faces), so blocks stack by
 * their real height (lines x size x leading).
 */
export function lines(ls: string[], o: TextOpts): string {
  if (!ls.length) return '';
  const lh = o.size * o.leading;
  const base = o.y + lh * 0.5 + o.size * 0.34;
  const tspans = ls
    .map(
      (l, i) =>
        `<tspan x="${f1(o.x)}" y="${f1(base + i * lh)}">${esc(o.caps ? l.toUpperCase() : l)}</tspan>`,
    )
    .join('');
  const attrs = [
    `font-family="${FAMILY[o.family]}"`,
    `font-size="${f1(o.size)}"`,
    `font-weight="${o.weight ?? 400}"`,
    `fill="${o.fill}"`,
    `text-anchor="${o.anchor ?? 'start'}"`,
    o.tracking ? `letter-spacing="${f1(o.tracking * o.size)}"` : '',
    o.opacity != null ? `opacity="${o.opacity}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<text ${attrs}>${tspans}</text>`;
}

export const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${extra}/>`;

/** An image file placed in a box (the mark, a texture), scaled to fit. */
export const image = (href: string, x: number, y: number, w: number, h: number, extra = '') =>
  `<image href="${href}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" preserveAspectRatio="xMidYMid meet" ${extra}/>`;

/**
 * A photo filling a box, cropped around its hotspot (never stretched). The crop
 * keeps the focus point as close to the box's middle as the picture allows.
 */
export function photo(p: Photo, id: string, x: number, y: number, w: number, h: number): string {
  const s = Math.max(w / p.w, h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.5;
  const ox = Math.min(0, Math.max(w - dw, w / 2 - fx * dw));
  const oy = Math.min(0, Math.max(h - dh, h / 2 - fy * dh));
  return (
    `<clipPath id="${id}"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/></clipPath>` +
    `<image href="${p.src}" x="${f1(x + ox)}" y="${f1(y + oy)}" width="${f1(dw)}" height="${f1(dh)}" clip-path="url(#${id})" preserveAspectRatio="none"/>`
  );
}

/** A repeating ground from a tile texture (tileNavy, tileWall), `size` px per repeat. */
export function tilePattern(id: string, href: string, size: number): string {
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${f1(size)}" height="${f1(size)}"><image href="${href}" width="${f1(size)}" height="${f1(size)}"/></pattern>`;
}

/**
 * The brick sill: the site's two or three stepped courses (brickPath), laid along
 * the foot of a box and printed like the logo (the linocut flecks). `course` is the
 * brick height in px; the preset is drawn at its own scale and grown to fit.
 * Returns {defs, body}: the mask goes in <defs>.
 */
export function sill(
  id: string,
  o: {
    x: number;
    /** The bottom edge the bricks sit on. */
    bottom: number;
    w: number;
    course: number;
    preset?: 'sill' | 'og' | 'wide' | 'banner';
    seed?: number;
  },
): { defs: string; body: string; height: number } {
  const preset = o.preset ?? 'og';
  const P = BRICK_PATH_PRESETS[preset];
  const s = o.course / P.h;
  const nominalW = o.w / s;
  const nominalH = P.bottom + P.courses.length * P.h + (P.courses.length - 1) * P.joint + 2;
  const bricks = brickPath({ width: nominalW, height: nominalH, preset, seed: o.seed ?? 7 });
  const paths = bricks
    .map((b: { d: string; fill: string }) => `<path d="${b.d}" fill="${b.fill}"/>`)
    .join('');
  const mask = printMask(`${id}-m`, {
    x: 0,
    y: 0,
    w: nominalW,
    h: nominalH,
    u: P.h,
    seed: (o.seed ?? 7) + 46,
  });
  const top = o.bottom - nominalH * s;
  return {
    defs: mask.replace(/^<defs>|<\/defs>$/g, ''),
    body: `<g transform="translate(${f1(o.x)} ${f1(top)}) scale(${s.toFixed(4)})"><g mask="url(#${id}-m)">${paths}</g></g>`,
    height: nominalH * s,
  };
}

/** The section marker: three bricks stepping up to the right (viewBox 78 x 36). */
export function marker(x: number, y: number, height: number): string {
  const s = height / 36;
  const paths = brickMarker()
    .map((b: { d: string; fill: string }) => `<path d="${b.d}" fill="${b.fill}"/>`)
    .join('');
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(4)})">${paths}</g>`;
}

/** The marker's width for a given height. */
export const markerWidth = (height: number) => (height * 78) / 36;

/**
 * A QR code for `url` in a `size` px square, quiet zone included, dark on light.
 * Error correction M (a smudge or a fold still scans).
 */
export function qr(
  url: string,
  x: number,
  y: number,
  size: number,
  dark: string = C.ink,
  light: string = C.white,
): string {
  const make = qrcode as unknown as (
    t: number,
    l: string,
  ) => {
    addData(s: string): void;
    make(): void;
    getModuleCount(): number;
    isDark(r: number, c: number): boolean;
  };
  const code = make(0, 'M');
  code.addData(url);
  code.make();
  const n = code.getModuleCount() + QUIET_ZONE * 2;
  const s = size / n;
  return (
    `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(4)})" shape-rendering="crispEdges">` +
    `<rect width="${n}" height="${n}" fill="${light}"/><path fill="${dark}" d="${qrPath(code)}"/></g>`
  );
}

/** A trim guide for print proofs: nothing (bleed is cut off by the printer), kept for the styleguide. */
export function trimGuide(format: Format): string {
  if (!format.bleed) return '';
  const b = format.bleed;
  return `<rect x="${b}" y="${b}" width="${format.w - 2 * b}" height="${format.h - 2 * b}" fill="none" stroke="#ff00ff" stroke-width="${Math.max(2, b / 12)}" stroke-dasharray="${b / 2} ${b / 3}"/>`;
}
