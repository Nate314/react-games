import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { BoardColumn } from './BoardColumn';

describe('BoardColumn', () => {
    it('renders its children in a column sized from the board width', () => {
        const { container } = render(<BoardColumn boardWidth={420}><p>board</p><p>hud</p></BoardColumn>);
        expect(screen.getByText('board')).toBeInTheDocument();
        expect(screen.getByText('hud')).toBeInTheDocument();
        const column = container.firstChild as HTMLElement;
        expect(column).toHaveClass('board-column');
        expect(column.style.getPropertyValue('--board-width')).toBe('420px');
    });
});
