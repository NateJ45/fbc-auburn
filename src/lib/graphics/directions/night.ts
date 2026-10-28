// Safe to edit by hand
// =============================================================================
// Direction "Night" for the graphics maker (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// The share card ("night", scripts/lib/og-card.mjs) grown into a system: the
// navy stone-tile ground of the site's dark bands, the white linocut mark and the
// church's name top left, a small auburn kicker, the title in cream Young Serif,
// the building sketch faint behind, and the brick sill along the foot. A photo,
// when there is one, takes the top of a tall piece or the right of a wide one,
// set in hard edges (no fades).
// =============================================================================

import { safeBox, unit, type Format } from '../formats';
import { column, type Block } from '../layout';
import { C, doc, image, lines, photo, qr, rect, sill, tilePattern } from '../svg';
import { cleanText } from '../text';
import type { Content, Ctx, Direction, Rendered } from '../types';

/** The stack of words for each kind, in reading order. */
function blocks(c: Content, u: number, shape: Format['shape']): Block[] {
  const wide = shape === 'landscape' || shape === 'banner';
  const kicker: Block = {
    name: 'kicker',
    text: cleanText(c.kicker),
    fit: {
      family: 'sans',
      weight: 700,
      tracking: 0.16,
      caps: true,
      maxLines: 1,
      max: 26 * u,
      min: 18 * u,
      leading: 1.2,
    },
    fill: C.auburnOnNavy,
    gap: 22 * u,
  };
  const title: Block = {
    name: 'title',
    text: c.kind === 'verse' ? `“${cleanText(c.title)}”` : cleanText(c.title),
    fit: {
      family: 'serif',
      maxLines: c.kind === 'verse' ? 7 : 4,
      max: (c.kind === 'verse' ? 76 : wide ? 120 : 132) * u,
      min: 40 * u,
      leading: c.kind === 'verse' ? 1.14 : 1.04,
      tracking: -0.012,
    },
    fill: C.ground,
    gap: 30 * u,
    grow: true,
  };
  const body: Block = {
    name: 'body',
    text: cleanText(c.body),
    fit: { family: 'sans', weight: 400, maxLines: 4, max: 32 * u, min: 22 * u, leading: 1.36 },
    fill: C.tint,
    gap: 30 * u,
  };
  const date: Block = {
    name: 'date',
    text: cleanText(c.date),
    fit: { family: 'sans', weight: 700, maxLines: 2, max: 36 * u, min: 24 * u, leading: 1.2 },
    fill: C.ground,
    gap: 14 * u,
  };
  const when: Block = {
    name: 'times',
    text: (c.when ?? []).map(cleanText).join('  ·  '),
    fit: { family: 'sans', weight: 600, maxLines: 3, max: 32 * u, min: 22 * u, leading: 1.3 },
    fill: C.ground,
    gap: 26 * u,
  };
  const ref: Block = {
    name: 'reference',
    text: [cleanText(c.reference), cleanText(c.translation)].filter(Boolean).join('  ·  '),
    fit: {
      family: 'sans',
      weight: 700,
      tracking: 0.14,
      caps: true,
      maxLines: 1,
      max: 26 * u,
      min: 18 * u,
      leading: 1.2,
    },
    fill: C.auburnOnNavy,
    gap: 16 * u,
  };
  const speaker: Block = {
    name: 'speaker',
    text: cleanText(c.speaker),
    fit: { family: 'sans', weight: 500, maxLines: 1, max: 28 * u, min: 20 * u, leading: 1.25 },
    fill: C.tint,
  };
  switch (c.kind) {
    case 'sunday':
      return [kicker, title, body, when];
    case 'event':
      return [kicker, title, date, when, body];
    case 'sermon':
      return [kicker, title, ref, speaker];
    case 'verse':
      return [title, ref];
    case 'announcement':
      return [kicker, title, date, body];
    case 'time-change':
      return [kicker, date, title, body];
    case 'welcome':
      return [kicker, title, body, when];
  }
}

function render(c: Content, f: Format, ctx: Ctx): Rendered {
  const u = unit(f);
  const safe = safeBox(f);
  const { assets, church, measure } = ctx;
  let defs = tilePattern('ground', assets.tileNavy, 420 * Math.max(1, u * 0.9));
  let body = rect(0, 0, f.w, f.h, C.night) + rect(0, 0, f.w, f.h, 'url(#ground)');

  // The photo: top of a tall piece, right of a wide one. Words keep to the rest.
  let words = { ...safe };
  const tallish = f.shape === 'tall' || f.shape === 'portrait' || f.shape === 'square';
  if (c.photo) {
    if (tallish) {
      const ph = Math.round(f.h * (f.shape === 'square' ? 0.42 : 0.46));
      body += photo(c.photo, 'ph', 0, 0, f.w, ph);
      words = { ...words, y: ph + 56 * u, h: safe.y + safe.h - (ph + 56 * u) };
    } else {
      const pw = Math.round(f.w * 0.42);
      body += photo(c.photo, 'ph', f.w - pw, 0, pw, f.h);
      words = { ...words, w: f.w - pw - safe.x - 64 * u };
    }
  } else {
    // The building sketch, faint, where there is no photo (the share card's).
    defs += `<mask id="sk" style="mask-type:alpha"><image href="${assets.sketch}" x="${f.w * 0.4}" y="${f.h * 0.3}" width="${f.w * 0.66}" height="${f.h * 0.62}" preserveAspectRatio="xMaxYMax meet"/></mask>`;
    body += rect(0, 0, f.w, f.h, C.navyLight, 'mask="url(#sk)" opacity="0.26"');
  }

  // The sill along the foot, into the bleed.
  const s = sill('sill', { x: 0, bottom: f.h, w: f.w, course: 30 * u, preset: 'og', seed: 7 });
  defs += s.defs;
  body += s.body;

  // The lockup: the mark and the name, top left (below the photo on a tall piece).
  const markH = 76 * u;
  const lockY = c.photo && tallish ? words.y : safe.y;
  body += image(assets.markWhite, safe.x, lockY, markH, markH);
  body += lines([church.line1], {
    family: 'serif',
    size: 32 * u,
    leading: 1.1,
    x: safe.x + markH + 20 * u,
    y: lockY + 6 * u,
    fill: C.ground,
  });
  body += lines([church.line2], {
    family: 'sans',
    weight: 600,
    size: 22 * u,
    leading: 1.2,
    x: safe.x + markH + 20 * u,
    y: lockY + 44 * u,
    fill: C.navyLight,
  });
  const afterLock = lockY + markH + 64 * u;

  // The foot: web address and the address, and the QR code on print sizes.
  const sillTop = f.h - s.height;
  const footBottom = Math.min(sillTop - 36 * u, safe.y + safe.h);
  const showQr = !!(f.print && c.qr);
  const qrSize = 210 * u;
  let footH = 0;
  if (f.shape !== 'banner') {
    const web = cleanText(c.link) || church.web;
    const addr =
      church.address && (f.print || f.shape === 'portrait' || f.shape === 'tall')
        ? church.address
        : church.place;
    footH = 34 * u + 30 * u;
    body += lines([web], {
      family: 'sans',
      weight: 700,
      size: 28 * u,
      leading: 1.2,
      x: safe.x,
      y: footBottom - footH,
      fill: C.ground,
    });
    body += lines([addr], {
      family: 'sans',
      weight: 400,
      size: 22 * u,
      leading: 1.3,
      x: safe.x,
      y: footBottom - 30 * u,
      fill: C.navyLight,
    });
  }
  if (showQr) {
    body += rect(
      safe.x + safe.w - qrSize - 12 * u,
      footBottom - qrSize - 12 * u,
      qrSize + 24 * u,
      qrSize + 24 * u,
      C.ground,
      `rx="${10 * u}"`,
    );
    body += qr(c.qr!, safe.x + safe.w - qrSize, footBottom - qrSize, qrSize, C.ink, C.ground);
  }

  // The words, between the lockup and the foot.
  const top = Math.max(afterLock, words.y);
  const bottom = footBottom - footH - (showQr ? qrSize + 40 * u : 56 * u);
  const col = column(
    blocks(c, u, f.shape),
    { x: words.x, y: top, w: Math.min(words.w, 1500 * u), h: Math.max(0, bottom - top) },
    measure,
    { align: f.shape === 'banner' ? 'middle' : 'bottom', label: f.label },
  );
  body += col.svg;
  return { svg: doc(f, assets, defs, body), warnings: col.warnings };
}

export const night: Direction = {
  id: 'night',
  name: 'Night',
  summary:
    'The share card grown into a system: the navy tile ground of the site’s dark bands, the white mark, cream Young Serif, a brick sill along the foot.',
  render,
};
