import { expect, test } from '@playwright/test';

const cases = [
  ['content-factory', 'Фабрика контента'],
  ['mission-control', 'Mission Control'],
  ['savimpex', 'Savimpex'],
  ['calibry-games', 'Calibry Games'],
  ['moysklad-analytics', 'Аналитика для «МойСклад»'],
  ['mop-coins', 'Кликер МОП-коинов'],
  ['visual-novel', 'Визуальная новелла'],
] as const;

const waitForApp = async (page: import('@playwright/test').Page) => {
  await expect(page.locator('#main')).toHaveAttribute('data-ready', 'true');
};

test('direct locale routes render the complete project index', async ({ page }) => {
  await page.goto('/ru');
  await waitForApp(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('[data-project-id]')).toHaveCount(7);
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Things I have built' })).toBeVisible();
});

test('cover portrait and frameless stickers match the approved composition', async ({ page }) => {
  await page.goto('/ru');
  await waitForApp(page);

  const portrait = page.getByRole('img', { name: 'Илья Ященко' });
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('src', '/ilya-cover-cutout.png');

  const geometry = await page.evaluate(() => {
    const cover = document.querySelector<HTMLElement>('.notebook-cover');
    const coverPortrait = document.querySelector<HTMLElement>('.cover-portrait');
    if (!cover || !coverPortrait) throw new Error('Cover geometry is unavailable');
    const coverRect = cover.getBoundingClientRect();
    const portraitRect = coverPortrait.getBoundingClientRect();
    return {
      heightRatio: portraitRect.height / coverRect.height,
      centerRatio: (portraitRect.left + portraitRect.width / 2 - coverRect.left) / coverRect.width,
      mobile: innerWidth <= 760,
    };
  });
  expect(geometry.heightRatio).toBeCloseTo(geometry.mobile ? 1.56 : 2.34, 1);
  expect(geometry.centerRatio).toBeCloseTo(0.75, 1);

  const layerOrder = await page.evaluate(() => ({
    title: Number.parseInt(getComputedStyle(document.querySelector('#cover-title')!).zIndex, 10),
    portrait: Number.parseInt(getComputedStyle(document.querySelector('.cover-portrait')!).zIndex, 10),
    kicker: Number.parseInt(getComputedStyle(document.querySelector('.cover-kicker')!).zIndex, 10),
    taganrog: Number.parseInt(getComputedStyle(document.querySelector('.cover-sticker--taganrog')!).zIndex, 10),
  }));
  expect(layerOrder.title).toBeLessThan(layerOrder.portrait);
  expect(layerOrder.taganrog).toBeLessThan(layerOrder.kicker);

  for (const selector of ['.cover-sticker', '.project-sticker', '.project-count-sticker', '.contact-sticker']) {
    await expect.poll(() => page.locator(selector).first().evaluate(element => getComputedStyle(element).borderTopWidth)).toBe('0px');
  }
});

for (const [id, title] of cases) {
  test(`project sticker ${id} opens its case inline`, async ({ page }) => {
    await page.goto('/ru#projects');
    await waitForApp(page);
    await page.locator(`[data-project-id="${id}"]`).click();
    await expect(page.locator('#selected-case-title')).toHaveText(title);
    await expect(page.locator('#selected-case-title')).toBeFocused();
  });
}

test('language switch preserves the selected project and stores locale', async ({ page }) => {
  await page.goto('/ru#projects');
  await waitForApp(page);
  await page.locator('[data-project-id="calibry-games"]').click();
  await expect(page.locator('#selected-case-title')).toHaveText('Calibry Games');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(/\/en#projects$/);
  await expect(page.locator('#selected-case-title')).toHaveText('Calibry Games');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio-locale'))).toBe('en');
});

test('saved locale is restored when opening the root URL', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-locale', 'en'));
  await page.goto('/');
  await waitForApp(page);
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Things I have built' })).toBeVisible();
});

test('section tabs expose an active state and layout never overflows', async ({ page }) => {
  await page.goto('/ru');
  await waitForApp(page);
  await page.getByRole('link', { name: 'СВЯЗЬ' }).click();
  await expect(page.getByRole('link', { name: 'СВЯЗЬ' })).toHaveAttribute('aria-current', 'location');
  const dimensions = await page.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.inner);
});

test('contact labels point to the verified Telegram and email destinations', async ({ page }) => {
  await page.goto('/ru#contact');
  await waitForApp(page);
  await expect(page.locator('[data-contact="telegram"]')).toHaveAttribute('href', 'https://t.me/iluxakokojambo');
  await expect(page.locator('[data-contact="email"]')).toHaveAttribute('href', 'mailto:iliayaschenko37@gmail.com');
  await expect(page.locator('[data-contact="call"]')).toHaveAttribute('href', 'https://t.me/iluxakokojambo');
  await expect(page.locator('[data-contact="call"]')).toContainText('Telegram');
});

test('reduced motion keeps one static line-boil frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru#about');
  await waitForApp(page);
  const title = page.locator('.line-boil').first();
  await expect(title).toHaveAttribute('data-frame', '0');
  await page.waitForTimeout(500);
  await expect(title).toHaveAttribute('data-frame', '0');
});

test('all project cases remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/ru');
  await expect(page.locator('.no-js-projects article')).toHaveCount(7);
  await expect(page.locator('.no-js-projects')).toContainText('Фабрика контента');
  await context.close();
});
