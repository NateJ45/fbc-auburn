// FBC Auburn only (not a canonical copy): the Home hero's background video (2026-10-25).
// Drives /styleguide/home-hero/ (src/pages/styleguide/home-hero.astro), Home's hero with fixed
// data and a clip set, and Home itself, which has no clip in the CI snapshot. The rules are in
// src/lib/hero-video.ts (unit tested there); this checks the page keeps them:
//   - reduced motion: the still photo, and no <video> at all (nothing is downloaded);
//   - otherwise: the photo paints first and is the clip's poster, the clip is muted, has no
//     controls and takes no clicks, and the Pause button is a real, keyboard-reachable toggle;
//   - Home with no clip: the photo hero exactly as before, no video and no button.
// Playback itself is not asserted: Playwright's browsers differ on H.264.
import { test, expect, type Page } from '@playwright/test';
import { join } from 'node:path';

const ROUTE = '/styleguide/home-hero/';
const FIXTURE = join(process.cwd(), 'tests', 'visual', 'fixtures', 'layout-hero.jpg');

async function load(page: Page) {
  await page.route('**/cdn.sanity.io/**', (route) =>
    route.fulfill({ path: FIXTURE, contentType: 'image/jpeg' }),
  );
  await page.goto(ROUTE, { waitUntil: 'load' });
}

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero shows the still photo and no video', async ({ page }) => {
    await load(page);
    await expect(page.locator('.hb-photo img').first()).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.locator('.hb-hero video')).toHaveCount(0);
    await expect(page.locator('[data-hero-video-toggle]')).toBeHidden();
  });
});

test.describe('by default', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the photo is the poster, and the clip is silent and untouchable', async ({ page }) => {
    await load(page);
    const still = page.locator('.hb-photo img').first();
    await expect(still).toBeVisible();
    const clip = page.locator('.hb-hero video');
    await expect(clip).toHaveCount(1);
    const stillSrc = await still.evaluate((img) => (img as HTMLImageElement).currentSrc);
    const facts = await clip.evaluate((v) => {
      const el = v as HTMLVideoElement;
      return {
        poster: el.poster,
        muted: el.muted,
        controls: el.controls,
        loop: el.loop,
        playsInline: el.playsInline,
        hidden: el.getAttribute('aria-hidden'),
        pointer: getComputedStyle(el).pointerEvents,
        source: el.querySelector('source')?.getAttribute('src'),
      };
    });
    expect(facts.poster).toBe(stillSrc);
    expect(facts).toMatchObject({
      muted: true,
      controls: false,
      loop: true,
      playsInline: true,
      hidden: 'true',
      pointer: 'none',
      source: '/shot-examples/sermon.mp4',
    });
  });

  test('the Pause button is reachable by keyboard and toggles the clip', async ({ page }) => {
    await load(page);
    const toggle = page.locator('[data-hero-video-toggle]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveText(/Pause video/);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveText(/Play video/);
    expect(
      await page.locator('.hb-hero video').evaluate((v) => (v as HTMLVideoElement).paused),
    ).toBe(true);
    // The choice is remembered on this device.
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('[data-hero-video-toggle]')).toHaveAttribute('aria-pressed', 'true');
  });
});

test('Home with no clip keeps the photo hero and adds no video', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('.hb-hero')).toBeVisible();
  await expect(page.locator('.hb-hero')).not.toHaveAttribute('data-hero-video', /.+/);
  await expect(page.locator('.hb-hero video')).toHaveCount(0);
  await expect(page.locator('[data-hero-video-toggle]')).toHaveCount(0);
});
