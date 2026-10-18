// Page-builder discriminated union.
//
// Generated types (sanity.types.ts) describe the raw *schema* shapes. The GROQ
// sectionsProjection() in queries.ts RESHAPES several fields at query time:
//   - Images: asset reference is resolved to a full asset document via `asset->`
//     and alt gets a coalesce fallback. The projected shape is wider than the
//     raw SanityImageAssetReference.
//   - CTA blocks: internalLink is resolved to `{ _type: string; slug: string }`
//     (not a union of Reference types).
//   - Rich sections inject collection fields that do not exist on the schema
//     type at all (services, points, steps, travelFees, siteSettingsText).
//
// For each divergence we use a locally-scoped override type rather than `as any`,
// so callers that read these fields get a meaningful type (not `unknown`).
//
// This file is safe to edit by hand. Do NOT import from it in sanity.types.ts.

import type {
  HeroSection as _HeroSection,
  RichTextSection as _RichTextSection,
  ImageTextSection as _ImageTextSection,
  GallerySection as _GallerySection,
  QuoteSection as _QuoteSection,
  StatSection as _StatSection,
  CtaBandSection as _CtaBandSection,
  VideoSection as _VideoSection,
  SpacerSection as _SpacerSection,
  FounderSection as _FounderSection, // scaffold: about
  StorySection as _StorySection, // scaffold: about
  ServiceAreaSection as _ServiceAreaSection,
  GuaranteeSection as _GuaranteeSection,
  // U7 new blocks — hand-authored below since typegen has not run yet
  // FaqSection, LogoStripSection, TeamSection, EmbedSection — not imported from
  // sanity.types yet; their projected types are fully defined below.
} from './sanity.types';
import type { DownloadDoc, PersonDoc, SeriesDoc, SermonDoc } from './sermons';
import type { ChurchPageBlock } from './churchBlocks.types';

// ---------------------------------------------------------------------------
// Shared projected shapes
// ---------------------------------------------------------------------------

/** Image after `asset->` + alt coalesce in the GROQ projection. */
export interface ProjectedImage {
  _type: 'image';
  asset?: {
    _id?: string;
    _ref?: string;
    _type?: string;
    url?: string;
    metadata?: {
      dimensions?: { width?: number; height?: number; aspectRatio?: number };
      lqip?: string;
      blurHash?: string;
    };
    [key: string]: unknown;
  } | null;
  alt?: string;
  hotspot?: { x?: number; y?: number; height?: number; width?: number };
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  caption?: string;
  [key: string]: unknown;
}

/**
 * The image shape every component that renders a Sanity image should accept.
 *
 * Nine components used to redeclare their own `interface SanityImageObject`
 * with `asset?: { _ref?: string; _id?: string }` and REQUIRED hotspot/crop
 * numbers. None of those matched `ProjectedImage`, which is what the GROQ
 * projection actually returns: `asset->` resolves to a whole asset document
 * (extra keys, and `null` when the reference is broken) and Sanity marks every
 * hotspot and crop number optional. `astro check` reported eight assignment
 * errors along that seam the first time it ran here, 2026-09-06. Every one was
 * the prop contract being narrower than the data, not the data being wrong.
 *
 * `_type` is optional because the code-defined fallbacks in
 * src/data/defaultSections.ts build image objects without it.
 */
export interface SanityImageObject extends Omit<ProjectedImage, '_type'> {
  // Spelled out rather than written as `Omit<ProjectedImage, '_type'>` alone:
  // ProjectedImage carries an index signature, and Omit over an index signature
  // drops every named property with it, which would leave `.alt` typed `{}`.
  _type?: string;
  asset?: ProjectedImage['asset'];
  alt?: string;
  hotspot?: { x?: number; y?: number; height?: number; width?: number };
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  caption?: string;
}

/** CTA block after `internalLink->{ _type, "slug": slug.current }` projection. */
export interface ProjectedCtaBlock {
  _type: 'ctaBlock';
  label?: string;
  linkType?: 'internal' | 'external' | 'email' | 'phone';
  /** Resolved internal link — shape is `{ _type: string; slug: string }` after deref. */
  internalLink?: { _type?: string; slug?: string } | null;
  externalUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  openInNewTab?: boolean;
  /** Fallback href used by default sections (no Sanity project). */
  href?: string;
}

// ---------------------------------------------------------------------------
// Per-block projected types
// Each member carries _key (required for page-builder arrays in Sanity) and
// overrides only the fields that the projection reshapes.
// ---------------------------------------------------------------------------

export type ProjectedHeroSection = { _key: string } & Omit<
  _HeroSection,
  'backgroundImage' | 'primaryCta' | 'secondaryCta'
> & {
    backgroundImage?: ProjectedImage | null;
    primaryCta?: ProjectedCtaBlock | null;
    secondaryCta?: ProjectedCtaBlock | null;
  };

export type ProjectedRichTextSection = { _key: string } & _RichTextSection & {
    /** Non-schema extra field present in some defaultSections entries. */
    cta?: ProjectedCtaBlock | null;
    [key: string]: unknown;
  };

export type ProjectedImageTextSection = { _key: string } & Omit<
  _ImageTextSection,
  'image' | 'cta' | 'extraImages' | 'signedPhoto'
> & {
    image?: ProjectedImage | null;
    /** Home only (board E): the two smaller photos of the Who we are mosaic. */
    extraImages?: ProjectedImage[] | null;
    /** Home only: the round portrait beside the signature. */
    signedPhoto?: ProjectedImage | null;
    cta?: ProjectedCtaBlock | null;
    /** Non-schema alias for imageSide present in some defaultSections entries. */
    imagePosition?: 'left' | 'right';
    [key: string]: unknown;
  };

export type ProjectedGallerySection = { _key: string } & Omit<_GallerySection, 'images'> & {
    images?: ProjectedImage[];
  };

export type ProjectedQuoteSection = { _key: string } & _QuoteSection;

export type ProjectedStatSection = { _key: string } & _StatSection;

export type ProjectedCtaBandSection = { _key: string } & Omit<
  _CtaBandSection,
  'backgroundImage' | 'cta'
> & {
    backgroundImage?: ProjectedImage | null;
    cta?: ProjectedCtaBlock | null;
  };

export type ProjectedVideoSection = { _key: string } & _VideoSection;

export type ProjectedSpacerSection = { _key: string } & _SpacerSection & {
    /** Non-schema size field present in some defaultSections entries. */
    size?: string;
    [key: string]: unknown;
  };

// scaffold: about
export type ProjectedFounderSection = { _key: string } & Omit<
  _FounderSection,
  'portrait' | 'cta'
> & {
    portrait?: ProjectedImage | null;
    cta?: ProjectedCtaBlock | null;
  };
// scaffold:end

// scaffold: about
export type ProjectedStorySection = { _key: string } & Omit<_StorySection, 'portrait'> & {
    portrait?: ProjectedImage | null;
  };
// scaffold:end

/** serviceAreaSection adds `travelFees` resolved from businessInfo. */
export type ProjectedServiceAreaSection = { _key: string } & _ServiceAreaSection & {
    travelFees?: Array<{ distanceLabel?: string; fee?: string }>;
  };

/** guaranteeSection adds `siteSettingsText` resolved from siteSettings. */
export type ProjectedGuaranteeSection = { _key: string } & _GuaranteeSection & {
    siteSettingsText?: string;
  };

// ---------------------------------------------------------------------------
// U7 new blocks — hand-authored projected types (typegen will regenerate
// sanity.types.ts after this unit lands; at that point the orchestrator should
// verify these align with the generated shapes and update the imports above).
// ---------------------------------------------------------------------------

// scaffold: faq
/** A dereffed faqItem projected inside faqSection.items. */
export interface ProjectedFaqItem {
  _id?: string;
  _type?: string;
  question?: string;
  answer?: any;
  category?: string;
  displayOrder?: number;
}

/**
 * faqSection — references faqItem documents, dereffed at query time.
 * SELF_CONTAINED (no surface prop).
 * NOTE: does not emit FAQPage JSON-LD (Google penalises duplicate markup).
 */
export interface ProjectedFaqSection {
  _type: 'faqSection';
  _key: string;
  eyebrow?: string;
  headline?: string;
  /** Word in `headline` rendered in the script accent face. */
  headingAccent?: string;
  subhead?: string;
  /** Portable Text twin of `subhead` (bold / italic only). */
  subheadRich?: unknown;
  /** faqItem refs resolved to { question, answer, category, displayOrder }. */
  items?: ProjectedFaqItem[];
  cta?: ProjectedCtaBlock | null;
}
// scaffold:end

/** A single logo image inside logoStripSection, after asset-> projection. */
export type ProjectedLogoStripLogo = ProjectedImage;

/**
 * logoStripSection — grayscale logo row or grid.
 * SELF_CONTAINED (no surface prop).
 */
export interface ProjectedLogoStripSection {
  _type: 'logoStripSection';
  _key: string;
  eyebrow?: string;
  headline?: string;
  logos?: ProjectedLogoStripLogo[];
  layout?: 'row' | 'grid';
}

/** A single team member inline object inside teamSection. */
export interface ProjectedTeamMember {
  _key?: string;
  name?: string;
  role?: string;
  photo?: ProjectedImage | null;
  bio?: string;
  socialLinks?: Array<{ _key?: string; label?: string; url?: string }>;
}

/**
 * teamSection — inline team member grid (no teamMember collection dependency).
 * SELF_CONTAINED (no surface prop).
 * A future modules/team module will own a full teamMember collection.
 */
export interface ProjectedTeamSection {
  _type: 'teamSection';
  _key: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  /** Portable Text twin of `subhead` (bold / italic only). */
  subheadRich?: unknown;
  members?: ProjectedTeamMember[];
}

/**
 * embedSection — sandboxed iframe, URL or raw code variant.
 * SELF_CONTAINED (no surface prop).
 */
export interface ProjectedEmbedSection {
  _type: 'embedSection';
  _key: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  embedUrl?: string;
  embedCode?: string;
  /** Card 121: run embedCode directly on the page instead of in its own box. */
  runsOnPage?: boolean;
  heightHint?: 'short' | 'medium' | 'tall';
}

// ---------------------------------------------------------------------------
// Church-reverse-port: dynamicListSection
// ---------------------------------------------------------------------------

/**
 * A single item inside dynamicListSection.items after the per-source GROQ
 * subquery. All sources normalise to the same shape so the component is
 * source-agnostic. `href` is null for sources that have no detail page
 * (testimonials, faqs).
 */
export interface ProjectedDynamicListItem {
  _id?: string;
  title?: string;
  meta?: string | null;
  summary?: string | null;
  href?: string | null;
  coverImage?: ProjectedImage | null;
  /** FAQ answer (present only when source == "faqs"). */
  answer?: any;
}

/**
 * dynamicListSection — auto-pulls the latest items from a core collection.
 * SELF_CONTAINED (no surface prop).
 * Source-specific behaviour:
 *   journal      -> latest journalEntry cards (title, excerpt, publishedAt, coverImage)
 *   services     -> all services ordered by orderRank (name, price, shortDescription)
 *   testimonials -> latest testimonials (attribution, detail, quote)
 *   faqs         -> faqItems ordered by displayOrder (question, answer, category)
 */
export interface ProjectedDynamicListSection {
  _type: 'dynamicListSection';
  _key: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  /** Portable Text twin of `subhead` (bold / italic only). */
  subheadRich?: unknown;
  columns?: 2 | 3;
  /**
   * Which collection to pull from. Every value this can take belongs to a
   * scaffold capability (journal, services, testimonials, faq), so this is a
   * plain string rather than a union: a fork that removes all four would
   * otherwise be left with an empty union, which does not parse. The dropdown
   * in `sections.ts` is what actually limits an editor's choice, and each of
   * its options carries its own scaffold marker.
   */
  source?: string;
  limit?: number;
  items?: ProjectedDynamicListItem[];
  cta?: ProjectedCtaBlock | null;
}

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

/** iconCardsSection (FBC Auburn): cards with a stone icon, title, text, note and link. Content block. */
export interface ProjectedIconCard {
  _key?: string;
  _type?: 'iconCard';
  icon?: string;
  /** With a photo the card shows it instead of the stone icon. */
  image?: SanityImageObject | null;
  title?: string;
  body?: string;
  note?: string;
  link?: ProjectedCtaBlock | null;
}
export interface ProjectedIconCardsSection {
  _type: 'iconCardsSection';
  _key: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  cards?: ProjectedIconCard[];
}

/** thisWeekSection (FBC Auburn): the next seven days, derived. Content block. */
export interface ProjectedThisWeekSection {
  _type: 'thisWeekSection';
  _key: string;
  heading?: string;
  intro?: string;
}
/** watchSection (FBC Auburn): words beside the latest YouTube message. Content block. */
export interface ProjectedWatchSection {
  _type: 'watchSection';
  _key: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  link?: ProjectedCtaBlock | null;
  poster?: SanityImageObject | null;
  fallback?: string;
  /** Last Sunday's message, typed after Sunday; shown for 8 days after its date. */
  lastMessage?: { title?: string; passage?: string; date?: string; videoUrl?: string } | null;
  /** The newest sermon (collection-arms.ts), which names the card first when it is fresh. */
  latestSermon?: SermonDoc | null;
}

// ---------------------------------------------------------------------------
// FBC Auburn collection-fed blocks (src/sanity/schemaTypes/collectionSections.ts, 2026-10-18).
// The rows are projected in src/lib/collection-arms.ts. All four are CONTENT blocks.
// ---------------------------------------------------------------------------

export interface ProjectedLatestSermonSection {
  _type: 'latestSermonSection';
  _key: string;
  heading?: string;
  intro?: string;
  mode?: 'newest' | 'pick';
  sermon?: SermonDoc | null;
  bibleVersion?: string | null;
}
export interface ProjectedSermonSeriesSection {
  _type: 'sermonSeriesSection';
  _key: string;
  heading?: string;
  intro?: string;
  limit?: number;
  series?: SeriesDoc[] | null;
}
export interface ProjectedPeopleSection {
  _type: 'peopleSection';
  _key: string;
  heading?: string;
  intro?: string;
  mode?: 'group' | 'hand';
  showBios?: boolean;
  items?: (PersonDoc | null)[] | null;
}
export interface ProjectedDownloadsSection {
  _type: 'downloadsSection';
  _key: string;
  heading?: string;
  intro?: string;
  category?: string;
  limit?: number;
  showDates?: boolean;
  featureBulletin?: boolean;
  items?: DownloadDoc[] | null;
  bulletins?: DownloadDoc[] | null;
}

// ---------------------------------------------------------------------------
// FBC Auburn stone-path blocks (src/sanity/schemaTypes/auburnMotionSections.ts)
// ---------------------------------------------------------------------------

/** One step on the stepping-stone rail. */
export interface ProjectedRailStep {
  _key: string;
  _type?: 'railStep';
  /** A stone icon name (STONE_ICONS); picks src/assets/brand/stone-icon-<name>.svg. */
  icon?: string;
  title?: string;
  body?: string;
  times?: { _key: string; _type?: 'railTime'; time?: string; label?: string }[];
  /** Which Sunday gathering the step is; its time comes from Church facts. */
  gathering?: 'none' | 'first' | 'second';
  /** A few words of place, like "Fellowship hall". */
  place?: string;
  linkLabel?: string;
  linkHref?: string;
}

/** stepsRailSection: numbered steps down a stone path, ending in the mark. CONTENT block. */
export interface ProjectedStepsRailSection {
  _type: 'stepsRailSection';
  _key: string;
  heading?: string;
  intro?: string;
  steps?: ProjectedRailStep[];
  endHeading?: string;
  primaryCta?: ProjectedCtaBlock | null;
  secondaryCta?: ProjectedCtaBlock | null;
}

/** One stop on the Walk in with us plan. */
export interface ProjectedWalkStop {
  _key: string;
  _type?: 'walkStop';
  time?: string;
  title?: string;
  body?: string;
}

/** walkSection: Walk in with us, the stop-by-stop visit beside the plan. CONTENT block. */
export interface ProjectedWalkSection {
  _type: 'walkSection';
  _key: string;
  heading?: string;
  intro?: string;
  stops?: ProjectedWalkStop[];
  endHeading?: string;
  endBody?: string;
  endLinkLabel?: string;
  endLinkHref?: string;
}

export type PageBuilderBlock =
  | ProjectedHeroSection
  | ProjectedRichTextSection
  | ProjectedImageTextSection
  | ProjectedGallerySection
  | ProjectedQuoteSection
  | ProjectedStatSection
  | ProjectedCtaBandSection
  | ProjectedVideoSection
  | ProjectedSpacerSection
  | ProjectedFounderSection // scaffold: about
  | ProjectedStorySection // scaffold: about
  | ProjectedServiceAreaSection
  | ProjectedGuaranteeSection
  // U7 new blocks
  | ProjectedFaqSection // scaffold: faq
  | ProjectedLogoStripSection
  | ProjectedTeamSection
  | ProjectedEmbedSection
  // Church-reverse-port
  | ProjectedDynamicListSection
  // FBC Auburn
  | ProjectedIconCardsSection
  | ProjectedThisWeekSection
  | ProjectedWatchSection
  // FBC Auburn stone-path blocks
  | ProjectedStepsRailSection
  | ProjectedWalkSection
  // FBC Auburn collection-fed blocks
  | ProjectedLatestSermonSection
  | ProjectedSermonSeriesSection
  | ProjectedPeopleSection
  | ProjectedDownloadsSection
  // FBC Auburn: the church section library (churchBlocks.types.ts)
  | ChurchPageBlock;
