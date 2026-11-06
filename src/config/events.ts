// Safe to edit by hand
// =============================================================================
// events.ts - this site's map for the GA4 event layer (PORTS.md card 217)
// =============================================================================
// The shared half is src/lib/track.ts and src/components/analytics/SiteEvents.astro
// (PORTABLE); they read this map and nothing else. Nothing is sent until the
// church has a Google Analytics property and PUBLIC_GA_ID is set (docs/agent/
// analytics.md, "Turning it on"): with no tag, window.gtag does not exist and
// every call here does nothing.
//
// Rules are tried in order and the first match wins; these run before the
// built-in ones (video, directions, downloads, links to other sites).
//
// `describe` is the kind of link in plain words, for the privacy page
// (src/lib/event-kinds.ts). Event list: docs/agent/analytics.md.
// =============================================================================

import type { EventsConfig, LinkRule } from '@/lib/track';

/** A social network, matched on its hosts (www ignored). The accounts the Studio's social
 *  links know (src/lib/social-links.ts), minus YouTube and Vimeo, which count as video links. */
function social(hosts: string[], network: string): LinkRule {
  return {
    host: hosts,
    event: 'social_click',
    params: { network },
    describe: 'links to the church’s social media pages',
  };
}

export const eventsConfig: EventsConfig = {
  links: [
    // A calendar file, from any host: the Sunday file and the calendar's own files.
    { path: /\.ics$/, event: 'calendar_add', describe: 'calendar files' },

    // Giving: the site's own Give page, and the Church Trac giving link that the Give menu item
    // swaps to once Site settings > Church Trac > Online giving link is set. The Church Trac
    // rule is a guess at the shape of that address; check it against the real link at launch
    // and add its host here if it is not churchtrac.com (docs/agent/analytics.md).
    {
      own: true,
      path: /^\/give(\/|$)/,
      event: 'give_click',
      params: { destination: 'give_page' },
    },
    {
      host: 'churchtrac.com',
      path: /giv|donat|tith|offering/,
      event: 'give_click',
      params: { destination: 'church_trac' },
    },

    // A sermon video kept on Facebook (the Sermon page offers "Watch on Facebook") is a watch,
    // not a social link; the church's Facebook page itself falls through to the social rule.
    { host: 'fb.watch', event: 'watch_click', params: { destination: 'facebook' } },
    {
      host: ['facebook.com', 'fb.com'],
      path: /\/(videos?|watch|reels?|live)(\/|$)/,
      event: 'watch_click',
      params: { destination: 'facebook' },
    },

    social(['facebook.com', 'fb.com', 'fb.me'], 'facebook'),
    social(['instagram.com', 'instagr.am'], 'instagram'),
    social(['tiktok.com'], 'tiktok'),
    social(['x.com', 'twitter.com'], 'x'),
    social(['threads.net', 'threads.com'], 'threads'),
    social(['linktr.ee', 'linktree.com'], 'linktree'),
  ],

  // Not sent: GA4's Enhanced Measurement already counts outbound clicks and file
  // downloads. The site search is the shared Pagefind panel (card 126), which does not call
  // trackSearch(), so no search is ever sent; both are off so the privacy page does not name them.
  off: ['outbound_click', 'download_click', 'site_search', 'search_no_results'],

  // Church Trac forms are frames inside this wrapper (ChurchTracFrame.astro). Journal posts
  // carry data-article-body, the 404 data-page-not-found and the site's own forms
  // data-track-form, the defaults.
  formFrameSelector: '[data-church-trac-form]',
};
