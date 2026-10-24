// Safe to edit by hand
// FBC Auburn: the flow layer (2026-10-24). Every section comes in as it reaches the reader:
// headings rise line by line out of a mask, the words and pictures under them fade up in turn,
// photographs settle from a slight zoom, the home hero drifts as it leaves, the footer verse
// slides across with the scroll, and the main buttons lean toward the pointer. Modelled on the
// motion audit of a reference church site (docs/agent/animation.md, "The flow layer"), rebuilt
// here without a library: an IntersectionObserver, CSS keyframes and scroll timelines, and one
// passive scroll listener.
//
// Nothing is tagged by hand. The script picks the units itself (FLOW_UNITS below), so a section
// an editor adds in the Studio moves like the rest. Opt a subtree out with data-flow="off".
//
// The rules (docs/agent/animation.md): motion follows the scroll and never takes it over;
// transforms and opacity only (the individual `translate` / `scale` properties, so nothing fights
// a component's own `transform`); reduced motion and ?still show the finished page, because
// nothing here runs without `html.motion`. Every hidden starting state is the first frame of a
// paused CSS animation, so a test that turns animations off (tests/helpers.ts settle) sees the
// page at rest, and every element hands back its plain markup once it has landed.
//
// Loaded by src/scripts/motion.ts; re-run on every astro:page-load. Styles: src/styles/flow.css.

const UP_UNITS = [
  'h3',
  'h4',
  'p',
  'li',
  'dl',
  'blockquote',
  'figure',
  'form',
  'iframe',
  'table',
  'picture',
  'img',
  'video',
  '.shot',
  '.btn-auburn',
  '.hb-ghost',
  '.hb-lift',
  '.stone-icon',
  '[data-flow-item]',
].join(',');

// Headings that rise line by line. Pull quotes too: they read as headings.
const LINE_UNITS = 'h1, h2, blockquote > p, [data-flow="lines"]';

// Things that already move in their own way, and everything inside them.
const SKIP =
  '[data-flow="off"], .reveal, .mark-build, .hb-photo, .hb-path, .bgpath, .sr-only, ' +
  '[data-sundaybar], .fj, .shot__example';

const EASE_STAGGER_MS = 90;
const MAX_STAGGER = 8;
const LINE_STAGGER_MS = 110;

let teardown: (() => void) | null = null;

export function initFlow() {
  teardown?.();
  const html = document.documentElement;
  if (!html.classList.contains('motion')) return;
  const main = document.getElementById('main');
  if (!main) return;

  const disposers: (() => void)[] = [];
  const preview = location.pathname.startsWith('/preview');

  // ---- 1. Pick the units -----------------------------------------------------------------
  // An element is a unit only if no ancestor already is, so a card fades as one piece and the
  // words inside it do not fade again.
  const units: { el: HTMLElement; kind: 'lines' | 'up' | 'photo' | 'side' }[] = [];
  const taken = new Set<Element>();
  const isInsideTaken = (el: Element) => {
    for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
      if (taken.has(p)) return true;
    }
    return false;
  };
  const candidates = main.querySelectorAll<HTMLElement>(`${LINE_UNITS}, ${UP_UNITS}`);
  for (const el of candidates) {
    if (el.closest(SKIP) || isInsideTaken(el) || el.dataset.flowOn) continue;
    // Hidden things (a closed accordion's answer, an empty slot) have nothing to show.
    if (!el.getClientRects().length) continue;
    let kind: (typeof units)[number]['kind'] = 'up';
    if (el.matches(LINE_UNITS)) kind = 'lines';
    else if (el.matches('img, picture, .shot') && clipsChild(el)) kind = 'photo';
    units.push({ el, kind });
    taken.add(el);
  }
  // The This Sunday card slides in from the side on Home as one piece, like a photo arriving.
  const sundayCard = main.querySelector<HTMLElement>('.hb-hero__card');
  if (sundayCard && !sundayCard.dataset.flowOn) {
    const kept = units.filter((u) => !sundayCard.contains(u.el));
    units.length = 0;
    units.push(...kept, { el: sundayCard, kind: 'side' });
  }

  // ---- 2. Arm them: each holds its first frame until it reaches the reader ----------------
  for (const { el, kind } of units) {
    el.dataset.flowOn = kind;
    el.classList.add('flow', `flow--${kind}`);
    // A big photo in a cropping frame also drifts inside it with the scroll (flow.css), unless
    // it is a link's picture, whose hover zoom owns its transform.
    if (kind === 'photo' && el.parentElement!.offsetHeight >= 200 && !el.closest('a')) {
      el.classList.add('flow-par');
    }
  }
  // The first screen's hold (flow.css) can let go now: everything is armed.
  html.classList.add('flow-armed');

  const land = (el: HTMLElement) => {
    el.classList.remove('flow', 'flow--lines', 'flow--up', 'flow--photo', 'flow--side', 'flow-go');
    el.style.removeProperty('--flow-delay');
    const restore = lineRestorers.get(el);
    if (restore) {
      restore();
      lineRestorers.delete(el);
    }
  };

  const go = (el: HTMLElement, delayMs: number) => {
    el.style.setProperty('--flow-delay', `${delayMs}ms`);
    el.classList.add('flow-go');
    // Hand back plain markup once the last piece has landed. A timer, not animationend alone,
    // so a tab in the background (where animations may not run) still finishes.
    const lines = el.querySelectorAll('.flow-line__in').length;
    const total = delayMs + (lines ? (lines - 1) * LINE_STAGGER_MS + 1250 : 1400);
    const t = window.setTimeout(() => land(el), total + 80);
    disposers.push(() => window.clearTimeout(t));
  };

  // Lines need the real fonts to know where a heading breaks; everything else can go now.
  const lineUnits = units.filter((u) => u.kind === 'lines').map((u) => u.el);
  const ready = Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => window.setTimeout(r, 900)),
  ]);

  let firstBatch = true;
  const io = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      if (!arriving.length) return;
      // The first screen waits a beat after a navigation so it rises with the page.
      const base = firstBatch ? 120 : 0;
      firstBatch = false;
      arriving.forEach((el, i) => {
        io.unobserve(el);
        go(el, base + Math.min(i, MAX_STAGGER) * EASE_STAGGER_MS);
      });
    },
    // "top 85%": a unit starts once its top is 15% of the screen above the bottom edge.
    { rootMargin: '0px 0px -12% 0px' },
  );
  disposers.push(() => io.disconnect());

  ready.then(() => {
    if (teardown !== stop) return; // a newer page took over while the fonts loaded
    for (const el of lineUnits) {
      if (preview || !splitLines(el)) {
        // Live preview keeps its text nodes whole (click-to-edit reads them); a heading that
        // will not split cleanly fades up instead.
        el.classList.replace('flow--lines', 'flow--up');
        el.dataset.flowOn = 'up';
      }
    }
    for (const { el } of units) io.observe(el);
  });

  // ---- 3. Scroll-tied pieces: the hero drift and the footer verse --------------------------
  disposers.push(scrubVerse());
  if (!CSS.supports?.('animation-timeline: view()')) disposers.push(scrubHeroFallback());

  // ---- 4. Magnetic buttons: the main buttons lean a few pixels toward a mouse --------------
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const buttons = document.querySelectorAll<HTMLElement>(
      '.btn-auburn--primary, .site-header [data-header-cta], [data-magnetic]',
    );
    const FORCE = 14;
    for (const b of buttons) {
      const move = (e: PointerEvent) => {
        const r = b.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * FORCE;
        const y = ((e.clientY - r.top) / r.height - 0.5) * FORCE;
        b.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      };
      const leave = () => {
        b.style.translate = '';
      };
      b.classList.add('flow-magnetic');
      b.addEventListener('pointermove', move);
      b.addEventListener('pointerleave', leave);
      disposers.push(() => {
        b.removeEventListener('pointermove', move);
        b.removeEventListener('pointerleave', leave);
        b.classList.remove('flow-magnetic');
        b.style.translate = '';
      });
    }
  }

  const stop = () => {
    disposers.forEach((d) => d());
    for (const { el } of units) {
      land(el);
      el.classList.remove('flow-par');
      delete el.dataset.flowOn;
    }
    teardown = null;
  };
  teardown = stop;
}

/** True when the element's parent crops it, so a zoom stays inside its frame. */
function clipsChild(el: HTMLElement) {
  const p = el.parentElement;
  if (!p) return false;
  const cs = getComputedStyle(p);
  return cs.overflow !== 'visible' || cs.overflowX !== 'visible';
}

// ---- Line splitting ----------------------------------------------------------------------
// Words become spans and are grouped by where they sit; each line goes in a mask
// (.flow-line) and rises inside it (.flow-line__in). Inline children (a link, an <em>, one of
// StoneHeading's word drawings) stay whole. The original child nodes are kept and put back once
// the heading has landed, so nothing downstream ever sees the spans.
const lineRestorers = new Map<HTMLElement, () => void>();

function splitLines(el: HTMLElement): boolean {
  if (lineRestorers.has(el)) return true;
  const original = [...el.childNodes];
  const pieces: Node[] = [];
  for (const node of original) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const part of (node.textContent ?? '').split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) pieces.push(document.createTextNode(part));
        else {
          const w = document.createElement('span');
          w.className = 'flow-word';
          w.textContent = part;
          pieces.push(w);
        }
      }
    } else pieces.push(node);
  }
  el.replaceChildren(...pieces);

  const restore = () => el.replaceChildren(...original);
  const lines: Node[][] = [];
  let lastTop = Number.NaN;
  for (const piece of pieces) {
    if (piece.nodeType !== Node.ELEMENT_NODE) {
      lines[lines.length - 1]?.push(piece);
      continue;
    }
    const rects = (piece as Element).getClientRects();
    if (rects.length > 1) {
      // A link or phrase that itself breaks across two lines: leave this heading alone.
      restore();
      return false;
    }
    const top = rects.length ? Math.round(rects[0].top) : lastTop;
    if (!lines.length || (Number.isFinite(top) && Math.abs(top - lastTop) > 3)) lines.push([]);
    lines[lines.length - 1].push(piece);
    if (Number.isFinite(top)) lastTop = top;
  }
  if (!lines.length) {
    restore();
    return false;
  }
  el.replaceChildren(
    ...lines.map((nodes, i) => {
      const mask = document.createElement('span');
      mask.className = 'flow-line';
      const inner = document.createElement('span');
      inner.className = 'flow-line__in';
      inner.style.setProperty('--flow-i', String(i));
      inner.append(...nodes);
      mask.append(inner);
      return mask;
    }),
  );
  lineRestorers.set(el, restore);
  return true;
}

// ---- The footer verse --------------------------------------------------------------------
// One long line of scripture slides from right to left as the footer comes up. JS, not a scroll
// timeline: the end point is "near the top of the screen, or the bottom of the page if the page
// runs out first", which a view timeline cannot express.
function scrubVerse(): () => void {
  const wrap = document.querySelector<HTMLElement>('[data-flow-verse]');
  const line = wrap?.querySelector<HTMLElement>('.sf-verse__line');
  if (!wrap || !line) return () => {};
  let frame = 0;
  let active = false;
  const update = () => {
    frame = 0;
    const travel = Math.max(0, line.scrollWidth - wrap.clientWidth);
    const top = wrap.getBoundingClientRect().top + scrollY;
    // From the verse's top entering at the bottom of the screen to it nearing the top (or the
    // end of the page, if that comes first), so the last word arrives while it is still in view.
    const start = top - innerHeight;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const end = Math.max(start + 1, Math.min(maxScroll, top - innerHeight * 0.22));
    const p = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
    // Enter a quarter of the screen in from the right, end with the last word at the margin.
    const from = wrap.clientWidth * 0.25;
    line.style.translate = `${(from - p * (from + travel)).toFixed(1)}px 0`;
  };
  const onScroll = () => {
    if (active && !frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    if (active) update();
  });
  io.observe(wrap);
  wrap.classList.add('is-scrubbed');
  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  return () => {
    io.disconnect();
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (frame) cancelAnimationFrame(frame);
    wrap.classList.remove('is-scrubbed');
    line.style.translate = '';
  };
}

// ---- The home hero, where scroll timelines are missing (Firefox) ---------------------------
// flow.css drives the drift with a view timeline; this feeds the same picture through --hero-p.
function scrubHeroFallback(): () => void {
  const hero = document.querySelector<HTMLElement>('.hb-hero');
  if (!hero) return () => {};
  let frame = 0;
  const update = () => {
    frame = 0;
    const r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    hero.style.setProperty('--hero-p', p.toFixed(3));
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  hero.classList.add('is-scrubbed');
  update();
  addEventListener('scroll', onScroll, { passive: true });
  return () => {
    removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
    hero.classList.remove('is-scrubbed');
    hero.style.removeProperty('--hero-p');
  };
}
