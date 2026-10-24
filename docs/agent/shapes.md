# The shape system and Find your place

Added 2026-10-24. Two picture shapes and one brick slab make the church's own phone photos read as one
designed family, and a Ministries hub built on them. Styles: `src/styles/shapes.css`. The hub block:
`src/components/sections/FindYourPlace.astro`.

## The shapes

| Class                                | What it does                                                                                                                                                                                                                                                                     | Where it is used                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `.shape-step`                        | Cuts the top-left corner away in three brick courses (each step 2 units across, 1 down; one unit is `--step-u`). The picture's top edge climbs left to right, like the stepped bricks of the section marker. The other corners are square. `.shape-step--lg` uses bigger bricks. | Find your place cards                                   |
| `.shape-gable`                       | Cuts the picture to the roofline of the building. The pitch (`--gable-pitch`, 24%) is a share of the box, so a narrow box reads steep and a wide one reads like the porch roof.                                                                                                  | Every photo in the "Image and text" block (`ImageText`) |
| `.shape-slab`                        | A navy printed-brick wall (`tile-deep.svg`) behind the picture, from a third of the way in out past the page edge. `.shape-slab--left` runs it to the left. On a phone it is a band behind the lower part of the picture. The section around it needs `.shape-slab-host`.        | ImageText photos (the side follows the picture's side)  |
| `.shape-zoom` inside a `.shape-card` | The picture grows to 1.08 over 500ms on hover or keyboard focus of the card, inside the clipped frame. No lift, no shadow. Off with reduced motion.                                                                                                                              | Find your place cards                                   |
| `.shape-tile`                        | A card with no photo: its stone icon on warm printed brick (`tile-warm.svg`), in the same shape.                                                                                                                                                                                 | Find your place cards without a photo                   |

The shapes are `clip-path` polygons, so an image, a Photo needed example (`ShotRequest`) or a plain panel take them the
same way. A clipped border shows as a hairline along the cut, so shaped frames have `border: 0`. Board pages give
`.auburn-arch.shape-gable` square corners and a 5:4.4 box (`src/styles/board.css`).

Drawings in ImageText (the mark, the baptism graphic, the building band) and the empty-slot mark are not shaped.

## Find your place (`findYourPlaceSection`)

A page-builder block, in the Studio as "Find your place (groups of cards)" under Basics. Ministries uses it.

- **Groups** (1 to 8), each with a short name, an optional line and 1 to 12 cards. Every group shows at once, stacked.
  The tabs on hppres.org were left out on purpose: with a small church they would leave groups of one card.
- **The index.** With two or more groups, a list of jump links sits beside the groups on a wide screen (sticky, Young
  Serif, the current group in ink with the brick marker, the rest a quiet tint at 3.4:1) and becomes a sticky row of
  chips on a phone or tablet (the current chip filled and scrolled into view). Each group's id comes from its name, so
  `/ministries/#serve` deep-links and Back and Forward work natively. A small script marks the group in view with
  `aria-current` and measures the header: the base layout hides the header on a scroll down (`data-state="hidden"`), so
  the index slides up with it and comes back under it.
- **A card**: a photo (stepped corner) or its stone icon on brick; who it is for, in small caps; the title; **when and
  where** as a red serif line; a sentence or two; and an optional link, which makes the whole card the link.
- **Times are never typed.** "When" is a day ("Wednesdays"). `dayWithTimes` (`src/lib/church-facts.ts`) adds that day's
  times from Church facts, narrowed to the gathering named after the card when there is one: on a Sunday with Sunday
  School at 9:45 and Worship at 11:00, "Sunday School" gets 9:45 and "Kids" gets both. Home's bands use the same helper.
- **A card in two groups** is simply in both (Duplicate in the Studio).
- **Photos before launch.** Cards are keyed in `src/data/shot-list.ts` by title (`/ministries/|Kids`), so an empty or
  stand-in photo shows its Photo needed example.

The Ministries content was moved onto the block by `scripts/content/ministries-find-your-place.mjs` (dry by default,
backs the page up first, carries every card's words over, and writes the "after" page for a look). The page head reads
"Find your place" and the closing band names Pastor Jacob.

## The article page (News and notes posts)

Added 2026-10-24, from the hppres.org stories. `src/pages/journal/[slug].astro`, styles `src/styles/article.css`.

- **Head.** A back link ("News and notes" in small caps with a 56px thin arrow pointing left, which draws back a
  little on hover), the title big in Young Serif (up to about 4.75rem, 20ch), the standfirst (the post's excerpt).
- **Cover.** The full content width, 16:9 (4:3 on a phone), cut with `.shape-step.shape-step--lg`. A stand-in cover
  still shows its Photo needed example (`journalCoverShot`), in the same shaped frame.
- **Rail and body.** From 64rem: a 13rem rail on the left, sticky under the header, holding the date (Young Serif),
  reading time, author, categories, the headings list (`CaseStudyTOC`) and the share buttons stacked full width; the
  text sits beside it at 38rem. Below 64rem the rail is one band over the text: the meta in a row, the category, and
  the share buttons as 44px icon squares (the words stay for screen readers), with a hairline under it.
- **More from News and notes.** After a `BoardRule`: a small-caps "Keep reading" eyebrow, the heading, a link to the
  whole list, and up to three cards (the related posts, or the latest in the same category). Each card is a
  `.shape-card` whose title link covers it; the picture is `.shape-step` 4:3 with `.shape-zoom`, a Photo needed
  example, or the church's mark on `.shape-tile` when the post has no cover.

## People

`PersonCard.astro` (in the People block, `PeopleSection.astro`): every portrait is a 4:5 `.shape-step` frame with the
same `object-position` (centre, 30% down) so heads line up along a row. A person with no photo gets the same frame as a
`.shape-tile` with the mark (`src/assets/brand/mark-print.png`), so a grid never breaks. The name is Young Serif, the
role small caps grey. Two portraits a row on a phone (below 40rem), auto-fill from 14rem above. The block's intro (the
existing `intro` field) is the place for "what this role is"; it already sits under the heading, before the faces.
