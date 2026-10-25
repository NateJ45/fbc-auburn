// Safe to edit by hand
// The browser half of "Live now" (2026-10-24). The decisions are in live-service.ts, where the
// unit tests are; this file only reads the page, asks the clock (and /api/live-status when the
// church has a YouTube channel), and writes the answer back into the page:
//
//   [data-live-show]   shown only while live (the banner, Home's Live tag); `hidden` otherwise
//   [data-live-link]   while live, goes to the stream in a new tab: the live video when YouTube
//                      named one, else the attribute's own address; afterwards, its old address
//   window.__churchLive and a `church:live` event, for the phone menu (MobileNav.astro), whose
//                      watch links it updates itself
//
// The settings come from the first [data-live-start] element, the banner BaseLayout renders on
// every page when Church facts has somewhere to watch. No banner, nothing runs.
//
// Runs on load, after every View Transitions navigation (astro:page-load) and once a minute, so a
// page left open at 10:54 turns over at 10:55. Started once per full load by LiveBanner.astro.

import { inCheckWindow, liveState, safeLiveUrl, type ClientLiveStatus } from './live-service';

declare global {
  interface Window {
    __churchLive?: { live: boolean; href?: string };
  }
}

let status: ClientLiveStatus | null = null;
let askedAt = 0;

function settings(): { start: number | null; check: boolean } | null {
  const el = document.querySelector<HTMLElement>('[data-live-start]');
  if (!el) return null;
  const n = Number(el.dataset.liveStart);
  return {
    start: el.dataset.liveStart && Number.isFinite(n) ? n : null,
    check: 'liveCheck' in el.dataset,
  };
}

function apply(state: { live: boolean; href?: string }): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-live-show]')) {
    el.hidden = !state.live;
  }
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-live-link]')) {
    // Keep the link's own address and target aside the first time, to go back to afterwards.
    if (a.dataset.offHref === undefined) {
      a.dataset.offHref = a.getAttribute('href') ?? '';
      a.dataset.offTarget = a.getAttribute('target') ?? '';
    }
    const href = state.live ? (state.href ?? a.dataset.liveLink) : a.dataset.offHref;
    const target = state.live ? '_blank' : a.dataset.offTarget;
    if (href && a.getAttribute('href') !== href) a.setAttribute('href', href);
    if (target) {
      a.target = target;
      a.rel = 'noopener noreferrer';
    } else {
      a.removeAttribute('target');
    }
  }
  const before = window.__churchLive;
  window.__churchLive = state;
  if (before?.live !== state.live || before?.href !== state.href) {
    document.dispatchEvent(new CustomEvent('church:live', { detail: state }));
  }
}

function tick(): void {
  const s = settings();
  if (!s) return;
  let state: { live: boolean; href?: string } = { live: false };
  try {
    state = liveState(new Date(), s.start, status);
  } catch {
    // No Intl time zone support: nothing claims to be live.
  }
  apply(state);
  ask(s.start, s.check);
}

/** Ask /api/live-status, never outside the check window and at most once a minute. */
function ask(start: number | null, check: boolean): void {
  if (!check || !window.fetch) return;
  try {
    if (!inCheckWindow(new Date(), start)) return;
  } catch {
    return;
  }
  if (Date.now() - askedAt < 55_000) return;
  askedAt = Date.now();
  fetch('/api/live-status/', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { status?: unknown; url?: unknown } | null) => {
      status =
        j && (j.status === 'live' || j.status === 'not-live' || j.status === 'unknown')
          ? { status: j.status, url: safeLiveUrl(j.url), at: Date.now() }
          : null;
    })
    .catch(() => {
      status = null;
    })
    .then(tick);
}

let started = false;

export function startLiveWatch(): void {
  if (started) return;
  started = true;
  tick();
  document.addEventListener('astro:page-load', tick);
  setInterval(tick, 60_000);
}
