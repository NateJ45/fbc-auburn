// Corner and shadow scale gate (2026-11-09).
//
// WHY: the one scale at the top of src/styles/auburn.css (2026-10-24) names every corner
// (--radius-control, -card, -inner, -tag, -pill) and every shadow (--shadow-card, -lift, -raised,
// -button, -overlay). It said "a new value that is not on it is a bug", but nothing checked, so by
// November 25 pills were typed as 999px, tags as 4px, and the hover lift shadow was copied into
// three files. Each one renders the same today; the drift shows the first time someone changes the
// scale and half the site does not move. This test reads the public site's styles and fails on a
// corner or shadow typed in by hand.
//
// WHAT PASSES, without a note:
//   - anything through a custom property: var(--radius-card), var(--hb-radius), var(--shadow-card)
//   - 0, inherit, 50% (a circle), and hairlines of 2px or less (an underline bar, a progress tick)
//   - box-shadow: none, and rings (`0 0 0 4px ...`, `inset 0 0 0 1px ...`): those are outlines
//   - Tailwind's named rounded-* / shadow-* classes, which read the theme's own radius scale
// WHAT FAILS: any other length in border-radius or box-shadow, and an arbitrary Tailwind value
// with a raw number in it (rounded-[12px], shadow-[0_2px...]).
//
// THE WAY OUT for a deliberate one-off (a hand-drawn wobble, the arch, a bar that casts upward) is
// a comment containing `off-scale:` and the reason, on the same line or the line above. The reason
// is the point: the next person can see it was chosen, not drifted.
//
// NOT SCANNED: files marked PORTABLE (the starter owns them; fix them there), the Studio and the
// live-preview overlay (their own look), globals.css (the starter's base layer, overridden in
// auburn.css where Auburn differs), the styleguide benches, and the pre-launch notes layer
// (ClientNotes, ShotRequest), which is switched off at launch. Spacing is not gated: there are too
// many honest one-off gaps, and cards get theirs from --pad-card through .auburn-card.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN = ['src/styles', 'src/components', 'src/layouts', 'src/pages'];
const SKIP = [
  /[\\/]components[\\/](studio|preview|primereact)[\\/]/,
  /[\\/]pages[\\/](styleguide|studio)[\\/]/,
  /[\\/](ClientNotes|ShotRequest)\.astro$/,
  // The starter's base layer; Auburn overrides what it needs from it in auburn.css.
  /[\\/]styles[\\/]globals\.css$/,
  /\.test\.ts$/,
];

function files(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(css|astro|tsx)$/.test(e.name) && !SKIP.some((re) => re.test(p))) out.push(p);
    }
  };
  for (const d of SCAN) walk(join(root, d));
  return out;
}

const isPortable = (src: string) =>
  /PORTABLE: canonical copy/.test(src.split('\n').slice(0, 3).join('\n'));

/** A corner value is on the scale if it goes through a token or is a circle, zero or a hairline. */
export function radiusOk(value: string): boolean {
  const v = value.replace(/!important/, '').trim();
  if (/var\(/.test(v)) return true; // a token (a long var( may wrap onto the next line)
  if (/^(0|inherit|initial|unset|50%)$/.test(v)) return true;
  // Every part a hairline: 1px, 2px, 0.
  return v.split(/[\s/]+/).every((part) => /^(0|0?\.\d+px|[12]px)$/.test(part));
}

/** A shadow is on the scale if it is a token, none, or every layer is a ring (0 0 0 Npx). */
export function shadowOk(value: string): boolean {
  const v = value.replace(/!important/, '').trim();
  if (/^var\(--shadow-[a-z-]+(,.*)?\)$/.test(v) || /^(none|inherit|initial|unset)$/.test(v))
    return true;
  const layers = v.split(/,(?![^(]*\))/).map((s) => s.trim());
  return layers.every(
    (l) => /^(inset\s+)?0(px)?\s+0(px)?\s+0(px)?\s+\d/.test(l) || /^var\(--/.test(l),
  );
}

type Hit = { where: string; text: string };

function scan(): Hit[] {
  const hits: Hit[] = [];
  for (const f of files()) {
    const src = readFileSync(f, 'utf8');
    if (isPortable(src)) continue;
    const lines = src.split('\n');
    const rel = relative(root, f).replaceAll('\\', '/');
    lines.forEach((line, i) => {
      const excused = /off-scale:/.test(line) || /off-scale:/.test(lines[i - 1] ?? '');
      if (excused) return;
      for (const m of line.matchAll(/border(?:-[a-z]+)*-radius:\s*([^;"'}]+)/g)) {
        if (!radiusOk(m[1])) hits.push({ where: `${rel}:${i + 1}`, text: m[0].trim() });
      }
      for (const m of line.matchAll(/box-shadow:\s*([^;"'}]+)/g)) {
        if (!shadowOk(m[1])) hits.push({ where: `${rel}:${i + 1}`, text: m[0].trim() });
      }
      if (/\.(astro|tsx)$/.test(f)) {
        for (const m of line.matchAll(
          /(?<![\w-])(?:rounded(?:-[a-z]{1,2})?|shadow)-\[[^\]]*\d(?:px|rem|em)[^\]]*\]/g,
        )) {
          const inner = m[0].slice(m[0].indexOf('[') + 1, -1).replaceAll('_', ' ');
          const ring = m[0].startsWith('shadow-') && shadowOk(inner);
          if (!ring && !/var\(--/.test(m[0])) hits.push({ where: `${rel}:${i + 1}`, text: m[0] });
        }
      }
    });
  }
  return hits;
}

test('radiusOk and shadowOk accept the scale and reject raw values', () => {
  for (const ok of ['var(--radius-card)', '0', '50%', '2px', '1px 1px 0 0', 'inherit'])
    assert.ok(radiusOk(ok), ok);
  for (const bad of ['999px', '4px', '12px', '0.5rem', '999px 999px 18px 18px'])
    assert.ok(!radiusOk(bad), bad);
  for (const ok of [
    'var(--shadow-card)',
    'none',
    '0 0 0 4px #ffe46b',
    'inset 0 0 0 1px rgb(22 38 61 / 0.08)',
  ])
    assert.ok(shadowOk(ok), ok);
  for (const bad of ['0 26px 48px -30px rgb(22 38 61 / 0.5)', '0 1px 3px rgb(0 0 0 / 0.2)'])
    assert.ok(!shadowOk(bad), bad);
});

test('every corner and shadow on the public site comes from the scale', () => {
  const hits = scan();
  assert.deepEqual(
    hits,
    [],
    `Typed-in corners or shadows (use a token from the scale in src/styles/auburn.css, or add an ` +
      `"off-scale: <reason>" comment for a deliberate one-off):\n` +
      hits.map((h) => `  ${h.where}  ${h.text}`).join('\n'),
  );
});
