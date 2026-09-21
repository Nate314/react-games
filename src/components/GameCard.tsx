import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameEntry } from '../games/registry';

export function GameCard({ game }: { game: GameEntry }) {
    const [hover, setHover] = useState(false);
    const gif = game.image.replace(/\.png$/, '.gif');
    return (
        <article className="game-card"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
            <div className="game-card__image" role="img" aria-label={`Preview of ${game.title}`}
                style={{ backgroundImage: `url(${hover ? gif : game.image})` }} />
            <div className="game-card__body">
                <h2>{game.title}</h2>
                <p>{game.description}</p>
                <Link className="button" to={`/${game.id}`}>Play {game.title}</Link>
            </div>
        </article>
    );
}
