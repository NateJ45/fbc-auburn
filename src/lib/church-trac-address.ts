// Safe to edit by hand
// The Church Trac address and page names (2026-10-24, PORTS.md card 152): pure, shared by the
// Studio (the "Church Trac page" band's check, src/sanity/schemaTypes/churchSections.ts) and the
// build-time read (src/lib/church-trac-pages.ts), kept apart from that read so the Studio bundle
// never pulls in its saved test pages.
import { splitStega } from './preview-stega.ts';

/** The stega-free, trimmed text of a value. */
const clean = (v: unknown): string =>
  splitStega(String(v ?? ''))
    .cleaned.replace(/[​-‍⁠﻿]/g, '')
    .trim();

/**
 * The church's Church Trac address as an origin with a trailing slash, or null. Only an https
 * address on a church's own churchtrac.com subdomain counts (not www.churchtrac.com, not another
 * site), so a mistyped box can never make the build fetch somewhere else.
 */
export function churchTracBase(churchTracUrl?: string | null): string | null {
  try {
    const u = new URL(clean(churchTracUrl));
    if (
      u.protocol === 'https:' &&
      /(^|\.)churchtrac\.com$/i.test(u.hostname) &&
      u.hostname !== 'www.churchtrac.com' &&
      u.hostname !== 'churchtrac.com'
    ) {
      return `${u.origin}/`;
    }
  } catch {
    // not an address
  }
  return null;
}

/**
 * A page name as Church Trac writes it in the address ("bulletin", "children"), or null. A pasted
 * full address is cut down to its path, so "https://x.churchtrac.com/bulletin" works too.
 */
export function churchTracPageName(page?: string | null): string | null {
  let name = clean(page);
  try {
    name = new URL(name).pathname;
  } catch {
    // a bare name
  }
  name = name.replace(/^\/+|\/+$/g, '');
  return /^[\w-]{1,80}$/.test(name) ? name : null;
}

/** The page's address on Church Trac, or null when the box or the name is not usable. */
export function churchTracPageUrl(
  page?: string | null,
  churchTracUrl?: string | null,
): string | null {
  const base = churchTracBase(churchTracUrl);
  const name = churchTracPageName(page);
  return base && name ? new URL(encodeURIComponent(name), base).toString() : null;
}
