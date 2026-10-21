# Logo masters (candidate direction, 2026-10-21)

Drawn by `npm run logo` (`scripts/brand-logo.mjs`); edit the numbers there, not these files.
The mark is the church's brick, seven horizontal courses stepping in and out at the sides,
with the cross cut out of them as white space. Every edge of the cut leans a degree or two,
as if cut by hand. Colours are auburn (the colour the church is named after): brick
`#9A3B2A`, dark `#7E2E20`, light `#B5503A`; ink `#171A26`.

| File                             | Use                                                              |
| -------------------------------- | ---------------------------------------------------------------- |
| `mark.svg`                       | The mark on white or a light ground, 40 px and up                |
| `mark-mono.svg`                  | One colour (ink): print, embroidery, stamps, fax-grade copies    |
| `mark-reversed.svg`              | On the dark ground (paints its own `#171A26` ground)             |
| `favicon.svg`                    | Five courses and a wider cut, for 16 to 32 px tabs and app icons |
| `lockup-horizontal.svg`          | Mark left, name right: site header, sign panel, letterhead       |
| `lockup-horizontal-reversed.svg` | The same on the dark ground                                      |
| `lockup-stacked.svg`             | Mark above the name: social avatar, print, the closing band      |

The wordmark is Young Serif converted to paths, so nothing here needs a font installed.
Below about 24 px use `favicon.svg`; below 16 px the brick turns to noise and a solid
cross is the honest fallback (not drawn yet).

Status: a candidate, not the shipped logo. The site still uses `src/assets/logo-*.svg` and
`public/favicon.svg`. Wiring it in is a decision for the design sign-off.
