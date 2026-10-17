// Safe to edit by hand
// The brand colours and display font for the generated share images (og-default.png and the
// per-page cards). scripts/lib/render-og.mjs is PORTABLE, so a fork's brand goes in through its
// `theme` option from here, never edited into render-og's DEFAULTS (that reports DRIFT in
// sync-check). `npm run apply-brand` rewrites the values below from brand/brand.config.json by
// regex: keep the two-space indent and single quotes, or a rebrand fails on this file.
export const OG_THEME = {
  bg: '#FFFFFF', // --background (light)
  primary: '#235E93', // --color-primary
  primaryDark: '#1B4A75', // --color-primary-dark
  accent: '#171A26', // --color-accent
  taupe: '#2C5B3A', // --color-secondary
  fontDisplay: 'Young Serif, Georgia, serif',
};
