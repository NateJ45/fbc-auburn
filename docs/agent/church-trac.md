# Church Trac on the site

Added 2026-10-24 from fbcm's build (PORTS.md card 152). The church runs on Church Trac: people,
giving, the calendar, forms and the app. Sanity stays the CMS for page copy; Church Trac feeds the
site in four ways, and every one of them is empty-safe, so nothing changes until a box is filled.

| Feed     | How                                                                                | Code                                                         |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Calendar | The iCal feed, read every build (This week, Events)                                | `src/lib/church-calendar.ts`, `docs/agent/church-data.md`    |
| Links    | Church facts boxes plus `{token}` links filled at build time                       | `src/lib/church-links.ts`, `src/lib/queries.ts`              |
| Forms    | Contact and Prayer swap to Church Trac forms; a "Church Trac form" band for others | `church-trac-form.ts`, `church-blocks/ChurchTracFrame.astro` |
| Pages    | A "Church Trac page" band reads a published Church Trac page at build time         | `church-trac-page.ts`, `church-trac-pages.ts`                |

## The boxes (Site settings > Church facts)

`churchTracUrl` (the church's own `https://<church>.churchtrac.com`), `connectCardUrl`,
`contactFormUrl`, `prayerFormUrl`, alongside the existing `givingUrl`, `memberLoginUrl`,
`churchTracIcalUrl` and `liveStreamUrl`. All optional, all https, resolved in
`src/lib/church-facts.ts`.

## Link tokens

A link box can hold `{giving}`, `{connect}`, `{contact-form}`, `{prayer}`, `{calendar}`,
`{members}` or `{watch}` instead of an address (the list is `CHURCH_LINKS`).

- **Filled in `src/lib/queries.ts`.** Its local `sanityFetch` passes every result through
  `fillLinkTokens()`. The Church facts it fills from are read once, unfilled, through the real
  `sanityFetch` (`src/lib/sanity.ts`, PORTABLE, untouched), so the fill never calls itself.
- **Whole values only**: a token inside a sentence is left alone.
- **A blank box never ships a broken link**: `{giving}` goes to `/give/`, `{prayer}` to
  `/prayer/`, `{calendar}` to `/events/`, `{watch}` to `/watch/`, the rest to `/contact/`, and the
  build logs `[church-links] {token} is used but ... is empty` once per token.
- **`{contact-form}`** falls back to the connection card before `/contact/`.
- **The visit links**: once the connection card is set, any link to `/contact/?visit=...` (the "Tell
  us you are coming" buttons) goes straight to the card.
- **Studio validation**: `src/sanity/schemaTypes/_linkRule.ts` (ctaBlock "Full URL", a menu's "Web
  address") and the steps rail and walk link check (`auburnMotionSections.ts`) accept a known token
  and reject an unknown one.
- **Live preview gap**: the preview reads through its own client (`cms-preview.ts`), so a token
  shows unfilled there. The built site is always filled.

## Forms

- `ChurchTracFrame.astro` draws one Church Trac form: only an https churchtrac.com address survives
  (`formSrc` in `church-trac-form.ts`), the site draws its own `<iframe>` (`allow="payment"`, lazy),
  a quarter taller on a phone, and an "Open the form in a new tab" link under it.
- **Contact** (`src/pages/contact.astro`) and **Prayer** (`FormBlock.astro`, a `prayer` form) call
  `churchTracFormFor()`: the contact form, else the connection card, for Contact; the prayer form for
  Prayer. With the box empty the site's own form stays.
- **Church Trac form band** (`churchTracFormSection`): staff paste the embed code; `checkPaste` is the
  Studio's message, and a paste that is not a Church Trac form draws nothing.
- **Church Trac's "Form/Giving Embed Domain"** setting must hold this site's address, or the form
  refuses to open in the frame. It reads the page's origin, which `public/_headers` sends
  (`Referrer-Policy: strict-origin-when-cross-origin`). It changes at the domain cutover.

## Pages

- **Church Trac page band** (`churchTracPageSection`): names a page (`bulletin`); the build fetches
  `<churchTracUrl>/<page>` once (two tries, 10 s timeout, a real User-Agent and Accept-Language,
  which Church Trac requires), `readChurchTracPage()` keeps headings, paragraphs, pictures, buttons
  and columns and drops template text and unsafe links, and `ChurchTracBlocks.astro` draws them.
- Failure shows "Read it on Church Trac"; no address shows a yellow `[Jacob: ...]` ask before launch
  and nothing after. The daily rebuild (`deploy.yml`) keeps it within a day.
- **Tests never read Church Trac**: `CHURCH_TRAC_PAGES_FIXTURE=1` renders fbcm's two saved real
  pages (`tests/fixtures/churchtrac-*.html`; `=unavailable` proves the fallback), and the sections
  wall's Playwright spec and the thumbnail shooter answer churchtrac.com with stand-ins.
