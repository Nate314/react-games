import React from 'react';
import './GameOfLife.css';
import { Utility } from './Utility';

// calculate the size of the squares so that the board fills most of the screen
//  and the max length is the measurement of the longer edge
const maxLength = 35;
const boardWidth = Math.floor(window.innerWidth > window.innerHeight ? maxLength
    : (window.innerWidth / window.innerHeight) * maxLength);
const boardHeight = Math.floor(window.innerHeight > window.innerWidth ? maxLength
    : (window.innerHeight / window.innerWidth) * maxLength);
let squareSize = 0;

class BoardProps {
    squares: Square[] = [];
    clicked: any;
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
                    if (square.alive && Utility.arePositionsEqual([square.y, square.x], [rowindex, columnindex]))
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
                                        }} onClick={() => this.props.clicked(rowindex, columnindex)}>
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
    alive: boolean;
    neighbors: number;
    constructor(x: number, y: number, alive: boolean, neighbors: number) {
        this.x = x;
        this.y = y;
        this.alive = alive;
        this.neighbors = neighbors;
    }
}

class GameState {
    paused: boolean = false;
    gametick: boolean = false;
    squares: Square[] = [];
    gameTickInterval: number = 250;
}

export default class GameOfLife extends React.Component {

    gameTickDelta: number = 0;
    snakeLengthDelta: number = 3;
    scoreDelta: number = 5;
    interval: any;
    state: GameState;

    constructor(props: any) {
        super(props);
        Utility.setTitle('Game of Life');
        const tempState = new GameState();
        tempState.squares = Utility.array(boardWidth).map((v, x) =>
            Utility.array(boardHeight).map((v, y) => new Square(x, y, false, 0))
        ).flat();
        this.state = tempState;
        this.setState(tempState);
        this.keyDown('r');
        this.interval = setInterval(() => this.gameTick(), this.state.gameTickInterval);
    }

    gameTick() {
        this.setState((state: GameState) => {
            if (!state.paused || state.gametick) {
                console.log('tick');
                // count neighbors of a square
                const countNeighbors = (livingSquare: Square, livingSquares: Square[]) => {
                    let count = 0;
                    [-1, 0, 1].forEach(xIndex => {
                        [-1, 0, 1].forEach(yIndex => {
                            if ((xIndex !== 0 || yIndex !== 0)
                                && livingSquares.filter(square =>
                                    square.x === livingSquare.x + xIndex
                                    && square.y === livingSquare.y + yIndex).length > 0
                                ) count++;
                        });
                    });
                    return count;
                }
                // count the neighbors of all squares
                const livingSquares = state.squares.filter(square => square.alive);
                state.squares = state.squares.map(square => { square.neighbors = 0; return square; });
                state.squares.forEach(square => {
                    square.neighbors = countNeighbors(square, livingSquares);
                });
                // apply the rules from wikipedia https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
                state.squares.map(square => {
                    // 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
                    // 2. Any live cell with two or three live neighbours lives on to the next generation.
                    // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
                    // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                    square.alive = square.alive
                        ? !(square.neighbors < 2 || square.neighbors > 3)
                        : square.neighbors === 3;
                    return square;
                });
                state.gametick = false;
            }
            return state;
        });
    }

    keyDown = (e: any) => {
        const k = e && e.key ? e.key : e;
        switch (k) {
            case 'Escape':
                this.state.paused = !this.state.paused;
                break;
            case 'r':
            case 'R':
                this.state.squares.map(square => {
                    square.alive = Math.random() < 0.5;
                    return square;
                });
                break;
            case 'c':
            case 'C':
            case 'a':
            case 'A':
                this.state.squares.map(square => {
                    square.alive = k === 'a' || k === 'A';
                    return square;
                });
                break;
            case ' ':
            case 'Space':
                this.state.gametick = true;
                this.gameTick();
                break;
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    clicked(rowindex: number, columnindex: number) {
        this.setState((state: GameState) => {
            const clickedSquare = state.squares.find(square => square.y === rowindex && square.x === columnindex);
            if (clickedSquare) clickedSquare.alive = !clickedSquare.alive;
            return state;
        });
    }

    render() {
        // show board and scoreboard on the screen
        return (
            <div>
                <Board
                    squares={this.state.squares}
                    clicked={(rowindex: number, columnindex: number) => this.clicked(rowindex, columnindex)}/>
                <div className="gameoflifesquare" style={{width: `${boardWidth * squareSize}px`}}>
                {
                    [
                        {'key': 'Escape', 'action': 'Play/Pause'},
                        {'key': 'r', 'action': 'Random'},
                        {'key': 'c', 'action': 'Clear All'},
                        {'key': 'a', 'action': 'Fill All'},
                        {'key': 'Space', 'action': 'next generation'}
                    ].map((instruction, i) =>
                        <span style={{cursor:'pointer'}} onClick={() => this.keyDown(instruction.key)}>
                            ({instruction.key}) {instruction.action} {i < 4 ? '| ' : ''}
                        </span>
                    )
                }
                </div>
                <div className="gameoflifesquare" style={{width: `${boardWidth * squareSize}px`}}>
                    Learn more on&nbsp;
                    <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">wikipedia</a>
                </div>
            </div>
        );
    }
}
