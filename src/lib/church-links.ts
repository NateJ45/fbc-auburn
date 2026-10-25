// Safe to edit by hand
// Church systems links (2026-10-24, from fbcm's church-links.ts, PORTS.md card 152): the {giving}
// style link tokens that point at the church's outside systems, and the fill that turns them into
// addresses at build time.
//
// WHY. The church runs on Church Trac: giving, the connection card, its forms, the calendar, the
// member portal. Each address is typed ONCE in Site settings > Church Trac (rule 15), and any link
// box on the site can hold a token such as {connect} instead of the address, so moving a form or
// a system is one edit there and a rebuild.
//
// HOW A TOKEN IS FILLED. src/lib/queries.ts reads every Sanity document through a local
// sanityFetch that passes the result through fillLinkTokens() below (fbcm does the same at its
// fetch chokepoint; Auburn's sanity.ts is PORTABLE, so the fill lives in queries.ts instead). A
// token is filled only when it is the WHOLE value of a string (a link target), never inside a
// sentence. The Studio's Live preview reads through its own client and shows the token unfilled.
//
// AN UNFILLED TOKEN NEVER SHIPS AS A BROKEN LINK. A token whose box is blank becomes the site's own
// page for the same job (/give/, /prayer/, /events/, /watch/, else /contact/), and the build logs
// which box was empty, once per token.
//
// ONE MORE, ON PURPOSE. Once the connection card is set, a link to the visit form on Contact
// ("/contact/?visit=...", the "Tell us you are coming" buttons) goes straight to the card.
//
// PURE: no client, no import.meta.env, so node --test runs it.

import { splitStega } from './preview-stega.ts';
import type { ChurchFacts } from './church-facts.ts';

/**
 * Every link token, the Church facts value it reads, the box's name in the Studio, and the site's
 * own page it falls back to. The order is the order the Site Guide lists them.
 */
export const CHURCH_LINKS = [
  { token: '{giving}', box: 'Church Trac > Online giving link', fallback: '/give/' },
  { token: '{connect}', box: 'Church Trac > Connection card', fallback: '/contact/' },
  {
    token: '{contact-form}',
    box: 'Church Trac > Contact form (else the connection card)',
    fallback: '/contact/',
  },
  { token: '{prayer}', box: 'Church Trac > Prayer request form', fallback: '/prayer/' },
  { token: '{newsletter}', box: 'Church Trac > Newsletter sign-up form', fallback: '/contact/' },
  {
    token: '{calendar}',
    box: 'Church Trac > Church Trac calendar feed (its public page)',
    fallback: '/events/',
  },
  { token: '{members}', box: 'Church Trac > Member sign-in link', fallback: '/contact/' },
  { token: '{watch}', box: 'Church facts > Live stream link (else Facebook)', fallback: '/watch/' },
] as const;

export type LinkToken = (typeof CHURCH_LINKS)[number]['token'];

/** Each token's address, or null when its box is blank. */
export type LinkValues = Record<LinkToken, string | null>;

const TOKENS = new Set<string>(CHURCH_LINKS.map((l) => l.token));

/** The stega-clean, trimmed, lower-cased form of a string, for token matching. */
function bare(value: string): string {
  return splitStega(value).cleaned.trim().toLowerCase();
}

/** The link token a whole string is, or null. Case and surrounding space are ignored. */
export function linkTokenOf(value: unknown): LinkToken | null {
  if (typeof value !== 'string' || !value.includes('{')) return null;
  const b = bare(value);
  return TOKENS.has(b) ? (b as LinkToken) : null;
}

/** A whole string that looks like a token ("{something}") but is not a known one. */
export function isUnknownToken(value: unknown): boolean {
  if (typeof value !== 'string' || !value.includes('{')) return false;
  const b = bare(value);
  return /^\{[^{}\s]+\}$/.test(b) && !TOKENS.has(b);
}

/** Each token's address from the resolved Church facts (already https-checked there). */
export function linkValues(
  facts: Pick<
    ChurchFacts,
    | 'givingUrl'
    | 'connectCardUrl'
    | 'contactFormUrl'
    | 'prayerFormUrl'
    | 'newsletterFormUrl'
    | 'calendarPageUrl'
    | 'memberLoginUrl'
    | 'liveUrl'
  >,
): LinkValues {
  return {
    '{giving}': facts.givingUrl,
    '{connect}': facts.connectCardUrl,
    '{contact-form}': facts.contactFormUrl ?? facts.connectCardUrl,
    '{prayer}': facts.prayerFormUrl,
    '{newsletter}': facts.newsletterFormUrl,
    '{calendar}': facts.calendarPageUrl,
    '{members}': facts.memberLoginUrl,
    '{watch}': facts.liveUrl,
  };
}

/** A link to Contact's visit form ("/contact/?visit=sunday-11"). */
const VISIT_LINK = /^\/contact\/?\?visit=/i;

/**
 * The address a whole string should become, or the string unchanged. `warn` is called with the
 * token when its box is blank (the caller logs it once).
 */
export function fillLink(
  value: string,
  values: LinkValues,
  warn: (token: LinkToken) => void = () => {},
): string {
  const token = linkTokenOf(value);
  if (token) {
    const v = values[token];
    if (v) return v;
    warn(token);
    return CHURCH_LINKS.find((l) => l.token === token)!.fallback;
  }
  if (values['{connect}'] && VISIT_LINK.test(splitStega(value).cleaned.trim())) {
    return values['{connect}'];
  }
  return value;
}

/**
 * A copy of `data` with every whole-string link token filled. Walks arrays and plain objects; a
 * value with no token anywhere comes back as the same object, so nothing is copied needlessly.
 */
export function fillLinkTokens<T>(
  data: T,
  values: LinkValues,
  warn: (token: LinkToken) => void = () => {},
): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string')
      return v.includes('{') || v.startsWith('/contact') ? fillLink(v, values, warn) : v;
    if (Array.isArray(v)) {
      let changed = false;
      const out = v.map((x) => {
        const y = walk(x);
        if (y !== x) changed = true;
        return y;
      });
      return changed ? out : v;
    }
    if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
      let changed = false;
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) {
        const y = walk(x);
        if (y !== x) changed = true;
        out[k] = y;
      }
      return changed ? out : v;
    }
    return v;
  };
  return walk(data) as T;
}

/**
 * The Studio's check for a link box: a known token is fine, an unknown "{...}" is not, and a box
 * that only takes full addresses still does unless it holds a token.
 */
export function checkLinkBox(value: unknown, absoluteOnly = false): true | string {
  if (typeof value !== 'string' || !value.trim()) return true;
  if (linkTokenOf(value)) return true;
  if (isUnknownToken(value)) {
    return `Unknown link placeholder. Use one of: ${CHURCH_LINKS.map((l) => l.token).join(', ')}.`;
  }
  if (absoluteOnly && !/^https?:\/\//i.test(value.trim())) {
    return 'Use a full address starting with https://, or a link placeholder like {giving}.';
  }
  return true;
}

/** The sentence a link box's description ends with. */
export const LINK_TOKEN_HINT =
  'You can also type a link placeholder like {giving}, {connect} or {prayer}; the Site Guide lists them.';

/**
 * The Church Trac form that takes the place of one of the site's own forms, or null to keep the
 * site's form (2026-10-24). Contact: the contact form, else the connection card. Prayer: the prayer
 * request form. Used by src/pages/contact.astro and src/components/church-blocks/FormBlock.astro.
 */
export function churchTracFormFor(
  place: 'contact' | 'prayer',
  facts: {
    contactFormUrl: string | null;
    connectCardUrl: string | null;
    prayerFormUrl: string | null;
  },
): string | null {
  return place === 'contact' ? (facts.contactFormUrl ?? facts.connectCardUrl) : facts.prayerFormUrl;
}
