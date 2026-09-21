import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GameHud } from './GameHud';

const controls = [{ keys: 'Esc', action: 'Pause' }, { keys: 'R', action: 'Reset' }];

describe('GameHud', () => {
    it('shows each stat as a label and value', () => {
        render(<GameHud stats={[{ label: 'Score', value: 15 }, { label: 'High Score', value: 40 }]} controls={controls} />);
        const hud = screen.getByRole('group', { name: 'Game status and controls' });
        expect(hud).toHaveTextContent('Score');
        expect(hud).toHaveTextContent('15');
        expect(hud).toHaveTextContent('High Score');
        expect(hud).toHaveTextContent('40');
    });

    it('shows a status badge only when there is a status', () => {
        const { rerender } = render(<GameHud controls={controls} />);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        rerender(<GameHud controls={controls} status={{ text: 'Paused', tone: 'info' }} />);
        expect(screen.getByRole('status')).toHaveTextContent('Paused');
    });

    it('renders every control as a key and an action', () => {
        render(<GameHud controls={controls} />);
        expect(screen.getByText('Esc')).toBeInTheDocument();
        expect(screen.getByText('Pause')).toBeInTheDocument();
        expect(screen.getByText('R')).toBeInTheDocument();
        expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('makes a control a button only when it has an action to run', async () => {
        const onSelect = vi.fn();
        render(<GameHud controls={[{ keys: 'Esc', action: 'Pause', onSelect }, { keys: 'R', action: 'Reset' }]} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(1);
        await userEvent.click(buttons[0]);
        expect(onSelect).toHaveBeenCalledOnce();
    });

    it('renders an optional footer and the overlay variant', () => {
        const { container } = render(<GameHud controls={controls} variant="overlay" footer={<a href="/x">More</a>} />);
        expect(screen.getByRole('link', { name: 'More' })).toBeInTheDocument();
        expect(container.querySelector('.hud--overlay')).not.toBeNull();
    });

    it('sizes the panel to the board when a width is given', () => {
        const { container } = render(<GameHud controls={controls} width={420} />);
        expect((container.firstChild as HTMLElement).style.width).toBe('420px');
    });
});
