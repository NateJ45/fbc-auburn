// Safe to edit by hand
// Two Auburn-only cases the shared focus-not-obscured walk does not reach (WCAG 2.2, 2026-11-08):
// the Find your place index pinned under the header on /ministries/, and the journal chip,
// which used to fade out while one of its own links held keyboard focus.
import { test, expect } from './fixtures';
import { settle } from './helpers';

test.use({ viewport: { width: 390, height: 844 } });

test('/ministries/: Shift+Tab never lands a link under the header or the index row', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const res = await page.goto('/ministries/', { waitUntil: 'domcontentloaded' });
  test.skip(!res || res.status() !== 200, 'no /ministries/ page in this build');
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator('footer a').last().focus();
  const covered: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(150);
    const c = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom <= 0 || r.top >= innerHeight) return null;
      for (const fx of [0.1, 0.5, 0.9])
        for (const fy of [0.1, 0.5, 0.9]) {
          const t = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
          if (t && (el.contains(t) || t.contains(el))) return null;
        }
      return (el.textContent ?? '').trim().slice(0, 40);
    });
    if (c) covered.push(c);
  }
  expect(covered, 'focused links hidden under a sticky bar').toEqual([]);
});

test('the journal chip stays showing while one of its links has focus', async ({ page }) => {
  await page.goto('/journal/', { waitUntil: 'domcontentloaded' });
  const href = await page
    .locator('a[href^="/journal/"]:not([href="/journal/"])')
    .first()
    .getAttribute('href')
    .catch(() => null);
  test.skip(!href, 'no journal entries in this build');
  await page.goto(href!, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const chip = page.locator('[data-sticky-chip]');
  test.skip((await chip.count()) === 0, 'this entry has no chip');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(chip).toHaveAttribute('data-chip-visible', '');
  await page.waitForTimeout(400);
  // At the foot of the page the chip sits over the footer: it must paint on top of it, not under.
  const onTop = await chip.evaluate((c) => {
    const r = c.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && c.contains(hit);
  });
  expect(onTop, 'the chip is painted above the footer').toBe(true);
  await chip.locator('a').focus();
  // Scroll back above the threshold: the chip would normally hide here.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await expect(chip).toHaveAttribute('data-chip-visible', '');
  await expect(chip).toHaveCSS('opacity', '1');
});
