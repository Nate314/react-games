import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => { localStorage.clear(); document.documentElement.setAttribute('data-theme', 'light'); });

    it('offers the opposite theme and switches on click', async () => {
        render(<ThemeToggle />);
        await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });
    it('remembers the choice only after a click', async () => {
        render(<ThemeToggle />);
        expect(localStorage.length).toBe(0);
        await userEvent.click(screen.getByRole('button'));
        expect(localStorage.length).toBe(1);
    });
});
