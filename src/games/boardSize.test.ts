import { afterEach, describe, expect, it } from 'vitest';
import { fitSquareSize } from './boardSize';

const setWindow = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
};

describe('fitSquareSize', () => {
    const original = [window.innerWidth, window.innerHeight];
    afterEach(() => setWindow(original[0], original[1]));

    it('is limited by height on a wide window, leaving room for the HUD', () => {
        setWindow(1600, 900);
        expect(fitSquareSize(10, 20)).toBe(35); // (900 - 200) / 20
    });
    it('is limited by width on a narrow window', () => {
        setWindow(400, 1000);
        expect(fitSquareSize(10, 20)).toBe(30); // (400 - 100) / 10
    });
});
