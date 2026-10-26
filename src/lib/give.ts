// Safe to edit by hand
// The Give link (visitor audit, 2026-10-18). The menus' Give item points at the site's own Give
// page (/give/, a Studio page since 2026-10-26). Once Site settings > Church Trac > Online giving link is set,
// every link to that page goes straight to the giving service instead, so the pastor repoints
// Give in one field and the page stays as the fallback. Applied to every menu in
// src/lib/siteSettings.ts. Pure, so give.test.ts runs it under node --test.
import { httpsUrl } from './church-facts.ts';

/** The site's own Give page. */
export const GIVE_PATH = '/give/';

/** Send a link to the Give page to the online giving link, when there is one. */
export function giveHref(href: string, givingUrl?: string | null): string {
  const online = httpsUrl(givingUrl);
  return online && href === GIVE_PATH ? online : href;
}
