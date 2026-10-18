// Foundation, edit with care
// JSON-LD schema builders. Each function returns a JSON string ready to drop
// into a <script type="application/ld+json"> tag via BaseLayout's `schemas` prop.
//
// LocalBusiness goes on every page (BaseLayout). Per-page schemas (Service,
// FAQPage, BreadcrumbList, CreativeWork) get added by the specific page that
// needs them. Test every schema against Google Rich Results before launch:
// https://search.google.com/test/rich-results

import { site } from '@/data/site';
import { churchJsonLd, resolveChurchFacts, type RawChurchFacts } from '@/lib/church-facts';

// ---------- Types (loose — Sanity provides the actual document shapes) ----

interface SocialLink {
  platform?: string;
  url?: string;
  label?: string;
}

interface SiteSettings extends RawChurchFacts {
  title?: string;
  email?: string;
  serviceAreas?: string[];
  socialInstagram?: string;
  socialFacebook?: string;
  /** New flexible social links array (U8). When present, merged with legacy fields in sameAs. */
  socialLinks?: SocialLink[] | null;
  businessType?: string;
  /** Studio city name — set in Sanity businessInfo or update via apply-brand */
  city?: string;
  /** Studio region/state abbreviation */
  state?: string;
  /** Studio latitude from businessInfo */
  geoLat?: number;
  /** Studio longitude from businessInfo */
  geoLng?: number;
}

interface Service {
  name?: string;
  slug?: { current?: string };
  shortDescription?: string;
  price?: string;
}

// scaffold: faq
interface FaqItem {
  question?: string;
  answer?: any;
}
// scaffold:end

interface Breadcrumb {
  name: string;
  url: string;
}

// ---------- LocalBusiness (site-wide, BaseLayout injects on every page) ----

export function localBusinessSchema(settings: SiteSettings | null | undefined): string {
  const s = settings ?? {};
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    // FBC Auburn: a church, not a business (Home audit, 2026-10-17). Empty means Church.
    '@type': s.businessType ?? 'Church',
    '@id': `${site.url}/#business`,
    name: s.title ?? site.name,
    url: site.url,
    image: `${site.url}${site.assets.ogDefault}`,
    // The church's mark, square, as search engines want a logo (visitor audit, 2026-10-18).
    logo: `${site.url}/icon-512.png`,
    // The email joins below from churchJsonLd, and only once the church has confirmed it.
    // Merge legacy fields + socialLinks urls, deduplicating by url string.
    sameAs: Array.from(
      new Set(
        [s.socialInstagram, s.socialFacebook, ...(s.socialLinks ?? []).map((l) => l.url)].filter(
          (u): u is string => Boolean(u),
        ),
      ),
    ),
  };

  // Omit address entirely when city/state are absent or still placeholder defaults.
  const PLACEHOLDER_CITY = 'Your City';
  const hasCity = s.city && s.city !== PLACEHOLDER_CITY;
  const hasState = s.state && s.state !== 'Your State' && s.state !== 'XX';
  if (hasCity || hasState) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(hasCity ? { addressLocality: s.city } : {}),
      ...(hasState ? { addressRegion: s.state } : {}),
      addressCountry: 'US',
    };
  }

  // Omit GeoCoordinates unless both lat and lng are present and non-zero.
  if (s.geoLat && s.geoLng) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: s.geoLat,
      longitude: s.geoLng,
    };
  }

  // Omit areaServed when the only entry is the placeholder default.
  const areas = (s.serviceAreas ?? []).filter((a) => a && a !== PLACEHOLDER_CITY);
  if (areas.length > 0) {
    schema.areaServed = areas.map((city) => ({ '@type': 'City', name: city }));
  }

  // A price range only means something for a business that sells; never for a church.
  if (!['Church', 'PlaceOfWorship', 'NGO', 'EducationalOrganization'].includes(schema['@type'])) {
    schema.priceRange = '$$';
  }

  // Church facts (src/lib/church-facts.ts): the full street address and its map
  // pin, the phone, the email and the service times, each ONLY once the church
  // has confirmed it, so search engines are never told a provisional fact.
  // Replaces the city-only address. sameAs above already carries the social links.
  Object.assign(schema, churchJsonLd(resolveChurchFacts(s)));
  return JSON.stringify(schema);
}

// ---------- Service list (for /services) -----------------------------------

export function serviceListSchema(services: Service[] | null | undefined): string {
  const list = (services ?? []).filter((s) => s.name);
  if (list.length === 0) return JSON.stringify({});
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((s, i) => ({
      '@type': 'Service',
      position: i + 1,
      name: s.name,
      description: s.shortDescription,
      url: s.slug?.current ? `${site.url}/services/#${s.slug.current}` : `${site.url}/services/`,
      provider: { '@id': `${site.url}/#business` },
      ...(s.price ? { offers: { '@type': 'Offer', price: s.price, priceCurrency: 'USD' } } : {}),
    })),
  });
}

// scaffold: faq
// ---------- FAQPage (for /faq) --------------------------------------------

/**
 * Flattens Portable Text answer blocks into a plain-text string for the
 * acceptedAnswer.text field. Schema.org does not accept HTML in this field.
 */
function ptToPlainText(blocks: any): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) => b.children.map((c: any) => c.text ?? '').join(''))
    .join('\n\n')
    .trim();
}

export function faqPageSchema(faqs: FaqItem[] | null | undefined): string {
  const list = (faqs ?? []).filter((f) => f.question);
  if (list.length === 0) return JSON.stringify({});
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: ptToPlainText(f.answer),
      },
    })),
  });
}
// scaffold:end

// ---------- BreadcrumbList (every internal page) --------------------------

export function breadcrumbSchema(crumbs: Breadcrumb[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  });
}

// ---------- CreativeWork (for /portfolio/[slug]) --------------------------

interface Project {
  title?: string;
  slug?: { current?: string };
  briefSummary?: string;
  heroImage?: any;
  location?: string;
  year?: number;
  publishedAt?: string;
}

export function projectSchema(project: Project, heroImageUrl: string | null): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.briefSummary,
    url: project.slug?.current ? `${site.url}/portfolio/${project.slug.current}/` : undefined,
    image: heroImageUrl ?? undefined,
    creator: { '@id': `${site.url}/#business` },
    locationCreated: project.location ? { '@type': 'Place', name: project.location } : undefined,
    dateCreated: project.year ? String(project.year) : undefined,
    datePublished: project.publishedAt,
  });
}

// scaffold: journal
// ---------- BlogPosting (for /journal/[slug]) -----------------------------

interface JournalEntryForSchema {
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  body?: any;
  categories?: Array<{ title?: string }>;
}

export function blogPostingSchema(
  entry: JournalEntryForSchema,
  coverImageUrl: string | null,
): string {
  const url = entry.slug?.current
    ? `${site.url}/journal/${entry.slug.current}/`
    : `${site.url}/journal/`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.title,
    description: entry.excerpt,
    url,
    image: coverImageUrl ?? undefined,
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt ?? entry.publishedAt,
    author: entry.author
      ? { '@type': 'Person', name: entry.author }
      : { '@id': `${site.url}/#business` },
    publisher: { '@id': `${site.url}/#business` },
    keywords: Array.isArray(entry.categories)
      ? entry.categories
          .map((c) => c?.title)
          .filter(Boolean)
          .join(', ')
      : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });
}
// scaffold:end
