# The graphics maker ("Make a graphic", 2026-10-27)

A Studio tool that makes the church's social posts, Sunday slides and print pieces in the church's
own look, from what the church already keeps in the Studio. The pastor picks what it is for, checks
the words, picks sizes and an optional photo, and downloads finished PNGs or prints a print size to
PDF. There are no colour, font or layout pickers, on purpose: the design is fixed, so every piece
looks like Auburn.

## Where things are

| Piece                                                                    | File                                                            |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| The sizes (pixels, bleed, safe areas, print inches and dpi)              | `src/lib/graphics/formats.ts`                                   |
| Line breaking and fitting (balanced lines, shrink to fit, warnings)      | `src/lib/graphics/text.ts`                                      |
| A stack of set text in a box                                             | `src/lib/graphics/layout.ts`                                    |
| SVG pieces: fonts inlined, lines, photo crop, brick sill and marker, QR  | `src/lib/graphics/svg.ts`                                       |
| The words from Church facts, sermons, series and event pages             | `src/lib/graphics/content.ts`                                   |
| Design directions (one file each) and the default                        | `src/lib/graphics/directions/`                                  |
| Browser half: fonts, canvas measure, PNG, both print windows             | `src/lib/graphics/raster.ts`                                    |
| The print-shop page (full size with bleed, SVG inlined)                  | `src/lib/graphics/print.ts`                                     |
| The postcard's mailing side (USPS EDDM Retail), shared by both looks     | `src/lib/graphics/mailing.ts`                                   |
| Invite a friend (card and square post), shared by both looks             | `src/lib/graphics/invite.ts`                                    |
| The carousel: frames from one graphic's words, numbered (pure)           | `src/lib/graphics/carousel.ts`                                  |
| Sermon series art: the words a title slide, square and podcast cover use | `src/lib/graphics/series-art.ts`                                |
| The short video's motion and file type (pure); the recorder is in raster | `src/lib/graphics/video.ts`                                     |
| Inlined fonts, mark and textures (Vite `?inline`)                        | `src/lib/graphics/assets.ts`                                    |
| Sample words for the wall and tests                                      | `src/lib/graphics/samples.ts`                                   |
| The Studio tool and the "Make a graphic" document action                 | `src/sanity/graphics/`                                          |
| The wall: every direction, kind and size                                 | `/styleguide/graphics/` (`src/pages/styleguide/graphics.astro`) |
| PNGs for review, through the real export                                 | `node scripts/shoot-graphics.mjs`                               |
| Tests                                                                    | `src/lib/graphics.test.ts` (part of `npm run test:unit`)        |

## How it draws

A direction's `render(content, format, ctx)` is a pure function that returns one self-contained
SVG string (both fonts, the mark, textures and any photo inlined as `data:` URIs) plus plain
warnings ("The title is too long for Story. Try fewer words."). No DOM and no network, so the
Studio, the wall and the node tests call the same function. `ctx.measure` gives text widths: in
the browser a canvas with the real fonts loaded (`canvasMeasure()`), in tests `approxMeasure`.

The browser turns the SVG into a PNG at full size (`svgToPng`: a `data:` URL image drawn to a
canvas, so the canvas is never tainted) and, for print sizes, opens a print window at the TRIMMED
paper size with the bleed hanging off the page (`printGraphic`), so Save as PDF gives a file a
home printer or copy shop can use ("Print at home"). The second print path, "Save a PDF for the
print shop" (`printForShop`, page from `shopPrintHtml` in `print.ts`), opens a window whose `@page`
is the FULL size, 1/8" of bleed on every side, with the SVG inlined rather than a PNG, so the fonts
travel as `@font-face` data URIs and the words stay vector text. Checked 2026-10-28 by printing the
page headless with Playwright (`page.pdf`): MediaBox 8.75 x 11.25 in for the flyer, embedded font
programs, text not a picture. There are no crop marks. Photos are fetched from the Sanity CDN as a data URI first.
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

## Shared templates, captions and alt text (2026-10-28)

`directions/index.ts` wraps each look's `render` (`shared()`): the `postcard-back` size goes to
`mailingSide()` and kind `invite` on `invite-card` or `post-square` goes to `inviteCard()`, both in
that look's ground (Light: paper and navy; Bold: paper with a navy band, or the auburn field with a
navy panel). An invite on any other size is drawn by the look as a Sunday piece. A size can be
limited to some kinds with `onlyFor` in `formats.ts` (`offeredFor()`): the invite card only for
`invite`, the mailing side only for `sunday`, `event` and `welcome`; the tool neither offers nor
draws it for other kinds.

- **The mailing side** keeps the USPS EDDM Retail rules (DMM 143): return address top left, an
  indicia box (ECRWSS / U.S. POSTAGE / PAID / EDDM RETAIL, 1.0 x 0.875 in, 7 pt capitals, 1/4 in
  from the top and right trim, so inside 1.625 in of the right and 1.375 in of the top), "Postal
  Customer" in the lower right, the right half below the indicia left clear for the address and
  barcode, and on the left half the message, the times (or the standing Sunday times), the web
  address and a 1.15 in QR. Geometry is in `EDDM` and pinned by the tests. The tool tells the pastor
  to confirm the size and the indicia with the post office or printer before printing.
- **Invite a friend** (`inviteContent()`): "You're invited", this Sunday's times from `dayPlan()`,
  the address, the web address, a QR to Plan your visit and an optional "Invited by" name (on the
  card, a line to write it on when none is typed). Personal invitation is the strongest driver
  (Lifeway: 51% against 23% for a postcard).
- **The connect card's QR:** `welcomeContent()` points the QR at Church facts' `connectCardUrl` with
  `qrLabel` "Scan to fill this in online" when it is set, else Plan your visit with "Scan to plan
  your visit". The shared templates read `qrLabel` through `qrLabelFor()`; the looks read it for
  their own connect card layouts.
- **Caption and alt text:** `captionFor(content, church, kind)` writes a ready-to-post caption from
  the drawn words (headline, When, Where with the street address, the link, an invitation line);
  `altTextFor()` reads the graphic's words in one or two sentences. Both strip notes, dashes and
  emoji, and use no hashtags. The tool shows each in a box with a Copy button.

## Carousel, series art and the short video (2026-10-28)

From the research report's next steps (carousels and short video are where feed attention has moved).

- **Carousel** (`carousel.ts`, offered for event, sermon, New here and Sunday: `CAROUSEL_KINDS`):
  3 to 5 tall posts (1080 x 1350) built from the same words by `carouselFrames()`: a cover (kicker,
  title, photo), what and when (the date and times, or the passage and preacher; left out when there
  is none), where (the street as the title, the town, and the body or a "what to expect" line), every
  Sunday (the standing times, for an event or a sermon) and a closing invitation (the web address is
  in the look's foot). Each frame is drawn by the look's own `render()` at `CAROUSEL_FORMAT`, whose
  bottom safe inset is deeper (124px) so `numberFrame()` can set "2 / 4" small in that strip: the
  number in auburn, the rest quieter, on paper (Light) or the navy band (Bold, `GROUNDS` in
  `directions/index.ts`). Files are `carousel-01-<title>.png` so they sort in posting order; the tool
  saves them one at a time, in order. In the tool it is a "Carousel" tick at the top of the Facebook
  and Instagram sizes; the frames show in a swipeable strip under the other previews.
- **Sermon series art** (`SERIES_ART` in `formats.ts`, `onlyFor: ['sermon']`): a 1920 x 1080 title
  slide (group `screen`, so the slide's type floor applies), a 1080 x 1080 square and a 3000 x 3000
  podcast cover (Apple Podcasts' size), listed together as "Sermon series art". The shared wrapper
  draws them with the look's render and the words from `seriesArtContent()`: the title, the series
  name or "Sermon series", the book or passage, the preacher on the slide only, the church's name;
  no QR, no sermon link, no standing times, no stock art. The tool tells the pastor to upload the
  podcast cover as Sermons page > Podcast > Podcast picture.
- **Short video** (`video.ts`, recorder `recordStoryVideo()` in `raster.ts`): "Make a short video"
  under the Story preview records a 7 second 1080 x 1920 video in the browser, no dependency. The
  Story SVG is drawn once to a canvas, then each frame copies it over the paper color with
  `videoFrameAt(t)`: a 1.2s ease-in-out fade up and a 3.4s ease-out settle from 3.5% larger, then a
  hold. `canvas.captureStream(30)` feeds `MediaRecorder` (8 Mbps), recording in real time, so the
  tab must stay in front for the 7 seconds. `pickVideoType()` takes the first of `VIDEO_TYPES` the
  browser records: H.264 MP4 (Chrome 126+, Safari), else WebM, and the tool then says Facebook may
  want MP4. Checked 2026-10-28 in the kit harness (Playwright Chromium): an MP4 came out, 1080 x
  1920, `duration` 7.01s, and played. The tool shows the video, downloads it as
  `story-video-<title>.mp4`, and drops it when the Story graphic changes.

## Adding things

- **A size:** one row in `FORMATS`. Pick its `shape` (tall, portrait, square, landscape, banner);
  every direction already lays out each shape.
- **A kind:** add it to `Kind` in `types.ts`, a sample in `samples.ts`, a builder in `content.ts`,
  its link label and invitation line in `captionFor()`, its blocks in each direction (or a shared
  template routed in `directions/index.ts`), and a tile and default sizes in `GraphicsTool.tsx`.
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
