// Safe to edit by hand
// The graphics maker's files, inlined as data: URIs for the browser (Vite `?inline`), so an
// SVG drawn to a canvas carries everything it needs and the canvas is never tainted. Imported
// only by browser code (the Studio tool, the styleguide wall); node tests pass stand-ins.
// docs/agent/graphics.md.

import serif from '../../assets/fonts/young-serif-latin-400.woff2?inline';
import sans from '../../assets/fonts/familjen-grotesk-latin-wght.woff2?inline';
import markWhite from '../../assets/brand/fbc-auburn-icon-white.svg?inline';
import markColor from '../../assets/brand/fbc-auburn-icon-full-color.svg?inline';
import tileNavy from '../../assets/textures/tile-navy.svg?inline';
import tileWall from '../../assets/textures/tile-wall.svg?inline';
import sketch from '../../assets/brand/building-sketch-lines.webp?inline';
import type { Assets } from './types.ts';

export const ASSETS: Assets = { serif, sans, markWhite, markColor, tileNavy, tileWall, sketch };
