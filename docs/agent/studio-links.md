# Studio links: short links, QR codes and paste-and-go embeds (2026-10-26)

This site's own additions to the Studio kit. They are kept here rather than in `studio-kit.md`,
because that file is a PORTABLE copy from the starter.

Since starter card 171 the short-link and QR logic is PORTABLE too: `src/lib/short-links.ts`,
`src/lib/qr.ts` (and their tests), `src/sanity/actions/qrCode.tsx` and
`src/sanity/components/ShortLinkAddressInput.tsx` are byte-identical copies of the starter's, so
edit them there. The schema, the guides, the Quick update tile and the `astro.config.mjs` wiring
(which passes `CHURCH_TIME_ZONE` to `todayIn`) stay this site's own.

| Feature            | Files                                                                                                                                                   | How the pastor reaches it                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Short links        | `src/sanity/schemaTypes/shortLink.ts`, `src/sanity/components/ShortLinkAddressInput.tsx`, `src/lib/short-links.ts`, `astro.config.mjs` (`shortLinks()`) | Quick update tile "Make a short link" (opens a new short link), or Pages > Short links      |
| QR codes           | `src/sanity/actions/qrCode.tsx`, `src/lib/qr.ts`                                                                                                        | "QR code" in the Publish menu of every short link and every document with a page of its own |
| Paste-and-go embed | `src/sanity/components/EmbedPasteInput.tsx`, `src/lib/embed-providers.ts`, `src/components/sections/EmbedSection.astro`, `scripts/build-embed-csp.mjs`  | The paste box at the top of a Custom code or embed block                                    |

- **Short links**: `/vbs`-style addresses to a page (a reference, so it follows a rename) or
  another website. "For now" is a 302 (the default), "For good" a 301, with an optional last day.
  The build writes `/x` and `/x/` at the top of `dist/client/_redirects` and skips clashes, which
  the Studio flags first. Full rules: `docs/agent/seo.md`, "Short links".
- **QR codes**: SVG and PNG. A short link's code holds the short address and a page's code holds
  its full address on `site.url`. The library is `qrcode-generator` (MIT, no dependencies),
  imported lazily by the action only. Detail: `docs/agent/seo.md`, "QR codes".
- **Paste-and-go**: a registry of fifteen services sets the frame, the shape and the on-page
  switch. Script code from an unknown service never runs on the page. A known service's script
  origins join the policy only on builds that use it. Detail: `docs/agent/custom-code.md`,
  "Paste-and-go and the provider registry".
- **Guides**: `src/sanity/guides/links.ts` ("Make a short link like /vbs", "Make a QR code for a
  bulletin"), plus the paste box in "Add a widget from an AI or a website" (`content.ts`).
- **Tests**: `src/lib/short-links.test.ts`, `src/lib/qr.test.ts`, `src/lib/embed-providers.test.ts`,
  `scripts/lib/embed-csp.test.mjs`, `tests/embed-guard.spec.ts`.
