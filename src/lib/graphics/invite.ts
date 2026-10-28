// Safe to edit by hand
// =============================================================================
// Invite a friend: the card a member hands on, and the post they share (2026-10-28).
// =============================================================================
// A personal invitation is the strongest reason a guest comes (Lifeway: 51% of
// unchurched Americans rated it effective, against 23% for a postcard), so the
// church's members get a small thing to hand over: a business card (3.5 x 2 in,
// the `invite-card` size) and a square post for a phone. One template for both
// looks; the look only changes the ground:
//
//   light  the warm paper, navy headline, auburn kicker, the brick marker above
//          the kicker.
//   bold   the auburn field with cream words, and a navy panel (beside the words
//          on the card, along the foot on the post) that carries the code and
//          the brick marker, which would vanish on the auburn.
//
// Words: "You're invited", this Sunday's times from Church facts, the address,
// the web address and a QR code to Plan your visit, and "Invited by" with the
// member's name (on the card, a line to write it on when none is typed).
// directions/index.ts sends kind `invite` on these sizes here.
//
// Fitting (final review, 2026-10-28): the title keeps its size and the secondary
// lines give way first (the words under the title, then the street address, the
// kicker, the times), and the overlap guard (settle(), also used by the Light look)
// drops the lowest-priority block until nothing overlaps and every word stays in
// its box.
// =============================================================================

import { safeBox, unit, type Format } from './formats.ts';
import { column, type Block } from './layout.ts';
import { C, doc, lines, marker, markerWidth, qr, rect } from './svg.ts';
import { qrLabelFor } from './content.ts';
import { cleanText, fitText, type FitOptions, type Measure } from './text.ts';
import type { Content, Ctx, Rendered } from './types.ts';
import { addressLines, type Ground } from './mailing.ts';

/** The sizes the invite template draws; on any other size the invite is drawn as a Sunday piece. */
export const INVITE_FORMATS = new Set(['invite-card', 'post-square']);

export type Box = { x: number; y: number; w: number; h: number };

// ── The overlap guard ────────────────────────────────────────────────────────────

/** Never dropped by the guard (the title, the code). */
export const ESSENTIAL = 100;

/** A drawn thing and the room it takes. */
export interface Placed {
  /** What dropping it removes; blocks that share a key go together ("times"). */
  key: string;
  /** Higher is kept longer; ESSENTIAL is never dropped. */
  pri: number;
  box: Box;
  svg: string;
  /** The box it must stay inside (a column of words); items sharing one give way together. */
  within?: Box;
}

/** True when two boxes share more than a hair of area. */
export function boxesOverlap(a: Box, b: Box, slack = 0.5): boolean {
  return (
    a.x < b.x + b.w - slack &&
    b.x < a.x + a.w - slack &&
    a.y < b.y + b.h - slack &&
    b.y < a.y + a.h - slack
  );
}

const inside = (a: Box, b: Box, slack = 0.5) =>
  a.x >= b.x - slack &&
  a.y >= b.y - slack &&
  a.x + a.w <= b.x + b.w + slack &&
  a.y + a.h <= b.y + b.h + slack;

/**
 * Lay out, and while two things overlap (or a block leaves its `within` box), drop the
 * lowest-priority thing involved and lay out again without it. Returns what was drawn,
 * the keys dropped, and `clash` when only essential things are left colliding.
 */
export function settle(layout: (drop: ReadonlySet<string>) => Placed[]): {
  placed: Placed[];
  dropped: string[];
  clash: boolean;
} {
  const drop = new Set<string>();
  const lowest = (ps: Placed[]) =>
    ps.filter((p) => p.pri < ESSENTIAL).sort((a, b) => a.pri - b.pri)[0] ?? null;
  let placed: Placed[] = [];
  for (let round = 0; round < 32; round++) {
    placed = layout(drop).filter((p) => p.svg && p.box.w > 0 && p.box.h > 0);
    let victim: Placed | null = null;
    let clash = false;
    for (const p of placed) {
      if (p.within && !inside(p.box, p.within)) {
        clash = true;
        victim = lowest(placed.filter((q) => q.within === p.within));
        break;
      }
    }
    if (!clash)
      outer: for (let i = 0; i < placed.length; i++)
        for (let j = i + 1; j < placed.length; j++)
          if (boxesOverlap(placed[i].box, placed[j].box)) {
            clash = true;
            victim = lowest([placed[i], placed[j]]);
            break outer;
          }
    if (!clash) return { placed, dropped: [...drop], clash: false };
    if (!victim) return { placed, dropped: [...drop], clash: true };
    drop.add(victim.key);
  }
  return { placed, dropped: [...drop], clash: true };
}

/** The drawing of whatever the guard kept. */
export const drawn = (ps: Placed[]) => ps.map((p) => p.svg).join('');

// ── The words ────────────────────────────────────────────────────────────────────

/** What dropping a block removes: the times go as one row, the street with its town. */
function keyOf(name: string): string {
  if (name.startsWith('time ')) return 'times';
  if (name === 'town' || name === 'address') return 'address';
  if (name === 'web address') return 'web';
  if (name === 'invited by') return 'invited';
  return name;
}

/** How long each block is kept: the title and the times first, the sentence last. */
const PRIORITY: Record<string, number> = {
  title: ESSENTIAL,
  times: 80,
  web: 70,
  invited: 60,
  kicker: 55,
  address: 45,
  body: 30,
};

/** What the Studio calls a block that was left off. */
const SAID: Record<string, string> = {
  times: 'the times',
  web: 'the web address',
  invited: 'the “Invited by” line',
  kicker: 'the small line above the title',
  address: 'the street address',
  body: 'the words under the title',
};

function wordBlocks(
  c: Content,
  ctx: Ctx,
  s: {
    kicker: number;
    title: [number, number];
    small: number;
    web: number;
    gap: number;
    min: number;
  },
  bold: boolean,
  o: { address: boolean; web: boolean; invitedLine: boolean },
): Block[] {
  const fg = bold ? C.ground : C.ink;
  const head = bold ? C.ground : C.navy;
  const accent = bold ? C.ground : C.auburn;
  const small = (extra: Partial<FitOptions> = {}): Block['fit'] & { maxH?: number } => ({
    family: 'sans',
    maxLines: 2,
    max: s.small,
    min: s.min,
    leading: 1.28,
    ...extra,
  });
  const times = (c.when ?? []).map(cleanText).filter(Boolean);
  const name = cleanText(c.invitedBy);
  const blocks: Block[] = [
    {
      name: 'kicker',
      text: cleanText(c.kicker),
      fit: {
        family: 'sans',
        weight: 700,
        caps: true,
        tracking: 0.12,
        maxLines: 1,
        max: s.kicker,
        min: s.min,
        leading: 1.2,
      },
      fill: accent,
      gap: s.gap * 0.5,
    },
    {
      name: 'title',
      text: cleanText(c.title),
      fit: { family: 'serif', maxLines: 2, max: s.title[0], min: s.title[1], leading: 1.04 },
      fill: head,
      gap: s.gap,
      grow: true,
    },
    ...times.map((t, i): Block => ({
      name: `time ${i + 1}`,
      text: t,
      fit: small({ weight: 700, maxLines: 1, balance: false }),
      fill: fg,
      gap: i === times.length - 1 ? s.gap * 0.7 : 0,
    })),
    {
      name: 'body',
      text: cleanText(c.body),
      fit: small({ maxLines: 2 }),
      fill: fg,
      gap: s.gap * 0.7,
    },
  ];
  if (o.address) {
    // The street, then the town, each on its own line (never broken mid-street).
    const parts = addressLines(ctx.church.address, ctx.church.place).map(cleanText);
    parts.forEach((text, i) =>
      blocks.push({
        name: i ? 'town' : 'address',
        text,
        fit: small({ maxLines: 1, balance: false }),
        fill: fg,
        gap: i === parts.length - 1 ? s.gap * 0.3 : 0,
      }),
    );
  }
  if (o.web)
    blocks.push({
      name: 'web address',
      text: cleanText(c.link) || ctx.church.web,
      fit: small({ weight: 700, max: s.web, maxLines: 2, balance: false }),
      fill: head,
      gap: s.gap * 0.7,
    });
  if (name || o.invitedLine)
    blocks.push({
      name: 'invited by',
      text: name ? `Invited by ${name}` : 'Invited by',
      fit: small({ maxLines: 1 }),
      fill: fg,
    });
  return blocks;
}

/**
 * Set the words in `box`, saying less before the title shrinks: each drop set in `tries`
 * is tried with the title held at `titleFloor` or more; only when none fits does the
 * title go down to its own minimum. Returns each block as a Placed item (bounded by
 * `box`) and the column's own warnings.
 */
function placeWords(
  blocks: Block[],
  box: Box,
  measure: Measure,
  drop: ReadonlySet<string>,
  tries: string[][],
  titleFloor: number,
  o: { align: 'top' | 'middle'; label: string },
): { placed: Placed[]; warnings: string[]; left: Set<string> } {
  const has = (b: Block) => b.text.trim().length > 0;
  const keep = (d: Set<string>) => blocks.filter((b) => has(b) && !d.has(keyOf(b.name)));
  const floorTitle = (bs: Block[]) =>
    bs.map((b) => (b.grow ? { ...b, fit: { ...b.fit, min: Math.max(b.fit.min, titleFloor) } } : b));
  let d = new Set(drop);
  let live = keep(d);
  let col = column(floorTitle(live), box, measure, o);
  let found = !col.warnings.length && col.height <= box.h + 0.5;
  for (const extra of tries) {
    if (found) break;
    d = new Set([...drop, ...extra]);
    live = keep(d);
    col = column(floorTitle(live), box, measure, o);
    found = !col.warnings.length && col.height <= box.h + 0.5;
  }
  // Nothing fitted with the title held up: let it shrink, saying the least we tried.
  if (!found) col = column(live, box, measure, o);
  const placed: Placed[] = [];
  let y = col.top;
  live.forEach((b, i) => {
    const r = col.fits[b.name];
    const svg = lines(r.lines, {
      family: b.fit.family,
      size: r.size,
      weight: b.fit.weight,
      tracking: b.fit.tracking,
      caps: b.fit.caps,
      x: box.x,
      y,
      leading: b.fit.leading,
      fill: b.fill,
      opacity: b.opacity,
    });
    const key = keyOf(b.name);
    placed.push({
      key,
      pri: PRIORITY[key] ?? 40,
      box: { x: box.x, y, w: Math.max(1, r.width), h: r.height },
      svg,
      within: box,
    });
    y += r.height + (i < live.length - 1 ? (b.gap ?? 0) : 0);
  });
  return {
    placed,
    warnings: col.warnings,
    left: new Set([...d].filter((k) => blocks.some((b) => has(b) && keyOf(b.name) === k))),
  };
}

/** One warning for the lines left off, in the Studio's words. */
function leftOffWarning(keys: Iterable<string>, label: string): string[] {
  const said = [...new Set(keys)].map((k) => SAID[k]).filter(Boolean);
  if (!said.length) return [];
  const list = said.length > 1 ? `${said.slice(0, -1).join(', ')} and ${said.at(-1)}` : said[0];
  return [
    `There was no room for ${list} on ${label}, so ${said.length > 1 ? 'they are' : 'it is'} left off. Try fewer words.`,
  ];
}

/** The business card: words on the left, the code on the right. */
function card(c: Content, f: Format, ctx: Ctx, bold: boolean): Rendered {
  const dpi = f.print?.dpi ?? 300;
  const pt = dpi / 72;
  const m = ctx.measure;
  const s = safeBox(f);
  let ground = rect(0, 0, f.w, f.h, bold ? C.auburn : C.ground);

  // The code column: 1.05 in square (a code of 0.8 in or more, quiet zone aside), its label under.
  const qs = 1.05 * dpi;
  const qx = s.x + s.w - qs;
  const label = qrLabelFor(c);
  const lf = fitText(
    label,
    {
      family: 'sans',
      weight: 700,
      maxW: qs,
      maxH: 20 * pt,
      maxLines: 2,
      max: 7 * pt,
      min: 6.5 * pt,
      leading: 1.2,
    },
    m,
  );
  const mk = bold ? 0.1 * dpi : 0;
  const colH = mk + (mk ? 0.06 * dpi : 0) + qs + 0.05 * dpi + lf.height;
  const cy = s.y + (s.h - colH) / 2;
  let code = '';
  if (bold) {
    const px = qx - 0.12 * dpi;
    ground += rect(px, 0, f.w - px, f.h, C.navy);
    code += marker(qx, cy, mk);
  }
  const qy = cy + mk + (mk ? 0.06 * dpi : 0);
  code += qr(c.qr || `https://${ctx.church.web}`, qx, qy, qs, C.ink, C.ground);
  code += lines(lf.lines, {
    family: 'sans',
    weight: 700,
    size: lf.size,
    x: qx + qs / 2,
    y: qy + qs + 0.05 * dpi,
    leading: 1.2,
    fill: bold ? C.ground : C.navy,
    anchor: 'middle',
  });
  const codeBox: Box = {
    x: Math.min(qx, qx + qs / 2 - lf.width / 2),
    y: cy,
    w: Math.max(qs, lf.width),
    h: colH,
  };

  // The words: the light card's marker sits above them.
  const mh = bold ? 0 : 0.09 * dpi;
  const top = s.y + (mh ? mh + 0.05 * dpi : 0);
  const wordsW = codeBox.x - (bold ? 0.24 : 0.14) * dpi - s.x;
  const box: Box = { x: s.x, y: top, w: wordsW, h: s.y + s.h - top };
  const name = cleanText(c.invitedBy);
  const blocks = wordBlocks(
    c,
    ctx,
    {
      kicker: 7 * pt,
      title: [19 * pt, 12 * pt],
      small: 7.5 * pt,
      web: 8 * pt,
      gap: 0.06 * dpi,
      min: 6.5 * pt,
    },
    bold,
    { address: true, web: true, invitedLine: true },
  );
  let words: ReturnType<typeof placeWords> | null = null;
  const result = settle((drop) => {
    words = placeWords(
      blocks,
      box,
      m,
      drop,
      [
        ['body'],
        ['body', 'address'],
        ['body', 'address', 'kicker'],
        ['body', 'address', 'kicker', 'times'],
      ],
      15 * pt,
      { align: 'top', label: f.label },
    );
    const out: Placed[] = [
      { key: 'code', pri: ESSENTIAL, box: codeBox, svg: code },
      ...words.placed,
    ];
    if (mh)
      out.push({
        key: 'marker',
        pri: 10,
        box: { x: s.x, y: s.y, w: markerWidth(mh), h: mh },
        svg: marker(s.x, s.y, mh),
      });
    const inv = words.placed.find((p) => p.key === 'invited');
    if (inv && !name) {
      // A line to write the name on, from the end of "Invited by" to the words' right edge.
      const ix = inv.box.x + inv.box.w + 0.06 * dpi;
      const iy = inv.box.y + inv.box.h * 0.78;
      const weight = 0.6 * pt;
      if (box.x + box.w - ix > 0.4 * dpi)
        out.push({
          key: 'write line',
          pri: 20,
          box: { x: ix, y: iy, w: box.x + box.w - ix, h: weight },
          svg: rect(ix, iy, box.x + box.w - ix, weight, bold ? C.ground : C.inkMuted),
        });
    }
    return out;
  });
  const w = words as unknown as ReturnType<typeof placeWords>;
  const warnings = [...w.warnings, ...leftOffWarning([...w.left, ...result.dropped], f.label)];
  if (result.clash) warnings.push(`The title is too long for ${f.label}. Try fewer words.`);
  return {
    svg: doc(f, ctx.assets, '', ground + drawn(result.placed)),
    warnings: [...new Set(warnings)],
  };
}

/** The square (or any other) post: the words stacked, the code and the web address along the foot. */
function post(c: Content, f: Format, ctx: Ctx, bold: boolean): Rendered {
  const u = unit(f);
  const floor = 26 * Math.sqrt(Math.max(1080, f.w) / 1080);
  const m = ctx.measure;
  const s = safeBox(f);
  let ground = rect(0, 0, f.w, f.h, bold ? C.auburn : C.ground);

  // The foot: the code, then what it does, the web address and the street address.
  const qs = 200 * u;
  const footPad = bold ? 36 * u : 0;
  const footTop = s.y + s.h - qs;
  if (bold) ground += rect(0, footTop - footPad, f.w, f.h - footTop + footPad, C.navy);
  const code = qr(c.qr || `https://${ctx.church.web}`, s.x, footTop, qs, C.ink, C.ground);
  const tx = s.x + qs + 32 * u;
  const footBox: Box = { x: tx, y: footTop, w: s.x + s.w - tx, h: qs };
  const footBlocks: Block[] = [
    {
      name: 'code label',
      text: qrLabelFor(c),
      fit: { family: 'sans', weight: 700, maxLines: 1, max: 28 * u, min: floor, leading: 1.25 },
      fill: bold ? C.ground : C.auburn,
      gap: 6 * u,
    },
    {
      name: 'web address',
      text: cleanText(c.link) || ctx.church.web,
      fit: {
        family: 'sans',
        weight: 700,
        maxLines: 2,
        max: 36 * u,
        min: floor,
        leading: 1.2,
        balance: false,
      },
      fill: bold ? C.white : C.navy,
      gap: 10 * u,
    },
    {
      name: 'foot address',
      text: ctx.church.address ? cleanText(ctx.church.address) : ctx.church.place,
      fit: { family: 'sans', maxLines: 2, max: 30 * u, min: floor, leading: 1.28 },
      fill: bold ? C.ground : C.ink,
    },
  ];

  // The marker: in the navy band's top margin at its right end (bold), above the kicker (light).
  const mh = bold ? 22 * u : 30 * u;
  const mBox: Box = bold
    ? {
        x: s.x + s.w - markerWidth(mh),
        y: footTop - footPad + (footPad - mh) / 2,
        w: markerWidth(mh),
        h: mh,
      }
    : { x: s.x, y: s.y, w: markerWidth(mh), h: mh };
  const top = bold ? s.y : s.y + mh + 26 * u;
  const bottom = footTop - footPad - (bold ? 48 : 56) * u;
  const box: Box = { x: s.x, y: top, w: s.w, h: bottom - top };
  const blocks = wordBlocks(
    c,
    ctx,
    {
      kicker: 32 * u,
      title: [150 * u, 64 * u],
      small: 42 * u,
      web: 42 * u,
      gap: 36 * u,
      min: floor,
    },
    bold,
    { address: false, web: false, invitedLine: false },
  );
  let words: ReturnType<typeof placeWords> | null = null;
  let foot: ReturnType<typeof placeWords> | null = null;
  const result = settle((drop) => {
    words = placeWords(
      blocks,
      box,
      m,
      drop,
      [
        ['body'],
        ['body', 'kicker'],
        ['body', 'kicker', 'invited'],
        ['body', 'kicker', 'invited', 'times'],
      ],
      125 * u,
      { align: bold ? 'middle' : 'top', label: f.label },
    );
    // The foot's lines: the web address stays; the street goes first, then what the code does.
    foot = placeWords(
      footBlocks,
      footBox,
      m,
      drop,
      [['foot address'], ['foot address', 'code label']],
      0,
      {
        align: 'middle',
        label: f.label,
      },
    );
    const footPlaced = foot.placed.map((p) => ({
      ...p,
      pri: p.key === 'web' ? 90 : p.key === 'code label' ? 50 : 35,
    }));
    return [
      { key: 'code', pri: ESSENTIAL, box: { x: s.x, y: footTop, w: qs, h: qs }, svg: code },
      { key: 'marker', pri: 10, box: mBox, svg: marker(mBox.x, mBox.y, mh) },
      ...words.placed,
      ...footPlaced,
    ];
  });
  const w = words as unknown as ReturnType<typeof placeWords>;
  const ft = foot as unknown as ReturnType<typeof placeWords>;
  const warnings = [
    ...w.warnings,
    ...ft.warnings,
    ...leftOffWarning([...w.left, ...result.dropped], f.label),
  ];
  if (result.clash) warnings.push(`The title is too long for ${f.label}. Try fewer words.`);
  return {
    svg: doc(f, ctx.assets, '', ground + drawn(result.placed)),
    warnings: [...new Set(warnings)],
  };
}

/** Invite a friend, in the given look's ground. */
export function inviteCard(c: Content, f: Format, ctx: Ctx, ground: Ground): Rendered {
  const bold = ground === 'bold';
  return f.shape === 'landscape' || f.shape === 'banner'
    ? card(c, f, ctx, bold)
    : post(c, f, ctx, bold);
}
