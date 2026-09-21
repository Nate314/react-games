import { test, expect } from '@playwright/test';
import { games } from './support';

test('menu lists every game', async ({ page }) => {
    await page.goto('/');
    for (const game of games) {
        await expect(page.getByRole('heading', { name: game.title, exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: `Play ${game.title}` })).toBeVisible();
    }
});

for (const game of games) {
    test(`${game.title} card opens its route and back returns to the menu`, async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: `Play ${game.title}` }).click();
        await expect(page).toHaveURL(new RegExp(`/${game.id}$`));
        await expect.poll(async () => (await page.title()).replace(/ /g, '').toLowerCase()).toContain(game.title.toLowerCase());
        await page.goBack();
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('heading', { name: game.title, exact: true })).toBeVisible();
    });
}

test('unknown path shows NotFound with a way home', async ({ page }) => {
    await page.goto('/no-such-game');
    await expect(page.getByText('NOT FOUND')).toBeVisible();
    await page.getByRole('link', { name: 'Go back home' }).click();
    await expect(page).toHaveURL(/\/$/);
});
