# Design directions: First Baptist Church of Auburn (2026-10-17)

Step 3 of brief -> references -> **design directions** -> reskin. Brief: `PRODUCT.md` and
`DESIGN.md` at the repo root; references: `docs/references/README.md`. Three static homepage
mockups, one per way of coping with few photographs. Open `index.html` to compare them side by side.
Nothing here is site code; `brand/brand.config.json` and `src/**` are untouched.

## Decision

Not picked yet. Waiting for Nathan.

## Archetype assignment

| Direction | Name            | Archetype              | How it copes with few photos                                         |
| --------- | --------------- | ---------------------- | -------------------------------------------------------------------- |
| A         | Front porch     | Image-led / cinematic  | Assumes the optional photo session; five photo slots                 |
| B         | Stepping stones | Story / scroll chapter | No photographs; the stone art and icons carry the page               |
| C         | The noticeboard | Poster / typographic   | One photo of the building (a member can take it); type does the rest |

## Forced divergence

The brand fixes the families (Young Serif, Familjen Grotesk, Auburn Stone), so the type row differs
by which family leads and how each is used, not by swapping families.

| Axis              | A: Front porch                                                           | B: Stepping stones                                              | C: The noticeboard                                                                           |
| ----------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Layout structure  | Full-bleed bands, alternating photo/text halves that touch the page edge | One centred column with a stepping-stone rail down the left     | Ruled 12-column grid: 3-column labels beside 9-column content                                |
| Nav pattern       | Transparent bar over the photo, overlay "Menu" button                    | Centred Auburn-led lockup, links in a row; bottom bar on phones | No nav bar: a numbered site index sits inside the hero                                       |
| Hero structure    | Full-bleed photograph, headline and two buttons laid over it             | Split: mosaic stone H1 beside the baptism artwork               | Type-only masthead ("Auburn" huge) with one arched photo                                     |
| Type pairing      | Young Serif display, Familjen body; no stone type                        | Auburn Stone mosaic H1, Young Serif H2s, Familjen body          | Auburn Stone for one word, Young Serif for the letter body, Familjen tracked caps for labels |
| Density           | Medium: about 180 words a screen, 6 sections                             | Airy: about 90 words a screen, 7 short steps                    | Dense: about 260 words a screen, 4 ruled rows                                                |
| Imagery treatment | Full-bleed photography (session)                                         | Illustration: stone icons, baptism graphic, no photos           | Type-as-image plus one arched photograph                                                     |
| Colour role       | Dark photo ground, red for the single main action, deep sky one colour   | White ground with several accents (icon colours), gold rail     | Ink on white with one accent (deep sky); rules, no colour bands                              |
| Stone moment      | The full-colour mark in the Sunday strip                                 | The mosaic H1 "Sundays at Auburn"                               | The mosaic H1 "Auburn"                                                                       |

## Direction A: Front porch (image-led)

- **Bet:** a visitor decides from faces and a building they recognise, so real photographs do the
  welcoming.
- **What this direction rejects:** stone headings on the homepage, card grids, text-only heroes.
- **Costs:** needs the optional photo session; without it every block is empty. Text over photos
  needs a scrim and careful crops.

## Direction B: Stepping stones (story / scroll chapters)

- **Bet:** a nervous first-timer wants to be walked through a Sunday in order, and the stone art can
  carry the page without a single photograph.
- **What this direction rejects:** photographs on the homepage, a top navigation bar on phones (a
  bottom bar instead), events and news feeds on the homepage.
- **Costs:** the most colour of the three, so the icons must stay one size and the H2s one colour;
  the homepage says little about the church beyond Sunday; adding a photo later needs a new block.

## Direction C: The noticeboard (poster / typographic)

- **Bet:** the place name is the church's best asset; a visitor wants every fact on one screen, set
  like a well-made noticeboard, with one honest photo of the building.
- **What this direction rejects:** a navigation bar, icons, buttons, coloured section bands, more
  than one photograph.
- **Costs:** dense and text-heavy on a phone; relies on good copy in the pastor's voice; the index
  must be kept in step with the page list by hand.

## Comparison for the pick

- **A** is the most conventional and the warmest if the photo session happens; it is the weakest
  without it, and it uses the brand least (the stone type never appears).
- **B** is the most distinctive and needs no photographs at all; it leans hardest on the brand and
  must be held to the one-stone-moment rule as pages are added.
- **C** is the calmest and the furthest from any church template; it works with one photo a member
  can take, but it depends on real copy and reads dense on a phone.
- Hybrids that would work: C's masthead and index with B's Sunday steps below; or B's structure with
  A's photo slots switched on once photographs exist.

## Facts and placeholders

- Service times (Sunday School 9:45, worship 11:00, Wednesday 6:00) come from the church's public
  page and are **not yet confirmed**; every mockup marks them "To confirm".
- Copy marked "Draft" and the pastor's welcome are placeholders to write with the pastor.
- Photo slots are gradients that say which photograph belongs there. No church photographs are used.

## Screenshots

`shots/direction-<x>-<width>.png` (light) and `shots/direction-<x>-<width>-dark.png` (dark), at
390, 768 and 1280. Light shots come from `npm run directions:shoot`; dark shots were taken the same
way with `colorScheme: 'dark'`. No page overflows horizontally at any width. Direction B's phone
bottom bar is shown in place at the page end so full-page shots read correctly; on a real phone it
is fixed to the bottom of the screen.

## Assets

`assets/` holds copies of the brand kit files the mockups use (lockups, icon, small mark, baptism
graphic, stone icons) and the Auburn Stone webfont (a modified Young Serif under the SIL Open Font
License 1.1).
