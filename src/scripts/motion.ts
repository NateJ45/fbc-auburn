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
//   - The background path and the Walk in with us plan always run here (they need layout).

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

  function layPath() {
    if (!bg || stoneUrls.length < 3) return;
    const H = bg.offsetHeight;
    const W = bg.offsetWidth;
    if (!H || !W) return;
    const NS = 'http://www.w3.org/2000/svg';
    let svg = bg.querySelector<SVGSVGElement>(':scope > svg.bgpath');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'bgpath');
      svg.setAttribute('aria-hidden', 'true');
      bg.prepend(svg);
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    // The curve swings between the two outer gutters, wider on big screens.
    const amp = Math.min(W * 0.42, 560);
    const mid = W / 2;
    const turns = Math.max(2, Math.round(H / 1100));
    let d = `M ${mid - amp * 0.2} 0`;
    for (let t = 1; t <= turns; t++) {
      const y0 = ((t - 1) / turns) * H;
      const y1 = (t / turns) * H;
      const s = t % 2 ? 1 : -1;
      d += ` C ${mid + s * amp} ${y0 + (y1 - y0) * 0.3}, ${mid + s * amp} ${y0 + (y1 - y0) * 0.7}, ${mid - s * amp * 0.1} ${y1}`;
    }
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
    const len = path.getTotalLength();
    const stepLen = W < 560 ? 76 : 104;
    // No stones where a section has its own path (the rail, the walk) or over the hero.
    const bgTop = bg.getBoundingClientRect().top + scrollY;
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
    const bgLeft = bg.getBoundingClientRect().left;
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
    let k = 0;
    for (let l = 40; l < len - 20; l += stepLen, k++) {
      const p = path.getPointAtLength(l);
      const q = path.getPointAtLength(Math.min(len, l + 1));
      if (skip.some(([a, b]) => p.y > a - 30 && p.y < b + 30)) continue;
      if (onWords(p.x, p.y)) continue;
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      const img = document.createElementNS(NS, 'image');
      img.setAttribute('href', stoneUrls[k % 3]);
      img.setAttribute('width', String(w));
      img.setAttribute('height', String(w * 0.45));
      img.setAttribute('x', String(-w / 2));
      img.setAttribute('y', String(-w * 0.22));
      img.setAttribute(
        'transform',
        `translate(${p.x} ${p.y}) rotate(${ang + 90 + (k % 2 ? 8 : -8)})`,
      );
      img.setAttribute('class', 'bgstone');
      img.dataset.y = String(p.y);
      svg.appendChild(img);
    }
    path.remove();
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

  // ---- 4. Walk in with us: light the route up to the stop in the middle of the screen --------
  document.querySelectorAll<HTMLElement>('[data-walk]').forEach((walk) => {
    const stage = walk.querySelector<HTMLElement>('.walk-stage');
    const plan = walk.querySelector<SVGSVGElement>('.walk-plan');
    if (!stage || !plan) return;
    const stones = [...plan.querySelectorAll<SVGElement>('.pstone')];
    const marks = [...plan.querySelectorAll<SVGElement>('.stop')];
    const items = [...walk.querySelectorAll<HTMLElement>('.walk-steps li')];
    const show = (n: number) => {
      stage.dataset.stop = String(n);
      // The stones that led you to this stop, and every leg before it.
      stones.forEach((s) => s.classList.toggle('in', still || Number(s.dataset.leg) <= n));
      marks.forEach((m, i) => {
        m.classList.toggle('on', still || i + 1 <= n);
        m.classList.toggle('here', !still && i + 1 === n);
      });
      items.forEach((li) => li.classList.toggle('active', Number(li.dataset.stop) === n));
    };
    if (still || !('IntersectionObserver' in window)) {
      show(items.length + 1);
      return;
    }
    show(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) show(Number((e.target as HTMLElement).dataset.stop));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((li) => io.observe(li));
    disposers.push(() => io.disconnect());
  });

  cleanup = () => {
    disposers.forEach((d) => d());
    cleanup = null;
  };
}

document.addEventListener('astro:page-load', initMotion);
// The flow layer (src/scripts/flow.ts): headings, fade-ups, photos, the footer verse.
document.addEventListener('astro:page-load', initFlow);
