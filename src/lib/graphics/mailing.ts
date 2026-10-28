// Safe to edit by hand
// =============================================================================
// The postcard's mailing side, for USPS Every Door Direct Mail Retail (2026-10-28).
// =============================================================================
// One template for both looks (the look only changes the ground: Light is the
// paper with navy words, Bold the paper with a navy band under the web address
// and the code), because the post office's rules are the same whatever the
// front looks like. directions/index.ts sends the `postcard-back` size here.
//
// The USPS rules it keeps (DMM 143 and the EDDM Retail page), in inches from the
// trim, on the 11 x 6 side:
//
//   return address  top left: the church's name and street address.
//   indicia         top right: a box reading ECRWSS / U.S. POSTAGE / PAID /
//                   EDDM RETAIL, at least 0.5 x 0.5 in, all capitals of at least
//                   4 pt, within 1.625 in of the right edge and 1.375 in of the
//                   top, and at least 1/8 in clear of both edges.
//   address         "Postal Customer", in the lower right address block.
//   clear zones     the right half below the indicia is left clear for the
//                   address and the barcode the post office sprays on (the bottom
//                   5/8 in across the right 4.75 in, at the least).
//
// The left half carries the message: the kicker, the headline, the date and the
// times (the Sunday standing times when the piece is about something else), then
// the web address and a QR code at least 0.8 in across. The brick marker is the
// only ornament. The pastor is told in the tool to confirm the size and the
// indicia with the post office or the printer before printing.
// =============================================================================

import { safeBox, type Format } from './formats.ts';
import { column, type Block } from './layout.ts';
import { C, doc, lines, marker, qr, rect } from './svg.ts';
import { qrLabelFor } from './content.ts';
import { cleanText, fitText } from './text.ts';
import type { Content, Ctx, Rendered } from './types.ts';

export type Ground = 'light' | 'bold';

/** The USPS boxes, in inches from the trim's top left (the side is 11 wide, 6 tall). */
export const EDDM = {
  /** The indicia box: 1.0 x 0.875 in, 1/4 in in from the top and right trim. */
  indicia: { right: 0.25, top: 0.25, w: 1.0, h: 0.875 },
  /** Its words, all capitals. */
  indiciaLines: ['ECRWSS', 'U.S. POSTAGE', 'PAID', 'EDDM RETAIL'],
  /** The indicia type size, pt (USPS asks for at least 4). */
  indiciaPt: 7,
  /** Where "Postal Customer" starts. */
  address: { x: 6.75, y: 3.25 },
  /** The barcode clear zone: the bottom 5/8 in across the right 4.75 in. */
  barcode: { right: 0, bottom: 0, w: 4.75, h: 0.625 },
  /** The message half ends here (the right half is the address side). */
  half: 5.375,
} as const;

/** The indicia box in canvas px, for the tests and the drawing. */
export function indiciaBox(f: Format): { x: number; y: number; w: number; h: number } {
  const dpi = f.print?.dpi ?? 300;
  const inW = f.print?.inW ?? 11;
  const b = f.bleed;
  const i = EDDM.indicia;
  return {
    x: b + (inW - i.right - i.w) * dpi,
    y: b + i.top * dpi,
    w: i.w * dpi,
    h: i.h * dpi,
  };
}

/** The address and barcode area on the right that nothing but the address may touch, px. */
export function addressArea(f: Format): { x: number; y: number; w: number; h: number } {
  const dpi = f.print?.dpi ?? 300;
  const b = f.bleed;
  const ind = indiciaBox(f);
  const x = b + EDDM.half * dpi;
  const y = ind.y + ind.h + 0.125 * dpi;
  return { x, y, w: f.w - x, h: f.h - y };
}

/** Split a one-line address at its first comma: the street, then the town line. */
export function addressLines(one: string | null, place: string): string[] {
  if (!one) return [place];
  const i = one.indexOf(',');
  return i < 0 ? [one] : [one.slice(0, i).trim(), one.slice(i + 1).trim()];
}

/** The mailing side of the 6 x 11 postcard. */
export function mailingSide(c: Content, f: Format, ctx: Ctx, ground: Ground): Rendered {
  const dpi = f.print?.dpi ?? 300;
  const pt = dpi / 72;
  const inch = (n: number) => f.bleed + n * dpi;
  const m = ctx.measure;
  const s = safeBox(f);
  const warnings: string[] = [];
  const bold = ground === 'bold';
  let body = rect(0, 0, f.w, f.h, C.ground);

  // ── The return address, top left ──
  const ret = [`${ctx.church.line1} ${ctx.church.line2}`];
  body += lines(ret, {
    family: 'sans',
    weight: 700,
    size: 10 * pt,
    x: s.x,
    y: s.y,
    leading: 1.25,
    fill: C.navy,
  });
  body += lines(addressLines(ctx.church.address, ctx.church.place).map(cleanText), {
    family: 'sans',
    size: 9 * pt,
    x: s.x,
    y: s.y + 10 * pt * 1.25,
    leading: 1.3,
    fill: C.ink,
  });

  // ── The indicia, top right ──
  const ib = indiciaBox(f);
  const stroke = 1.25 * pt;
  body += rect(
    ib.x + stroke / 2,
    ib.y + stroke / 2,
    ib.w - stroke,
    ib.h - stroke,
    'none',
    `stroke="${C.ink}" stroke-width="${stroke.toFixed(1)}"`,
  );
  const isz = EDDM.indiciaPt * pt;
  const ih = EDDM.indiciaLines.length * isz * 1.25;
  body += lines([...EDDM.indiciaLines], {
    family: 'sans',
    weight: 700,
    size: isz,
    tracking: 0.04,
    x: ib.x + ib.w / 2,
    y: ib.y + (ib.h - ih) / 2,
    leading: 1.25,
    fill: C.ink,
    anchor: 'middle',
  });

  // ── The address line, lower right ──
  body += lines(['Postal Customer'], {
    family: 'sans',
    size: 12 * pt,
    x: inch(EDDM.address.x),
    y: inch(EDDM.address.y),
    leading: 1.25,
    fill: C.ink,
  });

  // ── The foot of the message half: the code, what it does, the web address ──
  const half = inch(EDDM.half);
  const qs = 1.15 * dpi; // the code's quiet zone is paper, so the printed code is about 0.9 in
  const footTop = inch(4.5);
  if (bold) body += rect(0, footTop, half, f.h - footTop, C.navy);
  const qy = s.y + s.h - qs;
  const url = c.qr || `https://${ctx.church.web}`;
  body += qr(url, s.x, qy, qs, C.ink, C.ground);
  const tx = s.x + qs + 0.2 * dpi;
  const tw = half - 0.25 * dpi - tx;
  const label = qrLabelFor(c);
  const web = cleanText(c.link) || ctx.church.web;
  const lf = fitText(
    label,
    {
      family: 'sans',
      weight: 700,
      maxW: tw,
      maxH: 30 * pt,
      maxLines: 2,
      max: 11 * pt,
      min: 9 * pt,
      leading: 1.25,
    },
    m,
  );
  const wf = fitText(
    web,
    {
      family: 'sans',
      weight: 700,
      maxW: tw,
      maxH: 40 * pt,
      maxLines: 2,
      max: 15 * pt,
      min: 10 * pt,
      leading: 1.2,
      balance: false,
    },
    m,
  );
  if (wf.overflow) warnings.push('The web address is too long for the mailing side.');
  const fh = lf.height + 6 * pt + wf.height;
  const fy = qy + (qs - fh) / 2;
  body += lines(lf.lines, {
    family: 'sans',
    weight: 700,
    size: lf.size,
    x: tx,
    y: fy,
    leading: 1.25,
    fill: bold ? C.ground : C.auburn,
  });
  body += lines(wf.lines, {
    family: 'sans',
    weight: 700,
    size: wf.size,
    x: tx,
    y: fy + lf.height + 6 * pt,
    leading: 1.2,
    fill: bold ? C.white : C.navy,
  });

  // ── The message: marker, kicker, headline, date, times, a line more ──
  const mk = 0.16 * dpi;
  const top = inch(1.15);
  body += marker(s.x, top, mk);
  const colTop = top + mk + 0.14 * dpi;
  const colBottom = (bold ? footTop : qy) - 0.3 * dpi;
  const box = { x: s.x, y: colTop, w: half - 0.25 * dpi - s.x, h: colBottom - colTop };
  const kicker = cleanText(c.kicker);
  const date = cleanText(c.date);
  const times = (c.when?.length ? c.when : (c.standing ?? [])).map(cleanText).filter(Boolean);
  const title = cleanText(c.kind === 'verse' && c.title ? `“${c.title}”` : c.title);
  const blocks: Block[] = [
    {
      name: 'kicker',
      text: kicker,
      fit: {
        family: 'sans',
        weight: 700,
        caps: true,
        tracking: 0.12,
        maxLines: 1,
        max: 11 * pt,
        min: 9 * pt,
        leading: 1.2,
      },
      fill: C.auburn,
      gap: 0.1 * dpi,
    },
    {
      name: 'title',
      text: title,
      fit: {
        family: 'serif',
        maxLines: c.kind === 'verse' ? 6 : 3,
        max: 40 * pt,
        min: 16 * pt,
        leading: 1.06,
      },
      fill: C.navy,
      gap: 0.16 * dpi,
      grow: true,
    },
    {
      name: 'date',
      text: date && date !== kicker ? date : '',
      fit: { family: 'sans', weight: 700, maxLines: 1, max: 14 * pt, min: 11 * pt, leading: 1.3 },
      fill: C.ink,
      gap: 0.04 * dpi,
    },
    ...times.map((t, i): Block => ({
      name: `time ${i + 1}`,
      text: t,
      fit: {
        family: 'sans',
        maxLines: 1,
        max: 14 * pt,
        min: 11 * pt,
        leading: 1.3,
        balance: false,
      },
      fill: C.ink,
      gap: i === times.length - 1 ? 0.12 * dpi : 0,
    })),
    {
      name: 'body',
      text: cleanText(c.body),
      fit: { family: 'sans', maxLines: 3, max: 12 * pt, min: 11 * pt, leading: 1.35 },
      fill: C.inkMuted,
    },
  ];
  const col = column(blocks, box, m, { align: 'top', label: 'the mailing side' });
  body += col.svg;
  warnings.push(...col.warnings);

  return { svg: doc(f, ctx.assets, '', body), warnings };
}
