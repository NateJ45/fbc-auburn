# The graphics maker ("Make a graphic", 2026-10-27)

A Studio tool that makes the church's social posts, Sunday slides and print pieces in the church's
own look, from what the church already keeps in the Studio. The pastor picks what it is for, checks
the words, picks sizes and an optional photo, and downloads finished PNGs or prints a print size to
PDF. There are no colour, font or layout pickers, on purpose: the design is fixed, so every piece
looks like Auburn.

## Where things are

| Piece                                                                   | File                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| The sizes (pixels, bleed, safe areas, print inches and dpi)             | `src/lib/graphics/formats.ts`                                   |
| Line breaking and fitting (balanced lines, shrink to fit, warnings)     | `src/lib/graphics/text.ts`                                      |
| A stack of set text in a box                                            | `src/lib/graphics/layout.ts`                                    |
| SVG pieces: fonts inlined, lines, photo crop, brick sill and marker, QR | `src/lib/graphics/svg.ts`                                       |
| The words from Church facts, sermons, series and event pages            | `src/lib/graphics/content.ts`                                   |
| Design directions (one file each) and the default                       | `src/lib/graphics/directions/`                                  |
| Browser half: fonts, canvas measure, PNG, print window                  | `src/lib/graphics/raster.ts`                                    |
| Inlined fonts, mark and textures (Vite `?inline`)                       | `src/lib/graphics/assets.ts`                                    |
| Sample words for the wall and tests                                     | `src/lib/graphics/samples.ts`                                   |
| The Studio tool and the "Make a graphic" document action                | `src/sanity/graphics/`                                          |
| The wall: every direction, kind and size                                | `/styleguide/graphics/` (`src/pages/styleguide/graphics.astro`) |
| PNGs for review, through the real export                                | `node scripts/shoot-graphics.mjs`                               |
| Tests                                                                   | `src/lib/graphics.test.ts` (part of `npm run test:unit`)        |

## How it draws

A direction's `render(content, format, ctx)` is a pure function that returns one self-contained
SVG string (both fonts, the mark, textures and any photo inlined as `data:` URIs) plus plain
warnings ("The title is too long for Story. Try fewer words."). No DOM and no network, so the
Studio, the wall and the node tests call the same function. `ctx.measure` gives text widths: in
the browser a canvas with the real fonts loaded (`canvasMeasure()`), in tests `approxMeasure`.

The browser turns the SVG into a PNG at full size (`svgToPng`: a `data:` URL image drawn to a
canvas, so the canvas is never tainted) and, for print sizes, opens a print window at the TRIMMED
paper size with the bleed hanging off the page (`printGraphic`), so Save as PDF gives a file a
home printer or copy shop can use. Photos are fetched from the Sanity CDN as a data URI first.
No dependency was added: `qrcode-generator` was already in for the QR action.

Sizes: print is 300 dpi with 1/8" bleed and words a further 1/4" in; the yard sign is 150 dpi so
it stays under a phone browser's canvas limit (a test holds every size under 16.7 million px).
A story keeps clear of the app's name bar and reply box; the Facebook page cover and YouTube
banner keep words in the strip every device shows.

## The words are derived, not typed (rule 15)

`content.ts` builds a graphic's words from data: This Sunday from `dayPlan()` (time changes
applied), a different Sunday from Church facts' `timeChanges`, the weekly times for "New here",
an event from the page's first Event details block (next date, start times), a sermon or series
from its document. The tool shows times read-only with "Change them there". Pre-launch notes
(`[Jacob: ...]`, `[Placeholder: ...]`) are never printed: `withoutNotes()` strips them and the tool
says a note was left out. When any Church facts time is not ticked Confirmed, the tool says so
before anything is printed. Web addresses and QR targets go through `withTrailingSlash()`
(rule 19) and follow `site.url`, so they move to the church's own domain at cutover.

## Adding things

- **A size:** one row in `FORMATS`. Pick its `shape` (tall, portrait, square, landscape, banner);
  every direction already lays out each shape.
- **A kind:** add it to `Kind` in `types.ts`, a sample in `samples.ts`, a builder in `content.ts`,
  its blocks in each direction, and a tile and default sizes in `GraphicsTool.tsx`.
- **A direction:** a new file in `directions/`, registered in `directions/index.ts`. Check it on
  the wall, then shoot it and look at every PNG. The tests draw every kind at every size.

## Studio wiring

`auburnGraphics()` is registered in `sanity.config.ts` before `ncsStudioKit`, and `'graphics'`
sits in `toolOrder` and `staffTools` in `src/sanity/kit.config.ts`, so helpers see it too. The
deployed Studio is hash-routed, so the document action hands the document id over in
`sessionStorage` (`GRAPHICS_DOC_KEY`) and moves through the router. To try the tool without
signing in, use the kit harness: `http://localhost:4321/kit-harness/studio/` under `npm run dev`
(a mock sign-in that can read the public dataset; uploads fail there).

## The design

Directions and the pick are recorded in `docs/design-directions/2026-10-27-graphics/`. The rules
every direction keeps: the church's palette and two faces only, one auburn accent per piece, one
left edge, balanced titles, words inside the safe area, photos cropped (never stretched) with
hard edges, and none of the AI-slop tells (gradients, glows, drop shadows, emoji, pill badges,
centred SaaS heroes, clip art).
