// Safe to edit by hand
// =============================================================================
// Sermon series art: the words a series' title slide, square and podcast cover
// carry (2026-10-28, docs/agent/graphics.md).
// =============================================================================
// The three sizes are rows in formats.ts (SERIES_ART, only for the sermon kind) and
// are drawn by the chosen look's own render, through the shared wrapper in
// directions/index.ts, with the words trimmed here: the title, the series name (a
// sermon's kicker) or "Sermon series", the book or passage, and the church's name,
// which every look draws itself. The title slide also names the preacher. No QR
// code, sermon link or standing Sunday times (the look prints the church's own web
// address): series art is used every week for weeks, and a podcast cover is seen
// at thumbnail size. No stock art: the only
// picture is the one the pastor picks (the series' own art comes in by default).
// =============================================================================

import { SERIES_ART } from './formats.ts';
import type { Content } from './types.ts';

export const isSeriesArt = (formatId: string) => SERIES_ART.includes(formatId);

/** The words for a series art size. */
export function seriesArtContent(c: Content, formatId: string): Content {
  return {
    kind: 'sermon',
    kicker: c.kicker,
    title: c.title,
    reference: c.reference,
    speaker: formatId === 'series-slide' ? c.speaker : undefined,
    photo: c.photo,
  };
}
