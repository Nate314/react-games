import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, initialTheme, resolveTheme, storeTheme } from './theme';

describe('resolveTheme', () => {
    it('prefers a stored choice over the system setting', () => {
        expect(resolveTheme('light', true)).toBe('light');
        expect(resolveTheme('dark', false)).toBe('dark');
    });
    it('follows the system when nothing valid is stored', () => {
        expect(resolveTheme(null, true)).toBe('dark');
        expect(resolveTheme(null, false)).toBe('light');
        expect(resolveTheme('sepia', true)).toBe('dark');
    });
});

describe('theme storage and DOM', () => {
    beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });
    afterEach(() => { localStorage.clear(); });

    it('applyTheme sets data-theme on the root element', () => {
        applyTheme('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    it('initialTheme reads what storeTheme saved', () => {
        storeTheme('light');
        expect(initialTheme()).toBe('light');
    });
    it('initialTheme writes nothing to storage on its own', () => {
        initialTheme();
        expect(localStorage.length).toBe(0);
    });
});
