// Room left around a board: side margins, and below it the HUD panel (three wrapped rows at most).
const sideMargin = 100;
const belowBoard = 200;

// Largest square size at which a columns x rows board plus its HUD fits the window.
export const fitSquareSize = (columns: number, rows: number): number =>
    Math.min(
        Math.floor((window.innerWidth - sideMargin) / columns),
        Math.floor((window.innerHeight - belowBoard) / rows)
    );
