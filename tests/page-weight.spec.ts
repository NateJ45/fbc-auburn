// FBC Auburn only (not a canonical copy): the 2026-10-25 page-weight and structured-data pass
// (audit DEV-M1, M2, M5, M7, M8, L7). What it pins:
//   - every page's inline CSS was purged of rules it cannot use (scripts/purge-page-css.mjs) and
//     the page still draws its header and footer;
//   - the text fonts and textures come from /_astro/ (hashed, cached a year), never /fonts/ or
//     /textures/;
//   - the copy-email button works without React and says so in its own live region;
//   - Plan your visit carries exactly one FAQPage; the 404 carries no canonical;
//   - the first photo under a page head loads eagerly at high priority.
import { test, expect } from './fixtures';

const jsonLd = async (page: import('@playwright/test').Page) =>
  page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => JSON.parse(e.textContent || '{}')),
  );

test('fonts and textures are hashed files under /_astro/', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(new URL(r.url()).pathname));
  await page.goto('/');
  await page.waitForLoadState('load');
  const preloads = await page.$$eval('link[rel="preload"][as="font"]', (els) =>
    els.map((e) => e.getAttribute('href') ?? ''),
  );
  expect(preloads.length).toBeGreaterThan(0);
  for (const href of preloads) expect(href).toMatch(/^\/_astro\/.+\.woff2$/);
  expect(urls.filter((u) => u.startsWith('/textures/') || /^\/fonts\/.+\.woff2$/.test(u))).toEqual(
    [],
  );
});

test('the purged page CSS still styles the header and footer', async ({ page }) => {
  await page.goto('/plan-your-visit/');
  const header = page.locator('header').first();
  await expect(header).toBeVisible();
  // The footer keeps its dark band (a rule the purge must not drop).
  const bg = await page
    .locator('footer')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});

test('Plan your visit has one FAQPage and the Church data', async ({ page }) => {
  await page.goto('/plan-your-visit/');
  const ld = await jsonLd(page);
  const types = ld.map((l) => l['@type']);
  // Strict since 2026-10-25: CI used to build with no project id, so sanityFetch skipped the
  // snapshot and this page had only the breadcrumb (the env is now set in ci.yml). A snapshot
  // refresh that drops the Questions block updates this test in the same PR.
  expect(types).toContain('Church');
  await expect(page.locator('main [data-slot="accordion-trigger"]').first()).toBeAttached();
  expect(types.filter((t) => t === 'FAQPage')).toHaveLength(1);
  const faq = ld.find((l) => l['@type'] === 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThan(0);
  expect(faq.mainEntity[0].acceptedAnswer.text).toBeTruthy();
});

test('the 404 page has no canonical', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('the first photo under the page head is eager and high priority', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/ministries/');
  // The pinned snapshot gives Ministries' first Find your place card a photo (pre-launch, a
  // "Photo needed" example). If a refresh leaves it stone icons only, move this to a page
  // that keeps a photo first (About or Leadership) in the same PR.
  const img = page.locator('main img:not(.stone-icon)').first();
  await expect(img).toHaveAttribute('loading', 'eager');
  await expect(img).toHaveAttribute('fetchpriority', 'high');
});

test('the copy-email button copies and says so', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are a Chromium feature');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const host = page.locator('footer [data-copy-email]').first();
  test.skip((await host.count()) === 0, 'no email in Church facts on this build');
  const email = await host.getAttribute('data-copy-email');
  await host.locator('.copy-email__btn').click();
  await expect(host.locator('[data-copy-email-status]')).toHaveText('Email address copied');
  await expect(host.locator('.copy-email__check')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
});
