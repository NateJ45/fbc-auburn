# The good news band (2026-11-19)

A comparison of Home with fbcbremen.org found one flat stretch: "The good news" was a paragraph on
white, the least designed part of the page about the most important thing the church says. Bremen's
strongest moment is a single navy band built on its three-word mission. `index.html` sketches three
Auburn treatments, using the site's own fonts, brick textures and stone icons (open it through a
local server so the relative paths load).

| Option             | What it is                                                                                        | Trade-off                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A. Four bricks     | The gospel in four numbered cream stones on the navy brick wall, one stone icon each.             | Strongest page rhythm; the pastor writes four short parts. |
| B. The cornerstone | The paragraph unchanged, set large in Young Serif on a cream plaque in the red brick wall.        | No new writing; one long block of display type on a phone. |
| C. Cross at center | Four short lines with red key phrases beside the brick cross on a cream tile set into a red slab. | Quietest; needs short lines too.                           |

## Decision

2026-11-19, Nathan: **A, Four bricks.** Built as the Brick wall look on Cards with stone icons
(`src/lib/section-looks.ts`, `IconCards.astro`), so the pastor can reuse it elsewhere, and applied to
Home by `scripts/content/home-good-news-bricks.mjs`.

Carry forward: the stones use the card corner (`--radius-card`), not the sketch's notch, to keep
one card family; the eyebrow has no brick marker, like every other cards block. The words are a
marked draft for Jacob to rewrite one stone at a time.
