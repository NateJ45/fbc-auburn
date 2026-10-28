// Safe to edit by hand
// =============================================================================
// The carousel: 3 to 5 tall posts that are swiped through in order (2026-10-28).
// =============================================================================
// Carousels are the best-performing Instagram format in the graphics research
// report (0.55% engagement against 0.37% for a single image). One graphic's words
// are split into frames, built from the same data, never typed again:
//
//   cover    the kicker and the title (and the photo, if one is picked)
//   when     what and when: the date and the times (an event, Sunday, New here),
//            or the passage and the preacher (a sermon)
//   where    the street address and the town, with the body or a "what to expect"
//            line
//   weekly   the regular Sunday times, for an event or a sermon (when there are any)
//   invite   a closing invitation with the web address
//
// Each frame is drawn by the chosen look's own render() at 1080 x 1350, so it stays
// in that look, and numbered small in the bottom margin ("2/4"), which the format's
// safe area keeps clear. Pure: no DOM, no clock. docs/agent/graphics.md.
// =============================================================================

import type { Format } from './formats.ts';
import type { Ground } from './mailing.ts';
import { C, FAMILY, esc } from './svg.ts';
import { cleanText } from './text.ts';
import type { Church, Content, Ctx, Kind, Rendered, Template } from './types.ts';

/** The kinds a carousel suits: there is a when and a where to tell. */
export const CAROUSEL_KINDS: Kind[] = ['event', 'sermon', 'welcome', 'sunday'];

export const carouselFor = (kind: Kind) => CAROUSEL_KINDS.includes(kind);

/** The size-list id the tool ticks for a carousel (not a row in FORMATS: it is several posts). */
export const CAROUSEL_ID = 'carousel';

/**
 * A tall feed post, with a deeper bottom margin than `post-portrait` so the frame number has a
 * strip of its own that no look draws words into.
 */
export const CAROUSEL_FORMAT: Format = {
  id: CAROUSEL_ID,
  group: 'social',
  label: 'Carousel',
  hint: 'Three to five tall posts, swiped through in order. The best-performing post on Instagram.',
  w: 1080,
  h: 1350,
  shape: 'portrait',
  bleed: 0,
  safe: { top: 72, right: 72, bottom: 124, left: 72 },
};

export type FrameRole = 'cover' | 'when' | 'where' | 'weekly' | 'invite';

export interface Frame {
  role: FrameRole;
  content: Content;
}

/** A line about what to expect, for the where frame when the graphic has no body. */
const EXPECT: Record<string, string> = {
  sunday: 'Coffee is on, and there is a seat for you.',
  welcome: 'Come as you are. We will not put you on the spot.',
  event: 'Everyone is welcome. Bring a friend.',
  sermon: 'Come and hear the Bible read and preached on Sunday.',
};

/**
 * The closing frame's words, per kind. The web address itself is in every look's foot, so the
 * sentence points down to it rather than repeating it (a long address would crowd the title).
 */
const CLOSE: Record<string, { kicker: string; title: string; body: string }> = {
  sunday: {
    kicker: 'Plan your visit',
    title: 'There is a seat for you',
    body: 'What to expect and when to come: it is all on our website, at the address below.',
  },
  welcome: {
    kicker: 'Plan your visit',
    title: 'Come as you are',
    body: 'What to expect and when to come: it is all on our website, at the address below.',
  },
  event: {
    kicker: 'You are invited',
    title: 'Bring a friend along',
    body: 'All the details are on our website, at the address below.',
  },
  sermon: {
    kicker: 'Listen again',
    title: 'Every sermon, online',
    body: 'Watch or listen to past sermons on our website, at the address below.',
  },
};

/** "4241 Hamilton-Scipio Rd" and "Hamilton, OH 45013" from the one address line. */
export function splitAddress(address: string | null): { street: string; town: string } {
  const a = cleanText(address ?? '');
  const i = a.indexOf(',');
  if (i < 0) return { street: a, town: '' };
  return { street: a.slice(0, i).trim(), town: a.slice(i + 1).trim() };
}

/** True for a date line ("Sunday, November 1"). */
const isDate = (s: string) =>
  /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),\s/.test(s);

/**
 * The frames for a graphic's words (already without pre-launch notes). Always a cover, a where
 * and an invite; a when and a weekly frame when there is something to put in them. 3 to 5 frames.
 */
export function carouselFrames(c: Content, church: Church): Frame[] {
  const kind = c.kind;
  const title = cleanText(c.title);
  const kicker = cleanText(c.kicker);
  const times = (c.when ?? []).map(cleanText).filter(Boolean);
  const date = cleanText(c.date) || (isDate(kicker) ? kicker : '');
  const base = { link: c.link, standing: c.standing };
  const frames: Frame[] = [];

  // 1. The cover: the title, with the photo.
  frames.push({ role: 'cover', content: { kind, kicker, title, photo: c.photo, ...base } });

  // 2. What and when.
  if (kind === 'sermon') {
    const passage = cleanText(c.reference);
    if (passage)
      frames.push({
        role: 'when',
        content: { kind: 'sermon', kicker: title, title: passage, speaker: c.speaker, ...base },
      });
  } else if (kind === 'event') {
    if (date || times.length)
      frames.push({
        role: 'when',
        content: {
          kind: 'event',
          kicker: title,
          title: date || times.join(', '),
          when: date ? times : [],
          ...base,
        },
      });
  } else if (times.length) {
    // Sunday and New here: the times as a table.
    frames.push({
      role: 'when',
      content: {
        kind,
        kicker: kind === 'sunday' ? 'This Sunday' : 'When we meet',
        title: kind === 'sunday' && date ? date : 'Every week',
        when: times,
        ...base,
      },
    });
  }

  // 3. Where, and what to expect.
  const { street, town } = splitAddress(church.address);
  frames.push({
    role: 'where',
    content: {
      kind: 'announcement',
      kicker: 'Where',
      title: street || `${church.line1} ${church.line2}`,
      date: street ? town : church.place,
      body: cleanText(c.body) || EXPECT[kind] || '',
      ...base,
    },
  });

  // 4. The regular Sunday times, for an event or a sermon.
  const standing = (c.standing ?? []).map(cleanText).filter(Boolean);
  if ((kind === 'event' || kind === 'sermon') && standing.length)
    frames.push({
      role: 'weekly',
      content: {
        kind: 'sunday',
        kicker: 'And every week',
        title: `Sundays at ${church.line1}`,
        when: standing,
        link: c.link,
      },
    });

  // 5. The invitation, with the web address.
  const close = CLOSE[kind] ?? CLOSE.sunday;
  frames.push({
    role: 'invite',
    content: {
      kind: 'announcement',
      kicker: close.kicker,
      title: close.title,
      body: close.body,
      ...base,
      // The look prints the link in its foot; the church's own address when there is none.
      link: cleanText(c.link) || church.web,
    },
  });
  return frames;
}

/** "2/4". */
export const frameLabel = (i: number, total: number) => `${i + 1}/${total}`;

/** A name that sorts in posting order: "carousel-01-candlelight-service.png". */
export function frameFileName(i: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return `carousel-${String(i + 1).padStart(2, '0')}${slug ? `-${slug}` : ''}.png`;
}

/**
 * The frame number, set small in the bottom margin at the right edge of the safe area: the
 * number in auburn, "/4" quieter. Light sits on paper; Bold on its navy band.
 */
export function numberFrame(
  svg: string,
  i: number,
  total: number,
  f: Format,
  ground: Ground,
): string {
  const size = 26;
  const x = f.w - f.safe.right;
  const y = f.h - Math.round(f.safe.bottom * 0.42);
  const [now, rest] = [String(i + 1), ` / ${total}`];
  const on = ground === 'light' ? C.auburn : C.auburnOnNavy;
  const off = ground === 'light' ? C.inkMuted : C.white;
  const text =
    `<text x="${x}" y="${y}" text-anchor="end" font-family="${FAMILY.sans}" font-size="${size}" ` +
    `font-weight="700" letter-spacing="${(size * 0.06).toFixed(1)}" data-frame="${esc(frameLabel(i, total))}">` +
    `<tspan fill="${on}">${now}</tspan><tspan fill="${off}" opacity="0.8">${esc(rest)}</tspan></text>`;
  return svg.replace(/<\/svg>\s*$/, `${text}</svg>`);
}

export interface CarouselFrame extends Rendered {
  role: FrameRole;
  label: string;
  name: string;
}

/** Every frame drawn by the look's render, numbered, with the file name it saves under. */
export function renderCarousel(
  render: Template,
  c: Content,
  ctx: Ctx,
  ground: Ground,
): CarouselFrame[] {
  const frames = carouselFrames(c, ctx.church);
  return frames.map((fr, i) => {
    const r = render(fr.content, CAROUSEL_FORMAT, ctx);
    return {
      role: fr.role,
      label: frameLabel(i, frames.length),
      name: frameFileName(i, cleanText(c.title)),
      svg: numberFrame(r.svg, i, frames.length, CAROUSEL_FORMAT, ground),
      warnings: r.warnings,
    };
  });
}
