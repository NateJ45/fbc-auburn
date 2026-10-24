// Safe to edit by hand
// Lifts the building sketch off its paper into the site's tintable drawing (2026-10-23).
//
//   brand/illustration/building-sketch.jpg         the master: the pen-and-pencil rendering on
//                                                  white paper
//   src/assets/brand/building-sketch-lines.webp    the output, in two files (2026-10-24): the
//   src/assets/brand/building-sketch-shade.webp    solid pen lines, and the lighter pencil shading
//                                                  and hatching, as transparency only, 1200 px
//                                                  wide, about 47 KB together (lossless WebP)
//
// The method is the Muncie site's footer rendering: divide the grey drawing by a blurred copy of
// itself so the paper goes flat, push the paper to clear and the ink to solid, trim, then step the
// transparency to four levels so the file stays small. The site paints the colour
// (src/components/church/BuildingSketch.astro), so the files carry none. The top step goes to the
// lines file and the two lighter steps to the shade file; they never overlap, so the two painted
// on top of each other are exactly the one drawing, and the page can draw the lines in first with
// the shading following (docs/agent/animation.md, "The sketch draws itself in").
// Run: node scripts/brand-sketch.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'brand/illustration/building-sketch.jpg');
const OUT_LINES = path.join(root, 'src/assets/brand/building-sketch-lines.webp');
const OUT_SHADE = path.join(root, 'src/assets/brand/building-sketch-shade.webp');

const { data, info } = await sharp(SRC)
  .resize(1600)
  .grayscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const blur = await sharp(data, { raw: info }).blur(24).raw().toBuffer();
const alpha = Buffer.alloc(info.width * info.height);
for (let i = 0; i < alpha.length; i++) {
  const v = Math.min(1, data[i] / Math.max(1, blur[i])); // 1 = paper, lower = ink
  const a = Math.max(0, Math.min(1, (0.94 - v) / (0.94 - 0.45)));
  alpha[i] = Math.round(Math.pow(a, 0.8) * 255);
}
const lifted = await sharp({
  create: { width: info.width, height: info.height, channels: 3, background: '#000' },
})
  .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
  .png()
  .toBuffer();
const trimmed = await sharp(lifted).trim({ threshold: 1 }).resize(1200).toBuffer();
const a = await sharp(trimmed).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < a.data.length; i++) {
  const v = a.data[i];
  a.data[i] = v < 40 ? 0 : v < 110 ? 90 : v < 190 ? 170 : 255;
}
const lines = a.data.map((v) => (v === 255 ? 255 : 0));
const shade = a.data.map((v) => (v === 255 ? 0 : v));
for (const [buf, out] of [
  [lines, OUT_LINES],
  [shade, OUT_SHADE],
]) {
  await sharp({
    create: { width: a.info.width, height: a.info.height, channels: 3, background: '#000' },
  })
    .joinChannel(buf, { raw: { width: a.info.width, height: a.info.height, channels: 1 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(out);
  console.log(`[sketch] wrote ${path.relative(root, out)} (${a.info.width} x ${a.info.height})`);
}
