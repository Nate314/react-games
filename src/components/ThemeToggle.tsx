import { useState } from 'react';
import { applyTheme, initialTheme, storeTheme, type Theme } from '../theme';

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        const applied = document.documentElement.getAttribute('data-theme');
        return applied === 'light' || applied === 'dark' ? applied : initialTheme();
    });
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const label = `Switch to ${next} mode`;

    const toggle = () => {
        applyTheme(next);
        storeTheme(next);
        setTheme(next);
    };

    return (
        <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={toggle}>
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
