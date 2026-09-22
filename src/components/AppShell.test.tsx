import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AppShell } from './AppShell';

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AppShell><Link to="/tetris">go-tetris</Link></AppShell>
        </MemoryRouter>
    );

describe('AppShell', () => {
    it.each([
        ['/', 'Nathan Gawith | Games'],
        ['/snake', 'Nathan Gawith | Snake'],
        ['/nope', 'Nathan Gawith | Not Found']
    ])('title for %s', (path, title) => {
        renderAt(path);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
    });

    it('home back link is external', () => {
        renderAt('/');
        expect(screen.getByRole('link', { name: 'nathangawith.com' })).toHaveAttribute('href', 'https://nathangawith.com');
    });

    it('game and 404 back links go to the menu', () => {
        for (const path of ['/snake', '/nope']) {
            const { unmount } = renderAt(path);
            expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/');
            unmount();
        }
    });

    it('maximize exists only on game routes', () => {
        for (const path of ['/', '/nope']) {
            const { unmount } = renderAt(path);
            expect(screen.queryByRole('button', { name: 'Maximize' })).toBeNull();
            unmount();
        }
        renderAt('/snake');
        expect(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument();
    });

    it('theme toggle is on every route', () => {
        for (const path of ['/', '/snake', '/nope']) {
            const { unmount } = renderAt(path);
            expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
            unmount();
        }
    });

    it('maximize hides the header and restore brings it back', () => {
        renderAt('/snake');
        fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
        expect(screen.queryByRole('banner')).toBeNull();
        expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Restore header' }));
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Restore header' })).toBeNull();
    });

    it('navigating resets maximize', () => {
        renderAt('/snake');
        fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
        fireEvent.click(screen.getByText('go-tetris'));
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nathan Gawith | Tetris');
    });
});
