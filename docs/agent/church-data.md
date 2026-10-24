# Church data: facts, This Sunday, This week, the replay and the weather

Added 2026-10-17. The church's facts are typed once, in **Site settings > Church facts**, and every
place the site shows them is derived from there at build time (CLAUDE.md rule 15). This page is
the usage note for the drop-in components; see them all at once on `/styleguide/church-data/`
(noindex).

## Where the data lives

| Fact            | Field (Site settings, group "Church facts")       | Confirmed flag             |
| --------------- | ------------------------------------------------- | -------------------------- |
| Address         | `churchAddress` { street, city, state, zip }      | `churchAddress.confirmed`  |
| How to find us  | `churchAddress.findUs` (one optional sentence)    | n/a (Jacob's own words)    |
| Service times   | `serviceTimes[]` { label, day, time (24h), note } | each row's `confirmed`     |
| Phone           | `phone` (Identity & contact)                      | `phoneConfirmed`           |
| Takes texts     | `phoneTakesTexts` ("Call or text", an sms: link)  | n/a (rides on the phone's) |
| Year founded    | `foundedYear`                                     | `foundedConfirmed`         |
| YouTube channel | `youtubeChannelId` (UC..., 24 characters)         | n/a                        |

- **The Church Trac tab** (2026-10-24): the seven Church Trac addresses (`churchTracUrl`,
  `connectCardUrl`, `contactFormUrl`, `prayerFormUrl`, `givingUrl`, `churchTracIcalUrl`,
  `memberLoginUrl`) sit on their own Site settings tab, in setup order with an intro
  (`churchTracFields` in `churchFacts.ts`; `docs/agent/church-trac.md`). They still resolve
  through `resolveChurchFacts` like every fact; only the tab they show under moved.
- Schema: `src/sanity/schemaTypes/churchFacts.ts`, spread into `siteSettings.ts`.
- Resolver: `src/lib/church-facts.ts` (`resolveChurchFacts`, `thisSunday`, `thisWeek`,
  `churchJsonLd`), pure and unit-tested. Components call `getChurchFacts()` from
  `src/lib/church-data.ts`; never read the raw settings document for a fact, and never type a
  time or an address into a component.
- With Sanity empty, each fact falls back to `FALLBACK_FACTS` (the values from the church's
  Facebook page), all unconfirmed. There is no fallback phone.
- The round social buttons (header strip, phone menu, footer) all come from one list,
  `resolveSocialLinks()` in `src/lib/social-links.ts` (icons in `social-icons.ts`): Site settings >
  Social links in order, with the Facebook fact added when the list has no Facebook entry
  (2026-10-24). A platform added in the Studio shows in every place at once.
- `day`, `time`, `youtubeChannelId` and `churchTracIcalUrl` are in `NON_STEGA_FIELDS` (rule 8b).

## The "To confirm" tag

Where a fact appears without room for the tag, it waits for its flag instead: the phone shows in the
menu and in Home's header line only once `phoneConfirmed` is ticked (2026-10-24); the footer's Get
in touch and the Contact page show it straight away, with the tag.

`NotConfirmed.astro` is the small inline tag from the mockups. Pass the fact's flag:
`<NotConfirmed confirmed={facts.founded?.confirmed} />`. It renders nothing once the flag is true,
so the tag disappears on its own when someone ticks the box. Unconfirmed facts are also kept out of
the site-wide JSON-LD (`src/lib/schemas.ts` merges `churchJsonLd`): no street address, phone or
service time is published to search engines until it is confirmed. The JSON-LD type is `Church`
(Site settings > Business type, empty means Church; no `priceRange`), and each confirmed
gathering is an `Event` with a weekly `eventSchedule` (2026-10-17).

`/sunday.ics` (`src/pages/sunday.ics.ts`, `sundayIcs`) is "Add Sundays to my calendar": one weekly
event per confirmed Sunday gathering, from this Sunday, at the address. The This Sunday card links
it only once a Sunday time is confirmed.

`churchAddress.findUs` is Jacob's optional "how to find us" sentence (parking, which door). It
shows on the This Sunday card and in the footer under the address; empty hides it.

## Drop-in components (`src/components/church/`)

All of them fetch their own data (memoized, one Sanity read per build), take no required props,
and draw only themselves: the section, heading and band around them belong to the page.

| Component             | Where the mockups put it               | Draws                                                                                   |
| --------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `ThisSunday.astro`    | Home hero, Watch band, Plan your visit | "This Sunday, October 25 · Sunday School for all ages 9:45 am · Worship 11:00 am"       |
| `ThisWeekList.astro`  | Home "This week at Auburn"             | The next 7 days: service times merged per day, plus Church Trac events; "Full calendar" |
| `LastSunday.astro`    | Watch band, Watch page                 | Latest YouTube message: thumbnail, label, title; press to play. `slot="fallback"`       |
| `SundayWeather.astro` | Plan your visit, under the address     | "Sunday: 62°, sunny." (browser fetch, Wednesday to Sunday noon, hidden on any failure)  |
| `ServiceTimes.astro`  | Plan your visit "When" facts           | Each gathering: time (and day if not Sunday), label, note                               |
| `ChurchAddress.astro` | Footer, Contact, Plan your visit       | `<address>` lines plus "Get directions" (Google Maps search from the same fields)       |
| `NotConfirmed.astro`  | Beside any provisional fact            | The tag                                                                                 |

Example, a Watch band that falls back to Facebook until there is a YouTube channel:

```astro
<LastSunday>
  <p slot="fallback">
    We stream live on Facebook every Sunday at 11. <a href="...">Watch on Facebook</a>
  </p>
</LastSunday>
```

## Live now and the livestream (2026-10-24, ported from First Baptist Muncie)

The church streams on Facebook today and plans a YouTube channel. Everything below works on
Facebook now and gets better by itself once the YouTube channel id is filled in.

- **Where to watch** is Church facts `liveUrl`: the Live stream link, else the YouTube channel's
  `/live` page once `youtubeChannelId` is set, else the Facebook page from Social links
  (`liveVia` says which, for the words). Footer, Livestream block, the This Sunday card, the menu
  and the banner all use it.
- **The Live now banner** (`LiveBanner.astro`, in `BaseLayout` above the header on every page) is
  built hidden. `src/lib/live-client.ts` shows it from 5 minutes before worship (the last Sunday
  gathering) to 80 minutes after, on the church's clock (`src/lib/live-service.ts`). The same
  script shows Home's "Live now" tag on the watch card, points that card at the stream, and turns
  the phone menu's "Watch live on Facebook" row into "Live now" (via `window.__churchLive` and the
  `church:live` event). Contract: `[data-live-show]` is shown while live, `a[data-live-link]` goes
  to the stream while live, the first `[data-live-start]` carries the settings.
- **The This Sunday card** says "Can't be there? Watch live on Facebook at 11:00." With a YouTube
  channel it names the coming Sunday's scheduled stream instead ("Watch "<title>" live on
  YouTube"), read from the channel feed at build time (`upcomingStream` in `church-video.ts`: a
  zero-view upload published in the week ending on that Sunday; two different titles name none).
- **A real "Live now" (YouTube only).** With a channel id, the browser also asks
  `GET /api/live-status/` (SSR, `src/lib/live-status.ts`) around worship, at most once a minute;
  a fresh answer overrides the clock and links straight to the live video. It needs the Worker
  secret `YOUTUBE_API_KEY` (a Google Cloud API key restricted to the YouTube Data API v3):
  `npx wrangler secret put YOUTUBE_API_KEY -c dist/server/wrangler.json`. Two quota units per
  check, cached 90 seconds per isolate. Without the key or channel every answer is "unknown" and
  the clock decides. Facebook has no keyless live check, so on Facebook the clock always decides.
- **The replay** (`LastSunday`) is unchanged: YouTube only, Facebook text in its fallback slot.

Nothing live renders unless Church facts has somewhere to watch (a Facebook link in Social links,
a Live stream link or a YouTube channel id).

## How it stays current

The site is static, so the dates, the replay and the events move when it rebuilds: on every
publish (the Sanity webhook), on every push to `main`, and on a schedule in `deploy.yml`: every
morning at 10:00 UTC and Sunday at 18:00 UTC (after the service, for the replay and to move "This
Sunday" on to next week). On a Sunday the line reads "Today" until 90 minutes after the last
service starts.

The weather is the exception: it is fetched by the visitor's browser from api.weather.gov (free,
no key, CORS open) after the load event, because a forecast in a static page would be days stale.
The grid is cached in `src/lib/sunday-weather.ts` (ILN 28,51, resolved from the street address on
2026-10-17); if the NWS re-grids, the line simply stops showing.

## Failure modes, all quiet

- No YouTube channel id, or the feed fails: `LastSunday` renders its fallback slot (or nothing).
  Failures are logged in the build output as `[church-video]`.
- No calendar feed, or it fails: `ThisWeekList` shows the service times alone and no "Full
  calendar" row. Failures log as `[church-events]`. Church Trac needs a real User-Agent and
  Accept-Language, which `src/lib/church-feeds.ts` sends.
- A calendar event at the same day and time as a regular gathering is treated as the same
  gathering and not listed twice.

## Testing

- Live now: `live-service.test.ts` (the window either side of daylight saving, the endpoint
  override) and `live-status.test.ts` (the YouTube calls, mocked). To see the banner, set a
  Facebook link and fake the clock in the browser console (replace `Date` with a class fixed at
  a Sunday 15:10 UTC, then dispatch `astro:page-load`).
- Unit: `church-facts.test.ts`, `church-video.test.ts`, `church-calendar.test.ts` (the parser,
  ported from First Baptist Muncie), `sunday-weather.test.ts`.
- Fixture build: `CHURCH_DATA_FIXTURE=1 CHURCH_DATA_NOW=2026-10-21T16:00:00Z npm run dev` reads
  `tests/fixtures/church-youtube.xml` and `church-calendar.ics` at a fixed Wednesday;
  `CHURCH_DATA_FIXTURE=unavailable` proves the fallbacks. No deploy sets either.
