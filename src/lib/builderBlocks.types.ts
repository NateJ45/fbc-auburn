// Safe to edit by hand
// The projected shapes of the event and holiday page blocks (builderSections.ts, 2026-10-26), as
// SectionRenderer receives them from sectionsProjection() in queries.ts: images with their asset
// resolved and buttons with their page resolved. Hand-written like churchBlocks.types.ts because
// the projection reshapes those fields.

import type { ProjectedCtaBlock, ProjectedImage } from './pageBuilder.types';
import type { RawOccurrence } from './builder-blocks';

export interface ProjectedEventDetailsSection {
  _type: 'eventDetailsSection';
  _key: string;
  eyebrow?: string;
  title?: string;
  occurrences?: (RawOccurrence & { _type?: string })[];
  place?: string;
  note?: string;
  image?: ProjectedImage | null;
  button?: ProjectedCtaBlock | null;
  showCalendar?: boolean | null;
  look?: string;
}

export interface ProjectedScheduleSection {
  _type: 'scheduleSection';
  _key: string;
  heading?: string;
  intro?: string;
  days?: {
    _key: string;
    title?: string;
    items?: { _key: string; startTime?: string; title?: string; note?: string }[];
  }[];
  look?: string;
}

export interface ProjectedPhotoCardsSection {
  _type: 'photoCardsSection';
  _key: string;
  heading?: string;
  intro?: string;
  cards?: {
    _key: string;
    image?: ProjectedImage | null;
    title?: string;
    body?: string;
    link?: ProjectedCtaBlock | null;
  }[];
  look?: string;
}

export type BuilderPageBlock =
  ProjectedEventDetailsSection | ProjectedScheduleSection | ProjectedPhotoCardsSection;

/** Every builder block type; SectionRenderer hands these to BuilderBlock.astro. */
export const BUILDER_BLOCK_TYPES: ReadonlySet<string> = new Set<BuilderPageBlock['_type']>([
  'eventDetailsSection',
  'scheduleSection',
  'photoCardsSection',
]);

/** Narrow a page-builder block to a builder block. */
export function isBuilderBlock<T extends { _type: string }>(b: T): b is T & BuilderPageBlock {
  return BUILDER_BLOCK_TYPES.has(b._type);
}
