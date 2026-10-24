// Safe to edit by hand
// Lifts the building sketch off its paper into the site's tintable drawing (2026-10-23).
//
//   brand/illustration/building-sketch.jpg   the master: the pen-and-pencil rendering on white paper
//   src/assets/brand/building-sketch.webp    the output: the lines as transparency only, in four
//                                            steps, 1200 px wide, about 47 KB (lossless WebP)
//
// The method is the Muncie site's footer rendering: divide the grey drawing by a blurred copy of
// itself so the paper goes flat, push the paper to clear and the ink to solid, trim, then step the
// transparency to four levels so the file stays small. The site paints the colour
// (src/components/church/BuildingSketch.astro), so the file carries none.
// Run: node scripts/brand-sketch.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'brand/illustration/building-sketch.jpg');
const OUT = path.join(root, 'src/assets/brand/building-sketch.webp');

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
await sharp({
  create: { width: a.info.width, height: a.info.height, channels: 3, background: '#000' },
})
  .joinChannel(a.data, { raw: { width: a.info.width, height: a.info.height, channels: 1 } })
  .webp({ lossless: true, effort: 6 })
  .toFile(OUT);
console.log(`[sketch] wrote ${path.relative(root, OUT)} (${a.info.width} x ${a.info.height})`);
