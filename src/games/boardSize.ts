import type { StageSize } from '../stage';

// Room left around a board: side margins, and below it the HUD panel (up to four wrapped rows).
const sideMargin = 100;
const belowBoard = 240;

// Largest square size at which a columns x rows board plus its HUD fits the stage.
export const fitSquareSize = (columns: number, rows: number, stage: StageSize): number =>
    Math.min(
        Math.floor((stage.width - sideMargin) / columns),
        Math.floor((stage.height - belowBoard) / rows)
    );
