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
// =============================================================================

import { safeBox, unit, type Format } from './formats.ts';
import { column, type Block } from './layout.ts';
import { C, doc, lines, marker, markerWidth, qr, rect } from './svg.ts';
import { qrLabelFor } from './content.ts';
import { cleanText, fitText, type FitOptions } from './text.ts';
import type { Content, Ctx, Rendered } from './types.ts';
import { addressLines, type Ground } from './mailing.ts';

/** The sizes the invite template draws; on any other size the invite is drawn as a Sunday piece. */
export const INVITE_FORMATS = new Set(['invite-card', 'post-square']);

type Box = { x: number; y: number; w: number; h: number };

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

/** A blank to write the member's name on, after "Invited by" when no name was typed. */
function writeLine(x: number, y: number, w: number, weight: number, color: string): string {
  return rect(x, y, w, weight, color);
}

/** The business card: words on the left, the code on the right. */
function card(c: Content, f: Format, ctx: Ctx, bold: boolean): Rendered {
  const dpi = f.print?.dpi ?? 300;
  const pt = dpi / 72;
  const m = ctx.measure;
  const s = safeBox(f);
  const warnings: string[] = [];
  let body = rect(0, 0, f.w, f.h, bold ? C.auburn : C.ground);

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
  if (bold) {
    const px = qx - 0.12 * dpi;
    body += rect(px, 0, f.w - px, f.h, C.navy);
    body += marker(qx, cy, mk);
  }
  const qy = cy + mk + (mk ? 0.06 * dpi : 0);
  body += qr(c.qr || `https://${ctx.church.web}`, qx, qy, qs, C.ink, C.ground);
  body += lines(lf.lines, {
    family: 'sans',
    weight: 700,
    size: lf.size,
    x: qx + qs / 2,
    y: qy + qs + 0.05 * dpi,
    leading: 1.2,
    fill: bold ? C.ground : C.navy,
    anchor: 'middle',
  });

  // The words.
  let top = s.y;
  if (!bold) {
    const mh = 0.09 * dpi;
    body += marker(s.x, top, mh);
    top += mh + 0.05 * dpi;
  }
  const wordsW = qx - (bold ? 0.24 : 0.14) * dpi - s.x;
  const box: Box = { x: s.x, y: top, w: wordsW, h: s.y + s.h - top };
  const name = cleanText(c.invitedBy);
  const col = column(
    wordBlocks(
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
    ),
    box,
    m,
    { align: 'top', label: f.label },
  );
  body += col.svg;
  warnings.push(...col.warnings);
  const inv = col.fits['invited by'];
  if (inv && !name) {
    // A line to write the name on, from the end of "Invited by" to the words' right edge.
    const ix = s.x + inv.width + 0.06 * dpi;
    const iy = col.top + col.height - inv.size * 0.42;
    if (box.x + box.w - ix > 0.4 * dpi)
      body += writeLine(ix, iy, box.x + box.w - ix, 0.6 * pt, bold ? C.ground : C.inkMuted);
  }
  return { svg: doc(f, ctx.assets, '', body), warnings };
}

/** The square (or any other) post: the words stacked, the code and the web address along the foot. */
function post(c: Content, f: Format, ctx: Ctx, bold: boolean): Rendered {
  const u = unit(f);
  const floor = 26 * Math.sqrt(Math.max(1080, f.w) / 1080);
  const m = ctx.measure;
  const s = safeBox(f);
  const warnings: string[] = [];
  let body = rect(0, 0, f.w, f.h, bold ? C.auburn : C.ground);

  // The foot: the code, then what it does, the web address and the street address.
  const qs = 200 * u;
  const footPad = bold ? 36 * u : 0;
  const footTop = s.y + s.h - qs;
  if (bold) body += rect(0, footTop - footPad, f.w, f.h - footTop + footPad, C.navy);
  body += qr(c.qr || `https://${ctx.church.web}`, s.x, footTop, qs, C.ink, C.ground);
  const tx = s.x + qs + 32 * u;
  const tw = s.x + s.w - tx;
  const foot = column(
    [
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
        name: 'address',
        text: ctx.church.address ? cleanText(ctx.church.address) : ctx.church.place,
        fit: { family: 'sans', maxLines: 2, max: 30 * u, min: floor, leading: 1.28 },
        fill: bold ? C.ground : C.ink,
      },
    ],
    { x: tx, y: footTop, w: tw, h: qs },
    m,
    { align: 'middle', label: f.label },
  );
  body += foot.svg;
  warnings.push(...foot.warnings);

  // The words above.
  let top = s.y;
  if (bold) {
    // The marker rides in the navy band's top margin, at its right end.
    const mh = 22 * u;
    body += marker(s.x + s.w - markerWidth(mh), footTop - footPad + (footPad - mh) / 2, mh);
  } else {
    const mh = 30 * u;
    body += marker(s.x, top, mh);
    top += mh + 26 * u;
  }
  const bottom = footTop - footPad - (bold ? 48 : 56) * u;
  const col = column(
    wordBlocks(
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
    ),
    { x: s.x, y: top, w: s.w, h: bottom - top },
    m,
    { align: bold ? 'middle' : 'top', label: f.label },
  );
  body += col.svg;
  warnings.push(...col.warnings);
  return { svg: doc(f, ctx.assets, '', body), warnings };
}

/** Invite a friend, in the given look's ground. */
export function inviteCard(c: Content, f: Format, ctx: Ctx, ground: Ground): Rendered {
  const bold = ground === 'bold';
  return f.shape === 'landscape' || f.shape === 'banner'
    ? card(c, f, ctx, bold)
    : post(c, f, ctx, bold);
}
