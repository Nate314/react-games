export interface Square {
    x: number;
    y: number;
    alive: boolean;
    neighbors: number;
}

// builds the board column by column, all squares dead
export const createSquares = (width: number, height: number): Square[] =>
    Array.from({ length: width }, (_, x) =>
        Array.from({ length: height }, (_, y): Square => ({ x, y, alive: false, neighbors: 0 }))
    ).flat();

export const randomizeSquares = (squares: Square[], rng: () => number): Square[] =>
    squares.map(square => ({ ...square, alive: rng() < 0.5 }));

export const setAllSquares = (squares: Square[], alive: boolean): Square[] =>
    squares.map(square => ({ ...square, alive }));

export const toggleSquare = (squares: Square[], row: number, column: number): Square[] =>
    squares.map(square => square.y === row && square.x === column ? { ...square, alive: !square.alive } : square);

// apply the rules from https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life (edges do not wrap)
export const nextGeneration = (squares: Square[]): Square[] => {
    const living = new Set(squares.filter(square => square.alive).map(square => `${square.x},${square.y}`));
    return squares.map(square => {
        let neighbors = 0;
        for (const dx of [-1, 0, 1]) {
            for (const dy of [-1, 0, 1]) {
                if ((dx !== 0 || dy !== 0) && living.has(`${square.x + dx},${square.y + dy}`)) neighbors++;
            }
        }
        const alive = square.alive ? !(neighbors < 2 || neighbors > 3) : neighbors === 3;
        return { ...square, neighbors, alive };
    });
};
