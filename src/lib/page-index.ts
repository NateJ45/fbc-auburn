// Safe to edit by hand
// "On this page" (2026-11-21, the inner-page rhythm pass): the list of a page's H2s, worked out at
// build time from the sections themselves (rule 13: never a field an editor types). SectionRenderer
// calls `pageIndex()` on the rows it is about to draw and shows the index (OnThisPage.astro) when
// there are INDEX_MIN or more: a sticky side rail from 1024px, a small "On this page" disclosure
// near the top on phones.
//
// Where the H2s come from, and the id each one carries (the ids are what the links point at):
//   - a section's own heading (`heading`, or `headline` on the blocks that call it that): the
//     row's heading id from SectionRenderer (a named anchor such as `the-gospel`, or `page-3`);
//   - the stone-icon cards when the cards section has no heading of its own: each card's title is
//     the H2 there, with the id `cardHeadingId(title)` (What we believe's nine beliefs);
//   - H2s typed inside a text body (Text, Image + text): the slug PortableText gives them, worked
//     out the way PortableText.tsx and extractHeadings() (portable-text-headings.ts, PORTABLE) do it:
//     one slug count per body across h2 to h4. Re-stated here because that file imports without
//     an extension, which the unit tests (node --experimental-strip-types) cannot load.
// Left out: the opening banner (the H1), the closing band, spacers, notices, stat rows and photo
// breaks (their line is not a heading). The browser script drops any entry whose target is not an
// H2 on the page, so a block that draws its heading some other way can never leave a dead link.

import { slugify } from './slugify.ts';
import { splitStega } from './preview-stega.ts';

/** The fewest H2s that earn a page its index. */
export const INDEX_MIN = 5;

export interface IndexEntry {
  id: string;
  text: string;
}

interface Row {
  block: { _type: string };
  headingId: string;
}

/** Blocks whose heading is not one of the page's sections, or that have none. */
const NOT_INDEXED = new Set([
  'heroSection',
  'ctaBandSection',
  'spacerSection',
  'noticeSection',
  'statSection',
  'photoBreakSection',
]);

/** Blocks whose typed body can hold H2s, drawn by the shared PortableText renderer. */
const BODY_TYPES = new Set(['richTextSection', 'imageTextSection']);

/** The H2s of one typed body, with the ids PortableText.tsx gives them. */
function bodyH2s(body: unknown): IndexEntry[] {
  if (!Array.isArray(body)) return [];
  const counts = new Map<string, number>();
  const out: IndexEntry[] = [];
  for (const b of body as { _type?: string; style?: string; children?: { text?: string }[] }[]) {
    if (b?._type !== 'block' || !['h2', 'h3', 'h4'].includes(b.style ?? '')) continue;
    const text = (b.children ?? [])
      .map((c) => c?.text ?? '')
      .join('')
      .trim();
    if (!text) continue;
    const base = slugify(text);
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);
    if (b.style === 'h2') out.push({ id: n === 1 ? base : `${base}-${n}`, text });
  }
  return out;
}

const clean = (v: unknown): string =>
  typeof v === 'string' ? splitStega(v).cleaned.replace(/\s+/g, ' ').trim() : '';

/** The id of a stone-icon card's title when the card is one of the page's H2s. */
export function cardHeadingId(title: string): string {
  return slugify(clean(title));
}

/** Every H2 the page's sections draw, in page order, with the id it carries. */
export function pageIndex(rows: Row[]): IndexEntry[] {
  const out: IndexEntry[] = [];
  const seen = new Set<string>();
  const push = (id: string, text: string) => {
    if (!id || !text || seen.has(id)) return;
    seen.add(id);
    out.push({ id, text });
  };
  for (const row of rows) {
    const block = row.block as { _type: string; [key: string]: unknown };
    const headingId = row.headingId;
    if (NOT_INDEXED.has(block._type)) continue;
    const heading = clean(block.heading) || clean(block.headline);
    if (heading) push(headingId, heading);
    if (block._type === 'iconCardsSection' && !heading && Array.isArray(block.cards)) {
      for (const card of block.cards as { title?: unknown }[]) {
        const title = clean(card?.title);
        if (title) push(cardHeadingId(title), title);
      }
    }
    if (BODY_TYPES.has(block._type)) {
      for (const h of bodyH2s(block.body)) push(h.id, clean(h.text));
    }
  }
  return out;
}

/** True when the page has enough H2s for the index. */
export const showsIndex = (entries: IndexEntry[]): boolean => entries.length >= INDEX_MIN;
