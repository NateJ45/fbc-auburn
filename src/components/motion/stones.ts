// Safe to edit by hand
// The stone assets the motion layer draws with: the mark's three gold stepping stones
// (stone-a/b/c.svg) and the eight stone icons (stone-icon-<name>.svg), resolved to built URLs.
// Used by StepsRail, WalkSection and the background path (which reads them from data-stones).
import { getImage } from 'astro:assets';
import stoneA from '@/assets/brand/stone-a.svg';
import stoneB from '@/assets/brand/stone-b.svg';
import stoneC from '@/assets/brand/stone-c.svg';

const ICONS = import.meta.glob<{ default: ImageMetadata }>('../../assets/brand/stone-icon-*.svg', {
  eager: true,
});

/** The three stepping-stone shapes, in the order the mockups cycle them. */
export async function stoneSrcs(): Promise<[string, string, string]> {
  const [a, b, c] = await Promise.all([stoneA, stoneB, stoneC].map((src) => getImage({ src })));
  return [a.src, b.src, c.src];
}

/** A stone icon by name (map-pin, clock, coffee, ...); null for a name with no file. */
export async function stoneIconSrc(name?: string | null): Promise<string | null> {
  if (!name) return null;
  const mod = ICONS[`../../assets/brand/stone-icon-${name}.svg`];
  if (!mod) return null;
  return (await getImage({ src: mod.default })).src;
}
