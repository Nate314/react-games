import { test, expect, type Page } from '@playwright/test';
import { hud, trackErrors } from './support';

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
    await expect(hud(page)).toContainText(/Score\s*0/);
    const before = await colors(page, '.snakesquare');
    await page.keyboard.press('ArrowDown');
    await page.clock.runFor(1500);
    expect(await colors(page, '.snakesquare')).not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.getByText('Paused')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Paused')).toBeHidden();
    await page.keyboard.press('r');
    await expect(hud(page)).toContainText(/Score\s*0/);
    expect(errors).toEqual([]);
});

test('snake: HUD Reset and Pause buttons work like the keyboard', async ({ page }) => {
    await open(page, 'snake');
    const badge = hud(page).getByRole('status');
    await expect(badge).toHaveCount(0);
    await hud(page).getByRole('button', { name: /Pause/ }).click(); // the HUD control, not the key
    await expect(badge).toHaveText('Paused');
    const paused = await colors(page, '.snakesquare');
    await page.clock.runFor(1000);
    expect(await colors(page, '.snakesquare')).toBe(paused); // movement stops while paused
    await hud(page).getByRole('button', { name: /Pause/ }).click();
    await expect(badge).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await page.clock.runFor(1500);
    const moved = await colors(page, '.snakesquare');
    expect(moved).not.toBe(paused);
    await hud(page).getByRole('button', { name: /Reset/ }).click(); // the HUD control, not the key
    await expect(hud(page)).toContainText(/Score\s*0/);
    expect(await colors(page, '.snakesquare')).not.toBe(moved); // board is back to a fresh start
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
    await expect(hud(page)).toContainText(/Score\s*0/);
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
    expect(await colors(page, sel)).toContain('green'); // starts on a random board, not a blank one
    await page.keyboard.press('Escape'); // pause so generations do not change the board
    await hud(page).getByRole('button', { name: /Clear all/ }).click(); // the HUD control, not the key
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
    await expect(hud(page)).toContainText(/Score\s*0/);
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

test('tetris: HUD Reset control clears the board and resets the score', async ({ page }) => {
    await open(page, 'tetris');
    const sel = '.gameoflifesquare[style*="background-color"]';
    const start = await colors(page, sel);
    await page.clock.runFor(1000); // let a piece spawn and fall
    await page.keyboard.press('ArrowLeft');
    await page.clock.runFor(2000);
    const moved = await colors(page, sel);
    expect(moved).not.toBe(start); // board now has locked/falling pieces on it
    await hud(page).getByRole('button', { name: /Reset/ }).click(); // the HUD control, not the key
    await expect(hud(page)).toContainText(/Score\s*0/);
    expect(await colors(page, sel)).toBe(start); // board is back to a fresh, empty start
    await expect(hud(page).getByRole('status')).toHaveCount(0); // no Game Over / Paused badge
});

for (const id of ['gameoflife', 'tetris']) {
    test(`${id}: pausing shows a Paused badge in the HUD`, async ({ page }) => {
        await page.clock.install();
        await page.goto(`/${id}`);
        const badge = hud(page).getByRole('status');
        await expect(badge).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(badge).toHaveText('Paused');
        await page.keyboard.press('Escape');
        await expect(badge).toHaveCount(0);
        await hud(page).getByRole('button', { name: /Play \/ Pause/ }).click(); // the HUD control pauses too
        await expect(badge).toHaveText('Paused');
    });
}
