// Safe to edit by hand
// =============================================================================
// Setting words for the graphics maker: line breaks and fitting (2026-10-27).
// =============================================================================
// Pure functions. The width of a run of text comes from an injected `measure`,
// so the same code runs in the Studio (a canvas measuring the real fonts,
// src/lib/graphics/raster.ts) and in node tests (an approximate measure).
//
// Lines are BALANCED, like CSS `text-wrap: balance`: the fewest lines that fit,
// then the narrowest width that still gives that many, so a two-line title
// never leaves one word alone on the second line.
// =============================================================================

export type Family = 'serif' | 'sans';

export interface FontSpec {
  family: Family;
  /** px */
  size: number;
  /** 400 to 700 (Familjen Grotesk is variable; Young Serif has 400 only). */
  weight?: number;
  /** Letter spacing in em (labels in capitals use about 0.14). */
  tracking?: number;
  /** Capitals: the text is upper-cased before measuring and drawing. */
  caps?: boolean;
}

/** Width in px of `text` set in `font` (tracking included). */
export type Measure = (text: string, font: FontSpec) => number;

/**
 * A rough measure for tests and for the first layout before the fonts load:
 * average advance widths of the two faces.
 */
export const approxMeasure: Measure = (text, font) => {
  const per = font.family === 'serif' ? 0.56 : 0.5;
  const weightK = 1 + ((font.weight ?? 400) - 400) / 3000;
  const tracking = (font.tracking ?? 0) * font.size * text.length;
  const t = font.caps ? text.toUpperCase() : text;
  const capsK = font.caps ? 1.18 : 1;
  return t.length * font.size * per * weightK * capsK + tracking;
};

/** Greedy line breaking at spaces; a single word wider than `maxW` keeps its own line. */
export function breakLines(text: string, font: FontSpec, maxW: number, measure: Measure): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (!line || measure(next, font) <= maxW) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Balanced lines: as few as greedy needs, at the narrowest width that keeps that count. */
export function balanceLines(
  text: string,
  font: FontSpec,
  maxW: number,
  measure: Measure,
): string[] {
  const greedy = breakLines(text, font, maxW, measure);
  if (greedy.length < 2) return greedy;
  let lo = maxW * 0.4;
  let hi = maxW;
  let best = greedy;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const trial = breakLines(text, font, mid, measure);
    if (trial.length <= greedy.length && trial.every((l) => measure(l, font) <= maxW)) {
      best = trial;
      hi = mid;
    } else lo = mid;
  }
  return best;
}

export interface FitOptions {
  family: Family;
  weight?: number;
  tracking?: number;
  caps?: boolean;
  maxW: number;
  /** The tallest the block may be, in px. */
  maxH: number;
  maxLines: number;
  /** Largest and smallest size, px. Tries every 2% step between. */
  max: number;
  min: number;
  /** Line height as a multiple of the size. */
  leading: number;
  balance?: boolean;
}

export interface FitResult {
  size: number;
  lines: string[];
  /** Block height: lines x size x leading. */
  height: number;
  /** Width of the longest line. */
  width: number;
  /** True when even the smallest size did not fit: the Studio says "shorten this". */
  overflow: boolean;
}

/** The largest size at which `text` fits the box in `maxLines` lines or fewer. */
export function fitText(text: string, o: FitOptions, measure: Measure): FitResult {
  const t = o.caps ? text.toUpperCase() : text;
  const at = (size: number): FitResult => {
    const font: FontSpec = { family: o.family, size, weight: o.weight, tracking: o.tracking };
    const lines = (o.balance === false ? breakLines : balanceLines)(t, font, o.maxW, measure);
    const width = Math.max(0, ...lines.map((l) => measure(l, font)));
    const height = lines.length * size * o.leading;
    const overflow = lines.length > o.maxLines || height > o.maxH + 0.5 || width > o.maxW + 0.5;
    return { size, lines, height, width, overflow };
  };
  if (!t.trim()) return { size: o.max, lines: [], height: 0, width: 0, overflow: false };
  for (let s = o.max; s >= o.min; s *= 0.98) {
    const r = at(Math.round(s * 10) / 10);
    if (!r.overflow) return r;
  }
  return at(o.min);
}

/** Public copy never carries an em or en dash (house rule 2): they become a colon or a comma. */
export function cleanText(s: unknown): string {
  return String(s ?? '')
    .replace(/\s*[—–]\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
}
