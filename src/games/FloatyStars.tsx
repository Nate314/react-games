import React from 'react';
import './FloatyStars.css';
import type { GameProps, StageSize } from '../stage';
import { Utility } from '../Utility';
import { createStars, moveStars, rescaleStars, starSize, visibleStars } from './FloatyStars.logic';

const frameInterval = 10;

class FloatyStarsState {
    starLocations: number[][] = [];
    starVelocities: number[][] = [];
}

export default class FloatyStars extends React.Component<GameProps> {

    state: FloatyStarsState;
    lastStage: StageSize;
    timer: ReturnType<typeof setInterval>;

    constructor(props: GameProps) {
        super(props);
        Utility.setTitle('FloatyStars');
        this.lastStage = props.stage;
        this.state = new FloatyStarsState();
        const stars = createStars(props.stage.width, props.stage.height, Math.random);
        this.state.starLocations = stars.locations;
        this.state.starVelocities = stars.velocities;
        this.timer = setInterval(() => {
            this.animate();
        }, frameInterval);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    animate() {
        const { width, height } = this.props.stage;
        this.setState((state: FloatyStarsState) => {
            state.starLocations = rescaleStars(state.starLocations, this.lastStage, this.props.stage);
            this.lastStage = this.props.stage;
            state.starLocations = moveStars(state.starLocations, state.starVelocities, width, height);
            return state;
        });
    }

    render() {
        const { width, height } = this.props.stage;
        return (
            <div className="sky">
                {
                    visibleStars(this.state.starLocations, width, height)
                    .map((starLocation, i) =>
                            <div className="snow" key={i}
                                style={{
                                    top: `${starLocation[1]}px`, left: `${starLocation[0]}px`,
                                    width: `${starSize}px`, height: `${starSize}px`
                                }}>
                            </div>
                        )
                }
            </div>
        );
    }
}
