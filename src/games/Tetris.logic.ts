import { Utility } from '../Utility';

export const boardWidth = 10;
export const boardHeight = 20;

export class Square {
    x: number;
    y: number;
    piece: string;
    blob: string;
    constructor(x: number, y: number, piece: string, blob: string) {
        this.x = x;
        this.y = y;
        this.piece = piece;
        this.blob = blob;
    }
}

export class GameState {
    score: number = 0;
    currentPiece: Square[] = [];
    paused: boolean = false;
    gametick: boolean = false;
    squares: Square[] = [];
    gameTickInterval: number = 250;
    gameover: boolean = false;
}

export const createBoard = (): Square[] =>
    Utility.array(boardWidth).map((v, x) =>
        Utility.array(boardHeight).map((v, y) => new Square(x, y, '', ''))
    ).flat();

export function getRandomPiece(rng: () => number): Square[] {
    const index = Math.floor(rng() * 7);
    const colors: string[] = [
        'green' /* I */, 'blue' /* Z */, 'indigo' /* S */,
        'magenta' /* T */, 'yellow' /* O */,
        'orange' /* L*/, 'red' /* J */
    ];
    return [
        [[-1, 0], [0, 0], [1, 0], [2, 0]], // I
        [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
        [[0, 1], [1, 0], [1, 1], [2, 0]], // S
        [[0, 0], [1, 0], [2, 0], [1, 1]], // T
        [[0, 0], [0, 1], [1, 0], [1, 1]], // O
        [[0, 1], [0, 0], [1, 0], [2, 0]], // L
        [[2, 1], [0, 0], [1, 0], [2, 0]] // J
    ][index].map(c => new Square(c[0], c[1], colors[index], ''));
}

const positionsEqual = (s: Square, sq: Square): boolean => sq.x === s.x && s.y === sq.y;

export function repaint(state: GameState): GameState {
    state.squares.forEach(s => s.piece = '');
    state.currentPiece.forEach(s => {
        const square = state.squares.find(sq => positionsEqual(s, sq));
        if (square) {
            square.piece = state.currentPiece[0].piece;
        }
    });
    return state;
}

export const movePieceDown = (state: GameState): GameState => {
    state.currentPiece = state.currentPiece.map(s => new Square(s.x, s.y + 1, s.piece, s.blob));
    return state;
};

export const pieceWillCollide = (state: GameState): boolean => {
    let result = false;
    const potentialState = movePieceDown(JSON.parse(JSON.stringify(state)));
    potentialState.currentPiece.forEach(s => {
        if (!result) {
            const potentialBlobPart = potentialState.squares.find(sq => positionsEqual(s, sq));
            result = !!potentialBlobPart ? !!potentialBlobPart.blob : true;
        }
    });
    return result;
};

// true if any square is out of bounds, or overlaps a locked blob on the board
export const hasCollision = (state: GameState, pieceSquares: Square[]): boolean =>
    pieceSquares.some(s => {
        if (s.x < 0 || s.x >= boardWidth || s.y < 0 || s.y >= boardHeight) {
            return true;
        }
        const found = state.squares.find(sq => positionsEqual(s, sq));
        return !!found && !!found.blob;
    });

export const convertPieceToBlob = (state: GameState): GameState => {
    state.squares = state.squares.map(s => {
        const found = state.currentPiece.find(sq => positionsEqual(s, sq));
        if (found) {
            s.blob = !!s.blob ? s.blob : found.piece;
        }
        return s;
    });
    return state;
};

export const getFullRows = (state: GameState): number[] => {
    const result: number[] = [];
    for (let i = 0; i < boardHeight; i++) {
        const emptySquares = state.squares.filter(s => s.y === i && !s.blob && !s.piece);
        if (emptySquares.length === 0) {
            result.push(i);
        }
    }
    return result;
};

export const removeFullRows = (state: GameState, fullRowIndecies: number[]): GameState => {
    const temp = '_____';
    state.squares = state.squares.map(s => {
        if (fullRowIndecies.includes(s.y)) {
            s.blob = temp;
            s.piece = '';
            s.y = fullRowIndecies.indexOf(s.y);
        }
        return s;
    });
    fullRowIndecies.forEach(emptyRowIndex => {
        state.squares.filter(s => s.y < emptyRowIndex)
            .forEach(s => s.y += s.blob !== temp ? 1 : 0);
    });
    state.squares.filter(s => s.blob === temp).forEach(s => s.blob = '');
    return state;
};

// one gravity step: move the piece down, or lock it, clear rows, and spawn a new piece
export const tick = (state: GameState, rng: () => number): GameState => {
    if (!state.gameover && (!state.paused || state.gametick)) {
        let addNewPiece = true;
        state = repaint(state);
        if (state.currentPiece && state.currentPiece.length !== 0) {
            if (!pieceWillCollide(state)) {
                addNewPiece = false;
                state = movePieceDown(state);
            } else {
                state = convertPieceToBlob(state);
                const fullRows = getFullRows(state);
                state.score += fullRows.length;
                state = removeFullRows(state, fullRows);
                state.currentPiece = [];
            }
        }
        if (addNewPiece) {
            const spawned = getRandomPiece(rng)
                .map(s => new Square(s.x + 4, s.y, s.piece, s.blob));
            if (hasCollision(state, spawned)) {
                state.gameover = true;
                state.currentPiece = [];
            } else {
                state.currentPiece = spawned;
            }
        }
    }
    return state;
};

export const movePiece = (state: GameState, direction: number): GameState => {
    if (!state.gameover && (!state.paused || state.gametick)) {
        const moved = state.currentPiece.map(s => new Square(s.x + direction, s.y, s.piece, s.blob));
        if (!hasCollision(state, moved)) {
            state.currentPiece = moved;
        }
    }
    return repaint(state);
};

const rotationIndecies: { p: number, x: number, y: number }[] = [
    { p: 1, x: 0, y: 0 }, { p: 2, x: 1, y: 0 }, { p: 3, x: 2, y: 0 }, { p: 4, x: 3, y: 0 },
    { p: 5, x: 0, y: 1 }, { p: 6, x: 1, y: 1 }, { p: 7, x: 2, y: 1 }, { p: 8, x: 3, y: 1 },
    { p: 9, x: 0, y: 2 }, { p: 10, x: 1, y: 2 }, { p: 11, x: 2, y: 2 }, { p: 12, x: 3, y: 2 },
    { p: 13, x: 0, y: 3 }, { p: 14, x: 1, y: 3 }, { p: 15, x: 2, y: 3 }, { p: 16, x: 3, y: 3 }
];
const clockwiseMatrix = [
    [1, 4], [2, 8], [3, 12], [4, 16],
    [5, 3], [6, 7], [7, 11], [8, 15],
    [9, 2], [10, 6], [11, 10], [12, 14],
    [13, 1], [14, 5], [15, 9], [16, 13]
];
const counterClockwiseMatrix = [
    [1, 13], [2, 9], [3, 5], [4, 1],
    [5, 14], [6, 10], [7, 6], [8, 2],
    [9, 15], [10, 11], [11, 7], [12, 3],
    [13, 16], [14, 12], [15, 8], [16, 4]
];

export const rotatePiece = (state: GameState, clockwise: boolean): GameState => {
    if (!state.gameover && (!state.paused || state.gametick)) {
        let minX = Math.min(...state.currentPiece.map(s => s.x));
        let minY = Math.min(...state.currentPiece.map(s => s.y));
        const moveToOrigin = (squares: Square[], to: boolean): Square[] =>
            squares.map(s =>
                new Square(s.x - (to ? minX : -minX), s.y - (to ? minY : -minY), s.piece, s.blob));
        const currentPieceAtOrigin = moveToOrigin(state.currentPiece, true);
        const matrix = clockwise ? clockwiseMatrix : counterClockwiseMatrix;
        const rotated = currentPieceAtOrigin.map(s => {
            const index = rotationIndecies.find(i => i.x === s.x && i.y === s.y);
            if (index) {
                const newIndex = matrix.find(a => a[0] === index.p)![1];
                const i = rotationIndecies.find(i => i.p === newIndex);
                return new Square(i!.x, i!.y, s.piece, s.blob);
            }
            return s;
        });
        minX -= Math.min(...rotated.map(s => s.x));
        minY -= Math.min(...rotated.map(s => s.y));
        const newPiece = moveToOrigin(rotated, false);
        if (!hasCollision(state, newPiece)) {
            state.currentPiece = newPiece;
        }
    }
    return repaint(state);
};
