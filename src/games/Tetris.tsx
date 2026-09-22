import React from 'react';
import './Tetris.css';
import { Utility } from '../Utility';
import { GameHud } from '../components/GameHud';
import { BoardColumn } from '../components/BoardColumn';
import { fitSquareSize } from './boardSize';
import type { GameProps } from '../stage';
import {
    Square, GameState, boardWidth, boardHeight, createBoard, tick, movePiece, rotatePiece
} from './Tetris.logic';

// calculate the size of the squares so that the board fills most of the screen
//  and the max length is the measurement of the longer edge

class BoardProps {
    squareSize = 0;
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
                        color = !!square.blob ? square.blob : square.piece;
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

// keys that trigger continuous movement while held, driven by a fixed-interval timer
const moveKeys = ['a', 'A', 'ArrowLeft', 'd', 'D', 'ArrowRight', 's', 'S', 'ArrowDown'];
const moveRepeatIntervalMs = 125;

export default class Tetris extends React.Component<GameProps> {

    state: GameState;
    heldKeys: Set<string> = new Set();
    moveRepeatTimer: ReturnType<typeof setInterval> | null = null;
    gameTickTimer: ReturnType<typeof setInterval>;
    mounted: boolean = false;

    constructor(props: GameProps) {
        super(props);
        Utility.setTitle('Tetris');
        const tempState = new GameState();
        tempState.squares = createBoard();
        this.state = tempState;
        this.gameTickTimer = setInterval(() => this.gameTick(), this.state.gameTickInterval);
        this.keyDown('r');
        this.moveRepeatTimer = setInterval(() => this.repeatHeldMovement(), moveRepeatIntervalMs);
    }

    gameTick() {
        this.setState((state: GameState) => tick(state, Math.random));
    }

    applyMove = (k: string) => {
        const inc = (arr: string[]) => arr.includes(k);
        if (inc(['s', 'S', 'ArrowDown'])) {
            this.gameTick();
        } else if (inc(['a', 'A', 'ArrowLeft'])) {
            this.setState((state: GameState) => movePiece(state, -1));
        } else if (inc(['d', 'D', 'ArrowRight'])) {
            this.setState((state: GameState) => movePiece(state, 1));
        }
    }

    repeatHeldMovement = () => {
        this.heldKeys.forEach(k => this.applyMove(k));
    }

    keyDown = (e: any) => {
        const k = e && e.key ? e.key : e;
        // e is a real KeyboardEvent for physical key presses, or a plain string when a HUD
        // button or a programmatic call (e.g. the constructor's reset) invokes this directly.
        // A plain string already has its own `.repeat` method (String.prototype.repeat), so
        // only treat `.repeat` as the key-repeat flag when e is an actual event object.
        const isRepeat = typeof e === 'object' && e !== null && !!e.repeat;
        const inc = (arr: string[]) => arr.includes(k);
        if (inc(['Escape', 'Enter'])) {
            if (isRepeat) return;
            this.setState((state: GameState) => ({ paused: !state.paused }));
        } else if (inc(['w', 'W', 'ArrowUp'])) {
        } else if (inc(moveKeys)) {
            this.heldKeys.add(k);
            if (isRepeat) return;
            this.applyMove(k);
        } else if (inc([',', '<'])) {
            if (isRepeat) return;
            this.setState((state: GameState) => rotatePiece(state, false));
        } else if (inc(['.', '>'])) {
            if (isRepeat) return;
            this.setState((state: GameState) => rotatePiece(state, true));
        } else if (inc(['r', 'R'])) {
            if (isRepeat) return;
            this.heldKeys.clear();
            const freshState = new GameState();
            freshState.squares = createBoard();
            clearInterval(this.gameTickTimer);
            this.gameTickTimer = setInterval(() => this.gameTick(), freshState.gameTickInterval);
            if (this.mounted) {
                this.setState(freshState);
            } else {
                this.state = freshState;
            }
        }
    }

    keyUp = (e: any) => {
        const k = e && e.key ? e.key : e;
        this.heldKeys.delete(k);
    }

    componentDidMount() {
        this.mounted = true;
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDown);
        document.removeEventListener("keyup", this.keyUp);
        if (this.moveRepeatTimer !== null) {
            clearInterval(this.moveRepeatTimer);
        }
        clearInterval(this.gameTickTimer);
    }

    render() {
        const squareSize = fitSquareSize(boardWidth, boardHeight, this.props.stage);
        // show board and scoreboard on the screen
        return (
            <BoardColumn boardWidth={boardWidth * squareSize}>
                <Board squares={this.state.squares} squareSize={squareSize} />
                <GameHud
                    status={
                        this.state.gameover ? { text: 'Game Over', tone: 'danger' }
                        : this.state.paused ? { text: 'Paused', tone: 'info' }
                        : null
                    }
                    stats={[{ label: 'Score', value: this.state.score }]}
                    controls={[
                        { keys: 'R', action: 'Reset', onSelect: () => this.keyDown('r') },
                        { keys: 'Esc', action: 'Play / Pause', onSelect: () => this.keyDown('Escape') },
                        { keys: 'WASD / Arrows', action: 'Move' },
                        { keys: ',', action: 'Rotate left', onSelect: () => this.keyDown(',') },
                        { keys: '.', action: 'Rotate right', onSelect: () => this.keyDown('.') }
                    ]}
                />
            </BoardColumn>
        );
    }
}
