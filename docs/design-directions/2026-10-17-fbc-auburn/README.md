# Design directions: First Baptist Church of Auburn (2026-10-17)

Step 3 of brief -> references -> **design directions** -> reskin. Brief: `PRODUCT.md` and
`DESIGN.md` at the repo root; references: `docs/references/README.md`. Three static homepage
mockups, one per way of coping with few photographs. Open `index.html` to compare them side by side.
Nothing here is site code; `brand/brand.config.json` and `src/**` are untouched.

## Decision

2026-10-17 (night): **board E refined after a Home audit** (nine reviewers, one per section plus
the motif and the whole page). The motif stays and becomes one system:

- the stones are a middle ground between the board's round pebbles and the mark's dressed stones
  (Nathan tried a squared, coursed path and judged it lost the warmth): the same random Voronoi
  stones, every one a different size, with flatter sides and softened corners, in the mark's six
  colours only (it was 13), even grout, and no red "cross" end;
- the path runs in from the left under the buttons and ends in gold at the This Sunday card's
  left side, whole stones only, so the card is the door; it lays when it comes into view; phones
  get a short strip under the card instead of the diagonal;
- the card's ground is the same soft stones in varied sizes; no map pin on it (mosaic on mosaic);
- the sky and green bands are flat tints (the pebble texture read as wallpaper);
- one section marker everywhere: three gold steps from the mark;
- the masthead is a little smaller and carries the place ("Hamilton-Scipio Road · Hamilton,
  Ohio", from Church facts), so "Auburn" is not read as Alabama;
- Who we are grows with the welcome (it overflowed past about 35 words) and takes an optional
  portrait beside the signature (`imageTextSection.signedPhoto`, Home only);
- the header's four links are About, Watch, Ministries, Give; the footer's link grid shares the
  brand row's columns; the gaps between sections are one rhythm (80 to 160px, was up to 218px).

2026-10-17 (late): Nathan picked **board E, "the path to the door"**, which replaces the full-height
ribbon on Home. A second design round (four Home directions on a Claude Design canvas) found the
ribbon still weaker than the comp; he chose C (the noticeboard) with A's This Sunday card, polished
over several rounds into E. Home is now built by `src/components/home/HomeBoard.astro`
(styles `src/styles/home-board.css`), top to bottom:

- the hero is the Auburn-wide lockup at hero scale: the full-colour mark beside "FIRST BAPTIST
  CHURCH OF" over a mosaic "Auburn" (the mark is hidden under 960px, where the header carries it);
- a lead row: the red "Come as you are.", a paragraph, one red button and a text link, beside the
  This Sunday card (deep sky on the deep mosaic tile; date, forecast, times, address, all derived);
- a generated mosaic stone path (Poisson sites, Lloyd-relaxed Voronoi, white grout) in the mark's
  story order, water, green, gold, red, rising under the Sunday card; phones get a smaller path
  between the welcome and the card, flipped to land on it. It lays itself stone by stone on load;
  no JS and reduced motion show it finished;
- section labels in small caps with a hairline, each led by three stepping stones whose colours
  follow the path down the page;
- Through the week (sky mosaic band, a white three-column board), Who we are (a photo mosaic with
  a green note panel, 20px frames), This week beside Last Sunday, Other ways in (green mosaic band,
  white link cards that lift);
- the ink footer (mark, "A small church with the door open.", Sundays, Find us, Follow) and a
  header whose logo slot shows the Sunday note on Home until the hero lockup scrolls under it.

System: one 20px radius for card-sized surfaces, 10px buttons; red only for the welcome line and the
one button; dates in deep sky; tabular numerals for times. The path, tiles and markers are generated
by `npm run gen:stones` (`scripts/gen-stones.mjs`, `scripts/lib/stone-mosaic.mjs`) with the seeds E
was approved with; the output is committed. Content stays in the Studio (Home's page layout); the
data change is `scripts/content/home-board-e.mjs`.

Rejected on the way, do not reintroduce: the full-height ribbon (removed with
`StoneRibbon.astro` and `src/scripts/ribbon.ts`), stone-shaped photo crops, a faint background path
down the whole page, single gold slab markers, gradient washes. This entry supersedes the
"ribbon is Home's signature" carry-forward below, and C's noticeboard, rejected as a whole-page
system in the first round, is now Home's system (inner pages keep the first pass for now).

2026-10-17 (later the same day): Nathan picked **"A, made bolder from the Gemini comp"** after
comparing the first reskin with a Gemini homepage comp. The first pass used the stone path timidly
(small scattered stones, a faint background path), had no photos, and alternated pale tinted bands,
so Home read as a starter in new colours. Home now leads with one big idea, used with confidence:
a full-height ribbon of stones in red, gold, green and sky (`StoneRibbon.astro`,
`src/scripts/ribbon.ts`) that runs down a gutter and sweeps across between sections on wide screens
and becomes a slim left rail on phones. The page is plain white (no tinted bands, no stone dividers),
the hero intro is set large in red ("Come as you are.") with the derived This Sunday line, photos
fill the hero arch, a text-and-picture band and the "Find your place" cards (stock stand-ins until
the photo session), the Watch band shows a dark video card instead of an empty box, and Home is cut
to six blocks (hero, A place to belong, Plan your visit, Watch, Find your place, This week).

Carry forward: the ribbon is Home's signature; inner pages keep the first pass for now. Copy the
comp's composition, not its details: its lettering (a heavy sans) and its logo are not ours, and its
people are generated. Rejected: the comp's second ribbon on the right of the hero (one ribbon is
enough), a heavy sans headline in place of Auburn Stone.

2026-10-17: Nathan picked **A (Front porch) blended with B and C**. A's photo slots (arched now,
not full bleed) on B's airy white with B's prominent stone icons and stepping-stone rail, and C's
huge colour "Auburn" masthead on Home. The full 8-page design was then drawn as static mockups
outside this repo; DESIGN.md records the result.

Carry forward: palette from DESIGN.md (deep sky everyday colour, red for the one main button,
gold and sky as accents only), Young Serif + Familjen Grotesk, Auburn Stone for every page H1
(mosaic) and large H2s, radius 10px, layout header inline, hero split (rendered as the arched hero),
density airy, cards soft. Light header with the full-colour lockup; inner pages lead with a big
stone icon and a mosaic H1 beside an arched photo; borderless cards with large icons; Watch is
light, not a dark band; one red button per page.

Rejected: A's dark full-bleed photo heroes (too heavy without real photographs), C's poster
noticeboard as a whole-page system, cream paper (the Muncie look).

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
