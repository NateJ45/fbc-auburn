# Illustrations

## The building sketch (2026-10-23)

`building-sketch.jpg` is a pen-and-pencil rendering of the church in the manner of a 1950s architect's
presentation drawing: a three-quarter view from the parking lot, the brick walls in hatched courses,
the white portico with its lettering, the ramp, the steeple, the road sign and the plain roadside
cross. It was drawn in Gemini from the church's own photos and picked from four versions.

The site does not show this file. `node scripts/brand-sketch.mjs` lifts its lines off the paper
into `src/assets/brand/building-sketch.webp` (transparency only, about 47 KB), and
`src/components/church/BuildingSketch.astro` paints it in whatever ink the place needs. It appears in
three places:

- **About, "Our building":** the Image and text block with the picture set to "The building drawing
  (a wide band)", full width on a brick sill.
- **The footer:** faint and pale on the right, standing on the brick "Auburn".
- **Plan your visit:** the opener of the walk, with the front door pinned as the place to start
  (the pin's position is `DOOR` in the component; move it if the drawing is replaced).

## The church line drawing

`church.svg` is an earlier flat vector trace of a Gemini line drawing, not used on the site. Its door
frames carry two thin red slivers to clean up by hand.
