// Safe to edit by hand
// The stone ribbon (the bold home pass, 2026-10-17, after the Gemini comp): one wide path of
// brick-like stones in the mark's four colours, running the full height of the page.
//
// Desktop (64rem and up): the ribbon runs down one gutter beside a section, then sweeps across
// the page in the empty space between two sections and carries on down the other gutter. The
// page narrows its content column to leave the gutters (StoneRibbon.astro's styles), and every
// crossing is measured from the real words and pictures above and below it, so a stone never
// sits on a sentence. Two sections too close to cross between: the ribbon stays on its side.
// Phone and tablet: a slim rail down the left edge, as in the comp's phone screen.
//
// Drawn by script because it follows the laid-out page; with no script the page simply has no
// ribbon. It is redrawn when the page changes size. With motion on (html.motion, see
// src/styles/motion.css) stones land as they scroll into view; with reduced motion they are
// all there at once. Transforms and opacity only.

const NS = 'http://www.w3.org/2000/svg';

// Red, gold, green, sky: three shades each so the stones read as stones, not a stripe.
const PALETTE = [
  ['#c4401f', '#b3391b', '#d2542f'],
  ['#e8a93a', '#d99a2c', '#f0bb57'],
  ['#2c5b3a', '#376f47', '#24502f'],
  ['#96c3ea', '#82b4e2', '#accff0'],
];

/** A steady pseudo-random number in [0, 1) for stone i, so a redraw keeps the same stones. */
function rand(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** The top and bottom (page px) of everything a stone must not cover in a section. */
function contentSpan(section: HTMLElement): [number, number] | null {
  const els = section.querySelectorAll<HTMLElement>(
    'h1, h2, h3, h4, p, li, a, button, img, figure, table, form, [data-last-sunday], .arch-hero__arch',
  );
  let top = Infinity;
  let bottom = -Infinity;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    top = Math.min(top, r.top + scrollY);
    bottom = Math.max(bottom, r.bottom + scrollY);
  }
  return top < bottom ? [top, bottom] : null;
}

function init() {
  const marker = document.querySelector<HTMLElement>('[data-stone-ribbon]');
  const main = marker?.parentElement;
  if (!marker || !main) return;
  const still = !document.documentElement.classList.contains('motion');
  const wideQuery = matchMedia('(min-width: 64rem)');

  let svg: SVGSVGElement | null = null;
  let lastW = 0;
  let lastH = 0;

  function reveal() {
    if (!svg) return;
    const top = main!.getBoundingClientRect().top + scrollY;
    const edge = scrollY + innerHeight * 0.95 - top;
    svg.querySelectorAll<SVGElement>('.rstone:not(.in)').forEach((s) => {
      if (still || Number(s.dataset.y) < edge) s.classList.add('in');
    });
  }

  /** Where the words start on a wide screen: the first content column's left edge plus padding. */
  function gutterInner(): number {
    const box = main!.querySelector<HTMLElement>('.max-w-content');
    if (!box) return 140;
    return (
      box.getBoundingClientRect().left -
      main!.getBoundingClientRect().left +
      (parseFloat(getComputedStyle(box).paddingLeft) || 0)
    );
  }

  function pathFor(W: number, H: number, wide: boolean, half: number): string {
    if (!wide) {
      // The phone rail: down the padded left strip with a slight wobble.
      const x = Math.max(half + 2, (parseFloat(getComputedStyle(main!).paddingLeft) || 36) / 2);
      let d = `M ${x} 0`;
      const n = Math.max(1, Math.round(H / 260));
      for (let i = 1; i <= n; i++) {
        const s = (i % 2 ? 1 : -1) * 3;
        const y0 = ((i - 1) / n) * H;
        const y1 = (i / n) * H;
        d += ` C ${x + s} ${y0 + (y1 - y0) * 0.3}, ${x + s} ${y0 + (y1 - y0) * 0.7}, ${x} ${y1}`;
      }
      return d;
    }

    const inner = gutterInner();
    const xL = Math.max(half + 6, inner / 2);
    const xR = W - xL;
    const amp = Math.max(0, Math.min(inner / 2 - half - 6, 22));
    const X = (side: number) => (side ? xR : xL);
    const mainTop = main!.getBoundingClientRect().top + scrollY;

    let d = `M ${xL} 0`;
    let y = 0;
    let side = 0;
    // Down a gutter with a gentle wobble that stays inside it (it wobbles outward only).
    const run = (yb: number) => {
      if (yb <= y + 1) return;
      const x = X(side);
      const out = side ? 1 : -1;
      const n = Math.max(1, Math.round((yb - y) / 380));
      for (let i = 1; i <= n; i++) {
        const y0 = y + ((yb - y) * (i - 1)) / n;
        const y1 = y + ((yb - y) * i) / n;
        const s = i % 2 ? amp * out : 0;
        d += ` C ${x + s} ${y0 + (y1 - y0) * 0.3}, ${x + s} ${y0 + (y1 - y0) * 0.7}, ${x} ${y1}`;
      }
      y = yb;
    };

    const sections = [...main!.querySelectorAll<HTMLElement>(':scope > section')].filter(
      (s) => s.offsetHeight > 0,
    );
    const margin = half + 14;
    for (let i = 0; i < sections.length - 1; i++) {
      const a = contentSpan(sections[i]);
      const b = contentSpan(sections[i + 1]);
      if (!a || !b) continue;
      const ya = a[1] - mainTop + margin;
      const yb = b[0] - mainTop - margin;
      if (yb - ya < 40) continue; // too tight to cross here: stay on this side
      run(ya);
      const mid = (ya + yb) / 2;
      d += ` C ${X(side)} ${mid}, ${X(1 - side)} ${mid}, ${X(1 - side)} ${yb}`;
      y = yb;
      side = 1 - side;
    }
    run(H);
    return d;
  }

  function build() {
    const W = main!.clientWidth;
    const H = main!.offsetHeight;
    if (!W || !H) return;
    lastW = W;
    lastH = H;
    const wide = wideQuery.matches;
    // Stones grow a little where the gutters are wide, so the ribbon keeps its weight on big screens.
    const gutter = wide ? gutterInner() : 0;
    const grow = wide ? Math.min(1.3, Math.max(1, gutter / 170)) : 1;
    const dims = wide
      ? { len: 36 * grow, h: 24 * grow, lane: 13.5 * grow, step: 38 * grow, seg: 560 }
      : { len: 19, h: 13, lane: 7.2, step: 20, seg: 320 };
    const half = dims.lane + dims.h / 2;

    const redraw = !!svg;
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      marker!.appendChild(svg);
    }
    if (redraw) marker!.setAttribute('data-instant', '');
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', pathFor(W, H, wide, half));
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
    const len = path.getTotalLength();

    const frag = document.createDocumentFragment();
    let k = 0;
    for (let l = dims.step / 2; l < len; l += dims.step) {
      for (const lane of [-1, 1]) {
        const at = l + (lane > 0 ? dims.step / 2 : 0);
        if (at > len - 4) continue;
        k++;
        const p = path.getPointAtLength(at);
        const q = path.getPointAtLength(Math.min(len, at + 1));
        const ang = Math.atan2(q.y - p.y, q.x - p.x);
        const cx = p.x - Math.sin(ang) * lane * dims.lane;
        const cy = p.y + Math.cos(ang) * lane * dims.lane;
        const w = dims.len * (0.8 + 0.3 * rand(k));
        const h = dims.h * (0.84 + 0.24 * rand(k + 0.5));
        const rot = (ang * 180) / Math.PI + (rand(k + 0.25) - 0.5) * 14;
        // Colour runs blend into each other over the last fifth of a run.
        const seg = at / dims.seg;
        const frac = seg - Math.floor(seg);
        let ci = Math.floor(seg) % 4;
        if (frac > 0.8 && rand(k + 0.75) < (frac - 0.8) / 0.2) ci = (ci + 1) % 4;
        const shades = PALETTE[ci];
        const g = document.createElementNS(NS, 'g');
        g.setAttribute(
          'transform',
          `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(1)})`,
        );
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', (-w / 2).toFixed(1));
        r.setAttribute('y', (-h / 2).toFixed(1));
        r.setAttribute('width', w.toFixed(1));
        r.setAttribute('height', h.toFixed(1));
        r.setAttribute('rx', (h * 0.32).toFixed(1));
        r.setAttribute('fill', shades[Math.floor(rand(k + 0.6) * 3)]);
        r.setAttribute('class', 'rstone');
        r.dataset.y = String(Math.round(cy));
        g.appendChild(r);
        frag.appendChild(g);
      }
    }
    path.remove();
    svg.appendChild(frag);
    reveal();
    // Stones already revealed before a redraw stay put rather than landing again.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => marker!.removeAttribute('data-instant')),
    );
  }

  // First draw: stones already on screen land in a quick sweep, the rest as they scroll in.
  build();

  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        reveal();
      });
    },
    { passive: true },
  );

  // Redraw when the page changes size (fonts, images, the window), not on every pixel.
  let timer = 0;
  new ResizeObserver(() => {
    if (main!.clientWidth === lastW && Math.abs(main!.offsetHeight - lastH) < 4) return;
    clearTimeout(timer);
    timer = window.setTimeout(build, 180);
  }).observe(main);
  document.fonts?.ready.then(() => {
    if (main!.offsetHeight !== lastH) build();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
