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
  where** as a red serif line; a sentence or two; and **one action**, which makes the whole card the link (2026-10-25):
  the card's own link, else "Ask about <title>" to `/contact/?topic=question&about=<title>` (the shared contact
  convention). An own link that is the bare contact page gets the same topic and name.
- **Card anchors** (2026-10-25). Every card has an id, `fyp-<title>` (`/ministries/#fyp-sunday-school`), from `fypIds`
  in `src/lib/gatherings.ts`: one id space with the groups, a repeat numbered. The Events page's "Every week" list
  links each gathering to its card by name through the same function, so the two never drift.
- **Phones** (under 640px, 2026-10-25, UX-H3 and GD-M6). Cards become compact rows: a 96px picture on the left (the
  stone icon, also where the big frame holds a Photo needed request, which would not read at 96px), the words on the
  right, the description cut to one line with a "More" button that opens it in place (shown only when the line really
  is cut; without JavaScript nothing is cut). A card with a real photo keeps it full width. Ministries at 375 went
  from 14,168px to about 7,900px with the 2026-10-25 content (the hub itself to about 4,350px; the footer is 1,850px).
- **Times are never typed.** "When" is a day ("Wednesdays"). `dayWithTimes` (`src/lib/church-facts.ts`) adds that day's
  times from Church facts, narrowed to the gathering named after the card when there is one: on a Sunday with Sunday
  School at 9:45 and Worship at 11:00, "Sunday School" gets 9:45 and "Kids" gets both. Home's bands use the same helper.
- **A card in two groups** is simply in both (Duplicate in the Studio), but a card that suits everyone belongs once
  in an "Every age" group instead (Sunday School, 2026-10-25); a repeated title links to the first one.
- **Photos before launch.** Cards are keyed in `src/data/shot-list.ts` by title (`/ministries/|Kids`), so an empty or
  stand-in photo shows its Photo needed example.

The Ministries content was moved onto the block by `scripts/content/ministries-find-your-place.mjs` (dry by default,
backs the page up first, carries every card's words over, and writes the "after" page for a look). The page head reads
"Find your place" and the closing band names Pastor Jacob. `scripts/content/audit-collections.mjs` (2026-10-25) moved
Sunday School and Fellowship into "Every age", turned the Giving section into one Serve card that links to /give/,
swapped the page picture from the ABC blocks to the open door, and set American spelling.

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

## Wayfinding (the rest of the hppres.org audit, 2026-10-24)

- **Where next** (`src/components/WhereNext.astro`, at the top of the footer): three full-width Young Serif rows with
  long hairline arrows (Plan your visit, Ministries, Sermons, then About and Give as spares; the menu's own names). The
  page you are on drops out. Hover or focus sweeps brick red in from the left. Since 2026-10-25 a page that ends on its
  own closing band (`FinalCta.astro`, `data-final-cta`) does not get them: one closing device per page.
- **Two-tone page titles**: the page head's "Accent word in the heading" (`headingAccent`, now on `heroSection` too, in
  `HEADING_ACCENT_FIELDS`). StoneHeading draws those letters all auburn and the rest all navy instead of the
  every-fourth-letter rhythm; a plain title takes the auburn colour. Ministries uses "your place", Plan your visit
  "your visit".
- **The Sunday times band** (`src/components/church/TimesBand.astro`): the page head's "Show the Sunday times band" box
  (`heroSection.showTimes`). A pale panel across the bottom of an inner page head, from 30% in out to the window edge:
  "Sundays at Auburn", each Sunday gathering (time big, what it is in small caps), the address and Directions, all from
  Church facts, with the To confirm tag while unconfirmed. Under 64rem it is one bar that opens the map.
- **Fold-out questions** (`accordionSection`, `src/styles/church-blocks.css`): hairline rows, the question in Young
  Serif, a thin circled plus that fills red and turns to a minus when open, the answer in the right-hand column on a wide
  screen. Plan your visit's "Good to know" uses it.
- **A letter** (`letterSection`, `src/components/sections/LetterSection.astro`): greeting, the letter, sign-off,
  signature picture or the name in Young Serif, role, optional button, on a sheet of warm paper with a brick-red top
  edge and a slight turn (none with reduced motion). Leadership carries Pastor Jacob's.
- **Last Sunday** (`WatchSection.astro`): the band's label ("Last Sunday" or "Latest message") huge in outline behind
  it, half off its bottom edge, and the stepped corner on its media. Use the outline word no more than twice on the site.
- **The phone menu** (`src/components/MobileNav.astro`, a native `<dialog>` since 2026-10-25; styles in
  `src/styles/auburn.css`): a full-screen sheet of big Young Serif rows with long arrows. A menu group (Site settings >
  Menus) shows its name as a small red label with its pages as rows beneath, always open. The menu is three groups
  (`scripts/content/audit-chrome.mjs`, 2026-10-25): New here (Plan your visit, About, What we believe, Leadership,
  Contact), Get involved (Ministries, Next steps, News and notes), This week (Sermons, Events, Bulletin, Prayer
  requests, Give). The footer's page list uses the same groups and names.
- The content moved by `scripts/content/hppres-wayfinding.mjs` (dry by default): Plan your visit's band, accent, the
  three question headings ("What about my kids?", "Where do I park?", "How will I find it?", which are also the shot
  list keys) and Good to know; Ministries' accent; the Leadership letter; Watch's "what is not streamed" ask.
