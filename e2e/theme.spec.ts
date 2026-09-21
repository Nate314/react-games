import { test, expect, type Page } from '@playwright/test';

const DARK_SURFACE = 'rgb(28, 34, 44)';
const LIGHT_SURFACE = 'rgb(255, 255, 255)';

const dataTheme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
const panelBackground = (page: Page) =>
    page.locator('.panel').first().evaluate(el => getComputedStyle(el).backgroundColor);
const storedTheme = (page: Page) => page.evaluate(() => localStorage.getItem('nate314.games.theme'));

test.describe('dark system', () => {
    test.use({ colorScheme: 'dark' });

    test('starts dark, stores nothing, and the toggle switches the whole page', async ({ page }) => {
        await page.goto('/');
        expect(await dataTheme(page)).toBe('dark');
        expect(await panelBackground(page)).toBe(DARK_SURFACE);
        expect(await storedTheme(page)).toBeNull();
        await page.getByRole('button', { name: 'Switch to light mode' }).click();
        expect(await dataTheme(page)).toBe('light');
        expect(await panelBackground(page)).toBe(LIGHT_SURFACE);
        await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
    });

    test('a stored light choice beats the dark system and survives a reload', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Switch to light mode' }).click();
        await page.reload();
        expect(await dataTheme(page)).toBe('light');
        expect(await panelBackground(page)).toBe(LIGHT_SURFACE);
        expect(await storedTheme(page)).toBe('light');
    });
});

test.describe('light system', () => {
    test.use({ colorScheme: 'light' });

    test('starts light and toggles to dark', async ({ page }) => {
        await page.goto('/');
        expect(await dataTheme(page)).toBe('light');
        expect(await panelBackground(page)).toBe(LIGHT_SURFACE);
        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        expect(await dataTheme(page)).toBe('dark');
        expect(await panelBackground(page)).toBe(DARK_SURFACE);
    });
});

test('the toggle is also on the not-found page', async ({ page }) => {
    await page.goto('/no-such-game');
    await expect(page.getByRole('button', { name: /Switch to (light|dark) mode/ })).toBeVisible();
});
