// Safe to edit by hand
// FBC Auburn: the stone path's motion (2026-10-17), ported from the studio mockups' motion.js
// and walk.js. Loaded once by BaseLayout and re-run on every astro:page-load (View Transitions).
//
// Rules: motion follows the scroll and never takes it over; transforms and opacity only; the
// cross never moves; reduced motion (or ?still) shows everything at rest. `html.motion` is set by
// the inline script in BaseLayout's <head> before first paint, and this file does nothing that
// matters without it except mark the reveals as landed.
//
// What runs where:
//   - Reveals and the mark's build: pure CSS on browsers with scroll-driven animations
//     (src/styles/motion.css); elsewhere an IntersectionObserver adds `.in` here.
//   - Wave drift and the baptism ring: CSS view timelines where supported; elsewhere a passive,
//     rAF-throttled scroll listener sets --drift / --turn here.
//   - The background path always runs here (it needs layout). The Walk in with us plan it used
//     to light up was removed on 2026-10-24; the walk is a plain list now (WalkSection.astro).

import { initFlow } from './flow';

const SCROLL_DRIVEN =
  typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()') === true;

let cleanup: (() => void) | null = null;

function initMotion() {
  cleanup?.();
  const disposers: (() => void)[] = [];
  const html = document.documentElement;
  const still = !html.classList.contains('motion');

  // ---- 1. Reveals: stones, icons and the mark land once as they scroll in ------------------
  const revealEls = [
    ...document.querySelectorAll<HTMLElement | SVGElement>('.reveal, .mark-build'),
  ];
  if (still || SCROLL_DRIVEN || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    revealEls.forEach((el) => io.observe(el));
    disposers.push(() => io.disconnect());
  }

  // ---- 2. Background path: faint stones on a long S-curve, laid ahead of the reader ---------
  const pathPage = document.querySelector<HTMLElement>('[data-bgpath-page]');
  const main = document.getElementById('main');
  const bg = pathPage && main ? main : null;
  const stoneUrls = (pathPage?.dataset.stones ?? '').split(',').filter(Boolean);
  if (bg) bg.setAttribute('data-bgpath', '');

  function revealBg() {
    if (!bg) return;
    const top = bg.getBoundingClientRect().top + scrollY;
    const edge = scrollY + innerHeight * 0.92 - top;
    bg.querySelectorAll<SVGElement>('.bgstone:not(.in)').forEach((s) => {
      if (still || Number(s.dataset.y) < edge) s.classList.add('in');
    });
  }

  // Performance (2026-10-24): every read happens before any write. The first version appended a
  // stone and then asked the path for the next point, and getPointAtLength needs fresh styles, so
  // each stone forced a style recalculation of the whole page: about 450ms of main thread per lay
  // on a mid-range phone, twice per load (here and on fonts.ready), which Lighthouse booked as one
  // long task (and blamed on whatever third-party script shared it). Now: measure the page, work
  // out every point in plain arithmetic, then swap all the stones in at once.
  function layPath() {
    if (!bg || stoneUrls.length < 3) return;
    const H = bg.offsetHeight;
    const W = bg.offsetWidth;
    if (!H || !W) return;

    // 1. Read the page: where the path must not go.
    const bgRect = bg.getBoundingClientRect();
    const bgTop = bgRect.top + scrollY;
    const bgLeft = bgRect.left;
    // No stones where a section has its own path (the rail, the walk) or over the hero.
    const skip = [
      ...bg.querySelectorAll<HTMLElement>('[data-no-bgpath], .arch-hero, section:first-child'),
    ].map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + scrollY - bgTop, r.bottom + scrollY - bgTop] as const;
    });
    // Nor over words or controls: the path sits above the section grounds (so it shows on the
    // tinted bands), which put it on top of text too. A stone whose box, plus a small margin,
    // touches a heading, paragraph, list item, link or button is left out, so the path runs
    // through the gutters and the gaps between blocks and never across a sentence.
    const words = [
      ...bg.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, p, li, a, button, label, input, textarea, select, blockquote, figcaption',
      ),
    ]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => {
        const top = r.top + scrollY - bgTop;
        const left = r.left - bgLeft;
        return [left, top, left + r.width, top + r.height] as const;
      });

    // 2. Sample the curve. It is never drawn (only the stones are), so it is walked here in plain
    // arithmetic rather than through an SVG path: getPointAtLength re-measures the curve on every
    // call, which was most of what was left of this function's cost.
    const amp = Math.min(W * 0.42, 560);
    const mid = W / 2;
    const turns = Math.max(2, Math.round(H / 1100));
    // The curve swings between the two outer gutters, wider on big screens: one cubic per turn.
    const pts: [number, number][] = [];
    let x0 = mid - amp * 0.2;
    for (let t = 1; t <= turns; t++) {
      const y0 = ((t - 1) / turns) * H;
      const y1 = (t / turns) * H;
      const side = t % 2 ? 1 : -1;
      const c1: [number, number] = [mid + side * amp, y0 + (y1 - y0) * 0.3];
      const c2: [number, number] = [mid + side * amp, y0 + (y1 - y0) * 0.7];
      const x1 = mid - side * amp * 0.1;
      for (let i = t === 1 ? 0 : 1; i <= 96; i++) {
        const u = i / 96;
        const v = 1 - u;
        pts.push([
          v * v * v * x0 + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * x1,
          v * v * v * y0 + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * y1,
        ]);
      }
      x0 = x1;
    }
    const lens = [0];
    for (let i = 1; i < pts.length; i++) {
      lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const len = lens[lens.length - 1];
    const stepLen = W < 560 ? 76 : 104;
    // Each stone's point, and the direction the curve runs there.
    const points: { x: number; y: number; ang: number }[] = [];
    let seg = 1;
    for (let l = 40; l < len - 20; l += stepLen) {
      while (seg < lens.length - 1 && lens[seg] < l) seg++;
      const [ax, ay] = pts[seg - 1];
      const [bx, by] = pts[seg];
      const f = (l - lens[seg - 1]) / (lens[seg] - lens[seg - 1] || 1);
      points.push({
        x: ax + (bx - ax) * f,
        y: ay + (by - ay) * f,
        ang: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI,
      });
    }
    const NS = 'http://www.w3.org/2000/svg';
    let svg = bg.querySelector<SVGSVGElement>(':scope > svg.bgpath');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'bgpath');
      svg.setAttribute('aria-hidden', 'true');
      bg.prepend(svg);
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // 3. Write: build the stones off-page and add them in one go.
    const w = W < 560 ? 40 : 58;
    const pad = 10;
    const onWords = (x: number, y: number) =>
      words.some(
        ([l, t, r, b]) =>
          x + w / 2 + pad > l &&
          x - w / 2 - pad < r &&
          y + w * 0.3 + pad > t &&
          y - w * 0.3 - pad < b,
      );
    const stones = document.createDocumentFragment();
    points.forEach((p, k) => {
      if (skip.some(([a, b]) => p.y > a - 30 && p.y < b + 30)) return;
      if (onWords(p.x, p.y)) return;
      const img = document.createElementNS(NS, 'image');
      img.setAttribute('href', stoneUrls[k % 3]);
      img.setAttribute('width', String(w));
      img.setAttribute('height', String(w * 0.45));
      img.setAttribute('x', String(-w / 2));
      img.setAttribute('y', String(-w * 0.22));
      img.setAttribute(
        'transform',
        `translate(${p.x} ${p.y}) rotate(${p.ang + 90 + (k % 2 ? 8 : -8)})`,
      );
      img.setAttribute('class', 'bgstone');
      img.dataset.y = String(p.y);
      stones.appendChild(img);
    });
    svg.replaceChildren(stones);
    revealBg();
  }

  // ---- 3. Scroll-linked drift (fallback only): waves drift, baptism ring turns ---------------
  const drifters = SCROLL_DRIVEN ? [] : [...document.querySelectorAll<SVGElement>('.mark-build')];
  const baptisms = SCROLL_DRIVEN
    ? []
    : [...document.querySelectorAll<SVGElement>('.baptism-motion')];
  // -1 when the drawing is a screen above centre, 1 when a screen below.
  const where = (el: Element) => {
    const r = el.getBoundingClientRect();
    return Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
  };
  function onScroll() {
    revealBg();
    if (still) return;
    for (const svg of drifters) svg.style.setProperty('--drift', where(svg).toFixed(3));
    for (const svg of baptisms) svg.style.setProperty('--turn', where(svg).toFixed(3));
  }
  let ticking = false;
  const scrollHandler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  };
  let resizeTimer = 0;
  const resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layPath();
      onScroll();
    }, 150);
  };
  if (bg || drifters.length || baptisms.length) {
    addEventListener('scroll', scrollHandler, { passive: true });
    addEventListener('resize', resizeHandler);
    disposers.push(() => {
      removeEventListener('scroll', scrollHandler);
      removeEventListener('resize', resizeHandler);
      clearTimeout(resizeTimer);
    });
  }
  // Late content (the replay thumbnail, the This week rows, lazy images) moves the blocks after the
  // first lay, which would leave stones where words now are. Lay the path again whenever the page
  // body changes height (debounced through the resize handler).
  if (bg && 'ResizeObserver' in window) {
    let lastH = bg.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (bg.offsetHeight === lastH) return;
      lastH = bg.offsetHeight;
      resizeHandler();
    });
    ro.observe(bg);
    disposers.push(() => ro.disconnect());
  }
  layPath();
  onScroll();
  // Fonts change the page height; lay the path again once they are in.
  document.fonts?.ready.then(() => {
    layPath();
    onScroll();
  });

  cleanup = () => {
    disposers.forEach((d) => d());
    cleanup = null;
  };
}

document.addEventListener('astro:page-load', initMotion);
// The flow layer (src/scripts/flow.ts): headings, fade-ups, photos, the footer verse.
document.addEventListener('astro:page-load', initFlow);
