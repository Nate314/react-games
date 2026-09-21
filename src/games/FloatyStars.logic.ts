import type { StageSize } from '../stage';

export const numberOfStars = 100;
export const starSize = 10;
export const maxSpeed = 1;

export interface Stars {
    locations: number[][];
    velocities: number[][];
}

export const createStars = (width: number, height: number, rng: () => number): Stars => {
    const stars: Stars = { locations: [], velocities: [] };
    for (let i = 0; i < numberOfStars; i++) {
        stars.locations.push([rng() * width, rng() * height]);
        stars.velocities.push([rng() * maxSpeed, rng() * maxSpeed]);
    }
    return stars;
};

// stars drift left and down, re-entering from the right or top once off screen
export const moveStars = (locations: number[][], velocities: number[][], width: number, height: number): number[][] =>
    locations.map(([x, y], i) => {
        x -= velocities[i][0];
        y += velocities[i][1];
        if (!(x < width + starSize && x > -2 * starSize)) x = width + starSize;
        if (!(y < height + starSize && y > -2 * starSize)) y = -starSize;
        return [x, y];
    });

export const visibleStars = (locations: number[][], width: number, height: number): number[][] =>
    locations.filter(star => (star[0] < width && star[0] > 0) && (star[1] < height && star[1] > 0));

export const rescaleStars = (locations: number[][], from: StageSize, to: StageSize): number[][] => {
    const same = from.width === to.width && from.height === to.height;
    if (same || from.width === 0 || from.height === 0) return locations.map(([x, y]) => [x, y]);
    const rx = to.width / from.width;
    const ry = to.height / from.height;
    return locations.map(([x, y]) => [x * rx, y * ry]);
};
