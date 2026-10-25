// The sermon archive, the bulletin shortcut and the podcast feed (FBC Auburn, 2026-10-18).
// Written to hold whatever the dataset holds: with no sermons yet (the case on the day this
// shipped) the Watch band at the top must still show (the Watch page was merged into Sermons on
// 2026-10-24); once there are sermons, the
// rows, the filters and "Show more" must work. The feed is checked for Apple's required tags in
// both cases (src/lib/sermons.test.ts checks them in depth).
import { test, expect } from './fixtures';

test.describe('Sermons', () => {
  test('/sermons/ opens with the Watch band, then the sermons', async ({ page }) => {
    await page.goto('/sermons/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#sermons-watch-heading')).toBeVisible();
    const rows = page.locator('[data-sermon]');
    if ((await rows.count()) === 0) return;
    // At most twelve rows show at first; the filters appear once the script runs.
    const visible = await rows.evaluateAll(
      (els) => els.filter((e) => !(e as HTMLElement).hidden).length,
    );
    expect(visible).toBeLessThanOrEqual(12);
    await expect(page.locator('[data-sermon-filters]')).toBeVisible();
    await expect(page.locator('[data-sermon-count]')).toContainText(/sermon/);
  });

  test('a filter narrows the list and the address remembers it', async ({ page }) => {
    await page.goto('/sermons/', { waitUntil: 'domcontentloaded' });
    const book = page.locator('select[name="book"]');
    test.skip((await book.count()) === 0, 'no sermons with a recognised book yet');
    const value = await book.locator('option').nth(1).getAttribute('value');
    await book.selectOption(value!);
    await expect(page).toHaveURL(
      new RegExp(`book=${encodeURIComponent(value!).replace(/%20/g, '(\+|%20)')}`),
    );
    const shown = page.locator('[data-sermon]:not([hidden])');
    expect(await shown.count()).toBeGreaterThan(0);
    for (const b of await shown.evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).dataset.book),
    )) {
      expect(b).toBe(value);
    }
  });

  test('the podcast feed carries the tags Apple requires', async ({ request }) => {
    const res = await request.get('/sermons/podcast.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    for (const tag of [
      '<title>',
      '<description>',
      '<language>',
      '<itunes:explicit>',
      '<itunes:category text="Religion &amp; Spirituality">',
    ]) {
      expect(xml, tag).toContain(tag);
    }
    // Every episode has an enclosure with a length and a type.
    const items = xml.split('<item>').length - 1;
    const enclosures = (xml.match(/<enclosure url="[^"]+" length="\d+" type="[^"]+"\/>/g) ?? [])
      .length;
    expect(enclosures).toBe(items);
  });
});

test.describe("This week's bulletin", () => {
  test('/bulletin/ shows the newest bulletin, or says it is not up yet', async ({ page }) => {
    await page.goto('/bulletin/', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { level: 1, name: "This week's bulletin" }),
    ).toBeVisible();
    const open = page.getByRole('link', { name: /Open the bulletin/ });
    if ((await open.count()) === 0) {
      await expect(page.getByText("This week's bulletin is not up yet.")).toBeVisible();
    } else {
      await expect(open).toHaveAttribute('href', /^https:\/\/cdn\.sanity\.io\/files\//);
    }
  });
});
