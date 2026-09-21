import { test, expect, type Page } from '@playwright/test';
import { trackErrors } from './support';

// Timing is driven by page.clock so games advance deterministically.
async function open(page: Page, id: string) {
    await page.clock.install();
    const errors = trackErrors(page);
    await page.goto(`/${id}`);
    return errors;
}

// Background colors of every element matching the selector, as one string.
const colors = (page: Page, selector: string) =>
    page.locator(selector).evaluateAll(els => els.map(e => (e as HTMLElement).style.backgroundColor).join('|'));

test('snake: loads clean, accepts keys, pauses and resets', async ({ page }) => {
    const errors = await open(page, 'snake');
    await expect(page.getByText('Score: 0', { exact: true })).toBeVisible();
    const before = await colors(page, '.snakesquare');
    await page.keyboard.press('ArrowDown');
    await page.clock.runFor(1500);
    expect(await colors(page, '.snakesquare')).not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.getByText('Paused')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Paused')).toBeHidden();
    await page.keyboard.press('r');
    await expect(page.getByText('Score: 0', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test('floatystars: loads clean and the stars move', async ({ page }) => {
    const errors = await open(page, 'floatystars');
    const snapshot = () => page.locator('.snow').evaluateAll(els =>
        els.map(e => (e as HTMLElement).style.top + (e as HTMLElement).style.left).join('|'));
    await expect(page.locator('.snow').first()).toBeAttached();
    const before = await snapshot();
    await page.clock.runFor(1000);
    expect(await snapshot()).not.toBe(before);
    expect(errors).toEqual([]);
});

test('flappyfinch: loads clean, flaps, pauses and resets', async ({ page }) => {
    const errors = await open(page, 'flappyfinch');
    await expect(page.getByText('Score:').first()).toBeVisible();
    const bird = page.locator('.bird');
    await page.clock.runFor(500);
    const before = await bird.evaluate(e => (e as HTMLElement).style.top);
    await page.keyboard.press(' ');
    await page.clock.runFor(200);
    await expect.poll(() => bird.evaluate(e => (e as HTMLElement).style.top)).not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.getByText('PAUSED')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.keyboard.press('r');
    await expect(page.getByText('PAUSED')).toBeHidden();
    expect(errors).toEqual([]);
});

test('gameoflife: loads clean, toggles cells and fills the board', async ({ page }) => {
    const errors = await open(page, 'gameoflife');
    const sel = '.gameoflifesquare[style*="background-color"]';
    await page.keyboard.press('Escape'); // pause so generations do not change the board
    await page.keyboard.press('c');
    const cleared = await colors(page, sel);
    await page.locator(sel).first().click();
    expect(await colors(page, sel)).not.toBe(cleared);
    await page.keyboard.press('a');
    expect(await colors(page, sel)).toContain('green');
    await page.clock.runFor(1000);
    expect(errors).toEqual([]);
});

test('tetris: loads clean, pieces fall and move with the keyboard', async ({ page }) => {
    const errors = await open(page, 'tetris');
    const sel = '.gameoflifesquare[style*="background-color"]';
    await expect(page.getByText('Score: 0', { exact: true })).toBeVisible();
    const start = await colors(page, sel);
    await page.clock.runFor(1000); // first piece spawns on a tick
    const spawned = await colors(page, sel);
    expect(spawned).not.toBe(start);
    await page.keyboard.press('ArrowLeft');
    const moved = await colors(page, sel);
    expect(moved).not.toBe(spawned);
    await page.clock.runFor(3000);
    expect(await colors(page, sel)).not.toBe(moved);
    expect(errors).toEqual([]);
});
