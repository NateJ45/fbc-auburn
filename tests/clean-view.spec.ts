import { test, expect } from './fixtures';

// =============================================================================
// The clean view of the pre-launch notes (ClientNotes.astro, 2026-11-09)
// =============================================================================
// While the notes layer is on, "See it as a visitor would" (or a ?clean=1 link) hides everything
// the layer adds: the yellow highlights and their brackets, the "[Jacob: ...]" asks, the "To
// confirm" tags and the photo request notes. "Show notes" brings it all back, and the choice
// follows the visitor from page to page. Also pinned: with the notes showing, Home's welcome and
// its first button sit in a laptop's first screen (the hero's video request is folded).
//
// The layer goes at launch (CLIENT_NOTES_ON), and these tests skip themselves then.
// NOT PORTABLE: Auburn's own fork of the notes layer.
// =============================================================================

const layerOn = async (page: import('@playwright/test').Page) =>
  (await page.locator('details.fj').count()) > 0;

test.describe('clean view', () => {
  test('a ?clean=1 link hides the notes layer and Show notes restores it', async ({ page }) => {
    await page.goto('/?clean=1', { waitUntil: 'load' });
    test.skip(!(await layerOn(page)), 'The notes layer is off (launched).');

    await expect(page.locator('html')).toHaveAttribute('data-clean-view', '');
    await expect(page.locator('details.fj')).toBeHidden();
    await expect(page.locator('.fj-back')).toBeVisible();
    // Nothing the layer marks is left showing, and no bracket label reads in the page's words.
    const showing = await page.evaluate(() => {
      const seen = (el: Element) => el.getClientRects().length > 0;
      return {
        marks: [
          ...document.querySelectorAll(
            '.fj-edge, .fj-mark--ask, .shot__note, .shot--tag, [data-not-confirmed], [data-unconfirmed]',
          ),
        ].filter(seen).length,
        brackets: /\[(Placeholder|Jacob):/.test(document.querySelector('main')?.innerText ?? ''),
      };
    });
    expect(showing).toEqual({ marks: 0, brackets: false });

    await page.locator('.fj-back').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-clean-view', '');
    await expect(page.locator('details.fj')).toBeVisible();
  });

  test('the choice follows the visitor to the next page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    test.skip(!(await layerOn(page)), 'The notes layer is off (launched).');

    await page.locator('.fj__pill').click();
    await page.locator('.fj__clean-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-clean-view', '');

    await page.goto('/about/', { waitUntil: 'load' });
    await expect(page.locator('html')).toHaveAttribute('data-clean-view', '');
    await expect(page.locator('.fj-back')).toBeVisible();
  });

  test('with the notes showing, the welcome and its button fit a laptop screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?clean=0', { waitUntil: 'load' });
    test.skip(!(await layerOn(page)), 'The notes layer is off (launched).');

    const heading = await page.locator('.hb-hero h1').boundingBox();
    const button = await page.locator('.hb-hero__copy a').first().boundingBox();
    expect(heading && heading.y + heading.height).toBeLessThanOrEqual(800);
    // The button starts on the first screen (its foot has about 15px to spare with the site's own
    // fonts, which a runner's fallback fonts could use up, so the top is what is pinned).
    expect(button && button.y).toBeLessThan(800);
  });
});
