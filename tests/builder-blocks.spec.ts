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

  test('Candlelight: the switch dims the band and lights the candles in turn', async ({ page }) => {
    await openWall(page);
    const band = page.locator('[data-section-type="candlelightSection"] [data-cl]');
    // No heading typed in the fixture: the default reads.
    await expect(band.locator('h2')).toHaveText('Light a candle');
    await expect(band.locator('.cl__candle')).toHaveCount(7);
    const button = band.getByRole('button', { name: 'Lights down' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    // Lights up with the script ready: cream, flames out.
    const ground = () => band.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await ground()).toBe('rgb(244, 239, 231)');
    const flame = (i: number) =>
      band
        .locator('.cl__flame')
        .nth(i)
        .evaluate((el) => getComputedStyle(el).opacity);
    expect(await flame(0)).toBe('0');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(band).toHaveAttribute('data-lights', 'down');
    // The last candle lights after the first: 6 steps of 120ms plus its own fade.
    await expect.poll(ground, { timeout: 3000 }).toBe('rgb(22, 38, 61)');
    await expect.poll(() => flame(6), { timeout: 3000 }).toBe('1');
    // Only the band dims: the page ground stays light.
    const body = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(body).not.toBe('rgb(22, 38, 61)');
    await button.click();
    await expect(band).toHaveAttribute('data-lights', 'up');
    await expect.poll(() => flame(0), { timeout: 3000 }).toBe('0');
    // The nine-candle variant draws nine, under its own heading.
    const nine = page.locator('[data-builder-checks] [data-cl]');
    await expect(nine.locator('.cl__candle')).toHaveCount(9);
    await expect(nine.locator('h2')).toHaveText('Pass the light');
  });

  test('Candlelight: reduced motion lights every candle at once, without a flicker', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openWall(page);
    const band = page.locator('[data-section-type="candlelightSection"] [data-cl]');
    await band.getByRole('button', { name: 'Lights down' }).click();
    const delays = await band
      .locator('.cl__flame')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDelay));
    expect(new Set(delays)).toEqual(new Set(['0s']));
    const anim = await band
      .locator('.cl__flicker')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe('none');
  });

  test('Candlelight without JavaScript: lit candles on cream, no switch', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.route('**/cdn.sanity.io/**', (r) =>
      r.fulfill({ path: IMAGE, contentType: 'image/jpeg' }),
    );
    await page.goto(WALL, { waitUntil: 'domcontentloaded' });
    const band = page.locator('[data-section-type="candlelightSection"] [data-cl]');
    await expect(band.getByRole('button', { name: 'Lights down' })).toHaveCount(0);
    const opacity = await band
      .locator('.cl__flame')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
    await context.close();
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
