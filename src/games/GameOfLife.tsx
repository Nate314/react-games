import React from 'react';
import './GameOfLife.css';
import { Utility } from '../Utility';
import { GameHud } from '../components/GameHud';
import { fitSquareSize } from './boardSize';
import type { GameProps } from '../stage';
import {
    createSquares, nextGeneration, randomizeSquares, setAllSquares, toggleSquare, type Square
} from './GameOfLife.logic';

// calculate the size of the squares so that the board fills most of the screen
//  and the max length is the measurement of the longer edge
const maxLength = 35;
const boardWidth = Math.floor(window.innerWidth > window.innerHeight ? maxLength
    : (window.innerWidth / window.innerHeight) * maxLength);
const boardHeight = Math.floor(window.innerHeight > window.innerWidth ? maxLength
    : (window.innerHeight / window.innerWidth) * maxLength);

class BoardProps {
    squareSize = 0;
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
        const squareSize = this.props.squareSize;
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

class GameState {
    paused: boolean = false;
    gametick: boolean = false;
    squares: Square[] = [];
    gameTickInterval: number = 250;
}

export default class GameOfLife extends React.Component<GameProps> {

    gameTickDelta: number = 0;
    snakeLengthDelta: number = 3;
    scoreDelta: number = 5;
    interval: any;
    state: GameState;

    constructor(props: GameProps) {
        super(props);
        Utility.setTitle('Game of Life');
        const tempState = new GameState();
        tempState.squares = randomizeSquares(createSquares(boardWidth, boardHeight), Math.random);
        this.state = tempState;
        this.interval = setInterval(() => this.gameTick(), this.state.gameTickInterval);
    }

    gameTick() {
        this.setState((state: GameState) => {
            if (!state.paused || state.gametick) {
                state.squares = nextGeneration(state.squares);
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
                this.setState((state: GameState) => ({ squares: randomizeSquares(state.squares, Math.random) }));
                break;
            case 'c':
            case 'C':
            case 'a':
            case 'A':
                this.setState((state: GameState) => ({ squares: setAllSquares(state.squares, k === 'a' || k === 'A') }));
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
            state.squares = toggleSquare(state.squares, rowindex, columnindex);
            return state;
        });
    }

    render() {
        const squareSize = fitSquareSize(boardWidth, boardHeight, this.props.stage);
        // show board and scoreboard on the screen
        return (
            <div>
                <Board
                    squareSize={squareSize}
                    squares={this.state.squares}
                    clicked={(rowindex: number, columnindex: number) => this.clicked(rowindex, columnindex)}/>
                <GameHud
                    width={boardWidth * squareSize}
                    controls={[
                        { keys: 'Esc', action: 'Play / Pause', onSelect: () => this.keyDown('Escape') },
                        { keys: 'R', action: 'Random', onSelect: () => this.keyDown('r') },
                        { keys: 'C', action: 'Clear all', onSelect: () => this.keyDown('c') },
                        { keys: 'A', action: 'Fill all', onSelect: () => this.keyDown('a') },
                        { keys: 'Space', action: 'Next generation', onSelect: () => this.keyDown('Space') }
                    ]}
                    footer={<>Learn more on <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Wikipedia</a></>}
                />
            </div>
        );
    }
}
