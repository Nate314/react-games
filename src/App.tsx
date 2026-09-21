import { Route, Routes } from 'react-router-dom';
import { games } from './games/registry';
import { GameCard } from './components/GameCard';
import { Layout } from './components/Layout';
import { NotFound } from './components/NotFound';
import './styles/tokens.css';
import './styles/app.css';

function Menu() {
    return (
        <Layout>
            <section className="panel">
                <p>
                    I have written a few games here in an effort to learn how{' '}
                    <a href="https://react.dev/">React</a> works. Listed below are the games
                    that I have created. Many of them are rip-offs of common games.
                </p>
            </section>
            <div className="game-grid">
                {games.map(game => <GameCard key={game.id} game={game} />)}
            </div>
        </Layout>
    );
}

// The router is provided by the entry point so tests can use MemoryRouter.
export function App() {
    return (
        <Routes>
            <Route path="/" element={<Menu />} />
            {games.map(({ id, component: Game }) => <Route key={id} path={`/${id}`} element={<Game />} />)}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
