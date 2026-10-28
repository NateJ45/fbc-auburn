// Safe to edit by hand
// =============================================================================
// A column of set text for the graphics maker (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// Most graphics are a stack: a small capitals kicker, a big title, a line or two
// of body, the times. column() sets such a stack inside a box: every block but
// the one marked `grow` is fitted first at its own size range, then the growing
// block (the title) takes the room that is left, as large as it fits. The stack
// is placed at the top, middle or bottom of the box. Overflows come back as
// plain warnings for the Studio ("The title is too long for Story.").
// =============================================================================

import { lines } from './svg.ts';
import { fitText, type FitOptions, type FitResult, type Measure } from './text.ts';

export interface Block {
  /** For warnings: "title", "body". */
  name: string;
  text: string;
  fit: Omit<FitOptions, 'maxW' | 'maxH'> & { maxH?: number };
  fill: string;
  /** Space after this block, px. */
  gap?: number;
  /** The block that takes the leftover room (one per column). */
  grow?: boolean;
  opacity?: number;
}

export interface ColumnResult {
  svg: string;
  /** Total height used. */
  height: number;
  /** Top of the stack as placed. */
  top: number;
  fits: Record<string, FitResult>;
  warnings: string[];
}

export function column(
  blocks: Block[],
  box: { x: number; y: number; w: number; h: number },
  measure: Measure,
  o: { align?: 'top' | 'middle' | 'bottom'; anchor?: 'start' | 'middle'; label?: string } = {},
): ColumnResult {
  const live = blocks.filter((b) => b.text.trim());
  const fits: Record<string, FitResult> = {};
  const warnings: string[] = [];
  const gaps = live.reduce((s, b, i) => s + (i < live.length - 1 ? (b.gap ?? 0) : 0), 0);
  let used = gaps;
  for (const b of live.filter((x) => !x.grow)) {
    const r = fitText(b.text, { ...b.fit, maxW: box.w, maxH: b.fit.maxH ?? box.h }, measure);
    fits[b.name] = r;
    used += r.height;
  }
  for (const b of live.filter((x) => x.grow)) {
    const room = Math.max(0, box.h - used);
    const r = fitText(
      b.text,
      { ...b.fit, maxW: box.w, maxH: Math.min(room, b.fit.maxH ?? room) },
      measure,
    );
    fits[b.name] = r;
    used += r.height;
  }
  for (const b of live) {
    if (fits[b.name].overflow)
      warnings.push(
        `The ${b.name} is too long${o.label ? ` for ${o.label}` : ''}. Try fewer words.`,
      );
  }
  if (used > box.h + 0.5 && !warnings.length)
    warnings.push(`There is too much to say${o.label ? ` on ${o.label}` : ''}. Try fewer words.`);
  const align = o.align ?? 'top';
  let y =
    align === 'top'
      ? box.y
      : align === 'middle'
        ? box.y + (box.h - used) / 2
        : box.y + box.h - used;
  const top = y;
  const x = o.anchor === 'middle' ? box.x + box.w / 2 : box.x;
  let svg = '';
  live.forEach((b, i) => {
    const r = fits[b.name];
    svg += lines(r.lines, {
      family: b.fit.family,
      size: r.size,
      weight: b.fit.weight,
      tracking: b.fit.tracking,
      x,
      y,
      leading: b.fit.leading,
      fill: b.fill,
      anchor: o.anchor ?? 'start',
      opacity: b.opacity,
    });
    y += r.height + (i < live.length - 1 ? (b.gap ?? 0) : 0);
  });
  return { svg, height: used, top, fits, warnings };
}
