// Safe to edit by hand
// The build-time read of a Church Trac page (2026-10-24, from fbcm's church-trac-newsletters.ts,
// PORTS.md card 152). The reading of a page's HTML is src/lib/church-trac-page.ts; the block that
// draws one is src/components/church-blocks/ChurchTracPageBlock.astro (the "Church Trac page" band).
//
// WHY. The church keeps some things in Church Trac (a bulletin, a ministry newsletter), which also
// shows them in the church app. Church Trac has no feed or API for its pages, so the site reads the
// published page at build time and draws it in the church's own look, the way Events reads the
// calendar. Unlike fbcm, which hard-codes its two newsletters, Auburn's band names the page, so the
// pastor can add one without code.
//
// THE ADDRESS. The page lives at <the church's Church Trac address>/<page name>. The address is
// Site settings > Church facts > Church Trac address (`churchTracUrl`). There is no default: with
// the box empty nothing is fetched and the band says so.
//
// ONE FETCH PER PAGE PER BUILD, two tries, every failure LOGGED and turned into null, so the band
// falls back to "Read it on Church Trac" and the build carries on. deploy.yml rebuilds every
// morning, so a Church Trac edit shows here within a day.
//
// THE TEST SEAM. CHURCH_TRAC_PAGES_FIXTURE=1 makes every page render from fbcm's saved real pages
// (tests/fixtures/churchtrac-{children,youth}.html; "youth" for a page named youth, else children),
// offline; =unavailable proves the fallback. CI never reads Church Trac.

import { readChurchTracPage, type ChurchTracPage } from './church-trac-page.ts';
import { churchTracPageName, churchTracPageUrl } from './church-trac-address.ts';

export { churchTracBase, churchTracPageName, churchTracPageUrl } from './church-trac-address.ts';

export const FETCH_TIMEOUT_MS = 10_000;

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** The page's HTML, or null on any failure, with the reason logged. */
export async function fetchChurchTracPage(
  url: string,
  fetchImpl: Fetch = fetch,
  timeoutMs: number = FETCH_TIMEOUT_MS,
  log: (msg: string) => void = (m) => console.warn(m),
): Promise<string | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        signal: controller.signal,
        headers: {
          Accept: 'text/html',
          // Church Trac's servers answer 403 to a request with NO User-Agent (the build's workerd
          // prerender sends none) and to `Accept-Language: *` (Node's fetch default); measured by
          // fbcm 2026-09-25.
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (compatible; church-website-build)',
        },
      });
      const text = await res.text();
      if (res.ok && /page-card-body/.test(text)) return text;
      log(
        `[church-trac-page] ${url} try ${attempt}: HTTP ${res.status}, not a Church Trac page: ${JSON.stringify(text.slice(0, 120))}`,
      );
    } catch (err) {
      log(
        `[church-trac-page] ${url} try ${attempt}: ${String((err as Error)?.name === 'AbortError' ? `timed out after ${timeoutMs} ms` : err)}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** Vite's env in a build; undefined under `node --test`. */
const env = (name: string): string | undefined =>
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];

async function fixture(page: string): Promise<string | null | undefined> {
  const flag = env('CHURCH_TRAC_PAGES_FIXTURE');
  if (!flag) return undefined;
  if (flag === 'unavailable') return null;
  if (page === 'youth')
    return (await import('../../tests/fixtures/churchtrac-youth.html?raw')).default;
  return (await import('../../tests/fixtures/churchtrac-children.html?raw')).default;
}

const shared = new Map<string, Promise<ChurchTracPage | null>>();

/**
 * A Church Trac page as the site draws it, once per build, or null when it cannot be read. The
 * fixture seam answers even with an empty box (under a stand-in address), so the styleguide wall
 * can show the band in CI.
 */
export function loadChurchTracPage(
  page?: string | null,
  churchTracUrl?: string | null,
  fetchImpl: Fetch = fetch,
): Promise<ChurchTracPage | null> {
  const name = churchTracPageName(page);
  if (!name) return Promise.resolve(null);
  const url =
    churchTracPageUrl(name, churchTracUrl) ??
    (env('CHURCH_TRAC_PAGES_FIXTURE') ? `https://example.churchtrac.com/${name}` : null);
  if (!url) return Promise.resolve(null);
  const had = shared.get(url);
  if (had) return had;
  const p = (async () => {
    const fixed = await fixture(name);
    const html = fixed !== undefined ? fixed : await fetchChurchTracPage(url, fetchImpl);
    if (html === null) return null;
    const read = readChurchTracPage(html, url);
    if (!read) console.warn(`[church-trac-page] ${url}: nothing readable in the page`);
    return read;
  })();
  shared.set(url, p);
  return p;
}
