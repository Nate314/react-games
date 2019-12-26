import React from 'react';
import './FloatyStars.css';
import { Utility } from '../Utility';

const numberOfStars = 100;
const starSize = 10;
const maxSpeed = 1;
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
        const width = window.innerWidth;
        const height = window.innerHeight;
        Utility.array(numberOfStars).forEach(() => {
            this.state.starLocations.push([Math.random() * width, Math.random() * height]);
            this.state.starVelocities.push([Math.random() * maxSpeed, Math.random() * maxSpeed]);
        });
        this.setState(this.state);
        setInterval(() => {
            this.animate();
        }, frameInterval);
    }

    animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.setState((state: FloatyStarsState) => {
            let i = 0;
            state.starLocations.forEach(starLocation => {
                starLocation[0] -= state.starVelocities[i][0];
                starLocation[1] += state.starVelocities[i][1];
                if (!((starLocation[0] < width + starSize && starLocation[0] > -2 * starSize))) {
                    starLocation[0] = width + starSize;
                }
                if (!((starLocation[1] < height + starSize && starLocation[1] > -2 * starSize))) {
                    starLocation[1] = -starSize;
                }
                i++;
            });
            return state;
        });
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return (
            <div className="sky">
                {
                    this.state.starLocations
                    .filter(star => (star[0] < width && star[0] > 0) && (star[1] < height && star[1] > 0))
                    .map(starLocation =>
                            <div className="snow"
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
