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
    // The filters and the tally show only once there is a choice (2026-10-25): a menu with two
    // or more options, or more sermons than the first page.
    const menus = await page.locator('[data-sermon-filters] select').count();
    if (menus > 0) await expect(page.locator('[data-sermon-filters]')).toBeVisible();
    else await expect(page.locator('[data-sermon-filters]')).toBeHidden();
    if ((await rows.count()) > 12)
      await expect(page.locator('[data-sermon-count]')).toContainText(/sermon/);
    // The podcast is always findable, and the ghost word is gone.
    await expect(
      page.getByRole('link', { name: 'Subscribe to the podcast' }).first(),
    ).toBeVisible();
    await expect(page.locator('.watch-band__ghost')).toHaveCount(0);
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
      await expect(page.getByText('The first bulletin is not up yet.')).toBeVisible();
    } else {
      await expect(open).toHaveAttribute('href', /^https:\/\/cdn\.sanity\.io\/files\//);
    }
  });
});

test.describe('Events and Ministries (audit 2026-10-25)', () => {
  test('every weekly gathering that has a Ministries card links to it', async ({ page }) => {
    await page.goto('/events/', { waitUntil: 'domcontentloaded' });
    const links = page.locator('[data-every-week] a[href*="#fyp-"]');
    test.skip((await links.count()) === 0, 'the Events page still shows the dated week');
    for (const href of await links.evaluateAll((els) => els.map((a) => a.getAttribute('href')))) {
      const [path, id] = href!.split('#');
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    }
  });

  test('every Ministries card has one action', async ({ page }) => {
    await page.goto('/ministries/', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-fyp-card]');
    const n = await cards.count();
    test.skip(n === 0, 'no Find your place hub');
    expect(await page.locator('[data-fyp-card] .fyp-card__link').count()).toBe(n);
  });
});

test.describe('The missing page', () => {
  test('says plainly it could not find the page, with search and three ways on', async ({
    page,
  }) => {
    await page.goto('/no-such-page-here/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/could not find/i);
    for (const name of ['Plan your visit', 'Sermons', 'Events']) {
      await expect(
        page
          .getByRole('list', { name: 'Pages people often look for' })
          .getByRole('link', { name: new RegExp(name) }),
      ).toBeVisible();
    }
  });
});
