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
