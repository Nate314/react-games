import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { games } from './support';

async function seriousViolations(page: Page) {
    const { violations } = await new AxeBuilder({ page }).analyze();
    return violations
        .filter(v => v.impact === 'serious' || v.impact === 'critical')
        .map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(', ')}`);
}

const pages = [{ name: 'menu', path: '/' }, ...games.map(g => ({ name: g.title, path: `/${g.id}` }))];

for (const scheme of ['light', 'dark'] as const) {
    test.describe(`${scheme} theme`, () => {
        test.use({ colorScheme: scheme });
        for (const { name, path } of pages) {
            test(`${name} has no serious or critical axe violations`, async ({ page }) => {
                await page.clock.install();
                await page.goto(path);
                expect(await seriousViolations(page)).toEqual([]);
            });
        }
    });
}
