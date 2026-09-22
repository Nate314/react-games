import { describe, expect, it } from 'vitest';
import { createStars, moveStars, numberOfStars, rescaleStars, starSize, visibleStars } from './FloatyStars.logic';

describe('createStars', () => {
    it('makes numberOfStars stars, drawing location then velocity per star', () => {
        const seq = [0.5, 0.25, 0.1, 0.2];
        let i = 0;
        const stars = createStars(200, 100, () => (i < 4 ? seq[i++] : 0));
        expect(stars.locations).toHaveLength(numberOfStars);
        expect(stars.velocities).toHaveLength(numberOfStars);
        expect(stars.locations[0]).toEqual([100, 25]);
        expect(stars.velocities[0]).toEqual([0.1, 0.2]);
    });
});

describe('moveStars', () => {
    it('moves left and down by velocity', () => {
        expect(moveStars([[50, 50]], [[0.5, 0.25]], 100, 100)).toEqual([[49.5, 50.25]]);
    });
    it('re-enters from the right when off the left edge', () => {
        expect(moveStars([[-2 * starSize, 50]], [[1, 0]], 100, 100)[0][0]).toBe(100 + starSize);
    });
    it('re-enters from the top when off the bottom', () => {
        expect(moveStars([[50, 100 + starSize]], [[0, 1]], 100, 100)[0][1]).toBe(-starSize);
    });
    it('does not mutate its input', () => {
        const loc = [[50, 50]];
        moveStars(loc, [[1, 1]], 100, 100);
        expect(loc).toEqual([[50, 50]]);
    });
});

describe('visibleStars', () => {
    it('keeps only stars strictly inside the window', () => {
        expect(visibleStars([[5, 5], [0, 5], [5, 100], [101, 5], [50, 50]], 100, 100)).toEqual([[5, 5], [50, 50]]);
    });
});

describe('rescaleStars', () => {
    const a = { width: 100, height: 50 };
    it('scales x by width ratio and y by height ratio', () => {
        expect(rescaleStars([[10, 10], [50, 25]], a, { width: 200, height: 150 })).toEqual([[20, 30], [100, 75]]);
    });
    it('returns a new array and does not mutate input', () => {
        const loc = [[10, 10]];
        const out = rescaleStars(loc, a, { width: 200, height: 100 });
        expect(out).not.toBe(loc);
        expect(loc).toEqual([[10, 10]]);
    });
    it('is identity when sizes are equal', () => {
        expect(rescaleStars([[10, 10]], a, { ...a })).toEqual([[10, 10]]);
    });
    it('is identity when from has a zero dimension', () => {
        expect(rescaleStars([[10, 10]], { width: 0, height: 50 }, a)).toEqual([[10, 10]]);
        expect(rescaleStars([[10, 10]], { width: 100, height: 0 }, a)).toEqual([[10, 10]]);
    });
});
