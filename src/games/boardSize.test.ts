import { describe, expect, it } from 'vitest';
import { fitSquareSize } from './boardSize';

describe('fitSquareSize', () => {
    it('is limited by height on a wide stage, leaving room for the HUD', () => {
        expect(fitSquareSize(10, 20, { width: 1600, height: 900 })).toBe(33); // (900 - 240) / 20
    });
    it('is limited by width on a narrow stage', () => {
        expect(fitSquareSize(10, 20, { width: 400, height: 1000 })).toBe(30); // (400 - 100) / 10
    });
    it('grows when the stage grows', () => {
        const small = fitSquareSize(10, 20, { width: 1280, height: 700 });
        const large = fitSquareSize(10, 20, { width: 1280, height: 800 });
        expect(large).toBeGreaterThan(small);
    });
});
