# Analytics events: what visitors do, sent to GA4

> Read when: you touch tracking, `SiteEvents.astro`, `src/config/events.ts`, or the privacy page's analytics wording.
> PORTS.md card 217. The tag itself (`Analytics.astro`, `analytics/GoogleAnalytics.astro`) is older: cards 54, 58, 96.

## How it fits together

1. **The tag** defines `window.gtag` only on the production hostname, outside automated browsers, and only when
   `PUBLIC_GA_ID` is set. Everywhere else `window.gtag` is undefined and every event call does nothing, so tests,
   previews and local builds are never counted.
2. **`src/components/analytics/SiteEvents.astro`** (PORTABLE, rendered by `BaseLayout.astro` after `<Analytics />`) is
   one delegated click listener plus a per-page setup (404, forms in view, first use of a frame, reading depth,
   script errors). It reads a clicked link's ADDRESS and decides what it is, so a link an editor adds in the Studio
   is tracked with no setup.
3. **`src/lib/track.ts`** (PORTABLE) holds `classifyLink` (pure, unit tested), `track(name, params)` for React islands
   and `trackSearch(term, results)` for a search box.
4. **`src/config/events.ts`** is the site's own map (NOT portable): which hosts and paths are giving, registering or
   other links, which events are off, and where the form and article markup is. Empty, only the built-in rules run.
5. **`src/lib/event-kinds.ts`** (PORTABLE) turns that map into plain words for the privacy page, so the page names
   exactly the kinds of event the site sends (see `PrivacyPolicy.astro`).

Nothing personal is sent: link kind and destination name (never a mailto or tel address), form names, the page that
was not found, search words (withheld when they look like an email address or a phone number).

## Events

| Event                              | When                                                                 | Parameters                                          |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `contact_click`                    | an email or phone link                                               | `method` (email, phone), `location`                 |
| `watch_click`                      | a YouTube or Vimeo link                                              | `destination` (streams, video, channel), `location` |
| `directions_click`                 | a Google or Apple Maps link                                          | `location`                                          |
| `download_click`                   | a link to a PDF, document, spreadsheet, archive, audio or video file | `file_extension`, `file_name`, `location`           |
| `outbound_click`                   | a link to another site that no other rule claimed                    | `destination` (host), `location`                    |
| `give_click`                       | the site's map: giving links                                         | whatever the rule sets, plus `location`             |
| `register_click`                   | the site's map: registration links                                   | the same                                            |
| `form_view`                        | a form (`form[data-track-form]`) came 40% into view                  | `form_name`                                         |
| `embed_interact`                   | the page lost focus to a frame: first use, once per frame            | `embed` (form, video), `embed_name`                 |
| `generate_lead`                    | a sign-up or contact form was sent (`track()` in the form)           | `form_name`, `form_location`                        |
| `site_search`, `search_no_results` | `trackSearch()`: the last term once the visitor pauses 1.2 s         | `search_term`, `search_results`                     |
| `article_progress`                 | 25, 50, 75, 100% of `[data-article-body]` passed                     | `percent`                                           |
| `article_read`                     | the end reached after real reading time (30 s to 5 min)              | `read_seconds`                                      |
| `page_not_found`                   | the 404 page (`[data-page-not-found]`)                               | `missing_path`, `from_site`                         |
| `js_error`                         | an error in the site's own scripts, at most three a page view        | `error_message`, `error_source`                     |

Any other event name in the map (`calendar_add`, `app_click`, `social_click`) is the site's own. `location` is the page
region: `header`, `footer`, `nav`, `aside` or `page`.

GA4's Enhanced Measurement also counts outbound clicks and file downloads. A site with it on can put `outbound_click`
and `download_click` in `off` to avoid two counts.

The starter's own search (`site-search-client.ts`, PORTABLE since card 126) does not call `trackSearch` yet; GA4's
Enhanced Measurement counts the `/search/?q=` page. A site with a search box of its own calls `trackSearch(term,
resultCount)` from it.

## Adding a site's rules

Edit `src/config/events.ts`. A rule is `{ host?, path?, own?, test?, event, params?, describe? }`; the first match
wins, the site's rules before the built-in ones. `describe` is the plain-words kind for the privacy page. The unit test
`src/lib/track.test.ts` pins the classifier against a sample map; pin the site's own rules in its e2e spec by stubbing
`window.gtag` and clicking a probe link.

## What it cannot see

A form or a video in another site's frame: the visitor's clicks inside never reach the page, so a form is counted when
it comes into view and when its frame is first used, not when it is sent. A gift or registration that finishes on
another site is counted at the link.

## Privacy

GA4 sets cookies, so the privacy page must say so (card 54) and it now also names the kinds of event, derived from the
map (`eventsSentence`). Nothing to retype: change the map and the page follows on the next build. A privacy body
stored in Sanity that lists events by hand would go stale; keep the event wording in code.

## Verifying

Never by HTML scan. Open the live site in a real browser (not WebDriver; a content blocker stops gtag.js), then read
GA4 Realtime by event name. The Playwright specs stub `window.gtag`.

## The Report in the Studio (card 218)

The events above come back to the site's editors in the Studio's `Report` tool: every number by Month, Quarter or Year
against the same period a year before. `src/config/board.ts` (NOT portable) names the parts and words; a measure
`event:<name>` needs the event sent here AND listed for the site in studio-status (`src/site-series-config.ts`). Full
detail: `docs/agent/studio-kit.md`, "The Report".

## This site (First Baptist Church of Auburn)

**Nothing is sent yet.** The church has no Google Analytics property, so `PUBLIC_GA_ID` is unset: `window.gtag` does not
exist, no event leaves the page, no request goes to Google, and the privacy page makes no Google Analytics claim
(`PrivacyPolicy.astro` branches on `hasGa`, `analytics-config.ts`). The Report stays off because `PUBLIC_BOARD_REPORT`
is unset. Both are inert until the steps under "Turning it on".

What `src/config/events.ts` sends, and from where:

| Event                              | Where it comes from                                                                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `give_click`                       | any link to `/give/` (header, footer, Give blocks), and a `churchtrac.com` link whose path says giving, which is where the Give menu item goes once Site settings > Church Trac > Online giving link is set                                 |
| `watch_click`                      | the sermon video press (`SermonPlayer.astro`: the thumbnail is a link to YouTube that the page turns into the player, and the click listener sees it first), any YouTube link, and a Facebook video link                                    |
| `directions_click`                 | the Google and Apple Maps links built in `church-facts.ts` (address, Plan your visit, the map block)                                                                                                                                        |
| `contact_click`                    | the phone and email links                                                                                                                                                                                                                   |
| `calendar_add`                     | `/sunday.ics`, `/calendar/<key>.ics` and a `webcal:` link to an `.ics` feed                                                                                                                                                                 |
| `social_click`                     | Facebook, Instagram, TikTok, X, Threads and Linktree links (`network`)                                                                                                                                                                      |
| `generate_lead`                    | the Contact page form (`ContactForm.tsx`, after `/api/contact/` answers ok), a Form block (`FormBlock.astro`, after `/api/form/` answers ok), the own-list newsletter box (`NewsletterSignup.tsx`, off while the list lives in Church Trac) |
| `form_view`                        | those forms (`data-track-form`) and any Church Trac frame (`[data-church-trac-form]`)                                                                                                                                                       |
| `embed_interact`                   | the first use of a frame: a sermon or livestream video, or a Church Trac form                                                                                                                                                               |
| `article_progress`, `article_read` | the body of a News and notes post (`.art-body`, `data-article-body`). Sermon pages have only a short summary, so they send none                                                                                                             |
| `page_not_found`                   | the 404 page (`data-page-not-found`)                                                                                                                                                                                                        |

Switched off: `outbound_click` and `download_click` (GA4's Enhanced Measurement counts them) and `site_search` and
`search_no_results`, because the search panel is the shared Pagefind one (card 126), which does not call `trackSearch()`
and is not changed here. The privacy page therefore does not name searches. If the starter's search ever calls
`trackSearch`, take those two out of `off`.

**Forms in Church Trac frames cannot say they were sent.** If the Contact form moves to a Church Trac form (the
`contactFormUrl` box), `generate_lead` stops coming from the Contact page and the Report's "Forms sent" falls quietly.
Then switch its headline tile to `event:form_view` ("forms seen"), as First Baptist Muncie did, and say so in the
tile's words. RSVPs (`RsvpForm.tsx`) are off until the mail backbone is connected and send no event.

**The Church Trac giving rule is a guess** at the shape of the church's real giving address. When `givingUrl` is set,
open it, compare its host and path to the rule in `events.ts`, and add the real host if it is not `churchtrac.com`.
`src/lib/events-map.test.ts` pins every rule.

### The Report (card 218)

`src/config/board.ts`: first month 2026-11, `since.all` 2026-11-25 (the planned launch day), time zone America/New_York
(Hamilton, Ohio). **If launch moves, correct both dates**, and the matching entry in studio-status
(`src/site-report-email.ts`). `since.all` is the first day Google has anything, never a deploy day; the workers.dev
preview is never counted (the tag's hostname guard), so nothing exists before the church's own address is live. Search
Console keeps its own history once connected: give `searchClicks` and `searchAppearances` their own earlier `since`
then. Headlines: Visitors, Forms sent, Watch clicks, Give clicks, Clicks for directions, Clicks from Google. Parts: New
here?, Sundays and sermons, Events and the calendar, Giving (clicks, not gifts), Found locally. There is no News and
notes part yet (one post). The bench is `/styleguide/report/?config=site`.

### Turning it on (launch)

1. Nathan creates the GA4 property and a web stream for the church's own address. Enhanced Measurement stays on.
2. Add the service account (the one studio-status already uses) as a Viewer on the property and as a user on the Search
   Console property for the same address.
3. **Edit the stored privacy copy first** (it is a Sanity document, not code): see "Privacy copy at launch" below.
4. Set the repository variable `PUBLIC_GA_ID` (the `G-` measurement id) and redeploy. Read the privacy page back.
5. In studio-status `src/site-data.ts`, add Auburn's GA4 property id and Search Console property, and deploy it. The
   `auburn` entry in `src/site-series-config.ts` and `src/site-report-email.ts` must already carry the events above and
   the `hosts` of the church's own address.
6. Home's Visitors card: leave `ANALYTICS_PROVIDER` unset (it reads Cloudflare Web Analytics, which is cookieless and
   already set up). Set `"ANALYTICS_PROVIDER": "ga4"` only if the church would rather see one source everywhere.
7. Set the repository variable `PUBLIC_BOARD_REPORT` to `true` and redeploy. Open `/studio/#/report` signed in.
8. In a real browser (no content blocker), open the live site and read GA4 Realtime: `page_view`, then a Give click, a
   directions click and a sermon press by event name.

### Privacy copy at launch

The page renders the stored Sanity text when there is any (`privacyPage.body` and the `privacyPolicySection` in its Page
layout, "Last updated" 2026-10-18), and the code copy in `PrivacyPolicy.astro` only when there is none. The stored text
says visits are counted with Cloudflare Web Analytics and that the website sets no cookies of its own. That stays true
until `PUBLIC_GA_ID` is set, and false the day it is. The code copy already adds the Google Analytics paragraph and the
derived list of events; the stored copy must say the same. In "Counting visits", add that page visits are also measured
with Google Analytics, which sets cookies named `_ga` and `_ga_` followed by a stream id; then the sentence
`eventsSentence(eventsConfig)` returns (print it from `src/lib/event-kinds.ts`); then that it is not used for
advertising. Replace the "Cookies" paragraph. Change it in both places (the document body and the page-layout block) and
update "Last updated". Do not retype the event list anywhere else.
