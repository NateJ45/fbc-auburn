---
name: First Baptist Church of Auburn
description: A warm, steady church site built from the stone-mosaic brand, with one stone moment per page and one colour everywhere else.
colors:
  green: '#2C5B3A'
  deep-sky: '#235E93'
  water: '#3B83AA'
  red: '#C4401F'
  gold: '#E8A93A'
  sky: '#96C3EA'
  ink: '#171A26'
  white: '#FFFFFF'
  ground: '#FFFFFF'
  ground-soft: '#F3F6F9'
  ink-muted: '#4A4F5E'
  dark-ground: '#171A26'
  dark-ground-raised: '#20283A'
  dark-text: '#F3F6F9'
  dark-muted: '#B4B8C4'
  dark-red: '#E5735A'
  dark-green: '#8FC7A0'
typography:
  stone:
    fontFamily: "'Auburn Stone', 'Young Serif', serif"
    fontSize: 'clamp(2.5rem, 1.2rem + 5vw, 5.5rem)'
    lineHeight: 1.02
  display:
    fontFamily: "'Young Serif', Georgia, serif"
    fontWeight: 400
  body:
    fontFamily: "'Familjen Grotesk', system-ui, sans-serif"
    fontSize: '1.125rem'
    lineHeight: 1.6
rounded:
  md: '10px'
---

## Overview

Status 2026-10-17: direction picked, A blended with B and C (`docs/design-directions/2026-10-17-fbc-auburn/`,
`## Decision`). Archetype: image-led, but airy and white, with the stone art carrying the page until
the photo session. Home opens with the masthead ("First Baptist Church of" over a huge colour
mosaic "Auburn") beside an arched photo; inner pages lead with a big stone icon and a mosaic H1
beside an arched photo. Density airy. Imagery: arched photos (`ArchHero.astro`, the
text-and-picture band); with no photo yet the arch holds the stone mark or a soft sky fill, never
a grey box. In the code: `src/styles/auburn.css` (the brand layer), `StoneHeading.astro`,
`ArchHero.astro`; the three stepping stones are the section divider.

North star: a small church that looks like itself. The stone mark is the most distinctive thing
the church owns, so the site is a calm, mostly one-colour frame for it. Clear Sunday facts first,
generous white space, honest about size. Must not look like the First Baptist Church Muncie site
(cream paper and ink, titling caps, indigo and gold bands).

## Colors

- Seven brand colours, each with a role. **Deep sky** is the everyday one colour (links, buttons,
  H2s, the avatar ground). **Green** is the second structural colour. **Red** is reserved for the
  cross and at most one call to action per page. **Gold** and **sky** are accents only (stepping
  stones, highlights, fills behind ink text), never text on white. **Water** is text on white only
  at 24 px and up. **Ink** is body text.
- Ground is white with a cool soft tint (`ground-soft`) for alternating sections; no cream.
- Measured contrast on white: ink 17.3, green 7.9, deep sky 6.8, red 5.1, water 4.2 (large only),
  gold 2.1 and sky 1.9 (never text). White text on deep sky 6.8, on green 7.9, on red 5.1. Ink on
  gold 8.4 and on sky 9.3.
- Light only (decided 2026-10-17): the site has no dark mode. The `dark-*` values above are kept as
  the palette for a dark band or a printed piece on ink, not a site theme.

## Typography

- **Young Serif** for display and H3 and below where a serif heading is wanted; one weight (400).
- **Familjen Grotesk** for body, UI, labels and the tracked caps of the place line ("FIRST BAPTIST
  CHURCH OF").
- **Auburn Stone** for stone headings only, 40 px and up: the page H1 in mosaic (letters cycle
  green, deep sky, red, water; gold left out on light) or an H2 in one colour. Real text, so it
  wraps and is searchable; falls back to Young Serif with identical metrics.
- Body 18 px minimum, line length 60 to 72 characters.

## Elevation

Flat. Sections separate by ground tint and space, not shadows. One soft shadow at most for a
floating element (a sticky "Plan your visit" bar on mobile).

## Components

- Logo: horizontal lockup in the header (small mark under 48 px), Auburn-led lockup where the place
  name should lead (footer, a sign-like hero).
- Stone icons for the Sunday facts and the main entry points (clock, map pin, coffee, Bible,
  praying hands, giving hand); one size per page, never mixed with line icons.
- Buttons: one family, 10 px radius, deep sky solid and deep sky outline; red only for the single
  most important action on a page.
- Sunday block: times, address, parking and "what to expect" in one component, reused on Home and
  Plan Your Visit.

## Do's and Don'ts

- Do keep one stone moment per page: the mosaic H1 or the full-colour mark, not both large.
- Do make every layout work with no photographs, and better with one.
- Do mark unconfirmed facts (service times, the verse) until the church confirms them.
- Don't put mosaic colour on H2s, borders, dividers or backgrounds.
- Don't set Auburn Stone below 40 px.
- Don't use gold or sky as text on white.
- Don't use stock photography, crowd shots or anything that makes the church look bigger than it is.
- Don't reuse the Muncie site's paper-and-ink ground, titling masthead or indigo bands.
