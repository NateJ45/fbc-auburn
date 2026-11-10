// FBC Auburn only: the sermon series as a list with one large picture (2026-11-09,
// src/components/collections/SeriesPreviewList.astro). The committed CI snapshot has no series, so
// this runs on the /styleguide/sections/ wall's three-series fixture. On a wide screen with a
// mouse the list shows and the cards hide; hovering or tabbing to a row brings its picture up
// without moving anything; on a phone the cards show as before, and nothing scrolls sideways.
import { test, expect } from './fixtures';
import { settle } from './helpers';
import type { Page } from '@playwright/test';

const WALL = '/styleguide/sections/';
const IMAGE = 'tests/visual/fixtures/layout-hero.jpg';

async function openWall(page: Page): Promise<void> {
  await page.route('**/cdn.sanity.io/**', (r) =>
    r.fulfill({ path: IMAGE, contentType: 'image/jpeg' }),
  );
  await page.goto(WALL, { waitUntil: 'domcontentloaded' });
  await settle(page);
}

const activeArt = (page: Page) =>
  page.locator('[data-series-preview] [data-series-art][data-active]');

test.describe('series list with a preview', () => {
  test('wide screen: the list replaces the cards, hover and focus swap the picture', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openWall(page);
    const list = page.locator('[data-series-preview]');
    await expect(list).toBeVisible();
    await expect(page.locator('.c-grid--has-preview')).toBeHidden();
    const rows = list.locator('a[data-series-index]');
    await expect(rows).toHaveCount(3);
    // Each row carries its title, its count and its span, and links to its series page.
    await expect(rows.nth(0)).toContainText('6 sermons');
    await expect(rows.nth(0)).toHaveAttribute('href', /\/sermons\/series\//);
    await expect(list.locator('.c-slist__panel')).toHaveAttribute('aria-hidden', 'true');
    await expect(activeArt(page)).toHaveAttribute('data-series-art', '0');

    // Nothing moves when the picture changes: the panel and the list keep their size and place on
    // the page (measured in page coordinates, so the scroll that hover causes does not count).
    await list.scrollIntoViewIfNeeded();
    const measure = () =>
      list.evaluate((el) => {
        const box = (n: Element) => {
          const r = n.getBoundingClientRect();
          return [r.width, r.height, r.top + window.scrollY, r.left];
        };
        return [box(el), box(el.querySelector('.c-slist__panel')!)];
      });
    const before = await measure();
    await rows.nth(2).hover();
    await expect(activeArt(page)).toHaveCount(1);
    await expect(activeArt(page)).toHaveAttribute('data-series-art', '2');
    expect(await measure()).toEqual(before);

    await rows.nth(0).focus();
    await page.keyboard.press('Tab');
    await expect(rows.nth(1)).toBeFocused();
    await expect(activeArt(page)).toHaveAttribute('data-series-art', '1');
  });

  test('phone: the cards stay, the list never shows, nothing scrolls sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openWall(page);
    await expect(page.locator('[data-series-preview]')).toBeHidden();
    await expect(page.locator('.c-grid--has-preview')).toBeVisible();
    const wide = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(wide).toBe(true);
  });
});
