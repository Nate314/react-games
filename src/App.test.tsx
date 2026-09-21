import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { games } from './games/registry';
import { App } from './App';

// Real games start timers and audio; stub them so routing is what is under test.
vi.mock('./games/Snake', () => ({ default: () => <div>snake-screen</div> }));
vi.mock('./games/FloatyStars', () => ({ default: () => <div>floatystars-screen</div> }));
vi.mock('./games/FlappyFinch', () => ({ default: () => <div>flappyfinch-screen</div> }));
vi.mock('./games/GameOfLife', () => ({ default: () => <div>gameoflife-screen</div> }));
vi.mock('./games/Tetris', () => ({ default: () => <div>tetris-screen</div> }));

const renderAt = (path: string) =>
    render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('App', () => {
    it('registry has five games with unique ids', () => {
        expect(new Set(games.map(g => g.id)).size).toBe(games.length);
        expect(games.length).toBe(5);
    });

    it('menu shows one card per registry entry', () => {
        renderAt('/');
        expect(screen.getAllByRole('article')).toHaveLength(games.length);
        for (const game of games) {
            expect(screen.getByRole('heading', { name: game.title })).toBeInTheDocument();
        }
    });

    it('each card links to /<id>', () => {
        renderAt('/');
        for (const game of games) {
            const card = screen.getByRole('heading', { name: game.title }).closest('article')!;
            expect(within(card).getByRole('link', { name: /play/i })).toHaveAttribute('href', `/${game.id}`);
        }
    });

    it('each route renders its game', () => {
        for (const game of games) {
            const { unmount } = renderAt(`/${game.id}`);
            expect(screen.getByText(`${game.id}-screen`)).toBeInTheDocument();
            unmount();
        }
    });

    it('unknown route shows NotFound with a way home', () => {
        renderAt('/nope');
        expect(screen.getByText(/NOT FOUND/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /go back home/i })).toHaveAttribute('href', '/');
    });
});
