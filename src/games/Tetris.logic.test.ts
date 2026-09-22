import { describe, expect, it } from 'vitest';
import {
    GameState, Square, boardHeight, boardWidth, convertPieceToBlob, createBoard, getFullRows,
    getRandomPiece, movePiece, pieceWillCollide, removeFullRows, rotatePiece, tick
} from './Tetris.logic';

const newState = (): GameState => {
    const s = new GameState();
    s.squares = createBoard();
    return s;
};
const cell = (s: GameState, x: number, y: number) => s.squares.find(q => q.x === x && q.y === y)!;
const coords = (sq: Square[]) => sq.map(q => [q.x, q.y]).sort();
const withPiece = (s: GameState, cells: number[][]) => {
    s.currentPiece = cells.map(c => new Square(c[0], c[1], 'red', ''));
    return s;
};
const fillRow = (s: GameState, y: number, except: number[] = []) =>
    s.squares.filter(q => q.y === y && !except.includes(q.x)).forEach(q => q.blob = 'blue');

describe('Tetris logic', () => {
    it('creates a 10x20 board of empty squares', () => {
        const s = newState();
        expect(s.squares).toHaveLength(boardWidth * boardHeight);
        expect(s.squares.every(q => !q.piece && !q.blob)).toBe(true);
    });

    it('picks pieces by rng with the right shape and color', () => {
        const i = getRandomPiece(() => 0);
        expect(coords(i)).toEqual([[-1, 0], [0, 0], [1, 0], [2, 0]]);
        expect(i[0].piece).toBe('green');
        const j = getRandomPiece(() => 0.99);
        expect(j[0].piece).toBe('red');
        expect(getRandomPiece(() => 0.5)[0].piece).toBe('magenta');
    });

    it('first tick spawns a piece offset by 4, later ticks apply gravity', () => {
        const s = newState();
        tick(s, () => 0.5);
        expect(coords(s.currentPiece)).toEqual([[4, 0], [5, 0], [5, 1], [6, 0]].sort());
        tick(s, () => 0.5);
        expect(s.currentPiece.map(q => q.y).sort()).toEqual([1, 1, 1, 2]);
        expect(cell(s, 4, 0).piece).toBe('magenta');
    });

    it('does nothing while paused', () => {
        const s = newState();
        s.paused = true;
        tick(s, () => 0);
        expect(s.currentPiece).toEqual([]);
    });

    it('detects collision with the floor and with blobs', () => {
        const s = withPiece(newState(), [[3, 18]]);
        expect(pieceWillCollide(s)).toBe(false);
        withPiece(s, [[3, 19]]);
        expect(pieceWillCollide(s)).toBe(true);
        withPiece(s, [[3, 10]]);
        cell(s, 3, 11).blob = 'blue';
        expect(pieceWillCollide(s)).toBe(true);
    });

    it('locks a landed piece into blobs and spawns the next piece', () => {
        const s = withPiece(newState(), [[3, 19]]);
        tick(s, () => 0);
        expect(cell(s, 3, 19).blob).toBe('red');
        expect(s.score).toBe(0);
        expect(s.currentPiece[0].piece).toBe('green');
    });

    it('converts piece to blob without overwriting existing blobs', () => {
        const s = withPiece(newState(), [[1, 1]]);
        cell(s, 1, 1).blob = 'blue';
        convertPieceToBlob(s);
        expect(cell(s, 1, 1).blob).toBe('blue');
    });

    it('moves left and right and stops at walls', () => {
        const s = withPiece(newState(), [[0, 0], [1, 0]]);
        movePiece(s, -1);
        expect(coords(s.currentPiece)).toEqual([[0, 0], [1, 0]]);
        movePiece(s, 1);
        expect(coords(s.currentPiece)).toEqual([[1, 0], [2, 0]]);
        withPiece(s, [[8, 0], [9, 0]]);
        movePiece(s, 1);
        expect(coords(s.currentPiece)).toEqual([[8, 0], [9, 0]]);
    });

    it('rotates clockwise and counter clockwise, and they invert each other', () => {
        const s = withPiece(newState(), [[0, 0], [1, 0], [2, 0], [3, 0]]);
        rotatePiece(s, true);
        expect(coords(s.currentPiece)).toEqual([[0, 0], [0, 1], [0, 2], [0, 3]]);
        rotatePiece(s, false);
        expect(coords(s.currentPiece)).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]]);
    });

    it('ignores movement and rotation while paused', () => {
        const s = withPiece(newState(), [[1, 1], [2, 1]]);
        s.paused = true;
        movePiece(s, 1);
        rotatePiece(s, true);
        expect(coords(s.currentPiece)).toEqual([[1, 1], [2, 1]]);
    });

    it('finds full rows, clears them, shifts rows above down, and scores', () => {
        const s = newState();
        fillRow(s, 19);
        fillRow(s, 18, [0]);
        cell(s, 5, 17).blob = 'green';
        expect(getFullRows(s)).toEqual([19]);
        withPiece(s, [[0, 18]]);
        tick(s, () => 0);
        expect(s.score).toBe(2);
        expect(cell(s, 5, 19).blob).toBe('green');
        expect(s.squares.filter(q => q.blob).length).toBe(1);
    });

    it('removeFullRows clears multiple rows', () => {
        const s = newState();
        fillRow(s, 18);
        fillRow(s, 19);
        cell(s, 2, 10).blob = 'green';
        removeFullRows(s, getFullRows(s));
        expect(cell(s, 2, 12).blob).toBe('green');
        expect(s.squares.filter(q => q.blob).length).toBe(1);
    });

    it('movePiece rejects a move into a cell occupied by a locked blob', () => {
        const s = withPiece(newState(), [[1, 0]]);
        cell(s, 0, 0).blob = 'blue';
        movePiece(s, -1);
        expect(coords(s.currentPiece)).toEqual([[1, 0]]);
    });

    it('rotatePiece rejects a rotation that would overlap a locked blob', () => {
        const s = withPiece(newState(), [[3, 0], [4, 0], [5, 0], [6, 0]]);
        cell(s, 3, 2).blob = 'blue';
        rotatePiece(s, true);
        expect(coords(s.currentPiece)).toEqual([[3, 0], [4, 0], [5, 0], [6, 0]].sort());
    });

    it('rotatePiece rejects a rotation that would push the piece out of bounds', () => {
        const s = withPiece(newState(), [[9, 0], [9, 1], [9, 2], [9, 3]]);
        rotatePiece(s, true);
        expect(coords(s.currentPiece)).toEqual([[9, 0], [9, 1], [9, 2], [9, 3]].sort());
    });

    it('sets gameover when a new piece cannot spawn without overlapping the stack', () => {
        const s = newState();
        cell(s, 4, 0).blob = 'blue';
        tick(s, () => 0);
        expect(s.gameover).toBe(true);
        expect(s.currentPiece).toEqual([]);
    });

    it('once gameover, tick, movePiece, and rotatePiece are no-ops', () => {
        const s = withPiece(newState(), [[4, 0], [5, 0]]);
        s.gameover = true;
        movePiece(s, 1);
        expect(coords(s.currentPiece)).toEqual([[4, 0], [5, 0]]);
        rotatePiece(s, true);
        expect(coords(s.currentPiece)).toEqual([[4, 0], [5, 0]]);
        const beforeScore = s.score;
        tick(s, () => 0);
        expect(s.score).toBe(beforeScore);
        expect(coords(s.currentPiece)).toEqual([[4, 0], [5, 0]]);
    });
});
