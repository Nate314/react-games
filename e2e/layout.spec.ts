import { test, expect, type Page } from '@playwright/test';
import { hud } from './support';

// The board squares differ per game; the HUD sits under the board at the board's width, or at its 320px
// minimum when the board is narrower (phones).
const boards = [
    { id: 'snake', cell: '.snakesquare' },
    { id: 'gameoflife', cell: '.gameoflifesquare' },
    { id: 'tetris', cell: '.gameoflifesquare' }
];

async function boardWidth(page: Page, cell: string) {
    return page.locator(cell).evaluateAll(els => {
        const boxes = els.map(e => e.getBoundingClientRect());
        return Math.max(...boxes.map(b => b.right)) - Math.min(...boxes.map(b => b.left));
    });
}

for (const { id, cell } of boards) {
    test(`${id}: the HUD matches the board width and fits below the header`, async ({ page }) => {
        await page.clock.install();
        await page.goto(`/${id}`);
        const width = async () => (await hud(page).boundingBox())!.width;
        const matchesBoard = async () => {
            const [h, b] = [await width(), await boardWidth(page, cell)];
            expect(h).toBeGreaterThanOrEqual(b - 4);
            expect(h).toBeLessThanOrEqual(Math.max(b, 320) + 4);
        };
        await matchesBoard();
        const box = (await hud(page).boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);

        await page.getByRole('button', { name: 'Maximize' }).click();
        await page.waitForTimeout(100);
        await matchesBoard();
    });
}

for (const { id, cell } of boards) {
    test(`${id}: the board and HUD are centered in the stage`, async ({ page }) => {
        await page.clock.install();
        await page.goto(`/${id}`);
        const offCenter = async () => page.evaluate(cellSelector => {
            const stage = document.querySelector('.stage')!.getBoundingClientRect();
            const boxes = [...document.querySelectorAll(cellSelector)].map(e => e.getBoundingClientRect());
            const boardLeft = Math.min(...boxes.map(b => b.left)) - stage.left;
            const boardRight = stage.right - Math.max(...boxes.map(b => b.right));
            const hud = document.querySelector('.hud')!.getBoundingClientRect();
            return {
                board: Math.abs(boardLeft - boardRight),
                hud: Math.abs((hud.left - stage.left) - (stage.right - hud.right))
            };
        }, cell);

        let offset = await offCenter();
        expect(offset.board).toBeLessThanOrEqual(4);
        expect(offset.hud).toBeLessThanOrEqual(4);

        await page.getByRole('button', { name: 'Maximize' }).click();
        await page.waitForTimeout(100);
        offset = await offCenter();
        expect(offset.board).toBeLessThanOrEqual(4);
        expect(offset.hud).toBeLessThanOrEqual(4);
    });
}
