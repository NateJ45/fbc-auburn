// Safe to edit by hand
// The filter chips on Find your place (2026-11-09): "is there something for me?" in one tap.
//
// A card may carry two optional tick lists in the Studio, "Who it suits" (`audience`) and "When it
// meets" (`when`), each from the fixed list below. The block shows a chip only for a tag at least
// one card carries, in the order below, so nothing appears until the pastor tags a card. The chip
// row, the hiding and the glide are drawn by src/components/sections/FindYourPlace.astro.
//
// Both field names are on NON_STEGA_FIELDS (src/lib/cms-preview.ts, rule 8b), and every value is
// still cleaned with plain() here, because this also runs on the live site, where that list does
// not exist.
import { plain } from './church-facts.ts';

export interface FypTag {
  /** The stored value ("kids"). */
  value: string;
  /** The chip and Studio label ("Kids"). */
  title: string;
}

/** "Who it suits": the people a card is for. */
export const FYP_AUDIENCE: readonly FypTag[] = [
  { value: 'kids', title: 'Kids' },
  { value: 'students', title: 'Students' },
  { value: 'adults', title: 'Adults' },
  { value: 'families', title: 'Families' },
];

/** "When it meets": Sunday, or a weeknight. */
export const FYP_WHEN: readonly FypTag[] = [
  { value: 'sunday', title: 'Sunday' },
  { value: 'weeknight', title: 'Weeknight' },
];

const ALL_TAGS = [...FYP_AUDIENCE, ...FYP_WHEN];
const KNOWN = new Set(ALL_TAGS.map((t) => t.value));

interface TaggedCard {
  audience?: (string | null)[] | null;
  when?: (string | null)[] | null;
}
interface TaggedGroup {
  cards?: TaggedCard[] | null;
}

/** A card's tags, cleaned, known values only, no repeats ("kids families sunday"). */
export function cardTags(card: TaggedCard): string[] {
  const out: string[] = [];
  for (const raw of [...(card.audience ?? []), ...(card.when ?? [])]) {
    const v = plain(raw);
    if (KNOWN.has(v) && !out.includes(v)) out.push(v);
  }
  return out;
}

/** The chips to draw: every tag some card carries, in the fixed order. Empty means no chip row. */
export function fypChips(groups: TaggedGroup[]): FypTag[] {
  const used = new Set<string>();
  for (const g of groups) for (const c of g.cards ?? []) for (const t of cardTags(c)) used.add(t);
  return ALL_TAGS.filter((t) => used.has(t.value));
}

/** What the live region says after a change: "1 ministry", "4 ministries". */
export const countLine = (n: number): string => `${n} ${n === 1 ? 'ministry' : 'ministries'}`;
