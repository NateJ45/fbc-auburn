// FBC Auburn only (not a canonical copy): the church section library on the /styleguide/sections/
// wall (src/sanity/schemaTypes/churchSections.ts, 2026-10-18). Each block renders and behaves,
// the wall has no horizontal scroll at 320px, and axe finds nothing in the library's blocks.
//
// The wall's facts-fed blocks read Church facts, which differ between a build with the Sanity
// project (CI) and one without (a fresh clone). The checks below hold for both: the calendar
// buttons block is the one that may draw nothing (no calendar feed), and it is checked only when
// it is there.
import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { settle } from './helpers';
import type { Page } from '@playwright/test';

const WALL = '/styleguide/sections/';
const IMAGE = 'tests/visual/fixtures/layout-hero.jpg';

const ALWAYS = [
  'serviceTimesSection',
  'mapSection',
  'beliefsSection',
  'timelineSection',
  'accordionSection',
  'tabsSection',
  'scriptureSection',
  'noticeSection',
  'countdownSection',
  'givingSection',
  'livestreamSection',
  'eventsSection',
  'newsletterSection',
  'progressSection',
  'affiliationsSection',
  'buttonRowSection',
  'contactCardSection',
  'columnsSection',
  'photoSection',
  'formSection',
];

async function openWall(page: Page, formReady = true): Promise<void> {
  await page.route('**/cdn.sanity.io/**', (r) =>
    r.fulfill({ path: IMAGE, contentType: 'image/jpeg' }),
  );
  // A static server has no /api/form/; answer the readiness check the way the Worker would.
  await page.route('**/api/form/**', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ready: formReady }) })
      : r.fulfill({ contentType: 'application/json', body: '{"ok":true}' }),
  );
  // The Church Trac form band frames a churchtrac.com address; keep the wall offline.
  await page.route(/churchtrac\.com/, (r) =>
    r.request().resourceType() === 'image'
      ? r.fulfill({ path: IMAGE, contentType: 'image/jpeg' })
      : r.fulfill({ contentType: 'text/html', body: '<html><body>stand-in</body></html>' }),
  );
  await page.goto(WALL, { waitUntil: 'domcontentloaded' });
  await settle(page);
}

const block = (page: Page, type: string) => page.locator(`[data-church-block="${type}"]`);

test.describe('church section library', () => {
  test('every block renders on the wall', async ({ page }) => {
    await openWall(page);
    for (const type of ALWAYS) {
      await expect(block(page, type), type).toHaveCount(1);
    }
  });

  test('fold-out answers open, tabs switch, and the verse links to BibleGateway', async ({
    page,
  }) => {
    await openWall(page);
    const acc = block(page, 'accordionSection');
    const first = acc.locator('details').first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');

    const tabs = block(page, 'tabsSection');
    const buttons = tabs.getByRole('tab');
    await expect(buttons).toHaveCount(3);
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.getByRole('tabpanel')).toHaveCount(1);
    await buttons.nth(1).press('ArrowRight');
    await expect(buttons.nth(2)).toBeFocused();

    const ref = block(page, 'scriptureSection').getByRole('link');
    await expect(ref).toHaveAttribute(
      'href',
      /biblegateway\.com\/passage\/\?search=Psalm%2046%3A1&version=CSB/,
    );
  });

  test('dated blocks: the notice shows, the countdown counts, the progress bar reads', async ({
    page,
  }) => {
    await openWall(page);
    await expect(block(page, 'noticeSection')).toContainText('Urgent');
    const days = block(page, 'countdownSection').locator('[data-days]');
    await expect(days).toBeVisible();
    expect(Number(await days.textContent())).toBeGreaterThan(0);
    const bar = block(page, 'progressSection').getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '36');
    await expect(block(page, 'progressSection')).toContainText('$18,250');
  });

  test('the live stream video loads only when played', async ({ page }) => {
    await page.route(/youtube-nocookie\.com\/embed/, (r) =>
      r.fulfill({ contentType: 'text/html', body: '<html><body>stand-in</body></html>' }),
    );
    await openWall(page);
    const live = block(page, 'livestreamSection');
    await expect(live.locator('iframe')).toHaveCount(0);
    await live.getByRole('button', { name: /Play the video/ }).click();
    await expect(live.locator('iframe')).toHaveCount(1);
  });

  test('the form checks required answers, then sends', async ({ page }) => {
    await openWall(page);
    const form = block(page, 'formSection');
    await form.getByRole('button', { name: 'Sign me up' }).click();
    await expect(form.getByText('Please tell us your name.')).toBeVisible();
    await form.getByLabel('Your name').fill('Test visitor');
    await form.getByLabel('Your email').fill('test@example.org');
    await form.getByLabel('Which would you like to help with?').selectOption('Kitchen');
    await form.getByRole('button', { name: 'Sign me up' }).click();
    await expect(form.locator('[data-cb-done]')).toBeVisible();
  });

  test('a date and "tick any that apply" are labelled and post their answers (2026-10-26)', async ({
    page,
  }) => {
    await openWall(page);
    const seen: { body?: { answers?: unknown[] } } = {};
    await page.route('**/api/form/', (r) => {
      if (r.request().method() === 'POST') seen.body = r.request().postDataJSON();
      return r.fulfill({ contentType: 'application/json', body: '{"ok":true}' });
    });
    const form = block(page, 'formSection');
    // The tick list is a group named by its question, with a box per choice.
    const ticks = form.getByRole('group', { name: /Which Sundays could you help\?/ });
    await expect(ticks.getByRole('checkbox')).toHaveCount(4);
    await ticks.getByLabel('Second Sunday').check();
    await ticks.getByLabel('Fourth Sunday').check();
    // The date box is a real date input, with today as its earliest day.
    const date = form.getByLabel(/When could you start\?/);
    await expect(date).toHaveAttribute('type', 'date');
    await expect(date).toHaveAttribute('min', /^\d{4}-\d{2}-\d{2}$/);
    await date.fill('2099-01-04');
    await form.getByLabel('Your name').fill('Test visitor');
    await form.getByLabel('Your email').fill('test@example.org');
    await form.getByLabel('Which would you like to help with?').selectOption('Kitchen');
    await form.getByRole('button', { name: 'Sign me up' }).click();
    await expect(form.locator('[data-cb-done]')).toBeVisible();
    expect(seen.body?.answers?.[4]).toEqual(['Second Sunday', 'Fourth Sunday']);
    expect(seen.body?.answers?.[5]).toBe('2099-01-04');
  });

  test('the form says "email us instead" while forms cannot be delivered', async ({ page }) => {
    await openWall(page, false);
    const form = block(page, 'formSection');
    await expect(form.locator('[data-cb-unavailable]')).toBeVisible();
    await expect(form.locator('form')).toBeHidden();
  });

  test('calendar buttons, when the church has a calendar feed, point at the feed', async ({
    page,
  }) => {
    await openWall(page);
    const sub = block(page, 'calendarSubscribeSection');
    if ((await sub.count()) === 0) return;
    await expect(sub.getByRole('link', { name: /Google Calendar/ })).toHaveAttribute(
      'href',
      /calendar\.google\.com\/calendar\/r\?cid=webcal/,
    );
    await expect(sub.getByRole('link', { name: 'Apple Calendar' })).toHaveAttribute(
      'href',
      /^webcal:\/\//,
    );
  });

  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openWall(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('axe finds nothing in the library blocks', async ({ page }) => {
    await openWall(page);
    const results = await new AxeBuilder({ page }).include('[data-church-block]').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });
});
