// Foundation, edit with care
// =============================================================================
// Section looks: a small set of DESIGNED choices, never a free colour
// =============================================================================
// Squarespace lets an editor pick any background for any section. That is how a
// site drifts: five greys, two greens and a page nobody can read. This template
// answers the same wish ("make this one stand out", "keep this one plain") with
// a short list of looks the design already holds, and leaves the colours to the
// palette (CLAUDE.md rule 9, as amended 2026-10-18).
//
// THE CONTRACT
//   - `look` is a dropdown (an enum) on a handful of content blocks. It is the
//     ONLY appearance field a block may carry; tone / surface / background /
//     accent stay forbidden, and src/lib/section-fields.test.ts fails on them.
//   - The editor picks a LOOK. src/lib/sectionCadence.ts turns the look into a
//     surface, with the neighbours in view, so the page still alternates and two
//     dark bands never touch.
//   - Every surface a look can land on is a measured pair in src/lib/surfaces.ts,
//     so the contrast gate (surfaces.test.ts) holds it to WCAG AA.
//   - Unset (every block that existed before this file) means Standard, and
//     Standard is exactly the old cadence, so no existing page moves.
//
// FBC AUBURN (2026-10-18). The inner pages sit on a white board where every
// Standard band is white and a BoardRule separates sections (src/styles/
// board.css), so the starter's Quiet look (always the plain page) would look
// exactly like Standard here and is left out. In its place is Stone: the pale
// tint the church's sky panels use (flat since 2026-10-27; it was pale blue
// brick). Feature is the church's deep blue (--auburn-deep).
// =============================================================================

import type { SurfaceValue } from './surfaces.ts';

/** Every look this template knows. A block offers a subset (LOOKS_BY_TYPE). */
export type SectionLook = 'standard' | 'feature' | 'stone';

export interface LookOption {
  value: SectionLook;
  /** The word on the Studio radio. Short, plain, no jargon. */
  title: string;
  /** One line under it, saying what the reader will see. */
  hint: string;
  /**
   * The surface this look asks for, or null for "whatever the cadence says".
   * The cadence can still overrule a request (two Feature bands in a row).
   */
  surface: SurfaceValue | null;
}

export const SECTION_LOOKS: LookOption[] = [
  {
    value: 'standard',
    title: 'Standard',
    hint: 'Follows the page rhythm: plain and soft bands take turns on their own.',
    surface: null,
  },
  {
    value: 'feature',
    title: 'Feature',
    hint: 'The church blue with white text. Use it once or twice a page, for the part that matters most.',
    surface: 'feature',
  },
  {
    value: 'stone',
    title: 'Stone',
    hint: 'A pale blue band of stepping stones, with dark text. A gentle way to set a section apart.',
    surface: 'stone',
  },
];

export const LOOK_BY_VALUE: Record<string, LookOption> = Object.fromEntries(
  SECTION_LOOKS.map((l) => [l.value, l]),
);

const ALL: SectionLook[] = ['standard', 'feature', 'stone'];
// Blocks whose cards or buttons are drawn on the white board: Stone sets them apart on pale tiles,
// but the Feature navy would swallow their navy buttons and white cards (2026-10-26).
const STONE_ONLY: SectionLook[] = ['standard', 'stone'];

/**
 * Which blocks offer a look, and which looks each one offers.
 *
 * Eligible: the five general content blocks the cadence already paints. They
 * are the ones an editor stacks into a page, so they are the ones a page needs
 * to vary. NOT eligible: the self-contained blocks (hero, CTA band, stats, FAQ,
 * team, logos, embeds, lists), which draw their own band by design, and the
 * business blocks (story, service area, guarantee), which belong to a fixed
 * page shape rather than to a stack an editor builds.
 */
export const LOOKS_BY_TYPE: Record<string, SectionLook[]> = {
  richTextSection: ALL,
  imageTextSection: ALL,
  gallerySection: ALL,
  quoteSection: ALL,
  videoSection: ALL,
  // 2026-10-26, the event and holiday page pass: the builder blocks and three church blocks an
  // event page stacks (builderSections.ts, churchSections.ts, auburnSections.ts).
  columnsSection: ALL,
  scheduleSection: ALL,
  iconCardsSection: STONE_ONLY,
  buttonRowSection: STONE_ONLY,
  photoCardsSection: STONE_ONLY,
  eventDetailsSection: STONE_ONLY,
};

/** The options a block's `look` field offers, in display order. */
export function lookOptionsFor(type: string): LookOption[] {
  const allowed = LOOKS_BY_TYPE[type] ?? [];
  return SECTION_LOOKS.filter((l) => allowed.includes(l.value));
}

/**
 * The look a block asked for, made safe.
 *
 * Unset, unknown, or not offered by that block type all mean Standard, so a
 * stale value (a look removed from a block, a typo in an import) renders the
 * plain cadence instead of something nobody designed. Stega markers are cut
 * off defensively; `look` is in NON_STEGA_FIELDS so the preview should never
 * send them (rule 8b).
 */
export function resolveLook(type: string, raw: unknown): SectionLook {
  if (typeof raw !== 'string') return 'standard';
  const clean = raw.replace(/[^\w-].*$/s, '');
  const allowed = LOOKS_BY_TYPE[type];
  return allowed?.includes(clean as SectionLook) ? (clean as SectionLook) : 'standard';
}
