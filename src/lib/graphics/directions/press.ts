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
//   auburn  the first ink: a flat field. A very light scatter of paper flecks
//           shows through it (a third of the mark's own density), only in the
//           field: never on type, photos or the navy band. Every word on it is
//           cream Young Serif or cream Familjen Grotesk (6.3:1).
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

import { printMask } from '../../../../scripts/lib/brick-print.mjs';
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
 * The smallest type a size may carry: 26px on a 1080-wide screen size (scaled with
 * the canvas width), 11pt in print (0.153 in, about 46px at 300 dpi).
 */
const floorPx = (f: Format) =>
  f.print ? 0.153 * f.print.dpi : 26 * Math.sqrt(Math.max(1080, f.w) / 1080);

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

/** A photo cropped around its hotspot into a box, hard edged. */
function photoIn(p: Photo, id: string, b: Box): string {
  const s = Math.max(b.w / p.w, b.h / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  const fx = p.focus?.x ?? 0.5;
  const fy = p.focus?.y ?? 0.5;
  const ox = Math.min(0, Math.max(b.w - dw, b.w / 2 - fx * dw));
  const oy = Math.min(0, Math.max(b.h - dh, b.h / 2 - fy * dh));
  return (
    `<clipPath id="${id}"><rect x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}"/></clipPath>` +
    `<g clip-path="url(#${id})"><image href="${p.src}" x="${f1(b.x + ox)}" y="${f1(b.y + oy)}" ` +
    `width="${f1(dw)}" height="${f1(dh)}" preserveAspectRatio="none" filter="url(#warm)"/></g>`
  );
}

/** The light paper flecks in the auburn field only (a third of the mark's density). */
function fleckMask(f: Format, u: number): string {
  return printMask('ink', {
    x: 0,
    y: 0,
    w: f.w,
    h: f.h,
    u: 40 * u,
    seed: 23,
    density: 0.7,
  }).replace(/^<defs>|<\/defs>$/g, '');
}

/**
 * Times stay whole on a line: "10:00 am" never breaks before the "am". The space
 * becomes a word joiner (not whitespace, so the line breaker keeps the pair) and
 * goes back to a no-break space when drawn.
 */
const GLUE = '⁠';
const glue = (s: string) =>
  s.replace(/(\d)\s+(am|pm|a\.m\.|p\.m\.)(?=\W|$)/gi, (_, d: string, ap: string) => d + GLUE + ap);
const unglue = (ls: string[]) => ls.map((l) => l.split(GLUE).join(' '));

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

/** "Sunday School, 9:45 am" → ["Sunday School", "9:45 am"]; a bare time has no label. */
function splitWhen(s: string): [string, string] {
  const i = s.lastIndexOf(', ');
  return i < 0 ? ['', s] : [s.slice(0, i), s.slice(i + 2)];
}

/** The regular Sunday times, when the Studio passes them (Church facts). */
const standingOf = (c: Content): string[] =>
  ((c as Content & { standing?: string[] }).standing ?? []).map(cleanText).filter(Boolean);

// ── Words ───────────────────────────────────────────────────────────────────

interface Piece {
  h: number;
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
  const parts: { h: number; draw: (x: number, y: number) => string }[] = [];
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
    textPart(
      [cleanText(c.date), ...bare].filter(Boolean).join(', '),
      { family: 'sans', weight: 700, maxLines: 2, max: 40 * u, min: 26 * u, leading: 1.25 },
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
        textPart(
          glue(rows.map(([l, t]) => `${l}, ${t}`).join('  ·  ')),
          { family: 'sans', weight: 600, maxLines: 3, max: lo || 30 * u, min: fl, leading: 1.35 },
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
): { svg: string; h: number; warnings: string[] } {
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
      cleanText(c.date),
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
  const bodyText = o.body ? cleanText(c.body) : '';
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
  return { svg, h: y - box.y, warnings };
}

// ── The imprint band ────────────────────────────────────────────────────────

/**
 * The navy band's contents: on kinds that are not about Sunday itself, the regular
 * Sunday times on a line of their own; then the mark and the church's name, the web
 * address and street address, and the QR code at the right on print. `slim` (the
 * Facebook cover, the YouTube thumbnail) keeps only the mark, the name and the web
 * address. Returns its height for a given width so the layout can size the band first.
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
  const n2s = Math.max(20 * u, 0.8 * fl);
  const n1: FontSpec = { family: 'serif', size: n2s * 1.5 };
  const n2: FontSpec = { family: 'sans', size: n2s, weight: 600 };
  const M = n2s * 3.7;
  const wf: FontSpec = { family: 'sans', size: Math.max(24 * u, fl), weight: 700 };
  const afSize = Math.max(19 * u, fl);
  const web = cleanText(c.link) || church.web;
  const addr = slim
    ? ''
    : church.address && (f.print || f.shape === 'portrait' || f.shape === 'tall')
      ? church.address
      : church.place;
  const q = !slim && f.print && c.qr ? Math.max(0.85 * f.print.dpi, 110 * u) : 0;
  const lockW = M + 0.9 * n2s + Math.max(m(church.line1, n1), m(church.line2, n2));
  const avail = w - (q ? q + 36 * u : 0);
  const webW = Math.max(m(web, wf), addr ? m(addr, { family: 'sans', size: afSize }) : 0);
  const side = lockW + 56 * u + webW <= avail;

  // The address wraps to two lines on a narrow piece rather than shrinking below the floor.
  const ad = addr
    ? fitText(
        addr,
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
  const webH = wf.size * 1.3 + (ad ? ad.height : 0);

  // The standing invitation: the regular Sunday times on every kind not about Sunday.
  const standing =
    !slim && !['sunday', 'time-change', 'welcome'].includes(c.kind) ? standingOf(c) : [];
  const stText = standing.length
    ? 'Sundays: ' +
      standing
        .map(splitWhen)
        .map(([l, t]) => (l ? `${l} ${t}` : t))
        .join('  ·  ')
    : '';
  const st = stText
    ? fitText(
        glue(stText),
        {
          family: 'sans',
          weight: 600,
          maxLines: 2,
          max: Math.max(26 * u, fl),
          min: fl,
          leading: 1.3,
          maxW: w,
          maxH: Math.max(26 * u, fl) * 2.7,
        },
        m,
      )
    : null;
  if (st?.overflow) warnings.push(`The Sunday times are too long for ${f.label}.`);
  const stH = st ? st.height + 24 * u : 0;

  const rowH = Math.max(side ? Math.max(M, webH) : M + 22 * u + webH, q);
  const h = stH + rowH;
  return {
    h,
    warnings,
    draw: (x, y) => {
      let out = '';
      if (st)
        out += lines(unglue(st.lines), {
          family: 'sans',
          size: st.size,
          weight: 600,
          x,
          y,
          leading: 1.3,
          fill: C.ground,
        });
      const ry = y + stH;
      const ly = side ? ry + (rowH - M) / 2 : ry;
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
      const webRight = x + w - (q ? q + 36 * u : 0);
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

/** The connect card: the auburn block on the left, a white writing side on the right. */
function connectCard(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  const fl = floorPx(f);
  const safe = safeBox(f);
  const m = ctx.measure;
  const label = f.label;
  const defs = fleckMask(f, u);
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
  body += `<path d="${poly(blockPts)}" fill="${C.auburn}" mask="url(#ink)"/>`;

  // Left: the words, then the code and the web address (or the mark) at the foot.
  const x = safe.x;
  const colW = R - x - 40 * u;
  const footH = 130 * u;
  const st = stack(c, { x, y: safe.y, w: colW, h: safe.h - footH - 32 * u }, u, fl, m, {
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
    const tx = x + footH + 22 * u;
    const tw = R - tx - 10 * u;
    const wf = fitText(
      web,
      {
        family: 'sans',
        weight: 400,
        maxLines: 2,
        max: fl,
        min: fl * 0.9,
        leading: 1.25,
        maxW: tw,
        maxH: fl * 2.6,
      },
      m,
    );
    const head = fl * 1.3;
    const top = fy + (footH - head - wf.height) / 2;
    words += lines(['Scan to tell us online'], {
      family: 'sans',
      weight: 700,
      size: fl,
      x: tx,
      y: top,
      leading: 1.3,
      fill: C.ground,
    });
    words += lines(wf.lines, {
      family: 'sans',
      size: wf.size,
      x: tx,
      y: top + head,
      leading: 1.25,
      fill: C.ground,
    });
  } else {
    words += image(ctx.assets.markWhite, x, fy + footH - 70 * u, 70 * u, 70 * u);
  }

  // Right: the writing side. Navy labels, light navy rules to write on.
  const wx = R + 3 * sw + 56 * u;
  const wr = safe.x + safe.w;
  const ww = wr - wx;
  const fields: [string, number][] = [
    ['Name', 1],
    ['Email or phone', 1],
    ['How can we pray for you?', 3],
  ];
  const lab: FontSpec = { family: 'sans', size: fl, weight: 700, tracking: 0.08, caps: true };
  const head = 'Tell us about you';
  const headF: FontSpec = { family: 'serif', size: 50 * u };
  const headH = 50 * u * 1.15 + 30 * u;
  const labH = fl * 1.3;
  const nLines = fields.reduce((s, [, n]) => s + n, 0);
  const gapF = 30 * u;
  const pitch = Math.min(
    96 * u,
    (safe.h - headH - fields.length * labH - (fields.length - 1) * gapF) / nLines,
  );
  let yy = safe.y;
  let writing = lines([head], { ...headF, x: wx, y: yy, leading: 1.15, fill: C.navy });
  yy += headH;
  for (const [name, n] of fields) {
    writing += lines([name], { ...lab, x: wx, y: yy, leading: 1.3, fill: C.navy });
    if (m(name.toUpperCase(), lab) > ww)
      st.warnings.push(`The writing side is too narrow on ${label}.`);
    yy += labH;
    for (let i = 0; i < n; i++) {
      yy += pitch;
      writing += rect(wx, yy - Math.max(2, 1.6 * u), ww, Math.max(2, 1.6 * u), C.navyLight);
    }
    yy += gapF;
  }
  if (m(head, headF) > ww) st.warnings.push(`The writing side is too narrow on ${label}.`);

  body += words + writing;
  return { svg: doc(f, ctx.assets, defs, body), warnings: st.warnings };
}

/**
 * The yard sign, read from across the road: the title at a fifth of the sign's height
 * or more, the mark and the name, and one web address. Nothing else.
 */
function yardSign(c: Content, f: Format, ctx: Ctx): Rendered {
  const m = ctx.measure;
  const safe = safeBox(f);
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

  // The band: the mark and the name at the left, the web address at the right.
  const M = 0.13 * f.h;
  const n1: FontSpec = { family: 'serif', size: M * 0.4 };
  const n2: FontSpec = { family: 'sans', size: M * 0.27, weight: 600 };
  const web = cleanText(c.link) || ctx.church.web;
  const lockW = M + 0.3 * M + Math.max(m(ctx.church.line1, n1), m(ctx.church.line2, n2));
  const wf = fitText(
    web,
    {
      family: 'sans',
      weight: 700,
      maxLines: 1,
      max: M * 0.42,
      min: M * 0.24,
      leading: 1.2,
      maxW: cr - cx - lockW - 0.4 * dpi,
      maxH: M,
    },
    m,
  );
  if (wf.overflow) warnings.push(`The web address is too long for ${f.label}.`);
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
  ])}" fill="${C.auburn}" mask="url(#ink)"/>`;
  body += `<path d="${poly(steppedPts({ x: L, y: bandTop, w: R - L, h: B - bandTop }, sw, sh))}" fill="${C.navy}"/>`;
  const ly = contentBottom - M;
  body += image(ctx.assets.markWhite, cx, ly, M, M);
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

  // The title, a fifth of the height or larger, centred in the field's height.
  const top = Math.max(safe.y, T + pad);
  const bottom = bandTop - 3 * sh - pad * 0.6;
  const yt = {
    family: 'serif' as const,
    maxLines: 3,
    max: 0.34 * f.h,
    min: 0.2 * f.h,
    leading: 1.0,
    tracking: -0.014,
    maxW: cr - cx,
    maxH: bottom - top,
  };
  const ytext = cleanText(c.kind === 'verse' ? `“${cleanText(c.title)}”` : c.title);
  let t = fitTitle(ytext, yt, m);
  if (t.overflow) {
    // Too long to read from the road: say so, and still keep it on the sign.
    warnings.push(`The title is too long for ${f.label}. Try five words or fewer.`);
    t = fitTitle(ytext, { ...yt, maxLines: 7, max: 0.2 * f.h, min: 0.06 * f.h }, m);
  }
  body += lines(t.lines, {
    family: 'serif',
    size: t.size,
    tracking: -0.014,
    x: cx,
    y: top + Math.max(0, (bottom - top - t.height) / 2),
    leading: 1.0,
    fill: C.ground,
  });
  return { svg: doc(f, ctx.assets, fleckMask(f, dpi / 120), body), warnings };
}

function render(c: Content, f: Format, ctx: Ctx): Rendered {
  if (c.kind === 'welcome' && f.id === 'connect-card') return connectCard(c, f, ctx);
  if (f.id === 'yard-sign') return yardSign(c, f, ctx);
  const banner = f.shape === 'banner';
  // A banner's safe strip is short, so its type scale is set a step larger.
  const u = unit(f) * (banner ? 1.45 : 1);
  const fl = floorPx(f);
  const safe = safeBox(f);
  const m = ctx.measure;
  const label = f.label;
  const dpi = f.print?.dpi ?? 0;
  const verse = c.kind === 'verse';
  // A verse stands alone on the plain field: no photo, no sketch.
  const photo = verse ? undefined : c.photo;
  let defs = fleckMask(f, u) + (photo ? WARM : '');
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

  // The door hanger's hole (1.25 in, its centre 1 in below the trim) stays clear of words.
  const hanger = f.id === 'door-hanger';
  const holeR = 0.7 * dpi;
  const holeY = f.bleed + 1.0 * dpi;
  const holeBottom = hanger ? holeY + holeR + 0.2 * dpi : 0;

  // The Facebook cover and the YouTube thumbnail: a slim band, the name and the address only.
  const slim = f.id === 'page-cover' || f.id === 'youtube-thumb';
  // The YouTube channel art's safe strip is too short for a band; YouTube names the channel.
  const noBand = banner && !slim;
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
  const withBody = !banner && f.id !== 'youtube-thumb';

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
  let wordsTop = 0;
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

  // The information under its rule at the foot of the words.
  const info = infoPiece(c, Math.min(words.w, 900 * u), u, fl, m, label, {
    inline: banner || slim,
    wide: !vertical,
  });
  if (info) warnings.push(...info.warnings);
  const infoGap = 40 * u;
  const infoH = info ? info.h + infoGap : 0;

  if (vertical) {
    // The picture takes what the words leave, between a floor and a ceiling: the words
    // are set first (the title as large as its own limit), then sit on the information.
    const minPic = verse
      ? 0
      : Math.max(
          H * (photo ? (hanger ? 0.3 : 0.26) : f.shape === 'square' ? 0.13 : 0.17),
          holeBottom ? holeBottom + 0.3 * dpi - T : 0,
        );
    const maxPic = verse ? 0 : H * (photo ? (hanger ? 0.35 : 0.5) : 0.3);
    const firstTop = Math.max(safe.y, T + minPic + pad, holeBottom ? holeBottom + pad : 0);
    const bottom = words.y + words.h;
    const st = stack(
      c,
      { ...words, y: firstTop, h: Math.max(0, bottom - infoH - firstTop) },
      u,
      fl,
      m,
      {
        label,
        titleMax,
        body: withBody,
      },
    );
    warnings.push(...st.warnings);
    // A verse is centred in its field; everything else sits on the information.
    const total = st.h + infoH;
    let stackTop = verse
      ? firstTop + Math.max(0, (bottom - firstTop - total) / 2)
      : Math.max(firstTop, bottom - total);
    if (!verse) {
      const picBottom = Math.max(T + minPic, Math.min(T + maxPic, stackTop - pad));
      pic = { x: L, y: T, w: R - L, h: picBottom - T };
      // When the picture has reached its ceiling, the words sit in the middle of the
      // field left under it rather than leaving a gap of bare ink above them.
      const gapTop = picBottom + pad;
      if (stackTop > gapTop) stackTop = gapTop + (stackTop - gapTop) / 2;
    }
    over += `<g transform="translate(0 ${f1(stackTop - firstTop)})">${st.svg}</g>`;
    if (info) over += info.draw(words.x, stackTop + st.h + infoGap);
    wordsTop = stackTop;
  } else {
    const bottom = words.y + words.h;
    const st = stack(c, { ...words, h: Math.max(0, bottom - infoH - words.y) }, u, fl, m, {
      label,
      titleMax,
      body: withBody,
    });
    warnings.push(...st.warnings);
    const total = st.h + infoH;
    // The words sit together on the information; a verse and a banner are centred.
    const spare = Math.max(0, bottom - words.y - total);
    const top = words.y + (verse || banner ? spare / 2 : spare);
    over += `<g transform="translate(0 ${f1(top - words.y)})">${st.svg}</g>`;
    if (info) over += info.draw(words.x, top + st.h + infoGap);
  }

  // The picture: the photo, warm and hard edged, or the building sketch cut into the auburn.
  if (pic && photo) {
    pics += photoIn(photo, 'ph', pic);
  } else if (pic) {
    const p = pic;
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
  let body =
    rect(0, 0, f.w, f.h, C.ground) +
    `<path d="${field}" fill="${C.auburn}" mask="url(#ink)"/>` +
    pics +
    (noBand ? '' : `<path d="${band}" fill="${C.navy}"/>`) +
    over;
  if (hanger)
    body += `<circle cx="${f1(f.w / 2)}" cy="${f1(holeY)}" r="${f1(holeR)}" fill="${C.ground}"/>`;
  return { svg: doc(f, ctx.assets, defs, body), warnings };
}

export const press: Direction = {
  id: 'press',
  name: 'Press',
  summary:
    'Two flat inks on paper: an auburn field with big cream Young Serif, warm natural photos, and a navy imprint band whose corner steps up three bricks like the mark.',
  render,
};
