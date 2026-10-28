// Safe to edit by hand
// Auburn's named anchors for page sections (site audit, 2026-10-25). A section whose block key is
// listed here gets that name as its heading's id, so a link can land on it: Home's "The good news"
// and Next steps link to /what-we-believe/#the-gospel, Home's Worship step to /plan-your-visit/#kids.
// Any other section keeps its numbered id (`page-3`), as before.
//
// This lived in src/lib/section-anchors.ts until 2026-10-27. That path is now the starter's
// PORTABLE copy (PORTS.md card 158: every headed section named from its heading). Auburn does not
// use it: naming every heading would change ids that links, the flow layer and the board styles
// rely on. Auburn keeps its key-pinned list here instead.
//
// The keys are the ones scripts/content/audit-pages.mjs (and earlier content scripts) gave the
// blocks. They are stable: the Studio never changes a block's key, only a new block gets a new one.
// A heading id must be unique on its page, so keep each name to one page.
export const SECTION_ANCHORS: Readonly<Record<string, string>> = {
  // What we believe
  'wwb-short': 'the-gospel',
  'wwb-baptism': 'baptism',
  'wwb-baptist': 'baptist',
  // Plan your visit
  'pyv-kids': 'kids',
  'pyv-worship': 'worship',
  'pyv-here': 'getting-around',
  // Need the pastor? (pastoral care)
  'pc-reach': 'reach',
  // Sermons (2026-10-26, a page builder now): the Watch band keeps the id it had as fixed code.
  'sermons-watch': 'sermons-watch-heading',
};

/** The heading id for a section: its named anchor, else the numbered id it would have had. */
export function anchorFor(key: string | undefined, fallback: string): string {
  return (key && SECTION_ANCHORS[key]) || fallback;
}
