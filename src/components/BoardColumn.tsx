import type { CSSProperties, ReactNode } from 'react';
import '../styles/board-column.css';

interface BoardColumnProps {
    // Pixel width of the board; the first child is the board, the rest (the HUD) fill the column.
    boardWidth: number;
    children: ReactNode;
}

// Centers a board and its HUD horizontally as one column.
export function BoardColumn({ boardWidth, children }: BoardColumnProps) {
    return (
        <div className="board-column" style={{ '--board-width': `${boardWidth}px` } as CSSProperties}>
            {children}
        </div>
    );
}
