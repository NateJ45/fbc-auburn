// Safe to edit by hand
import { test, expect } from '@playwright/test';
import { routes } from './routes';

// =============================================================================
// Printing: no words in <main> print invisible (audit 2026-10-25, DEV-H1)
// =============================================================================
// Every flow unit below the first screen waits on the first frame of a paused
// animation until it is scrolled to, and print never scrolls, so before
// src/styles/print.css a printed Plan your visit was one screen of words and
// then blank paper. Playwright's print emulation does NOT fire `beforeprint`, so
// this checks the CSS half on its own (motion.ts's beforeprint handler, which
// drops html.motion, is the belt to these braces). Motion is ON here: that is
// the case that used to fail.
// =============================================================================

// The reading pages members print, on top of the shared route list.
const PRINTED = [...new Set([...routes, '/what-we-believe/', '/prayer/', '/events/'])];

test.use({ reducedMotion: 'no-preference' });

for (const route of PRINTED) {
  test(`${route}: every word in main is visible in print`, async ({ page }) => {
    const res = await page.goto(route, { waitUntil: 'load' });
    test.skip(!res || res.status() >= 400, `${route} is not built here`);
    await page.emulateMedia({ media: 'print' });
    const hidden = await page.evaluate(() => {
      const main = document.getElementById('main');
      if (!main) return ['no main'];
      const out: string[] = [];
      for (const el of main.querySelectorAll<HTMLElement>('*')) {
        const ownText = [...el.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim(),
        );
        if (!ownText) continue;
        if (el.closest('[aria-hidden="true"], [hidden], details:not([open]) > :not(summary)'))
          continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        let opacity = 1;
        for (
          let e: HTMLElement | null = el;
          e && e !== document.documentElement;
          e = e.parentElement
        )
          opacity *= Number(getComputedStyle(e).opacity);
        if (opacity < 0.99)
          out.push(
            `${el.tagName.toLowerCase()} (${opacity.toFixed(2)}): ${el.textContent!.trim().slice(0, 50)}`,
          );
      }
      return out;
    });
    expect(hidden, `${route}: text that prints invisible`).toEqual([]);
  });
}

test('beforeprint takes the motion switch off, afterprint puts it back', async ({ page }) => {
  await page.goto('/plan-your-visit/', { waitUntil: 'load' });
  const html = page.locator('html');
  await expect(html).toHaveClass(/\bmotion\b/);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await expect(html).not.toHaveClass(/\bmotion\b/);
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(html).toHaveClass(/\bmotion\b/);
});
