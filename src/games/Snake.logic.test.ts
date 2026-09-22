import { describe, expect, it } from 'vitest';
import {
    advanceSnake, boardHeight, boardWidth, eatFood, initialSnakeState, nextDirection, stepSnake, type SnakeState
} from './Snake.logic';

const withState = (patch: Partial<SnakeState>): SnakeState => ({ ...initialSnakeState(), ...patch });

describe('initialSnakeState', () => {
    it('starts mid-board heading right', () => {
        const s = initialSnakeState();
        expect(s.snakeHeadPosition).toEqual([10, 3]);
        expect(s.foodPosition).toEqual([10, 15]);
        expect(s.snakeDirection).toBe('>');
        expect([s.score, s.snakeLength, s.gameTickInterval]).toEqual([0, 1, 110]);
    });
});

describe('nextDirection', () => {
    it('turns vertical when moving horizontally', () => {
        expect(nextDirection('>', 'ArrowUp')).toBe('^');
        expect(nextDirection('<', 's')).toBe('v');
    });
    it('turns horizontal when moving vertically', () => {
        expect(nextDirection('^', 'a')).toBe('<');
        expect(nextDirection('v', 'ArrowRight')).toBe('>');
    });
    it('ignores reversing and unrelated keys', () => {
        expect(nextDirection('>', 'ArrowLeft')).toBe('>');
        expect(nextDirection('^', 'ArrowDown')).toBe('^');
        expect(nextDirection('>', 'x')).toBe('>');
    });
});

describe('stepSnake', () => {
    it('moves the head one square in its direction', () => {
        expect(stepSnake(withState({})).snakeHeadPosition).toEqual([10, 4]);
        expect(stepSnake(withState({ snakeDirection: '^' })).snakeHeadPosition).toEqual([9, 3]);
        expect(stepSnake(withState({ snakeDirection: 'v' })).snakeHeadPosition).toEqual([11, 3]);
        expect(stepSnake(withState({ snakeDirection: '<' })).snakeHeadPosition).toEqual([10, 2]);
    });
    it('does nothing when paused or over', () => {
        const paused = withState({ paused: true });
        const over = withState({ gameover: true });
        expect(stepSnake(paused)).toBe(paused);
        expect(stepSnake(over)).toBe(over);
    });
    it('keeps a body trail of snakeLength squares', () => {
        let s = withState({ snakeLength: 3 });
        for (let i = 0; i < 4; i++) s = stepSnake(s);
        expect(s.snakeHeadPosition).toEqual([10, 7]);
        expect(s.snakeBody).toEqual([[10, 4], [10, 5], [10, 6]]);
    });
    it('ends the game at each wall', () => {
        expect(stepSnake(withState({ snakeHeadPosition: [0, 5], snakeDirection: '^' })).gameover).toBe(true);
        expect(stepSnake(withState({ snakeHeadPosition: [boardHeight - 1, 5], snakeDirection: 'v' })).gameover).toBe(true);
        expect(stepSnake(withState({ snakeHeadPosition: [5, 0], snakeDirection: '<' })).gameover).toBe(true);
        expect(stepSnake(withState({ snakeHeadPosition: [5, boardWidth - 1] })).gameover).toBe(true);
    });
    it('does not end the game on the last valid square', () => {
        const s = stepSnake(withState({ snakeHeadPosition: [5, boardWidth - 2] }));
        expect(s.gameover).toBe(false);
        expect(s.snakeHeadPosition).toEqual([5, boardWidth - 1]);
    });
    it('ends the game when the head hits the body', () => {
        const s = stepSnake(withState({
            snakeHeadPosition: [5, 5], snakeDirection: '<', snakeLength: 5,
            snakeBody: [[5, 3], [5, 4], [6, 4], [6, 5]]
        }));
        expect(s.gameover).toBe(true);
    });
    it('does not mutate the previous state', () => {
        const before = withState({});
        stepSnake(before);
        expect(before.snakeBody).toEqual([]);
        expect(before.snakeHeadPosition).toEqual([10, 3]);
    });
});

describe('eatFood', () => {
    it('grows, scores, and places food from the rng', () => {
        const s = eatFood(withState({}), () => 0.5);
        expect(s.foodPosition).toEqual([10, 15]);
        expect(s.snakeLength).toBe(4);
        expect(s.score).toBe(5);
        expect(s.gameTickInterval).toBe(110);
    });
    it('rerolls food that lands on the body', () => {
        const values = [0, 0, 0.5, 0.5];
        let i = 0;
        const s = eatFood(withState({ snakeBody: [[0, 0]] }), () => values[i++]);
        expect(s.foodPosition).toEqual([10, 15]);
    });
});

describe('advanceSnake', () => {
    it('moves without eating when the head misses the food', () => {
        const s = advanceSnake(withState({}), () => 0.5);
        expect(s.snakeHeadPosition).toEqual([10, 4]);
        expect(s.score).toBe(0);
    });
    it('eats the food the head lands on', () => {
        const s = advanceSnake(withState({ snakeHeadPosition: [10, 14], foodPosition: [10, 15] }), () => 0);
        expect(s.snakeHeadPosition).toEqual([10, 15]);
        expect(s.score).toBe(5);
        expect(s.snakeLength).toBe(4);
        expect(s.foodPosition).toEqual([0, 0]);
    });
    it('does nothing while paused', () => {
        const before = withState({ paused: true, snakeHeadPosition: [10, 14] });
        expect(advanceSnake(before, () => 0)).toBe(before);
    });
});
