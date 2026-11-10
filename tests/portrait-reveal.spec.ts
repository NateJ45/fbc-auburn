// Safe to edit by hand
import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Portraits open in brick courses (flow layer, 2026-11-09)
// =============================================================================
// A person's photo ([data-flow-portrait]: PersonCard, ImageText's portrait slots, the signer's
// face on Home) is uncovered in four running-bond courses as it scrolls in (src/scripts/flow.ts
// kind 'portrait', src/styles/flow.css). The safety rules pinned here: with reduced motion or with
// no JavaScript the photo is simply there, with no mask and no flow class, from the first frame;
// with motion on it is armed below the fold, reveals once, and hands back its plain markup; one
// already on the first screen is left alone like every other unit.
// In the committed snapshot, Home's "Meet Pastor Jacob" sits far below the fold and the
// leadership page's "Jacob Wysong" sits on the first screen.
// =============================================================================

const HOME = '/';
const LEADERSHIP = '/leadership/';
const PORTRAIT = '[data-flow-portrait]';

async function portraitState(page: Page) {
  return page
    .locator(PORTRAIT)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        flowOn: (el as HTMLElement).dataset.flowOn ?? null,
        armed: el.classList.contains('flow--portrait'),
        mask: cs.maskImage,
        opacity: Number(cs.opacity),
        motion: document.documentElement.classList.contains('motion'),
      };
    });
}

test.describe('Portrait reveal, motion on', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('armed below the fold, revealed once on arrival, then plain', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'load' });
    const portrait = page.locator(PORTRAIT).first();
    // Armed (held in its first frame, every course empty) while it waits below the fold.
    await expect.poll(async () => (await portraitState(page)).armed).toBe(true);
    const armed = await portraitState(page);
    expect(armed.flowOn).toBe('portrait');
    expect(armed.mask).toContain('linear-gradient');
    await portrait.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    // Lands within its 600ms plus the stagger: the class goes and the mask with it.
    await expect.poll(async () => (await portraitState(page)).armed, { timeout: 3000 }).toBe(false);
    const landed = await portraitState(page);
    expect(landed.mask).toBe('none');
    expect(landed.opacity).toBe(1);
    // Once per element: scrolling away and back does not arm it again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await portrait.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(150);
    expect((await portraitState(page)).armed).toBe(false);
  });

  test('a portrait on the first screen is left as it is', async ({ page }) => {
    await page.goto(LEADERSHIP, { waitUntil: 'load' });
    await expect(page.locator(PORTRAIT)).not.toHaveCount(0);
    await page.waitForTimeout(700);
    const s = await portraitState(page);
    expect(s.motion).toBe(true);
    expect(s.armed).toBe(false);
    expect(s.mask).toBe('none');
  });
});

for (const route of [HOME, LEADERSHIP]) {
  test.describe(`Portrait reveal, reduced motion, ${route}`, () => {
    test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });

    test('the photo is at rest at once: no mask, no flow class', async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const s = await portraitState(page);
      expect(s.motion).toBe(false);
      expect(s.armed).toBe(false);
      expect(s.flowOn).toBeNull();
      expect(s.mask).toBe('none');
      expect(s.opacity).toBe(1);
    });
  });

  test.describe(`Portrait reveal, no JavaScript, ${route}`, () => {
    test.use({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });

    test('the photo is visible with JS off', async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const portrait = page.locator(PORTRAIT).first();
      await portrait.scrollIntoViewIfNeeded();
      await expect(portrait).toBeVisible();
      const s = await portraitState(page);
      expect(s.motion).toBe(false);
      expect(s.armed).toBe(false);
      expect(s.mask).toBe('none');
      expect(s.opacity).toBe(1);
    });
  });
}
