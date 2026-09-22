import { test, expect, type Page } from '@playwright/test';
import { games, trackErrors } from './support';

const header = (page: Page) => page.getByRole('banner');
const stageHeight = (page: Page) => page.locator('.stage').evaluate(el => el.getBoundingClientRect().height);
const themeToggle = (page: Page) => page.getByRole('button', { name: /Switch to (light|dark) mode/ });

const pages = [
    { name: 'home', path: '/', title: /Nathan Gawith \| Games$/ },
    ...games.map(g => ({ name: g.title, path: `/${g.id}`, title: new RegExp(`Nathan Gawith \\| ${g.title}$`) })),
    { name: 'not found', path: '/no-such-game', title: /Nathan Gawith \| Not Found$/ }
];

for (const { name, path, title } of pages) {
    test(`${name}: header shows the page title and the theme toggle`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
        await expect(header(page)).toBeVisible();
        await expect(themeToggle(page)).toBeVisible();
    });
}

test('the theme toggle works from a game page', async ({ page }) => {
    await page.clock.install();
    await page.goto('/snake');
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await themeToggle(page).click();
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(after).not.toBe(before);
});

test('home back link points at nathangawith.com', async ({ page }) => {
    await page.goto('/');
    await expect(header(page).getByRole('link', { name: 'nathangawith.com' })).toHaveAttribute('href', 'https://nathangawith.com');
});

for (const game of games) {
    test(`${game.title}: back link returns to the game menu`, async ({ page }) => {
        await page.clock.install();
        await page.goto(`/${game.id}`);
        await header(page).getByRole('link', { name: 'Games' }).click();
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('heading', { name: game.title, exact: true })).toBeVisible();
    });
}

test('maximize is offered on game pages only', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Maximize' })).toHaveCount(0);
    await page.goto('/no-such-game');
    await expect(page.getByRole('button', { name: 'Maximize' })).toHaveCount(0);
    await page.clock.install();
    await page.goto('/snake');
    await expect(page.getByRole('button', { name: 'Maximize' })).toBeVisible();
});

for (const game of games) {
    test(`${game.title}: maximize hides the header, restore brings it back, the game keeps running`, async ({ page }) => {
        await page.clock.install();
        const errors = trackErrors(page);
        await page.goto(`/${game.id}`);
        await page.clock.runFor(500);
        const normal = await stageHeight(page);

        await page.getByRole('button', { name: 'Maximize' }).click();
        await expect(header(page)).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Restore header' })).toBeVisible();
        expect(await stageHeight(page)).toBeGreaterThan(normal);
        await page.clock.runFor(500); // still running after the size change

        await page.getByRole('button', { name: 'Restore header' }).click();
        await expect(header(page)).toBeVisible();
        expect(await stageHeight(page)).toBe(normal);
        await page.clock.runFor(500);
        expect(errors).toEqual([]);
    });
}

test('flappyfinch keeps its bird and pipes across a maximize', async ({ page }) => {
    await page.clock.install();
    await page.goto('/flappyfinch');
    await page.clock.runFor(300);
    const pipes = await page.locator('.pipe').count();
    await page.getByRole('button', { name: 'Maximize' }).click();
    await expect(page.locator('.bird')).toBeVisible();
    expect(await page.locator('.pipe').count()).toBe(pipes);
});

test('floatystars keeps its sky across a maximize', async ({ page }) => {
    await page.clock.install();
    await page.goto('/floatystars');
    await page.clock.runFor(300);
    const before = await page.locator('.snow').count();
    await page.getByRole('button', { name: 'Maximize' }).click();
    await page.clock.runFor(100);
    const after = await page.locator('.snow').count();
    expect(before).toBeGreaterThan(50);
    expect(after).toBeGreaterThan(50);
});
