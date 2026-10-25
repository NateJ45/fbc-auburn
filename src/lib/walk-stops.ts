// Safe to edit by hand
// "Walk in with us" (Plan your visit): which stone icon each stop wears. The walkStop schema has
// no icon field (its words are the church's, the picture is ours), so the icon is worked out here
// from what the stop says: parking, the sign, the door, the children's room, the hall, the
// sanctuary. A stop that matches none takes the icon of its place in the usual five-stop order.
// Replaced the drawn plan of the lot (src/lib/walk-plan.ts, removed 2026-10-24).
import type { StoneIconName } from '../sanity/schemaTypes/auburnMotionSections.ts';

/** Keyword rules, checked in order against the stop's title and text. */
const RULES: [RegExp, StoneIconName][] = [
  [/\b(park|parking|lot|car|sign|drive|arriv)/i, 'map-pin'],
  [/\b(kid|kids|child|children|nursery|toddler)/i, 'blocks'],
  [/\b(coffee|hall|fellowship|snack|breakfast)/i, 'coffee'],
  [/\b(door|doors|greet|greeter|welcome|porch|ramp|hello)/i, 'praying-hands'],
  [/\b(worship|sanctuary|sit|seat|pew|service|sermon|bible)/i, 'bible'],
  [/\b(sing|music|choir|hymn)/i, 'music'],
];

/** The usual order of the walk, for a stop whose words match no rule. */
const BY_PLACE: StoneIconName[] = ['map-pin', 'praying-hands', 'coffee', 'blocks', 'bible'];

export function walkStopIcon(
  stop: { title?: string | null; body?: string | null },
  index: number,
): StoneIconName {
  // The title decides first; the text only when the title says nothing we recognise.
  for (const text of [stop.title ?? '', stop.body ?? '']) {
    const hit = RULES.find(([re]) => re.test(text));
    if (hit) return hit[1];
  }
  return BY_PLACE[index % BY_PLACE.length];
}
