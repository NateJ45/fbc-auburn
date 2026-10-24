// Safe to edit by hand
// The FBC Auburn stone icons (brand kit, src/assets/brand/stone-icon-*.svg), as the list the
// Studio's icon pickers offer: the original eight, then eight for What we believe (round 23,
// 2026-10-24; masters in brand/icons/, printed by scripts/print-icons.mjs). Shared by the schema (src/sanity/schemaTypes/auburnSections.ts) and
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
  // What we believe
  { title: 'Crown (God)', value: 'crown' },
  { title: 'Cross (Jesus)', value: 'cross' },
  { title: 'Dove (Holy Spirit)', value: 'dove' },
  { title: 'Cracked heart (people and sin)', value: 'cracked-heart' },
  { title: 'Broken chain (salvation)', value: 'broken-chain' },
  { title: "Cup and loaf (baptism and the Lord's Supper)", value: 'cup-and-loaf' },
  { title: 'Church (the church)', value: 'church' },
  { title: 'Clouds and light (Jesus will return)', value: 'clouds-and-light' },
] as const;

export type StoneIconName = (typeof STONE_ICONS)[number]['value'];

export function isStoneIcon(value: unknown): value is StoneIconName {
  return STONE_ICONS.some((i) => i.value === value);
}
