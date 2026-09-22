import { test, expect, type Page } from '@playwright/test';
import { trackErrors } from './support';

// Real timers on purpose: this checks that holding a key repeats movement on our own
// fixed-interval timer, not the browser's native (slow, delayed) keyboard auto-repeat.

// Column index of the leftmost non-background square on the board, i.e. the falling piece's
// leftmost x while nothing has locked into a blob yet.
async function leftmostPieceColumn(page: Page): Promise<number> {
    return page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.board-row'));
        let min = Infinity;
        for (const row of rows) {
            const cells = Array.from(row.children) as HTMLElement[];
            const idx = cells.findIndex(c => c.style.backgroundColor && c.style.backgroundColor !== 'black');
            if (idx !== -1) min = Math.min(min, idx);
        }
        return min;
    });
}

test('tetris: holding ArrowLeft moves the piece more than one square', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/tetris');

    // wait for the first piece to spawn (spawns on the first gravity tick)
    await expect.poll(() => leftmostPieceColumn(page)).toBeLessThan(Infinity);
    const start = await leftmostPieceColumn(page);

    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowLeft');

    const end = await leftmostPieceColumn(page);
    expect(start - end).toBeGreaterThan(1);
    expect(errors).toEqual([]);
});
