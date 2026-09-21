export type Theme = 'light' | 'dark';

const storageKey = 'nate314.games.theme';

export const resolveTheme = (stored: string | null, systemPrefersDark: boolean): Theme =>
    stored === 'light' || stored === 'dark' ? stored : systemPrefersDark ? 'dark' : 'light';

// Storage can throw (private windows, blocked site data); the theme must still work without it.
const readStored = (): string | null => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
};

export const storeTheme = (theme: Theme): void => {
    try { localStorage.setItem(storageKey, theme); } catch { /* choice just will not persist */ }
};

export const initialTheme = (): Theme =>
    resolveTheme(readStored(), window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

export const applyTheme = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme);
};
