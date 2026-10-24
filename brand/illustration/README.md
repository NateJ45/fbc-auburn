# Illustrations

## The building sketch (redrawn 2026-10-24)

`building-sketch.jpg` is a pen-and-pencil rendering of the church in the manner of a 1950s architect's
presentation drawing: a three-quarter view from the parking lot, the long brick side with its four
tall windows and white base, the white portico with its steps and the long ramp to the right, the
steeple on the front gable, shrubs at its foot and trees behind. It is the building only: no road,
sign or cross. Drawn in Gemini from the street and aerial photos of 4241 Hamilton-Scipio Rd (kept in
the studio's records, not this repo), with the first sketch as the style reference; Nathan chose to
leave out the road and sign because Gemini kept placing the sign wrongly. The first sketch
(2026-10-23) had the sign and cross on the wrong side and five narrow windows; it is in git history.

The site does not show this file. `node scripts/brand-sketch.mjs` lifts its lines off the paper
into two files, `src/assets/brand/building-sketch-lines.webp` (the solid pen lines) and
`building-sketch-shade.webp` (the lighter pencil shading), transparency only, about 47 KB together.
`src/components/church/BuildingSketch.astro` paints them in whatever ink the place needs; split
that way, the drawing draws itself in as it scrolls into view, lines first (2026-10-24; not in the
footer). It appears in
three places:

- **About, "Our building":** the Image and text block with the picture set to "The building drawing
  (a wide band)", full width on a brick sill.
- **The footer:** faint and pale on the right, standing on the brick "Auburn".
- **Plan your visit:** the opener of the walk, with the front door pinned as the place to start
  (the pin's position is `DOOR` in the component; move it if the drawing is replaced).

## The church line drawing

`church.svg` is an earlier flat vector trace of a Gemini line drawing, not used on the site. Its door
frames carry two thin red slivers to clean up by hand.
