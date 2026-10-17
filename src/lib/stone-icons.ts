// Safe to edit by hand
// The eight FBC Auburn stone icons (brand kit, src/assets/brand/stone-icon-*.svg), as the list the
// Studio's icon pickers offer. Shared by the schema (src/sanity/schemaTypes/auburnSections.ts) and
// the renderer (src/components/StoneIcon.astro), so a value can never name a file that is not there.
// The field that stores one is called `icon`, which is on NON_STEGA_FIELDS (src/lib/cms-preview.ts).

export const STONE_ICONS = [
  { title: 'Map pin (finding us)', value: 'map-pin' },
  { title: 'Clock (times)', value: 'clock' },
  { title: 'Coffee cup (welcome, fellowship)', value: 'coffee' },
  { title: 'Open Bible', value: 'bible' },
  { title: 'Praying hands', value: 'praying-hands' },
  { title: 'Toy blocks (children)', value: 'blocks' },
  { title: 'Music', value: 'music' },
  { title: 'Giving hand', value: 'giving-hand' },
] as const;

export type StoneIconName = (typeof STONE_ICONS)[number]['value'];

export function isStoneIcon(value: unknown): value is StoneIconName {
  return STONE_ICONS.some((i) => i.value === value);
}
