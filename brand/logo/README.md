# Logo masters (candidate direction, 2026-10-21)

Drawn by `npm run logo` (`scripts/brand-logo.mjs`); edit the numbers there, not these files.
The mark is the church's brick, seven horizontal courses stepping in and out at the sides,
with the cross cut out of them as white space. Every edge of the cut leans a degree or two,
as if cut by hand. Colours are auburn (the colour the church is named after): brick
`#9A3B2A`, dark `#7E2E20`, light `#B5503A`; ink `#16263D`.

| File                             | Use                                                              |
| -------------------------------- | ---------------------------------------------------------------- |
| `mark.svg`                       | The mark on white or a light ground, 40 px and up                |
| `mark-mono.svg`                  | One colour (ink): print, embroidery, stamps, fax-grade copies    |
| `mark-reversed.svg`              | On the dark ground (paints its own `#0F2238` ground)             |
| `favicon.svg`                    | Five courses and a wider cut, for 16 to 32 px tabs and app icons |
| `lockup-horizontal.svg`          | Mark left, name right: site header, sign panel, letterhead       |
| `lockup-horizontal-reversed.svg` | The same on the dark ground                                      |
| `lockup-stacked.svg`             | Mark above the name: social avatar, print, the closing band      |

The wordmark is Young Serif converted to paths, so nothing here needs a font installed.
Below about 24 px use `favicon.svg`; below 16 px the brick turns to noise and a solid
cross is the honest fallback (not drawn yet).

Status: the shipped logo (wired in 2026-10-21). The site copies are `src/assets/logo-light.svg`
(`lockup-horizontal`), `logo-dark.svg` (`lockup-horizontal-reversed`), `src/assets/brand/fbc-auburn-icon-full-color.svg`
(`mark` in a square view box), `public/favicon.svg` and `public/studio-banner/mark.svg`; re-copy them after
running `npm run logo`, then `npm run favicon` and `npm run og`.
