import { describe, expect, it } from 'vitest';
import { createSquares, nextGeneration, randomizeSquares, setAllSquares, toggleSquare, type Square } from './GameOfLife.logic';

const board = (w: number, h: number, alive: number[][]): Square[] =>
    createSquares(w, h).map(s => ({ ...s, alive: alive.some(([x, y]) => x === s.x && y === s.y) }));
const livingOf = (squares: Square[]) => squares.filter(s => s.alive).map(s => [s.x, s.y]);
const at = (squares: Square[], x: number, y: number) => squares.find(s => s.x === x && s.y === y)!;

describe('createSquares', () => {
    it('creates width*height dead squares, x-major', () => {
        const s = createSquares(3, 2);
        expect(s).toHaveLength(6);
        expect(s.every(q => !q.alive && q.neighbors === 0)).toBe(true);
        expect(s.slice(0, 3).map(q => [q.x, q.y])).toEqual([[0, 0], [0, 1], [1, 0]]);
    });
});

describe('nextGeneration', () => {
    it('oscillates a blinker', () => {
        const horizontal = board(5, 5, [[1, 2], [2, 2], [3, 2]]);
        const vertical = nextGeneration(horizontal);
        expect(livingOf(vertical)).toEqual([[2, 1], [2, 2], [2, 3]]);
        expect(livingOf(nextGeneration(vertical))).toEqual([[1, 2], [2, 2], [3, 2]]);
    });
    it('kills lonely cells (underpopulation)', () => {
        expect(livingOf(nextGeneration(board(3, 3, [[1, 1]])))).toEqual([]);
    });
    it('keeps a block stable', () => {
        const block = board(4, 4, [[1, 1], [1, 2], [2, 1], [2, 2]]);
        expect(livingOf(nextGeneration(block))).toEqual(livingOf(block));
    });
    it('kills overcrowded cells and births on exactly three', () => {
        const plus = board(3, 3, [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]);
        const next = nextGeneration(plus);
        expect(at(next, 1, 1).alive).toBe(false);
        expect(at(next, 0, 0).alive).toBe(true);
    });
    it('does not wrap around edges', () => {
        const next = nextGeneration(board(3, 3, [[0, 1], [2, 1], [1, 0]]));
        expect(at(next, 1, 1).neighbors).toBe(3);
        expect(at(next, 0, 0).neighbors).toBe(2);
    });
    it('does not mutate its input', () => {
        const input = board(3, 3, [[0, 1], [1, 1], [2, 1]]);
        nextGeneration(input);
        expect(livingOf(input)).toEqual([[0, 1], [1, 1], [2, 1]]);
    });
});

describe('board edits', () => {
    it('randomizes using rng < 0.5 as alive', () => {
        const values = [0.1, 0.9, 0.49, 0.5];
        let i = 0;
        expect(randomizeSquares(createSquares(2, 2), () => values[i++]).map(s => s.alive))
            .toEqual([true, false, true, false]);
    });
    it('clears and fills', () => {
        const filled = setAllSquares(createSquares(2, 2), true);
        expect(filled.every(s => s.alive)).toBe(true);
        expect(setAllSquares(filled, false).some(s => s.alive)).toBe(false);
    });
    it('toggles the clicked row/column', () => {
        const once = toggleSquare(createSquares(3, 2), 1, 2);
        expect(livingOf(once)).toEqual([[2, 1]]);
        expect(livingOf(toggleSquare(once, 1, 2))).toEqual([]);
    });
});
