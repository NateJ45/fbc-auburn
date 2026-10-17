# Church data: facts, This Sunday, This week, the replay and the weather

Added 2026-10-17. The church's facts are typed once, in **Site settings > Church facts**, and every
place the site shows them is derived from there at build time (CLAUDE.md rule 15). This page is
the usage note for the drop-in components; see them all at once on `/styleguide/church-data/`
(noindex).

## Where the data lives

| Fact                 | Field (Site settings, group "Church facts")       | Confirmed flag                 |
| -------------------- | ------------------------------------------------- | ------------------------------ |
| Address              | `churchAddress` { street, city, state, zip }      | `churchAddress.confirmed`      |
| Service times        | `serviceTimes[]` { label, day, time (24h), note } | each row's `confirmed`         |
| Phone                | `phone` (Identity & contact)                      | `phoneConfirmed`               |
| Year founded         | `foundedYear`                                     | `foundedConfirmed`             |
| YouTube channel      | `youtubeChannelId` (UC..., 24 characters)         | n/a                            |
| Church Trac calendar | `churchTracIcalUrl` (the iCal link)               | n/a (the church's own entries) |

- Schema: `src/sanity/schemaTypes/churchFacts.ts`, spread into `siteSettings.ts`.
- Resolver: `src/lib/church-facts.ts` (`resolveChurchFacts`, `thisSunday`, `thisWeek`,
  `churchJsonLd`), pure and unit-tested. Components call `getChurchFacts()` from
  `src/lib/church-data.ts`; never read the raw settings document for a fact, and never type a
  time or an address into a component.
- With Sanity empty, each fact falls back to `FALLBACK_FACTS` (the values from the church's
  Facebook page), all unconfirmed. There is no fallback phone.
- `day`, `time`, `youtubeChannelId` and `churchTracIcalUrl` are in `NON_STEGA_FIELDS` (rule 8b).

## The "To confirm" tag

`NotConfirmed.astro` is the small inline tag from the mockups. Pass the fact's flag:
`<NotConfirmed confirmed={facts.founded?.confirmed} />`. It renders nothing once the flag is true,
so the tag disappears on its own when someone ticks the box. Unconfirmed facts are also kept out of
the site-wide JSON-LD (`src/lib/schemas.ts` merges `churchJsonLd`): no street address or phone is
published to search engines until it is confirmed.

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

- Unit: `church-facts.test.ts`, `church-video.test.ts`, `church-calendar.test.ts` (the parser,
  ported from First Baptist Muncie), `sunday-weather.test.ts`.
- Fixture build: `CHURCH_DATA_FIXTURE=1 CHURCH_DATA_NOW=2026-10-21T16:00:00Z npm run dev` reads
  `tests/fixtures/church-youtube.xml` and `church-calendar.ics` at a fixed Wednesday;
  `CHURCH_DATA_FIXTURE=unavailable` proves the fallbacks. No deploy sets either.
