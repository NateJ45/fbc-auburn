// Safe to edit by hand
// The projected shapes of the church section library (churchSections.ts), as
// SectionRenderer receives them from sectionsProjection() in queries.ts: images
// with their asset resolved, buttons with their page resolved, and a Form
// block's form dereferenced. Hand-written like the rest of pageBuilder.types.ts
// because the projection reshapes those fields.

import type { ProjectedCtaBlock, ProjectedImage } from './pageBuilder.types';

/** Portable text as stored; rendered by PortableText. */
type Blocks = unknown[];

interface Base {
  _key: string;
  heading?: string;
  intro?: string;
}

export interface ProjectedServiceTimesSection extends Base {
  _type: 'serviceTimesSection';
}

export interface ProjectedMapSection extends Base {
  _type: 'mapSection';
  note?: string;
}

export interface ProjectedBeliefsSection extends Base {
  _type: 'beliefsSection';
  beliefs?: { _key: string; title?: string; text?: string; references?: string }[];
  translation?: string;
  linkFaithAndMessage?: boolean;
}

export interface ProjectedTimelineSection extends Base {
  _type: 'timelineSection';
  entries?: {
    _key: string;
    year?: string;
    title?: string;
    text?: string;
    image?: ProjectedImage | null;
  }[];
}

export interface ProjectedAccordionSection extends Base {
  _type: 'accordionSection';
  items?: { _key: string; question?: string; answer?: Blocks }[];
}

export interface ProjectedTabsSection extends Base {
  _type: 'tabsSection';
  tabs?: { _key: string; label?: string; body?: Blocks }[];
}

export interface ProjectedScriptureSection {
  _type: 'scriptureSection';
  _key: string;
  verse?: string;
  reference?: string;
  translation?: string;
}

export interface ProjectedNoticeSection {
  _type: 'noticeSection';
  _key: string;
  message?: string;
  urgency?: 'info' | 'urgent' | string;
  link?: ProjectedCtaBlock | null;
  startDate?: string;
  endDate?: string;
}

export interface ProjectedCountdownSection {
  _type: 'countdownSection';
  _key: string;
  eventName?: string;
  startDate?: string;
  endDate?: string;
  intro?: string;
  duringText?: string;
  afterText?: string;
  link?: ProjectedCtaBlock | null;
}

export interface ProjectedGivingSection extends Base {
  _type: 'givingSection';
  textToGive?: string;
}

export interface ProjectedLivestreamSection extends Base {
  _type: 'livestreamSection';
  videoUrl?: string;
}

export interface ProjectedEventsSection extends Base {
  _type: 'eventsSection';
  count?: number;
  keywords?: string;
  showSubscribe?: boolean;
  emptyText?: string;
}

export interface ProjectedNewsletterSection extends Base {
  _type: 'newsletterSection';
  signupUrl?: string;
}

export interface ProjectedCalendarSubscribeSection extends Base {
  _type: 'calendarSubscribeSection';
}

export interface ProjectedProgressSection extends Base {
  _type: 'progressSection';
  goal?: number;
  raised?: number;
  asOf?: string;
  link?: ProjectedCtaBlock | null;
}

export interface ProjectedAffiliationsSection extends Base {
  _type: 'affiliationsSection';
  items?: {
    _key: string;
    name?: string;
    url?: string;
    note?: string;
    logo?: ProjectedImage | null;
  }[];
}

export interface ProjectedButtonRowSection extends Base {
  _type: 'buttonRowSection';
  layout?: 'buttons' | 'cards' | string;
  links?: { _key: string; link?: ProjectedCtaBlock | null; note?: string }[];
}

export interface ProjectedContactCardSection extends Base {
  _type: 'contactCardSection';
}

export interface ProjectedColumnsSection extends Base {
  _type: 'columnsSection';
  textColumns?: { _key: string; heading?: string; body?: Blocks }[];
}

export interface ProjectedPhotoSection {
  _type: 'photoSection';
  _key: string;
  image?: ProjectedImage | null;
  caption?: string;
}

/** The form as dereferenced by the projection (src/lib/church-form.ts normalizes it). */
export interface ProjectedFormSection {
  _type: 'formSection';
  _key: string;
  form?: Record<string, unknown> | null;
}

/** A Church Trac form pasted into a band (docs/agent/church-trac.md). */
export interface ProjectedChurchTracFormSection extends Base {
  _type: 'churchTracFormSection';
  embed?: string;
  size?: string;
}

/** A Church Trac page read at build time (docs/agent/church-trac.md). */
export interface ProjectedChurchTracPageSection extends Base {
  _type: 'churchTracPageSection';
  page?: string;
}

/** An RSVP form for one event (card 127). `pageId` comes from the projection (^._id). */
export interface ProjectedRsvpSection {
  _type: 'rsvpSection';
  _key: string;
  pageId?: string;
  heading?: string;
  intro?: string;
  eventName?: string;
  startsAt?: string;
  where?: string;
  capacity?: number;
  waitlist?: boolean;
  maxParty?: number;
  closesAt?: string;
  questions?: unknown[];
  confirmationNote?: string;
}

export type ChurchPageBlock =
  | ProjectedServiceTimesSection
  | ProjectedMapSection
  | ProjectedBeliefsSection
  | ProjectedTimelineSection
  | ProjectedAccordionSection
  | ProjectedTabsSection
  | ProjectedScriptureSection
  | ProjectedNoticeSection
  | ProjectedCountdownSection
  | ProjectedGivingSection
  | ProjectedLivestreamSection
  | ProjectedEventsSection
  | ProjectedNewsletterSection
  | ProjectedCalendarSubscribeSection
  | ProjectedProgressSection
  | ProjectedAffiliationsSection
  | ProjectedButtonRowSection
  | ProjectedContactCardSection
  | ProjectedColumnsSection
  | ProjectedPhotoSection
  | ProjectedFormSection
  | ProjectedChurchTracFormSection
  | ProjectedChurchTracPageSection
  | ProjectedRsvpSection;

export type ChurchBlockType = ChurchPageBlock['_type'];

/** Every church block type; SectionRenderer hands these to ChurchBlock.astro. */
export const CHURCH_BLOCK_TYPES: ReadonlySet<string> = new Set<ChurchBlockType>([
  'serviceTimesSection',
  'mapSection',
  'beliefsSection',
  'timelineSection',
  'accordionSection',
  'tabsSection',
  'scriptureSection',
  'noticeSection',
  'countdownSection',
  'givingSection',
  'livestreamSection',
  'eventsSection',
  'newsletterSection',
  'calendarSubscribeSection',
  'progressSection',
  'affiliationsSection',
  'buttonRowSection',
  'contactCardSection',
  'columnsSection',
  'photoSection',
  'formSection',
  'churchTracFormSection',
  'churchTracPageSection',
  'rsvpSection',
]);

/** Narrow a page-builder block to a church block. */
export function isChurchBlock<T extends { _type: string }>(b: T): b is T & ChurchPageBlock {
  return CHURCH_BLOCK_TYPES.has(b._type);
}
