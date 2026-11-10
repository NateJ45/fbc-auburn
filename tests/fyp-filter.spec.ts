import { test, expect } from './fixtures';

// =============================================================================
// Find your place filter chips (FindYourPlace.astro, src/lib/fyp-filter.ts, 2026-11-09)
// =============================================================================
// The /styleguide/sections/ fixture tags its cards, so the chips are pinned there (the live
// Ministries cards are untagged until the pastor tags them, and then no chip row shows). Pinned:
// chips only for tags in use, aria-pressed, hiding and collapsing (index entries too), the live
// region, keyboard use, All resetting, no motion under reduced motion, no sideways scroll at 320px,
// and no chips without JavaScript.
// =============================================================================

const ROUTE = '/styleguide/sections/';
const fyp = (page: import('@playwright/test').Page) =>
  page.locator('[data-fyp]').filter({ has: page.locator('[data-fyp-filter]') });

test.describe('Find your place filter', () => {
  test('a chip hides the other cards, collapses empty groups, and All resets', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    const root = fyp(page).first();
    test.skip((await root.count()) === 0, 'no tagged Find your place block on the styleguide');
    const filter = root.locator('[data-fyp-filter]');
    await expect(filter).toBeVisible();
    // One chip per tag in use, in the fixed order, after All.
    await expect(filter.locator('[data-fyp-chip]')).toHaveText([
      'All',
      'Kids',
      'Students',
      'Adults',
      'Families',
      'Sunday',
      'Weeknight',
    ]);
    const cards = root.locator('[data-fyp-card]');
    const total = await cards.count();

    await filter.getByRole('button', { name: 'Kids' }).click();
    await expect(filter.getByRole('button', { name: 'Kids' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(filter.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(root.locator('[data-fyp-card]:visible')).toHaveCount(1);
    await expect(root.locator('[data-fyp-status]')).toHaveText('1 ministry');
    // Only the Kids and youth group is left, and its index entry is the only one showing.
    await expect(root.locator('[data-fyp-group]:visible')).toHaveCount(1);
    await expect(root.locator('[data-fyp-group]:visible')).toHaveAttribute('id', 'kids-and-youth');
    await expect(root.locator('[data-fyp-index] li:visible')).toHaveCount(1);

    // Keyboard: Tab back to All and press Space.
    await filter.getByRole('button', { name: 'All' }).focus();
    await page.keyboard.press('Space');
    await expect(root.locator('[data-fyp-card]:visible')).toHaveCount(total);
    await expect(root.locator('[data-fyp-status]')).toHaveText(`${total} ministries`);
    await expect(root.locator('[data-fyp-index] li:visible')).toHaveCount(3);
  });

  test('no glide under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(ROUTE, { waitUntil: 'load' });
    const root = fyp(page).first();
    test.skip((await root.count()) === 0, 'no tagged Find your place block on the styleguide');
    await root.locator('[data-fyp-filter]').getByRole('button', { name: 'Sunday' }).click();
    const running = await root.evaluate((el) =>
      [...el.querySelectorAll('[data-fyp-card]')].reduce((n, c) => n + c.getAnimations().length, 0),
    );
    expect(running).toBe(0);
  });

  test('the chips wrap at 320px with no sideways page scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(ROUTE, { waitUntil: 'load' });
    const root = fyp(page).first();
    test.skip((await root.count()) === 0, 'no tagged Find your place block on the styleguide');
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(over).toBeLessThanOrEqual(0);
    const chipsRight = await root
      .locator('[data-fyp-chip]')
      .evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)));
    expect(chipsRight).toBeLessThanOrEqual(320);
  });
});

test.describe('Find your place filter without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('no chips, every card shows', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'load' });
    const filter = page.locator('[data-fyp-filter]').first();
    test.skip((await filter.count()) === 0, 'no tagged Find your place block on the styleguide');
    await expect(filter).toBeHidden();
    const root = fyp(page).first();
    const cards = root.locator('[data-fyp-card]');
    await expect(root.locator('[data-fyp-card]:visible')).toHaveCount(await cards.count());
  });
});
