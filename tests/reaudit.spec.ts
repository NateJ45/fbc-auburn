import { test, expect, type Page } from './fixtures';

// =============================================================================
// The re-audit's bugs, pinned (2026-10-26)
// =============================================================================
// 1. Keyboard focus is never invisible: tabbing through Home and the 404 with motion on, every
//    focused element's effective opacity (its own times every ancestor's) is at least 0.99. A link
//    reached before its flow or reveal unit had risen used to sit at opacity 0 ("Back to the home
//    page" on the 404 measured 0.00). src/styles/flow.css and src/scripts/flow.ts.
// 2. The phone Menu button is a real <button> once the script runs, and Space opens the dialog
//    without scrolling the page (it used to scroll 710px); Enter opens it too. MobileNav.astro.
// 3. /contact/?topic=prayer goes to /prayer/, and Contact offers no prayer topic.
// 4. Home's This week never says a time twice ("6:00 and 6:00 pm").
//
// Chromium only (the default project). NOT PORTABLE: the routes and words are this site's.
// =============================================================================

/** Tab through the page and return any focused element drawn below full opacity. */
async function tabSweep(page: Page, presses: number) {
  const faint: string[] = [];
  let seen = 0;
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    // Let a transition finish its first frame; the rule is "shows at once", so 120ms is plenty.
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      let o = 1;
      for (let n: Element | null = el; n; n = n.parentElement) {
        o *= Number(getComputedStyle(n).opacity);
      }
      const rect = el.getBoundingClientRect();
      const label = `${el.tagName.toLowerCase()} "${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40)}"`;
      return { o, label, visible: rect.width > 0 && rect.height > 0 };
    });
    if (!r || !r.visible) continue;
    seen++;
    if (r.o < 0.99) faint.push(`${r.label} at ${r.o.toFixed(2)}`);
  }
  return { faint, seen };
}

test.describe('keyboard focus is never invisible (motion on)', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 900 } });

  for (const path of ['/404.html', '/']) {
    test(`every focused element on ${path} is fully drawn`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      // Do not wait for the reveals: the bug was focus arriving before they fired.
      const { faint, seen } = await tabSweep(page, path === '/' ? 60 : 30);
      expect(seen).toBeGreaterThan(5);
      expect(faint, faint.join('\n')).toEqual([]);
    });
  }
});

test.describe('the phone Menu button', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('is a real button, and Space opens the menu without scrolling', async ({ page }) => {
    await page.goto('/plan-your-visit/', { waitUntil: 'load' });
    const pill = page.locator('[data-menu-open]');
    await expect(pill).toHaveJSProperty('tagName', 'BUTTON');
    await expect(pill).toHaveAttribute('aria-expanded', 'false');
    await pill.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('dialog[data-menu]')).toHaveJSProperty('open', true);
    await expect(pill).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-menu]')).toHaveJSProperty('open', false);
    await expect(pill).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog[data-menu]')).toHaveJSProperty('open', true);
  });
});

test.describe('prayer has one door', () => {
  test('/contact/?topic=prayer goes to the prayer page', async ({ page }) => {
    await page.goto('/contact/?topic=prayer', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/prayer\/$/);
  });

  test('Contact offers no prayer topic', async ({ page }) => {
    await page.goto('/contact/', { waitUntil: 'load' });
    await page.locator('main select').first().waitFor();
    const options = await page.locator('main select option').allTextContents();
    expect(options.length).toBeGreaterThan(0);
    expect(options.filter((o) => /pray/i.test(o))).toEqual([]);
  });
});

test('Home This week never says a time twice', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const lines = await page.locator('.hb-rhythm li').allTextContents();
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    expect(line).not.toMatch(/(\d{1,2}:\d{2}) and \1/);
  }
});
