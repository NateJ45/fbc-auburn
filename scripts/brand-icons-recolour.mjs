// Safe to edit by hand
//
// Recolours the sixteen stone icons in src/assets/brand/ into the two-family palette
// decided on 2026-10-21 (DESIGN.md "Colors"): auburn for the subject, navy for the
// supporting pieces. Writes candidates to brand/icons/; the shipped icons are untouched
// until the palette pass applies the decision site-wide. Run: npm run icons:recolour
//
// The shipped icons use six flat fills. The map below says what each becomes; it is a
// design choice, so change it on purpose. Red (the subject) goes to auburn; deep sky and
// water (the structural blues) go to navy; green goes to the navy mid; gold (the warm
// highlight) goes to the light auburn; sky (the pale fill) goes to the light navy.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src', 'assets', 'brand');
const outDir = path.join(root, 'brand', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const MAP = {
  '#C4401F': '#9A3B2A', // red -> auburn
  '#235E93': '#1F3A5F', // deep sky -> navy
  '#3B83AA': '#2C4F7C', // water -> navy mid
  '#2C5B3A': '#2C4F7C', // green -> navy mid
  '#E8A93A': '#B5503A', // gold -> auburn light
  '#96C3EA': '#7F98B8', // sky -> navy light
};

const files = fs
  .readdirSync(srcDir)
  .filter((f) => f.startsWith('stone-icon-') && f.endsWith('.svg'));
let changed = 0;
for (const f of files) {
  const svg = fs
    .readFileSync(path.join(srcDir, f), 'utf8')
    .replace(/fill="(#[0-9A-Fa-f]{6})"/g, (m, c) => `fill="${MAP[c.toUpperCase()] ?? c}"`);
  const out = path.join(outDir, f);
  if (fs.existsSync(out) && fs.readFileSync(out, 'utf8') === svg) continue;
  fs.writeFileSync(out, svg);
  changed++;
}
console.log(`${files.length} icons, ${changed} written to brand/icons/`);
