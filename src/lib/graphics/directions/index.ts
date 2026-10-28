// Safe to edit by hand
// The graphics maker's two looks (2026-10-27, picked by the review panel recorded in
// docs/design-directions/2026-10-27-graphics/): Light (Porch, the website's own page as a printed
// notice, the default) and Bold (Press, the auburn field and navy band for the feed and a door).
// The first direction, Night, was retired the same day. docs/agent/graphics.md.
//
// Two pieces are drawn by shared templates, not by the looks (2026-10-28): the postcard's mailing
// side (`postcard-back`, src/lib/graphics/mailing.ts, the USPS rules are the same whatever the
// front looks like) and Invite a friend on its card and square post (src/lib/graphics/invite.ts).
// `shared()` wraps each look's render so those go to their template in that look's ground; an
// invite on any other size is drawn by the look as a Sunday piece (the same words and times).
// Sermon series art (series-slide, series-square, podcast-cover) is drawn by the look with its
// words trimmed (src/lib/graphics/series-art.ts); the carousel draws each of its frames through
// these renders too (src/lib/graphics/carousel.ts), numbered on the look's ground (GROUNDS).

import type { Direction } from '../types.ts';
import { INVITE_FORMATS, inviteCard } from '../invite.ts';
import { mailingSide, type Ground } from '../mailing.ts';
import { isSeriesArt, seriesArtContent } from '../series-art.ts';
import { porch } from './porch.ts';
import { press } from './press.ts';

function shared(d: Direction, ground: Ground): Direction {
  return {
    ...d,
    render: (c, f, ctx) => {
      if (f.id === 'postcard-back') return mailingSide(c, f, ctx, ground);
      // Series art: the look draws it, with the words trimmed to what a series slide, square
      // and podcast cover carry (series-art.ts).
      if (isSeriesArt(f.id)) return d.render(seriesArtContent(c, f.id), f, ctx);
      if (c.kind === 'invite')
        return INVITE_FORMATS.has(f.id)
          ? inviteCard(c, f, ctx, ground)
          : d.render({ ...c, kind: 'sunday' }, f, ctx);
      return d.render(c, f, ctx);
    },
  };
}

/** In the order the Studio offers them; the first is the default. */
export const DIRECTIONS: Direction[] = [shared(porch, 'light'), shared(press, 'bold')];

export const DEFAULT_DIRECTION: Direction = DIRECTIONS[0];

/** Each look's ground, for pieces drawn on top of a look (the carousel's frame number). */
export const GROUNDS: Record<string, Ground> = { porch: 'light', press: 'bold' };

/** What the Studio calls each look. */
export const LOOK_NAMES: Record<string, { name: string; lead: string }> = {
  porch: { name: 'Light', lead: 'Warm white and navy, like the website. Kind to a home printer.' },
  press: { name: 'Bold', lead: 'The church’s brick red with a navy band. Stops the scroll.' },
};
