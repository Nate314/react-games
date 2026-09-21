import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';

// The shared score/controls panel every game with a score or controls renders.
export const hud = (page: Page) => page.getByRole('group', { name: 'Game status and controls' });

// Collects console errors and uncaught page errors.
export function trackErrors(page: Page): string[] {
    const errors: string[] = [];
    const add = (text: string) => { errors.push(text); };
    page.on('console', msg => { if (msg.type() === 'error') add(msg.text()); });
    page.on('pageerror', err => add(err.message));
    return errors;
}

// Game ids and titles read from the registry source. Importing registry.ts directly would pull
// the games' CSS and React components into Playwright's Node loader, which cannot handle them.
export const games: { id: string; title: string }[] = [
    ...readFileSync(resolve('src/games/registry.ts'), 'utf8')
        .matchAll(/id: '([^']+)', title: '([^']+)'/g)
].map(([, id, title]) => ({ id, title }));
