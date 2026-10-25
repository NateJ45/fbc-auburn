# Typography and spacing

> Font families, typographic micro-rules, fluid spacing tokens, and the Tailwind v4 collision trap.

## Auburn's one scale (read this first)

Since 2026-10-24 every size, corner and gap in the brand layer, the board, the church blocks, the
collections, the motion styles and the components' own `<style>` blocks comes from one set of tokens
at the top of `src/styles/auburn.css` (`:root`). A value that is not on the scale is a bug; add a
token before adding a one-off.

- Text: `--fs-tag` 13px, `--fs-small` 15px, `--fs-body` 18px, `--fs-lead` 19 to 21px, `--fs-button` 17px. Tailwind's `text-xs`, `text-sm` and `text-base` are pointed at the first three, so a utility and a stylesheet agree.
- Headings: `--text-h1` / `--text-h2` from the theme, then `--fs-h3` (24 to 32px), `--fs-title` (24px, a card title), `--fs-title-sm` (20px, a row title or an accordion question), `--fs-numeral` (28 to 36px, times and dates). Leading: H1/H2 1.1, H3/H4 1.2, reading text 1.6 (zero-specificity `:where()` rules, so a display heading with its own keeps it).
- Corners: `--radius-control` 10px (buttons, fields, tabs), `--radius-card` 20px (cards, panels, players, photos that stand alone), `--radius-inner` 14px (a picture inside a card or a list row), `--radius-tag` 4px, `--radius-pill`. `--radius-md` is pointed at the control radius for the shared components.
- Space: `--pad-card` (20 to 28px), `--pad-panel` (24 to 40px), `--gap-grid` (16 to 24px, boxed cards), `--gap-open-row` / `--gap-open-col` (items with no box), `--gap-heading` (a section heading to its content). Bands keep `py-section-lg`; Home's bands use `--hb-rhythm` (`--spacing-section-md`) above every section and below any tinted one.
- Focus: one ring, 3px of `--ring`, offset 3px (white on the Home hero photo). Embedded frames and the FAQ questions use it too.
- Tap targets: every standalone link is at least 44px to tap on a phone; small ones get the invisible hit area (`.hit-44`, or the same `::after` in `auburn.css` for the sermon links, the header logo and Get directions). Check with `scripts/measure-tap-targets.mjs`.
- Three-across grids (the Give page, the Giving board, three-card grids) start at 64rem; two-across from 48rem.
- Shadows: `--shadow-card` (a card on the page), `--shadow-raised` (a panel over another layer: the This Sunday card, the welcome note), `--shadow-button` (a round play button on a photo). Soft and navy-tinted; there were ten recipes.
- Buttons: `.btn-auburn` with `--primary` (auburn), `--navy` (solid navy, white on `#1F3A5F` 11.5:1) or `--secondary` (navy outline), 48px tall, all at the 10px control radius; the header's is the 44px compact one. The header carries two (2026-10-25, Nathan): Plan your visit in auburn, the site's standing invitation alongside the page body's own one red button, and Give in solid navy with the hand-heart icon; on its own page each turns to the outline. The phone menu puts them side by side under This Sunday, and the footer's name row ends with Give as a light outline (navy would vanish on the ink). Never hand-roll a button from utilities. Pills are for chips and tags only.
- One red button per page (audit 2026-10-25, GD-H2): the filled auburn button is the page's single primary next step. `SectionRenderer` hands the red to the FIRST block that draws a primary button (a page head with a primary button, a steps rail or walk with one, or the closing band, which always draws one) and passes `primaryVariant="navy"` to every later one; `CtaLink` takes `variant="navy"`. Home's hero keeps the red and its walk's button and the phone Sunday bar are navy. Forms keep a red submit (the form is that page's action). The footer's button is the footer's own business (it should not be a second red).
- One eyebrow: `.hb-label` (`SectionLabel`), 13px, weight 600, 0.14em, navy, with the brick marker. `SectionHeading`'s and `ImageText`'s eyebrows draw it; step, stop and role caps (`.rail__n`, `.walk-steps__t`, `.hb-walk__when`, `.c-person__role`) share its size, weight, tracking and colour without the marker. The marker appears nowhere else in the page body (`BoardRule` is whitespace), so a page carries about three.
- One inline action link: Familjen `--fs-action` (16px), weight 600, navy, a 1.5px underline 3px below (`.rail__link`, `.hb-walk__link`, `.fyp-card__more`, the Home board's links).
- Young Serif only from 24px up (headings, card titles, numerals, the where-next rows, the big menu links). Below that it is Familjen: fold-out and FAQ questions 19px weight 600 navy, card meta 15px weight 600 muted navy, the Ministries chips 16px weight 600.
- Headings: page H1s top out at 88px (`.board-head__title`, 52px on a phone), a collection item's (a sermon, a post) at 64px (`.board-head--detail`, `.art-title`). H1s and H2s balance at every width; H3s do not. Every H2 on the ground is navy (`--heading-solid`; `.auburn-h2` on a block's heading, `SectionHeading` and the closing band by default). Home pins `--heading-solid` to navy like its `--link`.
- Brick and connector tokens: `--brick-course` (a 12px course of three auburn bricks, the top edge of a plain navy card: This Sunday, `.cb-deep`); `--step-dash-x` / `--step-dash-y` (the one step connector, 2px light-navy `#7F98B8` dashes, 10px on and 8px off: Home's walk, the steps rail, Plan your visit's walk, the timeline).
- Surfaces: three only, the ground `#FBF8F3`, white cards and fields, and one tinted panel `#E9EEF5` (Home's two card bands, a card with no photo, the Stone look). No brick texture behind text: the cream brick wall, the sky tile and the navy tile behind Home's welcome band and the This Sunday card are retired; brick stays in the mark, the footer sill (one per page), the slab behind a gable photo and the card's top course.
- Long-form pages (`.long-form`, Privacy): a 720px measure, 32px from the head to the body, H2s at 30 to 32px.
- Optical icon sizes: `StoneIcon` writes `data-icon`, and the heavy drawings (dove, crown, praying hands, coffee, map pin) are scaled to 0.86 in `auburn.css`, so a row of icons reads at one weight.

The starter-generic text below predates the reskin (its font names are the starter's).

## Typography

- Headings (h1 through h6): **Libre Baskerville**. Self-hosted via `@fontsource/libre-baskerville`. Editorial serif that reads as premium without narrowing the brand voice to any specific style.
- Body, UI, buttons: **Inter** (variable). Self-hosted via `@fontsource-variable/inter`. Single file covers all weights.
- Script accent (opt-in): no script font is loaded by default. The `@utility font-script` declaration and `--font-script` token exist in `globals.css`, but the font file is only fetched when you add a `@fontsource` import for a script typeface and point `--font-script` at it. See `animation.md` for the full opt-in steps and usage discipline.
- Labels, eyebrows, monospace numerals: `ui-monospace, 'SF Mono', monospace` (system, no file).

Font families are declared in the `@theme` block in `src/styles/globals.css` as `--font-display`, `--font-body`, `--font-mono`, which Tailwind exposes automatically as `font-display`, `font-body`, `font-mono` utility classes.

### Typographic micro-rules

Two utility classes layered on top of the families. Use them instead of ad-hoc arbitrary values so the system stays consistent across components.

- `tracking-eyebrow` (`0.18em`) -- applied to every uppercase eyebrow label above a heading. Token: `--tracking-eyebrow`.
- `leading-headline-tight` (`1.05`) -- applied to hero-scale H1s. Combined with `tracking-[-0.02em]` it gives Libre Baskerville editorial display proportions at the 40px to 80px hero range. Token: `--leading-headline-tight`.

Both are declared in `src/styles/globals.css` via `@utility`. Don't replace with arbitrary values (`leading-[1.05]`, `tracking-[0.18em]`) in new code; use the named utilities so a future scale change is one edit.

---

## Spacing tokens

Fluid spacing is declared in the `@theme` block in `src/styles/globals.css`:

| Token                  | Value                           | Notes                                                |
| ---------------------- | ------------------------------- | ---------------------------------------------------- |
| `--spacing-xs`         | `clamp(0.25rem, 0.5vw, 0.5rem)` | Tightest paddings, icon gaps                         |
| `--spacing-s`          | `clamp(0.5rem, 1vw, 1rem)`      | Small UI gaps                                        |
| `--spacing-m`          | `clamp(1rem, 2vw, 1.5rem)`      | Default content padding                              |
| `--spacing-l`          | `clamp(2rem, 4vw, 3rem)`        | Card padding, larger gaps                            |
| `--spacing-section-md` | `clamp(3rem, 6vw, 5rem)`        | Section-internal padding                             |
| `--spacing-section-lg` | `clamp(4rem, 8vw, 7rem)`        | Section block padding (top/bottom of major sections) |

Utility classes follow the standard Tailwind pattern: `p-l`, `py-section-lg`, `gap-m`, `mt-section-md`, `space-y-section-lg`, and so on.

### Tailwind v4 collision trap (don't recreate)

In Tailwind v4, `max-w-{key}` resolves to `--spacing-{key}` BEFORE `--container-{key}` when both exist for the same key. Naming a fluid spacing token `--spacing-xl` or `--spacing-2xl` would silently break `max-w-xl` / `max-w-2xl` sitewide (they would inherit the fluid clamp instead of the container width). The two largest section-padding tokens use the `--spacing-section-*` prefix specifically to avoid this collision.

**Rule for adding new spacing tokens:** the key must NOT match any Tailwind built-in container size: `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`. Use `--spacing-section-*` or another distinct prefix.

If you ever suspect this regressed, the diagnostic is: open the page in the dev server and inspect the compiled CSS for a `.max-w-2xl` rule. It MUST read `max-width: var(--container-2xl)`. If it reads `var(--spacing-2xl)`, a colliding token has been re-introduced somewhere in the cascade.

---

## Color tokens

See `theme-and-color.md` for the full palette reference, the `--tint-rgb` token, and the light/dark discipline. A short summary of what to use in component code:

- Body text and headings: `text-foreground`
- Page and card surfaces: `bg-background`, `bg-card`, `bg-muted`
- Brand action color: `bg-primary`, `text-primary-foreground`
- Tinted overlays (polish layer): `rgba(var(--tint-rgb), <opacity>)`
- Borders: `border-border`

Never hardcode hex values in component markup. All palette and semantic tokens are in `globals.css`; change the token, not every usage site.
