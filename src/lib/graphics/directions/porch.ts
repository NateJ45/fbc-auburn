// Safe to edit by hand
// =============================================================================
// Direction "Porch" for the graphics maker (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// The site's light pages as a printed church notice. Warm white ground, navy ink:
// a masthead (the full-colour mark, the name, a navy rule), then the words on one
// left edge (the brick marker beside the kicker, the title in Young Serif, a line
// of body, the times set as a small timetable), and a foot with the web address,
// the street address and, on paper, the QR code. A photo takes one of the site's
// shapes: on a tall piece the building's gable over a navy brick slab, on a wide
// one a corner stepped like the marker's bricks. With no photo the church's own
// building sketch, in navy pen, fills the foot of the piece. The brick marker is
// the one auburn thing on the page. Print is mostly paper: no flood of ink.
// =============================================================================

import { safeBox, unit, type Format } from '../formats.ts';
import { C, doc, image, lines, marker, markerWidth, qr, rect, tilePattern } from '../svg.ts';
import { cleanText, fitText, type FitResult, type FontSpec, type Measure } from '../text.ts';
import type { Content, Ctx, Direction, Photo, Rendered } from '../types.ts';

const f1 = (n: number) => String(Math.round(n * 10) / 10);

/** The building sketch's own proportions (building-sketch-lines.webp, 1200 x 479). */
const SKETCH_RATIO = 479 / 1200;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One piece of the word stack, already fitted: its height and how to draw it at a top. */
interface Piece {
  h: number;
  gap: number;
  draw: (y: number) => string;
}

// ── Photos in the site's shapes ────────────────────────────────────────────────

/** A photo cropped around its hotspot into a box, clipped to a polygon (box-relative points). */
function shapedPhoto(p: Photo, id: string, b: Box, pts: [number, number][]): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.5;
  const ox = Math.min(0, Math.max(b.w - dw, b.w / 2 - fx * dw));
  const oy = Math.min(0, Math.max(b.h - dh, b.h / 2 - fy * dh));
  const poly = pts.map(([x, y]) => `${f1(b.x + x)},${f1(b.y + y)}`).join(' ');
  return (
    `<clipPath id="${id}"><polygon points="${poly}"/></clipPath>` +
    `<image href="${p.src}" x="${f1(b.x + ox)}" y="${f1(b.y + oy)}" width="${f1(dw)}" height="${f1(dh)}" clip-path="url(#${id})" preserveAspectRatio="none"/>`
  );
}

/** The building's front gable: the roof pitch is 24% of the box, as on the site. */
const gable = (w: number, h: number): [number, number][] => {
  const pitch = Math.min(h * 0.24, w * 0.2);
  return [
    [0, pitch],
    [w / 2, 0],
    [w, pitch],
    [w, h],
    [0, h],
  ];
};

/** Three brick courses stepping up to the right, cut out of the top-left corner. */
const stepped = (w: number, h: number, step: number): [number, number][] => [
  [0, step * 3],
  [step * 1.6, step * 3],
  [step * 1.6, step * 2],
  [step * 3.2, step * 2],
  [step * 3.2, step],
  [step * 4.8, step],
  [step * 4.8, 0],
  [w, 0],
  [w, h],
  [0, h],
];

// ── Setting words ──────────────────────────────────────────────────────────────

/** The largest size from `max` down to `min` at which one line fits `maxW`. */
function fitLine(
  text: string,
  font: Omit<FontSpec, 'size'>,
  maxW: number,
  max: number,
  min: number,
  measure: Measure,
): { size: number; w: number; over: boolean } {
  for (let s = max; s >= min; s *= 0.97) {
    const w = measure(text, { ...font, size: s });
    if (w <= maxW) return { size: s, w, over: false };
  }
  return { size: min, w: measure(text, { ...font, size: min }), over: true };
}

/** "Sunday School, 9:45 am" to ["9:45 am", "Sunday School"]: the time leads its row. */
function splitWhen(s: string): { a: string; b: string } {
  const t = cleanText(s);
  const i = t.lastIndexOf(', ');
  if (i < 0) return { a: t, b: '' };
  return { a: t.slice(i + 2), b: t.slice(0, i) };
}

interface Ctx2 {
  u: number;
  measure: Measure;
  warn: (s: string) => void;
  label: string;
}

/** The kicker: the brick marker, then small capitals in navy. */
function kickerPiece(
  text: string,
  x: number,
  w: number,
  size: number,
  gap: number,
  k: Ctx2,
): Piece {
  const font = { family: 'sans' as const, weight: 700, tracking: 0.16, caps: true };
  const mh = size * 1.0;
  const mw = markerWidth(mh);
  const mgap = size * 0.7;
  const fit = fitLine(text.toUpperCase(), font, w - mw - mgap, size, size * 0.7, k.measure);
  if (fit.over)
    k.warn(`The small line above the title is too long for ${k.label}. Try fewer words.`);
  return {
    h: mh,
    gap,
    draw: (y) => {
      const base = y + mh * 0.95;
      return (
        marker(x, y, mh) +
        lines([text], {
          ...font,
          size: fit.size,
          x: x + mw + mgap,
          y: base - fit.size * 0.84,
          leading: 1,
          fill: C.navy,
        })
      );
    },
  };
}

/** A fitted block of text (title or body) as a piece. */
function textPiece(
  r: FitResult,
  font: FontSpec,
  x: number,
  leading: number,
  fill: string,
  gap: number,
): Piece {
  return {
    h: r.height,
    gap,
    draw: (y) => lines(r.lines, { ...font, size: r.size, x, y, leading, fill }),
  };
}

/**
 * Details rows. `table`: the times as a small timetable, the time in bold in its
 * own column and the gathering beside it, a hairline between rows. `inline`: one
 * line each, the bold part then the plain part ("Wednesday, December 24   6:00 pm").
 * `lead` puts the brick marker before the first row (the verse's reference).
 */
function detailsPiece(
  rows: { a: string; b: string }[],
  mode: 'table' | 'inline',
  x: number,
  w: number,
  size: number,
  gap: number,
  k: Ctx2,
  lead = false,
): Piece | null {
  rows = rows.filter((r) => r.a || r.b);
  if (!rows.length) return null;
  const strong = { family: 'sans' as const, weight: 700 };
  const soft = { family: 'sans' as const, weight: 400 };
  const mh = size * 0.95;
  const lx = lead ? markerWidth(mh) + size * 0.7 : 0;
  // Shrink together until every row fits the width.
  let s = size;
  let colA = 0;
  const widthAt = (sz: number) => {
    const sp = sz * 0.75;
    colA = Math.max(...rows.map((r) => k.measure(r.a, { ...strong, size: sz })));
    return Math.max(
      ...rows.map((r) => {
        const aw = mode === 'table' ? colA : k.measure(r.a, { ...strong, size: sz });
        const bw = r.b ? k.measure(r.b, { ...soft, size: sz }) : 0;
        return lx + aw + (r.b ? sp + bw : 0);
      }),
    );
  };
  while (s > size * 0.66 && widthAt(s) > w) s *= 0.97;
  if (widthAt(s) > w) k.warn(`The times or date are too long for ${k.label}. Try fewer words.`);
  const sp = s * 0.75;
  const rowH = mode === 'table' ? s * 1.9 : s * 1.4;
  const rule = Math.max(1.5, 2 * k.u);
  const h = rows.length * rowH;
  return {
    h,
    gap,
    draw: (y) => {
      let out = '';
      rows.forEach((r, i) => {
        const top = y + i * rowH;
        const ty = top + (rowH - s) / 2;
        if (mode === 'table') out += rect(x, top, w, rule, C.border);
        if (lead && i === 0) out += marker(x, ty + s * 0.84 - mh * 0.95, mh);
        out += lines([r.a], { ...strong, size: s, x: x + lx, y: ty, leading: 1, fill: C.navy });
        if (r.b) {
          const bx =
            x + lx + (mode === 'table' ? colA : k.measure(r.a, { ...strong, size: s })) + sp;
          out += lines([r.b], { ...soft, size: s, x: bx, y: ty, leading: 1, fill: C.ink });
        }
      });
      if (mode === 'table') out += rect(x, y + h - rule, w, rule, C.border);
      return out;
    },
  };
}

/** What each kind says, as stack pieces; the title is fitted last into the room left. */
interface Words {
  before: Piece[];
  title: { text: string; max: number; min: number; maxLines: number; leading: number };
  after: Piece[];
}

function words(
  c: Content,
  f: Format,
  x: number,
  w: number,
  k: Ctx2,
  opts: { body: boolean; scale: number },
): Words {
  const u = k.u * opts.scale;
  const kicker = cleanText(c.kicker);
  const before: Piece[] = [];
  if (kicker && c.kind !== 'verse') before.push(kickerPiece(kicker, x, w, 26 * u, 34 * u, k));

  const bodyText = opts.body ? cleanText(c.body) : '';
  const body = (): Piece | null => {
    if (!bodyText) return null;
    const font: FontSpec = { family: 'sans', size: 30 * u, weight: 400 };
    const r = fitText(
      bodyText,
      {
        family: 'sans',
        weight: 400,
        maxW: Math.min(w, 860 * u),
        maxH: 30 * u * 1.42 * 4,
        maxLines: 4,
        max: 31 * u,
        min: 22 * u,
        leading: 1.42,
      },
      k.measure,
    );
    if (r.overflow)
      k.warn(`The words under the title are too long for ${k.label}. Try fewer words.`);
    return textPiece(r, font, x, 1.42, C.inkMuted, 40 * u);
  };
  const dsize = 30 * u;
  const date = cleanText(c.date);
  const times = (c.when ?? []).map(cleanText).filter(Boolean);
  const after: (Piece | null)[] = [];
  switch (c.kind) {
    case 'sunday':
    case 'welcome':
      after.push(
        body(),
        detailsPiece(times.map(splitWhen), 'table', x, Math.min(w, 760 * u), dsize, 0, k),
      );
      break;
    case 'event':
      after.push(
        detailsPiece([{ a: date, b: times.join(', ') }], 'inline', x, w, dsize, 30 * u, k),
        body(),
      );
      break;
    case 'announcement':
    case 'time-change':
      after.push(
        detailsPiece([{ a: date, b: times.join(', ') }], 'inline', x, w, dsize, 30 * u, k),
        body(),
      );
      break;
    case 'sermon':
      after.push(
        detailsPiece(
          [{ a: cleanText(c.reference), b: cleanText(c.speaker) }],
          'inline',
          x,
          w,
          dsize,
          0,
          k,
        ),
      );
      break;
    case 'verse':
      after.push(
        detailsPiece(
          [{ a: cleanText(c.reference), b: cleanText(c.translation) }],
          'inline',
          x,
          w,
          28 * u,
          0,
          k,
          true,
        ),
      );
      break;
  }
  const verse = c.kind === 'verse';
  return {
    before,
    title: {
      text: verse ? `“${cleanText(c.title)}”` : cleanText(c.title),
      max:
        (verse
          ? f.shape === 'tall'
            ? 84
            : 74
          : f.shape === 'tall'
            ? 150
            : f.shape === 'square'
              ? 112
              : 128) * u,
      min: (verse ? 34 : 44) * u,
      maxLines: verse ? 8 : 4,
      leading: verse ? 1.18 : 1.04,
    },
    after: after.filter((p): p is Piece => !!p),
  };
}

/**
 * Fit the stack into a box: the fixed pieces first, then the title as large as the
 * room left allows (up to its own maximum). Returns the drawing and the height used,
 * placed at the top, middle or bottom of the box.
 */
function stack(
  ws: Words,
  box: Box,
  k: Ctx2,
  align: 'top' | 'middle' | 'bottom',
  titleGap: number,
  /** Room to keep free for something else (the sketch), when it can be spared. */
  spare = 0,
): { svg: string; h: number; top: number; over: boolean } {
  const fixed = [...ws.before, ...ws.after];
  const fixedH = fixed.reduce((s, p) => s + p.h + p.gap, 0) + (ws.after.length ? titleGap : 0);
  const t = ws.title;
  const font = { family: 'serif' as const, tracking: -0.012 };
  const room = Math.max(0, box.h - fixedH);
  const opts = (maxH: number, max: number, min: number) => ({
    ...font,
    maxW: box.w,
    maxH,
    maxLines: t.maxLines,
    max,
    min,
    leading: t.leading,
  });
  // A break that leaves a short word alone on a line ("The / Sermon on / the Mount") reads
  // as a mistake, so walk down the sizes until the lines hold together.
  const lonely = (ls: string[]) =>
    ls.length > 1 && ls.some((l) => !l.includes(' ') && l.replace(/\W/g, '').length < 4);
  const fitAt = (maxH: number): FitResult => {
    for (let sz = t.max; sz >= t.min; sz *= 0.98) {
      const r = fitText(t.text, opts(maxH, sz, sz), k.measure);
      if (!r.overflow && !lonely(r.lines)) return r;
    }
    return fitText(t.text, opts(maxH, t.max, t.min), k.measure);
  };
  // Try leaving the spare room first; take it back if the title would get small.
  let r = fitAt(Math.max(0, room - spare));
  if (spare && (r.overflow || r.size < t.max * 0.85)) r = fitAt(room);
  if (r.overflow) k.warn(`The title is too long for ${k.label}. Try fewer words.`);
  const title = textPiece(
    r,
    { ...font, size: r.size },
    box.x,
    t.leading,
    C.navy,
    ws.after.length ? titleGap : 0,
  );
  const all = [...ws.before, title, ...ws.after];
  const used = all.reduce((s, p, i) => s + p.h + (i < all.length - 1 ? p.gap : 0), 0);
  if (used > box.h + 1 && !r.overflow)
    k.warn(`There is too much to say on ${k.label}. Try fewer words.`);
  let y = Math.max(
    box.y,
    align === 'top'
      ? box.y
      : align === 'middle'
        ? box.y + (box.h - used) / 2
        : box.y + box.h - used,
  );
  const top = y;
  let svg = '';
  all.forEach((p) => {
    svg += p.draw(y);
    y += p.h + p.gap;
  });
  return { svg, h: used, top, over: r.overflow || used > box.h + 1 };
}

// ── The frame: masthead, foot, sketch ──────────────────────────────────────────

/** The masthead: the mark, "First Baptist" over "CHURCH OF AUBURN", the place at the right, a navy rule. */
function masthead(
  ctx: Ctx,
  b: Box,
  size: number,
  u: number,
  place: boolean,
): { svg: string; h: number } {
  const { church, assets, measure } = ctx;
  const n1 = size * 0.5;
  const n2 = size * 0.22;
  const tx = b.x + size + size * 0.3;
  let svg = image(assets.markColor, b.x, 0, size, size).replace(' y="0"', ` y="${f1(b.y)}"`);
  svg += lines([church.line1], {
    family: 'serif',
    size: n1,
    leading: 1,
    x: tx,
    y: b.y + size * 0.05,
    fill: C.navy,
  });
  svg += lines([church.line2], {
    family: 'sans',
    weight: 700,
    tracking: 0.14,
    caps: true,
    size: n2,
    leading: 1,
    x: tx,
    y: b.y + size * 0.66,
    fill: C.navy,
  });
  if (place) {
    const pf = { family: 'sans' as const, weight: 600, tracking: 0.14, caps: true, size: n2 };
    const nameW = Math.max(
      measure(church.line1, { family: 'serif', size: n1 }),
      measure(church.line2.toUpperCase(), { ...pf, weight: 700 }),
    );
    if (tx + nameW + size * 0.8 + measure(church.place.toUpperCase(), pf) < b.x + b.w)
      svg += lines([church.place], {
        ...pf,
        leading: 1,
        x: b.x + b.w,
        y: b.y + size * 0.66,
        fill: C.inkMuted,
        anchor: 'end',
      });
  }
  const ruleY = b.y + size + 26 * u;
  const rule = Math.max(2, 3 * u);
  svg += rect(b.x, ruleY, b.w, rule, C.navy);
  return { svg, h: ruleY + rule - b.y };
}

/** The foot: a hairline, the web address in bold, the street address under it; the QR code to the right. */
function foot(
  c: Content,
  ctx: Ctx,
  b: Box,
  u: number,
  o: { address: boolean; qrSize: number },
): { svg: string; h: number } {
  const { church, measure } = ctx;
  const web = cleanText(c.link) || church.web;
  const addr = o.address && church.address ? church.address : church.place;
  const ws = 28 * u;
  const as = 22 * u;
  const showQr = o.qrSize > 0;
  const textW = b.w - (showQr ? o.qrSize + 40 * u : 0);
  const wf = fitLine(web, { family: 'sans', weight: 700 }, textW, ws, ws * 0.7, measure);
  const af = fitLine(addr, { family: 'sans', weight: 400 }, textW, as, as * 0.75, measure);
  const textH = wf.size * 1.25 + 8 * u + af.size * 1.25;
  const h = Math.max(textH + 30 * u, showQr ? o.qrSize : 0);
  const top = b.y + b.h - h;
  let svg = '';
  const ty = b.y + b.h - textH;
  svg += rect(b.x, ty - 30 * u, textW, Math.max(1.5, 2 * u), C.border);
  svg += lines([web], {
    family: 'sans',
    weight: 700,
    size: wf.size,
    leading: 1.25,
    x: b.x,
    y: ty,
    fill: C.navy,
  });
  svg += lines([addr], {
    family: 'sans',
    weight: 400,
    size: af.size,
    leading: 1.25,
    x: b.x,
    y: ty + wf.size * 1.25 + 8 * u,
    fill: C.inkMuted,
  });
  if (showQr)
    svg += qr(c.qr!, b.x + b.w - o.qrSize, b.y + b.h - o.qrSize, o.qrSize, C.ink, C.ground);
  return { svg: svg, h: b.y + b.h - top };
}

/** The building sketch in navy pen, filling a box from its lower left. */
function sketch(
  ctx: Ctx,
  b: Box,
  anchor: 'start' | 'end' = 'start',
): { defs: string; body: string } {
  const align = anchor === 'start' ? 'xMinYMax' : 'xMaxYMax';
  return {
    defs: `<mask id="pk" style="mask-type:alpha"><image href="${ctx.assets.sketch}" x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" preserveAspectRatio="${align} meet"/></mask>`,
    body: rect(b.x, b.y, b.w, b.h, C.navy, 'mask="url(#pk)" opacity="0.62"'),
  };
}

/** A fill-in form for the connect card: label in small capitals over a writing line. */
function form(b: Box, u: number, rowsWanted: string[]): string {
  const ls = 17 * u;
  const n = rowsWanted.length;
  const rowH = b.h / n;
  let svg = '';
  rowsWanted.forEach((label, i) => {
    const lineY = b.y + rowH * (i + 1) - 4 * u;
    svg += lines([label], {
      family: 'sans',
      weight: 700,
      tracking: 0.14,
      caps: true,
      size: ls,
      leading: 1,
      x: b.x,
      y: lineY - rowH + ls * 0.9 + 6 * u,
      fill: C.inkMuted,
    });
    svg += rect(b.x, lineY, b.w, Math.max(1.5, 2 * u), C.navyLight);
  });
  return svg;
}

// ── The two layouts ────────────────────────────────────────────────────────────

/**
 * Set the words in a box, smaller step by step until everything fits (the title
 * first gives way inside stack(); then the whole stack scales down). Warnings
 * come back only when even the smallest step does not fit.
 */
function fitWords(
  c: Content,
  f: Format,
  ctx: Ctx,
  u: number,
  box: Box,
  o: { align: 'top' | 'middle' | 'bottom'; body: boolean; scale: number; spare?: number },
): { svg: string; h: number; top: number; warnings: string[]; step: number } {
  const steps = [1, 0.9, 0.8, 0.72, 0.64];
  let last = { svg: '', h: 0, top: box.y, warnings: [] as string[], step: 1 };
  for (const step of steps) {
    const warnings: string[] = [];
    const k: Ctx2 = {
      u,
      measure: ctx.measure,
      warn: (s) => void (warnings.includes(s) || warnings.push(s)),
      label: f.label,
    };
    const ws = words(c, f, box.x, box.w, k, { body: o.body, scale: o.scale * step });
    const st = stack(ws, box, k, o.align, 34 * u * o.scale * step, o.spare ?? 0);
    if (st.over && !warnings.length)
      warnings.push(`There is too much to say on ${f.label}. Try fewer words.`);
    last = { svg: st.svg, h: st.h, top: st.top, warnings, step };
    if (!warnings.length) return last;
  }
  return last;
}

function render(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  // Narrow paper (the door hanger, the connect card) would set the body under 10 pt.
  const ps = f.print ? Math.max(1, (f.print.dpi * 0.14) / (30 * u)) : 1;
  const safe = safeBox(f);
  const dpi = f.print?.dpi ?? 0;
  // A little more margin than the safe line: a notice breathes.
  const pad = f.print ? 0.12 * dpi : f.shape === 'banner' ? 0 : 18 * u;
  const b: Box = { x: safe.x + pad, y: safe.y + pad, w: safe.w - 2 * pad, h: safe.h - 2 * pad };
  // The door hanger's hole: keep the top 2.4 inches (from the trim) clear.
  if (f.id === 'door-hanger') {
    const top = f.bleed + 2.4 * dpi;
    b.h -= top - b.y;
    b.y = top;
  }
  let defs = '';
  let body = rect(0, 0, f.w, f.h, C.ground);
  const tall = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  const yard = f.id === 'yard-sign';
  const thumb = f.id === 'youtube-thumb';
  const qrSize =
    f.print && c.qr ? Math.min((yard ? 2.6 : f.id === 'flyer' ? 1.15 : 0.95) * dpi, b.w * 0.24) : 0;
  const done = (warnings: string[]): Rendered => ({
    svg: doc(f, ctx.assets, defs, body),
    warnings,
  });

  if (tall) {
    const mast = masthead(ctx, b, 66 * u, u, true);
    body += mast.svg;
    const ft = foot(c, ctx, b, u, { address: true, qrSize });
    body += ft.svg;
    const top = b.y + mast.h + 56 * u;
    const bottom = b.y + b.h - ft.h - 56 * u;
    const region = bottom - top;
    if (c.photo) {
      // The gable over the slab. The words are set first, under a photo of the smallest
      // height; the photo then grows into whatever room the words leave.
      const drop = 26 * u;
      const gap = 56 * u;
      // A long notice first takes height from the photo (down to a strip), and only then
      // sets its words smaller, so print type never drops below a readable size for a picture.
      const maxPh = region * (f.shape === 'square' ? 0.42 : f.shape === 'tall' ? 0.6 : 0.5);
      let minPh = 0;
      let w0 = { h: 0, step: 1 };
      const shares = f.print ? [0.32, 0.26, 0.2, 0.16] : f.shape === 'square' ? [0.36] : [0.34];
      for (const share of shares) {
        minPh = region * share;
        const box0: Box = {
          x: b.x,
          y: top + minPh + drop + gap,
          w: b.w,
          h: region - minPh - drop - gap,
        };
        w0 = fitWords(c, f, ctx, u, box0, { align: 'bottom', body: true, scale: ps });
        if (w0.step === 1) break;
      }
      const ph = Math.max(minPh, Math.min(maxPh, region - w0.h - drop - gap));
      const pw = b.w * 0.9;
      defs += tilePattern('slab', ctx.assets.tileNavy, 300 * u);
      body += rect(
        b.x + b.w * 0.34,
        top + ph * 0.42,
        f.w - (b.x + b.w * 0.34),
        ph * 0.58 + drop,
        'url(#slab)',
      );
      body += shapedPhoto(c.photo, 'ph', { x: b.x, y: top, w: pw, h: ph }, gable(pw, ph));
      const wTop = top + ph + drop + gap;
      const ws = fitWords(
        c,
        f,
        ctx,
        u,
        { x: b.x, y: wTop, w: b.w, h: bottom - wTop },
        { align: 'middle', body: true, scale: ps },
      );
      body += ws.svg;
      return done(ws.warnings);
    }
    const sketchW = b.w;
    const sketchMax = sketchW * SKETCH_RATIO;
    const ws = fitWords(
      c,
      f,
      ctx,
      u,
      { x: b.x, y: top, w: b.w, h: region },
      { align: 'top', body: true, scale: ps, spare: sketchMax + 40 * u },
    );
    body += ws.svg;
    const free = bottom + 24 * u - (ws.top + ws.h + 48 * u);
    if (free > sketchMax * 0.45) {
      const sh = Math.min(free, sketchMax);
      const sk = sketch(ctx, { x: b.x, y: bottom + 24 * u - sh, w: sketchW, h: sh });
      defs += sk.defs;
      body += sk.body;
    }
    return done(ws.warnings);
  }

  // Banners (a page cover, the channel art): the words alone in the strip every screen shows,
  // the picture (or the sketch) to the right of them. The church's own name is already beside
  // these on Facebook and YouTube, so there is no masthead.
  if (f.shape === 'banner') {
    const split = 0.6;
    const colW = b.w * split - 24 * u;
    const ws = fitWords(
      c,
      f,
      ctx,
      u,
      { x: b.x, y: b.y, w: colW, h: b.h },
      { align: 'middle', body: false, scale: 1.8 },
    );
    if (c.photo) {
      const px = b.x + b.w * split + 24 * u;
      const pw = f.w - px;
      const step = Math.min(pw, f.h) * 0.07;
      body += shapedPhoto(c.photo, 'ph', { x: px, y: 0, w: pw, h: f.h }, stepped(pw, f.h, step));
    } else {
      const rx = b.x + b.w * split + 24 * u;
      const rw = b.x + b.w - rx;
      const sh = Math.min(b.h, rw * SKETCH_RATIO);
      const sk = sketch(ctx, { x: rx, y: b.y + (b.h + sh) / 2 - sh, w: rw, h: sh }, 'end');
      defs += sk.defs;
      body += sk.body;
    }
    body += ws.svg;
    return done(ws.warnings);
  }

  // Wide pieces: the masthead across the top, the words on the left, the picture on the right.
  // On a screen the picture runs off the top, right and bottom edges; on paper it keeps the margin.
  const formCard = c.kind === 'welcome' && f.id === 'connect-card';
  const bleedOut = !!c.photo && !f.print && !formCard;
  const split = formCard ? 0.5 : 0.56;
  const colW = b.w * split - 20 * u;
  const rightX = b.x + b.w * (split + 0.04);
  const rightW = b.x + b.w - rightX;
  const screenSketch = !c.photo && !f.print && !formCard;
  const leftW = bleedOut ? rightX - 64 * u - b.x : screenSketch ? colW : b.w;
  const mast = masthead(ctx, { ...b, w: leftW }, (thumb ? 52 : 58) * u, u, true);
  body += mast.svg;
  const showFoot = !thumb;
  const ft = showFoot
    ? foot(c, ctx, { ...b, w: leftW }, u, { address: !!f.print || f.id === 'slide', qrSize })
    : { svg: '', h: 0 };
  body += ft.svg;
  const top = b.y + mast.h + 48 * u;
  const bottom = b.y + b.h - (showFoot ? ft.h + 44 * u : 0);
  if (formCard) {
    body += form({ x: rightX, y: top, w: rightW, h: bottom - top }, u, [
      'Name',
      'Phone',
      'Email',
      'How can we pray for you?',
      '',
    ]);
  } else if (c.photo) {
    const py = bleedOut ? 0 : top;
    const pw = bleedOut ? f.w - rightX : rightW;
    const ph = bleedOut ? f.h : bottom - py;
    const step = Math.min(pw, ph) * 0.075;
    body += shapedPhoto(c.photo, 'ph', { x: rightX, y: py, w: pw, h: ph }, stepped(pw, ph, step));
  } else {
    // On a screen the sketch stands on the foot line, as wide as the right column allows;
    // on paper it sits above the foot, clear of the QR code.
    const sx = screenSketch ? b.x + b.w * 0.5 : rightX;
    const sw = b.x + b.w - sx;
    const sb = screenSketch ? b.y + b.h : bottom;
    const sh = Math.min(sb - top, sw * SKETCH_RATIO);
    const sk = sketch(ctx, { x: sx, y: sb - sh, w: sw, h: sh }, 'end');
    defs += sk.defs;
    body += sk.body;
  }
  const ws = fitWords(
    c,
    f,
    ctx,
    u,
    { x: b.x, y: top, w: colW, h: bottom - top },
    { align: f.print ? 'top' : 'middle', body: !thumb && !yard, scale: thumb ? 1.3 : ps },
  );
  body += ws.svg;
  return done(ws.warnings);
}

export const porch: Direction = {
  id: 'porch',
  name: 'Porch',
  summary:
    'The site’s light pages as a printed church notice: warm white paper, navy Young Serif, the mark and a navy rule at the head, the brick marker as the one red, photos in the gable or a stepped brick corner, and the building sketch when there is no photo.',
  render,
};
