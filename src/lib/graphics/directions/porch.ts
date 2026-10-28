// Safe to edit by hand
// =============================================================================
// Direction "Porch" for the graphics maker (2026-10-27, docs/agent/graphics.md).
// The Studio calls it "Light"; it is the default look.
// =============================================================================
// The site's light pages as a printed church notice. Warm white ground, navy ink:
// the words on one left edge (the brick marker beside the kicker, a big Young Serif
// title, a line of body, the times set as a timetable), and the church named on
// every piece. On a screen the name is a masthead (the full-colour mark, the name, a
// navy rule) and the foot carries the web address and the standing Sunday line. On
// paper and the story the name moves into a navy band at the foot (the white mark,
// the name, the web address), with the standing line, the street address and the QR
// code just above it. A photo takes one of the site's shapes: on a tall piece the
// building's gable over the red brick wall, on a wide one a corner stepped like the
// marker's bricks. With no photo the church's own building sketch, in navy pen on a
// ground line, fills the spare room. The brick marker is the one auburn thing.
//
// Floors (review panel, 2026-10-27): a title never drops under 8% of the short side
// (11% of the height on the slide, 20% on the yard sign); body, times and foot never
// under 26px at 1080 on a screen or about 11pt on paper. A long notice gives up photo
// height first, then lines of title, and only then warns.
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

/** The smallest sizes a piece may use, px (see the floors in the header). */
interface Mins {
  title: number;
  verse: number;
  body: number;
  /** Small capitals: the kicker, the masthead's second line. */
  small: number;
}

// ── Photos in the site's shapes ────────────────────────────────────────────────

/**
 * A photo cropped around its hotspot into a box, clipped to a polygon (box-relative
 * points). With no hotspot the crop leans above the middle (40%), where heads usually are.
 * `topCut` is how much of the box's top the shape cuts away (the gable's roof), so the
 * focus is centred in what is left.
 */
function shapedPhoto(p: Photo, id: string, b: Box, pts: [number, number][], topCut = 0): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.4;
  const cy = topCut + (b.h - topCut) / 2;
  const ox = Math.min(0, Math.max(b.w - dw, b.w / 2 - fx * dw));
  const oy = Math.min(0, Math.max(b.h - dh, cy - fy * dh));
  const poly = pts.map(([x, y]) => `${f1(b.x + x)},${f1(b.y + y)}`).join(' ');
  return (
    `<clipPath id="${id}"><polygon points="${poly}"/></clipPath>` +
    `<image href="${p.src}" x="${f1(b.x + ox)}" y="${f1(b.y + oy)}" width="${f1(dw)}" height="${f1(dh)}" clip-path="url(#${id})" preserveAspectRatio="none"/>`
  );
}

/** The building's front gable: the roof pitch is 24% of the box, as on the site. */
const pitchOf = (w: number, h: number) => Math.min(h * 0.24, w * 0.2);
const gable = (w: number, h: number): [number, number][] => {
  const pitch = pitchOf(w, h);
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

/**
 * The standing invitation for the foot ("Sundays: Sunday School 9:45 am, Worship 11:00 am"),
 * from `content.standing`. Kinds that are already about Sunday carry none.
 */
function standingLine(c: Content): string {
  if (c.kind === 'sunday' || c.kind === 'time-change' || c.kind === 'welcome') return '';
  const rows = (c.standing ?? []).map(splitWhen).filter((r) => r.a);
  if (!rows.length) return '';
  return `Sundays: ${rows.map((r) => (r.b ? `${r.b} ${r.a}` : r.a)).join(', ')}`;
}

interface Ctx2 {
  u: number;
  m: Mins;
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
  const fit = fitLine(
    text.toUpperCase(),
    font,
    w - mw - mgap,
    size,
    Math.min(size, k.m.small),
    k.measure,
  );
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
 * Details rows. `table`: the times as a timetable, the time in bold in its own column
 * and the gathering beside it, a hairline between rows. `leaders` (paper): the
 * gathering at the left, dot leaders, the time at the right ("Worship ...... 11:00 am").
 * `inline`: one line each, the bold part then the plain part ("Wednesday, December 24
 * 6:00 pm"). `lead` puts the brick marker before the first row (the verse's reference).
 * Rows never shrink below the body's floor: past that the stack says so.
 */
function detailsPiece(
  rows: { a: string; b: string }[],
  mode: 'table' | 'inline' | 'leaders',
  x: number,
  w: number,
  size: number,
  gap: number,
  k: Ctx2,
  lead = false,
): Piece | null {
  rows = rows.filter((r) => r.a || r.b);
  if (!rows.length) return null;
  if (mode === 'leaders' && rows.some((r) => !r.b)) mode = 'table';
  const strong = { family: 'sans' as const, weight: 700 };
  const soft = { family: 'sans' as const, weight: 400 };
  const mh = size * 0.95;
  const lx = lead ? markerWidth(mh) + size * 0.7 : 0;
  // Shrink together until every row fits the width, down to the body's floor.
  const floor = Math.min(size, k.m.body);
  let s = size;
  let colA = 0;
  const widthAt = (sz: number) => {
    const sp = sz * 0.75;
    colA = Math.max(...rows.map((r) => k.measure(r.a, { ...strong, size: sz })));
    return Math.max(
      ...rows.map((r) => {
        const aw = mode === 'table' ? colA : k.measure(r.a, { ...strong, size: sz });
        const bw = r.b ? k.measure(r.b, { ...soft, size: sz }) : 0;
        if (mode === 'leaders') return aw + bw + sz * 3;
        return lx + aw + (r.b ? sp + bw : 0);
      }),
    );
  };
  while (s * 0.97 >= floor && widthAt(s) > w) s *= 0.97;
  if (widthAt(s) > w) k.warn(`The times or date are too long for ${k.label}. Try fewer words.`);
  const sp = s * 0.75;
  const rowH = mode === 'inline' ? s * 1.4 : mode === 'leaders' ? s * 1.65 : s * 1.75;
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
        if (mode === 'leaders') {
          const bw = k.measure(r.b, { ...soft, size: s });
          const aw = k.measure(r.a, { ...strong, size: s });
          out += lines([r.b], { ...soft, size: s, x, y: ty, leading: 1, fill: C.ink });
          out += lines([r.a], {
            ...strong,
            size: s,
            x: x + w,
            y: ty,
            leading: 1,
            fill: C.navy,
            anchor: 'end',
          });
          const x1 = x + bw + s * 0.45;
          const x2 = x + w - aw - s * 0.45;
          const dy = ty + s * 0.8;
          if (x2 - x1 > s)
            out += `<line x1="${f1(x1)}" y1="${f1(dy)}" x2="${f1(x2)}" y2="${f1(dy)}" stroke="${C.inkMuted}" stroke-width="${f1(s * 0.11)}" stroke-linecap="round" stroke-dasharray="0 ${f1(s * 0.34)}"/>`;
          return;
        }
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

interface WordOpts {
  body: boolean;
  scale: number;
  /** Draw the kicker (the yard sign drops it). */
  kicker: boolean;
  /** Draw the times / date / reference rows (the yard sign drops them when room is short). */
  details: boolean;
  /** The times' size before scaling, px; defaults to a step above the body. */
  dsize?: number;
  /** Times as dot leaders (paper). */
  leaders: boolean;
}

function words(c: Content, f: Format, x: number, w: number, k: Ctx2, o: WordOpts): Words {
  const u = k.u * o.scale;
  const kicker = cleanText(c.kicker);
  const before: Piece[] = [];
  if (o.kicker && kicker && c.kind !== 'verse')
    before.push(kickerPiece(kicker, x, w, Math.max(26 * u, k.m.small), 34 * u, k));

  const bodyText = o.body ? cleanText(c.body) : '';
  const bodyMax = Math.max(31 * u, k.m.body);
  const body = (): Piece | null => {
    if (!bodyText) return null;
    const font: FontSpec = { family: 'sans', size: bodyMax, weight: 400 };
    const r = fitText(
      bodyText,
      {
        family: 'sans',
        weight: 400,
        maxW: Math.min(w, Math.max(860 * u, bodyMax * 26)),
        maxH: bodyMax * 1.42 * 4,
        maxLines: 4,
        max: bodyMax,
        min: k.m.body,
        leading: 1.42,
      },
      k.measure,
    );
    if (r.overflow)
      k.warn(`The words under the title are too long for ${k.label}. Try fewer words.`);
    return textPiece(r, font, x, 1.42, C.inkMuted, 40 * u);
  };
  // The times come right after the title in importance: never smaller than the body.
  const dsize = Math.max((o.dsize ?? 34 * k.u) * o.scale, bodyMax * 1.06);
  const date = cleanText(c.date);
  const times = (c.when ?? []).map(cleanText).filter(Boolean);
  const after: (Piece | null)[] = [];
  const det = (p: () => Piece | null) => (o.details ? p() : null);
  const tableW = Math.min(w, Math.max(760 * u, dsize * 22));
  switch (c.kind) {
    case 'sunday':
    case 'welcome':
      after.push(
        body(),
        det(() =>
          detailsPiece(
            times.map(splitWhen),
            o.leaders ? 'leaders' : 'table',
            x,
            tableW,
            dsize,
            0,
            k,
          ),
        ),
      );
      break;
    case 'event':
    case 'announcement':
    case 'time-change':
      after.push(
        det(() =>
          detailsPiece([{ a: date, b: times.join(', ') }], 'inline', x, w, dsize, 30 * u, k),
        ),
        body(),
      );
      break;
    case 'sermon':
      after.push(
        det(() =>
          detailsPiece(
            [{ a: cleanText(c.reference), b: cleanText(c.speaker) }],
            'inline',
            x,
            w,
            dsize,
            0,
            k,
          ),
        ),
      );
      break;
    case 'verse':
      after.push(
        det(() =>
          detailsPiece(
            [{ a: cleanText(c.reference), b: cleanText(c.translation) }],
            'inline',
            x,
            w,
            dsize,
            0,
            k,
            true,
          ),
        ),
      );
      break;
  }
  const verse = c.kind === 'verse';
  const base =
    (verse
      ? f.shape === 'tall'
        ? 84
        : 74
      : f.shape === 'tall'
        ? 150
        : f.shape === 'square'
          ? 112
          : 128) * u;
  const min = verse ? k.m.verse : k.m.title;
  return {
    before,
    title: {
      text: verse ? `“${cleanText(c.title)}”` : cleanText(c.title),
      max: Math.max(base, min * 1.2),
      min,
      maxLines: verse ? 9 : 4,
      leading: verse ? 1.18 : 1.04,
    },
    after: after.filter((p): p is Piece => !!p),
  };
}

/**
 * Fit the stack into a box: the fixed pieces first, then the title as large as the
 * room left allows (from its maximum down to its floor, breaking onto more balanced
 * lines on the way). Returns the drawing and the height used, placed at the top,
 * middle or bottom of the box.
 */
function stack(
  ws: Words,
  box: Box,
  k: Ctx2,
  align: 'top' | 'middle' | 'bottom',
  titleGap: number,
  /** Room to keep free for something else (the sketch), when it can be spared. */
  spare = 0,
): { svg: string; h: number; top: number; over: boolean; size: number; goal: number } {
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
  return {
    svg,
    h: used,
    top,
    over: r.overflow || used > box.h + 1,
    size: r.size,
    // A confident title: most of its maximum, or half again its floor.
    goal: Math.min(t.max * 0.8, t.min * 1.5),
  };
}

// ── The frame: masthead, foot, band, sketch ────────────────────────────────────

/** The masthead (screens): the mark, "First Baptist" over "CHURCH OF AUBURN", a navy rule. */
function masthead(
  ctx: Ctx,
  b: Box,
  size: number,
  u: number,
  m: Mins,
  rule = true,
): { svg: string; h: number } {
  const { church } = ctx;
  const n2 = Math.max(size * 0.24, m.small);
  // The second line must sit inside the mark's height: grow the mark if the floor asks.
  size = Math.max(size, n2 / 0.3);
  const n1 = size * 0.5;
  const tx = b.x + size + size * 0.3;
  let svg = image(ctx.assets.markColor, b.x, b.y, size, size);
  svg += lines([church.line1], {
    family: 'serif',
    size: n1,
    leading: 1,
    x: tx,
    y: b.y + size * 0.04,
    fill: C.navy,
  });
  svg += lines([church.line2], {
    family: 'sans',
    weight: 700,
    tracking: 0.12,
    caps: true,
    size: n2,
    leading: 1,
    x: tx,
    y: b.y + size - n2 * 1.02,
    fill: C.navy,
  });
  if (!rule) return { svg, h: size };
  const ruleY = b.y + size + 26 * u;
  const rh = Math.max(2, 3 * u);
  svg += rect(b.x, ruleY, b.w, rh, C.navy);
  return { svg, h: ruleY + rh - b.y };
}

/**
 * The foot on a screen: a hairline, the web address in bold, and under it the standing
 * Sunday line (or the place). The slide leaves the street address off: a projector
 * needs the title and the times.
 */
function footScreen(
  c: Content,
  ctx: Ctx,
  b: Box,
  u: number,
  m: Mins,
  o: { address?: boolean; qrSize?: number } = {},
): { svg: string; h: number } {
  const { church, measure } = ctx;
  const web = cleanText(c.link) || church.web;
  const rest = [standingLine(c), o.address && church.address ? church.address : ''].filter(Boolean);
  if (!rest.length) rest.push(church.place);
  const qs = o.qrSize ?? 0;
  const textW = b.w - (qs ? qs + 40 * u : 0);
  const ws = Math.max(30 * u, m.body * 1.08);
  const wf = fitLine(web, { family: 'sans', weight: 700 }, textW, ws, ws * 0.8, measure);
  const fits = rest.map((t) =>
    fitLine(t, { family: 'sans', weight: 400 }, textW, m.body, m.body * 0.85, measure),
  );
  const textH = wf.size * 1.25 + fits.reduce((s, ft) => s + 8 * u + ft.size * 1.25, 0);
  const ty = b.y + b.h - textH;
  let svg = rect(b.x, ty - 30 * u, textW, Math.max(1.5, 2 * u), C.border);
  svg += lines([web], {
    family: 'sans',
    weight: 700,
    size: wf.size,
    leading: 1.25,
    x: b.x,
    y: ty,
    fill: C.navy,
  });
  let y = ty + wf.size * 1.25;
  rest.forEach((t, i) => {
    y += 8 * u;
    svg += lines([t], {
      family: 'sans',
      weight: 400,
      size: fits[i].size,
      leading: 1.25,
      x: b.x,
      y,
      fill: C.inkMuted,
    });
    y += fits[i].size * 1.25;
  });
  if (qs) svg += qr(c.qr!, b.x + b.w - qs, b.y + b.h - qs, qs, C.ink, C.ground);
  return { svg, h: Math.max(textH + 30 * u, qs) };
}

/**
 * The navy band (paper and the story): the white mark, the name and the web address,
 * run off the bottom and both sides. Its words end at the box's bottom edge; the band
 * shows as much navy above them as below. Narrow pieces put the web address under the name.
 */
function band(
  c: Content,
  ctx: Ctx,
  f: Format,
  b: Box,
  markSize: number,
  m: Mins,
  webMin: number,
): { svg: string; top: number } {
  const { church, measure } = ctx;
  const web = cleanText(c.link) || church.web;
  const ms = markSize;
  const n1 = ms * 0.46;
  const n2 = Math.max(ms * 0.2, m.small);
  const tx = b.x + ms * 1.28;
  const nameW = Math.max(
    measure(church.line1, { family: 'serif', size: n1 }),
    measure(church.line2, { family: 'sans', size: n2, weight: 700, tracking: 0.12, caps: true }),
  );
  const wfont = { family: 'sans' as const, weight: 700 };
  const wsize = Math.max(ms * 0.32, webMin);
  const room = b.x + b.w - (tx + nameW + ms * 0.6);
  const oneRow = measure(web, { ...wfont, size: wsize }) <= room;
  const contentH = oneRow ? ms : ms + ms * 0.32 + wsize * 1.1;
  const top = b.y + b.h - contentH;
  const below = f.h - f.bleed - (b.y + b.h);
  const pad = Math.min(below, ms * 0.7);
  const bandTop = top - pad;
  let svg = rect(0, bandTop, f.w, f.h - bandTop, C.navy);
  svg += image(ctx.assets.markWhite, b.x, top, ms, ms);
  svg += lines([church.line1], {
    family: 'serif',
    size: n1,
    leading: 1,
    x: tx,
    y: top + ms * 0.06,
    fill: C.white,
  });
  svg += lines([church.line2], {
    family: 'sans',
    weight: 700,
    tracking: 0.12,
    caps: true,
    size: n2,
    leading: 1,
    x: tx,
    y: top + ms - n2 * 1.02,
    fill: C.white,
  });
  if (oneRow) {
    svg += lines([web], {
      ...wfont,
      size: wsize,
      leading: 1,
      x: b.x + b.w,
      y: top + (ms - wsize) / 2,
      fill: C.white,
      anchor: 'end',
    });
  } else {
    const fit = fitLine(web, wfont, b.w, wsize, wsize * 0.75, measure);
    svg += lines([web], {
      ...wfont,
      size: fit.size,
      leading: 1,
      x: b.x,
      y: b.y + b.h - fit.size * 1.05,
      fill: C.white,
    });
  }
  return { svg, top: bandTop };
}

/**
 * The paper foot above the band: the standing Sunday line in bold, the street address
 * under it, the QR code to the right. Bottom edge at `bottom`. Returns the height used.
 */
function footPaper(
  c: Content,
  ctx: Ctx,
  x: number,
  w: number,
  bottom: number,
  u: number,
  m: Mins,
  o: { address: boolean; qrSize: number; standing: boolean },
): { svg: string; h: number } {
  const { church, measure } = ctx;
  const items: { text: string; weight: number; fill: string }[] = [];
  const st = o.standing ? standingLine(c) : '';
  if (st) items.push({ text: st, weight: 700, fill: C.navy });
  if (o.address && church.address)
    items.push({ text: church.address, weight: 400, fill: C.inkMuted });
  const showQr = o.qrSize > 0;
  if (!items.length && !showQr) return { svg: '', h: 0 };
  const textW = w - (showQr ? o.qrSize + 40 * u : 0);
  const size = m.body;
  let svg = '';
  const fits = items.map((it) =>
    fitLine(it.text, { family: 'sans', weight: it.weight }, textW, size, size * 0.85, measure),
  );
  const textH = fits.reduce((s, ft) => s + ft.size * 1.35, 0);
  let y = bottom - textH;
  items.forEach((it, i) => {
    svg += lines([it.text], {
      family: 'sans',
      weight: it.weight,
      size: fits[i].size,
      leading: 1.35,
      x,
      y,
      fill: it.fill,
    });
    y += fits[i].size * 1.35;
  });
  if (items.length) svg += rect(x, bottom - textH - 24 * u, textW, Math.max(1.5, 2 * u), C.border);
  if (showQr) svg += qr(c.qr!, x + w - o.qrSize, bottom - o.qrSize, o.qrSize, C.ink, C.ground);
  return { svg, h: Math.max(items.length ? textH + 24 * u : 0, o.qrSize) };
}

/** The building sketch in navy pen, standing on a ground line at the foot of a box. */
function sketch(
  ctx: Ctx,
  b: Box,
  u: number,
  anchor: 'start' | 'end' = 'start',
): { defs: string; body: string } {
  const align = anchor === 'start' ? 'xMinYMax' : 'xMaxYMax';
  const t = Math.max(1.5, 2.5 * u);
  const ih = b.h - t * 3;
  const dw = Math.min(b.w, ih / SKETCH_RATIO);
  const gx = anchor === 'start' ? b.x : b.x + b.w - dw;
  return {
    defs: `<mask id="pk" style="mask-type:alpha"><image href="${ctx.assets.sketch}" x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(ih)}" preserveAspectRatio="${align} meet"/></mask>`,
    body:
      rect(b.x, b.y, b.w, ih, C.navyMid, 'mask="url(#pk)"') +
      rect(gx + dw * 0.04, b.y + b.h - t, dw * 0.86, t, C.navyMid),
  };
}

/** A fill-in form for the connect card: label in small capitals over a writing line. */
function form(b: Box, u: number, size: number, rowsWanted: string[]): string {
  const ls = size;
  const n = rowsWanted.length;
  const rowH = b.h / n;
  let svg = '';
  rowsWanted.forEach((label, i) => {
    const lineY = b.y + rowH * (i + 1) - 4 * u;
    svg += lines([label], {
      family: 'sans',
      weight: 700,
      tracking: 0.12,
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

/** The door hanger's hole, as a guide: a 1.25 in circle 1 in below the top trim, slit to the edge. */
function hangerHole(f: Format): string {
  const dpi = f.print!.dpi;
  const cx = f.w / 2;
  const cy = f.bleed + 1 * dpi;
  const r = 0.625 * dpi;
  const sw = Math.max(2, 0.012 * dpi);
  const dash = `stroke-dasharray="${f1(0.06 * dpi)} ${f1(0.04 * dpi)}"`;
  return (
    `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="none" stroke="${C.navyLight}" stroke-width="${f1(sw)}" ${dash}/>` +
    `<line x1="${f1(cx)}" y1="${f1(cy - r)}" x2="${f1(cx)}" y2="0" stroke="${C.navyLight}" stroke-width="${f1(sw)}" ${dash}/>`
  );
}

// ── The layouts ────────────────────────────────────────────────────────────────

interface Fitted {
  svg: string;
  h: number;
  top: number;
  warnings: string[];
  step: number;
  /** The title's size, and the size that reads as confident. */
  size: number;
  goal: number;
}

/**
 * Set the words in a box, smaller step by step until everything fits (the title
 * first gives way inside stack(); then the whole stack scales down to its floors).
 * Warnings come back only when even the smallest step does not fit.
 */
function fitWords(
  c: Content,
  f: Format,
  ctx: Ctx,
  u: number,
  m: Mins,
  box: Box,
  o: {
    align: 'top' | 'middle' | 'bottom';
    spare?: number;
    dropDetails?: boolean;
  } & Partial<WordOpts>,
): Fitted {
  const first = fitSteps(c, f, ctx, u, m, box, o);
  if (!first.warnings.length) return first;
  // The title and the times matter most: let the words under the title go first, and on
  // the pieces that can spare them (a pew card, a banner, the yard sign), then the times.
  const tries: Partial<WordOpts>[] = [];
  if (o.body !== false && cleanText(c.body)) tries.push({ body: false });
  if (o.dropDetails) tries.push({ body: false, details: false });
  for (const t of tries) {
    const r = fitSteps(c, f, ctx, u, m, box, { ...o, ...t });
    if (r.warnings.length) continue;
    r.warnings.push(
      t.details === false
        ? `Only the title fits on ${f.label}, so the rest is left off. Try fewer words.`
        : `The words under the title did not fit on ${f.label}, so they are left off. Try fewer words.`,
    );
    return r;
  }
  return first;
}

function fitSteps(
  c: Content,
  f: Format,
  ctx: Ctx,
  u: number,
  m: Mins,
  box: Box,
  o: { align: 'top' | 'middle' | 'bottom'; spare?: number } & Partial<WordOpts>,
): Fitted {
  const steps = [1, 0.9, 0.8, 0.72, 0.64];
  let last: Fitted = { svg: '', h: 0, top: box.y, warnings: [], step: 1, size: 0, goal: 0 };
  for (const step of steps) {
    const warnings: string[] = [];
    const k: Ctx2 = {
      u,
      m,
      measure: ctx.measure,
      warn: (s) => void (warnings.includes(s) || warnings.push(s)),
      label: f.label,
    };
    const scale = (o.scale ?? 1) * step;
    const ws = words(c, f, box.x, box.w, k, {
      body: o.body ?? true,
      kicker: o.kicker ?? true,
      details: o.details ?? true,
      leaders: o.leaders ?? false,
      dsize: o.dsize,
      scale,
    });
    const st = stack(ws, box, k, o.align, 34 * u * scale, o.spare ?? 0);
    if (st.over && !warnings.length)
      warnings.push(`There is too much to say on ${f.label}. Try fewer words.`);
    last = { svg: st.svg, h: st.h, top: st.top, warnings, step, size: st.size, goal: st.goal };
    if (!warnings.length) return last;
  }
  return last;
}

function render(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  const safe = safeBox(f);
  const dpi = f.print?.dpi ?? 0;
  const short = Math.min(f.w, f.h) - 2 * f.bleed;
  const sx = short / 1080;
  const yard = f.id === 'yard-sign';
  const slide = f.id === 'slide';
  const thumb = f.id === 'youtube-thumb';
  const hanger = f.id === 'door-hanger';
  // The floors (header). On paper about 11 pt for reading type, 9 pt for small capitals.
  const m: Mins = {
    title: yard ? 0.2 * (f.h - 2 * f.bleed) : slide ? 0.11 * f.h : (f.print ? 0.06 : 0.08) * short,
    verse: (yard ? 0.1 : 0.055) * short,
    body: f.print ? 0.153 * dpi : 26 * sx,
    small: f.print ? 0.125 * dpi : 22 * sx,
  };
  // A little more margin than the safe line: a notice breathes.
  const pad = f.print ? 0.12 * dpi : f.shape === 'banner' ? 0 : 18 * u;
  const b: Box = { x: safe.x + pad, y: safe.y + pad, w: safe.w - 2 * pad, h: safe.h - 2 * pad };
  let defs = '';
  let body = rect(0, 0, f.w, f.h, C.ground);
  // The door hanger's hole: the words start below it (it ends 1 5/8 in from the trim).
  if (hanger) {
    const top = f.bleed + 1.95 * dpi;
    b.h -= top - b.y;
    b.y = top;
    body += hangerHole(f);
  }
  const tall = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  const card = f.id === 'connect-card';
  const useBand = !!f.print && !card;
  const qrSize =
    f.print && c.qr && !yard
      ? Math.min((f.id === 'flyer' ? 1.15 : card ? 0.75 : 0.85) * dpi, b.w * 0.24)
      : 0;
  const done = (warnings: string[]): Rendered => ({
    svg: doc(f, ctx.assets, defs, body),
    warnings,
  });

  /** The navy band and the paper foot above it; returns the bottom of the room left. */
  const bandAndFoot = (
    fx: number,
    fw: number,
    o: { address: boolean; qr: number },
  ): { bottom: number; above: number } => {
    const ms = f.print ? (yard ? 0.11 * (f.h - 2 * f.bleed) : 0.6 * dpi) : 100 * u;
    const webMin = yard ? 0.045 * (f.h - 2 * f.bleed) : m.body * 1.05;
    const bd = band(c, ctx, f, b, ms, m, webMin);
    const gap = (f.print ? 0.18 * dpi : 48 * u) * (yard ? 0.8 : 1);
    const fp = footPaper(c, ctx, fx, fw, bd.top - gap, u, m, {
      address: o.address,
      qrSize: o.qr,
      standing: !yard,
    });
    body += fp.svg + bd.svg;
    return { bottom: bd.top - gap - (fp.h ? fp.h + gap : 0), above: bd.top - gap };
  };

  // ── The yard sign: the name, a huge title, the times if they fit, one web address. ──
  if (yard) {
    const bottom = bandAndFoot(b.x, b.w, { address: false, qr: 0 }).bottom;
    const box: Box = { x: b.x, y: b.y, w: b.w, h: bottom - b.y - 0.1 * dpi };
    const base = { align: 'middle' as const, body: false, kicker: false, scale: 1.6 };
    let ws = fitWords(c, f, ctx, u, m, box, {
      ...base,
      dsize: (0.055 * (f.h - 2 * f.bleed)) / 1.6,
    });
    if (ws.warnings.length) ws = fitWords(c, f, ctx, u, m, box, { ...base, details: false });
    body += ws.svg;
    return done(ws.warnings);
  }

  if (tall) {
    let top = b.y;
    let bottom = b.y + b.h;
    if (useBand) {
      bottom = bandAndFoot(b.x, b.w, { address: true, qr: qrSize }).bottom - 40 * u;
    } else {
      const mast = masthead(ctx, b, 72 * u, u, m);
      body += mast.svg;
      top += mast.h + 56 * u;
      const ft = footScreen(c, ctx, b, u, m);
      body += ft.svg;
      bottom -= ft.h + 56 * u;
    }
    const region = bottom - top;
    const leaders = !!f.print;
    if (c.photo) {
      // The gable over the brick wall. The words are set first, under a photo of the
      // smallest height that lets them keep their floors; the photo then grows into
      // whatever room the words leave.
      const drop = 26 * u;
      const gap = 56 * u;
      const maxPh = region * (f.shape === 'square' ? 0.42 : f.shape === 'tall' ? 0.5 : 0.48);
      let minPh = 0;
      let w0 = { h: 0, warnings: [] as string[], size: 0, goal: 0 };
      for (const share of [0.38, 0.32, 0.26, 0.2, 0.15, 0.11]) {
        minPh = region * share;
        const box0: Box = {
          x: b.x,
          y: top + minPh + drop + gap,
          w: b.w,
          h: region - minPh - drop - gap,
        };
        w0 = fitWords(c, f, ctx, u, m, box0, { align: 'bottom', leaders });
        if (!w0.warnings.length && w0.size >= w0.goal - 0.5) break;
      }
      const ph = Math.max(minPh, Math.min(maxPh, region - w0.h - drop - gap));
      const pw = b.w * 0.9;
      defs += tilePattern('slab', ctx.assets.tileWall, 300 * u);
      body += rect(
        b.x + b.w * 0.34,
        top + ph * 0.42,
        f.w - (b.x + b.w * 0.34),
        ph * 0.58 + drop,
        'url(#slab)',
      );
      body += shapedPhoto(
        c.photo,
        'ph',
        { x: b.x, y: top, w: pw, h: ph },
        gable(pw, ph),
        pitchOf(pw, ph),
      );
      const wTop = top + ph + drop + gap;
      const ws = fitWords(
        c,
        f,
        ctx,
        u,
        m,
        { x: b.x, y: wTop, w: b.w, h: bottom - wTop },
        { align: hanger ? 'top' : 'middle', leaders },
      );
      body += ws.svg;
      return done(ws.warnings);
    }
    const sketchMax = b.w * SKETCH_RATIO;
    const ws = fitWords(
      c,
      f,
      ctx,
      u,
      m,
      { x: b.x, y: top, w: b.w, h: region },
      { align: 'top', leaders, spare: sketchMax + 40 * u },
    );
    body += ws.svg;
    const free = bottom - (ws.top + ws.h + 48 * u);
    if (free > sketchMax * 0.45) {
      const sh = Math.min(free, sketchMax);
      const sk = sketch(ctx, { x: b.x, y: bottom - sh, w: b.w, h: sh }, u);
      defs += sk.defs;
      body += sk.body;
    }
    return done(ws.warnings);
  }

  // Banners (a page cover, the channel art): the strip every screen shows holds the
  // name at the top, the words, and the web address at the foot; the picture (or the
  // sketch) sits to the right of them.
  if (f.shape === 'banner') {
    m.title = 0.15 * b.h;
    m.verse = 0.1 * b.h;
    const split = 0.6;
    const colW = b.w * split - 24 * u;
    const mast = masthead(ctx, { ...b, w: colW }, b.h * 0.15, u, { ...m, small: 0 }, false);
    body += mast.svg;
    const web = cleanText(c.link) || ctx.church.web;
    const wsz = b.h * 0.07;
    body += lines([web], {
      family: 'sans',
      weight: 700,
      size: wsz,
      leading: 1,
      x: b.x,
      y: b.y + b.h - wsz,
      fill: C.navy,
    });
    const wTop = b.y + mast.h + b.h * 0.07;
    const ws = fitWords(
      c,
      f,
      ctx,
      u,
      m,
      { x: b.x, y: wTop, w: colW, h: b.y + b.h - wsz - b.h * 0.07 - wTop },
      { align: 'middle', body: false, scale: 1.8, dropDetails: true },
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
      const sk = sketch(ctx, { x: rx, y: b.y + (b.h + sh) / 2 - sh, w: rw, h: sh }, u, 'end');
      defs += sk.defs;
      body += sk.body;
    }
    body += ws.svg;
    return done(ws.warnings);
  }

  // Wide pieces: the words on the left, the picture on the right. On a screen the masthead
  // runs across the top and the foot under the words, and the picture runs off the top,
  // right and bottom edges; on paper the band closes the piece and the picture keeps the margin.
  const formCard = c.kind === 'welcome' && f.id === 'connect-card';
  const bleedOut = !!c.photo && !f.print && !formCard;
  const split = formCard ? 0.5 : 0.56;
  const colW = b.w * split - 20 * u;
  const rightX = b.x + b.w * (split + 0.04);
  const rightW = b.x + b.w - rightX;
  const screenSketch = !c.photo && !f.print && !formCard;
  let top = b.y;
  let bottom = b.y + b.h;
  /** Where the right column (photo, form, sketch) ends. */
  let rightBottom = bottom;
  if (useBand) {
    const bf = bandAndFoot(b.x, colW, { address: true, qr: qrSize });
    bottom = bf.bottom - 40 * u;
    rightBottom = bf.above;
  } else {
    const leftW = bleedOut ? rightX - 64 * u - b.x : colW;
    const mast = masthead(ctx, { ...b, w: leftW }, (thumb ? 60 : card ? 54 : 64) * u, u, m);
    body += mast.svg;
    top += mast.h + (card ? 36 : 48) * u;
    if (slide) {
      // A projector needs the title and the times: the web address rides on the masthead row.
      const web = cleanText(c.link) || ctx.church.web;
      const wf = fitLine(
        web,
        { family: 'sans', weight: 700 },
        leftW * 0.5,
        m.body * 1.1,
        m.body * 0.85,
        ctx.measure,
      );
      body += lines([web], {
        family: 'sans',
        weight: 700,
        size: wf.size,
        leading: 1,
        x: b.x + leftW,
        y: b.y + 64 * u - wf.size * 1.02,
        fill: C.navy,
        anchor: 'end',
      });
    } else {
      const ft = footScreen(c, ctx, { ...b, w: card ? b.w : leftW }, u, m, {
        address: card,
        qrSize: card ? qrSize : 0,
      });
      body += ft.svg;
      bottom -= ft.h + (card ? 36 : 44) * u;
    }
    rightBottom = bottom;
  }
  if (formCard) {
    body += form({ x: rightX, y: top, w: rightW, h: rightBottom - top }, u, m.small, [
      'Name',
      'Phone',
      'Email',
      'How can we pray for you?',
      '',
    ]);
  } else if (c.photo) {
    const py = bleedOut ? 0 : top;
    const pw = bleedOut ? f.w - rightX : rightW;
    const ph = bleedOut ? f.h : rightBottom - py;
    const step = Math.min(pw, ph) * 0.075;
    body += shapedPhoto(c.photo, 'ph', { x: rightX, y: py, w: pw, h: ph }, stepped(pw, ph, step));
  } else {
    // On a screen the sketch stands on the foot line in the right column, clear of the
    // foot's rule; on paper it sits above the foot.
    const sb = screenSketch ? b.y + b.h : rightBottom;
    const sh = Math.min(sb - top, rightW * SKETCH_RATIO);
    const sk = sketch(ctx, { x: rightX, y: sb - sh, w: rightW, h: sh }, u, 'end');
    defs += sk.defs;
    body += sk.body;
  }
  const ws = fitWords(
    c,
    f,
    ctx,
    u,
    m,
    { x: b.x, y: top, w: colW, h: bottom - top },
    {
      align: f.print ? 'top' : 'middle',
      body: !thumb && !slide,
      scale: thumb ? 1.3 : 1,
      leaders: !!f.print,
      dsize: slide ? 0.05 * f.h : undefined,
      dropDetails: card,
    },
  );
  body += ws.svg;
  return done(ws.warnings);
}

export const porch: Direction = {
  id: 'porch',
  name: 'Porch',
  summary:
    'The site’s light pages as a printed church notice: warm white paper, a big navy Young Serif title, the times as a timetable, the church named on every piece (a masthead on screens, a navy band on paper), the brick marker as the one red, photos in the gable over the brick wall or a stepped brick corner, and the building sketch when there is no photo.',
  render,
};
