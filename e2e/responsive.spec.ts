import { test, expect, type Page } from '@playwright/test';
import { games } from './support';

// The projects in playwright.config.ts run this at desktop (1280) and mobile (390) widths.
const noHorizontalOverflow = async (page: Page) =>
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

test('menu has no horizontal overflow and every play control fits the width', async ({ page }) => {
    await page.goto('/');
    await noHorizontalOverflow(page);
    for (const game of games) {
        const link = page.getByRole('link', { name: `Play ${game.title}` });
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeInViewport();
        const box = (await link.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
});

// A control or status text that must be visible on each game (FloatyStars has none).
const controls: Record<string, string | undefined> = {
    snake: 'Move',
    flappyfinch: 'Flap',
    gameoflife: 'Play / Pause',
    tetris: 'Play / Pause'
};

for (const game of games) {
    test(`${game.title} fits the viewport width and shows its controls`, async ({ page }) => {
        await page.goto(`/${game.id}`);
        await noHorizontalOverflow(page);
        const text = controls[game.id];
        if (text) await expect(page.getByText(text).first()).toBeVisible();
    });
}
