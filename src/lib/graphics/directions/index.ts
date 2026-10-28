// Safe to edit by hand
// The graphics maker's two looks (2026-10-27, picked by the review panel recorded in
// docs/design-directions/2026-10-27-graphics/): Light (Porch, the website's own page as a printed
// notice, the default) and Bold (Press, the auburn field and navy band for the feed and a door).
// The first direction, Night, was retired the same day. docs/agent/graphics.md.

import type { Direction } from '../types.ts';
import { porch } from './porch.ts';
import { press } from './press.ts';

/** In the order the Studio offers them; the first is the default. */
export const DIRECTIONS: Direction[] = [porch, press];

export const DEFAULT_DIRECTION: Direction = porch;

/** What the Studio calls each look. */
export const LOOK_NAMES: Record<string, { name: string; lead: string }> = {
  porch: { name: 'Light', lead: 'Warm white and navy, like the website. Kind to a home printer.' },
  press: { name: 'Bold', lead: 'The church’s brick red with a navy band. Stops the scroll.' },
};
