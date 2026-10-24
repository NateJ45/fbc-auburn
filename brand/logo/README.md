# Logo masters (the linocut print, 2026-10-23)

The mark is a block print of the church's brick: a wall with a plain cross cut out of it, enclosed
in brick on every side. It was drawn as a linocut (Gemini, 2026-10-23) and traced as cut, so it
keeps the leaning bricks, the white scratches and flecks, and the darker squeezed rim on each
brick. Ink is the deep brick `#8A3526` with its rim `#5A1F15`; text ink is `#16263D`.

The two masters are artwork. Edit them by hand or in Figma, never by reshaping them in code, then
run `npm run logo` (`scripts/brand-logo.mjs`) to rebuild everything else:

| Master                      | What it is                                                    |
| --------------------------- | ------------------------------------------------------------- |
| `mark.svg`                  | The full print, 40 px and up (about 900 KB of grain)          |
| `mark-small.svg`            | The same outline with the flecks dropped, for 64 px and under |
| `source/cross-shape.svg`    | The exact shape of the cut cross (used by the red alternate)  |
| `source/gemini-linocut.png` | The print the trace was made from                             |

Built by `npm run logo`:

| File                                           | Use                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `mark-mono.svg`, `mark-small-mono.svg`         | One colour (ink): print, photocopies, stamps, embroidery (small cut) |
| `mark-reversed.svg`, `mark-small-reversed.svg` | On a paper plate, for dark grounds                                   |
| `favicon.svg`                                  | The small cut on an opaque plate, square: tabs and app icons         |
| `lockup-horizontal.svg`                        | Small cut + name: the site header                                    |
| `lockup-horizontal-print.svg`                  | Full print + name: letterhead, signs, print                          |
| `lockup-horizontal-reversed.svg`               | On the dark ground                                                   |
| `lockup-stacked.svg`                           | Full print above the name: social, print                             |
| `seal.svg`, `seal-small.svg`                   | The print in a navy ring, words on the arc (small cut under 160 px)  |
| `alternates/roadside-red/`                     | The cross filled in the roadside red (see below)                     |

**Size rule.** Use the full print at about 64 px and up and the small cut below that: at small
sizes the flecks only blur the mortar. Embroidery, laser cutting and fax-grade copies take the
small cut in one colour.

**The roadside-red alternate.** `alternates/roadside-red/` fills the cut cross in `#D9262E`, the
plain red of the cross by the road, behind the ink so the hand-cut edge stays. It is an option kept
ready in case the church prefers it, not the shipped mark. Large uses only: red on brick loses the
cross below about 48 px, so even with the red the favicon, header and avatar keep the white cross.

**Site copies** (also written by `npm run logo`): `src/assets/logo-light.svg` and `logo-dark.svg`
(the horizontal lockups), `src/assets/brand/fbc-auburn-icon-full-color.svg` (small cut, square, for
the header, OG cards and the Studio), `src/assets/brand/fbc-auburn-icon-white.svg` (small cut on its
plate, for the ink footer), `src/assets/brand/mark-print.png` (the full print as a raster for the
large slots: the Home hero, the arch page head and the closing band, served as WebP),
`public/favicon.svg` and `public/studio-banner/mark.svg`. After `npm run logo`, run
`npm run favicon -- --force-maskable`, `npm run og` and `npm run og:pages`, then restore
`public/site.webmanifest` (the favicon script rewrites it; `git checkout` it). `npm run logo` also
prints the crop for the Studio wordmark (`src/sanity/studioEdges.config.ts`) when the lockup moves.

The words are Young Serif converted to paths, so nothing here needs a font installed.

The church drawing that goes with the set is in `brand/illustration/church.svg` (traced from a
Gemini line drawing; not yet used on the site; the door frames carry two thin red slivers to clean
up by hand).
