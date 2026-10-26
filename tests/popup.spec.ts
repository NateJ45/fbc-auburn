import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

// =============================================================================
// The popup's guard rails (2026-10-26; src/components/SitePopup.astro)
// =============================================================================
// Drives /styleguide/popup/ (src/pages/styleguide/popup.astro), SitePopup with fixed words.
// The clock is Playwright's, so "4 seconds" costs nothing. Pins: it never opens before 4 s or
// before a quarter screen of scroll; it opens as a modal with focus on Close; Escape closes it
// and focus goes back; it is remembered (no second showing on reload); it never shows in print;
// the Studio route never carries one. FBC Auburn only.
// =============================================================================

const ROUTE = '/styleguide/popup/';
const isOpen = (page: import('@playwright/test').Page) =>
  page.evaluate(() => !!document.querySelector<HTMLDialogElement>('dialog[data-popup]')?.open);

test.describe('popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test('waits for 4 seconds AND a little scroll, then opens with focus on Close', async ({
    page,
  }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.clock.runFor(6000);
    expect(await isOpen(page), 'time alone does not open it').toBe(false);

    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(1500);
    expect(await isOpen(page), 'scroll alone, before 4 s, does not open it').toBe(false);

    await page.clock.runFor(3500);
    await expect(page.locator('dialog[data-popup]')).toBeVisible();
    await expect(
      page.getByRole('dialog', { name: 'Christmas Eve candlelight service' }),
    ).toBeVisible();
    await expect(page.locator('[data-popup-close]')).toBeFocused();
    await expect(page.getByRole('link', { name: 'See the details' })).toHaveAttribute(
      'href',
      '/plan-your-visit/',
    );
  });

  test('Escape closes it, focus returns, and it is not shown again', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.locator('#opener-link').focus();
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(5000);
    expect(await isOpen(page)).toBe(true);

    // Tab stays inside: Close -> the button -> Close.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-popup-close]')).toBeFocused();

    await page.keyboard.press('Escape');
    expect(await isOpen(page)).toBe(false);
    await expect(page.locator('#opener-link')).toBeFocused();

    await page.reload({ waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(6000);
    expect(await isOpen(page), 'remembered for this visitor').toBe(false);
  });

  test('the Close button closes it', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(5000);
    await page.locator('[data-popup-close]').click();
    expect(await isOpen(page)).toBe(false);
  });

  test('the open popup passes axe', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(5000);
    expect(await isOpen(page)).toBe(true);
    const results = await new AxeBuilder({ page }).include('dialog[data-popup]').analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('never shows in print', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(5000);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('dialog[data-popup]')).toBeHidden();
  });

  test('no popup markup on a page without one, or on the Studio', async ({ page }) => {
    await page.goto('/about/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('dialog[data-popup]')).toHaveCount(0);
    await page.goto('/studio/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('dialog[data-popup]')).toHaveCount(0);
  });
});

test.describe('popup under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('opens without animating', async ({ page }) => {
    await page.clock.install();
    await page.goto(ROUTE, { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.clock.runFor(5000);
    const anim = await page.evaluate(
      () => getComputedStyle(document.querySelector('dialog[data-popup]')!).animationName,
    );
    expect(anim).toBe('none');
  });
});
