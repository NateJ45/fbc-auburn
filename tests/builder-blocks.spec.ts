// FBC Auburn only (not a canonical copy): the event and holiday page blocks on the
// /styleguide/sections/ wall (src/sanity/schemaTypes/builderSections.ts, 2026-10-26). Each block
// renders, an event's past dates come down, the calendar link carries every date, the photo opening
// banner draws on an inner page, nothing scrolls sideways at 320px and axe finds nothing.
import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';
import type { Page } from '@playwright/test';

const WALL = '/styleguide/sections/';
const IMAGE = 'tests/visual/fixtures/layout-hero.jpg';

async function openWall(page: Page): Promise<void> {
  await page.route('**/cdn.sanity.io/**', (r) =>
    r.fulfill({ path: IMAGE, contentType: 'image/jpeg' }),
  );
  await page.route(/churchtrac\.com/, (r) =>
    r.fulfill({ contentType: 'text/html', body: '<html><body>stand-in</body></html>' }),
  );
  await page.goto(WALL, { waitUntil: 'domcontentloaded' });
  await settle(page);
}

const block = (page: Page, type: string) => page.locator(`[data-builder-block="${type}"]`);

test.describe('event and holiday page blocks', () => {
  test('every block renders, and an event whose dates have passed does not', async ({ page }) => {
    await openWall(page);
    // The wall's own fixture plus the no-photo variant; the past event draws nothing.
    await expect(block(page, 'eventDetailsSection')).toHaveCount(2);
    await expect(block(page, 'scheduleSection')).toHaveCount(2);
    await expect(block(page, 'photoCardsSection')).toHaveCount(2);
    await expect(page.getByText('Already happened')).toHaveCount(0);
  });

  test('the calendar link holds every date, and Directions opens a map', async ({ page }) => {
    await openWall(page);
    const event = page.locator('[data-section-type="eventDetailsSection"]');
    const cal = event.getByRole('link', { name: 'Add to my calendar' });
    await expect(cal).toHaveAttribute('download', 'christmas-eve.ics');
    const href = (await cal.getAttribute('href')) ?? '';
    expect(href.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);
    const ics = decodeURIComponent(href.split(',').slice(1).join(','));
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(ics).toContain('SUMMARY:Christmas Eve: Candlelight service');
    expect(ics).toContain('DTSTART;TZID=America/New_York:');
    const directions = event.getByRole('link', { name: 'Directions' });
    await expect(directions).toHaveAttribute('href', /google\.com\/maps/);
    // The second time on the same evening does not repeat the date.
    await expect(event.locator('.ev__day')).toHaveCount(1);
  });

  test('the photo opening banner draws on an inner page', async ({ page }) => {
    await openWall(page);
    const hero = page.locator('[data-builder-checks] .hb-hero--page');
    await expect(hero).toHaveAttribute('data-photo', 'yes');
    await expect(hero.locator('h1')).toHaveText('Christmas at Auburn');
  });

  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openWall(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('axe finds nothing in the blocks', async ({ page }) => {
    await openWall(page);
    const results = await new AxeBuilder({ page })
      .include('[data-builder-block]')
      .include('[data-builder-checks] .hb-hero')
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });
});
