// Safe to edit by hand
// Fork of the starter's src/scripts/flow.ts (PORTS.md card 192, which came from this file): kept
// because adopting it would change Auburn's motion. The starter's copy is gated on layout.motion,
// always holds the first screen still, and has no brick-laying unit; Auburn's animates the desktop
// first screen on Home and the 404, lays the brick titles, sill and markers, slides the footer verse
// and the This Sunday card, and makes the red buttons magnetic.
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

import { splitWords } from '../lib/flow-split';

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
  '[data-flow="off"], .reveal, .mark-build, .mark-lay, .hb-photo, .hb-path, .bgpath, .sr-only, ' +
  '[data-sundaybar], .fj, .shot__example';

// Timings (audit 2026-10-25: gentle and quick). FULL is Home and the 404; CALM is every other page,
// where a unit only fades in (200ms, 8px; flow.css) and nothing is split, zoomed or laid.
const FULL = { stagger: 60, firstBase: 80, up: 600, photo: 900, side: 800, lines: 800 };
const CALM = { stagger: 40, firstBase: 0, up: 200 };
const MAX_STAGGER = 8;
const LINE_STAGGER_MS = 80;

let teardown: (() => void) | null = null;

export function initFlow() {
  teardown?.();
  const html = document.documentElement;
  if (!html.classList.contains('motion')) return;
  const main = document.getElementById('main');
  if (!main) return;

  const disposers: (() => void)[] = [];
  const preview = location.pathname.startsWith('/preview');
  // Full motion only where a page asks for it (data-flow-full: HomeBoard and the 404). The brick
  // laying, the line-by-line headings, the photo zoom and drift and the footer verse slide stay
  // there; everywhere else, What we believe and Prayer included, content just fades in. CSS keys
  // the full-only rules on html[data-flow='full'] (flow.css, motion.css).
  const full = !!main.querySelector('[data-flow-full]');
  html.dataset.flow = full ? 'full' : 'calm';

  // ---- 1. Pick the units -----------------------------------------------------------------
  // An element is a unit only if no ancestor already is, so a card fades as one piece and the
  // words inside it do not fade again.
  const units: {
    el: HTMLElement;
    kind: 'lines' | 'lay' | 'up' | 'photo' | 'side';
    par?: boolean;
  }[] = [];
  const taken = new Set<Element>();
  const isInsideTaken = (el: Element) => {
    for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
      if (taken.has(p)) return true;
    }
    return false;
  };
  // Phones show the first screen as it is (mobile audit, 2026-10-24): holding it for the fonts and
  // the stagger kept the page's main words hidden for 2.7 to 3.1s after they had loaded (Lighthouse
  // LCP on a throttled phone). Only what is below the fold rises as it arrives there.
  // Calm pages do the same at every width (audit 2026-10-25): a page's main content must never
  // look missing on arrival (the Sermons video area sat empty on a laptop while it waited).
  const firstScreenAsIs = !full || matchMedia('(max-width: 767px)').matches;
  const inFirstScreen = (el: Element) =>
    firstScreenAsIs && el.getBoundingClientRect().top < innerHeight;
  const candidates = main.querySelectorAll<HTMLElement>(`${LINE_UNITS}, ${UP_UNITS}`);
  for (const el of candidates) {
    if (el.closest(SKIP) || isInsideTaken(el) || el.dataset.flowOn) continue;
    // Hidden things (a closed accordion's answer, an empty slot) have nothing to show.
    if (!el.getClientRects().length) continue;
    if (inFirstScreen(el)) {
      taken.add(el); // its children stay put with it
      continue;
    }
    let kind: (typeof units)[number]['kind'] = 'up';
    if (!full) {
      units.push({ el, kind });
      taken.add(el);
      continue;
    }
    // A brick-letter title is laid brick by brick rather than raised (layPlan below).
    if (el.matches('.stone-mosaic') && el.querySelector('.bl-c')) kind = 'lay';
    else if (el.matches(LINE_UNITS)) kind = 'lines';
    else if (el.matches('img, picture, .shot') && clipsChild(el)) kind = 'photo';
    // A big photo in a cropping frame also drifts inside it with the scroll (flow.css), unless it
    // is a link's picture, whose hover zoom owns its transform. Measured here, with the other
    // reads, so arming below only writes.
    const par = kind === 'photo' && el.parentElement!.offsetHeight >= 200 && !el.closest('a');
    units.push({ el, kind, par });
    taken.add(el);
  }
  // The This Sunday card slides in from the side on Home as one piece, like a photo arriving.
  const sundayCard = main.querySelector<HTMLElement>('.hb-hero__card');
  if (full && sundayCard && !sundayCard.dataset.flowOn && !inFirstScreen(sundayCard)) {
    const kept = units.filter((u) => !sundayCard.contains(u.el));
    units.length = 0;
    units.push(...kept, { el: sundayCard, kind: 'side' });
  }

  // ---- 2. Arm them: each holds its first frame until it reaches the reader ----------------
  for (const { el, kind, par } of units) {
    el.dataset.flowOn = kind;
    el.classList.add('flow', `flow--${kind}`);
    if (par) el.classList.add('flow-par');
  }
  const layUnits = units.filter((u) => u.kind === 'lay').map((u) => u.el);
  layUnits.forEach(layPlan);
  // The first screen's hold (flow.css) can let go now: everything is armed.
  html.classList.add('flow-armed');

  // Landing only takes the classes off. A split heading keeps its line spans (they change nothing
  // in the layout) so the DOM never shifts under a reader, or under a test measuring the page, a
  // second after it has settled; the spans come out when the width changes (below).
  const land = (el: HTMLElement) => {
    el.classList.remove(
      'flow',
      'flow--lines',
      'flow--lay',
      'flow--up',
      'flow--photo',
      'flow--side',
      'flow-go',
    );
    el.style.removeProperty('--flow-delay');
  };

  const go = (el: HTMLElement, delayMs: number) => {
    el.style.setProperty('--flow-delay', `${delayMs}ms`);
    el.classList.add('flow-go');
    // Take the classes off once the last piece has landed. A timer, not animationend, so a tab in
    // the background (where animations may not run) still finishes.
    const lines = el.querySelectorAll('.flow-line__in').length;
    const laid = Number(el.dataset.layMs ?? 0);
    const kind = el.dataset.flowOn;
    const own = !full
      ? CALM.up
      : laid
        ? laid + 250
        : lines
          ? (lines - 1) * LINE_STAGGER_MS + FULL.lines
          : kind === 'photo'
            ? FULL.photo
            : kind === 'side'
              ? FULL.side
              : FULL.up;
    const total = delayMs + own;
    const t = window.setTimeout(() => land(el), total + 80);
    disposers.push(() => window.clearTimeout(t));
  };

  // Lines need the real fonts to know where a heading breaks. Wait for them, but never more than
  // 600ms (a cold load on a slow phone must not sit blank): headings whose fonts are not in by
  // then fade up whole instead, since splitting on a fallback font would rewrap after the swap.
  const lineUnits = units.filter((u) => u.kind === 'lines').map((u) => u.el);
  // Calm pages split nothing, so they never wait for the fonts.
  const ready = lineUnits.length
    ? Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => window.setTimeout(r, 600)),
      ])
    : Promise.resolve();

  let firstBatch = true;
  const io = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      if (!arriving.length) return;
      // The first screen waits a beat after a navigation so it rises with the page.
      const t = full ? FULL : CALM;
      const base = firstBatch ? t.firstBase : 0;
      firstBatch = false;
      arriving.forEach((el, i) => {
        io.unobserve(el);
        go(el, base + Math.min(i, MAX_STAGGER) * t.stagger);
      });
    },
    // "top 85%": a unit starts once its top is 15% of the screen above the bottom edge.
    { rootMargin: '0px 0px -12% 0px' },
  );
  disposers.push(() => io.disconnect());

  // Keyboard focus lands its unit at once (re-audit 2026-10-26): a link reached by Tab must never sit
  // at opacity 0 waiting for the observer (flow.css shows it under :focus-within; this makes it stay).
  // The stone reveals and [data-reveal] sections around it are marked as arrived too.
  const onFocusIn = (e: FocusEvent) => {
    for (let p = e.target as Element | null; p && p !== document.body; p = p.parentElement) {
      if (!(p instanceof HTMLElement)) continue;
      if (p.dataset.flowOn && p.classList.contains('flow')) {
        io.unobserve(p);
        land(p);
      }
      if (p.classList.contains('reveal')) p.classList.add('in');
      if (p.hasAttribute('data-reveal')) p.classList.add('is-visible');
    }
  };
  document.addEventListener('focusin', onFocusIn);
  disposers.push(() => document.removeEventListener('focusin', onFocusIn));

  ready.then(() => {
    if (teardown !== stop) return; // a newer page took over while the fonts loaded
    const fontsIn = !document.fonts || document.fonts.status === 'loaded';
    const split = preview || !fontsIn ? new Set<HTMLElement>() : splitAll(lineUnits);
    for (const el of lineUnits) {
      if (!split.has(el)) {
        // Live preview keeps its text nodes whole (click-to-edit reads them); a heading that
        // will not split cleanly, or whose font is still loading, fades up instead.
        el.classList.replace('flow--lines', 'flow--up');
        el.dataset.flowOn = 'up';
      }
    }
    for (const { el } of units) io.observe(el);
  });

  // A new width rewraps headings, so the line spans come out: put each heading's own nodes back,
  // and split again the ones still waiting to rise. Height-only resizes (a phone's address bar, a
  // full-page screenshot) change no line breaks and are ignored.
  let lastWidth = innerWidth;
  let resizeTimer = 0;
  const onResize = () => {
    if (innerWidth === lastWidth) return;
    lastWidth = innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      for (const el of layUnits) if (!el.classList.contains('flow-go')) layPlan(el);
      const again: HTMLElement[] = [];
      for (const [el, restore] of [...lineRestorers]) {
        restore();
        lineRestorers.delete(el);
        if (el.classList.contains('flow--lines') && !el.classList.contains('flow-go'))
          again.push(el);
      }
      const split = splitAll(again);
      for (const el of again) if (!split.has(el)) el.classList.replace('flow--lines', 'flow--up');
    }, 150);
  };
  addEventListener('resize', onResize, { passive: true });
  disposers.push(() => {
    removeEventListener('resize', onResize);
    window.clearTimeout(resizeTimer);
  });

  // ---- 3. Scroll-tied pieces: the hero drift and the footer verse --------------------------
  if (full) disposers.push(scrubVerse());
  if (full && !CSS.supports?.('animation-timeline: view()')) disposers.push(scrubHeroFallback());

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
      lineRestorers.get(el)?.();
      lineRestorers.delete(el);
    }
    delete html.dataset.flow;
    teardown = null;
  };
  teardown = stop;
}

// ---- Laying a brick-letter title ---------------------------------------------------------------
// StoneHeading draws each word as one SVG whose bricks are grouped by course (bl-c, with --o its
// turn and --b its brick count; scripts/lib/brick-letters.mjs). Words that sit on one line share a
// bond, so a course runs across the whole line: each word learns its place on the line (--lw of
// --ln) and the line its place in the title (--line), and flow.css times every course from that.
// Each line is laid bottom course first in --tline; a longer title gets a little less per line
// so the whole thing never drags. Only custom properties change: nothing moves in the layout.
const LAY_TOTAL_MS = 1250;
const LAY_LINE_MIN_MS = 800;

function layPlan(el: HTMLElement) {
  const words = [...el.querySelectorAll<SVGSVGElement>('svg.bl-word')];
  const lines: SVGSVGElement[][] = [];
  let bottom = Number.NEGATIVE_INFINITY;
  for (const w of words) {
    const r = w.getBoundingClientRect();
    if (!lines.length || r.top >= bottom - 2) {
      lines.push([]);
      bottom = Number.NEGATIVE_INFINITY;
    }
    lines[lines.length - 1].push(w);
    bottom = Math.max(bottom, r.bottom);
  }
  const tline = Math.max(LAY_LINE_MIN_MS, LAY_TOTAL_MS / Math.max(1, lines.length));
  el.style.setProperty('--tline', `${Math.round(tline)}ms`);
  el.dataset.layMs = String(Math.round(tline * lines.length));
  lines.forEach((line, li) =>
    line.forEach((w, k) => {
      w.style.setProperty('--line', String(li));
      w.style.setProperty('--lw', String(k));
      w.style.setProperty('--ln', String(line.length));
    }),
  );
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
// StoneHeading's word drawings) stay whole. The original child nodes are kept and put back when
// the width changes or the page is left.
const lineRestorers = new Map<HTMLElement, () => void>();

// Batched so the browser lays the page out three times for all of a page's headings, not three
// times for each one (Lighthouse's "forced reflow"): every read of one phase happens before any
// write of the next. Returns the headings that split cleanly.
function splitAll(els: HTMLElement[]): Set<HTMLElement> {
  const done = new Set<HTMLElement>();
  // Phase 1, read: the heights before anything changes.
  const work = els
    .filter((el) => {
      if (lineRestorers.has(el)) done.add(el);
      return !lineRestorers.has(el);
    })
    .map((el) => ({
      el,
      original: [...el.childNodes],
      before: el.getBoundingClientRect().height,
      pieces: [] as Node[],
      lines: [] as Node[][],
    }));
  // Phase 2, write: words become spans.
  for (const w of work) {
    for (const node of w.original) {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const part of splitWords(node.textContent ?? '')) {
          if (part.space) w.pieces.push(document.createTextNode(part.text));
          else {
            const span = document.createElement('span');
            span.className = 'flow-word';
            span.textContent = part.text;
            w.pieces.push(span);
          }
        }
      } else w.pieces.push(node);
    }
    w.el.replaceChildren(...w.pieces);
  }
  // Phase 3, read: group the pieces into lines. A piece starts a new line when it begins below the
  // bottom of the line so far. Grouping by overlap, not by equal tops: StoneHeading's word
  // drawings differ in height, so words on one line do not share a top edge.
  const split = work.filter((w) => {
    let lineBottom = Number.NEGATIVE_INFINITY;
    // Text before the first word (a leading space) waits for the first line, so nothing is lost.
    const leading: Node[] = [];
    for (const piece of w.pieces) {
      if (piece.nodeType !== Node.ELEMENT_NODE) {
        if (w.lines.length) w.lines[w.lines.length - 1].push(piece);
        else leading.push(piece);
        continue;
      }
      const rects = (piece as Element).getClientRects();
      // A link or phrase that itself breaks across two lines: leave this heading alone.
      if (rects.length > 1) return false;
      const r = rects[0];
      if (!w.lines.length || (r && r.top >= lineBottom - 2)) {
        w.lines.push([]);
        lineBottom = Number.NEGATIVE_INFINITY;
      }
      if (leading.length) w.lines[0].push(...leading.splice(0));
      w.lines[w.lines.length - 1].push(piece);
      if (r) lineBottom = Math.max(lineBottom, r.bottom);
    }
    return w.lines.length > 0;
  });
  // Phase 4, write: the masks go in; headings that would not split get their own nodes back.
  for (const w of work) {
    if (!split.includes(w)) {
      w.el.replaceChildren(...w.original);
      continue;
    }
    w.el.replaceChildren(
      ...w.lines.map((nodes, i) => {
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
  }
  // Phase 5, read: the split must not move anything. A heading that came out a different height
  // is put back (after the reads, below) and fades up instead.
  const moved = split.filter((w) => Math.abs(w.el.getBoundingClientRect().height - w.before) > 1);
  for (const w of split) {
    if (moved.includes(w)) {
      w.el.replaceChildren(...w.original);
      continue;
    }
    lineRestorers.set(w.el, () => w.el.replaceChildren(...w.original));
    done.add(w.el);
  }
  return done;
}

// ---- The footer verse --------------------------------------------------------------------
// One long line of scripture slides from right to left as the footer comes up. JS, not a scroll
// timeline: the end point is "near the top of the screen, or the bottom of the page if the page
// runs out first", which a view timeline cannot express.
function scrubVerse(): () => void {
  const wrap = document.querySelector<HTMLElement>('[data-flow-verse]');
  const line = wrap?.querySelector<HTMLElement>('.sf-verse__line');
  if (!wrap || !line) return () => {};
  // Phones do not show it (flow.css), so there is nothing to slide there.
  // Checked on every update, so a phone turned to landscape past 768px picks the slide up.
  const wide = matchMedia('(min-width: 768px)');
  let frame = 0;
  let active = false;
  const update = () => {
    frame = 0;
    if (!wide.matches) {
      line.style.translate = '';
      return;
    }
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
  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  return () => {
    io.disconnect();
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    if (frame) cancelAnimationFrame(frame);
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
