// Safe to edit by hand
// =============================================================================
// Direction "Press" for the graphics maker (2026-10-27, docs/agent/graphics.md).
// The Studio calls it "Bold": the look for the Facebook feed and a door seen
// from the sidewalk.
// =============================================================================
// Two flat inks on a sheet of paper, like a community-hall notice:
//
//   paper   a warm white border all round, the sheet the notice is printed on.
//           The border and the calm margins are what keep a red sheet a church
//           notice and not a sale flyer.
//   auburn  the first ink: a flat field, no texture (round two, 2026-10-27: the
//           speck layer was generic grain, from no Auburn source). Every word on
//           it is cream Young Serif or cream Familjen Grotesk (6.3:1).
//   navy    the second ink: the imprint band at the foot (the mark, the name,
//           the web address, the regular Sunday times on other kinds, the QR
//           code on print). Its top edge steps up three bricks at the right,
//           the corner of the mark: the ONE edge device, drawn with clean lines.
//   photo   in natural colour, a touch desaturated and warmed so faces stay
//           warm. Hard edges, no fades.
//   no photo  the building sketch cut into the auburn in cream lines. A verse
//           takes neither: it sits alone on the plain field.
//
// One left edge per piece: the kicker, the title, the body, the rule and the
// times all start on it. Times are a timetable with dotted leaders, as large as
// the body or larger. No type is smaller than 26px at 1080 on screens, or
// 11pt (0.153 in) in print. The yard sign, the connect card and the door
// hanger's hole have their own rules below.
// =============================================================================

import qrcode from 'qrcode-generator';
import { QUIET_ZONE } from '../../qr.ts';
import { qrLabelFor } from '../content.ts';
import { safeBox, unit, type Format } from '../formats.ts';
import { C, doc, image, lines, qr, rect } from '../svg.ts';
import { cleanText, fitText, type FitResult, type FontSpec, type Measure } from '../text.ts';
import type { Content, Ctx, Direction, Photo, Rendered } from '../types.ts';

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

const f1 = (n: number) => String(Math.round(n * 10) / 10);

/** A clean polygon path. */
const poly = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z';

/**
 * The smallest type a size may carry (research pass, 2026-10-28):
 *   social  4% of the width a phone shows (about 43px on a 1080 post). A feed picture is
 *           seen at about a third of its size, so that is about 15 CSS px, the reading floor.
 *   screen  60px on a 1920x1080 slide (30pt), read from the back pew.
 *   print   11pt (0.153 in, about 46px at 300 dpi).
 * Room is made by saying less (the body, the regular times and the town go first), never
 * by setting smaller.
 */
const floorPx = (f: Format) => {
  if (f.print) return 0.153 * f.print.dpi;
  if (f.group === 'screen') return 60 * (f.h / 1080);
  const shown = f.shape === 'banner' ? f.w - f.safe.left - f.safe.right : f.w;
  return 0.04 * shown;
};

/**
 * The box words stay inside. The story keeps clear of more than the app's bars alone:
 * the top 270px (the name bar and the progress line) and the bottom 380px (the reply
 * box, and a Reels cover's caption).
 */
function area(f: Format): Box {
  const b = safeBox(f);
  if (f.id !== 'story') return b;
  const top = Math.max(f.safe.top, 270);
  const bottom = Math.max(f.safe.bottom, 380);
  return { x: b.x, y: top, w: b.w, h: f.h - top - bottom };
}

/**
 * The full side of a QR code (quiet zone included) whose modules cover at least
 * `inches` square: about 2 cm is the least a phone held at arm's length reads.
 */
function qrSide(url: string, inches: number, dpi: number): number {
  const make = qrcode as unknown as (
    t: number,
    l: string,
  ) => { addData(s: string): void; make(): void; getModuleCount(): number };
  const code = make(0, 'M');
  code.addData(url);
  code.make();
  const n = code.getModuleCount();
  return Math.ceil((inches * dpi * (n + 2 * QUIET_ZONE)) / n);
}

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

/** The photo's treatment: about 18% less colour and a light warm cast, never blue. */
const WARM =
  `<filter id="warm" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">` +
  `<feColorMatrix type="saturate" values="0.82"/>` +
  `<feColorMatrix type="matrix" values="1.04 0 0 0 0.012 0 1 0 0 0.006 0 0 0.92 0 0 0 0 0 1 0"/>` +
  `</filter>`;

/**
 * A photo cropped into a box, hard edged. With a hotspot the crop is centred on it.
 * Without one it leans to the upper part: the point 40% down the photo is centred, as
 * in the Light look, because heads sit high in a picture and a short band centred on
 * the middle crops them (round two, 2026-10-27; a crop anchored 20% from the top showed
 * only the wall above the heads on the sample photo).
 */
function photoIn(p: Photo, id: string, b: Box): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const ox = Math.min(0, Math.max(b.w - dw, b.w / 2 - fx * dw));
  const fy = p.focus?.y ?? 0.35;
  const oy = Math.min(0, Math.max(b.h - dh, b.h / 2 - fy * dh));
  return (
    `<clipPath id="${id}"><rect x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}"/></clipPath>` +
    `<g clip-path="url(#${id})"><image href="${p.src}" x="${f1(b.x + ox)}" y="${f1(b.y + oy)}" ` +
    `width="${f1(dw)}" height="${f1(dh)}" preserveAspectRatio="none" filter="url(#warm)"/></g>`
  );
}

/**
 * Words that stay together on a line. The space between them becomes a word joiner
 * (not whitespace, so the line breaker keeps the pair); the measure reads it as a
 * space, and render() turns it back into one in the finished SVG.
 *
 *   glue()   a time and its "am", a month and its day ("December 24"), and a short word
 *            and the word after it, so no line ends on "at", "a" or "to".
 *   whole()  a whole phrase: a gathering and its time ("Worship, 11:00 am").
 *   address  breaks only at its first comma: the street, then the town.
 */
const GLUE = '⁠';
const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec';
const SHORT_WORD =
  /(^|\s|⁠)(a|an|the|to|of|at|in|on|by|for|and|or|our|my|your|with|from)\s+(?=\S)/gi;
const glue = (s: string) =>
  s
    .replace(/(\d)\s+(am|pm|a\.m\.|p\.m\.)(?=\W|$)/gi, (_, d: string, ap: string) => d + GLUE + ap)
    .replace(new RegExp(`\\b(${MONTHS})\\.?\\s+(\\d)`, 'g'), (x) => x.replace(/\s+/, GLUE))
    .replace(SHORT_WORD, (_, pre: string, w: string) => pre + w + GLUE)
    // A second pass for runs of short words ("at a", "in the").
    .replace(SHORT_WORD, (_, pre: string, w: string) => pre + w + GLUE);
const whole = (s: string) => s.trim().replace(/\s+/g, GLUE);
const keepAddress = (s: string) => {
  const i = s.indexOf(', ');
  return i < 0 ? whole(s) : `${whole(s.slice(0, i))}, ${whole(s.slice(i + 2))}`;
};
const unglue = (ls: string[]) => ls.map((l) => l.split(GLUE).join(' '));

const WEEKDAY = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s*/i;
const SHORT_MONTH: Record<string, string> = {
  January: 'Jan',
  February: 'Feb',
  August: 'Aug',
  September: 'Sept',
  October: 'Oct',
  November: 'Nov',
  December: 'Dec',
};
/** "6:00 pm" → "6 pm": a sign has no room for minutes that say nothing. */
const shortTime = (s: string) => s.replace(/(\d{1,2}):00\s*(am|pm)/gi, '$1 $2');

/**
 * When, in the fewest words a driver can read: "Dec 24, 6 pm". The date comes from
 * `date`, or from a kicker that is a date (an event page's own date); the time from
 * `date` itself or the first time in `when`. A time change keeps its weekday
 * ("Sunday, Nov 30"): which Sunday is the news.
 */
function shortWhen(c: Content): string {
  const looksLikeDate = (s: string) => new RegExp(`\\b(${MONTHS})\\b`).test(s);
  const kicker = cleanText(c.kicker);
  let d = cleanText(c.date) || (looksLikeDate(kicker) ? kicker : '');
  if (!d) return '';
  const day = WEEKDAY.exec(d)?.[1] ?? '';
  d = d.replace(WEEKDAY, '').replace(/\b[A-Z][a-z]+\b/g, (w) => SHORT_MONTH[w] ?? w);
  const hasTime = /\d\s*(am|pm)\b/i.test(d);
  const time = hasTime
    ? ''
    : ((c.when ?? [])
        .map(cleanText)
        .map((w) => splitWhen(w)[1])
        .find((t) => /\d\s*(am|pm)\b/i.test(t)) ?? '');
  const out = shortTime([d, time].filter(Boolean).join(', '));
  return c.kind === 'time-change' && day ? `${day}, ${out}` : out;
}

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
  let out = r.overflow || lonely(r) ? first : r;
  // Still a word alone in the middle ("We would / love / to meet you"): set it in one
  // line fewer, a little smaller if need be ("We would love / to meet you").
  if (lonely(out) && !out.overflow) {
    for (let n = out.lines.length - 1; n >= 2; n--) {
      const r2 = fitText(t, { ...o, maxLines: n, min: o.min * 0.75 }, m);
      if (!r2.overflow && !lonely(r2)) {
        out = r2;
        break;
      }
    }
  }
  return { ...out, lines: unglue(out.lines) };
}

/** "Sunday School, 9:45 am" → ["Sunday School", "9:45 am"]; a bare time has no label. */
function splitWhen(s: string): [string, string] {
  const i = s.lastIndexOf(', ');
  return i < 0 ? ['', s] : [s.slice(0, i), s.slice(i + 2)];
}

/** The regular Sunday times, when the Studio passes them (Church facts). */
const standingOf = (c: Content): string[] =>
  ((c as Content & { standing?: string[] }).standing ?? []).map(cleanText).filter(Boolean);

/**
 * The main Sunday gathering in the fewest words: "Sundays, 11 am". From this Sunday's
 * times (`when`), else the regular ones (`standing`): the worship service when one is
 * named, else the last gathering of the morning. Never typed here.
 */
function sundayLine(c: Content): string {
  for (const list of [(c.when ?? []).map(cleanText).filter(Boolean), standingOf(c)]) {
    const rows = list.map(splitWhen).filter(([, t]) => /\d\s*(am|pm)\b/i.test(t));
    const pick = rows.find(([l]) => /worship|service/i.test(l)) ?? rows[rows.length - 1];
    if (pick) return `Sundays, ${shortTime(pick[1])}`;
  }
  return '';
}

// ── Words ───────────────────────────────────────────────────────────────────

interface Piece {
  h: number;
  /** The largest type in the piece, px: the title must stay larger (hierarchy). */
  size: number;
  draw: (x: number, y: number) => string;
  warnings: string[];
}

/**
 * The information under the rule at the foot of the words: the date and times
 * (a timetable with dotted leaders), the passage and preacher, or a verse's
 * reference.
 */
function infoPiece(
  c: Content,
  w: number,
  u: number,
  fl: number,
  m: Measure,
  label: string,
  o: { inline?: boolean; wide?: boolean } = {},
): Piece | null {
  const warnings: string[] = [];
  const parts: { h: number; size: number; draw: (x: number, y: number) => string }[] = [];
  const textPart = (
    text: string,
    o: Omit<Parameters<typeof fitText>[1], 'maxW' | 'maxH'>,
    name: string,
  ) => {
    if (!text) return;
    const max = Math.max(o.max, fl);
    const min = Math.max(o.min, fl);
    const r = fitText(text, { ...o, max, min, maxW: w, maxH: max * o.leading * o.maxLines + 1 }, m);
    if (r.overflow) warnings.push(`The ${name} is too long for ${label}. Try fewer words.`);
    parts.push({
      h: r.height,
      size: r.size,
      draw: (x, y) =>
        lines(unglue(r.lines), {
          family: o.family,
          size: r.size,
          weight: o.weight,
          tracking: o.tracking,
          caps: o.caps,
          x,
          y,
          leading: o.leading,
          fill: C.ground,
        }),
    });
  };
  const capsLine = { family: 'sans' as const, weight: 700, tracking: 0.14, caps: true };

  if (c.kind === 'sermon') {
    textPart(
      cleanText(c.reference),
      { ...capsLine, maxLines: 1, max: 28 * u, min: 20 * u, leading: 1.3 },
      'passage',
    );
    textPart(
      cleanText(c.speaker),
      { family: 'sans', weight: 500, maxLines: 1, max: 32 * u, min: 24 * u, leading: 1.3 },
      'preacher',
    );
  } else if (c.kind === 'verse') {
    textPart(
      [cleanText(c.reference), cleanText(c.translation)].filter(Boolean).join('  ·  '),
      { ...capsLine, maxLines: 1, max: 28 * u, min: 20 * u, leading: 1.3 },
      'reference',
    );
  } else if (c.kind !== 'time-change') {
    const when = (c.when ?? []).map(cleanText).filter(Boolean).map(splitWhen);
    const bare = when.filter(([l]) => !l).map(([, t]) => t);
    const rows = when.filter(([l]) => l);
    // The date phrase stays on one line ("Wednesday, December 24, 6:00 pm"), stepping
    // down to the floor first; past that it breaks only between the date and the time.
    const dateOpts = {
      family: 'sans' as const,
      weight: 700,
      max: 40 * u,
      min: 26 * u,
      leading: 1.25,
    };
    const oneLine = [cleanText(c.date), ...bare].filter(Boolean).join(', ');
    const fitsOne =
      oneLine &&
      !fitText(
        glue(oneLine),
        {
          ...dateOpts,
          max: Math.max(dateOpts.max, fl),
          min: fl,
          maxLines: 1,
          maxW: w,
          maxH: Math.max(dateOpts.max, fl) * 1.3,
        },
        m,
      ).overflow;
    textPart(
      fitsOne
        ? glue(oneLine)
        : [cleanText(c.date).replace(/\s+/g, GLUE), ...bare.map(glue)].filter(Boolean).join(', '),
      { ...dateOpts, maxLines: fitsOne ? 1 : 2 },
      'date',
    );
    if (rows.length) {
      // The timetable: label, dotted leader, time. On a Sunday it is the line that
      // matters most after the title, so it starts larger than the body (31u).
      const lo = Math.max(fl, c.kind === 'sunday' ? 31 * u : 0);
      let s = Math.max(c.kind === 'sunday' ? (o.wide ? 36 : 42) * u : 32 * u, lo);
      const lf = (size: number): FontSpec => ({ family: 'sans', size, weight: 500 });
      const tf = (size: number): FontSpec => ({ family: 'sans', size, weight: 700 });
      const need = (size: number) =>
        Math.max(...rows.map(([l]) => m(l, lf(size)))) +
        Math.max(...rows.map(([, t]) => m(t, tf(size)))) +
        5 * size;
      while (need(s) > w && s * 0.96 >= lo) s *= 0.96;
      if (!o.inline && need(s) <= w) {
        const tw = Math.min(w, Math.max(need(s) + 2 * s, 520 * u));
        const lh = s * 1.55;
        parts.push({
          h: rows.length * lh,
          size: s,
          draw: (x, y) =>
            rows
              .map(([l, t], i) => {
                const top = y + i * lh;
                const base = top + lh * 0.5 + s * 0.34;
                const l0 = x + m(l, lf(s)) + 0.5 * s;
                const l1 = x + tw - m(t, tf(s)) - 0.5 * s;
                const dot = 0.14 * s;
                return (
                  lines([l], {
                    family: 'sans',
                    size: s,
                    weight: 500,
                    x,
                    y: top,
                    leading: 1.55,
                    fill: C.ground,
                  }) +
                  `<line x1="${f1(l0)}" y1="${f1(base - dot)}" x2="${f1(l1)}" y2="${f1(base - dot)}" stroke="${C.ground}" stroke-width="${f1(dot)}" stroke-linecap="round" stroke-dasharray="0 ${f1(dot * 3.4)}"/>` +
                  lines([t], {
                    family: 'sans',
                    size: s,
                    weight: 700,
                    x: x + tw,
                    y: top,
                    leading: 1.55,
                    fill: C.ground,
                    anchor: 'end',
                  })
                );
              })
              .join(''),
        });
      } else {
        // One line with dots between the gatherings, or one gathering to a line: a line
        // never opens on a dot, and a time never leaves its label.
        const items = rows.map(([l, t]) => whole(`${l}, ${t}`));
        const opts = {
          family: 'sans' as const,
          weight: 600,
          maxLines: 1,
          max: lo || 30 * u,
          min: fl,
          leading: 1.35,
        };
        const one = items.join('  ·  ');
        const oneFits = !fitText(
          one,
          { ...opts, max: Math.max(opts.max, fl), maxW: w, maxH: Math.max(opts.max, fl) * 2 },
          m,
        ).overflow;
        if (oneFits) textPart(one, opts, 'times');
        else for (const it of items) textPart(it, opts, 'times');
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
    size: Math.max(...parts.map((p) => p.size)),
    warnings,
    draw: (x, y) => {
      let out = rect(x, y, Math.min(w, 220 * u), rule, C.ground);
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
 * The main stack: the kicker in tracked cream capitals, (a time change's date),
 * the title as large as the room allows, and the body. Placed at the top of `box`.
 */
function stack(
  c: Content,
  box: Box,
  u: number,
  fl: number,
  m: Measure,
  o: { label: string; titleMax: number; body: boolean; titleMin?: number; kicker?: boolean },
): { svg: string; h: number; warnings: string[]; titleSize: number; bodySize: number } {
  const warnings: string[] = [];
  const warn = (r: FitResult, name: string) => {
    if (r.overflow) warnings.push(`The ${name} is too long for ${o.label}. Try fewer words.`);
  };
  let svg = '';
  let y = box.y;
  let room = box.h;

  // The kicker: cream capitals, widely spaced, on the column's left edge.
  const kicker = o.kicker === false ? '' : cleanText(c.kicker);
  if (kicker) {
    const ks = Math.max(26 * u, fl);
    const r = fitText(
      kicker,
      {
        family: 'sans',
        weight: 700,
        tracking: 0.2,
        caps: true,
        maxLines: 1,
        max: ks,
        min: fl,
        leading: 1.2,
        maxW: box.w,
        maxH: ks * 1.3,
      },
      m,
    );
    warn(r, 'kicker');
    svg += lines(r.lines, {
      family: 'sans',
      size: r.size,
      weight: 700,
      tracking: 0.2,
      caps: true,
      x: box.x,
      y,
      leading: 1.2,
      fill: C.ground,
    });
    y += r.height + 22 * u;
    room -= r.height + 22 * u;
  }

  // A time change says its date first, large: it is the news.
  if (c.kind === 'time-change' && cleanText(c.date)) {
    const r = fitText(
      glue(cleanText(c.date)),
      {
        family: 'sans',
        weight: 700,
        maxLines: 2,
        max: Math.max(44 * u, fl),
        min: Math.max(26 * u, fl),
        leading: 1.2,
        maxW: box.w,
        maxH: Math.max(44 * u, fl) * 2.5,
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
  const bodyText = o.body ? glue(cleanText(c.body)) : '';
  const bodyGap = 30 * u;
  let bodyFit: FitResult | null = null;
  if (bodyText) {
    bodyFit = fitText(
      bodyText,
      {
        family: 'sans',
        weight: 400,
        maxLines: 5,
        max: Math.max(31 * u, fl),
        min: fl,
        leading: 1.36,
        maxW: Math.min(box.w, Math.max(760 * u, fl * 26)),
        maxH: room,
      },
      m,
    );
    warn(bodyFit, 'body');
    room -= bodyFit.height + bodyGap;
  }

  // A verse opens on a quote mark; the words are indented by it so the mark itself
  // sits on the column's edge, inside the safe area.
  const verse = c.kind === 'verse';
  const qf = (size: number): FontSpec => ({ family: 'serif', size });
  const qMax = verse ? m('“', qf(o.titleMax)) : 0;
  const titleText = verse ? `“${cleanText(c.title)}”` : cleanText(c.title);
  const tf = {
    family: 'serif' as const,
    maxLines: verse ? 7 : 4,
    max: o.titleMax,
    min: o.titleMin ?? 40 * u,
    leading: verse ? 1.13 : 1.02,
    tracking: -0.014,
  };
  let t = fitTitle(titleText, { ...tf, maxW: box.w - qMax, maxH: Math.max(0, room) }, m);
  // The title comes first: when the body squeezes it below a calm size, the body goes.
  if (bodyFit && t.size < 0.42 * o.titleMax) {
    const t2 = fitTitle(
      titleText,
      { ...tf, maxW: box.w - qMax, maxH: Math.max(0, room + bodyFit.height + bodyGap) },
      m,
    );
    if (!t2.overflow && t2.size > t.size * 1.15) {
      t = t2;
      bodyFit = null;
      warnings.push(`The sentence under the title is left off ${o.label} to keep the title large.`);
    }
  }
  warn(t, 'title');
  const qw = verse ? m('“', qf(t.size)) : 0;
  let tsvg = lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: tf.tracking,
    x: box.x + qw,
    y,
    leading: tf.leading,
    fill: C.ground,
  });
  if (verse) tsvg = tsvg.replace(/<tspan x="[^"]+"/, `<tspan x="${f1(box.x)}"`);
  svg += tsvg;
  y += t.height;

  if (bodyFit) {
    y += bodyGap;
    svg += lines(bodyFit.lines, {
      family: 'sans',
      size: bodyFit.size,
      weight: 400,
      x: box.x,
      y,
      leading: 1.36,
      fill: C.ground,
    });
    y += bodyFit.height;
  }
  if (y > box.y + box.h + 1 && !warnings.length)
    warnings.push(`There is too much to say on ${o.label}. Try fewer words.`);
  return { svg, h: y - box.y, warnings, titleSize: t.size, bodySize: bodyFit?.size ?? 0 };
}

// ── The imprint band ────────────────────────────────────────────────────────

/**
 * The navy band's contents, by where the piece goes (research pass, 2026-10-28):
 *
 *   print  the regular Sunday times on kinds not about Sunday itself, the mark and the
 *          church's name, the web address and the full address, and the QR code at the
 *          right (at least 2 cm of modules, the web address beside it).
 *   feed   posts and the story: the mark, the web address and the street. The page's own
 *          name heads every post, and the regular times and the town belong in the
 *          caption: at the reading floor there is room for the two facts a guest needs.
 *   slim   the covers, the thumbnail and the slide: the mark, the name and the web address.
 *
 * Returns its height for a given width so the layout can size the band first.
 */
function imprint(
  c: Content,
  f: Format,
  ctx: Ctx,
  u: number,
  fl: number,
  w: number,
  slim: boolean,
): { h: number; draw: (x: number, y: number) => string; warnings: string[] } {
  const { church, measure: m, assets } = ctx;
  const warnings: string[] = [];
  const feed = f.group === 'social' && !slim;
  let web = cleanText(c.link) || church.web;
  const wf: FontSpec = { family: 'sans', size: Math.max(24 * u, fl), weight: 700 };
  const afSize = Math.max(19 * u, fl);
  const street = church.address ? church.address.split(',')[0].trim() : '';
  const addr = f.print ? (church.address ?? church.place) : feed ? street || church.place : '';
  const q =
    f.print && c.qr
      ? qrSide(c.qr, ['connect-card', 'half-sheet'].includes(f.id) ? 0.8 : 1.0, f.print.dpi)
      : 0;
  const qGap = 36 * u;

  if (feed) {
    // The mark at the left, the web address and the street beside it, both at the floor
    // or larger. The street never splits; it wraps whole under the web address.
    const M = 2.5 * fl;
    const tx = M + 0.7 * fl;
    const tw = w - tx;
    const wr = fitText(
      web,
      { ...wf, maxLines: 1, max: wf.size, min: fl, leading: 1.25, maxW: tw, maxH: wf.size * 1.3 },
      m,
    );
    if (wr.overflow) warnings.push(`The web address is too long for ${f.label}.`);
    const ad = addr
      ? fitText(
          keepAddress(addr),
          {
            family: 'sans',
            weight: 400,
            maxLines: 2,
            max: afSize,
            min: fl,
            leading: 1.25,
            maxW: tw,
            maxH: afSize * 2.6,
          },
          m,
        )
      : null;
    if (ad?.overflow) warnings.push(`The address is too long for ${f.label}.`);
    const textH = wr.height + (ad ? ad.height : 0);
    const h = Math.max(M, textH);
    return {
      h,
      warnings,
      draw: (x, y) => {
        let out = image(assets.markWhite, x, y + (h - M) / 2, M, M);
        const ty = y + (h - textH) / 2;
        out += lines(wr.lines, {
          family: 'sans',
          size: wr.size,
          weight: 700,
          x: x + tx,
          y: ty,
          leading: 1.25,
          fill: C.ground,
        });
        if (ad)
          out += lines(ad.lines, {
            family: 'sans',
            size: ad.size,
            weight: 400,
            x: x + tx,
            y: ty + wr.height,
            leading: 1.25,
            fill: C.tint,
          });
        return out;
      },
    };
  }

  const n2s = Math.max(20 * u, fl);
  const n1: FontSpec = { family: 'serif', size: n2s * 1.5 };
  const n2: FontSpec = { family: 'sans', size: n2s, weight: 600 };
  const M = n2s * 3.7;
  const lockW = M + 0.9 * n2s + Math.max(m(church.line1, n1), m(church.line2, n2));
  const avail = w - (q ? q + qGap : 0);
  // On a screen a page link too long to sit beside the name gives way to the church's own
  // address, rather than stacking the band twice as tall (final review, 2026-10-28).
  if (!f.print && lockW + 56 * u + m(web, wf) > avail) web = church.web;
  const webW = Math.max(m(web, wf), addr ? m(addr, { family: 'sans', size: afSize }) : 0);
  const side = lockW + 56 * u + webW <= avail;

  // The address wraps at its comma on a narrow piece rather than shrinking below the floor.
  const ad = addr
    ? fitText(
        keepAddress(addr),
        {
          family: 'sans',
          weight: 400,
          maxLines: 2,
          max: afSize,
          min: fl,
          leading: 1.3,
          maxW: side ? webW : avail,
          maxH: afSize * 2.7,
        },
        m,
      )
    : null;
  if (ad?.overflow) warnings.push(`The address is too long for ${f.label}.`);
  if (m(web, wf) > (side ? webW : avail) + 0.5)
    warnings.push(`The web address is too long for ${f.label}.`);
  const webH = wf.size * 1.3 + (ad ? ad.height : 0);

  // The standing invitation, on print only: the regular Sunday times on every kind not
  // about Sunday. Each gathering stays whole with its time: one line with dots between
  // them, or, when that is too wide, one gathering to a line (never a line opening on a dot).
  const standing =
    f.print && !['sunday', 'time-change', 'welcome'].includes(c.kind) ? standingOf(c) : [];
  const items = standing.map(splitWhen).map(([l, t]) => (l ? `${l} ${t}` : t));
  let st: { size: number; lines: string[]; height: number } | null = null;
  if (items.length) {
    const stFont = (size: number): FontSpec => ({ family: 'sans', size, weight: 600 });
    const choices = [
      [`Sundays: ${items.join('  ·  ')}`],
      [`Sundays: ${items[0]}`, ...items.slice(1)],
    ];
    for (const ls of choices) {
      for (let s = Math.max(26 * u, fl); ; s = Math.max(fl, s * 0.97)) {
        if (ls.every((l) => m(l, stFont(s)) <= w)) {
          st = { size: s, lines: ls, height: ls.length * s * 1.3 };
          break;
        }
        if (s === fl) break;
      }
      if (st) break;
    }
    if (!st) {
      warnings.push(`The Sunday times are too long for ${f.label}.`);
      st = { size: fl, lines: choices[1], height: choices[1].length * fl * 1.3 };
    }
  }
  const stH = st ? st.height + 24 * u : 0;

  const rowH = Math.max(side ? Math.max(M, webH) : M + 22 * u + webH, q);
  const h = stH + rowH;
  return {
    h,
    warnings,
    draw: (x, y) => {
      let out = '';
      if (st)
        out += lines(st.lines, {
          family: 'sans',
          size: st.size,
          weight: 600,
          x,
          y,
          leading: 1.3,
          fill: C.ground,
        });
      const ry = y + stH;
      const stackH = side ? rowH : M + 22 * u + webH;
      const ly = side ? ry + (rowH - M) / 2 : ry + (rowH - stackH) / 2;
      out += image(assets.markWhite, x, ly, M, M);
      const nx = x + M + 0.9 * n2s;
      const nameH = n1.size * 1.15 + n2s * 1.3;
      const ny = ly + (M - nameH) / 2;
      out += lines([church.line1], { ...n1, x: nx, y: ny, leading: 1.15, fill: C.ground });
      out += lines([church.line2], {
        ...n2,
        x: nx,
        y: ny + n1.size * 1.15,
        leading: 1.3,
        fill: C.tint,
      });
      const webRight = x + w - (q ? q + qGap : 0);
      const wy = side ? ry + (rowH - webH) / 2 : ly + M + 22 * u;
      const wx = side ? webRight : x;
      const anchor = side ? 'end' : 'start';
      out += lines([web], { ...wf, x: wx, y: wy, leading: 1.3, fill: C.ground, anchor });
      if (ad)
        out += lines(ad.lines, {
          family: 'sans',
          size: ad.size,
          weight: 400,
          x: wx,
          y: wy + wf.size * 1.3,
          leading: 1.3,
          fill: C.tint,
          anchor,
        });
      if (q) out += qr(c.qr!, x + w - q, ry + (rowH - q) / 2, q, C.ink, C.ground);
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
): {
  defs: string;
  body: string;
} {
  const r = Math.max(0.6, 0.9 * u);
  return {
    defs:
      `<filter id="thick" x="-2%" y="-2%" width="104%" height="104%"><feMorphology operator="dilate" radius="${f1(r)}"/></filter>` +
      `<mask id="sk" style="mask-type:alpha" maskUnits="userSpaceOnUse"><image href="${ctx.assets.sketch}" x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" preserveAspectRatio="xMidYMax meet" filter="url(#thick)"/></mask>`,
    body: rect(b.x, b.y, b.w, b.h, C.ground, 'mask="url(#sk)" opacity="0.92"'),
  };
}

/**
 * The connect card: the auburn block on the left, a white writing side on the right.
 * Every word stays inside the safe line. The QR code's modules cover at least 0.8 in,
 * with what it does and the web address beside it. The writing lines are 0.4 in apart
 * or more, each field's label above its lines; a shorter card drops a prayer line
 * before it tightens the pitch.
 */
function connectCard(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  const fl = floorPx(f);
  const safe = area(f);
  const m = ctx.measure;
  const label = f.label;
  const dpi = f.print!.dpi;
  const warnings: string[] = [];
  let body = rect(0, 0, f.w, f.h, C.ground);

  const bw = Math.round(f.w * 0.47);
  const sw = 44 * u;
  const sh = 40 * u;
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
  body += `<path d="${poly(blockPts)}" fill="${C.auburn}"/>`;

  // Left: the words, then the code with what it does and the web address (or the mark).
  const x = safe.x;
  const colW = R - x - 40 * u;
  const web = cleanText(c.link) || ctx.church.web;
  const q = c.qr ? qrSide(c.qr, 0.8, dpi) : 0;
  const footH = q || 70 * u;
  // The mark and the church's name head the block: the card is picked up off a pew.
  const ns = fl;
  const nm1: FontSpec = { family: 'serif', size: ns * 1.3 };
  const nm2: FontSpec = { family: 'sans', size: ns, weight: 600 };
  const nameH = nm1.size * 1.12 + ns * 1.25;
  const NM = nameH;
  if (NM * 1.3 + Math.max(m(ctx.church.line1, nm1), m(ctx.church.line2, nm2)) > colW)
    warnings.push(`The church's name is too long for ${label}.`);
  let words =
    image(ctx.assets.markWhite, x, safe.y, NM, NM) +
    lines([ctx.church.line1], {
      ...nm1,
      x: x + NM * 1.3,
      y: safe.y,
      leading: 1.12,
      fill: C.ground,
    }) +
    lines([ctx.church.line2], {
      ...nm2,
      x: x + NM * 1.3,
      y: safe.y + nm1.size * 1.12,
      leading: 1.25,
      fill: C.tint,
    });
  const lockH = NM + 0.14 * dpi;
  const st = stack(
    c,
    { x, y: safe.y + lockH, w: colW, h: safe.h - lockH - footH - 32 * u },
    u,
    fl,
    m,
    {
      label,
      titleMax: 76 * u,
      body: true,
      titleMin: 34 * u,
    },
  );
  warnings.push(...st.warnings);
  words += st.svg;
  const fy = safe.y + safe.h - footH;
  if (q) {
    words += qr(c.qr!, x, fy, q, C.ink, C.ground);
    const tx = x + q + 0.4 * fl;
    const tw = R - tx - 10 * u;
    const head = fitText(
      glue(qrLabelFor(c)),
      {
        family: 'sans',
        weight: 700,
        maxLines: 2,
        max: fl,
        min: fl,
        leading: 1.2,
        maxW: tw,
        maxH: fl * 2.5,
      },
      m,
    );
    // The web address breaks only after its first slash.
    const wfont: FontSpec = { family: 'sans', size: fl };
    let wl = [web];
    const slash = web.indexOf('/');
    if (m(web, wfont) > tw && slash > 0) wl = [web.slice(0, slash + 1), web.slice(slash + 1)];
    if (head.overflow || wl.some((l) => m(l, wfont) > tw + 0.5))
      warnings.push(`The words beside the code are too long for ${label}.`);
    const wH = wl.length * fl * 1.25;
    const gap = 0.3 * fl;
    const top = fy + (q - head.height - gap - wH) / 2;
    words += lines(head.lines, {
      family: 'sans',
      weight: 700,
      size: fl,
      x: tx,
      y: top,
      leading: 1.2,
      fill: C.ground,
    });
    words += lines(wl, {
      family: 'sans',
      size: fl,
      x: tx,
      y: top + head.height + gap,
      leading: 1.25,
      fill: C.ground,
    });
  } else {
    words += image(ctx.assets.markWhite, x, fy, footH, footH);
  }

  // Right: the writing side. Navy labels over light navy lines to write on.
  const wx = R + 3 * sw + 56 * u;
  const wr = safe.x + safe.w;
  const ww = wr - wx;
  const head = 'Tell us about you';
  const headF: FontSpec = { family: 'serif', size: 50 * u };
  const headH = 50 * u * 1.15 + 30 * u;
  if (m(head, headF) > ww) warnings.push(`The writing side is too narrow on ${label}.`);
  const labOpts = {
    family: 'sans' as const,
    weight: 700,
    tracking: 0.08,
    caps: true,
    maxLines: 2,
    max: fl,
    min: fl,
    leading: 1.2,
    maxW: ww,
    maxH: fl * 2.5,
  };
  const fields: [string, number][] = [
    ['Name', 1],
    ['Email or phone', 1],
    ['Prayer requests', 3],
  ];
  const labs = fields.map(([n]) => fitText(n, labOpts, m));
  if (labs.some((r) => r.overflow)) warnings.push(`The writing side is too narrow on ${label}.`);
  const gapF = 26 * u;
  const labsH = labs.reduce((s, r) => s + r.height, 0);
  const minPitch = 0.4 * dpi;
  let pitch = 0;
  for (; fields[2][1] >= 1; fields[2][1]--) {
    const n = fields.reduce((s, [, k]) => s + k, 0);
    pitch = (safe.h - headH - labsH - (fields.length - 1) * gapF) / n;
    if (pitch >= minPitch) break;
  }
  if (pitch < minPitch) warnings.push(`There is too little room to write on ${label}.`);
  pitch = Math.min(0.5 * dpi, Math.max(minPitch, pitch));
  let yy = safe.y;
  let writing = lines([head], { ...headF, x: wx, y: yy, leading: 1.15, fill: C.navy });
  yy += headH;
  const ruleW = Math.max(2, 1.6 * u);
  fields.forEach(([, n], i) => {
    writing += lines(labs[i].lines, {
      family: 'sans',
      size: labs[i].size,
      weight: 700,
      tracking: 0.08,
      caps: true,
      x: wx,
      y: yy,
      leading: 1.2,
      fill: C.navy,
    });
    yy += labs[i].height;
    for (let k = 0; k < n; k++) {
      yy += pitch;
      writing += rect(wx, yy - ruleW, ww, ruleW, C.navyLight);
    }
    yy += gapF;
  });

  body += words + writing;
  return { svg: doc(f, ctx.assets, '', body), warnings };
}

/**
 * The yard sign, read from across the road: the title at a fifth of the sign's height
 * or more, the mark and the name, and one web address. An event, an announcement and a
 * time change also say when, short ("Dec 24, 6 pm", about two inches tall): a sign with
 * no date reads as every week. About seven words in all; the title gives way first.
 */
function yardSign(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const safe = area(f);
  const dpi = f.print!.dpi;
  const warnings: string[] = [];
  const mg = f.bleed + Math.round(0.3 * dpi);
  const L = mg;
  const T = mg;
  const R = f.w - mg;
  const B = f.h - mg;
  const pad = 0.6 * dpi;
  const cx = Math.max(safe.x, L + pad);
  const cr = Math.min(safe.x + safe.w, R - pad);

  // The band: the mark at the left and the web address at the right, the address 1.5 in
  // tall in its capitals or more (Familjen Grotesk's capitals are about 0.7 of its size),
  // read from across the road. A page link too long for that gives way to the church's
  // own address; the name goes on beside the mark only when there is room for it.
  const capK = 0.7;
  const webSize = (1.5 * dpi) / capK;
  const M = webSize * 1.1;
  const wfont: FontSpec = { family: 'sans', size: webSize, weight: 700 };
  const room = cr - cx - 1.35 * M;
  let web = cleanText(c.link) || ctx.church.web;
  if (m(web, wfont) > room) web = ctx.church.web;
  const wf = fitText(
    web,
    {
      family: 'sans',
      weight: 700,
      maxLines: 1,
      max: webSize,
      min: webSize * 0.8,
      leading: 1.2,
      maxW: room,
      maxH: M,
    },
    m,
  );
  if (wf.overflow || wf.size < webSize)
    warnings.push(`The web address is too long for ${f.label}.`);
  const n1: FontSpec = { family: 'serif', size: M * 0.4 };
  const n2: FontSpec = { family: 'sans', size: M * 0.27, weight: 600 };
  const nameW = Math.max(m(ctx.church.line1, n1), m(ctx.church.line2, n2));
  const showName = 1.3 * M + nameW + 0.4 * dpi + wf.width <= cr - cx;
  const contentBottom = Math.min(B - pad * 0.6, safe.y + safe.h);
  const bandTop = contentBottom - M - pad * 0.6;
  const sw = 0.09 * f.h;
  const sh = 0.03 * f.h;

  let body = rect(0, 0, f.w, f.h, C.ground);
  body += `<path d="${poly([
    [L, T],
    [R, T],
    [R, bandTop],
    [L, bandTop],
  ])}" fill="${C.auburn}"/>`;
  body += `<path d="${poly(steppedPts({ x: L, y: bandTop, w: R - L, h: B - bandTop }, sw, sh))}" fill="${C.navy}"/>`;
  const ly = contentBottom - M;
  body += image(ctx.assets.markWhite, cx, ly, M, M);
  if (showName) {
    const nameH = n1.size * 1.12 + n2.size * 1.3;
    const ny = ly + (M - nameH) / 2;
    body += lines([ctx.church.line1], {
      ...n1,
      x: cx + 1.3 * M,
      y: ny,
      leading: 1.12,
      fill: C.ground,
    });
    body += lines([ctx.church.line2], {
      ...n2,
      x: cx + 1.3 * M,
      y: ny + n1.size * 1.12,
      leading: 1.3,
      fill: C.tint,
    });
  }
  body += lines(wf.lines, {
    family: 'sans',
    size: wf.size,
    weight: 700,
    x: cr,
    y: ly + (M - wf.height) / 2,
    leading: 1.2,
    fill: C.ground,
    anchor: 'end',
  });

  // When: mandatory for the kinds that happen once.
  const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
  // A Sunday sign says when Sunday is ("Sundays, 11 am"), from Church facts.
  const when = dated ? shortWhen(c) : c.kind === 'sunday' ? sundayLine(c) : '';
  if (dated && !when)
    warnings.push(`Add the date for ${f.label}: a sign with no date reads as every week.`);
  const ytext = c.kind === 'verse' ? `“${cleanText(c.title)}”` : shortTime(cleanText(c.title));
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const n = count(ytext) + count(when);
  if (c.kind !== 'verse' && n > 8)
    warnings.push(
      `${f.label} reads best in about seven words, and this one has ${n}. Try a shorter title.`,
    );

  // The title, a fifth of the height or larger (a little smaller beside a date), with the
  // date under it, the two centred together in the field.
  const top = Math.max(safe.y, T + pad);
  const bottom = bandTop - 3 * sh - pad * 0.6;
  const df = when
    ? fitText(
        whole(when),
        {
          family: 'sans',
          weight: 700,
          maxLines: 1,
          max: 0.12 * f.h,
          min: 0.075 * f.h,
          leading: 1.1,
          maxW: cr - cx,
          maxH: 0.14 * f.h,
        },
        m,
      )
    : null;
  if (df?.overflow) warnings.push(`The date is too long for ${f.label}.`);
  const dGap = df ? 0.04 * f.h : 0;
  const dH = df ? df.height + dGap : 0;
  const yt = {
    family: 'serif' as const,
    maxLines: df ? 2 : 3,
    max: (df ? 0.27 : 0.34) * f.h,
    min: (df ? 0.13 : 0.2) * f.h,
    leading: 1.0,
    tracking: -0.014,
    maxW: cr - cx,
    maxH: bottom - top - dH,
  };
  let t = fitTitle(ytext, yt, m);
  if (t.overflow) {
    // Too long to read from the road: say so, and still keep it on the sign.
    warnings.push(`The title is too long for ${f.label}. Try five words or fewer.`);
    t = fitTitle(ytext, { ...yt, maxLines: 7, max: yt.min, min: 0.06 * f.h }, m);
  }
  const y0 = top + Math.max(0, (bottom - top - t.height - dH) / 2);
  body += lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: -0.014,
    x: cx,
    y: y0,
    leading: 1.0,
    fill: C.ground,
  });
  if (df)
    body += lines(unglue(df.lines), {
      family: 'sans',
      size: df.size,
      weight: 700,
      x: cx,
      y: y0 + t.height + dGap,
      leading: 1.1,
      fill: C.ground,
    });
  return { svg: doc(f, ctx.assets, '', body), warnings };
}

/**
 * The YouTube channel art (round two, 2026-10-27). Every device shows only the middle
 * 1546 x 423 strip, so the strip holds just two things, both large: the title at the
 * left, as tall as the strip allows (two lines at about 40% of its height), and the mark
 * with the church's name in a column at the right. Outside the strip, where a TV shows
 * more, the auburn runs on to the paper border and the picture (the photo, or the
 * building sketch cut into the auburn) fills the room above the strip. Channel art
 * stays up for weeks, so an event or a time change prints its date under the title.
 */
function channelArt(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const s = safeBox(f);
  const fl = Math.min(floorPx(f), 0.1 * s.h);
  const warnings: string[] = [];
  const mg = Math.round(34 * unit(f));
  const verse = c.kind === 'verse';
  const photo = verse ? undefined : c.photo;
  let defs = photo ? WARM : '';
  let body = rect(0, 0, f.w, f.h, C.ground) + rect(mg, mg, f.w - 2 * mg, f.h - 2 * mg, C.auburn);

  // The picture, above the strip: seen on a TV, cropped away on a phone or a laptop.
  const above = { x: mg, y: mg, w: f.w - 2 * mg, h: s.y - 0.16 * s.h - mg };
  if (photo) body += photoIn(photo, 'ph', above);
  else if (!verse) {
    const sk = carvedSketch(
      ctx,
      { x: s.x, y: mg + 0.12 * above.h, w: s.w * 0.62, h: above.h * 0.88 },
      unit(f) * 1.45,
    );
    defs += sk.defs.replace('xMidYMax', 'xMinYMax');
    body += sk.body;
  }

  // The name column at the right of the strip: the mark over the two lines of the name.
  const colW = s.w * 0.26;
  const colX = s.x + s.w - colW;
  const n2s = Math.max(fl, 0.1 * s.h);
  const n1 = fitText(
    ctx.church.line1,
    {
      family: 'serif',
      maxLines: 1,
      max: 0.17 * s.h,
      min: n2s,
      leading: 1.15,
      maxW: colW,
      maxH: s.h,
    },
    m,
  );
  const n2: FontSpec = { family: 'sans', size: n2s, weight: 600 };
  if (n1.overflow || m(ctx.church.line2, n2) > colW)
    warnings.push(`The church's name is too long for ${f.label}.`);
  const M = Math.min(0.42 * s.h, colW * 0.5);
  const colH = M + 0.12 * s.h + n1.size * 1.15 + n2s * 1.3;
  let y = s.y + (s.h - colH) / 2;
  body += image(ctx.assets.markWhite, colX, y, M, M);
  y += M + 0.12 * s.h;
  body += lines([ctx.church.line1], {
    family: 'serif',
    size: n1.size,
    x: colX,
    y,
    leading: 1.15,
    fill: C.ground,
  });
  body += lines([ctx.church.line2], {
    ...n2,
    x: colX,
    y: y + n1.size * 1.15,
    leading: 1.3,
    fill: C.tint,
  });

  // The date, for the kinds that happen once.
  const tw = s.w - colW - 0.06 * s.w;
  const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
  const when = dated ? shortWhen(c) : '';
  const df = when
    ? fitText(
        whole(when),
        {
          family: 'sans',
          weight: 700,
          maxLines: 1,
          max: 0.17 * s.h,
          min: fl,
          leading: 1.15,
          maxW: tw,
          maxH: 0.2 * s.h,
        },
        m,
      )
    : null;
  if (df?.overflow) warnings.push(`The date is too long for ${f.label}.`);
  const dGap = df ? 0.07 * s.h : 0;
  const dH = df ? df.height + dGap : 0;

  // The title: as large as the strip's height and the left column allow.
  const text = verse ? `“${cleanText(c.title)}”` : cleanText(c.title);
  const topts = {
    family: 'serif' as const,
    tracking: -0.014,
    maxLines: verse ? 5 : df ? 2 : 3,
    max: (s.h - dH) / 1.02,
    min: Math.max(fl, (verse ? 0.1 : 0.15) * s.h),
    leading: verse ? 1.13 : 1.02,
    maxW: tw,
    maxH: s.h - dH,
  };
  // The strip is short, so a short word alone on a line ("Trunk / or Treat") is the
  // better trade when keeping it whole would cost a fifth of the title's size.
  let t = fitTitle(text, topts, m);
  const plain = fitText(text, topts, m);
  if (!plain.overflow && plain.size > t.size * 1.2) t = { ...plain, lines: unglue(plain.lines) };
  if (t.overflow) warnings.push(`The title is too long for ${f.label}. Try fewer words.`);
  const ty = s.y + Math.max(0, (s.h - t.height - dH) / 2);
  body += lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: -0.014,
    x: s.x,
    y: ty,
    leading: verse ? 1.13 : 1.02,
    fill: C.ground,
  });
  if (df)
    body += lines(unglue(df.lines), {
      family: 'sans',
      size: df.size,
      weight: 700,
      x: s.x,
      y: ty + t.height + dGap,
      leading: 1.15,
      fill: C.ground,
    });
  return { svg: doc(f, ctx.assets, defs, body), warnings };
}

/**
 * A business-card piece (3.5 x 2 in, the invite card when it carries another kind): the
 * auburn field runs to the bleed with the kicker, the title and when; the QR code sits at
 * the right (0.8 in of modules); the navy foot steps up three bricks and carries the web
 * address under the code. At 11pt there is room for nothing else.
 */
function smallCard(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const safe = area(f);
  const dpi = f.print!.dpi;
  const fl = floorPx(f);
  const warnings: string[] = [];
  const web = cleanText(c.link) || ctx.church.web;

  // The foot: the web address on navy, its top stepping up at the right.
  const wf = fitText(
    web,
    {
      family: 'sans',
      weight: 700,
      maxLines: 1,
      max: fl * 1.15,
      min: fl,
      leading: 1.25,
      maxW: safe.w,
      maxH: fl * 1.5,
    },
    m,
  );
  if (wf.overflow) warnings.push(`The web address is too long for ${f.label}.`);
  const wy = safe.y + safe.h - wf.height;
  const bandTop = wy - 0.07 * dpi;
  const sw = 0.13 * dpi;
  const sh = 0.04 * dpi;
  let body =
    rect(0, 0, f.w, f.h, C.auburn) +
    `<path d="${poly(steppedPts({ x: 0, y: bandTop, w: f.w, h: f.h - bandTop }, sw, sh))}" fill="${C.navy}"/>`;
  body += lines(wf.lines, {
    family: 'sans',
    size: wf.size,
    weight: 700,
    x: safe.x,
    y: wy,
    leading: 1.25,
    fill: C.ground,
  });

  // The code at the right, clear of the steps.
  const q = c.qr ? qrSide(c.qr, 0.8, dpi) : 0;
  const top = safe.y;
  const bottom = bandTop - 3 * sh - 0.05 * dpi;
  if (q) {
    if (top + q > bottom + 0.5) warnings.push(`The code is too large for ${f.label}.`);
    body += qr(c.qr!, safe.x + safe.w - q, top, q, C.ink, C.ground);
  }

  // The words: the kicker, the title, and when.
  const w = safe.w - (q ? q + 0.15 * dpi : 0);
  const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
  const whenLines = dated
    ? [shortWhen(c)].filter(Boolean)
    : c.kind === 'sermon'
      ? [cleanText(c.reference)].filter(Boolean)
      : (c.when ?? []).map(cleanText).filter(Boolean).slice(0, 2);
  let y = top;
  let words = '';
  const kicker = cleanText(c.kicker);
  if (kicker) {
    const r = fitText(
      kicker,
      {
        family: 'sans',
        weight: 700,
        tracking: 0.14,
        caps: true,
        maxLines: 1,
        max: fl,
        min: fl,
        leading: 1.2,
        maxW: w,
        maxH: fl * 1.3,
      },
      m,
    );
    if (r.overflow) warnings.push(`The kicker is too long for ${f.label}. Try fewer words.`);
    words += lines(r.lines, {
      family: 'sans',
      size: r.size,
      weight: 700,
      tracking: 0.14,
      caps: true,
      x: safe.x,
      y,
      leading: 1.2,
      fill: C.ground,
    });
    y += r.height + 0.04 * dpi;
  }
  const whenH = whenLines.length * fl * 1.3;
  const whenGap = whenLines.length ? 0.06 * dpi : 0;
  const text = c.kind === 'verse' ? `“${cleanText(c.title)}”` : cleanText(c.title);
  const t = fitTitle(
    text,
    {
      family: 'serif',
      tracking: -0.01,
      maxLines: c.kind === 'verse' ? 4 : 2,
      max: 0.4 * dpi,
      min: fl * 1.25,
      leading: 1.04,
      maxW: w,
      maxH: Math.max(0, bottom - y - whenH - whenGap),
    },
    m,
  );
  if (t.overflow) warnings.push(`The title is too long for ${f.label}. Try fewer words.`);
  words += lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: -0.01,
    x: safe.x,
    y,
    leading: 1.04,
    fill: C.ground,
  });
  y += t.height + whenGap;
  for (const l of whenLines) {
    const r = fitText(
      whole(l),
      {
        family: 'sans',
        weight: 700,
        maxLines: 1,
        max: fl,
        min: fl,
        leading: 1.3,
        maxW: w,
        maxH: fl * 1.4,
      },
      m,
    );
    if (r.overflow) warnings.push(`The date or time is too long for ${f.label}.`);
    words += lines(r.lines, {
      family: 'sans',
      size: r.size,
      weight: 700,
      x: safe.x,
      y,
      leading: 1.3,
      fill: C.ground,
    });
    y += r.height;
  }
  if (y > bottom + 1) warnings.push(`There is too much to say on ${f.label}. Try fewer words.`);
  body += words;
  return { svg: doc(f, ctx.assets, '', body), warnings };
}

// ── The overlap guard ───────────────────────────────────────────────────────

/** A set block of words and the box it covers, for the overlap guard. */
interface Placed {
  name: string;
  /** Higher stays longer; the title is 100 and is never dropped. */
  rank: number;
  box: Box;
  svg: string;
}

const hits = (a: Box, b: Box) =>
  a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;

/**
 * The guard every layout ends with: no words on other words or on the band. While any
 * block touches the band or another block, the lowest-ranked block among those
 * touching is left off. The title is never dropped; if it still touches, the Studio
 * is told there is too much to say.
 */
function settle(blocks: Placed[], keepOut: Box[], label: string, warnings: string[]): string {
  let live = blocks.filter((b) => b.svg && b.box.h > 0);
  for (;;) {
    const bad = live.filter(
      (b) => keepOut.some((k) => hits(b.box, k)) || live.some((o) => o !== b && hits(b.box, o.box)),
    );
    if (!bad.length) break;
    const low = bad.reduce((a, b) => (b.rank < a.rank ? b : a));
    if (low.rank >= 100) {
      warnings.push(`There is too much to say on ${label}. Try fewer words.`);
      break;
    }
    live = live.filter((b) => b !== low);
    warnings.push(`The ${low.name} is left off ${label}: there is no room for it.`);
  }
  return live.map((b) => b.svg).join('');
}

/** The band's outline as boxes: the bar itself and the three steps at its right end. */
const bandBoxes = (L: number, R: number, top: number, B: number, sw: number, sh: number): Box[] => [
  { x: L, y: top, w: R - L, h: B - top },
  { x: R - 3 * sw, y: top - sh, w: 3 * sw, h: sh },
  { x: R - 2 * sw, y: top - 2 * sh, w: 2 * sw, h: sh },
  { x: R - sw, y: top - 3 * sh, w: sw, h: sh },
];

// ── The wide sizes ──────────────────────────────────────────────────────────

/**
 * The Facebook page cover, the Facebook event cover and the YouTube thumbnail (final
 * review, 2026-10-28). These are seen small and briefly, so they say four things only:
 * the kicker (or, for a dated kind, the short date: "Dec 24, 6 pm"), the title as large
 * as the room allows, the mark and the church's name, and the web address. No times and
 * no body. The thumbnail is read at 168px wide in a list, so it keeps only the top line,
 * the title and a small mark (YouTube names the channel beside it). The picture (the
 * photo, or the building sketch) takes the right of the field.
 */
function wide(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const s = safeBox(f);
  const fl = floorPx(f);
  const label = f.label;
  const warnings: string[] = [];
  const thumb = f.id === 'youtube-thumb';
  const verse = c.kind === 'verse';
  const photo = verse ? undefined : c.photo;
  let defs = photo ? WARM : '';
  const u = unit(f);
  const mg = Math.round(34 * u);
  const L = mg;
  const T = mg;
  const R = f.w - mg;
  const B = f.h - mg;
  const pad = Math.max(36, 0.05 * f.h);
  const cx = Math.max(s.x, L + pad);
  const cr = Math.min(s.x + s.w, R - pad);
  const sw = 0.03 * (R - L);
  const sh = 0.34 * sw;

  // The band: the mark, the name, and the web address at the right. A long page link
  // that does not fit beside the name gives way to the church's own address.
  let bandTop = B;
  let band = '';
  const keepOut: Box[] = [];
  if (!thumb) {
    const n2s = fl;
    const n1: FontSpec = { family: 'serif', size: n2s * 1.35 };
    const n2: FontSpec = { family: 'sans', size: n2s, weight: 600 };
    const nameH = n1.size * 1.12 + n2s * 1.3;
    const M = nameH * 1.05;
    const nameW = Math.max(m(ctx.church.line1, n1), m(ctx.church.line2, n2));
    const lockW = M + 0.35 * M + nameW;
    const wf: FontSpec = { family: 'sans', size: fl, weight: 700 };
    const room = cr - cx - lockW - 0.6 * M;
    let web = cleanText(c.link) || ctx.church.web;
    if (m(web, wf) > room) web = ctx.church.web;
    const showName = m(web, wf) <= room;
    if (!showName && m(web, wf) > cr - cx - 1.4 * M)
      warnings.push(`The web address is too long for ${label}.`);
    const bpad = 0.32 * M;
    const rowBottom = Math.min(B - bpad, s.y + s.h);
    const rowTop = rowBottom - M;
    bandTop = rowTop - bpad;
    band += `<path d="${poly(steppedPts({ x: L, y: bandTop, w: R - L, h: B - bandTop }, sw, sh))}" fill="${C.navy}"/>`;
    band += image(ctx.assets.markWhite, cx, rowTop, M, M);
    if (showName) {
      const nx = cx + 1.35 * M;
      const ny = rowTop + (M - nameH) / 2;
      band += lines([ctx.church.line1], { ...n1, x: nx, y: ny, leading: 1.12, fill: C.ground });
      band += lines([ctx.church.line2], {
        ...n2,
        x: nx,
        y: ny + n1.size * 1.12,
        leading: 1.3,
        fill: C.tint,
      });
    }
    band += lines([web], {
      ...wf,
      x: cr,
      y: rowTop + (M - wf.size * 1.25) / 2,
      leading: 1.25,
      fill: C.ground,
      anchor: 'end',
    });
    keepOut.push(...bandBoxes(L, R, bandTop, B, sw, sh));
  }

  // The picture at the right of the field; a verse keeps the whole field for its words.
  const px = Math.round(L + (R - L) * (thumb ? 0.66 : 0.62));
  const pic: Box | null = verse ? null : { x: px, y: T, w: R - px, h: bandTop - T };
  let pics = '';
  if (pic && photo) pics = photoIn(photo, 'ph', pic);
  else if (pic) {
    const sy = Math.max(T + pad, s.y);
    const sk = carvedSketch(
      ctx,
      {
        x: pic.x + pad * 0.5,
        y: sy,
        w: Math.min(R, s.x + s.w + pad) - pic.x - pad,
        h: (thumb ? B - pad : bandTop - 3 * sh - pad * 0.4) - sy,
      },
      u * 1.3,
    );
    defs += sk.defs;
    pics = sk.body;
  }

  // The words' column.
  const top = Math.max(s.y, T + pad * 0.8);
  let bottom = thumb ? Math.min(s.y + s.h, B - pad * 0.6) : bandTop - pad * 0.7;
  const colR = pic ? px - pad : cr;
  const colW = colR - cx;
  const placed: Placed[] = [];

  // The thumbnail's small mark, at the foot of the column (YouTube's clock is at the right).
  if (thumb) {
    const M = 0.15 * f.h;
    placed.push({
      name: 'mark',
      rank: 90,
      box: { x: cx, y: bottom - M, w: M, h: M },
      svg: image(ctx.assets.markWhite, cx, bottom - M, M, M),
    });
    bottom -= M + 0.05 * f.h;
  }

  // The top line: the short date for a kind that happens once, else the kicker.
  const dated = c.kind === 'event' || c.kind === 'announcement' || c.kind === 'time-change';
  const date = dated ? shortWhen(c) : '';
  const kicker = date || (verse ? '' : cleanText(c.kicker));
  const kf = date
    ? { family: 'sans' as const, weight: 700, tracking: 0, caps: false }
    : { family: 'sans' as const, weight: 700, tracking: 0.18, caps: true };
  const ksize = Math.max(fl, (thumb ? 0.075 : 0.06) * f.h);
  const kr = kicker
    ? fitText(
        date ? whole(kicker) : kicker,
        { ...kf, maxLines: 1, max: ksize, min: fl, leading: 1.2, maxW: colW, maxH: ksize * 1.3 },
        m,
      )
    : null;
  if (kr?.overflow) warnings.push(`The ${date ? 'date' : 'kicker'} is too long for ${label}.`);
  const kGap = kr ? 0.035 * f.h : 0;

  // A verse names its reference under the words.
  const ref = verse
    ? [cleanText(c.reference), cleanText(c.translation)].filter(Boolean).join('  ·  ')
    : '';
  const rr = ref
    ? fitText(
        ref,
        {
          family: 'sans',
          weight: 700,
          tracking: 0.14,
          caps: true,
          maxLines: 1,
          max: ksize,
          min: fl,
          leading: 1.25,
          maxW: colW,
          maxH: ksize * 1.4,
        },
        m,
      )
    : null;
  const rGap = rr ? 0.035 * f.h : 0;

  // The title: as large as the column allows, never smaller than the line above it.
  const text = verse ? `“${cleanText(c.title)}”` : cleanText(c.title);
  const room = bottom - top - (kr ? kr.height + kGap : 0) - (rr ? rr.height + rGap : 0);
  const tMin = Math.max(fl * 1.2, (kr?.size ?? 0) * 1.25, (rr?.size ?? 0) * 1.25);
  const topts = {
    family: 'serif' as const,
    tracking: -0.014,
    maxLines: verse ? 4 : 3,
    max: (thumb ? 0.34 : 0.24) * f.h,
    min: Math.max(1, Math.min(tMin, room)),
    leading: verse ? 1.12 : 1.02,
    maxW: colW,
    maxH: Math.max(0, room),
  };
  const t = fitTitle(text, topts, m);
  if (t.overflow) warnings.push(`The title is too long for ${label}. Try fewer words.`);

  // Placed together in the middle of the column.
  const total = (kr ? kr.height + kGap : 0) + t.height + (rr ? rr.height + rGap : 0);
  let y = top + Math.max(0, (bottom - top - total) / 2);
  if (kr) {
    placed.push({
      name: date ? 'date' : 'kicker',
      rank: 60,
      box: { x: cx, y, w: kr.width, h: kr.height },
      svg: lines(unglue(kr.lines), {
        ...kf,
        size: kr.size,
        x: cx,
        y,
        leading: 1.2,
        fill: C.ground,
      }),
    });
    y += kr.height + kGap;
  }
  let tsvg = lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: -0.014,
    x: cx + (verse ? m('“', { family: 'serif', size: t.size }) : 0),
    y,
    leading: topts.leading,
    fill: C.ground,
  });
  if (verse) tsvg = tsvg.replace(/<tspan x="[^"]+"/, `<tspan x="${f1(cx)}"`);
  placed.push({ name: 'title', rank: 100, box: { x: cx, y, w: t.width, h: t.height }, svg: tsvg });
  y += t.height + rGap;
  if (rr)
    placed.push({
      name: 'reference',
      rank: 70,
      box: { x: cx, y, w: rr.width, h: rr.height },
      svg: lines(rr.lines, {
        family: 'sans',
        size: rr.size,
        weight: 700,
        tracking: 0.14,
        caps: true,
        x: cx,
        y,
        leading: 1.25,
        fill: C.ground,
      }),
    });

  const words = settle(placed, keepOut, label, warnings);
  const body =
    rect(0, 0, f.w, f.h, C.ground) + rect(L, T, R - L, B - T, C.auburn) + pics + band + words;
  return { svg: doc(f, ctx.assets, defs, body), warnings };
}

function draw(c: Content, f: Format, ctx: Ctx): Rendered {
  if (c.kind === 'welcome' && f.id === 'connect-card') return connectCard(c, f, ctx);
  if (f.print && f.print.inW * f.print.inH < 10) return smallCard(c, f, ctx);
  if (f.id === 'youtube-banner') return channelArt(c, f, ctx);
  if (f.id === 'yard-sign') return yardSign(c, f, ctx);
  if (['page-cover', 'youtube-thumb', 'event-cover'].includes(f.id)) return wide(c, f, ctx);
  const banner = f.shape === 'banner';
  // A banner's safe strip is short, so its type scale is set a step larger.
  const u = unit(f) * (banner ? 1.45 : 1);
  const fl = floorPx(f);
  const safe = area(f);
  const m = ctx.measure;
  const label = f.label;
  const dpi = f.print?.dpi ?? 0;
  const verse = c.kind === 'verse';
  const social = f.group === 'social';
  // A verse stands alone on the plain field: no photo, no sketch.
  const photo = verse ? undefined : c.photo;
  let defs = photo ? WARM : '';
  let pics = '';
  let over = '';
  const warnings: string[] = [];

  // The paper border, and the inked area inside it.
  const mg = f.print ? f.bleed + Math.round(0.2 * dpi) : Math.round(34 * unit(f));
  const L = mg;
  const T = mg;
  const R = f.w - mg;
  const B = f.h - mg;
  const H = B - T;
  const pad = 52 * u;
  const cx = Math.max(safe.x, L + pad);
  const cr = Math.min(safe.x + safe.w, R - pad);

  // The door hanger: the printer's die (1.25 to 1.75 in, centred 1 to 1.25 in down)
  // varies, so nothing marks the hole and the top 2.5 in carry no art and no words;
  // the headline starts just under it, the picture sits lower.
  const hanger = f.id === 'door-hanger';
  const hangerTop = hanger ? f.bleed + 2.5 * dpi : 0;

  // The covers and the YouTube thumbnail: a slim band, the mark, the name and the address.
  const slim = f.id === 'page-cover' || f.id === 'youtube-thumb';
  // The YouTube channel art's safe strip is too short for a band; YouTube names the channel.
  const noBand = banner && !slim;
  // Tall, portrait and square pieces stack the picture over the words.
  const vertical = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  // On a phone a real photo leads: it takes the top 45% or more of a tall post.
  const photoLeads = !!photo && social && vertical;
  const titleMax =
    (banner
      ? 150
      : f.id === 'story'
        ? 240
        : f.shape === 'tall'
          ? 200
          : f.shape === 'portrait'
            ? 180
            : vertical
              ? 150
              : 170) * u;
  // The sentence under the title goes where it cannot be read at the floor: the slide
  // (read from the pews), the thumbnail and covers, and a post a photo leads.
  const withBody = !banner && f.id !== 'youtube-thumb' && f.group !== 'screen' && !photoLeads;

  // The band at the foot: its size comes first, so the words know their room.
  const sw = 50 * u;
  const sh = 17 * u;
  const bpad = slim ? 24 * u : 34 * u;
  let bandTop = B;
  if (!noBand) {
    const im = imprint(c, f, ctx, u, fl, cr - cx, slim);
    warnings.push(...im.warnings);
    const contentBottom = Math.min(B - (slim ? 22 : 30) * u, safe.y + safe.h);
    bandTop = contentBottom - im.h - bpad;
    over += im.draw(cx, bandTop + bpad);
  }

  // The words' box, and the picture beside or above it.
  let words: Box;
  let pic: Box | null = null;
  if (vertical) {
    words = { x: cx, y: T, w: cr - cx, h: bandTop - 3 * sh - 40 * u - T };
  } else {
    const split = !verse;
    const px = banner ? Math.round(safe.x + safe.w * 0.6) : Math.round(L + (R - L) * 0.58);
    const top = Math.max(safe.y, T + pad);
    // The band's steps climb at the right, under the picture, so the words need not clear them.
    const bottom = noBand ? Math.min(B - pad, safe.y + safe.h) : bandTop - (slim ? 26 : 40) * u;
    words = {
      x: cx,
      y: top,
      w: (split ? Math.min(cr, px - pad * 1.3) : cr) - cx,
      h: bottom - top,
    };
    if (split) pic = { x: px, y: T, w: R - px, h: bandTop - T };
  }

  // The information under its rule at the foot of the words, in its full form and as
  // one plain line, for the hierarchy below.
  const infoFull = infoPiece(c, Math.min(words.w, 900 * u), u, fl, m, label, {
    inline: banner || slim,
    wide: !vertical,
  });
  const infoLine = infoPiece(c, Math.min(words.w, 900 * u), u, fl, m, label, {
    inline: true,
    wide: !vertical,
  });
  const infoGap = 40 * u;
  const W = words;

  /** Sets the words with or without the body and the information; returns the blocks. */
  const lay = (withB: boolean, info: Piece | null, picK = 1) => {
    const infoH = info ? info.h + infoGap : 0;
    const out: Placed[] = [];
    let wTop = 0;
    let p: Box | null = pic;
    let st: ReturnType<typeof stack>;
    let stTop: number;
    if (hanger) {
      // Words first, from just under the clear top; the picture takes the room under them.
      const top = Math.max(safe.y, hangerTop);
      const bottom = W.y + W.h;
      const keepPic = verse ? 0 : 0.9 * dpi;
      st = stack(c, { ...W, y: top, h: Math.max(0, bottom - infoH - top - keepPic) }, u, fl, m, {
        label,
        titleMax,
        body: withB,
      });
      stTop = top;
      wTop = top + st.h + infoH;
      p = verse ? null : { x: L, y: wTop + pad, w: R - L, h: bandTop - wTop - pad };
    } else if (vertical) {
      // The picture takes what the words leave, between a floor and a ceiling: the words
      // are set first (the title as large as its own limit), then sit on the information.
      const minPic = verse
        ? 0
        : picK *
          H *
          (photoLeads
            ? f.shape === 'square'
              ? 0.4
              : 0.45
            : photo
              ? 0.26
              : f.shape === 'square'
                ? 0.13
                : 0.17);
      const maxPic = verse
        ? 0
        : H * (photoLeads ? 0.58 : photo ? 0.5 : f.id === 'story' ? 0.36 : 0.3);
      const firstTop = Math.max(safe.y, T + minPic + pad);
      const bottom = W.y + W.h;
      st = stack(c, { ...W, y: firstTop, h: Math.max(0, bottom - infoH - firstTop) }, u, fl, m, {
        label,
        titleMax,
        body: withB,
      });
      // A verse is centred in its field; everything else sits on the information.
      const total = st.h + infoH;
      stTop = verse
        ? firstTop + Math.max(0, (bottom - firstTop - total) / 2)
        : Math.max(firstTop, bottom - total);
      if (!verse) {
        const picBottom = Math.max(T + minPic, Math.min(T + maxPic, stTop - pad));
        p = { x: L, y: T, w: R - L, h: picBottom - T };
        // When the picture has reached its ceiling, the words sit in the middle of the
        // field left under it rather than leaving a gap of bare ink above them.
        const gapTop = picBottom + pad;
        if (stTop > gapTop) stTop = gapTop + (stTop - gapTop) / 2;
      }
      st = {
        ...st,
        svg: `<g transform="translate(0 ${f1(stTop - firstTop)})">${st.svg}</g>`,
      };
      wTop = stTop;
    } else {
      const bottom = W.y + W.h;
      st = stack(c, { ...W, h: Math.max(0, bottom - infoH - W.y) }, u, fl, m, {
        label,
        titleMax,
        body: withB,
        // On a cover's short strip a time change's date says which Sunday; the kicker goes.
        kicker: !(banner && c.kind === 'time-change'),
      });
      const total = st.h + infoH;
      // The words sit together on the information; a verse and a banner are centred.
      const spare = Math.max(0, bottom - W.y - total);
      stTop = W.y + (verse || banner ? spare / 2 : spare);
      st = { ...st, svg: `<g transform="translate(0 ${f1(stTop - W.y)})">${st.svg}</g>` };
    }
    out.push({ name: 'title', rank: 100, box: { x: W.x, y: stTop, w: W.w, h: st.h }, svg: st.svg });
    if (info) {
      const iy = stTop + st.h + infoGap;
      out.push({
        name: c.kind === 'sunday' || c.kind === 'welcome' ? 'times' : 'date and times',
        rank: 50,
        box: { x: W.x, y: iy, w: W.w, h: info.h },
        svg: info.draw(W.x, iy),
      });
    }
    const second = Math.max(info?.size ?? 0, st.bodySize);
    return { out, wTop, p, st, info, ok: st.titleSize >= 1.2 * second };
  };

  // The title is never smaller than the lines under it: the body goes first, then the
  // timetable becomes one plain line, then a photo that leads gives up some room, then the
  // information goes (a verse keeps its reference). Secondary lines go before a title shrinks.
  const tries: [boolean, Piece | null, number?][] = [[withBody, infoFull]];
  if (withBody) tries.push([false, infoFull]);
  if (infoLine && infoLine !== infoFull) tries.push([false, infoLine]);
  // A photo that leads gives up some of its room before the information goes.
  if (photoLeads) {
    tries.push([false, infoFull, 0.65]);
    if (infoLine && infoLine !== infoFull) tries.push([false, infoLine, 0.65]);
  }
  if (!verse && infoFull) tries.push([false, null]);
  let laid = lay(...tries[0]);
  for (let i = 1; i < tries.length && !laid.ok; i++) laid = lay(...tries[i]);
  warnings.push(...laid.st.warnings, ...(laid.info?.warnings ?? []));
  if (withBody && laid.st.bodySize === 0 && cleanText(c.body))
    warnings.push(`The sentence under the title is left off ${label} to keep the title large.`);
  if (infoFull && !laid.info)
    warnings.push(`The date and times are left off ${label} to keep the title large.`);
  pic = laid.p;
  const wordsTop = laid.wTop;
  // The guard: nothing set over the band or over other words.
  const keepOut = noBand ? [] : bandBoxes(L, R, bandTop, B, sw, sh);
  over += settle(laid.out, keepOut, label, warnings);

  // The picture: the photo, warm and hard edged, or the building sketch cut into the auburn.
  if (pic && pic.h < 0.6 * dpi && hanger) pic = null;
  if (pic && photo) {
    pics += photoIn(photo, 'ph', pic);
  } else if (pic) {
    const p = pic;
    const sb = hanger
      ? (() => {
          // The sketch sits in the middle of the room under the words, not on the band.
          const room = Math.max(0, p.h - 3 * sh - pad * 0.6);
          const h = Math.min(room, (cr - cx) * 0.62);
          return { x: cx, y: p.y + (room - h) / 2, w: cr - cx, h };
        })()
      : vertical
        ? { x: cx, y: T + pad * 0.8, w: cr - cx, h: 0 }
        : {
            x: p.x + pad * 0.4,
            y: banner ? Math.max(T + pad, safe.y) : T + pad,
            w: Math.min(R - pad, banner ? safe.x + safe.w + pad * 3 : R - pad) - p.x - pad * 0.4,
            h: 0,
          };
    if (!hanger)
      sb.h = vertical
        ? Math.max(p.y + p.h, wordsTop - pad * 0.9) - sb.y
        : (noBand ? Math.min(B - pad, safe.y + safe.h) : bandTop - 3 * sh - 14 * u) - sb.y;
    const sk = carvedSketch(ctx, sb, u);
    defs += sk.defs;
    pics += sk.body;
  }

  // The field, the picture, then the band, drawn over the picture so its steps climb into it.
  const field = poly([
    [L, T],
    [R, T],
    [R, bandTop],
    [L, bandTop],
  ]);
  const band = poly(steppedPts({ x: L, y: bandTop, w: R - L, h: B - bandTop }, sw, sh));
  const body =
    rect(0, 0, f.w, f.h, C.ground) +
    `<path d="${field}" fill="${C.auburn}"/>` +
    pics +
    (noBand ? '' : `<path d="${band}" fill="${C.navy}"/>`) +
    over;
  return { svg: doc(f, ctx.assets, defs, body), warnings };
}

/**
 * The template. Words kept together are joined by a word joiner while they are set
 * (see glue()); the measure reads it as a space, and the finished SVG prints a space.
 */
function render(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const measure: Measure = (t, font) => m(t.split(GLUE).join(' '), font);
  const r = draw(c, f, { ...ctx, measure });
  return { svg: r.svg.split(GLUE).join(' '), warnings: [...new Set(r.warnings)] };
}

export const press: Direction = {
  id: 'press',
  name: 'Press',
  summary:
    'Two flat inks on paper: an auburn field with big cream Young Serif, warm natural photos, and a navy imprint band whose corner steps up three bricks like the mark.',
  render,
};
