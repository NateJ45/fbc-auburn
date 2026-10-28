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
// (11% of the height on the slide, 20% on the yard sign). Research pass (2026-10-28):
// body, times, the address and the web address never under 42px on a 1080 feed post
// (4% of the width), 60px on the slide, about 11pt on paper. A long notice says less
// first (the sentence, then the kicker), never shrinks under a floor, and only then warns.
// A story keeps words out of the top 270px and bottom 380px; the door hanger keeps its
// top 2.5 in plain; QR codes carry at least 0.8 in of squares, with their label and web
// address beside them.
// =============================================================================

import qrcode from 'qrcode-generator';
import { QUIET_ZONE } from '../../qr.ts';
import { qrLabelFor } from '../content.ts';
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
 * points). With no hotspot the crop leans above the middle (35%), where heads usually are.
 * `topCut` is how much of the box's top the shape cuts away (the gable's roof), so the
 * focus is centred in what is left.
 */
function shapedPhoto(p: Photo, id: string, b: Box, pts: [number, number][], topCut = 0): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.35;
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

/**
 * Times stay whole on a line: "11:00 am" never breaks before the "am". The space becomes a word joiner (not whitespace, so the
 * line breaker keeps the pair) and goes back to a space when drawn.
 */
const GLUE = '⁠';
const AMPM = '(?:am|pm|a\\.m\\.|p\\.m\\.)';
/**
 * Keep-together rules (research pass, 2026-10-28): a time stays whole ("11:00 am"), and a
 * time keeps the word before it ("Worship, 11:00 am" never breaks after the comma).
 */
const glue = (s: string) =>
  s
    .replace(
      new RegExp(`(\\d)\\s+(${AMPM})(?=\\W|$)`, 'gi'),
      (_, d: string, ap: string) => d + GLUE + ap,
    )
    .replace(
      new RegExp(`([^\\s,]+,?)\\s+(\\d{1,2}(?::\\d\\d)?${GLUE}${AMPM})`, 'gi'),
      (_, w: string, t: string) => w + GLUE + t,
    );
/**
 * A title never leaves a short word at a line end ("The / Sermon on / the Mount"): small
 * words are joined to the word after them, so they start the next line instead.
 */
const glueTitle = (s: string) =>
  glue(s).replace(
    /\b(a|an|the|of|on|in|at|to|and|for|by|or|our|with|is|my|your)\s+(?=\S)/gi,
    (_, w: string) => w + GLUE,
  );
/** An address breaks only at its commas: "4241 Hamilton-Scipio Road," / "Hamilton, OH 45013". */
const glueAddress = (s: string) =>
  s
    .split(/,\s*/)
    .map((seg) => seg.trim().replace(/\s+/g, GLUE))
    .join(', ');
const unglue = (ls: string[]) => ls.map((l) => l.split(GLUE).join(' '));
/** The street and town only ("4241 Hamilton-Scipio Road, Hamilton"), for a social foot. */
const shortAddress = (a: string) => a.split(',').slice(0, 2).join(',').trim();

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/**
 * "Wednesday, December 24" and "6:00 pm" to "Dec 24, 6 pm": the yard sign's when, in as
 * few words as a driver can take in.
 */
function shortWhen(date: string, times: string[]): string {
  const parts: string[] = [];
  const md = date.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/i,
  );
  if (md) {
    const mon = MONTHS[MONTHS.indexOf(md[1].toLowerCase())];
    parts.push(`${mon[0].toUpperCase()}${mon.slice(1)} ${md[2]}`);
  } else if (date) parts.push(date.replace(/,?\s*\d{1,2}(:\d\d)?\s*(am|pm).*$/i, ''));
  const tm = [date, ...times].join(' ').match(/\b(\d{1,2})(?::(\d\d))?\s*(am|pm)\b/i);
  if (tm)
    parts.push(`${tm[1]}${tm[2] && tm[2] !== '00' ? ':' + tm[2] : ''} ${tm[3].toLowerCase()}`);
  return parts.filter(Boolean).join(', ');
}

/**
 * A web address too long for its line breaks once, after the host ("firstauburn.org/"
 * over "plan-your-visit"), never mid-word.
 */
function webLines(
  web: string,
  font: Omit<FontSpec, 'size'>,
  size: number,
  maxW: number,
  measure: Measure,
): string[] {
  if (measure(web, { ...font, size }) <= maxW) return [web];
  const i = web.indexOf('/');
  if (i < 0 || i === web.length - 1) return [web];
  return [web.slice(0, i + 1), web.slice(i + 1)];
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
  // Each "label time" unit is glued whole, so a line only breaks between gatherings.
  const unit = (r: { a: string; b: string }) => (r.b ? `${r.b} ${r.a}` : r.a).replace(/\s+/g, GLUE);
  return `Sundays: ${rows.map(unit).join(', ')}`;
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
    draw: (y) => lines(unglue(r.lines), { ...font, size: r.size, x, y, leading, fill }),
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
        const aw = mode === 'table' ? colA : r.a ? k.measure(r.a, { ...strong, size: sz }) : 0;
        const bw = r.b ? k.measure(r.b, { ...soft, size: sz }) : 0;
        if (mode === 'leaders') return aw + bw + sz * 3;
        return lx + aw + (r.b ? (r.a ? sp : 0) + bw : 0);
      }),
    );
  };
  while (s * 0.97 >= floor && widthAt(s) > w) s *= 0.97;
  // An inline row that does not fit at the floor goes onto two lines (the date over the
  // time, the passage over the preacher) rather than shrinking past it (research pass).
  if (mode === 'inline' && widthAt(s) > w && rows.some((r) => r.a && r.b)) {
    rows = rows.flatMap((r) =>
      r.a && r.b
        ? [
            { a: r.a, b: '' },
            { a: '', b: r.b },
          ]
        : [r],
    );
    s = size;
    while (s * 0.97 >= floor && widthAt(s) > w) s *= 0.97;
  }
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
          const bx = !r.a
            ? x + lx
            : x + lx + (mode === 'table' ? colA : k.measure(r.a, { ...strong, size: s })) + sp;
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
      glue(bodyText),
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
      : f.id === 'story'
        ? 196
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
    (ls.length > 1 && ls.some((l) => !l.includes(' ') && l.replace(/\W/g, '').length < 4)) ||
    // nor one word stranded between two longer lines ("We would / love / to meet you")
    (ls.length > 2 && ls.slice(1, -1).some((l) => !l.includes(' ')));
  // Small words ride with the next word and a time keeps its label (glueTitle); when the
  // glued title cannot fit at any size, it falls back to breaking at every space.
  const glued = glueTitle(t.text);
  const fitAt = (maxH: number): FitResult => {
    for (const text of glued === t.text ? [t.text] : [glued, t.text]) {
      for (let sz = t.max; sz >= t.min; sz *= 0.98) {
        const r = fitText(text, opts(maxH, sz, sz), k.measure);
        if (!r.overflow && !lonely(unglue(r.lines))) return r;
      }
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
  /** Social and slides: the name on one line beside the mark, set at `oneLine` px, when it fits. */
  oneLine = 0,
): { svg: string; h: number } {
  const { church } = ctx;
  const name = `${church.line1} ${church.line2}`;
  if (oneLine) {
    // One line beside the mark when it fits; else "First Baptist" over "Church of Auburn",
    // both in the serif at the same size (never small capitals under the floor).
    let ms = Math.max(size, oneLine * 1.7);
    let tx = b.x + ms + ms * 0.28;
    const fit = fitLine(
      name,
      { family: 'serif' },
      b.x + b.w - tx,
      oneLine * 1.15,
      oneLine,
      ctx.measure,
    );
    let ls = [name];
    let ns = fit.size;
    if (fit.over) {
      ms = Math.max(size, oneLine * 2.2);
      tx = b.x + ms + ms * 0.28;
      ls = [church.line1, church.line2];
      ns = oneLine;
    }
    let svg = image(ctx.assets.markColor, b.x, b.y, ms, ms);
    svg += lines(ls, {
      family: 'serif',
      size: ns,
      leading: 1.08,
      x: tx,
      y: b.y + (ms - ns * 1.08 * ls.length) / 2,
      fill: C.navy,
    });
    if (!rule) return { svg, h: ms };
    const ruleY = b.y + ms + 24 * u;
    const rh = Math.max(2, 3 * u);
    svg += rect(b.x, ruleY, b.w, rh, C.navy);
    return { svg, h: ruleY + rh - b.y };
  }
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
 * The foot on a screen: a hairline, the web address in bold, and under it whatever
 * `rest` holds (research pass, 2026-10-28: on a phone only the web address and, for an
 * event, the street reads; the standing Sunday line moved to the caption). Nothing here
 * shrinks under the body's floor: a long web address breaks after the host, and a line
 * breaks at its commas.
 */
function footScreen(
  c: Content,
  ctx: Ctx,
  b: Box,
  u: number,
  m: Mins,
  o: { rest?: string[]; qrSize?: number; name?: number } = {},
): { svg: string; h: number } {
  const { church, measure } = ctx;
  const qs = o.qrSize ?? 0;
  const textW = b.w - (qs ? qs + Math.max(40 * u, 48) : 0);
  const ws = Math.max(30 * u, m.body * 1.08);
  const bold = { family: 'sans' as const, weight: 700 };
  let web = cleanText(c.link) || church.web;
  let wf = fitLine(web, bold, textW, ws, m.body, measure);
  let webLs = [web];
  if (wf.over) {
    webLs = webLines(web, bold, m.body, textW, measure);
    if (webLs.some((l) => measure(l, { ...bold, size: m.body }) > textW)) {
      web = church.web;
      webLs = [web];
    }
    wf = fitLine(
      webLs.reduce((a, l) => (l.length > a.length ? l : a), ''),
      bold,
      textW,
      ws,
      m.body,
      measure,
    );
  }
  const fits = (o.rest ?? []).filter(Boolean).map((t) =>
    fitText(
      t,
      {
        family: 'sans',
        weight: 400,
        maxW: textW,
        maxH: m.body * 1.25 * 3,
        maxLines: 3,
        max: m.body,
        min: m.body,
        leading: 1.25,
      },
      measure,
    ),
  );
  // Beside a code, what the code is for sits over the web address.
  const label = qs ? qrLabelFor(c) : '';
  const lf = fitText(
    label,
    {
      family: 'sans',
      weight: 400,
      maxW: textW,
      maxH: m.body * 1.25 * 3,
      maxLines: 3,
      max: m.body,
      min: m.body,
      leading: 1.25,
    },
    measure,
  );
  const labelH = label ? lf.height : 0;
  const textH =
    labelH + wf.size * 1.25 * webLs.length + fits.reduce((s, ft) => s + 8 * u + ft.height, 0);
  const ty = b.y + b.h - textH + labelH;
  // A photo-led post names the church here, over the web address (the photo took the masthead's place).
  const nameH = o.name
    ? masthead(ctx, { ...b, y: 0, w: textW }, 0, u, m, false, o.name).h + 16 * u
    : 0;
  let svg = rect(b.x, ty - labelH - nameH - 30 * u, b.w, Math.max(1.5, 2 * u), C.border);
  if (o.name) svg += masthead(ctx, { ...b, y: ty - nameH, w: textW }, 0, u, m, false, o.name).svg;
  if (label)
    svg += lines(lf.lines, {
      family: 'sans',
      weight: 400,
      size: m.body,
      leading: 1.25,
      x: b.x,
      y: ty - labelH,
      fill: C.inkMuted,
    });
  svg += lines(webLs, {
    ...bold,
    size: wf.size,
    leading: 1.25,
    x: b.x,
    y: ty,
    fill: C.navy,
  });
  let y = ty + wf.size * 1.25 * webLs.length;
  fits.forEach((ft) => {
    y += 8 * u;
    svg += lines(unglue(ft.lines), {
      family: 'sans',
      weight: 400,
      size: ft.size,
      leading: 1.25,
      x: b.x,
      y,
      fill: C.inkMuted,
    });
    y += ft.height;
  });
  if (qs) svg += qr(c.qr!, b.x + b.w - qs, b.y + b.h - qs, qs, C.ink, C.ground);
  return { svg, h: Math.max(textH + nameH + 30 * u, qs + 30 * u) };
}

/**
 * The navy band (paper and the story): the white mark, the name and the web address,
 * run off the bottom and both sides. Its words end at the box's bottom edge; the band
 * shows as much navy above them as below. Narrow pieces put the web address under the name.
 */
function band(
  ctx: Ctx,
  f: Format,
  b: Box,
  markSize: number,
  m: Mins,
  webMin: number,
  /** The web address the band prints, or null for the name alone (the yard sign sets it in the words). */
  web: string | null,
): { svg: string; top: number } {
  const { church, measure } = ctx;
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
  const oneRow = !web || measure(web, { ...wfont, size: wsize }) <= room;
  // Under the name, a web address too long for the width breaks after the host.
  const webLs = web && !oneRow ? webLines(web, wfont, wsize, b.w, measure) : [];
  const contentH = oneRow ? ms : ms + ms * 0.32 + wsize * 1.1 * webLs.length;
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
  if (web && oneRow) {
    svg += lines([web], {
      ...wfont,
      size: wsize,
      leading: 1,
      x: b.x + b.w,
      y: top + (ms - wsize) / 2,
      fill: C.white,
      anchor: 'end',
    });
  } else if (web) {
    svg += lines(webLs, {
      ...wfont,
      size: wsize,
      leading: 1.1,
      x: b.x,
      y: b.y + b.h - wsize * 1.1 * webLs.length,
      fill: C.white,
    });
  }
  return { svg, top: bandTop };
}

/**
 * The paper foot above the band, beside the QR code: the code's own web address in bold
 * (so a reader without a phone camera can type it), the standing Sunday line, and the
 * street address. Bottom edge at `bottom`. Returns the height used.
 */
function footPaper(
  c: Content,
  ctx: Ctx,
  x: number,
  w: number,
  bottom: number,
  u: number,
  m: Mins,
  o: { address: string | null; qrSize: number; standing: boolean },
): { svg: string; h: number } {
  const { church, measure } = ctx;
  const items: { text: string; weight: number; fill: string }[] = [];
  const showQr = o.qrSize > 0;
  const textW = w - (showQr ? o.qrSize + Math.max(40 * u, 48) : 0);
  const bold = { family: 'sans' as const, weight: 700 };
  if (showQr) {
    // What the code is for, then its address (so a reader without a camera can type it).
    items.push({ text: qrLabelFor(c), weight: 400, fill: C.inkMuted });
    const web = cleanText(c.link) || church.web;
    const ls = webLines(web, bold, m.body, textW, measure);
    const ok = ls.every((l) => measure(l, { ...bold, size: m.body }) <= textW);
    // Joined with glue so fitText keeps each part on its own line.
    (ok ? ls : [church.web]).forEach((l) =>
      items.push({ text: l.replace(/\s+/g, GLUE), weight: 700, fill: C.navy }),
    );
  }
  const st = o.standing ? standingLine(c) : '';
  if (st) items.push({ text: st, weight: 700, fill: C.navy });
  if (o.address) items.push({ text: glueAddress(o.address), weight: 400, fill: C.inkMuted });
  if (!items.length && !showQr) return { svg: '', h: 0 };
  // The text column ends well clear of the code (at least 40px), and a line that does
  // not fit at the floor breaks onto a second line rather than running under the code
  // (round two, 2026-10-27: "Worship 11:" was cut off on the door hanger).
  const size = m.body;
  let svg = '';
  const fits = items.map((it) =>
    fitText(
      glue(it.text),
      {
        family: 'sans',
        weight: it.weight,
        maxW: textW,
        maxH: size * 1.35 * 3,
        maxLines: 3,
        max: size,
        min: size,
        leading: 1.35,
      },
      measure,
    ),
  );
  const textH = fits.reduce((s, ft) => s + ft.height, 0);
  // Beside a taller code the words sit level with its middle.
  let y = showQr && o.qrSize > textH ? bottom - o.qrSize / 2 - textH / 2 : bottom - textH;
  const ruleY = Math.min(y, bottom - o.qrSize) - 24 * u;
  items.forEach((it, i) => {
    svg += lines(unglue(fits[i].lines), {
      family: 'sans',
      weight: it.weight,
      size: fits[i].size,
      leading: 1.35,
      x,
      y,
      fill: it.fill,
    });
    y += fits[i].height;
  });
  if (items.length) svg += rect(x, ruleY, w, Math.max(1.5, 2 * u), C.border);
  if (showQr) svg += qr(c.qr!, x + w - o.qrSize, bottom - o.qrSize, o.qrSize, C.ink, C.ground);
  return { svg, h: bottom - ruleY };
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

/**
 * A fill-in form for the connect card (research pass, 2026-10-28): each label in small
 * capitals sits ABOVE its writing space, and the space under it is at least 0.4 in
 * (`write` px) before the line, so a hand has room. Spare height becomes more lines
 * under the last label (the prayer request). Returns the drawing and whether it fitted.
 */
function form(
  b: Box,
  u: number,
  size: number,
  write: number,
  labels: string[],
  measure: Measure,
): { svg: string; over: boolean } {
  const font = { family: 'sans' as const, weight: 700, tracking: 0.12, caps: true };
  const rule = Math.max(1.5, 2 * u);
  const labelH = size * 1.1;
  const after = size * 0.7;
  const rowH = labelH + write + rule + after;
  let over = labels.length * rowH - after > b.h + 1;
  let svg = '';
  let y = b.y;
  labels.forEach((label) => {
    if (measure(label.toUpperCase(), { ...font, size }) > b.w) over = true;
    svg += lines([label], { ...font, size, leading: 1, x: b.x, y, fill: C.inkMuted });
    y += labelH + write;
    svg += rect(b.x, y, b.w, rule, C.navyLight);
    y += rule + after;
  });
  // More lines for the last answer while they fit, each a full writing space apart.
  y -= after;
  while (y + write + rule <= b.y + b.h) {
    y += write;
    svg += rect(b.x, y, b.w, rule, C.navyLight);
    y += rule;
  }
  return { svg, over };
}

/**
 * The drawn size of a QR code (quiet zone included) whose squares cover `moduleIn`
 * inches: a phone needs about 0.8 in (2 cm) of code to scan from the hand (research
 * pass, 2026-10-28). Longer addresses make more, smaller squares, so the size is worked
 * out from the address itself.
 */
function qrOuter(url: string, moduleIn: number, dpi: number): number {
  const make = qrcode as unknown as (
    t: number,
    l: string,
  ) => { addData(s: string): void; make(): void; getModuleCount(): number };
  const code = make(0, 'M');
  code.addData(url);
  code.make();
  const n = code.getModuleCount();
  return Math.ceil((moduleIn * dpi * (n + 2 * QUIET_ZONE)) / n);
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
  // Then the kicker (research pass: say less rather than shrink), then the times.
  if (o.kicker !== false && cleanText(c.kicker)) tries.push({ body: false, kicker: false });
  if (o.dropDetails) tries.push({ body: false, kicker: false, details: false });
  let least = first;
  for (const t of tries) {
    const r = fitSteps(c, f, ctx, u, m, box, { ...o, ...t });
    least = r;
    if (r.warnings.length) continue;
    r.warnings.push(
      t.details === false
        ? `Only the title fits on ${f.label}, so the rest is left off. Try fewer words.`
        : `The words under the title did not fit on ${f.label}, so they are left off. Try fewer words.`,
    );
    return r;
  }
  // Nothing fits: draw the shortest version tried, so the least spills over (with its warning).
  return least;
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

function render(c: Content, f: Format, ctx0: Ctx): Rendered {
  // Glued words (a time and its label, a title's small words) are drawn with a space, so
  // they are measured with one: the word joiner itself measures as nothing.
  const ctx: Ctx = {
    ...ctx0,
    measure: (t, font) => ctx0.measure(t.split(GLUE).join(' '), font),
  };
  const u = unit(f);
  const safe = safeBox(f);
  const dpi = f.print?.dpi ?? 0;
  const short = Math.min(f.w, f.h) - 2 * f.bleed;
  const sx = short / 1080;
  const social = f.group === 'social';
  const yard = f.id === 'yard-sign';
  const slide = f.id === 'slide';
  const thumb = f.id === 'youtube-thumb';
  const hanger = f.id === 'door-hanger';
  const story = f.id === 'story';
  const card = f.id === 'connect-card';
  // A business card (the invite card, drawn here for kinds other than an invite): the name,
  // the title and the when, and the web address. No band, no picture, no code.
  const mini = f.id === 'invite-card';
  const bannerShape = f.shape === 'banner';
  // The floors (header; research pass, 2026-10-28). A feed post shows at about a third of
  // its size on a phone, so its reading floor is 4% of the width (42px at 1080, about 15
  // CSS px there); the slide's is 30 pt (60px at 1080p); paper keeps about 11 pt.
  const m: Mins = {
    title: yard
      ? 0.2 * (f.h - 2 * f.bleed)
      : slide
        ? 0.11 * f.h
        : mini
          ? 0.085 * short
          : (f.print ? 0.06 : 0.08) * short,
    verse: (yard ? 0.1 : 0.055) * short,
    body: f.print
      ? 0.153 * dpi
      : slide
        ? 60
        : thumb
          ? 0.04 * f.w
          : bannerShape
            ? 40
            : f.id === 'event-cover'
              ? 48
              : 42 * sx,
    small: f.print
      ? 0.125 * dpi
      : slide
        ? 60
        : thumb
          ? 0.04 * f.w
          : bannerShape
            ? 34
            : f.id === 'event-cover'
              ? 42
              : 38 * sx,
  };
  // The church's name beside the mark on screens, at the body's size or a little over.
  const nameSize = slide ? 60 : m.body * 1.08;
  // A little more margin than the safe line: a notice breathes.
  const pad = f.print ? 0.12 * dpi : bannerShape ? 0 : 18 * u;
  const b: Box = { x: safe.x + pad, y: safe.y + pad, w: safe.w - 2 * pad, h: safe.h - 2 * pad };
  // The story: the app's name bar covers about the top 270px and the reply box the
  // bottom 380px, so no word goes there (research pass; Meta's 14% and 20%).
  if (story) {
    const top = Math.max(b.y, 270);
    const bot = Math.min(b.y + b.h, f.h - 380);
    b.y = top;
    b.h = bot - top;
  }
  // The Facebook page cover: a phone shows about the middle 1110px of the 1640.
  if (f.id === 'page-cover') {
    b.x = Math.max(b.x, 270);
    b.w = f.w - 2 * b.x;
  }
  // The yard sign keeps a wide margin (1.2 in from the canvas edge, 180px at 150 dpi) on
  // every side, the band included, so nothing sits at the trim (round two, 2026-10-27).
  if (yard) {
    const ym = Math.max(180, Math.round(1.2 * dpi));
    Object.assign(b, { x: ym, y: ym, w: f.w - 2 * ym, h: f.h - 2 * ym });
  }
  let defs = '';
  let body = rect(0, 0, f.w, f.h, C.ground);
  // The door hanger: a printer's hole die runs from 1.25 to 1.75 in, centred about 1.25 in
  // down, so the top 2.5 in stays plain paper. No guide is printed (a die that does not
  // match it leaves a ring or a crescent). The title starts just under that.
  if (hanger) {
    const top = f.bleed + 2.55 * dpi;
    b.h -= top - b.y;
    b.y = top;
  }
  const tall = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  // The story names the church in the navy band at its foot, like paper: the band runs
  // on below the safe line, so the piece fills its height top to bottom (round two).
  const useBand = (!!f.print && !card && !mini) || story;
  // QR codes: at least 0.8 in of squares on the card and the insert, 1 in on the larger
  // pieces, plus the quiet zone (research pass; 2 cm is the handheld minimum).
  const qrSize =
    f.print && c.qr && !yard && !mini
      ? Math.min(
          qrOuter(c.qr, card || f.id === 'half-sheet' ? 0.8 : 1.0, dpi),
          b.w * (hanger ? 0.42 : 0.32),
        )
      : 0;
  // The street address: on paper always (the two things a guest needs are the place and
  // the time); on a feed post only for an event or a notice, as the street and town (a
  // Facebook event shows its own place, so its cover leaves it off).
  const eventish = c.kind === 'event' || c.kind === 'announcement';
  const address: string | null = !ctx.church.address
    ? null
    : f.print && !mini
      ? ctx.church.address
      : mini
        ? shortAddress(ctx.church.address)
        : eventish && f.id !== 'event-cover'
          ? shortAddress(ctx.church.address)
          : null;
  const done = (warnings: string[]): Rendered => ({
    svg: doc(f, ctx.assets, defs, body),
    warnings,
  });

  /** The navy band and the paper foot above it; returns the bottom of the room left. */
  const bandAndFoot = (
    fx: number,
    fw: number,
    o: { qr: number },
  ): { bottom: number; above: number } => {
    const ms = f.print ? 0.6 * dpi : 110 * u;
    const webMin = m.body * 1.05;
    // With a code, the code's own address sits beside it, so the band carries the home page.
    const web = o.qr ? ctx.church.web : cleanText(c.link) || ctx.church.web;
    const bd = band(ctx, f, b, ms, m, webMin, web);
    const gap = f.print ? 0.18 * dpi : 48 * u;
    const fp = footPaper(c, ctx, fx, fw, bd.top - gap, u, m, {
      address,
      qrSize: o.qr,
      standing: !!f.print,
    });
    body += fp.svg + bd.svg;
    return { bottom: bd.top - gap - (fp.h ? fp.h + gap : 0), above: bd.top - gap };
  };

  // ── The yard sign: the name, a huge title, the when, one web address. ──────────
  // Read from a car: about seven words plus the web address (research pass). An event,
  // a notice and a time change always keep their date and time ("Dec 24, 6 pm"); the
  // title gives up size first.
  if (yard) {
    const H = f.h - 2 * f.bleed;
    const warnings: string[] = [];
    const k: Ctx2 = {
      u,
      m,
      measure: ctx.measure,
      warn: (t) => void (warnings.includes(t) || warnings.push(t)),
      label: f.label,
    };
    const bd = band(ctx, f, b, 0.15 * H, m, 0, null);
    body += bd.svg;
    const box: Box = { x: b.x, y: b.y, w: b.w, h: bd.top - 0.1 * dpi - b.y };
    const times = (c.when ?? []).map(cleanText).filter(Boolean);
    const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
    let when = '';
    if (dated) when = shortWhen(cleanText(c.date), times);
    else if (c.kind === 'sunday' || c.kind === 'welcome') {
      const rows = times.map(splitWhen);
      const main = rows.find((r) => /worship/i.test(r.b)) ?? rows[rows.length - 1];
      const t = main ? shortWhen('', [main.a]) : '';
      if (t) when = `Sundays, ${t}`;
    } else if (c.kind === 'verse') when = cleanText(c.reference);
    const bold = { family: 'sans' as const, weight: 700 };
    const linePiece = (text: string, max: number, min: number, gap: number): Piece | null => {
      if (!text) return null;
      const ft = fitLine(text, bold, box.w, max, min, ctx.measure);
      if (ft.over) k.warn(`The date line is too long for ${f.label}.`);
      return {
        h: ft.size * 1.2,
        gap,
        draw: (y) =>
          lines([text], { ...bold, size: ft.size, x: box.x, y, leading: 1.2, fill: C.navy }),
      };
    };
    let web = cleanText(c.link) || ctx.church.web;
    if (ctx.measure(web, { ...bold, size: 0.075 * H }) > box.w) web = ctx.church.web;
    const verse = c.kind === 'verse';
    const title = verse ? `“${cleanText(c.title)}”` : cleanText(c.title);
    const after = [
      linePiece(when, 0.1 * H, 0.07 * H, 0.05 * H),
      linePiece(web, 0.075 * H, 0.06 * H, 0),
    ].filter((p): p is Piece => !!p);
    const st = stack(
      {
        before: [],
        title: {
          text: title,
          max: (verse ? 0.1 : 0.2) * H,
          min: (verse ? 0.06 : 0.1) * H,
          maxLines: verse ? 6 : 3,
          leading: verse ? 1.18 : 1.04,
        },
        after,
      },
      box,
      k,
      'middle',
      0.045 * H,
    );
    body += st.svg;
    const count = (s: string) => s.split(/\s+/).filter((w) => /\w/.test(w)).length;
    if (!verse && count(title) + count(when) > 8)
      k.warn(
        `A yard sign is read from a moving car, and about seven words is the most that reads. Try a shorter title.`,
      );
    return done(warnings);
  }

  if (tall) {
    let top = b.y;
    let bottom = b.y + b.h;
    const leaders = !!f.print;
    // A photo on a feed post leads (research pass): it takes nearly half the height from
    // the top margin, and the church's name moves to the foot.
    const photoLed = !!c.photo && social;
    if (useBand) {
      bottom = bandAndFoot(b.x, b.w, { qr: qrSize }).bottom - 40 * u;
    } else {
      if (!photoLed) {
        const mast = masthead(ctx, b, 72 * u, u, m, true, nameSize);
        body += mast.svg;
        top += mast.h + 56 * u;
      }
      const ft = footScreen(c, ctx, b, u, m, {
        rest: address ? [glueAddress(address)] : [],
        name: photoLed ? nameSize : 0,
      });
      body += ft.svg;
      bottom -= ft.h + 48 * u;
    }
    const region = bottom - top;
    if (c.photo && photoLed) {
      // The gable runs across the whole width from the top edge (no words go up there,
      // so the story's name bar may cover its peak), over a ledge of the brick wall. It
      // keeps 45% of the height on the tall sizes; the words say less before it shrinks,
      // and it gives up height only when even the title and the times will not fit.
      const drop = 26 * u;
      const gap = 44 * u;
      const shares = f.shape === 'square' ? [0.37, 0.33, 0.29] : [0.45, 0.41, 0.37, 0.33];
      let ph = 0;
      let ws: Fitted | null = null;
      for (const share of shares) {
        ph = share * f.h;
        const wTop = Math.max(ph + drop + gap, top);
        ws = fitWords(
          c,
          f,
          ctx,
          u,
          m,
          { x: b.x, y: wTop, w: b.w, h: bottom - wTop },
          { align: 'middle', leaders, dropDetails: c.kind === 'sermon' || c.kind === 'verse' },
        );
        if (!ws.warnings.some((w) => /too much|too long/.test(w))) break;
      }
      // Still too much at the smallest photo: say less (the times go to the caption).
      if (ws!.warnings.some((w) => /too much|too long/.test(w))) {
        const wTop = Math.max(ph + drop + gap, top);
        ws = fitWords(
          c,
          f,
          ctx,
          u,
          m,
          { x: b.x, y: wTop, w: b.w, h: bottom - wTop },
          { align: 'middle', leaders, dropDetails: true },
        );
      }
      defs += tilePattern('slab', ctx.assets.tileWall, 300 * u);
      body += rect(
        b.x + b.w * 0.34,
        ph * 0.5,
        f.w - (b.x + b.w * 0.34),
        ph * 0.5 + drop,
        'url(#slab)',
      );
      const pw = f.w;
      body += shapedPhoto(
        c.photo,
        'ph',
        { x: 0, y: 0, w: pw, h: ph },
        gable(pw, ph),
        pitchOf(pw, ph),
      );
      body += ws!.svg;
      return done(ws!.warnings);
    }
    if (c.photo) {
      // Paper: the gable over the brick wall. The words are set first, under a photo of
      // the smallest height that lets them keep their floors; the photo then grows into
      // whatever room the words leave.
      const drop = 26 * u;
      const gap = 56 * u;
      const maxPh = region * (f.shape === 'tall' ? 0.5 : 0.48);
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
      let ph = Math.max(minPh, Math.min(maxPh, region - w0.h - drop - gap));
      const wordsUnder = (h: number) => {
        const wTop = top + h + drop + gap;
        return fitWords(
          c,
          f,
          ctx,
          u,
          m,
          { x: b.x, y: wTop, w: b.w, h: bottom - wTop },
          { align: hanger ? 'top' : 'middle', leaders },
        );
      };
      let ws = wordsUnder(ph);
      // When the words would lose a line, the photo gives up a fifth of its height first
      // (round two: the square post dropped its sentence with room to spare).
      if (ws.warnings.length) {
        const ph2 = Math.max(region * 0.11, ph * 0.8);
        const ws2 = wordsUnder(ph2);
        if (ws2.warnings.length < ws.warnings.length) {
          ph = ph2;
          ws = ws2;
        }
      }
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
      { align: story ? 'bottom' : 'top', leaders, spare: sketchMax + 40 * u },
    );
    body += ws.svg;
    // The sketch takes the room the words leave. On the story the words sit on the foot
    // and the sketch stands above them, centred in the room; on the door hanger it sits
    // halfway between the words and the foot, so the space is shared evenly (round two:
    // 600px lay dead between them). Elsewhere it stands on the foot.
    const gapS = 48 * u;
    const free = story ? ws.top - gapS - top : bottom - (ws.top + ws.h + gapS);
    if (free > sketchMax * 0.45) {
      const sh = Math.min(free, sketchMax);
      const sy = story
        ? top + (free - sh) / 2
        : hanger
          ? ws.top + ws.h + gapS + (free - sh) / 2
          : bottom - sh;
      const sk = sketch(ctx, { x: b.x, y: sy, w: b.w, h: sh }, u);
      defs += sk.defs;
      body += sk.body;
    }
    return done(ws.warnings);
  }

  // The YouTube channel art (round two, 2026-10-27). Every device shows only the middle
  // 1546 x 423 strip, so it holds two things, both large: the title at the left, as tall
  // as the strip allows, and the mark over the church's name in a column at the right.
  // Above the strip, where a TV shows more, the photo runs to the edges (or the sketch
  // stands on the strip's left edge).
  if (f.id === 'youtube-banner') {
    const s = safeBox(f);
    const warnings: string[] = [];
    const k: Ctx2 = {
      u,
      m,
      measure: ctx.measure,
      warn: (t) => void (warnings.includes(t) || warnings.push(t)),
      label: f.label,
    };
    const aboveH = s.y - 0.16 * s.h;
    if (c.photo) {
      body += shapedPhoto(c.photo, 'ph', { x: 0, y: 0, w: f.w, h: aboveH }, [
        [0, 0],
        [f.w, 0],
        [f.w, aboveH],
        [0, aboveH],
      ]);
    } else if (c.kind !== 'verse') {
      const sh = aboveH * 0.82;
      const sk = sketch(ctx, { x: s.x, y: aboveH - sh, w: sh / SKETCH_RATIO, h: sh }, u * 1.6);
      defs += sk.defs;
      body += sk.body;
    }
    // The name column.
    const colW = s.w * 0.26;
    const colX = s.x + s.w - colW;
    const n1 = fitLine(
      ctx.church.line1,
      { family: 'serif' },
      colW,
      0.17 * s.h,
      m.body,
      ctx.measure,
    );
    const n2font = { family: 'sans' as const, weight: 700, tracking: 0.12, caps: true };
    const n2 = fitLine(
      ctx.church.line2,
      n2font,
      colW,
      Math.max(0.08 * s.h, m.small),
      m.small,
      ctx.measure,
    );
    if (n1.over || n2.over) k.warn(`The church's name is too long for ${f.label}.`);
    const ms = Math.min(0.42 * s.h, colW * 0.5);
    const colH = ms + 0.12 * s.h + n1.size * 1.1 + 0.06 * s.h + n2.size;
    let y = s.y + (s.h - colH) / 2;
    body += image(ctx.assets.markColor, colX, y, ms, ms);
    y += ms + 0.12 * s.h;
    body += lines([ctx.church.line1], {
      family: 'serif',
      size: n1.size,
      leading: 1.1,
      x: colX,
      y,
      fill: C.navy,
    });
    y += n1.size * 1.1 + 0.06 * s.h;
    body += lines([ctx.church.line2], {
      ...n2font,
      size: n2.size,
      leading: 1,
      x: colX,
      y,
      fill: C.navy,
    });
    // The title: as large as the strip's height and the left column allow.
    const verse = c.kind === 'verse';
    const tw = s.w - colW - 0.06 * s.w;
    // A banner stays up for weeks: an event or a time change always says when (research pass).
    const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
    const when = dated ? shortWhen(cleanText(c.date), (c.when ?? []).map(cleanText)) : '';
    const whenP = when
      ? detailsPiece([{ a: when, b: '' }], 'inline', s.x, tw, Math.max(0.16 * s.h, m.body), 0, k)
      : null;
    const st = stack(
      {
        before: [],
        after: whenP ? [whenP] : [],
        title: {
          text: verse ? `“${cleanText(c.title)}”` : cleanText(c.title),
          max: s.h / 1.04,
          min: Math.max(m.body, (verse ? 0.1 : 0.15) * s.h),
          maxLines: verse ? 5 : 3,
          leading: verse ? 1.18 : 1.04,
        },
      },
      { x: s.x, y: s.y, w: tw, h: s.h },
      k,
      'middle',
      whenP ? 0.06 * s.h : 0,
    );
    body += st.svg;
    return done(warnings);
  }

  // Banners (the Facebook page cover): the strip every screen shows holds the name at the
  // top, the words, and the web address at the foot; the picture (or the sketch) sits to
  // the right of them.
  if (f.shape === 'banner') {
    m.title = 0.15 * b.h;
    m.verse = 0.1 * b.h;
    const split = 0.6;
    const colW = b.w * split - 24 * u;
    const mast = masthead(ctx, { ...b, w: colW }, b.h * 0.15, u, m, false, nameSize);
    body += mast.svg;
    const bold = { family: 'sans' as const, weight: 700 };
    let web = cleanText(c.link) || ctx.church.web;
    const wsz = Math.max(b.h * 0.07, m.body * 1.05);
    if (ctx.measure(web, { ...bold, size: wsz }) > colW) web = ctx.church.web;
    body += lines([web], {
      ...bold,
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
  const formCard = c.kind === 'welcome' && card;
  const bleedOut = !!c.photo && !f.print && !formCard;
  const split = formCard ? 0.5 : 0.56;
  const colW = mini ? b.w : b.w * split - 20 * u;
  const rightX = b.x + b.w * (split + 0.04);
  const rightW = b.x + b.w - rightX;
  const screenSketch = !c.photo && !f.print && !formCard;
  let top = b.y;
  let bottom = b.y + b.h;
  /** Where the right column (photo, form, sketch) starts and ends. */
  let rightTop = top;
  let rightBottom = bottom;
  if (useBand) {
    const bf = bandAndFoot(b.x, colW, { qr: qrSize });
    bottom = bf.bottom - 40 * u;
    rightBottom = bf.above;
  } else {
    const leftW = bleedOut ? rightX - 64 * u - b.x : formCard ? colW : b.w;
    if (thumb) {
      // A thumbnail is seen at 320px wide beside the channel's own name: the mark alone,
      // then the series and the title, as big as they go (research pass).
      const ms = 0.15 * f.h;
      body += image(ctx.assets.markColor, b.x, b.y, ms, ms);
      top += ms + 32 * u;
    } else {
      const mast =
        card && !mini
          ? masthead(ctx, { ...b, w: leftW }, 54 * u, u, m)
          : masthead(ctx, { ...b, w: leftW }, 64 * u, u, m, true, nameSize);
      body += mast.svg;
      top += mast.h + (card ? 36 : 48) * u;
    }
    // The slide carries only the name, the title and the times (a projector, a lit room).
    if (!slide && !thumb) {
      const ft = footScreen(c, ctx, { ...b, w: card && !formCard ? b.w : colW }, u, m, {
        rest: address && !formCard ? [glueAddress(address)] : [],
        qrSize: card ? qrSize : 0,
      });
      body += ft.svg;
      bottom -= ft.h + (card ? 36 : 44) * u;
    }
    rightTop = formCard ? b.y : top;
    rightBottom = formCard ? b.y + b.h : bottom;
  }
  const warnings: string[] = [];
  if (formCard) {
    const fm = form(
      { x: rightX, y: rightTop, w: rightW, h: rightBottom - rightTop },
      u,
      m.small,
      0.4 * dpi,
      ['Name', 'Phone', 'Email', 'How can we pray for you?'],
      ctx.measure,
    );
    body += fm.svg;
    if (fm.over) warnings.push(`The writing side does not fit on ${f.label}.`);
  } else if (mini) {
    // No picture on a business card: the words take the width.
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
      details: !thumb,
      scale: thumb ? 1.3 : 1,
      leaders: !!f.print,
      dsize: slide ? 0.06 * f.h : undefined,
      dropDetails: card,
    },
  );
  body += ws.svg;
  return done([...warnings, ...ws.warnings]);
}

export const porch: Direction = {
  id: 'porch',
  name: 'Porch',
  summary:
    'The site’s light pages as a printed church notice: warm white paper, a big navy Young Serif title, the times as a timetable, the church named on every piece (a masthead on screens, a navy band on paper), the brick marker as the one red, photos in the gable over the brick wall or a stepped brick corner, and the building sketch when there is no photo.',
  render,
};
