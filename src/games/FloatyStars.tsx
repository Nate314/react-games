import React from 'react';
import './FloatyStars.css';
import { Utility } from '../Utility';
import { createStars, moveStars, starSize, visibleStars } from './FloatyStars.logic';

const frameInterval = 10;

class FloatyStarsState {
    starLocations: number[][] = [];
    starVelocities: number[][] = [];
}

export default class FloatyStars extends React.Component {

    state: FloatyStarsState;
    props: any;

    constructor(props: any) {
        super(props);
        Utility.setTitle('FloatyStars');
        this.props = props;
        this.state = new FloatyStarsState();
        const stars = createStars(window.innerWidth, window.innerHeight, Math.random);
        this.state.starLocations = stars.locations;
        this.state.starVelocities = stars.velocities;
        setInterval(() => {
            this.animate();
        }, frameInterval);
    }

    animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.setState((state: FloatyStarsState) => {
            state.starLocations = moveStars(state.starLocations, state.starVelocities, width, height);
            return state;
        });
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;
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
