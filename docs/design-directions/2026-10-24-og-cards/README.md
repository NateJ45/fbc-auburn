# Share-card directions (2026-10-24)

The brick letters came off the share cards on 2026-10-24, which left them plain. These are five
looks for the 1200x630 Open Graph card, each drawn for Home, Ministries, Plan your visit and a
sermon series. `node docs/design-directions/2026-10-24-og-cards/render.mjs` redraws them (mockups
only; the live cards are still `scripts/lib/og-card.mjs`). `sheet-<direction>.png` shows each set.

| Direction  | What it is                                                                                 | Rejects                          |
| ---------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| `sketch`   | Paper ground, the building sketch in pale navy bleeding off the right, a thin auburn foot. | Pattern and colour blocks        |
| `night`    | The navy stone-tile ground of the site's dark bands, cream title, a two-course brick sill. | White cards lost in a white feed |
| `icon`     | White card, the page's own brick icon large on a soft paper tile (the page head's icon).   | One picture on every card        |
| `arch`     | The arched hero as a card: an auburn arch with the mark and the building drawn in cream.   | Full-bleed grounds               |
| `bulletin` | A printed order of service: centred, a fine double rule, the mark on top.                  | Pictures of any kind             |

## Decision

2026-10-24: Nathan picked **`night`**. Built into `scripts/lib/og-card.mjs` the same day and every
card regenerated. Carry forward: the kicker is the page head's eyebrow (Studio pages' opening banner
eyebrow, singletons' `heroEyebrow`, posts' date), read in `scripts/generate-og-pages.mjs`; Home sets
the church's full name with the tagline under it. The other four are kept here as pictures only.
