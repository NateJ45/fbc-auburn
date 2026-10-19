# Site Guide design note (2026-10-18, starter card 128)

The goal: a Site Guide page should read like a page from Auburn's own website that happens to teach the Studio, not
like a generic app screen. Today it is small grey text in a narrow column with a generic info icon and mint boxes.

The language borrows the public site's devices, by name, through `brand.config.json` `studio.look`:

- **Banner**: the Home banner's navy (the navbar's chrome colour), the stone path along its foot, the title in Auburn
  Stone lettering (white, sky, gold, as on the Home banner), the guide's own stone icon on a paper disc, and the
  "You can do this yourself" stone tag.
- **Section rule**: the `.hb-label` device, three gold steps and a hairline, above every heading. Headings in Young
  Serif in deep sky, as `BoardPageHead` and the inner pages set them.
- **Steps**: the `.hb-walk` numbered stones (hand-laid shapes in the mark's colours) joined by gold dashes, running
  down the page. The dashes lay themselves in as the steps scroll into view (Auburn's motion verb is "lay"); with
  reduced motion they are simply there.
- **Callouts**: sky for a note, gold for a tip, brick for "careful", each with a stone marker and a Young Serif title.
- **Button names**: small faithful copies of the real Studio buttons (green Publish, navy tool tabs).
- **Text**: Familjen Grotesk at 17px in dark ink, 1.65 line height, in a 760px column.

Three mockups of one guide ("Change the words on a page"), shots in `shots/` at 1280 and 375:

- **A, the board page**: navy banner, one generous column, vertical stone path. **Picked.**
- **B, the handbook with a rail**: A's body with a sticky "On this page" rail on wide screens and a textured banner.
- **C, the walk**: a paper head with the mosaic title (no navy) and the steps across the page like `.hb-walk`.

Why A: it is the only one that matches the Home banner the editor sees first, so Home and the guides feel like one
place. Its vertical path keeps long steps readable on a phone and in the narrow "Help for this page" panel, where C's
across-the-page walk cramps a sentence into a 120px column, and B's rail only earns its space on the two or three
longest guides. C's horizontal walk is kept as the StepPath's `horizontal` mode for short, few-word steps.
