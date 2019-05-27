import React from 'react';
import './FlappyFinch.css';
import Music from './Music';

const frameInterval = 8;
const pipeXGap = 300;
const pipeYGap = 250;
const pipeWidth = 100;
const gravityConstant = 0.15;
const flapVelocity = -6.25;
const birdSize = 40;
const nomNomSize = 10;
const mp3DingUrl = 'https://freesound.org/data/previews/341/341695_5858296-lq.mp3';
const mp3FlapUrl = 'https://freesound.org/data/previews/244/244980_3008343-lq.mp3';

const colliding = (object: {x: number, y: number, width: number, height: number, isPipe: boolean}, bird: BirdProps) => {
    // calculate horizontal collision
    let horizontalCollision = false;
    const leftObject = object.x;
    const rightObject = object.x + pipeWidth;
    const leftBird = bird.x;
    const rightBird = bird.x + birdSize;
    if (rightBird > leftObject && leftBird < rightObject) horizontalCollision = true;
    // calculate vertical collision
    let verticalCollision = false;
    if (object.isPipe) {
        const halfGap = pipeYGap / 2;
        const topPipeBottom = object.y - halfGap;
        const bottomPipeTop = object.y + halfGap;
        const topBird = bird.y;
        const bottomBird = bird.y + birdSize;
        if (topBird < topPipeBottom || bottomBird > bottomPipeTop) verticalCollision = true;
    } else {
        const topObject = object.y;
        const bottomObject = object.y + object.height;
        const topBird = bird.y;
        const bottomBird = bird.y + birdSize;
        if (bottomBird > topObject && topBird < bottomObject) verticalCollision = true;
    }
    // bird and pipe are colliding if both horizontal and vertical collision occur
    return horizontalCollision && verticalCollision;
};

class NomNomProps {
    x: number = 0;
    y: number = 0;
}

class NomNom extends React.Component {

    props: NomNomProps;

    constructor(props: NomNomProps) {
        super(props);
        this.props = props;
    }

    render() {
        const halfNomNomSize = nomNomSize / 2;
        return (
            <div>
                <div className="nomnom" style={{position:'absolute',
                    width:`${nomNomSize}px`, height:`${nomNomSize}px`,
                    top:`${this.props.y - halfNomNomSize}px`,
                    left:`${this.props.x}px`}}>
                </div>
            </div>
        )
    };
}

class PipeProps {
    x: number = 0;
    y: number = 0;
    index: number = 0;
    birdPosition: BirdProps = new BirdProps(0, 0);
    onNomNom: any;
    constructor(x: number, y: number, index: number) {
        this.x = x;
        this.y = y;
        this.index = index;
    }
}

class Pipe extends React.Component {

    nomNomEaten: boolean = false;
    nomNomProps: NomNomProps;
    props: PipeProps;

    constructor(props: PipeProps) {
        super(props);
        this.props = props;
        this.nomNomProps = new NomNomProps();
    }

    render() {
        const height = window.innerHeight;
        const halfGap = pipeYGap / 2;
        const topPipeTop = (this.props.y - height) - halfGap;
        const bottomPipeTop = this.props.y + halfGap;
        this.nomNomProps.x = this.props.x + (pipeWidth / 2);
        if (this.nomNomProps.y == 0) {
            const topPipeBottom = topPipeTop + height;
            this.nomNomProps.y = topPipeBottom + (Math.random() * (bottomPipeTop - topPipeBottom));
        }
        const object = {
            x: this.nomNomProps.x,
            y: this.nomNomProps.y,
            width: nomNomSize,
            height: nomNomSize,
            isPipe: false
        };
        if (!this.nomNomEaten && colliding(object, this.props.birdPosition)) {
            this.props.onNomNom();
            this.nomNomEaten = true;
        }
        return (
            <div>
                {this.nomNomEaten ? '' : <NomNom x={this.nomNomProps.x} y={this.nomNomProps.y}/>}
                <div className="pipe" style={{top:`${topPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></div>
                <div className="pipe" style={{top:`${bottomPipeTop}px`, left:`${this.props.x}px`, width:`${pipeWidth}px`}}></div>
            </div>
        )
    };
}

class BirdProps {
    x: number = 0;
    y: number = 0;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Bird extends React.Component {

    props: BirdProps;

    constructor(props: BirdProps) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className="bird"
                style={{left:`${this.props.x}px`, top:`${this.props.y}px`,
                        width:`${birdSize}px`, height:`${birdSize}px`}}></div>
        )
    };
}

class FlappyFinchGameState {
    pipePositions: PipeProps[] = [];
    birdPosition: BirdProps = new BirdProps(120, 0);
    birdVelocity: number = 0;
    paused: boolean = false;
    gameover: boolean = false;
    collision: boolean = false;
    currentPipeToCheck: number = 1;
    score: number = 0;
    shouldDing: boolean = false;
    shouldFlap: boolean = false;
}

export default class FlappyFinchGame extends React.Component {
    randomPipePosition = () => (window.innerHeight / 2) + ((Math.random() - 0.5) * (window.innerHeight / 2));

    state: FlappyFinchGameState;
    props: any;

    constructor(props: any) {
        super(props);
        this.props = props;
        this.state = new FlappyFinchGameState();
        this.restart();
        setInterval(() => {
            if (!this.state.paused && !this.state.gameover) {
                this.animate();
            }
        }, frameInterval);
    }

    restart() {
        this.state = new FlappyFinchGameState();
        let x = 3 * pipeXGap;
        let index = 1;
        Array(10).fill(null).forEach(() => {
            this.state.pipePositions.push(new PipeProps(x, this.randomPipePosition(), index));
            x += pipeXGap;
            index++;
        });
        this.setState(this.state);
    }

    keyDown = (e: any) => {
        this.setState((state: FlappyFinchGameState) => {
            const k = e.key;
            switch (k) {
                case ' ':
                    state.birdVelocity = flapVelocity;
                    state.shouldFlap = true;
                    break;
                case 'Escape':
                    state.paused = !state.paused;
                    break;
                case 'r':
                case 'R':
                    this.restart();
                    break;
            }
            return state;
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyDown);
    }

    animate() {
        const height = window.innerHeight;
        this.setState((state: FlappyFinchGameState) => {
            state.birdPosition.y += state.birdVelocity;
            state.birdVelocity += gravityConstant;
            state.pipePositions.forEach(pipe => {
                if (state.currentPipeToCheck === pipe.index) {
                    if (pipe.x + pipeWidth < this.state.birdPosition.x) {
                        state.currentPipeToCheck++;
                        state.score++;
                    }
                    const object = {
                        x: pipe.x, y: pipe.y,
                        width: pipeWidth, height: height,
                        isPipe: true
                    };
                    state.gameover = colliding(object, this.state.birdPosition);
                }
                if (pipe.index < state.currentPipeToCheck - 1) {
                    pipe.index = Math.max(...state.pipePositions.map(pos => pos.index)) + 1;
                    pipe.x = Math.max(...state.pipePositions.map(pos => pos.x)) + pipeXGap;
                    pipe.y = this.randomPipePosition();
                }
                pipe.x -= 1;
            });
            if (state.birdPosition.y > height - (birdSize + 50)) {
                state.gameover = true;
            } else if (state.birdPosition.y < 0) {
                state.birdPosition.y = 0;
            }
            return state;
        });
    }

    nomNomEaten(): void {
        console.log('nomnom');
        this.state.score++; 
        this.state.shouldDing = true;
    }
 
    render() {
        const [ding, flap] = [this.state.shouldDing, this.state.shouldFlap];
        [this.state.shouldDing, this.state.shouldFlap] = [false, false];
        const height = window.innerHeight;
        return (
            <div className="sky">
                <Music url={mp3DingUrl} play={ding}/>
                <Music url={mp3FlapUrl} play={flap}/>
                <Bird x={this.state.birdPosition.x} y={this.state.birdPosition.y}/>
                {
                    this.state.pipePositions.map(pipe => 
                        <Pipe x={pipe.x} y={pipe.y} index={pipe.index}
                            birdPosition={this.state.birdPosition} onNomNom={() => this.nomNomEaten()}/>
                    )
                }
                {
                    (this.state.paused || this.state.gameover || this.state.collision) ?
                        <div className="paused">{this.state.gameover ? 'GAME OVER' : 'PAUSED'}</div>
                        : ''
                }
                <div className="ground"
                    style={{top:`${height - 50}px`, left:'10px', height:'50px',
                    color:'white', textAlign:'left', fontSize:'20px'}}>
                    &nbsp;&nbsp;&nbsp;Score:&nbsp;{this.state.score}</div>
            </div>
        );
    }
}
