// Safe to edit by hand
// =============================================================================
// page-path — the public address of the page being rendered (2026-10-26)
// =============================================================================
// The draft preview renders the same components as the live site, but at
// `/preview/...`: Home is `/preview/`, Ministries is `/preview/ministries/`.
// Anything that looks a page up BY ITS ADDRESS (the shot list, the For Jacob
// notes, the header's and footer's "is this Home?") found nothing there, so the
// preview quietly drew a different page: no "Photo needed" requests, no example
// hero video, no Home-only footer verse. Every such lookup goes through
// `publicPath()`, which is the identity on live pages.
// =============================================================================

/**
 * The live-site path for a rendered path: the `/preview` prefix removed and a
 * trailing slash ensured. `/preview` and `/preview/` are Home (`/`).
 */
export function publicPath(pathname: string): string {
  let path = pathname.replace(/^\/preview(?=\/|$)/, '');
  if (!path.startsWith('/')) path = `/${path}`;
  return path.endsWith('/') ? path : `${path}/`;
}
