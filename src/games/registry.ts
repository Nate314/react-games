import type { ComponentType } from 'react';
import Snake from './Snake';
import FloatyStars from './FloatyStars';
import FlappyFinch from './FlappyFinch';
import GameOfLife from './GameOfLife';
import Tetris from './Tetris';

export interface GameEntry {
    id: string;
    title: string;
    description: string;
    image: string;
    component: ComponentType;
}

// Single source for menu cards and routes (route path is `/${id}`).
export const games: GameEntry[] = [
    { id: 'snake', title: 'Snake', description: 'Eat, grow, and avoid your own tail.', image: '/assets/menu/snake.png', component: Snake },
    { id: 'floatystars', title: 'FloatyStars', description: 'Guide your way through a field of drifting stars.', image: '/assets/menu/floatystars.png', component: FloatyStars },
    { id: 'flappyfinch', title: 'FlappyFinch', description: 'Flap through the gaps without crashing.', image: '/assets/menu/flappyfinch.png', component: FlappyFinch },
    { id: 'gameoflife', title: 'GameOfLife', description: "Conway's cellular automaton, at your fingertips.", image: '/assets/menu/gameoflife.png', component: GameOfLife },
    { id: 'tetris', title: 'Tetris', description: 'Stack falling blocks and clear lines.', image: '/assets/menu/tetris.png', component: Tetris }
];
