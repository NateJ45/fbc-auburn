# Design direction: the brick path and markers (2026-10-21)

The brand moved to brick on 2026-10-21: the logo is stepped horizontal courses with the cross
cut out (`brand/logo/`, `scripts/brand-logo.mjs`), the palette is auburn and navy on a warm
white ground, and the sixteen stone icons stay mosaic, recoloured. That left five things on the
site still drawn in the older pebble-stone grammar: the three-stone section marker, the numbered
round stones on Home's "Your first Sunday" walk, the This Sunday card's pebble ground, the sermon
and panel tiles, and the hero stone path. `sheet-12-brick-path.png` redraws each in the mark's
grammar (running bond, hairline joints, a thin darker band on each brick's bottom edge, the five
auburn tones or a navy set, stepped ends) and composes them in a Home mock.

## Decision

Nathan picked, 2026-10-21:

- **Marker a:** three bricks stepping up to the right, the corner of the mark, in the auburn tones.
- **The card ground (c):** navy running bond behind the This Sunday card, tones close so the
  white text stays readable.
- **Sermon art (d):** the same navy brick ground with the auburn marker.
- **The walk:** numbered bricks (64 x 44, a small radius, an inset bottom band) alternating auburn
  and navy, joined by a brick-dash mortar line.
- **Hero path E:** a low wall stepping up toward the card ("the door"), but lower and lighter than
  the mock: three courses, not five, and the lighter auburn tones dominant. It still tucks under
  the card and never meets text.

Out of scope, on purpose: the Auburn Stone letterforms (`StoneHeading.astro`, the masthead and
footer "Auburn"), the icons, the logo and the palette.

## The letterforms (added the same evening)

`sheet-13-auburn-letterforms.png`: the Auburn Stone letterforms (Young Serif split into pebble
stones, a webfont) redone in brick three ways: A, brick-filled letters (the glyph edge clean, running
bond inside); B, the word cut out of a brick wall, as the cross is cut out of the mark; C, coursed
letters with nudged joints. Nathan picked **A for the letterforms** (masthead, footer signature,
page H1s) **with B for a few places** where a wall makes sense: the 404 headline ("Off the path"),
the sermon and series art with no picture (the book name cut out of the navy brick ground), and a
social tile. Carry forward: a brick treatment cannot be a plain font (several colours and joints per
letter), so the headings become build-time SVG drawn from the heading text, one SVG per word so
lines still wrap, with the words kept as real text for search and screen readers (`aria-label`
plus the live-preview stega run). The Studio banner lettering keeps Auburn Stone until the Studio
kit gets the same generator.

## Where it lives

`scripts/lib/brick-courses.mjs` (the generators), `scripts/gen-stones.mjs` (`npm run gen:stones`
writes `src/components/home/stones.generated.ts`, `public/textures/tile-*.svg` and the Studio
banner art), `src/styles/home-board.css` (the walk and the path's laying motion). The pebble
generators stay in `scripts/lib/stone-mosaic.mjs`, unused by the site, for the record.
