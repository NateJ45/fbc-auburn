// Safe to edit by hand
// Gives the mosaic icons the linocut finish of the brick (2026-10-23): rugged, lived-in tiles.
//
//   brand/icons/stone-icon-*.svg        the masters (the tiles as drawn; edit these, not the output)
//   src/assets/brand/stone-icon-*.svg   the site's copies, written by this script
//
// Each copy wraps the master's tiles in:
//   - a filter that chips every edge (fine fractal noise displacing the outline), darkens a thin
//     rim inside each tile in the tile's own colour (the ink squeezed to the edge of a print), and
//     sprinkles a dark grain over the faces;
//   - a mask of the bricks' white flecks and scratches (scripts/lib/brick-print.mjs printMask),
//     punched through, so the card behind shows like paper.
// Sizes are fractions of the icon's own box, so a 768-unit Bible and a 209-unit calendar wear
// the same finish. Deterministic: the same master always gives the same file.
// Run: node scripts/print-icons.mjs   (--check exits 1 if a committed copy is stale)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printMask } from './lib/brick-print.mjs';
// The path data is written in its shortest exact form (audit DEV-L10, 2026-10-25): about 40 percent
// fewer bytes, not a point moved (scripts/lib/svg-path-compact.mjs and its test).
import { compactSvgPaths } from './lib/svg-path-compact.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'brand/icons');
const outDir = path.join(root, 'src/assets/brand');
const check = process.argv.includes('--check');
const f2 = (n) => (Math.round(n * 100) / 100).toString();

let stale = 0;
for (const name of fs
  .readdirSync(srcDir)
  .filter((f) => /^stone-icon-.*\.svg$/.test(f))
  .sort()) {
  const master = fs.readFileSync(path.join(srcDir, name), 'utf8');
  const m = master.match(
    /^(<svg[^>]*viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"[^>]*>)(<title>[\s\S]*?<\/title>)?([\s\S]*)<\/svg>\s*$/,
  );
  if (!m) throw new Error(`${name}: unexpected markup`);
  const [, open, vx, vy, vw, vh, title = '', body] = m;
  const x = +vx,
    y = +vy,
    w = +vw,
    h = +vh;
  const s = Math.max(w, h) / 100; // one percent of the icon
  const seed = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
  const filter =
    `<filter id="pr" x="${f2(x - 3 * s)}" y="${f2(y - 3 * s)}" width="${f2(w + 6 * s)}" height="${f2(h + 6 * s)}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
    // Chipped edges: a fine noise nudges every outline by up to about 1% of the icon.
    `<feTurbulence type="fractalNoise" baseFrequency="${f2(0.16 / s)}" numOctaves="3" seed="${seed}" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="${f2(2.4 * s)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    // The rim: the outer band of each tile, a little darker in its own colour.
    `<feMorphology in="d" operator="erode" radius="${f2(0.5 * s)}" result="e"/>` +
    `<feComposite in="d" in2="e" operator="out" result="ring"/>` +
    `<feColorMatrix in="ring" type="matrix" values="0.74 0 0 0 0 0 0.74 0 0 0 0 0 0.74 0 0 0 0 0 1 0" result="rim"/>` +
    // Grain: sparse dark specks, only on the tiles.
    `<feTurbulence type="fractalNoise" baseFrequency="${f2(0.9 / s)}" numOctaves="2" seed="${seed + 3}" result="g"/>` +
    `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -30 11.4" result="gm"/>` +
    `<feFlood flood-color="#000" flood-opacity="0.24" result="ink"/>` +
    `<feComposite in="ink" in2="gm" operator="in" result="spk"/>` +
    `<feComposite in="spk" in2="d" operator="in" result="grain"/>` +
    `<feMerge><feMergeNode in="d"/><feMergeNode in="rim"/><feMergeNode in="grain"/></feMerge>` +
    `</filter>`;
  // The flecks, sized to the tiles (about a tenth of the icon).
  const mask = printMask('fl', {
    x: x - 3 * s,
    y: y - 3 * s,
    w: w + 6 * s,
    h: h + 6 * s,
    u: 9 * s,
    seed,
    density: 4,
  });
  const out = compactSvgPaths(
    `${open}${title}<defs>${filter}</defs>${mask}<g mask="url(#fl)"><g filter="url(#pr)">${body.trim()}</g></g></svg>\n`,
  );
  const file = path.join(outDir, name);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === out) continue;
  if (check) {
    console.log(`STALE ${name}`);
    stale++;
    continue;
  }
  fs.writeFileSync(file, out);
  console.log(`wrote ${name} (${(out.length / 1024).toFixed(0)} KB)`);
}
if (check && stale) process.exit(1);
