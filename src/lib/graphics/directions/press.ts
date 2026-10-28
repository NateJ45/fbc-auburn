// Safe to edit by hand
// =============================================================================
// Direction "Press" for the graphics maker (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// The church's mark is a linocut: a brick wall with a white cross cut out, the
// grain and flecks kept. Press pulls every graphic from that same block, like a
// community-hall poster run off on a proof press:
//
//   paper   a warm white border all round, the sheet the block is printed on.
//   auburn  the first ink: a flat field with the print's flecks (printMask), its
//           edges a little chipped. Every word on it is cream Young Serif or
//           cream Familjen Grotesk (cream on auburn measures 6.3:1).
//   navy    the second ink: the imprint band at the foot (the mark, the name,
//           the web address, the QR code on print) whose top edge steps up in
//           three bricks at the right, like the corner of the mark; the small
//           slug behind the kicker; and the photo, printed as a navy duotone.
//   no photo  the building sketch is cut into the auburn in cream lines, the way
//           the cross is cut out of the mark.
//
// One left edge per piece: the kicker slug, the title, the body, the rule and
// the times all start on it. Times are set as a timetable with dotted leaders.
// The connect card is its own layout (a white writing side with ruled lines),
// and the door hanger keeps its hole clear.
// =============================================================================

import { printMask } from '../../../../scripts/lib/brick-print.mjs';
import { safeBox, unit, type Format } from '../formats.ts';
import { C, doc, image, lines, qr, rect } from '../svg.ts';
import { cleanText, fitText, type FitResult, type FontSpec, type Measure } from '../text.ts';
import type { Content, Ctx, Direction, Photo, Rendered } from '../types.ts';

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

const f1 = (n: number) => String(Math.round(n * 10) / 10);

/** A small seeded random (mulberry32), so the same words always print the same edges. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A polygon with the linocut's chipped edge: every side split into short runs and
 * each point nudged across the side by up to `amp`. Corners stay put, so blocks
 * still meet each other square.
 */
function roughPath(pts: Pt[], amp: number, step: number, seed: number): string {
  const rnd = seeded(seed);
  const out: Pt[] = [];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / step));
    const nx = len ? -(y1 - y0) / len : 0;
    const ny = len ? (x1 - x0) / len : 0;
    out.push([x0, y0]);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const d = (rnd() - 0.5) * amp;
      out.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]);
    }
  });
  return 'M' + out.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z';
}

/** A box's corners, clockwise. */
const boxPts = (b: Box): Pt[] => [
  [b.x, b.y],
  [b.x + b.w, b.y],
  [b.x + b.w, b.y + b.h],
  [b.x, b.y + b.h],
];

/**
 * The imprint band's outline: a box whose top edge climbs three bricks at the
 * right end (the stepped corner of the mark).
 */
function steppedPts(b: Box, sw: number, sh: number): Pt[] {
  const r = b.x + b.w;
  const t = b.y;
  return [
    [b.x, t],
    [r - 3 * sw, t],
    [r - 3 * sw, t - sh],
    [r - 2 * sw, t - sh],
    [r - 2 * sw, t - 2 * sh],
    [r - sw, t - 2 * sh],
    [r - sw, t - 3 * sh],
    [r, t - 3 * sh],
    [r, b.y + b.h],
    [b.x, b.y + b.h],
  ];
}

const rgb01 = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

/**
 * The two-ink photo: grey, then mapped from navy (the shadows) to paper (the
 * highlights), with the curve leaning dark so faces and rooms read as ink.
 */
function duotone(id: string, dark: string, light: string): string {
  const d = rgb01(dark);
  const l = rgb01(light);
  const curve = [0, 0.05, 0.16, 0.34, 0.56, 0.78, 0.93, 1];
  const tv = (k: 0 | 1 | 2) => curve.map((t) => (d[k] + (l[k] - d[k]) * t).toFixed(3)).join(' ');
  return (
    `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">` +
    `<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0"/>` +
    `<feComponentTransfer><feFuncR type="table" tableValues="${tv(0)}"/>` +
    `<feFuncG type="table" tableValues="${tv(1)}"/><feFuncB type="table" tableValues="${tv(2)}"/>` +
    `</feComponentTransfer></filter>`
  );
}

/** A photo cropped around its hotspot into a box, clipped to `clipD`, printed in two inks. */
function inkPhoto(p: Photo, id: string, b: Box, clipD: string): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.5;
  const ox = Math.min(0, Math.max(b.w - dw, b.w / 2 - fx * dw));
  const oy = Math.min(0, Math.max(b.h - dh, b.h / 2 - fy * dh));
  return (
    `<clipPath id="${id}"><path d="${clipD}"/></clipPath>` +
    `<g clip-path="url(#${id})"><image href="${p.src}" x="${f1(b.x + ox)}" y="${f1(b.y + oy)}" ` +
    `width="${f1(dw)}" height="${f1(dh)}" preserveAspectRatio="none" filter="url(#duo)"/></g>`
  );
}

/** Lines of text whose first line hangs its opening quote outside the left edge. */
function hang(svg: string, x: number, by: number): string {
  return svg.replace(/<tspan x="[^"]+"/, `<tspan x="${f1(x - by)}"`);
}

/**
 * Times stay whole on a line: "10:00 am" never breaks before the "am". The space
 * becomes a word joiner (not whitespace, so the line breaker keeps the pair) and
 * goes back to a no-break space when drawn.
 */
const GLUE = '\u2060';
const glue = (s: string) =>
  s.replace(/(\d)\s+(am|pm|a\.m\.|p\.m\.)(?=\W|$)/gi, (_, d: string, ap: string) => d + GLUE + ap);
const unglue = (ls: string[]) => ls.map((l) => l.split(GLUE).join('\u00a0'));

/**
 * The title, as large as it fits, but never with a short word alone on a line
 * ("One / service at / 10:00 am"): such a break is set a step smaller until it goes.
 */
function fitTitle(text: string, o: Parameters<typeof fitText>[1], m: Measure): FitResult {
  const t = glue(text);
  const words = t.split(/\s+/).length;
  const lonely = (r: FitResult) =>
    words >= 3 && r.lines.length > 1 && r.lines.some((l) => !/\s/.test(l) && l.length <= 6);
  let r = fitText(t, o, m);
  const first = r;
  let max = r.size;
  while (lonely(r) && !r.overflow && max > o.min) {
    max *= 0.96;
    r = fitText(t, { ...o, max }, m);
  }
  const out = r.overflow || lonely(r) ? first : r;
  return { ...out, lines: unglue(out.lines) };
}

// ── Words ───────────────────────────────────────────────────────────────────

interface Piece {
  h: number;
  draw: (x: number, y: number) => string;
  warnings: string[];
}

/** "Sunday School, 9:45 am" → ["Sunday School", "9:45 am"]; a bare time has no label. */
function splitWhen(s: string): [string, string] {
  const i = s.lastIndexOf(', ');
  return i < 0 ? ['', s] : [s.slice(0, i), s.slice(i + 2)];
}

/**
 * The information under the rule at the foot of the words: the date and times
 * (a timetable with dotted leaders), the passage and preacher, or a verse's
 * reference.
 */
function infoPiece(c: Content, w: number, u: number, m: Measure, label: string): Piece | null {
  const warnings: string[] = [];
  const parts: { h: number; draw: (x: number, y: number) => string }[] = [];
  const fit = (
    text: string,
    o: Omit<Parameters<typeof fitText>[1], 'maxW' | 'maxH'>,
    name: string,
  ): FitResult => {
    const r = fitText(text, { ...o, maxW: w, maxH: o.max * o.leading * o.maxLines + 1 }, m);
    if (r.overflow) warnings.push(`The ${name} is too long for ${label}. Try fewer words.`);
    return r;
  };
  const textPart = (
    text: string,
    o: Omit<Parameters<typeof fitText>[1], 'maxW' | 'maxH'>,
    name: string,
    fill: string = C.ground,
  ) => {
    if (!text) return;
    const r = fit(text, o, name);
    parts.push({
      h: r.height,
      draw: (x, y) =>
        lines(r.lines, {
          family: o.family,
          size: r.size,
          weight: o.weight,
          tracking: o.tracking,
          caps: o.caps,
          x,
          y,
          leading: o.leading,
          fill,
        }),
    });
  };
  const capsLine = { family: 'sans' as const, weight: 700, tracking: 0.14, caps: true };

  if (c.kind === 'sermon') {
    textPart(
      cleanText(c.reference),
      { ...capsLine, maxLines: 1, max: 28 * u, min: 18 * u, leading: 1.3 },
      'passage',
    );
    textPart(
      cleanText(c.speaker),
      { family: 'sans', weight: 500, maxLines: 1, max: 32 * u, min: 22 * u, leading: 1.3 },
      'preacher',
    );
  } else if (c.kind === 'verse') {
    textPart(
      [cleanText(c.reference), cleanText(c.translation)].filter(Boolean).join('  ·  '),
      { ...capsLine, maxLines: 1, max: 28 * u, min: 18 * u, leading: 1.3 },
      'reference',
    );
  } else if (c.kind !== 'time-change') {
    const when = (c.when ?? []).map(cleanText).filter(Boolean).map(splitWhen);
    const bare = when.filter(([l]) => !l).map(([, t]) => t);
    const rows = when.filter(([l]) => l);
    textPart(
      [cleanText(c.date), ...bare].filter(Boolean).join(', '),
      { family: 'sans', weight: 700, maxLines: 2, max: 38 * u, min: 24 * u, leading: 1.25 },
      'date',
    );
    if (rows.length) {
      // The timetable: label, dotted leader, time. Shrinks to fit, then falls back to lines.
      let s = 31 * u;
      const lf = (size: number): FontSpec => ({ family: 'sans', size, weight: 500 });
      const tf = (size: number): FontSpec => ({ family: 'sans', size, weight: 700 });
      const need = (size: number) =>
        Math.max(...rows.map(([l]) => m(l, lf(size)))) +
        Math.max(...rows.map(([, t]) => m(t, tf(size)))) +
        5 * size;
      while (need(s) > w && s > 21 * u) s *= 0.94;
      if (need(s) <= w) {
        const tw = Math.min(w, Math.max(need(s) + 2 * s, 520 * u));
        const lh = s * 1.6;
        parts.push({
          h: rows.length * lh,
          draw: (x, y) =>
            rows
              .map(([l, t], i) => {
                const top = y + i * lh;
                const base = top + lh * 0.5 + s * 0.34;
                const l0 = x + m(l, lf(s)) + 0.5 * s;
                const l1 = x + tw - m(t, tf(s)) - 0.5 * s;
                const dot = 0.16 * s;
                return (
                  lines([l], {
                    family: 'sans',
                    size: s,
                    weight: 500,
                    x,
                    y: top,
                    leading: 1.6,
                    fill: C.ground,
                  }) +
                  `<line x1="${f1(l0)}" y1="${f1(base - dot)}" x2="${f1(l1)}" y2="${f1(base - dot)}" stroke="${C.ground}" stroke-width="${f1(dot)}" stroke-linecap="round" stroke-dasharray="0 ${f1(dot * 3.2)}"/>` +
                  lines([t], {
                    family: 'sans',
                    size: s,
                    weight: 700,
                    x: x + tw,
                    y: top,
                    leading: 1.6,
                    fill: C.ground,
                    anchor: 'end',
                  })
                );
              })
              .join(''),
        });
      } else {
        textPart(
          rows.map(([l, t]) => `${l}, ${t}`).join('  ·  '),
          { family: 'sans', weight: 600, maxLines: 3, max: 30 * u, min: 20 * u, leading: 1.35 },
          'times',
        );
      }
    }
  }
  if (!parts.length) return null;
  const rule = Math.max(2, 3 * u);
  const after = 22 * u;
  const gap = 10 * u;
  const h = rule + after + parts.reduce((s, p) => s + p.h, 0) + gap * (parts.length - 1);
  return {
    h,
    warnings,
    draw: (x, y) => {
      let out = rect(x, y, Math.min(w, 260 * u), rule, C.ground);
      let yy = y + rule + after;
      for (const p of parts) {
        out += p.draw(x, yy);
        yy += p.h + gap;
      }
      return out;
    },
  };
}

/**
 * The main stack: the kicker on its navy slug, (a time change's date), the title
 * as large as the room allows, and the body. Placed at the top of `box`.
 */
function stack(
  c: Content,
  box: Box,
  u: number,
  m: Measure,
  o: { label: string; titleMax: number; body: boolean; titleMin?: number },
): { svg: string; h: number; warnings: string[] } {
  const warnings: string[] = [];
  const warn = (r: FitResult, name: string) => {
    if (r.overflow) warnings.push(`The ${name} is too long for ${o.label}. Try fewer words.`);
  };
  let svg = '';
  let y = box.y;
  let room = box.h;

  // The kicker: cream capitals on a navy slug, the slug's left edge on the column's.
  const kicker = cleanText(c.kicker);
  if (kicker) {
    const ks = 26 * u;
    const padX = 0.62 * ks;
    const padY = 0.42 * ks;
    const r = fitText(
      kicker,
      {
        family: 'sans',
        weight: 700,
        tracking: 0.16,
        caps: true,
        maxLines: 1,
        max: ks,
        min: 16 * u,
        leading: 1.2,
        maxW: box.w - 2 * padX,
        maxH: ks * 1.3,
      },
      m,
    );
    warn(r, 'kicker');
    const sh = r.height + 2 * padY;
    // The tracking adds space after the last letter too; take it back off the slug.
    const sw = r.width - 0.16 * r.size + 2 * padX;
    svg += rect(box.x, y, sw, sh, C.navy);
    svg += lines(r.lines, {
      family: 'sans',
      size: r.size,
      weight: 700,
      tracking: 0.16,
      caps: true,
      x: box.x + padX,
      y: y + padY,
      leading: 1.2,
      fill: C.ground,
    });
    y += sh + 34 * u;
    room -= sh + 34 * u;
  }

  // A time change says its date first, large: it is the news.
  if (c.kind === 'time-change' && cleanText(c.date)) {
    const r = fitText(
      cleanText(c.date),
      {
        family: 'sans',
        weight: 700,
        maxLines: 2,
        max: 44 * u,
        min: 26 * u,
        leading: 1.2,
        maxW: box.w,
        maxH: 44 * u * 2.5,
      },
      m,
    );
    warn(r, 'date');
    svg += lines(r.lines, {
      family: 'sans',
      size: r.size,
      weight: 700,
      x: box.x,
      y,
      leading: 1.2,
      fill: C.ground,
    });
    y += r.height + 18 * u;
    room -= r.height + 18 * u;
  }

  // The body is fitted before the title so the title can take what is left.
  const bodyText = o.body ? cleanText(c.body) : '';
  const bodyGap = 30 * u;
  let bodyFit: FitResult | null = null;
  if (bodyText) {
    bodyFit = fitText(
      bodyText,
      {
        family: 'sans',
        weight: 400,
        maxLines: 4,
        max: 31 * u,
        min: 22 * u,
        leading: 1.38,
        maxW: Math.min(box.w, 760 * u),
        maxH: room,
      },
      m,
    );
    warn(bodyFit, 'body');
    room -= bodyFit.height + bodyGap;
  }

  const verse = c.kind === 'verse';
  const titleText = verse ? `“${cleanText(c.title)}”` : cleanText(c.title);
  const tf = {
    family: 'serif' as const,
    maxLines: verse ? 7 : 4,
    max: o.titleMax,
    min: o.titleMin ?? 40 * u,
    leading: verse ? 1.13 : 1.02,
    tracking: -0.014,
  };
  const t = fitTitle(titleText, { ...tf, maxW: box.w, maxH: Math.max(0, room) }, m);
  warn(t, 'title');
  let tsvg = lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: tf.tracking,
    x: box.x,
    y,
    leading: tf.leading,
    fill: C.ground,
  });
  if (verse) tsvg = hang(tsvg, box.x, m('“', { family: 'serif', size: t.size }));
  svg += `<g mask="url(#type)">${tsvg}</g>`;
  y += t.height;

  if (bodyFit) {
    y += bodyGap;
    svg += lines(bodyFit.lines, {
      family: 'sans',
      size: bodyFit.size,
      weight: 400,
      x: box.x,
      y,
      leading: 1.38,
      fill: C.ground,
    });
    y += bodyFit.height;
  }
  if (y > box.y + box.h + 1 && !warnings.length)
    warnings.push(`There is too much to say on ${o.label}. Try fewer words.`);
  return { svg, h: y - box.y, warnings };
}

// ── The imprint band ────────────────────────────────────────────────────────

/**
 * The navy band's contents: the mark and the church's name, then the web address
 * and street address, then the QR code at the right on print. Returns its height
 * for a given width so the layout can size the band first.
 */
function imprint(
  c: Content,
  f: Format,
  ctx: Ctx,
  u: number,
  w: number,
): { h: number; draw: (x: number, y: number) => string } {
  const { church, measure: m, assets } = ctx;
  const M = 74 * u;
  const n1: FontSpec = { family: 'serif', size: 30 * u };
  const n2: FontSpec = { family: 'sans', size: 20 * u, weight: 600 };
  const wf: FontSpec = { family: 'sans', size: 24 * u, weight: 700 };
  const af: FontSpec = { family: 'sans', size: 19 * u, weight: 400 };
  const web = cleanText(c.link) || church.web;
  const addr =
    church.address && (f.print || f.shape === 'portrait' || f.shape === 'tall')
      ? church.address
      : church.place;
  const q = f.print && c.qr ? Math.max(0.85 * f.print.dpi, 110 * u) : 0;
  const lockW = M + 20 * u + Math.max(m(church.line1, n1), m(church.line2, n2));
  const webW = Math.max(m(web, wf), m(addr, af));
  const avail = w - (q ? q + 36 * u : 0);
  const side = lockW + 56 * u + webW <= avail;
  const webH = 24 * u * 1.3 + 19 * u * 1.35;
  const h = Math.max(side ? M : M + 22 * u + webH, q);
  return {
    h,
    draw: (x, y) => {
      let out = '';
      const ly = q > M && side ? y + (h - M) / 2 : y;
      out += image(assets.markWhite, x, ly, M, M);
      const nx = x + M + 20 * u;
      out += lines([church.line1], { ...n1, x: nx, y: ly + 4 * u, leading: 1.15, fill: C.ground });
      out += lines([church.line2], { ...n2, x: nx, y: ly + 42 * u, leading: 1.3, fill: C.tint });
      const webRight = x + w - (q ? q + 36 * u : 0);
      const wy = side ? y + (h - webH) / 2 : ly + M + 22 * u;
      const wx = side ? webRight : x;
      const anchor = side ? 'end' : 'start';
      out += lines([web], { ...wf, x: wx, y: wy, leading: 1.3, fill: C.ground, anchor });
      out += lines([addr], {
        ...af,
        x: wx,
        y: wy + 24 * u * 1.3,
        leading: 1.35,
        fill: C.tint,
        anchor,
      });
      if (q) out += qr(c.qr!, x + w - q, y + (h - q) / 2, q, C.ink, C.ground);
      return out;
    },
  };
}

// ── The page ────────────────────────────────────────────────────────────────

/** The building sketch cut out of the ink in paper-coloured lines, fitted to a box. */
function carvedSketch(
  ctx: Ctx,
  b: Box,
  u: number,
  align: 'xMidYMax' | 'xMaxYMax',
): {
  defs: string;
  body: string;
} {
  const r = Math.max(0.6, 0.9 * u);
  return {
    defs:
      `<filter id="thick" x="-2%" y="-2%" width="104%" height="104%"><feMorphology operator="dilate" radius="${f1(r)}"/></filter>` +
      `<mask id="sk" style="mask-type:alpha" maskUnits="userSpaceOnUse"><image href="${ctx.assets.sketch}" x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" preserveAspectRatio="${align} meet" filter="url(#thick)"/></mask>`,
    body: rect(b.x, b.y, b.w, b.h, C.ground, 'mask="url(#sk)" opacity="0.92"'),
  };
}

/** The connect card: the auburn block on the left, a white writing side on the right. */
function connectCard(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  const safe = safeBox(f);
  const m = ctx.measure;
  const label = f.label;
  let defs = duotone('duo', C.navy, C.ground) + inkMasks(f, u);
  let ink = '';
  let body = rect(0, 0, f.w, f.h, C.ground);

  const bw = Math.round(f.w * 0.45);
  const sw = 52 * u;
  const sh = 44 * u;
  // The block's right edge steps out three bricks toward the foot.
  const R = bw;
  const B = f.h;
  const blockPts: Pt[] = [
    [0, 0],
    [R, 0],
    [R, B - 3 * sh],
    [R + sw, B - 3 * sh],
    [R + sw, B - 2 * sh],
    [R + 2 * sw, B - 2 * sh],
    [R + 2 * sw, B - sh],
    [R + 3 * sw, B - sh],
    [R + 3 * sw, B],
    [0, B],
  ];
  ink += `<path d="${roughPath(blockPts, 1.6 * u, 14 * u, 3)}" fill="${C.auburn}"/>`;

  // Left: the words, then the mark and the web address (and the code) at the foot.
  const x = safe.x;
  const colW = R - x - 44 * u;
  const footH = 120 * u;
  const st = stack(c, { x, y: safe.y, w: colW, h: safe.h - footH - 36 * u }, u, m, {
    label,
    titleMax: 76 * u,
    body: true,
    titleMin: 34 * u,
  });
  let words = st.svg;
  const fy = safe.y + safe.h - footH;
  const web = cleanText(c.link) || ctx.church.web;
  if (c.qr) {
    words += qr(c.qr, x, fy, footH, C.ink, C.ground);
    words += lines(['Scan to tell us online'], {
      family: 'sans',
      weight: 700,
      size: 20 * u,
      x: x + footH + 22 * u,
      y: fy + footH / 2 - 26 * u,
      leading: 1.3,
      fill: C.ground,
    });
    words += lines([web], {
      family: 'sans',
      size: 18 * u,
      x: x + footH + 22 * u,
      y: fy + footH / 2 + 2 * u,
      leading: 1.3,
      fill: C.ground,
    });
  } else {
    words += image(ctx.assets.markWhite, x, fy + footH - 70 * u, 70 * u, 70 * u);
  }

  // Right: the writing side. Navy labels, light navy rules to write on.
  const wx = R + 3 * sw + 64 * u;
  const wr = safe.x + safe.w;
  const ww = wr - wx;
  const fields: [string, number][] = [
    ['Name', 1],
    ['Email or phone', 1],
    ['How can we pray for you?', 3],
  ];
  const lab: FontSpec = { family: 'sans', size: 26 * u, weight: 700, tracking: 0.12, caps: true };
  const head = 'Tell us about you';
  const headF: FontSpec = { family: 'serif', size: 50 * u };
  const headH = 50 * u * 1.15 + 34 * u;
  const labH = 26 * u * 1.3;
  const nLines = fields.reduce((s, [, n]) => s + n, 0);
  const gapF = 36 * u;
  const pitch = Math.min(
    96 * u,
    (safe.h - headH - fields.length * labH - (fields.length - 1) * gapF) / nLines,
  );
  let yy = safe.y;
  let writing = lines([head], { ...headF, x: wx, y: yy, leading: 1.15, fill: C.navy });
  yy += headH;
  for (const [name, n] of fields) {
    writing += lines([name], { ...lab, x: wx, y: yy, leading: 1.3, fill: C.navy });
    yy += labH;
    for (let i = 0; i < n; i++) {
      yy += pitch;
      writing += rect(wx, yy - Math.max(2, 1.6 * u), ww, Math.max(2, 1.6 * u), C.navyLight);
    }
    yy += gapF;
  }
  if (m(head, headF) > ww) st.warnings.push(`The writing side is too narrow on ${label}.`);

  body += `<g mask="url(#ink)">${ink}</g>` + words + writing;
  return { svg: doc(f, ctx.assets, defs, body), warnings: st.warnings };
}

/** The fleck masks: one for the ink fields, a finer one for the big type. */
function inkMasks(f: Format, u: number): string {
  const strip = (s: string) => s.replace(/^<defs>|<\/defs>$/g, '');
  return (
    strip(printMask('ink', { x: 0, y: 0, w: f.w, h: f.h, u: 40 * u, seed: 23, density: 2.2 })) +
    strip(
      printMask('type', {
        x: 0,
        y: 0,
        w: f.w,
        h: f.h,
        u: 30 * u,
        seed: 61,
        density: 2,
        tile: [9, 6],
      }),
    )
  );
}

function render(c: Content, f: Format, ctx: Ctx): Rendered {
  if (c.kind === 'welcome' && f.id === 'connect-card') return connectCard(c, f, ctx);
  const banner = f.shape === 'banner';
  // A banner's safe strip is short, so its type scale is set a step larger.
  const u = unit(f) * (banner ? 1.45 : 1);
  const safe = safeBox(f);
  const m = ctx.measure;
  const label = f.label;
  const dpi = f.print?.dpi ?? 0;
  let defs = duotone('duo', C.navy, C.ground) + inkMasks(f, u);
  let ink = '';
  let over = '';
  const warnings: string[] = [];

  // The paper border, and the inked area inside it.
  const mg = f.print ? f.bleed + Math.round(0.17 * dpi) : Math.round(26 * unit(f));
  const L = mg;
  const T = mg;
  const R = f.w - mg;
  const B = f.h - mg;
  const H = B - T;
  const pad = 46 * u;
  const amp = 1.6 * u;
  const stepL = 14 * u;
  const cx = Math.max(safe.x, L + pad);
  const cr = Math.min(safe.x + safe.w, R - pad);

  // The door hanger's hole (1.25 in, its centre 1 in below the trim) stays clear of words.
  const hanger = f.id === 'door-hanger';
  const holeR = 0.7 * dpi;
  const holeY = f.bleed + 1.0 * dpi;
  const holeBottom = hanger ? holeY + holeR + 0.2 * dpi : 0;

  const compact = banner || f.id === 'youtube-thumb';
  // Tall, portrait and square pieces stack the picture over the words.
  const vertical = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  const titleMax =
    (banner
      ? 150
      : f.shape === 'tall'
        ? 200
        : f.shape === 'portrait'
          ? 180
          : vertical
            ? 150
            : 170) * u;
  // The yard sign is read from across the road: the title and the times only.
  const withBody = !banner && f.id !== 'youtube-thumb' && f.id !== 'yard-sign';

  // The band at the foot: its size comes first, so the words know their room.
  const sw = 50 * u;
  const sh = 17 * u;
  let bandTop = B;
  if (!compact) {
    const im = imprint(c, f, ctx, u, cr - cx);
    const contentBottom = Math.min(B - 30 * u, safe.y + safe.h);
    bandTop = contentBottom - im.h - 32 * u;
    over += im.draw(cx, bandTop + 32 * u);
  }
  ink += `<path d="${roughPath(boxPts({ x: L, y: T, w: R - L, h: bandTop - T }), amp, stepL, 5)}" fill="${C.auburn}"/>`;

  // The words' box, and the picture beside or above it.
  let words: Box;
  let pic: Box;
  // Where the words begin on a stacked piece: the cut sketch sits just above them.
  let wordsTop = 0;
  if (vertical) {
    words = { x: cx, y: T, w: cr - cx, h: bandTop - 3 * sh - 34 * u - T };
  } else {
    const px = banner ? Math.round(safe.x + safe.w * 0.6) : Math.round(L + (R - L) * 0.58);
    const top = Math.max(safe.y, T + pad);
    const bottom = compact ? Math.min(B - pad, safe.y + safe.h) : bandTop - pad;
    words = { x: cx, y: top, w: Math.min(cr, px - pad * 1.3) - cx, h: bottom - top };
    pic = { x: px, y: T, w: R - px, h: bandTop - T };
  }

  // The information under its rule at the foot of the words.
  const info = infoPiece(c, Math.min(words.w, 900 * u), u, m, label);
  const infoTop = words.y + words.h - (info ? info.h : 0);
  if (info) {
    over += info.draw(words.x, infoTop);
    warnings.push(...info.warnings);
  }
  const stackBottom = infoTop - (info ? 44 * u : 0);

  if (vertical) {
    // The picture takes what the words leave, between a floor and a ceiling: the words
    // are set first (the title as large as its own limit), then sit on the information.
    const minPic = Math.max(
      H * (c.photo ? 0.26 : f.shape === 'square' ? 0.13 : 0.17),
      holeBottom ? holeBottom + 0.3 * dpi - T : 0,
    );
    const maxPic = H * (c.photo ? 0.54 : 0.3);
    const firstTop = Math.max(safe.y, T + minPic + pad);
    const st = stack(c, { ...words, y: firstTop, h: Math.max(0, stackBottom - firstTop) }, u, m, {
      label,
      titleMax,
      body: withBody,
    });
    const stackTop = Math.max(firstTop, stackBottom - st.h);
    const picBottom = Math.max(T + minPic, Math.min(T + maxPic, stackTop - pad));
    over += `<g transform="translate(0 ${f1(stackTop - firstTop)})">${st.svg}</g>`;
    warnings.push(...st.warnings);
    pic = { x: L, y: T, w: R - L, h: picBottom - T };
    wordsTop = stackTop;
  } else {
    const st = stack(c, { ...words, h: Math.max(0, stackBottom - words.y) }, u, m, {
      label,
      titleMax,
      body: withBody,
    });
    // The words sit together on the information; any spare room is air above them.
    const drop = Math.max(0, (banner ? 0.5 : 1) * (stackBottom - words.y - st.h));
    over += `<g transform="translate(0 ${f1(drop)})">${st.svg}</g>`;
    warnings.push(...st.warnings);
  }

  // The picture: the photo in two inks, or the building sketch cut into the auburn.
  if (c.photo) {
    ink += inkPhoto(c.photo, 'ph', pic!, roughPath(boxPts(pic!), amp, stepL, 9));
  } else {
    const p = pic!;
    const sb = vertical
      ? { x: cx, y: Math.max(T + pad * 0.8, holeBottom), w: cr - cx, h: 0 }
      : {
          x: p.x + pad * 0.4,
          y: banner ? Math.max(T + pad, safe.y) : T + pad,
          w: Math.min(R - pad, banner ? safe.x + safe.w + pad * 3 : R - pad) - p.x - pad * 0.4,
          h: 0,
        };
    sb.h = vertical
      ? Math.max(p.y + p.h, wordsTop - pad * 0.9) - sb.y
      : (banner ? Math.min(B - pad, safe.y + safe.h) : bandTop - 3 * sh - 14 * u) - sb.y;
    const sk = carvedSketch(ctx, sb, u, 'xMidYMax');
    defs += sk.defs;
    ink += sk.body;
  }

  // The band, drawn over the picture so its steps climb into it.
  if (!compact) {
    const bandPts = steppedPts({ x: L, y: bandTop, w: R - L, h: B - bandTop }, sw, sh);
    ink += `<path d="${roughPath(bandPts, amp, stepL, 13)}" fill="${C.navy}"/>`;
  }

  let body = rect(0, 0, f.w, f.h, C.ground) + `<g mask="url(#ink)">${ink}</g>` + over;
  if (hanger)
    body += `<circle cx="${f1(f.w / 2)}" cy="${f1(holeY)}" r="${f1(holeR)}" fill="${C.ground}"/>`;
  return { svg: doc(f, ctx.assets, defs, body), warnings };
}

export const press: Direction = {
  id: 'press',
  name: 'Press',
  summary:
    'Pulled from the same block as the linocut mark: an auburn field with the print’s flecks, big cream Young Serif, navy as the second ink for the imprint band and the photo, and the mark’s stepped bricks for structure.',
  render,
};
