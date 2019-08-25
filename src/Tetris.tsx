import React from 'react';
import './GameOfLife.css';
import { Utility } from './Utility';

// calculate the size of the squares so that the board fills most of the screen
//  and the max length is the measurement of the longer edge
const boardWidth = 10;
const boardHeight = 20;
let squareSize = 0;

class BoardProps {
    squares: Square[] = [];
}

class Board extends React.Component {

    livingColor = 'green';
    boardColor = 'black';
    props: BoardProps;

    constructor(props: BoardProps) {
        super(props);
        this.props = props;
    }

    render() {
        // building array to figure out the color for each square
        const squareColors: string[][] = Utility.array(boardHeight).map((v, rowindex) =>
            Utility.array(boardWidth).map((v, columnindex) => {
                let color;
                this.props.squares.forEach(square => {
                    if ((square.piece || square.blob) && Utility.arePositionsEqual([square.y, square.x], [rowindex, columnindex]))
                        color = this.livingColor;
                });
                return color ? color : this.boardColor;
            })
        );
        // calculating square size
        const maxWidth = Math.floor((window.innerWidth - 100) / boardWidth);
        const maxHeight = Math.floor((window.innerHeight - 100) / boardHeight);
        squareSize = Math.min(maxWidth, maxHeight);
        // return rendered board
        return (
            <div>
                {
                    Utility.array(boardHeight).map((row, rowindex) =>
                        <div className="board-row" key={`row-${rowindex}`}>
                            {
                                Utility.array(boardWidth).map((row, columnindex) =>
                                    <div className="gameoflifesquare" key={`square-${rowindex}-${columnindex}`}
                                        style={{
                                            backgroundColor: squareColors[rowindex][columnindex],
                                            width: `${squareSize}px`, height: `${squareSize}px`
                                        }}>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        );
    }
}

class Square {
    x: number;
    y: number;
    piece: boolean;
    blob: boolean;
    constructor(x: number, y: number, piece: boolean, blob: boolean) {
        this.x = x;
        this.y = y;
        this.piece = piece;
        this.blob = blob;
    }
}

class GameState {
    currentPiece: Square[] = [];
    paused: boolean = false;
    gametick: boolean = false;
    squares: Square[] = [];
    gameTickInterval: number = 250;
}

function getRandomPiece(): Square[] {
    const index = Math.floor(Math.random() * 7);
    const result: Square[] = [
        [[-1, 0], [0, 0], [1, 0], [2, 0]], // Line
        [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
        [[0, 1], [1, 0], [1, 1], [2, 0]], // S
        [[0, 0], [1, 0], [2, 0], [1, 1]], // T
        [[0, 0], [0, 1], [1, 0], [1, 1]], // Square
        [[0, 1], [0, 0], [1, 0], [2, 0]], // L
        [[2, 1], [0, 0], [1, 0], [2, 0]] // Backwards L
    ][index].map(c => new Square(c[0], c[1], true, false));
    return result;
}

const positionsEqual = (s: Square, sq: Square): boolean => sq.x === s.x && s.y === sq.y;

export default class Tetris extends React.Component {

    state: GameState;

    constructor(props: any) {
        super(props);
        Utility.setTitle('Tetris');
        const tempState = new GameState();
        tempState.squares = Utility.array(boardWidth).map((v, x) =>
            Utility.array(boardHeight).map((v, y) => new Square(x, y, false, false))
        ).flat();
        this.state = tempState;
        this.setState(tempState);
        this.keyDown('r');
        setInterval(() => this.gameTick(), this.state.gameTickInterval);
    }

    repaint(state: GameState): GameState {
        state.squares.forEach(s => s.piece = false);
        state.currentPiece.forEach(s => state.squares.find(sq => positionsEqual(s, sq))!.piece = true);
        return state;
    }

    gameTick() {
        const movePieceDown = (state: GameState): GameState => {
            state.currentPiece = state.currentPiece.map(s => new Square(s.x, s.y + 1, s.piece, s.blob));
            return state;
        };
        const pieceWillCollide = (state: GameState): boolean => {
            let result = false;
            const potentialState = movePieceDown(JSON.parse(JSON.stringify(state)));
            potentialState.currentPiece.forEach(s => {
                if (!result) {
                    const potentialBlobPart = potentialState.squares.find(sq => positionsEqual(s, sq));
                    result = !!potentialBlobPart ? potentialBlobPart.blob : true;
                }
            });
            return result;
        };
        const convertPieceToBlob = (state: GameState): GameState => {
            state.squares = state.squares.map(s => {
                s.blob = s.blob ? true : !!state.currentPiece.find(sq => positionsEqual(s, sq));
                return s;
            });
            return state;
        };
        this.setState((state: GameState) => {
            if (!state.paused || state.gametick) {
                let addNewPiece = true;
                state = this.repaint(state);
                if (state.currentPiece && state.currentPiece.length !== 0) {
                    if (!pieceWillCollide(state)) {
                        addNewPiece = false;
                        state = movePieceDown(state);
                    } else {
                        state = convertPieceToBlob(state);
                    }
                }
                if (addNewPiece) {
                    state = ((state: GameState): GameState => {
                        state.currentPiece = getRandomPiece()
                            .map(s => new Square(s.x + 4, s.y, s.piece, s.blob));
                        return state;
                    })(state);
                }
            }
            return state;
        });
    }

    keyDown = (e: any) => {
        const k = e && e.key ? e.key : e;
        console.log(k);
        const movePiece = (direction: number): void => {
            this.setState((state: GameState) => {
                if (!state.paused || state.gametick) {
                    let valid = true;
                    state.currentPiece.forEach(s => {
                        const pendingPosition = s.x + direction;
                        const v = pendingPosition >= 0 && pendingPosition < boardWidth;
                        valid = v && valid;
                    });
                    if (valid) {
                        state.currentPiece.map(s => {
                            s.x += direction;
                            return s;
                        });
                    }
                }
                state = this.repaint(state);
                return state;
            });
        };
        const rotatePiece = (clockwise: boolean): void => {
            this.setState((state: GameState) => {
                if (!state.paused || state.gametick) {
                    let minX = Math.min(...state.currentPiece.map(s => s.x));
                    let minY = Math.min(...state.currentPiece.map(s => s.y));
                    const moveToOrigin = (squares: Square[], to: boolean): Square[] =>
                        squares.map(s =>
                            new Square(s.x - (to ? minX : -minX), s.y - (to ? minY : -minY), s.piece, s.blob));
                    const currentPieceAtOrigin: Square[] = moveToOrigin(state.currentPiece, true);
                    const indecies: {p: number, x: number, y: number}[] = [
                        {p: 1, x: 0, y: 0}, {p: 2, x: 1, y: 0}, {p: 3, x: 2, y: 0}, {p: 4, x: 3, y: 0},
                        {p: 5, x: 0, y: 1}, {p: 6, x: 1, y: 1}, {p: 7, x: 2, y: 1}, {p: 8, x: 3, y: 1},
                        {p: 9, x: 0, y: 2}, {p: 10, x: 1, y: 2}, {p: 11, x: 2, y: 2}, {p: 12, x: 3, y: 2},
                        {p: 13, x: 0, y: 3}, {p: 14, x: 1, y: 3}, {p: 15, x: 2, y: 3}, {p: 16, x: 3, y: 3}
                    ]
                    const matrix = clockwise ? [
                        [1, 4], [2, 8], [3, 12], [4, 16],
                        [5, 3], [6, 7], [7, 11], [8, 15],
                        [9, 2], [10, 6], [11, 10], [12, 14],
                        [13, 1], [14, 5], [15, 9], [16, 13]
                    ] : [
                        [1, 13], [2, 9], [3, 5], [4, 1],
                        [5, 14], [6, 10], [7, 6], [8, 2],
                        [9, 15], [10, 11], [11, 7], [12, 3],
                        [13, 16], [14, 12], [15, 8], [16, 4]
                    ];
                    const rotate = (matrix: number[][], piece: Square[]): Square[] => {
                            return piece.map(s => {
                                const index = indecies.find(i => i.x === s.x && i.y === s.y);
                                if (index) {
                                    const newIndex = matrix.find(a => a[0] === index.p)![1];
                                    const i = indecies.find(i => i.p === newIndex);
                                    return new Square(i!.x, i!.y, s.piece, s.blob);
                                } else {
                                    return s;
                                }
                            });
                    };
                    const rotated = rotate(matrix, currentPieceAtOrigin);
                    minX -= Math.min(...rotated.map(s => s.x));
                    minY -= Math.min(...rotated.map(s => s.y));
                    state.currentPiece = moveToOrigin(rotated, false);
                }
                state = this.repaint(state);
                return state;
            });
        }
        const inc = (arr: string[]) => arr.includes(k);
        if (inc(['Escape', 'Enter'])) {
            this.state.paused = !this.state.paused;
        } else if (inc(['w', 'W', 'ArrowUp'])) {
        } else if (inc(['s', 'S', 'ArrowDown'])) {
            this.gameTick();
        } else if (inc(['a', 'A', 'ArrowLeft'])) {
            movePiece(-1);
        } else if (inc(['d', 'D', 'ArrowRight'])) {
            movePiece(1);
        } else if (inc([',', '<'])) {
            rotatePiece(false);
        } else if (inc(['.', '>'])) {
            rotatePiece(true);
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    render() {
        // show board and scoreboard on the screen
        return (
            <div>
                <Board squares={this.state.squares} />
                <div className="gameoflifesquare" style={{width: `${boardWidth * squareSize}px`}}>
                {
                    [
                        {'key': 'Escape', 'action': 'Play/Pause'},
                        {'key': 'WASD/Arrow Keys', 'action': 'Move'},
                        {'key': ',', 'action': 'Rotate Counter Clockwise'},
                        {'key': '.', 'action': 'Rotate Clockwise'}
                    ].map((instruction, i) =>
                        <span style={{cursor:'pointer'}} onClick={() => this.keyDown(instruction.key)}>
                            ({instruction.key}) {instruction.action} {i < 4 ? '| ' : ''}
                        </span>
                    )
                }
                </div>
            </div>
        );
    }
}
