import { describe, expect, it } from 'vitest';
import {
    BirdProps, FlappyFinchGameState, PipeProps, birdSize, colliding, createPipes, flap, flapVelocity,
    gravityConstant, incrementScore, pipeWidth, pipeXGap, pipeYGap, randomPipePosition, rescale, step
} from './FlappyFinch.logic';

const W = 1000;
const H = 800;
const rng = () => 0.5;

const stateWithPipe = (pipeX: number, pipeY = 400): FlappyFinchGameState => {
    const s = new FlappyFinchGameState();
    s.birdPosition = new BirdProps(120, 300);
    s.pipePositions = [new PipeProps(pipeX, pipeY, 1)];
    return s;
};

describe('FlappyFinch logic', () => {
    describe('colliding', () => {
        const pipe = { x: 100, y: 400, width: pipeWidth, height: H, isPipe: true };
        it('passes through the gap', () => {
            expect(colliding(pipe, new BirdProps(120, 300))).toBe(false);
        });
        it('hits the top and bottom pipes when overlapping horizontally', () => {
            expect(colliding(pipe, new BirdProps(120, 400 - pipeYGap / 2 - 1))).toBe(true);
            expect(colliding(pipe, new BirdProps(120, 400 + pipeYGap / 2 - birdSize + 1))).toBe(true);
        });
        it('never collides when not overlapping horizontally', () => {
            expect(colliding(pipe, new BirdProps(100 - birdSize, 0))).toBe(false);
            expect(colliding(pipe, new BirdProps(100 + pipeWidth, 0))).toBe(false);
        });
        it('detects a non-pipe object (nom nom) overlap', () => {
            const nom = { x: 130, y: 320, width: 10, height: 10, isPipe: false };
            expect(colliding(nom, new BirdProps(120, 300))).toBe(true);
            expect(colliding(nom, new BirdProps(120, 100))).toBe(false);
        });
    });

    it('positions pipes vertically from rng and height', () => {
        expect(randomPipePosition(800, () => 0.5)).toBe(400);
        expect(randomPipePosition(800, () => 0)).toBe(200);
        expect(randomPipePosition(800, () => 1)).toBe(600);
    });

    it('creates 10 pipes spaced by pipeXGap starting at 3 gaps, indexed from 1', () => {
        const pipes = createPipes(H, rng);
        expect(pipes).toHaveLength(10);
        expect(pipes[0].x).toBe(3 * pipeXGap);
        expect(pipes[9].x).toBe(12 * pipeXGap);
        expect(pipes.map(p => p.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('flap sets upward velocity and bumps the flap counter', () => {
        const s = new FlappyFinchGameState();
        flap(s);
        expect(s.birdVelocity).toBe(flapVelocity);
        expect(s.flapWhenOdd).toBe(1);
    });

    it('applies gravity, moves pipes and scrolls background each step', () => {
        const s = stateWithPipe(900);
        s.birdVelocity = -2;
        step(s, W, H, rng);
        expect(s.birdPosition.y).toBe(298);
        expect(s.birdVelocity).toBeCloseTo(-2 + gravityConstant);
        expect(s.pipePositions[0].x).toBe(899);
        expect(s.groundX).toBe(-1);
        expect(s.skyX).toBe(-0.5);
        expect(s.gameover).toBe(false);
    });

    it('wraps ground and sky scrolling', () => {
        const s = stateWithPipe(900);
        s.groundX = -W * 0.625;
        s.skyX = -W * 0.5;
        step(s, W, H, rng);
        expect(s.groundX).toBe(0);
        expect(s.skyX).toBe(0);
    });

    it('ends the game when the bird hits the ground', () => {
        const s = stateWithPipe(900);
        s.birdPosition.y = H - (birdSize + 50) + 1;
        step(s, W, H, rng);
        expect(s.gameover).toBe(true);
    });

    it('clamps the bird at the top of the screen', () => {
        const s = stateWithPipe(900);
        s.birdPosition.y = 1;
        s.birdVelocity = -6;
        step(s, W, H, rng);
        expect(s.birdPosition.y).toBe(0);
        expect(s.gameover).toBe(false);
    });

    it('ends the game when the bird hits a pipe', () => {
        const s = stateWithPipe(100, 700);
        step(s, W, H, rng);
        expect(s.gameover).toBe(true);
    });

    it('scores when the bird passes a pipe and tracks the high score', () => {
        const s = stateWithPipe(120 - pipeWidth - 1, 300);
        step(s, W, H, rng);
        expect(s.score).toBe(1);
        expect(s.highscore).toBe(1);
        expect(s.currentPipeToCheck).toBe(2);
    });

    it('incrementScore keeps a higher existing high score', () => {
        const s = new FlappyFinchGameState();
        s.highscore = 5;
        incrementScore(s);
        expect(s.score).toBe(1);
        expect(s.highscore).toBe(5);
    });

    it('recycles passed pipes to the far end with a new index', () => {
        const s = new FlappyFinchGameState();
        s.birdPosition = new BirdProps(120, 300);
        s.pipePositions = [new PipeProps(-500, 400, 1), new PipeProps(500, 400, 2), new PipeProps(800, 400, 3)];
        s.currentPipeToCheck = 3;
        step(s, W, H, rng);
        const recycled = s.pipePositions[0];
        expect(recycled.index).toBe(4);
        expect(recycled.x).toBe(800 + pipeXGap - 1);
    });
});

describe('rescale', () => {
    const build = () => {
        const s = new FlappyFinchGameState();
        s.birdPosition = new BirdProps(120, 200);
        s.pipePositions = [new PipeProps(500, 400, 1), new PipeProps(800, 300, 2)];
        return s;
    };
    it('scales bird y and pipe y by the height ratio and leaves x alone', () => {
        const s = build();
        rescale(s, { width: 1000, height: 800 }, { width: 500, height: 400 });
        expect(s.birdPosition).toMatchObject({ x: 120, y: 100 });
        expect(s.pipePositions.map(p => [p.x, p.y])).toEqual([[500, 200], [800, 150]]);
    });
    it('is a no-op when the sizes are equal', () => {
        const s = build();
        rescale(s, { width: 1000, height: 800 }, { width: 1000, height: 800 });
        expect(s.birdPosition.y).toBe(200);
        expect(s.pipePositions[0].y).toBe(400);
    });
    it('is a no-op when the previous height is 0', () => {
        const s = build();
        rescale(s, { width: 1000, height: 0 }, { width: 1000, height: 800 });
        expect(s.birdPosition.y).toBe(200);
        expect(s.pipePositions[1].y).toBe(300);
    });
});
