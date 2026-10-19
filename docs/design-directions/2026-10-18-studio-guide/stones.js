// Mockup helper: seeded pebble paths, the same idea the kit's studio-design.ts uses.
function lcg(seed) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}
function pebble(seed, w, h, n = 7) {
  const r = lcg(seed);
  let pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5;
    const k = 0.86 + r() * 0.14;
    pts.push([w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k]);
  }
  for (let pass = 0; pass < 3; pass++) {
    const out = [];
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      out.push(
        [p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25],
        [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75],
      );
    });
    pts = out;
  }
  return 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}
document.querySelectorAll('[data-pebble]').forEach((el, i) => {
  const w = +el.dataset.w || 44,
    h = +el.dataset.h || 40;
  el.innerHTML =
    `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="${pebble(+el.dataset.pebble || i + 3, w, h)}" fill="${el.dataset.fill || '#235e93'}"/></svg>` +
    el.innerHTML;
});
