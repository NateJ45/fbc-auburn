// Safe to edit by hand
// =============================================================================
// The Candlelight block's logic (candlelightSection, builderSections.ts, 2026-11-09)
// =============================================================================
// A short band with a row of candles and one "Lights down" switch, for Christmas Eve. The switch
// dims the band, and only the band (rule 3: the site is light only; this is not a dark mode): its
// ground eases from cream to deep navy and the candles light left to right, LIGHT_STEP_MS apart.
// Drawn by src/components/builder-blocks/CandlelightBlock.astro, styled in
// src/styles/builder-blocks.css (the `cl-` rules), which declares the same hexes as CANDLELIGHT
// below; candlelight.test.ts pins the two together and measures every pair to AA.
// =============================================================================

/** The heading when the editor leaves it empty (the schema's initial value too). */
export const CANDLELIGHT_HEADING = 'Light a candle';

/** How many candles the Studio offers, and the one a new block starts with. */
export const CANDLE_MIN = 5;
export const CANDLE_MAX = 9;
export const CANDLE_DEFAULT = 7;

/** The gap between one candle lighting and the next, left to right. */
export const LIGHT_STEP_MS = 120;

/** The Studio's count choices, 5 to 9. */
export const CANDLE_OPTIONS = Array.from({ length: CANDLE_MAX - CANDLE_MIN + 1 }, (_, i) => {
  const n = CANDLE_MIN + i;
  return { title: String(n), value: n };
});

/** A typed or missing count, held to 5 to 9 (a whole number). */
export function candleCount(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return CANDLE_DEFAULT;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return CANDLE_DEFAULT;
  return Math.min(CANDLE_MAX, Math.max(CANDLE_MIN, Math.round(n)));
}

/**
 * The wax height of each candle, in the SVG's units (a 40 by 120 box; the flame sits above the
 * wax). Tallest in the middle, stepping down to each end with a small fixed wobble, so the row
 * reads as candles someone set out by hand rather than a bar chart. Fixed, never random, so a
 * rebuild draws the same row.
 */
export function candleHeights(count: number): number[] {
  const n = candleCount(count);
  const mid = (n - 1) / 2;
  const WOBBLE = [0, 6, -4, 3, -6, 5, -2, 4, -5];
  return Array.from({ length: n }, (_, i) => {
    const fromMid = Math.abs(i - mid) / Math.max(mid, 1);
    return Math.round(78 - fromMid * 26 + WOBBLE[i % WOBBLE.length]);
  });
}

/**
 * The band's two states. Every text pair is AA (4.5:1) and the switch's edge is 3:1 (WCAG 1.4.11),
 * measured in candlelight.test.ts. The cream is the site's soft band (`--muted`), the navy is the
 * ink navy, and the text colours are the site's own heading, muted and caption colours.
 */
export const CANDLELIGHT = {
  up: {
    ground: '#F4EFE7',
    heading: '#1F3A5F',
    text: '#4A5A73',
    control: '#1F3A5F',
  },
  down: {
    ground: '#16263D',
    heading: '#FBF8F3',
    text: '#DBE3EE',
    control: '#FBF8F3',
  },
} as const;

/** The flat colours of the drawing: wax, its shaded side, the wick, and the two-part flame. */
export const CANDLE_ART = {
  wax: '#FBF3E4',
  waxShade: '#EADCC4',
  outline: '#1F3A5F',
  flameOuter: '#E8A93A',
  flameInner: '#B5503A',
} as const;
